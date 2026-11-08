// Episode 02 "Who Ate the Sandwich?": an original whodunit riddle Short in the mid-century cartoon style.
// 1080x1920, 24 fps, 52.0 s = 26 bars at 120 BPM. Every value is a function of t (deterministic).
// Two sets: the lamp ROOM (world camera) and the LINE-UP wall (its own camera); colour-block wipes between them.
import { PAL, setClock, shape, plane, ink, rays, ellipse, rect, rrect, spline, star, sparkle, text, fit, measure,
  paperFinish, clamp, lerp, seg, ss, eio, back, twos, TAU, hash } from './engine/toon.js';
import { drawKeeper } from './keeper.js';
import { drawPip, drawMabel, drawRollo, pawPrint } from './suspects.js';

export const W = 1080, H = 1920, BPM = 120, BEAT = 0.5, DURATION = 52.0;
const COL = { paper: PAL.paper, ink: PAL.ink, accent: PAL.coral, wall: '#F2E3C4', wallD: '#E6D2AC', floor: PAL.brownL, floorD: PAL.brown,
  step: PAL.kraft, stepD: PAL.kraftD, paint: PAL.mustard, paintD: PAL.mustardD, shutter: PAL.teal, shutterD: PAL.tealD, sky: '#7C6A8E', sea: PAL.tealD,
  line: '#C9D6E3', lineD: '#9FB2C6' };

// ---------------------------------------------------------------- voice + captions (start times on the beat grid)
const LINES = [
  ['hook', 0.25], ['paint', 4.0], ['shut', 7.0], ['gone', 11.0], ['three', 13.0], ['pip', 14.5], ['mabel', 18.25], ['rollo', 21.75],
  ['ask', 25.5], ['comment', 27.5], ['clue', 34.5], ['windows', 36.0], ['stairs', 38.75], ['paws', 41.25], ['guilty', 45.0], ['outro', 49.25]];
const KEY = { hook: ['sandwich.', 'thief?'], paint: ['yellow.'], shut: ['window.'], gone: ['gone.'], three: ['suspects.'], pip: ['flying'], mabel: ['downstairs'],
  rollo: ['never', 'stairs.'], ask: ['lying?'], clue: ['clue.'], windows: ['shut,', 'nobody'], stairs: ['wet', 'stairs.'], paws: ['clean.', 'yellow!'], guilty: ['lied.', 'sandwich.'] };
const NOCAP = new Set(['comment', 'outro']);
let V = [], DUR = {}, TXT = {}, WORDS = {};
export function setup(lines, durs, words = {}) {
  DUR = durs; WORDS = words; lines.forEach(l => TXT[l.id] = l.caption || l.text);
  V = LINES.map(([id, t], i) => ({ id, t, dur: DUR[id] ?? 2, text: TXT[id], next: LINES[i + 1] ? LINES[i + 1][1] : DURATION }));
  buildEvents();
}
function cues() { return V.map(v => ({ ...v, t0: v.t, t1: Math.min(v.next - 0.08, v.t + Math.max(1.8, v.dur + 0.6, v.text.length / 12 + 1)) })); }
export function srtCues() { return cues().map(c => ({ t0: c.t0, t1: c.t1, text: c.text })); }

// ---------------------------------------------------------------- helpers
const pop = (t, t0, d = 0.28) => back(seg(t, t0, t0 + d), 1.9);
const L3 = (a, b, k) => ({ cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), z: lerp(a.z, b.z, k) });
const w2s = (x, y, c) => [W / 2 + (x - c.cx) * c.z, H / 2 + (y - c.cy) * c.z];
const blinkAt = (t, list) => list.some(b => t > b && t < b + 0.12) ? 1 : 0;

// which set is on screen; a wipe of 0.3 s brings the next set in from the right
const CUTS = [[4.0, 'room'], [13.0, 'line'], [36.0, 'room'], [41.15, 'line'], [49.15, 'room']];
function setAt(t) { let s = 'room'; for (const [c, n] of CUTS) if (t >= c + 0.3) s = n; return s; }

// ---------------------------------------------------------------- ROOM set (world px)
const FLOOR = 1250, TABLE = { x: 720, top: 1060 }, PLATE = { x: 720, y: 1046 }, LAMP = { x: 930, y: 860, r: 62 };
const WINS = [{ x: 330, y: 560 }, { x: 640, y: 560 }], WW = 200, WH = 300;
const STEPS = 8, SX0 = 300, SX1 = -460, SYB = 1890;           // stairs: top step at the floor hole (x 470), down-left to x 70
const stepRect = i => { const sw = (SX0 - SX1) / STEPS, sh = (SYB - FLOOR) / STEPS; return { x: SX0 - (i + 1) * sw, y: FLOOR + i * sh, w: sw + 2, h: sh }; };
const HOOK = { cx: 640, cy: 960, z: 1.45 };
const ROOMCAM = { wide: { cx: 540, cy: 1060, z: 0.95 }, stairs: { cx: 150, cy: 1540, z: 1.0 }, table: { cx: 600, cy: 900, z: 1.05 },
  plate: { cx: 680, cy: 980, z: 1.45 }, wins: { cx: 490, cy: 640, z: 1.2 } };
function camRoom(t) {
  const C = ROOMCAM;
  if (t < 4.0) return { ...HOOK, z: lerp(1.45, 1.5, ss(t / 4)) };
  if (t < 7.0) return L3({ ...HOOK, z: 1.5 }, C.stairs, eio(seg(t, 4.0, 4.45)));
  if (t < 11.0) return L3(C.stairs, C.table, eio(seg(t, 7.0, 7.45)));
  if (t < 13.3) return L3(C.table, C.plate, eio(seg(t, 11.0, 11.35)));
  if (t < 38.6) return C.wins;
  if (t < 41.5) return L3(C.wins, C.stairs, eio(seg(t, 38.6, 39.0)));
  if (t < 51.0) return { ...C.wide, z: lerp(0.95, 1.0, ss(seg(t, 49.3, 51))) };
  return L3({ ...C.wide, z: 1.0 }, HOOK, eio(seg(t, 51.0, 51.96)));
}
const sandwichOn = t => t >= 7.35 && t < 11.5;
const AFTER = t => t < 4.0;                                 // the hook (and the loop end) shows the room AFTER the crime
const shutK = (t, i) => AFTER(t) ? 1 : eio(seg(t, 9.0 + i * 0.4, 9.25 + i * 0.4));
const paintK = (t, i) => AFTER(t) ? 1 : clamp(seg(t, 4.45 + i * 0.22, 4.7 + i * 0.22));   // top step first

