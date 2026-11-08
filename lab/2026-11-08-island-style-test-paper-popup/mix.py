"""Style-test mix: Gus's narration (Kokoro am_michael, word-timed) + toy-box score + PAPER FOLEY on the exact frames from events.json
(pop-up snap, page swish, crinkle, fold, scribble, cardboard thump, dial ticks). Music −11 dB vs voice in gaps, −7 dB more under speech.
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python mix.py"""
import sys, os, json
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, add, norm, compress, limit, hp, lp, bp, noise, env_exp, t_, pop, thump, click, whoosh
D = os.path.dirname(os.path.abspath(__file__)); E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR))
vo = np.zeros((N, 2)); env = np.zeros(N); fx = np.zeros((N, 2))
crinkle = lambda d=.35: norm(bp(noise(d), 2500, 9000) * (np.abs(np.sin(t_(d) * 90)) ** 3) * env_exp(d, d / 2.5), .5)
swish = lambda: norm(bp(noise(.45), 800, 5000) * np.sin(np.linspace(0, np.pi, int(.45 * SR))) ** 2, .6)
snap = lambda: norm(np.concatenate([norm(pop(), .7)[:int(.08 * SR)], crinkle(.12) * .6]), .7)
scribble = lambda: norm(bp(noise(.75), 1500, 6000) * (.5 + .5 * np.abs(np.sin(t_(.75) * 40))), .4)
F = {'pop': (snap, .55), 'crinkle': (lambda: crinkle(.5), .5), 'fold': (lambda: crinkle(.25), .45), 'page': (swish, .55), 'tick': (lambda: norm(click(1.4), .8), .5),
     'scribble': (scribble, .4), 'flip': (lambda: np.concatenate([crinkle(.08) for _ in range(8)]), .35), 'thump': (lambda: norm(thump(.9, 90), .8), .6), 'aha': (lambda: crinkle(.1), .2)}
for e in E['ev']:
    if e['type'] == 'vo':
        y, s = sf.read(os.path.join(D, 'voices', e['id'] + '.wav')); y = y.mean(1) if y.ndim > 1 else y
        y = compress(norm(hp(librosa.resample(y, orig_sr=s, target_sr=SR), 80), .9), thr=.3, ratio=2.5); add(vo, y, e['t'], .9, 0); a = int(e['t'] * SR); env[a:a + len(y)] = 1
    elif e['id'] in F: f, g = F[e['id']]; add(fx, f(), e['t'], g, (hash(e['t']) % 7 - 3) / 10)
mus, sr = sf.read(os.path.join(D, 'music', 'score.wav')); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-9); k = int(.2 * SR); sm = np.convolve(env, np.ones(k) / k, 'same')
mus = mus * (rms(vo[env > 0]) / rms(mus)) * 10 ** (-11 / 20) * (1 - sm * (1 - 10 ** (-7 / 20)))[:, None]
fx *= (1 - sm * .35)[:, None]
room = norm(lp(noise(DUR), 400), 1)[:N] * .006; mix = mus + vo + fx + room[:, None]
mix = np.stack([limit(hp(mix[:, c], 30), .95) for c in range(2)], 1); os.makedirs(os.path.join(D, 'out'), exist_ok=True)
sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix.wav peak', round(float(np.abs(mix).max()), 3))
