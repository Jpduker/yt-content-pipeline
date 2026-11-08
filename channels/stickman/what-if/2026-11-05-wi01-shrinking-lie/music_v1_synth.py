"""Stickman Short score: a bright, bouncy original tune, fully synthesized (no samples):
marimba lead, plucked bass, ukulele-style strums, claps and a shaker. 120 BPM, C major, 19 bars = 38.0 s.
Progression C | Am | F | G (bar 19's G resolves into bar 1 on the loop).  Run: $LIB/.venv/bin/python music.py"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, add

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
BEAT, BAR, DUR = 0.5, 2.0, 38.0
N = int(DUR * SR); rng = np.random.default_rng(3)
f = lambda m: 440 * 2 ** ((m - 69) / 12)
mar = np.zeros((N, 2)); bass = np.zeros((N, 2)); uke = np.zeros((N, 2)); perc = np.zeros((N, 2))
def marimba(m, d=.5, v=1.):
    tt = t_(d); fr = f(m); x = np.sin(2 * np.pi * fr * tt) * np.exp(-tt / .18) + .3 * np.sin(2 * np.pi * fr * 4 * tt) * np.exp(-tt / .03)
    a = int(.002 * SR); x[:a] *= np.linspace(0, 1, a); return x * v
def pluck(m, d=.4, v=1.):                                         # Karplus-Strong string
    fr = f(m); p = max(2, int(SR / fr)); buf = rng.uniform(-1, 1, p); out = np.zeros(len(t_(d)))
    for i in range(len(out)): out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    return out * v
def clap(v=1.): d = .12; return bp(rng.standard_normal(len(t_(d))), 900, 4000) * (np.exp(-t_(d) / .012) + .5 * np.exp(-np.maximum(0, t_(d) - .012) / .03)) * v
def shaker(v=1.): d = .06; return bp(rng.standard_normal(len(t_(d))), 5000, 11000) * np.exp(-t_(d) / .015) * v
CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]; ROOT = [36, 33, 29, 31]
MEL = [[72, 76, 79, 76], [72, 69, 72, 76], [77, 76, 72, 69], [71, 74, 79, 74]]
quiet = lambda T: 29.0 <= T < 31.0 or 31.4 <= T < 32.6           # the truth beat + the drum roll: the band holds its breath
for b in range(19):
    T0 = b * BAR; c = b % 4
    for i in range(4):
        tt = T0 + i * BEAT
        if quiet(tt): continue
        add(bass, pluck(ROOT[c] + (0 if i % 2 == 0 else 7), .45, .9), tt, .9)
        add(perc, shaker(.6), tt + .25, .5, .4)
        if i in (1, 3): add(perc, clap(.8), tt, .5, -.2)
        for k, m in enumerate(CH[c]): add(uke, pluck(m + 12, .35, .5), tt + (.25 if i % 2 else 0) + k * .015, .6, -.3 + k * .2)
    if 4.0 <= T0 < 26.0 and not quiet(T0):                         # marimba hook over the story, twice as busy on the street
        for i, m in enumerate(MEL[c]): add(mar, marimba(m, .5, .7), T0 + i * BEAT, .6, .25)
        if 11.5 <= T0 < 16.0:
            for i, m in enumerate(MEL[c]): add(mar, marimba(m + 12, .3, .4), T0 + i * BEAT + .25, .5, -.25)
# sour strums: the friend's song is off-key (handled in the mix); the band drops to bass only there
mix = mar * .55 + bass * .8 + uke * .4 + perc * .45
mix = np.stack([hp(mix[:, 0], 45), hp(mix[:, 1], 45)], 1)
duck = np.ones(N); a, b2 = int(26.0 * SR), int(29.0 * SR); duck[a:b2] = .45
mix *= duck[:, None]
mix = norm(mix, .8)
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', mix.shape, round(len(mix) / SR, 2), 's')
