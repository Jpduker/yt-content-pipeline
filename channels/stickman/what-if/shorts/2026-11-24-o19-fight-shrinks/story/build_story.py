"""O19 shot list (v3.2, 9:16). The house 'shrinks' = the same set with the siblings drawn bigger each time (s 1.0 -> 1.5 -> 1.9), camera closer."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
HL = dict(set='hall', so=dict())
sh('L001', 'kt', cap=False, bg=YEL, items=[dict(k='rise', t='EVERY SIBLING FIGHT', at='L001:3', y=.2, sz=78, c=INK), dict(k='slam', t='SHRINKS', at='L001:9', y=.31, sz=170, c=CORAL), dict(k='rise', t='THE HOUSE', at='L001:10', y=.41, sz=90, c=INK)],
   who=[dict(id='LEO', x=.34, y=.93, s=2.4, pose='crossArms', expr='angry'), dict(id='MAYA', x=.68, y=.93, s=2.4, pose='point', expr='angry', f=-1)])
sh('L003', 'scene', 'push', **HL, cam=push([960, 600, 1.15], .08), vx=960, who=[who('LEO', 850, 'crossArms', 'angry', s=1.0), who('MAYA', 1080, 'point', 'angry', f=-1, s=1.0)])
sh('L004', 'scene', **HL, cam=push([960, 600, 1.15], .08), vx=960, who=[who('LEO', 850, 'point', 'angry', s=1.0), who('MAYA', 1080, 'crossArms', 'angry', f=-1, s=1.0)])
sh('L005', 'scene', **HL, cam=[[960, 600, 1.15], [960, 600, 1.3]], vx=960, who=[who('LEO', 870, 'crossArms', 'angry', s=1.45), who('MAYA', 1060, 'crossArms', 'angry', f=-1, s=1.45)],
   slam=dict(t='-1 METRE', at='L005:2', x=.5, y=.3, c='red', sz=80))
sh('L006', 'scene', 'whip', **HL, clock='FRIDAY', cam=push([960, 560, 1.15], .06), vx=960, who=[who('LEO', 820, 'stand', 'sad', s=1.85), who('MAYA', 1100, 'stand', 'sad', f=-1, s=1.85)])
sh('L008', 'face', **HL, who='LEO', expr='guilty', side=1, bgCam=[880, 520, 1.5])
sh('L009', 'face', **HL, who='MAYA', expr='tender', side=-1, bgCam=[1050, 520, 1.5])
sh('L010', 'scene', **HL, cam=[[960, 600, 1.15], [960, 600, 1.0]], vx=960, who=[who('LEO', 880, 'stand', 'smile', s=1.4), who('MAYA', 1050, 'stand', 'smile', f=-1, s=1.4)],
   ask=dict(text='Would YOUR house still fit?', at='L010+0.1'))
finish('In This World, Every Sibling Fight Shrinks the House', motif='num', tail=2.4, music=[(0, 'L007+', 'playful', .42), ('L008', None, 'hopeful', .36)])
