"""WI02: DIRECTION.md shot list -> project/story/shots.json, timed to the real voice (project/timeline/lines.json + words_all.json).
Each shot is anchored to a line id ('L016') or a word in it ('L032:6' = 7th word). Shots are contiguous; a shot starts 0.15 s before its anchor.
Usage: python3 story/build_story.py <episode>"""
import sys, os, json
EP = sys.argv[1]
TL = os.path.join(EP, 'project/timeline')
LINES = {l['id']: l for l in json.load(open(os.path.join(TL, 'lines.json')))}
WALL = json.load(open(os.path.join(TL, 'words_all.json')))
def at(a):
    if ':' in a: lid, i = a.split(':'); return [w for w in WALL if w['line'] == lid][int(i)]['t0']
    return LINES[a]['start']

# café world: CX 960, GY 885, seated heads y≈600. seats L 750 / R 1170; customer at counter -40; barista -470.
L, R = 750, 1170
def Y(x, pose='sitHands', expr='neutral', f=1, id='YOU', **k): return dict(id=id, x=x, pose=pose, expr=expr, f=f, **k)
def Mi(x, pose='sitHands', expr='neutral', f=-1, id='MIRA', **k): return dict(id=id, x=x, pose=pose, expr=expr, f=f, seed=2, **k)
W2S = [960, 640, 1.35]                       # hub two-shot
WIDE = [700, 560, .74]
def two(c=W2S, d=(-20, 0, .05)): return [c, [c[0] + d[0], c[1] + d[1], c[2] + d[2]]]
EXTRAS_AM = [dict(id='X1', x=0, pose='sitPhone', f=1, seed=5), dict(id='X2', x=1540, pose='sitHands', f=1, seed=6, expr='smile'), dict(id='X3', x=1940, pose='sitTalk', f=-1, seed=7, expr='happy')]
EXTRAS_PM = [dict(id='X4', x=1940, pose='sitPhone', f=-1, seed=8), dict(id='X5', x=0, pose='sitHands', f=1, seed=9)]
CH_AM = [[0, 1], [1540, 1], [1940, -1]]; CH_PM = [[1940, -1], [0, 1]]

S = []  # (anchor, transition, params, extra)
def sh(a, k, tr='cut', bars=None, cap=True, **p): S.append(dict(a=a, tr=tr, bars=bars, cap=cap, p=dict(k=k, **p)))
AM = dict(set='cafe', so=dict(variant='am')); PM = dict(set='cafe', so=dict(variant='pm')); NT = dict(set='cafe', so=dict(variant='night'))

