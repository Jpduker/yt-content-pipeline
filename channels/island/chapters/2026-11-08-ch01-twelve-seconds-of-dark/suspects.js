// The island cast, introduced in EP02 (original characters, mid-century cartoon: held bodies, geometric shapes,
// only eyes/brows/mouth/limbs move). Each draws with its feet at (0,0); s = scale.
import { PAL, shape, ink, ellipse, rrect, spline, sparkle, star, TAU, text } from './engine/toon.js';

const eyes = (ctx, pts, look, blink, r = 7, seed = 0) => pts.forEach(([x, y], i) => {
  if (blink) { ink(ctx, [[x - r, y], [x + r, y]], 3.6, { seed: seed + i, taper: false }); return; }
  shape(ctx, ellipse(x, y, r * 1.15, r * 1.25, 14), { fill: PAL.white, line: 3, seed: seed + 5 + i, grain: 0, breaks: 0 });
  shape(ctx, ellipse(x + look[0], y + look[1], r * 0.55, r * 0.7, 12), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
});

// Pip the seagull: white egg body, grey wing, orange beak and legs. flap: 0..1 wing lift. dizzy: stars circle.
export function drawPip(ctx, x, y, s = 1, p = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (p.flip ? -1 : 1), s);
  if (!p.flying) [[-16, 0], [14, 1]].forEach(([lx, i]) => { ink(ctx, [[lx, -70], [lx, -4]], 5, { color: PAL.coralD, seed: 1200 + i, taper: false }); ink(ctx, [[lx - 12, -2], [lx + 14, -2]], 5, { color: PAL.coralD, seed: 1210 + i, taper: false }); });
  shape(ctx, spline([[-70, -120], [-40, -170], [10, -176], [60, -150], [76, -110], [50, -76], [-20, -66], [-80, -84], [-118, -96]], true, 7), { fill: PAL.white, line: 4.2, seed: 1220, grain: 0.2 });
  const fl = p.flap ?? 0;
  shape(ctx, spline([[-50, -130], [0, -140 - fl * 70], [44, -132 - fl * 40], [20, -100], [-36, -100]], true, 6), { fill: '#AEB7BC', line: 3.8, seed: 1225, grain: 0.3 });
  shape(ctx, spline([[66, -200], [96, -236], [120, -214], [112, -176], [80, -166]], true, 6), { fill: PAL.white, line: 4, seed: 1230, grain: 0.2 });
  shape(ctx, spline([[110, -200], [158, -192], [114, -184]], true, 3), { fill: PAL.mustard, line: 3.4, seed: 1231, grain: 0.1 });
  ink(ctx, [[60, -176], [72, -160]], 4, { seed: 1232, taper: false });                                   // neck line
  eyes(ctx, [[96, -212]], p.look || [1, 0], p.blink, 7, 1240);
  if (p.dizzy) for (let k = 0; k < 3; k++) { const a = p.dizzy * 6 + k * TAU / 3; sparkle(ctx, 90 + Math.cos(a) * 56, -262 + Math.sin(a) * 16, 16, { fill: PAL.mustard }); }
  ctx.restore();
}

// Mabel the cat: blue-grey bean, triangle ears, curled tail, white (clean) paws. sleepy: half-closed eyes.
export function drawMabel(ctx, x, y, s = 1, p = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const C = '#7E93A6', CD = '#61768A';
  ink(ctx, spline([[70, -40], [130, -60], [150, -130], [116, -170], [96, -140]], false, 8), 14, { color: CD, seed: 1300, taper: true });
  shape(ctx, spline([[-74, -30], [-80, -130], [-50, -200], [50, -200], [80, -130], [74, -30], [40, -8], [-40, -8]], true, 8), { fill: C, line: 4.4, seed: 1301, grain: 0.3, shade: [{ pts: ellipse(0, -60, 44, 50, 20), color: '#C9D3DB', alpha: 0.9 }] });
  [[-34, 0], [34, 1]].forEach(([px, i]) => shape(ctx, ellipse(px, -10, 26, 16, 16), { fill: PAL.white, line: 3.6, seed: 1305 + i, grain: 0.1 }));
  shape(ctx, ellipse(0, -250, 84, 70, 30), { fill: C, line: 4.4, seed: 1310, grain: 0.3 });
  [[-1, 0], [1, 1]].forEach(([d, i]) => shape(ctx, [[d * 74, -270], [d * 62, -350], [d * 20, -306]], { fill: C, line: 4, seed: 1312 + i, grain: 0.2, shade: [{ pts: [[d * 62, -282], [d * 58, -330], [d * 32, -302]], color: PAL.pink }] }));
  if (p.sleepy) [[-30, -258], [30, -258]].forEach(([ex, ey], i) => ink(ctx, spline([[ex - 13, ey], [ex, ey + 6], [ex + 13, ey]], false, 4), 4, { seed: 1320 + i }));
  else eyes(ctx, [[-30, -262], [30, -262]], p.look || [0, 0], p.blink, 9, 1322);
  shape(ctx, [[-8, -236], [8, -236], [0, -226]], { fill: PAL.pink, line: 2.6, seed: 1330, grain: 0 });
  ink(ctx, spline([[-14, -214], [0, -220], [14, -214]], false, 4), 3.2, { seed: 1331 });
  [[-1, 0], [1, 1]].forEach(([d, i]) => [[0, 0], [6, 1]].forEach(([dy, j]) => ink(ctx, [[d * 40, -230 + dy], [d * 96, -240 + dy * 2]], 2.4, { seed: 1335 + i * 2 + j, taper: true })));
  if (p.zzz) { const k = (p.zzz % 1); text(ctx, 'z', 90 + k * 30, -330 - k * 60, { font: '700 46px Oleo', fill: PAL.ink, alpha: 1 - k }); }
  ctx.restore();
}

