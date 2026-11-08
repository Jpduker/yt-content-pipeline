"""Chapter 1 score: real recorded instruments (lemo-opuscar sampler; VSCO 2 CE / VCSL / Karoryfer, all CC0), 312 s, D minor.
Energy arc (Jp: "music is everything"): storm → title theme → bright morning that sours → detective groove (riddles) →
tiptoe comedy → near-silence in the dark → mystery (cellar, Old-Tale flute) → drone in the tunnel → false calm at noon →
hit + the Stranger's motif → title theme reprise left unresolved for Chapter 2.
The band leaves room for the voice: sparse in narration, fuller in the gaps; mix.py ducks it further under speech.
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python music.py   (needs: sh tools/fetch.sh instruments vsco2ce vcsl karoryfer)"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf
from core.audio import sampler as S
from core.audio.sfx import SR, hp, norm

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'music'), exist_ok=True)
DUR = 312.0; S.seed(7); EV = []
def E(t, inst, pitch, dur=None, vel=.6, pan=0.0, gain=1.0, attack=None):
    e = dict(t=round(t, 4), inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain)
    if attack: e['attack'] = attack
    EV.append(e)
def pad(t, inst, notes, dur, vel=.4, attack=.8, gain=1.0, spread=.5):
    for i, n in enumerate(notes): E(t + i * .01, inst, n, dur, vel, -spread / 2 + spread * i / max(1, len(notes) - 1), gain, attack)
def roll(t, d, vel=.35):                                           # suspended-cymbal swell
    E(t, 'sus_cymbal', 'cresc', d, vel, .2)

# ---------------------------------------------------------------- the two themes
# TITLE (horn): D A | F E D | C D A  — a sea-shanty arch in minor
TITLE = [(0, 'D4', .9), (1, 'A4', 1.4), (2.5, 'F4', .5), (3, 'E4', .5), (3.5, 'D4', .9), (4.5, 'C4', .5), (5, 'D4', .5), (5.5, 'A3', 1.6)]
# CREW (clarinet stac / pizz): playful, major-ish
CREW = [(0, 'F4'), (.25, 'A4'), (.5, 'C5'), (1, 'D5'), (1.5, 'C5'), (1.75, 'A4'), (2, 'G4'), (2.5, 'F4'), (3, 'G4'), (3.5, 'A4')]
def title_theme(t0, sp=.62, vel=.62, inst='horn'):
    for at, p, d in TITLE: E(t0 + at * sp, inst, p, d * sp * 1.1, vel, -.1)

# ---------------------------------------------------------------- A · storm (0–32)
pad(0.0, 'contrabass', ['D2'], 9.6, .55, 1.2, 1.1)
pad(0.0, 'cellos', ['D3', 'A3'], 9.4, .4, 1.5, .9)
for k in range(9): E(0.6 + k * 1.0, 'timpani', 'D3' if k % 4 else 'A2', None, .25 + .04 * (k % 3), .1)
E(0.6, 'bass_drum', None, None, .7); E(4.3, 'bass_drum', None, None, .6)
pad(5.6, 'violins_trem', ['F4', 'A4'], 4.0, .3, 1.0, .9)
pad(5.6, 'horn', ['D3', 'F3'], 3.6, .4, .8, .8)
E(9.6, 'timpani', 'D3', None, .8); E(9.6, 'gong', None, None, .5)
# the dark (9.6–22): one cold drone + a heartbeat on each second; nothing else
pad(9.8, 'contrabass', ['D2'], 12.2, .35, 1.5, .8)
pad(9.8, 'vibraphone_bowed', ['A4'], 12.0, .25, 1.0, .6)
for s in range(12): E(9.8 + s, 'timpani', 'A2', None, .18 + s * .015, -.1)
roll(19.2, 2.8, .45)
# lamp returns: a rising horn chord, then the TITLE theme on full orchestra
pad(22.0, 'horn', ['D3', 'A3', 'D4'], 4.4, .5, .3)
pad(22.0, 'cellos', ['D3', 'A3'], 4.6, .45, .3)
pad(22.0, 'violins', ['F4', 'A4'], 4.4, .35, .5)
E(26.6, 'timpani', 'D3', None, .7); E(26.6, 'sus_cymbal', 'hit', None, .5)
title_theme(26.6, .62, .7)
pad(26.6, 'cellos', ['D3', 'A3'], 2.4, .45, .1); pad(28.6, 'cellos', ['Bb2', 'F3'], 1.4, .45, .1); pad(30.0, 'cellos', ['A2', 'E3'], 1.9, .45, .1)
pad(26.6, 'violins', ['D5', 'F5'], 2.4, .32, .2); pad(28.6, 'violins', ['D5', 'F5'], 1.4, .32, .1); pad(30.0, 'violins', ['C#5', 'E5'], 1.9, .32, .1)
pad(26.6, 'contrabass', ['D2'], 2.4, .5, .1); pad(28.6, 'contrabass', ['Bb1'], 1.4, .5, .1); pad(30.0, 'contrabass', ['A1'], 1.9, .5, .1)

# ---------------------------------------------------------------- B · morning (32–62): bright harp + flute, soured by the harbour master
HARP_D = ['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'A4', 'F#4']; HARP_G = ['G2', 'D3', 'G3', 'B3', 'D4', 'G4', 'D4', 'B3']
for b in range(5):                                                  # 32–43: 5 bars of harp, 2.2 s each
    arp = HARP_D if b % 2 == 0 else HARP_G
    for i, p in enumerate(arp): E(32.4 + b * 2.2 + i * .275, 'harp', p, None, .38, -.3 + .08 * i)
for at, p, d in [(0, 'A5', .6), (.6, 'F#5', .4), (1.0, 'D5', 1.0), (2.2, 'E5', .5), (2.75, 'F#5', .5), (3.3, 'A5', 1.2), (4.6, 'B5', .5), (5.1, 'A5', 1.5)]: E(34.6 + at, 'flute', p, d, .32, .2)
# 43.2: the harbour master — music sours (minor, bassoon grumble)
for i, p in enumerate(['D2', 'D2', 'F2', 'D2', 'Ab2', 'G2', 'F2', 'D2']): E(43.3 + i * .5, 'bassoon_stac', p, None, .55, .15)
pad(43.3, 'cellos', ['D3', 'Ab3'], 5.0, .3, .6)
# "three days": timpani + low strings stab, then a ticking tension (pizz)
E(51.3, 'timpani', 'D3', None, .75); E(51.3, 'contrabass_pizz', 'D2', None, .8); pad(51.3, 'violins', ['D4', 'F4', 'Ab4'], 2.6, .35, .05)
for i in range(6): E(52.0 + i * .4, 'violins_pizz', 'A4' if i % 2 else 'D5', None, .3, .2)
# 54.6: the crew — the CREW theme (clarinet stac over pizz bass), bouncy
for rep in range(2):
    t0 = 55.0 + rep * 3.5
    for at, p in CREW: E(t0 + at * .85, 'clarinet_stac', p, None, .5, .15)
    for i, p in enumerate(['F2', 'C3', 'D2', 'A2', 'Bb2', 'F2', 'C2', 'G2']): E(t0 + i * .42, 'cellos_pizz', p, None, .55, -.2)
E(55.9, 'glockenspiel', 'C7', None, .3, .3); E(57.9, 'glockenspiel', 'A6', None, .3, .3); E(59.1, 'xylophone', 'F6', None, .4, .3)
pad(61.0, 'violins', ['F4', 'A4', 'C5'], 1.0, .25, .2)

# ---------------------------------------------------------------- detective groove (riddles): jazz trio as in EP02, 120 BPM
CH = [['D4', 'F4', 'A4', 'C5'], ['G3', 'Bb3', 'D4', 'F4'], ['E4', 'G4', 'Bb4', 'D5'], ['A3', 'C#4', 'G4', 'E5']]
WALK = [['D2', 'F2', 'A2', 'Ab2'], ['G2', 'Bb2', 'D3', 'B2'], ['E2', 'G2', 'Bb2', 'Bb1'], ['A1', 'C#2', 'E2', 'C#2']]
def groove(t0, t1, sneak=False, vibes=True, vel=1.0):
    b = 0; t = t0
    while t + 2.0 <= t1 + 1e-6:
        c = b % 4
        for i in range(4):
            tt = t + i * .5
            E(tt, 'jazz_bass', WALK[c][i], .22 if sneak else .48, (.75 if i else .82) * vel, -.05)
            if i in (1, 3): E(tt, 'snare2', 'taps', None, .3 * vel, .2); E(tt, 'hihat', 'pedal', None, .3 * vel, .25)
            if sneak and i in (0, 2): E(tt + .25, 'hihat', 'closed', None, .16 * vel, .3)
        if vibes:
            for at, v in ([(0, .36), (1.5, .3)] if not sneak else [(.5, .26), (2.5, .24)]):
                for k, p in enumerate(CH[c]): E(t + at * .5 + k * .01, 'vibraphone', p, 1.1 if not sneak else .6, v * vel, -.3 + k * .15)
        b += 1; t += 2.0
def countdown(t0):                                                  # 10 s: dominant pedal under the ticks, cymbal swell to the bell
    for s in range(20): E(t0 + s * .5, 'jazz_bass', 'A1' if s % 2 == 0 else 'E2', .4, .7, -.05)
    pad(t0, 'violins_trem', ['A4', 'Bb4'], 9.6, .18, 2.0, .8)
    roll(t0 + 7.0, 3.0, .4)
def aha(t0):
    for i, p in enumerate(['D6', 'F6', 'A6', 'D7']): E(t0 + i * .09, 'glockenspiel', p, None, .55, .15)
    E(t0, 'vibraphone_hard', 'D5', 1.5, .5, .0); E(t0, 'timpani', 'D3', None, .5)

groove(62.0, 94.0, sneak=False)
countdown(94.2); aha(105.4)
# flashback (110–118): the storm returns in miniature, low and tense
pad(110.3, 'violins_trem', ['D4', 'Eb4'], 7.5, .28, 1.0); pad(110.3, 'contrabass', ['D2'], 7.5, .4, 1.0)
for k in range(4): E(110.6 + k * 1.8, 'timpani', 'A2', None, .3)
pad(118.0, 'vibraphone_bowed', ['F4', 'A4'], 4.0, .25, .8)

# ---------------------------------------------------------------- D · stake-out (122–160): tiptoe comedy → dread → the dark → stab
for b in range(9):                                                  # 122–140: pizz + bassoon tiptoe, 2 s bars
    t0 = 122.0 + b * 2.0
    for i, p in enumerate(['D3', 'A3', 'F3', 'A3'] if b % 2 == 0 else ['C3', 'G3', 'E3', 'G3']): E(t0 + i * .5, 'cellos_pizz', p, None, .48, -.2)
    if b % 2 == 1: E(t0 + .75, 'bassoon_stac', 'A2', None, .4, .2); E(t0 + 1.25, 'bassoon_stac', 'D3', None, .4, .2)
    if b in (2, 3): E(t0 + .25, 'flute_stac', ['A5', 'C6'][b - 2], None, .3, .3)
for i in range(7): E(131.5 + i * .7, 'clarinet_stac', ['F4', 'A4', 'G4', 'Bb4', 'A4', 'C5', 'D5'][i], None, .38, .2)   # munching
E(135.85, 'tuba_stac', 'D2', None, .8, .1); E(136.25, 'tuba_stac', 'A1', None, .6, .1)                                     # burp
pad(137.0, 'violins_trem', ['A3', 'D4'], 4.0, .2, 3.5)                                                                     # dread swell into 3:12
pad(137.0, 'cellos', ['D3'], 4.0, .3, 3.0)
E(141.0, 'timpani', 'D3', None, .7); E(141.0, 'bass_drum', None, None, .6)
pad(141.2, 'contrabass', ['D2'], 11.8, .3, 1.5, .7)                                                                        # the dark: drone + heartbeat only
for s in range(12): E(141.4 + s, 'timpani', 'A2', None, .16 + s * .012, -.1)
E(146.2, 'xylophone', 'C7', None, .35, .4); E(148.4, 'flute_stac', 'D6', None, .3, -.3)                                       # squeak / squawk accents
E(153.0, 'sus_cymbal', 'hit', None, .6); pad(153.0, 'horn', ['D3', 'Ab3', 'D4'], 2.0, .6, .05); pad(153.0, 'violins', ['D5', 'Ab5'], 2.2, .4, .05)
E(153.0, 'timpani', 'D3', None, .8)
pad(155.2, 'vibraphone_bowed', ['D4', 'Ab4'], 4.6, .25, .6)

# ---------------------------------------------------------------- E · riddle 2 (160–222)
groove(160.0, 184.0, sneak=True)
countdown(184.4); aha(195.6)
# EP02 callback (200–207): the EP02 motif on vibes, light brushes
groove(200.0, 206.0, sneak=False, vibes=True, vel=.8)
# the stairs (207.4–222): descending pizz line, one note per step, then the door
STEPS = ['D5', 'C5', 'Bb4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C#4']
LOW = ['D4', 'C4', 'Bb3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C#3']
for i in range(27):
    inst, line = ('violins_pizz', STEPS) if i < 9 else ('violas_pizz', LOW) if i < 18 else ('cellos_pizz', LOW)
    E(207.6 + i * .107, inst, line[i % 9] if i < 18 else LOW[i % 9].replace('4', '3').replace('3', '2', 0), None, .3, -.3 + i * .02)
for b in range(7):
    t0 = 208.2 + b * 2.0
    for i, p in enumerate(['D3', 'C3', 'Bb2', 'A2']): E(t0 + i * .5, 'jazz_bass', p, .3, .6, -.05)
    E(t0 + .5, 'snare2', 'taps', None, .22, .2); E(t0 + 1.5, 'snare2', 'taps', None, .22, .2)
pad(218.5, 'cellos', ['D3', 'A3'], 3.5, .35, 1.0); pad(218.5, 'horn', ['D3'], 3.5, .3, 1.5)

# ---------------------------------------------------------------- F · the cellar door (222–270): mystery, the Old Tale's flute
pad(222.2, 'vibraphone_bowed', ['D4', 'A4'], 13.0, .26, 1.2)
pad(222.2, 'contrabass', ['D2'], 13.0, .3, 1.5, .8)
for i, p in enumerate(['D7', 'A6', 'F6', 'E6', 'D6', 'A6', 'G6', 'F6'] * 2): E(222.6 + i * .8, 'glockenspiel', p, None, .18, .3)
# Old Tale card (235–242): a pentatonic flute phrase (the tale's world), harp
for at, p, d in [(0, 'D5', .8), (.8, 'F5', .5), (1.3, 'G5', 1.0), (2.4, 'A5', .5), (2.9, 'C6', .5), (3.4, 'A5', 1.2), (4.8, 'G5', .5), (5.3, 'D5', 1.6)]: E(235.4 + at, 'flute', p, d, .3, -.2)
for i, p in enumerate(['D3', 'A3', 'D4', 'F4', 'G4', 'A4', 'C5', 'D5']): E(235.4 + i * .35, 'harp', p, None, .3, .2)
countdown(244.6)
# the four stones: each press gets a chime chord, rising (net, moon, sun, wave)
for x, chordn in zip([256.6, 260.2, 263.0, 266.6], [['D4', 'A4'], ['F4', 'C5'], ['A4', 'E5'], ['D5', 'A5']]):
    pad(x, 'hand_chimes', chordn, 2.0, .35, None, 1.0); pad(x, 'vibraphone_bowed', chordn, 3.0, .2, .3)
pad(256.6, 'contrabass', ['D2'], 11.6, .3, 1.0, .8)
# door opens: low brass swell + cymbal
roll(266.8, 1.6, .45); E(268.3, 'timpani', 'D3', None, .7); pad(268.3, 'trombone', ['D2', 'A2'], 2.4, .5, .05); pad(268.3, 'horn', ['D3', 'F3', 'A3'], 2.4, .45, .05)

# ---------------------------------------------------------------- G · the tunnel (270–292): drone, slow heartbeat that quickens, the five-shadow stinger
pad(270.2, 'cellos', ['D2', 'A2'], 21.0, .3, 2.0); pad(270.2, 'contrabass', ['D2'], 21.0, .3, 2.0, .8)
pad(270.2, 'vibraphone_bowed', ['F4'], 10.0, .2, 1.5); pad(280.2, 'vibraphone_bowed', ['Eb4'], 10.0, .2, 1.5)
t = 271.0; gap = 1.4
while t < 286.2: E(t, 'timpani', 'A2', None, .2 + (t - 271) * .012, -.1); t += gap; gap = max(.6, gap * .94)
pad(281.0, 'violins_trem', ['D5', 'Eb5'], 5.4, .16, 3.0)
E(287.9, 'sus_cymbal', 'hit', None, .55); E(287.9, 'timpani', 'D3', None, .8)
pad(287.9, 'horn', ['D3', 'Ab3', 'C4'], 2.6, .55, .05); pad(287.9, 'violins', ['C#5', 'D5'], 3.6, .35, .05)

# ---------------------------------------------------------------- H · noon (292–312): false calm → hit → the Stranger → title reprise, unresolved
for i, p in enumerate(['D4', 'F#4', 'A4', 'D5', 'A4', 'F#4', 'G4', 'B4', 'D5', 'G5']): E(292.3 + i * .5, 'harp', p, None, .3, -.2 + .04 * i)
for at, p, d in [(0, 'A5', .8), (.9, 'F#5', .6), (1.5, 'D5', 1.6)]: E(293.4 + at, 'flute', p, d, .28, .2)
E(297.8, 'timpani', 'D3', None, .9); E(297.8, 'bass_drum', None, None, .8); E(297.8, 'gong', None, None, .55)
pad(297.8, 'trombone', ['D2', 'Ab2'], 2.4, .6, .02); pad(297.8, 'cellos', ['D3', 'Ab3'], 3.0, .45, .02)
pad(298.3, 'violins_trem', ['D4', 'Eb4'], 7.0, .22, 1.0)
# the Stranger's motif: low clarinet, a falling minor second that won't resolve (D–C#, D–C#, Bb)
for at, p, d in [(0, 'D4', 1.0), (1.1, 'C#4', 1.4), (2.6, 'D4', .6), (3.3, 'C#4', .6), (4.0, 'Bb3', 1.6)]: E(300.6 + at, 'clarinet', p, d, .4, -.15)
pad(300.6, 'vibraphone_bowed', ['A3', 'Eb4'], 4.8, .2, 1.0)
# end card: TITLE theme reprise on horn, last chord left open (sus4)
title_theme(305.7, .58, .58)
pad(305.7, 'cellos', ['D3', 'A3'], 2.2, .4, .2); pad(307.9, 'cellos', ['Bb2', 'F3'], 1.3, .4, .1); pad(309.2, 'cellos', ['A2', 'D3', 'E3'], 2.6, .4, .1)
pad(305.7, 'violins', ['F4', 'A4'], 2.2, .26, .3); pad(309.2, 'violins', ['D5', 'E5'], 2.6, .25, .1)
pad(305.7, 'contrabass', ['D2'], 2.2, .45, .2); pad(307.9, 'contrabass', ['Bb1'], 1.3, .45, .1); pad(309.2, 'contrabass', ['A1'], 2.6, .45, .1)
E(309.2, 'sus_cymbal', 'roll', 2.6, .3)

mix = S.render(EV, dur=DUR)
mix = S.room(mix, size=.45, mix=.16)
mix = np.stack([hp(mix[:, 0], 35), hp(mix[:, 1], 35)], 1)
fade = int(.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = norm(mix, .8)[:int(DUR * SR)]
sf.write(os.path.join(D, 'music', 'score.wav'), mix.astype(np.float32), SR)
print('score.wav', mix.shape, round(len(mix) / SR, 2), 's,', len(EV), 'notes')
print('\n'.join(S.credits(sorted({e['inst'] for e in EV}))))