# ---------------- HOOK ----------------
sh('L001', 'scene', 'fade', set='bedroom', cam=[[760, 600, 1.25], [740, 600, 1.32]], who=[Y(720, pose=[[0, 'lie'], [.45, 'sit']], rot=[[0, -1.5], [.45, 0]], expr=[[0, 'sleepy'], [.5, 'confused']], dy=[[0, 30], [.45, -10]], f=1)], clock='07:42', ft=0)
sh('L001:6', 'face', set='bedroom', who='YOU', expr=[[0, 'confused'], [.5, 'thinking']], ring='#f2e6d0', bgCam=[700, 520, 1.5])
sh('L002', 'scene', 'dip', 'scope', **NT, hub=True, cam=[[960, 600, .9], [960, 610, 1.0]], who=[Y(L, 'sitSmall', 'flat', id='YOU'), Mi(R, 'sitSad', 'sad', id='MIRA_EVE', look=[-.2, .4])], chairs=CH_PM, clock='23:00', sleeve2='#f2c21a')
sh('L003', 'scene', 'cut', 'scope', **NT, hub=True, cam=two([1060, 640, 1.6]), who=[Y(L, 'sitSmall', [[0, 'flat'], [.55, 'surprised']], id='YOU'), Mi(R, 'sitSad', 'sad', id='MIRA_EVE', look=[-.3, .3])], thoughtX=1180, sleeve2='#f2c21a')
sh('L004', 'face', bars='scope', **NT, who='YOU', expr=[[0, 'surprised'], [.55, 'sad']], side=1)
sh('L005', '3d', 'flash', 'scope', cap=False, id3='t3dawn', titleCard=True, sfx=[(0, 'stinger', -6)])
# ---------------- ACT 1 ----------------
S[-1]['a'] = 'L004+'  # title sits in the gap after L004 (see below)
sh('L005', 'scene', 'cut', **AM, cam=[[300, 560, .74], [360, 560, .78]], who=EXTRAS_AM + [dict(id='BARISTA', x=-470, pose='holdFront', f=1, expr='neutral', prop='cup'), Y(-40, 'stand', 'happy', f=-1, walk=[-1000, -40, 0, .7])], chairs=CH_AM, clock='08:15', streak=True)
sh('L006', 'scene', fg='shoulder', fgSide=1, fgCol='#3fb950', **AM, cam=two([-300, 560, 1.7]), who=[dict(id='BARISTA', x=-470, pose='holdFront', f=1, expr='neutral', prop='cup'), Y(-40, 'explain', 'happy', f=-1)])
sh('L007', 'face', **AM, who='BARISTA', expr='smile', look=[[0, [.1, 0]], [.4, [.4, .1]]], side=-1, bgCam=[-300, 560, 1.6])
sh('L008', 'scene', **AM, cam=two([-260, 560, 1.55]), who=[dict(id='BARISTA', x=-470, pose='holdFront', f=1, expr='smile', prop='cup'), Y(-40, 'talk', 'happy', f=-1)], arc=170, thoughtX=-260, thoughtY=270)
sh('L009', 'face', **AM, who='YOU', expr=[[0, 'happy'], [.28, 'pressed']], look=[[0, [0, 0]], [.3, [-.5, .4]]], side=-1, bgCam=[-200, 560, 1.6], push=.04)
sh('L010', 'face', **AM, who='BARISTA', expr=[[0, 'pressed'], [.3, 'sleepy'], [.6, 'smile']], side=-1, bgCam=[-300, 560, 1.6])
sh('L011', 'face', **AM, who='YOU', expr='awe', side=-1, ring='#e8743b', push=.12)
sh('L012', 'blueprint', 'zoom', bars='none')
sh('L013', 'insert', **AM, ins='ear')
sh('L014', 'scene', **AM, hub=True, cam=[[960, 580, .8], [980, 580, .84]], who=EXTRAS_AM + [Y(L, 'sitHands', 'happy'), Mi(R, 'wave', 'happy', walk=[2500, R + 60, 0, .65], id='MIRA')], chairs=CH_AM, streak=True)
sh('L015', 'scene', **AM, hub=True, cam=two(), who=[Y(L, 'sitHands', 'happy'), Mi(R + 60, 'point', 'smirk', y=None)])
sh('L016', 'scene', fg='shoulder', fgSide=1, fgCol='#f2c21a', **AM, hub=True, cam=two([880, 640, 1.6]), who=[Y(L, 'sitHands', [[0, 'happy'], [.45, 'confused']]), Mi(R, 'sitTalk', 'smirk')], thoughtX=960, thoughtY=260)
sh('L017', 'face', **AM, who='YOU', expr='flat', look=[.4, 0], side=1, bob=.3)
sh('L018', 'scene', **AM, hub=True, cam=two([1120, 640, 1.9]), who=[Y(L, 'sitHands', 'neutral'), Mi(R, 'sitHands', [[0, 'neutral'], [.5, 'smile']], look=[-.4, .1])], thoughtX=1000, thoughtY=290)
sh('L020', 'scene', 'flash', 'scope', **AM, hub=True, freeze=True, hero='YOU', cam=two(W2S, (0, 0, .04)), who=[Y(L, 'sitHands', 'thinking', look=[[0, [.2, -.4]], [.5, [.5, -.4]]]), Mi(R, 'sitHands', 'smile')], readout='3 s', sfx=[(0, 'freeze', -6)])
sh('L021', 'scene', **AM, hub=True, cam=two([800, 640, 1.9]), who=[Y(L, 'sitSmall', 'worried'), Mi(R, 'sitHands', 'smile')])
# ---------------- ACT 2 ----------------
sh('L022', 'scene', 'dip', set='office', cam=[[960, 560, .74], [990, 560, .78]], who=[Y(490, 'sit', 'neutral'), dict(id='BOSS', x=1290, pose='stand', f=-1, expr='neutral'), dict(id='COLL', x=1800, pose='sit', f=-1, expr='neutral', seed=4)], chairs=[[490, 1], [1800, -1]], clock='10:30')
sh('L023', 'scene', set='office', cam=two([900, 620, 1.3]), who=[Y(490, 'sit', 'thinking'), dict(id='BOSS', x=1290, pose=[[0, 'stand'], [.3, 'point'], [.8, 'explain']], f=-1, expr='happy', walk=[1420, 1290, 0, .3])], chairs=[[490, 1]])
sh('L024', 'face', set='office', who='BOSS', expr='worried', look=[-.4, 0], side=-1, bgCam=[1200, 520, 1.5])
sh('L025', 'scene', set='office', cam=two([800, 620, 1.6]), who=[Y(490, [[0, 'sit'], [.25, 'ready'], [.55, 'crossArms']], 'determined'), dict(id='BOSS', x=1290, pose='stand', f=-1, expr='surprised')], chairs=[[490, 1]])
sh('L026', 'scene', set='office', cam=two([1240, 600, 1.8]), who=[dict(id='BOSS', x=1290, pose=[[0, 'stand'], [.15, 'pointBoth']], f=-1, expr='joy')])
sh('L027', 'scene', fg='shoulder', fgSide=-1, fgCol='#3fb950', set='office', cam=two([1600, 620, 1.6]), who=[Y(490, 'crossArms', 'smile'), dict(id='COLL', x=1800, pose='sit', f=-1, expr='neutral', look=[-.6, 0], seed=4)], chairs=[[1800, -1]])
sh('L028', 'scene', set='office', cam=two([1150, 620, 1.05]), who=[Y(490, 'crossArms', [[0, 'smile'], [.4, 'nervous']]), dict(id='COLL', x=1800, pose='sitArms', f=-1, expr='angry', seed=4)], chairs=[[1800, -1]], thoughtX=1150, thoughtY=230)
sh('L029', 'scene', set='office', so=dict(warm=True), cam=two([1600, 620, 1.5]), who=[Y(1350, 'stand', 'smile', f=1), dict(id='COLL', x=1800, pose='sitTalk', f=-1, expr='happy', seed=4)], chairs=[[1800, -1]], clock='15:20')
sh('L030', 'face', set='office', so=dict(warm=True), who='COLL', expr='smile', side=-1, bgCam=[1500, 520, 1.5])
sh('L031', 'scene', 'whip', set='canteen', long=True, cam=[[960, 600, .82], [960, 600, .88]], who=[dict(id='X1', x=560, pose='sitTalk', f=1, expr='happy', seed=3), Y(820, 'sitHands', 'smile'), dict(id='X2', x=1100, pose='sitLaugh', f=-1, expr='joy', seed=5), dict(id='X3', x=1380, pose='sitHands', f=-1, expr='happy', seed=6)], chairs=[[560, 1], [820, 1], [1100, -1], [1380, -1]], clock='13:05')
sh('L032', 'scene', set='canteen', long=True, cam=two([960, 620, 1.5]), who=[Y(820, 'sitLaugh', 'joy'), dict(id='X2', x=1100, pose='sitTalk', f=-1, expr='happy', seed=5)], chairs=[[820, 1], [1100, -1]])
sh('L032:5', 'scene', set='canteen', long=True, cam=two([960, 620, 1.5]), who=[Y(820, [[0, 'sitTalk'], [.5, 'sitHands']], [[0, 'happy'], [.5, 'nervous']]), dict(id='X2', x=1100, pose='sitHands', f=-1, expr='sleepy', seed=5)], chairs=[[820, 1], [1100, -1]])
sh('L032:13', 'insert', set='canteen', ins='menu')
sh('L033', 'scene', set='canteen', long=True, cam=[[960, 600, .9], [960, 600, .82]], who=[dict(id='X1', x=560, pose='sitLaugh', f=1, expr='joy', seed=3), Y(820, 'sitSmall', 'smile'), dict(id='X2', x=1100, pose='sitLaugh', f=-1, expr='joy', seed=5), dict(id='X3', x=1380, pose='sitLaugh', f=-1, expr='happy', seed=6)], chairs=[[560, 1], [820, 1], [1100, -1], [1380, -1]])
sh('L034', 'insert', set='canteen', ins='napkin', n=1, writeTo=1, pen=True, rules=1)
sh('L035', 'insert', set='canteen', ins='napkin', n0=1, writeTo=4, n=4, pen=True, rules=[1, 4])
sh('L036', 'insert', set='office', so=dict(warm=True), ins='napkin', n0=4, writeTo=11, n=11, pen=True, rules=[4, 11])
sh('L037', 'face', set='office', so=dict(warm=True), who='YOU', expr=[[0, 'flat'], [.5, 'sleepy']], side=1, rules=[11, 23], bgCam=[600, 520, 1.5])
sh('L038', '3d', 'dip', id3='t3train', cap=True)
sh('L038:5', 'scene', fg='shoulder', fgSide=-1, fgCol='#3fb950', set='train', cam=two([1150, 640, 1.5]), who=[Y(700, 'sit', [[0, 'neutral'], [.55, 'surprised']], dy=-25), dict(id='TRAIN', x=1220, pose='sit', f=-1, expr='neutral', look=[-.5, .2], dy=-25, seed=3)], clock='17:48')
sh('L039', 'face', set='train', who='TRAIN', expr='neutral', side=-1, look=[-.4, .2])
sh('L040', 'scene', set='train', cam=two([760, 640, 1.8]), who=[Y(700, [[0, 'sit'], [.3, 'sitArms'], [.7, 'sitHands']], 'nervous', dy=-25)])
sh('L041', 'face', set='train', who='TRAIN', expr=[[0, 'neutral'], [.4, 'smile']], side=-1, look=[-.2, -.2])
sh('L042', 'scene', set='train', cam=[[960, 600, .9], [930, 600, .93]], who=[Y(700, 'sitHands', 'worried', dy=-25), dict(id='TRAIN', x=1220, pose='sit', f=1, expr='smile', dy=-25, seed=3)])
sh('L043', 'scene', set='train', cam=two([760, 640, 1.7]), who=[Y(700, [[0, 'sitHands'], [.4, 'sitSmall']], 'worried', id='YOU', dy=-25, look=[.1, .6])])
# ---------------- ACT 3 ----------------
sh('L044', 'insert', set='train', ins='phone')
sh('L046', 'scene', 'dip', **PM, hub=True, cam=[[600, 560, .76], [640, 560, .8]], who=EXTRAS_PM + [Y(L, [[0, 'stand'], [.6, 'sitHands']], 'nervous', id='YOU', walk=[-900, L, 0, .5])], chairs=CH_PM, clock='18:02', sleeve2='#f2c21a')
sh('L046:5', 'insert', **PM, ins='cups')
sh('L046:7', 'scene', **PM, hub=True, cam=two([900, 640, 1.5]), who=[Y(L, [[0, 'reach'], [.6, 'sitHands']], 'nervous', id='YOU')], sleeve2='#f2c21a')
sh('L046:11', 'face', **PM, who='YOU', expr='nervous', side=1, bubbles=True)
sh('L047', 'scene', **PM, hub=True, cam=[[800, 580, .8], [820, 580, .84]], who=EXTRAS_PM + [Y(L, 'sitHands', 'nervous', id='YOU'), Mi(R, 'sad', 'sad', id='MIRA_EVE', walk=[2500, R + 60, 0, .8], slow=True)], chairs=CH_PM, sleeve2='#f2c21a')
sh('L048', 'scene', **PM, hub=True, cam=two(), who=[Y(L, 'sitLean', 'neutral', id='YOU'), Mi(R, 'sitSad', 'sad', id='MIRA_EVE', look=[-.2, .4])], sleeve2='#f2c21a')
sh('L049', 'face', **PM, who='MIRA_EVE', expr='worried', side=-1, look=[-.2, .4])
sh('L050', 'scene', **PM, hub=True, cam=two(), who=[Y(L, [[0, 'sitHands'], [.45, 'sitTalk']], [[0, 'neutral'], [.45, 'happy']], id='YOU'), Mi(R, 'sitSad', 'neutral', id='MIRA_EVE')], sleeve2='#f2c21a')
sh('L052', 'scene', fg='shoulder', fgSide=-1, fgCol='#3fb950', **PM, hub=True, cam=two([1120, 640, 1.7]), who=[Y(L, 'sitTalk', 'happy', id='YOU'), Mi(R, 'sitHands', 'smile', id='MIRA_EVE')], thoughtX=1050, thoughtY=280, sleeve2='#f2c21a')
sh('L053', 'face', **PM, who='YOU', expr='pressed', side=1, bob=0, push=0)
sh('L054', 'insert', **PM, ins='sleeve')
sh('L055', 'scene', **PM, hub=True, cam=two(), who=[Y(L, [[0, 'sitHands'], [.5, 'sitTalk']], 'neutral', id='YOU'), Mi(R, 'sitSad', 'neutral', id='MIRA_EVE')], sleeve2='#f2c21a')
sh('L057', 'face', **PM, who='YOU', expr=[[0, 'happy'], [.4, 'pressed'], [.62, 'nervous']], swallow=.62, side=1)
sh('L059', 'scene', set='cafe', so=dict(variant='night'), hub=True, cam=[[900, 580, .85], [940, 580, .9]], who=EXTRAS_PM + [Y(L, 'sitSmall', 'smile', id='YOU'), Mi(R, 'sitHands', 'neutral', id='MIRA_EVE')], chairs=CH_PM, clock='18:40', sleeve2='#f2c21a')
sh('L060', 'scene', **NT, hub=True, cam=two(), who=[Y(L, 'sitSmall', [[0, 'smile'], [.5, 'nervous']], id='YOU'), Mi(R, 'sitTalk', 'neutral', id='MIRA_EVE')], sleeve2='#f2c21a')
sh('L060:9', 'insert', **NT, ins='plate')
sh('L060:20', 'face', **NT, who='YOU', expr=[[0, 'joy'], [.5, 'flat']], side=1)
sh('L061', 'face', **NT, who='MIRA_EVE', expr='confused', side=-1, tilt=.08, look=[-.4, 0])
sh('L062', 'scene', **NT, hub=True, cam=two(), who=[Y(L, 'sitSmall', 'happy', id='YOU'), Mi(R, 'sitLean', 'worried', id='MIRA_EVE')], sleeve2='#f2c21a')
sh('L064', 'scene', fg='shoulder', fgSide=-1, fgCol='#3fb950', **NT, hub=True, cam=two([1150, 640, 1.8]), who=[Mi(R, 'sitHands', 'worried', id='MIRA_EVE')], sleeve2='#f2c21a')
sh('L065', 'face', **NT, who='MIRA_EVE', expr='sad', side=-1, look=[-.3, .3], push=.08)
sh('L067', 'scene', **NT, hub=True, cam=two([760, 620, 1.3]), who=[Y(L, [[0, 'sitSmall'], [.25, {'head': [-10, -178], 'sh': [-4, -146], 'hip': [0, -72], 'eF': [16, -110], 'hF': [38, -84], 'eB': [10, -110], 'hB': [30, -84], 'kF': [44, -74], 'fF': [46, 0], 'kB': [40, -72], 'fB': [38, 0]}], [.8, 'sitSmall']], 'confused', id='YOU', hf=[[0, 1], [.28, -1], [.75, 1]], look=[[0, [.3, 0]], [.28, [.6, 0]], [.75, [.3, .2]]])])
sh('L069', 'face', **NT, who='YOU', expr=[[0, 'surprised'], [.4, 'sad']], side=1, tear=.6)
sh('L070', 'topdown', bars='none')
sh('L071', 'insert', **NT, ins='napkin', n=23, tight=True, rules=23, blur=True)
sh('L073', 'scene', **NT, hub=True, cam=two(), who=[Y(L, 'sitSmall', 'sad', id='YOU'), Mi(R, 'sitLean', 'worried', id='MIRA_EVE')], napkin=1, sleeve2='#f2c21a')
sh('L075', 'insert', **NT, ins='slide')
sh('L076', 'face', **NT, who='YOU', expr='sad', side=1, push=.03)
sh('L077', 'scene', fg='shoulder', fgSide=-1, fgCol='#3fb950', **NT, hub=True, cam=two([1150, 640, 1.8]), who=[Mi(R, [[0, 'sitHands'], [.6, 'sitSad']], [[0, 'neutral'], [.55, 'sad']], id='MIRA_EVE', look=[-.2, .4])], napkin=1, sleeve2='#f2c21a')
sh('L079', 'face', **NT, who='YOU', expr='sad', side=1, look=[.2, .3], nod=True)
sh('L080', 'scene', **NT, hub=True, cam=two([1060, 640, 1.6]), who=[Y(L, 'sitSmall', 'sad', id='YOU'), Mi(R, 'sitSad', 'sad', id='MIRA_EVE')], thoughtX=1000, thoughtY=270, napkin=1, sleeve2='#f2c21a')
sh('L084', 'face', **NT, who='YOU', expr='sad', side=1, push=.08)
sh('L085', 'scene', **NT, hub=True, cam=two([860, 640, 1.7]), who=[Y(L, 'sitHands', 'pressed', id='YOU')], napkin=1, sleeve2='#f2c21a')
sh('L086', 'scene', **NT, hub=True, cam=two(), who=[Y(L, 'sitHands', 'worried', id='YOU'), Mi(R, 'sitSad', 'sad', id='MIRA_EVE')], napkin=1, sleeve2='#f2c21a')
sh('L087', 'insert', **NT, ins='reach')
sh('L089', 'scene', **NT, hub=True, cam=two([960, 640, 1.5]), who=[Y(L, [[0, 'sitReach'], [.5, 'sitHands']], 'sad', id='YOU'), Mi(R, 'sitSad', 'neutral', id='MIRA_EVE')], napkin=1, sleeve2='#f2c21a')
sh('L090', 'face', **NT, who='YOU', expr='sad', side=1)
sh('L091', 'scene', fg='shoulder', fgSide=-1, fgCol='#3fb950', **NT, hub=True, cam=two([1150, 640, 1.8]), who=[Mi(R, 'sitHands', [[0, 'neutral'], [.4, 'smile']], id='MIRA_EVE')], napkin=1, sleeve2='#f2c21a')
sh('L092', 'scene', set='cafe', so=dict(variant='night', hiss=1), hub=True, cam=[[700, 560, .78], [760, 560, .82]], who=EXTRAS_PM[:1] + [Y(L, 'sitHands', 'smile', id='YOU'), Mi(R, 'sitHands', 'neutral', id='MIRA_EVE'), dict(id='BARISTA', x=-470, pose=[[0, 'stand'], [.6, 'reach']], f=1, expr='surprised')], chairs=CH_PM[:1], napkin=1, sleeve2='#f2c21a')
sh('L094', 'scene', **NT, hub=True, cam=two(), who=[Y(L, 'sitHands', 'neutral', id='YOU'), Mi(R, 'sitHands', 'neutral', id='MIRA_EVE', look=[.3, .4])], napkin=1, sleeve2='#f2c21a')
sh('L096', 'scene', **NT, hub=True, cam=two([1060, 640, 1.6]), who=[Y(L, 'sitHands', 'smile', id='YOU'), Mi(R, 'sitHands', 'smile', id='MIRA_EVE')], napkin=1, thoughtX=990, thoughtY=280, sleeve2='#f2c21a')
sh('L097', 'face', **NT, who='YOU', expr=[[0, 'thinking'], [.7, 'smile']], side=1)
sh('L099', 'face', **NT, who='MIRA_EVE', expr=[[0, 'neutral'], [.5, 'smile']], side=-1, look=[-.4, -.05])
sh('L101', 'face', **NT, who='YOU', expr='smile', side=1)
sh('L102', 'scene', set='cafe', so=dict(variant='night', chairsUp=1), hub=True, cam=[[960, 580, .9], [960, 560, .78]], who=[Y(L, 'sitHands', 'smile', id='YOU'), Mi(R, 'sitHands', 'smile', id='MIRA_EVE'), dict(id='BARISTA', x=1740, pose=[[0, 'stand'], [.3, 'reach'], [.7, 'stand']], f=1, expr='neutral')], napkin=1, sleeve2='#f2c21a')
sh('L102:5', '3d', id3='t3night', night=True)
sh('L103', 'end', 'fade', bars='none', cap=False)

