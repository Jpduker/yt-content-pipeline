"""v3.2: append the sign-off / subscribe ending to a project (idempotent: replaces an existing one).
usage: add_outro.py <project_dir> [variant] [seconds] ["sign-off line"]
Defaults (Vivek 17 Nov): 9:16 Shorts -> 'iris' 3.4 s; 16:9 long-forms -> rotate 'silent' / 'button' / 'ident' by date (B, C, D), 10 s
(long enough for YouTube's end-screen elements, which Vivek adds in Studio over the last 10 s)."""
import sys, os, json, re, datetime
P = sys.argv[1].rstrip('/'); A = sys.argv[2:]
cfg = json.load(open(f'{P}/config.json')); vert = cfg.get('aspect') == '9:16'
m = re.search(r'(\d{4}-\d{2}-\d{2})', os.path.abspath(P)); day = datetime.date.fromisoformat(m.group(1)) if m else datetime.date.today()
v = A[0] if len(A) > 0 else ('iris' if vert else ['silent', 'button', 'ident'][day.toordinal() % 3])
secs = float(A[1]) if len(A) > 1 else (3.4 if vert else 10.0)
line = A[2] if len(A) > 2 else {'iris': 'See you between the ifs!', 'button': 'New what if every day'}.get(v)
S = json.load(open(f'{P}/story/shots.json'))
old = [s for s in S['shots'] if s['id'] == 'sOUT']
if old: S['shots'] = [s for s in S['shots'] if s['id'] != 'sOUT']; S['duration'] = old[0]['start']
st = round(float(S['duration']), 3)
if vert and st + secs > 59.8: secs = max(2.6, 59.8 - st)   # Shorts stay under 60 s
en = round(st + secs, 3)
tr = {'iris': {'type': 'cut', 'dur': 0}, 'silent': {'type': 'dipWhite', 'dur': .5}, 'button': {'type': 'push', 'dur': .45}, 'ident': {'type': 'bands', 'dur': .5}}[v]
sfx = {'iris': [('swish', 1.9, -12), ('ding', 3.0, -14)], 'silent': [('shimmer', .2, -18), ('ding', 2.8, -16)], 'button': [('step', .3, -16), ('click' if False else 'pop', 1.6, -8), ('ding', 2.0, -10), ('pop', 2.6, -12)], 'ident': [('hit', .3, -8), ('hit', .65, -9), ('swish', 1.2, -16)]}[v]
S['shots'].append(dict(id='sOUT', start=st, end=en, line='', scene='outro', bars='none', **{'in': tr}, sfx=[{'at': a, 'name': n, 'gain': g} for n, a, g in sfx], captions=False,
                       params=dict(k='outro', v=v, line=line, slots=False)))
S['duration'] = en
for mm in S.get('music', []):
    if mm['end'] >= st - .01: mm['end'] = en
json.dump(S, open(f'{P}/story/shots.json', 'w'), indent=1); cfg['duration'] = en; json.dump(cfg, open(f'{P}/config.json', 'w'), indent=1)
print(f'outro {v} {secs}s -> {P} (now {en:.1f}s)')
