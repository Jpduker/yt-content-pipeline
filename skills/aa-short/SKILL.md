---
name: aa-short
description: Turn a story script into a finished Alternate Avengers YouTube Short (1080x1920, 35-50 s) for Between the Ifs, with the mustard-jacket hero rig, voices, original score, captions and QA. Use for 'make an AA episode', 'new Alternate Avengers short', 'AA02', or a pasted what-if superhero script.
---

# Alternate Avengers Short

Follow `workflows/alternate-avengers-short.md` in the workspace root, every step in order. The reference episode to copy and
compare against is `channels/stickman/alternate-avengers/episodes/2026-11-12-aa01-doom-saves-the-multiverse-short-test/`
(read its SCRIPT.md, film.js, score.py and QA.md before writing anything).

Non-negotiables (each one cost a real defect in AA01):
1. Every beat time derives from `audio/timeline.json`; `film.js` and `score.py` use identical formulas.
2. New actions get a rig exercise first, and you OPEN and look at the stills/contact strips. Tests passing ≠ good motion.
3. Handover points come from `heroGripWorld`, never typed. Props are pinned in world space while the receiving hand closes.
4. Hand poses switch only on contact frames; elbow signs R +1 / L −1; feet never move; the body leans with the reach.
5. `audio-qa.py` must PASS (every line ≥ 9 dB over the bed, hush before the turning-point line, no clipping).
6. Backgrounds bleed 600 px; silhouettes get rim light; nothing important under the right-side Shorts buttons.
7. Fan-fiction label in the corner, on the end card and in the description. No franchise footage, score or traced costume art.
8. QA.md is candid: list what was NOT verified. No push / upload unless asked. No AI co-author lines in commits.

When the user's script is thin, improve it (hook on a visual word, hero acts at the turning point, one object changes hands, twist last line,
question card) but keep their premise and twist, and tell them what you changed.
