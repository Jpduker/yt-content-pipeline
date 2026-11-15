#!/bin/sh
# Proof 01 "Twelve Seconds" · The Keeper's Island in the 2.5D Pixel Art engine. Run from the workspace root after `. pipeline/env.sh`.
# Picture renders need a GPU host (Windows-native Node + Chrome, or a Mac with LEMO_ANGLE=metal); in the cloud it is ≈5 s/frame at 720p.
set -e; HERE=$(cd "$(dirname "$0")" && pwd); LIB=${LEMO_OPUSCAR_HOME:?run . pipeline/env.sh}; PY="$LIB/.venv/bin/python"; FPS=${FPS:-30}; SIZE=${SIZE:-1920x1080}; Q=${Q:-}
cd "$LIB"; mkdir -p "$HERE/out" "$HERE/final"
[ -f "$HERE/voices/n1.wav" ] || "$PY" core/tts/tts.py "$HERE/lines.json" "$HERE/voices"
LEMO_OPUSCAR_HOME="$LIB" "$PY" "$HERE/mix.py"
node core/render/still.mjs "$HERE" 6 15 19.5 27.5 --size 1280x720 --q 'ss=1' --out "$HERE/out/review"      # read these before the render
node core/render/video.mjs "$HERE" --fps $FPS --workers ${WORKERS:-3} --size $SIZE ${Q:+--q "$Q"} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/final/keepers-island-proof01-twelve-seconds.mp4" $FPS 0
