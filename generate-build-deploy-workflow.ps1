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
    "*.tfvars"
)

try {
    if ([string]::IsNullOrEmpty($GeminiApiKey)) {
        Write-Error "Gemini API key is missing."
        return
    }

    Write-Host "Starting prompt generation..."
    $PromptBuilder = New-Object -TypeName System.Text.StringBuilder

    # Add the main instruction to the prompt.
    [void]$PromptBuilder.AppendLine("Use the following content and structure from a GitHub repository to generate a GitHub Action that deploys to either a test or production environment (specified by the user).")
    [void]$PromptBuilder.AppendLine("The 'name' of the workflow at the top of the YAML file must be exactly 'Deploy Environment (AI)'.")
    [void]$PromptBuilder.AppendLine("The action should be manually triggered using 'workflow_dispatch' with an 'environment' input ('test' or 'prod').")
    [void]$PromptBuilder.AppendLine("Where possible, jobs should be run in parallel to increase efficiency.")
    [void]$PromptBuilder.AppendLine("The final output should be only the YAML content for the GitHub workflow file, without any markdown formatting like `yaml`.")
    [void]$PromptBuilder.AppendLine("---")
    [void]$PromptBuilder.AppendLine("")

    # Generate and append the directory structure list.
    Write-Host "Analyzing directory structure in '$SourceDirectory'..."
    [void]$PromptBuilder.AppendLine("Repository Directory Structure:")
    [void]$PromptBuilder.AppendLine("==============================")
    
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
