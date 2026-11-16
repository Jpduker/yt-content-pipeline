#!/bin/bash
cd "$(dirname "$0")/../.."
for f in shorts/2026-11-1*-s*/final/2026-*.mp4 shorts/2026-11-2[0-2]-s*/final/2026-*.mp4 long/2026-11-22-ch01*/final/*.mp4; do
  n=$(basename "$f" .mp4 | cut -c12-16)
  ffmpeg -nostats -hide_banner -i "$f" -vf "blackdetect=d=0.3:pix_th=0.06,freezedetect=n=0.002:d=2.5,fps=1/2.5,scale=-2:240,tile=12x2" -af ebur128=peak=true -frames:v 1 -update 1 -y "qa/week1/$n.jpg" > "qa/week1/$n.log" 2>&1 || true
  if [[ $n == ch01* ]]; then ffmpeg -nostats -hide_banner -i "$f" -vf "fps=1/6,scale=-2:150,tile=10x10" -frames:v 1 -update 1 -y "qa/week1/ch01-sheet.jpg" > /dev/null 2>&1; fi
  echo "$n done" >> qa/week1/progress.txt
done
echo ALLDONE >> qa/week1/progress.txt
