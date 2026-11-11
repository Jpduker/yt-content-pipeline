# HANDOFF · 2026-11-11 evening → next session: produce the next 3 days of uploads at once
Paste into the new session:
**"Read HANDOFF.md and produce the next three days of uploads (one long-form + two Shorts per day). Ask me only what HANDOFF.md §11 says to ask."**

## 0. Rules first (every prompt)
- CLAUDE.md "Team + git": `sh pipeline/sync.sh` first; commit after every change (main only, commits as the human: VivekSai07 on Vivek's
  machine, JP's own on his Mac, no AI co-author lines). **The device shell has no GitHub login: commit locally and tell Vivek to
  `git push origin main` from WSL.** Never claim a push you didn't see.
- Vivek's standing rules: no "no"/excuses (warn in one line about policy/licence risk, then build it); **ask approval before any final render**;
  "cross-check every single detail". RULES.md + TASTE.md are loaded by CLAUDE.md; read memory/LEARNINGS.md (2026-11-10 section) once.
- The GrowKaz kit is now in git (tools/growkaz-stickman/ + lab/2026-11-09-growkaz-plugin-test/plugin/). It has **no licence file: the repo must stay private.**

## 1. Where we are
- **Channel:** What-If stickman channel (name "Between the Ifs" was the working name; check the live name with Vivek), created 2026-11-10/11
  with logo (channels/stickman/characters/hero-channel-image.jpg), banner, description.
- **WI02 is live:** https://youtu.be/tddFIFm8zGY · "What If You Heard Every Thought About You… and Listened?" · 4:22 · folder
  channels/stickman/what-if/2026-11-10-wi02-hear-what-they-think (final/, PUBLISH.md, DIRECTION.md, script.md, all code).
- **Style:** growkaz-ifverse **v2 (frozen 2026-11-11 from WI02)**: library/styles/growkaz-ifverse/v2 (STYLE.md, project/, tools/).
- **Feedback on WI02 (JP, 2026-11-11), MUST be fixed in every new video (§6):**
  1. "The pacing of the narration was a bit off."
  2. "The dialogues felt a bit not natural, kinda slow and robotic."
  3. "Emotions were not conveyed in facial expressions properly."
  Vivek liked: separate character voices, voice levels, background music, cast consistency, acting/camera (2026-11-10).

## 2. Two tracks. Ask Vivek ONE question before starting (§11)
- **Track A: What-If channel, daily.** One long-form (~4–6 min, 16:9) + two Shorts (9:16) per day, from 2026-11-12. Style growkaz-ifverse v2 → v3 (with §6 fixes).
- **Track B: JP's idea: a more vibrant, colourful channel to attract kids, replicating the Ricks Clips look exactly.**
  Reference frames: references/videos/ricks-clips/frames (65 frames, f0001.jpg…; video VS1Z_Q-Klt8.mp4 + info.json; sheets in the same folder).
  We already have a frozen replica start: **library/styles/toon3d-palace v1** (toon.js chibi family, warm painted 3D worlds, costume = identity,
  one slow push per shot, one-word Poppins captions) built in lab/2026-11-09-ricks-style-test. Reverse-engineer from there (/study-reference on the
  frames → STYLE v2 → a 20–30 s proof → Vivek approves) instead of starting from zero. A replica must match frame by frame (TASTE 2026-11-09:
  "hugely disappointed" when Dave v1 only matched the feel).
  ⚠ If the target audience is kids, YouTube requires "Made for kids" = no comments, no personalised ads (lower RPM), no end-screen/cards to non-kid
  content. Warn Vivek in one line; never mix kids videos into the What-If channel.
- **Unclear: do the daily What-If videos switch to the Ricks style, or does the Ricks style go to a NEW channel?** Ask (§11). Until answered,
  Track A continues in growkaz-ifverse with the §6 fixes.

## 3. The 3-day schedule (produce everything up front, approvals in batches)
| Day (CET) | Long-form | Shorts (2) |
|---|---|---|
| Thu 2026-11-12 | WI03 | WI02 Short 1 + WI02 Short 2 (point to https://youtu.be/tddFIFm8zGY) |
| Fri 2026-11-13 | WI04 | WI03 Short 1 + 2 (point to WI03 once live) |
| Sat 2026-11-14 | WI05 | WI04 Short 1 + 2 |
Shorts always cut from a video that is already live (so "full story on the channel" is true). Keep one spare Short in final/ per episode.
Batch plan: (1) scripts + titles for WI03–05 → Vivek approves hooks/titles in one message; (2) voices for all three → A/B 20 s sample per episode
(§6) → approval; (3) direction + code + contact sheets for all three → one approval; (4) final renders (≈ 25 min each in the cloud container)
+ Shorts + PUBLISH.md each.

## 4. Story candidates (channel promise: "One impossible rule. An ordinary life. A difficult choice." Relationship lane, second person)
Pick three, then **check each exact title for duplicates** (NexLev `youtube_search` type=video; the NexLev free quota is 50 calls/week and reset
2026-11-11 23:44 CET; spend it carefully) and record the result in research/. WI02 lesson: the exact obvious title already had 10+ uploads, so
the title must promise OUR twist.
1. What If Every Apology Erased Their Memory of What You Did? (Codex; twist: you can never be forgiven, only forgotten)
2. What If You Could Replay One Conversation, but Only You Remembered Both Versions? (Codex)
3. What If Every Lie You Told Became True? (research #4; comedy → cost → honesty ending)
4. What If You Felt Everything Your Best Friend Felt? (new; empathy as a burden)
5. What If Your Phone Battery Was Your Life Battery? (research #6; ends on "put the phone down" with Mira)
Recurring cast: hero "YOU" (STRICT look, below) + Mira (best friend, ponytail + yellow scrunchie); add 1–2 new side characters per episode, one
colour item each. Structure (research §3): cold open on the most extreme moment → normal day → 3–5 escalating beats with an on-screen number →
the cost → emotional ending → "Would YOU…?" question. ~600–800 spoken words for 4–5 min; aim 6–8 min from WI05 on if the pipeline holds.

## 5. How a video is made (the proven WI02 pipeline; copy WI02's folder layout)
**Hardware:** the linked PC's VM is tiny (2 cores, 2 GB). Do voice + render in the **cloud container** (2 cores, ~7 GB; 1080p ≈ 4.7 fps,
4:22 ≈ 23 min; 540p previews ≈ 20 fps).
**Moving files:** device → cloud: `tar czf _xfer/<x>.tgz …` on the device, then `device_stage_files`. Cloud → device: small files with
`device_commit_files` (stagedPath under /mnt/user-data/outputs/); files over ~15 MB fail with HTTP 400 → send them with SendUserFile and commit by
fileUuid. `_xfer/` is gitignored.
**Cloud setup (once per session):** stage tools/lemo-opuscar/core/tts/kokoro-v1.0.onnx + voices-v1.0.bin; `pip install --break-system-packages
kokoro-onnx onnx soundfile scipy`; `python3 pipeline/make_timed_kokoro.py <lib>` (adds the duration output for exact word timings);
kit: `cd <kit> && npm install`, then **delete kit/node_modules/playwright{,-core} and symlink the global ones** (`$(npm root -g)/playwright`),
because the kit pins 1.56 and the container's Chromium belongs to the global Playwright. Self-test: `node render.mjs --project examples/reaction-time --sheet --scale 0.3`.
**JP's Mac:** `sh pipeline/mac-prereqs.sh`, `cd lab/2026-11-09-growkaz-plugin-test/plugin/skills/make-2d-video/kit && npm install`, same self-test.
**Steps (episode folder `sh pipeline/new-episode.sh stickman what-if wi0N-<slug>`):**
1. script.md with speaker tags (`N:`, `MIRA:`, `MIRA-T:` = thought, `YOU:`…; `✎` notes are stripped). Hook → Vivek.
2. DIRECTION.md (cast bible, sets, motifs, music plan, shot list, Shorts plan) before any code.
3. Voice: copy library/styles/growkaz-ifverse/v2/tools/build_voice.py → `<ep>/voice/`; edit VOICES/BEAT/PAUSE; `LIB=<lib> python3 voice/build_voice.py <ep>`
   → project/input/voiceover.wav, timeline/lines.json, words_all.json, words.json (captions, thoughts excluded). `SKIP_TTS=1` re-assembles without re-synthesis.
4. Project: copy library/styles/growkaz-ifverse/v2/project → `<ep>/project` (scenes/cast.js, chars.js, sets/world.js, shots/gen.js, _cap.js, t3.js).
   New sets go in sets/world.js; new characters in cast.js + chars.js HEAD.
5. Shot list as data: copy v2/tools/build_story.py → `<ep>/story/`, rewrite the `sh(...)` list (anchors = line ids 'L016' or words 'L032:6';
   builders: scene / face / insert / blueprint / topdown / title / end / 3d). It times shots to the voice, snaps cuts out of words, adds sound cues
   and ambience. `python3 story/build_story.py <ep>`.
6. QA: `node render.mjs --project <p> --sheet --scale 0.4` → read every sheet; a cast sheet (both facings, close-up + full body) whenever a character is
   new; 3–4 motion clips at 0.5 scale (`--from --to --scale 0.5 --out …`, then mux the slice of build/mix.wav) → **Vivek approves**.
7. Sound: `python3 audio/mix.py --project <p>` (kit music by mood sections, SFX cues, ambience, −14 LUFS) → out/<title>.mp4. Re-run the mix
   AFTER any shot-timing change (SFX are relative to shot starts).
8. Final: `node render.mjs --project <p> --workers 2` → mix.py → check: ffprobe durations equal, ebur128 (≈ −14 LUFS, ≤ −1 dBTP), A/V offset 0 ms
   (envelope cross-correlation vs voiceover.wav), spot frames with captions. Copy to `<ep>/final/`, `python3 story/make_srt.py <ep>` → .srt.
9. PUBLISH.md (title ≤ 60 chars, description with chapters starting 0:00, tags, pinned comment), CREDITS.md, thumbnail prompt for Gemini
   (attach hero-channel-image.jpg as reference; giant hero face + ≤ 4 words), then /retro.

## 6. Mandatory fixes from JP's feedback (make these the v3 changes; show Vivek an A/B before the batch)
**Pacing + robotic dialogue (voice):**
- Root cause (likely): every sentence was synthesised as a separate Kokoro call with fixed gaps (0.30 s same speaker, 0.42 s speaker change,
  +BEAT/PAUSE), so prosody resets each line and the rhythm is metronomic. Fix in build_voice.py: synthesise **consecutive narrator lines of one
  beat as ONE call** (natural intonation across sentences), split back into lines by word timings; vary gaps by intent (comedy/montage 0.12–0.22 s,
  normal 0.25–0.35 s, emotional 0.6–1.2 s), and let dialogue answer fast (0.15–0.25 s) like a real exchange.
- Speeds: narrator 1.0–1.05 in comedy/escalation, 0.92–0.95 only in the emotional act; dialogue 1.05–1.12 (it was 1.0 → "slow").
- Write for the ear: contractions, short replies, interjections ("Oh." "Wait—" "Hm."), question marks and commas where the breath goes; avoid
  three-word declaratives in a row (WI02 had many).
- Try 2–3 alternative Kokoro voices per role (e.g. am_fenrir/am_adam narrator, af_bella/af_sarah for Mira) and render a 20 s A/B for Vivek.
  A more expressive free local TTS for dialogue is worth one test (Chatterbox is broken in WSL but untested in the cloud container); keep it
  free and local (RULES), and keep Kokoro as the fallback.
**Faces that carry emotion:**
- In WI02 most emotional lines played on wides where heads are ~40 px: unreadable on a phone. Every emotional or reactive line gets a close-up
  (bust) or a medium (cam z ≥ 1.8); wides only to establish or for comedy staging.
- Expressions change **0.2–0.4 s before** the line that motivates them and hold; use a 2–3 step arc per shot (e.g. smile → freeze → hurt).
- Strengthen chars.js faces: bigger brow angles, eye squash (squint/happy) and stretch (shock), more mouth shapes (grimace, bite lip, wobble,
  tight smile), head tilt and a small body drop (shoulders) on sad beats, tears that well before falling. Add expressions you need to `face()`
  and show a new expression sheet (lab-charsheet pattern: a temp project with `charsheet` / `faces` builders) before using them.
- Reaction shots: after any hurtful or tender line, cut to the listener for ≥ 1 s.

## 7. Shorts recipe (9:16, ≤ 59 s)
- Pick self-contained beats from DIRECTION.md "Shorts" (WI02: ① hook + barista, shots 1–15; ② the shortcut, napkin to 23 rules + train; ③ "I miss him").
- Best quality: copy the project to `<ep>/short-N/`, set config aspect "9:16", keep only that time range (shots.json start/end re-based), re-frame
  cameras for vertical (the engine has `V(landscape, vertical)` and GY 0.7 H; characters in the middle third; captions at ~79 % H). Re-run the mix on
  the trimmed voice. Last 2 s: "Full story on the channel" card + loop-friendly last frame (RULES).
- Cheap fallback only if time runs out: 16:9 final cropped to 9:16 with a blurred fill. Tell Vivek if you use it.
- Title = the long video's title, shortened ("He Could Hear What She Really Thought…"); link the long video as the Short's "related video".

## 8. Publishing (Vivek uploads; give him the same checklist as WI02)
Phone-verified channel (custom thumbnails); title; description + chapters from PUBLISH.md; thumbnail; Not made for kids (Track A); altered/synthetic
content: stylised animation, check YouTube's help text; tags; English; Film & Animation; upload the .srt; end screen (Subscribe + the previous
video now that there is one); wait for the copyright check and HD processing; pin the comment. Record each live URL in CHANNEL.md + PUBLISH.md.

## 9. Hero and cast rules (STRICT)
- Hero "YOU" = channel image: bald round matte-black head, tall white oval eyes, short thin brows, small curved smile, green hoodie #3fb950 with the hood
  down, drawstrings, warm amber rim. No hair, no outfit change, ever (the cap is allowed only if Vivek asks). Drawn by chars.js (`drawChar`, `bust`).
- Every character looks identical in wides and close-ups (one shared head module). Check a cast sheet before the contact sheet.
- Thought language (v3, approved): no ribbons; a faint ivory echo slips off the THINKER's head, the background softens, edges darken; the words show in
  the caption line as italic ivory quotes, phrase by phrase; strong the first time, fading later; none on the most emotional thought.
- Captions: karaoke chunks per sentence (_cap.js), always above the letterbox bars of the current and neighbouring shots.

## 10. Known pitfalls (see LEARNINGS 2026-11-10)
GrowKaz kit brow bug ('worried' draws angry); kit `top:'tshirt'` defaults to red; `bigFace` ponytail blob (we use chars.js instead); kit captions
cross sentences (we use _cap.js); never cut inside a word (build_story snaps); a cloud container restore can show "file changed on disk" notices,
so verify files instead of reverting; NexLev quota 50/week.

## 11. Ask Vivek only
1. Track B: do the daily What-If videos switch to the Ricks Clips look, or is it a separate (kids) channel? (one question, at the start)
2. The three stories + titles + hooks (one message). 3. The voice A/B (20 s per episode). 4. Contact sheets + motion clips (one batch). 5. Thumbnails/titles.
