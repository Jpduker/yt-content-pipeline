"""Episode 02 score: an original West-Coast cool-jazz combo, fully synthesized (no samples):
vibraphone (motor tremolo), pizzicato-style upright bass, brushes, finger snaps, celesta.
A sneaky detective walk in D minor. 120 BPM, 4/4, 26 bars = 52.0 s. Dm7 | Gm7 | Em7b5 | A7 (bar 26's A7 resolves into bar 1).
Run: $LIB/.venv/bin/python music.py   ->  music/score.wav"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, add

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
BEAT, BAR, DUR = 0.5, 2.0, 52.0
N = int(DUR * SR)
rng = np.random.default_rng(1)
f = lambda m: 440 * 2 ** ((m - 69) / 12)
vib = np.zeros((N, 2)); bass = np.zeros((N, 2)); drm = np.zeros((N, 2)); cel = np.zeros((N, 2))

def vibe(m, d=1.4, v=1.0, trem=1.0):
    tt = t_(d); fr = f(m)
    x = np.sin(2 * np.pi * fr * tt) + .26 * np.sin(2 * np.pi * fr * 4 * tt) * np.exp(-tt / .25) + .08 * np.sin(2 * np.pi * fr * 10 * tt) * np.exp(-tt / .06)
    x *= np.exp(-tt / 1.1) * (1 - .32 * trem * (.5 + .5 * np.sin(2 * np.pi * 5.2 * tt)))
    a = int(.004 * SR); x[:a] *= np.linspace(0, 1, a)
    return x * v
def pizz(m, d=.55, v=1.0):
    tt = t_(d); fr = f(m) * (1 + .012 * np.exp(-tt / .03))
    x = np.sin(2 * np.pi * fr * tt) + .45 * np.sin(4 * np.pi * fr * tt) + .22 * np.sin(6 * np.pi * fr * tt)
    x = x * np.exp(-tt / .28) + bp(rng.standard_normal(len(tt)), 300, 2000) * np.exp(-tt / .012) * .25
    a = int(.003 * SR); x[:a] *= np.linspace(0, 1, a)
    return x * v
def celesta(m, d=1.0, v=1.0):
    tt = t_(d); fr = f(m)
    return (np.sin(2 * np.pi * fr * tt) + .4 * np.sin(2 * np.pi * fr * 2.76 * tt) * np.exp(-tt / .15) + .2 * np.sin(2 * np.pi * fr * 5.4 * tt) * np.exp(-tt / .05)) * np.exp(-tt / .55) * v
def brush(d=.18, v=1.0): return bp(rng.standard_normal(len(t_(d))), 2500, 9000) * np.exp(-t_(d) / .05) * v
def snap(v=1.0): return bp(rng.standard_normal(len(t_(.08))), 1600, 3800) * np.exp(-t_(.08) / .012) * v

CH = [[50, 53, 57, 60], [55, 58, 62, 65], [52, 55, 58, 62], [57, 61, 64, 67]]   # Dm7 Gm7 Em7b5 A7
WALK = [[38, 41, 45, 42], [43, 46, 50, 47], [40, 43, 46, 44], [45, 49, 52, 49]]
SIL = (33.95, 34.45)
for b in range(26):
    T0 = b * BAR; c = b % 4
    cd = 27.5 <= T0 < 34.0                                # countdown: dominant pedal on every beat
    sneak = 13.0 <= T0 < 27.5 or 44.0 <= T0 < 49.0         # suspects / guilty: short staccato tiptoe bass
    if cd:
        for i in range(4):
            if T0 + i * BEAT < 33.0: add(bass, pizz(45 if i % 2 == 0 else 52, .4, .9), T0 + i * BEAT, .9)
    elif sneak:
        for i, m in enumerate(WALK[c]):
            add(bass, pizz(m, .22, 1.0), T0 + i * BEAT, .9)
            if i % 2 == 1: add(bass, pizz(m + 1, .14, .55), T0 + i * BEAT + .25, .9)      # chromatic tiptoe
    else:
        for i, m in enumerate(WALK[c]):
            if not (SIL[0] - .4 <= T0 + i * BEAT < SIL[1]): add(bass, pizz(m, .5, 1.0 if i == 0 else .85), T0 + i * BEAT, .9)
    if not cd and not (33.0 <= T0 < 34.5):
        pat = [(0, .7), (1.5, .55)] if not sneak else [(0.5, .45), (2.5, .4)]
        for at, v in pat:
            for k, m in enumerate(CH[c]): add(vib, vibe(m + 12, 1.1 if sneak else 1.3, v * .5), T0 + at * BEAT + k * .012, .6, -.25 + k * .15)
    if not cd and not (32.0 <= T0 < 34.0):
        sw = lp(rng.standard_normal(len(t_(BAR))), 6000) * .06 * (0.6 + .4 * np.sin(np.pi * t_(BAR) / BAR))
        add(drm, bp(sw, 2000, 8000), T0, .7, .2)
        for i in (1, 3): add(drm, brush(.18, .9), T0 + i * BEAT, .7, .25)
        if T0 < 4.0 or T0 >= 49.0 or sneak:
            for i in (1, 3): add(drm, snap(.8 if sneak else 1.0), T0 + i * BEAT, .5, -.35)
    elif cd:
        for i in range(4):
            if T0 + i * BEAT < 33.0: add(drm, brush(.12, .7), T0 + i * BEAT + .25, .5, .3)
# paint: a rising vibes run up the stairs
for i in range(8): add(vib, vibe(62 + [0, 2, 3, 5, 7, 9, 10, 12][i], .5, .5, trem=0), 4.45 + i * .22, .5, -.4 + i * .1)
# the sandwich vanishes: a falling celesta
for i, m in enumerate([86, 82, 79, 74, 70]): add(cel, celesta(m, .6, .7), 11.45 + i * .07, .5)
# AHA: celesta arpeggio
for i, m in enumerate([74, 77, 81, 86]): add(cel, celesta(m, 1.0, .9), 34.5 + i * .09, .55)
# the pawprint trail: rising celesta steps
for i in range(8): add(cel, celesta(74 + [0, 2, 3, 5, 7, 8, 10, 12][i], .5, .5), 39.05 + i * .19, .4)
# GUILTY: a low falling vibes "wah-wah"
for i, m in enumerate([57, 56, 55, 53]): add(vib, vibe(m, .9 if i < 3 else 1.6, .9, trem=2.0), 47.35 + i * .3, .7)
# outro melody that ends on the A7 tension (the loop resolves it)
MEL = [(49.5, 69), (50.0, 72), (50.25, 74), (50.75, 77), (51.0, 76), (51.25, 73), (51.5, 69)]
for t0, m in MEL: add(cel, celesta(m, .9, .8), t0, .5, .15)

mix = vib * .55 + bass * .9 + drm * .5 + cel * .45
mix = np.stack([hp(mix[:, 0], 45), hp(mix[:, 1], 45)], 1)
m = np.ones(N); a, b2, fd = int(SIL[0] * SR), int(SIL[1] * SR), int(.03 * SR)
m[a:b2] = 0; m[a - fd:a] = np.linspace(1, 0, fd)
mix *= m[:, None]
mix = norm(mix, .8)
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', mix.shape, round(len(mix) / SR, 2), 's')
