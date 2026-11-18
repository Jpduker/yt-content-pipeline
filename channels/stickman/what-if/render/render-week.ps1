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
function Probe($f, $kind) {   # duration of the first video/audio stream from ffprobe JSON (line order and extra metadata don't matter)
  try { $j = (& ffprobe -v error -show_entries "stream=codec_type,duration,nb_frames,r_frame_rate:format=duration" -of json "$f" 2>$null | Out-String) | ConvertFrom-Json } catch { return -1.0 }
  $st = @($j.streams | Where-Object { $_.codec_type -eq $kind }) | Select-Object -First 1; if (-not $st) { return -1.0 }
  $d = 0.0
  if ($st.duration -and [double]::TryParse("$($st.duration)", [Globalization.NumberStyles]::Float, $IC, [ref]$d)) { return $d }
  if ($st.nb_frames -and $st.r_frame_rate -match '^(\d+)/(\d+)$' -and [int]$Matches[1] -gt 0) { return [double]$st.nb_frames * [int]$Matches[2] / [int]$Matches[1] }
  if ($j.format.duration -and [double]::TryParse("$($j.format.duration)", [Globalization.NumberStyles]::Float, $IC, [ref]$d)) { return $d }
  return -1.0 }
function MeanVol($ffargs) { $o = (& ffmpeg @ffargs 2>&1 | Out-String); $m = [regex]::Match($o, "mean_volume: ([-0-9.]+) dB"); if ($m.Success) { return [double]::Parse($m.Groups[1].Value, $IC) }; return -99.0 }
function AudioMargin($video, $mix, $t0, $dur) {   # dB the difference (video audio - current mix) sits below the signal; same mix ~25 dB
  $tr = "atrim=$(N $t0)" + $(if ($dur) { ":$(N ($t0 + $dur))" } else { "" }) + ",asetpts=PTS-STARTPTS"
  $sig = MeanVol @("-nostdin", "-i", $video, "-af", "$tr,volumedetect", "-vn", "-f", "null", "-")
  $fmt = "aformat=sample_rates=48000:channel_layouts=stereo"
  $dif = MeanVol @("-nostdin", "-i", $video, "-i", $mix, "-filter_complex", "[0:a]$tr,$fmt[a];[1:a]$tr,$fmt,volume=-1[b];[a][b]amix=inputs=2:normalize=0,volumedetect", "-vn", "-f", "null", "-")
  return $sig - $dif }
function Match($img, $gold, $filter, $pat) {
  $o = (& ffmpeg -nostdin -i "$img" -i "$gold" -lavfi "[0:v]scale=640:-2,format=gray[x];[1:v]scale=640:-2,format=gray[y];[x][y]$filter" -f null - 2>&1 | Out-String)
  $m = [regex]::Match($o, $pat); if (-not $m.Success) { return 0.0 }; if ($m.Groups[1].Value -eq "inf") { return 99.0 }; return [double]::Parse($m.Groups[1].Value, $IC) }
function Gate($it, $file) {   # returns "" when the video passes, else the reasons
  $why = @(); $sp = $Manifest.spec
  if (-not (Test-Path $file)) { return "file missing" }
  $vd = Probe $file "video"; $ad = Probe $file "audio"
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
  $mix = "$WhatIf\$($it.project -replace '/', '\')\build\mix.flac"
  if ((Test-Path $mix) -and $ad -gt 0) {
    $m1 = AudioMargin $file $mix 0 $null; $m2 = AudioMargin $file $mix $it.outro_start ($it.duration - $it.outro_start)
    if ($m1 -lt $sp.audio_match_db) { $why += "audio is not the current mix (margin $(N $m1) dB)" }
    if ($m2 -lt $sp.audio_match_db) { $why += "outro audio is not the current mix (margin $(N $m2) dB)" }
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
$probeTest = Probe "$Here\gate\selftest.mp4" "video"
if ([math]::Abs($probeTest - 2.0) -gt 0.1) { Say "STOP: gate self-test failed (read $(N $probeTest)s from gate\selftest.mp4, expected 2s). Tell Claude. Nothing rendered."; if (-not $NoWait) { Read-Host "Press Enter to close" }; exit 1 }
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
