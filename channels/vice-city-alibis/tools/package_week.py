"""Assemble an offline reader and audit authored episode plans. No API calls."""
from pathlib import Path
import json,re,html,datetime,collections,csv,io,textwrap,zipfile
R=Path(__file__).resolve().parents[1]
W=R/'production/week-01'
def esc(v): return html.escape(str(v))
def stamp(seconds):
    ms=round(float(seconds)*1000)
    hour,ms=divmod(ms,3600000);minute,ms=divmod(ms,60000);second,ms=divmod(ms,1000)
    return f'{hour:02d}:{minute:02d}:{second:02d},{ms:03d}'
def estimated_captions(scenes):
    """Readable planning cues from scene windows, never forced-aligned speech claims."""
    cues=[]
    for scene in scenes:
        # Two short wrapped lines per cue. Never add words to the approved script.
        words=scene['narration'].split(); groups=[];current=[]
        for word in words:
            candidate=' '.join(current+[word])
            if current and (len(candidate)>74 or len(textwrap.wrap(candidate,width=40,break_long_words=False,break_on_hyphens=False))>2):
                groups.append(current);current=[]
            current.append(word)
        if current:groups.append(current)
        cursor=float(scene['start']);span=float(scene['end'])-cursor
        total=max(1,len(words))
        for j,group in enumerate(groups):
            end=float(scene['end']) if j==len(groups)-1 else cursor+span*len(group)/total
            lines=textwrap.wrap(' '.join(group),width=40,break_long_words=False,break_on_hyphens=False)
            cues.append(f'{len(cues)+1}\n{stamp(cursor)} --> {stamp(end)}\n'+ '\n'.join(lines)+'\n')
            cursor=end
    return '\n'.join(cues)
def label(value):
    if isinstance(value,dict):return str(value.get('name') or value.get('narrator') or json.dumps(value,ensure_ascii=False))
    if isinstance(value,list):return ' / '.join(label(x) for x in value)
    return str(value or '')
