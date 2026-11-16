#!/bin/bash
# Build a week's render kit in the cloud (no picture render): Shorts + long-form chapter → voices, timelines, mixes, PUBLISH.md, QA stills, tgz.
# usage (from the lemo-opuscar root): styles/island-engine/tools/make_kit.sh <weekN.py> <chapterN.py> <work_dir> <chapter_folder_name> <kit.tgz>
set -e
E=$(cd "$(dirname "$0")/.." && pwd); T=$E/tools; PY=$PWD/.venv/bin/python
WEEK=$1; CHAP=$2; W=$3; CHNAME=$4; KIT=$5
SH=$W/shorts; CH=$W/long/$CHNAME; mkdir -p $SH $W/long
echo "== shorts"; python3 $T/$WEEK $SH > /dev/null
for d in $SH/*/; do cp $E/index.html $d/; python3 $T/lines.py $d > /dev/null
  [ -f $d/voices/dur.json ] || $PY core/tts/tts.py $d/lines.json $d/voices > $d/voices/tts.log 2>&1
  python3 $T/timeline.py $d | cut -c1-60; done
echo "== chapter"; rm -rf $CH; python3 $T/$CHAP $SH $CH; python3 $T/lines.py $CH > /dev/null; cp $E/index.html $CH/
python3 - "$CH" <<'PY'
import json, shutil, os, sys
C=sys.argv[1]; L=json.load(open(C+'/lines.json')); R=json.load(open(C+'/voices/reuse.json'))
json.dump([l for l in L if l['id'] not in R], open(C+'/lines-new.json','w'), indent=1); dur={}
for nid, src in R.items():
    shutil.copy(src, f"{C}/voices/{nid}.wav"); d=json.load(open(os.path.join(os.path.dirname(src),'dur.json'))); dur[nid]=d[os.path.basename(src)[:-4]]
json.dump(dur, open(C+'/voices/dur-reuse.json','w'))
PY
mkdir -p $CH/voices-new; $PY core/tts/tts.py $CH/lines-new.json $CH/voices-new > $CH/voices-new/tts.log 2>&1; cp $CH/voices-new/*.wav $CH/voices/
python3 -c "import json,sys; C=sys.argv[1]; d=json.load(open(C+'/voices/dur-reuse.json')); d.update(json.load(open(C+'/voices-new/dur.json'))); json.dump(d, open(C+'/voices/dur.json','w'), indent=1)" $CH
python3 $T/timeline.py $CH | cut -c1-30 || true
echo "== mixes + publish"
for d in $SH/*/; do $PY $T/mix.py $d > /dev/null 2>&1 || echo "MIX FAIL $d"; python3 $T/publish.py $d > /dev/null; done
$PY $T/mix_long.py $CH 2>&1 | tail -1
echo "== QA stills (one per shot, 9:16 and 16:9)"; mkdir -p $W/qa
for d in $SH/*/; do ts=$(python3 -c "import json,sys;T=json.load(open(sys.argv[1]+'/timeline.json'));print(' '.join(f\"{(s['a']+s['b'])/2:.1f}\" for s in T['shots']))" $d)
  node core/render/still.mjs $d $ts --size 360x640 --q 'ss=1' --prefix "$(basename $d | cut -c12-14)_" --out $W/qa > /dev/null 2>&1 || echo "STILL FAIL $d"; done
echo "== package"; O=$W/kit; rm -rf $O; mkdir -p $O/shorts $O/long $O/engine/tools
for d in $SH/*/; do b=$(basename $d); mkdir -p $O/shorts/$b/out $O/shorts/$b/voices; ffmpeg -v error -y -i $d/out/mix.wav -c:a pcm_s16le $O/shorts/$b/out/mix.wav
  cp $d/{timeline.json,lines.json,short.json,PUBLISH.md,index.html} $O/shorts/$b/; cp $d/voices/dur.json $O/shorts/$b/voices/; done
mkdir -p $O/long/$CHNAME/out $O/long/$CHNAME/voices; cp $CH/out/mix.wav $O/long/$CHNAME/out/; cp $CH/{short.json,lines.json,timeline.json,index.html} $O/long/$CHNAME/; cp $CH/voices/dur.json $O/long/$CHNAME/voices/
cp $E/{cast.js,world.js,ui.js,main.js,index.html} $O/engine/; cp $T/*.py $T/*.sh $O/engine/tools/
[ -f $W/extra/PUBLISH-CH.md ] && cp $W/extra/PUBLISH-CH.md $O/long/ ; [ -f $W/extra/WEEK.md ] && cp $W/extra/WEEK.md $O/shorts/
(cd $O && tar czf $KIT .); ls -la $KIT
