# Island STYLE TEST: "The Bottle That Lied" (2026-11-08) — for Vivek's strict review
Why: Vivek did not like the island caption style and saw many visual errors in CH01 (channels/AUDIT-2026-11-08-ch01-fm01.md).
This 24 s riddle Short tests a different look for the whole channel before CH01 is rebuilt.

| Part | Choice | Why |
|---|---|---|
| Look | lemo **paper-popup** grammar, drawn in 2D canvas: a pop-up book on a warm desk; every piece is a cut-paper card (brown ink, off-white border, cardboard edge, grain) that rises from the page with an overshoot, back to front. Cuts are page turns. | An island told as a storybook: cosy + mysterious, unlike any stickman/whiteboard riddle channel; reads well on a phone. NOTE: lemo's full paper-popup is 3D (HDRI desk, macro lens, depth of field); this is the fast 2D take. If Vivek likes it, the 3D version is the upgrade path (slower renders). |
| Characters | Gus as a paper puppet with brass split-pin shoulder joints (same colours as his sheet: navy cap + mustard badge, white beard, red nose, coral/white stripes) | keeps the cast, new material |
| Hook (0–2.4 s) | "This message in a bottle is lying." + the bottle bobbing big in the front waves | a claim + an object, in the first second |
| Riddle | Note: "Help! My ship sank yesterday." The bottle is covered in barnacles. Barnacles take weeks to grow → the note can't be from yesterday. | fair: the clue is ON SCREEN during the countdown (no card covers it) |
| Countdown | "PAUSE & LOOK" tab + a 3-2-1 paper dial, woodblock ticks, clue unobstructed | fixes audit item 7 |
| Ending / cliffhanger | "So who wrote 'yesterday', and why?" + a dark paper ship appears on the horizon; sign drops on strings: WHO WROTE IT? · Chapter 2 Saturday | open loop into the chapter |
| Captions (NEW) | **pull-tab strip**: a torn paper strip slides out of the page per phrase; the spoken word gets a yellow highlighter swipe; unread words are faint ink. Word-exact timings from the voice model. | replaces the white kinetic card |
| Voice | Kokoro am_michael (narrator), timed model (pipeline/tts_timed.py) | captions land on the exact word |
| Music | Toy-box mystery on real samples: pizzicato strings walk, staccato clarinet tune, glockenspiel stings, kalimba, woodblock ticks; D dorian 100 BPM; tremolo bed under the countdown; major AHA arpeggio on the answer; half-step cello "?" on the final question | the style guide's palette (whimsical acoustic / toy-like) |
| Foley | paper pops, page swishes, crinkle, scribble, calendar flips, cardboard thump — on the exact frames from events.json | the signature of the style |
Fonts (OFL): Fredoka, Lilita One, Patrick Hand (fetched from github.com/google/fonts).
Build: `sh build.sh` (needs lemo + timed Kokoro: pipeline/make_timed_kokoro.py).
