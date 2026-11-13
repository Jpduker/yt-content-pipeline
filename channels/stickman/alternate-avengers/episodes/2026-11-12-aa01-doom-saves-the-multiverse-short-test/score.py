"""AA01 original score + SFX + final mix. All synthesis is original.
Timing derives from audio/timeline.json exactly as film.js does."""
from pathlib import Path
import json
import numpy as np,soundfile as sf
from scipy.signal import butter,sosfilt

HERE=Path(__file__).resolve().parent
A=HERE/'audio'
TL=json.load(open(A/'timeline.json'))
CUES=TL['cues'];DUR=TL['DUR'];SR=24000
line=lambda i:next(c for c in CUES if c['id']==i)
word=lambda i,w:next(x for x in line(i)['words'] if x[0].lower().startswith(w))
T_CRACK=word('01','split')[1]
T_S2=line('01')['end']+.55;T_S3=line('02')['end']+.5
T_S4=line('05')['start']-.5
T_OFFER=line('06')['end']+.15;T_GRAB=line('06')['end']+.85
T_CARRY=T_GRAB+.25;T_FLASH=line('07')['start']-.25
T_S5=line('07')['start'];T_S6=line('08')['start']-.3
T_RET_IN=line('08')['start']+.3;T_RELEASE=word('08','watch')[1];T_TAKE=T_RELEASE+.4
T_WALK=line('10')['end']+.4;T_CARD=line('10')['end']+3.3

n=int(SR*DUR);t=np.arange(n)/SR
rng=np.random.default_rng(41)
music=np.zeros(n);sfx=np.zeros(n)
def add(dst,a,at,gain=1.0):
 i=int(at*SR);m=min(len(a),len(dst)-i)
 if m>0:dst[i:i+m]+=a[:m]*gain
def note(f,d,soft=True,bright=.28):
 q=np.arange(int(d*SR))/SR
 a=(np.sin(2*np.pi*f*q)+bright*np.sin(2*np.pi*f*2.003*q)+.11*np.sin(2*np.pi*f*3.998*q))
 env=(1-np.exp(-q/(.3 if soft else .01)))*np.exp(-q/(d*.42))
 return a*env
def pad(fs,d,g_=1.0):
 q=np.arange(int(d*SR))/SR;a=np.zeros(len(q))
 for f in fs:a+=np.sin(2*np.pi*f*q+.7*np.sin(2*np.pi*.13*q))
 env=np.minimum(1,q/1.6)*np.minimum(1,(d-q)/2.2);return a*env*g_

# ---- score: E minor, sparse and emotional (original melody) ----
Em=[82.41,123.47,164.81];Cmaj=[65.41,98,130.81];G=[98,146.83,196];D=[73.42,110,146.83]
Am=[110,164.81,220];Bm=[61.74,92.5,123.47]
# low drone through the broken-sky act
add(music,pad([41.2,82.41,82.9],T_FLASH+2),0,.030)
# chords by section
for at,ch,g_ in [(T_S2,Em,.034),(T_S3,Am,.030),(line('04')['start'],Bm,.034),
                 (T_S4,Em,.036),(line('06')['start']-1.0,[0.01],0),      # silence before "Take mine"
                 (line('06')['end']+.2,Cmaj,.040),(T_S5+1.2,Am,.034),
                 (T_S6,G,.034),(T_TAKE,D,.038),(line('10')['start'],Cmaj,.036),
                 (T_WALK,Em,.040),(T_CARD+.6,[164.81,246.94,329.63],.05)]:
 if g_:
  for f in ch:add(music,note(f,5.2,True),at,g_)
# bell motif (E5 B4 G4 F#4), used three times
def motif(at,g_=.045,tr=1.0):
 for i,(f,d) in enumerate([(659.25,1.6),(493.88,1.5),(392.0,1.9),(369.99,2.4)]):
  add(music,note(f*tr,d),at+i*.62,g_)
motif(T_S2+.4)
motif(T_S5+1.5,.04)
motif(T_WALK+.2,.065)
# heartbeat pulse under the price section
for i,at in enumerate(np.arange(T_S4,line('06')['start']-1.1,.86)):
 q=np.arange(int(.3*SR))/SR
 add(music,np.sin(2*np.pi*54*q)*np.exp(-q*22),at,.16)
 add(music,np.sin(2*np.pi*50*q)*np.exp(-q*26),at+.17,.10)
# rising shimmer into the heal
q=np.arange(int(1.4*SR))/SR
add(music,np.sin(2*np.pi*(660+840*q*q)*q)*np.sin(np.pi*q/1.4)**2,T_FLASH-1.3,.028)
for f in [987.77,1318.5,1567.98]:add(music,note(f,3.2),T_FLASH,.030)

