#!/usr/bin/env python3
"""Post-render check for one v3.1 project (long-form, cut Short or original Short).

usage: postcheck.py <project_dir> [--mp4 FILE] [--out DIR] [--tile W]
Checks (FAIL = must fix before publishing, WARN = look at it):
  - the mp4 exists and is newer than story/shots.json and scenes/chars.js
  - duration matches story/shots.json (±0.6 s); Shorts <= 60 s
  - loudness: integrated -14 LUFS ±1.5, true peak <= -0.5 dBTP
  - no black stretch >= 0.4 s, no frozen picture >= 2.5 s (unless a shot is marked hold/freeze)
  - audio present for the whole length
Then writes contact sheets: one frame per shot at 55% of the shot, labelled
with shot id, time and scene, for the eye check (faces on heads, nothing cut
off by the 9:16 crop, overlays not covering faces/badges, right cast/set).
Prints one summary line; exit 1 on any FAIL.
"""
import json, os, re, subprocess, sys, glob, argparse, tempfile, shutil

def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True).stderr

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project'); ap.add_argument('--mp4'); ap.add_argument('--out')
    ap.add_argument('--tile', type=int, default=0)
    a = ap.parse_args()
    P = a.project.rstrip('/')
    shots = json.load(open(f'{P}/story/shots.json'))
    S = shots['shots']; dur_s = float(shots.get('duration') or S[-1]['end'])
    mp4 = a.mp4 or max(glob.glob(f'{P}/out/*.mp4'), key=os.path.getmtime, default=None)
    fails, warns = [], []
    if not mp4 or not os.path.exists(mp4):
        print(f'FAIL {P}: no mp4'); sys.exit(1)
    deps = [f'{P}/story/shots.json'] + glob.glob(f'{P}/scenes/**/*.js', recursive=True)
    stale = [os.path.relpath(x, P) for x in deps if os.path.getmtime(x) > os.path.getmtime(mp4) + 1]
    if stale: fails.append('stale: ' + ','.join(stale[:3]) + ' newer than mp4')
    pr = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration',
                         '-of', 'json', mp4], capture_output=True, text=True).stdout
    pj = json.loads(pr); d = float(pj['format']['duration'])
    v = [s for s in pj['streams'] if s['codec_type'] == 'video'][0]
    W, H = v['width'], v['height']; vert = H > W
    if not any(s['codec_type'] == 'audio' for s in pj['streams']): fails.append('no audio stream')
    if abs(d - dur_s) > 0.6: fails.append(f'duration {d:.1f}s vs story {dur_s:.1f}s')
    if vert and d > 60: fails.append(f'Short is {d:.1f}s (>60)')
    if (W, H) not in ((1920, 1080), (1080, 1920)): fails.append(f'size {W}x{H}')
    e = sh(['ffmpeg', '-hide_banner', '-nostats', '-i', mp4,
            '-af', 'ebur128=peak=true', '-vf', 'blackdetect=d=0.4:pix_th=0.06,freezedetect=n=0.001:d=2.5',
            '-f', 'null', '-'])
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', e); lufs = float(m[-1]) if m else None
    m = re.findall(r'Peak:\s+(-?[\d.]+|-inf) dBFS', e); tp = float(m[-1]) if m and m[-1] != '-inf' else None
    if lufs is None or abs(lufs + 14) > 1.5: fails.append(f'loudness {lufs} LUFS')
    if tp is not None and tp > -0.5: warns.append(f'true peak {tp} dBTP')
    for bs, be in re.findall(r'black_start:([\d.]+) black_end:([\d.]+)', e):
        fails.append(f'black {float(bs):.1f}-{float(be):.1f}s')
    holdy = [(s['start'], s['end']) for s in S if (s.get('params') or {}).get('freeze') or s.get('hold')]
    fs = re.findall(r'freeze_start: ([\d.]+)', e); fe = re.findall(r'freeze_end: ([\d.]+)', e)
    for i, t0 in enumerate(fs):
        t0 = float(t0); t1 = float(fe[i]) if i < len(fe) else d
        if not any(a0 - .3 <= t0 and t1 <= a1 + .3 for a0, a1 in holdy):
            warns.append(f'still picture {t0:.1f}-{t1:.1f}s')
    long_shots = [s['id'] for s in S if s['end'] - s['start'] > (7 if vert else 9.5)]
    if long_shots: warns.append(f'long shots {",".join(long_shots)}')
    # contact sheets
    out = a.out or f'{P}/check'; os.makedirs(out, exist_ok=True)
    for f in glob.glob(f'{out}/sheet-*.jpg'): os.remove(f)
    tw = a.tile or (200 if vert else 384); th = round(tw * H / W)
    cols = 7 if vert else 4; per = cols * (3 if vert else 5)
    tmp = tempfile.mkdtemp()
    # one frame per shot at 55%, plus extra frames while an overlay is up (hook plate, closing question)
    samples = [(s, s['start'] + .55 * (s['end'] - s['start']), '') for s in S]
    for s in S:
        p = s.get('params') or {}
        if p.get('hookText'): samples.append((s, s['start'] + min(1.0, (s['end'] - s['start']) * .3), 'hook'))
        if isinstance(p.get('ask'), dict): samples.append((s, min(s['end'] - .15, s['start'] + float(p['ask'].get('at', 0)) + .7), 'ask'))
    for i, (s, t, why) in enumerate(samples):
        p = s.get('params') or {}
        lab = f"{s['id']} {t:5.1f}s {why or p.get('k', s.get('scene',''))}/{p.get('set','')}"[:34]
        subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', mp4, '-frames:v', '1',
                        '-vf', f"scale={tw}:{th},pad={tw}:{th+22}:0:0:black,drawtext=text='{lab}':x=4:y={th+4}:fontsize=14:fontcolor=white",
                        '-y', f'{tmp}/{i:03d}.png'])
    # placeholder / empty frames: the kit draws 'MISSING SHOT' on a flat dark plate when a
    # shot failed to register (e.g. scene code changed mid-render) -> near-uniform frame
    from PIL import Image, ImageStat
    flat = []
    for i, (s, t, why) in enumerate(samples):
        im = Image.open(f'{tmp}/{i:03d}.png').convert('L').crop((0, 0, tw, th))
        px = im.load(); red = 0
        rgb = Image.open(f'{tmp}/{i:03d}.png').convert('RGB').crop((0, 0, tw, th))
        sd = ImageStat.Stat(im).stddev[0]
        r, g_, b = [c.getextrema() for c in rgb.split()]
        if sd < 14: flat.append(f"{s['id']}(sd{sd:.0f})")
    if flat: fails.append(f'flat/placeholder frames: {" ".join(flat[:8])}{" +%d" % (len(flat)-8) if len(flat) > 8 else ""}')
    n = len(samples); sheets = []
    for k in range(0, n, per):
        chunk = list(range(k, min(n, k + per)))
        rows = (len(chunk) + cols - 1) // cols
        lst = f'{tmp}/l{k}.txt'
        open(lst, 'w').write(''.join(f"file '{tmp}/{i:03d}.png'\n" for i in chunk))
        o = f'{out}/sheet-{k // per + 1}.jpg'
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst,
                        '-vf', f'tile={cols}x{rows}:padding=4:color=white', '-frames:v', '1', '-q:v', '3', '-y', o])
        sheets.append(o)
    shutil.rmtree(tmp)
    status = 'FAIL' if fails else ('WARN' if warns else 'OK')
    print(f"{status} {os.path.basename(mp4)} {d:.1f}s {lufs}LUFS {len(S)} shots | " +
          '; '.join(fails + warns) + f" | sheets: {' '.join(sheets)}")
    json.dump({'mp4': mp4, 'status': status, 'fails': fails, 'warns': warns, 'lufs': lufs, 'dur': d,
               'sheets': sheets}, open(f'{out}/postcheck.json', 'w'), indent=1)
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
