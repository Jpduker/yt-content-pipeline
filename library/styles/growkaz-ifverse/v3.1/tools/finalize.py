"""Copy rendered outputs into each episode's final/ folder with publish names; subtitles for long-forms.
Usage: python3 finalize.py <what-if dir>   (idempotent; only copies outputs newer than the final file)"""
import sys, os, glob, shutil, re, subprocess, json
W = sys.argv[1]; T = os.path.dirname(os.path.abspath(__file__)); done = []
def cp(src, dst):
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src): return
    os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy2(src, dst); done.append(dst)
for ep in sorted(glob.glob(f'{W}/2026-11-*-wi*')):
    code = re.search(r'-(wi\d+)-', ep).group(1)
    for mp in glob.glob(f'{ep}/project/out/*.mp4'):
        title = json.load(open(f'{ep}/project/config.json'))['title']; slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        cp(mp, f'{ep}/final/{slug}-1080p.mp4')
        if not os.path.exists(f'{ep}/final/{slug}.en.srt'): subprocess.run(['python3', f'{T}/make_srt.py', ep, slug], capture_output=True)
    for n in (1, 2):
        for mp in glob.glob(f'{ep}/short-{n}/out/*.mp4'): cp(mp, f'{ep}/final/{code}-short-{n}-9x16.mp4')
for d in sorted(glob.glob(f'{W}/shorts/2026-11-*')):
    for mp in glob.glob(f'{d}/project/out/*.mp4'): cp(mp, f"{d}/final/{os.path.basename(d)[11:]}-9x16.mp4")
print('\n'.join(done) or 'nothing new')
