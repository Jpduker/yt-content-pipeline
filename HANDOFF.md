# HANDOFF — 2026-11-08 evening → next Claude session
Paste into the new session:  **"Read HANDOFF.md in the YouTube folder and work through it in order. Ask me only what it says to ask."**


## STATUS AFTER SESSION 5 (2026-11-08 ~23:55, Vivek)
- Whispers C01 v3 DONE (local test): channels/whispers/confessions/2026-11-08-c01-v3-i-was-holding-it-for-you/ — Vivek's 12 storyboard frames
  STATIC (Vivek: "do not try any eye movements"), reel audio only (it already has the narration; v2's extra TTS voice was a mistake), cuts +
  captions on the measured phrases. Waiting on his notes.
- Island paper-popup test: Vivek did NOT like it ("visuals are not appealing"). He wants **HD-2D** (lemo style hd-2d, demo "The Lampbearer")
  for the island. NEXT BIG TASK: an HD-2D island riddle test (20–25 s) — measure render speed first; lemo's demo needs its voices/music
  generated before it runs (it fails with a network error as shipped). Also test 2–3 other lemo styles (suggested: shadow-puppet, crayon-book,
  isometric-picture-book / lowpoly-island) as short stills/clips for Vivek to compare.
- Competitor study: research/competitors/2026-11-08-devpsyche-casualfinance.md (formulas + links). Visual style not captured yet (NexLev
  video tool is paid) → run /watch or claude-video-vision locally in WSL on the two top videos.
- GIT: commits are made in Vivek's folder as VivekSai07, but the Cowork sandbox shell has NO GitHub login, so pushes fail there and the cloud
  session has no write access. Vivek: run `git push` in WSL after a session, or give the sandbox a credential (see below). Do not claim a push succeeded.

## STATUS AFTER SESSION 4 (2026-11-08 ~23:15, Vivek)
- TEAM: Vivek (VivekSai07, Germany, WSL) + JP (Jpduker, NYC, Mac). Read CLAUDE.md "Team + git" FIRST. Repo: github.com/Jpduker/yt-content-pipeline, main only,
  pull before every prompt, push after every change, no AI co-author lines (hooks in .claude/settings.json enforce pull/push).
- First push: Vivek runs `sh pipeline/git-first-push.sh` in WSL (installs/uses gh login, commits as VivekSai07). JP then: `git clone`, `sh pipeline/mac-prereqs.sh`,
  `sh pipeline/get-tools.sh`, `bash pipeline/setup.sh`. Repo is PUBLIC: the Whispers character images (vivek-cast/, c01 assets/) are git-ignored
  (real-person likeness). Vivek decides: make the repo private and remove those 2 lines from .gitignore, or share them privately.
- Whispers C01 v2 (local test): channels/whispers/confessions/2026-11-08-c01-you-stole-my-heart/out/c01-you-stole-my-heart-v2__LOCAL-TEST.mp4
  · face rig in the shader (prep2.py writes assets/rig.json landmarks): lip sync from REAL phoneme timings, blinks, smiles, brow lifts, head tilt/nod,
    breathing, sway, she walks in, two-shots of both (encounter painting as a band). Captions word-exact.
  · Caption drift fixed at the root: pipeline/tts_timed.py + pipeline/make_timed_kokoro.py expose Kokoro's own phoneme durations. Use tts_timed.py for ALL new videos.
  · Waiting on Vivek's notes. Known limits: mouth is a dark-ellipse warp (works at phone size, not true drawn mouth shapes); only the stills Vivek made can move.
- Island: visual audit of CH01 + FM01 → channels/AUDIT-2026-11-08-ch01-fm01.md (30 timestamped errors + 6 root-cause process fixes).
  Vivek disliked the island caption card → style test lab/2026-11-08-island-style-test-paper-popup/ (24 s riddle "The Bottle That Lied": paper-popup look,
  Gus as paper puppet, NEW pull-tab captions, toy-box score, paper foley). Waiting on his STRICT review. If approved: rebuild CH01 in it (fixing the audit list).
- Floor Minus fixes: wait until Vivek confirms which audit items matter most, then one fix pass (safe-area + overlap checker first).

## WHY RENDERS WITH VOICE + MUSIC FAILED IN SESSION 2 (read this first)
- Every new cloud session starts on an EMPTY machine. Session 1 (the original one, id ad454fae…) had installed lemo-opuscar, Kokoro,
  the 97 instruments and ffmpeg 9 into its own scratchpad on Nov 4, so it can render voice + score + final there. A NEW cloud session
  is not allowed to download and run that code (safety rule: "cloud cannot install/run newly cloned third-party code"), so it can only
  make picture previews. That is a limit of new sessions, not a bug in the episodes.
- So, for anything that needs Kokoro / the sampler / mix / final mux, there are exactly two places:
  (a) Jp's WSL: `cd "/mnt/c/Users/Vivek Sai/Downloads/YouTube"; . pipeline/env.sh; sh <episode>/build.sh` (works; Island ran there), or
  (b) session 1, if Jp sends it the job.
- Speed (measured 2026-11-08, 2D styles): Jp's laptop ≈ 5–6 frames/s (3 workers) → Island 9400 frames + Shorts = 49 min.
  Session 1's cloud ≈ 12 frames/s (2 workers) → Floor Minus 8460 frames + Shorts = 26.5 min. WebGL (C01 2.5D) is much slower anywhere.
  Fastest: split videos across both machines at the same time (CLOUD-BUILDING marker makes WSL skip the cloud's ones).
- Do NOT tell Jp a step "can't be done" without saying where it CAN run.

## STATUS AFTER SESSION 3 (2026-11-08 ~21:30, session 1 resumed)
- DONE, all with voice + real-instrument music, ready for Jp's review:
  · Island CH01 (5:12, -14.6 LUFS) + 3 riddle Shorts → channels/island/chapters/2026-11-08-ch01-…/final/  (Jp's WSL, 2920 s)
  · Floor Minus Ep1 (4:42, -14.7 LUFS) + 3 floor Shorts → channels/stickman/floor-minus/2026-11-08-ep01-…/final/  (cloud, 1595 s)
  · Whispers C01 (37.9 s, Kokoro am_echo) → …/c01-you-stole-my-heart/out/c01-you-stole-my-heart__LOCAL-TEST.mp4 (cloud). Never upload (unlicensed music).
  · Note: in Jp's Gemini "introspection" pose HIM has no glasses (other sheets have them) → ask Jp to regenerate that pose with glasses.
- How: Floor Minus Ep1 + 3 Shorts and Whispers C01 were built in session 1's cloud with the real voices (Floor Minus reused Jp's WSL voices; C01 = Kokoro am_echo, since Chatterbox is broken),
  real-instrument score and mix, then copied into final/ (FM) and out/ (C01, LOCAL-TEST). Each folder has a CLOUD-BUILDING
  marker so WSL's build.sh skips it; delete the marker (or FORCE=1) to rebuild there.
- Rebuilding any of them in WSL: delete the CLOUD-BUILDING marker in that episode folder first.
- Still open: T1 Chatterbox (session 2 found its PyTorch install broken in WSL: missing library file → re-run setup.sh; if it fails again,
  `rm -rf tools/chatterbox/.venv` then setup.sh), T5 clay cast approval → v3, T6 Audio Library once the channels exist, feedback on the
  three finished videos, then /retro.

## Previous: status after session 2
- T2/T3 source + picture previews; T4 LOCAL TEST preview without voice; T5 step 1 cast sheets in library/styles/spotlight-clay/cast/sheets/.

## 0. Read first (5 min)
CLAUDE.md (operating manual) → memory/STATUS.md, TASTE.md, RULES.md → this file. Jp = the director; Claude builds. User prefs: be honest,
flag uncertainty, never invent sources/stats, flag anything that may be outdated. Jp's standing rule (2026-11-08): **"warn but don't ignore
my ideas"**: when an idea has a policy/copyright risk, say the risk in one line and still build it as a LOCAL TEST (filename contains
LOCAL-TEST), never in an upload-ready final.

## 1. Where to run things (important, learned the hard way)
- **Jp's WSL Ubuntu (GTX 1650 4 GB)**: the real home. lemo's venv (tools/lemo-opuscar/.venv), Kokoro, Whisper, Chatterbox, rembg/depth
  models all run here. If this session IS Claude Code in WSL, render here.
- **Cloud session linked to the PC**: the device shell (device_bash) is a Cowork Linux VM with NO GPU, and lemo's .venv does not run
  there (it points at WSL's python). Use it only to read/move files. Render in the cloud container instead: clone
  https://github.com/lemomo-ai/lemo-opuscar into the scratchpad, `npm i three@0.170` there, `sh tools/fetch.sh instruments vsco2ce vcsl
  salamander karoryfer freepats` + `sh tools/fetch.sh voice`, use a static ffmpeg ≥ 7 for mux.sh, Playwright's Chromium for still/video.mjs.
  Deliver: SendUserFile(tar) → device_commit_files → tar -x on the device. Cloud cannot install/run newly cloned third-party code and
  cannot reach Hugging Face: those steps go to WSL.
- Speeds seen (cloud, 2 workers): 2D canvas ≈ 0.16 s/frame → a 5-min 30 fps film (9000 frames) ≈ 12–25 min. three.js WebGL ≈ 1.7 s/frame
  → 9000 frames ≈ 4 h: **use 2D styles for the long-forms**.
- Formats (Jp): Shorts 9:16 1080×1920; long-form 16:9 1920×1080 (max 1080p). 30 fps.

## 2. Tasks in order
### T1. Chatterbox emotional voice (Jp approved). Needs Jp's WSL.
`sh tools/chatterbox/setup.sh` → `sh tools/chatterbox/make_refs.sh` → test with tools/chatterbox/test-lines.json (same line at 3 emotion
levels) → play the 3 files to Jp. Read tools/chatterbox/README.md. Unverified: VRAM fit on 4 GB (fallbacks: "model":"turbo", or CPU).
Suggest Jp records his OWN 8–10 s clip as library/voices/refs/him.wav (he is the male Whispers character). From now on emotional lines
use speak.py; Kokoro stays the fallback.

### T2. Island Chapter 1 "Twelve Seconds of Dark" (APPROVED) — 16:9 ~5 min + 3 riddle Shorts 9:16
Beat sheet: channels/island/chapters/SEASON-1-BIBLE.md. Cast: channels/island/characters (Gus, Pip, Mabel, Rollo) — keep them on-model
(EP01/EP02 code = the rigs). Style: midcentury-toon (2D, fast). `sh pipeline/new-episode.sh island chapters ch01-twelve-seconds-of-dark`.
Must-haves: on-screen pause-and-solve riddles with a countdown, a recap card linking EP02 + OT01 payoffs, cliffhanger (lamp dark at noon,
Stranger in the yellow coat), chapter markers. Music from real instruments (lemo sampler) with an energy arc; mix rules in RULES.md.
Captions: kinetic card. Then cut 3 Shorts (30–45 s each, ending "answer in Chapter 1").

### T3. Stickman "Floor Minus" Ep1 "Day 1 to Day 3" (APPROVED) — 16:9 ~5 min + 3 floor Shorts 9:16
Bible: channels/stickman/floor-minus/SERIES-BIBLE.md. Cast: channels/stickman/characters/stick-you (rig.js from WI01). Day counter + floor
counter on screen, one deadly rule per floor, cliffhanger: floor −4 is your apartment and you're already on the sofa. Captions: karaoke
chunks (Jp liked). Voice am_fenrir or Chatterbox "stick-you" ref.
Quality bar for T2/T3 (Jp): continuous character motion, heavier movement, NO camera zoom-ins/outs or Ken Burns, sets with depth and
lighting, music volume under the voice, SFX on the exact frame, every ending clear in one line. Write PUBLISH.md + CREDITS per episode.

### T4. Whispers C01 "You stole my heart" (local test) with VIVEK'S characters
Brief: channels/whispers/confessions/2026-11-08-c01-you-stole-my-heart/brief.md (script verbatim, beats, motion approach).
Characters: channels/whispers/characters/vivek-cast/ (4 Gemini sheets Vivek made; README there). Jp HATED the old ink Ira/Sol: never reuse them.
Music: Caribbean Blue local-test copy; output name must contain LOCAL-TEST. Warn once: HER is based on a real person → her OK or a changed
look before any public upload (Vivek's call). Motion: 2.5D from the stills (rembg cutout + Depth-Anything depth in WSL → three.js
displacement parallax, breathing mesh-warp, hair sway, blinks, light/particles following the music energy). No zooms.

### T5. Spotlight-clay v3 — character ASSETS first (Jp's feedback on v2)
v2 (lab/2026-11-08-spotlight-clay-wall/final/the-wall-of-im-fine-v2.mp4) "looks better than v1", but: (a) characters/objects sometimes
pass THROUGH each other; (b) no clear male vs female distinction. Jp's plan: **first build proper character assets in all directions**.
So: make library/styles/spotlight-clay/cast/ with a MALE and a FEMALE clay rig (source in the lab folder: rig.js makePerson; add
hair meshes, shoulder/hip width, outfit shapes, distinct colour) and render turnaround sheets (front, 3/4, side, back, 3 expressions) →
show Jp → only after approval re-make the wall piece as v3. Collision fix: add a `window.CHECK(t)` debug pass that measures capsule-vs-
capsule and capsule-vs-brick distances every frame and lists overlaps; render must report 0 before final. Voices via Chatterbox.

### T6. YouTube channels + Audio Library (Jp is creating the channels now)
Names, handles, Gemini prompts: channels/YOUTUBE-SETUP.md. Once the channel exists: YouTube Studio → Audio Library (left menu) →
filter by mood/genre, licence "no attribution required" preferred → download → save into library/music/yt-audio-library/<mood>/ →
`sh pipeline/music-catalog.sh` → pick with /pick-music. Claude can browse it in Jp's Chrome (Claude in Chrome) but asks Jp before EACH
download. Record each track's licence/attribution line in library/music/yt-audio-library/LICENSES.md.

## 3. Research rule (new)
When citing NexLev numbers, always give the channel URL and video URL so Jp can cross-check (example: research/nexlev/2026-11-08-story-niches.md).

## 4. End of session
Run /retro: update TASTE (quote Jp), LEARNINGS, DECISIONS, rewrite STATUS. Keep this file current or delete it once all tasks are done.
