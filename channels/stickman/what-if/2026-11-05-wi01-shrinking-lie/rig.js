// Our stickman rig: the round-head hand-drawn look (big white head, ink limbs) with REAL motion:
// two-bone IK legs with planted feet, swinging arms, squash-and-stretch on every beat, blinks, look-at eyes.
// Feet at (x, y). h = body height factor (the head never shrinks: that is the joke of this episode).
import { PAL, shape, ink, ellipse, rrect, rect, spline, TAU, clamp, lerp, hash } from './engine/toon.js';

export const INK = '#1F1D1B';
const HEAD = 64, TORSO = 170, THIGH = 98, SHIN = 98, UARM = 82, FARM = 78;
const C = { line: 9 };
const ik = (hx, hy, fx, fy, l1, l2, bend = 1) => {               // knee/elbow from hip/shoulder to foot/hand
  let dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy); const m = l1 + l2 - 0.01;
  if (d > m) { fx = hx + dx / d * m; fy = hy + dy / d * m; dx = fx - hx; dy = fy - hy; d = m; }
  const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), k = a - bend * Math.acos(c);
  return [[hx, hy], [hx + Math.cos(k) * l1, hy + Math.sin(k) * l1], [fx, fy]];
};
const limb = (ctx, pts, seed, w = C.line, color = INK) => ink(ctx, spline(pts, false, 5), w, { color, seed, taper: false, wob: 0.25 });

// walk(phase) → foot offsets for the two legs: planted foot slides back, swing foot lifts
export function walkFeet(ph, stride) {
  const f = p => { const u = ((p % 1) + 1) % 1; return u < 0.5 ? [lerp(stride, -stride, u * 2), 0] : [lerp(-stride, stride, (u - 0.5) * 2), -Math.sin((u - 0.5) * 2 * Math.PI) * stride * 0.55]; };
  return [f(ph), f(ph + 0.5)];
}

/* p: { x, y, h, s, sq (squash 0 = none, + = squashed), lean, face, look:[x,y], blink, mouth, brows,
        armL:[a1,a2] | {hand:[x,y]}, armR, feet: [[dx,dy],[dx,dy]] (relative to x,y), hair, tie, glasses, pants, sag, boxers, flip } */
