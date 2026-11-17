"""O22 shot list (v3.2, 9:16). The glow = chest ring 'LONELY' on Nana (soft warm light); dark window after the visit."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
SN = dict(set='street', so=dict(variant='night')); HL = dict(set='hall', so=dict()); SD = dict(set='street', so=dict(variant='am'), day=True)
GLOW = dict(v='LONELY')
sh('L001', 'scene', **SN, cam=push([960, 600, 1.15], .1), vx=960, hookText='SHE GLOWS EVERY NIGHT', who=[who('NANA', 960, 'stand', 'sad', chest=GLOW)])
sh('L002', 'kt', {'type': 'push'}, cap=False, bg=NAVY, items=[dict(k='rise', t='IN THIS WORLD', at='L002:0', y=.28, sz=80, c='#fff'), dict(k='marker', t='LONELY', at='L002:3', mark='L002:3', y=.4, sz=170, c=INK, mc=YEL), dict(k='slam', t='= GLOW', at='L002:4', y=.54, sz=150, c=YEL)])
sh('L003', 'scene', 'whip', **SD, cam=push([960, 600, 1.15], .1), vx=960, who=[who('JUN', 0, 'walk', 'neutral', walk=[700, 1200, 0, 1])])
sh('L004', 'scene', 'whip', **SN, cam=push([960, 600, 1.15], .1), vx=960, who=[who('JUN', 860, 'point', 'nervous'), who('NANA', 1070, 'stand', 'surprised', f=-1, chest=GLOW)])
sh('L005', 'face', **HL, who='NANA', expr='joy', side=-1, bgCam=[1060, 520, 1.5])
sh('L006', 'scene', 'push', **HL, cam=push([960, 600, 1.15], .1), vx=960, who=[who('JUN', 860, 'holdFront', 'laugh'), who('NANA', 1070, 'explain', 'laugh', f=-1)], pops=[dict(t='2 HOURS', at='L006:0', c='gold', x=.5, y=.22, sz=110)])
sh('L007', 'scene', 'whip', **SN, cam=push([960, 600, 1.15], .1), vx=960, who=[who('JUN', 0, 'walk', 'smile', walk=[1060, 860, 0, .8], f=-1)], pops=[dict(t='DARK', at='L007:6', c='cream', x=.5, y=.22, sz=120)])
sh('L008', 'scene', **SN, cam=push([960, 600, 1.2], .12), vx=960, who=[who('JUN', 860, 'stand', 'surprised'), who('POPS', 1080, 'stand', 'sad', f=-1, chest=GLOW)],
   ask=dict(text="Whose window is glowing near you?", at='L008+0.1'))
finish('In This World, Lonely People Glow', motif='num', tail=2.4, music=[(0, 'L003+', 'sad', .3), ('L004', None, 'hopeful', .38)])
