"""growkaz-ifverse v3: shot list as data -> project/story/shots.json, timed to the real voice (timeline/lines.json + words_all.json).
An episode's story/build_story.py does:  from story_lib import *;  sh(...) for every shot;  finish(title=..., music=[...], cues=[...])
Anchors: 'L016' (line start) · 'L032:6' (7th word) · 'L004+' (0.25 s after the line) · 'L004+1.2' / 'L010-0.8' (offset from line end / start).
Time-keyed sequences: any [[key, value], ...] whose key is an anchor string is converted to a fraction of the shot; expressions get a 0.3 s lead
(the face changes BEFORE the line that motivates it, HANDOFF §6)."""
import sys, os, json, re
EP = sys.argv[1]; TL = os.path.join(EP, 'project/timeline')
LINES = {l['id']: l for l in json.load(open(os.path.join(TL, 'lines.json')))}
WALL = json.load(open(os.path.join(TL, 'words_all.json')))
def at(a):
    m = re.match(r'^(L\d+)(?::(\d+)|([+-])([\d.]*))?$', a); lid = m.group(1)
    if m.group(2) is not None: return [w for w in WALL if w['line'] == lid][int(m.group(2))]['t0']
    if m.group(3) == '+': return LINES[lid]['end'] + float(m.group(4) or .25)
    if m.group(3) == '-': return LINES[lid]['start'] - float(m.group(4) or .25)
    return LINES[lid]['start']
def first(tag, text):   # find a line id by speaker + first words (keeps shot lists readable and robust to renumbering)
    for l in sorted(LINES.values(), key=lambda l: l['id']):
        if l['tag'] + ('-T' if l['thought'] else '') == tag and l['text'].lower().startswith(text.lower()): return l['id']
    raise KeyError((tag, text))
L, R, CX = 750, 1170, 960
def who(id, x, pose='stand', expr='neutral', f=1, **k): return dict(id=id, x=x, pose=pose, expr=expr, f=f, **k)
def Y(x, pose='sitHands', expr='neutral', f=1, id='YOU', **k): return who(id, x, pose, expr, f, **k)
def Mi(x, pose='sitHands', expr='neutral', f=-1, id='MIRA', **k): return who(id, x, pose, expr, f, seed=2, **k)
def two(c=(960, 640, 1.35), d=(-20, 0, .05)): return [list(c), [c[0] + d[0], c[1] + d[1], c[2] + d[2]]]
def push(c, dz=.14, dx=0, dy=0): return [list(c), [c[0] + dx, c[1] + dy, c[2] + dz]]          # slow push-in for emotional beats
def num(v, hot=3, **k): return dict(k='num', v=v, hot=hot, **k)
def tear(v=1, **k): return dict(k='tear', v=v, **k)
S = []
def sh(a, k, tr='cut', bars=None, cap=True, **p): S.append(dict(a=a, tr=tr, bars=bars, cap=cap, p=dict(k=k, **p)))
AMB = {'cafe': ('murmur', -27), 'office': ('hum', -30), 'canteen': ('murmur', -24), 'train': ('city', -24), 'bedroom': ('roomtone', -30),
       'street': ('city', -26), 'hall': ('roomtone', -29), 'platform': ('city', -23), 'lift': ('hum', -27)}
def _conv(seq, st, en, lead=0.0):
    if isinstance(seq, list) and seq and isinstance(seq[0], (list, tuple)) and any(isinstance(x[0], str) for x in seq):
        out = [[0 if not isinstance(x[0], str) and x[0] == 0 else (max(0, min(.999, (at(x[0]) - lead - st) / (en - st))) if isinstance(x[0], str) else x[0]), x[1]] for x in seq]
        out.sort(key=lambda x: x[0]); return out
    return seq
