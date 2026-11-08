#!/bin/sh
# Pull the latest of every tool, then re-sync skills. tools/ holds untouched upstream copies.
set -e
cd "$(dirname "$0")/.."
for d in tools/*/; do d=${d%/}; [ -d "$d/.git" ] || continue
  printf "%-32s" "$d"; git -C "$d" fetch -q --depth 1 origin HEAD && git -C "$d" reset -q --hard FETCH_HEAD && git -C "$d" rev-parse --short HEAD
done
sh pipeline/sync-skills.sh
