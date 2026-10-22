# Starts the app (local server at http://127.0.0.1:8765) in the background at every logon.
# The app runs the hourly scan itself, so the separate scan task of earlier versions is removed.
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$pythonw = Join-Path $Root '.venv\Scripts\pythonw.exe'
if (-not (Test-Path $pythonw)) { throw "Not found: $pythonw - run install.ps1 first." }

if (Get-ScheduledTask -TaskName 'NewsMonitor' -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName 'NewsMonitor' -Confirm:$false
    Write-Host "Removed the old 'NewsMonitor' scan task - the app now schedules scans itself."
}

$action = New-ScheduledTaskAction -Execute $pythonw -Argument '-m news_monitor serve' -WorkingDirectory $Root
$trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
    -MultipleInstances IgnoreNew
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'NewsMonitorServer' -Action $action -Trigger $trigger `
    -Settings $settings -Principal $principal -Description 'News monitor app (report, refresh, hourly scans)' -Force | Out-Null
Start-ScheduledTask -TaskName 'NewsMonitorServer'
Write-Host "The app starts automatically at logon: http://127.0.0.1:8765/"
