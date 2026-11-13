# Rig v4 — acting rig for the mustard-jacket hero (+ shared cast drawing)

Replaces the V3 `bodyPose(lift,leftGesture,recoil)` sliders with **keyframed channels** so any shot can be acted.
Keeps the approved V2 face PNGs and the V3 body-repair sprites unchanged (`assets/characters/mustard-hero/v1/`).
Status: **Fable/Opus-inspected, not yet Vivek-approved as finished animation.**

## Files
| File | Role |
|---|---|
| `rig4.mjs` | pure math: eases, `sample()` keyframe channels, two-bone IK `solveArm`, `heroPose`, `swayAngle` |
| `cast.mjs` | drawing: `loadSprites`, `drawHero`, `heroGripWorld`, `drawWatch`, `drawWardenHand` (the "great hand"), `handFrame` |
| `rig4.test.mjs` | `node --test rig4.test.mjs` — 7 geometry/timing checks (necessary, NOT sufficient) |
| `exercise.js` | 10 s acting + handover exercise (1080×1920); the template for testing any new action |
| `render.mjs` | native canvas renderer: `--film X.js --stills t1,t2 [--rig]` or `--out f.mp4 [--f0 N --f1 M]` |
| `tools/sheet.mjs` | contact sheets/strips from stills |
| `tools/audio-qa.py` | model-free audio QA (voice-over-bed per line, hush, clipping) |
| `tools/new-aa-episode.sh` | scaffold a new episode from AA01 |

## Channels (all optional; times in film seconds; `[t, value, ease]`, ease applies to the segment ENDING at that key)
- `ex` (step): `curious | happy | awe | fear | suspicious` (suspicious = curious art)
- `lean` rad about the hip (+ = toward screen-right), `drop` px (+ = down: effort/settle)
- `headTilt` rad, `headNod` px
- `armR` / `armL`: wrist TARGET `[x,y]` in torso space. Rest: R `[64,-128]`, L `[-58,-130]`. Shoulders R `[38,-249]`, L `[-22,-247]`. Reach ≈ 127.
- `armRBend: [[0,1]]`, `armLBend: [[0,-1]]` — never change the sign (that was V3's "wrong elbow" look).
- `armRHand` / `armLHand` (step): `rest | open | closed`. Open palm auto-mirrors on the left arm.
- `armRWrist` / `armLWrist`: `9` = automatic wrist; a number = extra radians on top.
Eases: `smooth` (default), `in`, `out`, `back` (decisive, ~10% overshoot then settle), `backSoft`, `linear`.

## Layering (fixed in `drawHero`)
contact shadow → legs (never move) → far/left arm → torso (rides lean/drop/breath) → left shoulder seam patch → near/right arm (+ held prop) → head.

## Props
`drawHero(..., {prop:'R'|'L', propSway, propActive})` draws the watch in that hand's grip frame.
`heroGripWorld(S,t,anim,{x,y,s},'R')` returns the grip point in world px: **use it to compute every handover point.**
Handover = pin the prop in world space at that point from just before the receiver closes until it has closed, then parent it to the receiver. See AA01 `film.js` (`XFER1`, `XFER2`) and `exercise.js`.
