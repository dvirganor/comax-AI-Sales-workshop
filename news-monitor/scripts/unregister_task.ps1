# Removes the automatic start at logon and the desktop shortcut. The app folder itself is left in place.
foreach ($name in 'NewsMonitor', 'NewsMonitorServer') {
    Stop-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $name -Confirm:$false -ErrorAction SilentlyContinue
}
Get-CimInstance Win32_Process -Filter "Name = 'pythonw.exe'" |
    Where-Object { $_.CommandLine -like '*news_monitor serve*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
Remove-Item (Join-Path ([Environment]::GetFolderPath('Desktop')) 'News Monitor.lnk') -ErrorAction SilentlyContinue
Write-Host 'News Monitor stopped and removed from startup.'