# ---- sfx ----
# the crack: boom + torn-air sweep
q=np.arange(int(2.2*SR))/SR
boom=np.sin(2*np.pi*(46-14*q)*q)*np.exp(-q*2.6)
add(sfx,boom,T_CRACK,.26)      # QA: was .5, masked the hook line
nz=rng.normal(size=int(1.1*SR))
tear=sosfilt(butter(2,[700,5200],fs=SR,btype='bandpass',output='sos'),nz)*np.exp(-np.arange(int(1.1*SR))/SR*5)
add(sfx,tear,T_CRACK,.12)
add(sfx,sosfilt(butter(2,90,fs=SR,output='sos'),rng.normal(size=int(3.5*SR)))*np.exp(-np.arange(int(3.5*SR))/SR*1.1),T_CRACK+.55,.30)  # rumble swells after 'open'
# fissure hum while sky is broken
hum_n=int((T_FLASH-T_CRACK)*SR)
qh=np.arange(hum_n)/SR
hum=(np.sin(2*np.pi*87*qh)+.4*np.sin(2*np.pi*130.5*qh+.8))*(.5+.5*np.sin(2*np.pi*.22*qh))
env=np.minimum(1,qh/2)*np.minimum(1,(hum_n/SR-qh)/1.5)
add(sfx,hum*env,T_CRACK+.4,.030)
# watch ticks when presented, and on the end card
def ticks(at,until,g_=.05):
 for x in np.arange(at,until,.5):
  q=np.arange(int(.05*SR))/SR
  add(sfx,np.sin(2*np.pi*1900*q)*np.exp(-q*140),x,g_)
ticks(T_S4+.7,line('05')['end'])
ticks(T_CARD+.4,DUR-1.2,.06)
# great hand: deep air whoosh in/out
def whoosh(at,d=1.0,g_=.16,lo=260):
 q=np.arange(int(d*SR))/SR
 w=sosfilt(butter(2,lo,fs=SR,output='sos'),rng.normal(size=len(q)))*np.sin(np.pi*q/d)**2
 add(sfx,w,at,g_)
whoosh(T_OFFER-.3,1.3,.18);whoosh(T_CARRY+.3,1.1,.12)
whoosh(T_RET_IN-.4,1.3,.16);whoosh(T_TAKE+.4,1.2,.10)
# grab/release clinks
def clink(at,f=2600,g_=.09):
 q=np.arange(int(.09*SR))/SR
 add(sfx,(np.sin(2*np.pi*f*q)+.5*np.sin(2*np.pi*f*1.5*q))*np.exp(-q*70),at,g_)
clink(T_GRAB+.1);clink(T_RELEASE+.12);clink(T_TAKE,2200,.07)
# heal: glass knit + warm bloom
q=np.arange(int(1.8*SR))/SR
add(sfx,np.sin(2*np.pi*(2400-1700*q)*q)*np.exp(-q*3.2),T_FLASH,.05)
for i,f in enumerate([1174.66,1567.98,1975.53]):
 add(sfx,note(f,2.6),T_FLASH+.1+i*.14,.035)
# footsteps for passers-by (soft) and the sovereign walking away (heavy, slow)
for at in [T_S5+1.0,T_S5+1.45,T_S5+1.9,T_S5+2.35]:
 q=np.arange(int(.12*SR))/SR
 add(sfx,sosfilt(butter(2,420,fs=SR,output='sos'),rng.normal(size=len(q)))*np.exp(-q*40),at,.05)
for i,at in enumerate(np.arange(T_WALK+.2,min(T_WALK+3.4,DUR-1),.92)):
 q=np.arange(int(.3*SR))/SR
 add(sfx,(np.sin(2*np.pi*60*q)+.3*sosfilt(butter(2,300,fs=SR,output='sos'),rng.normal(size=len(q))))*np.exp(-q*14),at,.14*max(.3,1-i*.18))
# night ambience throughout: soft wind + distant city
amb=sosfilt(butter(2,[160,900],fs=SR,btype='bandpass',output='sos'),rng.normal(size=n))*.012
amb*= .7+.3*np.sin(2*np.pi*.07*t+1.2)
amb+=sosfilt(butter(2,300,fs=SR,output='sos'),rng.normal(size=n))*.006

# ---- voice assembly + duck + mix ----
voice=np.zeros(n)
for c in CUES:
 a,sr=sf.read(A/f"{c['id']}.wav");assert sr==SR
 if a.ndim>1:a=a.mean(1)
 add(voice,a,c['start'])
voice/=max(np.max(np.abs(voice)),1e-6);voice*=.62
duck=np.ones(n)
for c in CUES:
 i0=max(0,int((c['start']-.15)*SR));i1=min(n,int((c['end']+.25)*SR));duck[i0:i1]=.42
duck=sosfilt(butter(1,5,fs=SR,output='sos'),duck)
# QA: a real hush before the volunteer line (hum/drone/score drop ~14 dB, room tone stays)
hush=np.ones(n)
h0=int((line('06')['start']-1.25)*SR);h1=int((line('06')['end']+.15)*SR);hush[h0:h1]=.2
hush=sosfilt(butter(1,3,fs=SR,output='sos'),hush)
bed=(music+sfx)*duck*hush+amb
fade=np.minimum(1,t/.4)*np.minimum(1,(DUR-t)/1.2)
mono=(voice+bed)*fade
delay=np.r_[np.zeros(720),bed[:-720]]
stereo=np.stack([mono+bed*.10,mono+delay*.10],axis=1)
peak=np.max(np.abs(stereo))
if peak>.98:stereo*=.98/peak
sf.write(A/'voiceover.wav',voice,SR)
sf.write(A/'music-and-effects.wav',np.stack([bed,bed],axis=1),SR)
sf.write(A/'mix.wav',stereo,SR,subtype='PCM_24')
print('mix ready',DUR,'s peak',round(float(np.max(np.abs(stereo))),3))
