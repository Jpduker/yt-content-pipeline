// "The Shrinking Lie": stickman what-if Short, our own style (round-head hand-drawn stickmen + real rigged motion).
// 1080x1920, 24 fps, 38.0 s = 19 bars at 120 BPM. Every value is a function of t (deterministic).
import { PAL, setClock, shape, plane, ink, rays, ellipse, rect, rrect, spline, star, sparkle, text, fit, measure,
  paperFinish, clamp, lerp, seg, ss, eio, back, twos, TAU, hash } from './engine/toon.js';
import { stick, walkFeet, INK } from './rig.js';

export const W = 1080, H = 1920, BPM = 120, DURATION = 38.0;
const G = 1250;                                                   // ground line (feet)
const COL = { paper: '#FBF7EF', accent: '#F25C54', blue: '#3C6EB4', pink: '#E86A92', green: '#5BB98C', yellow: '#FFC93C', teal: '#2EC4B6' };
const LINES = [['hook', 0.25], ['boss', 4.0], ['hair', 8.0], ['lunch', 11.5], ['friday', 16.0], ['twist', 19.0], ['world', 22.0],
  ['song', 26.0], ['truth', 29.0], ['same', 31.0], ['cta', 34.0]];
const KEY = { hook: ['lie', 'shorter?'], boss: ['email.'], hair: ['haircut'], lunch: ['eleven', 'trousers'], friday: ['ladder'], twist: ['twist.', 'Everyone'],
  world: ['lower.', 'tiny.', 'weird.'], song: ['terrible.'], truth: ['truth.'], same: ["don't", 'shrink.'], cta: ['honest.', 'Friday?'] };
let V = [], DUR = {}, TXT = {}, WORDS = {};
export function setup(lines, durs, words = {}) {
  DUR = durs; WORDS = words; lines.forEach(l => TXT[l.id] = l.caption || l.text);
  V = LINES.map(([id, t], i) => ({ id, t, dur: DUR[id] ?? 2, text: TXT[id], next: LINES[i + 1] ? LINES[i + 1][1] : DURATION }));
  buildEvents();
}
function cues() { return V.map(v => ({ ...v, t0: v.t, t1: Math.min(v.next - 0.08, v.t + Math.max(1.8, v.dur + 0.6, v.text.length / 12 + 1)) })); }
export function srtCues() { return cues().map(c => ({ t0: c.t0, t1: c.t1, text: c.text })); }

const pop = (t, t0, d = 0.26) => back(seg(t, t0, t0 + d), 1.9);
const blinkAt = (t, list) => list.some(b => t > b && t < b + 0.12) ? 1 : 0;
const boing = (t, t0, amp = 0.5) => t < t0 ? 0 : Math.exp(-(t - t0) * 7) * Math.sin((t - t0) * 32) * amp;

// ---------------------------------------------------------------- the lie meter: your height over time
const SHRINKS = [[2.9, 0.94], [7.0, 0.95], [10.75, 0.9], ...Array.from({ length: 9 }, (_, i) => [12.0 + i * 0.2, 0.9 - (i + 1) * 0.0133]), [21.0, 0.45]];
function youH(t) {
  if (t < 4.0 || t >= 37.65) return t < 4.0 ? (t < 2.9 ? 1 : lerp(1, 0.94, eio(seg(t, 2.9, 3.02)))) : 1;
  if (t < 8.0) return t < 7.0 ? 1 : lerp(1, 0.95, eio(seg(t, 7.0, 7.12)));
  if (t >= 16.0 && t < 21.0) return 0.55;
  let h = 0.95; for (const [t0, v] of SHRINKS) if (t0 >= 7.5 && t >= t0) h = lerp(h, v, eio(seg(t, t0, t0 + 0.12)));
  return h;
}
const youSq = t => SHRINKS.reduce((s, [t0], i) => s + boing(t, t0, i >= 3 && i < 12 ? 0.25 : 0.5), 0);
const ME = { hair: 'tuft', pants: COL.blue };

// ---------------------------------------------------------------- sets
function room(ctx, wall, floor) {
  plane(ctx, rect(-200, -200, W + 400, G + 200), wall, { grain: 0.08 });
  plane(ctx, rect(-200, G, W + 400, H), floor, { grain: 0.1 });
  ink(ctx, [[-50, G], [W + 50, G]], 7, { color: INK, seed: 6000, taper: false, wob: 0.2 });
}
const S = { grain: 0, breaks: 0, off: [0, 0], lineColor: INK };
function doorFrame(ctx, t, marks) {
  shape(ctx, rect(610, 640, 330, G - 640), { fill: '#E9C3A6', line: 0, ...S });
  shape(ctx, rect(590, 620, 30, G - 620), { fill: PAL.white, line: 6, ...S, seed: 6010 });
  shape(ctx, rect(930, 620, 30, G - 620), { fill: PAL.white, line: 6, ...S, seed: 6011 });
  shape(ctx, rect(590, 600, 370, 34), { fill: PAL.white, line: 6, ...S, seed: 6012 });
  marks.forEach(([y, lab], i) => { ink(ctx, [[586, y], [640, y]], 5, { color: '#5A5A5A', seed: 6020 + i, taper: false }); text(ctx, lab, 576, y + 9, { font: '600 26px Jost', fill: '#5A5A5A', align: 'right' }); });
  // a framed picture and a plant (set dressing)
  shape(ctx, rect(140, 560, 200, 150), { fill: '#BFE3E0', line: 6, ...S, seed: 6030 }); shape(ctx, spline([[160, 690], [210, 620], [250, 660], [290, 600], [320, 690]], false, 4).concat([[320, 690]]), { fill: COL.green, line: 4, ...S, seed: 6031 });
  shape(ctx, rrect(150, 1130, 110, 120, 14), { fill: COL.accent, line: 6, ...S, seed: 6032 });
  for (let k = 0; k < 5; k++) shape(ctx, ellipse(205 + (k - 2) * 26, 1100 - Math.abs(k - 2) * -10 - 30, 22, 50, 14, 0, TAU, (k - 2) * 0.35), { fill: COL.green, line: 4, ...S, seed: 6033 + k });
}
const headTop = h => G - (360 * h + 122);
const CAMS = { hook: { cx: 650, cy: 1000, z: 1.5 }, office: { cx: 575, cy: 1000, z: 1.4 }, hair: { cx: 560, cy: 1000, z: 1.4 }, street: { cx: 530, cy: 1060, z: 1.65 },
  kitchen: { cx: 650, cy: 940, z: 1.35 }, crowd: { cx: 540, cy: 1040, z: 1.2 }, doors: { cx: 610, cy: 1000, z: 1.35 }, cars: { cx: 560, cy: 1040, z: 1.4 },
  hoop: { cx: 680, cy: 1000, z: 1.35 }, song: { cx: 560, cy: 1000, z: 1.4 } };
