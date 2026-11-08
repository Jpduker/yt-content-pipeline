#!/bin/sh
# One-command build. Needs the lemo-opuscar library (LIB) with its core + voice tiers and librosa, and ffmpeg 7+.
#   LIB=/path/to/lemo-opuscar sh build.sh        (in our workspace: . pipeline/env.sh; LIB=$LEMO_OPUSCAR_HOME sh build.sh)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$HERE; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done   # workspace root
LIB=${LIB:-${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}}; export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar folder"; exit 1; }
PY="$LIB/.venv/bin/python"
cd "$LIB"
[ -f "$HERE/voices/dur.json" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
node core/render/events.mjs "$HERE" --size 1080x1920
"$PY" "$HERE/music.py"
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/lighthouse-switches.mp4" 24
