"""WI02 subtitles: one cue per phrase (<= ~42 chars), from the exact Kokoro word timings; thoughts in italics with quotes."""
import json, sys, re
EP = sys.argv[1] if len(sys.argv) > 1 else '.'
L = json.load(open(f'{EP}/project/timeline/lines.json')); W = json.load(open(f'{EP}/project/timeline/words_all.json'))
def ts(t): h, r = divmod(t, 3600); m, s = divmod(r, 60); return f"{int(h):02}:{int(m):02}:{int(s):02},{int(round((s % 1) * 1000)) % 1000:03}"
cues = []
for l in L:
    ws = [w for w in W if w['line'] == l['id']]; cur = []
    for i, w in enumerate(ws):
        cur.append(w); txt = ' '.join(x['w'] for x in cur)
        if i == len(ws) - 1 or re.search(r'[.?!…]$', w['w']) or len(txt) > 34:
            t = txt.replace('—', '').strip()
            if l['thought']: t = f'<i>“{t}”</i>'
            cues.append([cur[0]['t0'], cur[-1]['t1'] + .25, t]); cur = []
for i in range(len(cues) - 1): cues[i][1] = min(cues[i][1], cues[i + 1][0] - .02)
open(f'{EP}/final/what-if-you-heard-every-thought.en.srt', 'w').write('\n'.join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{t}\n" for i, (a, b, t) in enumerate(cues)))
print(len(cues), 'cues')
