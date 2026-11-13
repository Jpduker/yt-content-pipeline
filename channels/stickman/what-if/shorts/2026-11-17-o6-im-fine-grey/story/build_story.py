"""O6 shot list (9:16 original, style growkaz-ifverse v3.1). Usage: python3 story/build_story.py <episode>"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
OF = dict(set='office')
G = 1
def I(x, pose='stand', expr='neutral', f=1, grey=0, **k): return who('INTERN', x, pose, expr, f, grey=grey, **k)
CROWD = lambda look=1: [who('X1', 560, 'sit', 'flat', f=look, seed=3, grey=G), who('BOSS', 1080, 'crossArms', 'flat', f=-1, grey=G), who('COLL', 1240, 'sit', 'flat', f=-1, grey=G), who('X4', 700, 'stand', 'flat', f=look, seed=4, grey=G)]
# ---------------- HOOK (B: the strange thing first) ----------------
sh('L001', 'scene', **OF, cam=[[900, 560, 1.1], [900, 560, 1.22]], vx=960, hookText='EVERYONE GREY. EXCEPT HIM.', hookT=[0, 'L001:6'], chairs=[[560, 1], [1240, -1]],
   who=CROWD() + [I(900, 'stand', 'happy')])
sh('L002', 'face', **OF, who='INTERN', expr=[[0, 'happy'], ['L002:5', 'smile']], side=1, bgCam=[900, 520, 1.5])
# ---------------- ACT 1 ----------------
sh('L003', 'scene', **OF, cam=two([980, 590, 1.4]), stamp='MONDAY', who=[I(880, 'stand', 'smile'), who('BOSS', 1080, 'explain', 'flat', f=-1, grey=G)])
sh('L004', 'face', **OF, who='INTERN', expr=[[0, 'smile'], ['L004:1', 'nervous']], side=1, bgCam=[880, 520, 1.5])
sh('L005', 'scene', **OF, cam=[[900, 560, 1.05], [900, 560, 1.15]], chairs=[[560, 1], [1240, -1]], who=[who('X1', 560, 'sit', 'shocked', f=1, seed=3, grey=G), who('BOSS', 1080, 'crossArms', 'shocked', f=-1, grey=G), who('COLL', 1240, 'sit', 'surprised', f=-1, grey=G), who('X4', 700, 'stand', 'shocked', f=1, seed=4, grey=G), I(900, 'stand', 'nervous')])
sh('L006', 'face', **OF, who='COLL', expr=[[0, 'flat'], ['L006:4', 'tender']], side=-1, grey=G, bgCam=[1240, 520, 1.5])
# ---------------- ACT 2 ----------------
sh('L007-0.6', 'scene', 'dip', **OF, cam=two([980, 590, 1.4]), stamp='WEDNESDAY', floaters=[dict(k='paper', x=760, y=-180, rest=-180), dict(k='paper', x=800, y=-60, rest=-60)],
   who=[I(880, 'handsOnHead', 'scared'), who('BOSS', 1080, 'explain', 'flat', f=-1, grey=G)])
sh('L008', 'face', **OF, who='INTERN', expr=[[0, 'nervous'], ['L008', 'smile']], side=1, grey=[[0, 0], ['L008+0.15', .35]], bgCam=[880, 520, 1.5], sfx=[(.9, 'shimmer', -14)])
sh('L009', 'scene', **OF, cam=push([900, 600, 1.5], .1), who=[I(900, 'stand', 'smile', grey=.35)])
sh('L010', 'scene', **OF, cam=[[900, 560, 1.15], [900, 560, 1.3]], stamp='THU · FRI', who=[I(900, [[0, 'stand'], [.33, 'explain'], [.66, 'stand']], 'smile', grey=[[0, .45], ['L010:1', .6], ['L010:3', .78], ['L010+0.1', .9]]), who('BOSS', 1100, 'stand', 'flat', f=-1, grey=G)])
# ---------------- ACT 3 ----------------
sh('L011', 'scene', 'dip', **OF, cam=[[900, 560, 1.1], [900, 560, 1.2]], stamp='NEXT MONDAY', chairs=[[560, 1], [1240, -1]], who=CROWD() + [I(900, 'stand', 'smile', grey=G)])
sh('L012-0.3', 'scene', set='lift', so=dict(), cam=[[960, 560, 1.2], [960, 560, 1.3]], ask=dict(text='How grey would YOU be by Friday?', at='L012+0.1'),
   who=[who('NEW', 0, 'wave', 'happy', walk=[760, 920, 0, .5]), I(1180, 'stand', 'smile', f=-1, grey=G)])
finish('In This World, Saying "I\'m Fine" Turns You Grey', motif='num', tail=1.9,
       music=[(0, 'L002+', 'mystery', .36), ('L003', 'L006+', 'playful', .38), ('L007-0.6', 'L010+', 'tension', .28), ('L011', None, 'mystery', .34)],
       cues=[('L005', 'hit', -14), ('L012', 'stinger', -15)])
