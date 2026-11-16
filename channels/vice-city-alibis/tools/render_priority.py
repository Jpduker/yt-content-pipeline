"""Build a review cut from checked portrait frames and timestamped narration."""
from pathlib import Path
import json,sys,re,subprocess,wave,math,hashlib
import numpy as np
from scipy.signal import butter,sosfilt,lfilter
R=Path(__file__).resolve().parents[1]; SR=48000; D=56
def run(args):
    q=subprocess.run(args,capture_output=True)
    if q.returncode: raise RuntimeError(q.stderr.decode(errors='replace')[-2000:])
    return q.stdout
def read(p):return np.frombuffer(run(['ffmpeg','-v','error','-i',str(p),'-ar',str(SR),'-ac','2','-f','f32le','-']),dtype='<f4').reshape(-1,2).copy()
def write(p,a):
    with wave.open(str(p),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(a,-1,1)*32767).astype('<i2').tobytes())
def stamp(t):
    n=round(t*100);return f'{n//360000}:{n//6000%60:02}:{n//100%60:02}.{n%100:02}'
def main(arg):
    p=Path(arg);e=json.loads(p.read_text(encoding='utf-8-sig'));a=p.parent/(p.stem+'-audio');art=p.parent/(p.stem+'-art');out=p.parent/(p.stem+'-review');out.mkdir(exist_ok=True)
    frames=[art/f'{i:02}.png' for i in range(1,9)]
    if not all(f.exists() for f in frames):raise RuntimeError('Eight frames are required before rendering')
    if e.get('duration_seconds') != D or len(e.get('scenes',[])) != 8:
        raise RuntimeError('Expected eight scenes and a 56-second review target')
    script=' '.join(s['narration'] for s in e['scenes'])
    if script != e['script']: raise RuntimeError('Scene narration does not match episode script')
    provenance=json.loads((a/'provenance.json').read_text(encoding='utf-8-sig'))
    if provenance['request']['text'] != script:
        raise RuntimeError('Audio provenance does not match the CURRENT locked script')
    if provenance.get('voice_id') != e['voice']['id']:
        raise RuntimeError('Synthesized voice differs from the episode voice')
    al=json.loads((a/'alignment.json').read_text(encoding='utf-8-sig'))['alignment'];text=''.join(al['characters']);starts=al['character_start_times_seconds'];ends=al['character_end_times_seconds'];offset=.35
    if text != script: raise RuntimeError('Character alignment text differs from locked narration')
    if not (len(text)==len(starts)==len(ends)) or not text:
        raise RuntimeError('Incomplete alignment data')
    if any(not math.isfinite(x) or x<0 for x in starts+ends): raise RuntimeError('Invalid alignment times')
    if any(s>t for s,t in zip(starts,ends)) or any(x>y for x,y in zip(starts,starts[1:])) or any(x>y for x,y in zip(ends,ends[1:])):
        raise RuntimeError('Nonmonotonic character alignment')
    if ends[-1]+offset > D-.25: raise RuntimeError('Speech would be cut off; adjust edit target explicitly')
    bounds=[0];pos=0
    for i,s in enumerate(e['scenes']):
        if text[pos:pos+len(s['narration'])] != s['narration']:
            raise RuntimeError('Scene alignment mismatch')
        pos+=len(s['narration'])
        if i<7:
            next_start=pos+1
            bounds.append(offset+(ends[pos-1]+starts[next_start])/2)
            pos=next_start
    bounds.append(D)
    if any(round(y*30)-round(x*30)<1 for x,y in zip(bounds,bounds[1:])):
        raise RuntimeError('Scene duration rounds to zero frames')
    (out/'narration-metadata.json').write_text(json.dumps({'episode_id':e['id'],'title':e['title'],'script':script,'script_sha256':hashlib.sha256(script.encode()).hexdigest(),'voice':e['voice'],'synthesis_request':provenance['request'],'source_audio':str(a/'liam-private-preview.mp3'),'licensing':provenance.get('licensing','commercial clearance unverified')},indent=2),encoding='utf-8')
    (out/'measured-timeline.json').write_text(json.dumps({'boundaries':bounds,'duration':D,'speech_offset':offset},indent=2))
    # Captions follow generated character alignment, not editorial seven-second bins.
    ass='[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Default,Arial,57,&H00D8F2FF,&H00D8F2FF,&H001D0916,&H80000000,-1,0,0,0,100,100,0,0,1,4,1,2,90,150,330,1\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n'
    words=list(re.finditer(r'\S+',text))
    for i in range(0,len(words),4):
        group=words[i:i+4];line=' '.join(m.group() for m in group).replace('{','').replace('}','')
        if len(line)>29:
            j=len(group)//2;line=' '.join(m.group() for m in group[:j])+r'\N'+' '.join(m.group() for m in group[j:])
        cap_start=starts[group[0].start()]+offset
        cap_end=min(D,ends[group[-1].end()-1]+offset+.08)
        if i+4<len(words): cap_end=min(cap_end,starts[words[i+4].start()]+offset)
        if cap_end<=cap_start: raise RuntimeError('Invalid caption timing')
        ass+=f'Dialogue: 0,{stamp(cap_start)},{stamp(cap_end)},Default,,0,0,0,,{line}\n'
    (out/'captions.ass').write_text(ass,encoding='utf-8-sig')
    # Speech remains at native cadence; normalize separately and retain dry original.
    run(['ffmpeg','-v','error','-y','-i',str(a/'liam-private-preview.mp3'),'-af','loudnorm=I=-16:TP=-2:LRA=9','-ar',str(SR),str(out/'voice.wav')])
    N=SR*D;voice=np.zeros((N,2));v=read(out/'voice.wav');j=int(offset*SR)
    if j+len(v)>N: raise RuntimeError('Decoded narration exceeds target; refusing to truncate')
    voice[j:j+len(v)]=v
    score=np.zeros((N,2));rng=np.random.default_rng(916 if 'e01' in p.stem else 917)
    def note(t,length,midi,amp,kind='pluck',pan=0):
        start=int(t*SR);size=min(int(length*SR),N-start)
        if size<=0:return
        x=np.arange(size)/SR;f=440*2**((midi-69)/12)
        if kind=='pad':y=(np.sin(2*np.pi*f*x)+.15*np.sin(2*np.pi*f*1.004*x))*np.minimum(x/.4,1)*np.minimum((length-x)/.5,1)
        elif kind=='tick':y=rng.normal(size=size)*np.exp(-x*50)*np.minimum(x/.002,1)
        else:y=(np.sin(2*np.pi*f*x+.3*np.sin(4*np.pi*f*x)*np.exp(-5*x))+.12*np.sin(6*np.pi*f*x))*np.exp(-x*4)*np.minimum(x/.008,1)
        score[start:start+size]+=y[:,None]*amp*np.sqrt([(1-pan)/2,(1+pan)/2])
    for i,(lo,hi) in enumerate(zip(bounds,bounds[1:])):
        tension=i in (2,3,4);resolution=i>=6;chord=[50,57,60] if not resolution else [53,57,62]
        for t in np.arange(lo,hi,2.4):
            for k,n in enumerate(chord):note(t,min(2.8,hi-t+.2),n,.022,'pad',(k-1)*.3)
        for k,t in enumerate(np.arange(lo+.15,hi-.2,.6 if tension else 1.2)):
            note(t,.8,([74,69,72,77] if not tension else [62,63,69,65])[k%4],.045,pan=(-.25 if k%2 else .25))
            if tension:note(t,.16,38,.015,'tick')
        if tension:
            for t in np.arange(lo,hi,1.2):note(t,.6,38,.05)
    score=sosfilt(butter(3,6500,fs=SR,output='sos'),score,axis=0)
    rain=read(R/'audio/sfx/rain.mp3');rain=np.tile(rain,(math.ceil(N/len(rain)),1))[:N];rain=sosfilt(butter(3,2200 if 'e01' in p.stem else 5500,fs=SR,output='sos'),rain,axis=0);rain*=.012/max(np.sqrt(np.mean(rain*rain)),1e-8)
    fx=np.zeros_like(score)
    for i,name in ((1,'paper.mp3'),(5,'paper.mp3')) if 'e01' in p.stem else ((2,'phone.mp3'),(3,'paper.mp3'),(6,'phone.mp3')):
        s=read(R/'audio/sfx'/name);s=s[:int(.8*SR)];s*=.025/max(np.sqrt(np.mean(s*s)),1e-8);n=int((bounds[i]+.1)*SR);fx[n:n+len(s)]+=s[:N-n]
    # Dock-specific free-plan review SFX; cues use the measured narration edit.
    scenario_stems={}
    if 'e02' in p.stem:
        def crossfade_loop(samples,count):
            if len(samples)==0: raise RuntimeError('Empty scenario sound')
            if count<=len(samples): return samples[:count].copy()
            cross=min(int(.12*SR),len(samples)//4)
            result=np.zeros((count,2));take=min(count,len(samples));result[:take]=samples[:take];filled=take
            while filled<count:
                overlap=min(cross,filled)
                pos=filled-overlap;take=min(len(samples),count-pos)
                if overlap:
                    ramp=np.linspace(0,1,overlap)[:,None]
                    result[pos:filled]=result[pos:filled]*(1-ramp)+samples[:overlap]*ramp
                result[filled:pos+take]=samples[overlap:take]
                filled=pos+take
            return result
        def cue(name,start,end,rms,hold_tail=False):
            original=read(a/(name+'.mp3'));original-=np.mean(original,axis=0)
            begin=max(0,int(start*SR));stop=min(N,int(end*SR));count=stop-begin
            if count<=0: raise RuntimeError('Scenario SFX has no duration')
            if hold_tail and count>len(original):
                # Preserve the single motor ignition; repeat only its settled idle tail.
                cross=min(int(.12*SR),len(original)//4)
                tail=original[-min(len(original),2*SR):]
                sustain=crossfade_loop(tail,count-len(original)+cross)
                ramp=np.linspace(0,1,cross)[:,None]
                blend=original[-cross:]*(1-ramp)+sustain[:cross]*ramp
                sound=np.concatenate((original[:-cross],blend,sustain[cross:]),axis=0)
            else: sound=crossfade_loop(original,count)
            sound*=rms/max(np.sqrt(np.mean(sound*sound)),1e-8)
            sample_time=np.arange(count)/SR
            edge=np.minimum(sample_time/.35,1)*np.minimum((count-np.arange(count))/SR/.8,1)
            stem=np.zeros((N,2));stem[begin:stop]=sound*edge[:,None]
            scenario_stems[name]=stem
            return stem
        rain+=cue('water',0,D,.004)
        fx+=cue('fire',bounds[4],bounds[6],.008)
        fx+=cue('skiff',bounds[7],D,.009,hold_tail=True)
        (out/'scenario-audio-cues.json').write_text(json.dumps({'licensing':'PRIVATE REVIEW ONLY; generated free-plan SFX are not commercially cleared','timing':'measured narration boundaries','water':{'start':0,'end':D,'source':str(a/'water.mp3'),'role':'low-level continuous harbor bed under rain'},'fire':{'start':bounds[4],'end':bounds[6],'source':str(a/'fire.mp3'),'role':'contained disposal fire, scenes 5 and 6'},'skiff':{'start':bounds[7],'end':D,'source':str(a/'skiff.mp3'),'role':'single motor start and sustained idle, scene 8'}},indent=2))
    envelope=lfilter([1/4800], [1,-(1-1/4800)],np.max(np.abs(voice),axis=1));duck=1-.65*np.clip(envelope/.05,0,1)
    write(out/'score-unducked-original.wav',score)
    write(out/'ambience-unducked.wav',rain)
    if 'e02' in p.stem:
        write(out/'effects-unducked.wav',fx)
        for name,stem in scenario_stems.items():
            write(out/(name+'-scenario-unducked.wav'),stem)
            write(out/(name+'-scenario-ducked.wav'),stem*duck[:,None])
        fx*=duck[:,None]
    score*=duck[:,None];rain*=duck[:,None];fade=np.minimum(np.arange(N)/SR/.25,1)*np.minimum((N-np.arange(N))/SR/1.2,1)
    for name,stem in [('score',score),('ambience',rain),('effects',fx)]:write(out/(name+'.wav'),stem*fade[:,None])
    mix=(voice+score+rain+fx)*fade[:,None];mix*=min(1,.88/max(np.max(np.abs(mix)),1e-8));write(out/'mix.wav',mix)
    clips=[]
    for i,f in enumerate(frames):
        frames_count=round(bounds[i+1]*30)-round(bounds[i]*30);clip=out/f'shot-{i+1:02}.mp4';clips.append(clip)
        vf=f'scale=1200:2134:force_original_aspect_ratio=increase,crop=1200:2134,zoompan=z=1.01+on*0.00012:x=iw/2-iw/zoom/2:y=ih/2-ih/zoom/2:d={frames_count}:s=1080x1920:fps=30,setsar=1'
        run(['ffmpeg','-v','error','-y','-i',str(f),'-vf',vf,'-frames:v',str(frames_count),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',str(clip)])
    (out/'clips.txt').write_text(''.join("file '"+x.name+"'\n" for x in clips))
    # Run from output directory so subtitle and concat paths need no escaping.
    q=subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','clips.txt','-i','mix.wav','-vf','ass=captions.ass','-t','56','-c:v','libx264','-preset','fast','-crf','19','-c:a','aac','-b:a','192k','-movflags','+faststart','review.mp4'],cwd=out,capture_output=True)
    if q.returncode:raise RuntimeError(q.stderr.decode()[-2000:])
    run(['ffmpeg','-v','error','-i',str(out/'review.mp4'),'-f','null','-'])
    probe=json.loads(run(['ffprobe','-v','quiet','-show_format','-show_streams','-of','json',str(out/'review.mp4')]))
    (out/'verification.json').write_text(json.dumps({'full_decode':'passed','media':probe,'licensing':'PRIVATE REVIEW ONLY. Free-plan voice/SFX are not commercially cleared; see source provenance and docs/RELEASE_STATUS.md','visual_and_listening_review':'pending full playback; generated frames require user review','music':'original synthesized score; not Eleven Music','frame_model':'not inferred by renderer; see artwork provenance','episode_id':e['id'],'title':e['title'],'narration_sha256':hashlib.sha256(script.encode()).hexdigest(),'speech_end_seconds':ends[-1]+offset,'expected_duration_seconds':D},indent=2))
    print(out/'review.mp4',flush=True)
if __name__=='__main__':
    for arg in sys.argv[1:]:main(arg)
