"""Floor Minus Ep1 score: real recorded instruments (lemo-opuscar sampler; VSCO 2 CE / VCSL / Karoryfer, CC0), 282 s, E minor.
One colour per floor, so each world sounds different (Jp: "music is everything"):
  elevator = a dry ticking motif (marimba + muted trumpet "Muzak") that comes back every ride, a little more wrong each time;
  −1 polite = a too-sweet waltz (pizz + clarinet + glock) that lurches when the floor tilts;
  −2 rain-up = harp and vibes played in REVERSE order (falling lines upside-down: rising), bowed vibes pad, low water drone;
  −3 quiet = almost nothing: a heartbeat bass and single bowed notes, each lost light takes one note away;
  −4 home = the elevator motif as a warm lullaby on celesta-like glock + strings… until the other You turns round (a cluster stab).
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python music.py   (needs: sh tools/fetch.sh instruments vsco2ce vcsl karoryfer)"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR, hp, norm

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
DUR = 282.0; S.seed(11); EV = []
def E(t, inst, pitch, dur=None, vel=.6, pan=0.0, gain=1.0, attack=None):
    e = dict(t=round(t, 4), inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain)
    if attack: e['attack'] = attack
    EV.append(e)
def pad(t, inst, notes, dur, vel=.4, attack=.8, spread=.5):
    for i, n in enumerate(notes): E(t + i * .01, inst, n, dur, vel, -spread / 2 + spread * i / max(1, len(notes) - 1), 1.0, attack)

# the elevator motif (E minor): E G B A | G F# E — played on marimba, muted trumpet answers
LIFT = [(0, 'E5'), (.25, 'G5'), (.5, 'B5'), (1.0, 'A5'), (1.5, 'G5'), (1.75, 'F#5'), (2.0, 'E5')]
def lift_ride(t0, t1, wrong=0):
    t = t0
    while t + 4 <= t1 + .01:
        for at, p in LIFT: E(t + at, 'marimba', p if not (wrong and at == 1.0) else ('Bb5' if wrong == 1 else 'C6'), None, .45, -.2)
        E(t + 2.5, 'trumpet_mute', 'B4', .6, .35, .2); E(t + 3.0, 'trumpet_mute', 'A4' if not wrong else 'Bb4', .8, .35, .2)
        for b in range(8): E(t + b * .5, 'hihat', 'closed', None, .15, .3)
        E(t, 'jazz_bass', 'E2', .4, .6); E(t + 2, 'jazz_bass', 'B1', .4, .55)
        t += 4.0

# ---------------------------------------------------------------- hook (0–23)
pad(0.0, 'contrabass', ['E2'], 7.2, .35, 1.5); pad(0.0, 'vibraphone_bowed', ['B4'], 7.0, .2, 1.0)
for k in range(7): E(0.5 + k, 'timpani', 'B2', None, .14 + .02 * k)
lift_ride(11.0, 19.0, 0)
E(19.1, 'timpani', 'E3', None, .75); E(19.1, 'sus_cymbal', 'hit', None, .5); pad(19.1, 'horn', ['E3', 'B3', 'E4'], 2.6, .55, .05); pad(19.1, 'trombone', ['E2', 'B2'], 2.6, .45, .05)
for i, p in enumerate(['E6', 'G6', 'B6', 'E7']): E(21.2 + i * .12, 'glockenspiel', p, None, .35, .2)

# ---------------------------------------------------------------- floor −1: a too-sweet waltz (3/4, 1.8 s bars)
WALTZ = [('G2', ['B3', 'D4']), ('D2', ['A3', 'C4']), ('E2', ['G3', 'B3']), ('C2', ['G3', 'C4'])]
TUNE = ['B4', 'D5', 'G5', 'F#5', 'E5', 'D5', 'C5', 'E5', 'G5', 'B4', 'A4', 'G4']
def waltz(t0, t1, lurch=()):
    b, t = 0, t0
    while t + 1.8 <= t1 + .01:
        bass, ch = WALTZ[b % 4]
        E(t, 'cellos_pizz', bass, None, .55, -.2)
        for k in (1, 2):
            for i, p in enumerate(ch): E(t + k * .6 + i * .01, 'violins_pizz', p, None, .35, .15)
        if b % 2 == 0: E(t, 'clarinet', TUNE[(b // 2 * 3) % 12], 1.0, .32, .1); E(t + 1.2, 'clarinet', TUNE[(b // 2 * 3 + 1) % 12], .5, .3, .1)
        else: E(t, 'clarinet', TUNE[(b // 2 * 3 + 2) % 12], 1.6, .3, .1)
        b += 1; t += 1.8
waltz(24.0, 33.6)
# the tilt (34.0–41.7): the waltz slides off key: trombone gliss down, timpani, a held queasy chord
E(34.0, 'timpani', 'G2', None, .7)
for i, p in enumerate(['G3', 'F3', 'Eb3', 'Db3', 'C3']): E(34.0 + i * .18, 'trombone_stac', p, None, .55, .1)
pad(34.2, 'violins_trem', ['Bb4', 'B4'], 4.0, .25, .3); pad(34.2, 'cellos', ['E2', 'F2'], 4.0, .3, .3)
E(40.6, 'glockenspiel', 'G6', None, .45); E(40.75, 'glockenspiel', 'B6', None, .45); E(41.6, 'timpani', 'G2', None, .45)     # "thank you" → level
waltz(42.0, 71.4)
for i, p in enumerate(['G6', 'B6', 'D7']): E(52.0 + i * .1, 'glockenspiel', p, None, .35, .3)                                   # Nora
E(65.6, 'xylophone', 'E6', None, .4, .3)                                                                                          # food 3 → 2
# the running man (68.8–72): tuba oompah double time, then the big tilt
for i in range(6): E(69.0 + i * .45, 'tuba_stac', ['A1', 'D2'][i % 2], None, .5, -.1)
E(71.9, 'timpani', 'F2', None, .85); E(71.9, 'bass_drum', None, None, .7); E(72.0, 'sus_cymbal', 'cresc', 2.5, .4)
for i, p in enumerate(['C5', 'B4', 'Bb4', 'A4', 'Ab4', 'G4', 'F#4', 'F4']): E(72.2 + i * .3, 'clarinet_stac', p, None, .4, .2)
pad(76.6, 'horn', ['G3', 'D4'], 1.4, .35, .1)
waltz(77.4, 81.0)
E(80.4, 'tubular_bells', 'C5', None, .45); E(81.6, 'tubular_bells', 'G4', None, .4)                                               # midnight
lift_ride(83.2, 95.2, 1)

# ---------------------------------------------------------------- floor −2: rising lines, water drone
pad(97.0, 'contrabass', ['E2'], 46.0, .3, 2.0); pad(97.0, 'vibraphone_bowed', ['E4', 'B4'], 22.0, .2, 2.0); pad(119.0, 'vibraphone_bowed', ['C5', 'G4'], 24.0, .2, 2.0)
RISE = ['E4', 'G4', 'B4', 'D5', 'E5', 'G5', 'B5', 'D6']
for k in range(22):
    t0 = 97.4 + k * 2.0
    for i, p in enumerate(RISE[:6] if k % 2 else RISE[2:]): E(t0 + i * .16, 'harp', p, None, .26, -.3 + i * .1)
    if k % 2 == 0: E(t0 + 1.0, 'vibraphone', ['B5', 'G5', 'A5', 'E5'][(k // 2) % 4], 1.0, .3, .2)
for i in range(16): E(112.0 + i * .52, 'cellos_pizz', ['E2', 'B2', 'G2', 'B2'][i % 4], None, .4, -.1)                              # crawl
pad(121.2, 'violins_trem', ['E5', 'F5'], 6.4, .2, 1.0); E(124.4, 'timpani', 'E3', None, .6); pad(124.4, 'horn', ['E3', 'Bb3'], 2.6, .45, .05)  # the note
pad(128.0, 'cellos', ['E3', 'F3'], 4.5, .3, 1.0)
for k in range(10): E(133.0 + k * .9, 'timpani', 'B2', None, .2 + .03 * k)                                                       # water almost down
lift_ride(143.6, 155.6, 2)

# ---------------------------------------------------------------- floor −3: almost nothing; each lost light takes a note away
OFF = [171.2, 179.4, 184.0, 184.7, 185.4, 186.1, 212.9]
NOTES = ['E5', 'B4', 'G4', 'D5', 'F#4', 'A4', 'C5', 'E4', 'B3', 'A3']           # ten bowed notes = ten lights
for i, p in enumerate(NOTES):
    end = OFF[i] if i < len(OFF) else 221.0
    if end > 158.4: pad(158.4 + i * .3, 'vibraphone_bowed' if i % 2 else 'violins', [p], end - (158.4 + i * .3), .12 if i % 2 == 0 else .16, 2.0, 0)
t = 160.0
while t < 220.0:                                                                                                                  # heartbeat bass (faster while Nora is gone)
    E(t, 'jazz_bass', 'E2', .2, .45, -.05); E(t + .28, 'jazz_bass', 'E2', .15, .3, -.05)
    t += .7 if 194.6 <= t < 204.6 else 1.15
E(183.0, 'trumpet_mute', 'E5', .4, .6, .2); E(183.5, 'trumpet_mute', 'G5', .4, .6, .2); E(184.0, 'trumpet_mute', 'A5', .8, .65, .2)   # the Operator's jingle (loud)
E(204.6, 'glockenspiel', 'F6', None, .3); pad(204.6, 'violins_trem', ['F4', 'F#4'], 6.0, .14, 1.5)                               # she's back… wrong
E(209.6, 'timpani', 'E3', None, .55); E(209.6, 'vibraphone_hard', 'Bb4', 2.0, .4)                                                 # blue scarf
lift_ride(221.2, 237.2, 2)

# ---------------------------------------------------------------- floor −4: home lullaby → the other You
for k in range(4):
    t0 = 240.6 + k * 4.0
    for at, p in LIFT: E(t0 + at * 1.4, 'glockenspiel', p.replace('5', '6'), None, .22, .1)
    pad(t0, 'violins', [['G4', 'B4'], ['E4', 'G4'], ['C4', 'E4'], ['D4', 'F#4']][k], 3.9, .2, .8)
    E(t0, 'harp', ['G2', 'E2', 'C2', 'D2'][k], None, .4, -.2)
pad(249.6, 'violins_trem', ['B4', 'C5'], 5.0, .2, 1.0); pad(249.6, 'contrabass', ['E2'], 7.6, .3, 1.0)
E(257.2, 'timpani', 'E3', None, .85); E(257.2, 'bass_drum', None, None, .8); E(257.2, 'sus_cymbal', 'hit', None, .55)
pad(257.2, 'horn', ['E3', 'F3', 'Bb3'], 3.0, .55, .03); pad(257.2, 'trombone', ['E2', 'Bb2'], 3.0, .5, .03); pad(257.2, 'violins', ['E5', 'F5'], 3.4, .35, .03)
pad(260.4, 'vibraphone_bowed', ['E4', 'Bb4'], 6.0, .2, .8)
lift_ride(266.6, 278.6, 2)
pad(278.6, 'vibraphone_bowed', ['E4', 'B4'], 3.4, .2, .3)

mix = S.render(EV, dur=DUR)
mix = S.room(mix, size=.35, mix=.14)
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
fade = int(1.0 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = norm(mix, .8)[:int(DUR * SR)]
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', round(len(mix) / SR, 2), 's,', len(EV), 'notes')
print('\n'.join(S.credits(sorted({e['inst'] for e in EV}))))
