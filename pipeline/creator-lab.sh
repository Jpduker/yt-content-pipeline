#!/bin/sh
# Run tools/creator-lab with OUR key file (research/creator-lab/.env) so the upstream clone stays untouched.
# Usage: sh pipeline/creator-lab.sh [doctor|start]     (needs Node 22.9+ and ffmpeg/ffprobe on PATH; run inside WSL)
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd); ENV="$ROOT/research/creator-lab/.env"
[ -f "$ENV" ] || { echo "create $ENV from research/creator-lab/.env.example and add your keys first"; exit 1; }
cp "$ENV" "$ROOT/tools/creator-lab/.env"          # creator-lab reads .env from its own folder (git-ignored there)
cd "$ROOT/tools/creator-lab"
case "${1:-start}" in doctor) npm run doctor ;; start) npm start ;; *) echo "usage: sh pipeline/creator-lab.sh [doctor|start]" ;; esac