def main():
    records=[]; issues=[]; cards=[]; seen=set()
    for p in sorted(W.glob('day-*/*.json')):
        e=json.loads(p.read_text(encoding='utf-8-sig'))
        if 'scenes' not in e: continue
        scenes=e['scenes']; script=e['script']; words=len(re.findall(r"\b[\w’'-]+\b",script))
        if e['title'] in seen: issues.append(f'{p.name}: duplicate title')
        seen.add(e['title'])
        if len(scenes)!=8: issues.append(f'{p.name}: not eight scenes')
        cursor=0
        for s in scenes:
            if s['start']!=cursor or s['end']<=s['start']: issues.append(f'{p.name}: timing discontinuity')
            cursor=s['end']
        if cursor!=56: issues.append(f'{p.name}: duration {cursor}')
        norm=lambda v: re.sub(r'\s+',' ',v).strip()
        if norm(' '.join(s['narration'] for s in scenes))!=norm(script): issues.append(f'{p.name}: script/scene mismatch')
        if not 120<=words<=140: issues.append(f'{p.name}: word count {words}')
        day=int(re.search(r'day-(\d+)',str(p)).group(1)); date=datetime.date(2026,11,15)+datetime.timedelta(days=day)
        narration=p.with_suffix('.narration.txt');captions=p.with_suffix('.estimated.srt')
        narration.write_text(script+'\n',encoding='utf-8')
        captions.write_text(estimated_captions(scenes),encoding='utf-8')
        episode_order=int(re.search(r'[Ee](\d+)$',e['id']).group(1))
        records.append({'id':e['id'],'day':day,'episode_order':episode_order,'date':str(date),'title':e['title'],'voice':label(e.get('voice')),'timeline':label(e.get('timeline')),'pov':label(e.get('pov')),'delivery':label(e.get('delivery')),'words':words,'planned_seconds':56,'path':p.relative_to(W).as_posix(),'narration_path':narration.relative_to(W).as_posix(),'estimated_srt_path':captions.relative_to(W).as_posix(),'caption_status':'ESTIMATED scene-based timings; final audio alignment required','status':'script and shot plan; final artwork/audio/video pending'})
        shots=[]
        for n,s in enumerate(scenes,1):
            detail=''.join(f'<details><summary>{esc(k.replace("_"," "))}</summary><p>{esc(v)}</p></details>' for k,v in s.items() if k not in ('start','end','narration'))
            shots.append(f'<section class="shot"><div class="portrait"><small>SHOT {n} · {s["start"]}–{s["end"]}s</small><p>{esc(s["visual_prompt"])}</p><b>{esc(s.get("on_screen_text",""))}</b></div><p class="speech">{esc(s["narration"])}</p>{detail}</section>')
        page=f'<h1>{esc(e["title"])}</h1><p>{date} · 56s planned · {words} words · {esc(e.get("delivery",""))}</p><p class="notice">Portrait shot plans — descriptions and staging, not generated final frames. Read with PRODUCTION_STANDARD.md.</p><h2>Script</h2><p>{esc(script)}</p><div class="grid">'+''.join(shots)+'</div>'
        target=p.with_suffix('.storyboard.html'); target.write_text(shell(page,e['title']),encoding='utf-8')
        cards.append(f'<a class="card" href="{esc(str(target.relative_to(W)).replace(chr(92),chr(47)))}"><small>DAY {day} · {date}</small><h2>{esc(e["title"])}</h2><p>{esc(e["hook"])}</p><small>{words} words · eight 9:16 shot plans</small></a>')
    records.sort(key=lambda r:(r['day'],r['episode_order']))
    for order,record in enumerate(records,1):record['chronological_order']=order
    intro=f'<h1>Vice City Alibis · Week one</h1><p>{len(records)} of 49 stories packaged · 16–22 November 2026 · seven per day planned</p><p class="notice">First two day-one stories are tonight’s priorities. All timings are editorial targets until narration is measured. Estimated SRT exports require final audio alignment. These are scripts and shot plans; release videos require artwork, audio, edit and review.</p>'
    W.mkdir(parents=True,exist_ok=True)
    (W/'index.html').write_text(shell(intro+'<div class="catalog">'+''.join(cards)+'</div>','Week one'),encoding='utf-8')
    per_day=dict(collections.Counter(r['day'] for r in records))
    complete=len(records)==49 and all(per_day.get(day)==7 for day in range(1,8))
    report={'episodes':len(records),'per_day':per_day,'scenes':sum(8 for r in records),'issues':issues,'all_49_present':complete,'caption_status':'ESTIMATED: final audio alignment required','scope':'structural checks only; not final video or visual approval'}
    (W/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
    (W/'validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    fields=['chronological_order','day','date','episode_order','id','title','voice','timeline','pov','delivery','words','planned_seconds','caption_status','path','narration_path','estimated_srt_path','status']
    csv_buffer=io.StringIO(newline='');writer=csv.DictWriter(csv_buffer,fieldnames=fields,lineterminator='\n');writer.writeheader();writer.writerows(records)
    (W/'metadata.csv').write_text(csv_buffer.getvalue(),encoding='utf-8-sig')
    days='\n'.join(f'| {day} | {(datetime.date(2026,11,15)+datetime.timedelta(days=day)).isoformat()} | {per_day.get(day,0)} / 7 |' for day in range(1,8))
    readme=f'''# Vice City Alibis — Week 01 preproduction

{len(records)} of 49 episode packages available. {'All seven days are present.' if complete else 'Partial working export; rerun packaging after the remaining episodes are authored.'}

| Day | Planned date | Packages |
| --- | --- | --- |
{days}

Open `index.html` for the offline reader. `metadata.csv` lists episodes in day/episode chronology; dates are planning dates, not scheduled or published uploads. `manifest.json` indexes files and `validation.json` reports structural checks.

Each episode includes the original JSON and readable Markdown, an exact `*.narration.txt` script, an eight-scene storyboard reader, and `*.estimated.srt` planning captions. **Every SRT time is an estimate derived from scene windows, not measured speech. Final alignment to the approved narration is required before editing or release.** Caption line breaks do not alter script words. Narration text excludes metadata so it can be pasted into a voice tool.

These are 56-second portrait story plans, not finished videos. Existing approved character/visual references are named in the plans; source art, audio and video binaries are intentionally excluded from the text archive. Some first-two-episode review media may exist elsewhere in the project. Those previews do not make other episodes rendered or release-ready.

All story events and specific sets are original, unofficial GTA VI fan fiction. Jason, Lucia and canonical region names are distinct from invented events and anonymous supporting extras. Liam is the preferred approved narrator; Laura is approved. Any character-role performances remain provisional where marked. Lara has not been auditioned and must not be silently substituted.

Before release: review identity, anatomy, hands, props, vehicle geometry/occupants, weather and light; synthesize and align approved narration; keep scene-specific backgrounds beneath clear centered speech; export separate audio stems; record asset provenance and resolve commercial-use licensing. No account creation, publishing or upload was performed by this export.

Archive scope: production text/JSON/CSV/SRT/HTML plus the accompanying project bibles and decisions. No credentials, external calls or media generation are involved.
'''
    (W/'WEEK_01_README.md').write_text(readme,encoding='utf-8')
    archive=R/'production'/('vice-city-alibis-week-01-preproduction.zip' if complete else 'vice-city-alibis-week-01-preproduction-partial.zip')
    allowed={'.json','.md','.txt','.srt','.html','.csv'}
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for source in sorted(W.rglob('*')):
            if source.is_file() and source.suffix.lower() in allowed:z.write(source,source.relative_to(R).as_posix())
        for name in ['DECISIONS.md','VISUAL_BIBLE.md','AUDIO_BIBLE.md','NARRATIVE_PLAYBOOK.md','RELEASE_STATUS.md','PRODUCTION_REVIEW.md']:
            source=R/'docs'/name
            if source.exists():z.write(source,source.relative_to(R).as_posix())
    report['archive']=str(archive.relative_to(R))
    print(json.dumps(report,indent=2))
def shell(body,title):
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>body{background:#16091d;color:#fff2d8;font:17px/1.6 system-ui;margin:30px auto;padding:20px;max-width:1500px}h1{line-height:1.1}a{color:inherit;text-decoration:none}.notice{border-left:4px solid #12dcd2;padding:15px;background:#24172b}.grid,.catalog{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px}.portrait{aspect-ratio:9/16;background:linear-gradient(145deg,#44233f,#102c30);padding:20px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;border:1px solid #12dcd2;font-size:14px;overflow:auto}.portrait small{color:#12dcd2}.portrait b{color:#fff2d8}.card{padding:22px;background:#2a1930;border-top:3px solid #f20ba6}.speech{font-weight:600}summary{cursor:pointer;color:#12dcd2}details p{font-size:14px;white-space:pre-wrap}</style>'+body+'</html>'
if __name__=='__main__': main()
