"""Prepare original synthetic review foley and assign measured, scene-matched cues.

No services, API calls, credits, speech synthesis, field recordings or script changes.
Run again with --assign-only after episode07 narration arrives to update its timing.
"""
from pathlib import Path
import argparse,hashlib,json,math,wave
import numpy as np
from scipy.signal import butter,sosfilt,resample_poly
from render_batch import R,SR,read,write,edit_duration,cue_geometry
BATCH=R/'production/batch-2026-11-17'
ASSETS=R/'audio/procedural-review/batch-2026-11-17'
ORIGINALS={'metal-rattle':1.4,'caster-roll':6.,'shutter-roll':5.,'wet-brush':7.,'light-mast-hinge':2.,'gate-motor':5.,'petrol-van-steady':7.,'petrol-car-pass':4.,'drawer-slide':1.4,'private-line-texture':3.,'pa-speaker-texture':2.}
ORIGINAL_LICENSE='Original DSP composition/synthesis for private review; no external recording, model or API. Procedural approximation, NOT a field recording. Release suitability pending listening review.'
FREE_LICENSE='Existing ElevenLabs free-plan generated review asset or derivative; retain source provenance and attribution. Commercial clearance not established.'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def stable_seed(name):return int.from_bytes(hashlib.sha256(name.encode()).digest()[:8],'big')
def filtered_noise(rng,n,lo,hi):
    return sosfilt(butter(3,[lo,hi],btype='bandpass',fs=SR,output='sos'),rng.normal(size=n))
def synthesize(name,duration):
    if name not in ORIGINALS:raise ValueError('Unknown procedural source')
    n=round(duration*SR);t=np.arange(n)/SR;rng=np.random.default_rng(stable_seed(name));y=np.zeros(n)
    if name=='metal-rattle':
        for moment in np.arange(.02,duration,.16):
            x=np.maximum(t-moment,0);gate=t>=moment
            y+=gate*np.exp(-x*24)*(np.sin(2*np.pi*713*x)+.5*np.sin(2*np.pi*1321*x))*.22
        y+=filtered_noise(rng,n,600,5800)*.18
    elif name=='caster-roll':
        y=filtered_noise(rng,n,45,720)*( .65+.2*np.sin(2*np.pi*6.5*t)+.15*np.sin(2*np.pi*11.3*t))
        for moment in np.arange(.07,duration,.24):
            x=np.maximum(t-moment,0);y+=(t>=moment)*np.exp(-x*65)*np.sin(2*np.pi*127*x)*.16
    elif name in ('shutter-roll','gate-motor'):
        base=91 if name=='shutter-roll' else 73
        y=.35*np.sin(2*np.pi*base*t)+.14*np.sin(2*np.pi*base*2*t)
        y+=filtered_noise(rng,n,180,2200)*(.4+.25*np.sin(2*np.pi*9*t)**2)
        y*=.65+.35*np.minimum(t/.3,1)
    elif name=='wet-brush':
        y=filtered_noise(rng,n,120,4400)*(.25+.75*np.sin(2*np.pi*.8*t)**2)
        y+=filtered_noise(rng,n,1300,7600)*(.1+.1*np.sin(2*np.pi*3.3*t))
    elif name=='light-mast-hinge':
        phase=2*np.pi*(390*t+42*t*t)
        y=(np.sin(phase)+.3*np.sin(phase*2.7))*(.5+.5*np.sin(2*np.pi*5*t)**2)
        y+=filtered_noise(rng,n,300,2400)*.2
    elif name in ('petrol-van-steady','petrol-car-pass'):
        # Abstract petrol vehicle texture, never repurposed boat or truck recording.
        f=43 if name=='petrol-van-steady' else 57
        phase=2*np.pi*(f*t+(1.4*t*t if name=='petrol-car-pass' else .15*np.sin(2*np.pi*.7*t)))
        y=sum((1/k**1.3)*np.sin(k*phase) for k in range(1,7))
        y+=filtered_noise(rng,n,70,1300)*.4
        if name=='petrol-car-pass':y*=.5+.5*np.sin(np.pi*t/max(duration,.01))**2
    elif name=='drawer-slide':
        y=filtered_noise(rng,n,130,2300)*(.4+.6*np.sin(np.pi*t/max(duration,.01))**2)
        y+=.16*np.sin(2*np.pi*240*t)
    elif name in ('private-line-texture','pa-speaker-texture'):
        # Quiet line/speaker hiss only; no invented speaker, command, ringtone or vibration.
        y=filtered_noise(rng,n,450 if name=='private-line-texture' else 300,2900)
        y*=.8+.2*np.sin(2*np.pi*2.7*t)
    edge=np.minimum(t/.035,1)*np.minimum((n-np.arange(n))/SR/.08,1)
    y*=edge;y-=np.mean(y);rms=np.sqrt(np.mean(y*y))
    y*=min(.055/max(rms,1e-9),.5/max(np.max(np.abs(y)),1e-9))
    stereo=np.stack([y,np.roll(y,9)*.97],axis=1)
    return stereo

