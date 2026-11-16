#!/usr/bin/env python3
"""Chapter 2 long-form "The Tunnel" (16:9) = week-2 Shorts S15–S28 + new scenes. Reuses the Shorts' voice files (copied, renamed);
writes lines-new.json with only the new lines to voice. Usage: chapter2.py <shorts2_root> <out_dir>"""
import json, os, sys, glob, shutil
SH, OUT = sys.argv[1], sys.argv[2]
os.makedirs(os.path.join(OUT, 'voices'), exist_ok=True)
CX, CZ = -95, -95
def C(x, z): return [CX + x, CZ + z]
def CA(x, y, z): return [CX + x, y, CZ + z]
def L(id, text, **k): d = { 'id': id, 'text': text }; d.update(k); return d
def shot(id, time, cam, cast=None, lines=None, **k):
    d = { 'id': id, 'time': time, 'cam': cam, 'cast': cast or {}, 'lines': lines or [] }; d.update(k); return d
shorts, dirs = {}, {}
for f in sorted(glob.glob(os.path.join(SH, '*', 'short.json'))):
    s = json.load(open(f)); shorts[s['code']] = s; dirs[s['code']] = os.path.dirname(f)
reuse = {}
def take(code):
    s = shorts[code]; out = []
    for sh in s['shots']:
        sh = json.loads(json.dumps(sh)); sh['id'] = f"{code}-{sh['id']}"; sh['mood'] = s.get('music', {}).get('mood', 'mystery')
        for ln in sh['lines']:
            new = f"{code.lower()}_{ln['id']}"; reuse[new] = os.path.join(dirs[code], 'voices', ln['id'] + '.wav'); ln['id'] = new
        sh['lead'] = min(sh.get('lead', .9), 1.0); out.append(sh)
    return out
shots = []
shots += [shot('cold', 'storm', { 'type': 'map', 'from': [-40, 34, 52], 'to': [-32, 28, 42], 'look': [16, 6, -34], 'look2': [18, 7, -38], 'fov': 34, 'band': .45 }, {},
               [L('c1', 'Some lights save ships.', pause=.4), L('c2', 'Some lights were built to drown them.', pause=.6)], props=['ship'], lamp={ 'flicker': 5.6, 'len': .9 },
               events=[{ 't': 1.2, 'kind': 'flash' }, { 't': 4.0, 'kind': 'horn' }], weather='rain', lead=1.4, tail=2.6, mood='dread')]
shots += [shot('card', 'night', { 'type': 'map', 'from': [-60, 56, 84], 'to': [-58, 55, 82], 'look': [8, 4, -10] }, {}, [], card={ 'label': 'CHAPTER  II', 'title': 'The Tunnel' }, lamp='off', min=4.6, lead=0, tail=0, mood='mystery')]
shots += [shot('recap', 'night', { 'type': 'map', 'from': [-58, 54, 82], 'to': [-50, 48, 70], 'look': [8, 4, -10], 'look2': [12, 6, -14] }, {},
               [L('p1', 'Previously, on the Keeper’s Island.'),
                L('p2', 'Every night at three twelve, the lamp went dark for twelve seconds, and a boat ran onto the north rocks.'),
                L('p3', 'The clues led under the headland, to a door older than the tower. And a stranger in a yellow coat who casts no shadow.'),
                L('p4', 'Three days were up. And Gus walked into the dark on purpose.', pause=.4)], lamp='off', lead=.8, tail=.8, mood='mystery')]
shots += take('S15') + take('S16') + take('S17') + take('S18')
# Bridge: Gus at the lamp room at dawn, remembering his mother
shots += [shot('memory', 'dawn', { 'type': 'map', 'from': [40, 26, -70], 'to': [34, 22, -62], 'look': [16, 6, -30], 'look2': [18, 8, -28], 'fov': 34, 'band': .5 }, { 'gus': { 'at': [21.4, -20.4], 'pose': 'lookUp', 'face': 'l', 'lit': 0 } },
               [L('m1', 'Gus never knew his mother. He knew a photograph, a yellow coat on a hook, and one sentence everyone on the island repeated.'),
                L('m2', 'She rowed out into the storm the night you were born, and the sea kept her.', pause=.5),
                L('m3', 'He had kept the lamp lit for thirty years so the sea would never keep anyone else.', pause=.8)], lead=.8, tail=.8, mood='dusk')]
