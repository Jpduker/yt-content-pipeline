"""O15 shot list (v3.2, 9:16 native). One carrier per fact per frame."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
HL = dict(set='hall', so=dict()); TR = dict(set='train', so=dict())
sh('L001', 'kt', cap=False, bg=CORAL, items=[dict(k='slam', t='1 HUG', at='L001:4', y=.2, sz=200, c='#fff'), dict(k='rise', t='= +1 MINUTE OF LIFE', at='L001:6', y=.31, sz=72, c=INK)],
   who=[dict(id='GRAN', x=.36, y=.93, s=2.4, expr='smile'), dict(id='KAI', x=.66, y=.93, s=2.4, pose='holdFront', expr='happy', f=-1)])
sh('L002', 'scene', 'push', **HL, cam=push([900, 600, 1.15], .1), vx=960, who=[who('GRAN', 900, 'stand', 'flat')], pops=[dict(t='3 THIS YEAR', at='L002:4', c='red', x=.5, y=.22, sz=110)])
sh('L003', 'scene', 'whip', **TR, cam=push([960, 600, 1.15], .1), vx=960, who=[who('KAI', 940, 'phone', 'thinking')])
sh('L004', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[dict(k='typed', t='365 hugs x 1 min =', at='L004:0', y=.25, sz=56, cps=24), dict(k='slam', t='6 HOURS', at='L004:8', y=.42, sz=170, c=YEL)])
sh('L005', 'scene', 'whip', **HL, cam=push([920, 600, 1.15], .1), vx=960, who=[who('KAI', 0, 'walk', 'happy', walk=[560, 840, 0, .7]), who('GRAN', 1060, 'stand', 'surprised', f=-1)])
sh('L006', 'face', **HL, who='GRAN', expr='surprised', side=-1, bgCam=[1060, 520, 1.5])
sh('L007', 'scene', **HL, cam=push([960, 600, 1.15], .08), vx=960, who=[who('KAI', 860, 'holdFront', 'joy'), who('GRAN', 1060, 'stand', 'flat', f=-1)], pops=[dict(t='#42', at='L007:2', c='gold', x=.5, y=.22, sz=130)])
sh('L008', 'kt', {'type': 'bands'}, cap=False, bg=YEL, items=[dict(k='rise', t='BY SUNDAY', at='L008:0', y=.3, sz=90, c=INK), dict(k='slam', t='112', at='L008:6', y=.46, sz=300, c=INK)])
sh('L009', 'face', {'type': 'push'}, **HL, who='GRAN', expr='tender', side=-1, bgCam=[1060, 520, 1.5])
sh('L010', 'scene', **HL, cam=push([960, 600, 1.15], .1), vx=960, who=[who('KAI', 860, 'stand', 'surprised'), who('GRAN', 1060, 'stand', 'tearsmile', f=-1)],
   ask=dict(text='Who would YOU hug first?', at='L010+0.1'))
finish("In This World, Every Hug Adds 1 Minute to Grandma's Life", motif='num', tail=2.2, music=[(0, 'L008+', 'playful', .42), ('L009', None, 'hopeful', .36)])
