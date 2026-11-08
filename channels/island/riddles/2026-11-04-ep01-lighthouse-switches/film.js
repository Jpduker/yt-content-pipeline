// Episode 01 "The Lighthouse Switches": a riddle Short in the mid-century cartoon style.
// 1080x1920, 24 fps, 40.0 s = 20 bars at 120 BPM. Every value is a function of t (deterministic).
import { PAL, setClock, shape, plane, ink, rays, ellipse, rect, rrect, spline, move, xform, star, sparkle, text, fit, measure,
  dashed, paperFinish, subpath, pointAt, plen, clamp, lerp, seg, ss, eo, eio, back, twos, TAU, hash } from './engine/toon.js';
import { drawKeeper, drawHand, sleeve, KC } from './keeper.js';

export const W = 1080, H = 1920, BPM = 120, BEAT = 0.5, DURATION = 40.0;
const COL = { paper: PAL.paper, ink: PAL.ink, accent: PAL.coral, panel: PAL.teal, panelD: PAL.tealD,
  sw: [PAL.coral, PAL.mustard, PAL.blue], skyHi: '#5A4466', skyMid: '#7C6A8E', skyLo: '#E9A37E', sea: PAL.tealD, seaL: PAL.teal,
  tower: '#FBF6EA', band: PAL.coral, inside: '#F2E3C4', insideD: '#E6D2AC', step: PAL.kraft, stepD: PAL.kraftD, glass: '#B9D6DA' };

// ---------------------------------------------------------------- voice + captions (start times on the beat grid)
const LINES = [
  ['hook', 0.25], ['climb', 4.25], ['rule1', 8.25], ['rule2', 10.75], ['ask', 13.25], ['comment', 14.75], ['trick', 21.0],
  ['step1', 22.25], ['step2', 25.25], ['lit', 29.75], ['warm', 31.5], ['cold', 33.25], ['moral', 35.25], ['outro', 37.25]];
const KEY = { hook: ['one'], climb: ['120'], rule1: ['like.'], rule2: ['once.'], ask: ['which'], trick: ['trick.'], step1: ['1,', '5', 'minutes.'],
  step2: ['climb.'], lit: ['2.'], warm: ['warm?', '1.'], cold: ['cold?', '3.'], moral: ['heat.'], comment: ['answer!'], outro: ['riddle.'] };
const NOCAP = new Set(['comment', 'outro']);            // the picture already carries these words, big
let V = [], DUR = {}, TXT = {};
export function setup(lines, durs) {
  DUR = durs; lines.forEach(l => TXT[l.id] = l.caption || l.text);
  V = LINES.map(([id, t], i) => ({ id, t, dur: DUR[id] ?? 2, text: TXT[id], next: LINES[i + 1] ? LINES[i + 1][1] : DURATION }));
  buildEvents();
}
function cues() {
  return V.map(v => ({ ...v, t0: v.t, t1: Math.min(v.next - 0.08, v.t + Math.max(1.8, v.dur + 0.6, v.text.length / 12 + 1)) }));
}
export function srtCues() { return cues().map(c => ({ t0: c.t0, t1: c.t1, text: c.text })); }

// ---------------------------------------------------------------- world geometry (world px; tower centre x = 540)
const BASE = 5600, ROOM = 4900, TOP = 900, FL = 8, FH = (ROOM - TOP) / FL, XL = 215, XR = 865, STEPS = 15;
const PANEL = { x: 600, y: 5250, w: 520, h: 300 }, SWX = [-170, 0, 170].map(d => PANEL.x + d), SWY = 5225;
const BULB = { x: 540, y: 640, r: 104 };
const halfW = y => lerp(470, 380, clamp((BASE - y) / (BASE - TOP)));
// the climbing path: ladder through the hatch, 8 flights of 15 steps, then the lamp-room floor
const ROUTE = (() => { const p = [[XL - 40, BASE - 10], [XL - 40, ROOM - 10]]; for (let k = 0; k <= FL; k++) p.push([k % 2 ? XR : XL, ROOM - k * FH - 10]); p.push([BULB.x - 80, TOP - 10]); return p; })();
const dens = (P, st = 8) => { const o = [P[0]]; for (let i = 1; i < P.length; i++) { const [a, b] = [P[i - 1], P[i]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / st)); for (let k = 1; k <= n; k++) o.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } return o; };
const ROUTE_D = dens(ROUTE);
const ROUTE_LEN = plen(ROUTE);
const stepsAt = u => { const L = u * ROUTE_LEN, ladder = BASE - ROOM; return clamp(Math.round((L - ladder) / (ROUTE_LEN - ladder - 280) * 120), 0, 120); };

