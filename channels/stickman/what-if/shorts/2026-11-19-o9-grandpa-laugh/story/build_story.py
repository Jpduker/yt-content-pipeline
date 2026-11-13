"""O9 shot list (9:16 original, style growkaz-ifverse v3.1)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
HL = dict(set='flat', so=dict(tv=False))
def Ja(x, pose='stand', expr='happy', f=1, **k): return who('JAY', x, pose, expr, f, s=1.15, seed=2, **k)
def Gp(x, pose='sit', expr='flat', f=-1, **k): return who('GRANDPA', x, pose, expr, f, seed=3, **k)
CH = [[1040, -1]]
sh('L001', 'scene', **HL, cam=[[880, 560, 1.2], [880, 560, 1.3]], vx=960, hookText='7 DAYS TO MAKE GRANDPA LAUGH', hookT=[0, 'L002'], chairs=CH, stamp='MONDAY',
   who=[Ja(780, 'holdFront', 'determined'), Gp(1040, 'sit', 'flat')])
sh('L002', 'face', **HL, who='GRANDPA', expr='flat', side=-1, bgCam=[1040, 520, 1.5])
sh('L003', 'scene', **HL, cam=two([900, 590, 1.4]), chairs=CH, who=[Ja(780, 'explain', 'joy', prop='paper'), Gp(1040, 'sit', 'flat')])
sh('L004', 'face', **HL, who='GRANDPA', expr=[[0, 'flat'], ['L004:8', 'smirk'], ['L004+0.1', 'flat']], side=-1, bgCam=[1040, 520, 1.5])
sh('L005', 'scene', **HL, cam=two([900, 590, 1.4]), chairs=CH, stamp='TUESDAY', who=[Ja(760, 'cheer', [[0, 'joy'], [.6, 'sad']]), Gp(1040, 'sit', 'flat')], sfx=[(1.6, 'whoosh', -14)])
sh('L005:7', 'face', **HL, who='GRANDPA', expr='flat', side=-1, bgCam=[1040, 520, 1.5])
sh('L006', 'scene', 'dip', **HL, cam=two([920, 600, 1.45]), chairs=[[880, 1], [1040, -1]], stamp='SATURDAY', who=[Ja(880, 'sitHands', 'sad'), Gp(1040, 'sit', 'flat')])
sh('L007', 'insert', **HL, ins='album', dx=225)
sh('L008', 'face', **HL, who='GRANDPA', expr=[[0, 'flat'], ['L008:5', 'smirk'], ['L008:9', 'smile']], side=-1, bgCam=[1040, 520, 1.5])
sh('L009', 'scene', **HL, cam=push([960, 600, 1.5], .12), chairs=[[880, 1], [1040, -1]], who=[Ja(880, 'sitCheer', 'joy'), Gp(1040, 'sitLaugh', 'laugh')], sfx=[(.3, 'pop', -14)])
sh('L010', 'scene', 'dip', set='platform', so=dict(doors=0), cam=two([960, 590, 1.4]), stamp='SUNDAY · AIRPORT', ask=dict(text='What would make YOUR grandparents laugh?', at='L010+0.1'),
   who=[Ja(860, 'hug', 'tearsmile'), Gp(1060, 'hug', 'tearsmile', box='SYDNEY')])
finish('He Had 7 Days to Make His Grandpa Laugh', motif='num', tail=1.9, music=[(0, 'L005+', 'playful', .4), ('L006', 'L008+', 'calm', .3), ('L009', None, 'hopeful', .4)])
