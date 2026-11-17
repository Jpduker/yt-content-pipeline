"""O26 shot list (v3.2, 9:16). Each rewind = colour-band wipe + '<< 10s' pop + month chip."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
KI = dict(set='kitchen', so=dict(drawing=False), day=True); ST = dict(set='street', so=dict(variant='am'), day=True)
RW = lambda at: dict(t='<< 10s', at=at, c='lime', x=.5, y=.22, sz=120)
MO = lambda t, at: dict(t=t, at=at, c='gold', x=.5, y=.22, sz=110)
sh('L001', 'kt', cap=False, bg=NAVY, items=[dict(k='rise', t='EVERY PARENT GETS', at='L001:3', y=.18, sz=74, c='#fff'), dict(k='slam', t='3 REWINDS', at='L001:6', y=.29, sz=130, c=YEL),
   dict(k='rise', t='10 SECONDS EACH', at='L001:10', y=.39, sz=70, c='#9fb6ff')], who=[dict(id='MUM', x=.5, y=.93, s=2.4, expr='smile')])
sh('L002', 'scene', 'push', **KI, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, 'stand', 'smirk'), who('MUM', 1080, 'crossArms', 'smile', f=-1)])
sh('L003', 'scene', 'whip', **KI, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, [[0, 'holdFront'], ['L003:4', 'handsOnHead']], [[0, 'happy'], ['L003:4', 'scared']]), who('MUM', 1080, 'stand', 'surprised', f=-1)], pops=[MO('JAN', 'L003:2')])
sh('L004', 'scene', {'type': 'bands'}, **KI, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, 'holdFront', 'happy'), who('MUM', 1080, 'stand', 'smile', f=-1)], pops=[RW('L004:0')])
sh('L005', 'scene', 'whip', **KI, cam=push([960, 600, 1.2], .12), vx=960, who=[Y(840, 'point', 'angry'), who('MUM', 1080, 'stand', 'hurt', f=-1)], pops=[MO('JUN', 'L005:2')])
sh('L006', 'scene', {'type': 'bands'}, **KI, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, 'stand', 'neutral'), who('MUM', 1080, 'stand', 'smile', f=-1)], pops=[RW('L006:0')])
sh('L007', 'scene', 'whip', **ST, cam=push([960, 600, 1.2], .1), vx=960, who=[Y(840, 'wave', 'nervous'), who('MUM', 1080, 'stand', 'teary', f=-1)], pops=[MO('SEP', 'L007:2')])
sh('L008', 'scene', **ST, cam=push([960, 600, 1.2], .12), vx=960, who=[Y(880, 'holdFront', 'tender'), who('MUM', 1040, 'holdFront', 'teary', f=-1)], pops=[RW('L008:7')])
sh('L009', 'scene', {'type': 'bands'}, **ST, cam=push([960, 600, 1.2], .14), vx=960, who=[Y(880, 'holdFront', 'tearsmile'), who('MUM', 1040, 'holdFront', 'tearsmile', f=-1)],
   polaroid=dict(at='L009:3', caption='SAME HUG. TWICE.', ring=[960, 470, 280]))
sh('L010', 'face', **ST, who='MUM', expr='tearsmile', side=-1, bgCam=[1040, 520, 1.5], ask=dict(text='What moment would YOU live twice?', at='L010+0.1'))
finish('Every Parent Gets 3 Rewinds a Year. Mum Used Hers on Me.', motif='num', tail=2.4, music=[(0, 'L006+', 'playful', .38), ('L007', None, 'hopeful', .36)],
       cues=[('L004:0', 'whoosh', -6), ('L006:0', 'whoosh', -6), ('L008:7', 'whoosh', -6)])