// ---------------------------------------------------------------- timeline helpers
const pop = (t, t0, d = 0.28) => back(seg(t, t0, t0 + d), 1.9);
const swState = (i, t) => {                           // lever angle progress 0 = off (down), 1 = on (up)
  if (t > 35.5) return 0;                             // reset while the camera is up top (keeps the loop seamless)
  const flip = (a, b) => back(seg(t, a, a + 0.14), 1.6) * (b - 0) ;
  if (i === 0) return clamp(flip(23.0, 1) - back(seg(t, 25.5, 25.64), 1.6), -0.15, 1.15);
  if (i === 1) return flip(26.25, 1);
  return 0;
};
const lampLit = t => t > 29.5 && t < 39.6;
const HOOKCAM = { cx: 600, cy: 5302, z: 1.55 };
const keeperRoute = t => seg(t, 27.55, 29.45);
function camAt(t) {
  const top = { cx: 540, cy: 820, z: 0.95 }, baseWide = { cx: 540, cy: 5256, z: 0.9 }, med = { cx: 420, cy: 5282, z: 1.15 }, panel = { cx: 600, cy: 5302, z: 1.5 };
  const L = (a, b, k) => ({ cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: lerp(a.z, b.z, k) });
  if (t < 4.0) return { ...HOOKCAM, z: lerp(1.55, 1.6, ss(t / 4)) };
  if (t < 8.0) { const zk = eio(seg(t, 4.0, 4.9)), yk = eio(seg(t, 4.4, 7.8)); return { cx: lerp(600, 540, zk), cy: lerp(5302, top.cy, yk), z: lerp(1.6, top.z, zk) }; }
  if (t < 14.4) { const k = eio(seg(t, 8.0, 8.55)); const c = L(top, baseWide, k); c.z *= lerp(1, 1.05, ss(seg(t, 8.6, 14.4))); return c; }
  if (t < 22.0) return L({ ...baseWide, z: 0.945 }, med, eio(seg(t, 14.4, 14.9)));
  if (t < 27.45) return L(med, panel, eio(seg(t, 22.0, 22.4)));
  if (t < 29.5) {                                      // follow the keeper up the stairs
    const kp = keeperPos(t), f = { cx: lerp(540, kp[0], 0.35), cy: kp[1] - 260, z: 1.0 };
    return L(panel, f, eio(seg(t, 27.45, 27.75)));
  }
  if (t < 39.0) return { ...top, z: lerp(1.0, 1.05, ss(seg(t, 35.2, 39))) };
  return L({ ...top, z: 1.05 }, HOOKCAM, eio(seg(t, 39.0, 39.96)));
}
function keeperPos(t) { const u = eio(keeperRoute(t)); const p = pointAt(ROUTE, Math.max(0.0005, u)); return [p.x, p.y + 10]; }
const w2s = (x, y, c) => [W / 2 + (x - c.cx) * c.z, H / 2 + (y - c.cy) * c.z];

