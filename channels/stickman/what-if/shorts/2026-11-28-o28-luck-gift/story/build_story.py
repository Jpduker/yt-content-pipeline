"""O28 shot list (v3.2, 9:16). Luck = gold pops; the hug passes it to Nina."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
ST = dict(set='street', so=dict(variant='am'), day=True); CN = dict(set='canteen'); FD = dict(set='flat', so=dict(), day=True); OF = dict(set='office'); SP = dict(set='street', so=dict(variant='pm'))
G = lambda t, at, c='gold': dict(t=t, at=at, c=c, x=.5, y=.22, sz=110)
O = lambda x, pose='stand', expr='happy', **k: who('OLI', x, pose, expr, **k)
sh('L001', 'kt', cap=False, bg=YEL, items=[dict(k='rise', t='ONCE IN YOUR LIFE', at='L001:0', y=.17, sz=80, c=INK), dict(k='slam', t='24 HOURS', at='L001:6', y=.27, sz=140, c=CORAL),
   dict(k='rise', t='OF PERFECT LUCK', at='L001:8', y=.37, sz=74, c=INK)], who=[dict(id='OLI', x=.5, y=.93, s=2.4, expr='joy')])
sh('L002', 'scene', 'push', **ST, clock='TUE 08:00', cam=push([960, 600, 1.2], .1), vx=960, who=[O(0, 'walk', 'happy', walk=[760, 1100, 0, 1])], pops=[G('TUESDAY', 'L002:5', 'lime')])
sh('L003', 'scene', 'whip', **ST, cam=push([960, 600, 1.2], .1), vx=960, who=[O(960, [[0, 'crouch'], ['L003:7', 'cheer']], 'joy')], pops=[G('+20', 'L003:2'), dict(t='GREEN', at='L003:9', c='lime', x=.5, y=.32, sz=100)])
sh('L004', 'scene', 'whip', **CN, cam=push([960, 600, 1.2], .1), vx=960, who=[O(960, 'holdFront', 'laugh')], pops=[G('x2', 'L004:5')])
sh('L005', 'scene', 'whip', **ST, cam=push([960, 600, 1.2], .12), vx=960, who=[O(960, 'phone', [[0, 'happy'], ['L005:4', 'worried']])])
sh('L006', 'scene', 'whip', **FD, cam=push([960, 600, 1.2], .1), vx=960, who=[who('NINA', 960, 'phone', 'teary')], pops=[G('15:00', 'L006:5', 'red')])
sh('L007', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='rise', t='LUCK CAN BE GIVEN AWAY', at='L007:3', y=.17, sz=64, c='#fff'), dict(k='slam', t='ONCE', at='L007:8', y=.27, sz=150, c=YEL),
   dict(k='pop', t='WITH A HUG', at='L007:9', x=.5, y=.38, sz=64, disc=YEL, c=INK)], who=[dict(id='OLI', x=.5, y=.93, s=2.4, expr='determined')])
sh('L008', 'scene', 'whip', **ST, cam=[[780, 600, 1.1], [1120, 600, 1.15]], vx=960, who=[O(0, 'walk', 'determined', walk=[700, 1150, 0, 1])])
sh('L009', 'scene', 'whip', set='street', so=dict(variant='am'), day=True, clock='14:55', cam=push([960, 600, 1.2], .12), vx=960, who=[O(860, 'holdFront', 'tender'), who('NINA', 1060, 'holdFront', 'teary', f=-1)], pops=[G('+LUCK', 'L009:1')])
sh('L010', 'scene', 'whip', **OF, cam=push([1060, 600, 1.2], .1), vx=960, who=[who('NINA', 940, [[0, 'explain'], ['L010:5', 'cheer']], [[0, 'nervous'], ['L010:5', 'joy']]), who('BOSS', 1160, 'crossArms', [[0, 'flat'], ['L010:5', 'smile']], f=-1)], pops=[G('HIRED', 'L010:8', 'lime')])
sh('L011', 'scene', 'whip', **SP, cam=push([960, 600, 1.2], .1), vx=960, who=[O(960, [[0, 'walk'], ['L011:1', 'fall'], ['L011:5', 'stand'], ['L011:6', 'fall']], [[0, 'happy'], ['L011:1', 'surprised']])], pops=[G('x2', 'L011:6', 'red')])
sh('L012', 'face', **SP, who='OLI', expr='laugh', side=1, bgCam=[960, 520, 1.5], ask=dict(text='Who would YOU give your lucky day to?', at='L012+0.1'))
finish('Her Brother Had 24 Hours of Luck. He Gave It Away.', motif='num', tail=2.4, music=[(0, 'L004+', 'playful', .42), ('L005', 'L008+', 'tension', .32), ('L009', None, 'hopeful', .38)])