# ---- timing ----
lines_sorted = sorted(LINES.values(), key=lambda l: l['start'])
def anchor_time(a):
    if a.endswith('+'):  # in the gap after a line
        return LINES[a[:-1]]['end'] + .25
    return at(a)
shots = []
for i, s in enumerate(S):
    st = 0 if i == 0 else max(0, anchor_time(s['a']) - .15)
    shots.append([st, s])
shots.sort(key=lambda x: x[0])
dur = round(max(l['end'] for l in LINES.values()) + 2.5, 2)
out = []
for i, (st, s) in enumerate(shots):
    en = shots[i + 1][0] if i + 1 < len(shots) else dur
    p = s['p']; k = p.pop('k'); sfx = p.pop('sfx', [])
    sid = p.pop('id3', None) if k == '3d' else None
    o = dict(id=sid or f's{i + 1:03d}', start=round(st, 3), end=round(en, 3), line='', scene=k, bars=s['bars'],
             **{'in': {'type': s['tr'], 'dur': .4 if s['tr'] != 'cut' else 0}}, sfx=[{'at': a, 'name': n, 'gain': g} for a, n, g in sfx],
             captions=s['cap'], params=dict(k=k, **p))
    out.append(o)
# ---- sound: ambience per set, a shimmer on every thought, cues on the beats (DIRECTION.md sound column) ----
AMB = {'cafe': ('murmur', -27), 'office': ('hum', -30), 'canteen': ('murmur', -24), 'train': ('city', -24), 'bedroom': ('roomtone', -30)}
for o in out:
    st = o['params'].get('set'); 
    if o['params']['k'] == '3d': st = 'train' if 'train' in o['id'] else 'cafe'
    if st in AMB: o['amb'] = {'name': AMB[st][0], 'gain': AMB[st][1]}
    if o['params'].get('so', {}).get('variant') == 'night' and st == 'cafe': o['amb'] = {'name': 'roomtone', 'gain': -28}
    tr = o['in']['type']
    if tr == 'whip': o['sfx'].append({'at': 0, 'name': 'whoosh', 'gain': -10})
    if tr == 'flash' and o['params']['k'] != '3d': o['sfx'].append({'at': 0, 'name': 'freeze', 'gain': -7})
    if o['params'].get('rules'): o['sfx'].append({'at': .2, 'name': 'counter', 'gain': -16})
    if o['params'].get('clock'): o['sfx'].append({'at': .15, 'name': 'blip', 'gain': -18})
    ins = o['params'].get('ins')
    if ins == 'phone': o['sfx'].append({'at': .3, 'name': 'phonebuzz', 'gain': -10})
    if ins in ('cups', 'sleeve'): o['sfx'].append({'at': .2, 'name': 'tick', 'gain': -16})
    if ins == 'ear': o['sfx'].append({'at': .25, 'name': 'hit', 'gain': -14})
    if o['params'].get('readout'): o['sfx'].append({'at': .3, 'name': 'pop', 'gain': -14})
    if o['params']['k'] == 'blueprint': o['sfx'] += [{'at': .3, 'name': 'blip', 'gain': -14}, {'at': .9, 'name': 'pop', 'gain': -14}]
    if o['params']['k'] == 'topdown': o['sfx'].append({'at': .3, 'name': 'blip', 'gain': -16})