// ---------------------------------------------------------------- world drawing
function sky(ctx) {
  plane(ctx, rect(-3000, -3000, 7000, 3000 + 2200), COL.skyHi, { grain: 0.15 });
  plane(ctx, rect(-3000, 2200, 7000, 1800), COL.skyMid, { grain: 0.15 });
  plane(ctx, rect(-3000, 4000, 7000, 1300), COL.skyLo, { grain: 0.15 });
  for (let i = 0; i < 46; i++) { const x = -400 + hash(i, 1) * 1900, y = -200 + hash(i, 2) * 2600; sparkle(ctx, x, y, 8 + hash(i, 3) * 16, { fill: PAL.white, alpha: 0.55 + 0.45 * hash(i, 4), rot: hash(i, 5) }); }
  shape(ctx, ellipse(150, 240, 70, 70, 40), { fill: '#F7EBC6', line: 0, seed: 401, grain: 0.2 });
  shape(ctx, ellipse(178, 222, 62, 62, 40), { fill: COL.skyHi, line: 0, seed: 402, grain: 0, off: [0, 0] });
}
function sea(ctx, t) {
  const y0 = BASE - 150;
  plane(ctx, rect(-3000, y0, 7000, 2000), COL.sea, { grain: 0.2 });
  for (let r = 0; r < 4; r++) {
    const pts = []; for (let x = -1200; x <= 2400; x += 40) pts.push([x, y0 + 40 + r * 90 + Math.sin(x / 90 + twos(t) * 2 + r) * 12]);
    ink(ctx, pts, 5, { color: COL.seaL, seed: 410 + r, taper: false, breaks: 0.35 });
  }
  // rocks at the foot of the tower, then a warm stone foundation that fills the frame bottom
  shape(ctx, spline([[-300, BASE + 60], [0, BASE - 90], [200, BASE - 40], [880, BASE - 80], [1400, BASE + 60], [1400, BASE + 900], [-300, BASE + 900]], true, 6), { fill: PAL.brown, line: 4, seed: 420, grain: 0.4 });
  const fw = halfW(BASE) + 60;
  shape(ctx, rect(540 - fw, BASE + 20, fw * 2, 900), { fill: '#C9B08A', line: 5, seed: 421, grain: 0.45, breaks: 0.1 });
  for (let r = 0; r < 9; r++) { const y = BASE + 20 + r * 90; ink(ctx, [[540 - fw, y], [540 + fw, y]], 3.5, { seed: 422 + r, taper: false, breaks: 0.3, color: '#8C7556' });
    for (let x = 540 - fw + (r % 2 ? 60 : 0); x < 540 + fw; x += 120) ink(ctx, [[x, y], [x, y + 90]], 3, { seed: 440 + r * 13 + x, taper: false, color: '#8C7556' }); }
}
function tower(ctx, t) {
  // outside silhouette with coral bands (seen at the cut edges)
  const out = [[540 - halfW(BASE), BASE], [540 - halfW(TOP), TOP], [540 + halfW(TOP), TOP], [540 + halfW(BASE), BASE]];
  shape(ctx, out, { fill: COL.tower, line: 5, seed: 430, grain: 0.25, breaks: 0.1 });
  ctx.save(); ctx.beginPath(); out.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip();
  for (let k = 0; k < 6; k++) { const y = TOP + 220 + k * 780; plane(ctx, rect(-100, y, 1300, 300), COL.band, { grain: 0.3 }); }
  ctx.restore();
  // the cut: interior planes, one shade per flight
  for (let k = 0; k < FL; k++) {
    const yA = ROOM - k * FH, yB = yA - FH, wa = halfW(yA) - 46, wb = halfW(yB) - 46;
    plane(ctx, [[540 - wa, yA], [540 - wb, yB], [540 + wb, yB], [540 + wa, yA]], k % 2 ? COL.inside : COL.insideD, { grain: 0.3 });
    // a porthole on the wall the flight climbs away from
    const wx = k % 2 ? 540 + wb * 0.55 : 540 - wb * 0.55, wy = yA - FH * 0.62;
    shape(ctx, ellipse(wx, wy, 44, 44, 30), { fill: COL.skyMid, line: 7, seed: 440 + k, grain: 0.2, breaks: 0.1 });
    sparkle(ctx, wx - 10, wy - 8, 12, { fill: PAL.white, alpha: 0.8 });
  }
  // base room
  const wb = halfW(BASE) - 46, wr = halfW(ROOM) - 46;
  plane(ctx, [[540 - wb, BASE], [540 - wr, ROOM], [540 + wr, ROOM], [540 + wb, BASE]], '#EBD9B8', { grain: 0.3 });
  plane(ctx, rect(540 - wb - 10, BASE - 22, wb * 2 + 20, 60), PAL.brownL, { grain: 0.4 });
  // three wires from the panel up the wall into the ceiling (they all disappear upward: no hint)
  SWX.forEach((x, i) => ink(ctx, [[x, PANEL.y - PANEL.h / 2], [x + 6, PANEL.y - 260], [PANEL.x - 30 + i * 30, ROOM + 30], [PANEL.x - 30 + i * 30, ROOM - 10]], 6, { color: COL.sw[i], seed: 450 + i, taper: false, wob: 0.1 }));
  // ladder to the hatch
  [XL - 75, XL - 5].forEach((x, i) => ink(ctx, [[x, BASE - 20], [x, ROOM - 20]], 9, { seed: 460 + i, taper: false }));
  for (let y = BASE - 70; y > ROOM; y -= 70) ink(ctx, [[XL - 75, y], [XL - 5, y]], 6, { seed: 470 + y, taper: false });
  // flights: a saw-tooth of 15 steps each, with a landing slab at both ends
  for (let k = 0; k < FL; k++) {
    const yA = ROOM - k * FH, yB = yA - FH, x0 = k % 2 ? XR : XL, x1 = k % 2 ? XL : XR, dx = (x1 - x0) / STEPS, dy = (yB - yA) / STEPS;
    const pts = [[x0, yA + 34]]; for (let s = 0; s < STEPS; s++) { pts.push([x0 + dx * s, yA + dy * (s + 1)]); pts.push([x0 + dx * (s + 1), yA + dy * (s + 1)]); }
    pts.push([x1, yA + dy * STEPS + 34]);
    shape(ctx, [...pts, [x1, yB + 60]], { fill: COL.step, line: 4, seed: 480 + k, grain: 0.35, breaks: 0.12, shade: [{ pts: [[x0, yA + 34], [x1, yB + 34], [x1, yB + 60], [x0, yA + 60]], color: COL.stepD, alpha: 0.9 }] });
    shape(ctx, rrect(x1 - 70, yB - 8, 140, 34, 6), { fill: PAL.brownL, line: 4, seed: 490 + k, grain: 0.3 });
  }
  // lamp room: gallery, glass lantern, the bulb, dome
  shape(ctx, rrect(150, TOP - 20, 780, 46, 8), { fill: PAL.ink, line: 0, seed: 500, grain: 0.2, off: [0, 0] });
  for (let x = 170; x <= 910; x += 46) ink(ctx, [[x, TOP - 20], [x, TOP - 120]], 5, { seed: 510 + x, taper: false });
  ink(ctx, [[160, TOP - 120], [920, TOP - 120]], 7, { seed: 509, taper: false });
  shape(ctx, rect(330, 380, 420, 500), { fill: COL.glass, line: 6, seed: 520, grain: 0.15, shade: [{ pts: rect(330, 380, 90, 500), color: '#D4E7E9', alpha: 0.8 }] });
  [430, 540, 650].forEach((x, i) => ink(ctx, [[x, 380], [x, 880]], 6, { seed: 525 + i, taper: false }));
  shape(ctx, spline([[300, 384], [380, 250], [540, 196], [700, 250], [780, 384]], true, 8), { fill: PAL.plum, line: 5, seed: 530, grain: 0.3 });
  shape(ctx, ellipse(540, 172, 30, 30, 20), { fill: PAL.mustard, line: 4, seed: 531, grain: 0.2 });
  drawBulb(ctx, BULB.x, BULB.y, BULB.r, lampLit(t) ? 'lit' : 'off', t);
}
export function drawBulb(ctx, x, y, r, state, t) {
  if (state === 'lit') {
    rays(ctx, x, y, 28, r * 6, PAL.mustardL, { rot: twos(t) * 0.25, alpha: 0.55, r0: r * 1.1 });
    shape(ctx, ellipse(x, y, r * 1.5, r * 1.5, 48), { fill: PAL.mustardL, line: 0, seed: 540, grain: 0, alpha: 0.6, off: [0, 0] });
  }
  const fill = state === 'lit' ? '#FFF3B0' : state === 'warm' ? PAL.coralL : state === 'cold' ? PAL.blueL : '#E8E2D2';
  shape(ctx, spline([[x - r, y], [x - r * 0.7, y - r * 0.75], [x, y - r], [x + r * 0.7, y - r * 0.75], [x + r, y], [x + r * 0.55, y + r * 0.8], [x + r * 0.42, y + r * 1.2], [x - r * 0.42, y + r * 1.2], [x - r * 0.55, y + r * 0.8]], true, 8), { fill, line: 5.5, seed: 545, grain: 0.15 });
  shape(ctx, rrect(x - r * 0.46, y + r * 1.2, r * 0.92, r * 0.5, 8), { fill: PAL.chrome, line: 4.5, seed: 546, grain: 0.3, shade: [{ pts: rect(x - r * 0.46, y + r * 1.34, r * 0.92, 10), color: PAL.chromeD }] });
  ink(ctx, spline([[x - r * 0.3, y + r * 0.9], [x - r * 0.2, y + r * 0.1], [x, y + r * 0.35], [x + r * 0.2, y + r * 0.1], [x + r * 0.3, y + r * 0.9]], false, 6), 4, { seed: 547, color: state === 'lit' ? PAL.coral : PAL.inkSoft });
  sparkle(ctx, x - r * 0.45, y - r * 0.45, r * 0.22, { fill: PAL.white, alpha: 0.9 });
}
function drawPanel(ctx, t) {
  shape(ctx, rrect(PANEL.x - PANEL.w / 2, PANEL.y - PANEL.h / 2, PANEL.w, PANEL.h, 26), { fill: COL.panel, line: 6, seed: 560, grain: 0.35, breaks: 0.08, shade: [{ pts: rect(PANEL.x - PANEL.w / 2, PANEL.y + PANEL.h / 2 - 40, PANEL.w, 40), color: COL.panelD }] });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b], i) => shape(ctx, ellipse(PANEL.x + a * (PANEL.w / 2 - 24), PANEL.y + b * (PANEL.h / 2 - 24), 8, 8, 10), { fill: PAL.chrome, line: 2.5, seed: 565 + i, grain: 0 }));
  SWX.forEach((x, i) => {
    shape(ctx, rrect(x - 48, SWY - 78, 96, 156, 16), { fill: PAL.white, line: 4.5, seed: 570 + i, grain: 0.2 });
    const k = swState(i, t), a = lerp(Math.PI / 2 - 0.35, -Math.PI / 2 + 0.35, k);
    shape(ctx, ellipse(x, SWY, 22, 22, 20), { fill: PAL.chromeD, line: 3.5, seed: 575 + i, grain: 0.1 });
    const tip = [x + Math.cos(a) * 66, SWY + Math.sin(a) * 66];
    ink(ctx, [[x, SWY], tip], 24, { seed: 580 + i, taper: false, wob: 0.05 });
    ink(ctx, [[x, SWY], tip], 15, { seed: 585 + i, taper: false, wob: 0.05, color: COL.sw[i] });
    shape(ctx, ellipse(tip[0], tip[1], 17, 17, 16), { fill: COL.sw[i], line: 4, seed: 590 + i, grain: 0.1 });
    text(ctx, k > 0.5 ? 'ON' : 'OFF', x, SWY - 92, { font: '600 26px Jost', fill: PAL.white, align: 'center', track: 3, alpha: 0.9 });
    shape(ctx, ellipse(x, SWY + 112, 30, 30, 24), { fill: COL.sw[i], line: 4, seed: 595 + i, grain: 0.2 });
    text(ctx, String(i + 1), x, SWY + 125, { font: '38px Slab', fill: PAL.ink, plate: PAL.white, off: [3, 3], align: 'center' });
  });
}
function keeperPose(t) {
  const blink = [16.3, 19.1, 24.6, 33.9].some(b => t > b && t < b + 0.12) ? 1 : 0;
  const tw = twos(t);
  if (t >= 27.45 && t < 29.6) { const p = keeperPos(t); return { x: p[0], y: p[1], s: 0.42, face: 'happy', walk: (keeperRoute(t) * 30) % 1 }; }
  if (t >= 29.6) return { x: 790, y: TOP - 14, s: 0.5, face: 'happy', blink, look: [-14, -6], armF: { a1: -1.2, a2: -1.55 }, handF: { kind: 'point', a: -1.57 } };
  const aside = eio(seg(t, 22.0, 22.4));             // steps out of frame for the panel close-ups
  const base = { x: lerp(330, 40, aside), y: BASE - 22, s: 0.86, blink, look: [10, -4] };
  if (t >= 14.6 && t < 20.8) {                       // puzzled: scratching the cap on twos
    const sc = Math.sin(tw * 9) * 0.18;
    return { ...base, face: 'puzzled', look: [6, -10], armF: { a1: -1.3, a2: -2.16 + sc }, handF: { kind: 'grip', a: -2.3 + sc } };
  }
  if (t >= 20.8 && t < 27.45) {                       // eureka: finger up
    const k = back(seg(t, 21.0, 21.25), 1.8);
    return { ...base, face: t < 22.2 ? 'wow' : 'happy', look: [0, -12], armF: { a1: lerp(1.2, -1.2, k), a2: lerp(1.42, -1.55, k) }, handF: { kind: 'point', a: lerp(1.42, -1.57, k) } };
  }
  return { ...base, face: 'neutral', look: [16, -2] };
}
function world(ctx, t, c) {
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.cx, -c.cy);
  sky(ctx); sea(ctx, t); tower(ctx, t); drawPanel(ctx, t);
  // the route draws itself ahead of the camera during the first climb
  if (t >= 4.4 && t < 8.2) dashed(ctx, ROUTE_D, 9, 24, 16, -t * 60, PAL.coral, eio(seg(t, 4.4, 7.7)));
  if (t >= 27.45 && t < 29.6) dashed(ctx, ROUTE_D, 9, 24, 16, -t * 60, PAL.coral, eio(keeperRoute(t)));
  if (!(t >= 0 && t < 4.4) && !(t > 22.05 && t < 27.45 && false)) drawKeeper(ctx, keeperPose(t));
  ctx.restore();
}

