"""Audio for the three floor Shorts, cut straight from the chapter mix, plus a 4 s end card (the elevator motif + "What would you do?").
Run after mix.py: LIB=<lemo-opuscar> $LIB/.venv/bin/python shorts_mix.py   → out/short1.wav .. out/short3.wav"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, add, norm, compress
D = os.path.dirname(os.path.abspath(__file__)); END = 4.0
SHORTS = [(1, 23.0, 63.0), (2, 96.6, 131.6), (3, 182.4, 216.8)]
mix, sr = sf.read(os.path.join(D, 'out', 'mix.wav')); assert sr == SR
score, _ = sf.read(os.path.join(D, 'music', 'score.wav'))
vo, vsr = sf.read(os.path.join(D, 'voices', 'sx.wav')); vo = vo.mean(1) if vo.ndim > 1 else vo
vo = compress(norm(librosa.resample(vo, orig_sr=vsr, target_sr=SR), .9), thr=.3, ratio=3.0)
cut = lambda x, a, b: x[int(a * SR):int(b * SR)].copy()
def fade(x, a=.02, b=.02): fa, fb = int(a * SR), int(b * SR); x[:fa] *= np.linspace(0, 1, fa)[:, None]; x[len(x) - fb:] *= np.linspace(1, 0, fb)[:, None]; return x
for n, a, b in SHORTS:
    body = fade(cut(mix, a, b), .01, .25)
    end = np.zeros((int(END * SR), 2)); theme = fade(cut(score, 11.0, 11.0 + END), .05, .6) * .4; end[:len(theme)] += theme
    add(end, vo, .3, .9, 0)
    out = np.concatenate([body, end]); sf.write(os.path.join(D, 'out', f'short{n}.wav'), out.astype(np.float32), SR)
    print(f'short{n}.wav', round(len(out) / SR, 2), 's')
