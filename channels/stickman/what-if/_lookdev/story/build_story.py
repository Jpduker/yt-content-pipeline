"""v3.2 look-dev: model sheet vs Vivek's Gemini sheets, then the cast in a real set."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
SD = dict(set='studio', so=dict(), day=True); OF = dict(set='office'); ST = dict(set='street', so=dict(variant='am'), day=True); FN = dict(set='flat', so=dict(night=True, bags=True))
sh('L001', 'scene', cap=False, **SD, cam=[[960, 600, 1.55], [960, 600, 1.56]], who=[Y(560, 'stand', 'nervous'), Y(760, 'stand', 'flat'), Y(960, 'stand', 'happy'), Y(1160, 'stand', 'surprised'), who('BOSS', 1360, 'stand', 'flat', f=-1)])
sh('L003', 'scene', cap=False, **SD, cam=[[960, 600, 1.55], [960, 600, 1.56]], who=[who('THEO', 560, 'stand', 'happy'), who('MIRA', 760, 'stand', 'smile'), who('MUM', 960, 'stand', 'neutral'), Y(1160, 'wave', 'joy'), who('BARISTA', 1360, 'crossArms', 'smirk', f=-1)])
sh('L005', 'face', cap=False, **SD, who='YOU', expr='nervous', side=1, bgCam=[960, 520, 1.5])
sh('L008', 'scene', **OF, cam=[[1000, 560, 1.7], [1010, 560, 1.72]], who=[Y(860, 'sit', 'nervous'), who('BOSS', 1160, 'stand', 'flat', f=-1)], chairs=[[860, 1]])
sh('L010', 'scene', **ST, cam=[[960, 560, 1.4], [960, 560, 1.42]], who=[who('MIRA', 700, 'talk', 'happy'), Y(960, 'stand', 'smile'), who('THEO', 1220, 'stand', 'neutral', f=-1)])
sh('L012', 'scene', **FN, cam=[[820, 560, 1.6], [820, 560, 1.62]], who=[who('THEO', 640, 'sitHands', 'teary', s=1.3), Y(980, 'stand', 'worried', f=-1)])
finish('lookdev', motif='num', tail=1, music=[(0, None, 'tension', .3)])