// ---------------------------------------------------------------- overlays (screen space)
function stepCounter(ctx, t, n, t0, t1) {
  const a = Math.min(pop(t, t0), 1 - ss(seg(t, t1 - 0.2, t1))); if (a <= 0) return;
  ctx.save(); ctx.translate(200, 300); ctx.scale(a, a);
  star(ctx, 0, 0, 150, { n: 14, inner: 0.82, fill: PAL.white, off: [0, 0], rot: t * 0.2 });
  shape(ctx, ellipse(0, 0, 118, 118, 60), { fill: PAL.mustard, line: 5, seed: 600, grain: 0.3 });
  text(ctx, String(n), 0, 22, { font: '88px Slab', fill: PAL.ink, plate: PAL.white, off: [4, 4], align: 'center' });
  text(ctx, 'STEPS', 0, 66, { font: '600 26px Jost', fill: PAL.ink, align: 'center', track: 5 });
  ctx.restore();
}
function rule(ctx, t, t0, i, str, y) {
  const k = pop(t, t0, 0.24); if (k <= 0) return;
  const x = 150;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate((1 - k) * 0.4);
  star(ctx, 0, 0, 86, { n: 16, inner: 0.84, fill: PAL.white, off: [0, 0], rot: i * 0.2 });
  shape(ctx, ellipse(0, 0, 70, 70, 50), { fill: [PAL.blue, PAL.avocado, PAL.coral][i], line: 5, seed: 610 + i, grain: 0.3 });
  text(ctx, i === 2 ? '?' : String(i + 1), 0, 27, { font: '76px Slab', fill: PAL.ink, plate: PAL.white, off: [4, 4], align: 'center' });
  ctx.restore();
  const kc = pop(t, t0 + 0.12, 0.26); if (kc <= 0) return;
  const f = fit(ctx, str, '{px}px Slab', 50, 700, 1, 32), w = measure(ctx, f.lines[0], f.font) + 70;
  ctx.save(); ctx.translate(250, y); ctx.scale(kc, kc);
  shape(ctx, rrect(0, -48, w, 96, 14), { fill: COL.paper, line: 4, seed: 620 + i, grain: 0.15, off: [6, 5] });
  text(ctx, f.lines[0], 35, f.px * 0.36, { font: f.font, fill: PAL.ink, plate: i === 1 ? PAL.coralL : PAL.mustardL, off: [3, 3] });
  ctx.restore();
}
function countdown(ctx, t) {
  if (t < 14.5 || t >= 21.0) return;
  const tIn = pop(t, 14.55, 0.3), up = t >= 20.0;
  ctx.save(); ctx.translate(540, 430); ctx.scale(tIn, tIn);
  rays(ctx, 0, 0, 30, 560, PAL.mustardL, { rot: twos(t) * 0.15, alpha: 0.5 });
  star(ctx, 0, 0, 250, { n: 18, inner: 0.84, fill: up ? PAL.coral : PAL.white, off: [0, 0], rot: twos(t) * 0.1 });
  shape(ctx, ellipse(0, 0, 196, 196, 72), { fill: up ? PAL.coralL : PAL.mustard, line: 6, seed: 640, grain: 0.3 });
  if (!up) {
    const n = 5 - Math.floor(clamp(t - 15.0, 0, 4.999)), frac = t < 15 ? 0 : (t - 15.0) % 1;
    ink(ctx, ellipse(0, 0, 216, 216, 80, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - frac)), 12, { color: PAL.coral, seed: 641, taper: false });
    const kk = t < 15 ? 1 : back(seg((t - 15.0) % 1, 0, 0.18), 2.2);
    ctx.save(); ctx.scale(kk, kk); text(ctx, t < 15 ? '5' : String(n), 0, 92, { font: '270px Slab', fill: PAL.ink, plate: PAL.white, off: [7, 7], align: 'center' }); ctx.restore();
  } else {
    const kk = back(seg(t, 20.0, 20.22), 2);
    ctx.save(); ctx.scale(kk, kk); ctx.rotate(-0.08);
    text(ctx, "TIME'S", 0, -10, { font: '96px Slab', fill: PAL.ink, plate: PAL.white, off: [5, 5], align: 'center' });
    text(ctx, 'UP!', 0, 92, { font: '110px Slab', fill: PAL.ink, plate: PAL.white, off: [5, 5], align: 'center' }); ctx.restore();
  }
  ctx.restore();
  const kc = pop(t, 14.75, 0.3); if (kc <= 0 || up) return;
  ctx.save(); ctx.translate(540, 1450); ctx.scale(kc, kc);
  shape(ctx, spline([[-330, -70], [330, -70], [350, 40], [-40, 52], [-110, 108], [-96, 50], [-350, 40]], true, 4), { fill: COL.paper, line: 5, seed: 650, grain: 0.15, off: [7, 6] });
  text(ctx, 'Comment your answer!', 0, 14, { font: '700 66px Oleo', fill: PAL.coralD, align: 'center', maxW: 620 });
  ctx.restore();
}
function clockCallout(ctx, t) {
  const k = back(seg(t, 23.6, 23.92), 1.5), out = ss(seg(t, 25.1, 25.35)); if (k <= 0 || out >= 1) return;
  const cx = 540, cy = 470, R = 210 * k * (1 - out);
  shape(ctx, ellipse(cx, cy, R + 18, R + 18, 72), { fill: COL.paper, line: 5, seed: 660, grain: 0.15, breaks: 0.05 });
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); ctx.fillStyle = PAL.pink; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  ctx.translate(cx, cy); ctx.scale(k * (1 - out), k * (1 - out));
  shape(ctx, ellipse(0, 10, 150, 150, 60), { fill: PAL.white, line: 7, seed: 661, grain: 0.15 });
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; ink(ctx, [[Math.cos(a) * 118, 10 + Math.sin(a) * 118], [Math.cos(a) * 136, 10 + Math.sin(a) * 136]], i % 3 ? 4 : 8, { seed: 670 + i, taper: false }); }
  const spin = eio(seg(t, 23.95, 24.95)), mA = -Math.PI / 2 + spin * TAU * 5 * (1 / 12) * 12 / 12 + spin * (TAU * 5 / 60) * 12, hA = -Math.PI / 2 + spin * 0.4;
  ink(ctx, [[0, 10], [Math.cos(mA) * 110, 10 + Math.sin(mA) * 110]], 9, { seed: 690, taper: false });
  ink(ctx, [[0, 10], [Math.cos(hA) * 70, 10 + Math.sin(hA) * 70]], 12, { seed: 691, taper: false });
  shape(ctx, ellipse(0, 10, 14, 14, 14), { fill: PAL.coral, line: 3, seed: 692, grain: 0 });
  ctx.restore();
  ink(ctx, ellipse(cx, cy, R, R, 72), 5, { closed: true, seed: 693, breaks: 0.1 });
  const kt = pop(t, 24.2, 0.26); if (kt <= 0 || out > 0) return;
  ctx.save(); ctx.translate(cx, cy + 250); ctx.scale(kt, kt); ctx.rotate(-0.05);
  shape(ctx, rrect(-250, -50, 500, 100, 14), { fill: PAL.mustard, line: 5, seed: 694, grain: 0.2, off: [6, 5] });
  text(ctx, '5 MINUTES LATER', 0, 17, { font: '46px Slab', fill: PAL.ink, plate: PAL.white, off: [3, 3], align: 'center' });
  ctx.restore();
}
// the glove that hovers in the hook and flips the switches in the reveal
function glove(ctx, t, c) {
  let target, kind = 'point';
  if (t < 4.4 || t > 39.5) {                          // hover between the three switches (period 2 s → seamless at 0/40)
    const ph = ((t % 2) + 2) % 2, seq = [0, 1, 2, 1], i = Math.floor(ph / 0.5), k = ss(seg(ph % 0.5, 0.05, 0.35));
    const a = SWX[seq[i]], b = SWX[seq[(i + 1) % 4]]; target = [lerp(a, b, k), SWY + 70];
  } else if (t >= 22.4 && t < 27.45) {
    const pre = (x, tt) => t < tt ? null : x;
    let x = SWX[0], y = SWY + 70;
    if (t > 25.95) x = lerp(SWX[0], SWX[1], eio(seg(t, 25.8, 26.15)));
    const press = [23.0, 25.5, 26.25].map(tt => Math.exp(-Math.pow((t - tt) / 0.07, 2))).reduce((a, b) => a + b, 0);
    const lift = [23.0, 25.5, 26.25].map(tt => clamp(1 - Math.abs(t - tt + 0.22) / 0.18)).reduce((a, b) => a + b, 0);
    y = SWY + 60 - lift * 40 - press * 30;
    if (t > 26.6) { const kk = eio(seg(t, 26.6, 27.2)); x = lerp(x, 120, kk); y = lerp(y, SWY + 600, kk); }
    target = [x, y];
  } else return;
  const [sx, sy] = w2s(target[0], target[1], c), S = c.z;
  const a = -1.15, k = 2.2 * S / 1.5;
  const wx = sx - Math.cos(a) * 46 * k, wy = sy - Math.sin(a) * 46 * k;
  const elbow = [wx - 210 * S / 1.5, wy + 330 * S / 1.5], shoulder = [elbow[0] - 260, elbow[1] + 600];
  sleeve(ctx, spline([shoulder, elbow, [wx, wy]], false, 8), 64 * S / 1.5, 700);
  drawHand(ctx, wx, wy, a, kind, -1, k);
}
function outcomes(ctx, t) {
  plane(ctx, rect(0, 0, W, H), COL.paper, { grain: 0.2 });
  rays(ctx, 540, 760, 36, 1600, PAL.paperD, { rot: twos(t) * 0.05, alpha: 0.6 });
  const B = [['LAMP ON', 'lit', 1, PAL.mustard, 29.75], ['OFF but WARM', 'warm', 0, PAL.coralL, 31.5], ['OFF and COLD', 'cold', 2, PAL.blueL, 33.25]];
  B.forEach(([label, st, sw, col, t0], i) => {
    const k = eio(seg(t, t0 - 0.05, t0 + 0.25)); if (k <= 0) return;
    const y = 200 + i * 360, h = 330;
    ctx.save(); ctx.beginPath(); ctx.rect(W * (1 - k), y - 20, W, h + 40); ctx.clip();
    shape(ctx, rrect(50, y, 980, h, 30), { fill: col, line: 6, seed: 710 + i, grain: 0.3 });
    drawBulb(ctx, 215, y + 140, 78, st, t);
    if (st === 'warm') for (let j = 0; j < 3; j++) { const pts = []; for (let s = 0; s <= 20; s++) pts.push([170 + j * 45 + Math.sin(s * 0.7 + twos(t) * 6 + j) * 9, y + 50 - s * 4]); ink(ctx, pts, 5, { color: PAL.coralD, seed: 720 + j, taper: true }); }
    if (st === 'cold') { for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3; ink(ctx, [[300, y + 70], [300 + Math.cos(a) * 34, y + 70 + Math.sin(a) * 34]], 5, { color: PAL.white, seed: 730 + j, taper: false }); } sparkle(ctx, 140, y + 70, 22, { fill: PAL.white }); }
    const f = fit(ctx, label, '{px}px Slab', 58, 420, 1, 36);
    text(ctx, f.lines[0], 380, y + 120, { font: f.font, fill: PAL.ink, plate: PAL.white, off: [3, 3] });
    text(ctx, 'IT\'S SWITCH', 382, y + 190, { font: '600 34px Jost', fill: PAL.ink, track: 4 });
    const km = pop(t, t0 + 0.5, 0.26);
    if (km > 0) { ctx.save(); ctx.translate(880, y + 165); ctx.scale(km, km); star(ctx, 0, 0, 112, { n: 16, inner: 0.84, fill: PAL.white, off: [0, 0] });
      shape(ctx, ellipse(0, 0, 90, 90, 50), { fill: COL.sw[sw], line: 5, seed: 740 + i, grain: 0.3 });
      text(ctx, String(sw + 1), 0, 38, { font: '110px Slab', fill: PAL.ink, plate: PAL.white, off: [4, 4], align: 'center' }); ctx.restore(); }
    ctx.restore();
  });
}
function moral(ctx, t) {
  const k = pop(t, 35.3, 0.3), out = ss(seg(t, 37.05, 37.3)); if (k <= 0 || out >= 1) return;
  ctx.save(); ctx.translate(540, 1080); ctx.scale(k * (1 - out), k * (1 - out)); ctx.rotate(-0.04);
  star(ctx, 0, 0, 300, { n: 22, inner: 0.8, fill: PAL.coral, off: [0, 0], rot: twos(t) * 0.1 });
  shape(ctx, ellipse(0, 0, 238, 238, 72), { fill: COL.paper, line: 6, seed: 750, grain: 0.2 });
  text(ctx, 'A bulb', 0, -70, { font: '700 62px Oleo', fill: PAL.ink, align: 'center' });
  text(ctx, 'remembers', 0, 2, { font: '700 62px Oleo', fill: PAL.ink, align: 'center' });
  text(ctx, 'HEAT', 0, 110, { font: '112px Slab', fill: PAL.coral, plate: PAL.ink, off: [5, 5], align: 'center' });
  ctx.restore();
}
function outro(ctx, t) {
  const k = pop(t, 37.2, 0.3), out = ss(seg(t, 38.95, 39.2)); if (k <= 0 || out >= 1) return;
  ctx.save(); ctx.translate(540, 1130); ctx.scale(k * (1 - out), k * (1 - out)); ctx.rotate(-0.05);
  shape(ctx, rrect(-400, -110, 800, 220, 30), { fill: PAL.mustard, line: 6, seed: 760, grain: 0.3, off: [8, 7] });
  text(ctx, 'Did you get it?', 0, 30, { font: '700 96px Oleo', fill: PAL.ink, align: 'center' });
  ctx.restore();
  const kf = pop(t, 38.0, 0.28); if (kf <= 0 || out > 0) return;
  ctx.save(); ctx.translate(540, 1330); ctx.scale(kf, kf);
  shape(ctx, rrect(-360, -48, 720, 96, 16), { fill: COL.paper, line: 4.5, seed: 761, grain: 0.15, off: [6, 5] });
  star(ctx, -320, 0, 18, { n: 8, inner: 0.42, fill: PAL.coral, off: [0, 0], rot: t });
  text(ctx, 'Follow for the next riddle', 20, 16, { font: '600 44px Jost', fill: PAL.ink, align: 'center' });
  ctx.restore();
}
// kinetic caption card: words pop in one by one, keywords in the accent
function caption(ctx, t) {
  const c = cues().find(q => t >= q.t0 && t < q.t1); if (!c || NOCAP.has(c.id)) return;
  const a = Math.min(ss(seg(t, c.t0, c.t0 + 0.14)), 1 - ss(seg(t, c.t1 - 0.14, c.t1)));
  const f = fit(ctx, c.text, '600 {px}px Jost', 52, 860, 2, 36), words = c.text.split(/\s+/), keys = KEY[c.id] || [];
  const lh = f.px * 1.22, h = 44 + f.lines.length * lh, w = Math.max(...f.lines.map(l => measure(ctx, l, f.font))) + 120, y = 1420 - h / 2;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 12);
  shape(ctx, rrect(W / 2 - w / 2, y, w, h, 16), { fill: COL.paper, line: 3.6, seed: 901, grain: 0.15, breaks: 0.08, off: [6, 6] });
  star(ctx, W / 2 - w / 2 + 30, y + h / 2, 14, { n: 8, inner: 0.4, fill: COL.accent, off: [0, 0], rot: t * 0.8 });
  star(ctx, W / 2 + w / 2 - 30, y + h / 2, 14, { n: 8, inner: 0.4, fill: COL.accent, off: [0, 0], rot: -t * 0.8 });
  // word timing: spread over the spoken duration by letter count
  const tot = words.reduce((s, x) => s + x.length + 1, 0); let acc = 0, wi = 0;
  ctx.font = f.font;
  f.lines.forEach((line, li) => {
    const lw = measure(ctx, line, f.font); let x = W / 2 - lw / 2;
    line.split(/\s+/).forEach(wd => {
      const tw = c.t0 + (acc / tot) * c.dur * 0.92; acc += wd.length + 1; wi++;
      const k = back(seg(t, tw - 0.02, tw + 0.14), 2.2), ww = measure(ctx, wd + ' ', f.font);
      if (k > 0) { ctx.save(); const cx = x + ww / 2, cy = y + 22 + lh * li + f.px * 0.95; ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
        text(ctx, wd, x, cy, { font: f.font, fill: keys.includes(wd) ? PAL.coralD : PAL.ink }); ctx.restore(); }
      x += ww;
    });
  });
  ctx.restore();
}

