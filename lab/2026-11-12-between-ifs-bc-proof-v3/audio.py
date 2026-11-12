"""Local narration + original procedural music/foley, all sharing film cue times."""
from pathlib import Path
import os,json,sys
import numpy as np
import soundfile as sf
from scipy.signal import butter,sosfilt

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
LIB=ROOT/'tools/lemo-opuscar'
OUT=HERE/'audio';OUT.mkdir(exist_ok=True)
SR=24000;DUR=26

LINES=[
 ('01',.65,"What if you could stop time, but only while you held your breath?",1.03),
 ('02',6.65,"At first, it feels like a gift.",.99),
 ('03',14.0,"Until you notice...",.94),
 ('04',18.7,"someone else is still moving.",.92),
]
if '--mix-only' not in sys.argv:
 from kokoro_onnx import Kokoro
 import onnxruntime as ort
 opts=ort.SessionOptions();opts.intra_op_num_threads=2;opts.inter_op_num_threads=1
 sess=ort.InferenceSession(str(LIB/'core/tts/kokoro-v1.0.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
 k=Kokoro.from_session(sess,str(LIB/'core/tts/voices-v1.0.bin'))
 for ident,start,text,speed in LINES:
  target=OUT/f'{ident}.wav'
  if target.exists():continue
  a,sr=k.create(text,voice='am_fenrir',speed=speed,lang='en-us')
  nz=np.flatnonzero(np.abs(a)>.008)
  if len(nz):a=a[max(0,nz[0]-500):min(len(a),nz[-1]+1500)]
  sf.write(target,a,sr)
  print(ident,len(a)/sr,text,flush=True)

rng=np.random.default_rng(41)
voice=np.zeros(SR*DUR,dtype=np.float64);cues=[]
for ident,start,text,speed in LINES:
 a,sr=sf.read(OUT/f'{ident}.wav');assert sr==SR
 end=start+len(a)/SR
 next_start=next((x[1] for x in LINES if x[1]>start),DUR)
 assert end<next_start-.12,(ident,end,next_start)
 i=int(start*SR);voice[i:i+len(a)]+=a
 cues.append({'id':ident,'start':start,'end':round(end,3),'text':text})
json.dump(cues,open(OUT/'cues.json','w'),indent=2)

def write_srt():
 def stamp(t):
  n=round(t*1000);return f'{n//3600000:02}:{n//60000%60:02}:{n//1000%60:02},{n%1000:03}'
 blocks=[]
 for i,c in enumerate(cues,1):blocks.append(f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}\n')
 (HERE/'between-the-ifs-test.srt').write_text('\n'.join(blocks))
write_srt()

# All music here is original synthesis, not a franchise soundtrack or demo score.
n=SR*DUR;t=np.arange(n)/SR;music=np.zeros(n);sfx=np.zeros(n)
def add(dst,a,at,gain=1):
 i=int(at*SR);m=min(len(a),len(dst)-i)
 if m>0:dst[i:i+m]+=a[:m]*gain
def note(f,d,soft=False):
 q=np.arange(int(d*SR))/SR
 a=(np.sin(2*np.pi*f*q)+.28*np.sin(2*np.pi*f*2.003*q)+.11*np.sin(2*np.pi*f*3.998*q))
 env=(1-np.exp(-q/(.3 if soft else .009)))*np.exp(-q/(d*.45))
 return a*env
for at,notes in [(0,[146.83,220,293.66]),(5.5,[130.81,196,293.66]),(10.5,[123.47,185,277.18]),(14,[110,164.81,246.94]),(18.6,[103.83,155.56,233.08]),(23.8,[146.83,220,293.66])]:
 for f in notes:add(music,note(f,6,True),at,.032)
for i,at in enumerate(np.arange(.4,10.1,.75)):
 add(music,note([587.33,440,659.25,493.88,440,587.33][i%6],1.8),at,.045)
for i,at in enumerate([11.1,12.6,14.3,16.2,18.6,21,23.8]):
 add(music,note([880,739.99,659.25,587.33,622.25,466.16,587.33][i],3),at,.025)

# Rain/room tone, filtered noise. Rain fades out at the actual freeze event.
noise=rng.normal(size=n)
rain=sosfilt(butter(2,[1800,7000],fs=SR,btype='bandpass',output='sos'),noise)
rain_env=np.where(t<10.5,1,.06)
amb=rain*.018*rain_env
amb+=sosfilt(butter(2,450,fs=SR,output='sos'),rng.normal(size=n))*.008
for at in np.arange(.1,10.5,.5):
 q=np.arange(int(.055*SR))/SR;click=np.sin(2*np.pi*1750*q)*np.exp(-q*120)
 add(sfx,click,at,.025)
for at in [.8,1.5,2.2]:
 q=np.arange(int(.15*SR))/SR;step=sosfilt(butter(2,500,fs=SR,output='sos'),rng.normal(size=len(q)))*np.exp(-q*30)
 add(sfx,step,at,.14)
q=np.arange(int(.9*SR))/SR
add(sfx,(np.sin(2*np.pi*(1200*q-450*q*q))+.3*rng.normal(size=len(q)))*np.sin(np.pi*q/.9)**2,9.8,.08)
for freq in [880,1320,1760]:add(sfx,note(freq,3),10.5,.055)
# low portal air and a deliberately audible isolated footstep after the freeze
q=np.arange(int(2.5*SR))/SR
add(sfx,sosfilt(butter(2,900,fs=SR,output='sos'),rng.normal(size=len(q)))*np.sin(np.pi*q/2.5)**2,18.5,.06)
q=np.arange(int(.45*SR))/SR
add(sfx,(np.sin(2*np.pi*78*q)+sosfilt(butter(2,800,fs=SR,output='sos'),rng.normal(size=len(q))))*np.exp(-q*12),21.4,.10)

# Voice gain normalized, then background ducked during actual spoken regions.
peak=np.max(np.abs(voice));voice=voice/max(peak,1e-6)*.64
duck=np.ones(n)
for c in cues:
 a=max(0,int((c['start']-.12)*SR));b=min(n,int((c['end']+.2)*SR));duck[a:b]=.48
duck=sosfilt(butter(1,5,fs=SR,output='sos'),duck)
bed=music*duck+amb+sfx
fade=np.minimum(1,t/.35)*np.minimum(1,(DUR-t)/1.0)
mono=(voice+bed)*fade
# subtle stereo space; narration remains centered
delay=np.r_[np.zeros(720),bed[:-720]]
stereo=np.stack([mono+bed*.10,mono+delay*.10],axis=1)
sf.write(OUT/'voiceover.wav',voice,SR)
sf.write(OUT/'music-and-effects.wav',np.stack([bed,bed],axis=1),SR)
sf.write(OUT/'mix.wav',stereo,SR,subtype='PCM_24')
print('Mix ready:',DUR,'seconds; peak',float(np.max(np.abs(stereo))),flush=True)
