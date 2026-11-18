#!/usr/bin/env python3
"""Island mix: original sampler score (ours) + per-time-of-day ambience + events from timeline.json + Kokoro voices → out/mix.wav
Usage (from the lemo-opuscar root, its .venv): tools/mix.py <short_dir>"""
import sys, os, json, numpy as np, soundfile as sf, librosa
from scipy.ndimage import uniform_filter1d
D = os.path.abspath(sys.argv[1]); LIB = os.getcwd()
sys.path.insert(0, LIB); sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *
from core.audio import sampler as S
TL = json.load(open(os.path.join(D, 'timeline.json'))); DUR = round(TL['DUR'], 2); N = int(round(DUR * SR)); tt = np.arange(N) / SR
_noise, _brown = noise, brown
def noise(d): return _noise(d)[:N] if abs(d - DUR) < 1e-6 else _noise(d)
def brown(d): return _brown(d)[:N] if abs(d - DUR) < 1e-6 else _brown(d)
rng = np.random.default_rng(7)
def curve(keys):
    k = sorted(keys); k = np.array(k, float); return np.interp(tt, k[:, 0], k[:, 1])
def stereo(x, pan=0.0): l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.414, x * r * 1.414], 1)
def place(buf, x, t, pan=0.0, g=1.0):
    s = int(t * SR); x = stereo(x, pan) if x.ndim == 1 else x
    if s >= len(buf) or s < 0: return
    n = min(len(x), len(buf) - s); buf[s:s + n] += x[:n] * g
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
shots = TL['shots']

# —— Events collected from the timeline (absolute times) ——
lamp_out, flickers, flashes, horns, misc = [], [], [], [], []
for sh in shots:
    L = sh.get('lamp'); a = sh['a']
    if isinstance(L, dict):
        if L.get('flicker') is not None: flickers.append(a + L['flicker']); lamp_out.append(a + L['flicker'] + L.get('len', .8))
        if L.get('out') is not None: lamp_out.append(a + L['out'])
    for e in sh.get('events', []):
        if e['kind'] == 'flash': flashes.append(a + e['t'])
        elif e['kind'] == 'horn': horns.append(a + e['t'])
        else: misc.append((a + e['t'], e['kind']))

# —— Beds by time of day, crossfaded per shot ——
def gate(tm):
    keys = [(0, 0)]
    for sh in shots:
        v = 1.0 if sh.get('time', 'night') == tm else 0.0
        keys += [(sh['a'], v), (sh['b'] - .3, v)]
    return curve(keys + [(DUR, 0)])
night, day, dusk, storm, dawn = gate('night'), gate('day'), gate('dusk'), gate('storm'), gate('dawn')
cave = gate('cave')
drips = np.zeros(N)
for t0 in np.arange(.3, DUR, .9):
    tt0 = t0 + rng.uniform(0, .7); s = int(tt0 * SR); d = int(.12 * SR)
    if s + d < N: x = np.arange(d) / SR; drips[s:s + d] += np.sin(2 * np.pi * rng.uniform(900, 1600) * x * (1 + 2 * x)) * np.exp(-x / .025) * rng.uniform(.15, .4)
# distance to the sea: map shots hear the sea big, the headland hears it below, the village hears boats
waves = lp(brown(DUR), 650) * (.45 + .55 * np.sin(2 * np.pi * .1 * tt + 1) ** 4) + hp(lp(noise(DUR), 3500), 600) * .1 * (.3 + .7 * np.sin(2 * np.pi * .1 * tt + .6) ** 6)
waves *= .4
windN = bp(noise(DUR), 180, 1100) * (.55 + .45 * np.sin(2 * np.pi * .27 * tt) ** 2) * .4
crick = np.zeros(N)
for f, rate, ph in [(4300, 17, 0), (5100, 21, 1.3)]: crick += np.sin(2 * np.pi * f * tt) * (np.sin(2 * np.pi * rate * tt + ph) > .55) * (np.sin(2 * np.pi * .7 * tt + ph * 2) > -.2) * .05
gullB = np.zeros((N, 2))
def gull(v=1.0):
    d = .55; x = t_(d); f = 1500 + 900 * np.sin(np.pi * x / d) ** 2 * (1 - x / d); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + .5 * np.sin(2 * np.pi * 38 * x))
    return norm(bp(s, 900, 4000) * np.exp(-x / .3) * np.minimum(1, x / .04)) * v
