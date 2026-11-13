"""P1 shot list (9:16 original, style growkaz-ifverse v3.1). Usage: python3 story/build_story.py <episode>"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
def W(v, **k): return dict(k='words', v=v, **k)
def perword(lid, n, start):      # counter that drops one per spoken word of line lid
    return [[f'{lid}:{i}', start - i - 1] for i in range(n)]
SA = dict(set='street', so=dict(variant='am')); BK = dict(set='stage', so=dict(variant='back')); FR = dict(set='stage', so=dict(variant='front', lectern=0, banner='END OF TERM SPEECHES'))
DEV0 = [[0, 1000], ['L002:0', 999]]
DEV10 = 10; DEV3 = [[0, 10]] + perword('L009', 7, 10); DEV0b = [[0, 3]] + perword('L011', 3, 3)
PIA = [[0, 1000]] + perword('L008', 6, 1000)
# ---------------- HOOK: the rule, already affecting someone ----------------
sh('L001', 'scene', **SA, cam=[[950, 560, 1.25], [950, 560, 1.4]], vx=960, hookText='1,000 WORDS A DAY', hookT=[0, 'L002'],
   who=[who('DEV', 860, 'stand', [[0, 'neutral'], ['L002', 'happy']], badge=W(DEV0, at=0)), who('X4', 1050, [[0, 'point'], [.55, 'handsOnHead']], [[0, 'angry'], [.55, 'sad']], f=-1, seed=4, badge=W(0, at=0))])
sh('L003', 'face', **SA, who='X4', expr=[[0, 'angry'], ['L003:4', 'sad']], side=-1, badge=W(0, at=0), bgCam=[1000, 520, 1.5])
sh('L003:6', 'face', **SA, who='DEV', expr=[[0, 'surprised'], ['L003:9', 'worried']], side=1, badge=W(999, at=0), bgCam=[800, 520, 1.5])
# ---------------- ACT 1: he spends them ----------------
sh('L004', 'insert', **SA, ins='comments', count=[999, 10])
sh('L005', 'face', **SA, who='DEV', expr='joy', side=1, nod=True, badge=W(DEV10, at=0), bgCam=[800, 520, 1.5])
sh('L006', 'face', **SA, who='DEV', expr=[[0, 'happy'], ['L006:2', 'worried']], side=1, look=[[0, [.2, 0]], ['L006:2', [.1, -.8]]], badge=W(DEV10, at=0), push=.14, bgCam=[800, 520, 1.5])
# ---------------- ACT 2: his sister ----------------
sh('L007', 'scene', 'dip', **BK, cam=[[980, 560, 1.15], [960, 560, 1.3]], stamp='7 P.M.',
   who=[who('PIA', 1080, 'holdFront', 'nervous', f=-1, s=1.25, badge=W(1000, at=0)), who('DEV', 0, 'stand', 'smile', walk=[500, 800, 0, .5], badge=W(10, at=.2))])
sh('L008', 'face', **BK, who='PIA', expr=[[0, 'scared'], ['L008:4', 'worried']], side=-1, badge=W(PIA, at=0), bgCam=[1080, 520, 1.6])
sh('L008+0.1', 'face', **BK, who='DEV', expr=[[0, 'worried'], [.55, 'tender']], side=1, look=[[0, [.1, -.8]], [.5, [-.4, 0]]], badge=W(10, at=0), push=.1, bgCam=[800, 520, 1.6])
sh('L009', 'scene', **BK, cam=push([940, 600, 1.5], .12), who=[who('DEV', 820, 'kneel', 'tender', badge=W(DEV3, at=0)), who('PIA', 1060, 'holdFront', [[0, 'worried'], ['L009:5', 'surprised']], f=-1, s=1.25, badge=W(994, at=0))])
# ---------------- ACT 3: her speech, his last words ----------------
pia_run = [[0, 994]] + [[k / 10, 994 - k * 96] for k in range(1, 10)]
sh('L010', 'scene', 'dip', **FR, cam=[[960, 520, 1.5], [960, 500, 1.7]], fg='audience', who=[who('PIA', 960, [[0, 'talk'], [.4, 'explain'], [.8, 'talk']], [[0, 'nervous'], [.3, 'happy']], s=1.25, badge=W(pia_run, at=0))])
sh('L010:6', 'face', **FR, who='PIA', expr='joy', side=-1, badge=W(31, at=0), bgCam=[960, 480, 1.4])
sh('L011-0.2', 'face', **FR, who='DEV', expr=[[0, 'joy']], side=1, look=[0, -.4], badge=W(DEV0b, at=0), push=.1, bgCam=[960, 380, 1.4])
sh('L012', 'scene', **FR, cam=push([960, 560, 1.3], .12), fg='audience', ask=dict(text='What would YOU say with 10 words?', at='L012+0.1'),
   who=[who('PIA', 1130, 'wave', 'joy', f=-1, s=1.25, badge=W(31, at=0)), who('DEV', 800, 'cheer', 'joy', badge=W(0, at=0))])
finish('In This World, You Get 1,000 Words a Day', motif='num', tail=1.5,
       music=[(0, 'L006+', 'playful', .4), ('L007', 'L009+', 'tension', .3), ('L010', None, 'hopeful', .42)],
       cues=[('L002', 'tick', -14), ('L006:2', 'hit', -13), ('L011', 'pop', -12)])
