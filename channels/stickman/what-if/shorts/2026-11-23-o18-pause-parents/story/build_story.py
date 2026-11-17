"""O18 shot list (v3.2, 9:16). Pause = freeze=True with the countdown ring; hero = who still moves."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
FD = dict(set='flat', so=dict(bags=True), day=True); FZ = dict(freeze=True)
sh('L001', 'scene', **FD, **FZ, hero='ZARA', fring=[0, 'L005+0.3'], cam=push([960, 600, 1.15], .1), vx=960, hookText='SHE PAUSED HER MUM',
   who=[who('MA', 1080, 'point', 'angry', f=-1), who('ZARA', 840, 'stand', 'smirk')])
sh('L002', 'kt', {'type': 'push'}, cap=False, bg=YEL, items=[dict(k='rise', t='EVERY KID GETS', at='L002:0', y=.2, sz=84, c=INK), dict(k='slam', t='1 PAUSE', at='L002:3', y=.32, sz=190, c=INK), dict(k='pop', t='10s', at='L002:7', x=.78, y=.44, sz=90, disc=INK, c=YEL)])
sh('L003', 'scene', {'type': 'push'}, **FD, **FZ, hero='ZARA', fring=[0, 'L005+0.3'], cam=push([960, 600, 1.15], .1), vx=960,
   who=[who('MA', 1080, 'point', 'angry', f=-1), who('ZARA', 0, 'walk', 'nervous', walk=[840, 700, 0, .6])], pops=[dict(t='BROKEN VASE', at='L003:7', c='red', x=.5, y=.22, sz=100)])
sh('L004', 'kt', cap=False, bg=NAVY, items=[dict(k='word', t=w, at=f'L004:{i}', x=.5, y=.3 + i * .14, sz=140, c='#fff') for i, w in enumerate(['9', '8', '7'])])
sh('L005', 'face', **FD, who='ZARA', expr='joy', side=1, bgCam=[840, 520, 1.5])
sh('L006', 'scene', 'whip', **FD, **FZ, hero='DAD', fring=[0, 'L008+0.3'], cam=push([960, 600, 1.15], .1), vx=960, who=[who('ZARA', 840, 'stand', 'smirk'), who('DAD', 1080, 'stand', 'smirk', f=-1)])
sh('L007', 'kt', {'type': 'bands'}, cap=False, bg=CREAM, items=[dict(k='rise', t='PARENTS GET', at='L007:2', y=.26, sz=90, c=INK), dict(k='marker', t='ONE TOO', at='L007:3', mark='L007:4', y=.4, sz=170, c=INK, mc=YEL)])
sh('L008', 'face', **FD, who='DAD', expr='smirk', side=-1, bgCam=[1080, 520, 1.5])
sh('L009', 'scene', **FD, **FZ, hero='DAD', cam=push([960, 600, 1.2], .12), vx=960, who=[who('ZARA', 840, 'stand', 'smirk'), who('DAD', 1080, 'holdFront', 'smirk', f=-1)],
   pops=[dict(t='GLUED', at='L009:4', c='lime', x=.5, y=.22, sz=110)], ask=dict(text='What would YOU do with a 10-second pause?', at='L009+0.1'))
finish('In This World, Kids Can Pause Their Parents for 10 Seconds', motif='num', tail=2.4, music=[(0, None, 'playful', .42)])
