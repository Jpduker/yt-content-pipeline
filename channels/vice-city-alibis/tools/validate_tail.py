from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
files=[]
for day in [5,6,7]:
    fs=sorted((root/'production/week-01'/f'day-{day:02}').glob('*.json'))
    assert len(fs)==7,(day,len(fs))
    for p in fs:
        o=json.loads(p.read_text(encoding='utf-8'))
        assert len(o['scenes'])==8
        assert [(s['start'],s['end']) for s in o['scenes']]==[(i*7,(i+1)*7) for i in range(8)]
        assert o['script']==' '.join(s['narration'] for s in o['scenes'])
        wc=len(re.findall(r"\b[\w]+(?:['’-][\w]+)*\b",o['script']))
        assert 120<=wc<=140,(p,wc)
        assert wc==o['spoken_word_count']
        assert p.with_suffix('.md').exists()
        assert o['script'] in p.with_suffix('.md').read_text(encoding='utf-8')
        assert len(o['title_options'])==3
        files.append({'id':o['id'],'words':wc,'json':str(p.relative_to(root)),'md':str(p.with_suffix('.md').relative_to(root))})
report={'episodes':len(files),'json_files':21,'markdown_files':21,'scenes':168,'duration_seconds':1176,'checks':'All scripts 120–140 words; exact scene/script equality; eight contiguous 7-second windows per episode; 3 title options; matching Markdown scripts. Written packages only, no assets rendered.','files':files}
(root/'production/week-01/days-05-07-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='files'},indent=2))
p=root/'production/week-01/day-07/episode-04.json'
o=json.loads(p.read_text(encoding='utf-8'))
print('D7E4 props:',o['scenes'][0]['continuity'])
