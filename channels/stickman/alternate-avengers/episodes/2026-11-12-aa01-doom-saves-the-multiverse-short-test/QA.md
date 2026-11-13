# AA01 QA — candid report (2026-11-13)

**File:** `final/what-if-doom-was-saving-the-multiverse.mp4` · md5 c037b1fb0908b8268291ec1e1bdd3816
42.89 s · 1080×1920 native vertical · H.264 High yuv420p 24 fps (1,029 frames) · AAC 48 kHz stereo 192 kb/s · 14.6 MB
Loudness −14.7 LUFS integrated, −1.37 dBTP. Full decode clean. blackdetect: 0 segments. Left-edge luma never pure black.

## What was verified, and how
| Check | Method | Result |
|---|---|---|
| Rig geometry | `development/rig-v4/rig4.test.mjs` (7 tests) | 7/7 pass: fixed bone lengths, independent arms, elbows never cross centreline, back-ease settles, sway decays, hand poses step (never blend) |
| Acting/handover exercise before the episode | `development/rig-v4/exercise.js`, rendered 10 s clip + 0.08 s contact strip | Watch pinned in world space while fingers close; hero releases only after grab; no teleport, no double-hold |
| Handover contact points in the episode | Grip positions computed from the rig (not eyeballed): XFER1 (587,1129), XFER2 (515,1238) | Hero grip and pinned watch coincide at both handovers |
| Picture | 1 fps contact sheet over all 43 s + targeted stills | Inspected; fixes below |
| Voice vs bed | RMS of voice stem vs ducked music+SFX stem per line | Worst 9.3 dB (hook line), 9.8–30 dB elsewhere |
| Silence before "Take mine" | RMS of the 1 s before the line | −41.7 dB vs −23.8 dB mix average (a real hush) |
| Clipping / DC | sample scan | 0 samples ≥ 0.999; DC −0.00015 |

## Defects found in QA and fixed before final
1. Reveal: Doom stood *beside* the fissure, not holding it → moved into the tear; fissure drawn in two passes (dim behind, bright in front) so he reads as braced inside it.
2. Loss beat: passers-by were navy-on-navy and invisible on a phone → near-black with teal rim + lamp spill; third walker crosses close in front of the hero.
3. Ending: card cut in 0.9 s after Doom's last word, so the walk-away was only a few frames → 3.3 s walk-away beat before the card.
4. Black strip on the left edge at camera zoom 1.0 and during the hook shake → sky now bleeds 600 px past the frame.
5. **Hook line masked:** "Then the sky split open" was only 4.6 dB over the crack boom → boom/tear halved, sub rumble moved to swell after "open" (now 9.3 dB).
6. **"Take mine" hush wasn't quiet** (only ~4 dB under average) → hum/drone/score drop ~14 dB in that window; room tone stays.
7. Handover: watch was drawn under the closing fingers → drawn on top while pinned.

## What was NOT verified (be aware before posting)
- **No machine listening.** The studio's `earshot` skill needs CLAP/AST models from Hugging Face, which this VM cannot reach (download.pytorch.org also blocked). Realness, tagging and sync scoring were not run. Only the measurements above were.
- **No ASR transcription check** (Whisper also needs Hugging Face). Kokoro is reliable on plain English, but nobody has confirmed by ear that "Doom", "volunteered" and "timeline" are pronounced well. **Listen once before posting.**
- **Caption word timings are estimated** from character weights inside each measured line, not forced-aligned. Expect ±~150 ms drift inside longer narrator lines; line starts/ends are exact.
- No human full-speed review by me; I inspected frames and strips, not real-time playback.

## Known weaknesses (honest creative notes)
- **Style mismatch.** The hero is the approved painted sprite set; Doom, the city and the great hand are flat code-drawn vector shapes. Side by side, the hero looks richer than his world. This is the biggest visible gap versus the B/C concept art. The fix is painted Doom/environment assets (see the workflow's art step), not more code.
- **Doom is an original "dark sovereign" design** (obsidian figure, teal eye-lights; no green cloak, no metal mask). It avoids copying the franchise costume, but fans may not recognise him without the narration. Deliberate trade-off; revisit when you decide how close fan art should go.
- **The hero never walks.** The legs are one standing sprite, so every shot is staged as standing acting. A real walk cycle needs separate thigh/shin/foot art.
- **Expression changes are hard swaps** between the 4 approved heads (no in-between), and the hero has no mouth animation while speaking.
- The mother beat is a small framed photo fading; on a phone it may read as just "a window". The narration carries it.
- The great hand's forearm is a long rounded slab; fine in motion, plain in a still.

## Verdict
Technically clean and publishable as a **test** Short: the story lands in 43 s, the handovers are physically correct, the audio levels are sound, and it's labelled as fan fiction in the corner, the end card and the publish sheet. The art level of Doom and the city is below the hero's and below the concept sheet. Treat this as AA01's baseline, not the series' ceiling.
