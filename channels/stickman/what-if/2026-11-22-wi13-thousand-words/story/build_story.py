"""WI13 shot list (style growkaz-ifverse v3.2): full long-form. One carrier per fact per frame (badge OR big text, never both)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
def W(v): return dict(k='words', v=v, at=0)
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
FN = dict(set='flat', so=dict(night=True, bags=True)); KI = dict(set='kitchen', so=dict(drawing=False), day=True); ST = dict(set='street', so=dict(variant='am'), day=True)
OF = dict(set='office'); CA = dict(set='cafe', so=dict(variant='am'), day=True); BN = dict(set='bedroom', so=dict(night=True))
F = lambda who='YOU', side=1, bg=(760, 520, 1.5), **k: dict(who=who, side=side, bgCam=list(bg), **k)
P = lambda t, at, c='lime', **k: dict(t=t, at=at, c=c, **k)
TH = [[0, 993], ['L021+0.05', 984], ['L022+0.05', 971], ['L023+0.05', 962], ['L024+0.05', 956]]
# ---- HOOK
sh('L001', 'scene', 'fade', **FN, clock='TUE 21:40', cam=push([800, 600, 1.3], .14), vx=955, who=[who('THEO', 690, 'sitHands', 'teary', s=1.45), Y(890, 'stand', 'worried', f=-1, badge=W(14))])
sh('L002', 'face', **FN, **F(expr=[[0, 'worried'], ['L002:3', 'scared']], badge=W(14), push=.14))
sh('L003', 'kt', {'type': 'iris', 'fill': YEL}, cap=False, bg=YEL, items=[dict(k='slam', t='1,000', at='L003:6', y=.3, sz=300, c=INK), dict(k='rise', t='WORDS A DAY', at='L003:7', y=.47, sz=110, c=INK),
   dict(k='pop', t='SPOKEN', at='L003:10', x=.3, y=.66, sz=80, disc='#fff', c=INK), dict(k='pop', t='TYPED', at='L003:12', x=.7, y=.66, sz=80, disc='#fff', c=INK)])
sh('L004', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='rise', t='USE THEM UP', at='L004:0', y=.26, sz=96, c=INK), dict(k='marker', t='SILENT', at='L004:4', mark='L004:5', y=.45, sz=210, c=INK, mc=YEL),
   dict(k='rise', t='UNTIL MIDNIGHT', at='L004:6', y=.64, sz=84, c=INK)])
sh('L005', 'title', 'flash', cap=False, lines=['WHAT IF YOU ONLY HAD', '1,000 WORDS A DAY?'], set='kitchen', so=dict(drawing=False), bgCam=[900, 520, .7])
# ---- ACT 1: the waste
sh('L006', 'scene', 'whip', **KI, clock='TUE 07:30', cam=push([900, 580, 1.4], .1), who=[Y(880, 'wave', 'happy', badge=W([[0, 1000], ['L006+0.05', 999]]))])
sh('L007', 'face', **KI, **F(expr='happy', bg=(880, 520, 1.5), badge=W(999)))
sh('L008', 'insert', 'whip', **ST, ins='comments', count=[999, 399], ctitle='Pizza Wars', csub='2,318 comments', me='@you', names=['@you', '@crust_king', '@you', '@pine_lover', '@you', '@m4rg'],
   said=['PINEAPPLE IS FRUIT. FRUIT IS FOOD.', 'not on pizza it isnt', 'Hawaii agrees with me.', 'Hawaii is not a person', 'Ham + pineapple = balance.', 'ok fine you win'], slam=dict(t='YOU WIN', at='L009:5', c='gold', x=.76, y=.62, sz=96))
sh('L010', 'scene', 'whip', **OF, clock='TUE 10:00', cam=push([1060, 580, 1.4], .1), who=[Y(900, 'explain', 'nervous', badge=W([[0, 399], [.9, 251]])), who('BOSS', 1220, 'crossArms', 'flat', f=-1)])
sh('L011', 'face', **OF, **F('BOSS', -1, (1200, 520, 1.5), expr='flat'))
sh('L012', 'scene', **OF, cam=push([1060, 580, 1.5], .12), who=[Y(900, [[0, 'explain'], [.5, 'shrug']], [[0, 'talk'], [.5, 'nervous']], badge=W([[0, 251], [.8, 140]])), who('BOSS', 1220, 'crossArms', 'flat', f=-1)])
sh('L013', 'scene', 'whip', **CA, clock='TUE 12:30', cam=push([1000, 580, 1.4], .1), who=[Y(860, 'explain', 'happy', badge=W([[0, 140], [.95, 47]])), who('BARISTA', 1160, 'stand', 'neutral', f=-1)])
sh('L015', 'face', **CA, **F('BARISTA', -1, (1160, 520, 1.5), expr='flat'))
sh('L016', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[dict(k='rise', t='BY LUNCH', at='L016:0', y=.3, sz=90, c='#fff'), dict(k='slam', t='41', at='L016:4', y=.5, sz=260, c=YEL, out='L017-0.1')])
sh('L017', 'kt', cap=False, bg=CORAL, items=[dict(k='rise', t='BY DINNER', at='L017:0', y=.3, sz=90, c='#fff'), dict(k='slam', t='14', at='L017:2', y=.5, sz=320, c='#fff')])
sh('L018', 'scene', 'whip', **BN, clock='TUE 21:30', cam=push([960, 600, 1.2], .1), vx=930, who=[Y(760, 'sitHands', [[0, 'sad'], ['L018:3', 'surprised']], badge=W(14)), who('THEO', 0, 'walk', 'teary', f=-1, walk=[1500, 1080, 0, .6])])
sh('L019', 'face', **BN, **F('THEO', -1, (1150, 520, 1.5), expr='teary', badge=W(1000)))
# ---- ACT 2: Theo talks
sh('L020', 'scene', **BN, cam=push([860, 600, 1.35], .1), who=[Y(760, 'sitHands', 'neutral', badge=W(14)), who('THEO', 960, 'sitHands', 'sad', f=-1, badge=W(993))])
sh('L021', 'face', **BN, **F('THEO', -1, (1100, 520, 1.5), expr=[[0, 'sad'], ['L022', 'hurt']], badge=W(TH)))
sh('L023', 'face', **BN, **F('THEO', -1, (1100, 520, 1.5), expr=[[0, 'hurt'], ['L024', 'sad']], badge=W(TH), push=.12))
sh('L025', 'face', **BN, **F(expr='guilty', badge=W(14), push=.12))
sh('L027', 'kt', {'type': 'bands'}, cap=False, bg=CREAM, items=[dict(k='rise', t='EVERY SENTENCE', at='L027:0', y=.3, sz=96, c=INK), dict(k='marker', t='> 14 WORDS', at='L027:6', mark='L027:9', y=.48, sz=170, c=INK, mc=CORAL),
   dict(k='word', t="SO YOU DON'T.", at='L028:0', y=.68, sz=110, c=INK)])
sh('L029', 'scene', {'type': 'push'}, **BN, cam=push([860, 600, 1.45], .1), who=[Y(760, 'sitHands', 'tender', badge=W(14)), who('THEO', 960, 'sitHands', 'sad', f=-1, badge=W(956))], pops=[P('FREE', 'L029:2', 'lime', x=.3, y=.3, sz=110)])
sh('L030', 'face', **BN, **F('THEO', -1, (1100, 520, 1.5), expr='hurt', badge=W([[0, 956], ['L030+0.05', 951]])))
sh('L031', 'face', **BN, **F(expr='determined', badge=W(14)))
sh('L032', 'scene', **BN, cam=push([860, 600, 1.6], .12), who=[Y(760, 'phone', [[0, 'neutral'], ['L032:4', 'surprised']], badge=W(14)), who('THEO', 960, 'sitHands', 'sad', f=-1, badge=W(951))])
sh('L033', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[dict(k='rise', t='MUM', at='L033:0', y=.24, sz=80, c='#9fb6ff'), dict(k='typed', t="Is Theo okay? He's so quiet", at='L033:0', y=.38, sz=58, cps=22)])
sh('L034', 'kt', cap=False, bg=CORAL, items=[dict(k='slam', t='TYPING COUNTS', at='L034:0', y=.4, sz=120, c='#fff'), dict(k='rise', t='14 LEFT', at='L034:7', y=.56, sz=90, c=INK)])
sh('L035', 'face', {'type': 'push'}, **BN, **F(expr='worried', badge=W(14), push=.16))
# ---- ACT 3: six words
sh('L036', 'scene', **BN, cam=push([860, 600, 1.45], .12), who=[Y(820, 'phone', 'determined', badge=W(14)), who('THEO', 960, 'sitHands', 'sad', f=-1, badge=W(951))])
sh('L038', 'face', **BN, **F(expr='tender', badge=W([[0, 14], ['L038+0.05', 8]]), push=.1))
sh('L040', 'face', **BN, **F('THEO', -1, (1100, 520, 1.5), expr='surprised', badge=W([[0, 951], ['L040+0.05', 949]])))
sh('L041', 'face', **BN, **F(expr='smile', badge=W([[0, 8], ['L041+0.05', 6]])))
sh('L043', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='rise', t='PICTURES ARE FREE', at='L043:4', y=.24, sz=80, c=INK), dict(k='pop', t='TINY FOOTBALL', at='L044:1', x=.3, y=.45, sz=64, disc='#fff', c=INK),
   dict(k='pop', t='TINY THEO', at='L044:4', x=.7, y=.45, sz=64, disc='#fff', c=INK), dict(k='slam', t='GIANT TROPHY', at='L044:7', y=.66, sz=130, c=CORAL)])
sh('L045', 'scene', **BN, cam=push([860, 600, 1.45], .1), who=[Y(760, 'sitHands', 'smile', badge=W(6)), who('THEO', 960, 'sitHands', [[0, 'flat'], ['L046', 'happy']], f=-1, badge=W([[0, 949], ['L045+0.05', 943]]))])
sh('L047', 'scene', 'dip', **BN, cam=push([860, 600, 1.2], .12), clock='TUE 23:59', who=[Y(760, 'sitHands', 'tender', badge=W([[0, 6], ['L048:4', 1000]])), who('THEO', 960, 'sitHands', 'happy', f=-1, badge=W([[0, 943], [.4, 0]]))])
sh('L049', 'face', **BN, **F(expr='joy', badge=W([[0, 1000], ['L049+0.05', 995]]), polaroid=dict(at='L049+0.6', caption='14 WORDS. ONE BROTHER.', ring=[900, 450, 300])))
sh('L050', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY,
   items=[dict(k='word', t=w, at=f'L050:{i}', x=x, y=y, sz=150 if w == 'FOURTEEN' else 110, c=YEL if w == 'FOURTEEN' else '#fff') for i, (w, (x, y)) in enumerate(zip(
       ['WHAT', 'WOULD', 'YOU', 'SAY', 'WITH', 'FOURTEEN', 'WORDS?'], [(.3, .26), (.7, .26), (.3, .38), (.7, .38), (.5, .5), (.5, .62), (.5, .74)]))])
finish('What If You Only Had 1,000 Words a Day?', motif='num', tail=3.0,
       music=[(0, 'L004+', 'tension', .3), ('L005', 'L017+', 'playful', .42), ('L018', 'L035+', 'sad', .28), ('L036', None, 'hopeful', .4)])
