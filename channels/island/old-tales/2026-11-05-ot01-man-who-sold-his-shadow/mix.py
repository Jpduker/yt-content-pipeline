"""Old Tales #1 mix: score + narration + paper/wood/water foley + seasonal ambience -> out/mix.wav (v2: no dead silence; ambience and a drone carry the pause)"""
import sys, os, json
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, brown, click, clack, whoosh, thump, add, compress, limit

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'out'), exist_ok=True)
E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR)); EV = E['ev']
rng = np.random.default_rng(5)
nz = lambda d: rng.standard_normal(len(t_(d)))
sine = lambda fr, d: np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fr, len(t_(d))).astype(float)) / SR)
win = lambda d, p=1: np.sin(np.pi * t_(d) / d) ** p
def waves(d): tt = t_(d); return norm(lp(nz(d), 900) * (.5 + .5 * np.sin(2 * np.pi * tt / 3.1) ** 2)) * win(d, .3)
def wind(d): return norm(bp(nz(d), 250, 1100) * (.6 + .4 * np.sin(2 * np.pi * t_(d) / 4.3))) * win(d, .3)
def night(d):                                                        # autumn crickets over a low sea
    tt = t_(d); x = lp(nz(d), 500) * .5
    for k in range(3): f = 4200 + 600 * k; chirp = (np.sin(2 * np.pi * (2.6 + k * .7) * tt) > .55) * (np.sin(2 * np.pi * 34 * tt) > 0); x += np.sin(2 * np.pi * f * tt) * chirp * .12
    return norm(x) * win(d, .25)
def village(d): x = bp(nz(d), 300, 2500) * (.5 + .5 * np.abs(np.sin(2 * np.pi * t_(d) * .9))) * .6 + lp(nz(d), 400) * .4; return norm(x) * win(d, .25)
def still(d): return norm(lp(nz(d), 300)) * win(d, .3)
def scroll(d): return norm(bp(nz(d), 700, 4000) * (.6 + .4 * np.sin(2 * np.pi * 9 * t_(d)))) * win(d, .8)
def seal(): d = .35; return norm(sine(90, d) * env_exp(d, .05) + bp(nz(d), 1500, 5000) * np.exp(-((t_(d) - .2) / .03) ** 2) * .4)
def carve(n):
    d = .07; c = click(1.2 + .1 * (n % 3), 1); b = bp(nz(d), 2000, 6000) * env_exp(d, .01) * .5; L = min(len(c), len(b)); return norm(c[:L] + b[:L])
def rise(d): tt = t_(d); n = nz(d); return norm(lp(n, 400) * (1 - tt / d) * (tt / d) + lp(n, 1500) * (tt / d) ** 2) * win(d, .4)
def breath(d): return norm(bp(nz(d), 1200, 5000)) * win(d, 1.2)
def peel(d): tt = t_(d); return norm(bp(nz(d), 2000, 7000) * (rng.random(len(tt)) > .7) * (.3 + .7 * tt / d)) * win(d, .4)
def splash(n): d = .5; return norm(lp(nz(d), 2500) * env_exp(d, .12) + sine(200 - 30 * n, d) * env_exp(d, .05) * .3)
def whisper(n): d = .9; tt = t_(d); return norm(bp(nz(d), 2500, 7000) * (np.sin(2 * np.pi * (5 + n) * tt) > 0)) * win(d, .6)
def door(): d = .6; return norm(lp(nz(d), 700) * (.5 + .5 * np.sin(2 * np.pi * 20 * t_(d))) ) * win(d, .7)
def oar(n): d = .7; return norm(lp(nz(d), 1500) * env_exp(d, .2) + sine(140, d) * env_exp(d, .3) * .3)
def drop(): d = .8; tt = t_(d); return norm(sine(600 * np.exp(-tt * 6) + 80, d) * env_exp(d, .25) + lp(nz(d), 1500) * env_exp(d, .1) * .4)
def wade(d): return norm(lp(nz(d), 1200) * (.5 + .5 * np.sin(2 * np.pi * 1.6 * t_(d)) ** 2)) * win(d, .5)
def clap(): d = .25; return norm(sine(2100, d) * env_exp(d, .03) + sine(3400, d) * env_exp(d, .02) * .5 + bp(nz(d), 1500, 6000) * env_exp(d, .005))
def baren(d): tt = t_(d); return norm(bp(nz(d), 300, 2000) * (.5 + .5 * np.sin(2 * np.pi * 2.5 * tt))) * win(d, .6)

fx = np.zeros((N, 2)); vo = np.zeros((N, 2)); amb = np.zeros((N, 2))
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'vo': continue
    d = e.get('dur', 1.0)
    if ty in ('waves', 'wind', 'night', 'village', 'still'): add(amb, {'waves': waves, 'wind': wind, 'night': night, 'village': village, 'still': still}[ty](d), t, .2 if ty != 'still' else .12, 0)
    elif ty == 'dissolve': add(fx, scroll(d) * .6, t, .12, .2)
    elif ty == 'seal': add(fx, seal(), t, .35)
    elif ty == 'carve': add(fx, carve(e['n']), t, .25, -.4)
    elif ty == 'rise': add(fx, rise(d), t, .3)
    elif ty == 'breath': add(fx, breath(d), t, .2, .3)
    elif ty == 'peel': add(fx, peel(d), t, .3, .1)
    elif ty == 'whoosh': add(fx, whoosh(d, 1), t, .25, .4)
    elif ty == 'splash': add(fx, splash(e['n']), t, .25, -.2)
    elif ty == 'whisper': add(fx, whisper(e['n']), t, .15, -.3 + .2 * e['n'])
    elif ty == 'door': add(fx, door(), t, .25, .4)
    elif ty == 'oar': add(fx, oar(e['n']), t, .3, -.2)
    elif ty == 'drop': add(fx, drop(), t, .35)
    elif ty == 'wade': add(fx, wade(d), t, .25, .2)
    elif ty == 'clap': add(fx, clap(), t, .5)
    elif ty == 'baren': add(fx, baren(d), t, .2)
    elif ty == 'bell': pass                                         # the bell lives in the score
voice_env = np.zeros(N)
for e in EV:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(D, 'voices', e['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = librosa.resample(y, orig_sr=sr, target_sr=SR); y = compress(norm(y, .9), thr=.3, ratio=3.0)
    add(vo, y, e['t'], .9, 0); s = int(e['t'] * SR); voice_env[s:s + len(y)] = 1
mus, _ = sf.read(os.path.join(D, 'music', 'score.wav')); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
k = int(.15 * SR); sm = np.convolve(voice_env, np.ones(k) / k, 'same')
rms = lambda z: float(np.sqrt(np.mean(z ** 2)) + 1e-9)
mus = mus * (rms(vo[voice_env > 0]) / rms(mus)) * 10 ** (-12 / 20)          # v2 levels: bed 12 dB under the voice, 19 dB while it speaks
mus = mus * (1 - sm * (1 - 10 ** (-7 / 20)))[:, None]; amb = amb * (1 - sm * (1 - 10 ** (-4 / 20)))[:, None]
def gate(buf, a, b, f=.02):
    s, e, ff = int(a * SR), int(b * SR), int(f * SR); m = np.ones(N); m[s:e] = 0; m[s - ff:s] = np.linspace(1, 0, ff); m[e:e + ff] = np.linspace(0, 1, ff); buf *= m[:, None]
mix = mus + fx * .9 + vo + amb
mix = limit(mix, .95)
sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', mix.shape, 'peak', round(float(np.abs(mix).max()), 3))
