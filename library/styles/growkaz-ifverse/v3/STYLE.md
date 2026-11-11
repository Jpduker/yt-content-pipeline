# growkaz-ifverse v3 (2026-11-11/12, first used by WI03–WI05) · changes from v2
Built to fix JP's WI02 feedback (pacing, robotic dialogue, faces) and Vivek's notes (narration style, depth, cinematic camera). Same pinned kit v1.1.0.

## Narration (Vivek, 2026-11-11)
- Second person, present tense, intimate and matter-of-fact. The narrator steps back once a scene starts; dialogue and faces carry the climax.
- Half-second beat before each reveal (`~ 0.5` in the script). Per-episode tone: WI03 confessional, WI04 crisp like a clock, WI05 curious then soft.

## Voice (tools/build_voice.py + <ep>/voice/voice.json)
- Consecutive lines of one speaker = ONE Kokoro call, split back by word timings (prosody carries across sentences).
- Gaps by intent: natural pause inside a paragraph (clamped), dialogue answers 0.15 s, narrator → dialogue 0.26 s, `~ s` beats, `>` stage directions add a 0.9 s scene beat.
- Speeds: narrator 0.97–1.03, dialogue 1.07–1.12. Narrator slightly warmer and 1 dB under the characters. `(phone)` = call filter, `-T` = thought / unsent text.

## Faces (scenes/chars.js)
- Parametric face (brow lift/tilt, lids, mouth curve/width/open, wobble, tears welling, droop of head + shoulders); 30 named expressions that BLEND over 0.22 s.
- Expressions are keyed to words and lead the line by 0.3 s (story_lib converts `['L073', 'hurt']`). Emotional lines play on close-ups or mediums; listeners get a reaction shot.

## Picture (scenes/shots/gen.js, scenes/sets/world.js)
- Grade on every shot (vignette + key bloom), depth of field on mediums, slow push-ins on emotional beats, light handheld drift.
- New sets: street (am/dusk/night, park, bus, van, steps), hall (Mira's flat), platform, lift; bedroom night. New cast: MUM, NEIGH, DRIVER, LIFT, MIRA_HOME.
- Motifs: head badges (`num`, `tear`), ghost bubbles for unsent texts (typed as spoken, flicker, delete), phone inserts (pile, typing, real, call, scroll).
- Shorts: tools/make_short.py cuts ranges at shot boundaries; in 9:16 the 16:9 stage is drawn 1.78× and panned to the subject, captions/bubbles are laid out for vertical; ends on a 2.2 s "Full story on the channel" card.

## Tools
build_voice.py · story_lib.py (shot list as data; episode file = story/build_story.py) · make_short.py · make_srt.py
