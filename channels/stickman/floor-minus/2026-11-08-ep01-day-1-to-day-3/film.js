// Floor Minus · Ep 1 "Day 1 to Day 3": stickman survival serial, long-form 16:9 (1920x1080, 30 fps, 282 s) + 3 floor Shorts (?short=N).
// Bible: ../SERIES-BIBLE.md. Rig: rig.js (WI01, IK legs, faces). Captions: karaoke chunks (stickman style, Jp liked on WI01).
// Camera: fixed framings joined by cuts; nothing zooms. Physics gags move the WORLD (the tilt) or the characters, never the lens.
import { PAL, setClock, shape, plane, ink, rays, ellipse, rect, rrect, spline, star, sparkle, text, fit, measure,
  paperFinish, clamp, lerp, seg, ss, eio, back, twos, TAU, hash } from './engine/toon.js';
import { stick, walkFeet, INK } from './rig.js';

export let W = 1920, H = 1080, DURATION = 282.0;
export const SHORTS = [{ n: 1, a: 23.0, b: 63.0, title: 'FLOOR -1: SAY THANK YOU' }, { n: 2, a: 96.6, b: 131.6, title: 'FLOOR -2: THE RAIN FALLS UP' }, { n: 3, a: 182.4, b: 216.8, title: 'FLOOR -3: BE QUIET' }];
export const SHORT_END = 4.0;
let PORT = false;
export function setShort(n) { const S = SHORTS[n - 1]; PORT = true; W = 1080; H = 1920; return S.b - S.a + SHORT_END; }
const G = 900;                                                      // floor line in every set
const COL = { blue: '#3C6EB4', red: '#E04848', teal: '#2EC4B6', yellow: '#FFC93C', cream: '#FBF7EF' };
const S0 = { grain: 0, breaks: 0, off: [0, 0], lineColor: INK };
const ME = { hair: 'tuft', pants: COL.blue }, NORA = { hair: 'bob', hairCol: '#4A2C22', pants: '#5E4B8B' };

// ---------------------------------------------------------------- voice + captions
const KEY = { n01: ['three', 'rules.'], n02: ["don't", 'one.'], n03: ['down.'], n04: ['no', 'up'], n06: ['thank', 'you.'], n08: ['tilts.'], n09: ['levels'], n12: ['three'], n13: ['forgets.'],
  n18: ['up.'], n19: ['closer.'], n22: ['your', 'handwriting.'], n23: ["Don't", 'trust'], n25: ["hand's"], n28: ['whisper'], n29: ['Ten'], n30: ['Nine.'], n31: ['Eight.'],
  n32: ['Loudly.', 'Four'], n33: ['gone.'], n34: ['Ten'], n36: ['blue.'], n37: ['Nobody'], n39: ['zero.'], n40: ['apartment.'], n42: ['someone'], n44: ['you.'], n45: ['Saturday.'] };
let V = [], TXT = {}, WORDS = {}, VO = {};
const estDur = s => s.split(/\s+/).length / 2.8 + 0.25 * (s.slice(0, -1).match(/[.,:?!]/g) || []).length;
export function setup(lines, durs, words = {}) {
  WORDS = words; let end = 0;
  V = lines.filter(l => !l.short).map(l => { TXT[l.id] = l.caption; VO[l.id] = l.voice; const d = durs[l.id] ?? estDur(l.text), t = Math.max(l.start, end + 0.2); end = t + d;
    if (t > l.start + 0.6) console.warn(`line ${l.id} pushed ${(t - l.start).toFixed(2)} s late`); return { id: l.id, t, dur: d, text: l.caption, who: l.voice === 'bm_george' ? 'op' : l.voice === 'af_bella' ? 'nora' : l.id === 'yu1' ? 'you2' : 'n' }; });
  V.forEach((v, i) => v.next = V[i + 1] ? V[i + 1].t : DURATION);
  buildEvents();
}
const VT = id => (V.find(v => v.id === id) || { t: 0 }).t;
const speaking = (t, who) => V.some(v => v.who === who && t >= v.t && t < v.t + v.dur);
function cues() { return V.map(v => ({ ...v, t0: v.t, t1: Math.min(v.next - 0.08, v.t + v.dur + 0.4) })); }
export function srtCues() { return cues().map(c => ({ t0: c.t0, t1: c.t1, text: (c.who === 'op' ? 'OPERATOR: ' : c.who === 'nora' ? 'NORA: ' : '') + c.text })); }

// ---------------------------------------------------------------- state over time
const pop = (t, t0, d = 0.26) => back(seg(t, t0, t0 + d), 1.9);
const autoBlink = (t, seed) => { const p = 3.2 + hash(seed, 3) * 1.8, ph = (t + hash(seed, 9) * p) % p; return ph < 0.12 ? 1 : 0; };
const DAY = t => t < 92 ? 1 : t < 146 ? 2 : t < 236 ? 3 : 4;
const FLOOR = t => t < 23 ? 0 : t < 93 ? -1 : t < 154 ? -2 : t < 236 ? -3 : -4;
const FOOD = t => t < 65.6 ? 3 : t < 146.6 ? 2 : t < 226.8 ? 1 : 0;
// lights on the Quiet Floor: 10 → each sound turns one off
const OFF = [171.2, 179.4, 184.0, 184.7, 185.4, 186.1, 212.9];
const lightsOn = t => 10 - OFF.filter(x => t >= x).length;
// the floor -1 tilt (radians, + = tips right): rule broken at 34.0 (you) and 71.8 (the running man)
function tilt(t) {
  const a = 0.17 * eio(seg(t, 34.0, 34.6)) * (1 - eio(seg(t, 41.0, 41.7))) + 0.3 * eio(seg(t, 71.9, 72.4)) * (1 - eio(seg(t, 76.6, 77.4)));
  const wob = (x0) => t > x0 && t < x0 + 1.2 ? Math.sin((t - x0) * 18) * 0.02 * (1 - (t - x0) / 1.2) : 0;
  return a + wob(34.6) + wob(41.7) + wob(72.4) + wob(77.4);
}

// ---------------------------------------------------------------- shots: [start, set, cam]
const WIDE = { cx: 960, cy: 540, z: 1 };
const CAM = { panel: { cx: 560, cy: 520, z: 2.2 }, grille: { cx: 1340, cy: 380, z: 1.8 }, two: { cx: 1180, cy: 560, z: 1.5 }, note: { cx: 960, cy: 540, z: 1 },
  sofa: { cx: 1100, cy: 560, z: 1.45 }, faceoff: { cx: 960, cy: 520, z: 1.35 }, desk: { cx: 900, cy: 700, z: 1.6 } };
