"""The Wall of I'm Fine v2 mix: narration (Kokoro: af_heart narrator, am_echo for his one line) + score + foley -> out/mix.wav."""
import sys, os, json
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio.sfx import SR, t_, env_exp, bp, lp, norm, brown, click, add, limit, compress
import librosa
D = os.path.dirname(os.path.abspath(__file__)); E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR))
rng = np.random.default_rng(3); nz = lambda d: rng.standard_normal(len(t_(d)))
sine = lambda fr, d: np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fr, len(t_(d))).astype(float)) / SR)
win = lambda d, p=1: np.sin(np.pi * t_(d) / d) ** p
def thud(f=70, d=.45, grit=.5):                                    # brick on a hard floor: low body + grit + a few chips
    x = sine(f * (1 + .6 * np.exp(-t_(d) / .02)), d) * env_exp(d, .09) + lp(nz(d), 1800) * env_exp(d, .015) * grit
    for k in range(3): o = int((.02 + rng.random() * .12) * SR); c = norm(click(2 + rng.random(), 1)[:int(.02 * SR)]) * .25; x[o:o + len(c)] += c[:len(x) - o]
    return norm(x)
def clack(): d = .2; return norm(bp(nz(d), 600, 3000) * env_exp(d, .02) + sine(220, d) * env_exp(d, .03) * .4)
def strain(): d = .55; return norm(bp(nz(d), 300, 1500) * win(d, .7) * (.6 + .4 * np.sin(2 * np.pi * 9 * t_(d))))
def cloth(): d = .3; return norm(bp(nz(d), 1500, 6000)) * win(d, 1.5)
def step(n): d = .12; return norm(lp(nz(d), 900) * env_exp(d, .02) + sine(120 + 8 * (n % 2), d) * env_exp(d, .025) * .5)
def rumble(d): tt = t_(d); return norm(lp(brown(d)[:len(tt)], 220) * (tt / d) ** 1.5) * win(d, .2)
def knock(n): d = .18; return norm(sine(180 - 10 * n, d) * env_exp(d, .03) + bp(nz(d), 300, 1500) * env_exp(d, .008) * .8)
def grind(): d = .45; return norm(bp(nz(d), 200, 2500) * (.5 + .5 * (rng.random(len(t_(d))) > .6))) * win(d, .6)
def slump(): d = .4; return norm(lp(nz(d), 500) * env_exp(d, .05) + sine(80, d) * env_exp(d, .06) * .6)
def room(d): return norm(lp(brown(d)[:len(t_(d))], 600)) * .4
fx = np.zeros((N, 2)); amb = np.zeros((N, 2))
for e in E['ev']:
    t, ty, gn = e['t'], e['type'], e.get('gain', 1.0)
    if ty == 'vo': continue
    if ty == 'room': add(amb, room(e['dur']), t, .05)
    elif ty == 'brick_drop': add(fx, thud(65, .55, .7), t, .75 * gn)
    elif ty == 'brick_land': add(fx, thud(80 + (e['n'] % 7) * 6, .3, .5), t, .22 * gn, (rng.random() - .5) * .8)
    elif ty == 'brick_place': add(fx, clack(), t, .45)
    elif ty == 'strain': add(fx, strain(), t, .2)
    elif ty == 'cloth': add(fx, cloth(), t, .12)
    elif ty == 'step': add(fx, step(e['n']), t, .2, -.2 if e['n'] % 2 else .2)
    elif ty == 'rumble': add(fx, rumble(e['dur']), t, .35)
    elif ty == 'collapse': add(fx, rumble(e['dur'])[::-1], t, .3)
    elif ty == 'knock': add(fx, knock(e['n']), t, .55, -.3)
    elif ty == 'grind': add(fx, grind(), t, .35)
    elif ty == 'slump': add(fx, slump(), t, .4)
vo = np.zeros((N, 2)); venv = np.zeros(N)
for e in E['ev']:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(D, 'voices', e['id'] + '.wav')); y = y.mean(1) if y.ndim > 1 else y
    y = librosa.resample(y, orig_sr=sr, target_sr=SR); y = compress(norm(y, .9), thr=.3, ratio=2.5)
    add(vo, y, e['t'], 1.0 if e['id'] != 'hero' else 1.05, 0); s0 = int(e['t'] * SR); venv[s0:s0 + len(y)] = 1
mus, _ = sf.read(os.path.join(D, 'music', 'score.wav')); mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
rms = lambda z: float(np.sqrt(np.mean(z ** 2)) + 1e-9)
vref = rms(vo[venv > 0]); mus = mus * (vref / rms(mus)) * 10 ** (-11 / 20)          # music bed under the voice (-11 dB, -18 dB while she speaks)
k = int(.15 * SR); sm = np.convolve(venv, np.ones(k) / k, 'same'); mus = mus * (1 - sm * (1 - 10 ** (-7 / 20)))[:, None]
fx = fx * (vref / rms(fx)) * 10 ** (-9 / 20); fx = fx * (1 - sm * (1 - 10 ** (-4 / 20)))[:, None]
mix = limit(vo + mus + fx + amb, .95)
fi = np.minimum(1, np.arange(N) / (.5 * SR)); mix *= fi[:, None]
os.makedirs(os.path.join(D, 'out'), exist_ok=True); sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix peak', round(float(np.abs(mix).max()), 3))
