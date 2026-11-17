#!/bin/bash
# v3.2 week prep (cloud): for each line "project|dest" in <list>: lint -> fresh scenes -> audio mix (build/mix.flac) -> QA contact sheet (check/qa_N.png).
# Then look at every sheet, fix, re-run (only changed projects redo: a project is skipped when build/mix.flac is newer than story/shots.json, unless --force).
# usage: prep_week.sh [--force] <what-if dir> <list file>     (pack with pack_week.sh; the laptop renders with render/render-week.ps1)
T=$(cd "$(dirname "$0")" && pwd); LIBS=$T/../project/scenes
K=${KIT:-/home/claude/yt/lab/2026-11-09-growkaz-plugin-test/plugin/skills/make-2d-video/kit}
FORCE=0; [ "$1" = --force ] && { FORCE=1; shift; }; W=$(cd "$1" && pwd); L=$2; LOG=${LOG:-$W/render/prep.log}
grep -v '^#' "$L" | while IFS='|' read -r proj dest; do
  P="$W/$(echo $proj | xargs)"; [ -d "$P" ] || { echo "MISSING $proj" >> "$LOG"; continue; }
  if [ $FORCE = 0 ] && [ -f "$P/build/mix.flac" ] && [ "$P/build/mix.flac" -nt "$P/story/shots.json" ]; then echo "skip $proj" >> "$LOG"; continue; fi
  grep -q '"sOUT"' "$P/story/shots.json" || python3 "$T/add_outro.py" "$P" >> "$LOG"   # every video ends with the sign-off (A on Shorts, B/C/D on long-forms)
  if ! python3 "$T/lint_story.py" "$P" >> "$LOG" 2>&1; then echo "LINT-FAIL $proj" >> "$LOG"; continue; fi
  rm -rf "$P/scenes" && cp -r "$LIBS" "$P/scenes"
  (cd "$K" && python3 audio/mix.py --project "$P" > "$P/mix.log" 2>&1) && ffmpeg -v error -y -i "$P/build/mix.wav" -c:a flac "$P/build/mix.flac" && rm -f "$P/build/mix.wav" || { echo "MIX-FAIL $proj" >> "$LOG"; continue; }
  (cd "$K" && node render.mjs --project "$P" --sheet 1 --scale 0.3 > "$P/qa.log" 2>&1); mkdir -p "$P/check"; cp "$P"/build/sheets/*.png "$P/check/" 2>/dev/null
  grep -q "MISSING" "$P/qa.log" && echo "QA-MISSING-SHOT $proj" >> "$LOG" || echo "OK $proj $(ls "$P"/check/*.png 2>/dev/null | tr '\n' ' ')" >> "$LOG"
done
echo "PREP DONE" >> "$LOG"
