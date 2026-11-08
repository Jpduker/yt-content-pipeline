"""Old Tales #1 score: shamisen (lemo-opuscar's physically modelled pluck, with sawari buzz) + a synthesized
shakuhachi (breath noise, slide-in, meri drop) + synthesized taiko and hyoshigi + a small rin bell.
Miyako-bushi (in) scale on D: D Eb G A Bb. 56.5 s, free rhythm over a 60 BPM pulse. v2: no dead silence; the heartbeat fades into a low drone.
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python music.py  -> music/score.wav"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import pluck as P
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, add

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
DUR = 56.5; N = int(DUR * SR); rng = np.random.default_rng(56)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
sham = np.zeros((N, 2)); shk = np.zeros((N, 2)); drum = np.zeros((N, 2)); bell = np.zeros((N, 2))
def shaku(m, d, v=1., slide=1, meri=0):
    tt = t_(d); n = len(tt); f0 = hz(m)
    bend = np.ones(n); s = min(n, int(.18 * SR)); bend[:s] = 2 ** (np.linspace(-slide, 0, s) / 12)
    if meri: e = int(.35 * SR); bend[-e:] *= 2 ** (np.linspace(0, -meri, e) / 12)
    vib = 1 + .006 * np.sin(2 * np.pi * 5 * tt) * np.clip((tt - d * .55) / (d * .45), 0, 1)
    ph = 2 * np.pi * np.cumsum(f0 * bend * vib) / SR
    tone = np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    breath = bp(rng.standard_normal(n), f0 * .8, min(f0 * 4, 9000)) * .5
    env = np.minimum(1, tt / .25) * np.minimum(1, (d - tt) / .4) ** 1.2
    return (tone * .8 + breath * (.35 + .4 * np.exp(-tt / .3))) * env * v
def taiko(v=1.):
    d = .9; tt = t_(d); f = 62 * (1 + .5 * np.exp(-tt / .03))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / .35) + lp(rng.standard_normal(len(tt)), 300) * np.exp(-tt / .02) * .6) * v
def rin(m=86, d=4.0, v=1.):
    tt = t_(d); f = hz(m); return (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2.71 * tt) * np.exp(-tt / .8) + .25 * np.sin(2 * np.pi * f * 5.2 * tt) * np.exp(-tt / .3)) * np.exp(-tt / 1.6) * v
def sh(note, at, d=1.6, v=.8, pan=-.2):
    x = P.pluck('shamisen', note, d, vel=v); add(sham, x, at, .7, pan)

# I. dusk + forty days: one long shakuhachi phrase, then a slow shamisen pulse
for at, m, d, mr in [(0.3, 74, 2.2, 1), (3.0, 69, 1.6, 0), (4.8, 70, 2.4, 1)]: add(shk, shaku(m, d, .8, meri=mr), at, .6, .2)
for k in range(5): sh(['D3', 'A3', 'D3', 'G3', 'A3'][k], 3.2 + k * 1.0, 1.4, .55)
# II. night, the mist woman: no pulse; rin bell as she rises; low breath phrases
add(bell, rin(86, 5.0, .8), 9.4, .4, .3)
for at, m, d, mr in [(10.4, 62, 3.0, 1), (13.8, 63, 2.6, 0), (16.6, 67, 2.0, 1)]: add(shk, shaku(m, d, .7, slide=2, meri=mr), at, .55, -.1)
# III. the bargain: silence, then a single sawari note left ringing as the shadow is taken
sh('D3', 21.7, 4.0, .9, 0)
# IV. dawn + noon: prosperity — the shamisen ostinato, thinning when his wife turns away
pat = ['D3', 'A3', 'D4', 'A3', 'Bb3', 'A3', 'G3', 'A3']
for k in range(int((31.4 - 22.7) / .5)): sh(pat[k % 8], 22.7 + k * .5, .9, .55 + .1 * (k % 2 == 0), -.25 + .1 * (k % 3))
for k in range(4): sh(['Eb4', 'D4', 'A3', 'G3'][k], 31.6 + k * .7, 1.4, .45)
# V. night sea: taiko heartbeat that tightens into a roll, cut dead at 43.8 (ma)
tb = 34.0; gap = 1.0
while tb < 44.6:
    fade = 1 - max(0, tb - 43.2) / 1.6
    add(drum, taiko(.9 * fade), tb, .9, 0); add(drum, taiko(.55 * fade), tb + .22, .9, 0)
    tb += gap; gap = max(.3, gap * (0.9 if tb > 40.5 else .97))
add(shk, shaku(69, 2.6, .7, meri=1), 37.6, .5, .2)
# VI. the still bay: one last phrase; the bell; paper; the clappers bring the first print back
for at, m, d, mr in [(46.2, 74, 2.8, 1), (49.6, 70, 3.0, 1)]: add(shk, shaku(m, d, .75, meri=mr), at, .55, .1)
add(bell, rin(81, 5.0, .9), 52.9, .45, -.2)
add(shk, shaku(74, 1.5, .5, meri=0), 55.6, .45, .2)
# a low breath drone under the ending so the film never drops to digital silence
drone = shaku(50, 9.5, .35, slide=0); add(shk, drone, 43.8, .35, 0)

mix = sham * .8 + shk * .6 + drum * .7 + bell * .5
mix = np.stack([hp(mix[:, 0], 40), hp(mix[:, 1], 40)], 1)
mix = norm(mix, .8)
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', mix.shape, round(len(mix) / SR, 2), 's')
