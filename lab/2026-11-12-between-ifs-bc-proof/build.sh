#!/bin/sh
# Standalone native proof route; leaves the studio's existing episodes untouched.
set -eu
cd "$(dirname "$0")"
npm install --ignore-scripts
python3 audio.py
node render-native.mjs
ffmpeg -y -hide_banner -loglevel error -i out/picture.mp4 -i audio/mix.wav \
 -map 0:v -map 1:a -c:v copy \
 -af 'loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=-22.45:measured_TP=-3.91:measured_LRA=12.30:measured_thresh=-33.32:offset=2.47:linear=false' \
 -ar 48000 -c:a aac -b:a 192k -t 26 -movflags +faststart between-the-ifs-test.mp4