function roomWall(ctx, t) {
  plane(ctx, rect(-1500, -1500, 4100, FLOOR + 1500), COL.wall, { grain: 0.25 });
  for (let x = -400; x < 1600; x += 140) ink(ctx, [[x, -400], [x, FLOOR]], 3, { color: COL.wallD, seed: 2000 + x, taper: false, breaks: 0.3 });
  // windows: sea + sky inside, two teal shutters that swing shut
  WINS.forEach((w, i) => {
    const x0 = w.x - WW / 2, y0 = w.y - WH / 2;
    shape(ctx, rect(x0 - 16, y0 - 16, WW + 32, WH + 32), { fill: PAL.white, line: 5, seed: 2010 + i, grain: 0.2 });
    plane(ctx, rect(x0, y0, WW, WH * 0.6), COL.sky, { grain: 0.2 });
    plane(ctx, rect(x0, y0 + WH * 0.6, WW, WH * 0.4), COL.sea, { grain: 0.2 });
    for (let r = 0; r < 2; r++) { const pts = []; for (let x = x0; x <= x0 + WW; x += 20) pts.push([x, y0 + WH * 0.68 + r * 40 + Math.sin(x / 30 + twos(t) * 3 + r) * 5]); ink(ctx, pts, 4, { color: PAL.teal, seed: 2015 + r + i * 2, taper: false }); }
    sparkle(ctx, x0 + 50, y0 + 60, 14, { fill: PAL.white, alpha: 0.8 });
    const k = shutK(t, i), half = WW / 2;
    [[-1, 0], [1, 1]].forEach(([d, j]) => {                  // each shutter hinges on the frame edge; width = half*(k) visually (flat swing)
      const sw = half * k; if (sw < 2) return;
      const xa = d < 0 ? x0 : x0 + WW - sw;
      shape(ctx, rect(xa, y0, sw, WH), { fill: COL.shutter, line: 4.5, seed: 2020 + i * 2 + j, grain: 0.3 });
      for (let s = 1; s < 6; s++) ink(ctx, [[xa + 8, y0 + s * WH / 6], [xa + sw - 8, y0 + s * WH / 6]], 3.5, { color: COL.shutterD, seed: 2030 + s + j * 7 + i * 17, taper: false });
    });
    ink(ctx, [[x0, y0 + WH * 0.5], [x0 + WW, y0 + WH * 0.5]], 5, { seed: 2040 + i, taper: false, alpha: 1 - k });
    if (k >= 1 && (AFTER(t) || t > 9.6)) lock(ctx, w.x, y0 + WH * 0.5, (AFTER(t) || t >= 36) ? 1 : pop(t, 9.75 + i * 0.15, 0.24));
  });
}
function lock(ctx, x, y, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ink(ctx, ellipse(0, -26, 20, 24, 20, Math.PI, TAU), 9, { seed: 2050, taper: false, color: PAL.chromeD });
  shape(ctx, rrect(-30, -24, 60, 50, 10), { fill: PAL.mustard, line: 4, seed: 2051, grain: 0.2 });
  shape(ctx, ellipse(0, -2, 6, 7, 10), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  ctx.restore();
}
function roomFloor(ctx, t) {
  plane(ctx, rect(-1500, FLOOR, 4100, 2000), COL.floor, { grain: 0.35 });
  for (let y = FLOOR + 60; y < FLOOR + 1400; y += 70) ink(ctx, [[-600, y], [1800, y]], 3, { color: COL.floorD, seed: 2100 + y, taper: false, breaks: 0.4 });
  ink(ctx, [[-600, FLOOR], [1800, FLOOR]], 6, { seed: 2099, taper: false });
  // stairwell: dark hole under the stairs, steps going down-left
  plane(ctx, [[SX0 + 40, FLOOR], [SX0 + 40, SYB + 300], [SX1 - 300, SYB + 300], [SX1 - 300, FLOOR]], '#5A4A3C', { grain: 0.3 });
  for (let i = 0; i < STEPS; i++) {
    const r = stepRect(i), pk = paintK(t, i);
    shape(ctx, rect(r.x, r.y, r.w, SYB + 300 - r.y), { fill: pk >= 1 ? COL.paint : COL.step, line: 4, seed: 2120 + i, grain: 0.35, shade: [{ pts: rect(r.x, r.y + 30, r.w, SYB + 300 - r.y), color: pk >= 1 ? COL.paintD : COL.stepD }] });
    if (pk > 0 && pk < 1) {                                  // the brush sweeps paint across the tread
      plane(ctx, rect(r.x + r.w * (1 - pk), r.y, r.w * pk, 30), COL.paint, { grain: 0.2 }); plane(ctx, rect(r.x + r.w * (1 - pk), r.y + 30, r.w * pk, 50), COL.paintD, { grain: 0.2 });
      brush(ctx, r.x + r.w * (1 - pk), r.y + 20, pk);
    }
    if (pk >= 1) sparkle(ctx, r.x + 14, r.y + 14, 9, { fill: PAL.white, alpha: 0.7 });
  }
  // the thief's trail: tiny yellow prints climbing up the steps (revealed one by one in the clue)
  if (AFTER(t) || t >= 39.0) for (let i = STEPS - 1; i >= 0; i--) {
    const k = AFTER(t) ? 1 : pop(t, 39.05 + (STEPS - 1 - i) * 0.19, 0.2); if (k <= 0) continue;
    const r = stepRect(i); pawPrint(ctx, r.x + r.w * 0.28, r.y + 14, 2.3 * k, 1.1); pawPrint(ctx, r.x + r.w * 0.72, r.y + 18, 2.3 * k, 1.1);
  }
  if (t >= 39.0 && t < 41.3) { const k = eio(seg(t, 39.05, 40.6)); const pk = []; for (let s = 0; s <= 30; s++) { const u = s / 30 * k; pk.push([lerp(stepRect(STEPS - 1).x + 30, SX0 + 60, u), lerp(stepRect(STEPS - 1).y, FLOOR - 60, u) ]); } if (k > 0.02) ink(ctx, pk, 6, { color: PAL.coral, seed: 2140, taper: true, breaks: 0.4 }); }
  // WET PAINT sign
  const ks = AFTER(t) ? 1 : pop(t, 5.9, 0.28);
  if (ks > 0) { ctx.save(); ctx.translate(SX0 - 190, FLOOR - 120); ctx.scale(ks, ks); ctx.rotate(-0.06); ink(ctx, [[-60, -250], [0, -300], [60, -250]], 4, { seed: 2150, taper: false }); shape(ctx, ellipse(0, -300, 7, 7, 10), { fill: PAL.chromeD, line: 2.5, seed: 2152, grain: 0 });
    shape(ctx, rrect(-95, -250, 190, 110, 10), { fill: PAL.white, line: 5, seed: 2151, grain: 0.2, off: [5, 4] });
    text(ctx, 'WET', 0, -204, { font: '44px Slab', fill: PAL.coral, align: 'center' }); text(ctx, 'PAINT', 0, -158, { font: '44px Slab', fill: PAL.coral, align: 'center' }); ctx.restore(); }
}
function brush(ctx, x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.4 + Math.sin(k * 20) * 0.1);
  shape(ctx, rrect(-10, -16, 46, 32, 6), { fill: COL.paint, line: 4, seed: 2160, grain: 0.1 });
  shape(ctx, rrect(36, -12, 20, 24, 4), { fill: PAL.chrome, line: 3.5, seed: 2161, grain: 0.1 });
  shape(ctx, rrect(56, -7, 90, 14, 7), { fill: PAL.coral, line: 3.5, seed: 2162, grain: 0.2 });
  ctx.restore();
}
function drawLamp(ctx, t) {
  const { x, y, r } = LAMP;
  shape(ctx, rrect(x - 50, FLOOR - 320, 100, 320, 10), { fill: PAL.plum, line: 5, seed: 2200, grain: 0.3 });
  shape(ctx, rrect(x - 80, FLOOR - 340, 160, 30, 8), { fill: PAL.ink, line: 0, seed: 2201, off: [0, 0] });
  rays(ctx, x, y, 20, r * 4, PAL.mustardL, { rot: twos(t) * 0.2, alpha: 0.4, r0: r * 1.1 });
  shape(ctx, spline([[x - r, y], [x - r * 0.7, y - r * 0.75], [x, y - r], [x + r * 0.7, y - r * 0.75], [x + r, y], [x + r * 0.55, y + r * 0.8], [x + r * 0.42, y + r * 1.2], [x - r * 0.42, y + r * 1.2], [x - r * 0.55, y + r * 0.8]], true, 8), { fill: '#FFF3B0', line: 5, seed: 2205, grain: 0.15 });
  shape(ctx, rrect(x - r * 0.46, y + r * 1.2, r * 0.92, r * 0.5, 8), { fill: PAL.chrome, line: 4.5, seed: 2206, grain: 0.3 });
  sparkle(ctx, x - r * 0.45, y - r * 0.45, r * 0.22, { fill: PAL.white, alpha: 0.9 });
}
function drawTable(ctx, t) {
  const { x, top } = TABLE;
  [[-120, 0], [120, 1]].forEach(([dx, i]) => shape(ctx, rect(x + dx - 12, top, 24, FLOOR - top), { fill: PAL.brown, line: 4, seed: 2210 + i, grain: 0.3 }));
  shape(ctx, rrect(x - 170, top - 10, 340, 34, 8), { fill: PAL.coral, line: 5, seed: 2212, grain: 0.3, shade: [{ pts: rect(x - 170, top + 12, 340, 12), color: PAL.coralD }] });
  // plate
  shape(ctx, ellipse(PLATE.x, PLATE.y, 110, 22, 30), { fill: PAL.white, line: 4.5, seed: 2215, grain: 0.15 });
  ink(ctx, ellipse(PLATE.x, PLATE.y - 2, 76, 13, 30), 3, { closed: true, seed: 2216, color: PAL.blueL });
  if (sandwichOn(t)) sandwich(ctx, PLATE.x, PLATE.y - 8, pop(t, 7.35, 0.26));
  else for (let i = 0; i < 7; i++) shape(ctx, rrect(PLATE.x - 70 + hash(i, 1) * 140, PLATE.y - 8 + hash(i, 2) * 12, 9 + hash(i, 3) * 6, 7 + hash(i, 4) * 4, 2), { fill: PAL.kraft, line: 2, seed: 2220 + i, grain: 0 });
  // poof when it vanishes
  const pk = seg(t, 11.45, 12.15);
  if (pk > 0 && pk < 1) for (let i = 0; i < 9; i++) { const a = i * TAU / 9, rr = 30 + pk * 120; shape(ctx, ellipse(PLATE.x + Math.cos(a) * rr, PLATE.y - 50 + Math.sin(a) * rr * 0.6, 34 * (1 - pk) + 6, 30 * (1 - pk) + 6, 16), { fill: PAL.white, line: 3.5, seed: 2230 + i, grain: 0.1, alpha: 1 - pk * 0.6 }); }
}
function sandwich(ctx, x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  shape(ctx, rrect(-80, -26, 160, 28, 12), { fill: PAL.kraftL, line: 4, seed: 2240, grain: 0.3 });
  shape(ctx, spline([[-86, -30], [-60, -40], [-30, -30], [0, -42], [30, -30], [60, -40], [86, -30], [80, -24], [-80, -24]], true, 4), { fill: PAL.avocado, line: 3.5, seed: 2241, grain: 0.2 });
  shape(ctx, rrect(-70, -46, 140, 14, 4), { fill: PAL.coral, line: 3.5, seed: 2242, grain: 0.2 });
  shape(ctx, rrect(-76, -56, 152, 12, 4), { fill: PAL.mustardL, line: 3.5, seed: 2243, grain: 0.2 });
  shape(ctx, spline([[-82, -54], [-70, -86], [0, -98], [70, -86], [82, -54]], true, 6), { fill: PAL.kraftL, line: 4, seed: 2244, grain: 0.3 });
  [[-40, -78], [-5, -86], [32, -78]].forEach(([sx, sy], i) => shape(ctx, ellipse(sx, sy, 4, 2.5, 8), { fill: PAL.white, line: 0, grain: 0, off: [0, 0] }));
  ctx.restore();
}
function gusPose(t) {
  const blink = blinkAt(t, [2.1, 8.6, 37.4, 46.2, 50.4]);
  if (t < 4.0 || t >= 51.4) return { x: 470, y: FLOOR, s: 0.78, face: 'wow', blink: 0, look: [14, 6], armF: { a1: -0.5, a2: -1.3 }, handF: { kind: 'open', a: -1.4 }, armB: { a1: -0.6, a2: -1.4 }, handB: { kind: 'open', a: -1.5 } };
  if (t < 7.0) return { x: 820, y: FLOOR, s: 0.78, face: 'happy', blink, look: [-14, 6] };
  if (t < 11.0) { const k = back(seg(t, 7.1, 7.4), 1.6); return { x: 470, y: FLOOR, s: 0.78, face: 'happy', blink, look: [14, 0], armF: { a1: lerp(1.2, 0.1, k), a2: lerp(1.42, -0.1, k) }, handF: { kind: 'point', a: lerp(1.42, -0.05, k) } }; }
  if (t < 13.5) return { x: 470, y: FLOOR, s: 0.78, face: t > 11.6 ? 'wow' : 'happy', blink, look: [16, 8], armF: { a1: -0.5, a2: -1.3 }, handF: { kind: 'open', a: -1.4 } };
  return { x: 470, y: FLOOR, s: 0.78, face: t >= 49 ? 'happy' : 'neutral', blink, look: [10, -2] };
}
function room(ctx, t) {
  const c = camRoom(t);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.cx, -c.cy);
  roomWall(ctx, t); drawLamp(ctx, t); roomFloor(ctx, t); drawTable(ctx, t);
  drawKeeper(ctx, gusPose(t));
  ctx.restore();
  return c;
}

