// Chapter 1 cast helpers: motion wrappers for the EP02 rigs (keeper.js, suspects.js stay on-model and unchanged)
// plus two new original characters: the Harbour Master and the Stranger in the yellow coat.
// Motion rules (Jp, 2026-11-05/08): continuous character motion, weight, anticipation and follow-through; no camera zooms.
import { PAL, shape, ink, ellipse, rrect, spline, TAU, clamp, lerp, seg, ss, eio, back, twos, hash } from './engine/toon.js';
import { drawKeeper } from './keeper.js';
import { drawPip, drawMabel, drawRollo } from './suspects.js';

// ---- a walk between two marks with anticipation (lean back), steps on twos, and a settle overshoot.
// Returns { x, walking, phase, bob, lean, arrive } for time t.
export function walk(t, t0, t1, x0, x1, stride = 120) {
  const D = Math.abs(x1 - x0), steps = Math.max(2, Math.round(D / stride));
  if (t < t0) { const a = seg(t, t0 - 0.25, t0); return { x: x0, walking: false, phase: 0, bob: Math.sin(a * Math.PI) * 6, lean: -0.05 * Math.sin(a * Math.PI), arrive: 0 }; }
  if (t >= t1) { const a = seg(t, t1, t1 + 0.45); const over = Math.sin(a * Math.PI) * (1 - a) * 18 * Math.sign(x1 - x0);
    return { x: x1 + over, walking: false, phase: 0, bob: -Math.sin(a * Math.PI) * 10 * (1 - a), lean: 0.06 * Math.sin(a * Math.PI) * (1 - a) * Math.sign(x1 - x0), arrive: a }; }
  const u = (twos(t, 15) - t0) / (t1 - t0), k = clamp(u);
  const e = k < 0.12 ? 0.5 * k * k / 0.12 : k > 0.88 ? 1 - 0.5 * (1 - k) * (1 - k) / 0.12 : (k - 0.06);     // ease in/out (≈ constant speed mid)
  const x = lerp(x0, x1, clamp(e / 0.88));
  const phase = k * steps / 2;                                         // one phase = two steps
  return { x, walking: true, phase, bob: -Math.abs(Math.sin(phase * TAU)) * 14, lean: 0.05 * Math.sign(x1 - x0), arrive: 0 };
}
// breathing: a tiny vertical squash, different rate per character
export const breathe = (t, rate = 0.28, amt = 0.012, ph = 0) => 1 + Math.sin(t * TAU * rate + ph) * amt;
export const blinkAt = (t, list) => list.some(b => t > b && t < b + 0.12) ? 1 : 0;
// natural blinks every 3–5 s (deterministic per seed)
export const autoBlink = (t, seed = 1) => { const p = 3.4 + hash(seed, 3) * 1.6, ph = (t + hash(seed, 9) * p) % p; return ph < 0.12 ? 1 : 0; };

