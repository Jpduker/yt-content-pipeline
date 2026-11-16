@echo off
REM The Keeper's Island: render Chapters 1-3. Finished ones are skipped.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-long.ps1" -To 2026-12-06 %*
