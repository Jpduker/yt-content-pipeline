"""C01 v2 asset prep: 9:16 shots from Vivek's Gemini sheets (channels/whispers/characters/vivek-cast) + a FACE RIG per shot.
Writes assets/<shot>.png (colour, 1080x1920), <shot>_d.png (pseudo depth), <shot>_h.png (hair mask) and assets/rig.json:
per shot, per face: eyes (x,y), eye radius, mouth (x,y,width), head centre + radius, neck pivot, in 1080x1920 frame pixels.
Landmarks were placed by hand on the sheets (sheet pixel coords below). Pillow + numpy only (runs in cloud or WSL).
   python3 prep2.py <vivek-cast folder>"""
import os, sys, json, numpy as np
from PIL import Image, ImageFilter
D = os.path.dirname(os.path.abspath(__file__)); SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, '../../characters/vivek-cast')
A = os.path.join(D, 'assets'); os.makedirs(A, exist_ok=True)
POSES, CLOSE = 'poses-introspection-pain-encounter-confession.jpg', 'turnaround-closeup-him-her.jpg'
W, H = 1080, 1920
def face(eL, eR, er, m, mw, hc, hr, nk): return dict(eL=eL, eR=eR, er=er, m=m, mw=mw, hc=hc, hr=hr, nk=nk)
# name: (sheet, crop box (9:16), key background?, [faces in SHEET px], figure ellipses (crop-relative cx,cy,rx,ry))
SHOTS = {
  'him_window': (POSES, (440, 36, 870, 800), False, [face((628, 325), (718, 348), 21, (662, 430), 64, (650, 285), 185, (630, 520))], [(.45, .45, .42, .62)]),
  'him_34':     (CLOSE, (770, 40, 1213, 828), True, [face((978, 263), (1042, 255), 16, (1018, 343), 44, (985, 250), 160, (975, 430))], [(.5, .5, .5, .6)]),
  'her_34':     (CLOSE, (745, 905, 1188, 1693), True, [face((870, 1120), (950, 1120), 17, (915, 1193), 48, (925, 1115), 140, (915, 1290))], [(.5, .5, .5, .6)]),
  'her_front':  (CLOSE, (121, 905, 564, 1693), True, [face((300, 1090), (370, 1090), 16, (335, 1155), 44, (335, 1080), 125, (335, 1240))], [(.5, .5, .5, .6)]),
  'her_confess':(POSES, (1586, 936, 2016, 1700), False, [face((1678, 1225), (1835, 1225), 30, (1760, 1370), 100, (1775, 1235), 240, (1790, 1520))], [(.5, .52, .5, .62)]),
}
def fit(name, sheet, box, key, ells):
    im = Image.open(os.path.join(SRC, sheet)).convert('RGB').crop(box).resize((W, H), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    yy, xx = np.mgrid[0:H, 0:W]; fig = np.zeros((H, W), np.float32)
    for cx, cy, rx, ry in ells: fig = np.maximum(fig, np.clip(1.6 - np.sqrt(((xx / W - cx) / rx) ** 2 + ((yy / H - cy) / ry) ** 2) * 1.6, 0, 1))
    alpha = np.ones((H, W), np.float32)
    if key:
        bg = np.median(np.concatenate([a[:40, :40].reshape(-1, 3), a[:40, -40:].reshape(-1, 3)]), 0)
        dist = np.sqrt(((a - bg) ** 2).sum(2)); alpha = np.clip((dist - .06) / .08, 0, 1)
        # only background CONNECTED to the frame edge is removed (white sleeves / tee inside the figure stay solid)
        from scipy import ndimage
        strict = dist < .045                                          # pixels that are truly the studio beige
        lab, _ = ndimage.label(strict); edge = set(np.unique(np.concatenate([lab[0], lab[:, 0], lab[:, -1]]))) - {0}
        outside = ndimage.binary_dilation(np.isin(lab, list(edge)), iterations=4); alpha = np.where(outside, alpha, 1.0)
        alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
        fig = np.maximum(fig * .4, alpha)
    return a, alpha, fig, yy
def save(name, a, alpha, fig, yy):
    Image.fromarray((np.dstack([a, alpha]) * 255).astype(np.uint8), 'RGBA').save(os.path.join(A, name + '.png'))
    depth = fig * .75 + .15 * (yy / H)
    Image.fromarray((np.clip(depth, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(28)).save(os.path.join(A, name + '_d.png'))
    lum = a @ np.array([.299, .587, .114]); hair = np.clip((.30 - lum) / .12, 0, 1) * np.clip(fig * 1.5, 0, 1) * alpha * np.clip(1.3 - yy / H, 0, 1)
    Image.fromarray((hair * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6)).save(os.path.join(A, name + '_h.png'))
RIG = {}
for name, (sheet, box, key, faces, ells) in SHOTS.items():
    save(name, *fit(name, sheet, box, key, ells))
    sx, sy = W / (box[2] - box[0]), H / (box[3] - box[1]); P = lambda p: [round((p[0] - box[0]) * sx, 1), round((p[1] - box[1]) * sy, 1)]
    RIG[name] = [dict(eL=P(f['eL']), eR=P(f['eR']), er=round(f['er'] * sx, 1), m=P(f['m']), mw=round(f['mw'] * sx, 1), hc=P(f['hc']), hr=round(f['hr'] * sx, 1), nk=P(f['nk'])) for f in faces]
    print(name, 'ok')
# two-shot: the whole "encounter" painting as a wide band inside the 9:16 frame, over a blurred, darkened extension of itself
pb = (150, 940, 1150, 1690); pan = Image.open(os.path.join(SRC, POSES)).convert('RGB').crop(pb)
s = W / pan.width; bh = round(pan.height * s); Y0 = 430
band = pan.resize((W, bh), Image.LANCZOS)
cov = pan.resize((round(pan.width * H / pan.height), H), Image.LANCZOS); cx = (cov.width - W) // 2
bg = np.asarray(cov.crop((cx, 0, cx + W, H)).filter(ImageFilter.GaussianBlur(40))).astype(np.float32) / 255 * .55
fr = bg.copy(); b = np.asarray(band).astype(np.float32) / 255
ramp = np.ones(bh, np.float32); F = 70; ramp[:F] = np.linspace(0, 1, F); ramp[-F:] = np.linspace(1, 0, F)
fr[Y0:Y0 + bh] = fr[Y0:Y0 + bh] * (1 - ramp[:, None, None]) + b * ramp[:, None, None]
yy, xx = np.mgrid[0:H, 0:W]; fig = np.zeros((H, W), np.float32)
for cx_, cy_, rx, ry in [(.36, (Y0 + .45 * bh) / H, .34, .17), (.73, (Y0 + .5 * bh) / H, .27, .17)]:
    fig = np.maximum(fig, np.clip(1.6 - np.sqrt(((xx / W - cx_) / rx) ** 2 + ((yy / H - cy_) / ry) ** 2) * 1.6, 0, 1))
save('both', fr, np.ones((H, W), np.float32), fig, yy)
T = lambda p: [round((p[0] - pb[0]) * s, 1), round((p[1] - pb[1]) * s + Y0, 1)]
RIG['both'] = [dict(eL=T((458, 1200)), eR=T((538, 1200)), er=round(18 * s, 1), m=T((500, 1290)), mw=round(66 * s, 1), hc=T((430, 1180)), hr=round(210 * s, 1), nk=T((440, 1410))),
               dict(eL=T((772, 1255)), eR=T((840, 1262)), er=round(17 * s, 1), m=T((797, 1355)), mw=round(50 * s, 1), hc=T((830, 1240)), hr=round(175 * s, 1), nk=T((850, 1440)))]
json.dump(RIG, open(os.path.join(A, 'rig.json'), 'w'), indent=1); print('both ok; rig.json written')
