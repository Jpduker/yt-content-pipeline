"""O23 shot list (v3.2, 9:16)."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
HL = dict(set='hall', so=dict()); BD = dict(set='bedroom', so=dict())
sh('L001', 'kt', cap=False, bg=YEL, items=[dict(k='rise', t='BORROW A DAY', at='L001:5', y=.2, sz=90, c=INK), dict(k='slam', t='HE LOSES 1', at='L001:11', y=.31, sz=120, c=CORAL), dict(k='slam', t='YOU GET 2', at='L001:15', y=.41, sz=120, c=INK)],
   who=[dict(id='RAFA', x=.34, y=.93, s=2.3, expr='smirk'), dict(id='TOM', x=.68, y=.93, s=1.9, expr='neutral', f=-1)])
sh('L002', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[dict(k='pop', t='EXAMS', at='L002:6', x=.3, y=.3, sz=70, disc='#fff', c=INK), dict(k='pop', t='DATES', at='L002:7', x=.7, y=.3, sz=70, disc='#fff', c=INK),
   dict(k='pop', t='A LIE-IN', at='L002:9', x=.5, y=.46, sz=70, disc=YEL, c=INK)], who=[dict(id='RAFA', x=.5, y=.93, s=2.4, pose='crossArms', expr='smirk')])
sh('L003', 'scene', 'whip', **HL, cam=push([960, 600, 1.15], .1), vx=960, who=[who('RAFA', 860, 'point', 'smirk'), who('TOM', 1080, 'stand', 'smile', f=-1, s=.85)])
sh('L004', 'scene', 'whip', **BD, cam=push([960, 600, 1.15], .1), vx=960, who=[who('RAFA', 960, 'holdFront', 'confused')])
sh('L005', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='bignum', t='42', at='L005:0', x=.6, y=.6, sz=800, c=INK, a=.08), dict(k='slam', t='42 DAYS', at='L005:0', y=.24, sz=150, c=CORAL),
   dict(k='word', t='SCHOOL PLAY', at='L006:1', y=.4, sz=80, c=INK), dict(k='word', t='BIRTHDAY PARTY', at='L006:4', y=.5, sz=80, c=INK), dict(k='word', t='SPORTS DAY', at='L006:6', y=.6, sz=80, c=INK)])
sh('L007', 'face', 'whip', **BD, who='RAFA', expr='guilty', side=1, bgCam=[960, 520, 1.5])
sh('L008', 'scene', **HL, cam=push([960, 600, 1.15], .1), vx=960, who=[who('RAFA', 860, 'holdFront', 'tender'), who('TOM', 1080, 'stand', 'surprised', f=-1, s=.85)])
sh('L009', 'scene', **HL, cam=push([960, 600, 1.2], .12), vx=960, who=[who('RAFA', 860, 'shrug', 'smile'), who('TOM', 1080, 'cheer', 'joy', f=-1, s=.85)], ask=dict(text="Who's given up days for YOU?", at='L009+0.1'))
finish('In This World, You Can Borrow 1 Day From Your Brother', motif='num', tail=2.4, music=[(0, 'L003+', 'playful', .4), ('L004', None, 'hopeful', .36)])