let T0 = 0;                                                       // start time of the scene being drawn (for the slow push-in)
function cam(ctx, c, t) { const z = c.z * (1 + 0.035 * ss(clamp((t - T0) / 4))); ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-c.cx, -c.cy); }
function hookSet(ctx, t, h, tl) {
  cam(ctx, CAMS.hook, t); room(ctx, '#F6DCC8', '#C99B73'); doorFrame(ctx, t, [[headTop(1), 'MON'], ...(h < 0.99 ? [[headTop(0.94), '']] : [])]);
  const sq = youSq(t), lookUp = tl > 1.3 && tl < 2.85;
  stick(ctx, { ...ME, x: 775, y: G, h, sq, face: tl > 2.95 && tl < 3.8 ? 'shock' : 'smile', look: lookUp ? [-4, -6] : [0, 0], blink: blinkAt(t, [1.0, 37.9]),
    armL: [Math.PI / 2 + 0.2, Math.PI / 2 + 0.05], armR: [Math.PI / 2 - 0.2, Math.PI / 2 - 0.05] });
  ctx.restore();
}
function cmTag(ctx, t, t0, x, y, str = '-1 cm', t1 = 99) {
  const k = Math.min(pop(t, t0, 0.24), 1 - ss(seg(t, t1 - 0.2, t1))); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y - (t - t0) * 20); ctx.scale(k, k); ctx.rotate(-0.08);
  shape(ctx, rrect(-90, -38, 180, 76, 38), { fill: COL.accent, line: 5, ...S, seed: 6050, off: [5, 5] });
  text(ctx, str, 0, 14, { font: '44px Slab', fill: PAL.white, align: 'center' });
  ink(ctx, [[0, 50], [0, 100]], 7, { color: COL.accent, seed: 6051, taper: false }); ink(ctx, [[-16, 84], [0, 102], [16, 84]], 7, { color: COL.accent, seed: 6052, taper: false });
  ctx.restore();
}
function bubble(ctx, t, t0, t1, x, y, w, hgt, tail, draw) {
  const k = Math.min(pop(t, t0, 0.26), 1 - ss(seg(t, t1 - 0.18, t1))); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  shape(ctx, [[tail[0] * 0.25 - 26, hgt / 2 - 10], tail, [tail[0] * 0.25 + 26, hgt / 2 - 10]], { fill: PAL.white, line: 6, ...S, seed: 6060 });
  shape(ctx, rrect(-w / 2, -hgt / 2, w, hgt, hgt / 2.2), { fill: PAL.white, line: 6, ...S, seed: 6061, off: [7, 7] });
  draw(ctx);
  ctx.restore();
}
function office(ctx, t) {
  cam(ctx, CAMS.office, t); room(ctx, '#DCE9F2', '#9DB4C0');
  shape(ctx, rect(120, 420, 300, 330), { fill: '#BFE6F7', line: 6, ...S, seed: 6100 });
  for (let k = 1; k < 7; k++) ink(ctx, [[120, 420 + k * 47], [420, 420 + k * 47]], 4, { color: '#8FB3C9', seed: 6101 + k, taper: false });
  const talk = t >= 4.05 && t < 6.3 ? t : 0;
  stick(ctx, { x: 820, y: G, h: 1, hair: 'bald', glasses: true, tie: COL.accent, face: 'flat', look: t < 6.4 ? [-5, 0] : [-2, 4], talk, blink: blinkAt(t, [5.2]),
    armL: [Math.PI / 2 + 0.6, Math.PI / 2 + 1.2], armR: { hand: [880, 1010] } });
  // desk + laptop in front of the boss
  shape(ctx, rect(600, 1020, 420, G - 1020), { fill: '#8C6A4F', line: 6, ...S, seed: 6110 });
  shape(ctx, rect(590, 1000, 440, 34), { fill: '#A98366', line: 6, ...S, seed: 6111 });
  shape(ctx, [[700, 1000], [860, 1000], [880, 900], [720, 900]], { fill: '#D9D9D9', line: 5, ...S, seed: 6112 });
  sparkle(ctx, 790, 950, 14, { fill: COL.teal });
  const h = youH(t), sq = youSq(t);
  stick(ctx, { ...ME, x: 330, y: G, h, sq, face: t > 6.4 ? (t > 7.05 && t < 7.7 ? 'shock' : 'fake') : 'smile', look: [5, 0], blink: blinkAt(t, [4.8]),
    sweat: t > 6.5 ? (t - 6.5) * 0.9 : 0, armL: [Math.PI / 2 + 0.25, Math.PI / 2], armR: t > 6.45 && t < 7.0 ? { hand: [410, headTop(h) + 60], thumb: true } : [Math.PI / 2 - 0.2, Math.PI / 2] });
  bubble(ctx, t, 4.55, 6.45, 700, 600, 240, 170, [80, 150], c => { shape(c, rect(-80, -50, 120, 86), { fill: PAL.white, line: 5, ...S, seed: 6120 }); ink(c, [[-80, -50], [-20, 0], [40, -50]], 5, { color: INK, seed: 6121, taper: false }); text(c, '?', 82, 28, { font: '84px Slab', fill: COL.accent, align: 'center' }); });
  bubble(ctx, t, 6.45, 7.9, 330, 610, 230, 140, [10, 140], c => text(c, 'YEP!', 0, 24, { font: '72px Slab', fill: INK, align: 'center' }));
  cmTag(ctx, t, 7.05, 470, 800, '-1 cm', 7.95);
  ctx.restore();
}
function hair(ctx, t) {
  cam(ctx, CAMS.hair, t); room(ctx, '#DDF0E4', '#A9C9B4');
  shape(ctx, rrect(110, 470, 230, 340, 115), { fill: '#CFEFF5', line: 6, ...S, seed: 6200 }); sparkle(ctx, 170, 560, 22, { fill: PAL.white });
  const talk = t >= 8.05 && t < 9.9 ? t : 0;
  stick(ctx, { x: 770, y: G, h: 1, hair: 'curls', hairCol: COL.pink, face: t > 10.3 ? 'grin' : 'smile', look: [-5, 0], talk, blink: blinkAt(t, [9.0]),
    armL: [Math.PI / 2 + 0.3, Math.PI / 2 + 0.1], armR: { hand: [880, headTop(1) + 40] } });
  for (let k = 0; k < 4; k++) { const a = twos(t) * 3 + k * TAU / 4; sparkle(ctx, 770 + Math.cos(a) * 140, headTop(1) - 10 + Math.sin(a) * 80, 16 + (k % 2) * 8, { fill: COL.yellow }); }
  const h = youH(t), sq = youSq(t);
  stick(ctx, { ...ME, x: 330, y: G, h, sq, face: t > 10.8 && t < 11.3 ? 'shock' : (t > 9.0 ? 'fake' : 'smile'), look: [5, -2], blink: blinkAt(t, [8.6]),
    sweat: t > 9.2 ? (t - 9.2) * 0.9 : 0, armL: [Math.PI / 2 + 0.25, Math.PI / 2], armR: t > 10.2 ? { hand: [420, headTop(h) + 40], thumb: true } : [Math.PI / 2 - 0.2, Math.PI / 2] });
  bubble(ctx, t, 10.2, 11.45, 410, 610, 290, 140, [-70, 150], c => { text(c, 'LOVE IT!', 0, 22, { font: '60px Slab', fill: INK, align: 'center' }); });
  cmTag(ctx, t, 10.8, 480, 860, '-1 cm', 11.45);
  ctx.restore();
}
function street(ctx, t) {
  const tl = t - 11.5, stop = 14.55, wt = Math.min(tl, stop - 11.5), scroll = wt * 300;
  cam(ctx, CAMS.street, t);
  plane(ctx, rect(-200, -200, W + 400, G + 200), '#FFF1C9', { grain: 0.08 });
  for (let i = -1; i < 9; i++) {                                   // a scrolling row of flat buildings
    const x = i * 300 - (scroll % 300) - 0, k = i + Math.floor(scroll / 300), hh = 380 + hash(k, 1) * 300, col = ['#F7B2A0', '#A7D8DE', '#F6D58E', '#C7B8E8', '#B7DDB0'][((k % 5) + 5) % 5];
    shape(ctx, rect(x + 10, G - 120 - hh, 270, hh), { fill: col, line: 6, ...S, seed: 6300 + ((k % 50) + 50) });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (G - 120 - hh + 40 + r * 110 < G - 200) shape(ctx, rect(x + 40 + c * 80, G - 120 - hh + 40 + r * 110, 50, 66), { fill: PAL.white, line: 4, ...S, seed: 6400 + r * 3 + c });
  }
  plane(ctx, rect(-200, G - 120, W + 400, 120), '#D9D2C5', { grain: 0.08 }); ink(ctx, [[-50, G - 120], [W + 50, G - 120]], 6, { color: INK, seed: 6350, taper: false });
  plane(ctx, rect(-200, G, W + 400, H), '#8E8E8E', { grain: 0.1 }); ink(ctx, [[-50, G], [W + 50, G]], 7, { color: INK, seed: 6351, taper: false });
  for (let i = -1; i < 6; i++) { const x = i * 260 - (scroll % 260); plane(ctx, rect(x, G + 120, 140, 18), PAL.white, { grain: 0 }); }
  const h = youH(t), sq = youSq(t), ph = wt * 1.9, walking = tl < stop - 11.5, ft = walkFeet(ph, 46 * h);
  const sag = clamp(seg(t, 14.6, 14.85)), sw = walking ? Math.sin(ph * TAU) : 0;
  stick(ctx, { ...ME, x: 520, y: G + 20, h, sq, face: t > 14.7 ? 'shock' : 'smile', look: t > 14.75 ? [0, 9] : [6, 0], blink: blinkAt(t, [12.4, 13.7]),
    bob: walking ? -Math.abs(Math.sin(ph * TAU)) * 8 : 0, feet: walking ? ft.map(([dx, dy]) => [dx, dy]) : [[-22, 0], [22, 0]], sag, boxers: true,
    armL: [Math.PI / 2 + 0.15 + sw * 0.5, Math.PI / 2 + sw * 0.6], armR: [Math.PI / 2 - 0.15 - sw * 0.5, Math.PI / 2 - sw * 0.6] });
  ctx.restore();
  // the lie counter
  const n = t < 12.0 ? 2 : Math.min(11, 2 + Math.floor((t - 12.0) / 0.2) + 1), kc = pop(t, 11.75, 0.3);
  if (kc > 0) { ctx.save(); ctx.translate(540, 330); ctx.scale(kc, kc);
    shape(ctx, rrect(-230, -80, 460, 160, 30), { fill: PAL.white, line: 6, ...S, seed: 6360, off: [7, 7] });
    const kk = t >= 12.0 && t < 13.85 ? 1 + boing(t, 12.0 + Math.floor((t - 12.0) / 0.2) * 0.2, 0.25) : 1;
    ctx.save(); ctx.scale(kk, kk); text(ctx, `-${n} cm`, 0, 34, { font: '104px Slab', fill: COL.accent, align: 'center' }); ctx.restore();
    text(ctx, 'LIES TODAY', 0, 116, { font: '700 34px Jost', fill: INK, align: 'center', track: 5 }); ctx.restore(); }
}
function kitchen(ctx, t) {
  cam(ctx, CAMS.kitchen, t); room(ctx, '#FBE8B5', '#D7A86E');
  shape(ctx, rect(560, 960, 560, G - 960), { fill: '#F7F3EA', line: 6, ...S, seed: 6500 }); shape(ctx, rect(545, 935, 600, 40), { fill: '#7FB7BE', line: 6, ...S, seed: 6501 });
  [700, 900].forEach((x, i) => shape(ctx, ellipse(x, 1080, 10, 10, 10), { fill: INK, line: 0, ...S, seed: 6502 + i }));
  // the coffee machine
  shape(ctx, rrect(700, 600, 260, 335, 20), { fill: '#3D3D3D', line: 6, ...S, seed: 6510 }); shape(ctx, rect(740, 760, 180, 150), { fill: '#5E5E5E', line: 5, ...S, seed: 6511 });
  shape(ctx, rect(805, 760, 50, 30), { fill: '#9E9E9E', line: 4, ...S, seed: 6512 }); shape(ctx, rrect(790, 850, 80, 70, 10), { fill: PAL.white, line: 5, ...S, seed: 6513 });
  const pressed = t > 18.45; shape(ctx, ellipse(760, 660, 20, 20, 14), { fill: pressed ? COL.green : COL.accent, line: 4, ...S, seed: 6514 });
  if (pressed) for (let k = 0; k < 3; k++) { const pts = []; for (let s = 0; s <= 10; s++) pts.push([815 + k * 15 + Math.sin(s * 0.8 + t * 6 + k) * 6, 840 - s * 9]); ink(ctx, pts, 4, { color: '#BFBFBF', seed: 6515 + k, taper: true }); }
  // ladder
  const lad = u => [lerp(500, 600, u), lerp(G, 650, u)];
  [0, 60].forEach((o, i) => ink(ctx, [[lad(0)[0] + o, G], [lad(1)[0] + o, 650]], 9, { color: '#B5651D', seed: 6520 + i, taper: false }));
  for (let r = 1; r < 10; r++) { const [x, y] = lad(r / 10); ink(ctx, [[x, y], [x + 60, y]], 7, { color: '#B5651D', seed: 6530 + r, taper: false }); }
  const c = eio(seg(t, 16.5, 18.3)), h = youH(t), step = Math.floor(c * 5.99), sub = (c * 6) % 1;
  const [fx, fy] = lad(Math.min(0.5, c * 0.5)), f2 = lad(Math.min(0.5, c * 0.5 + 0.1 * (1 - sub)));
  stick(ctx, { ...ME, x: fx - 20, y: fy, h, face: t > 18.45 ? 'grin' : 'flat', look: [6, -4], blink: blinkAt(t, [17.3]),
    feet: c > 0 && c < 1 ? [[0, 0], [f2[0] - fx + 10, f2[1] - fy - 10]] : [[-14, 0], [20, 0]],
    armL: { hand: [fx + 40, fy - 330] }, armR: t > 18.35 ? { hand: [760, 660] } : { hand: [fx + 70, fy - 300 + Math.sin(sub * Math.PI) * 30] } });
  ctx.restore();
  const kt = pop(t, 16.1, 0.28); if (kt > 0) { ctx.save(); ctx.translate(250, 330); ctx.scale(kt, kt); ctx.rotate(-0.06); shape(ctx, rrect(-160, -50, 320, 100, 50), { fill: COL.teal, line: 6, ...S, seed: 6540, off: [6, 6] }); text(ctx, 'FRIDAY', 0, 22, { font: '62px Slab', fill: PAL.white, align: 'center' }); ctx.restore(); }
}
const CROWD = [{ x: 200, hair: 'spike', pants: '#6D6D6D' }, { x: 370, hair: 'bald', glasses: true, tie: COL.accent }, { x: 540, ...ME, me: 1 }, { x: 710, hair: 'curls', hairCol: COL.pink }, { x: 880, hair: 'bob', hairCol: COL.green }];
function crowd(ctx, t) {
  cam(ctx, CAMS.crowd, t); room(ctx, '#E6E0F4', '#B9AED6');
  CROWD.forEach((p, i) => {
    const t0 = 21.0 + i * 0.05, h = t < t0 ? 0.55 : lerp(0.55, 0.45, eio(seg(t, t0, t0 + 0.12))), sq = boing(t, t0, 0.5);
    const look = t < 20.0 ? [hash(i, 9) * 8 - 4, 0] : [i < 2 ? 7 : i > 2 ? -7 : (Math.sin(t * 3) * 6), 0];
    stick(ctx, { ...p, x: p.x, y: G, h, sq, face: t > 21.05 ? 'shock' : t > 20.0 ? 'worried' : 'smile', look, blink: blinkAt(t, [19.6 + i * 0.3]),
      armL: t > 21.1 ? [Math.PI + 0.6, -Math.PI / 2 - 0.3] : undefined, armR: t > 21.1 ? [-0.6, -Math.PI / 2 + 0.3] : undefined });
    cmTag(ctx, t, 21.15 + i * 0.05, p.x, 760, '-1', 21.95);
  });
  ctx.restore();
}
function label(ctx, t, t0, str, col) {
  const k = pop(t, t0, 0.26); if (k <= 0) return;
  ctx.save(); ctx.translate(540, 320); ctx.scale(k, k); ctx.rotate(-0.05);
  ctx.font = '84px Slab'; const w = ctx.measureText(str).width + 110;
  shape(ctx, rrect(-w / 2, -66, w, 132, 66), { fill: col, line: 6, ...S, seed: 6600, off: [8, 8] });
  text(ctx, str, 0, 30, { font: '84px Slab', fill: PAL.white, align: 'center' }); ctx.restore();
}
function doors(ctx, t) {
  cam(ctx, CAMS.doors, t); room(ctx, '#F6DCC8', '#C99B73');
  const k = eio(seg(t, 22.35, 22.6)), top = lerp(620, 950, k);
  ink(ctx, rect(390, 620, 300, G - 620), 5, { closed: true, color: '#9C7A60', seed: 6700, taper: false, breaks: 0.5 });
  shape(ctx, rect(390, top, 300, G - top), { fill: '#8C5A3C', line: 6, ...S, seed: 6701 }); shape(ctx, ellipse(650, lerp(top, G, 0.55), 12, 12, 10), { fill: COL.yellow, line: 4, ...S, seed: 6702 });
  if (k > 0 && k < 1) for (let i = 0; i < 6; i++) sparkle(ctx, 390 + hash(i, 1) * 300, top - 10, 10, { fill: '#C9A27E' });
  stick(ctx, { x: 820, y: G, h: 0.45, hair: 'bob', hairCol: COL.green, face: 'smile', look: [-6, 0], armL: [Math.PI / 2 + 0.3, Math.PI / 2], armR: [-0.4, -0.9] });
  ctx.restore(); label(ctx, t, 22.05, 'DOORS', COL.accent);
}
function cars(ctx, t) {
  cam(ctx, CAMS.cars, t); plane(ctx, rect(-200, -200, W + 400, G + 200), '#CDEBF7', { grain: 0.08 }); plane(ctx, rect(-200, G - 40, W + 400, H), '#8E8E8E', { grain: 0.1 });
  ink(ctx, [[-50, G - 40], [W + 50, G - 40]], 7, { color: INK, seed: 6800, taper: false });
  const x = lerp(-300, 560, eio(seg(t, 23.2, 23.75))) + Math.sin(t * 40) * 1.5;
  stick(ctx, { x: x - 10, y: G - 50, h: 0.45, hair: 'spike', face: t > 23.8 ? 'grin' : 'smile', look: [6, 0], armL: { hand: [x + 50, G - 160] }, armR: t > 23.8 && t < 24.1 ? [-0.5, -1.1] : { hand: [x + 60, G - 150] } });
  shape(ctx, rrect(x - 130, G - 170, 260, 110, 40), { fill: COL.accent, line: 6, ...S, seed: 6801 }); shape(ctx, rect(x + 40, G - 160, 60, 40), { fill: '#BFE6F7', line: 4, ...S, seed: 6802 });
  [-80, 80].forEach((d, i) => { shape(ctx, ellipse(x + d, G - 58, 34, 34, 18), { fill: INK, line: 0, ...S, seed: 6803 + i }); shape(ctx, ellipse(x + d, G - 58, 14, 14, 12), { fill: '#BDBDBD', line: 0, ...S, seed: 6805 + i }); });
  if (t > 23.8 && t < 24.2) text(ctx, 'beep!', x + 170, G - 220, { font: '700 54px Oleo', fill: INK, align: 'center' });
  ctx.restore(); label(ctx, t, 23.2, 'CARS', COL.teal);
}
function hoop(ctx, t) {
  cam(ctx, CAMS.hoop, t); room(ctx, '#F2C7A0', '#D99A5B');
  for (let k = 0; k < 8; k++) ink(ctx, [[k * 160, G], [k * 160 - 120, H]], 4, { color: '#B97A40', seed: 6900 + k, taper: false });
  ink(ctx, [[870, G], [870, 940]], 12, { color: '#5E5E5E', seed: 6910, taper: false }); shape(ctx, rect(820, 860, 120, 110), { fill: PAL.white, line: 6, ...S, seed: 6911 });
  const rimY = 1000, rimX = 740;
  const jump = seg(t, 24.75, 25.35), jy = Math.sin(jump * Math.PI) * 190;
  const dunk = t > 25.1;
  stick(ctx, { ...ME, x: lerp(520, 640, jump), y: G - jy, h: 0.45, sq: jump > 0 && jump < 1 ? -0.15 : boing(t, 25.35, 0.4), face: dunk ? 'grin' : 'flat', look: [8, -6],
    feet: jump > 0 && jump < 1 ? [[-10, -10], [20, -20]] : [[-22, 0], [22, 0]], armL: [Math.PI / 2 + 0.2, Math.PI / 2], armR: jump > 0 ? { hand: [lerp(600, rimX, jump), G - jy - 300] } : [-0.4, -1.2] });
  ink(ctx, [[rimX - 70, rimY], [rimX + 70, rimY]], 9, { color: COL.accent, seed: 6912, taper: false });
  for (let k = 0; k < 5; k++) ink(ctx, [[rimX - 60 + k * 30, rimY], [rimX - 40 + k * 20, rimY + 70 + (dunk ? Math.sin(t * 30) * 6 : 0)]], 3.5, { color: PAL.white, seed: 6913 + k, taper: false });
  const bx = dunk ? rimX : lerp(640, rimX, jump), by = dunk ? lerp(rimY, G - 40, eio(seg(t, 25.1, 25.4))) + (t > 25.4 ? -Math.abs(Math.sin((t - 25.4) * 9)) * 60 * Math.exp(-(t - 25.4) * 3) : 0) : G - jy - 320;
  shape(ctx, ellipse(bx, by, 36, 36, 20), { fill: '#F08A24', line: 5, ...S, seed: 6920 }); ink(ctx, [[bx - 36, by], [bx + 36, by]], 3.5, { color: INK, seed: 6921, taper: false }); ink(ctx, [[bx, by - 36], [bx, by + 36]], 3.5, { color: INK, seed: 6922, taper: false });
  ctx.restore();
  const ks = pop(t, 25.12, 0.2); if (ks > 0 && t < 25.95) { ctx.save(); ctx.translate(760, 620); ctx.scale(ks, ks); ctx.rotate(0.1); star(ctx, 0, 0, 150, { n: 12, inner: 0.6, fill: COL.yellow, off: [0, 0] }); text(ctx, 'SLAM!', 0, 26, { font: '76px Slab', fill: INK, align: 'center' }); ctx.restore(); }
  label(ctx, t, 24.35, 'BASKETBALL', '#7A5CC6');
}
function song(ctx, t) {
  cam(ctx, CAMS.song, t); room(ctx, '#F9D7DA', '#C98B8F');
  shape(ctx, rect(120, 470, 200, 260), { fill: '#FFF', line: 6, ...S, seed: 7000 }); text(ctx, '♪', 220, 650, { font: '700 140px Jost', fill: COL.pink, align: 'center' });
  const strum = t >= 26.0 && t < 29.4, sw = strum ? Math.sin(t * TAU * 4) : 0, gx = 770, gy = G - 175;
  const friendFace = t > 31.6 ? (t > 33.4 ? 'flat' : 'sad') : t > 30.75 ? 'shock' : 'grin';
  const prop = (c, L) => { const [bx, by] = L([gx - 20, gy + 40]), [n1x, n1y] = L([gx + 20, gy + 10]), [n2x, n2y] = L([gx - 130, gy - 60]);
    ink(c, [[n1x, n1y], [n2x, n2y]], 12, { color: '#7B4B2E', seed: 7012, taper: false });
    shape(c, ellipse(bx, by, 52, 42, 24, 0, TAU, 0.5), { fill: '#C47A3A', line: 5, ...S, seed: 7010 }); shape(c, ellipse(bx, by, 13, 13, 12), { fill: INK, line: 0, ...S, seed: 7011 }); };
  stick(ctx, { x: 760, y: G, h: 0.45, hair: 'curls', hairCol: COL.pink, face: friendFace, look: t > 29.5 ? [-6, 0] : [0, -2], blink: blinkAt(t, [27.4, 32.2]), talk: t > 26.1 && t < 29.2 ? t * 0.7 : 0,
    prop: t < 31.6 ? prop : null, armL: t < 31.6 ? { hand: [gx - 110, gy - 50] } : [Math.PI / 2 + 0.1, Math.PI / 2], armR: t < 31.6 ? { hand: [gx + sw * 12, gy + 40 + sw * 18] } : [Math.PI / 2 - 0.1, Math.PI / 2] });
  if (strum) for (let k = 0; k < 6; k++) {                        // off-key notes drift up, wobbling; the sour ones crack
    const tk = (t - 26.0 - k * 0.55); if (tk < 0) continue; const u = (tk % 3.3) / 3.3, x = 700 + Math.sin(u * 9 + k) * 40 - u * 260 * (k % 2 ? 1 : 0.6), y = gy - 40 - u * 520;
    const sour = t > 27.8; text(ctx, k % 2 ? '♪' : '♫', x, y, { font: '700 70px Jost', fill: sour ? '#7FA34A' : INK, align: 'center', alpha: 1 - u, rot: Math.sin(t * 8 + k) * 0.3 });
    if (sour && k % 2) ink(ctx, [[x - 20, y - 50], [x - 4, y - 30], [x - 14, y - 18], [x + 6, y]], 4, { color: COL.accent, seed: 7020 + k, taper: false, alpha: 1 - u });
  }
  const h = 0.45;
  stick(ctx, { ...ME, x: 330, y: G, h, face: t > 32.75 ? 'grin' : t > 30.4 ? 'flat' : t > 27.0 ? 'wince' : 'smile', look: [6, 0], blink: blinkAt(t, [26.6, 33.0]),
    sweat: t > 27.2 && t < 30.4 ? (t - 27.2) * 0.8 : 0, talk: t > 30.5 && t < 31.6 ? t : 0,
    armL: t > 27.0 && t < 29.6 ? { hand: [270, headTop(h) + 60] } : [Math.PI / 2 + 0.2, Math.PI / 2], armR: t > 27.0 && t < 29.6 ? { hand: [390, headTop(h) + 60] } : (t > 32.7 ? [-0.5, -1.1] : [Math.PI / 2 - 0.2, Math.PI / 2]) });
  bubble(ctx, t, 30.45, 31.85, 430, 650, 380, 200, [-90, 220], c => { text(c, 'Honestly?', 0, -14, { font: '600 54px Jost', fill: INK, align: 'center' }); text(c, "It's bad.", 0, 58, { font: '64px Slab', fill: COL.accent, align: 'center' }); });
  // the height ruler: tension, then SAME
  const kr = pop(t, 31.15, 0.3); if (kr > 0) { ctx.save(); ctx.translate(480, G); ctx.scale(kr, kr);
    shape(ctx, rect(-34, -460, 68, 460), { fill: COL.yellow, line: 5, ...S, seed: 7030 }); for (let k = 0; k < 23; k++) ink(ctx, [[-34, -k * 20], [k % 5 ? -14 : 4, -k * 20]], 3, { color: INK, seed: 7031 + k, taper: false });
    const ht = G - headTop(h), wob = t < 32.6 ? Math.sin(t * 40) * 6 * seg(t, 31.4, 32.5) : 0; ink(ctx, [[-50, -ht + wob], [190, -ht + wob]], 5, { color: COL.accent, seed: 7060, taper: false }); ctx.restore(); }
  ctx.restore();
  if (t >= 32.75 && t < 33.95) { const k = pop(t, 32.75, 0.24); ctx.save(); ctx.translate(560, 420); ctx.scale(k, k); ctx.rotate(-0.08);
    shape(ctx, rrect(-320, -80, 640, 160, 30), { fill: COL.green, line: 6, ...S, seed: 7070, off: [8, 8] }); text(ctx, 'NO SHRINK!', 50, 30, { font: '76px Slab', fill: PAL.white, align: 'center' });
    ink(ctx, [[-290, 0], [-262, 34], [-216, -36]], 14, { color: PAL.white, seed: 7071, taper: false }); ctx.restore(); }
}
function ctaSet(ctx, t) {
  const h = 0.45;
  cam(ctx, CAMS.hook, t); room(ctx, '#F6DCC8', '#C99B73'); doorFrame(ctx, t, [[headTop(1), 'MON'], [headTop(0.94), ''], [headTop(0.78), 'WED'], [headTop(0.55), 'FRI'], [headTop(0.45), 'NOW']]);
  stick(ctx, { ...ME, x: 775, y: G, h, face: 'smile', look: [-5, -6], blink: blinkAt(t, [35.6]), armL: [Math.PI / 2 + 0.2, Math.PI / 2], armR: t > 34.5 ? [-0.7, -1.2] : [Math.PI / 2 - 0.2, Math.PI / 2] });
  ctx.restore();
  const kc = pop(t, 34.6, 0.3), out = ss(seg(t, 37.2, 37.45)); if (kc <= 0 || out >= 1) return;
  ctx.save(); ctx.translate(400, 330); ctx.scale(kc * (1 - out), kc * (1 - out)); ctx.rotate(-0.05);
  shape(ctx, spline([[-300, -90], [300, -90], [320, 60], [40, 70], [-30, 140], [-20, 70], [-320, 60]], true, 4), { fill: PAL.white, line: 6, ...S, seed: 7100, off: [8, 8] });
  text(ctx, 'Comment your', 0, -14, { font: '700 64px Oleo', fill: INK, align: 'center' }); text(ctx, 'height!', 0, 48, { font: '700 64px Oleo', fill: COL.accent, align: 'center' });
  ctx.restore();
}

