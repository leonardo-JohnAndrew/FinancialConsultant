# scripts/xlsxToPdf.ps1
#
# Binubuksan si Excel sa background (invisible), ino-open ang xlsx,
# pinipilit mag-full-recalculate bago mag-export bilang PDF.
# Sinasara/i-ri-release lahat ng COM object sa dulo, success man o hindi,
# para walang naiiwang "phantom" EXCEL.EXE process sa background.

param(
    [Parameter(Mandatory=$true)][string]$InputPath,
    [Parameter(Mandatory=$true)][string]$OutputPath
)

$excel = $null
$workbook = $null

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.AskToUpdateLinks = $false

    # ReadOnly=$true, UpdateLinks=0 — hindi natin babaguhin ang file, PDF export lang
    $workbook = $excel.Workbooks.Open($InputPath, 0, $true)

    $excel.CalculateFullRebuild()
    $excel.Calculate()

    # xlTypePDF = 0
    $workbook.ExportAsFixedFormat(0, $OutputPath)

    Write-Output "SUCCESS"
}
catch {

    Write-Host "Exception:"
    Write-Host $_.Exception.Message

    if ($_.Exception.InnerException) {
        Write-Host "Inner:"
        Write-Host $_.Exception.InnerException.Message
    }

    Write-Host "Input:"
    Write-Host $InputPath

    if(Test-Path $InputPath){
        $f = Get-Item $InputPath
        Write-Host "Size:"
        Write-Host $f.Length
    }

    throw
}
finally {
    
    if ($workbook) {
        $workbook.Close($false)
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
    }
    if ($excel) {
        $excel.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}