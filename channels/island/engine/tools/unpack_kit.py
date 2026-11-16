#!/usr/bin/env python3
"""Unpack an Island kit into channels/island on the device (the device shell cannot delete or overwrite via unlink, so files are
written in place). FLAC audio in the kit becomes out/mix.wav (what render-week.ps1 / render-long.ps1 read). Needs ffmpeg.
Resumable: re-run until it prints DONE. Usage (from the repo root): python3 channels/island/engine/tools/unpack_kit.py _xfer/<kit>.tgz"""
import tarfile, os, sys, subprocess, time
kit = sys.argv[1]; R = 'channels/island'; t0 = time.time(); n = skip = 0
with tarfile.open(kit) as t:
    for m in t.getmembers():
        if not m.isfile(): continue
        if time.time() - t0 > 150: print('PARTIAL', n, 'written', skip, 'skipped: run again'); sys.exit(0)   # device shell calls die at 180 s
        p = m.name[2:] if m.name.startswith('./') else m.name
        dst = ('skills/island-week/' + p[11:]) if p.startswith('docs/skill/') else (R + '/' + (p[5:] if p.startswith('docs/') else p))
        if dst.endswith('.flac'):
            wav = dst[:-4] + 'wav'
            if os.path.exists(dst) and os.path.getsize(dst) == m.size and os.path.exists(wav) and os.path.getmtime(wav) >= os.path.getmtime(dst): skip += 1; continue
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, 'wb') as f: f.write(t.extractfile(m).read())
        if dst.endswith('.flac'): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', dst, '-c:a', 'pcm_s16le', dst[:-4] + 'wav'], check=True)   # ffmpeg truncates in place (no unlink)
        n += 1
print('DONE', n, 'written', skip, 'skipped')
