"""Verify/resume a completed batch assembly without re-encoding any scenes.
Usage: python verify_batch_export.py EPISODE.json [--candidate review-complete.mp4] [--promote]
All decoding and measurements are local. This verifies technical properties, not visual/listening approval or licensing.
"""
from pathlib import Path
import argparse,hashlib,json,math,re,subprocess
from render_batch import edit_duration

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def logged(command,log):
    with log.open('wb') as err:
        q=subprocess.run(command,stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=err)
    if q.returncode:raise RuntimeError(f'Check failed; see {log}')
    return q.stdout

def verify(episode,candidate=None,promote=False):
    p=Path(episode).resolve();e=json.loads(p.read_text(encoding='utf-8-sig'));out=p.parent/(p.stem+'-review');a=p.parent/(p.stem+'-audio');art=p.parent/(p.stem+'-art')
    media=(out/(candidate or 'review.mp4')).resolve()
    if media.parent!=out.resolve() or not media.is_file():raise ValueError('Candidate must exist inside episode review directory')
    script=' '.join(s['narration'] for s in e['scenes'])
    if script!=e['script'] or len(e['scenes'])!=8:raise ValueError('Current locked eight-scene script mismatch')
    prov=json.loads((a/'provenance.json').read_text(encoding='utf-8-sig'));al=json.loads((a/'alignment.json').read_text(encoding='utf-8-sig'))['alignment']
    if prov['request']['text']!=script or ''.join(al['characters'])!=script or prov['voice_id']!=e['voice']['id']:raise ValueError('Current voice provenance/alignment mismatch')
    if digest(out/'voice-dry-original.mp3')!=digest(a/'liam-private-preview.mp3'):raise ValueError('Assembly dry voice differs from current source')
    meta=json.loads((out/'narration-metadata.json').read_text(encoding='utf8'))
    if meta['script']!=script:raise ValueError('Assembly narration metadata is stale')
    timeline=json.loads((out/'measured-timeline.json').read_text(encoding='utf8'));D=edit_duration(al['character_end_times_seconds'][-1])
    if timeline['duration']!=D or len(timeline['boundaries'])!=9:raise ValueError('Assembly measured timeline mismatch')
    frames=[art/f'{i:02}.png' for i in range(1,9)]
    if not all(f.is_file() for f in frames):raise ValueError('Current eight artwork inputs missing')
    probe=json.loads(logged(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(media)],out/'verify-probe-errors.log'))
    video=next((s for s in probe['streams'] if s['codec_type']=='video'),None);audio=next((s for s in probe['streams'] if s['codec_type']=='audio'),None);duration=float(probe['format']['duration'])
    if video is None or (video['width'],video['height'],video['avg_frame_rate'])!=(1080,1920,'30/1'):raise ValueError('Geometry/frame-rate check failed')
    if audio is None or not 50<=duration<=60.1 or abs(duration-D)>.1:raise ValueError('Audio/duration check failed')
    if int(video.get('nb_frames',D*30))!=D*30:raise ValueError('Unexpected frame count')
    logged(['ffmpeg','-nostdin','-v','error','-i',str(media),'-map','0:v:0','-map','0:a:0','-f','null','-'],out/'verify-decode-errors.log')
    logged(['ffmpeg','-nostdin','-hide_banner','-i',str(media),'-map','0:a:0','-vn','-af','ebur128=peak=true','-f','null','-'],out/'loudness-report.txt')
    text=(out/'loudness-report.txt').read_text(encoding='utf8',errors='replace');peaks=re.findall(r'Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS',text);lufs=re.findall(r'I:\s*(-?\d+(?:\.\d+)?)\s*LUFS',text)
    if not peaks or not lufs:raise ValueError('Missing exported loudness/peak measurement')
    peak=float(peaks[-1]);integrated=float(lufs[-1])
    if peak>-1:raise ValueError(f'True peak {peak} exceeds -1dB ceiling')
    preserved=None;final=media
    if promote and media.name!='review.mp4':
        final=out/'review.mp4'
        if final.exists():
            preserved=out/'review-incomplete.mp4'
            if preserved.exists():raise ValueError('Preservation destination already exists; refusing overwrite')
            final.rename(preserved)
        media.rename(final)
    speech_end=al['character_end_times_seconds'][-1]+.35
    report={'full_decode':'passed','media':probe,'licensing':'PRIVATE REVIEW ONLY. Free-plan voice/SFX commercial clearance not established; see source provenance and docs/RELEASE_STATUS.md','visual_and_listening_review':'pending full playback; generated frames require review','music':'original synthesized score; not Eleven Music','frame_model':'not inferred; see artwork provenance','episode_id':e['id'],'title':e['title'],'narration_sha256':hashlib.sha256(script.encode()).hexdigest(),'speech_end_seconds':speech_end,'expected_duration_seconds':D,'measured_duration_seconds':duration,'final_tail_seconds':D-speech_end,'portrait_geometry':'1080x1920 at 30fps verified','true_peak_dbfs':peak,'integrated_lufs':integrated,'source_audio_sha256':digest(a/'liam-private-preview.mp3'),'verified_export_sha256':digest(final),'verified_export_path':str(final),'preserved_interrupted_export':str(preserved) if preserved else None,'verification_method':'Completed assembly verified without re-encoding any scenes; full decode and exported audio measurement'}
    (out/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
    status={'script':'current locked script matched','artwork':'eight current inputs present; visual approval not inferred','audio':'current source matches assembly dry original, script and voice provenance; native cadence unchanged','mix':'rendered; human listening pending','video':'rendered; full decode/geometry/frame count/duration/true peak checked','release':'PRIVATE REVIEW ONLY; commercial clearance not inferred','published':False,'source_json':str(p),'final_mix_gain':None,'final_mix_gain_note':'Not inferred by post-assembly verifier; existing mix.wav preserved','source_frame_sha256':{x.name:digest(x) for x in frames},'resume_note':'Interrupted assembly preserved when promoting verified complete assembly; no causal claim about interruption'}
    (out/'render-status.json').write_text(json.dumps(status,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'path':str(final),'duration':duration,'frames':video.get('nb_frames'),'peak_dbfs':peak,'integrated_lufs':integrated,'full_decode':'passed','preserved':str(preserved) if preserved else None}),flush=True)
    return report
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('episode');parser.add_argument('--candidate');parser.add_argument('--promote',action='store_true');args=parser.parse_args();verify(args.episode,args.candidate,args.promote)
