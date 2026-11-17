#!/bin/bash
# v3.2: pack every project in <list> (after prep_week.sh) for the laptop: story, timeline, scenes, config, build/mix.flac, plus the render folder + kit engine.
# usage: pack_week.sh <what-if dir> <list file> <out.tgz>
W=$(cd "$1" && pwd); L=$2; OUT=$3; REPO=$(cd "$W/../../.." && pwd); KIT=lab/2026-11-09-growkaz-plugin-test/plugin/skills/make-2d-video/kit
cd "$REPO"; F=$(mktemp)
grep -v '^#' "$L" | while IFS='|' read -r proj dest; do p="channels/stickman/what-if/$(echo $proj | xargs)"
  for x in config.json story timeline scenes build/mix.flac; do [ -e "$p/$x" ] && echo "$p/$x"; done; done > "$F"
echo "channels/stickman/what-if/render" >> "$F"; for x in render.mjs package.json package-lock.json engine audio; do [ -e "$KIT/$x" ] && echo "$KIT/$x"; done >> "$F"
tar czf "$OUT" --exclude=__pycache__ -T "$F" && echo "packed $(wc -l < "$F") paths -> $OUT ($(du -h "$OUT" | cut -f1))"
