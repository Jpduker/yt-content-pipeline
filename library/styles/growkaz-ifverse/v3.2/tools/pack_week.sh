#!/bin/bash
# v3.2: pack every project in <list> (after prep_week.sh) for the laptop: story, timeline, scenes, config, build/mix.flac, plus the render folder + kit engine.
# QUALITY GATE: refuses to pack if any project lacks a fresh check/GATE-OK (outro gate from prep_week.sh). Writes render/gate/ (spec, goldens, manifest) for the laptop gate.
# usage: pack_week.sh <what-if dir> <list file> <out.tgz>
T=$(cd "$(dirname "$0")" && pwd); W=$(cd "$1" && pwd); L=$(cd "$(dirname "$2")" && pwd)/$(basename "$2"); OUT=$3; REPO=$(cd "$W/../../.." && pwd); KIT=lab/2026-11-09-growkaz-plugin-test/plugin/skills/make-2d-video/kit
bad=0; while IFS='|' read -r proj dest <&3; do P="$W/$(echo $proj | xargs)"
  if ! { [ -f "$P/check/GATE-OK" ] && [ "$P/check/GATE-OK" -nt "$P/story/shots.json" ] && [ "$P/check/GATE-OK" -nt "$T/../outro/spec.json" ]; }; then echo "NOT GATED: $proj (run prep_week.sh, fix GATE-FAIL)"; bad=1; fi
done 3< <(grep -v '^#' "$L")
[ $bad = 1 ] && { echo "PACK REFUSED: every video must pass the outro gate first."; exit 1; }
G="$W/render/gate"; mkdir -p "$G/golden"; cp "$T/../outro/spec.json" "$G/spec.json"; cp "$T/../outro/golden/"*.png "$G/golden/"
python3 "$T/validate_outro.py" --manifest "$W" "$L" "$G/manifest-$(basename "$L" .txt).json" || exit 1
cd "$REPO"; F=$(mktemp)
grep -v '^#' "$L" | while IFS='|' read -r proj dest; do p="channels/stickman/what-if/$(echo $proj | xargs)"
  for x in config.json story timeline scenes build/mix.flac; do [ -e "$p/$x" ] && echo "$p/$x"; done; ls "$(dirname "$p")"/final/*.srt "$(dirname "$p")"/*.md 2>/dev/null; done | sort -u > "$F"
echo "channels/stickman/what-if/render" >> "$F"; for x in render.mjs package.json package-lock.json engine audio; do [ -e "$KIT/$x" ] && echo "$KIT/$x"; done >> "$F"
tar czf "$OUT" --exclude=__pycache__ -T "$F" && echo "packed $(wc -l < "$F") paths -> $OUT ($(du -h "$OUT" | cut -f1))"
