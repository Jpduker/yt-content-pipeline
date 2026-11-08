#!/bin/sh
# FIRST thing on every prompt (team rule): get the other person's work.
cd "$(dirname "$0")/.." || exit 1
git fetch -q origin main && git pull -q --rebase --autostash origin main && git log --oneline -3
