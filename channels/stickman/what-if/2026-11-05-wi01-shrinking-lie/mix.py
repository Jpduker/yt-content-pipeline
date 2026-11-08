"""Stickman Short mix: score + Kokoro narration + foley at the events.json times + ambience -> out/mix.wav
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python mix.py  (needs events.json, voices/, music/score.wav)"""
import sys, os, json
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, brown, click, clack, whoosh, thump, ding, pop, add, compress, limit

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'out'), exist_ok=True)
E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR)); EV = E['ev']
rng = np.random.default_rng(11)
nz = lambda d: rng.standard_normal(len(t_(d)))
sine = lambda fr, d: np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fr, len(t_(d))).astype(float)) / SR)
win = lambda d, p=1: np.sin(np.pi * t_(d) / d) ** p
def boing(n, small=False):                                       # a cartoon spring: falling pitch with a fast wobble
    d = .35 if small else .6; tt = t_(d); f0 = (520 if small else 420) * (1 + .03 * (n % 4))
    fr = f0 * np.exp(-tt * 2.2) * (1 + .18 * np.sin(2 * np.pi * 26 * tt) * np.exp(-tt * 4))
    return norm(sine(fr, d) * env_exp(d, .25 if not small else .12))
def swish(): d = .3; return norm(bp(nz(d), 1500, 7000)) * win(d, 1.5)
def typing(d):
    x = np.zeros(len(t_(d)))
    for k in range(int(d * 7)):
        c = norm(click(1.5 + rng.random(), 1)[:int(.03 * SR)]); o = int((k / 7 + rng.random() * .05) * SR)
        if o + len(c) < len(x): x[o:o + len(c)] += c * (.5 + .5 * rng.random())
    return x * .5 + lp(nz(d), 600) * .05
