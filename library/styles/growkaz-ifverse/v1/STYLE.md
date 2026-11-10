# growkaz-ifverse v1 (frozen 2026-11-10)
The look of Ifverse ("What If Your Reaction Time Was 10x Faster?", MroF1XmHOZw), produced with the GrowKaz Stickman plugin kit.
**Chosen by Vivek + JP for the What-If stickman channel launch.**

## Engine (pinned, NOT in git: third-party, no licence file)
- GrowKaz_Stickman.plugin v1.1.0, sha256 `086c6c07232b3e7b313e7296ca3d6264b4c0c2441315715ea387fc58a899682a`
  (local copy: tools/growkaz-stickman/GrowKaz_Stickman.plugin; unzipped kit: lab/2026-11-09-growkaz-plugin-test/plugin/skills/make-2d-video/kit).
- Install once: unzip the plugin, `cd kit && npm install` (needs playwright + ffmpeg; Python 3 for audio/tools). Self-test:
  `node render.mjs --project examples/reaction-time --sheet --scale 0.3`.
- Engine API: plugin/skills/make-2d-video/references/engine-api.md; look rules: references/style-bible.md (read both before writing shots).

## Look rules
- Black stick figures with a coloured rim light; identity = ONE colour item (hoodie/cap/tie/lab coat) + hair/hat shape. Keep the same item all video.
- Palette: style preset **sakura** (mauve/pink dusk + amber practicals) = closest to Ifverse. Other presets (emerald, ember, arctic, retro) only on purpose.
- Sets: big windows, skyline silhouettes, dust motes, lens streaks; one "hub" set the story keeps returning to (v1 test: the café).
- Shots 2–3.5 s; every new idea = new shot. Tools per beat: wide set → giant face (bigFace) for emotion → freeze-frame/tint for the twist →
  three-kit 3D orbit for scale → blueprint/readout card for numbers → title card / end screen.
- Letterbox "scope" bars only on dramatic beats (never under captions).
- Captions: kit karaoke captions (uppercase, keyword in yellow), words from timeline/words.json (Whisper timings from the real voice).

## Files
- project/: config.json (16:9, 1080p, 24 fps, style sakura), story/shots.json, scenes/cast.js, scenes/sets/, scenes/shots/01_all.js, timeline/words.json.
- Render: `cd <kit> && node render.mjs --project <path-to>/project --workers 2` → project/build/video_silent.mp4; then the kit's audio tools
  (beats/music/sfx/mix) once there is a voiceover in project/input/voiceover.mp3.
- Proven speed: 19 s 1080p, 2 workers, cloud ≈ 5 min.
