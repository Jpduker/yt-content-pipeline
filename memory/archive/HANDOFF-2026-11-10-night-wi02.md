# HANDOFF — 2026-11-10 night: make the FIRST What-If video (launch)
Paste into the new session:
**"Read HANDOFF.md and make tonight's video. The idea is: <PASTE THE CHOSEN IDEA # AND TITLE>. Ask me only what HANDOFF.md says to ask."**

## 0. Rules first (every prompt)
- CLAUDE.md "Team + git": `sh pipeline/sync.sh` first; `sh pipeline/push.sh "msg"` after every change; main only; commits as the human
  (VivekSai07 / JP), no AI co-author lines. If the shell has no GitHub login, commit and tell Vivek to `git push` from WSL. Never claim a push you didn't see.
- Vivek's standing rule: no "no"/excuses; warn in one line about policy/licence risks, then build it as LOCAL-TEST.
- RULES.md: free + local tools only, our own characters/brands only (no real people's likeness, no real logos), music under voice, -14 LUFS / -1 dBTP,
  captions synced to the voice, never reuse reference footage/audio.

## 1. What was decided (Vivek + JP, 2026-11-10)
- First milestone = the **"What If…" stickman channel**, first video tonight.
- Style = **growkaz-ifverse v1** (frozen): library/styles/growkaz-ifverse/v1/STYLE.md. Do not invent a new look; improvements go into a v2 copy.
  The other frozen styles (toon3d-afterhour v1, toon3d-palace v1, flat2d-history v1) are reserves — see library/styles/STYLES.md.
- Format = **long-form ≈ 4 min, 16:9 1080p 24 fps**, plus **2–3 vertical Shorts (≤ 59 s)** cut from it pointing to the long video.
  Evidence + the 10 candidate ideas: research/nexlev/2026-11-10-what-if-niches.md (read §3 patterns + §4 ideas before writing).
- Idea: the one Vivek pastes in the prompt above. If he didn't, ask him to pick from §4 (my top 3: #1 hear what people think, #2 pause time 10 s a day, #3 1% smarter every day).

## 2. Setup (once per machine, ~10 min)
1. Kit: lab/2026-11-09-growkaz-plugin-test/plugin/skills/make-2d-video/kit (unzipped GrowKaz_Stickman.plugin v1.1.0, NOT in git; if missing,
   unzip tools/growkaz-stickman/GrowKaz_Stickman.plugin there — sha256 in the STYLE.md). `cd <kit> && npm install`.
   Self-test: `node render.mjs --project examples/reaction-time --sheet --scale 0.3`.
2. Read <kit>/../references/engine-api.md and style-bible.md, and our proof project library/styles/growkaz-ifverse/v1/project (scenes/shots/01_all.js
   shows registerShot, table(), bigFace, freeze tint, three-kit orbit, title card — reuse its patterns).
3. Voice: Kokoro in WSL (`. pipeline/env.sh`; tools/lemo-opuscar/core/tts). Voice am_michael (Jp's favourite narrator, EP01) unless Vivek picks another;
   exact word timings via pipeline/make_timed_kokoro.py / pipeline/tts_timed.py → timeline/words.json (no Whisper guessing). Chatterbox is still broken in WSL.

## 3. Make the video (in this order; tick each in the task list)
1. **Episode folder:** `sh pipeline/new-episode.sh stickman what-if wi02-<slug>`; add a row to channels/stickman/CHANNEL.md (style: growkaz-ifverse v1).
   Make the kit project inside it: `node <kit>/tools/new_project.py` or copy library/styles/growkaz-ifverse/v1/project → <episode>/project, config: 16:9, 1080p, 24 fps, style **sakura**.
2. **Script (~550–600 words for 4 min):** /yt-script + the ScriptForge master prompt (tools/growkaz-stickman/2D Niche Prompt for Claude.pdf).
   Structure from the research: cold open on the most extreme moment (0–15 s) → Day 1 normal life → 3–5 escalating scenes, each with an on-screen number →
   the cost / dark turn → emotional or ironic ending → "What would YOU do?" CTA. Second person ("you"). Show Vivek the hook (first 3 lines) before going on.
3. **Director pass (BEFORE any code) → <episode>/DIRECTION.md:** one row per shot (2–3.5 s each, ~70–90 shots): line, shot size (wide/medium/close/giant face/insert/3D orbit),
   angle, what the hero DOES (pose + expression + anticipation/follow-through), set + mood palette, on-screen number/prop, transition, music/SFX cue.
   Plus a cast bible: hero "YOU" = one colour item kept all video (e.g. green tee), 2–4 side characters each with one colour item; expression list per beat.
   Rule: a new idea = a new shot; at least one giant-face reaction per minute; one 3D orbit per act; one "hub" set the story keeps returning to.
4. **Voice:** generate the narration (Kokoro, speed ~1.0), exact words.json, put voiceover.wav/mp3 in <episode>/project/input/.
5. **Shots:** write scenes/sets + scenes/shots per DIRECTION.md using the kit engine only. Stills QA first:
   `node render.mjs --project <p> --sheet --scale 0.4` → look at every sheet; fix overlaps, empty frames, caption collisions, wrong expressions.
   Send Vivek the contact sheet before the full render.
6. **Render:** `node render.mjs --project <p> --workers 2` (19 s ≈ 5 min in the cloud; 4 min ≈ 60 min — split across machines/cloud if needed).
7. **Sound:** kit audio (tools/beats.py, audio/music.py, audio/sfx.py, audio/mix.py) or /pick-music from library; music −18…−22 dB under voice,
   SFX on every cut/impact/freeze; master −14 LUFS, −1 dBTP; verify with /earshot.
8. **Captions:** kit karaoke captions (uppercase, keyword yellow) from words.json; also export an .srt.
9. **Shorts:** 2–3 vertical cuts (9:16, ≤ 59 s): the cold open, the best escalation beat, the ending tease; each ends "Full video on the channel".
10. **Package:** /yt-package (title ≤ 60 chars "What If You…?", thumbnail = giant face + one bold number/prop), /yt-seo description + tags, /yt-chapters.
    Write PUBLISH.md + CREDITS (kit v1.1.0, Kokoro, music source, fonts). Finals only in <episode>/final/.
11. **Retro (mandatory):** /retro — update TASTE/LEARNINGS/STATUS, add the episode to CHANNEL.md, push.

## 4. Quality bar (Vivek's question 4, agreed direction)
More *frames per second* does not make it better (24 fps is the animation standard); more *direction* does. Priority:
story/hook → voice + music → character acting (pose, expression, anticipation) → shot grammar (wide→close→reaction, cut on action, no static holds >3.5 s)
→ world detail (props, signs, background life) → consistency (same hero colour item, same palette per set). Every frame must read in 1 s on a phone.

## 5. Ask Vivek only
- Which idea (if not in the prompt) · approve the hook lines · approve the contact sheet before the full render · approve the thumbnail/title.
