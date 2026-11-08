#!/bin/sh
# Index every track under library/music/ into catalog.json + CATALOG.md (length, tempo, key, loudness, energy curve, licence).
# Usage (WSL, workspace root): sh pipeline/music-catalog.sh
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); PY="${LEMO_OPUSCAR_HOME:-$ROOT/tools/lemo-opuscar}/.venv/bin/python"
"$PY" "$ROOT/pipeline/music_catalog.py" "$ROOT/library/music"
