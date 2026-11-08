"""C01 v3 asset prep: the 12 storyboard shots (Vivek's ChatGPT sheets in channels/whispers/characters/vivek-cast) cut into 9:16 frames
(1080x1920), number badges painted out, plus a soft pseudo-depth map and a hair mask per shot.
   python3 prep3.py <vivek-cast folder> [assets dir]"""
import os, sys, numpy as np
from PIL import Image, ImageFilter
SRC = sys.argv[1]; A = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets'); os.makedirs(A, exist_ok=True)
SHEETS = {1: 'Four moments around a red heart-1.png', 2: 'Four quiet cafe moments-2.png', 3: 'A love story in four moments-3.png'}
COLS = {1: (11, 480), 2: (11, 478), 3: (11, 477)}; ROWS = {1: (8, 842), 2: (9, 841), 3: (9, 841)}   # top row 783 px tall, bottom row 770 (its caption strip starts below)
try: import cv2
except ImportError: cv2 = None
n = 0
for sh in (1, 2, 3):
    im = np.asarray(Image.open(os.path.join(SRC, SHEETS[sh])).convert('RGB'))
    for r in range(2):
        for c in range(2):
            n += 1; y0 = ROWS[sh][r]; hh = 783 if r == 0 else 770; ww = round(hh * 9 / 16); x0 = COLS[sh][c] + (453 - ww) // 2; p = im[y0:y0 + hh, x0:x0 + ww].copy()
            mask = np.zeros(p.shape[:2], np.uint8); mask[0:58, 0:62] = 255          # the number badge
            if cv2 is not None: p = cv2.inpaint(p, mask, 9, cv2.INPAINT_TELEA)
            else:
                patch = Image.fromarray(p[60:118, 0:62]).filter(ImageFilter.GaussianBlur(6)); p[0:58, 0:62] = np.asarray(patch)
            img = Image.fromarray(p).resize((1080, 1920), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
            name = f'S{n:02d}'; img.save(os.path.join(A, name + '.png'))
            a = np.asarray(img).astype(np.float32) / 255; H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
            fig = np.clip(1.5 - np.sqrt(((xx / W - .5) / .55) ** 2 + ((yy / H - .55) / .5) ** 2) * 1.5, 0, 1)
            Image.fromarray((np.clip(fig * .75 + .15 * yy / H, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(40)).save(os.path.join(A, name + '_d.png'))
            lum = a @ np.array([.299, .587, .114]); hair = np.clip((.22 - lum) / .1, 0, 1) * np.clip(1.25 - yy / H, 0, 1) * fig
            Image.fromarray((hair * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)).save(os.path.join(A, name + '_h.png'))
            print(name)
