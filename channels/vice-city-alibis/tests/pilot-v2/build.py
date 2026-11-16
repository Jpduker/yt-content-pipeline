"""Render the same illustrated story with two native ElevenLabs narrators."""
from pathlib import Path
import json,re,subprocess,math,wave
import numpy as np
ROOT=Path(__file__).resolve().parent; A=ROOT/'assets'; O=ROOT/'output'

def run(cmd):
    result=subprocess.run(cmd,cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    if result.returncode: raise RuntimeError(result.stderr.decode()[-3000:])
def duration(p):
    return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p)]))
def stamp(t,ass=False):
    h=int(t//3600);m=int(t//60)%60;s=t%60
    return f'{h}:{m:02d}:{s:05.2f}' if ass else f'{h:02d}:{m:02d}:{s:06.3f}'.replace('.',',')

def render(voice):
    a=json.loads((A/f'{voice}.json').read_text())['alignment']
    txt=''.join(a['characters']); starts=a['character_start_times_seconds'];ends=a['character_end_times_seconds']
    def at(fragment):return starts[txt.index(fragment)]
    words=[]
    for match in re.finditer(r'\[[^\]]*\]|[^\s]+',txt):
        token=match.group()
        if token.startswith('['):continue
        words.append((starts[match.start()],ends[match.end()-1],token))
    d=duration(A/f'{voice}.mp3')+.5
    groups=[];g=[]
    for w in words:
        if g and (len(g)>=4 or w[0]-g[-1][1]>.22 or re.search(r'[.!?]"?$',g[-1][2])):
            groups.append(g);g=[]
        g.append(w)
    if g:groups.append(g)
    header='''[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,DejaVu Sans,63,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,4,1,2,85,85,295,1
Style: Label,DejaVu Sans,25,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,0,0,0,0,100,100,2,0,1,2,0,8,70,70,95,1
Style: Hook,DejaVu Sans,66,&H0057E6FF,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,4,1,8,70,70,175,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    ass=[header,f'Dialogue: 0,0:00:00.00,{stamp(d,True)},Label,,0,0,0,,UNOFFICIAL GTA VI FAN FICTION\n',
         f'Dialogue: 1,0:00:00.00,{stamp(at("Taken outside"),True)},Hook,,0,0,0,,HER PHOTO.\\NIN THEIR STOLEN CAR.\n']
    srt=[]
    for i,g in enumerate(groups):
        start=g[0][0]; end=min(g[-1][1]+.10,groups[i+1][0][0]-.01 if i+1<len(groups) else d)
        caption=' '.join(w[2] for w in g)
        caption=caption.replace('...','…')
        ass.append(f'Dialogue: 2,{stamp(start,True)},{stamp(end,True)},Caption,,0,0,0,,{caption.upper()}\n')
        srt.append(f'{i+1}\n{stamp(start)} --> {stamp(end)}\n{caption}\n\n')
    (A/f'{voice}.ass').write_text(''.join(ass));(O/f'{voice}.srt').write_text(''.join(srt))
    shots=[('01-opening',0,at('Taken outside')),('02-photo',at('Taken outside'),at('Then their fixer')),
           ('03-phone',at('Then their fixer'),at('Under the seat')),
           ('08-cash',at('Under the seat'),at('and a tracker')),
           ('04-tracker',at('and a tracker'),at('So Lucia')),
           ('05-tow',at('So Lucia'),at('At the docks')),
           ('06-trap',at('At the docks'),at('Across the water')),
           ('07-payoff',at('Across the water'),d)]
    folder=O/voice;folder.mkdir(exist_ok=True)
    concat=[]
    for i,(name,start,end) in enumerate(shots):
        n=round((end-start)*30);p=folder/f'{i:02d}.mp4';source=A/f'{name}.png'
        if not (p.exists() and p.stat().st_mtime>source.stat().st_mtime and abs(duration(p)-n/30)<.05):
            # Tow shot stays uncropped so the corrected wheel geometry remains visible.
            z='1.0' if name=='05-tow' else ('min(1.015+on*0.00024,1.07)' if i%2==0 else 'max(1.07-on*0.00022,1.01)')
            vf=f"scale=1600:2844:force_original_aspect_ratio=increase,crop=1600:2844,zoompan=z='{z}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={n}:s=1080x1920:fps=30,setsar=1,format=yuv420p"
            run(['ffmpeg','-y','-i',str(source),'-vf',vf,'-frames:v',str(n),'-an','-c:v','libx264','-preset','veryfast','-crf','19','-threads','2',str(p)])
        concat.append(f"file '{p.as_posix()}'")
    (folder/'concat.txt').write_text('\n'.join(concat))
    run(['ffmpeg','-y','-f','concat','-safe','0','-i',str(folder/'concat.txt'),'-c','copy',str(folder/'picture.mp4')])
    sr=48000;t=np.arange(math.ceil(d*sr))/sr;rng=np.random.default_rng(6)
    rain=np.convolve(rng.standard_normal(len(t)),np.ones(5)/5,mode='same')*.004
    # Soft environment only: no constant synthetic music drone underneath the voice.
    pulse=.008*np.sin(2*np.pi*52*t)*(np.maximum(0,np.sin(2*np.pi*.72*t))**10)
    bed=rain+pulse
    ring=(t>at('Then their fixer'))&(t<at('Then their fixer')+.65)
    bed+=.012*ring*np.sin(2*np.pi*165*t)*(.5+.5*np.sin(2*np.pi*7*t))
    begin=at('The police');end=at('Across the water')+1
    env=np.clip((t-begin)/.7,0,1)*np.clip((end-t)/1.2,0,1)
    bed+=.012*env*np.sin(2*np.pi*(540*t-100/(2*np.pi*.55)*np.cos(2*np.pi*.55*t)))
    bed*=np.minimum(t/.15,1)*np.clip((d-t)/.5,0,1)
    with wave.open(str(folder/'bed.wav'),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((np.clip(bed,-1,1)*32767).astype('<i2').tobytes())
    out=O/f'gta6-pilot-v2-{voice}.mp4'
    run(['ffmpeg','-y','-i',str(folder/'picture.mp4'),'-i',str(A/f'{voice}.mp3'),'-i',str(folder/'bed.wav'),
         '-filter_complex','[1:a]loudnorm=I=-16:TP=-2:LRA=9,apad=pad_dur=0.5[v];[v][2:a]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.82:level=false[a]',
         '-map','0:v','-map','[a]','-vf',f"ass=assets/{voice}.ass",'-t',str(d),'-c:v','libx264','-preset','fast','-crf','19','-threads','2','-c:a','aac','-b:a','192k','-ar','48000','-pix_fmt','yuv420p','-movflags','+faststart',str(out)])
    print(json.dumps({'voice':voice,'duration':d,'shots':shots,'output':str(out)}),flush=True)

if __name__=='__main__':
    O.mkdir(exist_ok=True)
    for v in ['male-liam','female-laura']:render(v)
