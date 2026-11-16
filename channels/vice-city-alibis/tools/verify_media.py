from pathlib import Path
import json,subprocess,re,numpy as np
R=Path(__file__).resolve().parents[1]
P=R/'tests/pilot-v3/vice-city-alibis-sound-test-v3.mp4'
def cmd(args):return subprocess.check_output(args)
def pcm(p):return np.frombuffer(cmd(['ffmpeg','-v','error','-i',str(p),'-ar','48000','-ac','2','-f','f32le','-']),dtype='<f4').reshape(-1,2)
def vh(p):return cmd(['ffmpeg','-v','error','-i',str(p),'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).decode().strip()
meta=json.loads(cmd(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration,size','-of','json',str(P)]))
subprocess.run(['ffmpeg','-v','error','-i',str(P),'-f','null','-'],check=True)
unchanged=vh(P)==vh(R/'tests/pilot-v2/gta6-pilot-v2-male-liam.mp4')
q=subprocess.run(['ffmpeg','-hide_banner','-i',str(P),'-af','volumedetect','-vn','-f','null','-'],capture_output=True,check=True)
log=q.stderr.decode();levels={k:re.search(k+r': ([^\n]+)',log).group(1) for k in ['mean_volume','max_volume']}
voice=pcm(R/'audio/stems/narration.wav'); beds=[pcm(R/'audio/stems'/f) for f in ['music-ducked.wav','ambience.wav','effects.wav']]
n=min(len(voice),*[len(b) for b in beds]);voice=voice[:n];bg=sum(b[:n] for b in beds)
m=[]
for i in range(0,n-24000,24000):
    v=np.sqrt(np.mean(voice[i:i+24000]**2));b=np.sqrt(np.mean(bg[i:i+24000]**2))
    if v>.035:m.append(20*np.log10(v/max(b,1e-8)))
median=float(np.median(m));p5=float(np.percentile(m,5));foreground=median>=12 and p5>=6
report={'media':meta,'full_decode':'passed','video_stream_matches_approved_v2':unchanged,'audio_levels':levels,'speech_over_background_db':{'median':median,'fifth_percentile':p5},'foreground_level_check':foreground,'listening_approval':'pending user review'}
(R/'tests/pilot-v3/verification.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
assert unchanged and foreground
