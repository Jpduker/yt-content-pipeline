@echo off
REM OPTIONAL: re-render Chapters 1-3 (about 3.5 hours) with the new character name tags. Overwrites the finished files.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-long.ps1" -To 2026-12-06 -Force %*
