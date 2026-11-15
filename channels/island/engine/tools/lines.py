#!/usr/bin/env python3
"""short.json → lines.json for core/tts/tts.py (flat list). Usage: lines.py <short_dir>"""
import json, sys, os
D = sys.argv[1]; S = json.load(open(os.path.join(D, 'short.json'))); out = []
VOICES = { None: 'am_michael', 'DUNN': 'bm_george', 'WREN': 'bf_emma', 'PIP': 'bm_lewis', 'GUS': 'am_michael' }
for sh in S['shots']:
    for ln in sh.get('lines', []):
        e = { 'id': ln['id'], 'text': ln['text'], 'voice': ln.get('voice') or VOICES.get(ln.get('dlg'), 'am_michael'), 'speed': ln.get('speed', 1.0) }
        if ln.get('asr'): e['asr'] = ln['asr']
        out.append(e)
json.dump(out, open(os.path.join(D, 'lines.json'), 'w'), indent=1); print(len(out), 'lines')