// ---------------------------------------------------------------- scene list + wipes
const SC = [[0, (c, t) => hookSet(c, t, youH(t), t)], [4.0, office], [8.0, hair], [11.5, street], [16.0, kitchen], [19.0, crowd], [22.0, doors], [23.15, cars], [24.3, hoop], [26.0, song], [34.0, ctaSet], [37.65, (c, t) => hookSet(c, t, 1, t - 38)]];
const sceneAt = t => { let i = 0; SC.forEach(([t0], k) => { if (t >= t0) i = k; }); return i; };
function drawScene(ctx, i, t) {
  const [t0, f] = SC[i]; T0 = t0; f(ctx, t);
}
// Caption style v2 (stickman series): no card. Big bold words, 1–3 at a time, white with a thick ink outline;
// the word being spoken turns yellow and bounces. Chunks break at punctuation. Timed to the real word onsets.
function chunksOf(c) {
  const words = c.text.split(/\s+/), WT = WORDS[c.id], out = []; let cur = [];
  words.forEach((w, i) => {
    const t0 = WT && WT[i] ? c.t0 + WT[i].t0 - 0.04 : c.t0 + i / words.length * c.dur, t1 = WT && WT[i] ? c.t0 + WT[i].t1 : c.t0 + (i + 1) / words.length * c.dur;
    cur.push({ w, t0, t1 });
    if (cur.length === 3 || /[,.!?:]$/.test(w) || i === words.length - 1) { out.push(cur); cur = []; }
  });
  out.forEach((ch, i) => { ch.s = ch[0].t0; ch.e = out[i + 1] ? out[i + 1][0].t0 : Math.min(c.t1, ch[ch.length - 1].t1 + 0.5); });
  return out;
}
function caption(ctx, t) {
  const c = cues().find(q => t >= q.t0 - 0.05 && t < q.t1); if (!c) return;
  const ch = chunksOf(c).find(k => t >= k.s && t < k.e); if (!ch) return;
  const keys = KEY[c.id] || [], px = 92, font = `800 ${px}px Jost`;
  ctx.font = font; const sp = ctx.measureText(' ').width * 1.4 + 12, ws = ch.map(o => ctx.measureText(o.w.toUpperCase()).width);
  let lines = [[0]]; let lw = ws[0];                                  // wrap to max 880 px
  for (let i = 1; i < ch.length; i++) { if (lw + sp + ws[i] > 880) { lines.push([i]); lw = ws[i]; } else { lines[lines.length - 1].push(i); lw += sp + ws[i]; } }
  const y0 = 1440 - (lines.length - 1) * px * 0.55;
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, i) => s + ws[i], 0) + sp * (ln.length - 1); let x = W / 2 - tw / 2;
    ln.forEach(i => {
      const o = ch[i], on = t >= o.t0, now = t >= o.t0 && t < o.t1 + 0.05, k = on ? back(seg(t, o.t0, o.t0 + 0.12), 2.4) : 0;
      if (k > 0) {
        const cx = x + ws[i] / 2, cy = y0 + li * px * 1.1, sc = k * (now ? 1.1 : 1);
        ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.rotate(now ? -0.03 : 0);
        ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
        ctx.lineWidth = 18; ctx.strokeStyle = INK; ctx.strokeText(o.w.toUpperCase(), 0, 0);
        ctx.fillStyle = now ? COL.yellow : keys.includes(o.w) ? '#FFB3AE' : PAL.white; ctx.fillText(o.w.toUpperCase(), 0, 0);
        ctx.restore();
      }
      x += ws[i] + sp;
    });
  });
}
export function renderFilm(ctx, t, Q) {
  setClock(t);
  ctx.fillStyle = COL.paper; ctx.fillRect(0, 0, W, H);
  const i = sceneAt(t), t0 = SC[i][0], wk = t0 > 0 ? eio(seg(t, t0, t0 + 0.28)) : 1;
  if (wk < 1) {                                                   // the next scene slides in from the right, pushing the last one out
    ctx.save(); ctx.translate(-W * wk, 0); drawScene(ctx, i - 1, t0 - 0.001); ctx.restore();
    ctx.save(); ctx.translate(W * (1 - wk), 0); drawScene(ctx, i, t); ctx.restore();
    ink(ctx, [[W * (1 - wk), -10], [W * (1 - wk), H + 10]], 8, { color: INK, seed: 990, taper: false });
  } else drawScene(ctx, i, t);
  paperFinish(ctx, W, H, 0.5);
  if (!(Q && Q.has('nosubs'))) caption(ctx, t);
}

