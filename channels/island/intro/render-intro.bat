@echo off
REM The Keeper's Island: render the INTRO (S00 Short 9:16, then the CH00 welcome film 16:9). Finished ones are skipped.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-intro-short.ps1" -Only s00 %*
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-intro-long.ps1" -Only ch00 %*
