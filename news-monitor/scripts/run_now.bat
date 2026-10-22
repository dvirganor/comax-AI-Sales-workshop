@echo off
chcp 65001 >nul
cd /d "%~dp0.."
.venv\Scripts\python.exe -m news_monitor run --force
call "%~dp0open_report.bat"
pause
