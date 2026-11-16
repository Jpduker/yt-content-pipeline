#!/usr/bin/env python3
"""Chapter 3 long-form "The Fourth Ship" (16:9) = week-3 Shorts S29–S42 + new scenes. Reuses the Shorts' voice files (copied, renamed);
writes lines-new.json with only the new lines to voice. Usage: chapter3.py <shorts3_root> <out_dir>"""
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
shots += [shot('cold', 'night', MAP(**{ 'from': [20, 14, 50], 'to': [16, 12, 42], 'look': [15, 1, 18], 'look2': [15, 1, 19], 'fov': 34, 'band': .5 }), {},
               [L('c1', 'Every debt has a collector.', pause=.4), L('c2', 'This one came by sea.', pause=.6)], props=['barge'], events=[{ 't': 4.0, 'kind': 'horn' }], lead=1.4, tail=2.4, mood='dread')]
shots += [shot('card', 'night', MAP(**{ 'from': [-60, 56, 84], 'to': [-58, 55, 82] }), {}, [], card={ 'label': 'CHAPTER  III', 'title': 'The Fourth Ship' }, lamp='on', min=4.6, lead=0, tail=0, mood='mystery')]
shots += [shot('recap', 'night', MAP(), {},
               [L('p1', 'Previously, on the Keeper’s Island.'),
                L('p2', 'Under the lighthouse, a false lamp was wrecking ships, and the stranger lighting it was Gus’s own mother.'),
                L('p3', 'She owed the sea four ships for four years of life. Gus closed her lamp. And she left her coat on the rocks.', pause=.4)], lamp='on', lead=.8, tail=.8, mood='mystery')]
shots += take('S29') + take('S30') + take('S31') + take('S32')
shots += [shot('think', 'night', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [10, 9.4], 'h': [5, 4.6] }, { 'gus': { 'at': [21.4, -20.4], 'pose': 'lookUp', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [22.5, -20.0], 'pose': 'sit', 'face': 'l' } },
               [L('k1', 'That night Gus kept the lamp himself, sitting on the step below it, the way he had as a young man.'),
                L('k2', 'A man who never ages. A horn that answers another horn. A debt written on paper, not in the sea.', pause=.5),
                L('k3', 'For the first time in a month, the mystery had a face. A smiling one.', pause=.8)], lamp='on', lead=.8, tail=.8, mood='mystery')]
shots += take('S33') + take('S34')
shots += [shot('solve1', 'cave', { 'type': 'stage', 'az': [-60, -45], 'd': [8, 7.6], 'h': [9.6, 9.2] }, { 'gus': { 'at': [-96.2, -93.6], 'pose': 'look', 'face': 'l', 'hero': 1 } },
               [L('q1', 'Pause here. The contract says four ships, payable to the bearer.'),
                L('q2', 'Not to the sea. Not to the mother. To whoever holds the paper.', pause=.4)],
               solve={ 'q': 'If the debt belongs to the paper, how do you end it?', 'secs': 5 }, lead=.6, tail=6.2, mood='mystery')]
shots += take('S35') + take('S36') + take('S37') + take('S38')
shots += [shot('watch', 'night', { 'type': 'stage', 'at': [-1, 4.8, -14], 'az': [10, 4], 'd': [9.5, 9], 'h': [4.4, 4.2] }, { 'mabel': { 'at': [.4, -13.3], 'pose': 'sit', 'face': 'l', 'hero': 1 }, 'rollo': { 'at': [-.8, -13.2], 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': [-2.2, -13.6], 'pose': 'idle', 'face': 'r' } },
               [L('w1', 'Friday night nobody slept. Rollo counted the hours out loud until Mabel sat on him.'),
                L('w2', 'Gus polished his lantern until he could see his own face in the brass. Tomorrow it would have to do the work of a lighthouse.', pause=.8)], lead=.8, tail=.8, mood='dusk')]
shots += take('S39') + take('S40')
shots += [shot('solve2', 'storm', { 'type': 'dive', 'at': [14.4, 4.9, -12.0], 'az': [170, 176], 'd': [5, 4.6], 'h': [2.4, 2.2] }, { 'gus': { 'at': [14.4, -12.0], 'pose': 'up', 'face': 'r', 'hero': 1, 'lit': .4 } },
               [L('r1', 'One last pause. A false light below. The true lamp dark. One ember on a cliff.'),
                L('r2', 'Someone has to reach the low lamp before twelve seconds are up. Who is left that can?', pause=.4)],
               lamp='off', weather='rain', solve={ 'q': 'Who can reach the cave before the ferry reaches the rocks?', 'secs': 5 }, lead=.6, tail=6.2, mood='dread')]
shots += take('S41') + take('S42')
shots += [shot('title', 'dawn', MAP(**{ 'from': [-50, 44, 70], 'to': [-60, 56, 84], 'look': [10, 5, -12], 'look2': [8, 4, -10], 'fov': 38 }), {}, [],
               title={ 'title': 'THE KEEPER’S ISLAND', 'tag': 'Chapter IV · The Shadow in the Cave — next week', 'credit': 'Original story, characters and music · Voices: Kokoro TTS' }, lamp='on', min=8.0, lead=0, tail=0, mood='dusk')]
for sh in shots: sh.setdefault('mood', 'mystery')
CH = { 'code': 'CH03', 'title': 'The Keeper’s Island · Chapter 3: The Fourth Ship', 'label': None, 'hook': None, 'ask': None, 'music': { 'mood': 'mystery' }, 'shots': shots }
json.dump(CH, open(os.path.join(OUT, 'short.json'), 'w'), indent=1, ensure_ascii=False)
json.dump(reuse, open(os.path.join(OUT, 'voices', 'reuse.json'), 'w'), indent=1)
print(len(shots), 'shots', sum(len(s['lines']) for s in shots), 'lines;', len(reuse), 'reused')
