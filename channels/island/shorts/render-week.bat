@echo off
REM The Keeper's Island: render the Shorts of weeks 1-3 (16 Nov - 6 Dec). Finished ones are skipped.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-week.ps1" -To 2026-12-06 %*
