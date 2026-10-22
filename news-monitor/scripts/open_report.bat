@echo off
cd /d "%~dp0.."
rem Opens the report through the local server (with the refresh button); falls back to the file
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:8765/health' | Out-Null; Start-Process 'http://127.0.0.1:8765/' } catch { Start-Process 'output\report.html' }"
