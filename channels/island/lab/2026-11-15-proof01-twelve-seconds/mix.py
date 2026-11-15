# Proof-01 mix: ambience (sea, wind, lamp mechanism hum) + events (lamp dies, heartbeat) + a quiet synthesized pad + Kokoro narration → out/mix.wav
# Usage (from the lemo-opuscar root): .venv/bin/python <proof>/mix.py
# Music note: no licensed track yet; the pad is a placeholder "one pad alone" (STYLE.md §7). Replace with a real score before any publish.
import sys, os, json, numpy as np, soundfile as sf, librosa
from scipy.ndimage import uniform_filter1d
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LEMO_OPUSCAR_HOME') or os.path.abspath(os.path.join(HERE, '..', '..', 'tools-lemo'))
sys.path.insert(0, os.path.join(LIB, 'core', 'audio'))
from sfx import *

DUR = 31.0; N = int(DUR * SR); tt = np.arange(N) / SR
rng = np.random.default_rng(11)
T_FLICKER, T_OUT = 22.6, 23.4
def curve(keys): k = np.array(keys, float); return np.interp(tt, k[:, 0], k[:, 1])
def stereo(x, pan=0.0): l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l * 1.414, x * r * 1.414], 1)
def place(buf, x, t, pan=0.0, g=1.0):
    s = int(t * SR); x = stereo(x, pan) if x.ndim == 1 else x
    if s >= len(buf): return
    n = min(len(x), len(buf) - s); buf[s:s + n] += x[:n] * g
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)

# —— Beds: sea (wide: big and far; path: softer; door: wind takes over), wind, the lamp's clockwork hum (dies with the lamp) ——
sea_g = curve([(0, 0), (3.4, 0), (4.2, 1), (12, 1), (12.4, .55), (19.8, .55), (20.2, .4), (31, .35)])
waves = lp(brown(DUR), 650) * (.45 + .55 * np.sin(2 * np.pi * .1 * tt + 1) ** 4) + hp(lp(noise(DUR), 3500), 600) * .1 * (.3 + .7 * np.sin(2 * np.pi * .1 * tt + .6) ** 6)
waves *= .45 * sea_g
wind_g = curve([(0, 0), (12, 0), (12.4, .5), (20, .6), (23.4, .9), (26, .5), (31, .4)])
windB = bp(noise(DUR), 180, 1100) * (.55 + .45 * np.sin(2 * np.pi * .27 * tt) ** 2) * .5 * wind_g
grass = bp(noise(DUR), 900, 4000) * (.5 + .5 * np.sin(2 * np.pi * .4 * tt + 2) ** 2) * .08 * curve([(0, 0), (12.2, 0), (12.6, 1), (19.8, 1), (20.2, 0), (31, 0)])
hum_g = curve([(0, 0), (20, 0), (20.4, 1), (T_FLICKER, 1), (T_FLICKER + .2, .4), (T_FLICKER + .35, 1), (T_FLICKER + .5, .2), (T_OUT, 0), (31, 0)])
hum = (np.sin(2 * np.pi * 48 * tt) * .5 + np.sin(2 * np.pi * 96 * tt) * .2 + (np.sin(2 * np.pi * 1.6 * tt) > .9) * bp(noise(DUR), 2000, 5000) * .25) * hum_g * .6
amb = stereo(waves, -.25) + stereo(np.roll(waves, 7919), .25) + stereo(windB, -.5) + stereo(np.roll(windB, 9001), .5) + stereo(grass, .3) + stereo(hum, -.15)

# —— Pad (placeholder score): a low fifth that holds, drops out when the lamp dies, one note returns under the title ——
def pad(f, d, a=.2, r=1.0):
    x = t_(d); e = np.minimum(1, x / a) * np.minimum(1, (d - x) / r)
    return sum(np.sin(2 * np.pi * f * m * x + m) * g for m, g in [(1, 1), (2, .25), (3, .08), (1.005, .6)]) * e
mus = np.zeros((N, 2))
place(mus, pad(55, 19.2, 2.5, 2), 3.6, g=.9); place(mus, pad(82.4, 19.2, 3.5, 2), 3.6, g=.45)     # A1 + E2 under the wide and the path
place(mus, pad(55, 3.2, 1.0, 1.4), 20.0, g=.7)                                                     # holds into the flicker, dies at the lamp
place(mus, pad(41.2, 4.6, 1.8, 2.0), 26.4, g=.8); place(mus, pad(61.7, 4.6, 2.2, 2.0), 26.4, g=.3)   # E1 under the title
mus = lp(mus.T, 900).T if False else np.stack([lp(mus[:, 0], 900), lp(mus[:, 1], 900)], 1)

