"""WI16 shot list (v3.2). Strings = O4 mechanics: strings=[dict(a=<id>, b=<id or [x,y]>, w=thickness, snapAt=..., tieAt=..., col=...)]."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
ST = dict(set='street', so=dict(variant='am'), day=True); OF = dict(set='office'); FN = dict(set='flat', so=dict(night=True, bags=True)); FD = dict(set='flat', so=dict(bags=True), day=True)
MH = dict(set='hall', so=dict()); BN = dict(set='bedroom', so=dict(night=True))
F = lambda who='YOU', side=1, bg=(760, 520, 1.5), **k: dict(who=who, side=side, bgCam=list(bg), **k)
FAN = lambda n=7, snap=None: [dict(a='YOU', b=[1100 + 120 * i, 300 + 60 * (i % 3)], w=.7, **({'snapAt': snap} if snap is not None and i == 3 else {})) for i in range(n)]
sh('L001', 'scene', 'fade', **ST, cam=push([960, 600, 1.2], .1), vx=900, who=[Y(860, 'reach', 'awe')], strings=FAN(7))
sh('L002', 'scene', **ST, cam=push([960, 600, 1.35], .12), vx=900, who=[Y(860, 'reach', 'shocked')], strings=FAN(7, 'L002:4'), slam=dict(t='SNAP', at='L002:4', x=.7, y=.3, c='red', sz=100))
sh('L003', 'kt', {'type': 'iris', 'fill': YEL}, cap=False, bg=YEL, items=[dict(k='rise', t='EVERY PROMISE', at='L003:3', y=.24, sz=96, c=INK), dict(k='slam', t='= A STRING', at='L003:7', y=.38, sz=170, c=INK),
   dict(k='pop', t='KEEP IT: GOLD', at='L004:0', x=.3, y=.58, sz=58, disc='#fff', c=INK), dict(k='pop', t='BREAK IT: SNAP', at='L005:0', x=.7, y=.58, sz=58, disc=CORAL, c='#fff')])
sh('L005+1.2', 'title', 'flash', cap=False, lines=['WHAT IF EVERY PROMISE', 'YOU MADE WAS A STRING?'], set='street', so=dict(variant='am'), bgCam=[900, 520, .7])
sh('L006', 'scene', 'whip', **OF, clock='MON 09:00', cam=push([1060, 580, 1.4], .1), who=[Y(900, 'explain', 'smile'), who('BOSS', 1200, 'crossArms', 'flat', f=-1)], strings=[dict(a='YOU', b='BOSS', w=.8, tieAt='L006:1')])
sh('L007', 'scene', 'whip', **FN, cam=push([900, 600, 1.4], .1), who=[Y(800, 'explain', 'smile'), who('THEO', 1060, 'stand', 'happy', f=-1)], strings=[dict(a='YOU', b='THEO', w=.9, tieAt='L007:1')])
sh('L008', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[dict(k='rise', t='MIRA', at='L008:0', y=.24, sz=80, c='#9fb6ff'), dict(k='typed', t='moving sunday. help?? 🥺', at='L008:0', y=.38, sz=58, cps=22),
   dict(k='pop', t='PROMISE', at='L008:8', x=.7, y=.56, sz=70, disc=YEL, c=INK)])
sh('L009', 'scene', 'whip', **FN, cam=push([900, 600, 1.45], .12), who=[Y(860, 'stand', 'guilty')], strings=[dict(a='YOU', b=[1500, 360], w=2.4, col='#ffd47e')], pops=[dict(t='3 WEEKS AGO', at='L009:9', c='cream', x=.68, y=.24, sz=90)])
sh('L010', 'face', **FN, **F(expr='guilty', push=.12))
sh('L011', 'scene', 'whip', **OF, clock='FRI 18:00', cam=push([1060, 580, 1.4], .1), who=[Y(900, 'stand', 'nervous'), who('BOSS', 1200, 'crossArms', 'flat', f=-1)], strings=[dict(a='YOU', b='BOSS', w=.8, snapAt='L011:4')])
sh('L012', 'scene', 'whip', **FN, clock='SAT 11:00', cam=push([900, 600, 1.45], .1), who=[Y(800, 'phone', 'neutral'), who('THEO', 1060, 'stand', 'sad', f=-1)], strings=[dict(a='YOU', b='THEO', w=.9, snapAt='L012:4')])
sh('L013', 'scene', 'dip', **ST, clock='SUNDAY', cam=push([960, 600, 1.3], .1), vx=960, who=[Y(960, 'stand', 'worried')],
   strings=[dict(a='YOU', b=[300, 420], w=2.4, col='#ffd47e'), dict(a='YOU', b=[1620, 420], w=1.4, col='#ffd47e')])
sh('L015', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='slam', t='← MUM', at='L015:0', x=.5, y=.32, sz=130, c=INK), dict(k='slam', t='MIRA →', at='L015:4', x=.5, y=.46, sz=130, c=CORAL),
   dict(k='rise', t='ONE WILL BREAK', at='L016:4', y=.6, sz=90, c=INK)])
sh('L017', 'scene', 'whip', **ST, cam=push([960, 600, 1.4], .12), vx=960, who=[Y(940, 'phone', 'guilty')], strings=[dict(a='YOU', b=[300, 420], w=2.4, col='#ffd47e'), dict(a='YOU', b=[1620, 420], w=1.4, col='#ffd47e')])
sh('L018', 'insert', **ST, ins='call', who='MIRA_HOME', name='Mira', expr='smirk', t0=8)
sh('L019', 'face', **ST, **F(expr='guilty', bg=(940, 520, 1.5)))
sh('L020', 'insert', **ST, ins='call', who='MIRA_HOME', name='Mira', expr='tender', t0=14)
sh('L021', 'scene', 'whip', **FD, cam=push([960, 600, 1.4], .12), vx=960, who=[who('MIRA_HOME', 960, 'holdFront', 'tender', f=-1)], strings=[dict(a='MIRA_HOME', b=[300, 420], w=1.4, col='#ffd47e', snapAt='L022:1')],
   pops=[dict(t='CUT, NOT SNAPPED', at='L022:5', c='gold', x=.5, y=.24, sz=90)])
sh('L023', 'insert', **ST, ins='call', who='MIRA_HOME', name='Mira', expr='smile', t0=22)
sh('L024', 'scene', 'dip', **MH, clock='SUN 15:00', cam=push([960, 600, 1.35], .12), vx=960, who=[Y(860, 'holdFront', 'happy'), who('MUM', 1080, 'holdFront', 'joy', f=-1)], strings=[dict(a='YOU', b='MUM', w=2.4, col='#ffd47e')],
   pops=[dict(t='GOLD', at='L024:7', c='gold', x=.5, y=.22, sz=120)])
sh('L025', 'scene', 'whip', **FD, clock='MON 19:00', cam=push([960, 600, 1.35], .1), vx=960, who=[Y(860, 'holdFront', 'smile'), who('MIRA_HOME', 1080, 'crossArms', 'smirk', f=-1)])
sh('L026', 'face', **FD, **F(expr='tender', bg=(860, 520, 1.5)))
sh('L027', 'scene', **FD, cam=push([960, 600, 1.4], .12), vx=960, who=[Y(860, 'holdFront', 'joy'), who('MIRA_HOME', 1080, 'holdFront', 'happy', f=-1)], strings=[dict(a='MIRA_HOME', b='YOU', w=1.2, tieAt='L027:1')],
   polaroid=dict(at='L027+0.5', caption='TIED BY HER.', ring=[970, 430, 300]))
sh('L028', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='word', t=w, at=f'L028:{i}', x=x, y=y, sz=130 if w == 'THICKEST' else 100, c=YEL if w == 'THICKEST' else '#fff') for i, (w, (x, y)) in enumerate(zip(
   ['WHO', 'HOLDS', 'THE', 'THICKEST', 'STRING', 'TO', 'YOU?'], [(.32, .28), (.68, .28), (.5, .4), (.5, .52), (.5, .64), (.4, .76), (.6, .76)]))])
finish('What If Every Promise You Made Was a String?', motif='num', tail=2.6, music=[(0, 'L005+', 'mystery', .3), ('L006', 'L012+', 'playful', .4), ('L013', 'L020+', 'tension', .3), ('L021', None, 'hopeful', .4)])