def save_asset(name,audio,meta):
    ASSETS.mkdir(parents=True,exist_ok=True);p=ASSETS/(name+'.wav');write(p,audio)
    # Verify the actual written PCM, including quantization and support geometry.
    with wave.open(str(p),'rb') as f:
        assert f.getnchannels()==2 and f.getframerate()==SR and f.getsampwidth()==2
        decoded=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(float).reshape(-1,2)/32768
    peak=float(np.max(np.abs(decoded)));rms=float(np.sqrt(np.mean(decoded**2)))
    oversampled_peak=float(np.max(np.abs(resample_poly(decoded,4,1,axis=0))))
    if peak>=.999 or rms<=1e-5:raise RuntimeError('Procedural asset failed headroom/signal check')
    meta.update({'file':str(p.relative_to(R)),'sha256':sha(p),'sample_rate':SR,'channels':2,'duration_seconds':len(decoded)/SR,'measured_sample_peak':peak,'measured_sample_peak_dbfs':20*math.log10(max(peak,1e-12)),'measured_rms':rms,'estimated_true_peak_4x_dbfs':20*math.log10(max(oversampled_peak,1e-12)),'peak_measurement_note':'4x polyphase oversampling diagnostic, not certified BS.1770 metering','clipping_samples':int(np.count_nonzero(np.abs(decoded)>=.999)),'status':'PRIVATE REVIEW; procedural preview, listening pending'})
    p.with_suffix('.wav.meta.json').write_text(json.dumps(meta,indent=2)+'\n',encoding='utf8')
    return meta

def generate_assets():
    result=[]
    for name,duration in ORIGINALS.items():
        result.append(save_asset(name,synthesize(name,duration),{'type':'ORIGINAL_PROCEDURAL_DSP','generator':'tools/prepare_batch_audio.py','seed':stable_seed(name),'description':name+'; restrained synthesized mechanical/texture approximation, NOT field recorded','licensing':ORIGINAL_LICENSE,'model':'none; deterministic numpy/scipy DSP','api_calls':0,'credits_used':0}))
    source=R/'production/week-01/day-01/w01-d01-e02-audio/skiff.mp3';original=read(source)
    # Use only settled final 1.6 seconds, excluding last .05s; ignition is never looped.
    stop=len(original)-round(.05*SR);start=max(round(2.5*SR),stop-round(1.6*SR));tail=original[start:stop].copy()
    tail-=np.mean(tail,axis=0);tail*=.055/max(np.sqrt(np.mean(tail**2)),1e-9)
    if np.max(np.abs(tail))>.5:tail*=.5/np.max(np.abs(tail))
    t=np.arange(len(tail))/SR;edge=np.minimum(t/.025,1)*np.minimum((len(tail)-np.arange(len(tail)))/SR/.025,1);tail*=edge[:,None]
    result.append(save_asset('workboat-settled-idle',tail,{'type':'DERIVED_EXISTING_FREE_PLAN_SFX','source':str(source.relative_to(R)),'source_sha256':sha(source),'source_metadata':str(source.with_suffix('.mp3.meta.json').relative_to(R)),'operation':{'trim_start_seconds':start/SR,'trim_end_seconds':stop/SR,'dc_remove':True,'rms_normalize':.055,'edge_fade_seconds':.025,'pitch_change':False,'tempo_change':False},'description':'Settled outboard tail only, trimmed after startup; loops in renderer with crossfade. Fictional small workboat approximation, no repeated ignition.','licensing':FREE_LICENSE,'api_calls':0,'credits_used':0}))
    (ASSETS/'asset-manifest.json').write_text(json.dumps({'original_procedural_assets':len(ORIGINALS),'existing_free_plan_derivatives':1,'api_calls':0,'credits_used':0,'field_recordings':False,'assets':result},indent=2)+'\n',encoding='utf8')
    return result

