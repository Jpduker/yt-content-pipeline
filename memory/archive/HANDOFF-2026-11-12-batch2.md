# HANDOFF · 2026-11-12 evening → next session: render batch 2 (WI06–WI08 + 2 Shorts each)
Paste into the new session: **"Read HANDOFF.md and produce batch 2 (WI06–WI08, two Shorts each)."**

## 0. Rules first
- `sh pipeline/sync.sh` first; commit after every change (main only, as the human, no AI co-author lines). The device shell can fetch but not push: tell Vivek to `git push origin main` from WSL.
- Vivek's rules: warn in one line about policy/licence risk, then build; ask approval before final renders unless he says go; cross-check every detail.

## 1. What to make
Everything is in channels/stickman/what-if/PLAN-2026-11-15-to-17.md (schedule, titles, hooks, Short hooks, v3.1 changes, voices) and the three script.md files.
Previous batch for reference (same pipeline, all files): 2026-11-12-wi03-unsent-texts, 2026-11-13-wi04-whos-leaving, 2026-11-14-wi05-who-cried.

## 2. Pipeline (proven in session 8; library/styles/growkaz-ifverse/v3/STYLE.md)
Cloud container: Kokoro files download from GitHub releases (thewh1teagle/kokoro-onnx model-files-v1.0); `pip install --break-system-packages kokoro-onnx onnx soundfile scipy`;
`python3 pipeline/make_timed_kokoro.py tools/lemo-opuscar`; kit `npm install` then symlink the global playwright + playwright-core into kit/node_modules.
Per episode: voice/voice.json → `LIB=tools/lemo-opuscar python3 library/styles/growkaz-ifverse/v3/tools/build_voice.py <ep>` → copy v3 project/scenes + config → story/build_story.py
(story_lib: `sh(...)` anchored to lines/words; expressions lead by 0.3 s) → `node render.mjs --project <p> --sheet --scale 0.4` → read every sheet → render (`--workers 2`, ~16 min each) → `python3 audio/mix.py --project <p>` → checks (durations, ebur128, blackdetect, spot frames) → make_srt.py <ep> <stem> → make_short.py (add --hook first, §3.1 of the plan) → PUBLISH.md, CREDITS.md, DIRECTION.md.
Run renders as the background command itself (never `nohup … &` inside one). Files > 15 MB: SendUserFile then device_commit_files by fileUuid.

## 3. Build first (v3.1)
1. make_short.py `--hook "line" --hookText "TEXT"` (+ Short-only hook voice line); 2. new poses (run, floor-sit, sofa-lie, clap, carry big box) and split-screen builder;
3. new sets: showcase hall, the flat living room with Theo's console, bus stop, park bench; 4. THEO in cast.js/chars.js (blue headphones round his neck, #4a8fe8) + cast sheet;
5. overlays clamp inside the frame in close-ups; 6. check the caption-spacing fix on the first sheet; 7. music: use library/music/yt-audio-library if Vivek added tracks (run pipeline/music-catalog.sh first), else the kit synth.

## 4. Ask Vivek only
Approval of scripts + Short hooks (if not yet given) · the voice A/B incl. Theo · contact sheets + motion clips · thumbnails stay his (Gemini prompts in PUBLISH.md).
