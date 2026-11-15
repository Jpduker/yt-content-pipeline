@echo off
rem Quick GPU check: renders only S01 (35 s). Watch the first lines: it must NOT say "software rendering".
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0render-week.ps1" -Only s01