const SHOTS = [
  [0, 'hall', WIDE], [11.0, 'lift', WIDE], [16.4, 'lift', CAM.panel], [19.0, 'lift', WIDE],
  [23.8, 'f1', WIDE, 1], [45.2, 'f1', CAM.two], [52.0, 'f1', WIDE], [63.2, 'f1', CAM.two], [68.6, 'f1', WIDE], [83.2, 'lift', WIDE],
  [97.0, 'f2', WIDE, 1], [117.6, 'f2', CAM.desk], [121.2, 'note', CAM.note], [132.4, 'f2', WIDE], [143.6, 'lift', WIDE],
  [157.6, 'f3', WIDE, 1], [193.4, 'f3', CAM.two], [205.2, 'f3', WIDE], [221.2, 'lift', WIDE],
  [240.2, 'f4', WIDE, 1], [249.4, 'f4', CAM.sofa], [257.2, 'f4', CAM.faceoff], [266.4, 'f4', WIDE],
];
const shotAt = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; };
// vertical Shorts: the wide framings follow You across the set (x only), slightly tighter
const PCX = { f1: () => 900, f2: t => t < 111.8 ? 480 : clamp(lerp(200, 1460, ss(seg(t, 112.0, 120.4))) - 80, 500, 1420), f3: t => clamp(lerp(260, 1500, ss(clamp((t - 168) / 51))) + 85, 520, 1400), note: () => 960 };
const camOf = (s, t) => PORT ? (s[2] === WIDE ? { cx: (PCX[s[1]] || (() => 960))(t), cy: 560, z: s[1] === 'note' ? 1.0 : 0.98 } : { ...s[2], z: s[2].z * 0.85 }) : s[2];

// ---------------------------------------------------------------- characters
function walker(t, t0, t1, x0, x1, stride = 46) {                    // x and feet for a walk (WI01 gait), with an arrival settle
  const k = clamp((t - t0) / (t1 - t0)), x = lerp(x0, x1, ss(k)), walking = t > t0 && t < t1, ph = (t - t0) * 1.9;
  return { x, walking, feet: walking ? walkFeet(ph, stride) : [[-24, 0], [24, 0]], bob: walking ? -Math.abs(Math.sin(ph * TAU)) * 8 : 0, flip: x1 < x0 };
}
function scarf(ctx, r, s, col, t) {                                  // Nora's scarf, drawn over the rig at the neck (+ a tail that sways)
  const [hx, hy] = r.head, ny = hy + 60 * s;
  shape(ctx, rrect(hx - 34 * s, ny - 14 * s, 68 * s, 26 * s, 12 * s), { fill: col, line: 4, ...S0 });
  const sw = Math.sin(t * 2.4) * 8 * s; shape(ctx, [[hx + 10 * s, ny + 4 * s], [hx + 30 * s + sw, ny + 70 * s], [hx + 12 * s + sw, ny + 74 * s], [hx - 4 * s, ny + 6 * s]], { fill: col, line: 4, ...S0 });
}
function you(ctx, t, o) { return stick(ctx, { ...ME, s: o.s ?? 0.95, blink: autoBlink(t, 3), talk: 0, ...o }); }
function nora(ctx, t, o) { const s = o.s ?? 0.92; const r = stick(ctx, { ...NORA, s, blink: autoBlink(t, 5), talk: speaking(t, 'nora') ? t : 0, ...o }); scarf(ctx, r, s, o.scarf || COL.red, t); return r; }
function bubble(ctx, t, t0, t1, x, y, str, col = COL.cream) {         // speech bubble ("THANK YOU!")
  if (t < t0 || t >= t1) return; const k = pop(t, t0, 0.22) * (1 - ss(seg(t, t1 - 0.15, t1)));
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); const w = measure(ctx, str, '800 40px Jost') + 50;
  shape(ctx, [[-w / 2, -40], [w / 2, -40], [w / 2, 30], [-10, 30], [-34, 62], [-30, 30], [-w / 2, 30]], { fill: col, line: 5, ...S0 });
  text(ctx, str, 0, 10, { font: '800 40px Jost', fill: INK, align: 'center' }); ctx.restore();
}

