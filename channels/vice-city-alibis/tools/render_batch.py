"""Render new batch review cuts; frozen priority renderer and published cuts stay untouched.

Usage: python render_batch.py path/to/episode-01.json [episode-02.json ...]
Inputs: episode-NN-art/01.png..08.png and episode-NN-audio/{liam-private-preview.mp3,alignment.json,provenance.json}.
Optional episode audio_cues use channel-root-relative source paths, scene_index (zero-based),
rms, duration seconds, loop boolean and kind ambience|sfx. offset and lowpass_hz optional.
No stock rain, phone, fire or other effects are injected without an explicit cue.
"""
from pathlib import Path
import json,sys,re,subprocess,wave,math,hashlib,shutil
import numpy as np
from scipy.signal import butter,sosfilt,lfilter
R=Path(__file__).resolve().parents[1]; SR=48000
def run(args):
    if args and args[0]=='ffmpeg' and '-nostdin' not in args:args=[args[0],'-nostdin']+args[1:]
    q=subprocess.run(args,stdin=subprocess.DEVNULL,capture_output=True)
    if q.returncode: raise RuntimeError(q.stderr.decode(errors='replace')[-2000:])
    return q.stdout
def read(p):return np.frombuffer(run(['ffmpeg','-v','error','-i',str(p),'-ar',str(SR),'-ac','2','-f','f32le','-']),dtype='<f4').reshape(-1,2).copy()
def write(p,a):
    with wave.open(str(p),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(a,-1,1)*32767).astype('<i2').tobytes())
def stamp(t):
    n=round(t*100);return f'{n//360000}:{n//6000%60:02}:{n//100%60:02}.{n%100:02}'
def edit_duration(speech_end):
    """Preserve cadence; allow intro .35s and tail 1.2s plus whole-second rounding."""
    if not math.isfinite(speech_end) or speech_end <= 0:
        raise ValueError('Invalid speech end')
    duration=math.ceil(max(50,speech_end+.35+1.2))
    if duration > 60:
        raise ValueError('Native narration exceeds 60s; rewrite/re-synthesize, never stretch')
    if duration-(speech_end+.35) > 2.2+1e-9:
        raise ValueError('Narration is too short for 50s without a silent stretch; rewrite/re-synthesize')
    return duration

def cue_geometry(cue,bounds,duration):
    index=cue.get('scene_index')
    if isinstance(index,bool) or not isinstance(index,int) or not 0<=index<8:
        raise ValueError('Audio cue scene_index must be integer 0..7')
    offset=cue.get('offset',0)
    length=cue.get('duration',bounds[index+1]-bounds[index]-offset)
    if not all(isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x) for x in [offset,length]):
        raise ValueError('Audio cue needs finite offset/duration')
    start=bounds[index]+offset;end=start+length
    if offset<0 or length<=0 or start>=bounds[index+1] or end>duration+1e-9:
        raise ValueError('Audio cue extends outside its valid timeline geometry')
    return start,end

def score_theme(identity):
    digest=hashlib.sha256(identity.encode('utf8')).digest()
    return {'seed':int.from_bytes(digest[:8],'big'),'transpose':digest[8]%7-3,'tempo':76+digest[9]%25,'motif_rotation':digest[10]%4}

def music_mood(description):
    words=str(description).lower()
    if any(w in words for w in ['resolution','warm','release','final chord','harmonic lift','relief']):return 'resolution'
    if any(w in words for w in ['chase','action','accelerat','sprint','fast percussion','driving']):return 'action'
    if any(w in words for w in ['tension','uneasy','tighten','rising','dark','suspicion','pulse','threat']):return 'tension'
    return 'curiosity'

