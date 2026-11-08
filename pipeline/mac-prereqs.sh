#!/bin/sh
# macOS prerequisites (JP). Needs Homebrew (https://brew.sh). Then: sh pipeline/get-tools.sh && bash pipeline/setup.sh
set -e
brew install git node ffmpeg uv python@3.12 gh
ffmpeg -version | head -1; node -v
echo "Log in to GitHub once:  gh auth login   (then: gh auth setup-git)"
