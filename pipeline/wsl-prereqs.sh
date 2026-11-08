#!/bin/bash
# One-time system prerequisites inside WSL Ubuntu-24.04. Asks for your Ubuntu (sudo) password.
#   bash pipeline/wsl-prereqs.sh
set -e
cd "$(dirname "$0")/.."; mkdir -p logs; LOG="logs/prereqs-$(date +%F-%H%M).log"; exec > >(tee -a "$LOG") 2>&1; echo "log: $LOG"
echo "== apt basics"; sudo apt-get update -qq
sudo apt-get install -y -qq curl git xz-utils python3 python3-venv python3-pip ca-certificates >/dev/null
echo "== Node.js 22 (lemo needs 20+)"
if ! node -v 2>/dev/null | grep -qE '^v(2[0-9]|[3-9][0-9])\.'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null
  sudo apt-get install -y -qq nodejs >/dev/null
fi; node -v
echo "== ffmpeg 7+ (Ubuntu 24.04's apt ffmpeg is 6.x, so use a static build)"
if ! ffmpeg -version 2>/dev/null | head -1 | grep -qE 'version n?([7-9]|[1-9][0-9])\.'; then
  t=$(mktemp -d); curl -fL -o "$t/ff.tar.xz" https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
  tar xf "$t/ff.tar.xz" -C "$t"; sudo cp "$t"/ffmpeg-*-static/ffmpeg "$t"/ffmpeg-*-static/ffprobe /usr/local/bin/; rm -rf "$t"
fi; echo "ffmpeg at: $(command -v ffmpeg)"; ls -l /usr/local/bin/ffmpeg; ffmpeg -version | head -1
echo "== uv (lemo uses it to build a Python 3.12 venv)"
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
echo "== system libraries headless Chrome needs"
sudo npx --yes playwright@1.49.1 install-deps chromium || echo "WARN: Chrome system libraries step failed (see log); renders may still work"
echo "PREREQS DONE. Open a NEW WSL terminal, then: bash pipeline/setup.sh"
