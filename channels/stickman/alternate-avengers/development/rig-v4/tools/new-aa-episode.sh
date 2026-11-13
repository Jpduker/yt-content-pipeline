#!/bin/sh
# Scaffold a new Alternate Avengers Short from the AA01 reference implementation.
#   sh channels/stickman/alternate-avengers/development/rig-v4/tools/new-aa-episode.sh aa02-<slug>
set -eu
SERIES="$(cd "$(dirname "$0")/../../.." && pwd)"
SRC="$SERIES/episodes/2026-11-12-aa01-doom-saves-the-multiverse-short-test"
[ $# -eq 1 ] || { echo "usage: new-aa-episode.sh <code>-<slug>"; exit 2; }
DST="$SERIES/episodes/$(date +%Y-%m-%d)-$1"
[ -e "$DST" ] && { echo "exists: $DST"; exit 1; }
mkdir -p "$DST/audio" "$DST/final" "$DST/out"
for f in film.js voice.py score.py render.mjs build.sh index.html package.json; do cp "$SRC/$f" "$DST/$f"; done
ln -s ../../development/rig-v4/node_modules "$DST/node_modules"
cat > "$DST/SCRIPT.md" <<'MD'
# <CODE> — <working title>
Status: draft. Unofficial fan fiction. Fill the beat table, then edit LINES in voice.py to match exactly.
| # | Speaker | Line | Visual beat | Hands/props (who holds what) |
|---|---|---|---|---|
MD
echo "Scaffolded $DST"
echo "Next: write SCRIPT.md, then follow workflows/alternate-avengers-short.md from step 3."
echo "film.js/score.py are AA01's: REPLACE the scenes and timing constants; keep the structure."
