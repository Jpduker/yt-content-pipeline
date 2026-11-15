#!/usr/bin/env python3
"""Chapter 1 long-form (16:9, ~10 min) = the 14 week-1 Shorts in order (hooks/asks removed) + new bridge scenes, a chapter card,
two "solve it" pauses, a clue recap and a Chapter 2 tease. Usage: chapter1.py <shorts_root> <out_dir>"""
import json, os, sys, glob
SH, OUT = sys.argv[1], sys.argv[2]
os.makedirs(os.path.join(OUT, 'voices'), exist_ok=True)
DOOR = [21.4, -20.4]; DOOR_M = [22.5, -20.0]
def L(id, text, **k): d = { 'id': id, 'text': text }; d.update(k); return d
def shot(id, time, cam, cast=None, lines=None, **k):
    d = { 'id': id, 'time': time, 'cam': cam, 'cast': cast or {}, 'lines': lines or [] }; d.update(k); return d
shorts = {}
for f in sorted(glob.glob(os.path.join(SH, '*', 'short.json'))):
    s = json.load(open(f)); shorts[s['code']] = s
def take(code, ids=None, mood=None):
    s = shorts[code]; out = []
    for sh in s['shots']:
        if ids and sh['id'] not in ids: continue
        sh = json.loads(json.dumps(sh)); sh['id'] = f"{code}-{sh['id']}"; sh['mood'] = mood or s.get('music', {}).get('mood', 'mystery')
        for ln in sh['lines']: ln['id'] = f"{code.lower()}_{ln['id']}"
        sh['lead'] = min(sh.get('lead', .9), 1.0); out.append(sh)
    return out

shots = []
# Cold open: the lamp dies (no words before the event), then the card
shots += [shot('cold', 'night', { 'type': 'map', 'from': [-40, 34, 52], 'to': [-30, 28, 40], 'look': [16, 8, -18], 'look2': [19, 11, -22], 'fov': 34, 'band': .45 }, {},
               [L('c1', 'Twelve minutes past three.', pause=.6)], lamp={ 'flicker': 3.2, 'len': .9 }, events=[{ 't': 6.0, 'kind': 'horn' }], lead=1.6, tail=3.0, mood='dread')]
shots += [shot('card', 'night', { 'type': 'map', 'from': [-60, 56, 84], 'to': [-58, 55, 82], 'look': [8, 4, -10] }, {}, [], card={ 'label': 'CHAPTER  I', 'title': 'Twelve Seconds of Dark' }, lamp='off', min=4.6, lead=0, tail=0, mood='mystery')]
s01 = take('S01'); s01[0]['lamp'] = 'on'
shots += s01
# Bridge A: Gus's morning ritual (day) — who he is, the island's one rule
shots += [shot('ritual', 'dawn', { 'type': 'track', 'side': 'south', 'h': 5.4, 'd': 13.5, 'lead': 2.0 },
               { 'gus': { 'at': [-1.5, -11], 'to': [8.5, -11.6], 'walk': [.4, 12.5], 'pose': 'walk', 'face': 'r', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [-3, -10.7], 'to': [7, -11.2], 'walk': [.6, 12.7], 'pose': 'walk', 'face': 'r' } },
               [L('a1', 'Every morning for thirty years, Gus has walked the same path to the same tower.'),
                L('a2', 'He winds the clock. He trims the wick. He writes one line in the log: lamp kept.'),
                L('a3', 'The island has exactly one rule, older than anyone living on it.', pause=.6),
                L('a4', 'The lamp never goes out. Not for weather. Not for war. Not for anyone.', pause=.4)], lead=.8, tail=.6, mood='day')]
shots += take('S02') + take('S03') + take('S04')
# Solve it #1
shots += [shot('solve1', 'day', { 'type': 'top', 'h': [16, 15], 'fov': 40, 'at': [12, 1, -40] }, {},
               [L('q1', 'Stop here for a second. You have seen three things.'),
                L('q2', 'A clock stopped by hand. Fins on the stairs. A coat on rocks where no boat can land.'),
                L('q3', 'Somebody came out of the sea, climbed the tower, and left by a way nobody watches.', pause=.4)],
               props=['wreck'], solve={ 'q': 'Which way does a diver leave an island unseen?', 'secs': 5 }, lead=.6, tail=6.2, mood='mystery')]
