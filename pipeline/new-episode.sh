#!/bin/sh
# Usage: sh pipeline/new-episode.sh <channel> <series> <code>-<slug>
#   e.g. sh pipeline/new-episode.sh island riddles ep03-the-locked-lamp  -> channels/island/riddles/YYYY-MM-DD-ep03-the-locked-lamp/
#   Style tests that belong to no channel: sh pipeline/new-episode.sh lab - <slug>  -> lab/YYYY-MM-DD-<slug>/
set -e
cd "$(dirname "$0")/.."
[ $# -eq 3 ] || { echo "usage: sh pipeline/new-episode.sh <channel> <series> <code>-<slug>   (channels: $(ls channels | tr '\n' ' '))"; exit 1; }
if [ "$1" = lab ]; then dst="lab/$(date +%F)-$3"; else
  [ -d "channels/$1" ] || { echo "no channel channels/$1 (create it with a CHANNEL.md first)"; exit 1; }
  dst="channels/$1/$2/$(date +%F)-$3"; fi
[ -e "$dst" ] && { echo "$dst exists"; exit 1; }
mkdir -p "$(dirname "$dst")" && cp -r pipeline/templates/episode "$dst" && echo "created $dst  (add it to channels/$1/CHANNEL.md)"
