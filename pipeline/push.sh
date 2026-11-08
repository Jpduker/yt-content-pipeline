#!/bin/sh
# After EVERY change (team rule): commit to main and push immediately. Usage: sh pipeline/push.sh "what changed"
cd "$(dirname "$0")/.." || exit 1
[ -n "$1" ] || { echo 'usage: sh pipeline/push.sh "message"'; exit 2; }
git add -A
git diff --cached --quiet && { echo "nothing to commit"; exit 0; }
git commit -q -m "$1" && git pull -q --rebase --autostash origin main && git push -q origin main && git log --oneline -1
