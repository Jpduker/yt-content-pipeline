#!/bin/sh
# Render one Island Short on this machine (GPU host or cloud). From the workspace root: . pipeline/env.sh; sh channels/island/shorts/build.sh channels/island/shorts/<dir>
# env: SIZE=1080x1920 FPS=30 WORKERS=3. Needs tools/lemo-opuscar with .venv (kokoro, librosa, soundfile) and `npm install` done in it.
set -e; D=$(cd "$1" && pwd); ROOT=$D; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done
LIB=${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}; rm -rf "$LIB/styles/island-engine"; cp -r "$ROOT/channels/island/engine" "$LIB/styles/island-engine"
mkdir -p "$LIB/styles/island-engine/fonts"; cp "$ROOT/library/fonts/cinzel-cormorant/"*.ttf "$LIB/styles/island-engine/fonts/"; cp "$ROOT/channels/island/engine/fonts.css" "$LIB/styles/island-engine/fonts/fonts.css"
cp "$LIB/styles/island-engine/index.html" "$D/index.html"
cd "$LIB"; SIZE=${SIZE:-1080x1920} FPS=${FPS:-30} WORKERS=${WORKERS:-3} LOG=${LOG:-$D/out/chain.log} FORCE=1 sh styles/island-engine/tools/chain.sh "$D"; tail -2 "$D/out/chain.log"
