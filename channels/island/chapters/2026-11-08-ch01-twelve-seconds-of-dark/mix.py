"""Chapter 1 mix: score + Kokoro narration + foley at the events.json times + ambience beds -> out/mix.wav
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python mix.py   (needs events.json, voices/, music/score.wav)
Levels (RULES/TASTE): music sits UNDER the voice (-12 dB vs voice in gaps, a further -7 dB while speaking);
SFX land on the exact event frame; never a total-mute moment (the blackouts keep rain + drone + heartbeat)."""
import sys, os, json
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, brown, click, clack, whoosh, ding, pop, add, compress, limit, crash, creak, rumble

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'out'), exist_ok=True)
E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR)); EV = E['ev']
rng = np.random.default_rng(12)
nz = lambda d: rng.standard_normal(len(t_(d)))
sine = lambda fr, d: np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fr, len(t_(d))).astype(float)) / SR)
win = lambda d, p=1: np.sin(np.pi * t_(d) / d) ** p
def mixin(x, y, o=0, g=1.0):
    n = max(0, min(len(y), len(x) - o)); x[o:o + n] += y[:n] * g; return x
def fadeio(x, a=.4, b=.6): n = len(x); fa, fb = min(n // 2, int(a * SR)), min(n // 2, int(b * SR)); x = x.copy(); x[:fa] *= np.linspace(0, 1, fa); x[n - fb:] *= np.linspace(1, 0, fb); return x

# ---- beds
def rain_bed(d): x = bp(nz(d), 800, 9000) * .6 + lp(nz(d), 500) * .4; x *= 1 + .25 * np.sin(2 * np.pi * .13 * t_(d)); return fadeio(norm(x))
def wind_bed(d): x = bp(nz(d), 200, 1100) * (.55 + .45 * np.sin(2 * np.pi * .07 * t_(d)) ** 2); return fadeio(norm(x))
def sea_bed(d): x = lp(nz(d), 700) * (.6 + .4 * np.sin(2 * np.pi * .16 * t_(d))); return fadeio(norm(x))
def room_bed(d): return fadeio(norm(lp(brown(d), 300)))
def drips_bed(d):
    x = np.zeros(len(t_(d)))
    for k in range(int(d / 1.3)):
        o = int((k * 1.3 + rng.random() * .9) * SR); y = drip(); x[o:o + len(y)] += y[:len(x) - o] * (.4 + .6 * rng.random())
    return x
# ---- one-shots
def thunder(n): d = 3.5; x = lp(nz(d), 220 + 40 * n) * env_exp(d, 1.1) + lp(nz(d), 1500) * env_exp(d, .08) * .5; return norm(x) * np.minimum(1, t_(d) / .03)
def wave_crash(): d = 2.2; x = lp(nz(d), 2200) * win(d, .6) * env_exp(d, .9) + lp(nz(d), 300) * env_exp(d, .5); return norm(x)
def horn(d): tt = t_(d); fr = 73.4; x = sine(fr, d) + .5 * sine(fr * 2, d) + .3 * sine(fr * 3, d) + .15 * sine(fr * 1.5, d); return norm(lp(x, 900) * np.minimum(1, tt / .25) * np.minimum(1, (d - tt) / .6))
def flicker(n): d = .08; return norm(bp(nz(d), 2000, 7000)) * env_exp(d, .02) * (.6 + .1 * n)
def lamp_off(): d = 1.0; tt = t_(d); x = sine(120 * (1 - .5 * np.minimum(1, tt / .5)), d) * env_exp(d, .25) * .6; mixin(x, norm(clack(.6, 1)[:int(.06 * SR)])); return norm(x)
def lamp_on(): d = 1.4; return norm(sine(120, d) * .4 + sine(240, d) * .2 + bp(nz(d), 3000, 8000) * .05) * np.minimum(1, t_(d) / .02) * env_exp(d, .9)
def tick(n): return norm(clack(1.6 if n % 2 else 1.3, 1)[:int(.09 * SR)])
def tock(n): d = .12; return norm(sine(900 if n % 2 else 700, d) * env_exp(d, .015) + bp(nz(d), 2000, 6000) * env_exp(d, .005) * .5)
def stamp(): d = .3; return norm(sine(140 * (1 - .4 * t_(d)), d) * env_exp(d, .035) + lp(nz(d), 1800) * env_exp(d, .012) * .9)
def bell(): d = 1.6; fr = 1046.5; return norm(sine(fr, d) + .5 * sine(fr * 2.76, d) * env_exp(d, .2)) * env_exp(d, .5)
def wipe(): d = .32; return norm(bp(nz(d), 1800, 8000)) * win(d, 2)
def gull(): d = .9; tt = t_(d); fr = 1500 + 700 * np.sin(np.pi * tt / d) - 400 * tt; x = sine(fr, d) * (1 + .4 * np.sign(np.sin(2 * np.pi * 9 * tt))) * win(d, .7); return norm(bp(x, 900, 5000))
def footstep(n): d = .11; return norm(lp(nz(d), 900) * env_exp(d, .02) + sine(110 + 6 * (n % 3), d) * env_exp(d, .03) * .5)
def sand_step(n): d = .16; return norm(bp(nz(d), 300, 3000) * env_exp(d, .04))
def grumble(d): tt = t_(d); x = sine(110 + 30 * np.sin(2 * np.pi * 3.1 * tt) + 15 * np.sin(2 * np.pi * 7 * tt), d) * (1 + .5 * np.sign(np.sin(2 * np.pi * 110 * tt))); env = (np.abs(np.sin(2 * np.pi * 1.6 * tt)) > .3) * 1.0; return norm(lp(x, 1400) * lp(env, 20)) * .9
def flap(): d = .18; return norm(bp(nz(d), 300, 1500)) * win(d, 1.5)
def squawk(): d = .45; tt = t_(d); x = sine(900 + 500 * np.sin(np.pi * tt / d), d) * (1 + .7 * np.sign(np.sin(2 * np.pi * 11 * tt))); return norm(bp(x, 600, 5000) * win(d, .5))
def mew(): d = .6; tt = t_(d); return norm(sine(700 + 300 * np.sin(np.pi * tt / d) - 200 * tt, d) * win(d, .7) + .3 * sine(1400, d) * win(d, 2))
def squeak(): d = .22; return norm(sine(np.linspace(1800, 2600, len(t_(d))) * (1 + .03 * np.sin(2 * np.pi * 30 * t_(d))), d)) * win(d, .8)
def pad_step(n): d = .08; return norm(lp(nz(d), 600) * env_exp(d, .02)) * .5
def boing(): d = .5; tt = t_(d); return norm(sine(220 + 180 * np.sin(2 * np.pi * 9 * tt) * np.exp(-tt * 6), d) * env_exp(d, .25))
def thump(n): d = .25; return norm(sine(90 - 8 * n, d) * env_exp(d, .06) + lp(nz(d), 500) * env_exp(d, .02) * .6)
def drip(): d = .25; return norm(sine(np.linspace(900, 1700, len(t_(d))), d) * env_exp(d, .05))
def slap(): d = .2; return norm(lp(nz(d), 2500) * env_exp(d, .02) + sine(180, d) * env_exp(d, .04) * .5)
def climb(d):
    x = np.zeros(len(t_(d)))
    for k in range(int(d / .45)):
        o = int(k * .45 * SR); y = norm(lp(nz(.12), 1200) * env_exp(.12, .03)); x[o:o + len(y)] += y[:len(x) - o]
    return norm(x)
def munch(n): d = .14; return norm(bp(nz(d), 1500 + 200 * (n % 3), 6000) * (np.abs(np.sin(2 * np.pi * 25 * t_(d))) ** 3) * env_exp(d, .05))
def burp(): d = .7; tt = t_(d); return norm(sine(95 + 25 * np.sin(2 * np.pi * 7 * tt), d) * (1 + .6 * np.sign(np.sin(2 * np.pi * 95 * tt))) * win(d, .4) + lp(nz(d), 400) * .3 * win(d))
def snip(): d = .12; a = norm(click(2.4, 1)[:int(.03 * SR)]); x = np.zeros(int(d * SR)); mixin(x, a); mixin(x, a, int(.04 * SR), .8); return norm(x)
def sizzle(d): return fadeio(norm(bp(nz(d), 4000, 11000) * (.3 + .7 * (rng.random(len(t_(d))) > .7))), .05, .4)
def squish(): d = .3; tt = t_(d); return norm(lp(nz(d), 900) * win(d, .5) * (1 + np.sin(2 * np.pi * 40 * tt)))
def riddle_in(): d = .6; return norm(sine(np.linspace(500, 1200, len(t_(d))), d) * win(d, .5)) * .6
def stone(n): d = .35; return norm(lp(nz(d), 1200) * env_exp(d, .03) + sine(160 - 10 * n, d) * env_exp(d, .06))
def chime(n): d = 1.5; fr = [587, 698, 880, 1175][n]; return norm(sine(fr, d) + .4 * sine(fr * 2.4, d) * env_exp(d, .3)) * env_exp(d, .6)
def door_clunk(): d = .8; x = sine(60, d) * env_exp(d, .2) + lp(nz(d), 700) * env_exp(d, .04); return norm(mixin(x, norm(clack(.5, 1)[:int(.1 * SR)]), int(.05 * SR), .7))
def door_creak(d): tt = t_(d); fr = 180 + 90 * np.sin(2 * np.pi * .7 * tt); x = sine(fr, d) * (1 + .8 * np.sign(np.sin(2 * np.pi * 23 * tt))); return fadeio(norm(bp(x, 300, 3000)), .1, .3)
def sting_low(): d = 2.5; return norm(sine(55, d) + .5 * sine(58.3, d)) * env_exp(d, 1.0) * np.minimum(1, t_(d) / .02)
def boom(): d = 3.0; return norm(lp(nz(d), 140) * env_exp(d, .8) + sine(45, d) * env_exp(d, .9)) * np.minimum(1, t_(d) / .01)
def gust(d): x = bp(nz(d), 300, 2500) * win(d, 1.2); return norm(x)
def title_whoosh(): return norm(whoosh(.7, 1))

fx = np.zeros((N, 2)); vo = np.zeros((N, 2)); amb = np.zeros((N, 2))
for e in EV:
    t, ty, gn, pan = e['t'], e['type'], e.get('gain', 1.0), e.get('pan', 0.0)
    if ty == 'vo': continue
    d = e.get('dur', 1.0); n = e.get('n', 0)
    if ty == 'storm': add(amb, rain_bed(d), t, .20, .1); add(amb, wind_bed(d), t, .14, -.3); add(amb, sea_bed(d), t, .12, .2)
    elif ty == 'harbour': add(amb, sea_bed(d), t, .13, -.2); add(amb, wind_bed(d), t, .04, .3)
    elif ty == 'room': add(amb, room_bed(d), t, .05); add(amb, sea_bed(d), t, .035, .5)
    elif ty == 'rainroom': add(amb, rain_bed(d), t, .07, .5); add(amb, room_bed(d), t, .05)
    elif ty == 'cellar_amb': add(amb, room_bed(d), t, .06); add(amb, drips_bed(d), t, .05, -.3)
    elif ty == 'tunnel_amb': add(amb, sea_bed(d), t, .09, .5); add(amb, drips_bed(d), t, .06, -.2); add(amb, wind_bed(d), t, .03)
    elif ty == 'noon_amb': add(amb, sea_bed(d), t, .12, -.2); add(amb, wind_bed(d), t, .05, .3)
    elif ty == 'thunder': add(fx, thunder(n), t, .55, -.3 + .2 * n)
    elif ty == 'wave_crash': add(fx, wave_crash(), t, .35, -.2)
    elif ty == 'horn': add(fx, horn(d), t, .45, -.4)
    elif ty == 'flicker': add(fx, flicker(n), t, .3)
    elif ty == 'lamp_off': add(fx, lamp_off(), t, .6)
    elif ty == 'lamp_on': add(fx, lamp_on(), t, .45)
    elif ty == 'tick': add(fx, tick(n), t, .38 * gn)
    elif ty == 'clock_tock': add(fx, tock(n), t, .22, -.4)
    elif ty == 'title': add(fx, title_whoosh(), t, .25)
    elif ty in ('wipe', 'cut'): add(fx, wipe(), t, .22 if ty == 'wipe' else .12, .3)
    elif ty == 'gull': add(fx, gull(), t, .12, .4)
    elif ty == 'footstep': add(fx, footstep(n), t, .28 * gn, -.2 if n % 2 else .2)
    elif ty == 'sand_step': add(fx, sand_step(n), t, .16, -.1 if n % 2 else .1)
    elif ty == 'grumble': add(fx, grumble(d), t, .16, .35)
    elif ty == 'whoosh': add(fx, whoosh(.35, 1), t, .2)
    elif ty == 'pop': add(fx, pop(1), t, .28 * gn, .2)
    elif ty == 'stamp': add(fx, stamp(), t, .6 * gn)
    elif ty == 'flap': add(fx, flap(), t, .22, .3)
    elif ty == 'squawk': add(fx, squawk(), t, .3, .3)
    elif ty == 'mew': add(fx, mew(), t, .22, .1)
    elif ty == 'pad': add(fx, pad_step(n), t, .2)
    elif ty == 'boing': add(fx, boing(), t, .3, .3)
    elif ty == 'thump': add(fx, thump(n), t, .45, .2)
    elif ty == 'squeak': add(fx, squeak(), t, .2, .35)
    elif ty == 'drip': add(fx, drip(), t, .18, .3 - .07 * n)
    elif ty == 'riddle_in': add(fx, riddle_in(), t, .3)
    elif ty == 'bell': add(fx, bell(), t, .4)
    elif ty == 'slap': add(fx, slap(), t, .4)
    elif ty == 'climb': add(fx, climb(d), t, .25, .3)
    elif ty == 'munch': add(fx, munch(n), t, .25, .4)
    elif ty == 'burp': add(fx, burp(), t, .45, .4)
    elif ty == 'snip': add(fx, snip(), t, .4, .2)
    elif ty == 'creak': add(fx, creak(1), t, .3, -.3)
    elif ty == 'sizzle': add(fx, sizzle(d), t, .1, .2)
    elif ty == 'squish': add(fx, squish(), t, .3)
    elif ty == 'stone': add(fx, stone(n), t, .5, -.3 + .2 * n)
    elif ty == 'chime': add(fx, chime(n), t, .18, -.3 + .2 * n)
    elif ty == 'door_clunk': add(fx, door_clunk(), t, .65)
    elif ty == 'door_creak': add(fx, door_creak(d), t, .25, -.3)
    elif ty == 'sting_low': add(fx, sting_low(), t, .35)
    elif ty == 'boom': add(fx, boom(), t, .6)
    elif ty == 'wind_gust': add(fx, gust(d), t, .2, -.4)
    elif ty == 'prints_run':
        for k in range(27): add(fx, squish(), t + k * .107, .05, -.3 + k * .02)

voice_env = np.zeros(N)
for e in EV:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(D, 'voices', e['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = librosa.resample(y, orig_sr=sr, target_sr=SR)
    y = compress(norm(y, .9), thr=.3, ratio=3.0)
    add(vo, y, e['t'], .9, 0)
    s = int(e['t'] * SR); voice_env[s:s + len(y)] = 1

mus, msr = sf.read(os.path.join(D, 'music', 'score.wav'))
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
k = int(.15 * SR); sm = np.convolve(voice_env, np.ones(k) / k, 'same')
rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-9)
v_ref = rms(vo[voice_env > 0]); m_ref = rms(mus)
mus = mus * (v_ref / m_ref) * 10 ** (-12 / 20)
mus = mus * (1 - sm * (1 - 10 ** (-7 / 20)))[:, None]
# ambience also tucks under the voice a little
amb = amb * (1 - sm * (1 - 10 ** (-4 / 20)))[:, None]

mix = mus + fx * .85 + vo * 1.0 + amb
mix = np.stack([hp(mix[:, 0], 25), hp(mix[:, 1], 25)], 1)
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', mix.shape, 'peak', round(float(np.abs(mix).max()), 3))