// ---------------------------------------------------------------- render
export function renderFilm(ctx, t, Q) {
  setClock(t);
  const c = camAt(t);
  ctx.fillStyle = COL.skyHi; ctx.fillRect(0, 0, W, H);
  const inOut = t >= 29.5 && t < 35.25;
  if (!inOut || t < 29.92) world(ctx, t, c);
  if (t >= 29.5 && t < 35.25) {
    // iris from the round bulb into the outcome card; colour-block wipe back up at 35.25
    const k = eio(seg(t, 29.5, 29.92)), [bx, by] = w2s(BULB.x, BULB.y, c), r = lerp(BULB.r * c.z, 2300, k * k);
    ctx.save(); ctx.beginPath(); ctx.arc(lerp(bx, 540, k), lerp(by, 960, k), r, 0, TAU); ctx.clip(); outcomes(ctx, t); ctx.restore();
    if (k < 1) ink(ctx, ellipse(lerp(bx, 540, k), lerp(by, 960, k), r, r, 90), 8, { closed: true, seed: 960 });
  }
  if (t >= 35.25 && t < 35.55) {                      // the outcome card slides down off the world (block wipe)
    const k = eio(seg(t, 35.25, 35.55));
    ctx.save(); ctx.beginPath(); ctx.rect(0, H * k, W, H); ctx.clip(); outcomes(ctx, 35.2); ctx.restore();
    ink(ctx, [[-10, H * k], [W + 10, H * k]], 7, { seed: 963 });
  }
  glove(ctx, t, c);
  if (t >= 4.3 && t < 8.3) stepCounter(ctx, t, stepsAt(eio(seg(t, 4.4, 7.7))), 4.35, 8.3);
  if (t >= 27.5 && t < 29.7) stepCounter(ctx, t, stepsAt(eio(keeperRoute(t))), 27.55, 29.7);
  if (t < 14.45) { rule(ctx, t, 8.0, 0, 'Flip them all you like', 330); rule(ctx, t, 10.5, 1, 'Climb only ONCE', 560); rule(ctx, t, 13.0, 2, 'Which switch?', 790); }
  if (t >= 14.45) { /* rules leave with the push-in */ }
  countdown(ctx, t);
  clockCallout(ctx, t);
  if (t >= 21.0 && t < 22.3) { const k = pop(t, 21.0, 0.25); ctx.save(); ctx.translate(540, 520); ctx.scale(k, k); star(ctx, 0, 0, 170, { n: 12, inner: 0.6, fill: PAL.mustard, off: [0, 0], rot: twos(t) * 0.3 });
    text(ctx, 'AHA!', 0, 34, { font: '96px Slab', fill: PAL.ink, plate: PAL.white, off: [4, 4], align: 'center' }); ctx.restore(); }
  moral(ctx, t); outro(ctx, t);
  paperFinish(ctx, W, H, 1);
  if (!(Q && Q.has('nosubs'))) caption(ctx, t);
}

