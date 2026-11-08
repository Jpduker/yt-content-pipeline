#!/bin/sh
# One-command build for Chapter 1 + its 3 riddle Shorts (WSL / Linux). Needs lemo-opuscar (LIB) with its .venv, Kokoro voice, librosa, ffmpeg.
#   from the workspace root:  . pipeline/env.sh; sh "channels/island/chapters/2026-11-08-ch01-twelve-seconds-of-dark/build.sh"
#   only the chapter:  SHORTS=0 sh build.sh      ·  re-voice after a script edit: delete voices/ first
# Picture = film.js (16:9 1920x1080, 30 fps) and ?short=N (9:16 1080x1920). Audio = Kokoro am_michael + music.py (real instruments) + mix.py.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$HERE; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done
OUT=keepers-island-ch01-twelve-seconds-of-dark; FPS=30; WK=${WORKERS:-3}
LIB=${LIB:-${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}}; export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar folder (. pipeline/env.sh)"; exit 1; }
PY="$LIB/.venv/bin/python"
V=$(ffmpeg -version 2>/dev/null | head -1 | sed -n 's/^ffmpeg version n\{0,1\}\([0-9]*\).*/\1/p')
if [ -z "$V" ] || [ "$V" -lt 7 ]; then
  "$PY" -c "import imageio_ffmpeg" 2>/dev/null || "$PY" -m pip install -q imageio-ffmpeg
  mkdir -p "$HERE/.ffbin"; ln -sf "$("$PY" -c 'import imageio_ffmpeg as m; print(m.get_ffmpeg_exe())')" "$HERE/.ffbin/ffmpeg"
  PATH="$HERE/.ffbin:$PATH"; export PATH; echo "using $(ffmpeg -version | head -1)"
fi
mkdir -p "$HERE/out" "$HERE/final"; START=$(date +%s); cd "$LIB"
echo "1/7 voices";  [ -f "$HERE/voices/dur.json" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
echo "2/7 words";   [ -f "$HERE/voices/words.json" ] || "$PY" "$ROOT/pipeline/align_words.py" "$HERE"
for L in vsco2ce vcsl karoryfer; do [ -d core/audio/instruments/$L ] || sh tools/fetch.sh instruments $L; done
echo "3/7 timeline (lines pushed late are listed as notes)"; node "$HERE/export.mjs" "$HERE" "$LIB"
echo "4/7 score";   "$PY" "$HERE/music.py"
echo "5/7 mix";     "$PY" "$HERE/mix.py"
echo "6/7 picture (≈9400 frames; long)"
node core/render/video.mjs "$HERE" --fps $FPS --workers $WK --size 1920x1080 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/final/$OUT.mp4" $FPS 0
"$PY" core/render/srt.py "$HERE/out/cues.json" "$HERE/final/$OUT.srt"; cp "$HERE/out/chapters.txt" "$HERE/final/$OUT-chapters.txt"
if [ "${SHORTS:-1}" != 0 ]; then
  echo "7/7 shorts"; "$PY" "$HERE/shorts_mix.py"
  for N in 1 2 3; do
    node core/render/video.mjs "$HERE" --fps $FPS --workers $WK --size 1080x1920 --q "short=$N" --out "$HERE/out/short$N.mp4"
    sh core/render/mux.sh "$HERE/out/short$N.mp4" "$HERE/out/short$N.wav" "$HERE/final/$OUT-short$N-riddle$N.mp4" $FPS 0
  done
fi
echo "built in $(( $(date +%s) - START )) s → final/  (log the time in memory/LEARNINGS.md)"