for t0 in np.arange(1.5, DUR, 4.3): place(gullB, gull(.5), t0 + rng.uniform(-.8, .8), pan=rng.uniform(-.7, .7))
for t0 in np.arange(2.8, DUR, 5.1): place(gullB, gull(.35), t0 + rng.uniform(-.5, .5), pan=rng.uniform(-.7, .7))
rainB = (hp(lp(noise(DUR), 8000), 400) * .3 + bp(brown(DUR), 150, 900) * .35)
hum = (np.sin(2 * np.pi * 48 * tt) * .5 + np.sin(2 * np.pi * 96 * tt) * .2) * .35
# the lamp's clockwork hum lives in shots whose camera is near the tower at night and the lamp is on
humG = curve([(0, 0)] + sum([[(sh['a'], 1 if (sh.get('time', 'night') in ('night', 'dusk', 'storm') and sh.get('cam', {}).get('type') in ('stage', 'dive', 'orbit') and 'gus' in (sh.get('cast') or {}) and abs((sh['cast']['gus'].get('at') or [0, 0])[0] - 21) < 10 and abs((sh['cast']['gus'].get('at') or [0, 0])[1] + 24) < 10) else 0), (sh['b'] - .2, 0)] for sh in shots], []) + [(DUR, 0)])
for t0 in lamp_out: humG *= 1 - (tt > t0)   # dies with the lamp
amb = stereo(waves * (night * .8 + day * .6 + dusk * .7 + storm * .9 + dawn * .7), -.25) + stereo(np.roll(waves, 7919) * (night * .8 + day * .6 + dusk * .7 + storm * .9 + dawn * .7), .25) \
    + stereo(windN * (night + storm * 1.8 + dusk * .6 + dawn * .5 + day * .3), -.5) + stereo(np.roll(windN, 9001) * (night + storm * 1.8 + dusk * .6 + dawn * .5 + day * .3), .5) \
    + gullB * (day * 1.0 + dawn * .6 + dusk * .3)[:, None] + stereo(crick * (dusk + night * .4), .3) \
    + stereo(lp(waves, 300) * 1.4 * cave, -.1) + stereo(drips * cave, .4) + stereo(np.roll(drips, 7001) * cave, -.4) + stereo(rainB * .8 * storm, -.35) + stereo(np.roll(rainB, 4801) * .8 * storm, .35) + stereo(hum * humG, -.1)

# —— Foley and events ——
fx = np.zeros((N, 2))
def fwoomp(v=1.0, d=1.4):
    x = t_(d); return norm(lp(noise(d), 500) * np.exp(-x / .25) * np.sin(np.pi * np.minimum(x / .08, 1) / 2) + np.sin(2 * np.pi * 55 * x * (1 - .4 * x)) * np.exp(-x / .35) * .7) * v
def chime(v=1.0, f=1568):
    d = 1.4; x = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * m * x) * np.exp(-x / tau) for m, a, tau in [(1, 1, .5), (2.01, .35, .3), (3, .15, .2)])) * v
def thunder(v=1.0, d=3.5):
    x = t_(d); crack = hp(noise(d), 1500) * np.exp(-x / .08) * .6; body = lp(brown(d), 180) * np.exp(-x / 1.1) * np.minimum(1, x / .12); rum = lp(noise(d), 90) * np.exp(-x / 1.6) * 2
    return norm(crack + body + rum) * v
def horn(v=1.0, d=2.6):   # a ship's foghorn: two low partials, slow swell
    x = t_(d); e = np.minimum(1, x / .35) * np.minimum(1, (d - x) / .5); s = np.sin(2 * np.pi * 92 * x) + .6 * np.sin(2 * np.pi * 184 * x + .3) + .25 * np.sin(2 * np.pi * 276 * x)
    return norm(lp(s * e * (1 + .08 * np.sin(2 * np.pi * 5.5 * x)), 900)) * v
def stepSoft(v=1.0, kind='dirt'):
    d = .09; x = t_(d)
    if kind == 'dirt': return norm(lp(noise(d), 1400) * np.exp(-x / .02) + np.sin(2 * np.pi * 120 * x) * np.exp(-x / .015) * .4) * v
    if kind == 'stone': return norm(bp(noise(d), 900, 5000) * np.exp(-x / .012) + np.sin(2 * np.pi * 300 * x) * np.exp(-x / .01) * .3) * v
    return norm(bp(noise(d), 400, 2500) * np.exp(-x / .018) + np.sin(2 * np.pi * 180 * x) * np.exp(-x / .02) * .5) * v
