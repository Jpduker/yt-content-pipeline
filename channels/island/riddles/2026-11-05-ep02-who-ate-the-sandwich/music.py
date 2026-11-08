"""Episode 02 score v2: a sneaky detective cool-jazz trio played on REAL recorded instruments (lemo-opuscar sampler,
CC0 libraries: VSCO 2 CE / VCSL / Sneakybass): vibraphone, jazz double bass, brushed snare + hi-hat, glockenspiel.
D minor, 120 BPM, 26 bars = 52.0 s. Dm7 | Gm7 | Em7b5 | A7 (bar 26's A7 resolves into bar 1 on the loop).
The band leaves room for the voice: sparse comping, bass and brushes carry the groove.
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python music.py  (needs: sh tools/fetch.sh instruments vsco2ce vcsl)"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR, add, hp, norm

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
BEAT, BAR, DUR = 0.5, 2.0, 52.0; S.seed(2)
EV = []                                                   # (t, inst, pitch, dur, vel, pan[, gain])
CH = [['D4', 'F4', 'A4', 'C5'], ['G3', 'Bb3', 'D4', 'F4'], ['E4', 'G4', 'Bb4', 'D5'], ['A3', 'C#4', 'G4', 'E5']]
WALK = [['D2', 'F2', 'A2', 'Ab2'], ['G2', 'Bb2', 'D3', 'B2'], ['E2', 'G2', 'Bb2', 'Bb1'], ['A1', 'C#2', 'E2', 'C#2']]
SIL = (33.95, 34.45)
quiet = lambda t: SIL[0] - .05 <= t < SIL[1]
for b in range(26):
    T0 = b * BAR; c = b % 4
    cd = 27.5 <= T0 < 34.0; sneak = 13.0 <= T0 < 27.5 or 44.0 <= T0 < 49.0
    for i in range(4):
        t = T0 + i * BEAT
        if quiet(t) or (cd and t >= 33.0): continue
        if cd: EV.append((t, 'jazz_bass', 'A1' if i % 2 == 0 else 'E2', .4, .75, -.05))           # countdown: dominant pedal
        elif sneak:
            EV.append((t, 'jazz_bass', WALK[c][i], .22, .8, -.05))                                   # tiptoe: short notes
        else: EV.append((t, 'jazz_bass', WALK[c][i], .5, .7 if i else .8, -.05))
        if not (32.0 <= t < 34.5):                                                                   # brushes: snare taps on 2 and 4, hi-hat pedal on 2 and 4
            if i in (1, 3): EV.append((t, 'snare2', 'taps', None, .35, .2)); EV.append((t, 'hihat', 'pedal', None, .35, .25))
            if sneak and i in (0, 2): EV.append((t + .25, 'hihat', 'closed', None, .18, .3))
    if not cd and not (33.0 <= T0 < 34.5):                                                           # vibes comping (Charleston), softer and off-beat in the sneaky parts
        for at, v in ([(0, .4), (1.5, .32)] if not sneak else [(.5, .28), (2.5, .26)]):
            for k, p in enumerate(CH[c]): EV.append((T0 + at * BEAT + k * .01, 'vibraphone', p, 1.2 if not sneak else .6, v, -.3 + k * .15))
for i, p in enumerate(['D5', 'E5', 'F5', 'G5', 'A5', 'Bb5', 'C6', 'D6']): EV.append((4.45 + i * .22, 'vibraphone', p, .5, .45, -.4 + i * .1))      # paint run up the stairs
for i, p in enumerate(['D7', 'A6', 'F6', 'D6', 'A5']): EV.append((11.45 + i * .07, 'glockenspiel', p, .6, .4, .2))                             # sandwich vanishes
for i, p in enumerate(['D6', 'F6', 'A6', 'D7']): EV.append((34.5 + i * .09, 'glockenspiel', p, 1.0, .55, .15))                                  # AHA
for i, p in enumerate(['D6', 'E6', 'F6', 'G6', 'A6', 'Bb6', 'C7', 'D7']): EV.append((39.05 + i * .19, 'glockenspiel', p, .5, .32, -.1 + i * .03))  # pawprints
for i, p in enumerate(['A2', 'Ab2', 'G2', 'F2']): EV.append((47.35 + i * .3, 'trombone_stac' if i < 3 else 'trombone', p, .9 if i < 3 else 1.6, .55, .1))  # GUILTY wah-wah
EV.append((47.35, 'sus_cymbal', 'hit', None, .35, .3))
for t0, p in [(49.5, 'A4'), (50.0, 'C5'), (50.25, 'D5'), (50.75, 'F5'), (51.0, 'E5'), (51.25, 'C#5'), (51.5, 'A4')]: EV.append((t0, 'vibraphone', p, .9, .5, .15))
mix = S.render(EV, dur=DUR)
mix = S.room(mix, size=.35, mix=.14)
m = np.ones(len(mix)); a, b, fd = int(SIL[0] * SR), int(SIL[1] * SR), int(.03 * SR); m[a:b] = 0; m[a - fd:a] = np.linspace(1, 0, fd); mix = mix * m[:, None]
mix = np.stack([hp(mix[:, 0], 40), hp(mix[:, 1], 40)], 1)
mix = norm(mix, .8)[:int(DUR * SR)]
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', mix.shape, round(len(mix) / SR, 2), 's')
print('\n'.join(S.credits(sorted({e[1] for e in EV}))))
