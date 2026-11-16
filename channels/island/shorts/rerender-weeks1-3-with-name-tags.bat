@echo off
REM OPTIONAL: re-render ALL Shorts of weeks 1-3 (about 3 hours) so they get the new character name tags. Overwrites the finished files.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-week.ps1" -To 2026-12-06 -Force %*
