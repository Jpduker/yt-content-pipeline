# growkaz-ifverse v2 (draft 2026-11-10; frozen after WI02 ships)
Copy of v1 (library/styles/growkaz-ifverse/v1) with stronger direction. Same engine, the same pinned GrowKaz kit v1.1.0
(sha256 in v1/STYLE.md), the same look rules unless changed below. First used by WI02 "hear what they think".

## Changes from v1
### 1. Story-first direction
- **DIRECTION.md before any code** (mandatory): cast bible, set bible, motif list, then one row per shot (size, angle, acting, mood, graphic, transition, sound).
- **Every episode has one signature motif** that shows the impossible rule on screen, the same way every time (WI02: "thought threads").
- **Colour arc:** the hero's colour item is his identity. A story may take it away and give it back on purpose (v1: never changes).
  Mood changes with the time of day: morning golden → office interiorCool → train dusk → evening interiorWarm.

### 2. Acting (the biggest gap in v1)
- Every action has 3 phases: **anticipation** (0.15–0.3 s opposite move) → **action** → **settle/follow-through** (overshoot by 5–10%, ease back).
- Expressions change **on the word** (wordTime), at least one per line in close shots; listeners react (cut to them or keep them in frame).
- **Eye lines are aimed:** every figure in focus has `look` set at a person or a prop, never blank forward.
- **Idle life:** breathe() on everyone; extras have idle loops (sip, scroll phone, turn page), a different seed each.
- **Hands carry props** (cup, napkin, phone, cardboard sleeve) and use them while talking.

### 3. Shot grammar
- **Coverage per dialogue beat:** establishing wide → medium two-shot → over-the-shoulder → giant-face reaction. No two same-size shots in a row unless deliberate.
- **Hub set with fixed geography** (WI02: the café). 180° rule: hero on the left facing right in every conversation.
- **Cut on action** and **match cuts** on shapes (cup → cup, napkin → napkin) instead of flashes. Flash only for the power's first appearance.
- Median shot 2.6 s; emotional holds up to 6 s only when the acting keeps moving.
- **Camera:** subtle drift (z ≤ 1.04, x ±20). Character motion carries the shot (RULES: no Ken Burns).

### 4. World detail
- Every wide has **2–4 ink extras with idle loops** and **one foreground blur element** (60%+ of mediums).
- Set dressing list per set (DIRECTION.md); living details: cup steam, a door sign that swings, train window lights sliding past.
- Invented signage only (our own brands, e.g. "Kettle & Crumb" café). No real logos.
- **Inserts** (10%+): hands, napkin, phone screen, cup sleeve. Big, simple, background blurred.

### 5. Voice
- **Multi-voice cast:** narrator (am_michael) + one Kokoro voice per speaking character. Spoken lines = dry and close.
  **Thoughts = the same character voice, softer, with a short reverb and a low-pass**, panned slightly toward where the thinker stands.
- Exact word timings from the timed Kokoro model (pipeline/make_timed_kokoro.py) for every voice.

### 6. Captions
- Karaoke chunks for narration and spoken lines (uppercase, keyword yellow), as v1.
- **Thoughts are NOT in the caption bar:** they appear in the world (the motif), in the thinker's colour. So the same words never show twice.

### 7. Sound
- Room tone per set, always on (Vivek disliked a total-mute moment): "silence" = music drops out, room tone stays.
- Real licensed recordings first (/real-sound: CC0/CC BY with credit) for cups, chairs, the coffee machine and the train; kit synth SFX only as a fallback.
- Music from /pick-music; music −18…−22 dB under voice; master −14 LUFS / −1 dBTP; check with earshot.

### 8. QA before the full render
- Contact sheet of every shot (`--sheet --scale 0.4`) **plus three 5-second motion clips** (one dialogue, one motif, one 3D) to judge acting, not just stills.

## Files
- project/: copy of v1/project (config, cast, sets, 01_all.js patterns) as the starting point.
- First episode: channels/stickman/what-if/2026-11-10-wi02-hear-what-they-think.