// ---------------------------------------------------------------- sound events (the same times drive the picture)
let EVS = [];
const ev = (t, type, o = {}) => EVS.push({ t: +t.toFixed(4), type, ...o });
export function events() { return EVS; }
function buildEvents() {
  EVS = [];
  V.forEach(v => ev(v.t, 'vo', { id: v.id }));
  ev(0.0, 'sea', { dur: 4.3 }); [0.5, 1.0, 1.5, 2.5, 3.0, 3.5].forEach(x => ev(x, 'hover_tick', { gain: 0.35 }));
  ev(4.3, 'whoosh_up', { dur: 0.6 }); ev(4.4, 'wind', { dur: 3.8 });
  for (let i = 0; i < 16; i++) ev(4.4 + i * 0.21, 'step_pizz', { n: i });
  ev(7.7, 'ding', {}); ev(8.0, 'whoosh_down', { dur: 0.5 });
  [8.0, 10.5, 13.0].forEach(x => ev(x, 'stamp', {}));
  ev(14.4, 'push', {}); ev(14.55, 'pop', {});
  for (let s = 15; s < 20; s++) ev(s, 'tick', { n: s - 15 });
  ev(20.0, 'bell', {});
  ev(21.0, 'aha', {});
  ev(23.0, 'switch', { pan: -0.3 }); ev(23.6, 'pop', { gain: 0.5 }); ev(23.95, 'clock_whirr', { dur: 1.0 }); ev(24.2, 'stamp', { gain: 0.6 });
  ev(25.5, 'switch', { pan: -0.3, off: 1 }); ev(26.25, 'switch', { pan: 0 });
  ev(27.45, 'whoosh_up', { dur: 0.4 }); for (let i = 0; i < 18; i++) ev(27.6 + i * 0.1, 'footstep', { n: i });
  ev(29.5, 'iris', { dur: 0.42 }); ev(29.75, 'lamp_on', {}); ev(29.75, 'wipe', {}); ev(30.25, 'stamp', { gain: 0.7 });
  ev(31.5, 'wipe', {}); ev(31.5, 'sizzle', { dur: 1.2 }); ev(32.0, 'stamp', { gain: 0.7 });
  ev(33.25, 'wipe', {}); ev(33.25, 'frost', { dur: 0.9 }); ev(33.75, 'stamp', { gain: 0.7 });
  ev(35.25, 'wipe', {}); ev(35.3, 'pop', {}); ev(37.2, 'pop', {}); ev(38.0, 'pop', { gain: 0.6 });
  ev(39.0, 'slide_down', {}); ev(39.0, 'whoosh_down', { dur: 0.9 });
  EVS.sort((a, b) => a.t - b.t);
}