# —— Events ——
fx = np.zeros((N, 2))
def fwoomp(v=1.0, d=1.4):
    x = t_(d); return norm(lp(noise(d), 500) * np.exp(-x / .25) * np.sin(np.pi * np.minimum(x / .08, 1) / 2) + np.sin(2 * np.pi * 55 * x * (1 - .4 * x)) * np.exp(-x / .35) * .7) * v
place(fx, click(.6, .35), T_FLICKER, pan=.2); place(fx, click(.5, .3), T_FLICKER + .32, pan=.2)   # the mechanism stutters
place(fx, fwoomp(.6), T_OUT, pan=.1)
place(fx, heartbeat(.22), T_OUT + 1.1); place(fx, heartbeat(.18), T_OUT + 2.1)
for k, t0 in enumerate(np.arange(12.6, 19.9, 1 / 4.25)): place(fx, step(.22), t0, pan=float(np.clip((t0 - 16) / 6, -.4, .4)))   # Gus's steps on dirt (8.5 fps walk → 4.25 steps/s... halved to a natural pace)
place(fx, creak(.3), 20.6, pan=-.2)

# —— Voices ——
VO = { 'n1': 4.6, 'n2': 13.0, 'n3': 20.6, 'n4': 24.2 }
L = json.load(open(os.path.join(HERE, 'lines.json')))
vo = np.zeros((N, 2)); vmask = np.zeros(N)
for Ln in L:
    y, sr = sf.read(os.path.join(HERE, 'voices', Ln['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = librosa.resample(y, orig_sr=sr, target_sr=SR)
    y = compress(norm(y, .9), thr=.25, ratio=3.2)
    act = np.abs(y) > .02 * np.abs(y).max(); y = y * (10 ** (-20 / 20)) / (np.sqrt(np.mean(y[act] ** 2)) + 1e-9)
    t0 = VO[Ln['id']]; place(vo, y, t0); s = int(t0 * SR); vmask[s:s + len(y)] = 1

def lvl(x, db): r = np.sqrt(np.mean(x[np.abs(x).sum(1) > 1e-4] ** 2)) if np.any(np.abs(x) > 1e-4) else 1; return x * (10 ** (db / 20)) / (r + 1e-9)
voS = lvl(vo, -17); musS = lvl(mus, -23); ambS = lvl(amb, -30); fxS = lvl(fx, -27)
Dd = json.load(open(os.path.join(HERE, 'voices', 'dur.json'))); keys = [(0, 1.0)]
for k, t0 in sorted(VO.items(), key=lambda kv: kv[1]):
    a, b = int(t0 * SR), int((t0 + Dd[k]) * SR); need = rms_db(voS[a:b]) - 10 - rms_db((musS + ambS)[a:b]); g = min(1.0, 10 ** (need / 20))
    keys += [(t0 - .35, 1.0), (t0 - .05, g), (t0 + Dd[k] + .1, g), (t0 + Dd[k] + .6, 1.0)]
keys.sort(); gk = np.array(keys); bedG = np.interp(tt, gk[:, 0], gk[:, 1])
musS *= bedG[:, None]; ambS *= (.25 + .75 * bedG)[:, None]
mix = voS + musS + ambS + fxS
pk = np.abs(mix).max(); mix = np.tanh(mix / max(pk, 1e-6) * 1.2) * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); OUT = os.path.join(HERE, 'out', 'mix.wav')
sf.write(OUT, mix.astype(np.float32), SR, subtype='FLOAT')
print('wrote', OUT, '| vo', round(rms_db(voS), 1), 'mus', round(rms_db(musS), 1), 'amb', round(rms_db(ambS), 1), 'fx', round(rms_db(fxS), 1))
for k, t0 in VO.items():
    a, b = int(t0 * SR), int((t0 + Dd[k]) * SR); print(f'{k} {t0:5.1f}s  voice over bed {rms_db(voS[a:b]) - rms_db((musS + ambS + fxS)[a:b]):5.1f} dB')
