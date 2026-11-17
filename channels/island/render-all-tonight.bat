@echo off
REM The Keeper's Island: render EVERYTHING with the new endings + name tags, in this order (about 10-11 hours on the GTX 1650):
REM   1. S00 intro Short  2. all Shorts of weeks 1-4 (S01-S56)  3. CH00 welcome film  4. Chapters 1-4.
REM Safe to stop and run again: finished Shorts are skipped. (Chapters use -Force, so a re-run starts the chapters again; to resume only chapters run long\render-long.bat.)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0intro\render-intro-short.ps1" -Only s00 -NoWait
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0shorts\render-week.ps1" -To 2026-12-13 -NoWait
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0intro\render-intro-long.ps1" -Only ch00 -Force -NoWait
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0long\render-long.ps1" -To 2026-12-13 -Force
