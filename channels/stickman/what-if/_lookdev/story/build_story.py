"""v3.2 look-dev: wardrobe sheet + every set with the new cast."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
SD = dict(set='studio', so=dict(), day=True)
sh('L001', 'scene', cap=False, **SD, cam=[[960, 600, 1.3], [960, 600, 1.31]], who=[Y(420, 'stand', 'nervous'), who('BOSS', 620, 'stand', 'flat'), who('TEE', 820, 'stand', 'happy'), who('PUFFER', 1020, 'stand', 'smirk'), who('TRACK', 1220, 'stand', 'neutral'), who('DETECTIVE', 1420, 'think', 'thinking'), who('CHEF', 1620, 'explain', 'happy', f=-1)])
sh('L002', 'scene', cap=False, **SD, cam=[[960, 600, 1.3], [960, 600, 1.31]], who=[who('SCI', 420, 'wave', 'joy'), who('MIRA', 620, 'stand', 'smile'), who('THEO', 820, 'stand', 'neutral'), who('MUM', 1020, 'stand', 'happy'), who('BARISTA', 1220, 'crossArms', 'smirk'), who('DAD', 1420, 'stand', 'tender'), who('COLL', 1620, 'stand', 'neutral', f=-1)])
SETS = [('cafe', dict(variant='am')), ('bedroom', dict()), ('office', {}), ('canteen', {}), ('train', {}), ('street', dict(variant='pm')), ('hall', {}), ('platform', {}), ('lift', {}), ('kitchen', dict(drawing=False)), ('stage', dict(variant='front')), ('garden', {}), ('flat', dict(bags=True))]
for i, (st, so) in enumerate(SETS):
    sh(f'L{i + 3:03d}' if i + 3 <= 8 else f'L008+{(i - 5) * .35:.2f}', 'scene', cap=False, set=st, so=so, tag=st.upper(), cam=[[960, 580, 1.2], [960, 580, 1.21]], who=[Y(820, 'stand', 'happy'), who('MIRA', 1100, 'talk', 'smile', f=-1)])
finish('lookdev', motif='num', tail=6, music=[(0, None, 'tension', .3)])
