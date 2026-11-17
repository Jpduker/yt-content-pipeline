"""WI15 shot list (v3.2). Hero in the living room (flat), Theo in his room (bedroom) — intercut; contacts/callscreen inserts as in P3."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
FN = dict(set='flat', so=dict(night=True, bags=True)); BN = dict(set='bedroom', so=dict(night=True))
F = lambda who='YOU', side=1, bg=(760, 520, 1.5), **k: dict(who=who, side=side, bgCam=list(bg), **k)
ROWS = [['THEO', '30 days'], ['MIRA', '6 days'], ['MUM', '3 days'], ['BOSS', '1 day'], ['KOFI', 'today']]
sh('L001', 'insert', 'fade', **FN, ins='contacts', rows=ROWS, clk=[[0, '23:59:58']], noHand=True, low=True)
sh('L002', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='rise', t='EVERY MIDNIGHT', at='L002:3', y=.26, sz=90, c='#fff'), dict(k='slam', t='DELETED', at='L002:6', y=.42, sz=210, c=CORAL),
   dict(k='rise', t='WHOEVER YOU CALLED LEAST', at='L002:9', y=.58, sz=72, c='#fff'), dict(k='rise', t='FOREVER', at='L003:0', y=.7, sz=90, c=YEL)])
sh('L004', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='pop', t='TEXTS', at='L004:0', x=.3, y=.32, sz=100, disc='#fff', c=INK), dict(k='slam', t='X', at='L004:1', x=.3, y=.32, sz=170, c=CORAL),
   dict(k='marker', t='A CALL', at='L004:5', mark='L004:6', x=.68, y=.32, sz=120, c=INK, mc=YEL), dict(k='rise', t='ANSWERED BEFORE 00:00', at='L004:7', y=.6, sz=72, c=INK)])
sh('L004+0.6', 'title', 'flash', cap=False, lines=['WHAT IF YOUR PHONE DELETED', 'WHOEVER YOU IGNORED LONGEST?'], set='flat', so=dict(night=True), bgCam=[900, 520, .7])
sh('L005', 'insert', 'whip', **FN, ins='contacts', rows=[['COACH RAY', '62 days'], ['SAM', '48 days'], ['THEO', '2 days']], delAt=1.6, clk=[[0, '23:59:59'], [1.6, '00:00:00']], noHand=True, low=True)
sh('L006', 'face', **FN, **F(expr='flat'))
sh('L007', 'insert', **FN, ins='contacts', rows=ROWS, clk=[[0, '23:40']], noHand=True, low=True)
sh('L008', 'scene', 'push', **FN, clock='23:41', cam=push([900, 600, 1.35], .1), who=[Y(860, 'phone', 'confused')])
sh('L009', 'scene', 'whip', **BN, cam=push([860, 600, 1.75], .1), who=[who('THEO', 860, 'sitHands', 'happy', s=1.3)], pops=[dict(t='8 STEPS AWAY', at='L009:4', c='gold', x=.5, y=.24, sz=100)])
sh('L010', 'scene', 'whip', **FN, clock='23:52', cam=push([900, 600, 1.35], .1), who=[Y(860, 'phone', 'neutral')], pops=[dict(t="DOESN'T COUNT", at='L010:5', c='red', x=.5, y=.24, sz=90)])
sh('L011', 'scene', **BN, cam=push([860, 600, 1.75], .1), who=[who('THEO', 860, 'sitHands', 'happy', s=1.3)])
sh('L012', 'face', 'whip', **FN, **F(expr='worried', push=.14), clock='23:58')
sh('L014', 'insert', **FN, ins='callscreen', name='Theo', clk=[[0, '23:58:41'], [1.0, '23:58:42']], noHand=False)
sh('L015', 'scene', 'whip', **BN, cam=push([860, 600, 1.75], .1), who=[who('THEO', 860, 'sitHands', 'happy', s=1.3)], pops=[dict(t='SILENT', at='L015:6', c='red', x=.5, y=.24, sz=110)])
sh('L016', 'scene', 'whip', **FN, cam=push([700, 600, 1.4], .12), who=[Y(700, 'reach', 'scared')], slam=dict(t='BANG', at='L016:2', x=.6, y=.3, c='red', sz=110))
sh('L017', 'face', **BN, **F('THEO', -1, (860, 520, 1.5), expr='angry'))
sh('L018', 'face', **FN, **F(expr='shocked'))
sh('L019', 'face', **BN, **F('THEO', -1, (860, 520, 1.5), expr='confused'))
sh('L020', 'face', **FN, **F(expr='determined'))
sh('L021', 'insert', **FN, ins='callscreen', name='Theo', clk=[[0, '23:59:50'], [.5, '23:59:51']], noHand=False)
sh('L022', 'face', **BN, **F('THEO', -1, (860, 520, 1.5), expr='flat'))
sh('L023', 'face', **FN, **F(expr='smile'))
sh('L024', 'face', **BN, **F('THEO', -1, (860, 520, 1.5), expr='laugh'))
sh('L025', 'insert', **FN, ins='contacts', rows=[['BOSS', '1 day'], ['KOFI', 'today'], ['THEO', 'just now']], clk=[[0, '00:00']], noHand=True, low=True)
sh('L026', 'scene', 'dip', **FN, clock='00:58', cam=push([900, 600, 1.35], .12), who=[Y(860, 'phone', 'laugh')],
   polaroid=dict(at='L026+0.4', caption='EIGHT STEPS. ONE CALL.', ring=[900, 430, 300]))
sh('L027', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='word', t=w, at=f'L027:{i}', x=x, y=y, sz=130 if w == 'CALLED' else 100, c=YEL if w == 'CALLED' else '#fff') for i, (w, (x, y)) in enumerate(zip(
   ['WHO', "HAVEN'T", 'YOU', 'CALLED', 'IN A', 'WHILE?'], [(.3, .3), (.7, .3), (.5, .42), (.5, .54), (.4, .66), (.62, .66)]))])
finish('What If Your Phone Deleted Whoever You Ignored Longest?', motif='num', tail=2.6, music=[(0, 'L004+', 'tension', .3), ('L005', 'L015+', 'mystery', .32), ('L016', 'L024+', 'playful', .42), ('L025', None, 'hopeful', .4)])
