"""P2 shot list (9:16 original, style growkaz-ifverse v3.1). Usage: python3 story/build_story.py <episode>"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
KI = dict(set='kitchen'); KJ = dict(set='kitchen', so=dict(juice=True, dog=1300)); GD = dict(set='garden', so=dict(goal=420))
def S(x, pose='stand', expr='neutral', f=1, **k): return who('SAMI', x, pose, expr, f, s=1.15, **k)
def MA(x, pose='stand', expr='neutral', f=-1, **k): return who('MA', x, pose, expr, f, seed=2, **k)
def BR(x, pose='stand', expr='neutral', f=-1, **k): return who('BRO', x, pose, expr, f, seed=3, s=1.45, **k)
FZ = dict(freeze=True)
# ---------------- HOOK (B: the impossible thing first) ----------------
sh('L001', 'scene', set='kitchen', so=dict(juice=True, dog=1250), cam=[[820, 540, 1.15], [840, 540, 1.25]], vx=960, hookText='HE LIED. EVERYTHING FROZE.', hookT=[0, 'L002:3'], fring=[0, 'L002:5'], **FZ, hero='SAMI',
   who=[MA(620, 'explain', 'surprised', f=1), BR(1040, 'point', 'angry', f=-1), S(0, 'stand', 'smirk', walk=[860, 760, .1, .9])])
sh('L002:6', 'scene', set='kitchen', so=dict(juice=True, juiceFull=True), cam=[[820, 560, 1.1], [820, 560, 1.15]],
   who=[MA(620, 'stand', 'confused', f=1), BR(1040, 'crossArms', 'confused', f=-1), S(780, 'stand', 'smile')], sfx=[(.05, 'pop', -14)])
# ---------------- ACT 1 ----------------
sh('L003', 'scene', **KI, cam=two([780, 580, 1.35]), who=[MA(900, 'crossArms', 'flat'), S(640, 'stand', 'smile')])
sh('L004', 'face', **KI, who='SAMI', expr='smile', side=1, nod=True, bgCam=[640, 520, 1.5])
sh('L004+0.1', 'scene', **KI, **FZ, hero='SAMI', cam=[[700, 560, 1.15], [600, 560, 1.15]], fring=[0, 'L005-0.2'], who=[MA(900, 'crossArms', 'flat'), S(0, 'stand', 'joy', walk=[640, 480, 0, .5], f=-1)])
sh('L005-0.2', 'scene', **KI, cam=two([820, 580, 1.35]), who=[BR(980, 'crossArms', 'angry'), S(660, 'stand', 'neutral')])
sh('L006', 'face', **KI, who='SAMI', expr='smile', side=1, bgCam=[660, 520, 1.5])
sh('L006+0.1', 'insert', **KI, ins='plate', fring=[0, 'L007-0.2'])
sh('L007', 'face', **KI, who='BRO', expr='confused', side=-1, look=[0, .6], bgCam=[980, 520, 1.5])
sh('L008-0.4', 'scene', set='garden', so=dict(goal=420, ball=[640, 640, 0, 1]), cam=[[560, 560, 1.15], [560, 560, 1.2]], who=[BR(420, 'ready', 'determined', f=1), S(760, 'stand', 'smirk', f=-1)])
sh('L008+0.1', 'scene', set='garden', so=dict(goal=420, ball=[640, 420, 0, 1.4], ballLive=True), **FZ, hero='SAMI', cam=[[560, 560, 1.15], [560, 560, 1.15]], fring=[0, 'L009-0.2'],
   who=[BR(420, 'ready', 'determined', f=1), S(0, 'stand', 'joy', walk=[700, 470, 0, .9], f=-1)])
sh('L009', 'face', set='garden', so=dict(goal=420), who='SAMI', expr=[[0, 'smirk'], ['L009:4', 'joy']], side=-1, nod=True, bgCam=[560, 520, 1.5])
# ---------------- ACT 3 ----------------
sh('L010-0.6', 'scene', 'dip', **KI, cam=two([1300, 560, 1.3]), who=[S(1440, 'point', 'happy', f=1), MA(1700, 'stand', 'smile')])
sh('L011', 'face', **KI, who='MA', expr=[[0, 'smile'], [.1, 'tender']], side=-1, bgCam=[1600, 520, 1.5])
sh('L011+0.15', 'insert', **KI, **FZ, ins='drawing', flipAt=.5, handCol='#2a8a8a', fring=[0, 'L012-0.2'])
sh('L012', 'face', set='kitchen', so=dict(drawFlip=1), who='SAMI', expr='confused', side=1, look=[.4, -.3], bgCam=[1400, 520, 1.5])
sh('L013', 'scene', set='kitchen', so=dict(drawFlip=1), cam=two([1500, 560, 1.4]), who=[S(1420, 'stand', 'confused', f=1), MA(1580, 'stand', 'smile')])
sh('L013+0.05', 'scene', set='kitchen', so=dict(drawFlip=1), **FZ, hero='MA', cam=push([1500, 560, 1.45], .1), fring=[0, 'L013+1.8'], ask=dict(text='Would you have told him the truth?', at='L013+0.2'),
   who=[S(1440, 'stand', 'confused', f=1), MA(1530, 'hug', 'tender')])
finish('Every Lie Freezes the World for 5 Seconds', motif='num', tail=1.9,
       music=[(0, 'L002+', 'mystery', .36), ('L003', 'L009+', 'playful', .42), ('L010-0.6', None, 'calm', .36)],
       cues=[('L004+0.1', 'whoosh', -13), ('L006+0.1', 'whoosh', -13), ('L008+0.1', 'whoosh', -13), ('L011+0.15', 'whoosh', -13), ('L013+0.05', 'whoosh', -13)])
