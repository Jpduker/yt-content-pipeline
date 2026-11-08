#!/bin/sh
# One-command local build (WSL / Linux). Needs the lemo-opuscar library (LIB) with its core tier, librosa, and ffmpeg.
#   from the workspace root:  . pipeline/env.sh; sh channels/<channel>/<series>/<episode>/build.sh        (or LIB=/path/to/lemo-opuscar sh build.sh)
# Voices are already in voices/ (Kokoro), so no TTS step runs unless voices/dur.json is missing.
# mux.sh needs ffmpeg 7+; Ubuntu 24.04 ships 6.1, so this falls back to the static ffmpeg from the imageio-ffmpeg wheel.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$HERE; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done   # workspace root
OUT=the-shrinking-lie
LIB=${LIB:-${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}}; export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar folder (. pipeline/env.sh)"; exit 1; }
PY="$LIB/.venv/bin/python"
V=$(ffmpeg -version 2>/dev/null | head -1 | sed -n 's/^ffmpeg version n\{0,1\}\([0-9]*\).*/\1/p')
if [ -z "$V" ] || [ "$V" -lt 7 ]; then
  "$PY" -c "import imageio_ffmpeg" 2>/dev/null || "$PY" -m pip install -q imageio-ffmpeg
  mkdir -p "$HERE/.ffbin"; ln -sf "$("$PY" -c 'import imageio_ffmpeg as m; print(m.get_ffmpeg_exe())')" "$HERE/.ffbin/ffmpeg"
  PATH="$HERE/.ffbin:$PATH"; export PATH; echo "using $(ffmpeg -version | head -1)"
fi
mkdir -p "$HERE/out" "$HERE/final"
START=$(date +%s)
cd "$LIB"
[ -f "$HERE/voices/dur.json" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
[ -f "$HERE/voices/words.json" ] || "$PY" "$ROOT/pipeline/align_words.py" "$HERE"      # real word onsets for the captions
for L in vsco2ce vcsl karoryfer; do [ -d core/audio/instruments/$L ] || sh tools/fetch.sh instruments $L; done   # real-instrument samples (CC0 / CC BY), once
node core/render/events.mjs "$HERE" --size 1080x1920
"$PY" "$HERE/music.py"
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/final/$OUT.mp4" 24
echo "built final/$OUT.mp4 in $(( $(date +%s) - START )) s  (log this time in memory/LEARNINGS.md: local vs cloud render speed)"
