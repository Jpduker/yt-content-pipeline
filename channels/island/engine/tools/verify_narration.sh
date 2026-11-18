#!/bin/bash
# Word-for-word narration check with Whisper (faster-whisper), run on Vivek's PC in WSL (the cloud cannot download Whisper models).
# For every Short/chapter folder given (default: all Island Shorts + intro + test), each narration line's audio is transcribed and must match
# its script text exactly (punctuation/case ignored; numbers 0-999 match their words). Report: channels/island/NARRATION-CHECK.md
# Usage (WSL, from the repo root):  bash channels/island/engine/tools/verify_narration.sh [folder ...]
set -u; ROOT="$(pwd)"; LIB="$ROOT/tools/lemo-opuscar"; REP="$ROOT/channels/island/NARRATION-CHECK.md"
python3 -c "import faster_whisper" 2>/dev/null || python3 -m pip install --user --break-system-packages -q faster-whisper || { echo "pip install faster-whisper failed"; exit 2; }
DIRS=("$@"); [ ${#DIRS[@]} -eq 0 ] && DIRS=(channels/island/intro/*s00*/ channels/island/shorts/2026-*/ channels/island/test/*/)
echo "# Narration check (Whisper base.en) · $(date '+%Y-%m-%d %H:%M')" > "$REP"; echo >> "$REP"; fails=0
for d in "${DIRS[@]}"; do
  [ -f "$d/lines.json" ] || continue
  out=$(python3 "$LIB/core/tts/asr_check.py" "$d/lines.json" "$d/voices" --lang en --model base.en 2>&1); rc=$?
  name=$(basename "$d"); if [ $rc -eq 0 ]; then echo "- OK  $name" >> "$REP"; else fails=$((fails+1)); echo "- **FAIL $name**" >> "$REP"; echo '```' >> "$REP"; echo "$out" | grep -v "^OK" | tail -20 >> "$REP"; echo '```' >> "$REP"; fi
  echo "$name rc=$rc"
done
echo; echo "$fails folder(s) with mismatches -> $REP"