def lockClick(v=1.0):
    d = .3; x = t_(d); return norm(bp(noise(d), 2000, 7000) * np.exp(-x / .01) + np.sin(2 * np.pi * 1800 * x) * np.exp(-x / .04) * .5 + np.sin(2 * np.pi * 240 * x) * np.exp(-x / .08) * .4) * v
for t0 in flickers: place(fx, click(.6, .35), t0, pan=.2); place(fx, click(.5, .3), t0 + .32, pan=.2)
for t0 in lamp_out: place(fx, fwoomp(.6), t0, pan=.1); place(fx, heartbeat(.22), t0 + 1.1); place(fx, heartbeat(.18), t0 + 2.1)
for t0 in flashes: place(fx, thunder(.6), t0 + .25 + rng.uniform(0, .4))
for t0 in horns: place(fx, horn(.7), t0, pan=rng.uniform(-.4, .4))
for t0, k in misc:
    if k == 'creak': place(fx, creak(.35), t0, pan=-.2)
    elif k == 'lock': place(fx, lockClick(.5), t0)
    elif k == 'thump': place(fx, thump(.5), t0)
    elif k == 'whoosh': place(fx, whoosh(.9, .7), t0)
    elif k == 'bell': place(fx, ding(.3), t0)
    elif k == 'splash': place(fx, lp(noise(.6), 2500) * np.exp(-t_(.6) / .18) * .5, t0)
    elif k == 'sneeze':   # a mouse-sized sneeze: a short breathy inhale, then a bright 'tchi'
        inh = bp(noise(.35), 1800, 5000) * np.linspace(0, 1, int(.35 * SR)) ** 2 * .18; place(fx, inh, t0 - .38)
        place(fx, (bp(noise(.16), 3000, 9000) * np.exp(-t_(.16) / .035) + np.sin(2 * np.pi * 1400 * t_(.16)) * np.exp(-t_(.16) / .02) * .3) * .55, t0)
    elif k == 'squeak': place(fx, np.sin(2 * np.pi * (2600 + 900 * t_(.12) / .12) * t_(.12)) * np.exp(-t_(.12) / .04) * .25, t0)
    elif k == 'tick': place(fx, click(.35, .25), t0, pan=.3)
    elif k == 'chain': [place(fx, click(.18, .2), t0 + i * .11 + rng.uniform(0, .03), pan=-.2) for i in range(6)]
    elif k == 'match': place(fx, hp(noise(.12), 2500) * np.exp(-t_(.12) / .03) * .6, t0)
# steps for walking humans (gus, dunn, stranger): 2 steps per second-ish, on the surface under them
def surf(x, z):
    if (x + 4.5) ** 2 + (z - 34) ** 2 < 60: return 'wood'
    if abs(z + 11) < 1.3 and -6 < x < 16: return 'dirt'
    return 'stone' if ((x - 21) ** 2 + (z + 24) ** 2 < 70 or (x - 4) ** 2 + (z + 6) ** 2 > 400) else 'dirt'
for sh in shots:
    for who, spec in (sh.get('cast') or {}).items():
        if who not in ('gus', 'dunn', 'stranger') or not spec.get('to'): continue
        w0, w1 = spec.get('walk') or [0, sh['b'] - sh['a']]; a = sh['a']
        for k, t0 in enumerate(np.arange(a + w0 + .15, a + w1, .47)):
            u = (t0 - a - w0) / max(.01, w1 - w0); x = spec['at'][0] + (spec['to'][0] - spec['at'][0]) * u; z = spec['at'][1] + (spec['to'][1] - spec['at'][1]) * u
            place(fx, stepSoft(.26 if who == 'gus' else .2, surf(x, z)), t0, pan=float(np.clip(k % 2 * .3 - .15, -.4, .4)))
# a soft chime when a dialogue box opens
for sh in shots:
    for v in sh['vo']:
        if v.get('dlg'): place(fx, chime(.16), v['t'] - .25)