def finish(title, music, cues=(), motif='echo', tail=2.6):
    shots = []
    for i, s in enumerate(S):
        an = at(s['a']); st = 0 if i == 0 else max(0, an - .15)
        for w in WALL:   # never cut inside a spoken word
            if w['t0'] + .02 < st < w['t1'] - .02 and w['t1'] <= an + .001: st = w['t1'] + .01
        shots.append([st, s])
    shots.sort(key=lambda x: x[0])
    dur = round(max(l['end'] for l in LINES.values()) + tail, 2); out = []
    for i, (st, s) in enumerate(shots):
        en = shots[i + 1][0] if i + 1 < len(shots) else dur
        p = dict(s['p']); k = p.pop('k'); sfx = p.pop('sfx', []); sid = p.pop('id3', None) if k == '3d' else None
        for key in ('expr', 'look', 'pose'):
            if key in p: p[key] = _conv(p[key], st, en, .3 if key == 'expr' else .1)
        if isinstance(p.get('badge'), dict): p['badge'] = dict(p['badge'], v=_conv(p['badge']['v'], st, en))
        for w in p.get('who', []) if isinstance(p.get('who'), list) else []:
            for key in ('expr', 'look', 'pose', 'f', 'hf'):
                if key in w: w[key] = _conv(w[key], st, en, .3 if key == 'expr' else .1)
            if isinstance(w.get('badge'), dict): w['badge'] = dict(w['badge'], v=_conv(w['badge']['v'], st, en))
        if 'delA' in p: p['delT'] = round(at(p.pop('delA')), 3)
        for b in [p.get('badge')] + [w.get('badge') for w in (p.get('who') if isinstance(p.get('who'), list) else [])]:
            if isinstance(b, dict) and 'atA' in b: b['at'] = round(max(0, at(b.pop('atA')) - st), 3)
        if i == 0: p['motif'] = motif
        out.append(dict(id=sid or f's{i + 1:03d}', start=round(st, 3), end=round(en, 3), line='', scene=k, bars=s['bars'],
                        **{'in': {'type': s['tr'], 'dur': .4 if s['tr'] != 'cut' else 0}}, sfx=[{'at': a, 'name': n, 'gain': g} for a, n, g in sfx], captions=s['cap'], params=dict(k=k, **p)))
    def shot_at(t): return next((o for o in out if o['start'] <= t < o['end']), out[-1])
    for o in out:
        p = o['params']; st = p.get('set')
        if st in AMB: o['amb'] = {'name': AMB[st][0], 'gain': AMB[st][1]}
        tr = o['in']['type']
        if tr == 'whip': o['sfx'].append({'at': 0, 'name': 'whoosh', 'gain': -10})
        if tr == 'flash': o['sfx'].append({'at': 0, 'name': 'flash', 'gain': -12})
        if p.get('clock'): o['sfx'].append({'at': .15, 'name': 'blip', 'gain': -18})
        ins = p.get('ins')
        if ins in ('real',): o['sfx'].append({'at': p.get('at', .5), 'name': 'phonebuzz', 'gain': -10})
        if ins in ('pile',) and p.get('count'): o['sfx'].append({'at': .2, 'name': 'counter', 'gain': -17})
        if ins in ('coins',): o['sfx'] += [{'at': .1, 'name': 'counter', 'gain': -15}]
        if ins in ('boxes', 'wallet', 'cake', 'coffee', 'mug'): o['sfx'].append({'at': .25, 'name': 'tick', 'gain': -15})
        if ins == 'drums': o['sfx'] += [{'at': .1 + .35 * k, 'name': 'kick', 'gain': -11} for k in range(5)]
        if ins == 'shelf': o['sfx'].append({'at': o['end'] - o['start'] - 1.2 if o['end'] - o['start'] > 1.6 else .4, 'name': 'pop', 'gain': -13})
        if p.get('k') == 'title' or o['scene'] == 'title': o['sfx'].append({'at': 0, 'name': 'stinger', 'gain': -8})
    for l in LINES.values():
        if l['thought']:
            o = shot_at(l['start'] - .2); o['sfx'].append({'at': round(max(0, l['start'] - .2 - o['start']), 3), 'name': 'shimmer' if motif == 'echo' else 'blip', 'gain': -20})
            if motif == 'ghost':
                for w in [w for w in WALL if w['line'] == l['id']]:
                    o2 = shot_at(w['t0']); o2['sfx'].append({'at': round(w['t0'] - o2['start'], 3), 'name': 'tick', 'gain': -21})
                o3 = shot_at(l['end'] + .9); o3['sfx'].append({'at': round(l['end'] + .9 - o3['start'], 3), 'name': 'swish', 'gain': -19})
    for a, name, gain in cues:
        t = at(a); o = shot_at(t); o['sfx'].append({'at': round(t - o['start'], 3), 'name': name, 'gain': gain})
    mus = [dict(start=round(at(a) if isinstance(a, str) else a, 2), end=round(dur if b is None else (at(b) if isinstance(b, str) else b), 2), mood=m, intensity=i) for a, b, m, i in music]
    os.makedirs(os.path.join(EP, 'project/story'), exist_ok=True)
    json.dump(dict(title=title, duration=dur, shots=out, music=mus, sfx=[]), open(os.path.join(EP, 'project/story/shots.json'), 'w'), indent=1)
    cfgp = os.path.join(EP, 'project/config.json'); cfg = json.load(open(cfgp)); cfg['title'] = title; cfg['duration'] = dur; json.dump(cfg, open(cfgp, 'w'), indent=1)
    lens = sorted(o['end'] - o['start'] for o in out); faces = sum(1 for o in out if o['scene'] == 'face' or (o['params'].get('cam') and o['params']['cam'][0][2] >= 1.8))
    print(f"{len(out)} shots · {dur:.1f} s · median {lens[len(lens) // 2]:.2f} s · max {lens[-1]:.2f} s · min {lens[0]:.2f} s · close-ups/mediums {faces}")
    for o in out:
        d = o['end'] - o['start']
        if d > 6.5 or d < .6: print('  check', o['id'], o['scene'], round(d, 2), round(o['start'], 1))
