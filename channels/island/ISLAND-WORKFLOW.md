# Island channel · weekly content workflow (any Claude session follows this)
Rev 3 · 2026-11-18: gated production pipeline (§3b), built after Vivek's review of the rendered weeks ("rework the entire video carefully"). Rev 2 · 2026-11-16: tested end to end on week 4 (S43–S56, CH04).
Trigger: Vivek/JP says "prep next week for the Island" (or "/island-week"). Output: a **render kit** (.tgz) unpacked into `channels/island/`, rendered on Vivek's GPU with two double-clicks. Claude never renders final picture in the cloud (software GL ≈ 1–5 s/frame); low-res cloud previews are for review only.

## 0. Read first (in this order, and nothing else unless needed)
1. `channels/island/WORLD.md`: canon (characters, places, coordinates, solved/open mysteries, episode index, the feedback log in §7).
2. `channels/island/QA-*.md` (latest): what went wrong last time and the rules that came from it.
3. The last week's `engine/tools/weekN.py` and `chapterN.py` (the templates you copy), and `engine/tools/s20v2.py` (the beat-grammar pilot: the shape every Short now follows).
4. Vivek's latest feedback in the chat (favourite characters, twists that landed, what bored him): append it to WORLD.md §7 before writing.

## 1. Brief Vivek (one message, before building)
Give the next chapter's plot in ≤ 12 lines: chapter title, the "how" that gets solved, the twist, new character/place (max one of each per week), the cliffhanger into the next chapter, and the day-by-day 14 titles. Ask only if a choice is his to make (e.g. a big reveal). If he says go, or is not there, build.

## 2. Write the week (cloud, in `tools-lemo/styles/island-engine/tools/`)
- Start `week{N+1}.py` with `import sys; from island_common import *; ROOT = sys.argv[1]; S = []` and end it with `write_week(S, THUMB, ROOT)`. `island_common.py` holds the helpers, the place coordinates and **proven cameras** (`CAM['quay_wide']`, `CAM['cave_out']`, `CAM['rocks']`…). 14 Shorts, 2/day, codes continue, dates = next Mon→Sun. Each Short: `hook` (≤ 14 words), `ask` (the cliffhanger question), `thumb` + `thumbText`, `music.mood` (mystery/day/dusk/tense/dread).
- **Beat grammar (rev 3, replaces "3 shots per Short"):** one shot per narration line (two short lines may share a shot only if they describe the same picture). The picture shows exactly what the line says: an action named in the narration is performed (`acts`: sneeze/jump/flinch/shiver, `poses`, `faces`), an object named is in frame (`carry`, `insert:'locket'` close-up, `props`), a sound named has its sfx (`events`), a character named but not in frame is listed in `offscreen`. Cuts inside a scene are hard cuts (`hard()`); a surprise gets a `punch` crash zoom; close-ups are `dive` and aim at the face. Never cut between two shots of the same framing; no shot holds longer than ~6 s without a cut or a move. The last shot holds still under the question and the outro (`camEnd`, automatic).
- Copy `chapterN.py` → `chapter{N+1}.py` (keep its `take()` header; replace only the `shots` list and the CH code/title): cold open → card → "Previously" recap → the 14 Shorts via `take()` → 2–3 bridge scenes + 2 "Solve it" pauses → tease → title card. Target 9–11 min.
- New character: a variant of an existing maker first (the Shade = Crane recoloured); otherwise draw in `engine/cast.js` (34×50 px, one signature colour, pose table, add to MAKERS + poseFrame), voice in `tools/lines.py` VOICES, role in `engine/ui.js` ROLES. New place/prop: `engine/world.js` (+ coordinates into WORLD.md §3). New words the aligner does not know (names, coined words): add a line to `tools/island.dict` (CMU phones).
- **Rules from QA (do not break):** a clue the narration names must be visible in that shot; a key character on the north rocks stands **in front of** the wreck relative to the camera; no more than 2 Shorts in a row at the same place/framing; day ≥ 4 Shorts/week; never a near-black frame (night dives need `lit` ≥ .6 or a practical nearby); narrator speed 1.0, gaps .45 s.

