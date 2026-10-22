@echo off
chcp 65001 >nul
cd /d "%~dp0.."
if not exist ".venv\Scripts\python.exe" (
  echo ERROR: .venv was not found in "%CD%"
  echo Run scripts\install.bat first.
  pause
  exit /b 1
)
echo Scanning, please wait - this takes about 30 seconds...
".venv\Scripts\python.exe" -m news_monitor run --force
if errorlevel 1 (
  echo ERROR: the scan failed. See the message above and logs\monitor.log
  pause
  exit /b 1
)
call "%~dp0open_report.bat"
pause