// ---------------------------------------------------------------- LINE-UP set (its own world px, screen-sized)
const LFL = 1250, SUS = [{ name: 'PIP', x: 210, s: 1.35 }, { name: 'MABEL', x: 540, s: 1.22 }, { name: 'ROLLO', x: 870, s: 1.42 }];
const LWIDE = { cx: 540, cy: 960, z: 1 };
const close = i => ({ cx: SUS[i].x + [130, 0, -130][i], cy: 1000, z: 1.7 });
const GUILTYCAM = { cx: 870, cy: 1030, z: 2.0 };
function camLine(t) {
  if (t < 14.45) return LWIDE;
  if (t < 18.15) return L3(LWIDE, close(0), eio(seg(t, 14.45, 14.85)));
  if (t < 21.65) return L3(close(0), close(1), eio(seg(t, 18.15, 18.5)));
  if (t < 25.4) return L3(close(1), close(2), eio(seg(t, 21.65, 22.0)));
  if (t < 44.8) return L3(close(2), LWIDE, eio(seg(t, 25.4, 25.8)));
  return L3(LWIDE, GUILTYCAM, eio(seg(t, 44.8, 45.25)));
}
function lineWall(ctx, t) {
  plane(ctx, rect(-1500, -1500, 4100, LFL + 1500), COL.line, { grain: 0.25 });
  for (let k = 0; k <= 9; k++) { const y = LFL - k * 90; ink(ctx, [[-600, y], [1800, y]], k % 2 ? 2.5 : 4.5, { color: COL.lineD, seed: 2300 + k, taper: false }); if (k % 2 === 0 && k) text(ctx, String(k / 2), 30, y - 10, { font: '600 30px Jost', fill: COL.lineD }); }
  plane(ctx, rect(-1500, LFL, 4100, 1400), '#5E6E80', { grain: 0.35 });
  ink(ctx, [[-600, LFL], [1800, LFL]], 6, { seed: 2310, taper: false });
  // three spotlights
  SUS.forEach((s, i) => {
    const red = t >= 45.0 && t < 49.3 && i === 2;
    ctx.save(); ctx.globalAlpha = red ? 0.45 : 0.32; ctx.fillStyle = red ? PAL.coralL : '#FFF6D8';
    ctx.beginPath(); ctx.moveTo(s.x - 40, -200); ctx.lineTo(s.x + 40, -200); ctx.lineTo(s.x + 170, LFL); ctx.lineTo(s.x - 170, LFL); ctx.closePath(); ctx.fill(); ctx.restore();
    shape(ctx, ellipse(s.x, LFL + 6, 170, 26, 30), { fill: red ? PAL.coralL : '#EEE3BE', line: 0, seed: 2320 + i, grain: 0.2, alpha: 0.6, off: [0, 0] });
    // name tags on the wall
    const k = pop(t, 13.25 + i * 0.25, 0.26);
    if (k > 0) { ctx.save(); ctx.translate(s.x, 470); ctx.scale(k, k); shape(ctx, rrect(-110, -42, 220, 84, 12), { fill: PAL.ink, line: 0, seed: 2330 + i, grain: 0.1, off: [0, 0] });
      text(ctx, s.name, 0, 18, { font: '52px Slab', fill: PAL.white, align: 'center' }); ctx.restore(); }
  });
}
function suspectsDraw(ctx, t) {
  const slide = i => t < 13.0 ? 1 : 1 - back(seg(t, 13.15 + i * 0.25, 13.45 + i * 0.25), 1.6);   // slide in from below on "Three suspects"
  const bl = [0, 0.7, 1.4].map(o => blinkAt(t, [15.8 + o, 23.0 + o, 26.4 + o, 30.1 + o, 42.2 + o]));
  const look = (i) => t >= 25.5 && t < 34 ? [[2, 0], [0, 0], [-3, 0]][i] : [[3, 0], [0, 0], [-2, 0]][i];
  const dy = i => slide(i) * 700;
  const sp = t >= 14.5 && t < 18.1 ? Math.sin(t * TAU * 2) * 0.5 + 0.5 : 0;
  drawPip(ctx, SUS[0].x - 20, LFL + dy(0), SUS[0].s, { blink: bl[0], flap: sp, look: look(0) });
  drawMabel(ctx, SUS[1].x, LFL + dy(1), SUS[1].s, { blink: bl[1], sleepy: t >= 18.6 && t < 21.4, zzz: t >= 18.6 && t < 21.4 ? (t - 18.6) * 0.9 : 0, look: look(1) });
  const guilty = t >= 21.75;
  const sweat = (t >= 25.5 && t < 27.5) ? seg(t, 25.6, 27.4) : (t >= 45.0 && t < 49.3) ? (((t - 45.0) % 1.3) / 1.3) : 0;
  const burp = t >= 48.1 && t < 49.3 ? back(seg(t, 48.1, 48.35), 1.6) : 0;
  drawRollo(ctx, SUS[2].x, LFL + dy(2), SUS[2].s, { paint: true, blink: bl[2], guilty, look: guilty ? [-4, 2] : [0, 0], sweat, burp });
}
function bubble(ctx, t, t0, t1, x, y, tailX, tailY, icon) {
  const k = Math.min(pop(t, t0, 0.28), 1 - ss(seg(t, t1 - 0.2, t1))); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  shape(ctx, [[tailX * 0.2 - 30, 90], [tailX, tailY], [tailX * 0.2 + 30, 90]], { fill: PAL.white, line: 5, seed: 2400, grain: 0.1 });
  shape(ctx, ellipse(0, 0, 200, 140, 40), { fill: PAL.white, line: 5, seed: 2401, grain: 0.15, off: [7, 6] });
  icon(ctx, t);
  ctx.restore();
}
const iconSea = (ctx, t) => {
  shape(ctx, ellipse(60, -40, 34, 34, 24), { fill: PAL.mustard, line: 4, seed: 2410, grain: 0.1 });
  for (let r = 0; r < 3; r++) { const pts = []; for (let x = -130; x <= 130; x += 12) pts.push([x, 20 + r * 30 + Math.sin(x / 22 + twos(t) * 4 + r) * 8]); ink(ctx, pts, 6, { color: PAL.teal, seed: 2411 + r, taper: false }); }
  ink(ctx, spline([[-90, -50], [-70, -66], [-50, -50], [-30, -66], [-10, -50]], false, 6), 5, { seed: 2415 });
};
const iconBed = (ctx, t) => {
  shape(ctx, rrect(-120, -10, 240, 60, 10), { fill: PAL.blue, line: 4, seed: 2420, grain: 0.2 });
  shape(ctx, rrect(-110, -40, 70, 34, 12), { fill: PAL.white, line: 4, seed: 2421, grain: 0.1 });
  ink(ctx, [[-120, -60], [-120, 80]], 8, { seed: 2422, taper: false }); ink(ctx, [[120, 0], [120, 80]], 8, { seed: 2423, taper: false });
  ['Z', 'z', 'z'].forEach((z, i) => text(ctx, z, 10 + i * 40, -50 - i * 26 - (twos(t) * 10 % 8), { font: `${44 - i * 8}px Slab`, fill: PAL.blueD }));
};
const iconNoStairs = (ctx, t) => {
  const p = [[-110, 70]]; for (let s = 0; s < 4; s++) { p.push([-110 + s * 55, 70 - (s + 1) * 34]); p.push([-110 + (s + 1) * 55, 70 - (s + 1) * 34]); } p.push([110, 70]);
  shape(ctx, p, { fill: PAL.kraft, line: 4, seed: 2430, grain: 0.2 });
  ink(ctx, ellipse(0, 0, 120, 110, 40), 12, { closed: true, color: PAL.coral, seed: 2431, taper: false });
  ink(ctx, [[-84, 78], [84, -78]], 12, { color: PAL.coral, seed: 2432, taper: false });
};
function lineup(ctx, t) {
  const c = camLine(t);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.cx, -c.cy);
  lineWall(ctx, t); suspectsDraw(ctx, t);
  ctx.restore();
  // speech bubbles (screen space) during each alibi
  bubble(ctx, t, 14.95, 18.1, 760, 470, -260, 300, iconSea);
  bubble(ctx, t, 18.55, 21.6, 800, 400, -220, 260, iconBed);
  bubble(ctx, t, 22.05, 25.35, 300, 470, 240, 300, iconNoStairs);
  // "?" over each suspect on "Who is lying?"
  if (t >= 25.7 && t < 27.4) SUS.forEach((s, i) => { const k = pop(t, 25.8 + i * 0.18, 0.24); if (k <= 0) return; const [sx] = w2s(s.x, 0, c);
    ctx.save(); ctx.translate(sx, 650); ctx.scale(k, k); ctx.rotate((i - 1) * 0.12); text(ctx, '?', 0, 40, { font: '130px Slab', fill: PAL.coral, plate: PAL.ink, off: [5, 5], align: 'center' }); ctx.restore(); });
  return c;
}

