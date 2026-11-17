"""WI14 shot list (v3.2). One carrier per fact per frame. Freeze = P2 mechanics (freeze=True, hero = whoever still moves, fring = countdown ring)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
KN = dict(set='kitchen', so=dict(drawing=False, night=True)); OF = dict(set='office'); CA = dict(set='cafe', so=dict(variant='am'), day=True)
FN = dict(set='flat', so=dict(night=True, bags=True)); MH = dict(set='hall', so=dict())
F = lambda who='YOU', side=1, bg=(760, 520, 1.5), **k: dict(who=who, side=side, bgCam=list(bg), **k)
FZ = dict(freeze=True)
# HOOK
sh('L001', 'scene', 'fade', **KN, **FZ, hero='YOU', fring=[0, 'L002+0.6'], cam=push([960, 600, 1.2], .1), vx=960,
   who=[who('MUM', 760, 'talk', 'happy'), Y(960, 'stand', 'smirk'), who('THEO', 1160, 'sit', 'neutral', f=-1)], chairs=[[1160, -1]])
sh('L003', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='bignum', t='5', at='L003:0', x=.7, y=.62, sz=900, c='#fff', a=.08),
   dict(k='slam', t='EVERY LIE', at='L003:4', y=.3, sz=200, c=YEL), dict(k='rise', t='FREEZES EVERYONE', at='L003:5', y=.46, sz=90, c='#fff'), dict(k='rise', t='BUT THE LIAR', at='L003:7', y=.58, sz=90, c='#fff')])
sh('L004', 'scene', {'type': 'push'}, **KN, **FZ, hero='YOU', fring=[0, 'L005+0.6'], cam=push([960, 600, 1.3], .1), vx=960,
   who=[who('THEO', 860, 'crossArms', 'angry'), Y(0, 'walk', 'smirk', walk=[1080, 1180, .3, .9], f=1)])
sh('L005+0.7', 'title', 'flash', cap=False, lines=['WHAT IF EVERY LIE', 'FROZE THE WORLD FOR 5 SECONDS?'], set='kitchen', so=dict(drawing=False), bgCam=[900, 520, .7])
# ACT 1
sh('L006', 'scene', 'whip', **OF, clock='MON 09:30', cam=push([1060, 580, 1.4], .1), who=[Y(900, 'stand', 'smile'), who('BOSS', 1220, 'crossArms', 'flat', f=-1)])
sh('L007', 'face', **OF, **F('BOSS', -1, (1200, 520, 1.5), expr='flat'))
sh('L008', 'face', **OF, **F(expr='smirk'))
sh('L009', 'scene', **OF, **FZ, hero='YOU', fring=[0, 'L009+0.4'], cam=push([1060, 580, 1.4], .1), who=[Y(0, 'reach', 'joy', walk=[900, 1100, 0, .5]), who('BOSS', 1220, 'crossArms', 'flat', f=-1)],
   pops=[dict(t='BISCUIT', at='L009:9', c='gold', x=.72, y=.26, sz=110)])
sh('L010', 'scene', 'whip', **CA, clock='MON 12:30', cam=push([1000, 580, 1.4], .1), who=[Y(860, 'stand', 'neutral'), who('BARISTA', 1160, 'holdFront', 'neutral', f=-1)])
sh('L011', 'scene', **CA, **FZ, hero='YOU', fring=[0, 'L012+0.5'], cam=push([1000, 580, 1.5], .1), who=[Y(860, 'holdFront', 'smirk'), who('BARISTA', 1160, 'point', 'neutral', f=-1)])
sh('L013', 'kt', {'type': 'bands'}, cap=False, bg=CREAM, items=[dict(k='rise', t='LYING IS A', at='L013:0', y=.3, sz=96, c=INK), dict(k='marker', t='SUPERPOWER', at='L013:5', mark='L013:7', y=.47, sz=200, c=INK, mc=YEL),
   dict(k='rise', t='5 SECONDS AT A TIME', at='L014:0', y=.65, sz=80, c=INK)])
# ACT 2 (the twist)
sh('L015', 'scene', 'dip', **FN, clock='MON 21:00', cam=push([900, 600, 1.4], .1), who=[Y(860, 'phone', 'happy')])
sh('L016', 'insert', **FN, ins='call', who='MIRA_HOME', name='Mira', expr='sad', t0=12)
sh('L017', 'face', **FN, **F(expr='smile'))
sh('L018', 'scene', **FN, **FZ, fring=[0, 'L021+0.4'], cam=push([900, 600, 1.5], .14), who=[Y(860, 'phone', 'smile')])
sh('L019', 'insert', **FN, ins='call', who='MIRA_HOME', name='Mira', expr='confused', t0=40)
sh('L020', 'face', **FN, **F(expr='smile', push=.16), freeze=True)
sh('L021', 'insert', **FN, ins='call', who='MIRA_HOME', name='Mira', expr='smirk', t0=48)
sh('L022', 'kt', {'type': 'iris', 'fill': CORAL}, cap=False, bg=CORAL, items=[dict(k='slam', t='A KIND LIE', at='L022:1', y=.3, sz=190, c='#fff'), dict(k='rise', t='FREEZES THE LIAR', at='L022:3', y=.46, sz=100, c=INK),
   dict(k='rise', t="AND THEY DON'T KNOW", at='L022:6', y=.6, sz=80, c='#fff')])
sh('L023', 'face', {'type': 'push'}, **FN, **F(expr='awe', push=.14))
# ACT 3: Mum
sh('L025', 'scene', 'whip', **MH, clock='SUN 15:00', cam=push([960, 600, 1.3], .1), vx=960, who=[Y(0, 'walk', 'neutral', walk=[600, 860, 0, .6]), who('MUM', 1080, 'wave', 'happy', f=-1)])
sh('L027', 'face', **MH, **F(expr='worried', bg=(860, 520, 1.5)))
sh('L028', 'face', **MH, **F('MUM', -1, (1080, 520, 1.5), expr='smile'))
sh('L029', 'scene', **MH, **FZ, hero='YOU', fring=[0, 'L031+0.3'], cam=push([960, 600, 1.45], .12), vx=960, who=[Y(860, 'stand', 'sad'), who('MUM', 1080, 'stand', 'smile', f=-1)])
sh('L031', 'kt', cap=False, bg=NAVY, items=[dict(k='word', t=w, at=f'L031:{i}', x=.5, y=.25 + i * .12, sz=110, c=YEL if i == 4 else '#fff') for i, w in enumerate(['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'])])
sh('L032', 'face', {'type': 'push'}, **MH, **F('MUM', -1, (1080, 520, 1.5), expr='smile'), freeze=True)
sh('L033', 'face', **MH, **F(expr='tender', bg=(860, 520, 1.5)))
sh('L034', 'face', **MH, **F('MUM', -1, (1080, 520, 1.5), expr='tearsmile'))
sh('L035', 'scene', **MH, cam=push([960, 600, 1.4], .12), vx=960, who=[Y(880, 'holdFront', 'tender'), who('MUM', 1060, 'holdFront', 'tearsmile', f=-1)],
   polaroid=dict(at='L035+0.5', caption='NOBODY FROZE.', ring=[970, 430, 300]))
sh('L036', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='word', t=w, at=f'L036:{i}', x=x, y=y, sz=130 if w in ('KIND LIE', 'TRUTH?') else 100, c=YEL if w in ('KIND LIE', 'TRUTH?') else '#fff') for i, (w, (x, y)) in enumerate(zip(
   ['WOULD', 'YOU', 'RATHER', 'HEAR', 'A', 'KIND LIE', 'OR THE', 'TRUTH?'], [(.3, .22), (.7, .22), (.5, .32), (.35, .42), (.65, .42), (.5, .54), (.5, .66), (.5, .78)]))])
finish('What If Every Lie Froze the World for 5 Seconds?', motif='num', tail=2.6, music=[(0, 'L005+', 'tension', .3), ('L006', 'L014+', 'playful', .42), ('L015', 'L024+', 'mystery', .3), ('L025', None, 'sad', .3)])
