"""Chatterbox emotional voice, same interface as lemo's core/tts/tts.py:
   tools/chatterbox/.venv/bin/python tools/chatterbox/speak.py lines.json out_dir
lines.json = [{"id":"l1","text":"...","voice":"narrator-f","emotion":0.7,"cfg":0.4,"model":"orig"}, ...]
  voice   -> library/voices/refs/<voice>.wav (a clean 5-10 s clip of the voice to clone; see make_refs.sh)
  emotion -> exaggeration 0.25 (flat) .. 0.5 (normal) .. 0.9+ (very expressive)   [original model only]
  cfg     -> cfg_weight, lower (~0.3) = slower, more deliberate delivery           [original model only]
  model   -> "orig" (500M, has the emotion knob; default) or "turbo" (350M, lighter, supports [sigh] [laugh] tags)
Writes out_dir/<id>.wav and out_dir/dur.json, trimmed like tts.py, so align_words.py and mix.py work unchanged.
Note: Chatterbox adds Resemble's inaudible PerTh watermark to every file (upstream behaviour)."""
import sys, os, json
if len(sys.argv) < 3: print(__doc__); sys.exit(2)
import numpy as np, soundfile as sf, torch
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
REFS = os.path.join(ROOT, 'library', 'voices', 'refs')
lines, out = json.load(open(sys.argv[1], encoding='utf-8')), sys.argv[2]
os.makedirs(out, exist_ok=True)
dev = 'cuda' if torch.cuda.is_available() else 'cpu'
models = {}
def get(kind):
    global dev
    if kind not in models:
        try:
            if kind == 'turbo':
                from chatterbox.tts_turbo import ChatterboxTurboTTS as M
            else:
                from chatterbox.tts import ChatterboxTTS as M
            models[kind] = M.from_pretrained(device=dev)
        except torch.cuda.OutOfMemoryError:
            print('CUDA out of memory, using CPU (slow)', file=sys.stderr); dev = 'cpu'; torch.cuda.empty_cache()
            return get(kind)
    return models[kind]
dur = {}
for L in lines:
    kind = L.get('model', 'orig'); m = get(kind)
    ref = os.path.join(REFS, L.get('voice', 'narrator-f') + '.wav')
    if not os.path.exists(ref): sys.exit(f"speak.py: no reference clip {ref}. Run sh tools/chatterbox/make_refs.sh or record one (5-10 s, clean, mono).")
    kw = dict(audio_prompt_path=ref)
    if kind != 'turbo': kw.update(exaggeration=float(L.get('emotion', .5)), cfg_weight=float(L.get('cfg', .5)))
    wav = m.generate(L['text'], **kw).squeeze().cpu().numpy(); sr = m.sr
    nz = np.where(np.abs(wav) > np.abs(wav).max() * .02)[0]
    if len(nz): wav = wav[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.08 * sr)]
    sf.write(os.path.join(out, L['id'] + '.wav'), wav, sr); dur[L['id']] = round(len(wav) / sr, 3)
    print(L['id'], dur[L['id']], L['text'])
json.dump(dur, open(os.path.join(out, 'dur.json'), 'w'), indent=1)
