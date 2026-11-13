"""AA01 voices: Kokoro local TTS, 3 voices, Doom post-processed.
Outputs audio/<id>.wav, audio/timeline.json (line starts from real durations),
audio/cues.json (word-level estimated karaoke times), final/*.srt."""
from pathlib import Path
import json,sys
import numpy as np,soundfile as sf
from scipy.signal import butter,sosfilt,resample

HERE=Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'pipeline').is_dir())
LIB=ROOT/'tools/lemo-opuscar'
OUT=HERE/'audio';OUT.mkdir(exist_ok=True)
SR=24000

LINES=[ # id, speaker, gap-before(s), text, voice, speed
 ('01','nar',0.90,"They called Doom a monster. Then the sky split open.",'am_fenrir',1.0),
 ('02','nar',1.10,"And the only one holding your universe together... was him.",'am_fenrir',.99),
 ('03','you',1.00,"Why aren't you saving everyone?",'am_puck',.98),
 ('04','doom',0.90,"I am.",'am_onyx',.90),
 ('05','nar',1.20,"The price was one life. Erased from every timeline. Nobody volunteered.",'am_fenrir',.97),
 ('06','you',1.00,"Take mine.",'am_puck',.94),
 ('07','nar',1.60,"The sky healed. Your friends walked past you. Your own mother looked straight through you.",'am_fenrir',.97),
 ('08','nar',1.20,"Then Doom found you... and gave your watch back.",'am_fenrir',.98),
 ('09','you',1.00,"You said everyone would forget.",'am_puck',.96),
 ('10','doom',0.80,"Everyone did. I never said I would.",'am_onyx',.88),
]
TAIL=7.2  # walkaway air + end card hold

def doomify(a):
 r=2**(1.5/12)                       # -1.5 semitones (and ~9% slower: wanted)
 a=resample(a,int(len(a)*r))
 rng=np.random.default_rng(7)
 ir=rng.normal(size=int(.55*SR))*np.exp(-np.arange(int(.55*SR))/(SR*.14))
 ir=sosfilt(butter(2,2600,fs=SR,output='sos'),ir);ir/=np.max(np.abs(ir))
 wet=np.convolve(a,ir)[:len(a)+int(.4*SR)]*.16
 dry=np.pad(a,(0,len(wet)-len(a)))
 out=dry+wet
 out=sosfilt(butter(1,90,fs=SR,btype='highpass',output='sos'),out)
 return out/max(np.max(np.abs(out)),1e-6)*.92

if '--mix-only' not in sys.argv:
 from kokoro_onnx import Kokoro
 import onnxruntime as ort
 opts=ort.SessionOptions();opts.intra_op_num_threads=2
 sess=ort.InferenceSession(str(LIB/'core/tts/kokoro-v1.0.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
 k=Kokoro.from_session(sess,str(LIB/'core/tts/voices-v1.0.bin'))
 for ident,spk,gap,text,voice,speed in LINES:
  tgt=OUT/f'{ident}.wav'
  if tgt.exists():continue
  a,sr=k.create(text,voice=voice,speed=speed,lang='en-us');assert sr==SR
  nz=np.flatnonzero(np.abs(a)>.008)
  if len(nz):a=a[max(0,nz[0]-400):min(len(a),nz[-1]+1200)]
  if spk=='doom':a=doomify(np.asarray(a,dtype=np.float64))
  sf.write(tgt,a,SR);print(ident,round(len(a)/SR,2),text,flush=True)

# timeline from real durations
cues=[];t=0.0
for ident,spk,gap,text,voice,speed in LINES:
 a,sr=sf.read(OUT/f'{ident}.wav');d=len(a)/SR
 start=t+gap;end=start+d
 words=text.replace('...',' ').split()
 wts=[len(w)+1.8+(2.2 if w[-1] in '.?!,' else 0) for w in words]
 tot=sum(wts);acc=start;wlist=[]
 for w,wt in zip(words,wts):
  ws=acc;we=acc+d*wt/tot;acc=we
  wlist.append([w.strip(),round(ws,3),round(we,3)])
 cues.append({'id':ident,'speaker':spk,'start':round(start,3),'end':round(end,3),'text':text,'words':wlist})
 t=end
DUR=round(t+TAIL,2)
json.dump({'DUR':DUR,'cues':cues},open(OUT/'timeline.json','w'),indent=1)
def stamp(x):
 n=round(x*1000);return f'{n//3600000:02}:{n//60000%60:02}:{n//1000%60:02},{n%1000:03}'
srt=[f'{i}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}\n' for i,c in enumerate(cues,1)]
(HERE/'final'/'what-if-doom-was-saving-the-multiverse.srt').write_text('\n'.join(srt))
print('DUR',DUR)
for c in cues:print(c['id'],c['speaker'],c['start'],'->',c['end'])
