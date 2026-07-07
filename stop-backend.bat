@echo off
title Stop Dyno Backend
echo Stopping Dyno Backend Server on Port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /f /pid %%a
)
echo.
echo Dyno Backend Server on Port 5000 has been stopped successfully!
pause
