"""WI19 shot list (v3.2). Biscuit = dog floater (liftAt=999 keeps him on the ground; rest=-y puts him on a seat). Dog lines = camera on the dog."""
import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../library/styles/growkaz-ifverse/v3.2/tools'))
from story_lib import *
YEL, CORAL, NAVY, CREAM, INK = '#FFD23F', '#FF5A36', '#14213D', '#F4EFE6', '#111111'
KI = dict(set='kitchen', so=dict(drawing=False), day=True); PK = dict(set='garden', so=dict(bench=80), day=True); FN = dict(set='flat', so=dict(night=True))
D = lambda x, f=-1, rest=0: dict(floaters=[dict(k='dog', x=x, y=0, f=f, rest=rest)], liftAt=999)
F = lambda who='YOU', side=1, bg=(760, 520, 1.5), **k: dict(who=who, side=side, bgCam=list(bg), **k)
DOGCAM = lambda x, z=2.0: push([x, 640, z], .1)
# ---- HOOK
sh('L001', 'scene', 'fade', **KI, clock='SAT 07:00', cam=push([960, 600, 1.35], .12), who=[Y(760, 'holdFront', 'sleepy')], **D(1080))
sh('L002', 'scene', **KI, cam=DOGCAM(1000, 1.25), vx=860, who=[Y(760, 'holdFront', 'shocked')], **D(1080))
sh('L003', 'kt', {'type': 'iris', 'fill': YEL}, cap=False, bg=YEL, items=[dict(k='rise', t='EVERY DOG GETS TO TALK', at='L003:3', y=.26, sz=68, c=INK), dict(k='slam', t='ONCE', at='L003:8', y=.44, sz=220, c=CORAL),
   dict(k='rise', t='FOR 24 HOURS', at='L003:10', y=.62, sz=96, c=INK), dict(k='pop', t='WAITING 11 YEARS', at='L004:4', x=.5, y=.78, sz=64, disc=INK, c=YEL)])
sh('L004+0.6', 'title', 'flash', cap=False, lines=['WHAT IF YOUR DOG COULD', 'TALK FOR 24 HOURS?'], set='kitchen', so=dict(drawing=False), bgCam=[900, 520, .7])
# ---- ACT 1: the complaints
sh('L005', 'scene', 'whip', **KI, cam=push([960, 600, 1.4], .1), who=[Y(760, 'crossArms', 'smirk')], **D(1080))
sh('L006', 'scene', **KI, cam=DOGCAM(1000, 1.25), vx=860, who=[Y(760, 'crossArms', 'surprised')], **D(1080), pops=[dict(t='CRIMINAL', at='L006:4', c='red', x=.68, y=.26, sz=110)])
sh('L007', 'scene', **KI, cam=DOGCAM(1000, 1.25), vx=860, who=[Y(760, 'stand', 'confused')], **D(1080), slam=dict(t='MONSTER', at='L007:8', c='gold', x=.66, y=.28, sz=120, rot=-.1))
sh('L008', 'scene', 'whip', **KI, cam=push([960, 600, 1.4], .1), who=[Y(760, 'holdFront', 'happy')], **D(1060))
sh('L009', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='bignum', t='11', at='L009:0', x=.62, y=.6, sz=620, c=INK, a=.08), dict(k='rise', t='DRY FOOD.', at='L009:0', y=.32, sz=120, c=INK),
   dict(k='marker', t='AGAIN.', at='L009:2', mark='L009:2', y=.5, sz=170, c=INK, mc=YEL)])
sh('L010', 'face', **KI, **F(expr='laugh', bg=(820, 520, 1.5)))
sh('L011', 'scene', **KI, cam=DOGCAM(910, 1.25), vx=960, who=[Y(760, 'point', 'laugh')], **D(1060))
sh('L012', 'scene', 'whip', **KI, clock='SAT 09:00', cam=push([960, 600, 1.3], .1), who=[Y(680, 'stand', 'laugh'), who('MUM', 880, 'handsOnHead', 'laugh'), who('DAD', 1420, 'stand', 'smile', f=-1)], **D(1160))
sh('L013', 'face', **KI, **F('MUM', 1, (880, 520, 1.5), expr='happy'))
sh('L014', 'scene', **KI, cam=DOGCAM(1150, 1.25), vx=972, who=[who('MUM', 880, 'stand', 'laugh'), who('DAD', 1420, 'stand', 'surprised', f=-1)], **D(1160), pops=[dict(t='CHEESE', at='L014:3', c='gold', x=.3, y=.26, sz=110)])
sh('L015', 'face', **KI, **F('DAD', -1, (1420, 520, 1.5), expr='nervous', push=.14))
sh('L016', 'scene', 'whip', **PK, clock='SAT 14:00', cam=push([960, 600, 1.3], .1), who=[Y(0, 'walk', 'happy', walk=[600, 900, 0, 1])], floaters=[dict(k='dog', x=1180, y=0, f=1)], liftAt=999)
sh('L017', 'scene', **PK, cam=push([960, 600, 1.2], .1), who=[Y(680, 'stand', 'laugh')], floaters=[dict(k='dog', x=1000, y=0, f=-1), dict(k='dog', x=1360, y=0, f=1)], liftAt=999,
   pops=[dict(t='5 STARS', at='L017:3', c='gold', x=.5, y=.24, sz=100), dict(t='AWOOO!', at='L017:10', c='red', x=.7, y=.34, sz=100)])
