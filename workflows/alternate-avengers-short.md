# Workflow: Alternate Avengers Short (script → posted-quality MP4)
Reference implementation: `channels/stickman/alternate-avengers/episodes/2026-11-12-aa01-doom-saves-the-multiverse-short-test/`
(AA01, 42.9 s, built 2026-11-12/13). Rig: `channels/stickman/alternate-avengers/development/rig-v4/` (read its README).
Skill: `/aa-short`. Any model can run this; the quality comes from following the **look → fix → look again** loops, not from talent.

## 0. Before anything (5 min)
- `sh pipeline/sync.sh` (team rule 1). Read `memory/TASTE.md`, `memory/RULES.md`, then the series docs in this order:
  `alternate-avengers/README.md`, `SERIES.md`, `STYLE.md`, `PROGRESS.md`, `ASSETS.md`, and AA01's `QA.md`.
- Hard boundaries: this series uses ONLY the mustard-jacket hero (`assets/characters/mustard-hero/v1/`) plus series-local characters under
  `alternate-avengers/assets/characters/<name>/<ver>/`. Never the green-hoodie cast, Whispers cast, or kids assets.
- Always **unofficial fan fiction**: corner label on every frame, a line on the end card, a line in the description. Never "leak", "confirmed", "official".
- No franchise footage, frames, logos, film score or traced costume art. Original music/SFX only.
- Do not edit `HANDOFF.md`. Do not push or upload unless the user asks in this session.

## 1. Script pass (the story is the product)
Take the user's script/seed and rewrite it for **performance**, keeping their premise and twist:
1. **Hook ≤ 2 s**: the first line names the familiar character and an impossible event, and a *visual event lands on a key word* ("split").
2. 8–12 lines, 35–50 s total. Narrator lines ≤ ~14 words; dialogue lines ≤ 7 words. Read every line aloud in your head: no commas the voice can't land.
3. **The hero acts in his own voice at the turning point** (AA01: "Take mine." instead of narration saying he volunteered).
4. **One physical object carries the emotion** and changes hands on screen (AA01: the watch, given and returned). Write a "who holds what" column.
5. The last spoken line is the twist; **cut to a question card, not a subscribe speech**.
6. Show loss with one simple image (passers-by not seeing him, a photo fading), not a montage.
Write `SCRIPT.md` as a beat table: `# | speaker | line | visual beat | hands/props`. The hands/props column is the **ownership ledger**: at every moment exactly one hand (or the world) owns each prop.

## 2. Scaffold
`sh channels/stickman/alternate-avengers/development/rig-v4/tools/new-aa-episode.sh aa0N-<slug>`
(copies AA01's film.js / voice.py / score.py / render.mjs / build.sh; node_modules is a symlink to rig-v4's).
First time on a machine: `cd .../rig-v4 && npm install --ignore-scripts` and `pip3 install numpy scipy soundfile onnxruntime kokoro-onnx espeakng-loader pyloudnorm`.

## 3. Voices (`voice.py`) — audio first, picture follows
- Edit `LINES`: `(id, speaker, gap_before_s, text, voice, speed)`. Cast: narrator `am_fenrir` 0.97–1.0 (channel voice); hero `am_puck` 0.94–0.98;
  Doom/villain `am_onyx` 0.88–0.9 + `doomify()` (−1.5 st + dark reverb). Other characters: pick a distinct Kokoro voice and record it in SCRIPT.md.
- Gaps: 0.9–1.2 s normal; **≥ 1.0 s before a turning-point line** (it gets a hush); 1.5 s after a big visual (heal/flash).
- `python3 voice.py` → `audio/<id>.wav`, `audio/timeline.json` (line + estimated word times), `final/*.srt`. Check `DUR` is 35–50 s (TAIL = walk-away + card ≈ 7 s).
- Delete a line's wav to regenerate only it. If a word is mispronounced, respell it in the text (e.g. "Doom" → "Dume") and note it.

