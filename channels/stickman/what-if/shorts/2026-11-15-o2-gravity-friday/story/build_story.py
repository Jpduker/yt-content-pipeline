"""O2 shot list (9:16 original, style growkaz-ifverse v3.1). Usage: python3 story/build_story.py <episode>"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
OF = dict(set='office')
D = 630   # Dana's desk
def fl(k, x, y, **o): return dict(k=k, x=x, y=y, **o)
JUNK = [fl('paper', 520, -520, spin=.6), fl('paper', 760, -380, spin=-.5), fl('mug', 700, -620, c='#d8504a'), fl('plant', 1010, -470, spin=.2), fl('paper', 1180, -640, spin=.7), fl('mug', 880, -300, c='#5a7ac0', spin=-.8), fl('cup', 1060, -760, spin=.9)]
# ---------------- HOOK (B: the impossible thing first) ----------------
sh('L001', 'scene', **OF, cam=[[900, 430, 1.0], [900, 420, 1.08]], vx=960, hookText='NO GRAVITY. 5 SECONDS.', hookT=[0, 'L001+0.2'], fring=[0, 'L001+0.3'], dropAt='L001+0.3', floaters=JUNK + [fl('cabinet', 1000, -300, r=3.1, spin=0, back=True)],
   who=[who('BOSS', 1010, 'hug', 'shocked', rot=3.0, dy=-330, f=-1), who('X1', 700, 'jump', 'surprised', dy=-260, rot=.4, seed=3), who('COLL', 800, 'reach', 'flat', dy=-120, rot=-.3, prop='tablet')], sfx=[(.1, 'whoosh', -14)])
sh('L002', 'scene', **OF, cam=[[880, 560, 1.0], [880, 560, 1.08]], stamp='FRI 14:59', chairs=[[D, 1]],
   who=[who('BOSS', 1000, 'sit', 'determined', f=-1), who('X1', 760, 'reach', 'nervous', seed=3), who('COLL', D, 'sit', 'nervous', prop='tablet')])
sh('L003', 'scene', **OF, cam=push([D + 30, 600, 1.6], .14), chairs=[[D, 1]], who=[who('COLL', D, 'sit', [[0, 'nervous'], ['L003:5', 'worried']], prop='tablet', look=[.3, .4])])
# ---------------- ACT 1 ----------------
sh('L004', 'scene', set='lift', so=dict(), cam=[[960, 560, 1.15], [960, 560, 1.25]], who=[who('INTERN', 0, 'holdFront', 'joy', walk=[760, 960, 0, .6])], floaters=[fl('tray', 1010, -170, rest=-170, spin=0)])
sh('L005', 'face', **OF, who='INTERN', expr='happy', side=-1, bgCam=[1100, 520, 1.5])
# ---------------- ACT 2 ----------------
sh('L006', 'scene', **OF, cam=[[860, 540, .95], [860, 500, 1.02]], vx=960, stamp='FRI 15:00', liftAt=.4, fring=['L006:1', 'L009-0.1'], floaters=JUNK + [fl('tray', 1060, -480, spin=.8)], chairs=[[D, 1]],
   who=[who('COLL', D, 'sit', 'scared', prop='tablet', dy=[[0, 0], [.4, -60]]), who('INTERN', 1060, [[0, 'holdFront'], [.4, 'jump']], [[0, 'happy'], [.45, 'shocked']], dy=[[0, 0], [.4, -200]], rot=[[0, 0], [.4, .3]])])
sh('L007', 'scene', **OF, cam=[[1150, 480, 1.25], [1350, 420, 1.3]], fring=['L006:1', 'L009-0.1'], floaters=[fl('cup', 1180, -560, spin=1.4), fl('cup', 1320, -700, spin=-1.2), fl('cup', 1450, -480, spin=1.1), fl('tray', 1280, -620, spin=.9)],
   who=[who('INTERN', 0, 'dive', 'scared', walk=[1150, 1400, 0, 1], dy=-380, rot=.6)])
sh('L008', 'face', **OF, who='COLL', expr=[[0, 'scared'], ['L008:3', 'worried'], ['L008:6', 'determined']], side=1, look=[[0, [.2, .5]], ['L008:3', [.5, -.6]]], fring=['L006:1', 'L009-0.1'], bgCam=[700, 480, 1.5])
sh('L008+0.2', 'scene', **OF, cam=[[1150, 440, 1.2], [1180, 440, 1.25]], fring=['L006:1', 'L009-0.1'], floaters=[fl('laptop', 980, -360, spin=1.6)],
   who=[who('INTERN', 1300, 'dive', 'scared', dy=-430, rot=.5), who('COLL', 1180, 'reach', 'determined', dy=-250, rot=-.5)], sfx=[(.6, 'pop', -12)])
# ---------------- ACT 3 ----------------
sh('L009-0.1', 'scene', **OF, cam=[[1000, 560, 1.0], [1000, 560, 1.04]], dropAt=0, chairs=[[1250, -1]], floaters=[fl('splash', 820, -330, rest=-330), fl('bin', 1500, 0), fl('cup', 760, -10), fl('cup', 860, -10), fl('paper', 1100, -6)],
   who=[who('BOSS', 820, 'stand', [[0, 'shocked'], [.4, 'angry']]), who('INTERN', 1250, 'sit', 'scared', f=-1), who('COLL', 1060, 'stand', 'nervous', f=-1)], sfx=[(0, 'hit', -9), (.12, 'pop', -13)])
sh('L010', 'face', **OF, who='INTERN', expr=[[0, 'nervous'], ['L010:2', 'smile']], side=-1, bgCam=[1250, 520, 1.5])
sh('L011', 'scene', **OF, cam=push([1500, 700, 1.9], .12), vx=960, floaters=[fl('bin', 1500, 0, laptop=True)], who=[])
sh('L012', 'face', **OF, who='COLL', expr=[[0, 'flat'], ['L012:2', 'smirk']], side=1, bgCam=[900, 520, 1.5])
sh('L013', 'scene', 'dip', **OF, cam=[[D + 150, 560, 1.25], [D + 150, 560, 1.35]], stamp='FRI 14:59', chairs=[[D, 1]], floaters=[fl('cup', D + 140, -230, rest=-230)],
   who=[who('COLL', D, 'sit', 'smile', prop='tablet'), who('INTERN', D + 230, 'reach', 'happy', f=-1)], ask=dict(text='Would you have let go of the laptop?', at='L013+0.1'))
finish('Gravity Stops for 5 Seconds Every Friday at Work', motif='num', tail=1.6,
       music=[(0, 'L003+', 'mystery', .36), ('L004', 'L005+', 'playful', .4), ('L006', 'L009-0.1', 'tension', .34), ('L009', None, 'playful', .4)],
       cues=[('L006:1', 'whoosh', -12), ('L008+0.8', 'pop', -12)])
