"""Append the APPROVED sign-off/subscribe ending (spec: ../outro/spec.json). Idempotent: replaces an existing sOUT.
usage: add_outro.py <project_dir>
- 9:16 Shorts: 'iris' at its full approved length. 16:9 long-forms: 'silent'/'button'/'ident' rotated by date, 10 s (YouTube end screen).
- NEVER shortens or edits the outro. If a Short would pass the 59.8 s cap, it exits 2 with how much story to cut: fix the cut, not the outro."""
import sys, os, json, re, datetime
HERE = os.path.dirname(os.path.abspath(__file__)); SP = json.load(open(os.path.join(HERE, '../outro/spec.json')))
def pick(P, cfg):
    a = cfg.get('aspect', '16:9')
    if a == '9:16': return SP['rules']['9:16'], a
    m = re.search(r'(\d{4}-\d{2}-\d{2})', os.path.abspath(P)); day = datetime.date.fromisoformat(m.group(1)) if m else datetime.date.today()
    return SP['rules']['16:9'][day.toordinal() % 3], a
def main(P):
    P = P.rstrip('/'); cfg = json.load(open(f'{P}/config.json')); v, asp = pick(P, cfg); var = SP['variants'][v]; secs = var['secs'][asp]
    S = json.load(open(f'{P}/story/shots.json'))
    old = [s for s in S['shots'] if s['id'] == 'sOUT']
    if old: S['shots'] = [s for s in S['shots'] if s['id'] != 'sOUT']; S['duration'] = old[0]['start']
    st = round(float(S['duration']), 3); en = round(st + secs, 3)
    if asp == '9:16' and en > SP['short_max_total']:
        print(f'OUTRO-FAIL {P}: story ends at {st:.2f}s + approved outro {secs}s = {en:.2f}s > {SP["short_max_total"]}s. Cut {en - SP["short_max_total"]:.2f}s of story.'); sys.exit(2)
    S['shots'].append(dict(id='sOUT', start=st, end=en, line='', scene='outro', bars='none', **{'in': dict(var['in'])},
                           sfx=[{'at': a, 'name': n, 'gain': g} for n, a, g in var['sfx']], captions=False, params=dict(var['params'])))
    S['duration'] = en
    for mm in S.get('music', []):
        if mm['end'] >= st - .01: mm['end'] = en
    json.dump(S, open(f'{P}/story/shots.json', 'w'), indent=1); cfg['duration'] = en; json.dump(cfg, open(f'{P}/config.json', 'w'), indent=1)
    print(f'outro {v} {secs}s -> {P} (now {en:.2f}s)')
if __name__ == '__main__': main(sys.argv[1])
