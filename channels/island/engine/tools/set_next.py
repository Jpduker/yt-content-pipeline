"""Write short.json['next'] = {part, title, when} for every Short, in publish order. Usage: set_next.py <shorts_dir> [<shorts_dir> ...]
Slot 1 -> the next part is TONIGHT, slot 2 -> TOMORROW. The last Short of the last week points to the next chapter."""
import json, glob, os, sys
dirs = sorted(d for root in sys.argv[1:] for d in glob.glob(os.path.join(root, '*/')) if os.path.exists(os.path.join(d, 'short.json')) and json.load(open(os.path.join(d, 'short.json'))).get('ask'))
SS = [(d, json.load(open(os.path.join(d, 'short.json')))) for d in dirs]
SS.sort(key=lambda x: (x[1].get('day', ''), int(x[1]['code'][1:])))
for i, (d, s) in enumerate(SS):
    if i + 1 < len(SS): n = SS[i + 1][1]; nxt = { 'part': int(n['code'][1:]), 'title': n['title'], 'when': 'TONIGHT' if s.get('slot') == 1 else ('TONIGHT' if s.get('slot') == 0 else 'TOMORROW') }
    else: nxt = { 'part': int(s['code'][1:]) + 1, 'title': 'A new chapter begins', 'when': 'MONDAY' }
    s['next'] = nxt; json.dump(s, open(os.path.join(d, 'short.json'), 'w'), indent=1, ensure_ascii=False); print(s['code'], '->', nxt)