sh('L018', 'scene', **PK, cam=push([960, 600, 1.45], .12), who=[Y(0, 'walk', 'neutral', walk=[760, 900, 0, 1])], floaters=[dict(k='dog', x=1200, y=0, f=1)], liftAt=999)
sh('L019', 'scene', **PK, cam=DOGCAM(1060, 1.25), vx=910, who=[Y(860, 'stand', 'worried')], **D(1180, 1))
# ---- ACT 2: the bench
sh('L020', 'scene', **PK, cam=DOGCAM(1040, 1.25), vx=922, who=[Y(860, 'stand', 'worried')], **D(1160))
sh('L021', 'scene', **PK, cam=push([1020, 600, 1.4], .1), who=[Y(880, 'sitHands', 'tender')], **D(1160, -1, -110))
sh('L022', 'scene', **PK, cam=DOGCAM(1060, 1.25), vx=910, who=[Y(880, 'sitHands', 'neutral')], **D(1160, -1, -110))
sh('L023', 'face', **PK, **F(expr='worried', bg=(880, 520, 1.5)))
sh('L024', 'kt', {'type': 'bands'}, cap=False, bg=NAVY, items=[dict(k='rise', t='AGE 7', at='L024:3', y=.26, sz=110, c=YEL), dict(k='rise', t='UNDER THE BED', at='L024:5', y=.4, sz=90, c='#fff'), dict(k='typed', t='every day. a month.', at='L024:11', y=.5, sz=60, cps=18),
   dict(k='rise', t='HE WAS THERE', at='L025:1', y=.62, sz=110, c='#fff')])
sh('L026', 'face', **PK, **F(expr='teary', bg=(880, 520, 1.5)))
sh('L027', 'scene', **PK, cam=DOGCAM(1020, 1.25), vx=960, who=[Y(880, 'sitHands', 'teary')], **D(1160, -1, -110))
sh('L028', 'kt', {'type': 'push'}, cap=False, bg=CREAM, items=[dict(k='pop', t='DAD · THE CAR', at='L028:2', x=.5, y=.34, sz=72, disc='#fff', c=INK), dict(k='pop', t='MUM · ALONE', at='L028:9', x=.5, y=.5, sz=72, disc='#fff', c=INK),
   dict(k='marker', t="I DON'T MIND", at='L029:5', mark='L029:7', y=.72, sz=130, c=INK, mc=YEL)])
sh('L030', 'face', 'push', **PK, **F(expr='worried', bg=(880, 520, 1.5), push=.14))
sh('L031', 'scene', **PK, cam=DOGCAM(1060, 1.25), vx=910, who=[Y(880, 'sitHands', 'shocked')], **D(1160, -1, -110), pops=[dict(t='?!', at='L031:7', c='red', x=.78, y=.24, sz=140)])
# ---- ACT 3: the floor
sh('L032', 'scene', 'dip', **FN, clock='SAT 21:00', cam=push([990, 620, 1.2], .1), who=[Y(640, 'kneel', 'tender'), who('MUM', 1200, 'kneel', 'tender', f=-1), who('DAD', 1420, 'kneel', 'sad', f=-1)], **D(900))
sh('L033', 'scene', **FN, cam=push([990, 620, 1.3], .1), who=[Y(640, 'kneel', 'tender'), who('MUM', 1200, 'kneel', 'tender', f=-1), who('DAD', 1420, 'kneel', 'sad', f=-1)], **D(900))
sh('L034', 'scene', **FN, cam=DOGCAM(1050, 1.25), vx=772, who=[who('MUM', 1200, 'kneel', 'teary', f=-1)], **D(900, 1))
sh('L035', 'scene', **FN, cam=push([1300, 620, 1.6], .1), who=[who('MUM', 1200, 'kneel', 'tearsmile', f=-1), who('DAD', 1420, 'kneel', 'tearsmile', f=-1)], **D(900, 1))
sh('L036', 'face', **FN, **F(expr='teary', bg=(640, 520, 1.5)))
sh('L037', 'scene', **FN, cam=DOGCAM(780, 1.25), vx=948, who=[Y(640, 'kneel', 'tearsmile')], **D(900), polaroid=dict(at='L037:4', caption='MY FAVOURITE JOB', ring=[780, 560, 280]))
sh('L038', 'scene', 'dip', **FN, clock='00:00', cam=push([990, 620, 1.25], .1), who=[Y(640, 'kneel', 'sad'), who('MUM', 1200, 'kneel', 'sad', f=-1), who('DAD', 1420, 'kneel', 'sad', f=-1)], **D(900))
sh('L039', 'scene', **FN, cam=DOGCAM(800, 1.25), vx=922, who=[Y(640, 'kneel', 'teary')], **D(900), pops=[dict(t='THUMP', at='L039:2', c='gold', x=.62, y=.3, sz=110), dict(t='THUMP', at='L039:5', c='gold', x=.72, y=.42, sz=110)])
sh('L040', 'face', **FN, **F(expr='tearsmile', bg=(640, 520, 1.5)))
sh('L041', 'scene', **FN, cam=push([780, 620, 1.6], .1), who=[Y(640, 'kneel', 'tearsmile')], **D(900))
sh('L042', 'kt', {'type': 'iris', 'fill': NAVY}, cap=False, bg=NAVY, items=[dict(k='word', t=w, at=f'L042:{i}', x=x, y=y, sz=150 if w == 'DOG' else 110, c=YEL if w == 'DOG' else '#fff') for i, (w, (x, y)) in enumerate(zip(
   ['WHAT', 'WOULD', 'YOUR', 'DOG', 'SAY', 'TO YOU?'], [(.3, .28), (.7, .28), (.35, .42), (.65, .42), (.5, .56), (.5, .7)]))])
finish('What If Your Dog Could Talk for 24 Hours?', motif='num', tail=2.8, music=[(0, 'L004+', 'playful', .4), ('L005', 'L019+', 'playful', .42), ('L020', 'L031+', 'sad', .28), ('L032', None, 'hopeful', .36)])