shots += take('S19') + take('S20') + take('S21') + take('S22')
shots += [shot('solve1', 'night', { 'type': 'map', 'from': [40, 26, -70], 'to': [36, 24, -64], 'look': [16, 6, -30], 'fov': 34, 'band': .5 }, {},
               [L('q1', 'Pause here. Two lights, one above the other. A boat that steered onto the rocks as if it had been told to.'),
                L('q2', 'You already know how sailors use two lights. Think about what happens when one of them moves.', pause=.4)],
               props=['wreck'], solve={ 'q': 'How do two lights steer a ship onto the rocks?', 'secs': 5 }, lead=.6, tail=6.2, mood='mystery')]
shots += take('S23') + take('S24')
# Bridge: Rollo and Mabel keep watch while Gus sleeps (the lighter beat before the storm)
shots += [shot('watch', 'night', { 'type': 'stage', 'at': [-1, 4.8, -14], 'az': [10, 4], 'd': [9.5, 9], 'h': [4.4, 4.2] },
               { 'mabel': { 'at': [.4, -13.3], 'pose': 'sit', 'face': 'l', 'hero': 1 }, 'rollo': { 'at': [-.8, -13.2], 'pose': 'idle', 'face': 'r' } },
               [L('w1', 'That night Gus slept for the first time in a week. Mabel and Rollo took the watch.'),
                L('w2', 'Rollo watched the lamp. Mabel watched the sea. And just before dawn, Mabel’s ears went flat.', pause=.6),
                L('w3', 'Far out, past the north rocks, a small light was moving. Toward the island. In no hurry at all.', pause=.8)], lead=.8, tail=.8, mood='dread')]
shots += take('S25') + take('S26') + take('S27') + take('S28')
shots += [shot('solve2', 'dawn', { 'type': 'orbit', 'at': [11.4, 1.0, -46.8], 'az': [-10, 20], 'd': [9, 8.4], 'h': [5, 4.6] }, {},
               [L('r1', 'One more question before the end. The tale said four marks, one for each year the sea let him live.'),
                L('r2', 'The stranger said four ships. Count the wrecks you have seen, and count the marks.', pause=.4)],
               props=['wreck', 'coat'], solve={ 'q': 'If the sea is owed four, how many are still owed?', 'secs': 5 }, lead=.6, tail=6.2, mood='mystery')]
shots += [shot('tease', 'night', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [10, 9.4], 'h': [5, 4.6] }, { 'gus': { 'at': [21.4, -20.4], 'pose': 'lookUp', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [22.5, -20.0], 'pose': 'sit', 'face': 'l' } },
               [L('t1', 'That night the lamp turned, and turned, and did not miss once.'),
                L('t2', 'But at three twelve, far out at sea, a horn answered it. From somewhere no ship should be.', pause=.6)],
               lamp='on', events=[{ 't': 6.0, 'kind': 'horn' }], lead=.8, tail=1.2, mood='dusk')]
shots += [shot('title', 'night', { 'type': 'map', 'from': [-50, 44, 70], 'to': [-60, 56, 84], 'look': [10, 5, -12], 'look2': [8, 4, -10], 'fov': 38 }, {}, [],
               title={ 'title': 'THE KEEPER’S ISLAND', 'tag': 'Chapter III · The Fourth Ship — next week', 'credit': 'Original story, characters and music · Voices: Kokoro TTS' }, lamp='on', min=8.0, lead=0, tail=0, mood='dusk')]
for sh in shots: sh.setdefault('mood', 'mystery')
CH = { 'code': 'CH02', 'title': 'The Keeper’s Island · Chapter 2: The Tunnel', 'label': None, 'hook': None, 'ask': None, 'music': { 'mood': 'mystery' }, 'shots': shots }
json.dump(CH, open(os.path.join(OUT, 'short.json'), 'w'), indent=1, ensure_ascii=False)
json.dump(reuse, open(os.path.join(OUT, 'voices', 'reuse.json'), 'w'), indent=1)
print(len(shots), 'shots', sum(len(s['lines']) for s in shots), 'lines;', len(reuse), 'reused')
