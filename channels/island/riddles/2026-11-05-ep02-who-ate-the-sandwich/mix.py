"""Mix: score + Kokoro narration + foley at the events.json times + ambience -> out/mix.wav
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python mix.py   (needs events.json, voices/, music/score.wav)
Three layers (ambience, foley, music); music ducks ~8 dB under the voice; true silence 33.95–34.45 before the clue."""
import sys, os, json
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, brown, click, clack, whoosh, thump, ding, pop, add, compress, limit

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'out'), exist_ok=True)
E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR)); EV = E['ev']
rng = np.random.default_rng(7)
nz = lambda d: rng.standard_normal(len(t_(d)))
sine = lambda fr, d: np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fr, len(t_(d))).astype(float)) / SR)
win = lambda d, p=1: np.sin(np.pi * t_(d) / d) ** p

def sea(d): x = lp(nz(d), 700) * (0.6 + .4 * np.sin(2 * np.pi * .25 * t_(d))); return norm(x) * win(d, .4)
def wind(d): x = bp(nz(d), 300, 1400) * np.linspace(.3, 1, len(t_(d))); return norm(x) * win(d, .6)
def tick(n): return norm(clack(1.6 if n % 2 else 1.3, 1)[:int(.09 * SR)])
def stamp(): d = .3; return norm(sine(140 * (1 - .4 * t_(d)), d) * env_exp(d, .035) + lp(nz(d), 1800) * env_exp(d, .012) * .9)
def switch(off=False):                                    # a chunky toggle: two-stage metal click
    a = norm(clack(.8 if off else 1.0, 1)[:int(.08 * SR)]); x = np.zeros(int(.14 * SR)); x[:len(a)] += a
    b = norm(click(1.4 if off else 1.7, 1)[:int(.05 * SR)]); o = int(.03 * SR); x[o:o + len(b)] += b * .7; return norm(x)
def whirr(d): fr = np.linspace(9, 30, len(t_(d))); x = bp(nz(d), 2000, 7000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR))); return norm(x) * win(d, .5)
def footstep(n): d = .1; return norm(lp(nz(d), 900) * env_exp(d, .02) + sine(110 + 6 * (n % 3), d) * env_exp(d, .03) * .5)
def iris(d): return norm(bp(nz(d), 1000, 6000) * np.linspace(1, .2, len(t_(d)))) * win(d)
def lamp_on(): d = 1.2; return norm(sine(120, d) * .4 + sine(240, d) * .2 + bp(nz(d), 3000, 8000) * .05) * np.minimum(1, t_(d) / .02) * env_exp(d, .8)
def wipe(): d = .28; return norm(bp(nz(d), 1800, 8000)) * win(d, 2)
def sizzle(d): return norm(bp(nz(d), 4000, 11000) * (.4 + .6 * (rng.random(len(t_(d))) > .6))) * win(d, .5)
def frost(d):                                            # six tiny ice crackles spread over d
    x = np.zeros(len(t_(d)))
    for k in range(6):
        c = norm(click(2.2 + .3 * k, 1)[:int(.03 * SR)]); o = int(k * d / 7 * SR); x[o:o + len(c)] += c[:len(x) - o]
    return norm(x)
def slide(up):
    d = .45; fr = np.linspace(700, 1600, len(t_(d))) if up else np.linspace(1500, 600, len(t_(d)))
    return norm(sine(fr * (1 + .01 * np.sin(2 * np.pi * 6 * t_(d))), d)) * win(d, .6)
def bell(): d = 1.6; fr = 1046.5; return norm(sine(fr, d) + .5 * sine(fr * 2.76, d) * env_exp(d, .2)) * env_exp(d, .5)
def step_pizz(n): d = .12; return norm(sine(220 * 2 ** (n / 24), d)) * env_exp(d, .03)

def shutter(): d = .2; a = norm(clack(.7, 1)[:int(.1 * SR)]); x = np.zeros(int(d * SR)); x[:len(a)] += a; b = norm(lp(nz(.12), 1200) * env_exp(.12, .03)); o = int(.05 * SR); x[o:o + len(b)] += b * .8; return norm(x)
def lock(): return norm(click(2.0, 1)[:int(.05 * SR)])
def poof(): d = .6; return norm(lp(nz(d), 2500) * env_exp(d, .15) + sine(np.linspace(600, 200, len(t_(d))), d) * env_exp(d, .1) * .4)
def thump(n): d = .25; return norm(sine(90 - 8 * n, d) * env_exp(d, .06) + lp(nz(d), 500) * env_exp(d, .02) * .6)
def flap(): d = .18; return norm(bp(nz(d), 300, 1500)) * win(d, 1.5)
def snore(d): tt = t_(d); return norm(bp(nz(d), 150, 600) * (np.sin(np.pi * tt / (d / 2)) ** 2) + sine(70 + 10 * np.sin(2 * np.pi * tt / d * 2), d) * .3 * (np.sin(np.pi * tt / (d / 2)) ** 2))
def squeak(): d = .22; return norm(sine(np.linspace(1800, 2600, len(t_(d))) * (1 + .03 * np.sin(2 * np.pi * 30 * t_(d))), d)) * win(d, .8)
def drip(): d = .25; return norm(sine(np.linspace(900, 1700, len(t_(d))), d) * env_exp(d, .05))
def burp(): d = .7; tt = t_(d); return norm(sine(95 + 25 * np.sin(2 * np.pi * 7 * tt), d) * (1 + .6 * np.sign(np.sin(2 * np.pi * 95 * tt))) * win(d, .4) + lp(nz(d), 400) * .3 * win(d))
def brushfx(n): d = .2; return norm(bp(nz(d), 1500 + 100 * n, 5000)) * win(d, 1.2)

