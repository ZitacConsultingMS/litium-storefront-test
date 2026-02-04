# Authenticate using the service principal and the downloaded secure file
Write-Host "litium-cloud auth login --service-principal --certificate $env:CertSecureFilePath --username $env:LitiumCloudUser"
litium-cloud auth login --service-principal --certificate $env:CertSecureFilePath --username $env:LitiumCloudUser

# Initialize retry count
$artifactRetryCount = 0
$artifactMaxRetries = 100
$deployRetryCount = 0
$deployMaxRetries = 100
#$solutionname = "nextjs-storefront"

Write-Host "BuildSourcesDirectory:  $($env:BuildSourcesDirectory)"



# Execute the 'litium-cloud artifact create' command
#$filePath = "$($env:BuildSourcesDirectory)/builds/publish/$($solutionname)/"
$filePath = "$($env:BuildSourcesDirectory)/builds/publish"

# Method 1: Simple Directory Listing
Get-ChildItem -Path $filePath -Recurse -File | ForEach-Object {
    $relativePath = "/" + $_.FullName.Replace($filePath, "").Replace("\", "/").TrimStart("/")
    Write-Host $relativePath
}

# Execute the 'litium-cloud artifact create' command
Write-Host "litium-cloud artifact create --subscription $($env:LitiumCloudSubscription)  --artifact-type nextjs --file-path $filePath --no-progress -o json | ConvertFrom-Json"

$createOutput = litium-cloud artifact create --subscription $($env:LitiumCloudSubscription)  --artifact-type nextjs --file-path $filePath --no-progress -o json
Write-Host "$createOutput"
$createOutput = $createOutput | ConvertFrom-Json

# Extract 'jobId' and 'artifactId'
$jobId = $createOutput.jobId
$artifactId = $createOutput.data.artifactId

# Output the jobId and artifactId
Write-Host "jobId: $jobId"
Write-Host "artifactId: $artifactId"

do {
    # Execute the 'litium-cloud artifact show' command
    Write-Host "litium-cloud artifact show --artifact $artifactId -o json | ConvertFrom-Json"
    $statusOutput = litium-cloud artifact show --artifact $artifactId -o json
    Write-Host $statusOutput
    $statusOutput = $statusOutput | ConvertFrom-Json

    # Check if 'status' for artifact is set to "Ready"
    if ($statusOutput.status -eq "Ready" ) {
        # Artifact is ready, proceed
        break
    }
    elseif ($statusOutput.status -eq "Failed" ) {
        # Artifact create failed
        Write-Host "Artifact create failed."
        Write-Host "Status:"
        Write-Host $statusOutput.status
        $logs = litium-cloud status logs --job $artifactId
        Write-Host $logs
        exit 1            
    }
    elseif ($artifactRetryCount -ge $artifactMaxRetries) {
        # Max retries reached
        Write-Host "Max retries reached. The job has not completed."
        Write-Host "Status:"
        Write-Host $statusOutput.status
        Write-Host "Retry count: $artifactRetryCount of maximum allowed retries: $artifactMaxRetries"
        exit 1
    }
    else {
        # Retry logic
        $artifactRetryCount++
        Write-Host "Retrying... Attempt: $artifactRetryCount of $artifactMaxRetries"
        Start-Sleep -Seconds 20
    }
} while ($artifactMaxRetries -ge $artifactRetryCount)
 
# Artifact is ready, start deploy
Write-Host "litium-cloud app deploy --subscription $($env:LitiumCloudSubscription) --environment $($env:LitiumCloudEnvironment) --app $env:LitiumApp --artifact $artifactId -o json"
$createOutput = litium-cloud app deploy --subscription $($env:LitiumCloudSubscription) --environment $($env:LitiumCloudEnvironment) --app $env:LitiumApp --artifact $artifactId -o json
 
Write-Host "$createOutput"
$createOutput = $createOutput | ConvertFrom-Json

# Extract 'jobId'
$jobId = $createOutput.jobId
 
do {
    Write-Host "litium-cloud status show --job $jobId -o json | ConvertFrom-Json"
    $statusOutput = litium-cloud status show --job $jobId -o json
    Write-Host $statusOutput
    $statusOutput = $statusOutput | ConvertFrom-Json
    $job = $statusOutput.items[0];

    # Check if 'completedAt' is set and 'failed' is false
    if ($statusOutput.completedAt -and !$job.failed ) {
        Write-Host "Deploy finished.";
        exit 0;
    }
    elseif ( $job.failed ) {
        # Artifact create failed
        Write-Host "Deploy failed."
        exit 1            
    }
    elseif ($deployRetryCount -ge $deployMaxRetries) {
        # Max retries reached
        Write-Host "Max retries reached. The job has not completed."
        Write-Host "Status:"
        Write-Host $statusOutput.status
        Write-Host "Retry count: $deployRetryCount of maximum allowed retries: $deployMaxRetries"
        exit 1
    }
    else {
        # Retry logic
        $deployRetryCount++
        Write-Host "Retrying... Attempt: $deployRetryCount of $deployMaxRetries"
        Start-Sleep -Seconds 20
    }
} while ($deployMaxRetries -ge $deployRetryCount)
