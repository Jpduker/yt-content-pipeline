param(
  [string]$Target = 'C:\Users\Vivek Sai\Downloads\YouTube',
  [string]$PackageRoot = $PSScriptRoot
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $Target -PathType Container)) { throw "Target folder does not exist: $Target" }
$Target = (Resolve-Path -LiteralPath $Target).Path
$PackageRoot = (Resolve-Path -LiteralPath $PackageRoot).Path
$manifestPath = Join-Path $PackageRoot 'manifest.json'
if (-not (Test-Path -LiteralPath $manifestPath)) { throw 'Run this script from the extracted transfer package, or pass -PackageRoot pointing to it.' }
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
& git -C $Target rev-parse --is-inside-work-tree | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Target must be the existing yt-content-pipeline checkout.' }
$branch = (& git -C $Target branch --show-current).Trim()
if ($branch -ne 'main') { throw "Target branch is '$branch', not main. Ask Fable to reconcile the checkout first." }
if (Test-Path -LiteralPath (Join-Path $Target '.git/MERGE_HEAD')) { throw 'Resolve the existing merge before importing.' }

function Get-ContentHash([string]$Path, [bool]$Text) {
  if (-not $Text) { return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant() }
  $bytes = [System.IO.File]::ReadAllBytes($Path)
  $str = [System.Text.Encoding]::UTF8.GetString($bytes).Replace("`r`n", "`n")
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try { return ([BitConverter]::ToString($sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($str)))).Replace('-', '').ToLowerInvariant() }
  finally { $sha.Dispose() }
}

# Validate the ENTIRE package and all collisions before writing any target file.
$copyPlan = @()
$sourcePaths = @()
foreach ($item in $manifest.files) {
  $relative = [string]$item.path
  if ([System.IO.Path]::IsPathRooted($relative) -or ($relative.Split('/') -contains '..')) { throw "Unsafe package path: $relative" }
  if ($relative -match '(^|/)HANDOFF\.md$') { throw 'HANDOFF.md must not be part of this import.' }
  $nativeRelative = $relative.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
  $src = Join-Path (Join-Path $PackageRoot 'payload') $nativeRelative
  $dst = Join-Path $Target $nativeRelative
  if (-not (Test-Path -LiteralPath $src -PathType Leaf)) { throw "Package file missing: $relative" }
  $raw = (Get-FileHash -LiteralPath $src -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($raw -ne $item.raw_sha256) { throw "Package checksum mismatch: $relative" }
  if ($item.tracked) { $sourcePaths += $relative }
  if (Test-Path -LiteralPath $dst) {
    if (-not (Test-Path -LiteralPath $dst -PathType Leaf)) { throw "File/directory collision: $relative" }
    $current = Get-ContentHash $dst ([bool]$item.text)
    if ($current -eq $item.sha256) { continue }
    if (-not $item.base_sha256 -or $current -ne $item.base_sha256) {
      throw "Local content differs: $relative. Nothing has been copied. Have Fable reconcile this file before retrying."
    }
  }
  $copyPlan += [PSCustomObject]@{ Source = $src; Destination = $dst; Relative = $relative }
}
foreach ($item in $copyPlan) {
  $parent = Split-Path -Parent $item.Destination
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  Copy-Item -LiteralPath $item.Source -Destination $item.Destination
}
Write-Host "Installed $($copyPlan.Count) files in $Target"

# Commit only this package's source paths. Existing unrelated staged work is excluded.
& git -C $Target add -- @sourcePaths
if ($LASTEXITCODE -ne 0) { throw 'Files were copied, but git add failed. Ask Fable to inspect; do not claim a commit.' }
& git -C $Target diff --cached --quiet -- @sourcePaths
if ($LASTEXITCODE -eq 1) {
  & git -C $Target commit --only -m 'Import Alternate Avengers research, assets and animation proofs' -- @sourcePaths
  if ($LASTEXITCODE -ne 0) { throw 'Files are installed, but the local commit failed. Check Git identity/hooks with Fable.' }
} elseif ($LASTEXITCODE -ne 0) { throw 'Git diff failed while checking the imported sources.' }
Write-Host 'Local source commit:'
& git -C $Target log -1 --oneline
Write-Host 'Rendered MP4/WAV files were saved locally and remain gitignored. HANDOFF.md was not edited. No remote push was performed.'
