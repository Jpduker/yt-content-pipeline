# WI02 director's pass: "hear what they think" (style growkaz-ifverse v2)
Written BEFORE any code (HANDOFF §3.3). Durations are targets; they are re-timed to the real voice (words.json) at the voice step.
Target ≈ 4:10, 84 shots, median 2.6 s. 16:9 1080p 24 fps, style preset sakura.

## Logline and tone
You can hear every thought people have about you. You use it perfectly, and by evening you've edited yourself into someone
your best friend misses. Tone: light comedy → quiet unease → tenderness. "You" = second person, a young man in his 20s.

## Cast bible (one colour item each; scenes/cast.js)
| id | Role | Outfit | Signature | Acting range |
|---|---|---|---|---|
| YOU | hero | `top: hoodie, color #3fb950` (green), head `spiky` | **green hoodie** (taken off on the train, back on in the last shot) | Act 1 big loose gestures (explain, cheer, shrug); Act 2 small and stiff (holdFront, crossArms, half-smiles); Act 3 still, then open hands |
| MIRA | best friend | `top: trench` as a jacket, color `#f2c21a` (yellow), head `ponytail` | **yellow jacket** (absent in the evening; her thought threads stay yellow) | warm, teasing, smirk → tired, worried → soft smile |
| BARISTA | café | `top: tshirt` ink, head `capBack`, headColor `#e8743b` (orange) | orange cap | deadpan, relieved |
| BOSS | manager | `top: suit`, color2 `#3a6ea5` (blue tie) | blue tie | pacing, pointing, then delighted |
| COLL | colleague | `top: tshirt` ink, head `bun`, headColor `#8a5ad6` (purple) | purple hair bun | tight-lipped → smiling |
| TRAIN | stranger | `top: tshirt` ink, head `beanie`, headColor `#f29ac0` (pink) | pink beanie | glance, wistful |
| extras | café/office/train | plain ink, no colour item | – | idle loops (sip, phone, page turn), seeded |

Expressions on the beat; blink periods: YOU 3.1 s, MIRA 3.7 s, others 2.9–4.3 s.

## Sets (scenes/sets/)
| Set | Mood | Key light | Dressing | Layers |
|---|---|---|---|---|
| **CAFE** "Kettle & Crumb" (HUB) | morning `golden`; evening `dusk` → `night` + `interiorWarm` lamps | big front window (sun am / street lamps pm) + 3 pendant lamps | counter left with espresso machine (steam), cake dome, chalk menu (invented items), round tables, **the quiet table** by the window right, coat hooks, plants | street + facade opposite (0.3) → window wall (0.5) → tables (0.85) → figures → blurred cups / plant (1.7) |
| BEDROOM | `golden` dawn | window with blinds (light stripes) | bed, phone on nightstand, poster shapes | blinds → wall → bed → fg lamp blur |
| OFFICE | `interiorCool` | wall of windows, skyline + monitors | desks in rows, monitors, glass meeting room, whiteboard with invented chart | skyline (0.2) → glass wall (0.5) → desks → fg monitor blur |
| CANTEEN | `day` warm | skylight | long table, trays, menu board with prices | window → wall → table → fg tray blur |
| TRAIN | `dusk` | windows; city lights slide past (parallax loop) | poles, hand straps swaying, seats, ads with invented brands | sliding skyline → carriage wall → seats → fg pole blur |
| 3D | per beat | – | café exterior street (T.building, windowPane lit), train on a viaduct at dusk | – |

## Motifs (the v2 "signature" rules)
1. **Thought threads (the power):** when someone thinks about YOU, a soft ribbon of light in the THINKER's colour curls from their head
   to YOU's ear; the thought is written along it (Nunito, sentence case, ≤ 7 words visible at once). The thinker's mouth does NOT move.
   YOU's head pings one ring (FX.rings) in that colour. SFX: soft shimmer + breath swell. Captions skip thought words.
