#!/bin/sh
# Optional upgrade (WSL, needs network once): real depth for the 2.5D parallax, replacing prep.py's pseudo-depth.
# Depth-Anything-V2-Small (Apache-2.0) for depth. Creates its own venv in tools/c01-depth/.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$HERE; while [ ! -f "$ROOT/pipeline/env.sh" ] && [ "$ROOT" != / ]; do ROOT=$(dirname "$ROOT"); done
V="$ROOT/tools/c01-depth/.venv"; [ -x "$V/bin/python" ] || { python3 -m venv "$V"; "$V/bin/pip" install -q transformers torch pillow numpy; }
"$V/bin/python" - "$HERE/assets" <<'P'
import sys, glob, os, numpy as np
from PIL import Image, ImageFilter
from transformers import pipeline
A = sys.argv[1]; depth = pipeline('depth-estimation', model='depth-anything/Depth-Anything-V2-Small-hf')
for f in sorted(glob.glob(os.path.join(A, '*.png'))):
    if f.endswith(('_d.png', '_h.png')): continue
    im = Image.open(f).convert('RGB'); d = np.asarray(depth(im)['depth'].resize(im.size)).astype(np.float32)
    d = (d - d.min()) / (d.max() - d.min() + 1e-6)
    Image.fromarray((d * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)).save(f[:-4] + '_d.png'); print('depth', os.path.basename(f))
P
