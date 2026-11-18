# Between the Ifs - render a week on THIS Windows PC's GPU. Double-click render-weekNN.bat (or: powershell -ExecutionPolicy Bypass -File render-week.ps1 -List week-2026-11-22.txt)
# The cloud already built voices, music+SFX mix (build\mix.flac), shot lists and QA stills. This only draws the pictures and muxes.
# QUALITY GATE: a video only lands in its final\ folder if it passes the outro gate (gate\manifest-<list>.json: right length, video+audio,
# and the APPROVED outro frame matched against gate\golden\*.png). Failures go to final\_rejected\ and are re-rendered next run.
# Finished videos are re-checked every run (seconds each) and skipped only if they pass. Proof frames for eyes: render\check-<list>\index.html
# Stop and re-run any time. -Force re-renders all.
param([string]$List = "", [int]$Workers = 0, [switch]$Force, [switch]$NoWait)
# keep Windows awake while rendering (screen may turn off; the PC must not sleep). Released automatically when this window closes.
try { Add-Type -Namespace Win -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);' -ErrorAction Stop; [Win.Power]::SetThreadExecutionState([uint32]2147483649) | Out-Null } catch { }
if ($Workers -le 0) { $Workers = [math]::Max(2, [math]::Min(6, [math]::Floor([Environment]::ProcessorCount / 2))) }
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
# 3. the gate (pure ffmpeg/ffprobe; numbers in InvariantCulture so a German Windows doesn't write 26,72)
$IC = [Globalization.CultureInfo]::InvariantCulture
function N($x) { return ([double]$x).ToString("0.###", $IC) }
function Probe($f, $sel) { $o = & ffprobe -v error -select_streams $sel -show_entries stream=duration -of csv=p=0 "$f" 2>$null | Select-Object -First 1; $d = 0.0; if ([double]::TryParse("$o".Trim(), [Globalization.NumberStyles]::Float, $IC, [ref]$d)) { return $d }; return -1.0 }
function Match($img, $gold, $filter, $pat) {
  $o = (& ffmpeg -nostdin -i "$img" -i "$gold" -lavfi "[0:v]scale=640:-2,format=gray[x];[1:v]scale=640:-2,format=gray[y];[x][y]$filter" -f null - 2>&1 | Out-String)
  $m = [regex]::Match($o, $pat); if (-not $m.Success) { return 0.0 }; if ($m.Groups[1].Value -eq "inf") { return 99.0 }; return [double]::Parse($m.Groups[1].Value, $IC) }
function Gate($it, $file) {   # returns "" when the video passes, else the reasons
  $why = @(); $sp = $Manifest.spec
  if (-not (Test-Path $file)) { return "file missing" }
  $vd = Probe $file "v:0"; $ad = Probe $file "a:0"
  if ([math]::Abs($vd - $it.duration) -gt $sp.dur_tol) { $why += "video $(N $vd)s, expected $(N $it.duration)s" }
  if ([math]::Abs($ad - $it.duration) -gt $sp.dur_tol) { $why += "audio $(N $ad)s, expected $(N $it.duration)s" }
  $png = "$CheckDir\$([IO.Path]::GetFileNameWithoutExtension($file)).png"; Remove-Item $png -ErrorAction SilentlyContinue
  & ffmpeg -nostdin -v error -y -ss (N $it.proof_t) -i "$file" -frames:v 1 "$png" 2>$null
  if (-not (Test-Path $png)) { $why += "no frame at the outro ($(N $it.proof_t)s): outro missing" }
  else {
    $g = "$Here\gate\$($it.golden -replace '/', '\')"
    $ss = Match $png $g "ssim" "All:([0-9.]+)"; $ps = Match $png $g "psnr" "average:([0-9.]+|inf)"
    if ($ss -lt $sp.ssim_min -or $ps -lt $sp.psnr_min) { $why += "outro frame does not match the approved $($it.variant) outro (ssim $(N $ss), psnr $(N $ps) dB)" }
    if ($it.roi) {   # faint details (ident end-screen panel) get their own check on that area
      $c = "crop=iw*$(N $it.roi[2]):ih*$(N $it.roi[3]):iw*$(N $it.roi[0]):ih*$(N $it.roi[1]),format=gray"
      $o = (& ffmpeg -nostdin -i "$png" -i "$g" -lavfi "[0:v]$c[x];[1:v]$c[y];[x][y]ssim" -f null - 2>&1 | Out-String)
      $m = [regex]::Match($o, "All:([0-9.]+)"); $rs = 0.0; if ($m.Success) { $rs = [double]::Parse($m.Groups[1].Value, $IC) }
      if ($rs -lt $sp.roi_ssim_min) { $why += "outro detail area does not match the approved $($it.variant) outro (roi ssim $(N $rs))" }
    }
  }
  return ($why -join "; ") }