2. **The napkin:** inserts at rule 1, rule 4, rule 23 (badge "RULES 1 → 23" counts up with `counter` SFX). The handwriting gets tighter.
3. **Clock badge** (top-left, small, gold): 07:42 · 08:15 · 10:30 · 13:05 · 17:48 · 18:02 · 18:40 · 23:00.
4. **Colour arc:** green hoodie → off on the train → grey tee all evening → on again in the last shot (wordless resolution).
   Mira's yellow jacket is missing in the evening, but her thought threads are still yellow.
5. **Shrinking body language:** YOU's poses get narrower through Act 2 and Act 3 (see the cast table); Act 3 ends with open hands on the table.

## Music plan (shots.json "music"; real track via /pick-music, kit bed as fallback)
| Section | Mood | Intensity |
|---|---|---|
| Hook 0:00–0:14 | mystery | 0.35 |
| Title + Act 1 | playful | 0.45 |
| Act 2 shortcut montage | hopeful → tension (from "The list gets longer") | 0.5 → 0.4 |
| Act 3 to "I miss him" | sad, sparse | 0.25 |
| "I miss him" → "That one hurts" | music OUT, room tone + coffee machine stay | – |
| "You sit together" → end | calm/warm piano re-enters | 0.3 |

## Shot list
Size: W wide · M medium · 2S two-shot · OTS over-the-shoulder · CU close-up · BF giant face (bigFace) · INS insert · 3D orbit/dolly · TC title card.
Transition: cut unless noted.

