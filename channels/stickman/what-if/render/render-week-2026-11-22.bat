@echo off
rem Between the Ifs: render the week 22-28 Nov 2026 on this PC (GPU). Leave the window open; re-run any time, finished videos are skipped.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-week.ps1" -List week-2026-11-22.txt
