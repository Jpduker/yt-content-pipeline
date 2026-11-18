#!/usr/bin/env python3
"""short.json + voices/dur.json → timeline.json (shot a/b, VO start times, hook/ask windows). Usage: timeline.py <short_dir>
Pace rules (Vivek 2026-11-15 18:42: cinematic, not sleepy): voices at speed 1.0, .45 s between lines, a `pause` > .75 adds half of itself (reveals only), a shot's `lead` = silence before its first line, `tail` = hold after its last line."""
import json, sys, os
D = sys.argv[1]; S = json.load(open(os.path.join(D, 'short.json'))); DUR = json.load(open(os.path.join(D, 'voices', 'dur.json')))
WP = os.path.join(D, 'voices', 'align.json'); WORDS = json.load(open(WP)) if os.path.exists(WP) else {}   # from tools/words.py (forced alignment)
t = 0.0; shots = []
hook_end = 2.3 if S.get('hook') else 0
PACE = float(os.environ.get('PACE', '1.0'))   # cinematic: tight gaps, short holds; pauses only before reveals
for i, sh in enumerate(S['shots']):
    a = t; lead = sh.get('lead', .9) * .7
    if i == 0 and hook_end: lead = max(lead, hook_end + .3)
    cur = a + lead; vo = []
    for j, ln in enumerate(sh.get('lines', [])):
        if j > 0: cur += .45 + (ln.get('pause', 0) * .5 if ln.get('pause', 0) > .75 else 0)
        elif ln.get('pause'): cur += ln['pause'] * .5
        d = DUR[ln['id']]; vo.append({ 'id': ln['id'], 't': round(cur, 3), 'd': round(d, 3), 'sub': ln.get('sub', ln['text']), 'dlg': ln.get('dlg'), 'w': [[w, round(cur + a0, 3), round(cur + b0, 3)] for w, a0, b0 in WORDS.get(ln['id'], [])] }); cur += d
    tail = sh.get('tail', .9) * .8
    if i == len(S['shots']) - 1 and S.get('ask'): tail = max(tail, S.get('askLen', 3.2) + .5)
    b = max(a + sh.get('min', 3.0), cur + tail)
    out = dict(sh); out.pop('lines', None); out.update({ 'a': round(a, 3), 'b': round(b, 3), 'vo': vo }); shots.append(out); t = b
# The outro (Shorts): the question holds ~2.6 s, then a 4.8 s ending: music resolves, "next part" + like / subscribe / bell.
OUT = S.get('outroLen', 4.8) if S.get('ask') else 0; outro_at = round(t - .2, 3) if OUT else None
if OUT: t += OUT - .2; shots[-1]['b'] = round(t, 3)
TL = { 'code': S['code'], 'title': S['title'], 'label': S.get('label', "THE KEEPER'S ISLAND"), 'DUR': round(t, 3), 'shots': shots,
       'hook': S.get('hook'), 'hookEnd': hook_end, 'ask': S.get('ask'), 'askAt': round((outro_at if OUT else t) - S.get('askLen', 3.2), 3) if S.get('ask') else None, 'music': S.get('music', {}), 'tags': S.get('tags', True),
       'outroAt': outro_at, 'outro': S.get('outro', os.environ.get('OUTRO', 'lamp')) if OUT else None, 'next': S.get('next') }
if TL['askAt']: shots[-1]['camEnd'] = round(max(1.0, TL['askAt'] - shots[-1]['a']), 3)   # camera moves end when the question appears
json.dump(TL, open(os.path.join(D, 'timeline.json'), 'w'), indent=1)
print(f"{S['code']} {t:.1f}s  shots {[round(s['b']-s['a'],1) for s in shots]}  lines {sum(len(s['vo']) for s in shots)}")
if t > 59.5: print('WARN: over 59.5 s'); sys.exit(2)
