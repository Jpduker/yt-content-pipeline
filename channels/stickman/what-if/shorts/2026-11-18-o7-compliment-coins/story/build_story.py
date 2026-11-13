"""O7 shot list (9:16 original, style growkaz-ifverse v3.1). Usage: python3 story/build_story.py <episode>"""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.1/tools'))
from story_lib import *
SA = dict(set='street', so=dict(variant='am'))
def Wa(x, pose='stand', expr='neutral', f=1, **k): return who('WALT', x, pose, expr, f, seed=3, **k)
def Zo(x, pose='stand', expr='happy', f=-1, **k): return who('ZOE', x, pose, expr, f, s=1.1, seed=2, **k)
def coin(x, at, y=-150): return dict(k='coin', x=x, y=0, at=at, rest=y)
# ---------------- HOOK (A: the rule while it happens) ----------------
sh('L001', 'scene', **SA, cam=[[940, 560, 1.15], [940, 560, 1.25]], vx=960, hookText='EVERY COMPLIMENT = A COIN', hookT=[0, 'L001:9'],
   who=[who('X4', 820, 'explain', 'happy', seed=4), who('X2', 1000, 'stand', 'joy', f=-1, seed=6), who('X5', 1160, 'point', 'smirk', f=-1, seed=5)],
   floaters=[coin(1000, .4, -170), coin(1000, 1.6, -170), coin(1000, 3.0, -170)], sfx=[(.5, 'counter', -14), (1.7, 'counter', -14), (3.1, 'counter', -14)])
sh('L002', 'scene', **SA, cam=push([1100, 600, 1.6], .1), who=[who('X5', 1100, 'handsOnHead', 'wince', f=-1, seed=5)], floaters=[dict(k='ash', x=1080, y=0, rest=-150, at=.3)], sfx=[(.3, 'hit', -14)])
# ---------------- ACT 1 ----------------
sh('L003', 'scene', **SA, cam=[[900, 560, 1.2], [900, 560, 1.3]], stamp='07:30', who=[Wa(880, 'holdFront', 'smile')])
sh('L004', 'face', **SA, who='WALT', expr='tender', side=1, bgCam=[880, 520, 1.5])
sh('L005-0.4', 'scene', **SA, cam=two([960, 590, 1.4]), who=[Wa(860, 'holdFront', 'smile'), Zo(0, 'wave', 'joy', walk=[1300, 1060, 0, .5])], floaters=[coin(860, 'L005+0.1', -150)], sfx=[(2.4, 'counter', -14)])
sh('L006', 'face', **SA, who='ZOE', expr='joy', side=-1, bgCam=[1060, 520, 1.6])
# ---------------- ACT 2 ----------------
sh('L007', 'insert', **SA, ins='card', lines=['SCHOOL TRIP', 'THE SEASIDE', '120 COINS', 'by Friday'], size=52, gap=.6)
sh('L007:10', 'face', **SA, who='ZOE', expr='sad', side=-1, look=[0, .5], bgCam=[1060, 520, 1.6])
sh('L008', 'insert', **SA, ins='card', lines=['PAID IN FULL', '', '"From the street."'], size=54, gap=.8)
sh('L008:5', 'face', **SA, who='WALT', expr=[[0, 'flat'], [.5, 'smirk']], side=1, bgCam=[880, 520, 1.5])
# ---------------- ACT 3 ----------------
sh('L009', 'scene', **SA, cam=two([960, 590, 1.4]), who=[Wa(860, 'holdFront', 'joy'), Zo(1060, 'wave', 'joy')], floaters=[coin(860, 'L009+0.1', -150)])
sh('L010', 'scene', **SA, cam=push([880, 600, 1.55], .12), ask=dict(text="Who would get rich off YOUR compliments?", at='L010+0.1'),
   who=[Wa(880, 'cheer', 'laugh')], floaters=[coin(880, .2, -150), coin(880, .7, -150), coin(880, 1.2, -150)], sfx=[(.3, 'counter', -14), (.8, 'counter', -14), (1.3, 'counter', -14)])
finish('In This World, Every Compliment Is a Coin', motif='num', tail=1.9,
       music=[(0, 'L002+', 'playful', .38), ('L003', 'L006+', 'hopeful', .34), ('L007', 'L008+', 'sad', .26), ('L009', None, 'hopeful', .4)])
