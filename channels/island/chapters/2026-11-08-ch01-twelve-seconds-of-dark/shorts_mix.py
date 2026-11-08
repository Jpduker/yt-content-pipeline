"""Audio for the three riddle Shorts, cut from the finished chapter mix (same voice, music, SFX, so they match the chapter):
setup [a, b] + countdown seconds 5..10 of the riddle + an end card (the bell, then "The answer is in Chapter One", over the title theme).
Run after mix.py: LIB=<lemo-opuscar> $LIB/.venv/bin/python shorts_mix.py   → out/short1.wav .. out/short3.wav"""
import sys, os
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
import numpy as np, soundfile as sf, librosa
from core.audio.sfx import SR, add, norm, compress
D = os.path.dirname(os.path.abspath(__file__))
SHORTS = [(1, 62.0, 94.2, 94.2), (2, 160.0, 184.4, 184.4), (3, 222.0, 244.6, 244.6)]; CD, END = 5.0, 3.8
mix, sr = sf.read(os.path.join(D, 'out', 'mix.wav')); assert sr == SR
score, _ = sf.read(os.path.join(D, 'music', 'score.wav'))
vo, vsr = sf.read(os.path.join(D, 'voices', 'sx.wav')); vo = vo.mean(1) if vo.ndim > 1 else vo
vo = compress(norm(librosa.resample(vo, orig_sr=vsr, target_sr=SR), .9), thr=.3, ratio=3.0)
cut = lambda x, a, b: x[int(a * SR):int(b * SR)].copy()
def fade(x, a=.02, b=.02):
    fa, fb = int(a * SR), int(b * SR); x[:fa] *= np.linspace(0, 1, fa)[:, None]; x[len(x) - fb:] *= np.linspace(1, 0, fb)[:, None]; return x
for n, a, b, r in SHORTS:
    body = fade(cut(mix, a, b), .01, .03)
    cd = fade(cut(mix, r + 5, r + 10), .03, .01)
    end = np.zeros((int(END * SR), 2))
    bell = fade(cut(mix, r + 10, r + 10.9), .005, .4); end[:len(bell)] += bell
    theme = fade(cut(score, 26.6, 26.6 + END - .3), .1, .8) * .35; end[int(.3 * SR):int(.3 * SR) + len(theme)] += theme
    add(end, vo, .55, .9, 0)
    out = np.concatenate([body, cd, end])
    sf.write(os.path.join(D, 'out', f'short{n}.wav'), out.astype(np.float32), SR)
    print(f'short{n}.wav', round(len(out) / SR, 2), 's')
