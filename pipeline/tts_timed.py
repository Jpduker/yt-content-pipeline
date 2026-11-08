"""Kokoro voice WITH real timings (exact caption + lip sync). Same interface as lemo's core/tts/tts.py:
   $LIB/.venv/bin/python pipeline/tts_timed.py lines.json out_dir
Writes out_dir/<id>.wav, dur.json, words.json ({id: [{w,t0,t1}]}) and phonemes.json ({id: [[ph,t0,t1], ...]}),
all times in seconds from the start of the trimmed wav. Needs the timed model (tools/lemo-opuscar/core/tts/kokoro-v1.0-timed.onnx);
make it once with:  python3 pipeline/make_timed_kokoro.py   (pip install onnx). Falls back to an error message if missing.
Why: align_words.py ESTIMATES word times from phoneme counts (can be ~0.3 s off inside a line). These timings come from the
model's own duration predictor, so captions and mouths land on the exact frame."""
import sys, os, json, re
import numpy as np, soundfile as sf
if len(sys.argv) < 3: print(__doc__); sys.exit(2)
LIB = os.environ.get('LIB') or os.environ.get('LEMO_OPUSCAR_HOME') or 'tools/lemo-opuscar'
MODEL = os.path.join(LIB, 'core/tts/kokoro-v1.0-timed.onnx'); VOICES = os.path.join(LIB, 'core/tts/voices-v1.0.bin')
if not os.path.exists(MODEL): sys.exit(f'tts_timed.py: {MODEL} missing. Make it once: python3 pipeline/make_timed_kokoro.py')
from kokoro_onnx import Kokoro
k = Kokoro(MODEL, VOICES)
lines, out = json.load(open(sys.argv[1], encoding='utf-8')), sys.argv[2]; os.makedirs(out, exist_ok=True)
dur, words, phs = {}, {}, {}
for L in lines:
    v = L.get('kokoro_voice') or L.get('voice') or 'af_heart'
    a, sr, T = k.create_timed(L['text'], voice=v, speed=L.get('speed', .92), lang=L.get('lang', 'en-us'))
    nz = np.where(np.abs(a) > np.abs(a).max() * .02)[0]
    s0 = max(0, nz[0] - int(.03 * sr)); s1 = nz[-1] + int(.08 * sr); a = a[s0:s1]; off = s0 / sr
    sf.write(os.path.join(out, L['id'] + '.wav'), a, sr); dur[L['id']] = round(len(a) / sr, 3)
    P = [[t.phoneme, round(max(0, t.start - off), 3), round(max(0, t.end - off), 3)] for t in T]
    phs[L['id']] = P
    # words: phoneme groups split on spaces; punctuation-only groups are dropped
    groups, cur = [], []
    for p in P:
        if p[0].isspace():
            if cur: groups.append(cur); cur = []
        else: cur.append(p)
    if cur: groups.append(cur)
    groups = [g for g in groups if any(re.match(r'[^\W_]', x[0]) or x[0] in 'ˈˌːəɪʊæɑɔɛʌθðʃʒŋɹɾʔ' for x in g)]
    W = L['text'].split()
    if len(groups) == len(W):
        words[L['id']] = [{'w': w, 't0': g[0][1], 't1': g[-1][2]} for w, g in zip(W, groups)]
    elif 0 < len(groups) < len(W):
        # espeak sometimes speaks two words as one group ("walked in", "out of"): DP-assign consecutive words to each group by
        # matching letters to phonemes, then split a shared group's time by the words' letter counts.
        cl = [len(re.sub(r'\W', '', w)) or 1 for w in W]; pl = [len(g) for g in groups]; r = sum(cl) / sum(pl)
        n, m = len(W), len(groups); INF = 1e9; C = [[INF] * (m + 1) for _ in range(n + 1)]; B = [[0] * (m + 1) for _ in range(n + 1)]; C[0][0] = 0
        for j in range(1, m + 1):
            for i in range(j, n - (m - j) + 1):
                for s in range(j - 1, i):
                    c = C[s][j - 1] + abs(np.log(sum(cl[s:i]) / (pl[j - 1] * r))) + .35 * (i - s - 1)
                    if c < C[i][j]: C[i][j], B[i][j] = c, s
        cuts, i = [], n
        for j in range(m, 0, -1): s = B[i][j]; cuts.append((s, i, groups[j - 1])); i = s
        out_w = []
        for s, e, g in reversed(cuts):
            t0, t1 = g[0][1], g[-1][2]; tot = sum(cl[s:e]); acc = 0
            for q in range(s, e):
                a0 = t0 + (t1 - t0) * acc / tot; acc += cl[q]; out_w.append({'w': W[q], 't0': round(a0, 3), 't1': round(t0 + (t1 - t0) * acc / tot, 3)})
        words[L['id']] = out_w
    else:   # number/abbreviation expanded differently: spread words across the voiced span by character length
        print(f'  note: {L["id"]} {len(W)} words vs {len(groups)} phoneme groups -> proportional', file=sys.stderr)
        t0 = groups[0][0][1] if groups else 0; t1 = groups[-1][-1][2] if groups else dur[L['id']]
        cl = np.cumsum([0] + [len(w) + 1 for w in W]); cl = cl / cl[-1]
        words[L['id']] = [{'w': w, 't0': round(t0 + (t1 - t0) * cl[i], 3), 't1': round(t0 + (t1 - t0) * cl[i + 1], 3)} for i, w in enumerate(W)]
    print(L['id'], dur[L['id']], L['text'])
for n, o in (('dur', dur), ('words', words), ('phonemes', phs)): json.dump(o, open(os.path.join(out, n + '.json'), 'w', encoding='utf-8'), indent=0)
