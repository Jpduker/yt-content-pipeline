"""Model-free audio QA for an AA episode.  python3 tools/audio-qa.py <episode_dir> [--hush-before 06]
Reads audio/timeline.json, audio/voiceover.wav, audio/music-and-effects.wav, audio/mix.wav.
PASS rules (from AA01): every line voice-over-bed >= 9 dB; hush window (1 s before the named line)
>= 12 dB under the mix average; no samples >= 0.999.  Exit 1 on any FAIL."""
import json,sys,numpy as np,soundfile as sf
from pathlib import Path
ep=Path(sys.argv[1]);A=ep/'audio'
TL=json.load(open(A/'timeline.json'));SR=24000
v,_=sf.read(A/'voiceover.wav');b,_=sf.read(A/'music-and-effects.wav');m,_=sf.read(A/'mix.wav')
if b.ndim>1:b=b.mean(1)
mm=m.mean(1) if m.ndim>1 else m
rms=lambda x:20*np.log10(np.sqrt(np.mean(x**2))+1e-9)
ok=True
print('line speaker  V/B dB')
for c in TL['cues']:
 i0,i1=int(c['start']*SR),int(c['end']*SR);r=rms(v[i0:i1])-rms(b[i0:i1])
 flag='' if r>=9 else '  <-- FAIL (masked: lower SFX/music under this line)'
 ok&=r>=9;print(f"{c['id']:>4} {c['speaker']:<7}{r:7.1f}{flag}")
if '--hush-before' in sys.argv:
 hid=sys.argv[sys.argv.index('--hush-before')+1];c=next(x for x in TL['cues'] if x['id']==hid)
 h=rms(mm[int((c['start']-1)*SR):int((c['start']-.05)*SR)]);avg=rms(mm);d=avg-h
 print(f'hush before {hid}: {d:.1f} dB under average',''if d>=12 else '<-- FAIL');ok&=d>=12
cl=int(np.sum(np.abs(m)>=.999));print('clipped samples:',cl);ok&=cl==0
print('PASS' if ok else 'FAIL');sys.exit(0 if ok else 1)