def timing(path):
    e=json.loads(path.read_text(encoding='utf-8-sig'));a=path.parent/(path.stem+'-audio')
    if not (a/'alignment.json').exists():return e,[i*7 for i in range(9)],'PLANNED_NO_CURRENT_VOICE'
    alignment=json.loads((a/'alignment.json').read_text(encoding='utf-8-sig'))['alignment'];provenance=json.loads((a/'provenance.json').read_text(encoding='utf-8-sig'))
    text=''.join(alignment['characters']);starts=alignment['character_start_times_seconds'];ends=alignment['character_end_times_seconds']
    if text!=e['script'] or provenance['request']['text']!=text or provenance['voice_id']!=e['voice']['id']:raise RuntimeError('Refusing cue assignment against stale narration: '+str(path))
    if len(text)!=len(starts) or len(text)!=len(ends) or not text:raise RuntimeError('Incomplete alignment')
    if any(not math.isfinite(x) or x<0 for x in starts+ends):raise RuntimeError('Invalid alignment times')
    if any(x>y for x,y in zip(starts,ends)) or any(x>y for x,y in zip(starts,starts[1:])) or any(x>y for x,y in zip(ends,ends[1:])):raise RuntimeError('Nonmonotonic alignment')
    duration=edit_duration(ends[-1]);bounds=[0];pos=0
    for i,s in enumerate(e['scenes']):
        if text[pos:pos+len(s['narration'])]!=s['narration']:raise RuntimeError('Scene narration mismatch')
        pos+=len(s['narration'])
        if i<7:bounds.append(.35+(ends[pos-1]+starts[pos+1])/2);pos+=1
    bounds.append(duration)
    return e,bounds,'MEASURED_CURRENT_NARRATION'

def build_cues(key,bounds):
    cues=[];root=str(ASSETS.relative_to(R)).replace('\\','/')
    def cue(name,index,rms=.006,duration=None,loop=False,kind='sfx',offset=.15,lowpass=None,reason=''):
        if duration is None:duration=bounds[index+1]-bounds[index]-offset
        source=root+'/'+name+'.wav';licensing=FREE_LICENSE if name=='workboat-settled-idle' else ORIGINAL_LICENSE
        if name in ('rain','paper','zipper'):
            source='audio/sfx/'+name+'.mp3';licensing=FREE_LICENSE
        if name=='water':source='production/week-01/day-01/w01-d01-e02-audio/water.mp3';licensing=FREE_LICENSE
        d={'source':source,'scene_index':index,'rms':rms,'duration':round(duration,6),'loop':loop,'kind':kind,'offset':offset,'licensing':licensing,'source_provenance':source+'.meta.json','purpose':reason}
        if lowpass is not None:d['lowpass_hz']=lowpass
        cue_geometry(d,bounds,bounds[-1]);cues.append(d)
    def bed(name,index,rms,lowpass=None,reason=''):
        cue(name,index,rms,duration=bounds[index+1]-bounds[index],loop=True,kind='ambience',offset=0,lowpass=lowpass,reason=reason)
    def rain(index,exterior=False,rms=None):bed('rain',index,rms or (.005 if exterior else .003),None if exterior else 1700,'Open exterior rain' if exterior else 'Enclosed/sheltered rain low-passed for viewpoint')
    if key=='03':
        for i in range(8):rain(i,i in (5,6),.004 if i in (5,6) else .0025)
        cue('metal-rattle',0,.008,1.0,reason='Jammed cash drawer rattle')
        cue('metal-rattle',1,.005,.45,offset=.65,reason='Crowbar touching steel desk')
        cue('metal-rattle',2,.006,.3,reason='Caster brake release')
        cue('caster-roll',2,.005,1.2,offset=.55,reason='Brief established earlier wheel movement')
        bed('caster-roll',3,.007,1200,'Four desk casters moving along corridor')
        cue('gate-motor',4,.005,2.4,reason='Freight lift door motor strain, electric not engine')
        cue('metal-rattle',4,.007,.65,offset=1.0,reason='Crowbar wedge and caster threshold clunk')
        cue('drawer-slide',5,.006,1.2,reason='Desktop scrapes van rubber seal')
        cue('petrol-van-steady',6,.006,min(3.,bounds[7]-bounds[6]-.15),reason='Distant correctly-classed petrol van departure')
        cue('drawer-slide',7,.005,1.1,reason='Drawer opens an hour later')
        cue('paper',7,.004,.5,offset=1.5,reason='Visible cash bundle handling')
    elif key=='04':
        for i in range(8):rain(i,i in (5,6))
        cue('paper',0,.006,.65,reason='Newspaper bag reveal')
        for i in (0,1):bed('shutter-roll',i,.005,2400,'Rolling warehouse shutter descending')
        cue('caster-roll',2,.006,2.,reason='Tire dolly wheels on concrete')
        cue('metal-rattle',3,.007,.55,offset=.6,lowpass=900,reason='Loaded tire lands on metal dolly cradle')
        cue('metal-rattle',4,.009,1.25,reason='Shutter arrested by supported dolly handle')
        cue('drawer-slide',5,.005,1.3,lowpass=850,reason='Low friction of tire/fabric dragging through gap')
        cue('petrol-van-steady',6,.006,min(3.,bounds[7]-bounds[6]-.15),reason='Departing blue getaway van, no boat sound')
        cue('paper',7,.004,.7,offset=.55,reason='Visible recovered banknotes counted')
    elif key=='05':
        for i in range(8):rain(i,i>=4,.003 if i<4 else .005)
        bed('wet-brush',0,.005,2800,'Wash machinery as coupe enters')
        cue('petrol-car-pass',1,.006,2.,lowpass=1400,reason='Following petrol sedan, enclosed wash perspective')
        for i in (2,3):bed('wet-brush',i,.008,3800,'Close wet car-wash brush friction; restrained procedural preview')
        bed('wet-brush',4,.003,1100,'Brush wash recedes/muffles as pair exits through staff door')
        cue('metal-rattle',5,.005,.75,reason='Scooter chain confirms it is locked')
        cue('caster-roll',5,.006,1.3,offset=1.,reason='Delivery trolley moved beside locked scooter')
        bed('caster-roll',6,.008,1000,'Grounded four-wheel trolley rolls downhill')
        cue('zipper',7,.005,.65,reason='Jason checks zipped jacket diamond pouch')
    elif key=='06':
        for i in range(8):
            rain(i,True,.0025 if i==5 else .004)
            bed('water',i,.0035 if i==5 else .0045,1500 if i==5 else None,'Canal hull water; bridge shelter/dark reflection in scene6' if i==5 else 'Small workboat hull water at slow travel')
            bed('workboat-settled-idle',i,.005 if i in (3,4,5) else .006,1700 if i==5 else 2600,'Steady small outboard, trim excludes ignition, continuous loop only')
        cue('metal-rattle',2,.004,.45,reason='Visible brace tapped by foot/hand')
        cue('light-mast-hinge',4,.006,1.6,offset=.3,reason='Brace release and controlled short mast lowering')
        cue('light-mast-hinge',5,.004,.6,offset=1.,lowpass=1800,reason='Brief light mast contact, no crushing cabin effect')
        cue('light-mast-hinge',7,.004,.75,reason='Light mast seats in aft cradle')
    elif key=='07':
        for i in range(8):rain(i,False,.0025)
        cue('metal-rattle',0,.007,.6,reason='Gate closes on visible frame')
        for i in (0,2,3,4,5,6,7):bed('petrol-van-steady',i,.004,1300,'Inside van petrol idle/low travel; no boat or truck recording')
        cue('private-line-texture',3,.0025,1.3,reason='Private phone line hiss only; no vibration/ringtone/extra voice')
        cue('pa-speaker-texture',4,.003,1.5,lowpass=2800,reason='Short narrowband PA texture under narrated replay, no generated Fixer speech')
        cue('metal-rattle',5,.003,.2,reason='Guard visible gate-release switch click')
        cue('gate-motor',6,.007,min(3.5,bounds[7]-bounds[6]-.15),reason='Visible electric sliding-gate motor opens escape route')
    else:raise ValueError('Unknown episode cue recipe')
    return cues

