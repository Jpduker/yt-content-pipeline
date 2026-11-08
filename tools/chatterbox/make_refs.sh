#!/bin/sh
# Makes starter reference clips in library/voices/refs/ from Kokoro voices (free, consistent timbre).
# Chatterbox then speaks in that timbre WITH emotion. Better still: record your own 8-10 s clip
# (quiet room, phone is fine, say a calm sentence) and save it as library/voices/refs/<name>.wav.
set -e
cd "$(dirname "$0")/../.."
. pipeline/env.sh
T=$(mktemp -d)
cat > $T/refs.json <<'J'
[{"id":"narrator-f","voice":"af_heart","speed":0.9,"text":"Some things you only say once, quietly, when the room is dark and the truth finally has somewhere to go."},
 {"id":"narrator-m","voice":"am_michael","speed":0.9,"text":"I kept the light on every night, not for the ships, but for the one who never came back to the island."},
 {"id":"him","voice":"am_echo","speed":0.88,"text":"I never planned to say this out loud, but you deserve to hear it from me, slowly, and without a single joke."},
 {"id":"stick-you","voice":"am_fenrir","speed":1.0,"text":"Day one. The elevator only goes down, the buttons are gone, and somebody has written the rules on the wall."}]
J
"$LEMO_OPUSCAR_HOME/.venv/bin/python" "$LEMO_OPUSCAR_HOME/core/tts/tts.py" $T/refs.json library/voices/refs
ls -la library/voices/refs
