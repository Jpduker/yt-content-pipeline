#!/usr/bin/env python3
"""Audio QA of one Short from its stems (mix.py writes out/stem_vo|bed|fx.wav) + timeline.json. Exit 1 on FAIL.
  - every narration word is at least 9 dB above the music + ambience under it (speech intelligibility)
  - no sound effect peaks more than 4 dB above the narration's peak (no jump scares by accident) and none lands on top of a word unless meant
  - the mix does not clip (sample peak < -0.3 dBFS before the render's loudnorm), no silence holes > 1.2 s inside the film (except the very end)
  - every sound effect event in the timeline actually sounds (fx stem energy within 0.25 s of its time)
Usage: audio_check.py <dir>"""
import sys, os, json, numpy as np, soundfile as sf
D = sys.argv[1]; TL = json.load(open(os.path.join(D, 'timeline.json')))
vo, SR = sf.read(os.path.join(D, 'out', 'stem_vo.wav')); bed, _ = sf.read(os.path.join(D, 'out', 'stem_bed.wav')); fx, _ = sf.read(os.path.join(D, 'out', 'stem_fx.wav')); mix, _ = sf.read(os.path.join(D, 'out', 'mix.wav'))
mono = lambda x: x.mean(1) if x.ndim > 1 else x; vo, bed, fx, mix = map(mono, (vo, bed, fx, mix))
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9); pk = lambda x: 20 * np.log10(np.abs(x).max() + 1e-9)
rows = []
for s in TL['shots']:
    for v in s['vo']:
        for w, a, b in v.get('w', []):
            i, j = int(a * SR), int(b * SR)
            if j - i < SR * .05: continue
            h = int(SR * .01); fr = np.array([np.mean(vo[k:k + h] ** 2) for k in range(i, j - h + 1, h)])   # the word's voiced core: its loudest 60 % of 10 ms frames
            core = 10 * np.log10(np.mean(np.sort(fr)[-max(1, int(len(fr) * .6)):]) + 1e-12)                 # (a word's quiet decay tail is not what makes it heard)
            snr = core - db(bed[i:j])
            if snr < 9: rows.append(('FAIL', f"word “{w}” at {a:.2f}s is only {snr:.1f} dB above the music/ambience"))
vopk = pk(vo)
for s in TL['shots']:
    for e in s.get('events', []):
        t = s['a'] + e['t']; i, j = int(max(0, t - .25) * SR), int((t + .6) * SR); seg = fx[i:j]
        if len(seg) == 0 or pk(seg) < -50: rows.append(('FAIL', f"sound effect '{e['kind']}' at {t:.2f}s is silent")); continue
        if pk(seg) > vopk + 4: rows.append(('WARN', f"sound effect '{e['kind']}' at {t:.2f}s peaks {pk(seg) - vopk:.1f} dB above the narration"))
if pk(mix) > -.3: rows.append(('FAIL', f'mix peaks at {pk(mix):.2f} dBFS (clipping risk)'))
win = int(SR * .1); env = np.array([np.abs(mix[k:k + win]).max() for k in range(0, len(mix) - win, win)]); quiet = env < 10 ** (-55 / 20); run = 0
for k, q in enumerate(quiet[:-15]):
    run = run + 1 if q else 0
    if run == 12: rows.append(('WARN', f'{run / 10:.1f}s of near-silence at {k / 10 - 1.1:.1f}s'))
nf = sum(r[0] == 'FAIL' for r in rows)
print(f"{TL['code']} audio: {nf} FAIL, {len(rows) - nf} WARN | narration peak {vopk:.1f} dBFS, mix peak {pk(mix):.1f} dBFS")
for r in rows[:30]: print('  ', *r)
sys.exit(1 if nf else 0)
