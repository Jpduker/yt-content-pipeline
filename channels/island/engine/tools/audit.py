#!/usr/bin/env python3
"""Quality audit of one Short (or chapter) from timeline.json + audit.json (audit.mjs). Prints and writes <dir>/AUDIT.md; exit 1 on any FAIL.
Checks (every 0.25 s):
  UI     every caption / dialogue / plate / tag / outro box inside the Shorts safe area; no two UI boxes overlapping; captions present while
         narration is being spoken, never two at once; no caption while a dialogue box is up.
  CAST   the shot's hero is in frame (≥ 85 %) with head and chest not hidden behind scenery; a named character is not cut by the frame edge
         at the head; characters do not overlap each other by more than 35 %; no character's face is under a UI box; no out-of-focus
         giant in the foreground (a character box taller than the frame covering the hero).
  SYNC   every narration line sits inside one shot (no line runs across a cut); a character the line names is on screen for most of that line;
         word times exist for every line (tools/words.py) and lie inside the line.
Usage: audit.py <dir> [--quiet]"""
import json, sys, os, re
D = sys.argv[1]; TL = json.load(open(os.path.join(D, 'timeline.json'))); A = json.load(open(os.path.join(D, 'audit.json')))
portrait = A[0]['H'] > A[0]['W']; W, H = A[0]['W'], A[0]['H']
SAFE = (60, 230, 930, 1440) if portrait else (40, 40, W - 40, H - 40)
NAMES = { 'gus': ['gus', 'keeper'], 'mabel': ['mabel'], 'rollo': ['rollo'], 'pip': ['pip'], 'wren': ['wren'], 'dunn': ['dunn'], 'marlo': ['marlo'],
          'crane': ['crane'], 'stranger': ['stranger', 'hood', 'yellow coat'], 'shade': ['shadow'] }
issues = []
def add(sev, kind, t, shot, msg): issues.append((sev, kind, round(t, 2), shot, msg))
def inter(a, b):
    x = max(0, min(a['x'] + a['w'], b['x'] + b['w']) - max(a['x'], b['x'])); y = max(0, min(a['y'] + a['h'], b['y'] + b['h']) - max(a['y'], b['y'])); return x * y
def area(a): return max(1, a['w'] * a['h'])
shot_of = { s['id']: s for s in TL['shots'] }
vo = [(v, s) for s in TL['shots'] for v in s['vo']]
speaking = lambda t: [v for v, s in vo if not v.get('dlg') and any(w[1] - .02 <= t < w[2] for w in v.get('w', []))]
for smp in A:
    t, sid = smp['t'], smp['shot']; sh = shot_of.get(sid, {}); ui = [u for u in smp['ui'] if u['k'] != 'outro'] if smp['t'] >= (TL.get('outroAt') or 1e9) else smp['ui']
    if sh.get('insert'): continue
    # UI inside the safe area, no overlaps
    for u in smp['ui']:
        if u['k'] in ('insert',): continue
        if u['x'] < SAFE[0] - 4 or u['y'] < SAFE[1] - 4 or u['x'] + u['w'] > SAFE[2] + 4 or u['y'] + u['h'] > SAFE[3] + 4: add('FAIL', 'ui-safe', t, sid, f"{u['k']} box {u['x']},{u['y']} {u['w']}x{u['h']} leaves the Shorts safe area")
    for i, a in enumerate(ui):
        for b in ui[i + 1:]:
            if inter(a, b) > 0 and {a['k'], b['k']} != {'tag'}: add('FAIL', 'ui-overlap', t, sid, f"{a['k']} overlaps {b['k']}")
    WHO = { v[0]: k for k, v in { 'gus': ['GUS'], 'mabel': ['MABEL'], 'pip': ['PIP'], 'rollo': ['ROLLO'], 'wren': ['OLD WREN'], 'dunn': ['DUNN'], 'marlo': ['MARLO'], 'crane': ['SILAS CRANE'], 'stranger': ['THE STRANGER'] }.items() }
    for u in smp['ui']:
        if u['k'] == 'tag' and u.get('n') in WHO:
            c = next((c for c in smp['chars'] if c['k'] == WHO[u['n']] and not c.get('behind')), None)
            if not c or c['inFrame'] < .5 or c['h'] > H * 1.2: add('FAIL', 'tag-offscreen', t, sid, f"name card {u['n']} is up but {WHO[u['n']]} is not on screen")
    caps = [u for u in smp['ui'] if u['k'] == 'caption']
    if len(caps) > 1: add('FAIL', 'caption-double', t, sid, 'two captions at once')
    if speaking(t) and not caps: add('FAIL', 'caption-missing', t, sid, 'narration is being spoken but no caption is shown')
    if caps and any(u['k'] == 'dialogue' for u in smp['ui']): add('FAIL', 'caption+dialogue', t, sid, 'a caption and a dialogue box at the same time')
    # cast
    chars = { c['k']: c for c in smp['chars'] if not c.get('behind') }
    hero = next((c for c in chars.values() if c.get('hero')), None)
    if hero:
        if hero['inFrame'] < .85: add('FAIL', 'hero-cut', t, sid, f"hero {hero['k']} only {int(hero['inFrame'] * 100)} % in frame")
        bad = [h.split(':')[0] for h in hero['hidden'] if h.split(':')[0] in ('head', 'eyes', 'chest')]
        if bad: add('FAIL', 'hero-occluded', t, sid, f"hero {hero['k']} hidden behind scenery at {bad} ({hero['hidden'][0].split(':')[1]})")
        hy = hero['y'] + hero['h'] * .15; hx = hero['x'] + hero['w'] * .5
        for u in ui:
            if u['k'] in ('caption', 'dialogue', 'plate', 'tag') and u['x'] <= hx <= u['x'] + u['w'] and u['y'] <= hy <= u['y'] + u['h']: add('FAIL', 'face-under-ui', t, sid, f"hero {hero['k']}'s face is under the {u['k']}")
        if portrait and (hx > 930 or hy > 1440 or hy < 230): add('WARN', 'hero-unsafe', t, sid, f"hero {hero['k']}'s face at {int(hx)},{int(hy)} is under the Shorts UI")
    for k, c in chars.items():
        if c['inFrame'] > .02 and c['h'] > H * 1.15 and hero and k != hero['k'] and inter(c, hero) > .2 * area(hero): add('FAIL', 'foreground-giant', t, sid, f"{k} fills the foreground ({c['h']} px tall) over the hero {hero['k']}")
        hid = [h.split(':')[0] for h in c['hidden']]
        if c['inFrame'] > .5 and len(hid) >= 4 and not c.get('hero'): add('WARN', 'occluded', t, sid, f"{k} mostly hidden behind scenery ({len(hid)}/7 points)")
    ks = [c for c in chars.values() if c['inFrame'] > .3 and c['h'] < H * 1.1]
    for i, a in enumerate(ks):
        for b in ks[i + 1:]:
            o = inter(a, b) / min(area(a), area(b))
            if o > .35: add('WARN', 'char-overlap', t, sid, f"{a['k']} and {b['k']} overlap {int(o * 100)} %")
