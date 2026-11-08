// The Keeper's Island · Chapter 1 "Twelve Seconds of Dark" (long-form 16:9, 1920x1080, 30 fps, 312 s).
// Beat sheet: channels/island/chapters/SEASON-1-BIBLE.md. Every value is a function of t (deterministic).
// Camera rules (Jp): fixed framings joined by cuts; the camera only moves to FOLLOW action (stairs, tunnel); never zooms.
import { PAL, setClock, shape, plane, ink, rays, ellipse, rect, rrect, spline, star, sparkle, text, fit, measure,
  paperFinish, clamp, lerp, seg, ss, eio, back, twos, TAU, hash } from './engine/toon.js';
import { gus, pip, mabel, rollo, walk, hop, autoBlink, drawStranger, lantern } from './cast2.js';
import { stormNight, harbour, harbourCast, noon, LH, DOCK, rain, flash } from './sets_ext.js';
import { lampRoom, clock, basket, diverFlashback, finPrint, PRINTS, FL, WIN, HATCH, LAMP, CLOCK, stairCutaway, cellar, DOOR, STONES, stoneIcon, tunnel, web } from './sets_in.js';
import { drawPip, pawPrint } from './suspects.js';

export let W = 1920, H = 1080, DURATION = 312.0;
// ---- vertical Shorts (1080x1920) cut from the chapter: [chapter start, chapter end of setup, riddle t0]. Countdown runs 5 s, then the end card.
export const SHORTS = [{ n: 1, a: 62.0, b: 94.2, r: 94.2 }, { n: 2, a: 160.0, b: 184.4, r: 184.4 }, { n: 3, a: 222.0, b: 244.6, r: 244.6 }];
export const SHORT_CD = 5.0, SHORT_END = 3.8;
let PORT = false;
export function setShort(n) { const S = SHORTS[n - 1]; PORT = true; W = 1080; H = 1920; return (S.b - S.a) + SHORT_CD + SHORT_END; }
export function shortMap(n, ts) { const S = SHORTS[n - 1], L = S.b - S.a; if (ts < L) return S.a + ts; if (ts < L + SHORT_CD) return S.r + 5 + (ts - L); return S.r + 9.99; }

// ---------------------------------------------------------------- voice + captions
// Each line keeps its planned start (lines.json "start") unless the previous line runs long: then it waits 0.2 s after it.
const KEY = { a1: ['storm'], a2: ['dark.'], a3: ['Twelve', 'seconds.'], a4: ['itself.'], b1: ['broken'], b2: ['furious.'], b3: ['asleep.'], b4: ['three', 'days'],
  b5: ['alone.'], c1: ['clock.'], c2: ['twelve', 'slow.'], c3: ['pendulum.'], c4: ['Webbed,'], c5: ['tiny', 'longer'], c6: ['claws.', 'straight', 'sea'], c7: ['Pause'],
  c8: ['swim', 'fins.'], c9: ['sea,'], c10: ['seen.'], d1: ['watch.'], d2: ['nap.'], d3: ['All'], d4: ['three', 'twelve'], d5: ['again.'], d6: ['how.'],
  e1: ['cut'], e2: ['window,', 'stairs.'], e3: ['web', 'broken.'], e4: ['yellow.'], e5: ['Window,', 'stairs?'], e6: ['stairs!', 'nobody'], e7: ['painted', 'dried.'],
  e8: ['Yellow'], e9: ['cellar', 'door.'], f1: ['net,', 'moon,', 'sun,', 'wave.'], f2: ["shadow's", 'story,'], f3: ['Old', 'Tale,'], f4: ['order'],
  f5: ['net:', 'moon:'], f6: ['sun:', 'wave:'], g1: ['tunnel.'], g2: ['fins,', 'boots.'], g3: ['shadows.'], g4: ['Five'], h1: ['noon,'], h2: ['dark'], h3: ['watching.'] };
let V = [], TXT = {}, WORDS = {};
export function setup(lines, durs, words = {}) {
  WORDS = words; let end = 0;
  V = lines.filter(l => !l.short).map(l => { TXT[l.id] = l.caption || l.text; const d = durs[l.id] ?? estDur(l.text); const t = Math.max(l.start, end + 0.2); end = t + d;
    if (t > l.start + 0.6) console.warn(`line ${l.id} pushed ${(t - l.start).toFixed(2)} s late`); return { id: l.id, t, dur: d, text: TXT[l.id] }; });
  V.forEach((v, i) => v.next = V[i + 1] ? V[i + 1].t : DURATION);
  buildEvents();
}
const estDur = s => s.split(/\s+/).length / 2.75 + 0.3 * (s.slice(0, -1).match(/[.,:?!]/g) || []).length;
const VT = id => (V.find(v => v.id === id) || { t: 0 }).t;
function cues() { return V.map(v => ({ ...v, t0: v.t, t1: Math.min(v.next - 0.08, v.t + v.dur + 0.5) })); }
export function srtCues() { return cues().map(c => ({ t0: c.t0, t1: c.t1, text: c.text })); }

// ---------------------------------------------------------------- shots
const WIDE = { cx: 960, cy: 540, z: 1 };
const CAM = {
  lampTop: { cx: LH.x, cy: 230, z: 2.4 }, wreck: { cx: 1450, cy: 560, z: 1.8 }, two: { cx: 1000, cy: 640, z: 1.4 }, crew: { cx: 1200, cy: 640, z: 1.2 },
  clock: { cx: 300, cy: 560, z: 1.7 }, prints: { cx: 1060, cy: 920, z: 2.0 }, win: { cx: 1420, cy: 560, z: 1.55 }, pipWin: { cx: 1470, cy: 520, z: 1.6 },
  mabel: { cx: 470, cy: 760, z: 1.7 }, rollo: { cx: 1640, cy: 760, z: 1.7 }, cable: { cx: 1170, cy: 840, z: 2.3 }, hatch: { cx: 640, cy: 880, z: 1.8 },
  carving: { cx: 960, cy: 200, z: 1.8 }, lock: { cx: 960, cy: 470, z: 1.6 },
};
// [start, set, cam (object or function), opts]
const SHOTS = [
  [0, 'storm', WIDE], [5.6, 'storm', CAM.lampTop], [9.6, 'storm', WIDE], [22.0, 'storm', CAM.lampTop], [24.6, 'storm', WIDE],
  [32, 'harbour', CAM.wreck, { wipe: 1 }], [37.6, 'harbour', WIDE], [43.4, 'harbour', CAM.two], [48.4, 'harbour', WIDE], [54.6, 'harbour', CAM.crew],
  [62, 'room', WIDE, { wipe: 1 }], [65.6, 'room', CAM.clock], [71, 'room', WIDE], [76.6, 'room', CAM.prints], [89.6, 'room', CAM.win], [92, 'room', WIDE],
  [105, 'room', CAM.prints], [110, 'room', WIDE],
  [122, 'roomN', WIDE, { wipe: 1 }], [125.6, 'roomN', CAM.pipWin], [128.2, 'roomN', CAM.mabel], [131, 'roomN', CAM.rollo], [137, 'roomN', CAM.clock],
  [141, 'dark', WIDE], [153, 'roomN', WIDE], [154, 'roomN', CAM.cable],
  [160, 'roomN', CAM.cable, { wipe: 1 }], [165.6, 'roomN', WIDE], [170.6, 'roomN', CAM.win], [177.4, 'roomN', CAM.cable], [181.2, 'roomN', WIDE],
  [195.2, 'roomN', CAM.win], [200.4, 'roomN', CAM.hatch], [207.4, 'stairs', t => ({ cx: 960, cy: clamp(stairGus(t).y - 120, 540, 2160), z: 1 })],
  [222, 'cellar', WIDE, { wipe: 1 }], [229.2, 'cellar', CAM.carving], [235.2, 'cellar', WIDE], [242.4, 'cellar', CAM.lock], [267.6, 'cellar', WIDE],
  [270, 'tunnel', t => ({ cx: clamp(tunGus(t) + 260, 960, 3400 - 960), cy: 540, z: 1 }), { wipe: 1 }],
  [292, 'noon', WIDE, { wipe: 1 }], [297.8, 'noon', CAM.lampTop], [300.5, 'noon', WIDE],
];
const shotAt = t => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x[0]) s = x; return s; };
const camOf = (s, t) => { const c = typeof s[2] === 'function' ? s[2](t) : s[2]; if (!PORT) return c; return c === WIDE ? { cx: s[1] === 'cellar' ? 960 : 1000, cy: s[1] === 'cellar' ? 560 : 640, z: 1.12 } : { ...c, z: c.z * 0.9 }; };

