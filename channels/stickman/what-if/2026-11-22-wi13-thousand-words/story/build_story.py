"""WI13 shot list (style growkaz-ifverse v3.2) — SAMPLE: cold open + start of Act 1, with the v3.2 overlays (pops, slam, polaroid)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
def W(v, **k): return dict(k='words', v=v, at=0, **k)
HN = dict(set='hall', so=dict(night=True)); KI = dict(set='kitchen', so=dict(drawing=False), day=True); ST = dict(set='street', so=dict(variant='am'), day=True)
BN = dict(set='bedroom', so=dict(night=True)); FN = dict(set='flat', so=dict(night=True, bags=True))
FACE = lambda **k: {'side': 1, 'bgCam': [760, 520, 1.5], **k}
P = lambda t, at, c='lime', **k: dict(t=t, at=at, c=c, **k)

# HOOK: the cliffhanger first
sh('L001', 'scene', 'fade', **FN, clock='TUE 21:40', cam=push([820, 600, 1.15], .16),
   who=[who('THEO', 620, 'sitHands', 'teary', s=1.45), Y(1000, 'stand', 'worried', f=-1, badge=W(14))])
sh('L002', 'face', **FN, who='YOU', expr=[[0, 'worried'], ['L002:3', 'scared']], badge=W(14), **FACE(push=.14),
   pops=[P('14 WORDS LEFT', 'L002:3', 'red', x=.78, y=.22, sz=92)])
# the rule, in daylight, with whip-pans between places
sh('L003', 'scene', 'whip', **ST, cam=push([960, 560, .9], .1),
   who=[who('X4', 560, 'talk', 'happy', badge=W(812)), Y(900, 'stand', 'neutral', badge=W(1000)), who('X2', 1260, 'phone', 'neutral', f=-1, seed=2, badge=W(437))],
   pops=[P('1,000 WORDS', 'L003:6', 'lime', x=.5, y=.2, sz=118), P('SPOKEN', 'L003:10', 'cream', x=.24, y=.36, sz=78), P('OR TYPED', 'L003:12', 'cream', x=.77, y=.36, sz=78)])
sh('L004', 'face', 'whip', **ST, who='X4', expr=[[0, 'angry'], ['L004:4', 'sad']], side=-1, badge=W(0), bgCam=[1000, 520, 1.5],
   slam=dict(t='SILENT', at='L004:5', x=.27, y=.4), pops=[P('UNTIL MIDNIGHT', 'L004:7', 'cream', x=.27, y=.66, sz=70)])
sh('L005', 'scene', 'flash', **KI, clock='TUE 07:30', cam=push([960, 600, 1.0], .12),
   who=[Y(880, 'stand', 'sleepy', badge=W(1000))], pops=[P('1,000', 'L005:5', 'gold', x=.7, y=.28, sz=130)])
sh('L006', 'face', **KI, who='YOU', expr=[[0, 'happy'], ['L007', 'surprised']], badge=W([[0, 1000], ['L006+0.05', 999]]), **FACE(bgCam=[880, 520, 1.5]),
   pops=[P('999', 'L007:3', 'gold', x=.74, y=.32, sz=140)])
# the waste: an online war
sh('L008', 'insert', 'whip', **ST, ins='comments', count=[999, 399], ctitle='Pizza Wars', csub='2,318 comments', me='@you',
   names=['@you', '@crust_king', '@you', '@pine_lover', '@you', '@m4rg'],
   said=['PINEAPPLE IS FRUIT. FRUIT IS FOOD.', 'not on pizza it isnt', 'Hawaii called. It agrees with me.', 'Hawaii is not a person', 'Ham + pineapple = balance.', 'ok fine you win'],
   pops=[P('-600 WORDS', 'L009:2', 'red', x=.22, y=.3, sz=96)], slam=dict(t='YOU WIN', at='L009:5', c='gold', x=.76, y=.62, sz=96))
sh('L010', 'face', **ST, clock='TUE 13:00', who='YOU', expr=[[0, 'neutral'], ['L010:4', 'worried']], badge=W([[0, 399], [.3, 41]]), **FACE(bgCam=[900, 520, 1.5]),
   pops=[P('41', 'L010:4', 'cream', x=.74, y=.32, sz=150)])
sh('L011', 'scene', 'dip', **BN, clock='TUE 19:00', cam=push([900, 600, 1.2], .14),
   who=[Y(820, 'sitHands', 'sad', badge=W(14))], pops=[P('14', 'L011:2', 'red', x=.7, y=.3, sz=160)])
# the cliffhanger returns
sh('L012', 'scene', **BN, cam=push([960, 600, 1.1], .12),
   who=[Y(820, 'sitHands', [[0, 'sad'], ['L012:3', 'surprised']], badge=W(14)), who('THEO', 0, 'walk', 'teary', f=-1, s=1.45, walk=[1500, 1180, 0, .6], badge=W(986))])
sh('L013', 'face', **BN, who='THEO', expr='teary', side=-1, badge=W([[0, 986], ['L013:2', 984], ['L013:4', 982], ['L013:6', 979]]), bgCam=[1100, 520, 1.5])
sh('L013+0.3', 'face', **BN, who='YOU', expr=[[0, 'worried'], [.4, 'tender']], badge=W(14), **FACE(push=.12),
   polaroid=dict(at='L013+0.9', caption='14 WORDS. ONE BROTHER.', ring=[900, 450, 300]))
finish('What If You Only Had 1,000 Words a Day?', motif='num', tail=4.2,
       music=[(0, 'L002+', 'tension', .3), ('L003', 'L009+', 'playful', .42), ('L010', None, 'sad', .3)])