| # | Line | Size / angle | Picture and acting | Set · mood | Graphic | In | Sound |
|---|---|---|---|---|---|---|---|
| **HOOK** |||||||
| 1 | "You wake up able to hear…" | M, high angle | YOU asleep; blinds stripe light; eyes open on "hear", sits up (anticipation: curl in, then up) | BEDROOM golden | – | fade 0.5 | room tone, birds |
| 2 | "…what people think of you." | BF | YOU's face, confused → thinking; a faint ring pulses at his ear | BEDROOM | – | cut | low shimmer |
| 3 | "By tonight, your best friend will think—" | W, slow push | FLASH-FORWARD: night café, two figures at the window table, lamps; scope bars | CAFE night | clock 23:00 | dip | café room tone |
| 4 | MIRA-T "I miss him." | 2S side | Mira looks at her cup, mouth still; yellow thread curls to YOU | CAFE night | thread | cut | thought shimmer |
| 5 | "You'll be sitting right beside her." | BF YOU | shocked → sad; the thread fades from his ear | CAFE night | – | cut | riser out |
| 6 | (title) | TC over 3D | 3D café exterior at dawn, orbit; title "WHAT IF YOU HEARD EVERY THOUGHT ABOUT YOU?" | 3D street golden | TC | flash | stinger |
| **ACT 1: CAFÉ MORNING** |||||||
| 7 | "It starts in the café." | W | interior establishing; 3 extras idle; YOU enters left, door swings | CAFE golden | clock 08:15 | cut | door bell, murmur |
| 8 | BARISTA "Usual?" | OTS (YOU fg blur) | barista lifts a cup, deadpan | CAFE | – | cut | cup clink |
| 9 | "Then, without moving his lips:" | CU barista | lips sealed, eyes slide sideways | CAFE | – | cut | – |
| 10 | BARISTA-T "Please don't tell me that joke again." | 2S | orange thread to YOU; YOU mid-gesture (explain pose, mouth open on a joke) | CAFE | thread | cut | shimmer |
| 11 | "You close your mouth." | BF YOU | mouth snaps shut; eyes wide | CAFE | – | cut | small "tick" |
| 12 | "He looks relieved." | CU barista | shoulders drop (exhale), smile | CAFE | – | cut | – |
| 13 | "You've heard him." | BF YOU, push | awe; ring pulses orange | CAFE | – | cut | ding |
| 14 | "Not everything in his head. Just thoughts about you, when he's close enough to talk." | blueprint | navy blueprint: YOU line figure, a dashed 1.5 m radius circle; "thoughts ABOUT YOU" tag; a thought outside the circle bounces off | void/blueprint | dimension "≈ talking distance" | zoom | blip, pop |
| 15 | "There is no mute button." | INS | YOU's hand presses his ear; nothing changes; ring keeps pulsing | CAFE | – | cut | dull thud |
| 16 | "Your best friend Mira arrives." | W | Mira walks in, yellow jacket bright against the window; waves (anticipation + wave) | CAFE | – | cut | door bell |
| 17 | MIRA "Nice hoodie." | 2S | Mira points at the hoodie, smirk; YOU proud (cheer-lite) | CAFE | – | cut | – |
| 18 | MIRA-T "That green makes him look like a traffic light." | OTS (Mira fg) | yellow thread; a tiny traffic-light glyph blinks on the thread | CAFE | thread | cut | shimmer, blip |
| 19 | "You stare at her." | BF YOU | deadpan stare, blink | CAFE | – | cut | – |
| 20 | "Then she thinks—" / "Still. He looks happier." | CU Mira | softer face, small smile; second thread, warmer | CAFE | thread | cut | shimmer (higher) |
| 21 | "Two thoughts. Three seconds apart." | 2S, freeze | world freezes (cool tint, steam frozen), both threads hang side by side; YOU alone moves his eyes between them | CAFE frozen | readout "3 s" | flash | freeze |
| 22 | "You remember the first." | INS | the first thread glows; the second fades to grey | CAFE | – | cut | low note |
| **ACT 2: THE SHORTCUT** |||||||
| 23 | "At work, this starts feeling useful." | 3D/W | office establishing, cool light, monitors; YOU at a desk | OFFICE | clock 10:30 | dip | office tone, keys |
| 24 | "Your manager asks for an opinion." | 2S | BOSS paces, points at a chart on the whiteboard | OFFICE | – | cut | – |
| 25 | BOSS-T "Please disagree with me. Someone needs to." | CU boss | smile frozen, eyes pleading; blue thread | OFFICE | thread | cut | shimmer |
| 26 | "So you do." | M YOU | stands (anticipation dip), crosses arms, shakes head | OFFICE | – | cut | chair roll |
| 27 | BOSS "Exactly!" | M boss | big grin, double point (overshoot, settle) | OFFICE | – | cut | pop |
| 28 | "Your colleague glances over." | OTS (YOU fg) | COLL at next desk, side-eye | OFFICE | – | cut | – |
| 29 | COLL-T "He lets the boss finish. Why does he always interrupt me?" | 2S | purple thread, tight lips; YOU winces | OFFICE | thread | cut | shimmer |
| 30 | "That afternoon, you let her finish." | M | COLL talks (rings), YOU nods, hands folded | OFFICE warm afternoon | clock 15:20 | cut | – |
| 31 | "She smiles too." | CU COLL | smile; YOU in fg blur nods | OFFICE | – | cut | – |
| 32 | "By lunch, you have discovered a shortcut to being liked." | W | canteen, YOU in the middle of a table of friends (ink extras), everyone leaning in | CANTEEN | clock 13:05 | whip | murmur |
| 33 | "You laugh before the punchline." | M | friend mid-story, YOU already laughing (anticipation of the joke) | CANTEEN | – | cut | laugh bed |
| 34 | "Stop telling a story before anyone gets bored." | M | YOU mid-story, sees a yawn start, stops, palms up | CANTEEN | – | cut | – |
| 35 | "Order the cheap dish…" | INS | finger slides from an expensive menu item to the cheapest; friend's worried face in bg | CANTEEN | price tags | cut | tick |
| 36 | "People relax around you." | W, slow pull | whole table laughing; YOU smiling, but his hands are under the table | CANTEEN | – | cut | music lift |
| 37 | "You keep a little list on a napkin." | INS | hand writes on a napkin | CANTEEN | RULES 1 | cut | pencil scratch |
| 38 | "Talk less. Be funnier. Be more confident. Don't make everything a joke." | INS ×4 (0.9 s each) | each rule written as said; the badge counts 1→4 | CANTEEN | RULES 4 | cut ×4 | scratch ×4, blip |
| 39 | "The list gets longer." | INS, top-down | napkin fills, handwriting tighter, the napkin turns over | CANTEEN → desk | RULES 11 | cut | counter |
| 40 | "By six, it has twenty-three rules." | BF YOU | tired half-smile; the napkin's shadow on his face | OFFICE dusk | RULES 23 (gold → coral) | cut | counter stop, low hit |
| 41 | "On the train, you catch someone looking at you." | 3D | train on a viaduct at dusk, dolly alongside | 3D dusk | clock 17:48 | dip | train rumble |
| 42 | (same line, cont.) | OTS (YOU fg) | TRAIN woman across the aisle, looking at his hoodie; straps sway | TRAIN | – | cut | train interior |
| 43 | TRAIN-T "That hoodie—" | CU woman | pink thread starts | TRAIN | thread | cut | shimmer |
| 44 | "You straighten it." | M YOU | tugs the hoodie straight, anxious | TRAIN | – | cut | cloth rustle |
| 45 | TRAIN-T "—my brother had one like that." | CU woman | wistful smile, the thread softens | TRAIN | thread | cut | shimmer |
| 46 | "She turns back to the window." | W | she looks out; city lights slide over her | TRAIN | – | cut | – |
| 47 | "You've already taken it off." | M YOU | grey tee, the green hoodie balled in his lap; he looks at it (the colour arc's low point) | TRAIN | – | cut | music out → in, sad |
| **ACT 3: CAFÉ EVENING** |||||||
| 48 | "At six, Mira texts." | INS phone | screen: "Coffee? Rough day." types in | TRAIN | – | cut | phonebuzz |
| 49 | "You get there first." | W | evening café, lamps on, YOU (grey tee) hurries in | CAFE dusk | clock 18:02 | dip | door bell, murmur |
| 50 | "Buy her favourite." | INS | two cups set down, one with a yellow sleeve | CAFE | – | cut | cup clink |
| 51 | "Choose the quiet table." | M | YOU moves a chair at the window table, adjusts it twice | CAFE | – | cut | chair scrape |
| 52 | "Rehearse three things to say." | BF YOU | mouthing silently; 3 small bubbles appear and pop | CAFE | bubbles 1-2-3 | cut | pop ×3 |
| 53 | "She arrives without her usual yellow jacket." | W | Mira enters, dark tee, no yellow; tired walk (slower phase) | CAFE dusk | – | cut | door bell (softer) |
| 54 | "You almost ask why." | 2S | YOU leans in, opens his mouth | CAFE | – | cut | – |
| 55 | MIRA-T "He's going to ask about the interview." | CU Mira | yellow thread, eyes down | CAFE | thread | cut | shimmer |
| 56 | "So you don't." / "You talk about a film instead." | 2S | YOU leans back, explain pose, film-shaped gestures | CAFE | – | cut | – |
| 57 | MIRA-T "Please don't make me do small talk." | OTS (YOU fg) | Mira's polite smile, thread | CAFE | thread | cut | shimmer |
| 58 | "You stop." | BF YOU | freeze mid-gesture | CAFE | – | cut | music stops one beat |
| 59 | "She fiddles with the cardboard sleeve…" | INS | fingers turn the yellow sleeve | CAFE | – | cut | paper rustle |
| 60 | MIRA-T "Say something." / "You start." | 2S | thread; YOU inhales | CAFE | thread | cut | shimmer |
| 61 | MIRA-T "Not a joke." / "You swallow the joke." | BF YOU | cheeks puff, gulp (comedy beat, smallest laugh in Act 3) | CAFE | thread | cut | gulp |
| 62 | "For the next ten minutes…" | W, time-lapse | lamps outside switch on one by one; YOU's poses tiny and careful | CAFE dusk→night | clock 18:40 | cut | ticking clock |
| 63 | "You agree when she criticises the film you loved." | M | YOU nods while his hand crushes a napkin | CAFE | – | cut | – |
| 64 | "Pretend you aren't hungry…" | INS | stomach shape / YOU pushes the cake plate away | CAFE | – | cut | stomach rumble (subtle) |
| 65 | "Start laughing, then stop halfway through." | BF YOU | laugh → snaps to neutral | CAFE | – | cut | – |
| 66 | "Mira watches you." | CU Mira | studies him, head tilt | CAFE night | – | cut | – |
| 67 | MIRA "You okay?" / YOU "Of course." | 2S | quick exchange; YOU's smile too wide | CAFE | – | cut | – |
| 68 | MIRA "You're being really… careful." | OTS (YOU fg) | Mira, worried | CAFE | – | cut | music OUT (room tone stays) |
| 69 | "Then you hear it." / MIRA-T "I miss him." | BF Mira → thread | the line from the hook; the thread is slow and thin | CAFE night | thread | cut | shimmer, heartbeat ×1 |
| 70 | "You look behind you." / "Nobody." | M | YOU turns round, the empty café behind, chairs | CAFE | – | cut | – |
| 71 | "She means you." | BF YOU | realisation; eyes wet (sad expression) | CAFE | – | cut | – |
| 72 | "You're less than a metre away." | top-down | table from above; dimension line between them "< 1 m" | CAFE | dimension | cut | blip (soft) |
| 73 | "Your napkin is covered in instructions." / "…none of them helps." | INS | the 23-rule napkin, coral badge; it blurs | CAFE | RULES 23 | cut | – |
| 74 | MIRA "Did something happen?" / "You could invent…" | 2S | Mira leans in; YOU's hand hovers over the napkin | CAFE | – | cut | – |
| 75 | "Instead, you put the napkin between you." | INS | napkin slides to the middle of the table (match cut on the napkin) | CAFE | – | cut | paper slide |
| 76 | YOU "I've spent all day trying not to annoy anyone." / "She reads it." / "Even me?" / "You nod." | 2S → CU Mira → BF YOU | coverage of a quiet exchange | CAFE | – | cuts | – |
| 77 | MIRA-T "That sounds exhausting." / "I wish he'd trusted me." / "That one hurts." | CU Mira, 2 threads | the second thread brushes his ear longer; YOU winces | CAFE | threads | cut | shimmer ×2 |
| 78 | "You leave it alone." | M | YOU keeps his hands still on the table, open palms | CAFE | – | cut | – |
| 79 | MIRA "I got rejected. From the course." / "You start reaching…" / MIRA-T "Please don't say everything happens for a reason." / "You put your hand back." | 2S → INS hand | his hand moves toward hers, stops, returns | CAFE | thread | cuts | – |
| 80 | YOU "I don't know what to say." / MIRA "Good. You can stop looking for it." | OTS both ways | first real smile from Mira | CAFE | – | cuts | warm piano re-enters |
| 81 | "You sit together. The coffee machine hisses. Someone drops a spoon." | W, slow | the two of them small at the window; steam; a barista extra drops a spoon | CAFE night | – | cut | machine hiss, spoon clatter |
| 82 | "For a few seconds, Mira isn't thinking about you at all." / "Then—" MIRA-T "I'm glad he came." | 2S | no threads (YOU's ear quiet); then one small warm yellow thread | CAFE | thread | cut | shimmer (gentle) |
| 83 | "You could tell her you heard. You don't." / MIRA "I'm glad you came." / YOU "Me too." | BF Mira → BF YOU | smiles | CAFE | – | cuts | – |
| 84 | "You stay until the chairs go on the tables." | W → 3D pull-out | staff put chairs up; YOU pulls the green hoodie back on as they leave (colour returns); 3D pull-out of the lit window on a dark street | CAFE → 3D night | – | cut → dip | chairs, door bell, music resolves |
| END | "Would you want to hear it?" | end screen | question (Playfair italic), comment bubble, subscribe pill, cast line-up | void warm | endScreen | fade | soft sting |

## Shorts (9:16, ≤ 59 s; re-framed, not cropped; each ends "Full story on the channel")
1. **The hook + barista** (shots 1–15): the power is set up, comedy.
2. **The shortcut** (shots 32–47): the napkin to 23 rules, the hoodie on the train.
3. **"I miss him"** (shots 66–73): the emotional beat; ends on the question.

## QA checkpoints (ask Vivek only here)
1. Hook lines (above) → 2. contact sheet + three 5 s motion clips (shot 10 motif, shot 21 freeze, shot 41 3D) → 3. title + thumbnail.