shots += take('S05') + take('S06')
# Bridge B: what the yellow paint says
shots += [shot('paint', 'day', { 'type': 'dive', 'at': [14, 4.6, -11.6], 'az': [-20, -10], 'd': [7.5, 7], 'h': [3.2, 3.0] },
               { 'gus': { 'at': [13.4, -11.8], 'pose': 'look', 'face': 'r', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [12.2, -11.4], 'pose': 'sit', 'face': 'r' } },
               [L('b1', 'Paint does not lie. Whoever cut the cable walked through it, and kept walking.'),
                L('b2', 'Not toward the harbour. Not toward the village. Toward the rock itself.', pause=.5)], props=['prints'], lead=.6, tail=.6, mood='tense')]
shots += take('S07') + take('S08')
# Bridge C: the night with no lamp — Gus counts what he knows
shots += [shot('count', 'night', { 'type': 'stage', 'at': [-1, 4.8, -14], 'az': [10, 4], 'd': [9.5, 9], 'h': [4.4, 4.2] },
               { 'gus': { 'at': [-1.2, -13.6], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [.4, -13.3], 'pose': 'sit', 'face': 'l' }, 'rollo': { 'at': [-2.6, -13.2], 'pose': 'idle', 'face': 'r' } },
               [L('k1', 'That night the island had no light at all, and Gus could not sleep. So he counted.'),
                L('k2', 'One. A clock, stopped by hand. Two. A cable, cut from inside. Three. A door, older than the tower.'),
                L('k3', 'Four. A stranger who never casts a shadow.', pause=.6),
                L('k4', 'And five. Every clue led to the same place. Under his own feet.', pause=.8)], lamp='off', lead=.8, tail=.8, mood='dread')]
shots += take('S09') + take('S10')
# Solve it #2
shots += [shot('solve2', 'night', { 'type': 'dive', 'at': [13.4, 5.0, -13.6], 'az': [-14, -8], 'd': [6, 5.6], 'h': [2.6, 2.4] },
               { 'gus': { 'at': [13.4, -13.6], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 } },
               [L('r1', 'Before you go on. A flame needs three things. Fuel. Heat. Air.'),
                L('r2', 'Gus’s lantern had oil, and it was hot. So in that tunnel, something took the third.', pause=.5)],
               lamp='off', solve={ 'q': 'What in a sea-cave can steal the air from a flame?', 'secs': 5 }, lead=.6, tail=6.2, mood='dread')]
shots += take('S11') + take('S12') + take('S13') + take('S14')
# Ending: Chapter 2 tease + title
shots += [shot('tease', 'night', { 'type': 'stage', 'at': [13.6, 5.2, -14.4], 'az': [-26, -14], 'd': [8.5, 8], 'h': [3.8, 3.6] },
               { 'gus': { 'at': [12.6, -12.9], 'to': [13.4, -13.6], 'walk': [1.0, 3.6], 'pose': 'up', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [11.4, -12.4], 'to': [12.3, -13.0], 'walk': [1.4, 3.8], 'pose': 'walk', 'face': 'l' } },
               [L('t1', 'At twelve minutes past three, the keeper of the lamp walked into the dark on purpose.'),
                L('t2', 'Behind him, for the first time in a hundred years, nobody kept the light.', pause=.6)], lamp='off', lead=.8, tail=1.0, mood='dusk')]
shots += [shot('title', 'night', { 'type': 'map', 'from': [-50, 44, 70], 'to': [-60, 56, 84], 'look': [10, 5, -12], 'look2': [8, 4, -10], 'fov': 38 }, {}, [],
               title={ 'title': 'THE KEEPER’S ISLAND', 'tag': 'Chapter II · The Tunnel — next week', 'credit': 'Original story, characters and music · Voices: Kokoro TTS' }, lamp='off', min=8.0, lead=0, tail=0, mood='dusk')]
for sh in shots: sh.setdefault('mood', 'mystery')
CH = { 'code': 'CH01', 'title': 'The Keeper’s Island · Chapter 1: Twelve Seconds of Dark', 'label': None, 'hook': None, 'ask': None,
       'music': { 'mood': 'mystery' }, 'shots': shots }
json.dump(CH, open(os.path.join(OUT, 'short.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots', sum(len(s['lines']) for s in shots), 'lines')
