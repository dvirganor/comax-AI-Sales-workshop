@echo off
chcp 65001 >nul
cd /d "%~dp0.."
.venv\Scripts\python.exe -m news_monitor telegram-test
pause