// Gus with motion: o = { x, y, s, flip, face, look, walk:{...from walk()}, armF, armB, handF, handB, t, lantern }
export function gus(ctx, t, o) {
  const s = o.s ?? 0.72, w = o.walk;
  const bob = w ? w.bob : 0, lean = (w ? w.lean : 0) + (o.lean || 0);
  const sw = w && w.walking ? Math.sin(w.phase * TAU) : 0;
  ctx.save(); ctx.translate(o.x ?? w.x, o.y); if (o.flip) ctx.scale(-1, 1);
  ctx.rotate(lean); ctx.translate(0, bob * s);
  const br = breathe(t, 0.25, 0.01); ctx.scale(1, br);
  const pose = { x: 0, y: 0, s, face: o.face || 'neutral', look: o.look || [0, 0], blink: o.blink ?? autoBlink(t, 11), walk: w && w.walking ? w.phase : null,
    armF: o.armF || (w && w.walking ? { a1: 1.2 + sw * 0.45, a2: 1.42 + sw * 0.55 } : undefined),
    armB: o.armB || (w && w.walking ? { a1: 1.94 - sw * 0.45, a2: 1.72 - sw * 0.5 } : undefined), handF: o.handF, handB: o.handB };
  drawKeeper(ctx, pose);
  if (o.lantern) { const a = pose.armF || { a1: 1.2, a2: 1.42 }; const hx = (80 + Math.cos(a.a1) * 92 + Math.cos(a.a2) * 86) * s, hy = (-352 + Math.sin(a.a1) * 92 + Math.sin(a.a2) * 86) * s; lantern(ctx, hx, hy + 8 * s, s, t, sw); }
  ctx.restore();
}
export function lantern(ctx, x, y, s, t, sw = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(sw * 0.12 + Math.sin(t * 3.1) * 0.04); ctx.scale(s * 1.2, s * 1.2);
  ink(ctx, spline([[-18, 0], [0, -22], [18, 0]], false, 5), 4, { seed: 5001, taper: false });
  shape(ctx, rrect(-26, 0, 52, 14, 4), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  shape(ctx, rrect(-22, 12, 44, 58, 8), { fill: '#FFE9A0', line: 4, seed: 5002, grain: 0.1 });
  shape(ctx, ellipse(0, 44, 8, 14 + Math.sin(t * 17) * 2, 10), { fill: PAL.coral, line: 0, grain: 0, off: [0, 0] });
  shape(ctx, rrect(-28, 68, 56, 12, 4), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  ctx.restore();
}
// Pip: hop/fly helpers. o = { x, y, s, flip, fly (bool), flapRate, look, dizzy }
export function pip(ctx, t, o) {
  const s = o.s ?? 0.7, fl = o.fly ? 0.5 + 0.5 * Math.sin(t * TAU * (o.flapRate || 4)) : (o.flap ?? 0);
  const hov = o.fly ? Math.sin(t * TAU * (o.flapRate || 4) + 1.2) * 8 : 0;
  ctx.save(); ctx.translate(o.x, o.y + hov); ctx.scale(1, breathe(t, 0.4, 0.015, 1));
  drawPip(ctx, 0, 0, s, { flip: o.flip, flying: o.fly, flap: fl, look: o.look || [1, 0], blink: o.blink ?? autoBlink(t, 21), dizzy: o.dizzy });
  ctx.restore();
}
export function mabel(ctx, t, o) {
  const s = o.s ?? 0.7;
  ctx.save(); ctx.translate(o.x, o.y + (o.bob || 0)); if (o.flip) ctx.scale(-1, 1); ctx.scale(1, breathe(t, o.sleepy ? 0.18 : 0.25, o.sleepy ? 0.03 : 0.012, 2));
  drawMabel(ctx, 0, 0, s, { sleepy: o.sleepy, look: o.look || [0, 0], blink: o.blink ?? autoBlink(t, 31), zzz: o.sleepy ? t * 0.45 : 0 });
  ctx.restore();
}
export function rollo(ctx, t, o) {
  const s = o.s ?? 0.7;
  ctx.save(); ctx.translate(o.x, o.y + (o.bob || 0)); ctx.scale(1, breathe(t, 0.5, 0.02, 3) * (o.squash || 1));
  drawRollo(ctx, 0, 0, s, { flip: o.flip, look: o.look || [0, 0], blink: o.blink ?? autoBlink(t, 41), paint: o.paint, sweat: o.sweat, burp: o.burp, guilty: o.guilty });
  ctx.restore();
}
// a hop arc between two points (Rollo, Pip landing). Returns {x, y, squash}
export function hop(t, t0, d, x0, y0, x1, y1, h = 120) {
  const k = seg(t, t0, t0 + d);
  if (t < t0) { const a = seg(t, t0 - 0.18, t0); return { x: x0, y: y0, squash: 1 - 0.18 * Math.sin(a * Math.PI / 2) }; }
  if (k >= 1) { const a = seg(t, t0 + d, t0 + d + 0.3); return { x: x1, y: y1, squash: 1 - 0.22 * Math.sin(a * Math.PI) * (1 - a) }; }
  return { x: lerp(x0, x1, k), y: lerp(y0, y1, k) - Math.sin(k * Math.PI) * h, squash: 1.12 };
}

// ---- The Harbour Master (new, original): tall navy greatcoat, white peaked cap, grey walrus moustache, ruddy face.
// Feet at (0,0), height ≈ 600 at s = 1. o = { s, point (0..1 arm raise), face: 'angry'|'neutral', look, shout (0..1 mouth) }
const HM = { coat: '#2E3A55', coatD: '#1F2840', cap: '#FBF6EA', face: '#E9A88A', faceD: '#C9826A', tache: '#9A9A96', gold: '#E8B43A' };
export function drawMaster(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s * breathe(t, 0.3, 0.012, 4));
  [[-34, 0], [34, 1]].forEach(([lx, i]) => { shape(ctx, rrect(lx - 20, -150, 40, 140, 10), { fill: HM.coatD, line: 4, seed: 6000 + i, grain: 0.2 }); shape(ctx, ellipse(lx, -14, 36, 18, 18), { fill: PAL.ink, line: 0, seed: 6002 + i, grain: 0, off: [0, 0] }); });
  // back arm on hip
  ink(ctx, spline([[-70, -430], [-118, -350], [-80, -300]], false, 6), 30, { seed: 6010, taper: false, wob: 0.05, color: HM.coat });
  const coat = spline([[-74, -470], [-40, -500], [40, -500], [74, -470], [96, -240], [106, -140], [-106, -140], [-96, -240]], true, 8);
  shape(ctx, coat, { fill: HM.coat, line: 4.4, seed: 6020, grain: 0.3, shade: [{ pts: [[-10, -500], [10, -500], [10, -140], [-10, -140]], color: HM.coatD }] });
  for (let k = 0; k < 4; k++) [[-26], [26]].forEach(([bx], j) => shape(ctx, ellipse(bx, -440 + k * 70, 8, 8, 10), { fill: HM.gold, line: 2.5, seed: 6030 + k * 2 + j, grain: 0 }));
  // pointing arm: from shoulder (70,-460) to target angle
  const p = o.point ?? 0, a = lerp(1.3, -0.25, ss(p)), jab = p > 0.9 ? Math.sin(t * TAU * 3) * 0.05 : 0;
  const sh = [70, -455], el = [sh[0] + Math.cos(a + 0.25) * 110, sh[1] + Math.sin(a + 0.25) * 110], ha = [el[0] + Math.cos(a + jab) * 105, el[1] + Math.sin(a + jab) * 105];
  ink(ctx, spline([sh, el, ha], false, 6), 30, { seed: 6040, taper: false, wob: 0.05, color: HM.coat });
  shape(ctx, ellipse(ha[0], ha[1], 17, 15, 14), { fill: HM.face, line: 3.5, seed: 6041, grain: 0.1 });
  if (p > 0.5) ink(ctx, [[ha[0] + 8, ha[1]], [ha[0] + 8 + Math.cos(a + jab) * 34, ha[1] + Math.sin(a + jab) * 34]], 10, { seed: 6042, taper: false, color: HM.face });
  // head
  shape(ctx, ellipse(0, -560, 62, 66, 36), { fill: HM.face, line: 4.2, seed: 6050, grain: 0.15 });
  shape(ctx, ellipse(0, -552, 17, 13, 14), { fill: HM.faceD, line: 3.2, seed: 6051, grain: 0.1 });
  const ang = o.face === 'angry';
  [-24, 24].forEach((ex, i) => {
    const bl = o.blink ?? autoBlink(t, 61);
    if (bl) ink(ctx, [[ex - 8, -582], [ex + 8, -582]], 4, { seed: 6052 + i, taper: false });
    else shape(ctx, ellipse(ex + (o.look?.[0] || 0), -582, 6, 8, 10), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
    ink(ctx, [[ex - 16, ang ? -606 + i * 0 - (i ? 8 : -8) * 0 + (i ? -2 : 6) : -604], [ex + 16, ang ? -598 + (i ? 6 : -2) - 8 : -606]], 7, { seed: 6054 + i, color: '#6E6E6A', taper: true });
  });
  // walrus moustache + shouting mouth
  const sh2 = o.shout ?? 0;
  if (sh2 > 0.05) shape(ctx, ellipse(0, -516, 18, 6 + sh2 * 16, 14), { fill: PAL.coralD, line: 3.4, seed: 6060, grain: 0 });
  shape(ctx, spline([[-54, -524], [-30, -546], [0, -536], [30, -546], [54, -524], [36, -518], [14, -528], [0, -522], [-14, -528], [-36, -518]], true, 5), { fill: HM.tache, line: 3.6, seed: 6061, grain: 0.3 });
  // peaked cap
  shape(ctx, spline([[-70, -610], [-62, -650], [0, -664], [62, -650], [70, -610]], true, 6), { fill: HM.cap, line: 4.2, seed: 6070, grain: 0.2 });
  shape(ctx, rrect(-72, -618, 144, 16, 6), { fill: PAL.ink, line: 0, seed: 6071, grain: 0, off: [0, 0] });
  shape(ctx, spline([[-60, -604], [0, -612], [64, -604], [80, -592], [-40, -594]], true, 5), { fill: PAL.ink, line: 0, seed: 6072, grain: 0, off: [0, 0] });
  shape(ctx, ellipse(0, -632, 11, 11, 12), { fill: HM.gold, line: 2.6, seed: 6073, grain: 0 });
  ctx.restore();
}

// ---- The Stranger (new, original; season mystery): yellow oilskin coat, hood up, seen ONLY from behind, never speaks.
// The tell (fair clue for the season): the Stranger casts no shadow. Feet at (0,0), height ≈ 560 at s = 1.
export const YC = { coat: '#E8B43A', coatD: '#C08A1E', coatL: '#F3D37F', boot: '#2B2420' };
export function drawStranger(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wind = Math.sin(t * TAU * 0.9) * 0.5 + Math.sin(t * TAU * 2.3) * 0.25;   // hem flutter in the wind
  [[-26, 0], [26, 1]].forEach(([lx, i]) => { shape(ctx, rrect(lx - 18, -110, 36, 100, 8), { fill: YC.boot, line: 3, seed: 6100 + i, grain: 0.1 }); shape(ctx, ellipse(lx, -10, 30, 13, 16), { fill: YC.boot, line: 0, grain: 0, off: [0, 0] }); });
  const hem = 18 * wind;
  const coat = spline([[-62, -430], [-30, -470], [30, -470], [62, -430], [92, -250], [118 + hem, -96], [60 + hem * 0.6, -90 + Math.abs(hem) * 0.3], [0, -100], [-60 + hem * 0.4, -90], [-112 + hem * 0.5, -98], [-90, -250]], true, 8);
  shape(ctx, coat, { fill: YC.coat, line: 4.4, seed: 6110, grain: 0.3, shade: [{ pts: [[-6, -470], [6, -470], [10, -96], [-10, -96]], color: YC.coatD }, { pts: [[40, -440], [92, -250], [118 + hem, -96], [70, -96]], color: YC.coatD, alpha: 0.6 }] });
  [[-1, 0], [1, 1]].forEach(([d, i]) => ink(ctx, spline([[d * 60, -430], [d * 84, -330], [d * 80, -250]], false, 6), 28, { seed: 6120 + i, taper: false, color: YC.coat, wob: 0.05 }));
  // hood from behind: a rounded cowl with a seam
  shape(ctx, spline([[-58, -440], [-66, -510], [-40, -570], [0, -586], [40, -570], [66, -510], [58, -440], [0, -428]], true, 8), { fill: YC.coat, line: 4.4, seed: 6130, grain: 0.3, shade: [{ pts: ellipse(30, -500, 30, 70, 16), color: YC.coatD, alpha: 0.5 }] });
  ink(ctx, spline([[0, -584], [-4, -520], [0, -440]], false, 6), 3, { seed: 6131, color: YC.coatD });
  ctx.restore();
}