def traffic(d): x = lp(nz(d), 400) * .7 + bp(nz(d), 800, 2000) * .15; return norm(x) * win(d, .3)
def step(n): d = .09; return norm(lp(nz(d), 1200) * env_exp(d, .015) + sine(150 + 10 * (n % 2), d) * env_exp(d, .02) * .4)
def slide_down(): d = .45; return norm(sine(np.linspace(1400, 300, len(t_(d))), d)) * win(d, .6)
def gasp(): d = .35; return norm(bp(nz(d), 700, 3000) * np.linspace(1, .2, len(t_(d)))) * win(d, .8)
def clank(n): d = .2; return norm(sine(700 + 40 * n, d) * env_exp(d, .05) + sine(1830 + 60 * n, d) * env_exp(d, .03) * .5)
def pour(d): return norm(bp(nz(d), 1500, 5000) * (.6 + .4 * np.sin(2 * np.pi * 13 * t_(d)))) * win(d, .4)
def saw(d): tt = t_(d); return norm(bp(nz(d), 1200, 5000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 9 * tt)))) * win(d, .4)
def motor(d): tt = t_(d); return norm(sine(60 + 30 * tt / d, d) * (1 + .5 * np.sign(np.sin(2 * np.pi * 30 * tt))) + lp(nz(d), 500) * .3) * win(d, .3)
def beep(): d = .3; return norm(sine(1400, d) * (t_(d) < .12) + sine(1400, d) * ((t_(d) > .16) & (t_(d) < .28))) * .8
def jump(): d = .3; return norm(sine(np.linspace(300, 900, len(t_(d))), d)) * win(d, .7)
def net(): d = .35; return norm(bp(nz(d), 3000, 9000)) * win(d, 1.2)
def bounce(): d = .15; return norm(sine(110, d) * env_exp(d, .04) + lp(nz(d), 800) * env_exp(d, .01) * .5)
def strum(n, sour):
    d = .5; out = np.zeros(len(t_(d))); ch = [[52, 57, 62, 67, 71], [55, 59, 62, 67, 71]][n % 2]
    for k, m in enumerate(ch):
        fr = 440 * 2 ** ((m + (rng.uniform(-.7, .7) if sour else 0) - 69) / 12); p = max(2, int(SR / fr)); buf = rng.uniform(-1, 1, p); o = int(k * .012 * SR); y = np.zeros(len(out) - o)
        for i in range(len(y)): y[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .995
        out[o:] += y
    return norm(out)
def roll(d): tt = t_(d); x = np.zeros(len(tt))
def roll(d):
    x = np.zeros(len(t_(d)))
    for k in range(int(d * 22)):
        c = norm(bp(nz(.05), 200, 3000) * env_exp(.05, .01)); o = int(k / 22 * SR)
        if o + len(c) < len(x): x[o:o + len(c)] += c * (.3 + .7 * k / (d * 22))
    return norm(x)
def cheer(): d = .8; return norm(sum(sine(f * 2 ** (k / 12), d) * env_exp(d, .4) for k, f in enumerate([523.25, 659.25, 783.99])) )

fx = np.zeros((N, 2)); vo = np.zeros((N, 2)); amb = np.zeros((N, 2))
for e in EV:
    t, ty, gn = e['t'], e['type'], e.get('gain', 1.0)
    if ty == 'vo': continue
    if ty == 'swish': add(fx, swish(), t - .05, .25, .4)
    elif ty == 'boing': add(fx, boing(e['n']), t, .45 * gn)
    elif ty == 'boing_s': add(fx, boing(e['n'], True), t, .25, -.2 + .05 * e['n'])
    elif ty == 'pop': add(fx, pop(1), t, .3 * gn, .1)
    elif ty == 'office': add(amb, typing(e['dur']), t, .12, .3)
    elif ty == 'street': add(amb, traffic(e['dur']), t, .15, -.2)
    elif ty == 'step': add(fx, step(e['n']), t, .25, -.15 if e['n'] % 2 else .15)
    elif ty == 'slide_down': add(fx, slide_down(), t, .3)
    elif ty == 'gasp': add(fx, gasp(), t, .25)
    elif ty == 'clank': add(fx, clank(e['n']), t, .25, .2)
    elif ty == 'click': add(fx, norm(click(1.8, 1)[:int(.05 * SR)]), t, .35)
    elif ty == 'pour': add(fx, pour(e['dur']), t, .15, .3)
    elif ty == 'saw': add(fx, saw(e['dur']), t, .3)
    elif ty == 'thud': add(fx, thump(1)[:int(.3 * SR)], t, .5)
    elif ty == 'motor': add(fx, motor(e['dur']), t, .3, -.3)
    elif ty == 'beep': add(fx, beep(), t, .3, .2)
    elif ty == 'jump': add(fx, jump(), t, .25)
    elif ty == 'swoosh_net': add(fx, net(), t, .3, .2)
    elif ty == 'bounce': add(fx, bounce(), t, .4 * gn)
    elif ty == 'strum': add(fx, strum(e['n'], e.get('sour', 0)), t, .35, .3)
    elif ty == 'roll': add(fx, roll(e['dur']), t, .35)
    elif ty == 'ding': add(fx, ding(1), t, .35)
    elif ty == 'cheer': add(fx, cheer(), t + .05, .25)

voice_env = np.zeros(N)
for e in EV:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(D, 'voices', e['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = librosa.resample(y, orig_sr=sr, target_sr=SR); y = compress(norm(y, .9), thr=.3, ratio=3.0)
    add(vo, y, e['t'], .9, 0); s = int(e['t'] * SR); voice_env[s:s + len(y)] = 1
room = lp(brown(DUR), 900) * .012; amb += np.stack([room, np.roll(room, 311)], 1)
mus, msr = sf.read(os.path.join(D, 'music', 'score.wav'))
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
k = int(.12 * SR); sm = np.convolve(voice_env, np.ones(k) / k, 'same')
# --- levels v2: the music sits UNDER the voice (Jp: "music volume is too high").
# Voice RMS (while speaking) is the reference; music bed -12 dB below it in the gaps, -19 dB under speech.
rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-9)
v_ref = rms(vo[voice_env > 0]); m_ref = rms(mus)
mus = mus * (v_ref / m_ref) * 10 ** (-12 / 20)
mus = mus * (1 - sm * (1 - 10 ** (-7 / 20)))[:, None]
mix = mus + fx * .9 + vo * 1.0 + amb
mix = limit(mix, .95)
sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', mix.shape, 'peak', round(float(np.abs(mix).max()), 3))