// ---------------------------------------------------------------- character blocking per set
function stairPath() {   // Gus's feet along the three flights then to the cellar door (world px)
  return [[620, 300], [1290, 1250], [640, 2000], [1240, 2600], [1060, 2600]];
}
function stairGus(t) {
  const P = stairPath(), T = [208.2, 212.0, 215.8, 219.6, 221.2], k = (t - T[0]);
  if (t <= T[0]) return { x: P[0][0], y: P[0][1], dir: 1, walking: false, ph: 0 };
  for (let i = 0; i < T.length - 1; i++) if (t < T[i + 1]) { const u = (t - T[i]) / (T[i + 1] - T[i]); return { x: lerp(P[i][0], P[i + 1][0], u), y: lerp(P[i][1], P[i + 1][1], u), dir: Math.sign(P[i + 1][0] - P[i][0]), walking: true, ph: k * 1.1 }; }
  return { x: P[4][0], y: P[4][1], dir: -1, walking: false, ph: 0 };
}
function tunGus(t) { const w = walk(t, 270.8, 291.2, 260, 2350, 120); return w.x; }

function roomCast(ctx, t, night) {
  const sh = shotAt(t)[2];
  if (!night) {                                                       // day: riddle 1
    const gx = 1200, face = t < 76.6 ? 'puzzled' : t < 105 ? 'puzzled' : t < 110 ? 'wow' : 'neutral';
    const pointing = t >= 71.6 && t < 76.6;
    gus(ctx, t, { x: gx, y: FL + 6, s: 0.62, face, look: t < 71 ? [-14, 0] : [-8, 8], flip: true,
      armF: pointing ? { a1: 0.1, a2: -0.05 } : undefined, handF: pointing ? { kind: 'point', a: -0.05 } : undefined });
    pip(ctx, t, { x: WIN.x + 30, y: WIN.y + WIN.h / 2 + 12, s: 0.42, flip: true, look: [-1, 1] });
    mabel(ctx, t, { x: 470, y: FL + 6, s: 0.42, look: [3, 1] });
    rollo(ctx, t, { x: 1350, y: FL + 6, s: 0.48, look: [-3, 2], sweat: t > 92 && t < 104 ? ((t - 92) % 2) / 2 : 0 });
    return;
  }
  // night: stake-out positions, then the after-dark comic poses (153+)
  const after = t >= 153;
  const n = t < 131.4 ? 6 : Math.max(0, 6 - Math.floor((t - 131.4) / 0.7));
  basket(ctx, 1640, FL + 6, n);
  gus(ctx, t, { x: 760, y: FL + 6, s: 0.62, face: after ? 'wow' : t > 137 ? 'neutral' : 'happy', look: after ? [10, 6] : [6, 0],
    armF: !after && t < 141 ? { a1: 2.3, a2: -0.2 } : t >= 154 ? { a1: -0.1, a2: 0.1 } : undefined, handF: t >= 154 ? { kind: 'point', a: 0.15 } : undefined,
    armB: !after && t < 141 ? { a1: 0.9, a2: 3.1 } : undefined });
  const pipLook = [Math.sin(t * 1.3) > 0 ? 1 : -1, 0];
  if (!after) pip(ctx, t, { x: WIN.x + 30, y: WIN.y + WIN.h / 2 + 12, s: 0.42, flip: pipLook[0] < 0, look: [1, 0] });
  else pip(ctx, t, { x: 1040, y: 560 + Math.sin(t * 9) * 6, s: 0.42, fly: true, flapRate: 6, dizzy: t * 2 });
  mabel(ctx, t, { x: 470, y: FL + 6, s: 0.42, sleepy: true });
  const chew = t > 131.4 && t < 135.8 ? Math.abs(Math.sin(t * 14)) * 0.06 : 0;
  rollo(ctx, t, { x: 1760, y: FL + 6, s: 0.48, squash: 1 - chew, look: t < 135.8 ? [-3, 2] : [0, 0], burp: t > 135.8 && t < 136.8 ? Math.sin(seg(t, 135.8, 136.8) * Math.PI) : 0, guilty: after });
}
// eyes in the dark (141–153): who is where, and who just moved
function darkEyes(ctx, t) {
  plane(ctx, rect(-600, -600, 3200, 2400), '#05070D', { grain: 0.2 });
  rain(ctx, t, 60, 0.12);
  const pair = (x, y, r, look = [0, 0], blinkSeed = 1, big = 1) => { if (autoBlink(t, blinkSeed)) { [-1, 1].forEach(d => ink(ctx, [[x + d * r * 1.6 - r, y], [x + d * r * 1.6 + r, y]], 4, { color: '#E8E2D0', seed: 9600 + blinkSeed, taper: false })); return; }
    [-1, 1].forEach(d => { shape(ctx, ellipse(x + d * r * 1.6, y, r * big, r * 1.25 * big, 14), { fill: '#F4EAD5', line: 0, grain: 0, off: [0, 0] }); shape(ctx, ellipse(x + d * r * 1.6 + look[0], y + look[1], r * 0.45, r * 0.6, 10), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] }); }); };
  const jump = t > 146.2 && t < 147.4, sq = seg(t, 146.2, 146.5);
  pair(760, 572, 10, [Math.sin(t * 2) * 4, 0], 11, t > 145 ? 1.25 : 1);                       // Gus (eyes widen)
  pair(WIN.x + 70 - (t > 148.4 ? 500 * eio(seg(t, 148.4, 149)) : 0), 498, 7, [-3, 0], 21);     // Pip (darts off the sill at 148.4)
  pair(1765, 818 - (jump ? 60 * Math.sin(sq * Math.PI) : 0), 7, [0, -3], 41, jump ? 1.5 : 1);    // Rollo (jumps at the squeak)
  text(ctx, 'z', 520 + (t * 30 % 40), 700 - (t * 40 % 80), { font: '700 40px Oleo', fill: '#8E8A84', alpha: 0.7 });                   // Mabel, still asleep
}
function stairCast(ctx, t) {
  const g = stairGus(t), lag = d => stairGus(t - d);
  const r = lag(1.0), m = lag(1.9), p = lag(0.6);
  mabel(ctx, t, { x: m.x, y: m.y, s: 0.3, flip: m.dir < 0, bob: m.walking ? -Math.abs(Math.sin(m.ph * TAU)) * 6 : 0, look: [m.dir * 3, 2] });
  rollo(ctx, t, { x: r.x, y: r.y, s: 0.34, flip: r.dir < 0, bob: r.walking ? -Math.abs(Math.sin(r.ph * TAU * 1.4)) * 14 : 0, look: [r.dir * 3, 2] });
  gus(ctx, t, { x: g.x, y: g.y, s: 0.42, flip: g.dir < 0, face: 'neutral', look: [8, 10], lantern: true,
    walk: g.walking ? { walking: true, phase: g.ph, bob: -Math.abs(Math.sin(g.ph * TAU)) * 12, lean: 0.04, x: g.x } : null, armF: { a1: 0.6, a2: 1.2 } });
  pip(ctx, t, { x: p.x + 40, y: p.y - 230, s: 0.3, fly: true, flapRate: 4.5, flip: p.dir < 0 });
  if (t > 220.4) { const k = seg(t, 220.4, 220.9); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(g.x + 40, g.y - 110, 10, g.x + 40, g.y - 110, 420); gg.addColorStop(0, `rgba(255,220,140,${0.25 * k})`); gg.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = gg; ctx.fillRect(g.x - 500, g.y - 600, 1000, 1000); ctx.restore(); }
}
function cellarCast(ctx, t) {
  const leanIn = t >= 255.6 && t < 268 ? 1 : 0;
  gus(ctx, t, { x: 470 + (leanIn ? 120 : 0) * ss(seg(t, 255.6, 256.2)), y: 906, s: 0.6, face: t < 268.3 ? 'puzzled' : 'wow', look: [10, 0], lantern: true,
    armF: leanIn ? { a1: -0.1 + Math.sin(t * 3) * 0.05, a2: -0.25 } : { a1: 0.6, a2: 1.2 } });
  pip(ctx, t, { x: 1560, y: 470 + Math.sin(t * 1.7) * 14, s: 0.45, fly: true, flapRate: 3.5, flip: true });
  mabel(ctx, t, { x: 1700, y: 906, s: 0.42, look: [-4, -2] });
  rollo(ctx, t, { x: 1430, y: 906, s: 0.46, look: [-4, -2], squash: t > 268.3 && t < 269 ? 0.85 : 1 });
}
// tunnel: the crew walks right; the lantern throws their shadows (and one more) up onto the wall
let SH = null;
function tunnelCast(ctx, t, cam) {
  const w = walk(t, 270.8, 291.2, 260, 2350, 120), gx = w.x;
  const crew = c => {
    rollo(c, t, { x: gx - 200, y: 960, s: 0.42, bob: w.walking ? -Math.abs(Math.sin(w.phase * TAU * 1.4)) * 14 : 0, look: [3, 0] });
    mabel(c, t, { x: gx - 360, y: 960, s: 0.38, bob: w.walking ? -Math.abs(Math.sin(w.phase * TAU + 1)) * 6 : 0, look: [3, 0] });
    gus(c, t, { walk: { ...w, x: gx }, y: 960, s: 0.56, face: t >= 286.4 ? 'wow' : 'neutral', look: t >= 281 ? [6, -10] : [10, 4], lantern: true, armF: { a1: 0.3, a2: 0.9 } });
    pip(c, t, { x: gx - 110, y: 600, s: 0.36, fly: true, flapRate: 4 });
  };
  // shadow layer: same drawing into an offscreen, filled dark, then projected up the wall from the lantern
  if (!SH) SH = new OffscreenCanvas(W, H);
  const s = SH.getContext('2d'); s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, W, H);
  s.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.cx * cam.z, H / 2 - cam.cy * cam.z);
  crew(s);
  const sx = gx + 760 - 160 * Math.sin(t * 0.7);                                  // the fifth shadow keeps ahead, nobody casting it
  if (t >= 283.5) { s.save(); s.globalAlpha = ss(seg(t, 283.5, 285.5)); drawStranger(s, sx, 960, 0.6, t); s.restore(); }
  s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-in'; s.fillStyle = '#1A1512'; s.fillRect(0, 0, W, H); s.globalCompositeOperation = 'source-over';
  const [lx, ly] = [W / 2 + (gx + 70 - cam.cx) * cam.z, H / 2 + (700 - cam.cy) * cam.z];
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.6 + Math.sin(t * 13) * 0.03;
  ctx.beginPath(); ctx.rect(0, 0, W, H * 0.73); ctx.clip();
  ctx.translate(lx, ly); ctx.scale(1.4, 1.25); ctx.translate(-lx, -ly - 240); ctx.drawImage(SH, 0, 0); ctx.restore();
  // lantern light pool
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(gx + 70, 700, 20, gx + 70, 700, 760); gg.addColorStop(0, 'rgba(255,214,140,0.35)'); gg.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = gg; ctx.fillRect(gx - 800, -200, 1700, 1500); ctx.restore();
  crew(ctx);
  return { gx, sx, lx };
}

