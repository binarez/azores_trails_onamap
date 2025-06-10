# Define the JSON file path
$jsonFilePath = "routes.json"

# Read the JSON content
$jsonData = Get-Content -Raw -Path $jsonFilePath | ConvertFrom-Json

# Ensure the 'routes' directory exists
$routesDir = "routes"
if (!(Test-Path $routesDir)) {
    New-Item -ItemType Directory -Path $routesDir
}

# Download each GPX file
foreach ($item in $jsonData) {
    $gpxUrl = $item.gpxFile
    $gpxFileName = [System.IO.Path]::GetFileName($gpxUrl)

    # Validate GPX file extension
    if ($gpxFileName -notmatch "\.gpx$") {
        throw "Error: The file '$gpxFileName' does not have a .gpx extension."
    }

    $destinationPath = Join-Path $routesDir $gpxFileName
    Invoke-WebRequest -Uri $gpxUrl -OutFile $destinationPath
    Write-Output "Downloaded: $gpxFileName"
}

Write-Output "All GPX files downloaded successfully!"
