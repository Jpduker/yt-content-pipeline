"""O24 shot list (v3.2, 9:16). Deleted texts = KT typed bubbles; dinner = kitchen night with chairs."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
KN = dict(set='kitchen', so=dict(drawing=False, night=True)); CH = [[760, 1], [1160, -1]]
MSG = lambda frm, t, at, c='#3A86FF': dict(k='typed', t=t, at=at, y=.3, sz=54, cps=26, bubble=c)
LBL = lambda t, at: dict(k='rise', t=t, at=at, y=.2, sz=60, c='#9fb6ff')
sh('L001', 'kt', cap=False, bg=NAVY, items=[LBL('DELETED · DAD', 'L001:0'), MSG('DAD', 'who ate my yoghurt', 'L001:4')], who=[dict(id='DAD', x=.5, y=.93, s=2.4, expr='flat')])
sh('L002', 'scene', 'push', **KN, cam=push([960, 600, 1.15], .1), vx=960, who=[who('DAD', 760, 'sit', 'flat'), who('LILY', 960, 'stand', 'smirk'), who('MA', 1160, 'sit', 'laugh', f=-1)], chairs=CH)
sh('L003', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[LBL('DELETED · MUM', 'L003:0'), MSG('MUM', 'your father is snoring again', 'L003:4')], who=[dict(id='MA', x=.5, y=.93, s=2.4, expr='smirk')])
sh('L004', 'scene', 'push', **KN, cam=push([960, 600, 1.15], .1), vx=960, who=[who('DAD', 760, 'sit', 'confused'), who('LILY', 960, 'stand', 'nervous'), who('MA', 1160, 'sit', 'neutral', f=-1)], chairs=CH)
sh('L005', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[LBL('DELETED · LILY', 'L005:0'), MSG('LILY', 'I got into art school. please dont be mad', 'L005:4')], who=[dict(id='LILY', x=.5, y=.93, s=2.4, expr='scared')])
sh('L006', 'scene', 'push', **KN, cam=push([960, 600, 1.1], .04), vx=900, who=[who('DAD', 760, 'sit', 'surprised'), who('LILY', 960, 'stand', 'scared'), who('MA', 1160, 'sit', 'surprised', f=-1)], chairs=CH)
sh('L007', 'face', **KN, who='DAD', expr='tender', side=1, bgCam=[760, 520, 1.5])
sh('L008', 'scene', **KN, cam=push([960, 600, 1.2], .12), vx=960, who=[who('DAD', 860, 'holdFront', 'tearsmile'), who('LILY', 1040, 'holdFront', 'tearsmile', f=-1)])
sh('L009', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[LBL('DELETED · DAD', 'L009:0'), MSG('DAD', 'so proud of you', 'L009:4', '#2BB673')], who=[dict(id='DAD', x=.5, y=.93, s=2.4, expr='tearsmile')],
   ask=dict(text="What's in YOUR deleted messages?", at='L009+0.1'))
finish('Every Text You Delete Is Read Aloud at Dinner', motif='num', tail=2.4, music=[(0, 'L004+', 'playful', .4), ('L005', None, 'hopeful', .36)])
