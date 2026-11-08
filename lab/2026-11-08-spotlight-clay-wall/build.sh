#!/bin/sh
# One-command local build (WSL). v2: narration + synced captions: events -> score -> foley mix -> video -> mux.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$HERE; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done
LIB=${LIB:-${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}}; export LIB; PY="$LIB/.venv/bin/python"
mkdir -p "$HERE/out" "$HERE/final"; START=$(date +%s); cd "$LIB"
[ -f "$HERE/voices/dur.json" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
[ -f "$HERE/voices/words.json" ] || "$PY" "$ROOT/pipeline/align_words.py" "$HERE"
for L in vsco2ce salamander; do [ -d core/audio/instruments/$L ] || sh tools/fetch.sh instruments $L; done
node core/render/events.mjs "$HERE" --size 1080x1920
"$PY" "$HERE/music.py"; "$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/final/the-wall-of-im-fine-v2.mp4" 24
echo "built in $(( $(date +%s) - START )) s (log it in memory/LEARNINGS.md: local vs cloud)"
