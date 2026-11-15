# The Keeper's Island · render the whole week of Shorts on THIS Windows PC's GPU (GTX 1650), 1080x1920 @ 30 fps.
# Double-click render-week.bat (or: powershell -ExecutionPolicy Bypass -File render-week.ps1). Leave the window open; it logs to render-week.log.
# Already-finished Shorts (final\*.mp4 newer than timeline.json) are skipped, so you can stop and re-run any time.
param([string]$Size = "1080x1920", [int]$Fps = 30, [int]$Workers = 2, [string]$SS = "1", [string]$Only = "")
$ErrorActionPreference = "Continue"   # node/ffmpeg write progress to stderr; "Stop" would abort on it
$Shorts = $PSScriptRoot
$Root = (Resolve-Path "$Shorts\..\..\..").Path
$Lib = "$Root\tools\lemo-opuscar"
$Log = "$Shorts\render-week.log"
function Say($m) { $l = "$(Get-Date -Format HH:mm) $m"; Write-Host $l; Add-Content -Path $Log -Value $l }

# 1. Tools: Node 20+ and ffmpeg (installs them with winget if missing; then re-run this script in a NEW window)
$missing = $false
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Say "Node.js missing -> installing (winget)"; winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements; $missing = $true }
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { Say "ffmpeg missing -> installing (winget)"; winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements; $missing = $true }
if ($missing) { Say "Installed tools. CLOSE this window and double-click render-week.bat again."; Read-Host "Press Enter to close"; exit }

# 2. Headless Chrome for the renderer (once) + our engine into the library
Set-Location $Lib
if (-not (Test-Path "$Lib\node_modules\three")) { Say "npm install (once)"; npm install --no-audit --no-fund }
Say "checking headless Chrome for playwright-core (downloads once, ~100 MB)"
cmd /c "node node_modules/playwright-core/cli.js install chromium-headless-shell 2>&1"
$Eng = "$Lib\styles\island-engine"
if (Test-Path $Eng) { Remove-Item $Eng -Recurse -Force }
Copy-Item "$Root\channels\island\engine" $Eng -Recurse
New-Item -ItemType Directory -Force "$Eng\fonts" | Out-Null
Copy-Item "$Root\library\fonts\cinzel-cormorant\*.ttf" "$Eng\fonts\"
Copy-Item "$Root\channels\island\engine\fonts.css" "$Eng\fonts\fonts.css"

# 3. GPU: Direct3D 11 through ANGLE (the GTX 1650). If a render says "software rendering", try: $env:LEMO_ANGLE="d3d11on12" or "gl"
if (-not $env:LEMO_ANGLE) { $env:LEMO_ANGLE = "d3d11" }
Say "start week render · $Size @ $Fps fps · workers $Workers · ss=$SS · ANGLE=$env:LEMO_ANGLE"

# 4. Every Short in date order: picture -> mux with its mix (loudness -14 LUFS) -> final\<folder>.mp4
$dirs = Get-ChildItem $Shorts -Directory | Where-Object { Test-Path "$($_.FullName)\timeline.json" } | Sort-Object Name
if ($Only) { $dirs = $dirs | Where-Object { $_.Name -like "*$Only*" } }
$fails = 0
foreach ($d in $dirs) {
  $Dir = $d.FullName; $Name = $d.Name; $final = "$Dir\final\$Name.mp4"
  if ((Test-Path $final) -and ((Get-Item $final).LastWriteTime -gt (Get-Item "$Dir\timeline.json").LastWriteTime)) { Say "$Name skip (done)"; continue }
  New-Item -ItemType Directory -Force "$Dir\out", "$Dir\final" | Out-Null
  $t0 = Get-Date; Say "$Name picture... (progress: $Dir\out\render.log)"
  cmd /c "node core/render/video.mjs ""$Dir"" --fps $Fps --workers $Workers --size $Size --q ss=$SS --out ""$Dir\out\video.mp4"" > ""$Dir\out\render.log"" 2>&1"
  if (-not (Test-Path "$Dir\out\video.mp4")) { Say "$Name RENDER-FAIL (see out\render.log)"; $fails++; if ($fails -ge 2) { Say "two failures in a row: stopping"; break }; continue }
  cmd /c "ffmpeg -v error -y -i ""$Dir\out\video.mp4"" -i ""$Dir\out\mix.wav"" -af loudnorm=I=-14:TP=-1.2:LRA=11 -ar 48000 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart ""$final"" 2>> ""$Dir\out\render.log"""
  $mins = [math]::Round(((Get-Date) - $t0).TotalMinutes, 1)
  $fails = 0; if (Test-Path $final) { Say "$Name OK in $mins min -> final\$Name.mp4" } else { Say "$Name MUX-FAIL" }
}
Say "ALL DONE"
Read-Host "Finished. Press Enter to close"
