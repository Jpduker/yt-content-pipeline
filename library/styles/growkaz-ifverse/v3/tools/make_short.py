"""growkaz-ifverse v3: cut a 9:16 Short from a finished episode. The 16:9 stage is re-framed per shot (gen.js `stage`), captions are laid out for vertical.
Usage: python3 make_short.py <episode> <N> "<title>" L001-L011 [L012-L014 ...]     (each range = first line .. last line; cuts snap to shot boundaries)
Writes <episode>/short-N/ (a full kit project: scenes, config 9:16, timeline, voice slice, shots.json) ending on a 2.2 s "Full story on the channel" card."""
import sys, os, json, shutil
import numpy as np, soundfile as sf
EP, N, TITLE, RANGES = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
P = os.path.join(EP, 'project'); OUT = os.path.join(EP, f'short-{N}'); CARD = 2.2
ST = json.load(open(P + '/story/shots.json')); LINES = json.load(open(P + '/timeline/lines.json')); WALL = json.load(open(P + '/timeline/words_all.json'))
LID = {l['id']: l for l in LINES}; shots = ST['shots']
def shot_at(t): return next(s for s in shots if s['start'] <= t < s['end'])
segs = []
for r in RANGES:
    a, b = r.split('-'); t0 = shot_at(LID[a]['start'])['start']; t1 = shot_at(LID[b]['end'] - .02)['end']
    nxt = [l for l in LINES if l['start'] > LID[b]['end']]
    if nxt and nxt[0]['start'] < t1: t1 = shot_at(LID[b]['end'] - .02)['end']
    segs.append((t0, t1))
off, acc = [], 0.0
for t0, t1 in segs: off.append(acc - t0); acc += t1 - t0
dur = round(acc + CARD, 3)
def mapt(t):
    for (t0, t1), o in zip(segs, off):
        if t0 - 1e-6 <= t <= t1 + 1e-6: return round(t + o, 3)
    return None
if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT + '/story'); os.makedirs(OUT + '/timeline'); os.makedirs(OUT + '/input')
lib = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../project/scenes'); shutil.copytree(lib, OUT + '/scenes')
out = []
for s in shots:
    m0, m1 = mapt(s['start']), mapt(s['end'])
    if m0 is None or m1 is None or m1 <= m0 or s['scene'] in ('title', 'end'): continue
    q = json.loads(json.dumps(s)); q['start'], q['end'] = m0, m1; q['bars'] = 'none'; q['params'].pop('clock', None)
    if q['in']['type'] in ('dip', 'fade') and out: q['in'] = {'type': 'cut', 'dur': 0}
    out.append(q)
out[0]['in'] = {'type': 'cut', 'dur': 0}; out[0]['params']['motif'] = next((s['params']['motif'] for s in shots if s['params'].get('motif')), 'echo')
words = TITLE.split(); mid = len(words) // 2
out.append(dict(id='sEnd', start=round(acc, 3), end=dur, line='', scene='shortEnd', bars='none', **{'in': {'type': 'dip', 'dur': .3}}, sfx=[{'at': .1, 'name': 'stinger', 'gain': -12}], captions=False,
                params=dict(k='shortEnd', lines=[' '.join(words[:mid]), ' '.join(words[mid:])])))
mus = []
for m in ST.get('music', []):
    for (t0, t1), o in zip(segs, off):
        a, b = max(m['start'], t0), min(m['end'], t1)
        if b - a > .5: mus.append(dict(start=round(a + o, 2), end=round(b + o, 2), mood=m['mood'], intensity=m['intensity']))
mus.sort(key=lambda m: m['start'])
if mus: mus[-1]['end'] = dur
json.dump(dict(title=TITLE, duration=dur, shots=out, music=mus, sfx=[]), open(OUT + '/story/shots.json', 'w'), indent=1)
L2 = [dict(l, start=mapt(l['start']), end=mapt(l['end'])) for l in LINES if mapt(l['start']) is not None and mapt(l['end']) is not None]
W2 = [dict(w, t0=mapt(w['t0']), t1=mapt(w['t1'])) for w in WALL if mapt(w['t0']) is not None and mapt(w['t1']) is not None]
json.dump(L2, open(OUT + '/timeline/lines.json', 'w'), indent=1); json.dump(W2, open(OUT + '/timeline/words_all.json', 'w'))
json.dump({'words': [{'word': w['w'], 'start': w['t0'], 'end': w['t1']} for w in W2 if not w['thought']]}, open(OUT + '/timeline/words.json', 'w'))
a, sr = sf.read(P + '/input/voiceover.wav', dtype='float32'); parts = []
for t0, t1 in segs:
    x = a[int(t0 * sr):int(t1 * sr)].copy(); n = int(.02 * sr); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n); parts.append(x)
parts.append(np.zeros(int(CARD * sr), 'float32')); vo = np.concatenate(parts)[:int(dur * sr)]; sf.write(OUT + '/input/voiceover.wav', vo, sr)
cfg = json.load(open(P + '/config.json')); cfg.update(title=TITLE, aspect='9:16', duration=dur, bars='none', fadeIn=.15, fadeOut=.3); json.dump(cfg, open(OUT + '/config.json', 'w'), indent=1)
print(f'short-{N}: {dur:.1f} s · {len(out)} shots · segments {[(round(a, 1), round(b, 1)) for a, b in segs]}')
