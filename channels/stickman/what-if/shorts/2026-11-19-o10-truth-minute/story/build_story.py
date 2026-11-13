"""O10 shot list (9:16 original, style growkaz-ifverse v3.1)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
WD = dict(set='stage', so=dict(variant='front', banner='NADIA & DAVE', lectern=-120, spot=-120))
T = [[0, 60], ['L003', 52], ['L004', 41], ['L005', 31], ['L006', 12], ['L007', 4], ['L007+0.5', None]]
TB = lambda **k: dict(k='num', v=T, hot=99, **k)
def Le(x, pose='talk', expr='nervous', f=1, **k): return who('LEO', x, pose, expr, f, seed=3, **k)
sh('L001', 'scene', **WD, fg='audience', cam=[[900, 520, 1.25], [900, 520, 1.35]], vx=960, hookText='60 SECONDS. NO LIES.', hookT=[0, 'L002:5'],
   who=[Le(840, 'talk', [[0, 'happy'], [.4, 'shocked']], badge=TB(at=1.0)), who('NADIA', 1060, 'stand', 'shocked', f=-1, seed=2), who('DAVE', 1180, 'stand', 'shocked', f=-1, seed=4)], sfx=[(1.0, 'hit', -12)])
sh('L002', 'face', **WD, who='LEO', expr=[[0, 'shocked'], ['L002:6', 'scared']], side=1, badge=TB(), bgCam=[840, 480, 1.5])
sh('L003', 'scene', **WD, cam=two([980, 560, 1.4]), who=[Le(860, 'point', 'nervous', badge=TB()), who('DAVE', 1100, 'stand', [[0, 'smile'], ['L003:6', 'shocked']], f=-1, seed=4)])
sh('L004', 'face', **WD, who='NADIA', expr=[[0, 'shocked'], [.5, 'wince']], side=-1, bgCam=[1060, 480, 1.5])
sh('L004:6', 'face', **WD, who='DAVE', expr='hurt', side=-1, bgCam=[1180, 480, 1.5])
sh('L005', 'face', **WD, who='LEO', expr=[[0, 'nervous'], ['L005:3', 'tender']], side=1, badge=TB(), push=.1, bgCam=[840, 480, 1.5])
sh('L005:12', 'face', **WD, who='NADIA', expr='teary', side=-1, bgCam=[1060, 480, 1.5])
sh('L006', 'scene', **WD, fg='audience', cam=push([960, 540, 1.35], .1), who=[Le(840, 'talk', 'tearsmile', badge=TB()), who('NADIA', 1060, 'stand', 'tearsmile', f=-1, seed=2), who('DAVE', 1180, 'stand', 'teary', f=-1, seed=4)])
sh('L007', 'face', **WD, who='LEO', expr=[[0, 'tender'], ['L007:4', 'smirk']], side=1, badge=TB(), bgCam=[840, 480, 1.5])
sh('L008', 'face', **WD, who='DAVE', expr='tearsmile', side=-1, bgCam=[1180, 480, 1.5])
sh('L009', 'scene', **WD, fg='audience', cam=[[960, 540, 1.4], [960, 540, 1.2]], ask=dict(text='Would YOU want a truth minute?', at='L009+0.1'),
   who=[Le(840, 'hug', 'laugh'), who('DAVE', 1000, 'hug', 'laugh', f=-1, seed=4), who('NADIA', 1180, 'cheer', 'joy', f=-1, seed=2)])
finish("He Couldn't Lie for 60 Seconds. At a Wedding.", motif='num', tail=1.9, music=[(0, 'L002+', 'tension', .3), ('L003', 'L004+', 'playful', .38), ('L005', None, 'hopeful', .38)], cues=[('L007+0.5', 'pop', -13)])
