"""Outro quality gate (spec: ../outro/spec.json, goldens: ../outro/golden/<aspect>_<variant>.png).
usage:
  validate_outro.py <project> [--mix] [--render KITDIR] [--video FINAL.mp4]     -> prints 'GATE-OK ...' or 'GATE-FAIL ...: reasons', exit 0/1
  validate_outro.py --manifest <what-if dir> <list.txt> <out.json>               -> expected values for the laptop gate (render-week.ps1)
Checks: timeline (last shot = sOUT, right variant for aspect/date, exact approved params, approved length, ends at config duration, Shorts <= cap)
        --mix   build/mix.flac length == timeline, outro audio not silent
        --render  draw the proof frame in the cloud and compare with the golden (SSIM)
        --video   final file: video+audio length == timeline, proof frame from the ENCODED file matches the golden (SSIM)"""
import sys, os, json, re, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); SP = json.load(open(os.path.join(HERE, '../outro/spec.json'))); GOLD = os.path.join(HERE, '../outro/golden')
sys.path.insert(0, HERE); from add_outro import pick
G = SP['gate']
def run(a): return subprocess.run(a, capture_output=True, text=True)
def probe(f, sel):
    """duration of the first video ('v:0') or audio ('a:0') stream, read from ffprobe JSON (line-order independent); falls back to frames/rate, then the container."""
    kind = 'video' if sel.startswith('v') else 'audio'
    try: j = json.loads(run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,duration,nb_frames,r_frame_rate:format=duration', '-of', 'json', f]).stdout)
    except ValueError: return -1.0
    for st in j.get('streams', []):
        if st.get('codec_type') != kind: continue
        try: return float(st['duration'])
        except (KeyError, ValueError): pass
        try: n, d = st['r_frame_rate'].split('/'); return int(st['nb_frames']) * int(d) / int(n)
        except (KeyError, ValueError, ZeroDivisionError): pass
        try: return float(j['format']['duration'])
        except (KeyError, ValueError): return -1.0
    return -1.0
def audio_match(video, mix, t0=0.0, dur=None):
    """(signal dB, difference dB) of the video's audio vs the mix over [t0, t0+dur]. Same mix -> difference ~25 dB below the signal."""
    tr = f'atrim={t0}' + (f':{t0 + dur}' if dur else '') + ',asetpts=PTS-STARTPTS'
    def mv(args): m = re.search(r'mean_volume: ([-0-9.]+) dB', run(args).stderr); return float(m.group(1)) if m else -99.0
    sig = mv(['ffmpeg', '-nostdin', '-i', video, '-af', tr + ',volumedetect', '-vn', '-f', 'null', '-'])
    dif = mv(['ffmpeg', '-nostdin', '-i', video, '-i', mix, '-filter_complex', f'[0:a]{tr},aformat=sample_rates=48000:channel_layouts=stereo[a];[1:a]{tr},aformat=sample_rates=48000:channel_layouts=stereo,volume=-1[b];[a][b]amix=inputs=2:normalize=0,volumedetect', '-vn', '-f', 'null', '-'])
    return sig, dif
def fdur(f):
    try: return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.strip())
    except ValueError: return -1.0
def match(a, b):
    """(ssim, psnr) of frame a vs golden b, both scaled to 640 wide grey."""
    def one(f, pat):
        r = run(['ffmpeg', '-nostdin', '-v', 'info', '-i', a, '-i', b, '-lavfi', f'[0:v]scale=640:-2,format=gray[x];[1:v]scale=640:-2,format=gray[y];[x][y]{f}', '-f', 'null', '-'])
        m = re.search(pat, r.stderr); return (99.0 if m.group(1) == 'inf' else float(m.group(1))) if m else 0.0
    return one('ssim', r'All:([0-9.]+)'), one('psnr', r'average:([0-9.]+|inf)')
def roi_ssim(a, b, r):
    x, y, w, h = r; c = f'crop=iw*{w}:ih*{h}:iw*{x}:ih*{y},format=gray'
    o = run(['ffmpeg', '-nostdin', '-i', a, '-i', b, '-lavfi', f'[0:v]{c}[x];[1:v]{c}[y];[x][y]ssim', '-f', 'null', '-']).stderr
    m = re.search(r'All:([0-9.]+)', o); return float(m.group(1)) if m else 0.0
def judge(fr, gold, label, bad, roi=None):
    extra = ''
    if roi:
        rs = roi_ssim(fr, gold, roi); extra = f' roi_ssim={rs:.3f}'
        if rs < G['roi_ssim_min']: bad.append(f'{label} outro detail area does not match the approved golden (roi ssim {rs:.3f} < {G["roi_ssim_min"]})')
    s, p = match(fr, gold)
    if s < G['ssim_min'] or p < G['psnr_min']: bad.append(f'{label} outro does not match the approved golden (ssim {s:.3f}, psnr {p:.1f} dB; need >= {G["ssim_min"]} and >= {G["psnr_min"]} dB)')
    return f' {label}: ssim={s:.3f} psnr={p:.1f}{extra}' 
def expected(P):
    cfg = json.load(open(f'{P}/config.json')); v, asp = pick(P, cfg); var = SP['variants'][v]
    S = json.load(open(f'{P}/story/shots.json')); o = S['shots'][-1] if S['shots'] else {}
    return cfg, S, o, v, asp, var
