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
    "Program.cs"
)

try {
    if ([string]::IsNullOrEmpty($GeminiApiKey)) {
        Write-Error "Gemini API key is missing."
        return
    }

    Write-Host "Starting prompt generation..."
    $PromptBuilder = New-Object -TypeName System.Text.StringBuilder

    # Add the main instruction to the prompt.
    [void]$PromptBuilder.AppendLine("You are an expert in GitHub Actions and .NET CI/CD. Your task is to generate a comprehensive GitHub Actions workflow file (.yaml) for building, testing, and deploying a .NET application. You will infer all other application components (e.g., frontend technologies), containerization strategies, testing methodologies (unit, integration, end-to-end), database requirements, and cloud infrastructure definitions (e.g., specific cloud provider, infrastructure-as-code tools) solely from the project context provided after this prompt.")
    [void]$PromptBuilder.AppendLine("Please note: The provided files represent only a subset of the full project repository. Your analysis and generated workflow must rely exclusively on the information contained within these provided files and the directory listing.")
    [void]$PromptBuilder.AppendLine("Based on the full set of provided files and directory structure, generate a robust, adaptable CI/CD pipeline that includes:")
    [void]$PromptBuilder.AppendLine("Workflow Trigger and Permissions:")
    [void]$PromptBuilder.AppendLine("A manual workflow_dispatch trigger allowing for environment selection (e.g., 'Test', 'Production').")
    [void]$PromptBuilder.AppendLine("Appropriate GitHub Actions permissions to interact with version control and identified cloud services.")
    [void]$PromptBuilder.AppendLine("Define common environment variables for versions and reusable paths as appropriate.")
    [void]$PromptBuilder.AppendLine("Build and Test Strategy:")
    [void]$PromptBuilder.AppendLine("Component Identification: Automatically identify and define build and test steps for all detected application components (e.g., .NET backend, any discovered frontend).")
    [void]$PromptBuilder.AppendLine("Test Orchestration: If various types of tests are identified within the project (e.g., unit tests, integration tests, end-to-end tests), structure their execution logically. Ensure proper dependencies are met.")
    [void]$PromptBuilder.AppendLine("External Service Dependencies for Tests: If any tests require external services (such as a database or a running application stack), identify how these services are configured (e.g., via container orchestration files, connection strings) within the provided context. Crucially, include steps to properly bring up these services and ensure they are accessible before running the dependent tests. This should also include handling any specific host building requirements for integration tests and dynamically configuring test connection strings as needed.")
    [void]$PromptBuilder.AppendLine("Artifact Generation: Implement steps to build deployable artifacts from the application components and ensure they are made available for subsequent deployment stages.")
    [void]$PromptBuilder.AppendLine("Cloud Deployment:")
    [void]$PromptBuilder.AppendLine("Environment-Specific Configuration: Dynamically select deployment settings (e.g., configuration files, credentials, application names) based on the chosen environment.")
    [void]$PromptBuilder.AppendLine("Infrastructure Provisioning: If infrastructure-as-code definitions are identified, include steps for their initialization, planning, and application.")
    [void]$PromptBuilder.AppendLine("Application Deployment: Handle the deployment of the built artifacts to the identified cloud services.")
    [void]$PromptBuilder.AppendLine("Status and Outputs: Monitor deployment status and output relevant URLs or identifiers.")
    [void]$PromptBuilder.AppendLine("Flexibility and Maintainability:")
    [void]$PromptBuilder.AppendLine("The generated workflow should be modular and clear, allowing for easy understanding and adaptation by a human, even if a similar project had different components or test setups.")
    [void]$PromptBuilder.AppendLine("Adhere to GitHub Actions best practices for structure, readability, and variable usage.")
    [void]$PromptBuilder.AppendLine("Please provide only the complete YAML content for the GitHub Actions workflow file.")
    [void]$PromptBuilder.AppendLine("===")
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
    Write-Host "Searching for key files..."
    [void]$PromptBuilder.AppendLine("Repository File Contents:")
    [void]$PromptBuilder.AppendLine("=========================")

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
