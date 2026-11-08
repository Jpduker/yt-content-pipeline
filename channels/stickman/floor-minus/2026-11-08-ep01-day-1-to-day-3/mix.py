"""Floor Minus Ep1 mix: score + Kokoro voices (narrator am_fenrir, Nora af_bella, the Operator bm_george through a speaker filter)
+ foley on the exact event frames + one ambience bed per floor → out/mix.wav
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python mix.py   (needs events.json, voices/, music/score.wav)
Levels: music −12 dB vs voice in gaps, a further −7 dB under speech; the Quiet Floor is quiet but never silent (room tone + heartbeat)."""
import sys, os, json
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, t_, env_exp, bp, lp, hp, norm, brown, click, clack, whoosh, pop, add, compress, limit, creak

D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'out'), exist_ok=True)
E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR)); EV = E['ev']
rng = np.random.default_rng(21)
nz = lambda d: rng.standard_normal(len(t_(d)))
sine = lambda fr, d: np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fr, len(t_(d))).astype(float)) / SR)
win = lambda d, p=1: np.sin(np.pi * t_(d) / d) ** p
def mixin(x, y, o=0, g=1.0): n = max(0, min(len(y), len(x) - o)); x[o:o + n] += y[:n] * g; return x
def fadeio(x, a=.4, b=.6): n = len(x); fa, fb = min(n // 2, int(a * SR)), min(n // 2, int(b * SR)); x = x.copy(); x[:fa] *= np.linspace(0, 1, fa); x[n - fb:] *= np.linspace(1, 0, fb); return x
def speaker(y):                                                       # the Operator: small tinny speaker + a touch of grit
    y = bp(y, 400, 3600, 3); return norm(np.tanh(y / (np.abs(y).max() + 1e-9) * 2.2))

# beds
def hum(d): return fadeio(norm(sine(60, d) * .5 + sine(120, d) * .3 + lp(brown(d), 200) * .4))
def ride(d): tt = t_(d); return fadeio(norm(lp(nz(d), 180) * (1 + .3 * np.sin(2 * np.pi * 1.3 * tt)) + sine(48, d) * .3), .3, .5)
def lobby(d): return fadeio(norm(bp(nz(d), 200, 2500) * .2 + lp(brown(d), 300)))
def rain_up(d): return fadeio(norm(bp(nz(d), 1500, 9000) * (.5 + .5 * (rng.random(len(t_(d))) > .985)) + lp(nz(d), 300) * .5))
def quiet(d): return fadeio(norm(lp(brown(d), 120)), .5, .8)
def apartment(d): return fadeio(norm(lp(brown(d), 250) + bp(nz(d), 2000, 5000) * .05))
# one-shots
def ding(): d = 1.4; return norm((sine(1318.5, d) * env_exp(d, .5)) + np.pad(sine(1046.5, d - .25) * env_exp(d - .25, .6), (int(.25 * SR), 0))[:len(t_(d))])
def doors(d): x = bp(nz(d), 300, 2500) * win(d, .7); return norm(mixin(x, norm(clack(.7, 1)[:int(.08 * SR)]), max(0, len(x) - int(.1 * SR)), 1.5))
def thunk(): d = .4; return norm(sine(70, d) * env_exp(d, .08) + lp(nz(d), 600) * env_exp(d, .03))
def step(n): d = .1; return norm(lp(nz(d), 1000) * env_exp(d, .02) + sine(120 + 8 * (n % 3), d) * env_exp(d, .03) * .5)
def wipe(): d = .3; return norm(bp(nz(d), 1800, 8000)) * win(d, 2)
def title(): return norm(whoosh(.7, 1))
def tilt_fx(big=0, backk=0): d = 1.2 + big * .5; tt = t_(d); fr = np.linspace(90, 50, len(tt)) if not backk else np.linspace(50, 90, len(tt)); return norm(sine(fr, d) * win(d, .4) + lp(nz(d), 400) * .5 * win(d) + np.abs(np.sin(2 * np.pi * 9 * tt)) * bp(nz(d), 300, 1500) * .3)
def slide(d): return fadeio(norm(bp(nz(d), 500, 3000) * (1 + .4 * np.sin(2 * np.pi * 7 * t_(d)))), .05, .3)
def grab(): d = .2; return norm(lp(nz(d), 2000) * env_exp(d, .03) + sine(220, d) * env_exp(d, .05) * .4)
def munch(): d = .16; return norm(bp(nz(d), 1500, 6000) * (np.abs(np.sin(2 * np.pi * 25 * t_(d))) ** 3) * env_exp(d, .05))
def counter(): d = .25; return norm(np.pad(norm(click(1.8, 1)[:int(.03 * SR)]), (0, int(.22 * SR)))[:len(t_(d))] + sine(880, d) * env_exp(d, .05) * .6)
def yell(): d = 1.0; tt = t_(d); x = sine(260 + 220 * np.exp(-tt * 2) + 20 * np.sin(2 * np.pi * 6 * tt), d) * (1 + .5 * np.sign(np.sin(2 * np.pi * 260 * tt))); return norm(bp(x, 300, 3000) * win(d, .5) * np.linspace(1, .2, len(tt)))
def chair(): return norm(creak(1))
def scribble(d): tt = t_(d); return fadeio(norm(bp(nz(d), 2500, 8000) * (np.abs(np.sin(2 * np.pi * 7 * tt)) ** 2)), .02, .1)
def paper(): d = .5; return norm(bp(nz(d), 1500, 7000) * win(d, 1.5))
def splash(): d = 1.0; return norm(lp(nz(d), 3000) * env_exp(d, .25) + lp(nz(d), 300) * env_exp(d, .4))
def drips(d):
    x = np.zeros(len(t_(d)))
    for k in range(int(d / .9)): y = norm(sine(np.linspace(900, 1700, int(.2 * SR)), .2) * env_exp(.2, .05)); mixin(x, y, int((k * .9 + rng.random() * .5) * SR), .4 + .6 * rng.random())
    return x
def light_off(): d = .6; return norm(np.pad(norm(clack(1.2, 1)[:int(.05 * SR)]), (0, int(.55 * SR)))[:len(t_(d))] + sine(np.linspace(120, 40, len(t_(d))), d) * env_exp(d, .2) * .6)
def growl(): d = 1.2; tt = t_(d); return norm(lp(nz(d), 300) * (1 + np.sin(2 * np.pi * (4 + 6 * tt) * tt)) * win(d, .5))
def whoosh_soft(): return norm(whoosh(.8, 1)) * .6
def heart(n): d = .5; x = sine(55, d) * env_exp(d, .07); return norm(mixin(x, sine(55, .3) * env_exp(.3, .06) * .7, int(.22 * SR)))
def sting(): d = 2.0; return norm(sine(82.4, d) + sine(87.3, d) * .7) * env_exp(d, .8) * np.minimum(1, t_(d) / .02)
def hit(): d = 2.5; return norm(lp(nz(d), 160) * env_exp(d, .7) + sine(41, d) * env_exp(d, .9)) * np.minimum(1, t_(d) / .01)
def clock_chime(): d = 2.0; return norm(sine(523, d) + .5 * sine(1046, d) * env_exp(d, .3)) * env_exp(d, .8)

fx = np.zeros((N, 2)); vo = np.zeros((N, 2)); amb = np.zeros((N, 2))
for e in EV:
    t, ty, gn = e['t'], e['type'], e.get('gain', 1.0); d = e.get('dur', 1.0); n = e.get('n', 0)
    if ty == 'vo': continue
    if ty == 'hum': add(amb, hum(d), t, .05)
    elif ty == 'lift_ride': add(amb, ride(d), t, .09)
    elif ty == 'lobby': add(amb, lobby(d), t, .05, .2)
    elif ty == 'rain_up': add(amb, rain_up(d), t, .12, .1)
    elif ty == 'quiet': add(amb, quiet(d), t, .05)
    elif ty == 'apartment': add(amb, apartment(d), t, .05)
    elif ty == 'drip_lift': add(amb, drips(d), t, .1, .3)
    elif ty == 'ding': add(fx, ding(), t, .35 * gn, .2)
    elif ty == 'doors': add(fx, doors(d), t, .3)
    elif ty == 'thunk': add(fx, thunk(), t, .4)
    elif ty == 'step': add(fx, step(n), t, .25 * gn, -.2 if n % 2 else .2)
    elif ty == 'cut': add(fx, wipe(), t, .1)
    elif ty == 'title': add(fx, title(), t, .3)
    elif ty == 'tilt': add(fx, tilt_fx(e.get('big', 0), e.get('back', 0)), t, .5)
    elif ty == 'slide': add(fx, slide(d), t, .3, .3)
    elif ty == 'grab': add(fx, grab(), t, .4)
    elif ty == 'pop': add(fx, pop(1), t, .28 * gn, .2)
    elif ty == 'chair': add(fx, chair(), t, .3)
    elif ty == 'munch': add(fx, munch(), t, .3, .2)
    elif ty == 'counter': add(fx, counter(), t, .22, .6)
    elif ty == 'yell': add(fx, yell(), t, .3, .5)
    elif ty == 'clock_chime': add(fx, clock_chime(), t, .3, -.5)
    elif ty == 'crawl': [add(fx, step(k), t + k * .52, .12, -.1) for k in range(int(d / .52))]
    elif ty == 'paper': add(fx, paper(), t, .3)
    elif ty == 'scribble': add(fx, scribble(d), t, .25)
    elif ty == 'splash': add(fx, splash(), t, .45)
    elif ty == 'light_off': add(fx, light_off(), t, .45, -.3)
    elif ty == 'creak': add(fx, chair(), t, .5, -.2)
    elif ty == 'growl': add(fx, growl(), t, .4)
    elif ty == 'whoosh_soft': add(fx, whoosh_soft(), t, .2)
    elif ty == 'heart': add(fx, heart(n), t, .3 + .02 * n)
    elif ty == 'sting': add(fx, sting(), t, .3)
    elif ty == 'sofa': add(fx, chair(), t, .2, .3)
    elif ty == 'hit': add(fx, hit(), t, .55)

voice_env = np.zeros(N)
for e in EV:
    if e['type'] != 'vo': continue
    y, sr = sf.read(os.path.join(D, 'voices', e['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    y = librosa.resample(y, orig_sr=sr, target_sr=SR)
    y = compress(norm(y, .9), thr=.3, ratio=3.0)
    if e.get('fx') == 'radio': y = speaker(y) * .8
    add(vo, y, e['t'], .9, .25 if e.get('fx') == 'radio' else 0)
    s = int(e['t'] * SR); voice_env[s:s + len(y)] = 1

mus, msr = sf.read(os.path.join(D, 'music', 'score.wav'))
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
k = int(.15 * SR); sm = np.convolve(voice_env, np.ones(k) / k, 'same')
rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-9)
mus = mus * (rms(vo[voice_env > 0]) / rms(mus)) * 10 ** (-12 / 20)
mus = mus * (1 - sm * (1 - 10 ** (-7 / 20)))[:, None]
amb = amb * (1 - sm * (1 - 10 ** (-4 / 20)))[:, None]
mix = mus + fx * .85 + vo + amb
mix = np.stack([hp(mix[:, 0], 25), hp(mix[:, 1], 25)], 1)
mix = np.stack([limit(mix[:, 0], .95), limit(mix[:, 1], .95)], 1)
sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix.wav', mix.shape, 'peak', round(float(np.abs(mix).max()), 3))
