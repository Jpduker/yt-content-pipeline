#!/bin/sh
# Copy the ACTIVE skills from tools/ into .claude/skills/ (project scope only).
# Re-run after pipeline/update-tools.sh. Never edit inside .claude/skills: edits are overwritten.
set -e
cd "$(dirname "$0")/.."
T=tools; S=.claude/skills; mkdir -p "$S"
copy() { rm -rf "$S/$2"; cp -r "$1" "$S/$2"; echo "  + $2"; }
for d in "$T"/youtube-agent-skill/skills/yt-*; do copy "$d" "$(basename "$d")"; done
for d in "$T"/threejs-skills/skills/*/; do d=${d%/}; copy "$d" "$(basename "$d")"; done
copy "$T/lemo-opuscar/plugin/skills/lemo-opuscar" lemo-opuscar
for s in hyperframes hyperframes-cli hyperframes-registry; do copy "$T/hyperframes/skills/$s" "$s"; done
for d in skills/*/; do d=${d%/}; copy "$d" "$(basename "$d")"; done   # our own skills
# Deliberately NOT active: hyperframes media-use / reverse-any-video / style-sampling (paid HeyGen),
# video-use (paid ElevenLabs transcription). See tools/README.md.
echo "active skills: $(ls "$S" | wc -l)"
