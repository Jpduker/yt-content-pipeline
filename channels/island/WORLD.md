# The Keeper's Island · world canon (source of truth for every story session)
Updated: 2026-11-16 (Chapters 1–4 written; weeks 1–3 re-fixed for re-render; week 4 kit built). **Read this before writing any new week.** Add to it at the end of every week (§7 log).
Code: `channels/island/engine/` (cast.js = every character's drawing, world.js = every place). Scripts: `channels/island/engine/tools/weekN.py`.

## 1. The premise and the rules of the world
- One island, one lighthouse, one keeper. Every night the lamp turns; at 3:12 a.m. it has started going dark for exactly twelve seconds.
- **Fair play:** every clue is on screen (or said) before it is used. Each chapter has one solvable "how" and keeps a bigger "who/why" open.
- **Tone:** cozy mystery with real stakes. Nobody dies on screen. Dry humour from the animals. Never childish (audience: general, not made for kids).
- **Narration:** third-person limited, close on Gus; Kokoro am_michael at speed 1.0; short rhythmic lines; a longer pause only before a reveal; never describe what the picture already shows.
- **Time of day carries tone:** day = investigation + humour · dusk = lore/confession · night/storm = dread + cliffhangers · cave = secrets.
- **Season props that appear every chapter:** the lamp, the lamp-room clock, the yellow coat.

## 2. Characters (canon, never change their look; signature colour in brackets)
| Name | Code key | Who | Look | Voice | Facts established (episode) |
|---|---|---|---|---|---|
| **Gus** | gus | keeper, ~60, warm, stubborn; kept the lamp 30 years | sea-green oilskin (#27776d), mustard scarf, navy wool cap, white beard, brass hand lantern | narrator am_michael (rarely speaks himself; said "Grandad." in S55) | born the night the lamp failed once, 60 years ago (S12); mother "lost at sea" that night (S21, S25); grandfather's name is the last entry in the wreckers' ledger (S18) — he sold his shadow to Crane in 1926 for four years of life (S47); has the grandfather's watch and cap (S47) |
| **Mabel** | mabel | grey cat, the real solver; sleepy, fearless | slate grey, white bib, green eyes | none (narrated) | sits down fast for two things: fish and fear (S07); pressed the burned mark that opened the door (S09); afraid of the cave pool — and jumped in anyway to pull Gus out (S50) |
| **Pip** | pip | gull; show-off; the island's eye in the sky | white, grey wings, mustard beak, coral legs | bm_lewis (if he ever speaks) | saw the yellow coat first (S04); found the slit in the cliff (S17) |
| **Rollo** | rollo | mouse; hungry; secretly brave; comic relief | tan, pink ears | none | ate the stake-out sandwiches (S05); sneezed in the cave, found the locket (S20) |
| **Old Wren** | wren | postmistress; keeper of the old tales | violet shawl (#7a4a9a), white bun, round spectacles, candle | bf_emma (dialogue box) | told the tale of the man who sold his shadow (S08); kept the wreckers' ledger (S18); gave the second key to Gus's mother this autumn (S24–S25) |
| **Dunn** | dunn | harbour master; accuser → reluctant ally | black peaked cap, dark coat, red muffler, clipboard | bm_george | gave Gus 3 days (S02); showed the 60-year logbook (S12); refused the key (S14); hid the boat's name plate "the Keeper's Daughter" (S21); his father (harbour master in 1926) kept a diary of the grandfather walking off his sunk boat with no shadow (S48); towed Crane's empty barge in (S56) |
| **Marlo** | marlo | ferry pilot, 22; sharp, overlooked by the council | orange knit cap (#ee7a2a), navy sailor jumper, rope coil | af_nova | saw two lights on the wreck night (S22); brought 31 passengers home in the storm (S28) |
| **Silas Crane** | crane | salvage merchant who never ages; bought the shadow in the old tale (1926); holder of the mother's contract | pale cream suit, black bowler, silver cane, too-pale face, thin smile | bm_fable | arrived on a grey barge (S29); offered to buy salvage rights (S30); witness on the contract (S34); paid Dunn 30 years ago (S35); stole the under-lamp key (S38); lost to the sea in the cave — **his shadow stayed on the wall, smiling** (S41) |
| **The Shade** | shade | the shadow Crane wore for 100 years — really **Gus's grandfather's**, sold to Crane in 1926; walks on its own, cannot cross light, goes home to the family that sold it | Crane's outline in near-black, bowler hat, a pale glowing smile; pose `cap` = a keeper's flat peaked cap (its true shape); casts no shadow | none (never speaks) | 8th shadow on the quay (S43); swallowed the village lights (S45); stopped by the ring of lanterns (S46); dragged Gus's lantern into the cave pool (S50); walked beside Gus as a second shadow (S51); cornered by light from every side, became the grandfather's shape, knelt at "Grandad" and went home to the sea (S54–S55) |
| **The Stranger** | stranger | Gus's mother, returned after 60 years; owes the sea a debt | yellow hooded oilskin (#e8c22a), **always seen from behind**, **casts no shadow** | bf_isabella; spoke once (S27) | rose out of the sea (S19); lit the under-lamp; "a ship for every year it gave me — four ships, then I am free" (S27); left the coat, the key and a fourth burned mark on the north rocks (S28); came back for the coat, burned the contract in the under-lamp's flame (S41); **regained her shadow at dawn** (S42); warned Gus at the jetty: "Give it nowhere to fall" (S52); told him Crane must have sold his own shadow long before (S56) |

Adding a character: draw it in `cast.js` (34×50 px frame, one signature colour no set uses, pose table), add a voice in `tools/lines.py` VOICES, add a row here.

## 3. Places (world.js; coordinates are what scripts use)
| Place | Where (x, z) | Ground y | Light key | Used for |
|---|---|---|---|---|
| The island map | camera presets `map` | – | every time of day | openings, endings, "the board" |
| Lighthouse door / headland | door (21.4, −20.4) | 9.17 | the lamp + door lamp | the 3:12 beat, clock riddle |
| Lamp room / tower top | orbit at (21, 19.5, −24) | – | the lamp | clock, cables |
| Cliff path + keeper's cottage | path z = −11, x −6…16; cottage (−2, −17.5) | 4.27 | lantern | travel, stake-out, night thoughts |
| The door in the rock (hatch) | (13.6, −14.4); stand at (12.6, −12.9) | 4.27 | lantern | the four brass marks; tunnel entrance |
| Village + post office | post office (−6.5, 7.6) | 0.17 | windows | Wren scenes |
| Harbour office + quay | office (9, 12); quay (6–9, 13) | 0.17 | windows | Dunn scenes |
| Jetty | x −4.3…−1.7, z 27…42 | 0.02 | jetty lamp | Marlo, the storm horn |
| North rocks (wreck site) | (12, −46) | 0.92 | – | the wreck, the Stranger, the folded coat |
| **Sea-cave harbour** (Ch2) | centre (−95, −95), floor r ≈ 10 | 0.42 | under-lamp (`under`), teal water, warm fill | the under-lamp at (−92, −97.5), foghorn, crates, stair down (−103.6, −101) |
| Crane's grey barge | moored at (15, 20) beside the quay | sea | white deck lamp | Crane scenes; a brass horn on its roof matches the cave's |
Props (shot `props`): `wreck`, `prints`, `ship`, `coat`, `barge`, `cshadow` (the smile on the cave wall), `cables` (lamp room, Ch1); shot keys `ringAt` (ring of 12 lanterns), `lightsOut` (village lights die one by one), `farlight` (a moving lantern), `printsAt`/`printsCol`. Cast option `shadow: true/false` (the Stranger has none until S42). Times: `day dawn dusk night storm cave`. Lamp: `on/off/{flicker,len,back}/{out}/{on_at}`. Under-lamp (cave): `under: 'on' | seconds`.

## 4. Mysteries: solved / open
**Solved:** the walking shadow (it falls away from its light — lit from every side it has nowhere to fall; it was the grandfather's, Ch4) · the debt (a contract, payable to the bearer; burned, Ch3) · who blows the horn (Crane's barge answers the cave horn, Ch3) · why Dunn hid the boat's name (paid by Crane, Ch3) · how the lamp goes dark (cable cut from inside, Ch1) · where the culprit goes (the door in the rock → the cave, Ch1–2) · how ships wreck (**leading lights**: a low false light moves the safe line onto the north rocks while the top lamp is dark, Ch2) · who the Stranger is (Gus's mother, Ch2).
**Open (use these):**
1. **Crane's own shadow**: "a man doesn't live a hundred years on one shadow" — Crane must have sold his own to someone, long before (S56). Who holds it?
2. **The ledger is still being written**: a new line in Crane's barge ledger, ink still wet: "The Keeper's Island. Payable to the bearer." (S56) → Chapter V "The Last Page".
3. What the mother is now, and whether she stays (she comes and goes through the sea; has her shadow).
4. The three wrecked ships in Crane's ledger: the Keeper's Daughter, the Saltgrass, the Wenna Grey — who was aboard the last two?
5. The grandfather's four years (1926–1930) on the island: what did he do with them, and what did the wreckers' ledger record?

## 5. Shot grammar (what works; keep)
QA rules: a named clue/character must be visible in its shot; on the rocks, stand in front of the wreck (camera side); max 2 Shorts in a row at the same place; no near-black frames. Hook plate ≤ 14 words in the first 2.8 s · 3 shots per Short (establish → close/dive → reveal) · question plate over the final action · map shot to open/close chapters · cave shots: camera follows the hero, height 8–10, distance 7–8 · dialogue box for characters, subtitles for narration.

## 6. Episode index
| Week | Chapter | Shorts | Long-form |
|---|---|---|---|
| 16–22 Nov | 1 · Twelve Seconds of Dark | S01–S14 | CH01 (9:17) |
| 23–29 Nov | 2 · The Tunnel | S15–S28 | CH02 (9:38) |
| 30 Nov–6 Dec | 3 · The Fourth Ship | S29–S42 | CH03 (8:57) |
| 7–13 Dec | 4 · The Shadow in the Cave | S43–S56 | CH04 (9:56) |

## 7. Log (append one line per week: what the audience/Vivek liked, what to change)
- 2026-11-15: narration speed 1.0 not .84 ("sleepy"); Mabel sunk in floor → fixed; wants day scenes, more characters over time, cinematic angles.
- 2026-11-16 QA of week 1: yellow coat hidden behind the wreck (S04, S11), named clues not visible (S03 prints, S05 second lantern, S06 cables, S10 tunnel), blown windows at dusk/dawn, near-black night dives, 3 nights at the same hatch framing. Fixed in engine + rules (QA-2026-11-16-week1.md).
- 2026-11-16 (Vivek): fix the foundation before upload — all week-1/2/3 QA fixes re-applied and the three weeks re-rendered; week 4 built as the workflow test (kept on separate render-week4.bat). Still waiting for Vivek's watch feedback (favourite characters, twists, boredom points).
