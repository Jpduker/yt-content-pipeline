#!/bin/sh
# AA01 one-command build: voices -> score/mix -> picture -> mux. Re-runnable; voices are cached in audio/.
set -eu
cd "$(dirname "$0")"
[ -d node_modules ] || ln -s ../../development/rig-v4/node_modules node_modules
[ -d ../../development/rig-v4/node_modules ] || (cd ../../development/rig-v4 && npm install --ignore-scripts --no-audit --no-fund)
python3 voice.py
python3 score.py
mkdir -p out final
node render.mjs --film film.js --f0 0   --f1 320  --out out/seg0.mp4
node render.mjs --film film.js --f0 320 --f1 99999 --out out/seg1.mp4
printf "file 'seg0.mp4'\nfile 'seg1.mp4'\n" > out/concat.txt
(cd out && ffmpeg -y -loglevel error -f concat -safe 0 -i concat.txt -c copy picture.mp4)
DUR=$(python3 -c "import json;print(json.load(open('audio/timeline.json'))['DUR'])")
# two-pass loudness to -14 LUFS / -1.5 dBTP
M=$(ffmpeg -hide_banner -i audio/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | python3 -c "
import sys,json,re;j=json.loads(re.search(r'\{[^{}]*\}',sys.stdin.read(),re.S).group(0))
print(f\"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}\")")
ffmpeg -y -loglevel error -i out/picture.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy \
 -af "loudnorm=I=-14:TP=-1.5:LRA=11:$M:linear=true" -ar 48000 -c:a aac -b:a 192k -t "$DUR" -movflags +faststart \
 final/what-if-doom-was-saving-the-multiverse.mp4
echo "Built final/what-if-doom-was-saving-the-multiverse.mp4 ($DUR s)"
