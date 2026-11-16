#!/usr/bin/env python3
"""Chapter 4 long-form "The Shadow in the Cave" (16:9) = week-4 Shorts S43–S56 + new scenes. Reuses the Shorts' voice files (copied, renamed);
writes lines-new.json with only the new lines to voice. Usage: chapter4.py <shorts4_root> <out_dir>"""
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
MAP = lambda **k: dict({ 'type': 'map', 'from': [-58, 54, 82], 'to': [-50, 48, 70], 'look': [8, 4, -10], 'look2': [12, 6, -14] }, **k)
DOOR = [21.4, -20.4]; DOOR_M = [22.5, -20.0]
shots += [shot('cold', 'night', { 'type': 'stage', 'at': [-86.6, 2.2, -90.6], 'az': [-66, -60], 'd': [12.8, 11.4], 'h': [1.5, 1.3], 'aper': 60 }, {},
               [L('c1', 'Every shadow has an owner.', pause=.4), L('c2', 'This one was going home.', pause=.6)], props=['cshadow'], events=[{ 't': 3.4, 'kind': 'whoosh' }], lead=2.4, tail=2.0, mood='dread')]
shots += [shot('card', 'night', MAP(**{ 'from': [-60, 56, 84], 'to': [-58, 55, 82] }), {}, [], card={ 'label': 'CHAPTER  IV', 'title': 'The Shadow in the Cave' }, lamp='on', min=4.6, lead=0, tail=0, mood='mystery')]
shots += [shot('recap', 'night', MAP(), {},
               [L('p1', 'Previously, on the Keeper’s Island.'),
                L('p2', 'A man who never aged came to collect four ships. Gus’s mother burned his contract in the cave, and the sea took Silas Crane.'),
                L('p3', 'But his shadow stayed behind, on the wall. Smiling.', pause=.6)], lamp='on', lead=.8, tail=.8, mood='mystery')]
shots += take('S43') + take('S44') + take('S45') + take('S46')
shots += [shot('think', 'night', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [10, 9.4], 'h': [5, 4.6] }, { 'gus': { 'at': DOOR, 'pose': 'lookUp', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': DOOR_M, 'pose': 'sit', 'face': 'l' } },
               [L('k1', 'The next night Gus kept the lamp himself, on the step below it, with the ring of lanterns still burning in his eyes.'),
                L('k2', 'A shadow that walks. A shadow that cannot cross light. A shadow that goes home to the family that sold it.', pause=.5),
                L('k3', 'And a family name Wren would only say in daylight.', pause=.8)], lamp='on', lead=.8, tail=.8, mood='mystery')]
shots += take('S47') + take('S48')
shots += [shot('solve1', 'day', MAP(**{ 'from': [-40, 34, 52], 'to': [-32, 28, 42], 'look': [16, 6, -34], 'fov': 34, 'band': .45 }), {},
               [L('q1', 'Pause here. The shadow came home to the family that sold it.'),
                L('q2', 'Gus’s grandfather sold it in 1926. His grandfather is gone. His mother has her own shadow back.', pause=.4)],
               solve={ 'q': 'So who is the shadow really coming for?', 'secs': 5 }, lead=.6, tail=6.2, mood='mystery')]
shots += take('S49') + take('S50') + take('S51') + take('S52')
shots += [shot('watch', 'night', { 'type': 'stage', 'at': [-1, 4.8, -14], 'az': [10, 4], 'd': [9.5, 9], 'h': [4.4, 4.2] }, { 'mabel': { 'at': [.4, -13.3], 'pose': 'sit', 'face': 'l', 'hero': 1 }, 'rollo': { 'at': [-.8, -13.2], 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': [-2.2, -13.6], 'pose': 'idle', 'face': 'r' } },
               [L('w1', 'That night Gus slept with his lantern lit, for the first time since he was a boy.'),
                L('w2', 'Mabel slept on his chest. She had not left his side since the pool, and she was not about to start.', pause=.8)], lead=.8, tail=.8, mood='dusk')]
shots += take('S53')
shots += [shot('solve2', 'night', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [11, 10.4], 'h': [5.2, 4.8] }, { 'gus': { 'at': [21.0, -19.6], 'pose': 'up', 'face': 'r', 'hero': 1 } },
               [L('r1', 'One last pause. A shadow always falls away from its light.'),
                L('r2', 'The tower above. The cave lamp below. A ring of lanterns all round. And Gus in the middle.', pause=.4)],
               ringAt=[21.2, 9.2, -19.4, 3.2], lamp='on', solve={ 'q': 'Where is there left for the shadow to fall?', 'secs': 5 }, lead=.6, tail=6.2, mood='dread')]
shots += take('S54') + take('S55') + take('S56')
shots += [shot('title', 'dawn', MAP(**{ 'from': [-50, 44, 70], 'to': [-60, 56, 84], 'look': [10, 5, -12], 'look2': [8, 4, -10], 'fov': 38 }), {}, [],
               title={ 'title': 'THE KEEPER’S ISLAND', 'tag': 'Chapter V · The Last Page — next week', 'credit': 'Original story, characters and music · Voices: Kokoro TTS' }, lamp='on', min=8.0, lead=0, tail=0, mood='dusk')]
for sh in shots: sh.setdefault('mood', 'mystery')
CH = { 'code': 'CH04', 'title': 'The Keeper’s Island · Chapter 4: The Shadow in the Cave', 'label': None, 'hook': None, 'ask': None, 'music': { 'mood': 'mystery' }, 'shots': shots }
json.dump(CH, open(os.path.join(OUT, 'short.json'), 'w'), indent=1, ensure_ascii=False)
json.dump(reuse, open(os.path.join(OUT, 'voices', 'reuse.json'), 'w'), indent=1)
print(len(shots), 'shots', sum(len(s['lines']) for s in shots), 'lines;', len(reuse), 'reused')
