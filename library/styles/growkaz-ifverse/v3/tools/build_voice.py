"""growkaz-ifverse v3 voice: script.md -> natural multi-voice track with exact word timings.
Fixes JP's WI02 feedback ("pacing a bit off", "dialogue slow and robotic"):
  1. consecutive lines of one speaker are synthesised in ONE Kokoro call (prosody carries across sentences), then split by word timings;
  2. gaps depend on intent: natural pause inside a paragraph, fast answers in dialogue, explicit `~ s` beats from the script;
  3. dialogue is faster than narration; the narrator is quieter and closer (intimate), characters are dry and forward.
Usage (repo root):  LIB=tools/lemo-opuscar python3 library/styles/growkaz-ifverse/v3/tools/build_voice.py <episode> [--only L001-L012 --out sample.wav]
Episode config: <episode>/voice/voice.json  {"voices": {"N": ["am_michael", 0.97, 0.0], ...}, "beats": {"act1": 1.4, ...}, "nat": [0.16, 0.55, 0.9]}
Script syntax: `TAG[-T][ (note)]: text` · `~ 0.6` extra pause before the next line · `## SECTION` · `>` stage direction (not spoken; adds a scene beat).
Notes: (phone) phone-call filter · (text) a sent message, read softly · (soft) quieter.  -T = thought / unsent text (soft, reverb, not in the karaoke bar)."""
import sys, os, re, json, subprocess
import numpy as np, soundfile as sf
from scipy.signal import lfilter, butter, sosfilt

EP = sys.argv[1]; ARGS = sys.argv[2:]
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
CFG = json.load(open(os.path.join(EP, 'voice/voice.json')))
VOICES, BEATS = CFG['voices'], CFG.get('beats', {})
NAT_LO, NAT_HI, NAT_K = CFG.get('nat', [.16, .55, .9])
SR = 24000

# ---------- parse ----------
items, sec, pend = [], 'hook', 0.0
for raw in open(os.path.join(EP, 'script.md'), encoding='utf-8'):
    s = raw.strip()
    if s.startswith('## '):
        sec = next((v for k, v in [('HOOK', 'hook'), ('ACT 1', 'act1'), ('ACT 2', 'act2'), ('ACT 3', 'act3'), ('END', 'end')] if k in s), sec)
        items.append({'mark': sec}); continue
    if s.startswith('>'): pend += CFG.get('scene_beat', .9); continue      # a new place gets a breath without narration
    m = re.match(r'^~\s*([\d.]+)$', s)
    if m: pend += float(m.group(1)); continue
    m = re.match(r'^([A-Z]+)(-T)?(?: \(([^)]*)\))?: (.+)$', s)
    if not m or s.startswith('On screen'): continue
    tag, thought, note, text = m.group(1), bool(m.group(2)), m.group(3) or '', m.group(4).strip()
    v, sp, gain = (VOICES[tag] + [0])[:3]
    if thought: sp = CFG.get('thought_speed', sp)
    items.append({'id': f'L{sum(1 for i in items if "id" in i) + 1:03d}', 'tag': tag, 'thought': thought, 'note': note, 'text': text,
                  'voice': v, 'speed': sp, 'gain': gain, 'sec': sec, 'pause': pend}); pend = 0.0
lines = [i for i in items if 'id' in i]

# ---------- groups: one synthesis call per run of lines by the same voice ----------
groups, cur = [], None
for it in items:
    if 'mark' in it: cur = None; continue
    same = cur and cur['tag'] == it['tag'] and cur['thought'] == it['thought'] and cur['note'] == it['note'] and it['pause'] <= .45 \
        and len(cur['text']) + len(it['text']) < 300 and not cur['text'].endswith('—')
    if same: cur['text'] += ' ' + it['text']; cur['ids'].append(it['id'])
    else: cur = {'id': f'G{len(groups) + 1:03d}', 'tag': it['tag'], 'thought': it['thought'], 'note': it['note'], 'text': it['text'], 'voice': it['voice'], 'speed': it['speed'], 'ids': [it['id']]}; groups.append(cur)
    it['group'] = cur['id']
