"""C01 mix (LOCAL TEST): Caribbean Blue (reel copy, unlicensed) + HIM's voice -> out/mix.wav. Voice on top; music −10 dB vs voice
in the gaps and a further −6 dB under speech (it is the emotional bed here, so a little louder than the riddles); never muted.
Run: LIB=<lemo-opuscar> $LIB/.venv/bin/python mix.py"""
import sys, os, json
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, add, norm, compress, limit, hp
D = os.path.dirname(os.path.abspath(__file__)); os.makedirs(os.path.join(D, 'out'), exist_ok=True)
E = json.load(open(os.path.join(D, 'events.json'))); DUR = E['dur']; N = int(round(DUR * SR))
mus, sr = sf.read(os.path.join(D, 'music', 'caribbean-blue__LOCAL-TEST.wav'))
if sr != SR: mus = np.stack([librosa.resample(mus[:, c], orig_sr=sr, target_sr=SR) for c in range(2)], 1)
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
vo = np.zeros((N, 2)); env = np.zeros(N)
for e in E['ev']:
    if e['type'] != 'vo': continue
    y, s = sf.read(os.path.join(D, 'voices', e['id'] + '.wav')); y = y.mean(1) if y.ndim > 1 else y
    y = compress(norm(librosa.resample(y, orig_sr=s, target_sr=SR), .9), thr=.3, ratio=2.5)
    add(vo, y, e['t'], .9, 0); a = int(e['t'] * SR); env[a:a + len(y)] = 1
rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-9)
k = int(.25 * SR); sm = np.convolve(env, np.ones(k) / k, 'same')
mus = mus * (rms(vo[env > 0]) / rms(mus)) * 10 ** (-10 / 20) * (1 - sm * (1 - 10 ** (-6 / 20)))[:, None]
mix = mus + vo; mix = np.stack([limit(hp(mix[:, c], 30), .95) for c in range(2)], 1)
sf.write(os.path.join(D, 'out', 'mix.wav'), mix.astype(np.float32), SR); print('mix.wav peak', round(float(np.abs(mix).max()), 3))
