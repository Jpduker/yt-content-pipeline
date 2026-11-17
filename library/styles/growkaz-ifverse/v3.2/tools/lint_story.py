#!/usr/bin/env python3
"""Pre-render lint for a v3.1 project: catches the mistakes we have already made once.

usage: lint_story.py <project_dir>      exit 1 on any ERROR (render_chain.sh skips the project)
ERROR  - cast id not in scenes/cast.js (or X<n> extra); unknown shot kind
       - 9:16: a figure outside the visible crop while it is speaking (pan emulated from gen.js panFor)
       - 9:16: an 'ask' on a face close-up with an explicit askY between 900 and 1400 (covers the mouth)
       - Short longer than 60 s, or a Short with the old end card (shortEnd)
       - a string anchor ('L012+0.3') left unresolved in params
WARN   - shots longer than 9.5 s (16:9) / 7 s (9:16)
       - rotated or flying figures (rot / dy < -150): eyeball them on the contact sheet
       - 9:16: fring (countdown ring, top right) while a figure flies near it
       - Short whose last shot has no 'ask'
"""
import json, os, re, sys

def lerp(a, b, k): return a + (b - a) * k

def rotoff(w, q):   # gen.js panFor: a lying/tilted figure is framed by its body centre (sin(rot) * 115)
    import math
    r = w.get('rot') or 0
    if isinstance(r, list): r = ([v for f, v in r if f <= q] or [r[0][1]])[-1]
    return math.sin(r) * 115 if isinstance(r, (int, float)) else 0