def check(P, mix=False, kit=None, video=None):
    P = P.rstrip('/'); bad = []; cfg, S, o, v, asp, var = expected(P); secs = var['secs'][asp]; ak = asp.replace(':', 'x')
    if o.get('id') != 'sOUT': bad.append('last shot is not the outro (sOUT)')
    else:
        if o['params'] != var['params']: bad.append(f'outro params {o["params"]} != approved {var["params"]}')
        if abs((o['end'] - o['start']) - secs) > .01: bad.append(f'outro {o["end"] - o["start"]:.2f}s != approved {secs}s')
        if abs(o['end'] - S['duration']) > .01 or abs(S['duration'] - cfg.get('duration', -1)) > .01: bad.append('outro does not end the video (timeline/config duration mismatch)')
        if o.get('in') != var['in']: bad.append(f'outro transition {o.get("in")} != {var["in"]}')
        want_sfx = [{'at': a, 'name': n, 'gain': g} for n, a, g in var['sfx']]
        if o.get('sfx') != want_sfx: bad.append(f'outro sound effects {o.get("sfx")} != approved {want_sfx}')
    if asp == '9:16' and S['duration'] > SP['short_max_total'] + .001: bad.append(f'Short is {S["duration"]:.2f}s > {SP["short_max_total"]}s')
    if any(m['end'] < S['duration'] - .01 for m in S.get('music', []) if m['end'] >= o.get('start', 0) - .01) or not any(m['end'] >= S['duration'] - .01 for m in S.get('music', [])): bad.append('music does not run to the end')
    ost = o.get('start', 0); tproof = ost + var['proof_t']; gold = os.path.join(GOLD, f'{ak}_{v}.png'); info = f'{v} {secs}s @{ost:.2f}s'
    if mix and not bad:
        f = f'{P}/build/mix.flac'
        if not os.path.exists(f): bad.append('no build/mix.flac')
        else:
            d = fdur(f)
            if abs(d - S['duration']) > G['dur_tol']: bad.append(f'mix {d:.2f}s != {S["duration"]:.2f}s')
            r = run(['ffmpeg', '-nostdin', '-ss', str(ost + .3), '-t', str(secs - .6), '-i', f, '-af', 'volumedetect', '-f', 'null', '-']).stderr
            m = re.search(r'mean_volume: ([-0-9.]+) dB', r); db = float(m.group(1)) if m else -99
            if db < G['outro_audio_min_db']: bad.append(f'outro audio silent ({db} dB)')
    with tempfile.TemporaryDirectory() as td:
        if kit and not bad:
            run(['node', os.path.join(kit, 'render.mjs'), '--project', P, '--stills', f'{tproof:.3f}', '--scale', '1'])   # render.mjs clears build/stills first
            got = [x for x in os.listdir(f'{P}/build/stills') if x.endswith('.png') and not x.startswith('sheet')] if os.path.isdir(f'{P}/build/stills') else []
            fr = os.path.join(f'{P}/build/stills', got[0]) if len(got) == 1 else None
            if not fr: bad.append('proof frame did not render')
            else:
                info += judge(fr, gold, 'render', bad, var.get('roi', {}).get(asp))
                os.makedirs(f'{P}/check', exist_ok=True); subprocess.run(['cp', fr, f'{P}/check/outro_proof.png'])
        if video and not bad:
            if not os.path.exists(video): bad.append('final video missing')
            else:
                vd, ad = probe(video, 'v:0'), probe(video, 'a:0')
                if abs(vd - S['duration']) > G['dur_tol']: bad.append(f'video {vd:.2f}s != {S["duration"]:.2f}s')
                if abs(ad - S['duration']) > G['dur_tol']: bad.append(f'audio {ad:.2f}s != {S["duration"]:.2f}s')
                mix = f'{P}/build/mix.flac'
                if os.path.exists(mix) and ad > 0:
                    for lab, t0, du in (('whole', 0.0, None), ('outro', ost, secs)):
                        sg, df = audio_match(video, mix, t0, du)
                        if sg - df < G['audio_match_db']: bad.append(f'{lab} audio is not the current mix (difference only {sg - df:.1f} dB below the signal, need {G["audio_match_db"]})')
                    info += ' audio=mix' 
                fr = os.path.join(td, 'f.png'); run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{tproof:.3f}', '-i', video, '-frames:v', '1', fr])
                if not os.path.exists(fr): bad.append('no frame at the outro proof time (video too short)')
                else:
                    info += judge(fr, gold, 'final', bad, var.get('roi', {}).get(asp))
    return bad, info
def manifest(W, L, out):
    M = {'spec': SP['gate'], 'items': []}
    for line in open(L):
        if not line.strip() or line.startswith('#'): continue
        p, d = [x.strip() for x in line.split('|')]; P = os.path.join(W, p); cfg, S, o, v, asp, var = expected(P)
        M['items'].append(dict(project=p, dest=d, duration=S['duration'], outro_start=o.get('start'), variant=v, proof_t=round(o.get('start', 0) + var['proof_t'], 3),
                               golden=f'golden/{asp.replace(":", "x")}_{v}.png', roi=var.get('roi', {}).get(asp)))
    json.dump(M, open(out, 'w'), indent=1); print(f'manifest {len(M["items"])} items -> {out}')
if __name__ == '__main__':
    a = sys.argv[1:]
    if a[0] == '--manifest': manifest(*a[1:4]); sys.exit(0)
    P = a[0]; kit = a[a.index('--render') + 1] if '--render' in a else None; vid = a[a.index('--video') + 1] if '--video' in a else None
    bad, info = check(P, '--mix' in a, kit, vid)
    print(('GATE-OK ' if not bad else 'GATE-FAIL ') + P + ' ' + info + ('' if not bad else ': ' + '; '.join(bad))); sys.exit(1 if bad else 0)