def crossfade_loop(samples,count):
    if len(samples)==0 or count<=0:raise ValueError('Empty cue source or duration')
    if count<=len(samples):return samples[:count].copy()
    cross=min(int(.12*SR),len(samples)//4)
    result=np.zeros((count,2));filled=min(count,len(samples));result[:filled]=samples[:filled]
    while filled<count:
        overlap=min(cross,filled);pos=filled-overlap;take=min(len(samples),count-pos)
        if overlap:
            ramp=np.linspace(0,1,overlap)[:,None]
            result[pos:filled]=result[pos:filled]*(1-ramp)+samples[:overlap]*ramp
        result[filled:pos+take]=samples[overlap:take];filled=pos+take
    return result

def cue_source(relative):
    source=Path(relative)
    if source.is_absolute():raise ValueError('Cue source must be relative to channel root')
    resolved=(R/source).resolve()
    if not resolved.is_relative_to(R.resolve()):raise ValueError('Cue source escapes channel root')
    if not resolved.is_file():raise ValueError('Missing explicit cue source: '+str(source))
    return resolved


def main(arg):
    p=Path(arg);e=json.loads(p.read_text(encoding='utf-8-sig'));a=p.parent/(p.stem+'-audio');art=p.parent/(p.stem+'-art');out=p.parent/(p.stem+'-review');out.mkdir(exist_ok=True)
    frames=[art/f'{i:02}.png' for i in range(1,9)]
    if not all(f.exists() for f in frames):raise RuntimeError('Eight frames are required before rendering')
    if (out/'review.mp4').exists():raise RuntimeError('Existing review cut preserved; choose a new output episode/version before rerendering')
    if not isinstance(e.get('duration_seconds'),(int,float)) or not 50<=e['duration_seconds']<=60 or len(e.get('scenes',[])) != 8:
        raise RuntimeError('Expected eight scenes and a planned 50–60 second target')
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
    D=edit_duration(ends[-1])
    if ends[-1]+offset > D-1.2: raise RuntimeError('Speech would be cut off; refusing to shorten native voice')
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
    # Speech remains at native cadence; normalize loudness only, retain original bytes.
    shutil.copy2(a/'liam-private-preview.mp3',out/'voice-dry-original.mp3')
    run(['ffmpeg','-v','error','-y','-i',str(a/'liam-private-preview.mp3'),'-af','loudnorm=I=-16:TP=-2:LRA=9','-ar',str(SR),str(out/'voice.wav')])
    N=SR*D;voice=np.zeros((N,2));v=read(out/'voice.wav');j=int(offset*SR)
    if j+len(v)>N: raise RuntimeError('Decoded narration exceeds target; refusing to truncate')
    voice[j:j+len(v)]=v
    score=np.zeros((N,2));theme=score_theme(e['id']+script);rng=np.random.default_rng(theme['seed']);music_plan=[]
    def note(t,length,midi,amp,kind='pluck',pan=0):
        start=int(t*SR);size=min(int(length*SR),N-start)
        if size<=0:return
        x=np.arange(size)/SR;f=440*2**((midi-69)/12)
        if kind=='pad':y=(np.sin(2*np.pi*f*x)+.15*np.sin(2*np.pi*f*1.004*x))*np.minimum(x/.4,1)*np.minimum((length-x)/.5,1)
        elif kind=='tick':y=rng.normal(size=size)*np.exp(-x*50)*np.minimum(x/.002,1)
        else:y=(np.sin(2*np.pi*f*x+.3*np.sin(4*np.pi*f*x)*np.exp(-5*x))+.12*np.sin(6*np.pi*f*x))*np.exp(-x*4)*np.minimum(x/.008,1)
        score[start:start+size]+=y[:,None]*amp*np.sqrt([(1-pan)/2,(1+pan)/2])
    for i,(lo,hi) in enumerate(zip(bounds,bounds[1:])):
        description=e['scenes'][i].get('sound',{}).get('music','Sparse curious piano')
        mood=music_mood(description);tension=mood in ('tension','action');resolution=mood=='resolution'
        trans=theme['transpose'];beat=60/theme['tempo'];step=beat*(.5 if mood=='action' else 1 if tension else 2)
        chord=[n+trans for n in ([53,57,62] if resolution else [50,57,60])]
        music_plan.append({'scene_index':i,'start':lo,'end':hi,'description':description,'mood':mood,'theme':theme,'step_seconds':step})
        for t in np.arange(lo,hi,beat*4):
            for k,n in enumerate(chord):note(t,min(beat*4.2,hi-t+.1),n,.018,'pad',(k-1)*.3)
        motif=([74,69,72,77] if not tension else [62,63,69,65]);rotation=theme['motif_rotation']
        for k,t in enumerate(np.arange(lo+.15,hi-.2,step)):
            note(t,min(.8,hi-t),motif[(k+rotation)%4]+trans,.032,pan=(-.25 if k%2 else .25))
            if tension:note(t,.12,38+trans,.010 if mood=='tension' else .014,'tick')
        if tension:
            for t in np.arange(lo,hi,beat*2):note(t,min(.6,hi-t),38+trans,.035)
    score=sosfilt(butter(3,6500,fs=SR,output='sos'),score,axis=0)
    ambience=np.zeros_like(score);fx=np.zeros_like(score);scenario_stems={};cue_plan=[]
    for number,cue in enumerate(e.get('audio_cues',[])):
        if cue.get('kind') not in ('ambience','sfx'):raise ValueError('Cue kind must be ambience or sfx')
        rms=cue.get('rms')
        if isinstance(rms,bool) or not isinstance(rms,(int,float)) or not math.isfinite(rms) or not 0<rms<=.1:
            raise ValueError('Explicit cue rms must be >0 and <=.1')
        if not isinstance(cue.get('loop',False),bool):raise ValueError('Cue loop must be boolean')
        start,end=cue_geometry(cue,bounds,D);source=cue_source(cue['source']);original=read(source)
        if len(original)==0:raise ValueError('Empty cue source')
        original-=np.mean(original,axis=0)
        if cue.get('lowpass_hz') is not None:
            cutoff=cue['lowpass_hz']
            if not isinstance(cutoff,(int,float)) or not 20<cutoff<SR/2:raise ValueError('Invalid cue lowpass_hz')
            original=sosfilt(butter(3,cutoff,fs=SR,output='sos'),original,axis=0)
        begin=round(start*SR);stop=min(N,round(end*SR));count=stop-begin
        if cue.get('loop',False):sound=crossfade_loop(original,count)
        else:
            sound=np.zeros((count,2));take=min(count,len(original));sound[:take]=original[:take]
        active=sound if cue.get('loop',False) else sound[:min(count,len(original))]
        measured=np.sqrt(np.mean(active*active))
        if measured<1e-9:raise ValueError('Cue source contains silence only')
        sound*=rms/measured
        t=np.arange(count)/SR;edge=np.minimum(t/.025,1)*np.minimum((count-np.arange(count))/SR/.06,1)
        stem=np.zeros((N,2));stem[begin:stop]=sound*edge[:,None]
        label=f'cue-{number+1:02}-{cue["kind"]}';scenario_stems[label]=stem
        if cue['kind']=='ambience':ambience+=stem
        else:fx+=stem
        cue_plan.append({'cue_index':number,'kind':cue['kind'],'source':str(source.relative_to(R)),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'start':start,'end':end,'duration':end-start,'rms_target':rms,'loop':cue.get('loop',False),'lowpass_hz':cue.get('lowpass_hz'),'licensing':cue.get('licensing','UNVERIFIED; PRIVATE REVIEW ONLY'),'source_provenance':cue.get('source_provenance'),'stem':label})
    (out/'scenario-audio-cues.json').write_text(json.dumps({'timing':'measured narration boundaries; explicit cues only','licensing':'PRIVATE REVIEW; source commercial clearance not inferred','cues':cue_plan},indent=2),encoding='utf8')
    (out/'music-plan.json').write_text(json.dumps({'composition':'original deterministic synthesis, not Eleven Music','episode_theme':theme,'scenes':music_plan},indent=2),encoding='utf8')
    envelope=lfilter([1/4800], [1,-(1-1/4800)],np.max(np.abs(voice),axis=1));duck=1-.65*np.clip(envelope/.05,0,1)
    write(out/'score-unducked-original.wav',score)
    write(out/'ambience-unducked.wav',ambience)
    write(out/'effects-unducked.wav',fx)
    for name,stem in scenario_stems.items():
        write(out/(name+'-unducked.wav'),stem)
        write(out/(name+'-ducked.wav'),stem*duck[:,None])
    score*=duck[:,None];ambience*=duck[:,None];fx*=duck[:,None]
    fade=np.minimum(np.arange(N)/SR/.25,1)*np.minimum((N-np.arange(N))/SR/1.2,1)
    for name,stem in [('score',score),('ambience',ambience),('effects',fx)]:write(out/(name+'.wav'),stem*fade[:,None])
    mix=(voice+score+ambience+fx)*fade[:,None];mix_gain=min(1,.82/max(np.max(np.abs(mix)),1e-8));mix*=mix_gain;write(out/'mix.wav',mix)
    clips=[]
    for i,f in enumerate(frames):
        frames_count=round(bounds[i+1]*30)-round(bounds[i]*30);clip=out/f'shot-{i+1:02}.mp4';clips.append(clip)
        vf=f'scale=1200:2134:force_original_aspect_ratio=increase,crop=1200:2134,zoompan=z=1.01+on*0.00012:x=iw/2-iw/zoom/2:y=ih/2-ih/zoom/2:d={frames_count}:s=1080x1920:fps=30,setsar=1'
        run(['ffmpeg','-v','error','-y','-i',str(f),'-vf',vf,'-frames:v',str(frames_count),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',str(clip)])
    (out/'clips.txt').write_text(''.join("file '"+x.name+"'\n" for x in clips))
    # Durable assembly diagnostics survive a detached tool session. Completed scenes stay local.
    assembly=out/'review-complete.mp4'
    command=['ffmpeg','-nostdin','-v','error','-y','-f','concat','-safe','0','-i','clips.txt','-i','mix.wav','-map','0:v:0','-map','1:a:0','-vf','ass=captions.ass','-t',str(D),'-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart','-progress','final-progress.txt',assembly.name]
    (out/'assembly-command.json').write_text(json.dumps({'command':command,'cwd':str(out.resolve()),'status':'assembly started; completion not yet inferred','stdin':'DEVNULL + ffmpeg -nostdin','published':False},indent=2),encoding='utf8')
    with (out/'final-errors.log').open('wb') as errors:
        q=subprocess.run(command,cwd=out,stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=errors)
    (out/'assembly-exit.json').write_text(json.dumps({'returncode':q.returncode,'candidate':str(assembly),'status':'assembly command exited; verification still required'},indent=2),encoding='utf8')
    if q.returncode:raise RuntimeError('Final assembly failed; completed scene clips retained. See final-errors.log and final-progress.txt')
    # Import locally: verifier shares edit_duration but never re-encodes the eight scenes.
    from verify_batch_export import verify
    verify(p,assembly.name,promote=True)

if __name__=='__main__':
    for arg in sys.argv[1:]:main(arg)
