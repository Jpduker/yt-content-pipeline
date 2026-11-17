# Between the Ifs · render a week on THIS Windows PC's GPU. Double-click render-weekNN.bat (or: powershell -ExecutionPolicy Bypass -File render-week.ps1 -List week-2026-11-22.txt)
# The cloud already built voices, music+SFX mix (build\mix.flac), shot lists and QA stills. This only draws the pictures and muxes.
# Finished videos (final file newer than story\shots.json) are skipped, so you can stop and re-run any time. -Force re-renders all.
param([string]$List = "", [int]$Workers = 2, [switch]$Force, [switch]$NoWait)
$ErrorActionPreference = "Continue"
$Here = $PSScriptRoot; $WhatIf = (Resolve-Path "$Here\..").Path; $Root = (Resolve-Path "$Here\..\..\..\..").Path
$Kit = "$Root\lab\2026-11-09-growkaz-plugin-test\plugin\skills\make-2d-video\kit"
$Log = "$Here\render-week.log"
function Say($m) { $l = "$(Get-Date -Format HH:mm) $m"; Write-Host $l; Add-Content -Path $Log -Value $l }
# 1. tools (same as the island setup): Node 20+ and ffmpeg
$missing = $false
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Say "Node.js missing -> installing (winget)"; winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements; $missing = $true }
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { Say "ffmpeg missing -> installing (winget)"; winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements; $missing = $true }
if ($missing) { Say "Installed tools. CLOSE this window and double-click the .bat again."; Read-Host "Press Enter to close"; exit }
# 2. the render kit's packages + headless Chrome (once)
Set-Location $Kit
if (-not (Test-Path "$Kit\node_modules\@fontsource\permanent-marker")) { Say "npm install (once)"; npm install --no-audit --no-fund }
Say "checking headless Chrome for playwright (downloads once, ~100 MB)"
cmd /c "npx playwright install chromium-headless-shell 2>&1"
# 3. every project in the list: picture (GPU) -> mux with the cloud-made mix -> final file
if (-not $List) { $List = (Get-ChildItem $Here -Filter "week-*.txt" | Sort-Object Name | Select-Object -Last 1).Name }
Say "start $List · workers $Workers"
$fails = 0
foreach ($line in Get-Content "$Here\$List") {
  if (-not $line.Trim() -or $line.StartsWith("#")) { continue }
  $proj, $dest = $line.Split("|"); $P = "$WhatIf\$($proj.Trim())"; $D = "$WhatIf\$($dest.Trim())"
  if ((-not $Force) -and (Test-Path $D) -and ((Get-Item $D).LastWriteTime -gt (Get-Item "$P\story\shots.json").LastWriteTime)) { Say "skip (done) $dest"; continue }
  New-Item -ItemType Directory -Force (Split-Path $D) | Out-Null
  $t0 = Get-Date; Say "picture: $proj (progress: $P\render.log)"
  cmd /c "node render.mjs --project ""$P"" --workers $Workers --out ""$P\build\video_silent.mp4"" > ""$P\render.log"" 2>&1"
  if (-not (Test-Path "$P\build\video_silent.mp4")) { Say "RENDER-FAIL $proj (see render.log)"; $fails++; if ($fails -ge 2) { Say "two failures in a row: stopping (a 'screenshot timeout' is a GPU hiccup: just run the .bat again)"; break }; continue }
  cmd /c "ffmpeg -v error -y -i ""$P\build\video_silent.mp4"" -i ""$P\build\mix.flac"" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart ""$D"" 2>> ""$P\render.log"""
  Remove-Item "$P\build\video_silent.mp4" -ErrorAction SilentlyContinue
  $fails = 0; $mins = [math]::Round(((Get-Date) - $t0).TotalMinutes, 1)
  if (Test-Path $D) { Say "OK in $mins min -> $dest" } else { Say "MUX-FAIL $proj" }
}
Say "ALL DONE"
if (-not $NoWait) { Read-Host "Finished. Press Enter to close" }