export function stick(ctx, p) {
  const s = p.s ?? 1, h = p.h ?? 1, sq = p.sq ?? 0;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s * (p.flip ? -1 : 1) * (1 + sq * 0.25), s * (1 - sq * 0.3)); ctx.rotate(p.lean || 0);
  const th = THIGH * h, sh = SHIN * h, to = TORSO * h, ua = UARM * Math.sqrt(h), fa = FARM * Math.sqrt(h);
  const sx = s * (1 + sq * 0.25) * (p.flip ? -1 : 1), sy = s * (1 - sq * 0.3);
  const toL = ([x, y]) => [(x - p.x) / sx, (y - p.y) / sy];          // world → this rig's local space (targets are given in world px)
  const feet = p.feet || [[-26, 0], [26, 0]];
  const hipY = -(th + sh) * 0.97 + (p.bob || 0), hip = [0, hipY], neck = [0, hipY - to], sho = [0, hipY - to + 26];
  // legs (IK, knees bend forward)
  const legs = feet.map(([fx, fy], i) => ik(hip[0], hip[1], fx, fy, th, sh, i ? -1 : -1));
  // trousers: drawn ON the legs, sized for the full-height body; the spare cloth bunches at the ankles
  if (p.pants) {
    const sag = p.sag ?? 0, extra = (1 - h) * 190;
    const waist = hipY + sag * (th + sh) * 0.92;
    if (p.boxers && sag > 0.3) shape(ctx, rrect(-34, hipY - 26, 68, 62, 14), { fill: PAL.white, line: 5, lineColor: INK, seed: 5100, grain: 0, breaks: 0, off: [0, 0], shade: [0, 1, 2].map(k => ({ pts: rect(-34, hipY - 18 + k * 20, 68, 8), color: PAL.coral })) });
    legs.forEach((L, i) => {
      const pts = sag > 0.3 ? [[L[2][0], L[2][1] - 30], L[2]] : [[L[0][0] + (i ? 8 : -8), waist], L[1], L[2]];
      ink(ctx, spline(pts, false, 5), 30, { color: p.pants, seed: 5110 + i, taper: false, wob: 0.2 });
      const bunch = extra * 0.4 + (sag > 0.3 ? 40 : 0);
      if (bunch > 4) { const zz = []; for (let k = 0; k <= 6; k++) zz.push([L[2][0] + (k % 2 ? 22 : -22), L[2][1] - 8 - k * bunch / 6]); ink(ctx, zz, 14, { color: p.pants, seed: 5120 + i, taper: false }); ink(ctx, zz, 3, { color: INK, seed: 5125 + i, taper: false, alpha: 0.5 }); }
    });
    if (sag <= 0.3) shape(ctx, rrect(-26, waist - 14, 52, 26, 8), { fill: p.pants, line: 0, seed: 5130, grain: 0, breaks: 0, off: [0, 0] });
  }
  legs.forEach((L, i) => { limb(ctx, L, 5000 + i); ink(ctx, [L[2], [L[2][0] + 22, L[2][1]]], C.line, { color: INK, seed: 5005 + i, taper: false }); });
  // body
  ink(ctx, [hip, neck], C.line + 1, { color: INK, seed: 5010, taper: false, wob: 0.2 });
  if (p.tie) shape(ctx, [[0, neck[1] + 8], [12, neck[1] + 24], [6, neck[1] + 90], [0, neck[1] + 104], [-6, neck[1] + 90], [-12, neck[1] + 24]], { fill: p.tie, line: 3.5, lineColor: INK, seed: 5015, grain: 0, breaks: 0, off: [0, 0] });
  // arms: angles (a1 upper, a2 forearm; 0 = right, PI/2 = down) or IK to a hand target
  const arm = (A, side, seed) => {
    let pts;
    if (A && A.hand) { const [lx, ly] = toL(A.hand); pts = ik(sho[0], sho[1], lx, ly, ua, fa, side > 0 ? 1 : -1); }
    else { const [a1, a2] = A || [Math.PI / 2 - side * 0.25, Math.PI / 2 - side * 0.1]; const e = [sho[0] + Math.cos(a1) * ua, sho[1] + Math.sin(a1) * ua]; pts = [sho, e, [e[0] + Math.cos(a2) * fa, e[1] + Math.sin(a2) * fa]]; }
    limb(ctx, pts, seed);
    const hd = pts[2];
    if (A && A.thumb) { shape(ctx, ellipse(hd[0], hd[1], 13, 13, 12), { fill: INK, line: 0, grain: 0, breaks: 0, off: [0, 0] }); ink(ctx, [hd, [hd[0], hd[1] - 26]], 9, { color: INK, seed: seed + 3, taper: false }); }
    else shape(ctx, ellipse(hd[0], hd[1], 10, 10, 12), { fill: INK, line: 0, grain: 0, breaks: 0, off: [0, 0] });
    return hd;
  };
  if (p.prop) p.prop(ctx, toL);
  const hands = [arm(p.armL, -1, 5020), arm(p.armR, 1, 5030)];
  // head
  const hc = [0, neck[1] - HEAD + 6];
  if (p.hair === 'curls') { for (let k = 0; k < 16; k++) { const a = Math.PI + k / 15 * Math.PI * 1.05 - 0.03, r = HEAD * 1.18 + hash(k, 3) * 18; shape(ctx, ellipse(hc[0] + Math.cos(a) * r, hc[1] + Math.sin(a) * r * 0.95 - 4, 30 + hash(k, 1) * 10, 30 + hash(k, 2) * 10, 14), { fill: p.hairCol || INK, line: 4, lineColor: INK, seed: 5200 + k, grain: 0, breaks: 0, off: [0, 0] }); }
    for (let k = 0; k < 7; k++) { const a = Math.PI * 0.6 + k * 0.32; shape(ctx, ellipse(hc[0] + Math.cos(a) * HEAD * 1.05, hc[1] + Math.sin(a) * HEAD * 0.6 + 26, 24, 26, 12), { fill: p.hairCol || INK, line: 4, lineColor: INK, seed: 5230 + k, grain: 0, breaks: 0, off: [0, 0] }); } }
  shape(ctx, ellipse(hc[0], hc[1], HEAD, HEAD * 0.98, 40), { fill: PAL.white, line: 7, lineColor: INK, seed: 5040, grain: 0, breaks: 0, off: [0, 0] });
  if (p.hair === 'tuft') ink(ctx, spline([[-8, hc[1] - HEAD + 2], [-2, hc[1] - HEAD - 26], [12, hc[1] - HEAD - 20], [6, hc[1] - HEAD + 2]], false, 6), 6, { color: INK, seed: 5045, taper: true });
  if (p.hair === 'bald') ink(ctx, spline([[-HEAD + 6, hc[1] - 6], [-HEAD + 14, hc[1] - 30], [-HEAD + 30, hc[1] - 38]], false, 4), 8, { color: INK, seed: 5046 });
  if (p.hair === 'spike') for (let k = 0; k < 5; k++) ink(ctx, [[-36 + k * 18, hc[1] - HEAD + 10], [-40 + k * 20, hc[1] - HEAD - 22]], 7, { color: INK, seed: 5047 + k, taper: true });
  if (p.hair === 'bob') { shape(ctx, spline([[-HEAD - 8, hc[1] + 30], [-HEAD - 6, hc[1] - 40], [0, hc[1] - HEAD - 14], [HEAD + 6, hc[1] - 40], [HEAD + 8, hc[1] + 30], [HEAD - 16, hc[1] + 24], [HEAD - 10, hc[1] - 20], [0, hc[1] - HEAD + 18], [-HEAD + 10, hc[1] - 20], [-HEAD + 16, hc[1] + 24]], true, 6), { fill: p.hairCol || INK, line: 4, lineColor: INK, seed: 5050, grain: 0, breaks: 0, off: [0, 0] }); }
  face(ctx, hc, p);
  if (p.glasses) [[-22, 0], [22, 1]].forEach(([gx, i]) => ink(ctx, rrect(hc[0] + gx - 17, hc[1] - 18, 34, 26, 6), 4, { closed: true, color: INK, seed: 5060 + i, taper: false }));
  if (p.sweat) { const k = p.sweat % 1; shape(ctx, spline([[HEAD * 0.7, hc[1] - 40 + k * 50], [HEAD * 0.7 + 9, hc[1] - 22 + k * 50], [HEAD * 0.7, hc[1] - 12 + k * 50], [HEAD * 0.7 - 9, hc[1] - 22 + k * 50]], true, 4), { fill: '#8FD3F4', line: 3, lineColor: INK, seed: 5070, grain: 0, breaks: 0, off: [0, 0], alpha: 1 - Math.max(0, k - 0.75) * 4 }); }
  ctx.restore();
  return { hands: hands.map(([hx, hy]) => [p.x + hx * sx, p.y + hy * sy]), head: [p.x, p.y + hc[1] * sy] };
}
function face(ctx, [cx, cy], p) {
  const lk = p.look || [0, 0], ex = 22, ey = cy - 8;
  const mood = p.face || 'smile';
  // eyes
  [[-ex, 0], [ex, 1]].forEach(([dx, i]) => {
    if (p.blink || mood === 'squint') ink(ctx, [[cx + dx - 8, ey], [cx + dx + 8, ey]], 5, { color: INK, seed: 5300 + i, taper: false });
    else { const big = mood === 'shock' ? 1.35 : 1; shape(ctx, ellipse(cx + dx + lk[0], ey + lk[1], 7.5 * big, 10 * big, 12), { fill: INK, line: 0, grain: 0, breaks: 0, off: [0, 0] }); shape(ctx, ellipse(cx + dx + lk[0] + 2.5, ey + lk[1] - 4, 2.4, 2.4, 8), { fill: PAL.white, line: 0, grain: 0, breaks: 0, off: [0, 0] }); }
  });
  // brows
  const br = { worried: [0.35, -0.35], angry: [-0.35, 0.35], shock: [0.15, -0.15], sad: [0.4, -0.4], wince: [-0.4, 0.4] }[mood] || [0, 0];
  if (mood !== 'smile' && mood !== 'grin') [[-ex, 0], [ex, 1]].forEach(([dx, i]) => { const a = br[i]; ink(ctx, [[cx + dx - 11 * Math.cos(a), cy - 34 - (mood === 'shock' ? 8 : 0) + 11 * Math.sin(a) * (i ? -1 : 1)], [cx + dx + 11 * Math.cos(a), cy - 34 - (mood === 'shock' ? 8 : 0) - 11 * Math.sin(a) * (i ? -1 : 1)]], 5, { color: INK, seed: 5310 + i, taper: false }); });
  // mouth
  const my = cy + 26, talk = p.talk ? (0.35 + 0.65 * Math.abs(Math.sin(p.talk * 11))) : 0;
  if (mood === 'grin' || mood === 'fake') { shape(ctx, [[cx - 24, my - 6], [cx + 24, my - 6], [cx + 16, my + 12], [cx, my + 16], [cx - 16, my + 12]], { fill: '#7A2E2A', line: 4.5, lineColor: INK, seed: 5320, grain: 0, breaks: 0, off: [0, 0] }); if (mood === 'fake') ink(ctx, [[cx - 22, my - 5], [cx + 22, my - 5]], 6, { color: PAL.white, seed: 5321, taper: false }); }
  else if (mood === 'shock' || talk > 0) shape(ctx, ellipse(cx, my + 2, 10 + talk * 4, 8 + (mood === 'shock' ? 8 : talk * 9), 14), { fill: '#7A2E2A', line: 4.5, lineColor: INK, seed: 5322, grain: 0, breaks: 0, off: [0, 0] });
  else if (mood === 'sad' || mood === 'worried') ink(ctx, spline([[cx - 16, my + 8], [cx, my - 2], [cx + 16, my + 8]], false, 5), 5, { color: INK, seed: 5323, taper: false });
  else if (mood === 'wince') ink(ctx, [[cx - 20, my + 2], [cx - 10, my - 4], [cx, my + 4], [cx + 10, my - 4], [cx + 20, my + 2]], 5, { color: INK, seed: 5324, taper: false });
  else if (mood === 'flat' || mood === 'angry' || mood === 'squint') ink(ctx, [[cx - 14, my + 2], [cx + 14, my + 2]], 5, { color: INK, seed: 5325, taper: false });
  else ink(ctx, spline([[cx - 18, my - 2], [cx, my + 10], [cx + 18, my - 2]], false, 5), 5, { color: INK, seed: 5326, taper: false });
}
