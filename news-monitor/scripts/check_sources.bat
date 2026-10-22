@echo off
chcp 65001 >nul
cd /d "%~dp0.."
if not exist ".venv\Scripts\python.exe" (
  echo ERROR: .venv was not found in "%CD%"
  echo Run scripts\install.bat first.
  pause
  exit /b 1
)
if not exist logs mkdir logs
echo Checking sources, please wait - this takes about 30 seconds...
rem The console font cannot display Hebrew, so results are saved to a file and opened in Notepad
".venv\Scripts\python.exe" -m news_monitor check-sources > "logs\sources.txt" 2>&1
if errorlevel 1 (
  echo ERROR: the check failed. Details:
  type "logs\sources.txt"
  pause
  exit /b 1
)
start "" notepad "logs\sources.txt"
echo Done. The results were opened in Notepad: %CD%\logs\sources.txt
pause
