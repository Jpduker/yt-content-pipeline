"""C01 asset prep: vertical 9:16 crops from Jp's Gemini sheets (channels/whispers/characters/vivek-cast) + per-shot masks.
Writes assets/<shot>.png (colour, 1080x1920 upscaled), assets/<shot>_d.png (pseudo-depth: figure near, background far, blurred),
assets/<shot>_h.png (hair/sway mask: dark pixels inside the figure). Sheet portraits (plain beige studio background) are keyed
to alpha so they can sit over a painted bokeh room. Runs anywhere with Pillow + numpy (cloud or WSL).
Better depth (optional, WSL): sh prep_wsl.sh replaces *_d.png with Depth-Anything-V2-Small maps and *_a.png with rembg cutouts."""
import os, sys, numpy as np
from PIL import Image, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, '../../characters/vivek-cast')
A = os.path.join(D, 'assets'); os.makedirs(A, exist_ok=True)
# shot: (sheet, crop box, figure ellipses [(cx, cy, rx, ry) in crop px, 0..1 of crop], key_bg)
SHOTS = {
  'him_window':  ('poses-introspection-pain-encounter-confession.jpg', (440, 36, 870, 800), [(.45, .45, .42, .62)], False),
  'her_34':      ('turnaround-closeup-him-her.jpg', (745, 905, 1188, 1693), [(.5, .5, .5, .6)], True),
  'her_front':   ('turnaround-closeup-him-her.jpg', (121, 905, 564, 1693), [(.5, .5, .5, .6)], True),
  'him_meet':    ('poses-introspection-pain-encounter-confession.jpg', (222, 936, 652, 1700), [(.5, .5, .5, .65)], False),
  'her_meet':    ('poses-introspection-pain-encounter-confession.jpg', (642, 936, 1072, 1700), [(.48, .55, .45, .6)], False),
  'her_confess': ('poses-introspection-pain-encounter-confession.jpg', (1586, 936, 2016, 1700), [(.5, .52, .5, .62)], False),
}
for name, (sheet, box, ells, key) in SHOTS.items():
    im = Image.open(os.path.join(SRC, sheet)).convert('RGB').crop(box).resize((1080, 1920), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255; H, W = a.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]; fig = np.zeros((H, W), np.float32)
    for cx, cy, rx, ry in ells: fig = np.maximum(fig, np.clip(1.6 - np.sqrt(((xx / W - cx) / rx) ** 2 + ((yy / H - cy) / ry) ** 2) * 1.6, 0, 1))
    alpha = np.ones((H, W), np.float32)
    if key:                                                         # key out the beige studio background (distance to the corner colour)
        bg = np.median(np.concatenate([a[:40, :40].reshape(-1, 3), a[:40, -40:].reshape(-1, 3)]), 0)
        dist = np.sqrt(((a - bg) ** 2).sum(2)); alpha = np.clip((dist - .06) / .08, 0, 1)
        alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
        fig = np.maximum(fig * .4, alpha)
    rgba = np.dstack([a, alpha]); Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(os.path.join(A, name + '.png'))
    depth = fig * .75 + (1 - yy / H) * .0 + .15 * (yy / H)          # nearer toward the bottom of frame a little
    Image.fromarray((np.clip(depth, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(28)).save(os.path.join(A, name + '_d.png'))
    lum = a @ np.array([.299, .587, .114]); hair = np.clip((.30 - lum) / .12, 0, 1) * np.clip(fig * 1.5, 0, 1) * alpha
    hair *= np.clip(1.3 - yy / H, 0, 1)                              # hair lives in the upper part of frame
    Image.fromarray((hair * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)).save(os.path.join(A, name + '_h.png'))
    print(name, 'ok')
