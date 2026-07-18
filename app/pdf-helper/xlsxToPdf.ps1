param(
    [Parameter(Mandatory=$true)][string]$InputPath,
    [Parameter(Mandatory=$true)][string]$OutputPath
)

$excel = $null
$workbook = $null

try {

    $InputPath = (Resolve-Path $InputPath).Path

    if (!(Test-Path $InputPath)) {
        throw "Input file not found: $InputPath"
    }

    $file = Get-Item $InputPath

    if ($file.Length -eq 0) {
        throw "Input file is empty."
    }

    Write-Host "Input: $InputPath"
    Write-Host "Size : $($file.Length)"

    $excel = New-Object -ComObject Excel.Application

    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.ScreenUpdating = $false
    $excel.EnableEvents = $false
    $excel.AskToUpdateLinks = $false

    $excel.AutomationSecurity = 3

    $workbook = $excel.Workbooks.Open(
        $InputPath,
        0,
        $true,
        5,
        "",
        "",
        $true
    )

    $excel.CalculateFullRebuild()
    $excel.Calculate()

    Start-Sleep -Milliseconds 1000

    $workbook.ExportAsFixedFormat(
        0,
        $OutputPath
    )

    Write-Output "SUCCESS"
}
catch {
    Write-Host "======================="
    Write-Host $_.Exception.Message
    Write-Host "Input : $InputPath"

    if (Test-Path $InputPath) {
        $info = Get-Item $InputPath
        Write-Host "Exists : Yes"
        Write-Host "Size   : $($info.Length)"
    }
    else {
        Write-Host "Exists : No"
    }

    Write-Host "======================="

    exit 1
}
finally {

    if ($workbook) {
        $workbook.Close($false)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
    }

    if ($excel) {
        $excel.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }

    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}