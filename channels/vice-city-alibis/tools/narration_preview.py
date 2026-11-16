"""Private review narration. Supply credential through stdin, never a project file."""
import sys,json,urllib.request,urllib.error,base64,subprocess
from pathlib import Path
key=sys.stdin.readline().strip()
if not key: raise SystemExit('No credential supplied')
R=Path(__file__).resolve().parents[1]
roster=json.loads((R/'audio/voice-roster.json').read_text())
for arg in sys.argv[1:]:
    p=Path(arg); e=json.loads(p.read_text(encoding='utf-8-sig')); out=p.parent/(p.stem+'-audio');out.mkdir(exist_ok=True)
    voice=roster['voices'][0]
    payload={'text':e['script'],'model_id':roster['model'],'voice_settings':roster['settings']}
    req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice['id']+'/with-timestamps',data=json.dumps(payload).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=180) as r:
            data=json.load(r);headers={k:v for k,v in r.headers.items() if k.lower() in ('request-id','history-item-id','character-cost')}
        audio=out/'liam-private-preview.mp3';audio.write_bytes(base64.b64decode(data.pop('audio_base64')))
        (out/'alignment.json').write_text(json.dumps(data),encoding='utf-8')
        q=subprocess.run(['ffprobe','-v','quiet','-show_entries','format=duration','-of','csv=p=0',str(audio)],capture_output=True,text=True)
        duration=float(q.stdout.strip()) if q.returncode==0 else None
        meta={'voice':voice['name'],'voice_id':voice['id'],'request':payload,'response':headers,'duration_seconds':duration,'licensing':'free-plan private review; not commercially cleared','postprocessing':'none','status':'listen and retime before video edit'}
        (out/'provenance.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
        print(json.dumps({'episode':e['title'],'saved':str(audio),'seconds':duration}),flush=True)
    except urllib.error.HTTPError as err:
        detail=err.read().decode().replace(key,'[REDACTED]')[:800]
        (out/'generation-status.json').write_text(json.dumps({'error':err.code,'detail':detail}),encoding='utf-8')
        print(json.dumps({'episode':e['title'],'error':err.code,'detail':detail}),flush=True)
    except Exception as err:
        print(json.dumps({'episode':e['title'],'error':str(err).replace(key,'[REDACTED]')}),flush=True)
key=''