fx = np.zeros((N, 2)); vo = np.zeros((N, 2)); amb = np.zeros((N, 2))
for e in EV:
    t, ty, gn, pan = e['t'], e['type'], e.get('gain', 1.0), e.get('pan', 0.0)
    if ty == 'vo': continue
    if ty == 'sea': add(amb, sea(e['dur']), t, .12, -.2)
    elif ty == 'hover_tick': add(fx, tick(0), t, .12 * gn, .2)
    elif ty == 'whoosh_up': add(fx, whoosh(e.get('dur', .5), 1), t, .3)
    elif ty == 'whoosh_down': add(fx, whoosh(e.get('dur', .5), 1)[::-1], t, .3)
    elif ty == 'wind': add(amb, wind(e['dur']), t, .1, .3)
    elif ty == 'step_pizz': add(fx, step_pizz(e['n']), t, .1, -.3 + .04 * e['n'])
    elif ty == 'ding': add(fx, ding(1), t, .3)
    elif ty == 'stamp': add(fx, stamp(), t, .7 * gn)
    elif ty == 'push': add(fx, whoosh(.3, 1), t, .2)
    elif ty == 'pop': add(fx, pop(1), t, .3 * gn, .2)
    elif ty == 'tick': add(fx, tick(e['n']), t, .5)
    elif ty == 'bell': add(fx, bell(), t, .45)
    elif ty == 'aha': add(fx, stamp(), t, .5); add(fx, slide(True), t + .02, .2)
    elif ty == 'switch': add(fx, switch(e.get('off', 0) == 1), t, .8, pan)
    elif ty == 'clock_whirr': add(fx, whirr(e['dur']), t, .3)
    elif ty == 'footstep': add(fx, footstep(e['n']), t, .35, -.25 if e['n'] % 2 else .25)
    elif ty == 'iris': add(fx, iris(e['dur']), t, .25)
    elif ty == 'lamp_on': add(fx, lamp_on(), t, .35)
    elif ty == 'wipe': add(fx, wipe(), t, .3, .4)
    elif ty == 'sizzle': add(fx, sizzle(e['dur']), t, .15)
    elif ty == 'frost': add(fx, frost(e['dur']), t, .25)
    elif ty == 'brush': add(fx, brushfx(e['n']), t, .35, -.3 + .05 * e['n'])
    elif ty == 'shutter': add(fx, shutter(), t, .7, pan)
    elif ty == 'lock': add(fx, lock(), t, .4, .1)
    elif ty == 'poof': add(fx, poof(), t, .5)
    elif ty == 'thump': add(fx, thump(e['n']), t, .6, -.4 + .4 * e['n'])
    elif ty == 'flap': add(fx, flap(), t, .3 * gn, -.3)
    elif ty == 'snore': add(fx, snore(e['dur']), t, .3)
    elif ty == 'squeak': add(fx, squeak(), t, .2, .35)
    elif ty == 'drip': add(fx, drip(), t, .25, .3)
    elif ty == 'burp': add(fx, burp(), t, .55, .2)
    elif ty == 'slide_down': add(fx, slide(False), t, .25)

voice_env = np.zeros(N)
for e in EV:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(D, 'voices', e['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = librosa.resample(y, orig_sr=sr, target_sr=SR)
    y = compress(norm(y, .9), thr=.3, ratio=3.0)
    add(vo, y, e['t'], .9, 0)
    s = int(e['t'] * SR); voice_env[s:s + len(y)] = 1

room = lp(brown(DUR), 900) * .016; amb += np.stack([room, np.roll(room, 311)], 1)
mus, msr = sf.read(os.path.join(D, 'music', 'score.wav'))
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
k = int(.12 * SR); sm = np.convolve(voice_env, np.ones(k) / k, 'same')
# --- levels v2: the music sits UNDER the voice (Jp: "music volume is too high").
# Voice RMS (while speaking) is the reference; music bed -12 dB below it in the gaps, -19 dB under speech.
rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-9)
v_ref = rms(vo[voice_env > 0]); m_ref = rms(mus)
mus = mus * (v_ref / m_ref) * 10 ** (-12 / 20)
mus = mus * (1 - sm * (1 - 10 ** (-7 / 20)))[:, None]

def gate(buf, a, b, fade=.03):
    s, e, f = int(a * SR), int(b * SR), int(fade * SR); m = np.ones(N); m[s:e] = 0
    m[s - f:s] = np.linspace(1, 0, f); m[e:e + f] = np.linspace(0, 1, f); buf *= m[:, None]
for buf in (amb, fx): gate(buf, 33.95, 34.45)            # true silence: the first sound after it is "Here's the clue" + the AHA stamp

mix = mus + fx * .85 + vo * 1.0 + amb
mix = limit(mix, .95)
sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', mix.shape, 'peak', round(float(np.abs(mix).max()), 3))