## 3. Build the kit (one command, ~25 min, runs in the background)
```
cd /home/claude/tools-lemo   # clone github.com/lemomo-ai/lemo-opuscar here if missing; npm install; .venv with kokoro-onnx soundfile librosa scipy pocketsphinx; sh tools/fetch.sh voice; sh tools/fetch.sh instruments vsco2ce
cp -r <repo>/channels/island/engine styles/island-engine && cp <repo>/library/fonts/cinzel-cormorant/*.ttf styles/island-engine/fonts/
styles/island-engine/tools/make_kit.sh week{N}.py chapter{N}.py /home/claude/island/w{N} <yyyy-mm-dd>-ch0{N}-<slug> /mnt/user-data/outputs/island-week{N}-kit.tgz
```
Before packaging finishes, write `w{N}/extra/WEEK.md` (14-row table) and `w{N}/extra/PUBLISH-CH.md`. The kit ships audio as FLAC and makes `shorts/render-week{N}.bat` + `long/render-long-week{N}.bat`. **The kit is only handed over after §3b passes for every Short.**

## 3b. Production gates (since 2026-11-18, non-negotiable): nothing is packaged or rendered until all six pass
Each gate has a tool, a pass condition and an owner. A Short that fails a gate goes back to the step that caused it (fix the root cause in the script, the shot or the engine, never patch the output).
| Gate | What is checked | Tool (in `engine/tools/`) | Passes when |
|---|---|---|---|
| G1 Script ↔ voice | every line is spoken word for word | `words.py <dir>` (forced alignment, cloud) then `verify_narration.sh` (Whisper, on Vivek's PC in WSL) | words.py: 0 FAIL (warnings listed and checked by ear); NARRATION-CHECK.md: every line matches |
| G2 Word timing | each caption word appears when it is spoken | `words.py` writes `voices/align.json`; `timeline.py` puts the times on each line | no missing word times; a merged word is split at the real gap in the audio (valley, not the middle) |
| G3 Picture ↔ narration | one shot per narration beat; what the line says is on screen in that shot (the action, the named character, the clue) | the shot list in `<short>.py` (beat grammar: hard cuts, `punch`, `acts`, `insert`, `offscreen`) + `audit.mjs` + `audit.py` | audit: 0 FAIL (hero in frame and unblocked, face clear of captions/plates, tags only on visible characters and never over the hero, nothing outside the Shorts safe area 60–930 × 230–1440) |
| G4 Sound | narration always on top; every effect audible but never louder than the voice | `mix.py` (sidechain ducking) + `audio_check.py` | every word's voiced core ≥ 9 dB above the music + ambience; every sfx event sounds; no clipping; no silence holes |
| G5 One timeline | captions, cuts, sfx, tags, plates and outro all read the same `timeline.json` | `timeline.py` (only source of times) | rebuilt after ANY change to lines, voices or shots, then G2–G4 re-run |
| G6 Whole-film review | watch it, frame by frame and with sound | `preview_full.sh <dir> out.mp4` (low-res, frames named by index) + contact sheet every 0.5 s labelled with shot and spoken words | a person (Claude, then Vivek) has looked at every sheet: focus on the hero's face, colour of each character the same in every shot, no jump cut to the same framing, no shot that holds > 6 s without a change, no tag/plate over a face, ending complete |

Lessons that made these gates (2026-11-18): preview frames sorted as text came out of order (fixed: index names); captions lingered/overlapped and sat inside YouTube's bottom UI (fixed: word-synced captions inside SAFE); music masked speech by up to 8 dB (fixed: sidechain ducking); the last shot kept pushing under the question plate (fixed: `camEnd` hold); name tags outlived their shot or appeared for characters off screen (fixed: capped to the shot and to a crash zoom); the tilt-shift band was a fixed 15 % strip at chest height, so close-ups had soft faces (fixed: band covers the hero's whole body, centred towards the face); Rollo turned green under the cave's teal light (fixed: identity guard self-light per character); a merged word ("for it") got the wrong split (fixed: valley split). The automated audit cannot see focus, colour drift or a repeated framing, which is why G6 is a human look and not a script.