def main(P):
    P = P.rstrip('/')
    cfg = json.load(open(f'{P}/config.json')); vert = cfg.get('aspect') == '9:16'
    S = json.load(open(f'{P}/story/shots.json'))['shots']
    lib = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../project/scenes')
    cast_src = open(f'{lib}/cast.js').read()
    cast = set(re.findall(r'\b([A-Z][A-Z_0-9]*)\s*:\s*\{', cast_src))   # v3.2: several entries per line
    kinds = {'charsheet', 'faces', 'scene', 'face', 'insert', 'blueprint', 'topdown', 'title', 'end', 'shortEnd', '3d', 'kt'}
    E, W = [], []
    LINES = json.load(open(f'{P}/timeline/lines.json'))
    TAGOF = {'YOU_TEE': 'YOU', 'MIRA_EVE': 'MIRA', 'MIRA_HOME': 'MIRA', 'ROSA': 'LADY'}
    vis = 1080 / (1920 / 1080)  # 607.5 stage px visible in a 9:16 frame
    for s in S:
        p = s.get('params') or {}; sid = s['id']; d = s['end'] - s['start']; k = p.get('k', s.get('scene'))
        if k not in kinds: E.append(f'{sid}: unknown kind {k}')
        if k == 'shortEnd' and vert: E.append(f'{sid}: Short has the old end card (shortEnd)')
        for key, v in p.items():
            if isinstance(v, str) and re.match(r'^L\d+', v): E.append(f'{sid}: unresolved anchor {key}={v}')
        if d > (7 if vert else 9.5): W.append(f'{sid}: {d:.1f}s shot')
        who = p.get('who') if isinstance(p.get('who'), list) else []
        for w in who:
            wid = w.get('id', '')
            if not (wid in cast or re.match(r'^X\d+$', wid)): E.append(f'{sid}: unknown cast id {wid}')
            if w.get('rot') or (isinstance(w.get('dy'), (int, float)) and w['dy'] < -150): W.append(f'{sid}: {wid} rotated/flying - check face on the sheet')
        if isinstance(p.get('who'), str) and not (p['who'] in cast or re.match(r'^X\d+$', p['who'])): E.append(f'{sid}: unknown cast id {p["who"]}')
        if not vert: continue
        if p.get('ask') and k == 'face' and p.get('askY') is not None and 900 <= p['askY'] <= 1400:
            E.append(f'{sid}: ask plate at askY {p["askY"]} covers the face')
        if p.get('fring') and any(isinstance(w.get('dy'), (int, float)) and w['dy'] < -250 for w in who): W.append(f'{sid}: countdown ring may sit on a flying head')
        pets = [dict(id='_' + f['k'], x=f['x']) for f in (p.get('floaters') or []) if f.get('k') in ('cat', 'dog')]
        if k == 'scene' and (who or pets) and p.get('cam'):
            # emulate gen.js panFor(): the 9:16 window follows the speaker (else YOU, else the middle)
            c0 = p['cam'][0]; c1 = p['cam'][1] if len(p['cam']) > 1 else c0
            main = ([w for w in who if not re.match(r'^X\d', w.get('id', ''))] + pets) or who
            ease = lambda x: x * x * (3 - 2 * x)
            seen = {w['id']: False for w in main}; bad_spk = set()
            n = max(2, int(d / .25))
            for i in range(n + 1):
                q = i / n; gt = s['start'] + q * d; ke = ease(q)
                cx, z = lerp(c0[0], c1[0], ke), lerp(c0[2], c1[2], ke)
                def fx(w):
                    if w.get('walk'):
                        a0, b0, k0, k1 = w['walk']; return lerp(a0, b0, min(1, max(0, (q - k0) / max(.01, k1 - k0)))) + rotoff(w, q)
                    return w['x'] + rotoff(w, q)
                sp = next((l for l in LINES if not l.get('thought') and gt >= l['start'] - .2 and gt <= l['end'] + .2 and l['tag'] != 'N'), None)
                spk = next((w for w in main if sp and TAGOF.get(w['id'], w['id']) == sp['tag']), None)
                if p.get('vx') is not None: pan = p['vx']
                else:
                    xs = [fx(w) for w in main]; mid = (min(xs) + max(xs)) / 2; span = (max(xs) - min(xs)) * z
                    you = next((w for w in main if w['id'] == 'YOU'), None)
                    f = mid if span < 480 else (fx(spk) if spk else (fx(you) if you else mid))
                    pan = 960 + (f - cx) * z
                left = min(max(pan - vis / 2, 0), 1920 - vis)
                for w in main:
                    sx = 960 + (fx(w) - cx) * z; inside = left + 40 <= sx <= left + vis - 40
                    if inside: seen[w['id']] = True
                    if spk is w and not inside: bad_spk.add(w['id'])
            for wid in bad_spk: E.append(f'{sid}: {wid} speaks but is outside the 9:16 crop')
            named = {TAGOF.get(w['id'], w['id']): w['id'] for w in main}   # v3.2: a character the narration names in this shot must be in the crop at some point
            for l in LINES:
                if l['start'] < s['end'] and l['end'] > s['start'] and l['tag'] == 'N':
                    for nm, wid in named.items():
                        if wid in seen and not seen[wid] and (nm.lower() in l['text'].lower() or (nm == 'THEO' and 'brother' in l['text'].lower())): E.append(f'{sid}: narration names {nm} but {wid} is outside the 9:16 crop')
            for wid, ok in seen.items():
                if not ok and wid not in bad_spk: (E if wid.startswith('_') else W).append(f'{sid}: {wid.lstrip("_")} never inside the 9:16 crop' + ('' if wid.startswith('_') else ' (intended?)'))
    if vert:
        dur = S[-1]['end']
        if dur > 60: E.append(f'Short is {dur:.1f}s (> 60)')
        if not (S[-1].get('params') or {}).get('ask'): W.append('last shot has no ask')
    for m in E: print('ERROR', P.split('what-if/')[-1], m)
    for m in W: print('WARN ', P.split('what-if/')[-1], m)
    print(f'lint {"FAIL" if E else "ok"} {P.split("what-if/")[-1]}: {len(E)} errors, {len(W)} warnings')
    return 1 if E else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))