// Rollo the mouse: tan pear body, big round ears, long tail. paint: yellow paint on his feet (the clue).
// sweat: 0..1 drop slides down; burp: 0..1 open mouth + crumbs; guilty eyes look away.
export function drawRollo(ctx, x, y, s = 1, p = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (p.flip ? -1 : 1), s);
  const C = '#C9A57E', CD = '#A9855E';
  ink(ctx, spline([[-46, -26], [-110, -20], [-150, -60], [-130, -96]], false, 8), 6, { color: PAL.coralD, seed: 1400, taper: true });
  [[-22, 0], [22, 1]].forEach(([fx, i]) => {
    shape(ctx, ellipse(fx, -8, 22, 11, 14), { fill: p.paint ? PAL.mustard : PAL.pink, line: 3.4, seed: 1402 + i, grain: 0.15 });
    if (p.paint) [[-10, 4], [4, 7], [14, 2]].forEach(([dx, dy], j) => shape(ctx, ellipse(fx + dx, -8 + dy + 6, 4, 5, 8), { fill: PAL.mustard, line: 1.8, seed: 1405 + i * 3 + j, grain: 0 }));
  });
  shape(ctx, spline([[-56, -24], [-58, -90], [-30, -138], [30, -138], [58, -90], [56, -24], [30, -10], [-30, -10]], true, 8), { fill: C, line: 4.2, seed: 1410, grain: 0.3, shade: [{ pts: ellipse(0, -56, 32, 36, 18), color: '#EBD8BE', alpha: 0.9 }] });
  [[-1, 0], [1, 1]].forEach(([d, i]) => { shape(ctx, ellipse(d * 62, -206, 46, 46, 24), { fill: C, line: 4, seed: 1415 + i, grain: 0.2 }); shape(ctx, ellipse(d * 62, -204, 28, 28, 20), { fill: PAL.pink, line: 0, seed: 1417 + i, grain: 0, off: [0, 0] }); });
  shape(ctx, ellipse(0, -170, 54, 46, 26), { fill: C, line: 4.2, seed: 1420, grain: 0.2 });
  const lk = p.look || [0, 0];
  eyes(ctx, [[-20, -180], [20, -180]], lk, p.blink, 7, 1422);
  shape(ctx, ellipse(0, -156, 9, 7, 10), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  [[-1, 0], [1, 1]].forEach(([d, i]) => ink(ctx, [[d * 14, -152], [d * 60, -160 + i * 4]], 2.2, { seed: 1430 + i, taper: true }));
  if (p.burp) {
    shape(ctx, ellipse(0, -136, 16 * p.burp, 12 * p.burp, 14), { fill: PAL.coralD, line: 3, seed: 1440, grain: 0 });
    for (let k = 0; k < 8; k++) { const a = (k % 2 ? 0 : Math.PI) + (Math.floor(k / 2) - 1.5) * 0.35, r = 70 + p.burp * 150 * (0.6 + 0.4 * ((k * 37) % 5) / 5); shape(ctx, rrect(Math.cos(a) * r - 6, -136 + Math.sin(a) * r * 0.6 - 6, 12, 12, 3), { fill: PAL.kraft, line: 2, seed: 1450 + k, grain: 0 }); }
  } else ink(ctx, spline([[-10, -140], [0, p.guilty ? -144 : -136], [10, -140]], false, 4), 3.4, { seed: 1441 });
  if (p.sweat) { const k = p.sweat; shape(ctx, spline([[54, -222 + k * 40], [62, -206 + k * 40], [54, -196 + k * 40], [46, -206 + k * 40]], true, 4), { fill: PAL.blueL, line: 2.6, seed: 1460, grain: 0, alpha: 1 - Math.max(0, k - 0.8) * 5 }); }
  ctx.restore();
}

// a little yellow paw print (the trail on the stairs)
export function pawPrint(ctx, x, y, s = 1, a = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  shape(ctx, ellipse(0, 4, 7, 6, 10), { fill: PAL.mustardD || '#D9A030', line: 0, grain: 0, off: [0, 0] });
  [[-7, -6], [0, -9], [7, -6]].forEach(([dx, dy]) => shape(ctx, ellipse(dx, dy, 2.8, 3.2, 8), { fill: PAL.mustardD || '#D9A030', line: 0, grain: 0, off: [0, 0] }));
  ctx.restore();
}
