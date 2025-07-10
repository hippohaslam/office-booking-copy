[CmdletBinding()]
param()

$GeminiApiKey = ""

if ([string]::IsNullOrEmpty($GeminiApiKey)) {
    Write-Error "Gemini API key is missing."
    return
}

$RepoRoot = $PSScriptRoot
$SourceDirectory = Join-Path -Path $RepoRoot -ChildPath "src"
$WorkflowDirectory = Join-Path -Path $RepoRoot -ChildPath ".github/workflows"
$WorkflowFile = Join-Path -Path $WorkflowDirectory -ChildPath "ai-build-test-deploy.yaml"

# Patterns to find general project files.
$ProjectFilePatterns = @(
    "*.sln",
    "*.csproj",
    "package.json",
    "appsettings.json",
    "Startup.cs",
    "Program.cs",
    "Readme.md"
)

# Patterns to find test projects.
$TestProjectPatterns = @(
    "*.Tests.csproj",
    "*.Test.csproj"
)

# Patterns to find deployment-related files.
$DeploymentFilePatterns = @(
    "Dockerfile",
    "docker*.yml",
    "*.tf",
    "*.tfvars",
    "*.bicep",
    "azure-deploy.json"
)

try {
    if (-not (Test-Path -Path $SourceDirectory -PathType Container)) {
        Write-Error "Source directory '$SourceDirectory' does not exist."
        return
    }

    Write-Host "Analyzing project structure in '$SourceDirectory'..."
    
    $allSourceFiles = Get-ChildItem -Path $SourceDirectory -Recurse -File

    # Check for the presence of test projects.
    $testProjects = $allSourceFiles | Where-Object {
        $file = $_
        $TestProjectPatterns | ForEach-Object {
            if ($file.Name -like $_) {
                return $true
            }
        }
    }
    $hasTestProjects = $null -ne $testProjects

    # Check for the presence of deployment configuration.
    $deploymentFiles = $allSourceFiles | Where-Object {
        $file = $_
        $DeploymentFilePatterns | ForEach-Object {
            if ($file.Name -like $_) {
                return $true
            }
        }
    }
    $hasDeploymentConfig = $null -ne $deploymentFiles

    Write-Host "Analysis complete:"
    Write-Host "  - Test projects found: $hasTestProjects"
    Write-Host "  - Deployment configuration found: $hasDeploymentConfig"

    # --- Prompt Generation ---
    Write-Host "Starting prompt generation..."
    $PromptBuilder = New-Object -TypeName System.Text.StringBuilder

    [void]$PromptBuilder.AppendLine("You are an expert in GitHub Actions and .NET CI/CD. Your task is to generate a comprehensive GitHub Actions workflow file (`.yaml`) for building, and potentially testing and deploying, a .NET application.")
    [void]$PromptBuilder.AppendLine("You will infer all application components, containerization, and infrastructure *solely* from the project context provided after this prompt.")
    [void]$PromptBuilder.AppendLine("Your generated workflow must rely exclusively on the information contained within the provided files.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("Based on the provided files, generate a robust CI/CD pipeline that includes:")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("* Workflow Trigger and Permissions:")
    [void]$PromptBuilder.AppendLine("    * A manual `workflow_dispatch` trigger.")
    [void]$PromptBuilder.AppendLine("    * If deployment jobs are included, the trigger should allow for environment selection (e.g., 'Test', 'Production').")
    [void]$PromptBuilder.AppendLine("    * Appropriate GitHub Actions permissions for the required tasks.")
    [void]$PromptBuilder.AppendLine("    * Utilize workflow-level `env` for common variables and GitHub Secrets for sensitive values.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("* Build Strategy:")
    [void]$PromptBuilder.AppendLine("    * **Source Code Root**: All source code is in the 'src' directory. All file paths in the workflow MUST be prefixed with 'src/'.")
    [void]$PromptBuilder.AppendLine("    * **Component Identification and Build**: Automatically identify all application components (e.g., .NET backend, frontend) and create dedicated build steps.")
    [void]$PromptBuilder.AppendLine("    * **Corepack/Yarn Versioning**: If a frontend project's `package.json` specifies a `packageManager`, ensure `corepack enable` is run before any `yarn` commands.")
    [void]$PromptBuilder.AppendLine("    * **Dependency Caching**: Implement caching for .NET (`cache-dependency-path: | src/**/packages.lock.json`) and any identified frontend dependencies.")
    [void]$PromptBuilder.AppendLine("    * **Pathing**: Ensure correct `working-directory` or relative paths for all `dotnet`, `docker`, and IaC-related commands.")
    [void]$PromptBuilder.AppendLine("    * **Locked Mode**: For `dotnet restore`, ensure `--locked-mode` is used.")
    [void]$PromptBuilder.AppendLine("")

    # --- Conditional Test Instructions ---
    if ($hasTestProjects) {
        Write-Host "Adding instructions for TEST jobs to the prompt."
        [void]$PromptBuilder.AppendLine("* Test Strategy (Test projects were detected):")
        [void]$PromptBuilder.AppendLine("    * **Generate Test Jobs**: Create dedicated jobs for running tests.")
        [void]$PromptBuilder.AppendLine("    * **Build Dependency for Tests**: Each test job must be self-contained and run `dotnet restore` and `dotnet build` before `dotnet test`. The `dotnet test` command should NOT use the `--no-build` flag.")
        [void]$PromptBuilder.AppendLine("    * **Executing Multiple Tests**: If multiple test projects exist, execute them as a series of separate `dotnet test` commands within the same step.")
        [void]$PromptBuilder.AppendLine("    * **Service-Dependent Tests**: If integration or end-to-end tests are identified that require services (like from a Docker Compose file), ensure those services are started and healthy before the tests run.")
        [void]$PromptBuilder.AppendLine("    * **Frontend Testing**: If frontend tests are found, execute them. Do not include a linting step.")
    }
    else {
        Write-Host "Adding instructions to EXCLUDE test jobs from the prompt."
        [void]$PromptBuilder.AppendLine("* Test Strategy (No test projects were detected):")
        [void]$PromptBuilder.AppendLine("    * **DO NOT** generate any jobs or steps related to `dotnet test`, unit tests, integration tests, or end-to-end tests. The workflow should only build the application.")
    }
    [void]$PromptBuilder.AppendLine("")

    # --- Conditional Deployment Instructions ---
    if ($hasDeploymentConfig) {
        Write-Host "Adding instructions for DEPLOYMENT jobs to the prompt."
        [void]$PromptBuilder.AppendLine("* Deployment Strategy (Deployment configuration was detected):")
        [void]$PromptBuilder.AppendLine("    * **Generate Deployment Jobs**: Create deployment jobs that run conditionally based on the selected environment input.")
        [void]$PromptBuilder.AppendLine("    * **Artifact Management**: Use `actions/upload-artifact@v4`. Ensure .zip files are created with contents at the root level (`cd ./publish-directory && zip -r ../archive.name.zip .`).")
        [void]$PromptBuilder.AppendLine("    * **Unique Versioning**: Deployment versions must be unique across all runs. Use a pattern like `${{ github.sha }}-`${{ github.run_number }}-`${{ github.run_attempt }}`.")
        [void]$PromptBuilder.AppendLine("    * **Infrastructure as Code (IaC)**: Infer the IaC tool from the project files (e.g., Terraform, Bicep). Generate the necessary `init`, `plan`, and `apply` steps. Ensure that the configuration or state is parameterized by the selected environment (e.g., using `github.event.inputs.environment`).")
        [void]$PromptBuilder.AppendLine("    * **Resource Readiness**: After any infrastructure provisioning step, include a verification step to ensure the newly created or updated resources are ready and available before the application deployment begins.")
    }
    else {
        Write-Host "Adding instructions to EXCLUDE deployment jobs from the prompt."
        [void]$PromptBuilder.AppendLine("* Deployment Strategy (No deployment configuration was detected):")
        [void]$PromptBuilder.AppendLine("    * **DO NOT** generate any jobs or steps related to cloud deployment, infrastructure provisioning, Docker image publishing, or creating deployment artifacts.")
        [void]$PromptBuilder.AppendLine("    * The workflow should end after the build (and test, if applicable) stages are complete.")
    }
    [void]$PromptBuilder.AppendLine("")

    # --- General Best Practices ---
    [void]$PromptBuilder.AppendLine("* General Best Practices:")
    [void]$PromptBuilder.AppendLine("    * **Job Tooling**: Each job must set up its own required tools (e.g., `actions/setup-dotnet@v4`, `azure/login@v1`, `hashicorp/setup-terraform@v3`).")
    [void]$PromptBuilder.AppendLine("    * **No Ternary Operators**: Use `if/else` blocks in `run` steps to set conditional environment variables via `$GITHUB_ENV`.")
    [void]$PromptBuilder.AppendLine("    * **Strict Variable Usage**: Use input variables like `github.event.inputs.environment` directly, without modification (e.g., no `toLower()`).")
    [void]$PromptBuilder.AppendLine("    * **Use Latest Actions**: Use latest stable versions of official actions (e.g., `actions/checkout@v4`).")
    [void]$PromptBuilder.AppendLine("    * **Provide only the complete, raw YAML content for the workflow file, without any markdown formatting like ```yaml.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("--- START PROJECT CONTEXT ---")
    [void]$PromptBuilder.AppendLine("")

    # --- Append Directory Structure ---
    [void]$PromptBuilder.AppendLine("Repository Directory Structure:")
    [void]$PromptBuilder.AppendLine("===============================")
    Get-ChildItem -Path $SourceDirectory -Recurse -Directory | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourceDirectory.Length)
        [void]$PromptBuilder.AppendLine(".$relativePath")
    }
    [void]$PromptBuilder.AppendLine("")

    # --- Append File Contents ---
    Write-Host "Appending file contents to prompt..."
    [void]$PromptBuilder.AppendLine("Repository File Contents:")
    [void]$PromptBuilder.AppendLine("===============================")
    
    $allFilePatterns = $ProjectFilePatterns + $DeploymentFilePatterns + $TestProjectPatterns
    $filesToProcess = Get-ChildItem -Path $SourceDirectory -Recurse -Include $allFilePatterns -ErrorAction SilentlyContinue

    if ($null -ne $filesToProcess) {
        foreach ($file in $filesToProcess) {
            $relativePath = $file.FullName.Substring($RepoRoot.Length).TrimStart('\/')
            Write-Host "Appending file: $relativePath"
            [void]$PromptBuilder.AppendLine("--- FILE: $relativePath ---")
            [void]$PromptBuilder.AppendLine((Get-Content -Path $file.FullName -Raw))
            [void]$PromptBuilder.AppendLine("--- END FILE ---")
            [void]$PromptBuilder.AppendLine("")
        }
    }
    else {
        [void]$PromptBuilder.AppendLine("No matching files were found in the '$SourceDirectory' directory.")
    }
    
    $readmeFile = Get-ChildItem -Path $RepoRoot -Filter "README.md" -ErrorAction SilentlyContinue
    if ($null -ne $readmeFile) {
        $relativePath = $readmeFile.Name
        Write-Host "Appending file: $relativePath"
        [void]$PromptBuilder.AppendLine("--- FILE: $relativePath ---")
        [void]$PromptBuilder.AppendLine((Get-Content -Path $readmeFile.FullName -Raw))
        [void]$PromptBuilder.AppendLine("--- END FILE ---")
        [void]$PromptBuilder.AppendLine("")
    }

    # Call the Gemini API to generate the workflow
    Write-Host "Sending prompt to Gemini API..."

    $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=$($GeminiApiKey)"
    $payload = @{
        contents = @(
            @{
                parts = @(
                    @{
                        text = $PromptBuilder.ToString()
                    }
                )
            }
        )
    } | ConvertTo-Json -Depth 5

    $apiResponse = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $payload -ContentType "application/json" -ErrorAction Stop
    $generatedYaml = $apiResponse.candidates[0].content.parts[0].text

    # Clean up any unwanted YAML markdown formatting.
    if ($generatedYaml -match '(?ms)```(?:yaml)?\s*(.*?)\s*```') {
        $generatedYaml = $Matches[1]
    }

    if ([string]::IsNullOrWhiteSpace($generatedYaml)) {
        Write-Error "The AI returned an empty or invalid response. Cannot create workflow file."
        return
    }

    # Create the workflow directory if it doesn't exist.
    if (-not (Test-Path -Path $WorkflowDirectory -PathType Container)) {
        Write-Host "Creating workflow directory at '$WorkflowDirectory'..."
        New-Item -Path $WorkflowDirectory -ItemType Directory -Force | Out-Null
    }

    # Save the generated YAML to the workflow file.
    Write-Host "Saving workflow to '$WorkflowFile'..."
    $generatedYaml | Set-Content -Path $WorkflowFile -Encoding UTF8

    Write-Host "Workflow file created successfully."
}
catch {
    Write-Error "An unexpected error occurred: $_"
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $streamReader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $streamReader.ReadToEnd()
        Write-Error "API Response Body: $errorBody"
    }
}