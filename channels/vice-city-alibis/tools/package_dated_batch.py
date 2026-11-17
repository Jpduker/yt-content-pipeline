"""Package only the new dated batch. Offline: no generation, upload or legacy edits."""
from pathlib import Path
import argparse, collections, datetime, hashlib, html, json, os, re, shutil, subprocess
CHANNEL = Path(__file__).resolve().parents[1]
DEFAULT = CHANNEL / 'production/batch-2026-11-17'
EXPECTED = {'2026-11-17': 5, '2026-11-18': 7, '2026-11-19': 7, '2026-11-20': 7}
AUTHOR_MARKER = '<!-- PRESERVED AUTHOR UPLOAD COPY -->'
MANAGED_MARKER = '<!-- GENERATED DATED BATCH UPLOAD COPY -->'

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def write(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')

def discover(batch):
    for day in sorted(batch.iterdir()):
        if not day.is_dir() or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', day.name):
            continue
        for path in sorted(day.glob('*.json')):
            episode = read(path)
            if isinstance(episode, dict) and all(k in episode for k in ('id', 'title', 'script', 'scenes')):
                yield path, episode

def media_status(path, episode):
    audio = path.parent / (path.stem+'-audio')
    review = path.parent / (path.stem+'-review')
    provenance = audio/'provenance.json'
    audio_files = [p for p in audio.glob('*') if p.suffix.lower() in ('.mp3','.wav','.m4a','.flac') and p.stat().st_size]
    # Individual rendered shots are intermediates, not an assembled review video.
    # Only the promoted export is a review deliverable; interrupted backups stay local.
    videos = [review/'review.mp4'] if (review/'review.mp4').is_file() and (review/'review.mp4').stat().st_size else []
    direct_video = path.with_suffix('.mp4')
    if direct_video.is_file() and direct_video.stat().st_size:
        videos.append(direct_video)
    result = {'status':'PLANNED', 'audio_exists':bool(audio_files), 'mp4_exists':bool(videos),
              'audio_matches_current_script_and_voice':False, 'verification_checked':False,
              'human_approved':False, 'published':False, 'measured_video_duration_seconds':None}
    problems=[]
    if provenance.is_file():
        try:
            prov=read(provenance); request=prov.get('request',{}); voice=episode.get('voice',{})
            if request.get('text') != episode['script']: problems.append('narration text differs from current episode')
            if prov.get('voice_id') != voice.get('id'): problems.append('voice ID mismatch')
            if request.get('model_id') != voice.get('model'): problems.append('voice model mismatch')
            if request.get('voice_settings') != voice.get('settings'): problems.append('voice settings mismatch')
            result['audio_duration_seconds']=prov.get('duration_seconds')
            result['audio_matches_current_script_and_voice']=not problems
        except (ValueError,TypeError):
            problems.append('unreadable audio provenance')
    elif audio_files or videos:
        problems.append('no audio provenance to bind media to current script')
    result['media_issues']=problems
    if problems and (audio_files or videos):
        result['status']='STALE_AUDIO' if provenance.is_file() else 'MEDIA_PROVENANCE_MISSING'
    elif videos:
        result['status']='VIDEO_PREVIEW_UNVERIFIED'
        verification=review/'verification.json'
        if verification.is_file() and provenance.is_file() and result['audio_matches_current_script_and_voice']:
            try:
                v=read(verification); streams=v.get('media',{}).get('streams',[])
                portrait=any(s.get('codec_type')=='video' and s.get('width')==1080 and s.get('height')==1920 for s in streams)
                current_hash=hashlib.sha256(episode['script'].encode()).hexdigest()
                source_matches=v.get('narration_sha256')==current_hash and v.get('episode_id')==episode.get('id')
                checks=v.get('full_decode')=='passed' and portrait and source_matches
                fresh=all(verification.stat().st_mtime>=p.stat().st_mtime>=provenance.stat().st_mtime for p in videos)
                result['verification_checked']=checks and fresh
                if result['verification_checked']: result['status']='VIDEO_PREVIEW_CHECKED'
            except (ValueError,TypeError):
                result['media_issues'].append('unreadable video verification')
    elif audio_files and result['audio_matches_current_script_and_voice']:
        result['status']='AUDIO_PREVIEW'
    elif (audio/'generation-status.json').is_file():
        try:
            failure=read(audio/'generation-status.json')
            if failure.get('error'):
                result['status']='AUDIO_GENERATION_BLOCKED'
                result['media_issues'].append('audio generation failed; see local generation-status.json')
        except (ValueError,TypeError):
            result['media_issues'].append('unreadable generation status')
    result['audio_paths']=[p.relative_to(path.parent).as_posix() for p in audio_files]
    result['video_paths']=[p.relative_to(path.parent).as_posix() for p in videos]
    if videos and shutil.which('ffprobe'):
        # Measure the actual assembled file; planned timing is never substituted here.
        try:
            probe=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','json',str(videos[0])],capture_output=True,text=True,timeout=20)
            if probe.returncode==0:
                result['measured_video_duration_seconds']=float(json.loads(probe.stdout)['format']['duration'])
        except (ValueError,KeyError,subprocess.TimeoutExpired):
            pass
    runtime=result['measured_video_duration_seconds']
    if runtime is not None and not 50<=runtime<=60.1 and result['status'].startswith('VIDEO_'):
        result['status']='VIDEO_INCOMPLETE_OR_OUT_OF_RANGE'
        result['verification_checked']=False
        result['media_issues'].append('measured video duration is outside 50–60 seconds; may be an unfinished render')
    thumbs=[path.parent/'thumbnails'/(path.stem+suffix) for suffix in ('.jpg','.jpeg')]
    thumbs += [path.parent/(path.stem+'-thumbnail.jpg'),review/'thumbnail.jpg',path.parent/(path.stem+'-art')/'thumbnail.jpg']
    if episode.get('thumbnail_path'):
        candidate=(path.parent/episode['thumbnail_path']).resolve()
        if candidate.is_relative_to(path.parent.resolve()) and candidate.suffix.lower() in ('.jpg','.jpeg'):
            thumbs.append(candidate)
    result['thumbnail_paths']=list(dict.fromkeys(os.path.relpath(p,path.parent).replace('\\','/') for p in thumbs if p.is_file() and p.stat().st_size))
    return result

def references(value):
    if isinstance(value,dict):
        for key,item in value.items():
            if key in ('references','reference_paths','source_asset_paths') and isinstance(item,list):
                yield from (v for v in item if isinstance(v,str))
            else: yield from references(item)
    elif isinstance(value,list):
        for item in value: yield from references(item)

def validate(path, episode):
    errors=[]; scenes=episode['scenes']
    if episode.get('date') != path.parent.name: errors.append('episode date differs from folder')
    if len(scenes)!=8: errors.append('requires eight scenes')
    if ' '.join(s.get('narration','') for s in scenes)!=episode['script']: errors.append('exact narration concatenation differs from script')
    cursor=0
    for i,s in enumerate(scenes,1):
        if s.get('start')!=cursor or not isinstance(s.get('end'),(int,float)) or s['end']<=s.get('start',0): errors.append(f'shot {i}: timing discontinuity')
        cursor=s.get('end')
    if not isinstance(cursor,(int,float)) or not 50<=cursor<=60 or cursor!=episode.get('duration_seconds'): errors.append('planned duration must match scene end and be 50–60 seconds')
    words=len(re.findall(r"\b[\w]+(?:['’-][\w]+)*\b",episode['script']))
    if not 120<=words<=135: errors.append(f'spoken word count {words} outside 120–135')
    refs=set(references(episode))
    if not refs: errors.append('no existing reference paths')
    for reference in sorted(refs):
        target=(CHANNEL/reference).resolve()
        if not target.is_relative_to(CHANNEL.resolve()) or not target.is_file(): errors.append('missing/invalid reference: '+reference)
    tags=episode.get('tags',[]); tags=', '.join(tags) if isinstance(tags,list) else str(tags)
    if len(tags)>=500: errors.append('tags must be under 500 characters')
    if len(re.findall(r'(?<!\w)#[\w]+',episode.get('description','')))!=3: errors.append('description must contain exactly three hashtags')
    return errors,words

def esc(value):
    return html.escape(str(value))

def shell(title, body):
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>body{font:16px/1.55 system-ui;background:#101520;color:#eee;margin:auto;max-width:1250px;padding:24px}a{color:#7fe5df}h1,h2,h3{line-height:1.2}.notice{background:#263044;padding:18px;border-left:4px solid #ef94ce}.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}.shot{background:#1d2635;padding:16px;border-radius:12px}.portrait{aspect-ratio:9/16;overflow:auto;background:linear-gradient(160deg,#243c4a,#38233f);padding:16px;font-size:13px}.speech{font-size:15px}.episode{margin:50px 0}summary{cursor:pointer}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}.badge{color:#fbc2e1}table{border-collapse:collapse}td,th{padding:8px;border:1px solid #536078}</style><body>'+body+'</body></html>'

def episode_html(record, episode, prefix=''):
    parts=[]
    for i,s in enumerate(episode['scenes'],1):
        detail={k:v for k,v in s.items() if k not in ('start','end','narration','visual_prompt','on_screen_text')}
        parts.append(f'<section class="shot"><div class="portrait"><b>SHOT {i} · {s["start"]}–{s["end"]}s</b><p>{esc(s["visual_prompt"])}</p><b>{esc(s.get("on_screen_text",""))}</b></div><p class="speech">{esc(s["narration"])}</p><details><summary>Camera, sound and continuity</summary><pre>{esc(json.dumps(detail,indent=2,ensure_ascii=False))}</pre></details></section>')
    media=record['media'];links=''
    if media.get('measured_video_duration_seconds') is not None:
        links+=f'<p>Measured assembled video: {media["measured_video_duration_seconds"]:.3f} seconds.</p>'
    for path in media.get('video_paths',[]):
        links+=f'<p><a href="{esc(prefix+path)}">Local review MP4</a></p>'
    for path in media.get('thumbnail_paths',[]):
        links+=f'<p><a href="{esc(prefix+path)}">Thumbnail JPG</a><br><img style="max-width:320px;width:100%" src="{esc(prefix+path)}" alt="{esc(episode["title"])} thumbnail"></p>'
    return f'<article class="episode" id="{esc(episode["id"])}"><h2>{esc(episode["title"])}</h2><p>{esc(record["date"])} · {record["words"]} words · {record["planned_seconds"]}s planned · <b class="badge">{esc(media["status"])}</b></p>'+links+f'<p>{esc(episode["script"])}</p><p><a href="{esc(prefix+Path(record["path"]).name)}">Source JSON</a></p><div class="shots">'+''.join(parts)+'</div></article>'

def upload_copy(day, entries):
    header=f'# {day} — upload preparation\n\n'
    if day=='2026-11-17': header+='Two earlier videos were **user-reported posted around 04:00–05:00**. They are not regenerated or counted among these five new plans. This header records the user report, not independent account verification.\n\n'
    header+='These are editorial publishing-order recommendations, not scheduled uploads. Actual local media status appears per item; none is asserted published or finished. All events and scene-specific sets are original noncanon fan fiction. 11.ai attribution remains; commercial audio clearance is separate.\n\n'
    for i,(record,e) in enumerate(entries,1):
        title=e.get('upload_title')
        if not title:
            title=next((v for v in e.get('title_options',[]) if '11.ai' in v), e['title']+' | GTA 6 Fan Fiction | 11.ai')
            title=re.sub(r'Fan Story','Fan Fiction',title,flags=re.I)
        tags=e.get('tags',[]); tags=', '.join(tags) if isinstance(tags,list) else str(tags)
        headline=e.get('thumbnail_headline') or e.get('cover_headline') or e['hook']
        runtime=record['media'].get('measured_video_duration_seconds')
        measured=f'; actual video measured {runtime:.3f} seconds' if runtime is not None else '; assembled video duration not yet measured'
        header+=f'## {i}. {e["title"]}\n\nStatus: **{record["media"]["status"]}** — {record["planned_seconds"]} seconds planned{measured}; no publication claimed.\n\nRecommended title: **{title}**\n\nDescription:\n\n{e.get("description","")}\n\nTags ({len(tags)} characters):\n\n{tags}\n\nThumbnail headline: **{headline}**\n\n'
        for path in record['media'].get('thumbnail_paths',[]): header+=f'Thumbnail JPG: [{Path(path).name}]({path})\n\n'
        for path in record['media'].get('video_paths',[]): header+=f'Local review MP4: [{Path(path).name}]({path})\n\n'
        header+=f'Source: [{Path(record["path"]).name}]({Path(record["path"]).name})\n\n'
    return header

def build(batch):
    episodes=list(discover(batch)); counts=collections.Counter(p.parent.name for p,e in episodes)
    issues=[]; seen_ids=set();seen_titles=set();records=[];byday=collections.defaultdict(list)
    for date,expected in EXPECTED.items():
        if counts[date]!=expected: issues.append(f'{date}: {counts[date]} episodes present, expected {expected}')
    for date in counts:
        if date not in EXPECTED: issues.append(f'unexpected date folder with episodes: {date}')
    for path,e in episodes:
        errors,words=validate(path,e)
        if e['id'] in seen_ids: errors.append('duplicate episode ID')
        title_key=e['title'].casefold().strip()
        if title_key in seen_titles: errors.append('duplicate episode title')
        seen_ids.add(e['id']);seen_titles.add(title_key)
        issues.extend(f'{path.parent.name}/{path.name}: {msg}' for msg in errors)
        record={'id':e['id'],'title':e['title'],'date':path.parent.name,'path':path.relative_to(batch).as_posix(),'words':words,'shots':len(e['scenes']),'planned_seconds':e['duration_seconds'],'media':media_status(path,e),'validation_issues':errors}
        records.append(record);byday[path.parent.name].append((record,e))
    status={'scope':'New dated batch only; excludes earlier posted videos and original 49-story week','episodes_present':len(records),'episodes_expected':26,'per_date':dict(counts),'all_26_plans_present':len(records)==26 and all(counts[d]==v for d,v in EXPECTED.items()),'structural_validation_passed':not issues,'issues':issues,'media_counts':dict(collections.Counter(r['media']['status'] for r in records)),'finished_or_published_claimed':0,'updated_utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    write(batch/'manifest.json',records);write(batch/'status.json',status)
    intro=f'<h1>Vice City Alibis · 17–20 November 2026</h1><p class="notice">{len(records)} / 26 new story plans. Eight portrait shot descriptions per story, not generated final frames. Earlier two videos are user-reported posted around 04:00–05:00 on 17 November and are excluded. Original 49-story week remains separate. Media labels reflect local files; no final approval, publishing or commercial clearance is claimed.</p>'
    intro+='<p>Validation: '+('passed' if not issues else str(len(issues))+' issue(s); partial/invalid batch')+'</p><ul>'+''.join('<li>'+esc(v)+'</li>' for v in issues)+'</ul>'
    body=[]
    for day,entries in sorted(byday.items()):
        daydir=batch/day;write(daydir/'manifest.json',[r for r,e in entries]);write(daydir/'status.json',{'date':day,'episodes_present':len(entries),'episodes_expected':EXPECTED.get(day),'media_counts':dict(collections.Counter(r['media']['status'] for r,e in entries)),'issues':[v for v in issues if v.startswith(day)]})
        page='<h1>'+day+'</h1><p class="notice">Portrait plans; media status is separate from final approval. <a href="upload.md">Upload copy</a></p>'+''.join(episode_html(r,e) for r,e in entries)
        (daydir/'index.html').write_text(shell(day,page),encoding='utf-8')
        upload=daydir/'upload.md';previous=upload.read_text(encoding='utf-8-sig') if upload.exists() else ''
        if AUTHOR_MARKER in previous:
            author=previous.split(AUTHOR_MARKER,1)[1].lstrip()
        elif previous.startswith(MANAGED_MARKER):
            author=''
        else:
            author=previous
        # Recognize the initial pre-marker output from this tool, never retain it as author copy.
        if author.startswith(f'# {day} — upload preparation') and 'Actual local media status appears per item' in author:
            author=''
        # Retain the author's curated order when every source is linked in their copy.
        positions={}
        for r,e in entries:
            position=author.find(Path(r['path']).name)
            if position<0 and e.get('upload_title'):
                position=author.find(e['upload_title'])
            positions[r['id']]=position
        upload_entries=sorted(entries,key=lambda pair:positions[pair[0]['id']]) if entries and all(v>=0 for v in positions.values()) else entries
        generated=MANAGED_MARKER+'\n\n'+upload_copy(day,upload_entries)
        if author: generated+='\n'+AUTHOR_MARKER+'\n\n'+author
        upload.write_text(generated,encoding='utf-8')
        body.extend(episode_html(r,e,day+'/') for r,e in entries)
    (batch/'index.html').write_text(shell('Dated crime story batch',intro+''.join(body)),encoding='utf-8')
    (batch/'upload.md').write_text('# New dated batch — upload preparation\n\n'+ '\n'.join(f'- [{d}: {counts[d]} new story plans]({d}/upload.md)' for d in sorted(EXPECTED))+'\n\nEarlier two videos: user-reported posted around 04:00–05:00 on 17 November; excluded from the 26 new plans. No upload or scheduling performed. See status.json for current media evidence.\n',encoding='utf-8')
    return status

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--batch',type=Path,default=DEFAULT);args=parser.parse_args()
    status=build(args.batch.resolve());print(json.dumps(status,indent=2));return 0 if status['structural_validation_passed'] else 1

if __name__=='__main__': raise SystemExit(main())