gd = os.path.join(EP, 'voice/groups'); os.makedirs(gd, exist_ok=True)
json.dump(lines, open(os.path.join(EP, 'voice/lines.json'), 'w'), indent=1)
sig = json.dumps([[g['text'], g['voice'], g['speed']] for g in groups])
if not os.environ.get('SKIP_TTS') and not (os.path.exists(gd + '/sig.json') and open(gd + '/sig.json').read() == sig):
    json.dump(groups, open(gd + '/groups.json', 'w'), indent=1)
    subprocess.run([sys.executable, os.path.join(ROOT, 'pipeline/tts_timed.py'), gd + '/groups.json', gd], check=True, env={**os.environ, 'LIB': os.environ.get('LIB', os.path.join(ROOT, 'tools/lemo-opuscar'))}, stdout=subprocess.DEVNULL)
    open(gd + '/sig.json', 'w').write(sig)
GW = json.load(open(gd + '/words.json'))

# ---------- split groups into lines ----------
def fade(a, n_in=120, n_out=600):
    a = a.copy(); n_in = min(n_in, len(a) // 2); n_out = min(n_out, len(a) // 2)
    a[:n_in] *= np.linspace(0, 1, n_in); a[-n_out:] *= np.linspace(1, 0, n_out); return a
L = {l['id']: l for l in lines}
for g in groups:
    a, sr = sf.read(os.path.join(gd, g['id'] + '.wav'), dtype='float32'); assert sr == SR
    W = GW[g['id']]; k = 0; prev_end = None
    for j, lid in enumerate(g['ids']):
        n = len(L[lid]['text'].split()); ws = W[k:k + n]; k += n
        t0, t1 = ws[0]['t0'], ws[-1]['t1']
        nxt = W[k]['t0'] if k < len(W) else len(a) / SR
        a0 = 0 if j == 0 else max((prev_end + t0) / 2, t0 - .04); a1 = len(a) / SR if k >= len(W) else min((t1 + nxt) / 2, t1 + .09)
        L[lid]['nat'] = None if j == 0 else round(t0 - prev_end, 3)
        L[lid]['audio'] = fade(a[int(a0 * SR):int(a1 * SR)]); L[lid]['words'] = [{'w': w['w'], 't0': round(w['t0'] - a0, 3), 't1': round(w['t1'] - a0, 3)} for w in ws]
        L[lid]['lead'] = t0 - a0; L[lid]['tail'] = a1 - t1; prev_end = t1
    assert k == len(W), (g['id'], k, len(W))

# ---------- per-line processing ----------
def rms(a): v = a[np.abs(a) > .02]; return float(np.sqrt(np.mean(v ** 2))) if len(v) else 1e-3
def thought_fx(a):
    k = np.exp(-2 * np.pi * 3200 / SR); y = lfilter([1 - k], [1, -k], a).astype('float32')
    out = np.concatenate([y, np.zeros(int(.6 * SR), 'float32')]); wet = np.zeros_like(out)
    for d, gg in [(.031, .5), (.047, .42), (.071, .33), (.113, .25), (.167, .17), (.241, .11), (.337, .07)]:
        n = int(d * SR); wet[n:] += gg * out[:len(out) - n]
    return (.8 * (out + .22 * wet)).astype('float32')
def phone_fx(a):
    y = sosfilt(butter(4, [320, 3300], 'bandpass', fs=SR, output='sos'), a); y = np.tanh(y * 2.2) / 2.0
    return (y + .004 * np.random.default_rng(3).standard_normal(len(y))).astype('float32')
def warm(a):   # intimate narrator: a little low shelf, softer top
    lo = sosfilt(butter(2, 220, 'lowpass', fs=SR, output='sos'), a); hi = sosfilt(butter(2, 7000, 'lowpass', fs=SR, output='sos'), a)
    return (hi + .28 * lo).astype('float32')
TARGET = .085
for l in lines:
    a = l['audio']; a = a * (TARGET / rms(a))
    if l['tag'] == 'N': a = warm(a)
    if 'phone' in l['note']: a = phone_fx(a) * 1.15
    if l['thought']: a = thought_fx(a)
    if 'soft' in l['note']: a = a * .75
    if 'text' in l['note']: a = a * .85
    l['audio'] = (a * 10 ** (l['gain'] / 20)).astype('float32')

# ---------- assemble with intent-based gaps ----------
def gap_for(p, l):
    if p is None: return .5
    if l.get('group') == p.get('group') and l['nat'] is not None: return float(np.clip(l['nat'] * NAT_K, NAT_LO, NAT_HI))
    if p['text'].endswith('—'): return .04
    pn, ln = p['tag'] == 'N', l['tag'] == 'N'
    if l['thought']: return .34
    if p['thought']: return .42
    if pn and ln: return .34
    if pn and not ln: return .26
    if not pn and ln: return .40
    return .15 if p['tag'] != l['tag'] else .28      # dialogue answers fast
track, words, segs, t, prev, pb = [], [], [], 0.0, None, 0.0
for it in items:
    if 'mark' in it: pb = BEATS.get(it['mark'], 0.0); continue
    l = it; g = gap_for(prev, l); g = max(g, pb) + l['pause']; pb = 0.0
    g = max(.02, g - l['lead'] - (prev['tail'] if prev else 0))            # gaps are measured word-end to word-start
    track.append(np.zeros(int(g * SR), 'float32')); t += int(g * SR) / SR
    a = l['audio']; n_sp = len(a) - (int(.6 * SR) if l['thought'] else 0)
    segs.append({'id': l['id'], 'tag': l['tag'], 'thought': l['thought'], 'note': l['note'], 'text': l['text'], 'sec': l['sec'],
                 'start': round(t + l['words'][0]['t0'], 3), 'end': round(t + l['words'][-1]['t1'], 3)})
    for w in l['words']: words.append({'w': w['w'], 't0': round(t + w['t0'], 3), 't1': round(t + w['t1'], 3), 'line': l['id'], 'tag': l['tag'], 'thought': l['thought']})
    if l['thought']:   # let the reverb tail overlap the following gap instead of delaying the next line
        track.append(a[:n_sp]); l['_tail'] = a[n_sp:]; t += n_sp / SR
    else: track.append(a); t += len(a) / SR
    prev = l
track.append(np.zeros(int(1.6 * SR), 'float32'))
vo = np.concatenate(track)
for s, l in zip(segs, lines):
    if l.get('_tail') is not None:
        i = int(s['end'] * SR) + int(l['tail'] * SR); tl = l['_tail'][:max(0, len(vo) - i)]; vo[i:i + len(tl)] += tl
pk = np.abs(vo).max(); vo = vo / max(1e-6, pk) * .89

if '--only' in ARGS:
    a, b = ARGS[ARGS.index('--only') + 1].split('-'); out = ARGS[ARGS.index('--out') + 1]
    s0 = next(s for s in segs if s['id'] == a)['start'] - .3; s1 = next(s for s in segs if s['id'] == b)['end'] + .5
    sf.write(out, vo[int(max(0, s0) * SR):int(s1 * SR)], SR); print('sample', out, round(s1 - s0, 1), 's'); sys.exit(0)
os.makedirs(os.path.join(EP, 'project/input'), exist_ok=True); os.makedirs(os.path.join(EP, 'project/timeline'), exist_ok=True)
sf.write(os.path.join(EP, 'project/input/voiceover.wav'), vo, SR)
json.dump(words, open(os.path.join(EP, 'project/timeline/words_all.json'), 'w'))
json.dump({'words': [{'word': w['w'], 'start': w['t0'], 'end': w['t1']} for w in words if not w['thought']]}, open(os.path.join(EP, 'project/timeline/words.json'), 'w'))
json.dump(segs, open(os.path.join(EP, 'project/timeline/lines.json'), 'w'), indent=1)
sp = sum(s['end'] - s['start'] for s in segs)
print(f'voiceover {len(vo) / SR:.1f} s · {len(segs)} lines in {len(groups)} calls · {len(words)} words · speech {sp:.0f} s ({sp / (len(vo) / SR):.0%})')
