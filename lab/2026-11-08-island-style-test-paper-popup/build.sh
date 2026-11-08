#!/bin/sh
# Island style test "The Bottle That Lied" (9:16, 24 s). From the workspace root: sh lab/2026-11-08-island-style-test-paper-popup/build.sh
set -e
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$HERE; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done
LIB=${LIB:-${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}}; export LIB; PY="$LIB/.venv/bin/python"
[ -f "$LIB/core/tts/kokoro-v1.0-timed.onnx" ] || { "$PY" -c "import onnx" 2>/dev/null || "$PY" -m pip install -q onnx; "$PY" "$ROOT/pipeline/make_timed_kokoro.py" "$LIB"; }
[ -f "$HERE/voices/words.json" ] || (cd "$LIB" && "$PY" "$ROOT/pipeline/tts_timed.py" "$HERE/lines.json" "$HERE/voices")
cd "$LIB"; mkdir -p "$HERE/out"
node "$HERE/export.mjs" "$HERE" "$LIB"; "$PY" "$HERE/music.py"; "$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 30 --workers ${WORKERS:-2} --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/island-style-test-paper-popup.mp4" 30 0
echo "built out/island-style-test-paper-popup.mp4"
