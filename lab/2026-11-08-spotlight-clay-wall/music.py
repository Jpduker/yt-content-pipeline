"""The Wall of I'm Fine: score on REAL recorded instruments (lemo sampler: Salamander piano CC BY 3.0, VSCO 2 CE strings CC0).
72 BPM. D minor while he builds the wall, a near-empty piano when he is alone, a string swell when the first brick goes,
then F major as the wall comes down. Wordless film: the music carries it.  Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python music.py"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR, hp, norm
D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
DUR = 30.0; B = 60 / 72; S.seed(5); EV = []
n = lambda t, inst, p, d, v, pan=0: EV.append((t, inst, p, d, v, pan))
# I. 0–7.5  "I'm fine": piano alone, i–VI–III–VII in D minor, a falling 4-note motif
L = [['D2', 'A2', 'D3'], ['Bb1', 'F2', 'Bb2'], ['F2', 'C3', 'F3'], ['C2', 'G2', 'C3']]
MOT = ['A4', 'F4', 'E4', 'D4']
for i in range(4):
    t0 = .3 + i * 2 * B
    for k, p in enumerate(L[i]): n(t0 + k * .04, 'piano', p, 2.4, .42, -.2)
    n(t0 + B * .0, 'piano', MOT[i], 1.6, .5, .2)
    if i % 2: n(t0 + B, 'piano', ['F4', 'G4'][i // 2], 1.0, .35, .25)
# II. 7.5–11  the wall rises: low strings swell, piano octaves pulse faster, timpani roll
for i, (p, q) in enumerate([('D2', 'D3'), ('Bb1', 'Bb2'), ('F2', 'F3'), ('C2', 'C3')]):
    t0 = 7.5 + i * .9; n(t0, 'cellos', q, 1.1, .45 + i * .1, -.2); n(t0, 'contrabass', p, 1.1, .4 + i * .1, -.1)
    n(t0, 'violins_trem', ['A4', 'Bb4', 'C5', 'E5'][i], 1.0, .25 + i * .1, .25)
t = 7.5; step = .42
while t < 10.9: n(t, 'piano', 'D2', .3, .35 + (t - 7.5) * .08, -.3); n(t + .01, 'piano', 'D3', .3, .3 + (t - 7.5) * .07, -.2); t += step; step = max(.14, step * .9)
for k in range(14): n(9.4 + k * .1, 'timpani', 'D2', .3, .25 + k * .045, 0)
n(10.95, 'timpani', 'D2', 2.0, .9, 0)
# III. 11–15.3  alone: a held viola pad and single high piano notes (never silence)
n(11.1, 'violas', 'D4', 4.2, .22, -.1); n(11.1, 'cellos', 'D3', 4.2, .18, .1)
for t0, p in [(11.6, 'A5'), (12.9, 'F5'), (14.7, 'E5')]: n(t0, 'piano', p, 2.5, .3, .3)
# IV. 15.3–17.8  he decides: a low pedal and a repeated note, getting closer
n(15.3, 'cellos', 'D2', 2.6, .35, -.1); n(15.3, 'contrabass', 'D1', 2.6, .3, 0)
for k in range(6): n(15.5 + k * .38, 'piano', 'A4', .35, .25 + k * .05, .2)
# V. 17.85–23  the wall comes down: timpani, then strings bloom in F major with a rising piano
n(17.85, 'timpani', 'F2', 1.5, .8, 0)
CH = [(18.3, ['F2', 'F3', 'A3', 'C4']), (19.97, ['C2', 'C3', 'G3', 'E4']), (21.63, ['D2', 'D3', 'A3', 'F4']), (23.3, ['Bb1', 'Bb2', 'F3', 'D4'])]
for t0, ch in CH:
    n(t0, 'contrabass', ch[0], 1.8, .45, -.1); n(t0, 'cellos', ch[1], 1.8, .5, -.2); n(t0, 'violas', ch[2], 1.8, .45, .1); n(t0, 'violins', ch[3], 1.8, .45, .25)
    for k in range(4): n(t0 + k * B / 2, 'piano', [ch[1], ch[2], ch[3], ch[2]][k].replace('2', '4').replace('3', '4') if k else ch[3], .6, .35, .15)
MEL = [(19.0, 'C5'), (19.83, 'D5'), (20.25, 'F5'), (21.1, 'E5'), (21.9, 'D5'), (22.75, 'C5'), (23.6, 'D5'), (24.4, 'F5'), (25.3, 'A5')]
for t0, p in MEL: n(t0, 'violins', p, 1.0, .5, .3)
# VI. 25–30  together: the motif comes back in F major, soft, and lands home
for t0, ch in [(25.0, ['F2', 'C3', 'F3']), (26.67, ['Bb1', 'F2', 'Bb2']), (28.3, ['F2', 'C3', 'A3'])]:
    for k, p in enumerate(ch): n(t0 + k * .05, 'piano', p, 2.2, .38, -.2)
for t0, p in [(25.0, 'C5'), (25.85, 'A4'), (26.67, 'D5'), (27.5, 'C5'), (28.3, 'A4'), (28.75, 'F4')]: n(t0, 'piano', p, 1.4, .42, .2)
n(25.0, 'violins', 'A4', 4.5, .22, .3); n(25.0, 'cellos', 'F2', 4.5, .25, -.2)
mix = S.render(EV, dur=DUR); mix = S.room(mix, size=.7, mix=.28)
fade = np.ones(len(mix)); a = int(28.9 * SR); fade[a:] = np.linspace(1, 0, len(mix) - a) ** 1.5; mix = mix * fade[:, None]
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1); mix = norm(mix, .8)[:int(DUR * SR)]
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR); print('score.wav', round(len(mix) / SR, 2))
print('\n'.join(S.credits(sorted({e[1] for e in EV}))))