// ---------------------------------------------------------------- draw one set through its camera
function drawSet(ctx, t, shot) {
  const cam = camOf(shot, t), name = shot[1];
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.cx, -cam.cy);
  let info = null;
  if (name === 'storm') {
    const lamp = t < 8.6 ? 1 : t < 9.6 ? (Math.floor(t * 14) % 3 ? 0.3 : 1) * (1 - seg(t, 9.2, 9.6)) : t < 22 ? 0 : ss(seg(t, 22, 22.25));
    const black = t >= 9.6 && t < 22 ? 0.82 : 0;
    stormNight(ctx, t, { lamp, black, ship: t >= 9.6 && t < 22.5 ? [lerp(-300, 1300, seg(t, 9.6, 22.5)), 760] : null, gusSmall: shot[2] === CAM.lampTop && t >= 22, gusFace: t > 23.4 ? 'puzzled' : 'wow' });
  } else if (name === 'harbour') { harbour(ctx, t); harbourCast(ctx, t); }
  else if (name === 'room') {
    lampRoom(ctx, t, { time: [9, 40 + Math.floor((t - 62) / 60), (t * 1) % 60], slow: ss(seg(t, 67.5, 69)), mark: t > 69 && t < 76 ? seg(t, 69, 69.3) : 0,
      prints: t < 71.6 ? 0 : seg(t, 71.6, 74.6) });
    if (shot[2] !== CAM.prints) roomCast(ctx, t, false);
  } else if (name === 'roomN') {
    const lampK = t >= 153 ? ss(seg(t, 153, 153.2)) : 1;
    lampRoom(ctx, t, { night: true, lamp: lampK, time: t < 141 ? [3, 11, 56 + clamp((t - 137) / 4) * 4] : [3, 12, t - 141], cut: t >= 153 ? 1 : 0, spark: t >= 153 ? 1 : 0,
      smudge: t >= 178.4 ? ss(seg(t, 178.4, 178.8)) : 0, web: t >= 165.6 ? 1 : 0, yellowPrints: t >= 201.2 ? seg(t, 201.2, 202.6) : 0 });
    roomCast(ctx, t, true);
    if (t >= 141 && t < 153) { /* handled by 'dark' */ }
    ctx.save(); ctx.globalAlpha = 0.22; ctx.fillStyle = '#0B1530'; ctx.fillRect(-600, -1600, 3200, 4000); ctx.restore();   // night grade
    if (t >= 153 && t < 160) { const k = 1 - seg(t, 153, 153.5); if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#05070D'; ctx.fillRect(-600, -600, 3200, 2400); ctx.restore(); } }
  } else if (name === 'dark') darkEyes(ctx, t);
  else if (name === 'stairs') { stairCutaway(ctx, t, { prints: seg(t, 207.6, 210.5) }); stairCast(ctx, t); }
  else if (name === 'cellar') {
    const ORDER = ['net', 'moon', 'sun', 'wave'], PT = [256.6, 260.2, 263.0, 266.6];
    const pressed = {}, glow = {}, num = {};
    ORDER.forEach((s, i) => { if (t >= PT[i]) { pressed[s] = 1 - seg(t, PT[i] + 0.15, PT[i] + 0.4) * 0.6; glow[s] = 1; num[s] = [i + 1, PT[i]]; } });
    cellar(ctx, t, { open: eio(seg(t, 268.3, 269.6)), pressed, glow, num });
    cellarCast(ctx, t);
  } else if (name === 'tunnel') { tunnel(ctx, t, { prints: seg(t, 275.6, 279.5) }); info = tunnelCast(ctx, t, cam); }
  else if (name === 'noon') {
    const lamp = t < 297.8 ? 1 : 0;
    noon(ctx, t, { lamp, pulse: 297.85, stranger: t >= 300.5 ? 1 : 0 });
  }
  ctx.restore();
  return { cam, info };
}
const w2s = (x, y, c) => [W / 2 + (x - c.cx) * c.z, H / 2 + (y - c.cy) * c.z];