// ---------------------------------------------------------------- overlays (screen space)
function countdown(ctx, t) {
  if (t < 27.4 || t >= 34.0) return;
  const tIn = pop(t, 27.45, 0.3), up = t >= 33.0;
  ctx.save(); ctx.translate(540, 400); ctx.scale(tIn * 0.85, tIn * 0.85);
  rays(ctx, 0, 0, 30, 520, PAL.mustardL, { rot: twos(t) * 0.15, alpha: 0.4 });
  star(ctx, 0, 0, 250, { n: 18, inner: 0.84, fill: up ? PAL.coral : PAL.white, off: [0, 0], rot: twos(t) * 0.1 });
  shape(ctx, ellipse(0, 0, 196, 196, 72), { fill: up ? PAL.coralL : PAL.mustard, line: 6, seed: 2500, grain: 0.3 });
  if (!up) {
    const n = 5 - Math.floor(clamp(t - 28.0, 0, 4.999)), frac = t < 28 ? 0 : (t - 28.0) % 1;
    ink(ctx, ellipse(0, 0, 216, 216, 80, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - frac)), 12, { color: PAL.coral, seed: 2501, taper: false });
    const kk = t < 28 ? 1 : back(seg((t - 28.0) % 1, 0, 0.18), 2.2);
    ctx.save(); ctx.scale(kk, kk); text(ctx, t < 28 ? '5' : String(n), 0, 92, { font: '270px Slab', fill: PAL.ink, plate: PAL.white, off: [7, 7], align: 'center' }); ctx.restore();
  } else {
    const kk = back(seg(t, 33.0, 33.22), 2);
    ctx.save(); ctx.scale(kk, kk); ctx.rotate(-0.08);
    text(ctx, "TIME'S", 0, -10, { font: '96px Slab', fill: PAL.ink, plate: PAL.white, off: [5, 5], align: 'center' });
    text(ctx, 'UP!', 0, 92, { font: '110px Slab', fill: PAL.ink, plate: PAL.white, off: [5, 5], align: 'center' }); ctx.restore();
  }
  ctx.restore();
  const kc = pop(t, 27.55, 0.3); if (kc <= 0 || up) return;
  ctx.save(); ctx.translate(540, 1450); ctx.scale(kc, kc);
  shape(ctx, spline([[-330, -70], [330, -70], [350, 40], [-40, 52], [-110, 108], [-96, 50], [-350, 40]], true, 4), { fill: COL.paper, line: 5, seed: 2510, grain: 0.15, off: [7, 6] });
  text(ctx, 'Comment your answer!', 0, 14, { font: '700 66px Oleo', fill: PAL.coralD, align: 'center', maxW: 620 });
  ctx.restore();
}
function aha(ctx, t) {
  if (t < 34.5 || t >= 35.9) return;
  const k = pop(t, 34.5, 0.25), out = ss(seg(t, 35.65, 35.9));
  ctx.save(); ctx.translate(540, 520); ctx.scale(k * (1 - out), k * (1 - out)); star(ctx, 0, 0, 170, { n: 12, inner: 0.6, fill: PAL.mustard, off: [0, 0], rot: twos(t) * 0.3 });
  text(ctx, 'AHA!', 0, 34, { font: '96px Slab', fill: PAL.ink, plate: PAL.white, off: [4, 4], align: 'center' }); ctx.restore();
}
function stamp(ctx, t, t0, word, x, y, col, rot = -0.14, size = 120, t1 = 99) {
  if (t < t0 || t >= t1) return;
  const k = 1 + 1.4 * (1 - eio(seg(t, t0, t0 + 0.14))), a = ss(seg(t, t0, t0 + 0.08));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `${size}px Slab`; const w = ctx.measureText(word).width + 70;
  ink(ctx, rrect(-w / 2, -size * 0.62, w, size * 1.12, 18), 10, { closed: true, color: col, seed: 2600, taper: false, breaks: 0.15 });
  text(ctx, word, 0, size * 0.36, { font: `${size}px Slab`, fill: col, align: 'center' });
  ctx.restore();
}
function pipCleared(ctx, t) {                                  // the windows clue: Pip's mugshot gets CLEARED
  const k = Math.min(pop(t, 36.7, 0.3), 1 - ss(seg(t, 38.45, 38.7))); if (k <= 0) return;
  ctx.save(); ctx.translate(540, 1050); ctx.scale(k, k); ctx.rotate(0.04);
  shape(ctx, rect(-170, -200, 340, 380), { fill: PAL.white, line: 5, seed: 2650, grain: 0.15, off: [8, 7] });
  plane(ctx, rect(-140, -170, 280, 270), COL.line, { grain: 0.2 });
  ctx.save(); ctx.beginPath(); ctx.rect(-140, -170, 280, 270); ctx.clip(); drawPip(ctx, -20, 110, 1.05, { look: [2, 0] }); ctx.restore();
  text(ctx, 'PIP', 0, 152, { font: '48px Slab', fill: PAL.ink, align: 'center' });
  ctx.restore();
  if (k >= 1) stamp(ctx, t, 37.45, 'CLEARED', 540, 1000, PAL.avocadoD, -0.18, 84, 38.5);
}
function pawCallouts(ctx, t) {
  if (t < 41.3 || t >= 45.0) return;
  ctx.save(); ctx.globalAlpha = 0.55 * ss(seg(t, 41.3, 41.5)) * (1 - ss(seg(t, 44.75, 45.0))); ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, W, H); ctx.restore();
  const out = ss(seg(t, 44.7, 44.95));
  const circ = (cx, cy, t0, draw, label, col, tl) => {
    const k = pop(t, t0, 0.3) * (1 - out); if (k <= 0) return;
    const R = 220 * k;
    shape(ctx, ellipse(cx, cy, R + 18, R + 18, 72), { fill: PAL.white, line: 6, seed: 2700 + cx, grain: 0.15 });
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); ctx.fillStyle = COL.line; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    ctx.fillStyle = '#5E6E80'; ctx.fillRect(cx - R, cy + 120 * k, 2 * R, R); draw(cx, cy + 120 * k, 1.9 * k); ctx.restore();
    ink(ctx, ellipse(cx, cy, R, R, 72), 6, { closed: true, seed: 2710 + cx });
    const kl = pop(t, tl, 0.26) * (1 - out); if (kl <= 0) return;
    ctx.save(); ctx.translate(cx, cy + 300); ctx.scale(kl, kl); ctx.rotate(-0.05);
    shape(ctx, rrect(-190, -56, 380, 112, 16), { fill: col, line: 5, seed: 2720 + cx, grain: 0.2, off: [6, 5] });
    text(ctx, label, 0, 22, { font: '62px Slab', fill: PAL.ink, plate: PAL.white, off: [3, 3], align: 'center' }); ctx.restore();
  };
  circ(290, 560, 41.35, (x, y, s) => drawMabel(ctx, x, y, s, {}), 'CLEAN', PAL.avocadoL, 42.05);
  circ(790, 560, 42.75, (x, y, s) => drawRollo(ctx, x, y, s * 1.35, { paint: true, guilty: true }), 'YELLOW!', PAL.mustard, 43.6);
}
function outro(ctx, t) {
  const k = pop(t, 49.3, 0.3), out = ss(seg(t, 50.95, 51.2)); if (k <= 0 || out >= 1) return;
  ctx.save(); ctx.translate(540, 360); ctx.scale(k * (1 - out), k * (1 - out)); ctx.rotate(-0.05);
  shape(ctx, rrect(-400, -110, 800, 220, 30), { fill: PAL.mustard, line: 6, seed: 2800, grain: 0.3, off: [8, 7] });
  text(ctx, 'Did you spot it?', 0, 30, { font: '700 96px Oleo', fill: PAL.ink, align: 'center' });
  ctx.restore();
  const kf = pop(t, 50.0, 0.28); if (kf <= 0 || out > 0) return;
  ctx.save(); ctx.translate(540, 560); ctx.scale(kf, kf);
  shape(ctx, rrect(-360, -48, 720, 96, 16), { fill: COL.paper, line: 4.5, seed: 2801, grain: 0.15, off: [6, 5] });
  star(ctx, -320, 0, 18, { n: 8, inner: 0.42, fill: PAL.coral, off: [0, 0], rot: t });
  text(ctx, 'Follow for the next riddle', 20, 16, { font: '600 44px Jost', fill: PAL.ink, align: 'center' });
  ctx.restore();
}
function laterBanner(ctx, t) {                                // "When he came back..." time-skip card
  const k = Math.min(pop(t, 10.9, 0.24), 1 - ss(seg(t, 11.9, 12.1))); if (k <= 0) return;
  ctx.save(); ctx.translate(540, 330); ctx.scale(k, k); ctx.rotate(-0.04);
  shape(ctx, rrect(-280, -55, 560, 110, 14), { fill: PAL.mustard, line: 5, seed: 2850, grain: 0.2, off: [6, 5] });
  text(ctx, 'LATER...', 0, 22, { font: '64px Slab', fill: PAL.ink, plate: PAL.white, off: [3, 3], align: 'center' });
  ctx.restore();
}
function morningBanner(ctx, t) {
  const k = Math.min(pop(t, 4.3, 0.26), 1 - ss(seg(t, 6.6, 6.85))); if (k <= 0) return;
  ctx.save(); ctx.translate(540, 300); ctx.scale(k, k); ctx.rotate(-0.04);
  shape(ctx, rrect(-330, -55, 660, 110, 14), { fill: PAL.blueL, line: 5, seed: 2860, grain: 0.2, off: [6, 5] });
  text(ctx, 'THIS MORNING', 0, 22, { font: '64px Slab', fill: PAL.ink, plate: PAL.white, off: [3, 3], align: 'center' });
  ctx.restore();
}
function hookMark(ctx, t) {                                   // the big "?" over the empty plate (loops: same at 0 and 52)
  const on = t < 3.9 || t >= 51.6; if (!on) return;
  const k = t < 3.9 ? Math.min(1, 1 - ss(seg(t, 3.6, 3.9))) : ss(seg(t, 51.6, 51.98));
  const b = Math.sin(twos(t) * TAU * 0.5) * 0.06;
  ctx.save(); ctx.translate(790, 470); ctx.scale(k, k); ctx.rotate(0.1 + b);
  star(ctx, 0, 0, 150, { n: 14, inner: 0.8, fill: PAL.white, off: [0, 0], rot: twos(t) * 0.1 });
  text(ctx, '?', 0, 60, { font: '190px Slab', fill: PAL.coral, plate: PAL.ink, off: [6, 6], align: 'center' });
  ctx.restore();
}
function caption(ctx, t) {
  const c = cues().find(q => t >= q.t0 && t < q.t1); if (!c || NOCAP.has(c.id)) return;
  const a = Math.min(ss(seg(t, c.t0, c.t0 + 0.14)), 1 - ss(seg(t, c.t1 - 0.14, c.t1)));
  const f = fit(ctx, c.text, '600 {px}px Jost', 52, 860, 2, 36), words = c.text.split(/\s+/), keys = KEY[c.id] || [];
  const lh = f.px * 1.22, h = 44 + f.lines.length * lh, w = Math.max(...f.lines.map(l => measure(ctx, l, f.font))) + 120, y = 1420 - h / 2;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 12);
  shape(ctx, rrect(W / 2 - w / 2, y, w, h, 16), { fill: COL.paper, line: 3.6, seed: 901, grain: 0.15, breaks: 0.08, off: [6, 6] });
  star(ctx, W / 2 - w / 2 + 30, y + h / 2, 14, { n: 8, inner: 0.4, fill: COL.accent, off: [0, 0], rot: t * 0.8 });
  star(ctx, W / 2 + w / 2 - 30, y + h / 2, 14, { n: 8, inner: 0.4, fill: COL.accent, off: [0, 0], rot: -t * 0.8 });
  const tot = words.reduce((s, x) => s + x.length + 1, 0); let acc = 0, wi = 0; const WT = WORDS[c.id];
  ctx.font = f.font;
  f.lines.forEach((line, li) => {
    const lw = measure(ctx, line, f.font); let x = W / 2 - lw / 2;
    line.split(/\s+/).forEach(wd => {
      const tw = WT && WT[wi] ? c.t0 + WT[wi].t0 - 0.04 : c.t0 + (acc / tot) * c.dur * 0.92; acc += wd.length + 1; wi++;   // pop 40 ms before the word is heard
      const k = back(seg(t, tw - 0.02, tw + 0.14), 2.2), ww = measure(ctx, wd + ' ', f.font);
      const bare = wd.replace(/^["“]|["”]$/g, '');
      if (k > 0) { ctx.save(); const cx = x + ww / 2, cy = y + 22 + lh * li + f.px * 0.95; ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
        text(ctx, wd, x, cy, { font: f.font, fill: (keys.includes(wd) || keys.includes(bare)) ? PAL.coralD : PAL.ink }); ctx.restore(); }
      x += ww;
    });
  });
  ctx.restore();
}

