#!/bin/bash
# v3.2 week prep (cloud): for each line "project|dest" in <list>: lint -> fresh scenes -> audio mix (build/mix.flac) -> QA contact sheet (check/qa_N.png).
# Then look at every sheet + check/outro_proof.png, fix, re-run (a project is skipped only while check/GATE-OK is newer than its timeline and the outro spec, unless --force).
# Every project goes through the outro gate (validate_outro.py: timeline, mix, rendered proof frame vs approved golden). pack_week.sh refuses projects without a fresh GATE-OK.
# usage: prep_week.sh [--force] <what-if dir> <list file>     (pack with pack_week.sh; the laptop renders with render/render-week.ps1)
T=$(cd "$(dirname "$0")" && pwd); LIBS=$T/../project/scenes
K=${KIT:-/home/claude/yt/lab/2026-11-09-growkaz-plugin-test/plugin/skills/make-2d-video/kit}
FORCE=0; [ "$1" = --force ] && { FORCE=1; shift; }; W=$(cd "$1" && pwd); L=$2; LOG=${LOG:-$W/render/prep.log}
while IFS='|' read -r proj dest <&3; do   # list on fd 3: ffmpeg/node/python must not eat the loop's stdin
  P="$W/$(echo $proj | xargs)"; [ -d "$P" ] || { echo "MISSING $proj" >> "$LOG"; continue; }
  if [ $FORCE = 0 ] && [ -f "$P/build/mix.flac" ] && [ "$P/check/GATE-OK" -nt "$P/story/shots.json" ] && [ "$P/check/GATE-OK" -nt "$T/../outro/spec.json" ]; then echo "skip $proj" >> "$LOG"; echo "OK $proj" >> "$LOG"; continue; fi
  # every video ends with the APPROVED outro (outro/spec.json). Re-applied every time (idempotent); a Short too long for it FAILS here.
  python3 "$T/validate_outro.py" "$P" > /dev/null 2>&1 || { python3 "$T/add_outro.py" "$P" >> "$LOG" || { echo "OUTRO-FAIL $proj (story too long for the approved outro: cut story)" >> "$LOG"; continue; }; }
  if ! python3 "$T/lint_story.py" "$P" >> "$LOG" 2>&1; then echo "LINT-FAIL $proj" >> "$LOG"; continue; fi
  rm -rf "$P/scenes" && cp -r "$LIBS" "$P/scenes"
  mkdir -p "$P/build"; (cd "$K" && python3 audio/mix.py --project "$P" > "$P/mix.log" 2>&1) && ffmpeg -nostdin -v error -y -i "$P/build/mix.wav" -c:a flac "$P/build/mix.flac" && rm -f "$P/build/mix.wav" || { echo "MIX-FAIL $proj" >> "$LOG"; continue; }
  mkdir -p "$P/check"
  if [ "${QA:-1}" = 1 ]; then   # QA=0: outro/audio-only change, story frames untouched -> skip the contact sheet
    (cd "$K" && node render.mjs --project "$P" --sheet 1 --scale 0.3 > "$P/qa.log" 2>&1); cp "$P"/build/sheets/*.png "$P/check/" 2>/dev/null
    if grep -q "MISSING" "$P/qa.log"; then echo "QA-MISSING-SHOT $proj" >> "$LOG"; continue; fi
  fi
  # GATE: timeline + mix + rendered outro frame vs approved golden. Anything else is not packable.
  G=$(cd "$K" && python3 "$T/validate_outro.py" "$P" --mix --render "$K" 2>&1 | tail -1); echo "$G" >> "$LOG"
  rm -f "$P/check/GATE-OK"; case "$G" in GATE-OK*) echo "$G" > "$P/check/GATE-OK"; echo "OK $proj" >> "$LOG";; *) echo "GATE-FAIL $proj" >> "$LOG";; esac
done 3< <(grep -v '^#' "$L")
echo "PREP DONE" >> "$LOG"
