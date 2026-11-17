"""KT test Short (v3.2): new characters + every kinetic-typography move from huashu-art-motion's y5 grammar, one per section, labelled."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
def W(v): return dict(k='words', v=v, at=0)
YEL, CORAL, NAVY, CREAM, INKC = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
BN = dict(set='bedroom', so=dict(night=True))
# 01 slam + rise + giant background number
sh('L001', 'kt', cap=False, bg=YEL, tag='01 SLAM + RISE + BIG NUMBER',
   items=[dict(k='bignum', t='1000', at='L001:0', x=.6, y=.62, sz=620, a=.1), dict(k='slam', t='1,000', at='L001:5', y=.2, sz=250, c=INKC),
          dict(k='rise', t='WORDS A DAY', at='L001:7', y=.3, sz=92, c=INKC)],
   who=[dict(id='YOU', x=.5, y=.93, s=3.0, expr='happy', badge=W(1000))])
# 02 typed + pop (push transition)
sh('L002', 'kt', {'type': 'push'}, cap=False, bg=NAVY, tag='02 TYPED + POP',
   items=[dict(k='typed', t='spoken or typed...', at='L002:0', y=.2, sz=60, cps=24), dict(k='pop', t='-1', at='L002:2', x=.8, y=.33, sz=110, disc=CORAL, c='#fff')],
   who=[dict(id='YOU', x=.5, y=.93, s=3.0, pose='phone', expr='neutral', badge=W([[0, 1000], [.7, 999]]))])
# 03 highlighter + key zoom (colour-band wipe)
sh('L003', 'kt', {'type': 'bands'}, cap=False, bg=CREAM, tag='03 HIGHLIGHTER + KEY ZOOM',
   items=[dict(k='rise', t='RUN OUT?', at='L003:0', y=.14, sz=100, c=INKC), dict(k='marker', t='SILENT', at='L003:3', mark='L003:4', y=.25, sz=190, c=INKC, mc=YEL),
          dict(k='rise', t='UNTIL MIDNIGHT', at='L003:6', y=.35, sz=78, c=INKC)],
   who=[dict(id='X4', x=.5, y=.93, s=3.0, expr='sad', badge=W(0))])
# 04 pop + big number (zoom-through iris)
sh('L004', 'kt', {'type': 'iris', 'fill': CORAL, 'cx': .8, 'cy': .33}, cap=False, bg=CORAL, tag='04 POP + SLAM',
   items=[dict(k='bignum', t='600', at='L004:0', x=.55, y=.6, sz=700, c='#fff', a=.16), dict(k='pop', t='-600', at='L004:2', y=.17, sz=150, disc=INKC, c=YEL),
          dict(k='slam', t='PIZZA WAR', at='L004:6', y=.31, sz=120, c='#fff', rot=.12)],
   who=[dict(id='YOU', x=.5, y=.93, s=3.0, pose='shrug', expr='angry', badge=W([[0, 999], [.6, 399]]))])
# 05 world shot with the new cast + word pop-in (whip)
sh('L005', 'scene', 'whip', **BN, tag='05 WORLD SHOT + POP-IN', cam=push([860, 600, 1.15], .12),
   who=[Y(820, 'sitHands', 'sad', badge=W(14))], pops=[P for P in [dict(t='14', at='L005:4', c='red', x=.5, y=.24, sz=170)]])
# 06 push into the knock
sh('L006', 'scene', {'type': 'push'}, **BN, tag='06 PUSH TRANSITION', cam=push([980, 600, 1.1], .1),
   who=[Y(820, 'sitHands', [[0, 'sad'], ['L006:4', 'surprised']], badge=W(14)), who('THEO', 0, 'walk', 'teary', f=-1, walk=[1500, 1140, 0, .7], badge=W(986))])
# 07 close-up: the new eyes
sh('L007', 'face', **BN, tag='07 CLOSE-UP (NEW EYES)', who='THEO', expr='teary', side=-1, badge=W([[0, 986], ['L007:2', 984], ['L007:4', 981]]), bgCam=[1100, 520, 1.5])
# 08 word stagger + fast exit (navy zoom-through)
Q = ['WHAT', 'WOULD', 'YOU', 'SAY', 'WITH', 'FOURTEEN', 'WORDS?']
POS = [(.3, .2), (.7, .2), (.3, .3), (.7, .3), (.5, .4), (.5, .51), (.5, .62)]
sh('L008', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, tag='08 WORD STAGGER + EXIT',
   items=[dict(k='word', t=w, at=f'L008:{i}', x=x, y=y, sz=150 if w == 'FOURTEEN' else 110, c=YEL if w == 'FOURTEEN' else '#fff', out='L008+0.9') for i, (w, (x, y)) in enumerate(zip(Q, POS))]
        + [dict(k='slam', t='?', at='L008+1.0', y=.42, sz=520, c=YEL)])
finish('KT Test', motif='num', tail=2.2, music=[(0, 'L004+', 'playful', .45), ('L005', None, 'sad', .3)])