// ---------------------------------------------------------------- sound events
let EVS = [];
const ev = (t, type, o = {}) => EVS.push({ t: +t.toFixed(4), type, ...o });
export function events() { return EVS; }
function buildEvents() {
  EVS = [];
  V.forEach(v => ev(v.t, 'vo', { id: v.id }));
  SC.slice(1).forEach(([t0]) => ev(t0, 'swish', {}));
  ev(2.9, 'boing', { n: 0 }); ev(7.0, 'boing', { n: 1 }); ev(10.75, 'boing', { n: 2 });
  for (let i = 0; i < 9; i++) ev(12.0 + i * 0.2, 'boing_s', { n: i });
  [4.55, 6.45, 7.05, 10.2, 10.8, 11.75, 16.1, 21.15, 22.05, 23.2, 24.35, 30.45, 34.6].forEach(x => ev(x, 'pop', {}));
  ev(4.0, 'office', { dur: 4.0 }); ev(11.5, 'street', { dur: 4.5 });
  for (let i = 0; i < 9; i++) ev(11.6 + i * 0.263, 'step', { n: i });
  ev(14.6, 'slide_down', {}); ev(14.75, 'gasp', {});
  for (let r = 0; r < 6; r++) ev(16.5 + r * 0.3, 'clank', { n: r }); ev(18.45, 'click', {}); ev(18.6, 'pour', { dur: 0.9 });
  for (let i = 0; i < 5; i++) ev(21.0 + i * 0.05, 'boing', { n: 3 + i, gain: 0.5 });
  ev(22.35, 'saw', { dur: 0.3 }); ev(22.6, 'thud', {}); ev(23.2, 'motor', { dur: 0.6 }); ev(23.8, 'beep', {});
  ev(24.75, 'jump', {}); ev(25.1, 'swoosh_net', {}); ev(25.12, 'thud', {}); ev(25.45, 'bounce', {}); ev(25.75, 'bounce', { gain: 0.5 });
  for (let k = 0; k < 13; k++) ev(26.05 + k * 0.25, 'strum', { n: k, sour: k >= 7 ? 1 : 0 });
  ev(31.15, 'pop', {}); ev(31.4, 'roll', { dur: 1.3 }); ev(32.75, 'ding', {}); ev(32.75, 'cheer', {});
  ev(37.65, 'boing', { n: 9, gain: 0.0001 });
  EVS.sort((a, b) => a.t - b.t);
}
