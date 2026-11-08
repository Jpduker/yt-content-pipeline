#!/bin/sh
# Word-level transcripts of every clip under references/<group>/ (skips ones already done).
#   sh pipeline/transcribe-refs.sh      -> references/transcripts/<name>.txt + .json (word timestamps)
# Model: WHISPER_MODEL (default small.en). First run downloads it from Hugging Face.
set -e
cd "$(dirname "$0")/.."; . pipeline/env.sh
mkdir -p references/transcripts
"$LEMO_OPUSCAR_HOME/.venv/bin/python" - <<'PY'
import glob, json, os
from faster_whisper import WhisperModel
m = WhisperModel(os.environ.get("WHISPER_MODEL", "small.en"), device="cpu", compute_type="int8")
for v in sorted(glob.glob("references/*/*.mp4")):
    name = os.path.splitext(os.path.basename(v))[0]
    out = f"references/transcripts/{name}"
    if os.path.exists(out + ".json"):
        continue
    segs, _ = m.transcribe(v, word_timestamps=True, vad_filter=True)
    lines, words = [], []
    for s in segs:
        lines.append(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
        words += [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in (s.words or [])]
    open(out + ".txt", "w").write("\n".join(lines) + "\n")
    json.dump(words, open(out + ".json", "w"))
    print(f"{name}: {len(words)} words")
PY
