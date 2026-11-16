"""Original four-section score + ElevenLabs SFX, mixed around approved Liam VO."""
from pathlib import Path
import json,math,subprocess,wave
import numpy as np
from scipy.signal import butter,sosfilt
R=Path(__file__).resolve().parents[1]; A=R/'audio'; SR=48000; D=33.101

def run(args):
    q=subprocess.run(args,capture_output=True)
    if q.returncode:raise RuntimeError(q.stderr.decode()[-2500:])
    return q
def read(p):
    b=run(['ffmpeg','-v','error','-i',str(p),'-ar',str(SR),'-ac','2','-f','f32le','-']).stdout
    return np.frombuffer(b,dtype='<f4').reshape(-1,2).copy()
def write(p,x):
    p.parent.mkdir(parents=True,exist_ok=True)
    with wave.open(str(p),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(x,-1,1)*32767).astype('<i2').tobytes())
def level(x,rms):
    return x*rms/max(np.sqrt(np.mean(x*x)),1e-6)
def filt(x,hz):return sosfilt(butter(3,hz,fs=SR,output='sos'),x,axis=0)
def midi(n):return 440*2**((n-69)/12)

def main():
    N=math.ceil(D*SR);T=np.arange(N)/SR
    score=np.zeros((N,2));rng=np.random.default_rng(16)
    def note(start,length,n,amp=.10,pan=0,kind='key'):
        size=int(length*SR);t=np.arange(size)/SR;f=midi(n)
        if kind=='key':
            y=(np.sin(2*np.pi*f*t+0.6*np.sin(2*np.pi*2*f*t)*np.exp(-t*5))+.22*np.sin(2*np.pi*3*f*t)*np.exp(-t*7))*np.exp(-t*2.6)
            y*=np.minimum(t/.008,1)
        elif kind=='bass':
            y=(np.sin(2*np.pi*f*t)+.20*np.sin(2*np.pi*2*f*t))*np.exp(-t*4)*np.minimum(t/.015,1)
        elif kind=='pad':
            y=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*1.003*t)+.1*np.sin(2*np.pi*2*f*t))
            y*=np.minimum(t/.55,1)*np.clip((length-t)/.7,0,1)*.5
        else:
            y=rng.standard_normal(size)*np.exp(-t*35)*np.minimum(t/.002,1)
        y*=amp
        gains=np.sqrt([(1-pan)/2,(1+pan)/2]);i=int(start*SR);e=min(N,i+size)
        if i<N:score[i:e]+=y[:e-i,None]*gains
    # D minor / F major color. Native timing follows narration edit boundaries.
    sections=[(0,10.84,'curiosity'),(10.84,15.88,'tension'),(15.88,24.68,'momentum'),(24.68,D,'payoff')]
    chords=[[50,57,60,64],[46,53,57,60],[50,57,60,64],[45,52,55,60]]
    for start,end,mood in sections:
        for k,t in enumerate(np.arange(start,end,2.5)):
            chord=chords[k%4] if mood!='payoff' else [[53,57,60,64],[55,59,62,65],[50,57,60,64],[50,57,62,65]][k%4]
            for j,n in enumerate(chord):note(t,min(3.0,end-t+.4),n,.035 if mood!='tension' else .045,(j-1.5)*.3,'pad')
        step=.625 if mood in ['curiosity','payoff'] else .3125
        melody=[74,69,76,77,72,69,76,74] if mood=='curiosity' else ([65,64,63,62] if mood=='tension' else [62,69,65,72,69,65,74,72])
        for k,t in enumerate(np.arange(start+.15,end-.2,step)):
            if mood=='curiosity' and k%4==3:continue
            note(t,.8,melody[k%len(melody)],.055 if mood!='momentum' else .035,(-.35 if k%2 else .35),'key')
        if mood in ['tension','momentum','payoff']:
            for k,t in enumerate(np.arange(start,end-.1,.625)):
                note(t,.45,38 if mood!='payoff' else [41,43,38,38][(k//4)%4],.075,0,'bass')
                if mood=='momentum':note(t+.30,.12,0,.018,.25 if k%2 else -.25,'noise')
    # Short clean ending, with a small musical gap for the final punchline.
    score*=np.clip((D-T)/.5,0,1)[:,None]
    for delay,gain in [(.21,.13),(.43,.07)]:
        i=int(delay*SR);score[i:]+=score[:-i,::-1]*gain
    score=filt(score,6500);score=level(score,.13)
    # Decode and normalize the exact approved narration without pitch/time edits.
    dry=A/'voices/male-liam.mp3';normal=A/'stems/narration.wav'
    normal.parent.mkdir(parents=True,exist_ok=True)
    run(['ffmpeg','-y','-v','error','-i',str(dry),'-af','loudnorm=I=-16:TP=-2:LRA=9','-ar',str(SR),'-ac','2',str(normal)])
    v=read(normal);voice=np.zeros((N,2));voice[:min(N,len(v))]=v[:N]
    # Speech envelope: quick attack, slower release; no abrupt pumping.
    energy=np.mean(voice*voice,axis=1)
    smooth=sosfilt(butter(2,5,fs=SR,output='sos'),energy)
    active=np.clip(np.sqrt(np.maximum(smooth,0))/.035,0,1)
    release=sosfilt(butter(1,2.5,fs=SR,output='sos'),active)
    duck=np.clip(1-.52*release,.45,1)
    music=score*(.43*duck)[:,None]
    music[(T>30.8)&(T<32.5)]*=.45
    write(A/'music/pilot-v3-original-score.wav',score)
    rain=level(read(A/'sfx/rain.mp3'),.06)
    repeats=int(np.ceil(N/len(rain)));rain=np.tile(rain,(repeats,1))[:N]
    inside=filt(rain,1400);outside=filt(rain,7000)
    inside=level(inside,.018);outside=level(outside,.026)
    outdoors=np.clip((T-15.88)/.5,0,1)
    ambience=inside*(1-outdoors[:,None])+outside*outdoors[:,None]
    ambience[(T>=24.68)]*=.75
    ambience*=(.72+.28*duck)[:,None]
    effects=np.zeros((N,2))
    cue_log=[]
    def fx(name,at,gain=.03,lp=None,fade=.12):
        x=read(A/f'sfx/{name}.mp3')
        if lp:x=filt(x,lp)
        x=level(x,gain);t=np.arange(len(x))/SR
        x*=np.minimum(t/fade,1)[:,None]*np.minimum((len(x)/SR-t)/fade,1)[:,None]
        i=int(at*SR);e=min(N,i+len(x));effects[i:e]+=x[:e-i]*duck[i:e,None]
        cue_log.append({'sound':name,'start':at,'rms_before_duck':gain,'lowpass_hz':lp})
    fx('paper',.25,.021,4500);fx('paper',3.36,.014,4000)
    fx('phone',6.4,.045,2400)
    fx('tow-truck',15.88,.044,3000)
    fx('siren',20.0,.034,2200)
    fx('siren',24.68,.010,1000)
    fx('zipper',27.35,.023,4500)
    # Keep the combined background bus beneath the quieter spoken lines too.
    # A modest lift in speech gaps preserves environmental and musical detail.
    background_fader=.40+.25*(1-np.clip(release,0,1))
    music*=background_fader[:,None]
    ambience*=background_fader[:,None]
    effects*=background_fader[:,None]
    for name,x in [('music-ducked',music),('ambience',ambience),('effects',effects)]:write(A/f'stems/{name}.wav',x)
    mix=voice+music+ambience+effects
    peak=np.max(np.abs(mix));gain=.82/max(peak,1e-6);mix*=gain
    mix*=np.minimum(T/.015,1)[:,None]*np.clip((D-T)/.25,0,1)[:,None]
    write(A/'stems/final-mix.wav',mix)
    src=R/'tests/pilot-v2/gta6-pilot-v2-male-liam.mp4'
    out=R/'tests/pilot-v3/vice-city-alibis-sound-test-v3.mp4'
    run(['ffmpeg','-y','-v','error','-i',str(src),'-i',str(A/'stems/final-mix.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(D),'-movflags','+faststart',str(out)])
    report={'duration':D,'score_origin':'original deterministic composition; Eleven Music request returned 402 paid_plan_required','sfx_origin':'ElevenLabs eleven_text_to_sound_v3','voice':'approved unchanged Liam Eleven v4 performance','music_sections':sections,'sfx_cues':cue_log,'mix_peak_before_aac_dbfs':20*np.log10(max(np.max(abs(mix)),1e-9)),'master_gain':gain,'speech_duck_min':float(np.min(duck))}
    (R/'tests/pilot-v3/mix-report.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))

if __name__=='__main__':main()
