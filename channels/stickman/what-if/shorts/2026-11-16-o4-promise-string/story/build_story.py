"""O4 shot list (9:16 original, style growkaz-ifverse v3.1). Usage: python3 story/build_story.py <episode>"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
BK = dict(set='stage', so=dict(variant='back')); FR = dict(set='stage', so=dict(variant='front', banner='SPRING RECITAL', spot=0)); OF = dict(set='office', so=dict(warm=True))
def O(x, pose='stand', expr='neutral', f=1, **k): return who('OMAR', x, pose, expr, f, **k)
def Li(x, pose='stand', expr='neutral', f=-1, **k): return who('LILA', x, pose, expr, f, s=1.1, seed=2, **k)
ST = lambda **k: dict(a='OMAR', b='LILA', **k)
# ---------------- HOOK (A: the rule, already on screen) ----------------
sh('L001', 'scene', **BK, cam=[[930, 560, 1.15], [930, 560, 1.28]], vx=960, hookText='EVERY PROMISE IS A STRING', hookT=[0, 'L002:4'],
   who=[who('X4', 740, 'stand', f=1, seed=4), O(900, 'stand', 'smile'), Li(1050, 'stand', 'happy'), who('X3', 1190, 'stand', f=-1, seed=5)],
   strings=[dict(a='X4', b=[560, 640], col='#9fe0ff', w=.6), ST(), dict(a='X3', b=[1400, 600], col='#f29ac0', w=.5)])
sh('L002', 'scene', **BK, cam=push([980, 600, 1.55], .1), who=[O(880, 'stand', 'smile'), Li(1060, 'stand', 'happy')], strings=[ST(w=1.2)])
# ---------------- ACT 1 ----------------
sh('L003', 'face', **BK, who='LILA', expr=[[0, 'happy'], ['L003:5', 'smile']], side=-1, bgCam=[1060, 520, 1.6])
sh('L004', 'scene', **BK, cam=push([970, 600, 1.6], .1), who=[O(880, 'stand', 'happy'), Li(1060, 'stand', 'joy')], strings=[ST(tieAt=0, w=1.3)], sfx=[(.2, 'shimmer', -13)])
sh('L005', 'scene', 'dip', **OF, cam=[[900, 560, 1.15], [900, 540, 1.25]], stamp='18:00', who=[O(860, 'explain', 'nervous'), who('BOSS', 1100, 'talk', 'flat', f=-1)],
   strings=[dict(a='OMAR', b=[700, 300], w=[[0, .9], [.4, .55], [.8, .3]], sag=20)])
sh('L005:7', 'face', **OF, who='OMAR', expr=[[0, 'nervous'], [.5, 'worried']], side=1, look=[-.5, -.3], bgCam=[900, 520, 1.5])
# ---------------- ACT 2 ----------------
sh('L006-0.4', 'scene', 'dip', **FR, cam=[[960, 560, 1.15], [960, 560, 1.25]], stamp='18:40', who=[Li(1000, 'sit', 'sad', f=-1, dy=-40), O(0, 'stand', 'scared', walk=[600, 820, 0, .6])],
   strings=[ST(w=.2, snapAt='L006+0.1')], sfx=[(.6, 'hit', -12)])
sh('L006+0.4', 'scene', **FR, cam=push([900, 560, 1.7], .1), who=[O(820, 'reach', 'hurt')], strings=[dict(a='OMAR', b=[1000, 700], snapAt=0)])
sh('L007', 'face', **FR, who='LILA', expr=[[0, 'sad'], ['L007:3', 'hurt']], side=-1, look=[0, .5], bgCam=[1000, 520, 1.6])
# ---------------- ACT 3 ----------------
sh('L008', 'scene', 'dip', **FR, cam=[[960, 560, 1.15], [960, 560, 1.22]], fg='audience', stamp='NEXT WEEK', who=[O(860, 'sit', 'tender', dy=-40)])
sh('L009', 'scene', **FR, cam=two([950, 590, 1.45]), who=[O(860, 'sit', 'surprised', dy=-40), Li(1040, 'stand', 'flat')])
sh('L010', 'face', **FR, who='OMAR', expr=[[0, 'guilty'], ['L010:3', 'tender']], side=1, bgCam=[860, 520, 1.6])
sh('L011', 'scene', **FR, cam=push([950, 590, 1.5], .12), ask=dict(text='Would you give him another string?', at='L011+0.1'),
   who=[O(860, 'sit', [[0, 'surprised'], [.5, 'tearsmile']], dy=-40), Li(1040, 'reach', 'smile')], strings=[dict(a='LILA', b='OMAR', tieAt='L011:2', w=1.2)], sfx=[(.4, 'shimmer', -13)])
finish('In This World, Every Promise Is a String', motif='num', tail=1.8,
       music=[(0, 'L004+', 'hopeful', .36), ('L005', 'L007+', 'sad', .26), ('L008', None, 'calm', .36)],
       cues=[('L011:2', 'stinger', -15)])
