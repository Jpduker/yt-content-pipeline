#!/usr/bin/env python3
"""Write PUBLISH.md for an Island Short from short.json + timeline.json. Usage: publish.py <short_dir>"""
import json, os, sys
D = os.path.abspath(sys.argv[1]); S = json.load(open(os.path.join(D, 'short.json'))); TL = json.load(open(os.path.join(D, 'timeline.json')))
n = int(S['code'][1:]); day = S['day']; slot = S['slot']; chap = (n - 1) // 14 + 1; part = (n - 1) % 14 + 1
THUMB_SCENE = {
 1: 'a tiny white lighthouse with one teal band on a dark headland, its beam cut off mid-sweep, a single warm lantern dot at its door',
 2: 'a small wooden boat wrecked on black rocks in pale morning fog, a white gull perched on the mast, the lighthouse far behind',
 3: 'the lamp-room clock face glowing on a white tower wall, wet webbed footprints climbing stone stairs toward it',
 4: 'seen from a gull’s eye straight down: the toy island, and on the black north rocks one tiny figure in a yellow hooded coat',
 5: 'dusk outside a stone cottage: an old keeper with a lantern, a grey cat and a tan mouse on a sandwich, the lighthouse dark behind',
 6: 'three cables behind a great lamp lens, one cut clean, yellow paint footprints running down a spiral stair',
 7: 'a low door set into a cliff face with four worn brass marks in a square, an old keeper’s lantern lighting it from the left',
 8: 'an old postmistress in a violet shawl with a candle, closing wooden shutters at dusk, the lighthouse dark on the hill',
 9: 'a grey cat’s paw pressing one of four brass marks on a rock door, the door cracked open onto blackness, a lantern flame bending inward',
 10: 'a lantern held low over wet sand in a tunnel: two trails of prints, only one trail throwing shadows on the wall',
 11: 'full noon daylight, the whole village looking up at a dead lighthouse, and on the far rocks a yellow coat facing the other way',
 12: 'an old harbour logbook open under a desk lamp, one line circled, a pointing finger, a worried old keeper with a white beard',
 13: 'a storm at night, an old keeper kneeling on a jetty with his ear to the planks, lightning over an empty black sea',
 14: 'dawn on the quay: a keeper holding out a brass key, a harbour master not taking it, the lighthouse pale and unlit behind',
 15: 'a staircase cut into rock descending into a vast cave: glowing green water, a black-sand beach, an old wooden jetty, an old keeper with a lantern at the bottom step',
 16: 'inside a sea cave, a small brass lighthouse lamp on a stone plinth, its beam shooting through a narrow crack in the rock toward the sea, an old keeper touching the glass',
 17: 'a white seagull hovering at a black sea cliff with a thin dark slit just above the waterline, morning light, a wrecked boat on rocks nearby',
 18: 'an old postmistress in a violet shawl opening a huge leather ledger by candlelight, an old keeper leaning in, shocked',
 19: 'a figure in a dripping yellow hooded coat rising out of glowing green water in a sea cave, seen from behind; three small watchers hiding behind crates',
 20: 'a tiny mouse on black sand holding up a silver locket on a chain, glowing water behind, an old keeper staring',
 21: 'a harbour office desk at daytime: a weathered boat name-board reading nothing legible, a harbour master in a red muffler sliding it across to an old keeper',
 22: 'a young ferry pilot in an orange knit cap on a wooden jetty at dusk pointing out to sea at two lights, one high and one low',
 23: 'top-down board-game view of an island at sea: two dotted lines from two lights, one safe channel and one bent onto black rocks',
 24: 'an empty post office safe with a clean square in the dust where a key once lay, an old woman with a candle',
 25: 'two old people on a bench outside a small post office in sunlight, a locket between them, a lighthouse on the hill',
 26: 'a storm at night: a ferry with lit windows heading for black rocks, a lighthouse flickering, lightning, a keeper running along a cliff path with a lantern',
 27: 'a keeper and a figure in a yellow coat side by side at a small glowing lamp in a sea cave, two hands on one brass shutter',
 28: 'dawn on black rocks: a yellow coat folded neatly under a stone, a brass key on top, an old keeper and a grey cat looking at it',
}
THUMB_TEXT = { 1: '3:12 A.M.', 2: 'THE WRECK', 3: '12 SECONDS SLOW', 4: 'PIP SAW HIM', 5: 'WHOSE LANTERN?', 6: 'ONE CUT. DRY.', 7: 'THE DOOR', 8: 'THE FOURTH MARK', 9: 'IT OPENED', 10: 'NO SHADOW', 11: 'DARK AT NOON', 12: 'THE LOGBOOK', 13: 'THE HORN', 14: 'GOING DOWN', 15: 'GOING DOWN', 16: 'A SECOND LAMP', 17: 'THE CLIFF HAS AN EYE', 18: 'THE LEDGER', 19: 'OUT OF THE SEA', 20: 'THE LOCKET', 21: 'THE KEEPER’S DAUGHTER', 22: 'TWO LIGHTS', 23: 'THE TRAP', 24: 'THE EMPTY SAFE', 25: 'SHE CAME BACK', 26: 'UP OR DOWN?', 27: 'LITTLE ONE', 28: 'ONE STILL OWED' }
blurb = TL['hook']
desc = f"""{blurb}

The Keeper's Island · Chapter {chap}, part {part}. One island, one lighthouse, one keeper who swears it isn't him. Every episode continues the story; every clue is on screen before it matters. New parts every day.

Previous part → the Short before this one · next part → tomorrow.
Made entirely in code: hand-drawn pixel characters inside a lit 3D miniature. Original story, characters and music. Narration by Kokoro TTS.

#Shorts #mystery #lighthouse #pixelart #storytime #animation #keepersisland"""
tags = ['the keeper\'s island', 'lighthouse mystery', 'pixel art story', 'animated short story', 'mystery shorts', 'storytime animation', 'cozy mystery', 'serial story', 'lighthouse keeper', 'riddle story', 'pixel art animation', 'diorama', 'island mystery', 'cliffhanger', f'chapter {chap} part {part}']
md = f"""# {S['code']} · {S['title']}
**Upload:** {day} · slot {slot} of 2 (slot 1 ≈ 17:00, slot 2 ≈ 21:00 Berlin; keep the order, the story is serial) · **Shorts, 9:16, {TL['DUR']:.0f} s**
**File:** final/{os.path.basename(D)}.mp4 · audience: **not made for kids** (general; mystery tone) · comments on · Related video: previous part

## Title (≤100 chars)
{S['title']} | The Keeper's Island, part {n}

## Description
{desc}

## Tags
{', '.join(tags)}

## Pinned comment (post right after upload)
{TL['ask']}  — Part {n + 1} tomorrow. All clues are already on screen.

## Thumbnail (Gemini prompt — Shorts mostly show frame 1, but set it anyway)
Vertical 9:16 illustration, pixel-art characters standing like paper cut-outs inside a lit, fogged 3D miniature diorama seen from a high three-quarter angle with a tilt-shift blur band, heavy vignette, strong bloom on every lamp. Scene: {S.get('thumb') or THUMB_SCENE.get(n, '')}. Palette: cold blue night (or pale daylight where stated) against warm amber practicals; the old keeper wears a sea-green oilskin coat, mustard scarf, navy wool cap, white beard. No text, no logos, no game references. Leave the top 20 % and bottom 25 % uncluttered.
Text to add yourself (Cinzel-like serif, gold, 2–4 words): **{S.get('thumbText') or THUMB_TEXT.get(n, '')}**

## Credits (keep in the project; not needed in the description)
Voices: Kokoro TTS (am_michael narrator{', bm_george as Dunn' if any(l.get('dlg') == 'DUNN' for sh in S['shots'] for l in sh['lines']) else ''}{', bf_emma as Old Wren' if any(l.get('dlg') == 'WREN' for sh in S['shots'] for l in sh['lines']) else ''}). Music: original cue rendered with lemo-opuscar's sampler (VSCO2 CE / Salamander samples, CC0 / CC-BY-3.0 — see tools/lemo-opuscar/core/audio/instruments/*/LICENSE). Engine: lemo-opuscar 2.5D Pixel Art (MIT code); our own world, cast and story.

## Story so far (for the next writer)
{TL['hook']} → {TL['ask']}
"""
open(os.path.join(D, 'PUBLISH.md'), 'w').write(md); print('PUBLISH.md', S['code'])
