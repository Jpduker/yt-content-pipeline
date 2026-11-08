#!/bin/sh
# Chatterbox (Resemble AI, MIT) emotional TTS. Run ONCE inside WSL Ubuntu from the workspace root:
#   sh tools/chatterbox/setup.sh
# Makes tools/chatterbox/.venv (Python 3.11, as upstream tests on 3.11) and installs chatterbox-tts + CUDA torch.
# GTX 1650 has 4 GB: the 350M "Turbo" model is the safer fit; the 500M original has the `exaggeration` knob.
# Neither VRAM figure is published; if CUDA runs out of memory, speak.py falls back to CPU (slow but works).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
cd "$HERE"
uv venv --python 3.11 .venv
. .venv/bin/activate
uv pip install chatterbox-tts soundfile numpy
python - <<'PY'
import torch; print('torch', torch.__version__, 'cuda:', torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else '')
PY
echo "OK. Test:  tools/chatterbox/.venv/bin/python tools/chatterbox/speak.py tools/chatterbox/test-lines.json /tmp/cb-test"
