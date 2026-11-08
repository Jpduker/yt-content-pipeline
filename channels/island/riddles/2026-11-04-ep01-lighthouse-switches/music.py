"""Episode 01 score: an original West-Coast cool-jazz combo, fully synthesized (no samples):
vibraphone (motor tremolo), pizzicato-style upright bass, brushes, finger snaps, celesta.
120 BPM, 4/4, 20 bars = 40.0 s. Progression Fmaj7 | Dm7 | Gm7 | C7 (loops, so bar 20's C7 resolves into bar 1).
Run: $LIB/.venv/bin/python music.py   ->  music/score.wav"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, add

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
BEAT, BAR, DUR = 0.5, 2.0, 40.0
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

CH = [[53, 57, 60, 64], [50, 53, 57, 60], [55, 58, 62, 65], [48, 52, 55, 58]]   # Fmaj7 Dm7 Gm7 C7
WALK = [[41, 45, 48, 50], [38, 41, 45, 43], [43, 46, 50, 49], [36, 40, 43, 40]]
def on(t0, t1, t): return t0 <= t < t1

for b in range(20):
    T0 = b * BAR; c = b % 4
    music_off = on(20.4, 21.0, T0)
    # --- bass
    if 4.0 <= T0 < 8.0:                                   # the climb: chromatic eighths up the tower
        for i in range(8): m = 41 + (b - 2) * 8 + i; add(bass, pizz(m, .3, .8), T0 + i * .25, .9)
    elif 14.0 <= T0 < 20.0:                               # countdown: dominant pedal on every beat
        for i in range(4): add(bass, pizz(36 if i % 2 == 0 else 43, .45, .9), T0 + i * BEAT, .9)
    elif not music_off:
        for i, m in enumerate(WALK[c]): add(bass, pizz(m, .5, 1.0 if i == 0 else .85), T0 + i * BEAT, .9)
    # --- vibes comping (Charleston: beat 1 and the 'and' of 2), skipped in the countdown
    if not (14.0 <= T0 < 21.0):
        for at, v in [(0, .8), (1.5, .6)]:
            for k, m in enumerate(CH[c]): add(vib, vibe(m + 12, 1.3, v * .5), T0 + at * BEAT + k * .012, .6, -.25 + k * .15)
    # --- brushes + snaps
    if not (20.0 <= T0 < 21.0):
        sw = lp(rng.standard_normal(len(t_(BAR))), 6000) * .06 * (0.6 + .4 * np.sin(np.pi * t_(BAR) / BAR))
        add(drm, bp(sw, 2000, 8000), T0, .7, .2)
        for i in (1, 3): add(drm, brush(.18, .9), T0 + i * BEAT, .7, .25)
        if T0 < 4.0 or T0 >= 35.0:
            for i in (1, 3): add(drm, snap(), T0 + i * BEAT, .5, -.35)

# vibraphone glissando into the lamp (end of the first climb)
for i, m in enumerate(range(65, 89, 2)): add(vib, vibe(m, .5, .55, trem=0), 7.1 + i * .045, .55, -.4 + i * .07)
# "AHA": celesta arpeggio + the combo comes back
for i, m in enumerate([77, 81, 84, 89]): add(cel, celesta(m, 1.0, .9), 21.0 + i * .09, .55)
# outcomes: one tremolo chord per block (lit = Fmaj7 high, warm = Dm7, cold = Gm7)
for t0, c in [(29.75, 0), (31.5, 1), (33.25, 2)]:
    for k, m in enumerate(CH[c]): add(vib, vibe(m + 24, 1.6, .45, trem=1.6), t0 + k * .02, .55, -.3 + k * .2)
# moral + outro: a short original celesta melody that ends on the C7 tension (the loop resolves it)
MEL = [(35.25, 72), (35.75, 76), (36.0, 77), (36.5, 81), (37.25, 79), (37.75, 77), (38.0, 76), (38.5, 74), (39.0, 72), (39.5, 70)]
for t0, m in MEL: add(cel, celesta(m, .9, .8), t0, .5, .15)

mix = vib * .55 + bass * .9 + drm * .5 + cel * .45
# keep the low end in check (lemo TECHNIQUE §5): gentle high-pass under 45 Hz
mix = np.stack([hp(mix[:, 0], 45), hp(mix[:, 1], 45)], 1)
# hard cut for the silence before the reveal (20.4–21.0), with short fades
m = np.ones(N); a, b2, fd = int(20.4 * SR), int(21.0 * SR), int(.03 * SR)
m[a:b2] = 0; m[a - fd:a] = np.linspace(1, 0, fd)
mix *= m[:, None]
mix = norm(mix, .8)
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', mix.shape, round(len(mix) / SR, 2), 's')
