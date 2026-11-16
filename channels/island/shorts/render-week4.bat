@echo off
REM The Keeper's Island: render the Shorts of week 4 only (7-13 Dec).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-week.ps1" -From 2026-12-07 -To 2026-12-13 %*
