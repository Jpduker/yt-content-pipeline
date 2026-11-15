# The Keeper's Island · production bible v2 (2.5D pixel) — 2026-11-15, session 13
Channel 1 restarts in lemo-opuscar's **2.5D Pixel Art** style (tools/lemo-opuscar/styles/hd-2d). This file is the Island's source of truth from now on:
world, cast, sets, the shot grammar, the format of a chapter and its Shorts, and the chain that turns a story into a week of videos.
Earlier plan: memory/CHANNEL-PLAN.md · season draft: chapters/SEASON-1-BIBLE.md · style rules: STYLE-2.5D-PIXEL.md (name, licence, "don't copy their demo").

## 0. What the proof settled (lab/2026-11-15-proof01-twelve-seconds)
- The engine runs here: our own diorama (shore village + jetty, grass terrace with the keeper's cottage and cliff path, headland with OUR lighthouse: white tower, one teal band, copper dome), our own sprites (Gus, Mabel), three camera moves from the style's vocabulary, the lamp dying on cue, chapter card, subtitles, title.
- **Render speed is the constraint.** Cloud container = software GL (SwiftShader): ≈5 s per frame at 1280×720 without supersampling, ≈25–30 s per frame at 1080p with 2× SSAA. A 31 s proof at 720p24 takes ≈35 min on 2 workers. A 5-minute chapter at 1080p30 would take days in the cloud → **not viable**.
  → Island picture renders run on a GPU: Vivek's GTX 1650 under **Windows-native** Node + Chrome (not WSL: headless Chrome in WSL has no GPU), or JP's Mac (`LEMO_ANGLE=metal`). The library's own demo renders 1080p60 at 26–37 fps with 2 workers on a GPU machine (DEMO.md), so a 5-min chapter at 1080p30 ≈ 9000 frames ≈ 5–10 min there. *Unverified on the 1650: measure first (step 1 in §7).* The cloud stays for everything else: scripts, voices, stills, sheets, mix, QA.
- Fonts: fonts.googleapis.com is blocked from the cloud; the OFL variable TTFs come from github.com/google/fonts (Cinzel, Cormorant, Cormorant Garamond). Keep copies in library/fonts/ (OFL text alongside).
- `--size` only sets the viewport: a page must read `innerWidth/innerHeight` (our main.js does) or the still is a crop of a 1920×1080 canvas. The UI is authored at 1920×1080 and scaled onto whatever size renders.

## 1. World direction
**Premise.** One island, one lighthouse, one keeper, one mystery that never fully closes. Every night at 3:12 the lamp goes dark for twelve seconds; ships start to wreck; Gus swears it isn't him. Each chapter answers one question and opens a bigger one.
**Tone.** Cozy mystery with real stakes: Studio-Ghibli calm, Agatha-Christie fairness, a little dry humour from the animals. Never gory, never scary enough to lose the family audience, never childish enough to be classed "made for kids" (adult vocabulary, deadpan jokes, no talking-down). Narration: second-person is the What-If channel's voice; the Island is **third-person storybook**, slow (Kokoro am_michael, speed .82–.88), with one dry aside per chapter.
**Why this style is the world, not a skin** (STYLE.md §8 native moves → our plot devices):
| Native move | In the Island |
|---|---|
| Lights popping on one by one | the village waking; ships' lamps; the night the lamps go out one by one |
| The carried light as a meter | Gus's lantern = the audience's anchor in every dark beat; its brightness is his certainty |
| Shadows jump when a light is lit | clue reveals: a lamp is lit and a shadow is missing (the Stranger has none) |
| Tilt-shift preciousness | every chapter opens on the island as a toy: "here is the whole board, one piece is wrong" |
| Weather over the diorama | the storm nights; thunder = the lamp's failure drum |
| RPG grammar | chapter cards, dialogue boxes with the name plate, a "riddle card" (our own UI) |

**Rules of the world (for consistency and fairness).**
1. Every clue is on screen before it is used. Riddles are solvable by the viewer from what was shown.
2. One new place per chapter at most; the old places return changed (the style's "return to an earlier framing, changed").
3. The lamp, the clock in the lamp room, and the yellow coat are the three season props; they appear in every chapter, even in the background.
4. Nobody dies on screen. Boats wreck, people are rescued, Gus feels responsible.
5. The Stranger in the yellow coat is seen from behind only, never speaks, never has a shadow, until the finale.

## 2. Cast (pose tables are the character sheet)
A character is a drawing function + a frame table in `cast.js`. Consistency is automatic: the same function draws every frame of every episode. Each has **one saturated signature colour** no set uses (STYLE.md §3).
| Name | Role | Look (34×50 px unless noted) | Signature | Voice |
|---|---|---|---|---|
| **Gus** | the keeper, 60s, warm, stubborn | long sea-green oilskin, mustard scarf, white beard, navy wool cap, brass hand lantern | sea-green `#27776d` | Kokoro am_michael (also narrates) |
| **Mabel** | cat, sleepy, the sharpest mind | slate-grey, white bib, green eyes, curled tail (20×14 px) | — (grey, reads by the white bib) | none; her lines are narrated: *"Mabel, as usual, said nothing. Then solved it."* |
| **Pip** | seagull, show-off, sees everything from above | white, grey wing, mustard beak, coral legs (22×18 px, flying frames) | coral legs | bm_lewis, low-passed 7 kHz (dialogue box) |
| **Rollo** | mouse, hungry, secretly brave | tan, big pink ears, coral tail (14×12 px) | pink ears | none (narrated) |
| **Old Wren** | postmistress, keeper of the Old Tales | violet shawl, round spectacles, candle lamp | violet `#7a4a9a` | bf_emma, speed .84 |
| **The Stranger** | the mystery | yellow oilskin coat, hood up, seen from behind; casts **no shadow** (`castShadow=false`) | yellow `#e8c22a` | none |
| **Harbour master Dunn** | the accuser | black cap, red muffler, clipboard | red muffler | bm_george |
Build order: Gus + Mabel exist (proof). Next: Pip (flight frames matter: the channel's "eye in the sky" shots are Pip's POV), the Stranger, Dunn, Old Wren, Rollo.
Sprite rules: 1 px selout outline, dither band .22, walk 4 frames at 8–9 fps, idle 2 frames at ~1.4 Hz, blink every 3–4 s, poses are table entries. Billboards get a cool **front fill** always (a sprite lit from behind is black).

## 3. Sets (one fog colour + one light key each, so a cut reads instantly)
| Set | Fog / key | Practicals | Used for |
|---|---|---|---|
| **The Island (map)** | `#141f36` / cold moon | village windows, jetty lamp, the lamp's beam | every chapter opening and closing; "the board" |
| **Harbour & village** | blue `#16223a` / amber | windows, two street lamps, Dunn's office lamp | accusations, gossip, the wreck's aftermath |
| **Cottage & cliff path** | green-grey `#15241e` / lantern | cottage window, Gus's lantern | travel beats, Gus + Mabel talking (narrated), weather |
| **Lighthouse headland + lamp room** | `#1c2334` / the lamp itself | the lamp, door lamp, the clock face (emissive) | the 3:12 beat, riddle of the clock, the finale |
| **Cellar & sea tunnel** | teal `#0f2a2e` / Gus's lantern only | lantern, phosphorescent water (sea shader, teal) | riddles 2–3 of CH01, the footprints with no shadow |
| **Wren's post office** | warm `#2a1c14` / candle | candles, a stove | Old Tales told in a dialogue box; exposition |
| **The north rocks (storm)** | `#1a1d2c` / lightning | none (the flash curve is the key) | wrecks, the Stranger sightings |
Each set is a `build<Set>()` module exporting `{ scene, update }` on the demo's engine (px/kit/fx/post_ts imported by absolute path from tools/lemo-opuscar). Shared parts live in `channels/island/engine/` (cast.js, sets/*.js, ui.js, riddle.js). An episode holds only story.js + lines.json + its build.sh.

## 4. Camera grammar for the Island (the style's vocabulary → our beats)
Always look **down**; three heights only; every path is a `track()` of 2–7 keys; focus follows the subject every frame; the tilt band follows the hero (wide shots: fixed band). Characters 1/12–1/8 of frame height in 16:9.
| Beat | Shot | Height / distance | Light move | Sound |
|---|---|---|---|---|
| Chapter open ("the board") | very high, very far, slow push; band on the lighthouse | 55–70 m up, 90–130 m away, fov 36 | beam sweeping; windows on | waves far, the pad |
| The hook event (3:12) | medium-high 3/4 on the lamp room, locked | 6–8 m up, 10–14 m away | lamp flickers → out; exposure dips; only practicals | hum stutter, fwoomp, silence, heartbeat |
| Travel | lateral tracking, camera leads, grass/rail blurred in front | 5.5–7.5 m up, 13–15 m back, fov 28 | lantern as key | steps per surface, wind |
| Two figures talk | medium-high 3/4, near-static drift | 5 m up, 8–10 m away, fov 30 | one practical between them | dialogue box chime |
| **Riddle card** (pause-and-solve) | rack focus from the clue to the figure in a locked frame, then the riddle UI over it; the countdown is the only thing that moves | as the scene | nothing moves except the flame flicker | tick (soft), the pad alone |
| Reveal | shadows jump: a light is lit beside the sprites | medium-high | practical on; sprite shadows swing | match strike / bell |
| Pip's eye | straight top-down, band as a strip ("board game") | 25–35 m up | — | wind + wingbeats |
| Dive | low and close while a figure kneels or stops | 2.5 m up, 5–6 m away | lantern fills the frame | breath, silence |
| Cliffhanger | return to an earlier framing, changed (e.g. the opening map at **noon**, lamp dark) | same keys as the opening | the one wrong light | hard stop into a reverb tail |
Transitions: fades to black (.3 out / .45 in) or cuts between sets; no wipes, no spins. Camera never shakes except on a wreck impact.
**9:16 Shorts:** the same sets, the camera 25 % higher and 30 % closer, subject at 45 % of frame height, riddle UI and subtitles inside y 180–1560 (safe area), the chapter card replaced by a 1.5 s hook plate (premise ≤ 5 words, same rule as What-If R2). A Short is its own `story.js` (shot list + lines), rendered with `--size 1080x1920`; `main.js` reads the viewport.

## 5. Formats
**Long-form chapter (16:9, 4–6 min, Saturday).** Cold open (≤ 15 s: the event, no narration first) → chapter card → the board → the problem → **3 riddles** (clue shown → riddle card with a 5 s countdown → answer → the door it opens) → cliffhanger → title + "Chapter N+1: Saturday". Exactly one dialogue-box scene per chapter (the rest narrated) keeps TTS cheap and the voice consistent.
**Shorts (9:16, 30–50 s, up to 4 a day if we match What-If's cadence):**
- *Riddle cuts* ×3: one riddle each, re-cut for newcomers (the clue shot, the card, the countdown, the answer; "the door it opens" stays in the chapter).
- *Old Tale* ×1: Wren tells a legend in a dialogue box over one set; one hidden clue.
- *Island questions* (original Shorts): a 40 s self-contained puzzle set on the island ("Which boat left last? Look at the lamps."), cheaper than a chapter and the channel's growth engine while chapters build the binge.
**Pinned comment + description** point to the chapter; Shorts carry a question over the final action and no end card (proven on What-If).

## 6. The chain: story in → N days out
Mirror of the What-If chain (library/styles/growkaz-ifverse/v3.1/tools) so one mental model runs both channels.
```
channels/island/<series>/<date>-<code>-<slug>/
  story.md        ← the ONLY hand-written input: hook, beats, riddles (clue/answer), lines, set per beat, Shorts list
  lines.json      ← generated from story.md (ids, voice, speed, asr for invented names)
  story.js        ← generated: DUR, SHOTS (set, camera preset, keys), T (events), VO (times from voices/dur.json)
  shorts/<n>/     ← generated 9:16 projects (own story.js, same engine)
  voices/ out/ check/ final/ PUBLISH.md CREDITS build.sh
tools (channels/island/engine/tools):
  lint_story.py   blocks: unknown cast/set, a riddle without its clue shot, a Short > 60 s, a clue after its riddle, a set with no front fill
  build_voice.py  Kokoro → voices/*.wav + dur.json; whisper check (asr field for Gus/Mabel/Wren/Pip)
  build_story.py  story.md → story.js + shorts/*/story.js (VO times from real durations; camera presets from §4 by beat type)
  sheet.mjs       one still per shot + every riddle card frame → check/sheet.jpg (read by eye BEFORE the render)
  render_chain.sh [--force] <project>... : lint → stills → render (GPU host) → mix.py → postcheck.py → finalize.py; one log line per video
  postcheck.py    stale output, duration ≠ story, −14 ±1.5 LUFS, black ≥ .4 s, flat frames, subtitle overlap
```
**Day planning:** `plan.md` lists N days → for each day one chapter (or one Island-questions batch) + its Shorts; `render_chain.sh` takes the whole list, runs detached (2 h+ timeout on the GPU host), and writes `chain.log`; Vivek reviews `check/` sheets, re-renders only what FAILs. Thumbnails stay with Vivek (Gemini prompts written into each PUBLISH.md by the chain).
**Where it runs:** cloud (Claude) writes story.md → lines → story.js → stills/sheets and pushes to the repo; the GPU host pulls and runs `render_chain.sh`; results go to `final/` (git-ignored) and the chain's log is committed. Later, a scheduler calls the same chain with a week plan.
**Claude usage:** the chain is deterministic once story.md exists; Claude's job per week shrinks to writing N story.md files + reading N check sheets.

## 7. Next steps (in order)
1. **GPU render test on Vivek's Windows** (not WSL): install Node 22 + `npm install` in tools/lemo-opuscar, `node core/render/still.mjs <proof> 8 16 --q ss=1` then the 31 s proof at 1080p30 with `--workers 3`. Log frames/s in memory/LEARNINGS.md. If the 1650 falls below ~3 fps at 1080p, render 720p30 and let YouTube upscale, or `ss=1`.
2. Vivek watches proof-01 and reacts (/retro): sprite scale, colours, the lamp beat, the narration pace. His notes become TASTE.md lines.
3. Build Pip, the Stranger, Dunn; the harbour, lamp room and cellar sets; the riddle card UI (`riddle.js`).
4. Port CH01 "Twelve Seconds of Dark" (SEASON-1-BIBLE.md beat sheet) to story.md v1; voice it; sheet it; Vivek approves the sheet before the first GPU render.
5. Write the engine tools (§6) by copying the What-If tools and swapping the shot builders; run the chain on CH01 + 3 riddle Shorts + 1 Old Tale.
6. NexLev pass for the Island specifically (cozy-mystery / riddle long-form outliers; family-not-kids channels; Shorts hooks that carry a serial) → research/. Thumbnail language: the toy island from above with ONE wrong light; faces are tiny in this style, so thumbnails lean on the lighthouse silhouette + 3-word text.

## 8. Open decisions for Vivek
- Keep Gus + the animals as the cast (built, approved 2026-11-08) or widen to a human crew? (My view: keep; the animals are the humour and the "faceless" safety; add Old Wren and Dunn as the human foils.)
- Chapter length target: 4–6 min (my recommendation, matches What-If's ~4:00 learning) vs the original 8–12 min plan.
- Music: a licensed CC track per chapter cut at downbeats (the style's way) or our own instrument scores (music.py from CH01)? The proof uses a placeholder pad; nothing publishes with it.
- Channel name: "The Keeper's Island" (working) — confirm before the banner.

Policy/licence (one line, as agreed): never "HD-2D" on screen or in metadata; no game names, characters or UI ornaments; our docs adapted from lemo-opuscar stay in the private repo; a real music licence + credit before any upload.
