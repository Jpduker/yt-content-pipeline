#!/bin/sh
# C01 v3 "I Was Holding It for You" — LOCAL TEST (the reel audio is not licensed: never upload). From the workspace root:
#   sh channels/whispers/confessions/2026-11-08-c01-v3-i-was-holding-it-for-you/build.sh
# Picture = Vivek's 12 storyboard frames (vivek-cast sheets) shown exactly as drawn, cut on the narration's phrases.
# Audio = the reel's own track (voice + music) untouched: NO TTS (v2 stacked a second voice on top: never again).
set -e
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$HERE; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done
LIB=${LIB:-${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}}; export LIB; PY="$LIB/.venv/bin/python"
[ -f "$HERE/assets/S12.png" ] || python3 "$HERE/prep3.py" "$ROOT/channels/whispers/characters/vivek-cast" "$HERE/assets"
mkdir -p "$HERE/music" "$HERE/out"; A="$HERE/music/reel-audio__LOCAL-TEST.wav"
[ -f "$A" ] || ffmpeg -loglevel error -y -i "$ROOT/references/poetic-confessions/snapgram.io_hczccyti7j7g.mp3" -ar 48000 -ac 2 "$A"
cd "$LIB"; node "$HERE/export.mjs" "$HERE" "$LIB"
node core/render/video.mjs "$HERE" --fps 30 --workers ${WORKERS:-2} --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$A" "$HERE/out/c01-v3-i-was-holding-it-for-you__LOCAL-TEST.mp4" 30 0