# 4. every project in the list: (re-check finished file) -> picture -> mux -> GATE -> final file
if (-not $List) { $List = (Get-ChildItem $Here -Filter "week-*.txt" | Sort-Object Name | Select-Object -Last 1).Name }
$Base = [IO.Path]::GetFileNameWithoutExtension($List)
$ManFile = "$Here\gate\manifest-$Base.json"
if (-not (Test-Path $ManFile)) { Say "STOP: $ManFile missing (the cloud pack must include the gate). Nothing rendered."; if (-not $NoWait) { Read-Host "Press Enter to close" }; exit 1 }
$Manifest = Get-Content $ManFile -Raw | ConvertFrom-Json
$CheckDir = "$Here\check-$Base"; New-Item -ItemType Directory -Force $CheckDir | Out-Null
Say "start $List - workers $Workers (PC kept awake until this window closes)"
$fails = 0; $passed = @(); $failed = @()
foreach ($it in $Manifest.items) {
  $P = "$WhatIf\$($it.project -replace '/', '\')"; $D = "$WhatIf\$($it.dest -replace '/', '\')"; $name = Split-Path $D -Leaf
  New-Item -ItemType Directory -Force (Split-Path $D) | Out-Null
  if ((-not $Force) -and (Test-Path $D)) {
    $why = Gate $it $D
    if (-not $why) { Say "verified (skip) $($it.dest)"; $passed += $it.dest; continue }
    $rej = "$(Split-Path $D)\_rejected"; New-Item -ItemType Directory -Force $rej | Out-Null
    Move-Item $D "$rej\$(Get-Date -Format yyyyMMdd-HHmm)-$name" -Force; Say "GATE-FAIL existing $($it.dest): $why -> moved to _rejected, re-rendering"
  }
  $t0 = Get-Date; Say "picture: $($it.project)"
  # progress prints here every 48 frames (and goes to render.log)
  cmd /c "node render.mjs --project ""$P"" --workers $Workers --format jpeg --preset veryfast --out ""$P\build\video_silent.mp4"" 2>&1" | Tee-Object -FilePath "$P\render.log"
  if (-not (Test-Path "$P\build\video_silent.mp4")) { Say "RENDER-FAIL $($it.project) (see render.log)"; $failed += $it.dest; $fails++; if ($fails -ge 2) { Say "two failures in a row: stopping (a 'screenshot timeout' is a GPU hiccup: just run the .bat again)"; break }; continue }
  $Tmp = "$P\build\final_candidate.mp4"
  cmd /c "ffmpeg -nostdin -v error -y -i ""$P\build\video_silent.mp4"" -i ""$P\build\mix.flac"" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart ""$Tmp"" 2>> ""$P\render.log"""
  Remove-Item "$P\build\video_silent.mp4" -ErrorAction SilentlyContinue
  $why = Gate $it $Tmp; $mins = [math]::Round(((Get-Date) - $t0).TotalMinutes, 1)
  if (-not $why) { Move-Item $Tmp $D -Force; $fails = 0; $passed += $it.dest; Say "OK (gate passed) in $mins min -> $($it.dest)" }
  else { $rej = "$(Split-Path $D)\_rejected"; New-Item -ItemType Directory -Force $rej | Out-Null; Move-Item $Tmp "$rej\$(Get-Date -Format yyyyMMdd-HHmm)-$name" -Force
         $failed += $it.dest; $fails++; Say "GATE-FAIL $($it.dest): $why -> NOT delivered (in _rejected)"; if ($fails -ge 2) { Say "two failures in a row: stopping. Tell Claude: render-week.log has the reasons."; break } }
}
# 5. proof sheet for eyes: the outro frame of every video
$html = "<html><body style='background:#222;color:#eee;font-family:sans-serif'><h2>$Base - outro proof frames</h2>"
foreach ($f in Get-ChildItem $CheckDir -Filter *.png | Sort-Object Name) { $html += "<div style='display:inline-block;margin:6px;text-align:center'><img src='$($f.Name)' style='height:260px'><br>$($f.BaseName)</div>" }
Set-Content "$CheckDir\index.html" ($html + "</body></html>")
Say "SUMMARY: $($passed.Count) passed the gate, $($failed.Count) failed$(if ($failed.Count) { ': ' + ($failed -join ', ') })"
Say "proof frames: $CheckDir\index.html"
Say "ALL DONE"
if (-not $NoWait) { Read-Host "Finished. Press Enter to close" }
