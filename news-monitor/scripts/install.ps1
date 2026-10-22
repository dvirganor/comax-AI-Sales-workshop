# Setup: creates a virtual environment, installs dependencies, starts the app at logon
# and puts a "News Monitor" shortcut on the desktop. Safe to run again (e.g. after an update).
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$py = Join-Path $Root '.venv\Scripts\python.exe'
if (-not (Test-Path $py)) {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -3 -m venv .venv
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        python -m venv .venv
    } else {
        throw "Python 3.10+ was not found. Install it from https://www.python.org/downloads/ (tick 'Add python.exe to PATH') and run again."
    }
}

& $py -m pip install --upgrade pip --quiet
& $py -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) { throw 'pip install failed' }

& (Join-Path $PSScriptRoot 'register_task.ps1')

# Desktop shortcut to the launcher
$shortcutPath = Join-Path ([Environment]::GetFolderPath('Desktop')) 'News Monitor.lnk'
$shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $Root 'NewsMonitor.bat'
$shortcut.WorkingDirectory = $Root
$shortcut.WindowStyle = 7  # minimized
$shortcut.Description = 'Israeli ERP/POS/retail news monitor'
$shortcut.Save()
Write-Host "Desktop shortcut created: $shortcutPath"

Write-Host ''
Write-Host 'Installation complete.'
