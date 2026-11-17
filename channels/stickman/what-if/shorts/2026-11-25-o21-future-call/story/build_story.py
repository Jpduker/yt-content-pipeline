"""O21 shot list (v3.2, 9:16). Future Ava appears only on the phone (call insert)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
BD = dict(set='bedroom', so=dict()); FD = dict(set='flat', so=dict(), day=True); KI = dict(set='kitchen', so=dict(drawing=False), day=True)
sh('L001', 'kt', cap=False, bg=NAVY, items=[dict(k='rise', t='EVERY BIRTHDAY', at='L001:4', y=.2, sz=80, c='#fff'), dict(k='slam', t='1 CALL', at='L001:8', y=.31, sz=170, c=YEL), dict(k='rise', t='FROM FUTURE YOU', at='L001:11', y=.42, sz=80, c='#fff')],
   who=[dict(id='AVA', x=.5, y=.93, s=2.6, pose='phone', expr='surprised')])
sh('L002', 'scene', 'push', **BD, clock='AGE 16', cam=push([960, 600, 1.15], .1), vx=960, who=[who('AVA', 960, 'phone', 'neutral')])
sh('L003', 'insert', **BD, ins='call', who='AVA_OLD', name='Future you', expr='tender', t0=3)
sh('L004', 'face', **BD, who='AVA', expr='confused', side=1, bgCam=[960, 520, 1.5])
sh('L005', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='word', t=w, at=f'L005:{min(i, 4)}', x=.5, y=.26 + i * .1, sz=86, c=INK if i < 3 else CORAL) for i, w in enumerate(['AGE 17', 'AGE 18', 'AGE 19', '"CALL GRANDAD MORE."'])])
sh('L006', 'scene', 'whip', **KI, clock='AGE 20', cam=push([960, 600, 1.15], .1), vx=960, who=[who('AVA', 960, 'phone', 'happy')], pops=[dict(t='EVERY SUNDAY', at='L006:7', c='gold', x=.5, y=.22, sz=100)])
sh('L007', 'scene', 'dip', **FD, clock='AGE 25', cam=push([960, 600, 1.15], .1), vx=960, who=[who('AVA', 960, 'phone', 'nervous')])
sh('L008', 'insert', **FD, ins='call', who='AVA_OLD', name='Future you', expr='smile', t0=2)
sh('L009', 'face', **FD, who='AVA', expr='tearsmile', side=1, bgCam=[960, 520, 1.5], ask=dict(text='What would YOUR future self tell you?', at='L009+0.1'))
finish('Every Birthday, You Get 1 Call From Your Future Self', motif='num', tail=2.4, music=[(0, 'L005+', 'mystery', .3), ('L006', None, 'hopeful', .38)])