// ---------------------------------------------------------------- overlays (screen space)
const pop = (t, t0, d = 0.28) => back(seg(t, t0, t0 + d), 1.9);
function tag(ctx, t, t0, t1, str, x = 70, y = 70, col = PAL.coral) {     // the kraft tab (chapter markers, time cards)
  if (t < t0 || t >= t1) return;
  const k = eio(seg(t, t0, t0 + 0.35)) * (1 - eio(seg(t, t1 - 0.3, t1)));
  const w = measure(ctx, str, '600 34px Jost', 3) + 70;
  ctx.save(); ctx.translate(x - (1 - k) * (w + 80), y);
  shape(ctx, rrect(0, 0, w, 64, 10), { fill: PAL.paper, line: 4, seed: 9700, grain: 0.15, off: [6, 5] });
  shape(ctx, rect(0, 0, 18, 64), { fill: col, line: 0, grain: 0, off: [0, 0] });
  text(ctx, str, 40, 43, { font: '600 34px Jost', fill: PAL.ink, track: 3 });
  ctx.restore();
}
function titleCard(ctx, t) {
  if (t < 26.5 || t >= 32) return;
  const k = pop(t, 26.6, 0.4), out = ss(seg(t, 31.4, 32));
  ctx.save(); ctx.translate(960, 470); ctx.scale(k * (1 - out), k * (1 - out));
  rays(ctx, 0, 0, 28, 900, PAL.mustardL, { rot: twos(t) * 0.12, alpha: 0.25 });
  star(ctx, 0, 0, 330, { n: 20, inner: 0.86, fill: PAL.paper, off: [0, 0], rot: twos(t) * 0.05 });
  text(ctx, "THE KEEPER'S", 0, -70, { font: '64px Slab', fill: PAL.ink, plate: PAL.coral, off: [5, 5], align: 'center' });
  text(ctx, 'ISLAND', 0, 30, { font: '120px Slab', fill: PAL.ink, plate: PAL.coral, off: [7, 7], align: 'center' });
  text(ctx, 'Chapter 1 · Twelve Seconds of Dark', 0, 112, { font: '700 52px Oleo', fill: PAL.coralD, align: 'center' });
  ctx.restore();
}
function calendar(ctx, t) {
  if (t < 49.6 || t >= 54.4) return;
  const k = pop(t, 49.6, 0.3), out = ss(seg(t, 54.0, 54.4));
  ctx.save(); ctx.translate(840, 300); ctx.scale(k * (1 - out), k * (1 - out)); ctx.rotate(-0.04);
  shape(ctx, rrect(-170, -150, 340, 300, 16), { fill: PAL.white, line: 5, seed: 9710, grain: 0.15, off: [7, 6] });
  shape(ctx, rrect(-170, -150, 340, 80, 16), { fill: PAL.coral, line: 5, seed: 9711, grain: 0.2 });
  text(ctx, 'DAYS LEFT', 0, -96, { font: '600 36px Jost', fill: PAL.white, align: 'center', track: 4 });
  const n = t < 52.3 ? 3 : 3;                                       // the number lands on "three days"
  text(ctx, String(n), 0, 110, { font: '200px Slab', fill: PAL.ink, plate: PAL.mustard, off: [6, 6], align: 'center' });
  ctx.restore();
}
function nameTags(ctx, t, cam) {
  if (t < 55.6 || t >= 61.8) return;
  [['PIP', 55.8, 1830, DOCK - 330], ['MABEL', 57.8, 1060, DOCK - 280], ['ROLLO', 59.0, 1440, DOCK - 200]].forEach(([n, t0, x, y], i) => {
    const k = pop(t, t0, 0.3) * (1 - ss(seg(t, 61.4, 61.8))); if (k <= 0) return; const [sx, sy] = w2s(x, y, cam);
    ctx.save(); ctx.translate(sx, sy); ctx.scale(k, k); ctx.rotate((i - 1) * 0.06);
    const w = measure(ctx, n, '40px Slab') + 50; shape(ctx, rrect(-w / 2, -34, w, 64, 12), { fill: PAL.mustard, line: 4, seed: 9720 + i, grain: 0.2, off: [5, 5] });
    text(ctx, n, 0, 16, { font: '40px Slab', fill: PAL.ink, align: 'center' }); ctx.restore();
  });
}
function label(ctx, t, t0, t1, str, x, y, rot = -0.05, col = PAL.coral) {
  if (t < t0 || t >= t1) return;
  const k = pop(t, t0, 0.26) * (1 - ss(seg(t, t1 - 0.2, t1)));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  const w = measure(ctx, str, '44px Slab') + 56; shape(ctx, rrect(-w / 2, -40, w, 76, 14), { fill: PAL.paper, line: 4.5, seed: 9730 + Math.floor(x), grain: 0.15, off: [6, 5] });
  text(ctx, str, 0, 16, { font: '44px Slab', fill: col, align: 'center' }); ctx.restore();
}
function stampWord(ctx, t, t0, t1, word, x, y, col = PAL.coral, size = 120, rot = -0.12) {
  if (t < t0 || t >= t1) return;
  const k = 1 + 1.4 * (1 - eio(seg(t, t0, t0 + 0.14))), a = ss(seg(t, t0, t0 + 0.08)) * (1 - ss(seg(t, t1 - 0.25, t1)));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = `${size}px Slab`; const w = ctx.measureText(word).width + 70;
  shape(ctx, rrect(-w / 2, -size * 0.62, w, size * 1.12, 18), { fill: PAL.paper, line: 0, grain: 0.1, off: [0, 0], alpha: 0.85 });
  ink(ctx, rrect(-w / 2, -size * 0.62, w, size * 1.12, 18), 10, { closed: true, color: col, seed: 9740, taper: false, breaks: 0.15 });
  text(ctx, word, 0, size * 0.36, { font: `${size}px Slab`, fill: col, align: 'center' });
  ctx.restore();
}
// riddle 1 comparison: Pip's foot (to scale) and Gus's boot outline over the print (print-close framing)
function compare(ctx, t, cam) {
  if (shotAt(t)[2] !== CAM.prints || t >= 89.6) return;
  const p = PRINTS[3]; const [sx, sy] = w2s(p.x, p.y, cam);
  if (t >= 80.8) { const k = pop(t, 80.8, 0.3); ctx.save(); ctx.translate(sx - 40, sy - 150); ctx.scale(k * cam.z * 0.9, k * cam.z * 0.9);
    shape(ctx, [[0, 0], [-26, -14], [-30, 0], [-26, 14]], { fill: PAL.coralL, line: 0, grain: 0, off: [0, 0], alpha: 0.7 });
    [[-0.5], [0], [0.5]].forEach(([a], i) => ink(ctx, [[0, 0], [Math.cos(Math.PI + a) * 30, Math.sin(Math.PI + a) * 30]], 5, { color: PAL.coralD, seed: 9750 + i, taper: true }));
    ink(ctx, [[0, 0], [12, 0]], 5, { color: PAL.coralD, seed: 9753, taper: false }); ctx.restore(); label(ctx, t, 80.9, 89.6, "PIP'S FOOT", sx - 60, sy - 260, -0.06, PAL.inkSoft); }
  if (t >= 83.2) { const k = pop(t, 83.2, 0.3); ctx.save(); ctx.translate(sx + 20, sy + 6); ctx.rotate(Math.PI + p.a - Math.PI); ctx.scale(k * cam.z * 0.9, k * cam.z * 0.9);
    ctx.setLineDash([12, 10]); ctx.lineWidth = 5; ctx.strokeStyle = PAL.coral; ctx.beginPath(); ctx.ellipse(-2, 0, 50, 22, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    label(ctx, t, 83.3, 89.6, "GUS'S BOOT", sx + 250, sy + 120, 0.05, PAL.inkSoft); }
  label(ctx, t, VT('c6') + 0.1, 89.6, 'NO CLAWS', sx - 330, sy - 40, -0.08);
  label(ctx, t, VT('c6') + 1.6, 89.6, 'STRAIGHT EDGE', sx + 380, sy - 120, 0.06);
}
function fromSea(ctx, t, cam) {
  if (shotAt(t)[2] !== CAM.win || t < 89.6 || t >= 92) return;
  const [ax, ay] = w2s(1180, 960, cam), [bx, by] = w2s(WIN.x, WIN.y + 120, cam);
  const u = eio(seg(t, 89.7, 90.4)); const pts = []; for (let i = 0; i <= 20; i++) { const s = i / 20 * u; pts.push([lerp(ax, bx, s), lerp(ay, by, s) - Math.sin(s * Math.PI) * 80]); }
  ink(ctx, pts, 9, { color: PAL.coral, seed: 9760, taper: true });
  label(ctx, t, 90.3, 92, 'FROM THE SEA', bx - 360, by - 40, -0.06);
}
// the riddle box: question + 10-second dial + "pause & solve"
const RIDDLES = PORTR([
  { t0: 94.2, q: 'Who made the wet prints?', n: 1 },
  { t0: 184.4, q: 'Window or stairs: which way did the cutter go?', n: 2 },
  { t0: 244.6, q: 'Which order opens the door?', n: 3, stones: true },
]);
function PORTR(x) { return x; }
function riddleBox(ctx, t) {
  const R = RIDDLES.find(r => t >= r.t0 - 0.2 && t < r.t0 + 10.6); if (!R) return;
  const k = pop(t, R.t0, 0.32) * (1 - ss(seg(t, R.t0 + 10.2, R.t0 + 10.6))), up = t >= R.t0 + 10;
  // left: the question card
  ctx.save(); ctx.translate(PORT ? 540 : 560, PORT ? 340 : 300); ctx.scale(k * (PORT ? 1.12 : 1), k * (PORT ? 1.12 : 1)); ctx.rotate(-0.025);
  shape(ctx, rrect(-420, -160, 840, R.stones ? 330 : 250, 22), { fill: PAL.paper, line: 5, seed: 9800, grain: 0.15, off: [8, 7] });
  shape(ctx, rrect(-420, -160, 840, 66, 22), { fill: PAL.coral, line: 5, seed: 9801, grain: 0.2 });
  text(ctx, `RIDDLE ${R.n} · PAUSE & SOLVE`, 0, -114, { font: '600 34px Jost', fill: PAL.white, align: 'center', track: 4 });
  const f = fit(ctx, R.q, '700 {px}px Oleo', 62, 760, 2, 40);
  f.lines.forEach((l, i) => text(ctx, l, 0, -20 + i * f.px * 1.15 + (f.lines.length === 1 ? 20 : 0), { font: f.font, fill: PAL.ink, align: 'center' }));
  if (R.stones) STONES.forEach((s, i) => { const x = -240 + i * 160; shape(ctx, ellipse(x, 110, 50, 50, 30), { fill: '#B9B3A8', line: 4, seed: 9810 + i, grain: 0.3 }); stoneIcon(ctx, s, x, 110, 40); });
  ctx.restore();
  // right: the countdown dial
  ctx.save(); ctx.translate(PORT ? 830 : 1500, PORT ? 1640 : 330); ctx.scale(k * (PORT ? 0.62 : 0.8), k * (PORT ? 0.62 : 0.8));
  rays(ctx, 0, 0, 30, 420, PAL.mustardL, { rot: twos(t) * 0.15, alpha: 0.35 });
  star(ctx, 0, 0, 230, { n: 18, inner: 0.84, fill: up ? PAL.coral : PAL.white, off: [0, 0], rot: twos(t) * 0.1 });
  shape(ctx, ellipse(0, 0, 180, 180, 72), { fill: up ? PAL.coralL : PAL.mustard, line: 6, seed: 9820, grain: 0.3 });
  if (!up) {
    const e = clamp(t - R.t0, 0, 9.999), n = 10 - Math.floor(e), frac = e % 1;
    ink(ctx, ellipse(0, 0, 200, 200, 80, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - frac)), 12, { color: PAL.coral, seed: 9821, taper: false });
    const kk = back(seg(frac, 0, 0.18), 2.2); ctx.save(); ctx.scale(kk, kk);
    text(ctx, String(n), 0, 84, { font: `${n === 10 ? 200 : 250}px Slab`, fill: PAL.ink, plate: PAL.white, off: [7, 7], align: 'center' }); ctx.restore();
  } else { const kk = back(seg(t, R.t0 + 10, R.t0 + 10.2), 2); ctx.save(); ctx.scale(kk, kk); ctx.rotate(-0.08);
    text(ctx, "TIME'S", 0, -10, { font: '88px Slab', fill: PAL.ink, plate: PAL.white, off: [5, 5], align: 'center' }); text(ctx, 'UP!', 0, 86, { font: '100px Slab', fill: PAL.ink, plate: PAL.white, off: [5, 5], align: 'center' }); ctx.restore(); }
  ctx.restore();
}
// exits (riddle 2 setup): two arrows on the wide
function exits(ctx, t, cam) {
  if (shotAt(t)[2] !== WIDE || shotAt(t)[1] !== 'roomN' || t < 166.4 || t >= 170.6) return;
  label(ctx, t, VT('e2') + 1.6, 170.6, 'WINDOW?', ...w2s(WIN.x, WIN.y - 230, cam), -0.06);
  label(ctx, t, VT('e2') + 3.0, 170.6, 'STAIRS?', ...w2s(620, FL - 210, cam), 0.05);
}
function recapCard(ctx, t, t0, t1, kicker, title, kind) {
  if (t < t0 || t >= t1) return;
  const k = eio(seg(t, t0, t0 + 0.4)) * (1 - eio(seg(t, t1 - 0.35, t1)));
  ctx.save(); ctx.translate(W - 560 * k, PORT ? 300 : 120); ctx.rotate(0.02);
  shape(ctx, rrect(0, 0, 520, 330, 18), { fill: PAL.paper, line: 5, seed: 9830, grain: 0.15, off: [7, 6] });
  text(ctx, kicker, 30, 52, { font: '600 28px Jost', fill: PAL.coralD, track: 4 });
  const f = fit(ctx, title, '700 {px}px Oleo', 44, 460, 2, 30); f.lines.forEach((l, i) => text(ctx, l, 30, 102 + i * f.px * 1.1, { font: f.font, fill: PAL.ink }));
  // thumbnail
  ctx.save(); ctx.translate(30, 170); ctx.beginPath(); ctx.rect(0, 0, 460, 130); ctx.clip();
  if (kind === 'ep02') { plane(ctx, rect(0, 0, 460, 130), '#F2E3C4', { grain: 0.2 }); for (let i = 0; i < 6; i++) shape(ctx, rect(40 + i * 60, 30 + i * 16, 64, 130), { fill: PAL.mustard, line: 3, seed: 9840 + i, grain: 0.2 }); for (let i = 0; i < 6; i++) pawPrint(ctx, 70 + i * 60, 44 + i * 16, 1.2, 0.3); }
  else { plane(ctx, rect(0, 0, 460, 130), '#E9DFC6', { grain: 0.3 }); plane(ctx, rect(0, 80, 460, 50), '#2E4A6B', { grain: 0.3 });
    ink(ctx, [[180, 80], [180, 30]], 10, { color: '#2B2420', seed: 9850, taper: false }); shape(ctx, ellipse(180, 22, 12, 12, 10), { fill: '#2B2420', line: 0, grain: 0, off: [0, 0] });
    shape(ctx, rect(400, 20, 34, 34), { fill: '#B8452B', line: 0, grain: 0, off: [0, 0] }); text(ctx, 'no shadow', 260, 70, { font: '600 22px Jost', fill: PAL.inkSoft }); }
  ctx.restore(); ink(ctx, rect(30, 170, 460, 130), 3.5, { closed: true, seed: 9860, taper: false });
  ctx.restore();
}
function shadowCount(ctx, t, cam, info) {
  if (!info || t < 286.6 || t >= 292) return;
  const xs = [info.gx - 360, info.gx - 200, info.gx - 110, info.gx, info.sx];
  xs.forEach((x, i) => { const k = pop(t, 286.6 + i * 0.32, 0.25); if (k <= 0) return; const sx = info.lx + (w2s(x, 0, cam)[0] - info.lx) * 1.4;
    ctx.save(); ctx.translate(sx, 140); ctx.scale(k, k); shape(ctx, ellipse(0, 0, 36, 36, 20), { fill: i === 4 ? PAL.coral : PAL.paper, line: 4, seed: 9870 + i, grain: 0.1 });
    text(ctx, String(i + 1), 0, 16, { font: '44px Slab', fill: i === 4 ? PAL.white : PAL.ink, align: 'center' }); ctx.restore(); });
}
function endCard(ctx, t) {
  if (t < 305.4) return;
  const k = eio(seg(t, 305.4, 306.0));
  ctx.save(); ctx.globalAlpha = 0.55 * k; ctx.fillStyle = '#1B2338'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const a = pop(t, 305.7, 0.4);
  ctx.save(); ctx.translate(960, 400); ctx.scale(a, a);
  star(ctx, 0, 0, 300, { n: 20, inner: 0.86, fill: PAL.paper, off: [0, 0], rot: twos(t) * 0.05 });
  text(ctx, 'CHAPTER 2', 0, -30, { font: '96px Slab', fill: PAL.ink, plate: PAL.coral, off: [6, 6], align: 'center' });
  text(ctx, 'Saturday', 0, 60, { font: '700 72px Oleo', fill: PAL.coralD, align: 'center' });
  ctx.restore();
  const b = pop(t, 306.8, 0.35);
  ctx.save(); ctx.translate(960, 800); ctx.scale(b, b);
  shape(ctx, rrect(-560, -60, 1120, 120, 20), { fill: PAL.paper, line: 5, seed: 9880, grain: 0.15, off: [7, 6] });
  text(ctx, 'Who is the Stranger in the yellow coat? Comment below.', 0, 18, { font: '700 46px Oleo', fill: PAL.ink, align: 'center', maxW: 1060 });
  ctx.restore();
}
function caption(ctx, t) {
  const c = cues().find(q => t >= q.t0 && t < q.t1); if (!c) return;
  if (t >= 305.4) return;
  const a = Math.min(ss(seg(t, c.t0, c.t0 + 0.14)), 1 - ss(seg(t, c.t1 - 0.14, c.t1)));
  const f = PORT ? fit(ctx, c.text, '600 {px}px Jost', 60, 900, 3, 42) : fit(ctx, c.text, '600 {px}px Jost', 48, 1300, 2, 34), words = c.text.split(/\s+/), keys = KEY[c.id] || [];
  const lh = f.px * 1.22, h = 40 + f.lines.length * lh, w = Math.max(...f.lines.map(l => measure(ctx, l, f.font))) + 120, y = (PORT ? 1560 : 1000) - h;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 12);
  shape(ctx, rrect(W / 2 - w / 2, y, w, h, 16), { fill: PAL.paper, line: 3.6, seed: 901, grain: 0.15, breaks: 0.08, off: [6, 6] });
  star(ctx, W / 2 - w / 2 + 30, y + h / 2, 13, { n: 8, inner: 0.4, fill: PAL.coral, off: [0, 0], rot: t * 0.8 });
  star(ctx, W / 2 + w / 2 - 30, y + h / 2, 13, { n: 8, inner: 0.4, fill: PAL.coral, off: [0, 0], rot: -t * 0.8 });
  const tot = words.reduce((s, x) => s + x.length + 1, 0); let acc = 0, wi = 0; const WT = WORDS[c.id];
  f.lines.forEach((line, li) => {
    const lw = measure(ctx, line, f.font); let x = W / 2 - lw / 2;
    line.split(/\s+/).forEach(wd => {
      const tw = WT && WT[wi] ? c.t0 + WT[wi].t0 - 0.04 : c.t0 + (acc / tot) * c.dur * 0.92; acc += wd.length + 1; wi++;
      const k = back(seg(t, tw - 0.02, tw + 0.14), 2.2), ww = measure(ctx, wd + ' ', f.font);
      if (k > 0) { ctx.save(); const cx = x + ww / 2, cy = y + 20 + lh * li + f.px * 0.95; ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
        text(ctx, wd, x, cy, { font: f.font, fill: keys.includes(wd) ? PAL.coralD : PAL.ink }); ctx.restore(); }
      x += ww;
    });
  });
  ctx.restore();
}

