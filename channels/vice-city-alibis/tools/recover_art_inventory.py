"""Inventory generated art after an interrupted tool session; no artwork is altered."""
from pathlib import Path
import datetime,json,hashlib,shutil
R=Path(__file__).resolve().parents[1]
B=R/'production/batch-2026-11-17'
source=Path.home()/'.codex/generated_images/01a1e632-5cde-7690-9196-7104c414cf5d'
target=B/'out/art-inventory';target.mkdir(parents=True,exist_ok=True)
cutoff=datetime.datetime(2026,11,17,4,tzinfo=datetime.timezone.utc).timestamp()
selected={}
for p in (B/'2026-11-17').glob('*-art/[0-9][0-9].png'):
    selected[hashlib.sha256(p.read_bytes()).hexdigest()]=str(p.relative_to(R))
rows=[]
for p in sorted(source.glob('*.png'),key=lambda p:p.stat().st_mtime):
    stat=p.stat()
    if stat.st_mtime<cutoff:continue
    digest=hashlib.sha256(p.read_bytes()).hexdigest();n=len(rows)
    shutil.copy2(p,target/f'{n:03}.png')
    rows.append({'index':n,'source':str(p),'sha256':digest,'already_selected':selected.get(digest),'generated_utc':datetime.datetime.fromtimestamp(stat.st_mtime,datetime.timezone.utc).isoformat()})
(B/'art-recovery-index.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
print(json.dumps({'images':len(rows),'already_selected':sum(bool(x['already_selected']) for x in rows),'qa_directory':str(target)}))
