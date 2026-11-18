"""Repair finished videos whose outro fails the gate WITHOUT re-rendering the story part.
usage: repair_outro.py <what-if dir> <list.txt> <segments dir>
For each list item with a final file: gate it (validate_outro --video). If it fails and there is no segment, try swapping in the
current build/mix.flac only (picture kept) and re-gate. If it fails and <segments>/<project path with / -> __>.mp4 exists
(the outro frames rendered in the cloud from frame round(outro_start*fps) to the end), keep the old file's frames before that point,
append the segment, put the project's current build/mix.flac under it, re-gate. Pass -> replaces the final (old one kept in final/_rejected/).
Fail -> the final is moved to _rejected so the laptop .bat re-renders it. Prints one line per item."""
import sys, os, json, subprocess, shutil, datetime
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from validate_outro import check
W, L, SEG = sys.argv[1:4]; FPS = 24; stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M')
def reject(d, tag):
    r = os.path.join(os.path.dirname(d), '_rejected'); os.makedirs(r, exist_ok=True); dst = os.path.join(r, f'{stamp}-{tag}-{os.path.basename(d)}'); shutil.move(d, dst); return dst
for line in open(L):
    if not line.strip() or line.startswith('#'): continue
    p, d = [x.strip() for x in line.split('|')]; P = os.path.join(W, p); D = os.path.join(W, d)
    if not os.path.exists(D): print(f'NOT-RENDERED {p}'); continue
    bad, info = check(P, video=D)
    if not bad: print(f'PASS {p} {info}'); continue
    S = json.load(open(f'{P}/story/shots.json')); st = S['shots'][-1]['start']; n = round(st * FPS); seg = os.path.join(SEG, p.replace('/', '__') + '.mp4')
    if not os.path.exists(seg):   # picture fine, sound outdated? swap in the current mix (video stream copied, no re-encode)
        tmp = D + '.remux.mp4'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', D, '-i', f'{P}/build/mix.flac', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', tmp])
        bad2, info2 = check(P, video=tmp) if os.path.exists(tmp) else (['remux failed'], '')
        if not bad2: reject(D, 'oldaudio'); shutil.move(tmp, D); print(f'REMUXED {p} (picture kept, current mix){info2}'); continue
        if os.path.exists(tmp): reject(tmp, 'remuxfail')
        print(f'FAIL {p}: {"; ".join(bad2)} -> moved to _rejected (laptop re-renders)'); reject(D, 'old'); continue
    tmp = D + '.repair.mp4'
    r = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', D, '-i', seg, '-i', f'{P}/build/mix.flac', '-filter_complex',
                        f'[0:v]trim=end_frame={n},setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0,fps={FPS}[v]',
                        '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', tmp], capture_output=True, text=True)
    if r.returncode or not os.path.exists(tmp): print(f'SPLICE-ERROR {p}: {r.stderr[-300:]}'); continue
    bad2, info2 = check(P, video=tmp)
    if bad2: print(f'REPAIR-FAIL {p}: {"; ".join(bad2)} -> old moved to _rejected (laptop re-renders)'); reject(D, 'old'); reject(tmp, 'repairfail'); continue
    reject(D, 'old'); shutil.move(tmp, D); print(f'REPAIRED {p} (kept {n} story frames, new outro){info2}')
