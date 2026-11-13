"""O8 shot list (9:16 original, style growkaz-ifverse v3.1). Usage: python3 story/build_story.py <episode>"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
SN = dict(set='street', so=dict(variant='night'))
def El(x, pose='stand', expr='neutral', f=1, **k): return who('ELI', x, pose, expr, f, seed=3, **k)
# ---------------- HOOK (B: the impossible thing first) ----------------
sh('L001', 'scene', **SN, rain=True, cam=[[950, 560, 1.15], [950, 560, 1.22]], vx=960, hookText="HIS UMBRELLA WON'T OPEN", hookT=[0, 'L001:7'],
   who=[who('X4', 780, 'stand', 'neutral', seed=4, umb='open', umbAt=.2, umbCol='#d8504a'), El(950, 'stand', [[0, 'neutral'], [.6, 'confused']], umb='closed'), who('X2', 1120, 'stand', 'neutral', f=-1, seed=6, umb='open', umbAt=.5, umbCol='#3fb950')], sfx=[(.25, 'pop', -14), (.55, 'pop', -14)])
sh('L002', 'face', **SN, who='ELI', expr=[[0, 'confused'], ['L002:8', 'sad']], side=1, rain=True, bgCam=[950, 520, 1.5])
# ---------------- ACT 1 ----------------
sh('L003', 'scene', **SN, rain=True, cam=push([950, 600, 1.5], .1), who=[El(950, [[0, 'holdFront'], [.35, 'point'], [.7, 'holdFront']], 'angry', umb='closed')])
sh('L004', 'insert', **SN, ins='reply', to='Messages', drafts=[''], noSend=True)
sh('L004:6', 'face', **SN, who='ELI', expr='sad', side=1, look=[0, .5], rain=True, bgCam=[950, 520, 1.5])
# ---------------- ACT 2 ----------------
sh('L005', 'scene', 'dip', **SN, rain=True, cam=[[900, 560, 1.05], [1000, 560, 1.1]], who=[El(0, 'sad', 'sad', walk=[700, 1200, 0, 1], slow=True, umb='closed')])
sh('L006', 'scene', **SN, rain=True, cam=push([960, 580, 1.4], .1), who=[El(960, 'stand', [[0, 'sad'], [.4, 'shocked']], umb=[[0, 'closed'], [.4, 'open']], umbAt='L006:3')], sfx=[(1.4, 'pop', -12)])
# ---------------- ACT 3 ----------------
sh('L007', 'insert', **SN, ins='window')
sh('L008', 'insert', **SN, ins='window')
sh('L009', 'face', **SN, who='ELI', expr=[[0, 'surprised'], [.3, 'tearsmile']], side=1, rain=True, bgCam=[950, 520, 1.5])
sh('L010', 'scene', **SN, rain=True, cam=push([960, 580, 1.3], .1), ask=dict(text='Would YOUR umbrella open tonight?', at='L010+0.1'),
   who=[El(900, 'stand', 'tender', umb='open')], floaters=[dict(k='dog', x=1090, y=0, f=-1)])
finish("Umbrellas Only Open If Someone's Waiting for You", motif='num', tail=1.9,
       music=[(0, 'L004+', 'sad', .26), ('L005', 'L006+', 'mystery', .3), ('L007', None, 'hopeful', .4)])
