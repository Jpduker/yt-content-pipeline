#!/bin/sh
# Builds the three videos from session 2 in one go (WSL): Island CH01 (+3 Shorts), Floor Minus Ep1 (+3 Shorts), Whispers C01 (LOCAL TEST).
# Voices/words already made are reused. Run from the YouTube folder:   sh pipeline/build-session2.sh
# Each build is independent: if one fails, the others still run; a summary is printed at the end.
cd "$(dirname "$0")/.." || exit 1
. pipeline/env.sh
LOG=logs/build-session2-$(date +%Y%m%d-%H%M).log; mkdir -p logs
ok=""; bad=""
for B in "channels/island/chapters/2026-11-08-ch01-twelve-seconds-of-dark" "channels/stickman/floor-minus/2026-11-08-ep01-day-1-to-day-3" "channels/whispers/confessions/2026-11-08-c01-you-stole-my-heart"; do
  echo "=== $B" | tee -a "$LOG"
  { sh "$B/build.sh"; echo $? > "$LOG.rc"; } 2>&1 | tee -a "$LOG"; rc=$(cat "$LOG.rc"); if [ "$rc" -eq 0 ]; then ok="$ok\n  ✓ $B"; else bad="$bad\n  ✗ $B (exit $rc)"; fi
done
printf "\nDone.%b%b\nFull log: %s\n" "$ok" "$bad" "$LOG"
