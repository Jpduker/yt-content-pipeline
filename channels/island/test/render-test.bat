@echo off
REM The Keeper's Island: render the v2 TEST Short (S20 rebuilt: one shot per line, close-ups, crash zoom, insert, HD sprites). About 6-8 minutes.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-test.ps1" -Force %*
