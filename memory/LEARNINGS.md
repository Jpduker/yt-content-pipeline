# Learnings log
Append-only, newest at the bottom. Format: date · what happened · evidence · (→ rule, if promoted).

- 2026-11-04 · v1 "ffmpeg placeholder" proof rejected by Jp: static shapes, no world · Jp: "I really did not like the 10sec video" → rule: build a world.
- 2026-11-04 · lemo cel-anime-80s demo rendered end to end in cloud: 1416 frames, 2 workers, software WebGL, 27 min (≈1.15 s/frame/core); Kokoro 8 lines in 30 s; score 19 s; mix 10 s · Jp liked it, rewatched twice.
- 2026-11-04 · lemo setup hardcodes `.venv/bin/python` → needs WSL, not Git Bash → rule.
- 2026-11-04 · lemo demo mix needs `librosa` (listed as maintainer-only); demo fonts not in git → fixed in pipeline/setup.sh → rule.
- 2026-11-04 · hyperframes media-use / reverse-any-video / style-sampling route to paid HeyGen → kept inactive.
- 2026-11-04 · Reference study: favourites cut every ~3.7 s; disliked ones held 15–28 s per shot · measured with ffmpeg scene>0.30 → rule: shot change ≤4 s.
- 2026-11-04 · Cloud/linked sessions: device sandbox calls stop at 180 s, git over the mounted folder is slow (use sparse checkouts), computer use cannot type into terminals, Hugging Face blocked from both sandboxes.
- 2026-11-05 · EP01 "The Lighthouse Switches" (riddle Short, midcentury-toon) produced end to end in the cloud: 2D canvas renders ≈0.16 s/frame (960 frames in 158 s on 2 workers): 2D styles are ~7× faster than the WebGL cel-anime demo.
- 2026-11-05 · Built the timeline AFTER the TTS: generate voice first, then place lines on the beat grid from real durations (27.9 s of narration in a 40 s Short worked).
- 2026-11-05 · lemo `dashed()` draws nothing on long straight segments: densify the polyline first (every ~8 px).
- 2026-11-05 · ffmpeg 6.x breaks `mux.sh` ("only 37.1 s could be decoded"); ffmpeg 7+ required (pip `imageio-ffmpeg` bundles 9.x as a fallback).
- 2026-11-05 · Vertical Shorts layout that worked: subject in the upper 2/3, caption card centred at y≈1420, nothing important below y≈1550 (Shorts UI), counters top-left.
- 2026-11-05 · Seamless loop: make the hook motion periodic (2 s period) and reset world state while the camera is elsewhere; measured first/last frame difference 0.57/255.
- 2026-11-05 · Review stills caught 5 staging bugs before the full render (character covering the key prop, rules not leaving, dark void under the floor, caption over the subject, arm pose): always do stills QA first.
- 2026-11-05 · No Whisper check possible from the cloud (Hugging Face blocked): run core/tts/asr_check.py on Jp's machine.
- 2026-11-05 · Two sets + colour-block wipes (EP02 room / line-up) read faster than one tall world; hold the outgoing set's last frame during the wipe (state is a function of t, so render the old side at the cut time).
- 2026-11-05 · A fair whodunit: put the clue (yellow paint on Rollo's feet) in EVERY line-up shot before the countdown, and show it big in the reveal callout.
- 2026-11-05 · Hook shows the room AFTER the crime (empty plate, wet stairs) = loop end state; "THIS MORNING" wipe resets to before. Loop stays seamless without resetting state on screen.
- 2026-11-05 · Stickman rig: IK hand/foot targets must be converted from world to the rig's local space (scale + squash), or arms point at nothing. Props drawn inside the rig need the same transform.
- 2026-11-05 · Stickman framing: characters ~1/3 of frame height looked lost; per-scene camera zoom 1.35–1.65 fixed it. Keep labels/counters in screen space, bubbles in world space.
- 2026-11-05 · Ukiyo-e engine is 1920x1080: switched print.js to a portrait 1080x1920 sheet (hashira-e proportions) and scroll prints vertically like a hanging scroll. Clip live layers to the print frame or mist bands spill over the border.
- 2026-11-05 · Shadows as story devices: render the figure to an offscreen canvas, source-in to sumi, then lay it with a shear/squash transform; peeling = clip by height + a rolled cylinder.
- 2026-11-05 · Shippori Mincho / Yuji Syuku TTFs download from github.com/google/fonts (raw) even when Google Fonts CDN is blocked.
- 2026-11-05 · Cloud render speeds (2 CPU workers): EP02 1248 frames 195 s; stickman 912 frames 137 s; ukiyo-e 1344 frames in 160 s.
- 2026-11-05 · v2 (Jp: "music too loud, caption/sound timing off, mute moment, endings unclear"). Causes found: (1) music bed sat ~at voice level (RMS ≈ voice, only -8 dB duck); (2) captions popped by character share of the line, up to 0.48 s EARLY after commas/full stops; (3) the shadow tale gated ALL audio for 1.8 s ("ma") — reads as a bug, not drama.
- 2026-11-05 · Fixes now standard: music bed scaled from the voice RMS: -12 dB in gaps, -19 dB under speech; captions use voices/words.json from pipeline/align_words.py (pauses + espeak phoneme counts, ±20 ms at phrase starts) and pop 40 ms before the word; never full silence longer than 0.5 s, keep ambience or a drone under pauses.
- 2026-11-05 · Real instruments: lemo `tools/fetch.sh instruments vsco2ce vcsl karoryfer freepats salamander` (~1.4 GB, mostly CC0; Salamander piano CC BY 3.0 must be credited) → 97 sampled instruments via core/audio/sampler.py. Scores take ~3 s to render.
- 2026-11-05 · Endings must state the payoff in words: stickman v2 "for the first time all week, you don't shrink"; tale v2 "One is his shadow. The other is him."
- 2026-11-05 · Ukiyo-e continuity: dissolves (0.9 s) + a slow zoom about each print's focus point read as one continuous film; better than scroll slides.
- 2026-11-05 · Cloud safety rule: installing/running newly cloned third-party code in the cloud workspace is blocked; clone such tools into tools/ and run them in WSL.
- 2026-11-08 · three.js in our pages: import from "/node_modules/three/..." via an importmap works for episode folders outside the library (the tools serve the library root). Software WebGL: 720 frames at 1080x1920 with a Reflector floor, shadows and bloom took 870 s on 2 workers (≈2.4 s/frame/worker).
- 2026-11-08 · Spotlight intensity in three r170 with decay 0: ~5–7 is right for a single key light; 60 blew everything out. Add a hemisphere (.5), a soft front fill and a cold back rim or the clay figures turn into black silhouettes.
- 2026-11-08 · Character staging inside props: check feet and hands against walls at every pose change (the push pose put the shins through the brick wall; caught in the contact sheet, not the stills).
- 2026-11-08 · Poetic confession reels (studied): one still image for 38 s, text typed on word by word in time with the music, emotional turn every ~5 s, music never drops; zarwhisper: 5 shots cut on line breaks, painted lofi figures from behind, gentle loops, "comment BOOK" funnel.
- 2026-11-08 · The Cowork device VM has no GPU and cannot run lemo's WSL venv; GPU/ML steps (Chatterbox, rembg, depth) need Jp's WSL.
- 2026-11-08 · Collisions: v2 spotlight had limbs through bricks/bodies; contact sheets miss some. Add an automated per-frame overlap check before final renders.
- 2026-11-08 s2 · Cloud session: running cloned third-party code (lemo fetch.sh, its renderer/sampler, Kokoro) is blocked, but our own Playwright renderer (page contract READY/render(t), canvas.toDataURL JPEG → ffmpeg) works: 2D toon film 0.11 s/frame/worker (9360 frames ≈ 11 min, 2 workers); our WebGL-quad 2.5D ≈ 0.6 s/frame/worker; three.js stills fine. npm i three works. So: cloud = picture + previews; WSL build.sh = voice, sampler score, mix, final mux.
- 2026-11-08 s2 · Long-form timing: give every line a planned "start" in lines.json and let the film push a line later only if the previous one runs long (warned in the console); visuals key off VT(id). Shorts can then be cut from the same code (?short=N) with no second timeline.
- 2026-11-08 s2 · Vertical Shorts from 16:9 sets: keep the same world coords, re-frame per set (track the hero's x), and extend floor/wall planes, because the taller view shows above/below the 16:9 set.
- 2026-11-08 s2 · Slab font (Alfa Slab One) has no U+2212 minus: use a plain hyphen in display numbers.
- 2026-11-08 s2 · Smoke-testing music.py/mix.py with stand-in modules (shim sampler that checks instrument ranges) caught 10 out-of-range notes and a 1-D limiter misuse before Jp's WSL run.
- 2026-11-08 · Render speeds, 2D long-forms: Jp's laptop WSL ≈ 5–6 fps (Island 9400 fr + Shorts 49 min); session-1 cloud ≈ 12 fps (Floor Minus 8460 fr + Shorts 26.5 min). Split videos across both machines for speed.
- 2026-11-08 · New cloud sessions cannot install/run lemo (safety rule) → picture previews only. Voice/music/final run in WSL or in the original session that already has lemo set up.
- 2026-11-08 · Kokoro's ONNX graph computes phoneme durations ('/encoder/Gather_output_0'); exposing it as output 'duration' gives kokoro-onnx create_timed() real timings → exact captions + lip sync (pipeline/make_timed_kokoro.py).
- 2026-11-08 · Keying sheet portraits: flood only from pixels that are almost exactly the backdrop colour (dist<.045), then dilate; global colour distance eats white sleeves.
- 2026-11-08 · Session-4 render speeds (cloud, 2 workers): C01 v2 WebGL face rig 1137 fr ≈ 13 min; island paper 2D 720 fr ≈ 4 min.
- 2026-11-09 · Replicating a reference: download it, cut 4 fps sheets + an ffmpeg scene-cut list, then build a ref|ours compare sheet at every beat and iterate camera distances until framing matches (our first guesses were ~2x too close). Afterhour has only 16 hard cuts in 170 s; the rest are continuous camera flights + whips with motion blur.
- 2026-11-09 · Render speeds (cloud, 2 workers, 1080x1920): three.js toon + bloom ≈ 1.7 s/frame (24 s = 20 min); 2D canvas ≈ 0.04 s/frame; GrowKaz kit 19 s 1080p ≈ 5 min.
- 2026-11-10 · What-if market: 30+ GrowKaz-look channels launched Sep–Oct 2026; Ifverse's new uploads fell to 10–35K. The look no longer wins alone: idea + emotional payoff + polish do (biggest small-channel hit = 'see how long everyone has left', 1.83M).
- 2026-11-10 · Git from the device shell works once delete permission is granted for the YouTube folder (lock files), but neither the device shell nor the cloud session can push (no GitHub credentials); push from WSL.

## 2026-11-10 · WI02 (growkaz-ifverse v2, session 7)
- GrowKaz kit v1.1.0 brow bug: expression brows 'worried' draw as ANGRY and 'angry' as worried (brow() slants the wrong way). Fix without touching the kit: pass `face: { brows: 'angry' }` for sad/worried/nervous/scared faces (see WI02 gen.js fixFace).
- Kit outfits: `top: 'tshirt'` with no colour defaults to RED (#d64a33). Extras and side characters whose colour item is a hat/headband need `top: 'none'`.
- bigFace with `head: 'ponytail'` draws a big black blob beside the face; use 'bun' in close-ups.
- Kit captions group words by index (cross sentences). WI02 _cap.js groups per line + punctuation and skips thought words.
- Cloud container renders the kit at ~20 fps at 0.5 scale (2 workers); kit's pinned playwright 1.56 needs the pre-installed global playwright symlinked into kit/node_modules.
- Data-driven shots (one builder file + shots.json params) made 95 shots in one evening; the shot list lives in story/build_story.py, timed to the real voice lines.
- 2026-11-11 · Moving files: device_commit_files from /mnt/user-data/outputs fails (HTTP 400) above ~15 MB; send big files with SendUserFile and commit by fileUuid.
- 2026-11-11 · Kokoro per-sentence synthesis + fixed gaps sounded robotic and mis-paced to JP (WI02). Next: synthesise narrator paragraphs in one call, vary gaps by intent, faster dialogue.
- 2026-11-11 · Emotion lost on wides (heads ~40 px). Emotional lines need close-ups/mediums.
- 2026-11-11 · NexLev out of quota: live YouTube search through Claude in Chrome works as a free fallback (fetch /results?search_query=… in the page and parse ytInitialData; sp=CAMSBAgEEAE%3D = this month by views). No outlier scores, results may be personalised.
- 2026-11-11 · What-if titles: every obvious "See <X>" idea has 3–10 copies under 500 views within two weeks; channels under 1K subs break out only when first with a new hidden fact (Ifable 598 subs → 128K, Any Minute Now 234 → 142K). Check duplicates BEFORE writing a script.

## 2026-11-11/12 · WI03–WI05 batch (growkaz-ifverse v3, session 8)
- Kokoro: synthesising a speaker's consecutive lines in ONE call and splitting by word timings keeps natural prosody; ~500 words gives ~3:15–3:30, not 4 min (speech is ~80% of the runtime).
- The Kokoro model files download straight from GitHub releases in the cloud container (no 325 MB staging); Hugging Face is not reachable there (no Chatterbox test).
- Shorts: drawing the 16:9 stage 1.78x inside a 9:16 frame and panning to the subject (gen.js wrapper) gives native-sharp vertical cuts with no per-shot re-framing; captions/bubbles must be drawn after the stage in vertical coordinates.
- Scope letterbox bars clip anything above a close-up head (badges): use `low=True` on face shots with a badge inside scope sections.
- Never start a render with `nohup … &` inside a background command (it is killed and leaves a confusing log); run the script itself as the background command.
- Standing figure head is at y ≈ 550 (pose head −208 × 1.6), seated ≈ 600: standing mediums need cam y ≈ 545.
- Three 3.5-min episodes render in ~16 min each at 1080p (5 fps, 2 workers); six 30–40 s Shorts follow.

## 2026-11-12 · session 9
- Shorts: a Short that opens mid-story without its premise loses ~80% at the swipe even when the rest holds (64% AVD). Open on the rule + conflict, title = first line.
- ~2.45 spoken words per second of finished film in our scripts (pauses included): 4:00 ≈ 560–590 words.
- The device shell CAN reach GitHub (git ls-remote/fetch work) but cannot push (no credentials). With delete permission granted, git leaves no lock files.
- lemo-opuscar 2.0.0 (2026-11-12): 99 styles, image-generation styles marked ✦ (need the user's own image tool), one LICENSE file (docs CC BY-NC + permission for own films).

## 2026-11-13 · session 10
- Our Shorts out-pull our long-forms ~16:1 in the first days (≈ 730 vs 44 views). Best Short = number + deadline in the title, 30 s.
- Shorts-native formats near our niche: "In this world, <rule>" (SceneLook 2–6M), number + deadline + "… but" (LAST SCENARIO 1–4M), "What if X for 5 seconds" (14.3M from a 42K channel, 2.7M from a 1.6K channel).
- "Time stopped for everyone except you" had 15+ uploads in a month, almost all < 300 views: only a twist in the title can lift it.
