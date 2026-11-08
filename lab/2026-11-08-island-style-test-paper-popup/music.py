"""Style-test score "The Bottle That Lied" (24 s): a curious toy-box mystery on REAL sampled instruments (lemo sampler, CC0 VSCO2 CE /
VCSL / FreePats): pizzicato strings walk, staccato clarinet tune, glockenspiel sparkles, kalimba, woodblock ticks on the countdown.
D dorian, 100 BPM (beat 0.6 s). Hook sting at 0.3; countdown 9.95-12.95 (only ticks + tremolo); AHA arpeggio 13.75; open question at 19.3.
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python music.py"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR, hp, norm
D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
B, DUR = .6, 24.0; S.seed(5); EV = []
BASS = ['D2', 'A2', 'F2', 'A2', 'G2', 'D3', 'Bb2', 'A2', 'D2', 'A2', 'F2', 'C3', 'G2', 'D3', 'A2', 'C#3']
TUNE = [(0, 'A4'), (1, 'D5'), (1.5, 'E5'), (2, 'F5'), (3, 'E5'), (4, 'D5'), (5.5, 'C5'), (6, 'D5'), (7, 'A4'),
        (8, 'Bb4'), (9, 'D5'), (9.5, 'F5'), (10, 'G5'), (11, 'F5'), (12, 'E5'), (13, 'C#5'), (14, 'D5')]
CD = (9.95, 13.35)
for i in range(int(DUR / B)):
    t = i * B
    if CD[0] - .05 <= t < CD[1] or t > 22.6: continue
    EV.append((t, 'cellos_pizz' if i % 2 == 0 else 'violas_pizz', BASS[i % 16], .3, .62 if i % 2 == 0 else .45, -.15))
    if 5.8 < t < 9.6 and i % 2: EV.append((t, 'woodblock', 'a', None, .22, .35))
for k, (b, p) in enumerate(TUNE):                                                      # clarinet tune under the setup (bars 2-4)
    t = 2.4 + b * B
    if t < CD[0] - .2: EV.append((t, 'clarinet_stac', p, .25, .5, .2))
for i, p in enumerate(['D6', 'A5', 'F6', 'E6']): EV.append((.3 + i * .09, 'glockenspiel', p, .8, .5, .1))            # hook sting
for i, p in enumerate(['A5', 'C#6', 'E6', 'A6']): EV.append((7.55 + i * .07, 'glockenspiel', p, .8, .45, .2))       # Gus knows
for k, t in enumerate([9.95, 10.95, 11.95]):                                                                          # countdown ticks + tremolo bed
    EV.append((t, 'woodblock', 'a', None, .6, 0)); EV.append((t + .5, 'woodblock', 'a', None, .3, 0))
EV.append((9.95, 'violins_trem', 'A4', 3.3, .35, -.2)); EV.append((9.95, 'violins_trem', 'C#5', 3.3, .3, .2)); EV.append((9.95, 'cellos', 'D3', 3.3, .4, 0))
for i, p in enumerate(['D5', 'F#5', 'A5', 'D6', 'F#6', 'A6']): EV.append((13.7 + i * .08, 'glockenspiel', p, 1.0, .55, -.2 + i * .08))   # AHA (major)
for i, p in enumerate(['D4', 'F#4', 'A4', 'D5']): EV.append((13.7 + i * .02, 'kalimba', p, 1.5, .5, .1))
for t, p in [(16.4, 'D5'), (16.7, 'E5'), (17.0, 'F#5'), (17.3, 'G5'), (17.6, 'A5'), (17.9, 'B5')]: EV.append((t, 'kalimba', p, .5, .4, .2))   # calendar flips
for t, p, d in [(19.3, 'D3', 1.2), (20.5, 'Eb3', 1.0), (21.5, 'D3', 2.4)]: EV.append((t, 'cellos', p, d, .5, -.1))                       # who wrote it? (half-step unease)
for i, p in enumerate(['A5', 'G#5', 'G5']): EV.append((21.6 + i * .35, 'glockenspiel', p, .9, .35, .15))
mix = S.render(EV, dur=DUR); mix = S.room(mix, size=.3, mix=.12)
mix = norm(np.stack([hp(mix[:, 0], 40), hp(mix[:, 1], 40)], 1), .8)[:int(DUR * SR)]
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR); print('score.wav', round(len(mix) / SR, 2), 's')
print('\n'.join(S.credits(sorted({e[1] for e in EV}))))