// ---------------------------------------------------------------- sets
function lcd(ctx, x, y, w, h, str, col = '#FF6B4A', px = 64) {
  shape(ctx, rrect(x - w / 2, y - h / 2, w, h, 10), { fill: '#1A1A1E', line: 6, ...S0 });
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 14; text(ctx, str, x, y + px * 0.36, { font: `${px}px Slab`, fill: col, align: 'center' }); ctx.restore();
}
// the elevator seen from inside: steel walls, brass doors (open k) with the next floor visible in the gap
function liftInterior(ctx, t, o = {}) {
  plane(ctx, rect(-200, -200, 2400, G + 200), '#7E8C94', { grain: 0.15 });
  for (let i = 0; i < 9; i++) shape(ctx, rect(80 + i * 200, 80, 180, G - 160), { fill: '#8E9CA4', line: 4, ...S0 });
  plane(ctx, rect(-200, G, 2400, 600), '#4E4A46', { grain: 0.2 }); ink(ctx, [[-100, G], [2100, G]], 7, { color: INK, seed: 7000, taper: false });
  for (let i = 0; i < 12; i++) ink(ctx, [[i * 180 - 100, G], [i * 220 - 300, 1100]], 3, { color: '#3A3632', seed: 7001 + i, taper: false });
  const k = o.open ?? 0, x0 = 700, x1 = 1220, y0 = 230, half = (x1 - x0) / 2;
  shape(ctx, rect(x0 - 26, y0 - 26, x1 - x0 + 52, G - y0 + 26), { fill: '#C9A55A', line: 6, ...S0 });
  if (k > 0 && o.behind) { ctx.save(); ctx.beginPath(); ctx.rect(x0 + half * (1 - k), y0, (x1 - x0) * k, G - y0); ctx.clip(); ctx.translate(x0 + half, y0 + 120); ctx.scale(0.45, 0.45); ctx.translate(-960, -540); o.behind(ctx, t); ctx.restore(); }
  else if (k > 0) plane(ctx, rect(x0 + half * (1 - k), y0, (x1 - x0) * k, G - y0), '#111', { grain: 0 });
  [[x0, -1], [x0 + half, 1]].forEach(([dx, d], i) => { const px = i ? dx + half * k : dx - half * k; shape(ctx, rect(px, y0, half, G - y0), { fill: '#D9B868', line: 5, ...S0 }); ink(ctx, [[px + 30, y0 + 40], [px + 30, G - 40]], 3, { color: '#B08F44', seed: 7010 + i, taper: false }); });
  lcd(ctx, 960, 150, 220, 100, String(o.floor ?? FLOOR(t)));
  // button panel: only DOWN arrows
  shape(ctx, rrect(500, 380, 120, 300, 14), { fill: '#C9CFD3', line: 5, ...S0 });
  for (let r = 0; r < 4; r++) { shape(ctx, ellipse(560, 430 + r * 66, 24, 24, 20), { fill: r === 0 ? COL.yellow : '#E8E8E8', line: 4, ...S0 }); shape(ctx, [[546, 422 + r * 66], [574, 422 + r * 66], [560, 442 + r * 66]], { fill: INK, line: 0, ...S0 }); }
  // the Operator's speaker grille (glows while it talks)
  const on = speaking(t, 'op');
  if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(1340, 380, 10, 1340, 380, 170); g.addColorStop(0, 'rgba(255,120,80,0.6)'); g.addColorStop(1, 'rgba(255,120,80,0)'); ctx.fillStyle = g; ctx.fillRect(1160, 200, 360, 360); ctx.restore(); }
  shape(ctx, ellipse(1340, 380, 90, 90, 40), { fill: '#3A3E44', line: 6, ...S0 });
  for (let r = 1; r <= 4; r++) ink(ctx, ellipse(1340, 380, r * 18 + (on ? Math.sin(t * 30 + r) * 2 : 0), r * 18, 30), 3.5, { closed: true, color: on ? '#FF8A5C' : '#6A6E74', seed: 7020 + r, taper: false });
}
function hall(ctx, t) {                                              // outside the elevator (hook)
  plane(ctx, rect(-200, -200, 2400, G + 200), '#2E3440', { grain: 0.15 }); plane(ctx, rect(-200, G, 2400, 600), '#22262E', { grain: 0.2 });
  ink(ctx, [[-100, G], [2100, G]], 7, { color: '#0E1014', seed: 7100, taper: false });
  const k = eio(seg(t, 7.4, 8.2)) * (1 - eio(seg(t, 10.0, 10.8)));
  liftDoorsOutside(ctx, t, k);
  const w = walker(t, 8.0, 9.8, 520, 960);
  if (t < 10.8) you(ctx, t, { x: w.x, y: G + 4, feet: w.feet, bob: w.bob, face: t < 7.2 ? 'worried' : 'flat', look: t < 4 ? [6, -4] : [3, 0], s: 1.0 });
  if (k > 0) liftDoorsOutside(ctx, t, k, true);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(960, 150, 10, 960, 150, 500); g.addColorStop(0, 'rgba(255,107,74,0.25)'); g.addColorStop(1, 'rgba(255,107,74,0)'); ctx.fillStyle = g; ctx.fillRect(400, -200, 1200, 900); ctx.restore();
}
function liftDoorsOutside(ctx, t, k, front = false) {
  const x0 = 760, x1 = 1160, y0 = 300, half = (x1 - x0) / 2;
  if (!front) { shape(ctx, rect(x0 - 30, y0 - 30, x1 - x0 + 60, G - y0 + 30), { fill: '#9A8A6A', line: 6, ...S0 }); plane(ctx, rect(x0, y0, x1 - x0, G - y0), '#8E9CA4', { grain: 0.15 }); lcd(ctx, 960, 190, 160, 80, '▼', '#FF6B4A', 50); return; }
  [[x0, 0], [x0 + half, 1]].forEach(([dx, i]) => { const px = i ? dx + half * k : dx - half * k; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, G - y0); ctx.clip(); shape(ctx, rect(px, y0, half, G - y0), { fill: '#B8BFC4', line: 5, ...S0 }); ctx.restore(); });
}
// Floor −1 · The Polite Floor: a warm hotel lobby
function floor1(ctx, t) {
  const a = tilt(t);
  ctx.save(); ctx.translate(960, G); ctx.rotate(a); ctx.translate(-960, -G);
  plane(ctx, rect(-600, -600, 3200, G + 600), '#F3D9B1', { grain: 0.12 });
  for (let i = -2; i < 14; i++) shape(ctx, rect(i * 160, 120, 150, G - 220), { fill: '#EFCF9F', line: 3, ...S0 });
  plane(ctx, rect(-600, G - 100, 3200, 100), '#8C3B2E', { grain: 0.1 });
  plane(ctx, rect(-600, G, 3200, 800), '#B4413A', { grain: 0.2 }); ink(ctx, [[-600, G], [2600, G]], 7, { color: INK, seed: 7200, taper: false });
  for (let i = 0; i < 16; i++) ink(ctx, [[i * 160 - 300, G + 30], [i * 160 - 260, G + 60]], 4, { color: '#E8B43A', seed: 7201 + i, taper: false });
  [[380], [1100], [1700]].forEach(([px], i) => { shape(ctx, rect(px - 40, 80, 80, G - 80), { fill: '#FBF1DD', line: 6, ...S0 }); shape(ctx, rect(px - 56, 60, 112, 40), { fill: '#E8D3A8', line: 6, ...S0 }); shape(ctx, rect(px - 56, G - 40, 112, 40), { fill: '#E8D3A8', line: 6, ...S0 }); });
  // chandelier (swings with the tilt: it hangs straight down in world space)
  ctx.save(); ctx.translate(760, 40); ctx.rotate(-a * 1.1 + Math.sin(t * 1.4) * 0.02);
  ink(ctx, [[0, 0], [0, 120]], 5, { color: INK, seed: 7210, taper: false }); shape(ctx, ellipse(0, 150, 110, 30, 30), { fill: '#E8B43A', line: 5, ...S0 });
  for (let i = 0; i < 6; i++) shape(ctx, ellipse(-90 + i * 36, 186, 8, 18, 10), { fill: '#FFF3B0', line: 3, ...S0 }); ctx.restore();
  // the sign
  shape(ctx, rrect(1250, 200, 380, 150, 12), { fill: COL.cream, line: 6, ...S0 });
  text(ctx, 'BEFORE EVERY ACTION', 1440, 258, { font: '800 30px Jost', fill: INK, align: 'center' }); text(ctx, 'SAY THANK YOU', 1440, 316, { font: '44px Slab', fill: COL.red, align: 'center' });
  // the clock (midnight at the end)
  shape(ctx, ellipse(240, 230, 60, 60, 30), { fill: COL.cream, line: 5, ...S0 });
  const hm = t < 80 ? (t - 24) / 56 * 0.95 : 1, ah = (10 + hm * 2) / 12 * TAU - Math.PI / 2, am = ((hm * 2) % 1) * TAU - Math.PI / 2;
  ink(ctx, [[240, 230], [240 + Math.cos(ah) * 30, 230 + Math.sin(ah) * 30]], 6, { color: INK, seed: 7220, taper: false }); ink(ctx, [[240, 230], [240 + Math.cos(am) * 46, 230 + Math.sin(am) * 46]], 4, { color: INK, seed: 7221, taper: false });
  // sofa (Nora's)
  shape(ctx, rrect(1380, G - 150, 340, 110, 26), { fill: '#3F7A6A', line: 6, ...S0 }); shape(ctx, rrect(1360, G - 220, 380, 90, 30), { fill: '#4C8E7C', line: 6, ...S0 });
  // characters (inside the tilted world)
  const slide = (x, t0, t1, dx) => x + dx * ss(seg(t, t0, t1));
  let yx = 300, yo = {};
  if (t < 32.2) { yo = { face: 'flat', look: [4, -2] }; yx = 620; }
  else if (t < 34.0) { const w = walker(t, 32.3, 33.9, 620, 820); yx = w.x; yo = { feet: w.feet, bob: w.bob, face: 'smile' }; }
  else if (t < 41.7) { yx = slide(820, 34.2, 35.8, 230); yo = { face: t < 38.8 ? 'shock' : 'worried', lean: -a * 0.8, armR: t >= 36.0 ? { hand: [1090, 520] } : [-0.6, -0.9], armL: [-2.4, -2.2], feet: [[-30, 0], [40, 0]] }; }
  else { yx = 1050; if (t >= 45.2 && t < 52) yx = 860; if (t >= 52 && t < 68.6) yx = 1160; if (t >= 68.6) yx = 1040; yo = { face: t > 71.8 && t < 77.4 ? 'shock' : 'smile' };
    if (t >= 72.0 && t < 77.4) yo = { ...yo, lean: -a * 0.8, armR: { hand: [1090, 500] }, feet: [[-20, 0], [30, 0]] }; }
  if (t >= 45.2 && t < 52) {                                         // montage: step / chair / air
    const ph = t < 47.8 ? 0 : t < 50.0 ? 1 : 2; yo.face = 'grin';
    if (ph === 0) { const w = walker(t, 45.4, 46.8, 760, 900); yx = w.x; yo.feet = w.feet; yo.bob = w.bob; }
    if (ph === 1) { shape(ctx, rrect(860, G - 120, 120, 30, 8), { fill: '#7B4B2E', line: 5, ...S0 }); [[870], [960]].forEach(([lx]) => ink(ctx, [[lx, G - 90], [lx, G]], 8, { color: INK, seed: 7230 + lx, taper: false })); ink(ctx, [[970, G - 120], [980, G - 230]], 8, { color: INK, seed: 7233, taper: false }); yx = 930; yo.h = 0.82; yo.feet = [[-50, 0], [20, 0]]; }
    if (ph === 2) { yx = 900; yo.armL = [-2.0 + Math.sin(t * 6) * 0.2, -2.4]; yo.armR = [-1.1 - Math.sin(t * 6) * 0.2, -0.7]; yo.sq = Math.sin(t * 9) * 0.05; }
  }
  if (t >= 63.4 && t < 68.6) { yo.armR = { hand: [yx + 40, 640 + Math.sin(t * 8) * 20] }; yo.talk = Math.abs(Math.sin(t * 7)) > 0.5 ? t : 0; }
  const yr = you(ctx, t, { x: yx, y: G + 4, ...yo });
  if (t >= 63.4 && t < 68.6) { const [hx, hy] = yr.hands[1]; const bite = Math.floor(clamp((t - 64.2) / 1.2) * 3); shape(ctx, [[hx - 34, hy + 10], [hx + 34 - bite * 18, hy + 10], [hx, hy - 30]], { fill: '#F2D49B', line: 4, ...S0 }); }
  // Nora: on the sofa until 52, then stands beside you
  if (t >= 40) {
    let nx = 1560, no = { face: 'flat', look: [-6, 0] };
    if (t >= 52) { nx = 1400; no.face = 'smile'; }
    if (t >= 72.0 && t < 77.4) no = { ...no, face: 'shock', lean: -a * 0.8, armL: { hand: [1110, 520] }, feet: [[-20, 0], [30, 0]] };
    if (t >= 72.0 && t < 77.4) nx = 1180;
    if (t >= 80.4) { no.face = 'worried'; }
    nora(ctx, t, { x: nx, y: G + 4, ...no });
  }
  // the running man (68.8–75.4): runs in from the left, forgets, slides out right
  if (t >= 69.0 && t < 76.0) {
    const run = t < 71.8 ? lerp(-200, 560, seg(t, 69.0, 71.8)) : lerp(560, 2300, eio(seg(t, 72.0, 74.6)));
    const ph = (t - 69) * 3.2;
    stick(ctx, { x: run, y: G + 4, s: 0.95, hair: 'spike', tie: COL.red, pants: '#555', face: t < 71.8 ? 'grin' : 'shock', feet: t < 71.8 ? walkFeet(ph, 70) : [[-30, 0], [30, 0]],
      bob: t < 71.8 ? -Math.abs(Math.sin(ph * TAU)) * 14 : 0, lean: t < 71.8 ? 0.2 : -a * 1.2 - 0.3, armL: t >= 71.8 ? [-2.2, -2.6] : undefined, armR: t >= 71.8 ? [-0.9, -0.5] : undefined });
  }
  ctx.restore();
  // bubbles (screen-ish space, after the world)
  bubble(ctx, t, VT('n09') + 1.4, VT('n09') + 3.2, 1150, 260, 'THANK YOU!');
  [[45.4, 'THANK YOU (STEP)'], [48.0, 'THANK YOU (CHAIR)'], [50.2, 'THANK YOU (AIR)']].forEach(([x0, s], i) => bubble(ctx, t, x0, x0 + 2.2, 1150, 300, s));
  bubble(ctx, t, VT('n12') + 2.8, VT('n12') + 4.6, 1300, 300, 'THANK YOU!');
  bubble(ctx, t, VT('n16') + 0.6, VT('n16') + 2.4, 1100, 260, 'THANK YOU! THANK YOU!');
}
// Floor −2 · The rain falls up: a blue office; water pools on the ceiling and comes DOWN
const waterY = t => lerp(110, 800, ss(seg(t, 99.0, 142.0)));
function floor2(ctx, t) {
  plane(ctx, rect(-600, -600, 3200, G + 600), '#3E5F86', { grain: 0.15 });
  for (let i = -2; i < 14; i++) ink(ctx, [[i * 170, -100], [i * 170, G]], 3, { color: '#35537A', seed: 7300 + i, taper: false });
  plane(ctx, rect(-600, G, 3200, 800), '#2C3E58', { grain: 0.2 }); ink(ctx, [[-600, G], [2600, G]], 7, { color: INK, seed: 7310, taper: false });
  // desks
  const DESKS = [300, 720, 1140, 1560];
  DESKS.forEach((dx, i) => { shape(ctx, rrect(dx - 150, G - 200, 300, 26, 6), { fill: '#C9A87C', line: 5, ...S0 }); [[-130], [130]].forEach(([lx]) => shape(ctx, rect(dx + lx - 10, G - 176, 20, 176), { fill: '#A2845E', line: 4, ...S0 })); shape(ctx, rrect(dx - 60, G - 290, 120, 90, 8), { fill: '#2B2B2B', line: 5, ...S0 }); });
  // the Operator's wall grille
  const on = speaking(t, 'op'); shape(ctx, ellipse(1800, 330, 60, 60, 30), { fill: '#3A3E44', line: 5, ...S0 }); for (let r = 1; r <= 3; r++) ink(ctx, ellipse(1800, 330, r * 16, r * 16, 24), 3, { closed: true, color: on ? '#FF8A5C' : '#6A6E74', seed: 7320 + r, taper: false });
  // characters: stand → crouch → crawl under desks
  const crawl = t >= 111.8, yk = crawl ? lerp(200, 1460, ss(seg(t, 112.0, 120.4))) : 520, ph = (t - 112) * 2.2;
  const low = o => ({ ...o, h: 0.62, lean: 0.55, feet: crawl && t < 120.4 ? walkFeet(ph, 30) : [[-40, 0], [20, 0]], armR: [0.4, 0.9], armL: [0.9, 1.3] });
  const yo = { face: t < 103 ? 'shock' : 'worried', look: t < 108 ? [0, -10] : [8, 2] }, no = { face: 'flat', look: [-4, -6] };
  if (crawl) { you(ctx, t, low({ x: yk, y: G + 4, ...yo })); nora(ctx, t, low({ x: yk - 170, y: G + 4, ...no })); }
  else if (t >= 108) { you(ctx, t, { x: 560, y: G + 4, h: lerp(1, 0.62, ss(seg(t, 108.4, 109.4))), lean: 0.3 * ss(seg(t, 108.4, 109.4)), ...yo }); nora(ctx, t, { x: 380, y: G + 4, h: lerp(1, 0.62, ss(seg(t, 108.0, 109.0))), lean: 0.3 * ss(seg(t, 108.0, 109.0)), ...no }); }
  else { you(ctx, t, { x: 560, y: G + 4, ...yo }); nora(ctx, t, { x: 380, y: G + 4, ...no }); }
  // phone light while crawling
  if (crawl) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(yk + 90, G - 40, 10, yk + 90, G - 40, 260); g.addColorStop(0, 'rgba(255,250,210,0.45)'); g.addColorStop(1, 'rgba(255,250,210,0)'); ctx.fillStyle = g; ctx.fillRect(yk - 200, G - 320, 600, 500); ctx.restore(); }
  // upward rain + the ceiling water (wavy lower edge)
  ctx.save(); ctx.strokeStyle = 'rgba(190,220,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); const wy = waterY(t);
  for (let i = 0; i < 140; i++) { const sp = 500 + hash(i, 1) * 400, x = hash(i, 2) * 2000 - 40, y = G - ((hash(i, 3) * 1000 + t * sp) % (G - wy + 40)); if (y > wy) { ctx.moveTo(x, y); ctx.lineTo(x, y - 26); } }
  ctx.stroke(); ctx.restore();
  const edge = []; for (let x = -40; x <= 1960; x += 40) edge.push([x, wy + Math.sin(x / 90 + t * 2.2) * 10 + Math.sin(x / 37 - t * 3) * 5]);
  ctx.save(); ctx.fillStyle = 'rgba(70,140,200,0.55)'; ctx.beginPath(); ctx.moveTo(-40, -200); edge.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(1960, -200); ctx.closePath(); ctx.fill(); ctx.restore();
  ink(ctx, edge, 5, { color: '#BFE3FF', seed: 7330, taper: false });
  for (let i = 0; i < 8; i++) { const bx = hash(i, 7) * 1900, by = wy - 40 - ((t * 60 + i * 50) % Math.max(60, wy - 60)); if (by > 0) ink(ctx, ellipse(bx, by, 8, 8, 12), 3, { closed: true, color: '#DDF1FF', seed: 7340 + i, taper: false }); }
}
function note(ctx, t) {                                              // the note in your handwriting (close)
  plane(ctx, rect(-200, -200, 2400, 1600), '#1E2A3A', { grain: 0.2 });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(960, 520, 40, 960, 520, 700); g.addColorStop(0, 'rgba(255,250,210,0.35)'); g.addColorStop(1, 'rgba(255,250,210,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
  ctx.save(); ctx.translate(960, 520); ctx.rotate(-0.04 + Math.sin(t * 1.2) * 0.01);
  shape(ctx, rect(-460, -280, 920, 520), { fill: '#FDF6E3', line: 6, ...S0 });
  for (let i = 0; i < 7; i++) ink(ctx, [[-420, -200 + i * 66], [420, -200 + i * 66]], 2, { color: '#A9C7E8', seed: 7400 + i, taper: false });
  const u = seg(t, VT('n23') - 0.1, VT('n23') + 1.6);
  ctx.beginPath(); ctx.rect(-440, -260, 880 * u, 480); ctx.clip();
  text(ctx, "DON'T TRUST", 0, -40, { font: '700 110px Oleo', fill: '#26324A', align: 'center', rot: -0.03 });
  text(ctx, 'THE OPERATOR', 0, 100, { font: '700 110px Oleo', fill: '#26324A', align: 'center', rot: -0.03 });
  ctx.restore();
  // your hand + phone at the edge
  ink(ctx, [[1700, 1150], [1520, 860]], 18, { color: INK, seed: 7410, taper: false }); shape(ctx, rrect(1450, 760, 110, 180, 16), { fill: '#2B2B2B', line: 5, ...S0 });
}
// Floor −3 · The Quiet Floor: a dark corridor with ten ceiling lamps
const LAMPS = Array.from({ length: 10 }, (_, i) => 150 + i * 180);
function floor3(ctx, t) {
  plane(ctx, rect(-600, -600, 3200, G + 600), '#5A5048', { grain: 0.15 });
  for (let i = -2; i < 14; i++) shape(ctx, rect(i * 180 + 40, 260, 120, 360), { fill: '#625850', line: 3, ...S0 });
  plane(ctx, rect(-600, G, 3200, 800), '#3A332E', { grain: 0.2 }); ink(ctx, [[-600, G], [2600, G]], 7, { color: INK, seed: 7500, taper: false });
  const n = lightsOn(t);
  // walk slowly along the corridor
  const w = walker(t, 168.0, 219.0, 260, 1500, 30), nx = w.x + 170;
  const noraGone = t >= 194.6 && t < 204.6;
  you(ctx, t, { x: w.x, y: G + 4, feet: w.feet, bob: w.bob * 0.6, face: t > 183 && t < 190 ? 'wince' : t > 193.6 && t < 205.4 ? 'worried' : t > 209 ? 'shock' : 'flat', look: noraGone ? [Math.sin(t * 1.8) * 8, 0] : [6, 0], sweat: t > 197 && t < 205 ? t * 0.7 : 0 });
  if (!noraGone) { const fade = t >= 193.6 && t < 194.6 ? 1 - seg(t, 193.6, 194.6) : 1; ctx.save(); ctx.globalAlpha = fade; nora(ctx, t, { x: nx, y: G + 4, feet: w.feet, bob: w.bob * 0.6, face: t >= 204.6 ? 'smile' : 'flat', look: t >= 204.6 ? [-6, 0] : [6, 0], scarf: t >= 204.6 ? '#2E6FD8' : COL.red }); ctx.restore(); }
  // darkness: the whole set dims with each lamp lost; lit lamps throw cones
  ctx.save(); ctx.globalAlpha = 0.45 + (10 - n) * 0.045; ctx.fillStyle = '#05060A'; ctx.fillRect(-600, -600, 3200, 2400); ctx.restore();
  LAMPS.forEach((x, i) => {
    const lit = i >= 10 - n, offAt = OFF[9 - i], flick = offAt && t > offAt - 0.25 && t < offAt ? (Math.floor(t * 30) % 2) : 1;
    shape(ctx, rrect(x - 40, 40, 80, 24, 8), { fill: lit && flick ? '#FFF3C4' : '#3A3A3A', line: 4, ...S0 });
    if (lit && flick) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,236,170,0.13)'; ctx.beginPath(); ctx.moveTo(x - 36, 64); ctx.lineTo(x + 36, 64); ctx.lineTo(x + 160, G); ctx.lineTo(x - 160, G); ctx.closePath(); ctx.fill(); ctx.restore(); }
  });
  // the elevator at the far right (arrives at 219.6)
  const k = eio(seg(t, 219.8, 220.6));
  if (k > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,220,150,${0.35 * k})`; ctx.fillRect(1700, 300, 200 * k, G - 300); ctx.restore(); }
}
// Floor −4 · your apartment (warm evening); someone on the sofa
function floor4(ctx, t, sh) {
  plane(ctx, rect(-600, -600, 3200, G + 600), '#E9C9A0', { grain: 0.12 });
  plane(ctx, rect(-600, G, 3200, 800), '#9B6B48', { grain: 0.2 }); ink(ctx, [[-600, G], [2600, G]], 7, { color: INK, seed: 7600, taper: false });
  shape(ctx, rect(200, 160, 460, 360), { fill: '#24304A', line: 7, ...S0 }); ctx.save(); ctx.beginPath(); ctx.rect(204, 164, 452, 352); ctx.clip(); for (let i = 0; i < 9; i++) shape(ctx, rect(230 + i * 48, 330 + hash(i, 1) * 120, 40, 200), { fill: '#3A4766', line: 0, ...S0 }); for (let i = 0; i < 14; i++) shape(ctx, rect(240 + hash(i, 2) * 400, 360 + hash(i, 3) * 140, 8, 10), { fill: '#FFD27A', line: 0, ...S0 });
  ctx.restore(); ink(ctx, [[430, 160], [430, 520]], 6, { color: INK, seed: 7601, taper: false });
  shape(ctx, rrect(1500, G - 260, 220, 260, 10), { fill: '#3A3A3A', line: 6, ...S0 }); shape(ctx, rect(1520, G - 240, 180, 120), { fill: '#7FB7D6', line: 4, ...S0 });   // TV
  shape(ctx, rrect(160, G - 140, 120, 140, 14), { fill: '#C4553C', line: 5, ...S0 }); for (let k = 0; k < 5; k++) shape(ctx, ellipse(220 + (k - 2) * 24, G - 190 - Math.abs(k - 2) * -8, 20, 50, 14, 0, TAU, (k - 2) * 0.35), { fill: '#5BB98C', line: 4, ...S0 });   // plant
  // coffee table + the warm mug (steam)
  shape(ctx, rrect(780, G - 110, 300, 24, 8), { fill: '#7B4B2E', line: 5, ...S0 }); [[800], [1050]].forEach(([lx]) => shape(ctx, rect(lx, G - 86, 14, 86), { fill: '#5E3A24', line: 3, ...S0 }));
  shape(ctx, rrect(900, G - 160, 50, 50, 8), { fill: COL.cream, line: 4, ...S0 }); for (let i = 0; i < 3; i++) { const pts = []; for (let k = 0; k < 8; k++) pts.push([915 + i * 10 + Math.sin(t * 2 + k * 0.8 + i) * 8, G - 170 - k * 14]); ink(ctx, pts, 3, { color: 'rgba(255,255,255,0.7)', seed: 7610 + i, taper: true }); }
  // the sofa, back to us; the other You sits on it, then stands and turns
  const stand = t >= 255.0;
  if (!stand) { const hx = 1120, hy = G - 330; shape(ctx, ellipse(hx, hy, 60, 59, 30), { fill: PAL.white, line: 7, ...S0 }); ink(ctx, spline([[hx - 8, hy - 58], [hx - 2, hy - 84], [hx + 12, hy - 78], [hx + 6, hy - 58]], false, 6), 6, { color: INK, seed: 7620, taper: true }); }
  shape(ctx, rrect(860, G - 300, 520, 200, 40), { fill: '#3F6E8C', line: 6, ...S0 }); shape(ctx, rrect(840, G - 130, 560, 130, 30), { fill: '#335C76', line: 6, ...S0 });
  const otherX = stand ? lerp(1120, 1260, ss(seg(t, 255.0, 256.0))) : 1120;
  // You (came in from the elevator at the left)
  const w = walker(t, 241.0, 244.0, 300, 560);
  you(ctx, t, { x: w.x, y: G + 4, feet: w.feet, bob: w.bob, face: t > 249.6 ? 'shock' : 'flat', look: t > 249.6 ? [8, 0] : [4, 0] });
  nora(ctx, t, { x: w.x - 180, y: G + 4, feet: w.feet, bob: w.bob, face: 'smile', scarf: '#2E6FD8', look: [6, 0] });
  if (stand) { const r = stick(ctx, { ...ME, x: Math.max(1400, otherX + 140), y: G + 4, s: 0.95, face: t < 256.4 ? 'flat' : 'grin', look: [-8, 0], talk: speaking(t, 'you2') ? t : 0, blink: autoBlink(t, 9), armR: [-0.4, -1.2], armL: [Math.PI / 2 + 0.3, Math.PI / 2 + 0.1] }); }
}

// ---------------------------------------------------------------- HUD (the elevator's LCD, top right) + title / end cards
function hud(ctx, t) {
  if (t < 23.0 || t >= 268) return;
  const x = W - 330, y = 40, k = eio(seg(t, 23.0, 23.5));
  ctx.save(); ctx.translate((1 - k) * 360, 0);
  shape(ctx, rrect(x, y, 290, 150, 14), { fill: '#1A1A1E', line: 6, ...S0 });
  const row = (lab, val, yy, chg) => { const f = chg ? 1 + 0.3 * Math.max(0, 1 - (t - chg) * 3) * (t >= chg ? 1 : 0) : 1;
    text(ctx, lab, x + 24, yy, { font: '700 26px Jost', fill: '#8A8F98' }); ctx.save(); ctx.shadowColor = '#FF6B4A'; ctx.shadowBlur = 10; ctx.translate(x + 266, yy - 10); ctx.scale(f, f); text(ctx, val, 0, 10, { font: '34px Slab', fill: '#FF6B4A', align: 'right' }); ctx.restore(); };
  const chgDay = [92, 146, 236].filter(c => t >= c).pop(), chgFl = [93, 154, 236].filter(c => t >= c).pop(), chgFo = [65.6, 146.6, 226.8].filter(c => t >= c).pop();
  row('DAY', String(DAY(t)), y + 46, chgDay); row('FLOOR', String(FLOOR(t)), y + 90, chgFl); row('FOOD', '🥪'.repeat(0) + FOOD(t) + ' / 3', y + 134, chgFo);
  ctx.restore();
}
function titleCard(ctx, t) {
  if (t < 19.0 || t >= 23.4) return;
  const k = pop(t, 19.1, 0.35) * (1 - ss(seg(t, 22.9, 23.4)));
  ctx.save(); ctx.translate(W / 2, 470); ctx.scale(k, k);
  shape(ctx, rrect(-460, -150, 920, 300, 26), { fill: '#1A1A1E', line: 8, ...S0 });
  ctx.save(); ctx.shadowColor = '#FF6B4A'; ctx.shadowBlur = 24; text(ctx, 'FLOOR MINUS', 0, 20, { font: '120px Slab', fill: '#FF6B4A', align: 'center' }); ctx.restore();
  text(ctx, 'EPISODE 1 · DAY 1 TO DAY 3', 0, 100, { font: '800 40px Jost', fill: COL.cream, align: 'center', track: 4 }); ctx.restore();
}
function floorCard(ctx, t) {                                         // "FLOOR −N · THE RULE" banner as each floor opens
  [[24.0, '-1', 'THE POLITE FLOOR'], [97.2, '-2', 'THE RAIN FALLS UP'], [158.0, '-3', 'THE QUIET FLOOR'], [240.6, '-4', '???']].forEach(([t0, n, s]) => {
    if (t < t0 || t >= t0 + 3.6) return; const k = eio(seg(t, t0, t0 + 0.35)) * (1 - eio(seg(t, t0 + 3.2, t0 + 3.6)));
    ctx.save(); ctx.translate(60 - (1 - k) * 700, 50); shape(ctx, rrect(0, 0, 600, 110, 16), { fill: COL.yellow, line: 6, ...S0 });
    text(ctx, `FLOOR ${n}`, 30, 74, { font: '64px Slab', fill: INK }); text(ctx, s, 290, 72, { font: '800 30px Jost', fill: INK, maxW: 290 }); ctx.restore(); });
}
function goneTimer(ctx, t) {
  if (t < 194.6 || t >= 204.6) return; const n = 10 - Math.floor(t - 194.6);
  ctx.save(); ctx.translate(W / 2, PORT ? 420 : 250); const k = back(seg((t - 194.6) % 1, 0, 0.15), 2); ctx.scale(k, k);
  text(ctx, 'NORA', 0, -60, { font: '800 34px Jost', fill: '#FFB3AE', align: 'center', track: 6 });
  text(ctx, String(n), 0, 50, { font: '130px Slab', fill: COL.cream, plate: COL.red, off: [5, 5], align: 'center' }); ctx.restore();
}
function endCard(ctx, t) {
  if (t < 268.0) return; const k = eio(seg(t, 268.0, 268.6));
  ctx.save(); ctx.globalAlpha = 0.7 * k; ctx.fillStyle = '#0E1014'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const a = pop(t, 268.3, 0.4); ctx.save(); ctx.translate(W / 2, 400); ctx.scale(a, a);
  shape(ctx, rrect(-420, -130, 840, 260, 26), { fill: '#1A1A1E', line: 8, ...S0 });
  ctx.save(); ctx.shadowColor = '#FF6B4A'; ctx.shadowBlur = 24; text(ctx, 'DAY 4', 0, 10, { font: '130px Slab', fill: '#FF6B4A', align: 'center' }); ctx.restore();
  text(ctx, 'NEXT SATURDAY', 0, 90, { font: '800 44px Jost', fill: COL.cream, align: 'center', track: 6 }); ctx.restore();
  const b = pop(t, 269.4, 0.35); ctx.save(); ctx.translate(W / 2, 800); ctx.scale(b, b);
  text(ctx, 'WHICH FLOOR WOULD YOU SURVIVE?', 0, 0, { font: '900 64px Jost', fill: COL.yellow, align: 'center', maxW: W - 120 });
  text(ctx, 'COMMENT −1, −2 OR −3', 0, 80, { font: '800 44px Jost', fill: COL.cream, align: 'center' }); ctx.restore();
}
// karaoke chunks (stickman caption style v2): big bold words, 1–3 at a time, ink outline, the spoken word turns yellow and bounces
function chunksOf(c) {
  const words = c.text.split(/\s+/), WT = WORDS[c.id], out = []; let cur = [];
  words.forEach((w, i) => { const t0 = WT && WT[i] ? c.t0 + WT[i].t0 - 0.04 : c.t0 + i / words.length * c.dur, t1 = WT && WT[i] ? c.t0 + WT[i].t1 : c.t0 + (i + 1) / words.length * c.dur;
    cur.push({ w, t0, t1 }); if (cur.length === 3 || /[,.!?:]$/.test(w) || i === words.length - 1) { out.push(cur); cur = []; } });
  out.forEach((ch, i) => { ch.s = ch[0].t0; ch.e = out[i + 1] ? out[i + 1][0].t0 : Math.min(c.t1, ch[ch.length - 1].t1 + 0.5); });
  return out;
}
function caption(ctx, t) {
  if (t >= 268) return;
  const c = cues().find(q => t >= q.t0 - 0.05 && t < q.t1); if (!c) return;
  const ch = chunksOf(c).find(k => t >= k.s && t < k.e); if (!ch) return;
  const keys = KEY[c.id] || [], px = PORT ? 92 : 76, font = `800 ${px}px Jost`, maxW = PORT ? 900 : 1500;
  const fillOf = { op: '#FF8A5C', nora: '#FFB3AE', you2: '#B7E4FF', n: PAL.white }[c.who];
  ctx.font = font; const sp = ctx.measureText(' ').width * 1.4 + 12, ws = ch.map(o => ctx.measureText(o.w.toUpperCase()).width);
  const lines = [[0]]; let lw = ws[0];
  for (let i = 1; i < ch.length; i++) { if (lw + sp + ws[i] > maxW) { lines.push([i]); lw = ws[i]; } else { lines[lines.length - 1].push(i); lw += sp + ws[i]; } }
  const y0 = (PORT ? 1440 : 950) - (lines.length - 1) * px * 0.55;
  if (c.who !== 'n') text(ctx, { op: 'OPERATOR', nora: 'NORA', you2: 'YOU?' }[c.who], W / 2, y0 - px * 1.05, { font: '800 34px Jost', fill: fillOf, align: 'center', track: 6 });
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, i) => s + ws[i], 0) + sp * (ln.length - 1); let x = W / 2 - tw / 2;
    ln.forEach(i => {
      const o = ch[i], on = t >= o.t0, now = t >= o.t0 && t < o.t1 + 0.05, k = on ? back(seg(t, o.t0, o.t0 + 0.12), 2.4) : 0;
      if (k > 0) { const cx = x + ws[i] / 2, cy = y0 + li * px * 1.1, sc = k * (now ? 1.1 : 1);
        ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.rotate(now ? -0.03 : 0); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.strokeText(o.w.toUpperCase(), 0, 0);
        ctx.fillStyle = now ? COL.yellow : keys.includes(o.w) ? '#FFB3AE' : fillOf; ctx.fillText(o.w.toUpperCase(), 0, 0); ctx.restore(); }
      x += ws[i] + sp;
    });
  });
}

// ---------------------------------------------------------------- render
export const CHAPTERS = [[0, 'The elevator'], [24, 'Floor −1: The Polite Floor'], [97, 'Floor −2: The rain falls up'], [158, 'Floor −3: The Quiet Floor'], [240, 'Floor −4']];
function liftState(t) {                                              // which floor is behind the doors, and how open they are
  const ev = [[23.0, 23.8, 'f1'], [81.6, 83.2, 'f1', true], [95.6, 97.0, 'f2'], [141.4, 143.6, 'f2', true], [156.4, 157.6, 'f3'], [219.8, 221.2, 'f3', true], [238.8, 240.2, 'f4']];
  for (const [a, b, f, closing] of ev) if (t >= a - 0.1 && t < b + 3) return { f, k: closing ? 1 - eio(seg(t, b + 1.6, b + 2.6)) : eio(seg(t, a, a + 0.7)) };
  return { f: null, k: 0 };
}
const SETS = { f1: floor1, f2: floor2, f3: floor3, f4: floor4 };
function drawSet(ctx, t, shot) {
  const cam = camOf(shot, t), name = shot[1];
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy);
  if (name === 'hall') hall(ctx, t);
  else if (name === 'lift') {
    const L = liftState(t);
    liftInterior(ctx, t, { open: L.k, behind: L.f ? (c, tt) => SETS[L.f](c, tt) : null });
    // passengers inside (the lift between floors)
    const inside = t >= 11.0 && t < 23.8 ? ['you'] : t >= 83.2 && t < 97 ? ['you', 'nora'] : t >= 143.6 && t < 157.6 ? ['you', 'nora'] : t >= 221.2 && t < 240.2 ? ['you', 'nora'] : [];
    const shake = Math.sin(t * 40) * (L.k === 0 ? 1.5 : 0);
    if (inside.includes('nora')) nora(ctx, t, { x: 1080, y: G + 4 + shake, face: t > 145 && t < 157 ? 'worried' : t > 221 ? 'smile' : 'flat', scarf: t >= 204.6 ? '#2E6FD8' : COL.red, look: speaking(t, 'op') ? [8, -6] : [-6, 0] });
    if (inside.includes('you')) you(ctx, t, { x: 840, y: G + 4 + shake, face: speaking(t, 'op') ? 'worried' : t > 221 ? 'worried' : 'flat', look: speaking(t, 'op') ? [10, -6] : t >= 16.4 && t < 19 ? [-10, 0] : [4, 0],
      sq: t >= 143.6 && t < 144.6 ? 0.3 * (1 - seg(t, 143.6, 144.6)) : 0 });
  } else if (name === 'note') note(ctx, t);
  else SETS[name](ctx, t, shot);
  ctx.restore();
  return cam;
}
export function renderFilm(ctx, t, Q, nocap = false) {
  setClock(t);
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
  const shot = shotAt(t); drawSet(ctx, t, shot);
  // a quick black dip on each new floor (doors fully open → cut)
  if (!PORT && shot[3] && t < shot[0] + 0.25) { ctx.save(); ctx.globalAlpha = 1 - seg(t, shot[0], shot[0] + 0.25); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  hud(ctx, t); titleCard(ctx, t); floorCard(ctx, t); goneTimer(ctx, t); endCard(ctx, t);
  paperFinish(ctx, W, H, 0.5);
  if (!(Q && Q.has('nosubs')) && !nocap) caption(ctx, t);
}
export function renderShort(ctx, ts, n) {
  const S = SHORTS[n - 1], L = S.b - S.a, t = Math.min(S.a + ts, S.b - 0.01);
  renderFilm(ctx, t, null, ts >= L);
  if (ts < 2.6) { const k = pop(ts, 0.1, 0.35) * (1 - ss(seg(ts, 2.2, 2.6)));
    ctx.save(); ctx.translate(540, 420); ctx.scale(k, k); shape(ctx, rrect(-470, -90, 940, 180, 24), { fill: COL.yellow, line: 7, ...S0 });
    text(ctx, 'WHAT IF EVERY FLOOR', 0, -18, { font: '900 52px Jost', fill: INK, align: 'center' }); text(ctx, 'HAD ONE RULE?', 0, 50, { font: '900 52px Jost', fill: INK, align: 'center' }); ctx.restore(); }
  if (ts >= L) { const e = ts - L, k = eio(seg(e, 0, 0.4));
    ctx.save(); ctx.globalAlpha = 0.75 * k; ctx.fillStyle = '#0E1014'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const a = pop(e, 0.15, 0.4); ctx.save(); ctx.translate(540, 820); ctx.scale(a, a);
    shape(ctx, rrect(-440, -150, 880, 300, 26), { fill: '#1A1A1E', line: 8, ...S0 });
    ctx.save(); ctx.shadowColor = '#FF6B4A'; ctx.shadowBlur = 24; text(ctx, 'FLOOR MINUS', 0, 10, { font: '104px Slab', fill: '#FF6B4A', align: 'center' }); ctx.restore();
    text(ctx, 'FULL STORY · EPISODE 1', 0, 90, { font: '800 40px Jost', fill: COL.cream, align: 'center', track: 4 }); ctx.restore();
    const b = pop(e, 0.8, 0.35); ctx.save(); ctx.translate(540, 1300); ctx.scale(b, b); text(ctx, 'WHAT WOULD YOU DO?', 0, 0, { font: '900 70px Jost', fill: COL.yellow, align: 'center' }); ctx.restore(); }
}

// ---------------------------------------------------------------- sound events
let EVS = [];
const ev = (t, type, o = {}) => EVS.push({ t: +(+t).toFixed(4), type, ...o });
export function events() { return EVS; }
function buildEvents() {
  EVS = [];
  V.forEach(v => ev(v.t, 'vo', { id: v.id, fx: v.who === 'op' ? 'radio' : undefined }));
  ev(0, 'hum', { dur: 23.8 }); ev(7.4, 'ding'); ev(7.45, 'doors', { dur: 0.8 }); for (let i = 0; i < 6; i++) ev(8.05 + i * 0.3, 'step', { n: i }); ev(10.0, 'doors', { dur: 0.8 }); ev(10.8, 'thunk');
  ev(11.0, 'lift_ride', { dur: 12.0 }); ev(16.4, 'cut'); ev(19.1, 'title'); ev(23.0, 'ding'); ev(23.05, 'doors', { dur: 0.7 });
  ev(23.8, 'lobby', { dur: 59.4 }); for (let i = 0; i < 5; i++) ev(32.4 + i * 0.32, 'step', { n: i });
  ev(34.0, 'tilt', {}); ev(34.2, 'slide', { dur: 1.6 }); ev(36.0, 'grab'); ev(41.0, 'tilt', { back: 1 }); ev(41.7, 'thunk');
  [45.4, 48.0, 50.2].forEach(x => ev(x, 'pop')); ev(48.0, 'chair'); ev(52.0, 'pop', { gain: 0.6 });
  ev(64.2, 'munch'); ev(64.8, 'munch'); ev(65.4, 'munch'); ev(65.6, 'counter');
  for (let i = 0; i < 9; i++) ev(69.0 + i * 0.3, 'step', { n: i, gain: 1.3 }); ev(71.9, 'tilt', { big: 1 }); ev(72.0, 'slide', { dur: 2.6 }); ev(72.6, 'yell'); ev(76.6, 'tilt', { back: 1 }); ev(77.4, 'thunk');
  ev(80.4, 'clock_chime'); ev(81.6, 'ding'); ev(81.65, 'doors', { dur: 0.7 }); ev(84.8, 'doors', { dur: 0.8 }); ev(85.6, 'thunk');
  ev(83.2, 'lift_ride', { dur: 13.8 }); ev(92, 'counter'); ev(93, 'counter'); ev(95.6, 'ding'); ev(95.65, 'doors', { dur: 0.7 });
  ev(97.0, 'rain_up', { dur: 46.6 }); ev(112.0, 'crawl', { dur: 8.4 }); ev(121.2, 'paper'); ev(VT('n23') - 0.1, 'scribble', { dur: 1.7 });
  ev(141.4, 'ding'); ev(141.45, 'doors', { dur: 0.7 }); ev(143.6, 'splash'); ev(145.2, 'doors', { dur: 0.8 }); ev(146.0, 'thunk'); ev(146.6, 'counter'); ev(146.6, 'drip_lift', { dur: 9 });
  ev(143.6, 'lift_ride', { dur: 14.0 }); ev(154, 'counter'); ev(156.4, 'ding'); ev(156.45, 'doors', { dur: 0.7 });
  ev(157.6, 'quiet', { dur: 63.6 }); OFF.forEach(x => ev(x, 'light_off'));
  ev(171.0, 'creak'); ev(179.2, 'growl'); ev(193.6, 'whoosh_soft'); for (let s = 0; s < 10; s++) ev(194.6 + s, 'heart', { n: s }); ev(204.6, 'whoosh_soft');
  ev(219.6, 'ding', { gain: 0.6 }); ev(221.2, 'lift_ride', { dur: 19.0 }); ev(222.6, 'doors', { dur: 0.8 }); ev(223.4, 'thunk'); ev(226.8, 'counter'); ev(236, 'counter'); ev(238.8, 'ding'); ev(238.85, 'doors', { dur: 0.7 });
  ev(240.2, 'apartment', { dur: 41.8 }); for (let i = 0; i < 5; i++) ev(241.2 + i * 0.6, 'step', { n: i }); ev(249.6, 'sting'); ev(255.0, 'sofa'); ev(257.2, 'hit'); ev(268.3, 'title');
  EVS.sort((a, b) => a.t - b.t);
}
