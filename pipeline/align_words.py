"""Word timings for Kokoro lines without an ASR model (works offline, in the cloud and in WSL).
How: find the pauses in each voice file (RMS envelope, gaps >= 70 ms), split the line's text at punctuation into
phrases, match phrases to speech runs in order (merging the shortest gaps when there are more runs than phrases), then
spread the words of each phrase over its run by phoneme count (espeak, the same phonemizer Kokoro uses).
Writes voices/words.json: {id: [{"w": word, "t0": s, "t1": s}, ...]} with times relative to the line start.
Usage: $LIB/.venv/bin/python align_words.py EPISODE_DIR   (needs lines.json + voices/<id>.wav)
Accuracy: phrase starts land on real onsets (±20 ms); words inside a phrase are estimates (typ. ±80 ms).
On a machine with Hugging Face access, faster-whisper word timestamps are exact; prefer them there."""
import sys, os, json, re
import numpy as np, soundfile as sf
LIB = os.environ.get('LIB'); sys.path.insert(0, LIB) if LIB else None
from kokoro_onnx.tokenizer import Tokenizer
D = sys.argv[1]; tok = Tokenizer()
lines = json.load(open(os.path.join(D, 'lines.json'))); out = {}
def runs(y, sr, gap=.07, thr_db=-38):
    hop = int(sr * .01); n = len(y) // hop; e = np.array([np.sqrt(np.mean(y[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    on = 20 * np.log10(e / e.max()) > thr_db; R = []; i = 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]: j += 1
            R.append([i * hop / sr, j * hop / sr]); i = j
        else: i += 1
    M = []                                                     # bridge gaps shorter than `gap` (stops, plosives)
    for r in R:
        if M and r[0] - M[-1][1] < gap: M[-1][1] = r[1]
        else: M.append(r)
    return M
for L in lines:
    y, sr = sf.read(os.path.join(D, 'voices', L['id'] + '.wav'))
    if y.ndim > 1: y = y.mean(1)
    text = L['text']; phr = [p.strip() for p in re.split(r'(?<=[,.!?;:])\s+', text) if p.strip()]
    R = runs(y, sr)
    while len(R) > len(phr):                                  # merge the shortest gap until counts match
        g = [R[i + 1][0] - R[i][1] for i in range(len(R) - 1)]; k = int(np.argmin(g)); R[k] = [R[k][0], R[k + 1][1]]; del R[k + 1]
    while len(R) < len(phr):                                  # fewer pauses than punctuation: split the longest run
        k = int(np.argmax([r[1] - r[0] for r in R])); a, b = R[k]; R[k:k + 1] = [[a, (a + b) / 2], [(a + b) / 2, b]]
    W = []
    for p, (a, b) in zip(phr, R):
        words = p.split(); w8 = [max(1, len(tok.phonemize(re.sub(r"[^\w'’-]", '', w) or w, 'en-us').replace(' ', ''))) + 1.5 for w in words]
        tot = sum(w8); t = a
        for w, k in zip(words, w8): d = (b - a) * k / tot; W.append({'w': w, 't0': round(t, 3), 't1': round(t + d, 3)}); t += d
    out[L['id']] = W
json.dump(out, open(os.path.join(D, 'voices', 'words.json'), 'w'), indent=0)
print('words.json', {k: len(v) for k, v in out.items()})
