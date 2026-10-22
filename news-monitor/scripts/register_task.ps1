# Registers a Windows scheduled task that runs the monitor every hour,
# 08:00-18:00, Sunday to Thursday (11 runs a day).
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$TaskName = 'NewsMonitor'
$pythonw = Join-Path $Root '.venv\Scripts\pythonw.exe'
if (-not (Test-Path $pythonw)) { throw "Not found: $pythonw - run install.ps1 first." }

$action = New-ScheduledTaskAction -Execute $pythonw -Argument '-m news_monitor run' -WorkingDirectory $Root
$days = 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'
$triggers = foreach ($hour in 8..18) {
    New-ScheduledTaskTrigger -Weekly -DaysOfWeek $days -At ([datetime]::Today.AddHours($hour))
}
# StartWhenAvailable: if the computer was asleep at run time, run as soon as it wakes up
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -MultipleInstances IgnoreNew
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $triggers -Settings $settings `
    -Principal $principal -Description 'Israeli ERP/POS/retail news monitor' -Force | Out-Null
Write-Host "Scheduled task '$TaskName' registered: hourly 08:00-18:00, Sunday-Thursday."
