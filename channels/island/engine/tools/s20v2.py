"""TEST (2026-11-18): S20 'Rollo sneezes' rebuilt with the v2 shot grammar — one shot per narration beat, the picture shows
exactly what the line says (the hood, the count, the sneeze, the turn, the splash, the locket), hard cuts inside a scene,
crash-zoom on the sneeze, an insert close-up of the locket, HD sprites. Usage: s20v2.py <out_root>"""
import sys, os, json
from island_common import *
ROOT = sys.argv[1]
ST = C(2.2, -.6); GUS = C(-6.0, -6.6); ROL = C(-5.2, -7.6); WATER = C(1.6, 8.9)
def hard(**k): k.setdefault('min', .8); k.setdefault('cut', 'hard'); k.setdefault('lead', .25); k.setdefault('tail', .2); k.setdefault('under', 'on'); return k
st = lambda **o: dict({ 'at': ST, 'pose': 'idle', 'face': 'r', 'tag': False }, **o)
gus = lambda **o: dict({ 'at': GUS, 'pose': 'look', 'face': 'r', 'lit': .25 }, **o)
rol = lambda **o: dict({ 'at': ROL, 'pose': 'idle', 'face': 'r' }, **o)
S = dict(code='S20', day='2026-11-25', slot=2, title='Rollo sneezes', hook='Twelve seconds of silence. Rollo lasted nine.',
  ask='A locket with Gus’s face… as a baby. Who keeps that?', music={ 'mood': 'tense' }, shots=[
  # 1 over Gus's shoulder: the stranger at the lamp
  shot('watch', 'cave', { 'type': 'stage', 'at': CA(-1.9, 1.0, -3.6), 'az': [-121, -119], 'd': [9.6, 9.0], 'h': [1.5, 1.4], 'ease': 'lin', 'aper': 90 },
       { 'stranger': st(hero=1), 'gus': gus(tag=False), 'rollo': rol(tag=False) }, [L('n1', 'The stranger stood by the lamp, and counted.', pause=.2)], under='on', lead=1.4, tail=.2),
  # 2 the hood, from behind, close
  shot('hood', 'cave', { 'type': 'dive', 'az': [-104, -98], 'd': [3.6, 3.1], 'h': [.5, .4], 'ease': 'lin' }, { 'stranger': st(hero=1, eye=1.25) },
       [L('n2', 'Gus could see the hood move.', pause=.1)], pov='gus', **hard()),
  # 3 the count: tighter, the hood dips on each number
  shot('count', 'cave', { 'type': 'dive', 'az': [-62, -58], 'd': [2.6, 2.4], 'h': [.25, .2], 'ease': 'lin' }, { 'stranger': st(hero=1, eye=1.3, acts=[{ 't': .45, 'kind': 'flinch' }, { 't': .88, 'kind': 'flinch' }, { 't': 1.32, 'kind': 'flinch' }]) },
       [L('n3', 'One. Two. Three.', pause=.5)], events=[{ 't': .45, 'kind': 'tick' }, { 't': .88, 'kind': 'tick' }, { 't': 1.32, 'kind': 'tick' }], **hard()),
  # 4 Rollo, nose twitching -> the sneeze (crash zoom on the sneeze; times patched after the voice is timed)
  shot('sneeze', 'cave', { 'type': 'dive', 'az': [62, 58], 'd': [2.0, 1.7], 'h': [.35, .3], 'ease': 'lin', 'punch': { 't': 2.35, 'k': .74, 'shake': .05 } },
       { 'rollo': rol(hero=1, pose='sniff', poses=[[1.85, 'sneeze0'], [2.35, 'sneeze1'], [2.8, 'sneeze2']], acts=[{ 't': 2.35, 'kind': 'sneeze' }]), 'gus': gus() },
       [L('n4', 'Nine seconds in, Rollo sneezed.', pause=.7)], events=[{ 't': 2.35, 'kind': 'sneeze' }], puffs=[{ 't': 2.35, 'at': [-99.55, .66, -101.9], 'n': 8, 'dir': [1, 0], 'speed': .9, 'size': .045 }], **hard()),
  # 5 the hood turns
  shot('turn', 'cave', { 'type': 'dive', 'az': [-100, -96], 'd': [3.6, 3.2], 'h': [.4, .35], 'punch': { 't': .9, 'k': .8 } },
       { 'stranger': st(hero=1, eye=1.25, faces=[[.9, 'l']], acts=[{ 't': .9, 'kind': 'flinch' }]) }, [L('n5', 'The hood turned.', pause=.3)], **hard()),
  # 6 not toward the noise: toward Gus (reverse, from her side)
  shot('gus', 'cave', { 'type': 'dive', 'az': [52, 56], 'd': [3.4, 2.6], 'h': [.7, .6], 'ease': 'in' },
       { 'gus': gus(hero=1, pose='look', acts=[{ 't': 1.6, 'kind': 'flinch' }]), 'rollo': rol(pose='look') },
       [L('n6', 'Not toward the noise. Toward Gus.', pause=.3)], offscreen=['stranger'], **hard()),
  # 6b what Gus sees: the hood, now facing him, slow push from where he stands
  shot('known', 'cave', { 'type': 'stage', 'az': [-126, -126], 'd': [5.6, 4.0], 'h': [1.2, 1.1], 'ease': 'in' }, { 'stranger': st(hero=1, eye=1.2, face='l') },
       [L('n7', 'As if the stranger had known, all along, exactly where he was.', pause=.4)], **hard()),
  # 7 the splash: she steps off the shelf and is gone
  shot('splash', 'cave', { 'type': 'stage', 'az': [-112, -108], 'd': [7.6, 7.2], 'h': [3.6, 3.4], 'aper': 120 },
       { 'stranger': st(at=C(1.8, 5.2), to=WATER, walk=[0, .85], pose='walk', face='l', hide=.95, hero=1) },
       [L('n8', 'Then a splash,', pause=.1)], events=[{ 't': .95, 'kind': 'splash' }], rings=[{ 't': .95, 'at': CA(1.6, -1.22, 9.9), 'r': 2.6 }],
       puffs=[{ 't': .95, 'at': CA(1.6, -.9, 9.6), 'n': 10, 'col': '#9ff0d8', 'dir': [0, 1], 'speed': 1.4, 'size': .3 }], **hard(lead=.3, tail=.1)),
  shot('ring', 'cave', { 'type': 'stage', 'at': CA(1.6, -1.2, 9.9), 'az': [-160, -164], 'd': [1.8, 2.0], 'h': [7.4, 7.8], 'lookOff': [0, 0, 0] }, {},
       [L('n9', 'a ring of green light on the water,', pause=.1), L('n10', 'and nothing.', pause=1.0)], rings=[{ 't': -1.0, 'at': CA(1.6, -1.22, 9.9), 'r': 2.6 }, { 't': .3, 'at': CA(1.6, -1.22, 9.9), 'r': 3.4, 'col': '#5affb8' }], **hard(tail=.3)),
  # 8 Rollo runs to the waterline
  shot('run', 'cave', { 'type': 'track', 'side': 'south', 'h': .7, 'd': 2.8, 'lead': .5 }, { 'rollo': rol(at=C(-3.6, 2.0), to=C(.6, 5.6), walk=[.1, 2.6], hero=1) },
       [L('n11', 'Rollo, ashamed, ran to the waterline to make up for it.', pause=.3)], events=[{ 't': .2, 'kind': 'squeak' }], **hard(cut='dip')),
  shot('drag', 'cave', { 'type': 'dive', 'az': [70, 60], 'd': [2.4, 2.0], 'h': [.45, .4] }, { 'rollo': rol(at=C(.6, 5.4), to=C(-.6, 4.2), walk=[.2, 3.0], pose='drag', walkPose='drag', face='l', carry='locket', hero=1) },
       [L('n12', 'He came back dragging something on a chain.', pause=.3)], events=[{ 't': .4, 'kind': 'chain' }, { 't': 1.4, 'kind': 'chain' }], **hard()),
  # 9 the insert: the locket, open
  shot('locket', 'cave', { 'type': 'dive', 'az': [70, 66], 'd': [1.6, 1.5], 'h': [.3, .3] }, { 'rollo': rol(at=C(-.6, 4.2), carry='locket', hero=1) },
       [L('n13', 'A silver locket.', pause=.2), L('n14', 'Inside, a tiny painted face Gus had only ever seen in his mother’s photographs.', pause=.4)], insert='locket', events=[{ 't': .3, 'kind': 'bell' }], **hard()),
  # 10 Gus, close, slow push
  shot('baby', 'cave', { 'type': 'dive', 'az': [40, 44], 'd': [3.8, 3.2], 'h': [.3, .2], 'ease': 'in' }, { 'gus': gus(at=C(-1.4, 3.4), hero=1, lit=.6, pose='look') },
       [L('n15', 'His own.', pause=.6), L('n16', 'As a baby.', pause=1.0)], **hard(tail=1.0)),
])
S['thumb'] = 'a tiny mouse mid-sneeze in a green-glowing sea cave, a hooded figure by a glowing brass lamp turning around'; S['thumbText'] = 'ACHOO.'
S['label'] = "THE KEEPER'S ISLAND · 20"; S['outro'] = 'mabel'; S['next'] = { 'part': 21, 'title': 'The boat that belonged to nobody', 'when': 'TOMORROW' }
d = os.path.join(ROOT, '2026-11-25-s20-rollo-sneezes-v2'); os.makedirs(os.path.join(d, 'voices'), exist_ok=True)
json.dump(S, open(os.path.join(d, 'short.json'), 'w'), indent=1, ensure_ascii=False); print(d)