# —— Voices ——
VO = [v for sh in shots for v in sh['vo']]
L = { l['id']: l for l in json.load(open(os.path.join(D, 'lines.json'))) }
vo = np.zeros((N, 2)); vmask = np.zeros(N)
for v in VO:
    y, sr = sf.read(os.path.join(D, 'voices', v['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = librosa.resample(y, orig_sr=sr, target_sr=SR); y = compress(norm(y, .9), thr=.25, ratio=3.2)
    act = np.abs(y) > .02 * np.abs(y).max(); y = y * (10 ** (-20 / 20)) / (np.sqrt(np.mean(y[act] ** 2)) + 1e-9)
    if v.get('dlg'): y = lp(y, 7000) * 1.05   # characters sit "in the world"
    place(vo, y, v['t']); s = int(v['t'] * SR); vmask[s:s + len(y)] = 1

# —— Score: an original cue per Short on sampled instruments (ours). A minor, 60 bpm; mood from short.json.music ——
MOOD0 = TL.get('music', {}).get('mood', 'mystery')
def mood_at(t): s = next((s for s in shots if s['a'] <= t < s['b']), shots[-1]); return s.get('mood') or MOOD0
mood = MOOD0
CH = [['A2', 'E3', 'A3', 'C4', 'E4'], ['F2', 'C3', 'F3', 'A3', 'C4'], ['D2', 'A2', 'D3', 'F3', 'A3'], ['E2', 'B2', 'E3', 'G#3', 'B3']]
ev = []; bar = 0; t = .2
while t < (TL.get('outroAt') or DUR) - .5:
    mood = mood_at(t + .1); ch = CH[bar % 4]; top = ch[2:]
    ev.append((t, 'cellos', ch[0], 4.2, .42 if mood != 'day' else .3, .15))
    if mood in ('mystery', 'dread', 'dusk'):
        for k in range(8): ev.append((t + k * .5, 'harp', [ch[2], ch[3], ch[4], ch[3]][k % 4], .9, .32 + .06 * (k % 2 == 0), -.35 + .1 * (k % 3)))
        if bar % 2 == 1: ev.append((t + 1.0, 'violins', top[bar % 3], 3.0, .22 if mood == 'mystery' else .3, .3))
        if mood == 'dread': ev.append((t, 'violins_trem', ch[1], 4.0, .18, -.2))
        if mood == 'dusk' and bar % 2 == 0: ev.append((t + .5, 'oboe', top[(bar // 2) % 3], 2.6, .22, .25))
    elif mood == 'day':
        for k in range(4): ev.append((t + k * 1.0, 'guitar_nylon', [ch[2], ch[4], ch[3], ch[4]][k], 1.2, .3, -.3))
        ev.append((t + .5, 'flute', top[(bar + 1) % 3], 1.6, .24, .25)); ev.append((t + 2.5, 'glockenspiel', top[(bar + 2) % 3], 1.0, .2, .35))
    elif mood == 'tense':
        ev.append((t, 'violins_trem', ch[3], 4.0, .26, .2)); ev.append((t, 'violas', ch[1], 4.0, .22, -.2))
        for k in range(8): ev.append((t + k * .5, 'cellos_pizz', ch[0] if k % 2 == 0 else ch[1], .4, .3, -.1))
        if bar % 2 == 1: ev.append((t + 2.0, 'timpani', 'A1', 1.5, .3, 0))
    t += 4.0; bar += 1
if not os.environ.get('NODING'): ev.append((.25, 'glockenspiel', 'A5', 1.6, .35, 0)); ev.append((.25, 'harp', 'A4', 1.6, .4, -.2))   # the hook ding
OA = TL.get('outroAt') or DUR   # the question's held chord ends where the outro starts
if TL.get('askAt'): ev.append((TL['askAt'], 'timpani', 'A1', 2.0, .45, 0)); ev.append((TL['askAt'], 'violins_trem', 'E4', OA - TL['askAt'] + .3, .3, .2)); ev.append((TL['askAt'] + .02, 'cellos', 'A2', OA - TL['askAt'] + .3, .4, -.1))
OUTRO_HITS = { 'lamp': [(1.0, 'E6'), (1.35, 'A5'), (1.7, 'C#6')], 'mabel': [(2.5, 'A5'), (2.95, 'E6')], 'log': [(2.25, 'stamp'), (2.75, 'E6')] }
if TL.get('outroAt'):   # the resolution: A minor question -> A major answer (harp arpeggio, warm strings), glock pings on each button, a soft low horn at the end
    o = OA; R = DUR - o
    for k, p in enumerate(['A3', 'C#4', 'E4', 'A4', 'C#5']): ev.append((o + .08 + k * .11, 'harp', p, R, .38, -.3 + k * .15))
    ev.append((o, 'cellos', 'A2', R, .34, -.1)); ev.append((o, 'violas', 'C#4', R, .22, .1)); ev.append((o, 'violins', 'E4', R, .2, .25)); ev.append((o + .05, 'timpani', 'A1', 2.0, .3, 0))
    for dt, p in OUTRO_HITS.get(TL.get('outro'), []):
        if p == 'stamp': ev.append((o + dt, 'timpani', 'E1', 1.4, .6, 0))
        else: ev.append((o + dt, 'glockenspiel', p, 1.4, .34, .15))
mus = S.render(ev, dur=DUR + .5)[:N]
mus = S.room(mus, size=.45, mix=.16)[:N]
# the music stops dead when the lamp dies, and creeps back after 2.4 s on the cello alone
for t0 in lamp_out:
    s = int(t0 * SR); e = int((t0 + 2.4) * SR); f = int(.03 * SR)
    if s < N: mus[s:min(N, e)] *= 0; mus[max(0, s - f):s] *= np.linspace(1, 0, min(f, s))[:, None] if s >= f else 1
    if e < N: mus[e:] *= np.minimum(1, (tt[e:] - t0 - 2.4) / 1.5)[:, None] * .75

# —— Levels, ducking, master ——
def lvl(x, db): r = np.sqrt(np.mean(x[np.abs(x).sum(1) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1; return x * (10 ** (db / 20)) / (r + 1e-9)
voS = lvl(vo, -17); musS = lvl(mus, -22); ambS = lvl(amb, -30); fxS = lvl(fx, -27)
# Sidechain ducking (2026-11-18 audio audit: words were only 1-8 dB above the bed): in 20 ms frames, the bed is pulled down so the voice's
# short-term level stays >= 16 dB above it while anyone speaks; fast attack (looks ahead 80 ms), slow release (350 ms) so it never pumps.
FR = int(.02 * SR); nF = N // FR + 1
def frms(x): y = np.zeros(nF); m = (x ** 2).mean(1) if x.ndim > 1 else x ** 2; c = np.add.reduceat(m[:nF * FR] if len(m) >= nF * FR else np.pad(m, (0, nF * FR - len(m))), np.arange(0, nF * FR, FR)) / FR; return 10 * np.log10(c + 1e-12)
vdb = frms(voS); bdb = frms(musS + ambS); spk = vdb > -45
vdb_s = np.maximum.reduce([np.roll(vdb, -k) for k in range(0, 5)]); vdb_s = np.where(spk | np.roll(spk, -4), np.maximum(vdb_s, -30), -120)
need = np.minimum(0, vdb_s - 16 - bdb); gF = np.ones(nF); cur = 1.0
for i in range(nF):
    tgt = 10 ** (need[i] / 20) if need[i] > -119 else 1.0; tgt = max(.06, tgt)
    cur = tgt if tgt < cur else cur + (tgt - cur) * (1 - np.exp(-.02 / .35)); gF[i] = cur
bedG = np.interp(tt, np.arange(nF) * .02, gF)
musS *= bedG[:, None]; ambS *= (.25 + .75 * bedG)[:, None]
mix = voS + musS + ambS + fxS
mix *= np.minimum(1, (DUR - tt) / .6)[:, None]   # fade out with the picture
pk = np.abs(mix).max(); mix = np.tanh(mix / max(pk, 1e-6) * 1.2) * .9
os.makedirs(os.path.join(D, 'out'), exist_ok=True); OUT = os.path.join(D, 'out', 'mix.wav')
sf.write(OUT, mix.astype(np.float32), SR, subtype='FLOAT')
sf.write(os.path.join(D, 'out', 'score.wav'), lvl(mus, -20).astype(np.float32), SR, subtype='FLOAT')
k_ = .9 / max(pk, 1e-6) * 1.2   # stems at the same gain as the mix (before the soft clip), for tools/audio_check.py
for nm, x in (('vo', voS), ('bed', musS + ambS), ('fx', fxS)): sf.write(os.path.join(D, 'out', f'stem_{nm}.wav'), (x * k_ / 1.2).astype(np.float32), SR, subtype='FLOAT')
print(f"{TL['code']} mix {DUR:.1f}s mood={mood} | vo {rms_db(voS):.1f} mus {rms_db(musS):.1f} amb {rms_db(ambS):.1f} fx {rms_db(fxS):.1f} | gaps", [round(rms_db(voS[int(v['t']*SR):int((v['t']+v['d'])*SR)]) - rms_db((musS+ambS+fxS)[int(v['t']*SR):int((v['t']+v['d'])*SR)]), 1) for v in VO])