// ---------------------------------------------------------------- render
export const CHAPTERS = [[0, 'Twelve seconds of dark'], [32, 'The wreck'], [62, 'Riddle 1: the clock'], [122, 'The stake-out'], [160, 'Riddle 2: the cable'],
  [222, 'Riddle 3: the cellar door'], [270, 'The tunnel'], [292, 'Noon']];
function frame(ctx, t, shot) { const r = drawSet(ctx, t, shot); return r; }
export function renderFilm(ctx, t, Q, nocap = false) {
  setClock(t);
  ctx.fillStyle = '#1B2338'; ctx.fillRect(0, 0, W, H);
  const shot = shotAt(t), idx = SHOTS.indexOf(shot);
  let r = frame(ctx, t, shot);
  if (!PORT && shot[3]?.wipe && t < shot[0] + 0.35 && idx > 0) {           // the coral colour-block wipe between sections
    const k = eio(seg(t, shot[0], shot[0] + 0.35)), x = W * (1 - k);
    ctx.fillStyle = '#1B2338'; ctx.fillRect(0, 0, W, H); frame(ctx, shot[0] - 0.001, SHOTS[idx - 1]);
    ctx.save(); ctx.beginPath(); ctx.rect(x, 0, W, H); ctx.clip(); r = frame(ctx, t, shot); ctx.restore();
    plane(ctx, rect(x - 50, -10, 50, H + 20), PAL.coral, { grain: 0.2 }); ink(ctx, [[x - 50, -10], [x - 50, H + 10]], 6, { seed: 2900 });
  }
  const cam = r.cam;
  if (shot[1] === 'storm') flash(ctx, t, [0.6, 4.3, 17.0, 27.8]);
  // twelve-second counters in the dark
  [[9.8, 21.8], [141.0, 153.0]].forEach(([a, b]) => { if (t >= a && t < b) { const n = 12 - Math.floor(t - a); const kk = back(seg((t - a) % 1, 0, 0.16), 2);
    ctx.save(); ctx.translate(960, 180); ctx.scale(kk, kk); text(ctx, String(n), 0, 50, { font: '150px Slab', fill: '#F4EAD5', plate: PAL.coralD, off: [6, 6], align: 'center', alpha: 0.9 }); ctx.restore(); } });
  tag(ctx, t, 1.0, 5.6, '3:11 AM', 70, 70, PAL.blue);
  tag(ctx, t, 32.4, 36.4, 'THE NEXT MORNING', 70, 70, PAL.mustard);
  [[62.4, 'RIDDLE 1 · THE CLOCK'], [160.4, 'RIDDLE 2 · THE CABLE'], [222.4, 'RIDDLE 3 · THE CELLAR DOOR']].forEach(([a, s]) => tag(ctx, t, a, a + 3.6, s));
  tag(ctx, t, 122.4, 126, 'THAT NIGHT', 70, 70, PAL.blue); tag(ctx, t, 270.4, 274, 'THE TUNNEL', 70, 70, PAL.teal); tag(ctx, t, 292.4, 296.4, 'NEXT DAY · NOON', 70, 70, PAL.mustard);
  titleCard(ctx, t); calendar(ctx, t); nameTags(ctx, t, cam);
  if (shot[1] === 'room' || shot[1] === 'roomN') { compare(ctx, t, cam); fromSea(ctx, t, cam); exits(ctx, t, cam); }
  if (t >= 92 && t < 94.2) label(ctx, t, 92.4, 94.2, 'PAUSE NOW', W / 2, 300, -0.04);
  riddleBox(ctx, t);
  // riddle 1 answer: a fin slides onto the print and matches
  if (shot[2] === CAM.prints && t >= 105) { const p = PRINTS[3], [sx, sy] = w2s(p.x, p.y, cam), u = eio(seg(t, 105.6, 106.4));
    ctx.save(); ctx.translate(lerp(sx + 500, sx, u), lerp(sy - 300, sy, u)); ctx.scale(cam.z * 0.9, cam.z * 0.9); ctx.rotate(p.a + (1 - u) * 0.6);
    shape(ctx, [[-34, 0], [-30, -12], [40, -18], [100, -30], [108, 0], [100, 30], [40, 18], [-30, 12]], { fill: '#2F6E8A', line: 4, seed: 9900, grain: 0.2 });
    shape(ctx, rrect(-60, -18, 40, 36, 10), { fill: '#1E4A5E', line: 3.5, seed: 9901, grain: 0.1 }); ctx.restore();
    stampWord(ctx, t, VT('c8') + 2.6, 110, 'SWIM FINS!', W / 2, 250, PAL.coral, 110); }
  if (shot[2] === WIDE && shot[1] === 'room' && t >= 110) diverFlashback(ctx, t, 110.4, 960, 400, 760, 470);
  if (shot[2] === CAM.cable) { label(ctx, t, 155.0, 160, 'CUT!', W * 0.6, 300, -0.06); label(ctx, t, VT('e1') + 2.2, 165.6, 'CUT CLEAN THROUGH', W / 2, PORT ? 420 : 300, -0.04); if (t >= 177.4 && t < 181.2) label(ctx, t, 178.6, 181.2, 'YELLOW?', W * 0.65, PORT ? 420 : 300, 0.05, PAL.mustardD); }
  stampWord(ctx, t, 195.6, 200.2, 'THE STAIRS!', W / 2, 200, PAL.coral, 110);
  if (shot[2] === CAM.win && t >= 195.2 && t < 200.4) label(ctx, t, 196.6, 200.4, 'NOT ONE THREAD BROKEN', W / 2, 810, 0.03, PAL.tealD);
  recapCard(ctx, t, 201.6, 206.8, 'REMEMBER? · EPISODE 2', 'Who Ate the Sandwich?', 'ep02');
  recapCard(ctx, t, 236.0, 241.8, 'OLD TALE #1', 'The Man Who Sold His Shadow', 'ot01');
  stampWord(ctx, t, 268.4, 270.0, 'CLICK!', W / 2, 160, PAL.mustardD, 100, 0.08);
  shadowCount(ctx, t, cam, r.info);
  endCard(ctx, t);
  paperFinish(ctx, W, H, 0.8);
  if (!(Q && Q.has('nosubs')) && !nocap) caption(ctx, t);
}

