import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../../../library/styles/growkaz-ifverse/v3.1/tools"))
from story_lib import *
OF = dict(set='office'); ON = dict(set='office', so=dict(warm=True))
CP = dict(k='copier', x=960, y=0)
def P(x, s=.42, expr='happy', pose='wave', f=1, id='PIP', **k): return who(id, x, pose, expr, f, s=s, seed=2, **k)
sh('L001', 'scene', **OF, cam=[[960, 600, 1.3], [960, 620, 1.45]], vx=960, hookText='IGNORED? YOU SHRINK.', hookT=[0, 'L001:9'], floaters=[CP],
   who=[P(960, dy=-252), who('X1', 700, 'stand', 'flat', seed=3), who('X4', 1250, 'phone', 'flat', f=-1, seed=4)])
sh('L002', 'scene', **OF, cam=push([960, 640, 1.9], .12), floaters=[CP], who=[P(960, dy=-252, expr='sad', pose='stand')], stamp='THURSDAY')
sh('L003', 'scene', **OF, cam=[[960, 620, 1.6], [960, 620, 1.7]], floaters=[CP], who=[P(960, dy=-252, pose='wave', expr='nervous'), who('X2', 0, 'stand', 'flat', seed=6, walk=[700, 1300, 0, 1])])
sh('L004', 'scene', **OF, cam=push([960, 620, 1.45], .1), floaters=[CP], who=[P(960, dy=-252, pose='handsOnHead', expr='hurt'), who('X5', 1100, 'reach', 'flat', f=-1, seed=5)], sfx=[(1.6, 'tick', -13)])
sh('L005-0.4', 'scene', 'dip', **ON, cam=two([960, 600, 1.45]), stamp='22:40', floaters=[CP], who=[P(960, dy=-252, pose='stand', expr='surprised'), who('CLEANER', 1150, 'holdFront', 'smile', f=-1)])
sh('L006', 'face', **ON, who='PIP', expr='teary', side=1, bgCam=[960, 600, 1.5])
sh('L007', 'face', **ON, who='CLEANER', expr='tender', side=-1, bgCam=[1150, 520, 1.5])
sh('L008', 'scene', **ON, cam=push([1100, 560, 1.5], .1), who=[who('CLEANER', 1100, 'stand', 'happy', f=-1), P(1060, s=.42, pose='cheer', expr='joy', dy=-290, f=-1), ], sfx=[(.6, 'shimmer', -13)])
sh('L009', 'face', **ON, who='CLEANER', expr='smile', side=-1, bgCam=[1100, 520, 1.5])
sh('L010', 'scene', **ON, cam=[[960, 760, 2.2], [960, 760, 2.0]], who=[P(820, s=.32, pose='wave', expr='happy'), P(900, s=.28, pose='cheer', expr='joy', id='X4'), P(980, s=.3, pose='wave', expr='smile', id='X1'), P(1060, s=.26, pose='stand', expr='surprised', id='X3'), P(1140, s=.62, pose='wave', expr='joy')])
sh('L011', 'scene', **ON, cam=[[960, 700, 1.8], [960, 620, 1.2]], ask=dict(text='Would YOU notice someone this small?', at='L011+0.1'),
   who=[P(800, s=.9, pose='wave', expr='joy'), who('X4', 940, 'wave', 'happy', s=.9, seed=4), who('X1', 1080, 'cheer', 'joy', s=1.1, seed=3), who('CLEANER', 1240, 'stand', 'happy', f=-1)])
finish('In This World, You Shrink When You\'re Ignored', motif='num', tail=1.9, music=[(0, 'L004+', 'mystery', .3), ('L005-0.4', None, 'hopeful', .38)])
