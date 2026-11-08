"""Whispers · confession #1 score (original): a slow ballad on REAL recorded instruments (lemo sampler: Salamander piano CC BY 3.0,
VSCO 2 CE strings + nylon guitar CC0). 66 BPM, ~38 s, A major / F# minor. Arc: shy hope -> ache -> warmth -> a quiet vow,
ending on an open F#m(add9) that leads back to the first bar when the reel loops. The music never drops out.
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python music.py   -> music/score.wav"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR, hp, norm
D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
B = 60 / 66; BAR = 4 * B; DUR = 38.2; S.seed(11); EV = []
n = lambda t, inst, p, d, v, pan=0: EV.append((t, inst, p, d, v, pan))
# chords (bass, voicing) ; 10.5 bars of 3.64 s
PROG = [('A2', ['E3', 'A3', 'C#4', 'E4']), ('E2', ['E3', 'G#3', 'B3', 'E4']), ('F#2', ['C#3', 'F#3', 'A3', 'C#4']), ('D2', ['D3', 'F#3', 'A3', 'E4']),   # hope
        ('F#2', ['C#3', 'F#3', 'A3', 'C#4']), ('D2', ['D3', 'A3', 'C#4', 'F#4']), ('A2', ['E3', 'A3', 'C#4', 'E4']), ('E2', ['E3', 'B3', 'D4', 'G#4']),     # ache -> warmth
        ('D2', ['D3', 'F#3', 'A3', 'C#4']), ('E2', ['E3', 'G#3', 'B3', 'D4']), ('F#2', ['C#3', 'F#3', 'G#3', 'A3'])]                                         # vow, open end
for i, (bs, ch) in enumerate(PROG):
    t0 = .2 + i * BAR
    n(t0, 'piano', bs, BAR * 1.1, .4, -.15)
    for k in range(8):                                                # gentle guitar arpeggio, the heartbeat of the piece
        p = (ch + [ch[2], ch[1], ch[3], ch[2]])[k]; n(t0 + k * B / 2, 'guitar_nylon', p, B * 1.2, .3 + .06 * (k % 4 == 0), .25)
    if i >= 4:                                                        # strings enter with the ache
        n(t0, 'cellos', bs.replace('2', '3'), BAR * 1.05, .2 + .03 * (i - 4), -.25); n(t0, 'violas', ch[1], BAR * 1.05, .16 + .02 * (i - 4), .1)
    if i >= 6: n(t0, 'violins', ch[3].replace('4', '5') if i < 10 else 'G#4', BAR * 1.05, .14 + .03 * (i - 6), .3)
# piano melody: a 4-note "your name" motif that keeps coming back, higher each time
MOT = [('C#5', 0), ('E5', 1), ('D5', 2), ('C#5', 3)]
for i, base in [(0, 0), (2, 0), (4, -1), (6, 0), (7, 1), (8, 1), (9, 1)]:
    t0 = .2 + i * BAR + B * 1
    for p, k in MOT:
        if base: p = {'C#5': ['B4', 'C#5', 'E5'][base + 1], 'E5': ['D5', 'E5', 'A5'][base + 1], 'D5': ['C#5', 'D5', 'F#5'][base + 1]}.get(p, p)
        n(t0 + k * B * .75, 'piano', p, B * 1.6, .38 + .03 * i, .15)
n(.2 + 10 * BAR + B, 'piano', 'C#6', BAR, .3, .2); n(.2 + 10 * BAR + B * 2.5, 'piano', 'G#5', BAR, .25, .2)
mix = S.render(EV, dur=DUR); mix = S.room(mix, size=.6, mix=.25)
mix = np.stack([hp(mix[:, 0], 40), hp(mix[:, 1], 40)], 1); mix = norm(mix, .8)[:int(DUR * SR)]
fi = np.minimum(1, np.arange(len(mix)) / (.15 * SR)); mix *= fi[:, None]
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR); print('score', round(len(mix) / SR, 1), 's')
print('\n'.join(S.credits(sorted({e[1] for e in EV}))))
