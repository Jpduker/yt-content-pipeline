"""WI18 shot list (v3.2). Every 'bell' = a gold DING slam + ding SFX (cues)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
FD = dict(set='flat', so=dict(bags=True), day=True); ST = dict(set='street', so=dict(variant='am'), day=True); CA = dict(set='cafe', so=dict(variant='am'), day=True); PF = dict(set='platform', so=dict())
F = lambda who='YOU', side=1, bg=(760, 520, 1.5), **k: dict(who=who, side=side, bgCam=list(bg), **k)
DING = lambda at, x=.7, y=.28: dict(t='DING', at=at, c='gold', x=x, y=y, sz=110, rot=-.1)
sh('L001', 'scene', 'fade', **FD, clock='SAT 08:00', cam=push([960, 600, 1.3], .1), vx=960, who=[Y(860, 'wave', 'smile'), who('THEO', 0, 'walk', 'happy', walk=[1040, 1400, .15, .9], f=1)], slam=DING('L001:8'))
sh('L002', 'kt', {'type': 'iris', 'fill': YEL}, cap=False, bg=YEL, items=[dict(k='rise', t='A BELL RINGS', at='L002:3', y=.26, sz=100, c=INK), dict(k='slam', t='THE LAST TIME', at='L002:6', y=.42, sz=150, c=CORAL),
   dict(k='rise', t="YOU'LL SEE SOMEONE", at='L002:9', y=.56, sz=84, c=INK), dict(k='rise', t='NOBODY KNOWS WHAT COMES AFTER', at='L003:3', y=.7, sz=60, c=INK)])
sh('L003+0.8', 'title', 'flash', cap=False, lines=['WHAT IF A BELL RANG THE LAST', "TIME YOU'D SEE SOMEONE?"], set='flat', so=dict(), bgCam=[900, 520, .7])
sh('L005', 'scene', 'whip', **ST, cam=push([960, 600, 1.3], .1), vx=960, who=[Y(840, 'stand', 'neutral'), who('GRANDPA', 1080, 'stand', 'smile', f=-1)], pops=[DING('L005:7')])
sh('L006', 'scene', 'whip', **CA, cam=push([1000, 580, 1.4], .1), who=[Y(860, 'holdFront', 'neutral'), who('BARISTA', 1160, 'wave', 'happy', f=-1)], pops=[DING('L006:3')])
sh('L007', 'face', **CA, **F(expr='flat', bg=(860, 520, 1.5)))
sh('L008', 'face', 'whip', **FD, **F(expr='shocked', push=.16))
sh('L009', 'scene', **FD, cam=push([1100, 600, 1.4], .12), who=[Y(0, 'walk', 'scared', walk=[900, 1250, 0, .5])])
sh('L010', 'insert', **FD, ins='callscreen', name='Theo', clk=[[0, '08:04'], [1.2, '08:05']], noHand=False)
sh('L011', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='rise', t='LAST THING YOU SAID:', at='L011:0', y=.3, sz=80, c=INK), dict(k='rise', t='"SHUT THE DOOR', at='L011:9', y=.44, sz=88, c=INK), dict(k='marker', t='PROPERLY"', at='L011:11', mark='L011:11', y=.55, sz=120, c=INK, mc=CORAL)])
sh('L012', 'scene', 'whip', **ST, cam=[[800, 600, 1.25], [1120, 600, 1.3]], vx=960, who=[Y(0, 'walk', 'scared', walk=[760, 1160, 0, 1])])
sh('L013', 'scene', 'whip', **PF, clock='08:21', cam=push([960, 600, 1.3], .14), vx=960, who=[Y(960, 'stand', 'sad')])
sh('L014', 'scene', **PF, clock='08:23', cam=push([960, 600, 1.3], .1), vx=960, who=[Y(880, 'stand', 'surprised'), who('THEO', 1080, 'holdFront', 'confused', f=-1)])
sh('L016', 'face', **PF, **F(expr='scared', bg=(880, 520, 1.5)))
sh('L017', 'face', **PF, **F('THEO', -1, (1080, 520, 1.5), expr='laugh'), pops=[dict(t='2 STREETS AWAY', at='L018:1', c='lime', x=.3, y=.24, sz=100)])
sh('L019', 'scene', **PF, clock='08:26', cam=push([960, 600, 1.4], .12), vx=960, who=[Y(880, 'holdFront', 'tearsmile'), who('THEO', 1060, 'holdFront', 'happy', f=-1)],
   polaroid=dict(at='L020:5', caption='AN ENDING. NOT GOODBYE.', ring=[970, 430, 300]))
sh('L021', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='word', t=w, at=f'L021:{i}', x=x, y=y, sz=130 if w == 'THE BELL?' else 100, c=YEL if w == 'THE BELL?' else '#fff') for i, (w, (x, y)) in enumerate(zip(
   ['WHO', 'WOULD', 'YOU', 'HUG', 'IF', 'YOU', 'HEARD', 'THE BELL?'], [(.3, .26), (.7, .26), (.3, .38), (.7, .38), (.35, .5), (.65, .5), (.5, .62), (.5, .74)]))])
finish("What If a Bell Rang the Last Time You'd See Someone?", motif='num', tail=2.6, music=[(0, 'L003+', 'mystery', .3), ('L004', 'L007+', 'sad', .26), ('L008', 'L013+', 'tension', .32), ('L014', None, 'hopeful', .4)],
       cues=[('L001:8', 'ding', -8), ('L005:7', 'ding', -10), ('L006:3', 'ding', -10)])
