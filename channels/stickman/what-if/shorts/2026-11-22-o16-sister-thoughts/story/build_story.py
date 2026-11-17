"""O16 shot list (v3.2, 9:16 native)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
KN = dict(set='kitchen', so=dict(drawing=False, night=True)); HL = dict(set='hall', so=dict())
sh('L001', 'face', **HL, who='LIA', expr='smirk', side=-1, bgCam=[1060, 520, 1.5], hookText='SHE HEARS HIS THOUGHTS')
sh('L002', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='rise', t='HIS THOUGHTS', at='L002:4', y=.22, sz=96, c=INK), dict(k='marker', t='1 MIN / DAY', at='L002:6', mark='L002:8', y=.36, sz=130, c=INK, mc=YEL)],
   who=[dict(id='BEN', x=.36, y=.93, s=2.4, expr='nervous'), dict(id='LIA', x=.66, y=.93, s=2.4, expr='smirk', f=-1)])
sh('L003', 'scene', **HL, cam=push([960, 600, 1.15], .1), vx=960, who=[who('BEN', 860, 'crossArms', 'annoyed' if False else 'angry'), who('LIA', 1060, 'point', 'laugh', f=-1)])
sh('L004', 'scene', 'whip', **KN, clock='19:00', cam=push([960, 600, 1.15], .1), vx=960, who=[who('BEN', 860, 'sit', 'sad'), who('LIA', 1060, 'sit', 'neutral', f=-1)], chairs=[[860, 1], [1060, -1]])
sh('L005', 'face', **KN, who='BEN', expr='guilty', side=1, bgCam=[860, 520, 1.5], pops=[dict(t='NO JOB', at='L005:5', c='red', x=.5, y=.16, sz=110)])
sh('L006', 'face', **KN, who='LIA', expr='surprised', side=-1, bgCam=[1060, 520, 1.5])
sh('L007', 'face', **KN, who='BEN', expr='wince', side=1, bgCam=[860, 520, 1.5], push=.14)
sh('L008', 'scene', **KN, cam=push([960, 600, 1.15], .1), vx=960, who=[who('BEN', 860, 'sit', 'confused'), who('LIA', 1060, 'sit', 'laugh', f=-1)], chairs=[[860, 1], [1060, -1]])
sh('L009', 'scene', **KN, cam=push([960, 600, 1.2], .12), vx=960, who=[who('BEN', 860, 'sit', 'tearsmile'), who('LIA', 1060, 'sit', 'smile', f=-1)], chairs=[[860, 1], [1060, -1]],
   ask=dict(text='Would you let your sibling hear your thoughts?', at='L009+0.1'))
finish('His Sister Could Hear His Thoughts for 1 Minute a Day', motif='num', tail=2.2, music=[(0, 'L003+', 'playful', .4), ('L004', None, 'hopeful', .34)])
