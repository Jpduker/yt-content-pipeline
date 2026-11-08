#!/bin/sh
# ONE-TIME (Vivek, WSL): turn this folder into the shared repo and push the first commit as VivekSai07.
#   cd "/mnt/c/Users/Vivek Sai/Downloads/YouTube" && sh pipeline/git-first-push.sh
set -e
cd "$(dirname "$0")/.."
command -v gh >/dev/null || { echo "Install GitHub CLI first: sudo apt install -y gh   (then re-run)"; exit 1; }
gh auth status >/dev/null 2>&1 || gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
[ -d .git ] || git init -q -b main
git config user.name "VivekSai07"
git config user.email "viveksaisurya07@gmail.com"
git config core.autocrlf input
git config pull.rebase true
git remote get-url origin >/dev/null 2>&1 || git remote add origin https://github.com/Jpduker/yt-content-pipeline.git
git fetch -q origin 2>/dev/null || true
git add -A
echo "== files going up: $(git diff --cached --name-only | wc -l), size: $(git diff --cached --name-only -z | xargs -0 du -ch 2>/dev/null | tail -1 | cut -f1)"
git commit -q -m "Initial import: studio pipeline, channels, docs, memory (media and upstream tools excluded)"
if git rev-parse -q --verify origin/main >/dev/null; then git pull -q --rebase origin main; fi
git push -u origin main
git log --oneline -1
