"""O25 shot list (v3.2, 9:16). Kid dad = same DAD design at s=1.25 (never a different character)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
KI = dict(set='kitchen', so=dict(drawing=False), day=True); GD = dict(set='garden', so=dict(goal=0), day=True)
KIDS = 1.25
sh('L001', 'kt', cap=False, bg=YEL, items=[dict(k='rise', t='WHEN A DAD LAUGHS', at='L001:3', y=.18, sz=78, c=INK), dict(k='slam', t='HE TURNS INTO A KID', at='L001:8', y=.29, sz=96, c=CORAL),
   dict(k='pop', t='1 MINUTE', at='L001:13', x=.5, y=.4, sz=70, disc=INK, c=YEL)], who=[dict(id='DAD', x=.5, y=.93, s=2.4, expr='smile')])
sh('L002', 'face', 'push', **KI, who='DAD', expr='flat', side=-1, bgCam=[1060, 520, 1.5], pops=[dict(t='2 YEARS', at='L002:5', c='red', x=.5, y=.22, sz=120)])
sh('L003', 'scene', 'whip', **KI, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, 'stand', 'worried'), who('DAD', 1080, 'crouch', 'flat', f=-1)])
sh('L004', 'scene', **KI, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, 'explain', 'happy'), who('DAD', 1080, 'stand', 'flat', f=-1)])
sh('L005', 'face', **KI, who='YOU', expr=[[0, 'talk'], ['L005:7', 'happy']], side=1, bgCam=[840, 520, 1.5])
sh('L006', 'face', **KI, who='DAD', expr='flat', side=-1, bgCam=[1080, 520, 1.5])
sh('L007', 'scene', 'whip', **GD, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, [[0, 'stand'], ['L007:10', 'kick']], 'smirk'), who('DAD', 1080, 'stand', 'flat', f=-1)], pops=[dict(t='BADLY', at='L007:14', c='gold', x=.5, y=.24, sz=110)])
sh('L008', 'scene', **GD, cam=push([960, 600, 1.2], .14), vx=960, who=[Y(840, 'handsOnHead', 'scared'), who('DAD', 1080, 'handsOnHead', 'surprised', f=-1)], slam=dict(t='BONK', at='L008:1', c='gold', x=.62, y=.3, sz=130, rot=.12))
sh('L009', 'face', **GD, who='DAD', expr='laugh', side=-1, bgCam=[1080, 520, 1.5], push=.16)
sh('L010', 'scene', {'type': 'iris', 'fill': YEL}, **GD, cam=push([960, 620, 1.2], .1), vx=960, who=[Y(820, 'stand', 'surprised'), who('DAD', 1080, 'jump', 'laugh', f=-1, s=KIDS)], pops=[dict(t='AGE 8', at='L010:2', c='lime', x=.5, y=.22, sz=120)])
sh('L011', 'scene', **GD, cam=push([960, 620, 1.2], .1), vx=960, who=[Y(820, 'kick', 'happy'), who('DAD', 1080, 'cheer', 'laugh', f=-1, s=KIDS)])
sh('L012', 'scene', **GD, cam=push([960, 620, 1.2], .12), vx=960, who=[Y(820, 'cheer', 'laugh'), who('DAD', 1080, 'jump', 'joy', f=-1, s=KIDS)], polaroid=dict(at='L012:7', caption='THE BOY HE USED TO BE', ring=[1080, 540, 260]))
sh('L013', 'scene', 'dip', **GD, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, 'stand', 'tearsmile'), who('DAD', 1080, 'stand', 'smile', f=-1)])
sh('L014', 'face', **GD, who='DAD', expr='happy', side=-1, bgCam=[1080, 520, 1.5], ask=dict(text='What would make YOUR dad laugh?', at='L014+0.1'))
finish('In This World, Dads Turn Into Kids When They Laugh', motif='num', tail=2.4, music=[(0, 'L006+', 'sad', .3), ('L007', None, 'playful', .42)])