export function renderShort(ctx, ts, n) {
  const S = SHORTS[n - 1], L = S.b - S.a, t = shortMap(n, ts);
  renderFilm(ctx, t, null, ts >= L + SHORT_CD);
  if (ts < 2.4) {                                                   // hook banner: series + riddle number
    const k = pop(ts, 0.1, 0.35) * (1 - ss(seg(ts, 2.0, 2.4)));
    ctx.save(); ctx.translate(540, 250); ctx.scale(k, k); ctx.rotate(-0.04);
    star(ctx, 0, 0, 200, { n: 18, inner: 0.84, fill: PAL.paper, off: [0, 0], rot: twos(ts) * 0.08 });
    text(ctx, `RIDDLE ${n}`, 0, 10, { font: '88px Slab', fill: PAL.ink, plate: PAL.coral, off: [5, 5], align: 'center' });
    text(ctx, "The Keeper's Island", 0, 70, { font: '700 40px Oleo', fill: PAL.coralD, align: 'center' }); ctx.restore();
  }
  if (ts >= L + SHORT_CD) {                                          // end card: the answer is in Chapter 1
    const e = ts - L - SHORT_CD, k = eio(seg(e, 0, 0.4));
    ctx.save(); ctx.globalAlpha = 0.6 * k; ctx.fillStyle = '#1B2338'; ctx.fillRect(0, 0, W, H); ctx.restore();
    const a = pop(e, 0.15, 0.4);
    ctx.save(); ctx.translate(540, 820); ctx.scale(a, a);
    rays(ctx, 0, 0, 28, 760, PAL.mustardL, { rot: twos(ts) * 0.12, alpha: 0.3 });
    star(ctx, 0, 0, 330, { n: 20, inner: 0.86, fill: PAL.paper, off: [0, 0], rot: twos(ts) * 0.05 });
    text(ctx, 'THE ANSWER IS IN', 0, -70, { font: '600 40px Jost', fill: PAL.ink, align: 'center', track: 4 });
    text(ctx, 'CHAPTER 1', 0, 30, { font: '104px Slab', fill: PAL.ink, plate: PAL.coral, off: [6, 6], align: 'center' });
    text(ctx, 'Twelve Seconds of Dark', 0, 104, { font: '700 46px Oleo', fill: PAL.coralD, align: 'center' });
    ctx.restore();
    const b = pop(e, 0.8, 0.35); ctx.save(); ctx.translate(540, 1330); ctx.scale(b, b);
    shape(ctx, rrect(-430, -56, 860, 112, 20), { fill: PAL.paper, line: 5, seed: 9890, grain: 0.15, off: [7, 6] });
    text(ctx, 'Comment your answer first!', 0, 18, { font: '700 52px Oleo', fill: PAL.ink, align: 'center', maxW: 800 }); ctx.restore();
  }
}

