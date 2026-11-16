@echo off
REM The Keeper's Island: render Chapter 4 only.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-long.ps1" -From 2026-12-07 -To 2026-12-13 %*
