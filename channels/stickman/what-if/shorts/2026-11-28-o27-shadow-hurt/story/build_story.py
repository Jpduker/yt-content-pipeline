"""O27 shot list (v3.2, 9:16). The shadow = cast SHADOW (hero shape, near-black hoodie). It stands next to Ava until the apology."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
FD = dict(set='flat', so=dict(), day=True); KI = dict(set='kitchen', so=dict(drawing=False), day=True); TR = dict(set='train'); BR = dict(set='bedroom', so=dict()); ST = dict(set='street', so=dict(variant='pm'))
SH = lambda x, pose='stand', **k: who('SHADOW', x, pose, 'flat', **k)
sh('L001', 'kt', cap=False, bg=NAVY, items=[dict(k='rise', t='YOUR SHADOW', at='L001:3', y=.17, sz=90, c='#fff'), dict(k='slam', t='STAYS WITH', at='L001:9', y=.27, sz=110, c=YEL),
   dict(k='rise', t='THE LAST PERSON YOU HURT', at='L001:12', y=.36, sz=58, c='#9fb6ff')], who=[dict(id='YOU', x=.38, y=.93, s=2.4, expr='neutral'), dict(id='SHADOW', x=.62, y=.93, s=2.4, expr='flat')])
sh('L002', 'scene', 'push', **FD, clock='MON 07:30', cam=push([960, 600, 1.2], .1), vx=960, who=[Y(820, 'stand', 'shocked'), SH(0, 'walk', walk=[1060, 1400, 0, .9])])
sh('L003', 'scene', 'whip', **KI, cam=push([1060, 600, 1.1], .1), vx=960, who=[Y(860, 'stand', 'guilty'), who('AVA', 1060, 'crossArms', 'sad'), SH(1260, f=-1)])
sh('L004', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='rise', t='YESTERDAY', at='L004:0', y=.18, sz=80, c=INK), dict(k='marker', t='I LAUGHED', at='L004:2', mark='L004:5', y=.28, sz=120, c=INK, mc=CORAL),
   dict(k='pop', t='AT HER DRAWING', at='L004:5', x=.5, y=.38, sz=60, disc=INK, c='#fff')], who=[dict(id='AVA', x=.5, y=.93, s=2.4, expr='hurt')])
sh('L005', 'face', **KI, who='AVA', expr=[[0, 'flat'], ['L005:5', 'sad']], side=-1, bgCam=[1040, 520, 1.5])
sh('L006', 'scene', 'whip', **KI, cam=push([1140, 600, 1.2], .1), vx=960, who=[who('AVA', 1040, 'holdFront', 'sad'), SH(1250, f=-1)], pops=[dict(t='BREAKFAST', at='L006:7', c='gold', x=.5, y=.22, sz=96)])
sh('L006:8', 'scene', 'whip', **TR, cam=push([1100, 600, 1.2], .1), vx=960, who=[who('AVA', 1000, 'stand', 'sad'), SH(1220, f=-1)], pops=[dict(t='BUS', at='L006:10', c='gold', x=.5, y=.22, sz=110)])
sh('L006:11', 'scene', 'whip', **BR, cam=push([1100, 600, 1.2], .1), vx=960, who=[who('AVA', 1000, 'stand', 'sad'), SH(1220, f=-1)], pops=[dict(t='DESK', at='L006:13', c='gold', x=.5, y=.22, sz=110)])
sh('L007', 'scene', 'whip', **BR, clock='MON 19:00', cam=push([1060, 600, 1.1], .1), vx=960, who=[Y(860, 'point', 'nervous'), who('AVA', 1060, 'stand', 'flat', f=-1), SH(1260, f=-1)])
sh('L008', 'face', **BR, who='YOU', expr=[[0, 'nervous'], ['L008:5', 'guilty']], side=1, bgCam=[860, 520, 1.5])
sh('L009', 'scene', **BR, cam=push([1060, 600, 1.1], .12), vx=960, who=[Y(860, 'stand', 'surprised'), who('AVA', 1060, 'holdFront', 'smile', f=-1), SH(1260, f=-1)])
sh('L010', 'scene', 'dip', **ST, cam=push([950, 600, 1.0], .1), vx=960, who=[SH(0, 'walk', walk=[700, 800, 0, 1]), Y(0, 'walk', 'happy', walk=[900, 1000, 0, 1]), who('AVA', 0, 'walk', 'happy', walk=[1100, 1200, 0, 1])],
   polaroid=dict(at='L010:8', caption='BACK WHERE IT BELONGS', ring=[900, 470, 300]), ask=dict(text='Where is YOUR shadow standing right now?', at='L010+0.1'))
finish('In This World, Your Shadow Stays With the Last Person You Hurt', motif='num', tail=2.4, music=[(0, 'L007+', 'sad', .3), ('L008', None, 'hopeful', .36)])
