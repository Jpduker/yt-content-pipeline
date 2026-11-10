# Status: where we left off
Updated: 2026-11-10 ~23:00 (session 7, Vivek). **Next session: CLAUDE.md "Team + git" first, then this file.**

## Decided tonight (Vivek)
- First video WI02 "hear what they think": hook approved, title approved: "What If You Heard Every Thought About You… and Listened?"
- Channel name "Between the Ifs" OK for now (Vivek discussing with JP). Logo = our own hero; Vivek generates it in Gemini from the prompt in this session.
- Codex review: research/2026-11-10-codex-channel-review.md.

## Built tonight (style growkaz-ifverse v2 draft)
- Episode: channels/stickman/what-if/2026-11-10-wi02-hear-what-they-think.
  - voice/build_voice.py: multi-voice Kokoro (narrator am_michael, Mira af_heart, barista am_puck, boss bm_george, colleague af_nicole, train bf_emma);
    thoughts soft + reverb; 4:20 with emotional pauses. words.json (captions, no thoughts) + words_all.json + lines.json.
  - story/build_story.py: 95 shots timed to the voice lines + sound cues → project/story/shots.json.
  - project/scenes: cast.js, sets/world.js (café hub am/pm/night, bedroom, office, canteen, train), shots/gen.js (data-driven builders, auto lip-sync,
    thought-thread motif), shots/_cap.js (captions per sentence), shots/t3.js (3D dawn café, train viaduct, night pull-out).
  - out/: contact sheets + 4 motion clips (540p) sent to Vivek for approval.
- Rendered in the cloud container (kit ~20 fps at 0.5 scale; full 1080p est. 20–25 min). Kit = lab/2026-11-09-growkaz-plugin-test (not in git).

## Next up
1. Vivek approves the contact sheet + clips (or gives notes) → full 1080p render + mix (kit audio/mix.py) → earshot check.
2. Shorts (3, 9:16), package (title, thumbnail, description, chapters), PUBLISH.md + CREDITS, /retro.
3. Upgrade later: real recorded SFX (/real-sound) and a licensed music track instead of the kit's synth bed.
