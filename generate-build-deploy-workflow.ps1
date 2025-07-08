[CmdletBinding()]
param()

$GeminiApiKey = ""

$RepoRoot = $PSScriptRoot
$SourceDirectory = Join-Path -Path $RepoRoot -ChildPath "src"
$WorkflowDirectory = Join-Path -Path $RepoRoot -ChildPath ".github/workflows"
$WorkflowFile = Join-Path -Path $WorkflowDirectory -ChildPath "deploy-env-ai.yaml"

# File patterns to search for within the $SourceDirectory.
$FilePatterns = @(
    "*.sln",
    "*.csproj",
    "*.vbproj",
    "package.json",
    "appsettings.json",
    "Dockerfile",
    "docker*.yml",
    "*.tf",
    "*.tfvars",
    "Startup.cs",
    "Program.cs",
    "Readme.md"
)

try {
    if ([string]::IsNullOrEmpty($GeminiApiKey)) {
        Write-Error "Gemini API key is missing."
        return
    }

    Write-Host "Starting prompt generation..."
    $PromptBuilder = New-Object -TypeName System.Text.StringBuilder

    # Add the main instruction to the prompt.
    [void]$PromptBuilder.AppendLine("You are an expert in GitHub Actions and .NET CI/CD. Your task is to generate a comprehensive GitHub Actions workflow file (`.yaml`) for building, testing, and deploying a .NET application. You will infer all other application components (e.g., frontend technologies), containerization strategies, testing methodologies (unit, integration, end-to-end), database requirements, and cloud infrastructure definitions (e.g., specific cloud provider, infrastructure-as-code tools) *solely* from the project context provided after this prompt.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("Please note: The provided files represent only a *subset* of the full project repository. Your analysis and generated workflow must rely exclusively on the information contained within these provided files and the directory listing.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("Based on the full set of provided files and directory structure, generate a robust, adaptable CI/CD pipeline that includes:")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("* Workflow Trigger and Permissions:")
    [void]$PromptBuilder.AppendLine("    * A manual `workflow_dispatch` trigger allowing for environment selection (e.g., 'Test', 'Production').")
    [void]$PromptBuilder.AppendLine("    * Appropriate GitHub Actions permissions to interact with version control and identified cloud services.")
    [void]$PromptBuilder.AppendLine("    * **Workflow Inputs and Environment Variables**: Define a `workflow_dispatch` trigger with `inputs` for environment selection. Utilize workflow-level `env` for common versioning and path variables. Employ job-level or step-level `env` variables, particularly for sensitive data or dynamic configurations (e.g., connection strings), leveraging GitHub Secrets (`secrets.YOUR_SECRET_NAME`) for sensitive values.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("* Build and Test Strategy:")
    [void]$PromptBuilder.AppendLine("    * **Source Code Root**: All source code, including the .NET solution (.sln) file, project files (.csproj), frontend application files, and infrastructure code, is located within the 'src' directory. Therefore, all paths to these files in the generated workflow MUST be prefixed with 'src/'. For example, use 'src/your-project.sln', not 'your-project.sln'.")
    [void]$PromptBuilder.AppendLine("    * **Component Identification and Initial Build**: Automatically identify all application components (e.g., .NET backend, any discovered frontend). For each identified component, ensure a dedicated build step is performed successfully before any subsequent testing or publishing operations. This guarantees that tests run against up-to-date, compiled code. **Crucially, if a frontend project's configuration (e.g., `package.json`) indicates the use of Corepack or a specific Yarn version via the `packageManager` field, ensure that a `corepack enable` command is executed *before any and all subsequent `yarn` commands within that job*. This step must always precede `yarn install` or `yarn build` operations.**")
    [void]$PromptBuilder.AppendLine("    * **Build Dependency for Tests**: When test stages are in separate jobs from the build job, each test job must be self-contained. This means each test job must run `dotnet restore` and `dotnet build` before running `dotnet test`. Consequently, the `dotnet test` command should **NOT** use the `--no-build` flag.")
    [void]$PromptBuilder.AppendLine("    * **Executing Multiple Tests**: The `dotnet test` command can only accept one project file at a time. If multiple test projects need to be run in a single workflow step, they **must** be executed as a series of separate `dotnet test` commands within that step's `run` block. Do not pass multiple project files to a single `dotnet test` command.")
    [void]$PromptBuilder.AppendLine("    * **Dependency Caching**: Implement caching for both .NET and Node.js dependencies to optimize build times, using appropriate cache keys for each. For .NET, use `cache-dependency-path: | src/**/packages.lock.json`.")
    [void]$PromptBuilder.AppendLine("    * **Pathing for .NET Commands**: When executing `dotnet` commands that reference project files (e.g., `dotnet build`, `dotnet test`, `dotnet publish`), ensure the paths to these project files are correctly specified relative to the repository's root, or set the `working-directory` appropriately for the step. For `dotnet restore`, ensure `--locked-mode` is used.")
    [void]$PromptBuilder.AppendLine("    * **Pathing for Docker Compose Commands**: When executing `docker compose` commands (e.g., `docker compose up`, `docker compose ps`), ensure the paths to the `docker-compose` files are correctly specified relative to the repository's root, or that the `working-directory` for the step is set to the directory containing these files.")
    [void]$PromptBuilder.AppendLine("    * **Unit Test Execution**: Identify and execute *only* the unit test projects that do not require external services. These tests should generally not require external services and should be run without filters that might still load other test assemblies that require external services. Consider separate steps or jobs for distinct unit test projects (e.g., Core, Application, Infrastructure).")
    [void]$PromptBuilder.AppendLine("    * **Integration Test Execution**: If integration test projects are identified, create a separate stage or job for them. Before running integration tests, identified external services (like the PostgreSQL database from Docker Compose files) must be brought up and verified as ready. Configure integration tests to connect to these running services, adjusting connection strings as necessary.")
    [void]$PromptBuilder.AppendLine("    * **End-to-End Test Execution**: If end-to-end test projects are identified, create a dedicated job for them. This job must first bring up the full application stack (e.g., backend, frontend, database) using identified Docker Compose configurations. If `docker compose up --wait` is used, it is **critical** that the services being waited on (like databases) have a `healthcheck` defined in their respective `docker-compose.yml` file. Add a comment in the generated YAML to remind the user of this requirement.")
    [void]$PromptBuilder.AppendLine("    * **Frontend Testing without Linting**: Identify and execute unit/CI tests for the frontend. Do not include a separate linting step for the frontend in the generated workflow, even if a `lint` script is present in `package.json`.")
    [void]$PromptBuilder.AppendLine("    * **Artifact Management**: Utilize `actions/upload-artifact@v4` to store build outputs. When creating a .zip file from a directory's contents (e.g., a `dotnet publish` output directory), the zip archive **must** contain the files at its root, not nested inside a parent folder. The correct command pattern to achieve this is `cd ./publish-directory && zip -r ../archive.name.zip .`, not `zip -r archive.name.zip ./publish-directory`.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("* Cloud Deployment:")
    [void]$PromptBuilder.AppendLine("    * **Environment-Specific Configuration**: Dynamically select deployment settings (e.g., configuration files, credentials, application names) based on the chosen environment.")
    [void]$PromptBuilder.AppendLine("    * **Infrastructure Provisioning**: If infrastructure-as-code definitions are identified, include steps for their initialization, planning, and application. When initializing Terraform, ensure the backend configuration (`-backend-config`) for remote state (e.g., S3 bucket, key, region) is correctly set up. The `key` must be varied based on the deployment environment by adhering to the 'Strict Variable Usage' rule, using the `github.event.inputs.environment` variable directly.")
    [void]$PromptBuilder.AppendLine("    * **Application Deployment**: Handle the deployment of the built artifacts to the identified cloud services.")
    [void]$PromptBuilder.AppendLine("    * **Status and Outputs**: Monitor deployment status and output relevant URLs or identifiers.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("* Flexibility and Maintainability:")
    [void]$PromptBuilder.AppendLine("    * **Handling Eventual Consistency**: Cloud APIs can be eventually consistent. After creating a resource, it might not be immediately available for subsequent commands. If a step depends on a newly created resource that must be looked up by name or property, build a retry loop into the `run` script. The loop should attempt to find the resource, wait for a short period (e.g., 10-15 seconds) if it's not found, and repeat for a reasonable amount of time before failing the step.")
    [void]$PromptBuilder.AppendLine("    * **Deployment Readiness and Timing**: Infrastructure provisioning commands like `terraform apply` often start a creation process without waiting for it to complete. To prevent race conditions, any steps that deploy an application to newly created infrastructure **must** occur in the same job as the provisioning step. Furthermore, a 'wait' step **must** be placed between the provisioning command and the deployment commands. This 'wait' step should use the cloud provider's command-line interface (CLI) to poll the infrastructure's status and only proceed when it is fully 'Ready' or 'Available'.")
    [void]$PromptBuilder.AppendLine("    * **Job Tooling Prerequisites**: Each job in a workflow runs on a fresh, independent runner. Therefore, any job that uses a specific command-line tool (like `terraform`, `dotnet`, `node`) **must** include the necessary setup action at the beginning of its steps. For example, any job running `terraform` commands **must** first include a step that ``uses: hashicorp/setup-terraform@v3`, and any job running `dotnet` must include ``uses: actions/setup-dotnet@v4`.")
    [void]$PromptBuilder.AppendLine("    * **Conditional Value Assignment**: GitHub Actions expressions **do not** support JavaScript-style ternary operators (`condition && 'true' || 'false'` or `condition ? 'true' : 'false'`). When a value must be set conditionally, use a `run` step with a standard shell `if/else` block to echo the correct value into the `$GITHUB_ENV` file for use in subsequent steps. Do not generate inline ternary logic as it is invalid syntax.")
    [void]$PromptBuilder.AppendLine("    * **Direct Command Construction**: When a `run` step requires dynamic arguments, construct the command directly within the `run` block. Use GitHub Actions expression syntax (`${{...}}`) to insert dynamic values. Avoid creating intermediate environment variables (like `TF_CLI_ARGS_init`) that attempt to build up command-line arguments, as this can lead to variable expansion errors.")
    [void]$PromptBuilder.AppendLine("    * **Strict Variable Usage**: When using workflow input variables such as `github.event.inputs.environment`, they **must** be used directly in expressions without any modifying functions. The workflow must be generated to work correctly with the exact string value provided in the input. For example, always use `${{ github.event.inputs.environment }}`, and **never** use `toLower(`${{ github.event.inputs.environment }})` or any variation.")
    [void]$PromptBuilder.AppendLine("    * The generated workflow should be modular and clear, allowing for easy understanding and adaptation by a human, even if a similar project had different components or test setups. Clearly define job dependencies using the `needs` keyword to ensure sequential execution of stages (e.g., tests run after build). Employ `if` conditions for jobs or steps that should only run under specific circumstances, such as deploying to a particular environment.")
    [void]$PromptBuilder.AppendLine("    * Adhere strictly to GitHub Actions YAML syntax rules, expressions, and built-in functions (e.g., for string manipulation, context access). Ensure that expressions, particularly in `if:` conditions and `run:` blocks, are correctly formatted without unnecessary quotes around the entire expression.")
    [void]$PromptBuilder.AppendLine("    * Always utilize the latest stable and officially supported versions of GitHub Actions (e.g., `actions/checkout@v4`, `actions/setup-dotnet@v4`, `actions/setup-node@v4`) and integrate with cloud providers using their recommended, up-to-date methods (e.g., `aws-actions/configure-aws-credentials` paired with direct AWS CLI commands for Elastic Beanstalk and Amplify deployments).")
    [void]$PromptBuilder.AppendLine("    * Adhere to GitHub Actions best practices for structure, readability, and variable usage.")
    [void]$PromptBuilder.AppendLine("    * **Tooling Dependencies**: If shell scripts within the workflow utilize command-line tools such as `jq` for JSON parsing, ensure these tools are installed on the runner before their use.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("Please provide only the complete YAML content for the GitHub Actions workflow file.")
    [void]$PromptBuilder.AppendLine("")
    [void]$PromptBuilder.AppendLine("The start of the project context is below.")
    [void]$PromptBuilder.AppendLine("===============================")
    [void]$PromptBuilder.AppendLine("")

    # Generate and append the directory structure list.
    Write-Host "Analyzing directory structure in '$SourceDirectory'..."
    [void]$PromptBuilder.AppendLine("Repository Directory Structure:")
    [void]$PromptBuilder.AppendLine("===============================")

    Get-ChildItem -Path $SourceDirectory -Recurse -Directory | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourceDirectory.Length)
        [void]$PromptBuilder.AppendLine(".$relativePath")
    }
    [void]$PromptBuilder.AppendLine("")

    # Find all key files and append their content to the prompt.
    Write-Host "Searching for key files in '$SourceDirectory'..."
    [void]$PromptBuilder.AppendLine("Repository File Contents:")
    [void]$PromptBuilder.AppendLine("===============================")

    $filesToProcess = Get-ChildItem -Path $SourceDirectory -Recurse -Include $FilePatterns -ErrorAction SilentlyContinue

    if ($null -ne $filesToProcess) {
        foreach ($file in $filesToProcess) {
            $relativePath = $file.FullName.Substring($RepoRoot.Length).TrimStart('\/')
            Write-Host "Processing file: $relativePath"
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
        Write-Host "Processing file: $relativePath"
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