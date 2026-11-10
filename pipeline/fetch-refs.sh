#!/bin/sh
# Download reference videos (study only, never reused) with yt-dlp and cut them into frames Claude can read.
#   sh pipeline/fetch-refs.sh                → the 4 references of 2026-11-09 (below)
#   sh pipeline/fetch-refs.sh <name> <url>   → any one video
# Per video, in references/videos/<name>/:  <id>.mp4 · audio.m4a · frames/ (1 per second) · scenes/ (every cut, named by timestamp)
#   · sheet-XX.jpg (contact sheets, 30 frames each, timestamp burned in) · info.json (title, duration, chapters)
set -e
cd "$(dirname "$0")/.."
V=tools/yt-dlp/.venv
[ -x "$V/bin/yt-dlp" ] || { python3 -m venv "$V" && "$V/bin/pip" install -q -U yt-dlp; }
"$V/bin/pip" install -q -U yt-dlp >/dev/null 2>&1 || true          # YouTube changes often; keep yt-dlp current
get() {
  N=$1; U=$2; D="references/videos/$N"; mkdir -p "$D/frames" "$D/scenes"
  echo "=== $N  $U"
  "$V/bin/yt-dlp" -q --no-playlist -f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b" --merge-output-format mp4 \
     --write-info-json -o "$D/%(id)s.%(ext)s" "$U"
  F=$(ls "$D"/*.mp4 | head -1)
  ffmpeg -loglevel error -y -i "$F" -vn -c:a copy "$D/audio.m4a" 2>/dev/null || true
  # 1 frame per second, timestamp burned in (for contact sheets)
  ffmpeg -loglevel error -y -i "$F" -vf "fps=1,scale=480:-2" "$D/frames/f%04d.jpg"
  # every cut (scene change > 0.3) at full 1080 width, file name = seconds
  ffmpeg -loglevel error -y -i "$F" -vf "select='gt(scene,0.3)',showinfo" -vsync vfr -frames:v 400 "$D/scenes/s%04d.jpg" 2>"$D/scenes/showinfo.txt" || true
  grep -o "pts_time:[0-9.]*" "$D/scenes/showinfo.txt" | cut -d: -f2 > "$D/scenes/times.txt" || true
  # contact sheets: 30 frames (6x5) each
  ffmpeg -loglevel error -y -pattern_type glob -i "$D/frames/f*.jpg" -vf "tile=6x5:padding=4" "$D/sheet-%02d.jpg"
  echo "   $(ls "$D/frames" | wc -l) s · $(wc -l < "$D/scenes/times.txt") cuts · $(ls "$D"/sheet-*.jpg | wc -l) sheets"
}
if [ $# -eq 2 ]; then get "$1" "$2"; exit; fi
get afterhour-theory  "https://www.youtube.com/shorts/znWzWYHoLOg"
get ricks-clips       "https://www.youtube.com/shorts/VS1Z_Q-Klt8"
get ifverse           "https://www.youtube.com/watch?v=MroF1XmHOZw"
get capital-case      "https://www.youtube.com/watch?v=sGtEBUIppYc"
echo "done → references/videos/"
