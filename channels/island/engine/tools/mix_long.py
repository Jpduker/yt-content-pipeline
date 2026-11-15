#!/usr/bin/env python3
"""Mix a long-form timeline in ~80 s chunks (cut at shot boundaries) to keep memory low, then join. Usage (lemo root, .venv): mix_long.py <dir>"""
import json, os, sys, subprocess, shutil
D = os.path.abspath(sys.argv[1]); TL = json.load(open(os.path.join(D, 'timeline.json'))); HERE = os.path.dirname(os.path.abspath(__file__))
chunks, cur = [], []
for s in TL['shots']:
    cur.append(s)
    if s['b'] - cur[0]['a'] > 80: chunks.append(cur); cur = []
if cur: chunks.append(cur)
parts = []
for i, ch in enumerate(chunks):
    W = os.path.join(D, 'out', f'_mix{i:02d}'); os.makedirs(os.path.join(W, 'out'), exist_ok=True)
    if not os.path.exists(os.path.join(W, 'voices')): os.symlink(os.path.join(D, 'voices'), os.path.join(W, 'voices'))
    shutil.copy(os.path.join(D, 'lines.json'), W)
    a0 = ch[0]['a']; sub = json.loads(json.dumps(ch))
    for s in sub:
        s['a'] = round(s['a'] - a0, 3); s['b'] = round(s['b'] - a0, 3)
        for v in s['vo']: v['t'] = round(v['t'] - a0, 3)
    t = dict(TL); t.update({ 'shots': sub, 'DUR': round(ch[-1]['b'] - a0, 3), 'askAt': None, 'code': f"{TL['code']}-{i}" })
    json.dump(t, open(os.path.join(W, 'timeline.json'), 'w'))
    env = dict(os.environ); 
    if i: env['NODING'] = '1'
    subprocess.run([sys.executable, os.path.join(HERE, 'mix.py'), W], check=True, env=env)
    parts.append(os.path.join(W, 'out', 'mix.wav'))
lst = os.path.join(D, 'out', '_mixlist.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:a', 'pcm_s16le', os.path.join(D, 'out', 'mix.wav')], check=True)
print('joined', len(parts), 'chunks →', os.path.join(D, 'out', 'mix.wav'))