for l in LINES.values():
    if l['thought']:
        sfx_t = round(l['start'] - .25, 3); o = next(o for o in out if o['start'] <= sfx_t < o['end'])
        o['sfx'].append({'at': round(sfx_t - o['start'], 3), 'name': 'shimmer', 'gain': -17 if l['id'] not in ('L003', 'L066') else -12})
def cue(lid, name, gain, off=0):
    t = LINES[lid]['start'] + off; o = next(o for o in out if o['start'] <= t < o['end']); o['sfx'].append({'at': round(t - o['start'], 3), 'name': name, 'gain': gain})
cue('L066', 'heartbeat', -9, .9); cue('L005', 'ding', -16, .3); cue('L014', 'ding', -16, .2); cue('L047', 'ding', -18, .1); cue('L004', 'riser', -14, -.6)
cue('L009', 'tick', -12, .3); cue('L093', 'hit', -18, 1.6); cue('L026', 'pop', -12)
# unique ids for the 3D shots (the engine looks shots up by id): keep the registered id for the first use only
seen = set()
for o in out:
    if o['id'] in seen: o['id'] = o['id'] + '_b'
    seen.add(o['id'])
music = [dict(start=0, end=LINES['L005']['start'], mood='mystery', intensity=.35),
         dict(start=LINES['L005']['start'], end=LINES['L036']['start'], mood='playful', intensity=.45),
         dict(start=LINES['L036']['start'], end=LINES['L044']['start'], mood='tension', intensity=.35),
         dict(start=LINES['L044']['start'], end=LINES['L064']['end'], mood='sad', intensity=.25),
         dict(start=LINES['L091']['start'], end=dur, mood='calm', intensity=.3)]
story = dict(title='What If You Heard Every Thought About You… and Listened?', duration=dur, shots=out, music=music, sfx=[])
os.makedirs(os.path.join(EP, 'project/story'), exist_ok=True)
json.dump(story, open(os.path.join(EP, 'project/story/shots.json'), 'w'), indent=1)
lens = [o['end'] - o['start'] for o in out]; lens.sort()
print(f"{len(out)} shots, {dur:.1f} s, median {lens[len(lens) // 2]:.2f} s, max {lens[-1]:.2f} s, min {lens[0]:.2f} s")
for o in out:
    if o['end'] - o['start'] > 6 or o['end'] - o['start'] < .7: print('  check', o['id'], o['params']['k'], round(o['end'] - o['start'], 2))