// ---------------------------------------------------------------- render
function drawSet(ctx, t, name) { return name === 'room' ? room(ctx, t) : lineup(ctx, t); }
export function renderFilm(ctx, t, Q) {
  setClock(t);
  ctx.fillStyle = COL.wall; ctx.fillRect(0, 0, W, H);
  const cur = setAt(t);
  drawSet(ctx, t, cur);
  const cut = CUTS.find(([c]) => t >= c && t < c + 0.3);
  if (cut) {                                                   // colour-block wipe: the next set slides in from the right behind a coral bar
    const k = eio(seg(t, cut[0], cut[0] + 0.3)), x = W * (1 - k);
    ctx.fillStyle = COL.wall; ctx.fillRect(0, 0, W, H); drawSet(ctx, cut[0] - 0.001, setAt(cut[0] - 0.001));   // outgoing side holds its last frame
    ctx.save(); ctx.beginPath(); ctx.rect(x, 0, W, H); ctx.clip(); drawSet(ctx, t, cut[1]); ctx.restore();
    plane(ctx, rect(x - 40, -10, 40, H + 20), PAL.coral, { grain: 0.2 }); ink(ctx, [[x - 40, -10], [x - 40, H + 10]], 6, { seed: 2900 });
  }
  hookMark(ctx, t); laterBanner(ctx, t); morningBanner(ctx, t);
  countdown(ctx, t); aha(ctx, t);
  pipCleared(ctx, t);
  stamp(ctx, t, 47.35, 'GUILTY', 540, 380, PAL.coral, -0.12, 140, 49.2);
  pawCallouts(ctx, t);
  outro(ctx, t);
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
  ev(0.0, 'sea', { dur: 13.0 }); ev(0.05, 'pop', { gain: 0.5 });
  ev(4.0, 'whoosh_down', { dur: 0.45 });
  for (let i = 0; i < STEPS; i++) ev(4.45 + i * 0.22, 'brush', { n: i });
  ev(5.9, 'pop', {});
  ev(7.0, 'whoosh_up', { dur: 0.45 }); ev(7.35, 'pop', { gain: 0.8 });
  ev(9.0, 'shutter', { pan: -0.3 }); ev(9.4, 'shutter', { pan: 0.2 }); ev(9.75, 'lock', {}); ev(9.9, 'lock', {});
  ev(10.9, 'wipe', {}); ev(11.45, 'poof', {}); ev(11.7, 'slide_down', {});
  ev(13.0, 'wipe', {}); [13.15, 13.4, 13.65].forEach((x, i) => ev(x, 'thump', { n: i })); [13.25, 13.5, 13.75].forEach(x => ev(x, 'stamp', { gain: 0.35 }));
  ev(14.45, 'push', {}); ev(14.95, 'pop', {}); for (let i = 0; i < 6; i++) ev(14.6 + i * 0.5, 'flap', { gain: 0.5 });
  ev(18.15, 'push', {}); ev(18.55, 'pop', {}); ev(18.8, 'snore', { dur: 2.4 });
  ev(21.65, 'push', {}); ev(22.05, 'pop', {}); ev(21.8, 'squeak', {});
  ev(25.4, 'push', {}); [25.8, 25.98, 26.16].forEach(x => ev(x, 'pop', { gain: 0.6 })); ev(25.6, 'drip', {});
  ev(27.45, 'pop', {});
  for (let s = 28; s < 33; s++) ev(s, 'tick', { n: s - 28 });
  ev(33.0, 'bell', {});
  ev(34.5, 'aha', {});
  ev(36.0, 'wipe', {}); ev(36.7, 'pop', {}); ev(37.45, 'stamp', { gain: 0.8 });
  ev(38.6, 'whoosh_down', { dur: 0.4 }); for (let i = 0; i < STEPS; i++) ev(39.05 + i * 0.19, 'step_pizz', { n: i * 2 });
  ev(41.15, 'wipe', {}); ev(41.35, 'pop', {}); ev(42.05, 'ding', {}); ev(42.75, 'pop', {}); ev(43.6, 'stamp', { gain: 0.6 });
  ev(44.8, 'push', {}); ev(45.1, 'drip', {}); ev(46.4, 'drip', {}); ev(47.35, 'stamp', { gain: 1.0 }); ev(48.1, 'burp', {});
  ev(49.15, 'wipe', {}); ev(49.3, 'pop', {}); ev(50.0, 'pop', { gain: 0.6 });
  ev(51.0, 'whoosh_up', { dur: 0.9 }); ev(51.6, 'pop', { gain: 0.5 }); ev(49.3, 'sea', { dur: 2.7 });
  EVS.sort((a, b) => a.t - b.t);
}
