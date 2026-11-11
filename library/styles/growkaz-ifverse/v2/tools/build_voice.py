"""WI02 multi-voice narration: script.md (speaker tags) -> lines.json -> per-line Kokoro wavs (timed) -> voiceover.wav + words.json.
Usage (from the repo root):  LIB=tools/lemo-opuscar python3 <episode>/voice/build_voice.py <episode>
Thoughts (TAG-T) get the same voice, softer, low-passed, with a short room reverb; they are flagged so captions can skip them."""
import sys, os, re, json, subprocess
import numpy as np, soundfile as sf

EP = sys.argv[1]
VOICES = {'N': ('am_michael', .95), 'YOU': ('am_michael', .92), 'MIRA': ('af_heart', 1.0), 'BARISTA': ('am_puck', 1.0),
          'BOSS': ('bm_george', 1.0), 'COLL': ('af_nicole', 1.0), 'TRAIN': ('bf_emma', .97)}
# pause (s) BEFORE a line, by id of the line, for story beats; default gaps below
BEAT = {'act1': 2.6, 'act2': 1.1, 'act3': 1.2, 'end': 2.6}
# extra air before these lines (emotional beats; Codex: let the ending breathe)
PAUSE = {'L004': .5, 'L014': .3, 'L021': .4, 'L043': .5, 'L067': 1.0, 'L068': .5, 'L069': .7, 'L070': .4, 'L084': .7, 'L085': .4, 'L092': 1.0, 'L093': .6, 'L095': .9, 'L098': .5, 'L099': .7, 'L100': .5, 'L101': .4, 'L102': 1.0}

lines, sec = [], 'hook'
for raw in open(os.path.join(EP, 'script.md'), encoding='utf-8'):
    s = raw.strip()
    if s.startswith('## '):
        sec = {'## HOOK': 'hook', '## ACT 1': 'act1', '## ACT 2': 'act2', '## ACT 3': 'act3', '## END': 'end'}.get(s[:7].rstrip(':'), None) or \
              next((v for k, v in [('HOOK', 'hook'), ('ACT 1', 'act1'), ('ACT 2', 'act2'), ('ACT 3', 'act3'), ('END', 'end')] if k in s), sec)
        lines.append({'sec': sec, 'mark': True}); continue
    m = re.match(r'^([A-Z]+)(-T)?(?: \(([^)]*)\))?: (.+)$', s)
    if not m or s.startswith('✎') or s.startswith('On screen'): continue
    tag, thought, note, text = m.group(1), bool(m.group(2)), m.group(3) or '', m.group(4)
    text = re.sub(r'\s*✎.*$', '', text).strip().strip('"').replace('“', '').replace('”', '')
    text = text.replace('"', '')
    if 'read by N' in note: tag = 'N'
    soft = 'soft' in note
    v, sp = VOICES[tag]
    lines.append({'id': f'L{len([l for l in lines if "id" in l]) + 1:03d}', 'tag': tag, 'thought': thought, 'soft': soft,
                  'text': text, 'voice': v, 'speed': sp, 'sec': sec})

spoken = [l for l in lines if 'id' in l]
os.makedirs(os.path.join(EP, 'voice/lines'), exist_ok=True)
json.dump(spoken, open(os.path.join(EP, 'voice/lines.json'), 'w'), indent=1)
LIB = os.environ.get('LIB', 'tools/lemo-opuscar')
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.abspath(os.path.join(here, '../../../../..'))
if not os.environ.get('SKIP_TTS'): subprocess.run([sys.executable, os.path.join(root, 'pipeline/tts_timed.py'), os.path.join(EP, 'voice/lines.json'),
                os.path.join(EP, 'voice/lines')], check=True, env={**os.environ, 'LIB': LIB})

W = json.load(open(os.path.join(EP, 'voice/lines/words.json')))
SR = 24000
def load(i): a, sr = sf.read(os.path.join(EP, 'voice/lines', i + '.wav'), dtype='float32'); assert sr == SR; return a
def thought_fx(a):
    # low-pass (one-pole ~3.2 kHz), -3 dB, short room reverb (multi-tap, 22 % wet)
    k = np.exp(-2 * np.pi * 3200 / SR); y = np.zeros_like(a); acc = 0.0
    for n in range(len(a)): acc = (1 - k) * a[n] + k * acc; y[n] = acc
    out = np.concatenate([y, np.zeros(int(.6 * SR), 'float32')])
    wet = np.zeros_like(out)
    for d, g in [(.031, .5), (.047, .42), (.071, .33), (.113, .25), (.167, .17), (.241, .11), (.337, .07)]:
        n = int(d * SR); wet[n:] += g * out[:len(out) - n]
    return (.71 * (out + .22 * wet)).astype('float32')

track, words, segs, t = [], [], [], 0.6
track.append(np.zeros(int(.6 * SR), 'float32'))
prev = None
pending_beat = 0.0
for l in lines:
    if 'mark' in l: pending_beat = BEAT.get(l['sec'], 0.0); continue
    a = load(l['id'])
    if l['thought']: a = thought_fx(a)
    if l['soft']: a = a * .7
    if prev is None: gap = 0
    elif l['tag'] != prev['tag'] or l['thought'] != prev['thought']: gap = .42
    else: gap = .30
    if prev and prev['text'].endswith('—'): gap = .22
    gap = max(gap, pending_beat) + PAUSE.get(l['id'], 0); pending_beat = 0.0
    track.append(np.zeros(int(gap * SR), 'float32')); t += gap
    segs.append({'id': l['id'], 'tag': l['tag'], 'thought': l['thought'], 'text': l['text'], 'start': round(t, 3), 'end': round(t + len(a) / SR, 3)})
    for w in W[l['id']]:
        words.append({'w': w['w'], 't0': round(t + w['t0'], 3), 't1': round(t + w['t1'], 3), 'line': l['id'], 'tag': l['tag'], 'thought': l['thought']})
    track.append(a); t += len(a) / SR; prev = l
track.append(np.zeros(int(1.5 * SR), 'float32'))
vo = np.concatenate(track); vo = vo / max(1e-6, np.abs(vo).max()) * .89
os.makedirs(os.path.join(EP, 'project/input'), exist_ok=True); os.makedirs(os.path.join(EP, 'project/timeline'), exist_ok=True)
sf.write(os.path.join(EP, 'project/input/voiceover.wav'), vo, SR)
json.dump(words, open(os.path.join(EP, 'project/timeline/words_all.json'), 'w'))
# kit caption format; thoughts are shown in-world (motif), not in the caption bar (style v2 §6)
json.dump({'words': [{'word': w['w'], 'start': w['t0'], 'end': w['t1']} for w in words if not w['thought']]},
          open(os.path.join(EP, 'project/timeline/words.json'), 'w'))
json.dump(segs, open(os.path.join(EP, 'project/timeline/lines.json'), 'w'), indent=1)
print(f'voiceover {len(vo) / SR:.1f} s, {len(segs)} lines, {len(words)} words')
