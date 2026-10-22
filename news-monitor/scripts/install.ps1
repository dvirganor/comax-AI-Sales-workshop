# One-time setup: creates a virtual environment, installs dependencies
# and registers the hourly scheduled task.
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3 -m venv .venv
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    python -m venv .venv
} else {
    throw "Python 3.10+ was not found. Install it from https://www.python.org/downloads/ (tick 'Add python.exe to PATH') and run again."
}

$py = Join-Path $Root '.venv\Scripts\python.exe'
& $py -m pip install --upgrade pip --quiet
& $py -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) { throw 'pip install failed' }

& (Join-Path $PSScriptRoot 'register_task.ps1')
Write-Host ''
Write-Host 'Installation complete.'
