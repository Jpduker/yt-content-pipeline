#!/bin/sh
# C01 "You stole my heart" v2 — LOCAL TEST build (WSL or Mac). The music is a reel copy with no licence: the output goes to out/ with
# LOCAL-TEST in its name and must never be uploaded. Voice: Chatterbox (tools/chatterbox, ref library/voices/refs/him.wav,
# emotion 0.6) if installed, else Kokoro am_echo 0.85.   Run: . pipeline/env.sh; sh "channels/whispers/confessions/2026-11-08-c01-you-stole-my-heart/build.sh"
# Optional better depth: sh prep_wsl.sh (rembg + Depth-Anything) before this; otherwise prep.py's pseudo-depth is used.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
[ -f "$HERE/CLOUD-BUILDING" ] && [ -z "$FORCE" ] && { echo "SKIP: this video is being built in the cloud session (delete CLOUD-BUILDING or FORCE=1 to build here)"; exit 0; }
ROOT=$HERE; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done
LIB=${LIB:-${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}}; export LIB; PY="$LIB/.venv/bin/python"
OUT="c01-you-stole-my-heart-v2__LOCAL-TEST"
V=$(ffmpeg -version 2>/dev/null | head -1 | sed -n 's/^ffmpeg version n\{0,1\}\([0-9]*\).*/\1/p')
if [ -z "$V" ] || [ "$V" -lt 7 ]; then
  "$PY" -c "import imageio_ffmpeg" 2>/dev/null || "$PY" -m pip install -q imageio-ffmpeg
  mkdir -p "$HERE/.ffbin"; ln -sf "$("$PY" -c 'import imageio_ffmpeg as m; print(m.get_ffmpeg_exe())')" "$HERE/.ffbin/ffmpeg"
  PATH="$HERE/.ffbin:$PATH"; export PATH; echo "using $(ffmpeg -version | head -1)"
fi
mkdir -p "$HERE/out"
M="$HERE/music/caribbean-blue__LOCAL-TEST.wav"; mkdir -p "$HERE/music"
[ -f "$M" ] || ffmpeg -loglevel error -y -i "$ROOT/library/music/local-test-only/caribbean-blue-orchestral__from-reel-hczccyti7j7g.mp3" -ar 48000 -ac 2 "$M"
# v2: shots + face rig (eyes/mouth/head landmarks) from Vivek's sheets (private, not in git: needs channels/whispers/characters/vivek-cast)
[ -f "$HERE/assets/rig.json" ] || "$PY" "$HERE/prep2.py" "$ROOT/channels/whispers/characters/vivek-cast"
# v2: Kokoro with REAL phoneme timings (exact captions + lip sync). Chatterbox has no timings yet, so it is not used for this piece.
[ -f "$LIB/core/tts/kokoro-v1.0-timed.onnx" ] || { "$PY" -c "import onnx" 2>/dev/null || "$PY" -m pip install -q onnx; "$PY" "$ROOT/pipeline/make_timed_kokoro.py" "$LIB"; }
[ -f "$HERE/voices/phonemes.json" ] || (cd "$LIB" && LIB="$LIB" "$PY" "$ROOT/pipeline/tts_timed.py" "$HERE/lines.json" "$HERE/voices")
[ -f "$HERE/voices/words.json" ] || "$PY" "$ROOT/pipeline/align_words.py" "$HERE"
cd "$LIB"
node "$HERE/export.mjs" "$HERE" "$LIB"
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 30 --workers ${WORKERS:-2} --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/$OUT.mp4" 30 0
echo "built out/$OUT.mp4 (LOCAL TEST — not for upload)"
