#!/bin/bash
# growkaz-ifverse v3.1 render chain: lint -> render -> mix -> postcheck, one project after another.
# usage: render_chain.sh [--force] <project_dir>...   (run in the background with a 2 h timeout)
# - scenes/ is re-copied WHOLE from this style version before every render (never copy single
#   files into a project: a new gen.js with an old chars.js renders every shot as MISSING SHOT)
# - a project is skipped when its newest out/*.mp4 is newer than story/shots.json (unless --force)
# - writes <project>/check/ (contact sheets + postcheck.json); log: $LOG (default ./chain.log)
T=$(cd "$(dirname "$0")" && pwd); LIBS=$T/../project/scenes
K=${KIT:-/home/claude/yt/lab/2026-11-09-growkaz-plugin-test/plugin/skills/make-2d-video/kit}
LOG=${LOG:-$PWD/chain.log}; FORCE=0; [ "$1" = --force ] && { FORCE=1; shift; }
for P in "$@"; do
  P=$(cd "$P" && pwd)
  if [ $FORCE = 0 ] && ls "$P"/out/*.mp4 >/dev/null 2>&1 && [ "$(ls -t "$P"/out/*.mp4 | head -1)" -nt "$P/story/shots.json" ]; then echo "skip $P" >> "$LOG"; continue; fi
  if ! python3 "$T/lint_story.py" "$P" >> "$LOG" 2>&1; then echo "$(date +%H:%M) LINT-FAIL $P" >> "$LOG"; continue; fi
  rm -rf "$P/scenes" && cp -r "$LIBS" "$P/scenes"
  echo "$(date +%H:%M) start $P" >> "$LOG"
  rm -f "$P"/out/*.mp4
  if (cd "$K" && node render.mjs --project "$P" --workers 2 > "$P/render.log" 2>&1 && python3 audio/mix.py --project "$P" >> "$P/render.log" 2>&1); then
    python3 "$T/postcheck.py" "$P" | cut -c1-400 >> "$LOG"
  else echo "$(date +%H:%M) RENDER-FAIL $P (see render.log)" >> "$LOG"; fi
done
echo "$(date +%H:%M) ALL DONE" >> "$LOG"
