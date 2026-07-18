# scripts/setup-pdf-helper.ps1
#
# Isang beses-lang patakbuhin ito para i-set up ang PDF Helper folder.
# Awtomatikong gagawa ng C:\PdfHelper at kokopyahin doon ang kinakailangang
# files (server.js at xlsxToPdf.ps1) mula sa main project.

$helperDir = "C:\PdfHelper"
$projectRoot = Split-Path -Parent $PSScriptRoot  # kukunin ang financial-app root

Write-Host "Setting up PDF Helper sa $helperDir..."

# 1. Gawin ang folder kung wala pa
if (-not (Test-Path $helperDir)) {
    New-Item -ItemType Directory -Path $helperDir -Force | Out-Null
    Write-Host "  created folder: $helperDir"
} else {
    Write-Host "  Existing  folder: $helperDir"
}

# 2. Kopyahin ang server.js (dapat nasa scripts/pdf-helper/server.js sa project)
$srcServer = Join-Path $projectRoot "scripts\pdf-helper\server.js"
$destServer = Join-Path $helperDir "server.js"
Copy-Item $srcServer -Destination $destServer -Force
Write-Host "  copy server.js"

# 3. Kopyahin ang xlsxToPdf.ps1
$srcPs1 = Join-Path $projectRoot "scripts\xlsxToPdf.ps1"
$destPs1 = Join-Path $helperDir "xlsxToPdf.ps1"
Copy-Item $srcPs1 -Destination $destPs1 -Force
Write-Host " copy xlsxToPdf.ps1"

Write-Host "setup success next task manager $destServer"