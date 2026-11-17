"""O20 shot list (v3.2, 9:16). Nina's lost voice = a crossed-out speech bubble (KT) + silent mouthing; voice back = slam of his name."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
HL = dict(set='hall', so=dict()); ST = dict(set='street', so=dict(variant='am'), day=True)
sh('L001', 'scene', **HL, cam=push([960, 600, 1.15], .1), vx=960, hookText='"I HATE YOU"', who=[who('NINA', 850, 'point', 'angry'), who('OLI', 1080, 'stand', 'hurt', f=-1)])
sh('L002', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[dict(k='rise', t='3 WORDS', at='L002:3', y=.24, sz=110, c='#fff'), dict(k='slam', t='NO VOICE', at='L002:6', y=.38, sz=170, c=CORAL),
   dict(k='rise', t='UNTIL YOU MEAN', at='L002:9', y=.52, sz=78, c='#fff'), dict(k='rise', t='THE OPPOSITE', at='L002:12', y=.61, sz=78, c=YEL)])
sh('L003', 'face', **HL, who='NINA', expr='worried', side=1, bgCam=[850, 520, 1.5], pops=[dict(t='...', at='L003:5', c='cream', x=.5, y=.18, sz=150)])
sh('L004', 'kt', {'type': 'bands'}, cap=False, bg=CREAM, items=[dict(k='word', t=w, at=f'L004:{i}', x=.5, y=.3 + i * .12, sz=110, c=INK if i < 2 else CORAL) for i, w in enumerate(['3 DAYS', '', '0 WORDS'][:3]) if w])
sh('L005', 'scene', 'push', **HL, cam=push([960, 600, 1.15], .1), vx=960, who=[who('NINA', 850, 'stand', 'sad'), who('OLI', 1080, 'phone', 'flat', f=-1)])
sh('L006', 'scene', 'whip', **ST, cam=push([960, 600, 1.15], .1), vx=960, who=[who('OLI', 1040, [[0, 'stand'], ['L006:5', 'fall']], [[0, 'happy'], ['L006:5', 'shocked']], f=-1), who('NINA', 820, 'stand', 'neutral')],
   slam=dict(t='CRASH', at='L006:5', x=.55, y=.3, c='red', sz=110))
sh('L007', 'face', **ST, who='NINA', expr='shocked', side=1, bgCam=[820, 520, 1.5], pops=[dict(t='OLI!', at='L007:0', c='gold', x=.5, y=.18, sz=170)])
sh('L008', 'scene', **ST, cam=push([960, 600, 1.2], .12), vx=960, who=[who('NINA', 880, 'kneel', 'tearsmile'), who('OLI', 1060, 'sitHands', 'tender', f=-1)],
   ask=dict(text='Have you ever said it and not meant it?', at='L008+0.1'))
finish('Her Voice Disappeared After She Said "I Hate You"', motif='num', tail=2.4, music=[(0, 'L005+', 'sad', .3), ('L006', None, 'hopeful', .36)])