def assign():
    records=[]
    for path in sorted((BATCH/'2026-11-17').glob('0[3-7]-*.json')):
        episode,bounds,status=timing(path);cues=build_cues(path.name[:2],bounds)
        for cue in cues:
            if not (R/cue['source']).exists():raise RuntimeError('Missing assigned asset '+cue['source'])
        episode['audio_cues']=cues
        path.write_text(json.dumps(episode,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        records.append({'episode':str(path.relative_to(R)),'timing_status':status,'duration_seconds':bounds[-1],'scene_boundaries':bounds,'script_sha256':hashlib.sha256(episode['script'].encode()).hexdigest(),'cue_count':len(cues),'cues':cues,'release':'PRIVATE REVIEW; no commercial clearance inferred'})
    ASSETS.mkdir(parents=True,exist_ok=True)
    report=ASSETS/'assignment-manifest.json';report.write_text(json.dumps({'episodes':records,'api_calls':0,'credits_used':0,'changed_episode_fields':['audio_cues'],'timing_note':'Measured current character alignment when present; 56-second planned scene bins for blocked episode07. Rerun --assign-only after current narration arrives.','mix_note':'All RMS targets are pre-ducking. Renderer ducks beneath centered Liam; listening review remains pending.','no_field_recordings':True},indent=2)+'\n',encoding='utf8')
    print(report)
    for record in records:print(Path(record['episode']).name,record['timing_status'],record['duration_seconds'],record['cue_count'])
    return records
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--assign-only',action='store_true');args=parser.parse_args()
    if not args.assign_only:generate_assets()
    assign()
