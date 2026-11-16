"""Check derived text artifacts without changing approved episode scripts."""
from pathlib import Path
import csv,json,re,zipfile

ROOT=Path(__file__).resolve().parents[1]
W=ROOT/'production/week-01'
norm=lambda text:re.sub(r'\s+',' ',text).strip()
def ms(text):
    h,m,s,f=map(int,re.split('[:,]',text))
    return ((h*60+m)*60+s)*1000+f
def main():
    records=json.loads((W/'manifest.json').read_text(encoding='utf-8'))
    for record in records:
        source=W/record['path'];episode=json.loads(source.read_text(encoding='utf-8-sig'))
        assert norm((W/record['narration_path']).read_text(encoding='utf-8'))==norm(episode['script']),source
        srt=W/record['estimated_srt_path'];assert srt.name.endswith('.estimated.srt')
        blocks=srt.read_text(encoding='utf-8').strip().split('\n\n');spoken=[];cursor=0
        for index,block in enumerate(blocks,1):
            lines=block.splitlines();assert int(lines[0])==index
            start,end=map(ms,lines[1].split(' --> '));assert start==cursor and end>start
            cursor=end;assert len(lines[2:])<=2,(srt,index,'too many caption lines')
            spoken.extend(lines[2:])
        assert cursor==56000,srt
        assert norm(' '.join(spoken))==norm(episode['script']),srt
    with (W/'metadata.csv').open(encoding='utf-8-sig',newline='') as stream:rows=list(csv.DictReader(stream))
    assert len(rows)==len(records)
    assert [int(row['chronological_order']) for row in rows]==list(range(1,len(rows)+1))
    assert [(int(row['day']),int(row['episode_order'])) for row in rows]==sorted((int(row['day']),int(row['episode_order'])) for row in rows)
    complete=len(records)==49 and all(sum(int(row['day'])==day for row in rows)==7 for day in range(1,8))
    archive=ROOT/'production'/('vice-city-alibis-week-01-preproduction.zip' if complete else 'vice-city-alibis-week-01-preproduction-partial.zip')
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        assert all(Path(name).suffix.lower() in {'.json','.md','.txt','.srt','.html','.csv'} for name in z.namelist())
        for row in rows:
            for field in ('path','narration_path','estimated_srt_path'):
                assert 'production/week-01/'+row[field] in z.namelist()
        count=len(z.namelist())
    print(f'PASS: {len(records)} exact narration and estimated SRT exports; contiguous SRT cues end at 56s; CSV chronology matches; {count} text archive files passed CRC. All 49 present: {complete}.')
if __name__=='__main__':main()
