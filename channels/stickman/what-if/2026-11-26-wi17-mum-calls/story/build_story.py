"""WI17 shot list (v3.2). Age = 'num' badge on the hero (only carrier of the age in each frame); posture slumps as he ages."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
FD = dict(set='flat', so=dict(bags=True), day=True); FN = dict(set='flat', so=dict(night=True, bags=True)); OF = dict(set='office'); GD = dict(set='garden', so=dict(), day=True)
CA = dict(set='cafe', so=dict(variant='pm')); TR = dict(set='train', so=dict())
F = lambda who='YOU', side=1, bg=(760, 520, 1.5), **k: dict(who=who, side=side, bgCam=list(bg), **k)
A = lambda v: dict(k='num', v=v, hot=99, at=0)
sh('L001', 'scene', 'fade', **FD, clock='FRIDAY', cam=push([900, 600, 1.4], .12), who=[Y(880, [[0, 'sad'], [.5, 'stand']], 'wince', badge=A([[0, 23], [.5, 28]]))])
sh('L002', 'insert', **FD, ins='contacts', rows=[['MUM', '5 missed'], ['MIRA', 'today'], ['THEO', 'today']], clk=[[0, '18:02']], noHand=True, low=True)
sh('L003', 'kt', {'type': 'iris', 'fill': CORAL}, cap=False, bg=CORAL, items=[dict(k='rise', t="EVERY IGNORED CALL", at='L003:3', y=.28, sz=90, c='#fff'), dict(k='rise', t='FROM MUM', at='L003:5', y=.38, sz=90, c=INK),
   dict(k='slam', t='+1 YEAR', at='L003:11', y=.54, sz=200, c='#fff')])
sh('L003+0.6', 'title', 'flash', cap=False, lines=['WHAT IF YOU AGED 1 YEAR EVERY', "TIME YOU IGNORED MUM'S CALL?"], set='flat', so=dict(), bgCam=[900, 520, .7])
sh('L004', 'scene', 'whip', **OF, clock='TUE 10:00', cam=push([1060, 580, 1.4], .1), who=[Y(900, 'phone', 'flat', badge=A([[0, 23], ['L004:9', 24]])), who('BOSS', 1200, 'explain', 'neutral', f=-1)])
sh('L005', 'scene', 'whip', **GD, clock='WED 18:00', cam=push([960, 600, 1.35], .1), who=[Y(880, 'kick', 'joy', badge=A([[0, 24], ['L005:4', 25]]))])
sh('L006', 'scene', 'whip', **CA, clock="MUM'S BIRTHDAY", cam=push([1000, 580, 1.4], .1), who=[Y(900, 'phone', 'neutral', badge=A([[0, 25], ['L006:5', 26], ['L006:6', 27], ['L006:7', 28]]))])
sh('L007', 'scene', 'push', **FD, cam=push([900, 600, 1.45], .1), who=[Y(880, [[0, 'sit'], [.5, 'stand']], 'wince', badge=A(28))], chairs=[[880, 1]], pops=[dict(t='CLICK', at='L007:2', c='cream', x=.68, y=.3, sz=100)])
sh('L008', 'scene', 'whip', **CA, cam=push([1000, 580, 1.35], .1), who=[Y(860, 'sad', 'tired', badge=A(28)), who('MIRA', 1140, 'explain', 'worried', f=-1)])
# ACT 2
sh('L009', 'scene', 'dip', **FN, clock='ONE WEEK LATER', cam=push([900, 600, 1.4], .1), who=[Y(880, 'phone', 'confused', badge=A(28))])
sh('L010', 'insert', **FN, ins='contacts', rows=[['MUM', '7 days'], ['MIRA', 'today'], ['THEO', 'today']], clk=[[0, '21:30']], noHand=True, low=True)
sh('L011', 'face', **FN, **F(expr='flat', badge=A(28)))
sh('L012', 'face', **FN, **F(expr='worried', push=.14, badge=A(28)))
sh('L013', 'insert', **FN, ins='callscreen', name='Mum', clk=[[0, '21:31'], [1.5, '21:32']], noHand=False)
sh('L014', 'kt', cap=False, bg=NAVY, items=[dict(k='slam', t='VOICEMAIL', at='L014:0', y=.45, sz=170, c=CORAL)])
# ACT 3
sh('L015', 'scene', 'whip', **TR, clock='06:10', cam=push([960, 600, 1.35], .1), who=[Y(900, 'stand', 'worried', badge=A(28))])
sh('L016', 'scene', 'whip', **GD, clock='SAT 09:00', cam=push([960, 600, 1.3], .1), vx=960, who=[Y(0, 'walk', 'worried', walk=[600, 830, 0, .5], badge=A(28)), who('MUM', 1080, 'holdFront', 'happy', f=-1)])
sh('L017', 'face', **GD, **F('MUM', -1, (1080, 520, 1.5), expr='surprised'))
sh('L018', 'face', **GD, **F(expr='tearsmile', bg=(830, 520, 1.5), badge=A(28)))
sh('L019', 'scene', **GD, cam=push([960, 600, 1.4], .12), vx=960, who=[Y(860, 'holdFront', 'tender', badge=A(28)), who('MUM', 1060, 'holdFront', 'tearsmile', f=-1)],
   polaroid=dict(at='L020:8', caption='FIRST RING. EVERY TIME.', ring=[960, 430, 300]))
sh('L021', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='word', t=w, at=f'L021:{i}', x=x, y=y, sz=130 if w == 'FIRST RING?' else 100, c=YEL if w == 'FIRST RING?' else '#fff') for i, (w, (x, y)) in enumerate(zip(
   ['WHEN', 'DID', 'YOU', 'LAST', 'ANSWER', 'ON THE', '', 'FIRST RING?'], [(.32, .28), (.68, .28), (.32, .4), (.68, .4), (.5, .52), (.5, .62), (.5, .62), (.5, .74)])) if w])
finish("What If You Aged 1 Year Every Time You Ignored Mum's Call?", motif='num', tail=2.6, music=[(0, 'L003+', 'tension', .3), ('L004', 'L008+', 'playful', .38), ('L009', 'L014+', 'sad', .3), ('L015', None, 'hopeful', .4)])
