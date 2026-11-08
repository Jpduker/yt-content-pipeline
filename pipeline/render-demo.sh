#!/bin/sh
# Render lemo's cel-anime-80s demo on THIS machine and time it.
#   sh pipeline/render-demo.sh      -> lab/<date>-demo-local/final/demo-local.mp4
# Watch the first lines: "[note] WebGL runs on software rendering" means Chrome is not using the GPU.
set -e
cd "$(dirname "$0")/.."; . pipeline/env.sh
ROOT=$(pwd); PY="$LEMO_OPUSCAR_HOME/.venv/bin/python"; S="$LEMO_OPUSCAR_HOME/styles/cel-anime-80s"
OUT="$ROOT/lab/$(date +%F)-demo-local/final/demo-local.mp4"; mkdir -p "$(dirname "$OUT")"
cd "$S"
if [ ! -f demo/voices/d1.wav ]; then "$PY" ../../core/tts/tts.py demo/lines.json demo/voices; git checkout -q -- demo/voices/dur.json; fi
"$PY" demo/music/score.py
"$PY" demo/mix.py
W=$(nproc); [ "$W" -gt 4 ] && W=4
t0=$(date +%s)
node ../../core/render/video.mjs demo --fps 24 --workers "$W" --out demo/out/video24.mp4
t1=$(date +%s)
sh demo/tools/mux.sh demo/out/video24.mp4 demo/mix.wav "$OUT" 24
echo "RENDER: 1416 frames in $((t1-t0)) s with $W workers  =>  $(awk "BEGIN{printf \"%.2f\", ($t1-$t0)*$W/1416}") s/frame/worker"
echo "Saved: $OUT  (log this in memory/LEARNINGS.md)"