## 4. Timing contract (never hard-code seconds)
At the top of `film.js` AND `score.py`, derive every beat from the timeline: `line('06').end+.85`, `word('01','split')[1]`.
Keep the two files' formulas identical (copy-paste). Then a re-voiced line moves picture and sound together.

## 5. Rig exercise first (whenever a shot needs an action AA01/exercise-04 didn't do)
Copy `rig-v4/exercise.js`, act the new action (new prop, new gesture, two-hand move), render stills + a 0.08 s contact strip and the clip:
`node render.mjs --film exercise.js --stills 1,2.4,4 --rig` → `node tools/sheet.mjs out/s.jpg 8 out/frame-*.jpg`, then **open the sheet image and look**.
Passing `rig4.test.mjs` proves geometry, never acting. Fix what you see, re-render, look again. Only then put it into the episode.

## 6. Acting rules (body mechanics — what made AA01 read as alive)
- **Anticipation:** before a decisive move, 0.2–0.3 s of a small opposite move (arm dips/pulls back 10–15 px, body drops 3–4 px).
- **Decisive moves use `back`** (overshoot ~10%, settle); falls/withdrawals use `out`; drifts use `smooth`. Durations 0.4–0.7 s.
- **Moving holds:** never two identical keys back to back for > 1 s; drift the target 2–4 px. Breathing/sway are built in.
- **The body supports the arm:** reaching forward = `lean` +0.08…+0.12 toward the target, on the same keys as the arm; recoil = lean back past zero with `back`.
- **Effort/settle:** `drop` +4 px at the anticipation, −2 at the peak, back to 0.
- Elbow signs are fixed (R `+1`, L `−1`). Wrist targets stay ≤ ~125 px from the shoulder (reach 127) or the arm locks straight.
- **Hand poses change only on contact frames**: closed while holding, open to give/receive, rest when empty. Never blend.
- **Left/right independence:** while one hand holds a prop, the other gestures (AA01 "Why aren't you…" palm-up left, watch hand still).
- **Feet never move.** If the hero must travel, cut. (No walk cycle exists yet; don't fake one by sliding legs.)
- **Head leads, face follows:** tilt toward who is speaking/what he looks at 0.2 s before the line; change expression on the motivating word, not mid-word.
- **Listener reaction:** when another character speaks, the hero reacts 0.2–0.4 s after (tilt, small lean, expression), then holds.
- Big characters (Doom) move slowly; eye-lights pulse while talking; one decisive move per shot.

## 7. Prop handover recipe (zero tolerance for floating/teleporting props)
1. Ledger: giver holds → **pinned in world** (receiver's fingers close over it, 0.15–0.2 s) → receiver holds. Giver opens/withdraws **after** the close (+0.1–0.3 s).
2. Compute the pin point from the rig: `XFER = heroGripWorld(S, t_just_before, heroAnim, HERO_W, 'R')`. Never type coordinates.
3. Position the receiving hand so its grip lands exactly on XFER at the close (`pos = XFER − GRIP*scale`).
4. Draw order while pinned: receiving fingers first, prop on top (the pinch stays readable).
5. Add a `swayAngle` impulse at every stop/grab/release so a hanging prop swings and settles.
6. Verify with a 0.08 s contact strip cropped around XFER (sheet tool). Look at every tile.

## 8. Vertical composition and camera
- 1080×1920, never cropped from 16:9. Captions are 3-word karaoke chunks centred at y≈1560 (doom lines teal, others amber).
- Keep faces out of the right-side Shorts buttons (x > 940, y 900–1650) and above y≈1480. Corner label top-left.
- Camera = keyed `[cx, cy, zoom]` (1.0–2.1) with `smooth` eases; push in on emotional lines, wide for geography, tight (≈2×) on hand contacts.
- Every background must **bleed ≥ 600 px** past the frame (pans and shakes otherwise show black edges).
- Use light to separate: warm lamp on the hero side, teal from the fissure/villain; silhouettes need a rim light to exist on a phone.

## 9. Sound (`score.py`) — original only
- Music: sparse chords per section, one bell motif used 3× (intro, loss, ending), heartbeat under the "price" stretch, a riser into the release moment.
- SFX on every visual event in `window.EV`: crack/boom, hums, whooshes for big moves, clinks on grab/release, footsteps, ticks for the watch.
- Big impacts that land on a spoken word: keep them short and swell the rumble *after* the line ends.
- **Hush** before the turning-point line (bed ×0.2, room tone stays). Duck music+SFX to 0.42 under every line.
- `python3 score.py`, then `python3 rig-v4/tools/audio-qa.py <episode> --hush-before <id>` must print **PASS** (every line ≥ 9 dB over the bed, hush ≥ 12 dB, no clipping).
- If the studio's `earshot` can load its models on this machine, also run `earshot timeline` + `earshot critique` on the final and quote the numbers. If not, say so in QA.md.

## 10. Stills QA (before any full render)
`node render.mjs --film film.js --stills <one time per beat, plus every contact ±0.1 s>` → `node ../../development/rig-v4/tools/sheet.mjs out/sheet.jpg 10 out/frame-*.jpg` → **open it**.
Check every tile against this list (each item was a real AA01 defect):
- character placed where the line says (braced *inside* the fissure, not beside it)
- every figure readable on a phone (no navy-on-navy silhouettes)
- no black edges; captions not covering faces or the prop
- props owned by exactly one hand; elbows/wrists natural; no arm inside the torso
- the ending has air (walk-away/hold ≥ 2.5 s before the card)
Fix → re-render those stills → look again. Repeat until a full pass finds nothing.

## 11. Render + mux
The device shell times out at 180 s and kills background jobs, so render in segments (~320 frames ≈ 30 s each):
`node render.mjs --film film.js --f0 0 --f1 320 --out out/seg0.mp4` … then concat; or just `sh build.sh` (does voices, score, segments, concat, two-pass −14 LUFS mux).

## 12. Final verification (all must pass; paste numbers into QA.md)
```
F=final/<name>.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $F              # 35–50 s
ffprobe -v error -select_streams v -show_entries stream=width,height,nb_frames,r_frame_rate -of csv=p=0 $F   # 1080,1920,…,24/1
ffmpeg -v error -i $F -f null - && echo DECODE_CLEAN
ffmpeg -hide_banner -i $F -af loudnorm=I=-14:TP=-1.5:print_format=json -f null - 2>&1 | grep -E '"input_i|"input_tp'   # ≈-14, ≤-1.0
ffmpeg -hide_banner -i $F -vf blackdetect=d=0.5:pix_th=0.05 -an -f null - 2>&1 | grep -c black_start                      # 0
ffmpeg -y -loglevel error -i $F -vf "fps=1,scale=176:-2,tile=11x4" out/contact-final.jpg                                # OPEN IT
```
Extract `final/keyframes/` (one per beat) and `final/poster.jpg` (the hook image).

## 13. Paperwork, commit, retro
- `QA.md` with five sections: verified (method + result) / defects found and fixed / NOT verified / known weaknesses / verdict. Be candid; never claim a check you didn't run.
- `CREDITS.md`, `PUBLISH.md` (title ≤ 60 chars, description with the fan-fiction disclaimer, tags, "not made for kids", AI-voice disclosure).
- Add the row to `channels/stickman/CHANNEL.md`; update the series `PROGRESS.md`; one line in `memory/STATUS.md`.
- `git status` (no mp4/wav/node_modules) → `git add` only your paths → commit with the human's identity, **no AI co-author lines** (RULES Rule 4). Push only if asked.
- `/retro` with the user's reaction.

## New characters (e.g. a better Doom)
AA01's Doom is code-drawn and visibly flatter than the painted hero. To raise the bar: generate a painted model sheet in the B/C style
(front/¾, separated parts: head, torso, upper/lower arms, hands open/closed, legs) → save under `assets/characters/<name>/v1/` with a provenance note
in ASSETS.md → rig it like the hero (same layering, own shoulder points, two-bone arms) → run a section-5 exercise before using it.
Don't trace film/comic costumes; make an original interpretation that reads through silhouette, colour and narration.
