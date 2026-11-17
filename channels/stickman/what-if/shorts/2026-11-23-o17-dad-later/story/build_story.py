"""O17 shot list (v3.2, 9:16). Dad's counter = hours left together (badge on DAD only; never also as big text in the same frame)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
GD = dict(set='garden', so=dict(), day=True); ST = dict(set='street', so=dict(variant='pm')); BN = dict(set='bedroom', so=dict(night=True))
H = lambda v: dict(k='num', v=v, hot=0, at=0)
sh('L001', 'kt', cap=False, bg=CORAL, items=[dict(k='slam', t='"LATER"', at='L001:9', y=.2, sz=170, c='#fff'), dict(k='rise', t='= -1 HOUR WITH DAD', at='L001:11', y=.31, sz=72, c=INK)],
   who=[dict(id='NOAH', x=.34, y=.93, s=2.4, pose='phone', expr='flat'), dict(id='DAD', x=.68, y=.93, s=2.4, expr='smile', f=-1)])
sh('L002', 'scene', 'push', **GD, cam=push([960, 600, 1.15], .1), vx=960, who=[who('DAD', 960, 'stand', 'smile', badge=H(312))])
sh('L003', 'scene', **GD, cam=push([960, 600, 1.15], .08), vx=960, who=[who('NOAH', 840, 'phone', 'flat'), who('DAD', 1080, 'holdFront', 'happy', f=-1, badge=H([[0, 312], ['L004+0.05', 311]]))])
sh('L005', 'face', **GD, who='DAD', expr='sad', side=-1, bgCam=[1080, 520, 1.5], badge=H(311))
sh('L006', 'scene', 'whip', **ST, cam=push([960, 600, 1.15], .08), vx=960, who=[who('NOAH', 840, 'phone', 'flat'), who('DAD', 1080, 'point', 'smile', f=-1, badge=H([[0, 311], ['L007+0.05', 310]]))])
sh('L008', 'face', **ST, who='DAD', expr='hurt', side=-1, bgCam=[1080, 520, 1.5], badge=H(310))
sh('L009', 'scene', 'dip', **BN, cam=push([900, 600, 1.15], .1), vx=900, who=[who('NOAH', 860, 'sitHands', 'thinking')])
sh('L010', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[dict(k='typed', t='310 hours = ?', at='L010:0', y=.25, sz=58, cps=20), dict(k='slam', t='1 YEAR', at='L010:4', y=.42, sz=180, c=YEL), dict(k='rise', t='OF SATURDAYS', at='L010:6', y=.55, sz=84, c='#fff')])
sh('L011', 'scene', 'whip', **GD, cam=push([960, 600, 1.15], .08), vx=960, who=[who('NOAH', 840, 'holdFront', 'determined'), who('DAD', 1080, 'stand', 'surprised', f=-1, badge=H(310))])
sh('L012', 'scene', **GD, cam=push([960, 600, 1.2], .12), vx=960, who=[who('NOAH', 840, 'kick', 'joy'), who('DAD', 1080, 'cheer', 'joy', f=-1, badge=H(310))],
   ask=dict(text="How many 'laters' did you say this week?", at='L012+0.2'))
finish('Every Time You Say "Later", You Lose 1 Hour With Dad', motif='num', tail=2.4, music=[(0, 'L008+', 'sad', .3), ('L009', None, 'hopeful', .4)])
