#!/usr/bin/env python3
"""Word-level timestamps for every narration line, by FORCED ALIGNMENT of the exact script text to the generated audio (PocketSphinx;
its English model ships inside the pip package, so this works offline). Writes voices/align.json = { line_id: [[word, t0, t1], ...] }
with the words exactly as written in the script (punctuation kept), times in seconds from the start of that line's wav.
Also checks each line: every word got a plausible duration (40 ms – 1.4 s), no gap > 0.9 s inside a line, the alignment covers the audio.
Exit 1 if any line fails (listed). The strict word-for-word "did the voice say exactly this?" check is asr-verify (Whisper) on Vivek's PC.
Usage: words.py <short_dir>"""
import numpy as np
import sys, os, json, re, subprocess
from pocketsphinx import Decoder, get_model_path
D = sys.argv[1]; L = json.load(open(os.path.join(D, 'lines.json'))); L = L if isinstance(L, list) else L['lines']
MP = os.path.join(get_model_path(), 'en-us')
DICT = os.path.join(MP, 'cmudict-en-us.dict'); PRON = {}
for l in open(DICT):
    w, *ph = l.split(); PRON.setdefault(w, ' '.join(ph))
BASE = set(PRON)
EXTRA_W = set(); EXTRA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'island.dict')   # our own words: name -> phones (CMU set), one per line
if os.path.exists(EXTRA):
    for l in open(EXTRA):
        if l.strip() and not l.startswith('#'): w, *ph = l.split(); PRON[w] = ' '.join(ph); EXTRA_W.add(w)
dec = Decoder(hmm=os.path.join(MP, 'en-us'), dict=DICT, samprate=16000, loglevel='FATAL')
ADDED = set()
def known(w):   # make sure the aligner can say w: dictionary, our island.dict, or a compound of two dictionary words (waterline = water + line)
    if w in ADDED or (w in BASE and w not in EXTRA_W): return True
    p = PRON.get(w)
    if p is None and w.endswith("'s") and w[:-2] in PRON: p = PRON[w[:-2]] + ' Z'
    if p is None and w.endswith("s'") and w[:-1] in PRON: p = PRON[w[:-1]]   # wreckers' = wreckers
    if p is None:
        for i in range(3, len(w) - 2):
            if w[:i] in PRON and w[i:] in PRON: p = PRON[w[:i]] + ' ' + PRON[w[i:]]; break
    if p is None: return False
    dec.add_word(w, p, True); ADDED.add(w); return True
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def num(n): n = int(n); return ONES[n] if n < 20 else TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10]) if n < 100 else ONES[n // 100] + ' hundred' + ('' if n % 100 == 0 else ' ' + num(n % 100))
def spoken(tok):   # how a written token is said, as aligner words (3:12 -> three twelve)
    w = tok.lower().replace('’', "'").strip('.,!?;:"“”()—…-')
    if re.fullmatch(r'\d{1,2}:\d{2}', w): h, m = w.split(':'); return num(h).split() + (['o', num(m)] if int(m) < 10 else num(m).split())
    if re.fullmatch(r'\d+', w): return num(w).split()
    w = re.sub(r"[^a-z']", '', w).strip("'") if not w.endswith("s'") else re.sub(r"[^a-z']", '', w)
    return [w] if w else []
out, bad, bad_warn = {}, [], []
for ln in L:
    text = ln.get('say', ln['text']); toks = ln['text'].split(); wav = os.path.join(D, 'voices', ln['id'] + '.wav')
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    dur = len(pcm) / 32000; pcm16 = np.frombuffer(pcm, dtype=np.int16)
    groups = [spoken(t) for t in toks]; flat = [w for g in groups for w in g]
    oov = [w for w in flat if not known(w)]
    if oov: bad.append((ln['id'], f'not in the dictionary: {oov} (add them to tools/island.dict)')); out[ln['id']] = [[t, 0, 0] for t in toks]; continue
    try:   # two passes: words first, then the alignment itself (PocketSphinx 5)
        dec.set_align_text(' '.join(flat)); dec.start_utt(); dec.process_raw(pcm, full_utt=True); dec.end_utt()
        seg = [(s.word, s.start_frame / 100, (s.end_frame + 1) / 100) for s in dec.seg() if s.word not in ('<s>', '</s>', '<sil>', 'sil', '[NOISE]')]   # word segmentation of the forced-alignment search
    except Exception as e: seg = []; bad.append((ln['id'], f'alignment failed: {e}'))
    warn = []
    if seg and len(seg) != len(flat):   # the aligner sometimes swallows a short word ("for it" -> "for"): match by name, share the span of the word before
        names = [re.sub(r'\(\d+\)$', '', x[0]) for x in seg]; fixed, j = [], 0
        for w in flat:
            if j < len(seg) and names[j] == w: fixed.append(seg[j]); j += 1
            else: fixed.append(None)
        if j == len(seg) and all(f is not None for f in fixed[:1]):
            for i, f in enumerate(fixed):
                if f is None:
                    p = fixed[i - 1]; mid = (p[1] + p[2]) / 2
                    try:   # split at the quietest 10 ms inside the middle 15-75 % of the merged span (the gap between the two words), not blindly at its middle
                        en = lambda q: float(np.mean(np.square(pcm16[int(q * 16000):int(q * 16000) + 160].astype(np.float64)))) + 1.0
                        qs = np.arange(p[1], p[2], .01); E = [en(q) for q in qs]
                        # the gap is a valley: quiet compared with the onset of the next word after it (a decay tail is quiet but nothing follows it)
                        c = [(E[k] / max(E[k:]), qs[k]) for k in range(len(qs)) if .15 <= (qs[k] - p[1]) / (p[2] - p[1]) <= .75]
                        mid = round(min(c)[1], 2) if c else mid
                    except Exception: pass
                    fixed[i - 1] = (p[0], p[1], mid); fixed[i] = (flat[i], mid, p[2]); warn.append(flat[i])
            seg = fixed; bad_warn.append((ln['id'], f'estimated timing for {warn} (the aligner merged it with the word before)'))
        else: bad.append((ln['id'], f'aligned {len(seg)} of {len(flat)} words: {[x[0] for x in seg]}')); seg = []
    words, k = [], 0
    for tok, g in zip(toks, groups):
        if not g: words.append([tok, words[-1][2] if words else 0, words[-1][2] if words else 0]); continue
        a, b = (seg[k][1], seg[k + len(g) - 1][2]) if seg else (0, 0); k += len(g)
        words.append([tok, round(a, 3), round(b, 3)])
    if seg:
        for w, a, b in words:
            if b - a < (.02 if len(re.sub(r'\W', '', w)) <= 2 else .04) or b - a > 1.4: bad.append((ln['id'], f'implausible word "{w}" {b - a:.2f}s'))
        for (w0, a0, b0), (w1, a1, b1) in zip(words, words[1:]):
            if a1 - b0 > .9: bad.append((ln['id'], f'gap {a1 - b0:.2f}s between "{w0}" and "{w1}"'))
        if words[-1][2] < dur - .6: bad.append((ln['id'], f'alignment ends {dur - words[-1][2]:.2f}s before the audio does'))
    out[ln['id']] = words
json.dump(out, open(os.path.join(D, 'voices', 'align.json'), 'w'), indent=0)
print(f"words: {len(out)} lines, {sum(len(v) for v in out.values())} words" + ('' if not bad else f", {len(bad)} PROBLEMS") + ('' if not bad_warn else f", {len(bad_warn)} warnings"))
for b in bad: print('  FAIL', *b)
for b in bad_warn: print('  warn', *b)
sys.exit(1 if bad else 0)
