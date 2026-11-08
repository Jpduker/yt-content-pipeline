# Chatterbox: emotional local TTS (approved by Jp 2026-11-08)
Resemble AI's open-source TTS, MIT licence, `pip install chatterbox-tts`. Clones a voice from a 5-10 s reference clip and has an
`exaggeration` knob (flat to expressive). Sources: https://huggingface.co/ResembleAI/chatterbox-turbo , https://pypi.org/project/chatterbox-tts/
Runs in **WSL on the GTX 1650** (not in the cloud session and not in the Cowork VM, which have no GPU).

1. `sh tools/chatterbox/setup.sh`          (once; creates tools/chatterbox/.venv)
2. `sh tools/chatterbox/make_refs.sh`      (starter refs from Kokoro; or record your own into library/voices/refs/<name>.wav)
3. `tools/chatterbox/.venv/bin/python tools/chatterbox/speak.py tools/chatterbox/test-lines.json /tmp/cb-test` (same line at 3 emotion levels)
4. In an episode: `.../speak.py lines.json voices` instead of lemo tts.py. Output layout is identical (voices/<id>.wav + dur.json),
   so `pipeline/align_words.py` and the mix scripts work unchanged.

Unverified (flag): exact VRAM use on a 4 GB card. Try the 500M original first (it has the emotion knob); if CUDA OOM, set "model":"turbo"
or let speak.py fall back to CPU. Every output carries Resemble's inaudible PerTh watermark (upstream behaviour, harmless for us).
Kokoro (lemo core/tts) stays the fallback.
