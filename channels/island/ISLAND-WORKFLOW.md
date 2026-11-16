# Island channel · weekly content workflow (any Claude session follows this)
Trigger: Vivek/JP says "prep next week for the Island" (or "/island-week"). Output: a **render kit** (.tgz) unpacked into `channels/island/`, rendered on Vivek's GPU with two double-clicks. Claude never renders picture in the cloud (software GL ≈ 5 s/frame).

## 0. Read first (in this order, and nothing else unless needed)
1. `channels/island/WORLD.md` — canon: characters, places, coordinates, solved/open mysteries, episode index, the feedback log (§7).
2. `channels/island/QA-*.md` (latest) — what went wrong last time and the rules that came from it.
3. The last week's `engine/tools/weekN.py` and `chapterN.py` — the templates you copy.
4. Vivek's latest feedback in the chat (favourite characters, twists that landed, what bored him) → append it to WORLD.md §7 before writing.

## 1. Brief Vivek (one message, before building)
Give the next chapter's plot in ≤ 12 lines: chapter title, the "how" that gets solved, the twist, new character/place (max one of each per week), the cliffhanger into the next chapter, and the day-by-day 14 titles. Ask only if a choice is his to make (e.g. a big reveal). If he says go — or is not there — build.

## 2. Write the week (cloud, in `tools-lemo/styles/island-engine/tools/`)
- Copy `weekN.py` → `week{N+1}.py`. 14 Shorts, 2/day, codes continue (S43…), dates = next Mon→Sun. Each Short: `hook` (≤ 14 words, the premise), 3 shots (establish → close/dive → reveal), 5–7 lines, `ask` (the cliffhanger question), `thumb` + `thumbText`, `music.mood` (mystery/day/dusk/tense/dread).
- Copy `chapterN.py` → `chapter{N+1}.py`: cold open (no words before the event) → card → "Previously" recap → the 14 Shorts via `take()` → 2–3 new bridge scenes + 2 "Solve it" pauses → tease → title card. Target 9–11 min.
- New character: draw in `engine/cast.js` (34×50 px, one signature colour, pose table, add to MAKERS + poseFrame), voice in `tools/lines.py` VOICES. New place/prop: `engine/world.js` (+ coordinates into WORLD.md §3).
- **Rules from QA (do not break):** a clue the narration names must be visible in that shot (`props`, blocking, camera); a key character on the north rocks stands **in front of** the wreck relative to the camera; no more than 2 Shorts in a row at the same place/framing; day ≥ 4 Shorts/week, cave/night/storm the rest; never a near-black frame (night dives need `lit` ≥ .6 or a practical nearby); narrator speed 1.0, gaps .45 s.

## 3. Build the kit (one command, ~25 min, runs in the background)
```
cd /home/claude/tools-lemo   # clone github.com/lemomo-ai/lemo-opuscar here if missing; npm install; .venv with kokoro-onnx soundfile librosa scipy; sh tools/fetch.sh voice; sh tools/fetch.sh instruments vsco2ce
cp -r <repo>/channels/island/engine styles/island-engine && cp <repo>/library/fonts/cinzel-cormorant/*.ttf styles/island-engine/fonts/
styles/island-engine/tools/make_kit.sh week{N}.py chapter{N}.py /home/claude/island/w{N} <yyyy-mm-dd>-ch0{N}-<slug> /mnt/user-data/outputs/island-week{N}-kit.tgz
```
Before packaging finishes, write `w{N}/extra/WEEK.md` (14-row table) and `w{N}/extra/PUBLISH-CH.md` (long-form title/description/tags/pinned/thumbnail) — make_kit copies them in.
make_kit does: voices (Kokoro) → timelines → original sampler score + ambience + foley mix → PUBLISH.md per Short → chapter (reuses the Shorts' voices, voices only new lines) → one QA still per shot in `w{N}/qa/`.

## 4. Check before handing over (non-negotiable)
- Open the QA stills (contact sheet): every shot readable, the hero visible, the named clue visible, no black/blown-out frames. Also render 4–6 chapter stills **in one call** (`still.mjs <ch> t1 t2 …`) — bugs that only appear after a previous shot (e.g. the cave-after-exterior black frame) are caught only that way.
- Timelines: every Short 30–59 s; chapter 9–11 min.
- Camera traps found in week-3 QA (fix before delivering): `top` cameras over the cliffs/barge come out as blurred rock or empty boxes, so use `stage`/`track` with the characters in frame. Cave: keep people away from the foghorn at world (-97.5, -93.5) and shoot from the cave centre outward. A `stage` camera with az ~150–170 at the quay or cliff ends up inside a wall or hedge. Re-render only the fixed shots with `still.mjs <dir> t` before repackaging.

## 5. Deliver
SendUserFile the kit → device_commit_files (by fileUuid) to `C:\Users\Vivek Sai\Downloads\YouTube\_xfer\` → unpack with python tarfile into `channels/island/` (writes in place; the device cannot delete). If the laptop is offline, give Vivek: `tar -xzf "$HOME\Downloads\island-week{N}-kit.tgz" -C "C:\Users\Vivek Sai\Downloads\YouTube\channels\island"`.
Vivek double-clicks `channels\island\shorts\render-week.bat` (≈ 1 h 10 for 14 Shorts on the GTX 1650; finished ones are skipped), then `channels\island\long\render-long.bat` (≈ 1–1.5 h).

## 6. After he watches (the retro)
Ask for: favourite moment/character, which twist landed, where he got bored, which hook he'd click. Write it to WORLD.md §7 and, if it is a rule, to §5 here and memory/RULES.md. Update WORLD.md §2–§6 with the new canon (facts per character, places, solved/open mysteries, episode index). Commit (VivekSai07, no AI co-author), Vivek pushes.

## Known engine facts
- Times: day dawn dusk night storm cave · lamp: on/off/{flicker,len,back}/{out}/{on_at} · cave under-lamp: `under: 'on' | 'off' | seconds` · props: wreck prints ship coat barge cshadow (Crane's smiling shadow on the cave wall) · camera `aper` = depth-of-field strength (lower = sharper) · cast spec: at/to/walk/pose/face/hero/lit/y/dy/poses/shadow.
- Cameras: map(from,to,look,look2,band) · track(side,h,d,lead) · stage/dive/orbit(at?,az,d,h; no `at` = follow hero) · top(h). Portrait: fov ×1.45, height ×1.15.
- UI: hook plate, question plate, subtitles, dialogue box (`dlg: NAME`), chapter `card`, `solve{q,secs}` countdown, end `title`.
- Render on Windows: render-week.ps1 (9:16, 1080×1920@30) / render-long.ps1 (16:9). A "page.screenshot timeout" is a GPU hiccup: run the .bat again.
