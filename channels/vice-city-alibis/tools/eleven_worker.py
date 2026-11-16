"""ElevenLabs worker. First stdin line is the key; it is never written to disk."""
import sys,json,urllib.request,urllib.error,base64
from pathlib import Path
key=sys.stdin.readline().strip()
if not key: raise SystemExit('No credential supplied')
print('READY',flush=True)
for line in sys.stdin:
    try:
        c=json.loads(line)
        action=c['action']
        if action=='exit': break
        endpoint=c['endpoint']
        payload=c.get('payload')
        req=urllib.request.Request('https://api.elevenlabs.io'+endpoint,
            data=json.dumps(payload).encode() if payload else None,
            headers={'xi-api-key':key,'Content-Type':'application/json'})
        with urllib.request.urlopen(req,timeout=180) as r:
            headers={k:v for k,v in r.headers.items() if k.lower() in ['request-id','history-item-id','song-id','character-cost','content-type']}
            if action=='binary':
                p=Path(c['output']);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(r.read())
                p.with_suffix(p.suffix+'.meta.json').write_text(json.dumps({'endpoint':endpoint,'request':payload,'response_headers':headers},indent=2))
                print(json.dumps({'saved':str(p),'bytes':p.stat().st_size,'headers':headers}),flush=True)
                continue
            data=json.load(r)
        if action=='voices':
            print(json.dumps({'voices':[{'id':v['voice_id'],'name':v['name'],'labels':v.get('labels'),'category':v.get('category'),'description':v.get('description')} for v in data['voices']]}),flush=True)
        elif action=='models':
            print(json.dumps({'models':[{'id':v.get('model_id'),'name':v.get('name'),'tts':v.get('can_do_text_to_speech')} for v in data]}),flush=True)
        elif action=='tts':
            p=Path(c['output']);p.parent.mkdir(parents=True,exist_ok=True)
            p.with_suffix('.mp3').write_bytes(base64.b64decode(data.pop('audio_base64')))
            p.with_suffix('.json').write_text(json.dumps(data))
            print(json.dumps({'saved':str(p),'alignment':bool(data.get('alignment'))}),flush=True)
        elif action=='voice':
            print(json.dumps({'voice_id':data.get('voice_id'),'name':data.get('name'),'category':data.get('category'),'description':data.get('description'),'labels':data.get('labels'),'available_for_tiers':data.get('available_for_tiers')}),flush=True)
        elif action=='subscription':
            print(json.dumps({k:data.get(k) for k in ['tier','character_count','character_limit','can_use_instant_voice_cloning','currency']}),flush=True)
    except urllib.error.HTTPError as e:
        print(json.dumps({'error':e.code,'detail':e.read().decode().replace(key,'[REDACTED]')[:700]}),flush=True)
    except Exception as e: print(json.dumps({'error':type(e).__name__,'detail':str(e).replace(key,'[REDACTED]')[:300]}),flush=True)
key=''