## 4. Check before handing over (non-negotiable, part of G6)
- Per Short: `preview_full.sh <dir> preview.mp4` and a contact sheet every 0.5 s labelled with the shot id and the words being spoken at that moment. Look at every tile. Typical misses the scripts cannot see: soft focus on the hero's face, a character's colour changing between shots, two consecutive shots with the same framing, a shot that is mostly empty rock or wall, a tag or plate over a face.
- Chapter: render 4–6 stills **in one call** (`still.mjs <ch> t1 t2 …`): bugs that only appear after a previous shot (e.g. the cave-after-exterior black frame) are caught only that way.
- Timelines: every Short 30–59 s; chapter 9–11 min.
- Lighting: windows and lamp posts dim when the camera is close, but a window right behind a dusk close-up still blooms: frame dusk dialogue away from windows.
- Camera traps: `top` cameras over the cliffs/barge come out as blurred rock or empty boxes; cave: keep people away from the foghorn at world (-97.5, -93.5) and shoot from the cave centre outward; a `stage` camera with az ~150–170 at the quay or cliff ends up inside a wall or hedge.

## 5. Deliver
SendUserFile the kit → device_commit_files (by fileUuid) to `C:\Users\Vivek Sai\Downloads\YouTube\_xfer\` → on the device shell, from the repo root: `python3 channels/island/engine/tools/unpack_kit.py _xfer/<kit>.tgz` and **re-run until it prints DONE** (device shell calls die at 180 s; the script stops at 150 s and resumes, and turns mix.flac into out/mix.wav). Then check every out/mix.wav duration equals its .flac. Offline fallback for Vivek: `tar -xzf "$HOME\Downloads\island-week{N}-kit.tgz" -C "C:\Users\Vivek Sai\Downloads\YouTube\channels\island"`.
Vivek runs `engine/tools/verify_narration.sh` in WSL first (G1, Whisper word-for-word check → `channels/island/NARRATION-CHECK.md`), then double-clicks `channels\island\shorts\render-week{N}.bat` (≈ 1 h 10 for 14 Shorts on the GTX 1650), then `channels\island\long\render-long-week{N}.bat`. Folder names start with the planned publish date; the channel has not launched yet, so dates/folder names will change at launch. Any ps1 takes `-Force`. A Short re-renders whenever its timeline.json is newer than its final mp4.

## 6. After he watches (the retro)
Ask for: favourite moment/character, which twist landed, where he got bored, which hook he'd click. Write it to WORLD.md §7 and, if it is a rule, to §2/§3b here and memory/RULES.md. Update WORLD.md with the new canon. Commit (VivekSai07, no AI co-author), Vivek pushes.

## Known engine facts
- Times: day dawn dusk night storm cave · lamp: on/off/{flicker,len,back}/{out}/{on_at} · cave under-lamp: `under: 'on' | 'off' | seconds` · props: wreck prints ship coat barge cshadow cables · shot keys: `printsAt`, `printsCol`, `farlight {from,to}`, `ringAt`, `lightsOut`, `puffs [{t,at,n,dir,speed,size,col}]`, `rings [{t,at,r,col}]`, `insert:'locket'`, `offscreen [names]`, `events [{t,kind}]` (sfx: sneeze squeak tick chain splash bell …) · cast spec: at/to/walk/pose/poses/face/faces/acts/hide/carry/hero/eye/lit/y/dy/shadow/tag · camera: `aper` = depth-of-field strength (lower = sharper), `ease` in/out/lin, `punch {t,k,shake}` crash zoom, `lookOff`.
- Focus (rev 3): the tilt-shift sharp band follows the hero's whole body on screen, centred towards the face (main.js `bandOf`). Colour (rev 3): every character keeps part of its own colour as self-light (world.js identity guard: .32 in the cave, .12 at night; the stranger at a third of that) so coloured practicals tint without changing who they are.
- Cameras: map(from,to,look,look2,band) · track(side,h,d,lead) · stage/dive/orbit(at?,az,d,h; no `at` = follow hero) · top(h). Portrait: fov ×1.45, height ×1.15. `dive` aims at the face (FACE heights per character in world.js).
- UI: hook plate, question plate, word-synced captions (y 1250, current word gold), dialogue box (words appear as spoken), name tags (first appearance; capped to the shot and to any crash zoom; `tag: false` skips), chapter `card`, `solve{q,secs}`, end `title`. Everything inside the Shorts safe area (x 60–930, y 230–1440 of 1080×1920).
- Endings: 4.8 s outro after the question; styles rotate `['lamp','mabel','log'][n % 3]`; no narrator line; `tools/set_next.py` sets the next part; hit times in ui.js `outro()` must match `OUTRO_HITS` in mix.py.
- Render on Windows: render-week.ps1 (9:16, 1080×1920@30) / render-long.ps1 (16:9). A "page.screenshot timeout" is a GPU hiccup: run the .bat again.
