# Progress, feedback and unresolved work

## Art reference
`assets/references/01-original-ABC-direction.png` is the first three-direction image. Vivek liked B and C. B gives the character/acting direction; C gives atmosphere/cinematography. The latest approved character appearance comes from the illustrated sprite master, not the rejected geometric redraw.

## Experiments
| Version | What was made | Feedback / status |
|---|---|---|
| V1 | Original 26-second time-freeze story; painted workshop; procedural geometric character; code effects; local Kokoro narration; original synthesized music/SFX | Vivek rejected the character as unappealing compared with the original sample. Do not reuse that head design. |
| V2 | Reference-derived illustrated character parts, four expressions, shoulder-rotated whole-arm sprite | Vivek liked the character visuals and preservation. He flagged left-hand/body overlap and wrong-handed motion. Whole bent-arm rotation is not a finished rig. |
| V4 (rig-v4, 2026-11-13) | Keyframed acting channels (lean, drop, head, per-arm targets, hand poses), fixed elbow signs, mirrored left open palm, prop grip frames, world-pinned handovers, sway; 10 s exercise + AA01 Short | Inspected frame-by-frame by Fable/Opus; **awaiting Vivek's verdict**. See development/rig-v4/README.md |
| V3 | Arm-free torso, separate upper/lower sleeves/hands; independent two-bone arm chains; fixed bone lengths; constrained left wrist; watch grip attachment; planted feet | Five kinematic checks pass and motion strips inspected. Latest delivered test, **not user-approved motion**. Continue refining before production. |

The face PNGs (`curious`, `happy`, `awe`, `fear`) in V3 are byte-identical to V2. Body repair required new costume pieces; preserve their texture and proportions when improving the rig.

All tests are 26.000 seconds, 1920×1080, 24 fps, 624 frames, H.264 video/AAC sound. Narration was independently transcribed and all intended words recovered. Audio reused between versions. Last measured master: about -14.8 LUFS integrated and -1.4 dBFS true peak. Word-highlighting timing is estimated within each narrated line, not forced-aligned.

## What the test does NOT prove
- No full 3D character turns, real walk cycle, continuous dialogue lip-sync or superhero combat.
- No production-ready Marvel character model. Earlier Avengers image attempts were rejected by the image service; do not claim those samples exist.
- No verified native Windows/browser/Three.js integration. Native Canvas produced these previews on the available Linux host after Chromium launch failed on socket permissions.
- No full-speed human audiovisual review; automated tests and inspected frames are useful but limited.
- No uploaded/published new YouTube video, no applied About update and no verified growth outcome.

## AA01 (2026-11-13)
First series Short built: `episodes/2026-11-12-aa01-doom-saves-the-multiverse-short-test/final/what-if-doom-was-saving-the-multiverse.mp4` (42.9 s, 1080×1920, −14.7 LUFS). Candid QA in its QA.md: Doom/city are code-drawn and flatter than the painted hero; no machine listening (Hugging Face unreachable on the build VM). Repeatable process: `workflows/alternate-avengers-short.md` + skill `/aa-short`.

## Next work (superseded in part by AA01, kept for history)
Fable should first compare the original B/C reference, V2 and V3. Keep the approved face/texture; improve motion through a short rig exercise with independent arm gestures, plausible wrist orientation, fixed prop contact, torso support and grounded feet. Fable may replace the implementation if a better rig preserves the look. Then build the first vertical Alternate Avengers test from its brief, using original dialogue and score.

## Source / delivery continuity
Original source commits: `7c2db81` (V1), `3ef4bb5` (V2), `f49c941` (V3). A previous push was blocked by automatic approval review because external repository publication had not been explicitly authorized. No successful remote push was claimed. Later commits organize the material under this series. This session cannot access `C:\Users\Vivek Sai\Downloads\YouTube`; the transfer package and its importer are provided to complete the local save there. No `HANDOFF.md` edits.