// ---------------------------------------------------------------- sound events (the same times drive the picture)
let EVS = [];
const ev = (t, type, o = {}) => EVS.push({ t: +(+t).toFixed(4), type, ...o });
export function events() { return EVS; }
function buildEvents() {
  EVS = [];
  V.forEach(v => ev(v.t, 'vo', { id: v.id }));
  // A storm
  ev(0, 'storm', { dur: 32.0 }); [0.6, 4.3, 17.0, 27.8].forEach((f, i) => ev(f + 0.15 + i * 0.05, 'thunder', { n: i }));
  [3.0, 8.0, 12.8, 19.2, 24.6].forEach(f => ev(f, 'wave_crash', {}));
  ev(5.6, 'cut', {}); for (let i = 0; i < 6; i++) ev(8.6 + i * 0.16, 'flicker', { n: i }); ev(9.6, 'lamp_off', {});
  ev(10.8, 'horn', { dur: 3.2 }); ev(16.0, 'horn', { dur: 2.0 });
  for (let s = 0; s < 12; s++) ev(9.8 + s, 'tick', { n: s });
  ev(22.0, 'lamp_on', {}); ev(26.6, 'title', {});
  // B harbour
  ev(32, 'wipe', {}); ev(32, 'harbour', { dur: 30.0 }); [33.5, 38, 45, 52].forEach(x => ev(x, 'gull', {}));
  for (let i = 0; i < 9; i++) ev(37.9 + i * 0.27, 'footstep', { n: i });
  ev(43.25, 'whoosh', {}); ev(43.4, 'grumble', { dur: 4.6 }); ev(49.6, 'pop', {}); ev(VT('b4') + 0.7, 'stamp', {});
  for (let i = 0; i < 6; i++) ev(54.8 + i * 0.2, 'flap', {}); ev(56.0, 'squawk', {}); ev(55.8, 'pop', { gain: 0.6 });
  for (let i = 0; i < 6; i++) ev(56.3 + i * 0.26, 'pad', { n: i }); ev(57.8, 'pop', { gain: 0.6 }); ev(58.0, 'mew', {});
  ev(58.15, 'boing', {}); ev(58.8, 'thump', { n: 1 }); ev(59.0, 'pop', { gain: 0.6 }); ev(59.1, 'squeak', {});
  // C riddle 1
  ev(62, 'wipe', {}); ev(62, 'room', { dur: 60.0 });
  for (let s = 0; s < 30; s++) ev(65.6 + s * 0.5, 'clock_tock', { n: s }); ev(69.0, 'pop', {});
  for (let i = 0; i < 9; i++) ev(71.6 + i * 0.33, 'drip', { n: i });
  ev(80.9, 'pop', {}); ev(83.3, 'pop', {}); ev(VT('c6') + 0.1, 'pop', {}); ev(VT('c6') + 1.6, 'pop', {}); ev(89.7, 'whoosh', {});
  RIDDLES.forEach(R => { ev(R.t0, 'riddle_in', {}); for (let s = 0; s < 10; s++) ev(R.t0 + s, 'tick', { n: s }); ev(R.t0 + 10, 'bell', {}); });
  ev(105.6, 'whoosh', {}); ev(106.4, 'slap', {}); ev(VT('c8') + 2.6, 'stamp', {}); ev(110.4, 'whoosh', {}); ev(110.8, 'climb', { dur: 2.0 });
  // D stake-out
  ev(122, 'wipe', {}); ev(122, 'rainroom', { dur: 38.0 });
  for (let i = 0; i < 7; i++) ev(131.4 + i * 0.7, 'munch', { n: i }); ev(135.8, 'burp', {});
  for (let s = 0; s < 4; s++) ev(137.0 + s, 'clock_tock', { n: s }); ev(141.0, 'lamp_off', {});
  for (let s = 0; s < 12; s++) ev(141.0 + s, 'tick', { n: s, gain: 0.5 }); ev(144.0, 'snip', {}); ev(146.2, 'squeak', {}); ev(148.4, 'squawk', {}); ev(148.5, 'flap', {}); ev(150.5, 'creak', {});
  ev(153.0, 'lamp_on', {}); ev(153.2, 'sizzle', { dur: 6.5 }); ev(153.3, 'flap', {}); ev(153.6, 'flap', {});
  // E riddle 2
  ev(160, 'wipe', {}); ev(160.2, 'sizzle', { dur: 5 }); ev(VT('e2') + 1.6, 'pop', {}); ev(VT('e2') + 3.0, 'pop', {}); ev(178.4, 'squish', {});
  ev(195.6, 'stamp', {}); ev(196.6, 'pop', {}); ev(201.2, 'pop', { gain: 0.5 }); ev(201.6, 'whoosh', {});
  for (let i = 0; i < 20; i++) ev(208.2 + i * 0.66, 'footstep', { n: i, gain: 0.7 });
  ev(207.6, 'prints_run', { dur: 2.9 });
  // F cellar
  ev(222, 'wipe', {}); ev(222, 'cellar_amb', { dur: 48.0 }); ev(236.0, 'whoosh', {});
  [256.6, 260.2, 263.0, 266.6].forEach((x, i) => { ev(x, 'stone', { n: i }); ev(x + 0.1, 'chime', { n: i }); });
  ev(268.3, 'door_clunk', {}); ev(268.6, 'door_creak', { dur: 1.2 });
  // G tunnel
  ev(270, 'wipe', {}); ev(270, 'tunnel_amb', { dur: 22.0 });
  for (let i = 0; i < 34; i++) ev(270.9 + i * 0.6, 'sand_step', { n: i });
  [286.6, 286.92, 287.24, 287.56].forEach((x, i) => ev(x, 'pop', { gain: 0.5 })); ev(287.88, 'sting_low', {});
  // H noon
  ev(292, 'wipe', {}); ev(292, 'noon_amb', { dur: 20.0 }); ev(294, 'gull', {}); ev(297.8, 'lamp_off', {}); ev(297.85, 'boom', {});
  ev(300.5, 'wind_gust', { dur: 4.0 }); ev(305.7, 'title', {});
  EVS.sort((a, b) => a.t - b.t);
}
