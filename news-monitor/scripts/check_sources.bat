@echo off
chcp 65001 >nul
cd /d "%~dp0.."
if not exist logs mkdir logs
echo Checking sources, please wait...
rem The console font cannot display Hebrew, so results are saved to a file and opened in Notepad
.venv\Scripts\python.exe -m news_monitor check-sources > logs\sources.txt 2>&1
start "" notepad "logs\sources.txt"
