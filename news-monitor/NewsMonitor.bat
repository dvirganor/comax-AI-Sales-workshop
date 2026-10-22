@echo off
rem News Monitor - double-click to open the app in the browser.
rem First run installs everything; afterwards it starts the app in the background if needed.
title News Monitor
cd /d "%~dp0"

if not exist ".venv\Scripts\pythonw.exe" (
  echo First run - installing. This takes a minute or two...
  powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\install.ps1"
  if errorlevel 1 (
    echo.
    echo Installation failed - see the message above.
    pause
    exit /b 1
  )
)

call :wait_for_app 1
if errorlevel 1 (
  echo Starting the app...
  start "" ".venv\Scripts\pythonw.exe" -m news_monitor serve
  call :wait_for_app 40
  if errorlevel 1 (
    echo The app did not start. Details are in logs\monitor.log
    pause
    exit /b 1
  )
)
start "" "http://127.0.0.1:8765/"
exit /b 0

rem Waits until the app answers (up to %1 half-second attempts)
:wait_for_app
powershell -NoProfile -Command "for($i=0;$i -lt %1;$i++){try{Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:8765/health' | Out-Null; exit 0}catch{Start-Sleep -Milliseconds 500}}; exit 1"
exit /b %errorlevel%
