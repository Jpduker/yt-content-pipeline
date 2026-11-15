#!/usr/bin/env python3
"""Write PUBLISH.md for an Island Short from short.json + timeline.json. Usage: publish.py <short_dir>"""
import json, os, sys
D = os.path.abspath(sys.argv[1]); S = json.load(open(os.path.join(D, 'short.json'))); TL = json.load(open(os.path.join(D, 'timeline.json')))
n = int(S['code'][1:]); day = S['day']; slot = S['slot']
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
}
blurb = TL['hook']
desc = f"""{S['title']}.

{blurb}

The Keeper's Island · Chapter 1, part {n}. One island, one lighthouse, one keeper who swears it isn't him. Every episode continues the story; every clue is on screen before it matters. New parts every day.

Part {n - 1 if n > 1 else 1} → previous Short · Part {n + 1} → tomorrow.
Made entirely in code: hand-drawn pixel characters inside a lit 3D miniature. Original story, characters and music. Narration by Kokoro TTS.

#Shorts #mystery #lighthouse #pixelart #storytime #animation #keepersisland"""
tags = ['the keeper\'s island', 'lighthouse mystery', 'pixel art story', 'animated short story', 'mystery shorts', 'storytime animation', 'cozy mystery', 'serial story', 'lighthouse keeper', 'riddle story', 'pixel art animation', 'diorama', 'island mystery', 'cliffhanger', f'chapter 1 part {n}']
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
Vertical 9:16 illustration, pixel-art characters standing like paper cut-outs inside a lit, fogged 3D miniature diorama seen from a high three-quarter angle with a tilt-shift blur band, heavy vignette, strong bloom on every lamp. Scene: {THUMB_SCENE[n]}. Palette: cold blue night (or pale daylight where stated) against warm amber practicals; the old keeper wears a sea-green oilskin coat, mustard scarf, navy wool cap, white beard. No text, no logos, no game references. Leave the top 20 % and bottom 25 % uncluttered.
Text to add yourself (Cinzel-like serif, gold): **{S['hook'].split('.')[0].upper()[:28]}**

## Credits (keep in the project; not needed in the description)
Voices: Kokoro TTS (am_michael narrator{', bm_george as Dunn' if any(l.get('dlg') == 'DUNN' for sh in S['shots'] for l in sh['lines']) else ''}{', bf_emma as Old Wren' if any(l.get('dlg') == 'WREN' for sh in S['shots'] for l in sh['lines']) else ''}). Music: original cue rendered with lemo-opuscar's sampler (VSCO2 CE / Salamander samples, CC0 / CC-BY-3.0 — see tools/lemo-opuscar/core/audio/instruments/*/LICENSE). Engine: lemo-opuscar 2.5D Pixel Art (MIT code); our own world, cast and story.

## Story so far (for the next writer)
{TL['hook']} → {TL['ask']}
"""
open(os.path.join(D, 'PUBLISH.md'), 'w').write(md); print('PUBLISH.md', S['code'])
