"""Stickman Short score v2 on REAL recorded instruments (lemo-opuscar sampler, CC0): marimba lead, ukulele strums,
upright bass pizzicato, claps, shaker, glockenspiel accents. 120 BPM, C major, 19 bars = 38.0 s. C | Am | F | G.
The band holds its breath for the truth beat and the drum roll. Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python music.py"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR, hp, norm

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
BEAT, BAR, DUR = 0.5, 2.0, 38.0; S.seed(7); EV = []
CH = [['C4', 'E4', 'G4', 'C5'], ['A3', 'C4', 'E4', 'A4'], ['F3', 'A3', 'C4', 'F4'], ['G3', 'B3', 'D4', 'G4']]
ROOT = [['C2', 'G2'], ['A1', 'E2'], ['F1', 'C2'], ['G1', 'D2']]
MEL = [['C6', 'E6', 'G6', 'E6'], ['C6', 'A5', 'C6', 'E6'], ['F6', 'E6', 'C6', 'A5'], ['B5', 'D6', 'G6', 'D6']]
quiet = lambda t: 29.0 <= t < 31.0 or 31.4 <= t < 32.75
for b in range(19):
    T0 = b * BAR; c = b % 4
    for i in range(4):
        t = T0 + i * BEAT
        if quiet(t): continue
        EV.append((t, 'contrabass_pizz', ROOT[c][i % 2], .45, .7, -.05))
        EV.append((t + .25, 'shaker', 'down' if i % 2 else 'up', None, .3, .35))
        if i in (1, 3): EV.append((t, 'claps', 'group', None, .4, -.15))
        if not (26.0 <= t < 29.0): EV.append((t, 'ukulele', CH[c][0], .3, .4, -.3))
        if not (26.0 <= t < 29.0):
            for k, p in enumerate(CH[c][1:]): EV.append((t + .015 * (k + 1), 'ukulele', p, .3, .38, -.2 + k * .2))
    if 4.0 <= T0 < 26.0 and not quiet(T0):
        for i, p in enumerate(MEL[c]): EV.append((T0 + i * BEAT, 'marimba', p, .5, .5, .25))
        if 11.5 <= T0 < 16.0:
            for i, p in enumerate(MEL[c]): EV.append((T0 + i * BEAT + .25, 'xylophone', p, .3, .28, -.25))
for t0 in (2.9, 7.0, 10.75): EV.append((t0, 'glockenspiel', 'C7', .5, .3, .2))       # a tiny ping on each shrink
EV.append((32.75, 'glockenspiel', 'G6', 1.0, .5, 0)); EV.append((32.8, 'glockenspiel', 'C7', 1.0, .5, 0))   # SAME!
mix = S.render(EV, dur=DUR); mix = S.room(mix, size=.25, mix=.1)
duck = np.ones(len(mix)); a, b2 = int(26.0 * SR), int(29.0 * SR); duck[a:b2] = .5; mix = mix * duck[:, None]
mix = np.stack([hp(mix[:, 0], 40), hp(mix[:, 1], 40)], 1)
mix = norm(mix, .8)[:int(DUR * SR)]
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', mix.shape, round(len(mix) / SR, 2), 's')
