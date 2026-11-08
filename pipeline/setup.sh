#!/bin/bash
# One-time setup. Run from this folder inside WSL (Ubuntu):  bash pipeline/setup.sh
# Why WSL: lemo-opuscar's Python tooling assumes a Linux/macOS virtualenv (.venv/bin/python),
# so native Windows / Git Bash breaks at the venv step.
# Needs inside WSL: Node 20+, ffmpeg 7+, Python 3.11-3.13 (or uv), git.
set -e
cd "$(dirname "$0")/.."
mkdir -p logs; LOG="logs/setup-$(date +%F-%H%M).log"; exec > >(tee -a "$LOG") 2>&1; echo "log: $LOG"
. pipeline/env.sh
export PATH="$HOME/.local/bin:/usr/local/bin:$PATH"
command -v ffmpeg >/dev/null || { echo "STOP: ffmpeg not found on PATH ($PATH). Run: bash pipeline/wsl-prereqs.sh"; exit 1; }
echo "== versions"; node -v; ffmpeg -version | head -1; (python3 --version || true)
echo "== lemo-opuscar deps (core + Kokoro voice + music). The voice model is already in tools/lemo-opuscar/core/tts."
sh tools/lemo-opuscar/plugin/skills/lemo-opuscar/scripts/setup.sh deps voice music
echo "== extras the demo mixes need (lemo lists librosa as maintainer-only)"
PY="$LEMO_OPUSCAR_HOME/.venv/bin/python"
if command -v uv >/dev/null; then uv pip install --quiet --python "$PY" librosa; else "$PY" -m pip install --quiet librosa; fi
echo "== demo fonts (OFL, not in git) for cel-anime-80s"
cp library/fonts/*.ttf tools/lemo-opuscar/styles/cel-anime-80s/demo/fonts/
echo "== hyperframes telemetry off"; npx --yes hyperframes telemetry disable || true
sh pipeline/sync-skills.sh
echo "Setup done. Open Claude Code in this folder."
