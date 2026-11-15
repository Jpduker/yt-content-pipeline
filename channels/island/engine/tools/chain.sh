#!/bin/bash
# Island render chain: for each Short dir → timeline → stills sheet → mix → render (9:16) → mux (loudnorm −14) → final/ → PUBLISH.md. One log line per video.
# usage (from the lemo-opuscar root): styles/island-engine/tools/chain.sh <dir>...   env: SIZE=720x1280 FPS=24 WORKERS=2 LOG=chain.log
T=$(cd "$(dirname "$0")" && pwd); LIB=$PWD; PY=$LIB/.venv/bin/python; SIZE=${SIZE:-720x1280}; FPS=${FPS:-24}; WK=${WORKERS:-2}; LOG=${LOG:-$PWD/chain.log}
for D in "$@"; do
  D=$(cd "$D" && pwd); C=$(python3 -c "import json;print(json.load(open('$D/short.json'))['code'])"); B=$(basename "$D")
  [ -f "$D/voices/dur.json" ] || "$PY" core/tts/tts.py "$D/lines.json" "$D/voices" > "$D/voices/tts.log" 2>&1
  python3 "$T/timeline.py" "$D" >> "$LOG" 2>&1 || { echo "$(date +%H:%M) $C TIMELINE-FAIL" >> "$LOG"; continue; }
  mkdir -p "$D/out" "$D/final" "$D/check"
  if [ -f "$D/final/$B.mp4" ] && [ "$D/final/$B.mp4" -nt "$D/timeline.json" ] && [ -z "$FORCE" ]; then echo "$(date +%H:%M) $C skip (final newer)" >> "$LOG"; continue; fi
  echo "$(date +%H:%M) $C start" >> "$LOG"
  "$PY" "$T/mix.py" "$D" >> "$D/out/chain.log" 2>&1 || { echo "$(date +%H:%M) $C MIX-FAIL" >> "$LOG"; continue; }
  node core/render/video.mjs "$D" --fps $FPS --workers $WK --size $SIZE --q 'ss=1' --out "$D/out/video.mp4" > "$D/out/render.log" 2>&1 || { echo "$(date +%H:%M) $C RENDER-FAIL" >> "$LOG"; continue; }
  M=$(ffmpeg -v info -i "$D/out/mix.wav" -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
  read I TP LRA TH OFF <<< "$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")"
  ffmpeg -v error -y -i "$D/out/video.mp4" -i "$D/out/mix.wav" -af "loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$D/final/$B.mp4"
  ffmpeg -v error -y -i "$D/final/$B.mp4" -vf "fps=1/3,scale=270:-1,tile=8x2" "$D/check/contact.jpg"
  python3 "$T/publish.py" "$D" >> "$D/out/chain.log" 2>&1
  LU=$(ffmpeg -i "$D/final/$B.mp4" -af ebur128 -f null - 2>&1 | grep -A1 Integrated | tail -1 | awk '{print $2}'); DU=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/final/$B.mp4")
  echo "$(date +%H:%M) $C OK ${DU%.*}s ${LU} LUFS → final/$B.mp4" >> "$LOG"
done
echo "$(date +%H:%M) ALL DONE" >> "$LOG"