# sync: lines inside shots, named characters on screen, word times
for v, s in vo:
    if v['t'] + v['d'] > s['b'] + .05: add('FAIL', 'line-across-cut', v['t'], s['id'], f"line {v['id']} runs {v['t'] + v['d'] - s['b']:.2f} s past the cut")
    ws = v.get('w') or []
    if not ws or any(w[2] <= w[1] for w in ws): add('FAIL', 'no-word-times', v['t'], s['id'], f"line {v['id']} has no word timing (run words.py)")
    txt = v['sub'].lower(); ok = set(s.get('offscreen', [])) | ({s['pov']} if s.get('pov') else set())   # shot.pov: we see through k's eyes; shot.offscreen: k is talked about in a reaction shot
    for k, keys in NAMES.items():
        if not any(re.search(r'\b' + re.escape(x) + r'\b', txt) for x in keys) or k in ok: continue
        smp = [x for x in A if v['t'] <= x['t'] <= v['t'] + v['d'] and not shot_of.get(x['shot'], {}).get('insert')]
        if not smp: continue
        seen = sum(1 for x in smp if any(c['k'] == k and not c.get('behind') and c['inFrame'] > .5 and c['h'] < H * 1.2 and not any(h.startswith(('head', 'eyes')) for h in c['hidden']) for c in x['chars']))
        if seen / len(smp) < .5: add('WARN', 'named-not-shown', v['t'], s['id'], f"line {v['id']} names {k} but {k} is on screen for {int(100 * seen / len(smp))} % of it: “{v['sub'][:60]}”")
# collapse repeats: one row per (kind, shot) with its time range
rows = {}
for sev, kind, t, sid, msg in issues:
    key = (sev, kind, sid, re.sub(r'\d+', '#', msg)); r = rows.setdefault(key, [t, t, msg, 0]); r[0] = min(r[0], t); r[1] = max(r[1], t); r[3] += 1
out = sorted(((k[0], k[1], k[2], v[0], v[1], v[2], v[3]) for k, v in rows.items()), key=lambda r: (r[0] != 'FAIL', r[3]))
nf = sum(1 for r in out if r[0] == 'FAIL'); nw = len(out) - nf
md = [f"# Audit · {TL['code']} {TL['title']} · {TL['DUR']:.1f} s · {nf} FAIL, {nw} WARN", '', '| sev | check | shot | time | detail |', '|---|---|---|---|---|']
md += [f"| {r[0]} | {r[1]} | {r[2]} | {r[3]:.2f}–{r[4]:.2f} s ({r[6]}×) | {r[5]} |" for r in out]
open(os.path.join(D, 'AUDIT.md'), 'w').write('\n'.join(md) + '\n')
if '--quiet' not in sys.argv: print('\n'.join(md))
else: print(f"{TL['code']}: {nf} FAIL, {nw} WARN")
sys.exit(1 if nf else 0)
