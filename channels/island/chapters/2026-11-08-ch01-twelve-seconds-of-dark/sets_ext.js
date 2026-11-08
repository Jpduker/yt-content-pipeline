// Exterior sets for Chapter 1 (world px; the wide framing = the 1920x1080 frame).
// Depth: 3 parallax planes (far sky/clouds, mid sea+island, near rocks/dock) that drift on their own (wind, swell),
// never a camera zoom. Night = flat dark planes + additive light (beam, lamp glow, lightning).
import { PAL, shape, plane, ink, rays, ellipse, rect, rrect, spline, sparkle, text, clamp, lerp, seg, ss, eio, back, twos, TAU, hash, star } from './engine/toon.js';
import { gus, pip, mabel, rollo, walk, hop, drawMaster, drawStranger, YC } from './cast2.js';

export const LH = { x: 1250, base: 760, top: 300 };            // lighthouse in the wide framing
export const NIGHT = { sky: '#1B2338', sky2: '#253152', cloud: '#2E3A5C', cloudD: '#222B45', sea: '#1E3A4A', seaL: '#2F5566', rock: '#2A2A33', rockL: '#3B3B48' };
const DAY = { sky: '#BFD9DE', sky2: '#E9E0C6', cloud: '#FBF6EA', sea: PAL.teal, seaD: PAL.tealD, rock: '#8A7E72', rockD: '#6B6058', sand: '#E6D2AC', dock: PAL.kraft, dockD: PAL.kraftD };

// ---------------------------------------------------------------- lighthouse (shared by night + noon)
export function lighthouse(ctx, t, o = {}) {
  const { x, base, top } = LH, dark = o.dark ?? 0, lampOn = o.lamp ?? 1, night = o.night;
  const wb = 120, wt = 76;
  const tower = [[x - wb, base], [x - wt, top], [x + wt, top], [x + wb, base]];
  const W1 = night ? '#C9C2B4' : PAL.white, R1 = night ? '#8E3A2B' : PAL.coral;
  shape(ctx, tower, { fill: W1, line: 5, seed: 7000, grain: 0.3 });
  ctx.save(); ctx.beginPath(); tower.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.clip();
  ctx.fillStyle = R1; for (let k = 0; k < 4; k++) ctx.fillRect(x - 140, top + 40 + k * 115, 280, 52);
  ctx.globalAlpha = 0.18; ctx.fillStyle = '#000'; ctx.fillRect(x + 20, top, 120, base - top); ctx.restore();   // shaded side
  ink(ctx, tower, 5, { closed: true, seed: 7001, breaks: 0.1 });
  shape(ctx, rrect(x - 26, base - 90, 52, 90, 20), { fill: PAL.ink, line: 0, seed: 7002, off: [0, 0] });          // door
  [[top + 130], [top + 280]].forEach(([wy], i) => shape(ctx, rrect(x - 14, wy, 28, 40, 12), { fill: night ? (lampOn ? '#F6D77A' : '#141822') : PAL.blueD, line: 3.5, seed: 7003 + i }));
  // gallery + lamp room + dome
  shape(ctx, rrect(x - 104, top - 18, 208, 22, 4), { fill: PAL.ink, line: 0, seed: 7010, off: [0, 0] });
  for (let k = -5; k <= 5; k++) ink(ctx, [[x + k * 19, top - 18], [x + k * 19, top - 52]], 3, { seed: 7011 + k, taper: false });
  ink(ctx, [[x - 100, top - 52], [x + 100, top - 52]], 4, { seed: 7025, taper: false });
  const glass = lampOn > 0 ? (night ? '#FFE9A0' : '#FFF6CF') : '#10131C';
  shape(ctx, rect(x - 58, top - 120, 116, 102), { fill: glass, line: 5, seed: 7030, grain: 0.1 });
  if (lampOn > 0) shape(ctx, ellipse(x, top - 70, 30 * lampOn, 34 * lampOn, 20), { fill: '#FFFDF0', line: 0, grain: 0, off: [0, 0] });
  [-1, 0, 1].forEach((k, i) => ink(ctx, [[x + k * 38, top - 120], [x + k * 38, top - 18]], 3, { seed: 7031 + i, taper: false }));
  shape(ctx, spline([[x - 72, top - 118], [x - 50, top - 160], [x, top - 176], [x + 50, top - 160], [x + 72, top - 118]], true, 6), { fill: night ? '#2B2420' : PAL.ink, line: 4, seed: 7040, grain: 0.2 });
  shape(ctx, ellipse(x, top - 184, 12, 12, 12), { fill: R1, line: 3, seed: 7041 });
  if (o.gusSmall) gus(ctx, t, { x: x - 30, y: top - 20, s: 0.17, face: o.gusFace || 'wow', look: [6, -6] });
  if (dark > 0) { ctx.save(); ctx.globalAlpha = dark; ctx.fillStyle = '#0B0E18'; ctx.fill(new Path2D()); ctx.restore(); }
}
// the beam: a rotating lens throws two cones; seen side-on their length = |cos| of the angle (reads as rotation)
export function beam(ctx, t, k = 1, cx = LH.x, cy = LH.top - 70) {
  if (k <= 0) return;
  const a = t * 1.1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  [[1, Math.cos(a)], [-1, -Math.cos(a)]].forEach(([d, c]) => {
    if (c <= 0) return; const L = 1500 * c * k, wdt = 40 + 90 * (1 - c);
    const g = ctx.createLinearGradient(cx, cy, cx + d * L, cy); g.addColorStop(0, `rgba(255,236,160,${0.5 * k})`); g.addColorStop(1, 'rgba(255,236,160,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx, cy - 18); ctx.lineTo(cx + d * L, cy - wdt); ctx.lineTo(cx + d * L, cy + wdt); ctx.lineTo(cx, cy + 18); ctx.closePath(); ctx.fill();
  });
  const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160 * k); g2.addColorStop(0, `rgba(255,240,190,${0.6 * k})`); g2.addColorStop(1, 'rgba(255,240,190,0)');
  ctx.fillStyle = g2; ctx.fillRect(cx - 200, cy - 200, 400, 400); ctx.restore();
}
// ---------------------------------------------------------------- shared pieces
function seaBand(ctx, t, y0, col, colL, amp = 10, rows = 6, seed = 7100) {
  plane(ctx, rect(-600, y0, 3200, 1400), col, { grain: 0.3 });
  for (let r = 0; r < rows; r++) { const yy = y0 + 18 + r * r * 9 + r * 14, pts = []; for (let x = -200; x <= 2200; x += 40) pts.push([x, yy + Math.sin(x / (70 + r * 12) + twos(t) * (1.4 + r * 0.25) + r) * amp * (1 + r * 0.2)]); ink(ctx, pts, 3 + r * 0.5, { color: colL, seed: seed + r, taper: false, breaks: 0.35 }); }
}
function rocks(ctx, pts, fill, seed, shadeCol) { shape(ctx, spline(pts, true, 6), { fill, line: 5, seed, grain: 0.4, shade: shadeCol ? [{ pts: spline(pts.map(([x, y]) => [x + 30, y + 26]), true, 6), color: shadeCol, alpha: 0.7 }] : undefined }); }
const ROCKS_LH = [[980, 900], [1010, 790], [1100, 740], [1240, 735], [1380, 742], [1470, 800], [1520, 900], [1500, 980], [1000, 990]];
export function rain(ctx, t, n = 260, alpha = 0.5, wind = 0.35) {
  ctx.save(); ctx.strokeStyle = `rgba(200,215,235,${alpha})`; ctx.lineWidth = 2; ctx.beginPath();
  const tt = twos(t, 24);
  for (let i = 0; i < n; i++) { const sp = 1400 + hash(i, 1) * 600, x0 = hash(i, 2) * 2400 - 200, y = ((hash(i, 3) * 1300 + tt * sp) % 1300) - 100, x = x0 - wind * y; const l = 30 + hash(i, 4) * 30; ctx.moveTo(x, y); ctx.lineTo(x - wind * l, y + l); }
  ctx.stroke(); ctx.restore();
}
export function flash(ctx, t, times, W = 1920, H = 1080) {
  for (const f of times) { const k = seg(t, f, f + 0.06) * (1 - seg(t, f + 0.06, f + 0.45)); if (k > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(200,210,255,${0.55 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
}
function bolt(ctx, t, f, x) {
  const k = seg(t, f, f + 0.05) * (1 - seg(t, f + 0.12, f + 0.3)); if (k <= 0) return;
  const pts = [[x, -40]]; for (let i = 1; i < 9; i++) pts.push([x + (hash(f * 10, i) - 0.5) * 120, i * 70]);
  ink(ctx, pts, 7, { color: `rgba(255,255,240,${k})`, seed: Math.floor(f * 10), taper: true });
}
function clouds(ctx, t, col, colD, y, sp, seed, n = 6) {
  for (let i = 0; i < n; i++) { const x = ((hash(seed, i) * 2600 + t * sp) % 2600) - 400, yy = y + hash(seed, i + 9) * 90, s = 0.8 + hash(seed, i + 3) * 0.7;
    shape(ctx, spline([[x - 220 * s, yy + 40], [x - 160 * s, yy - 30], [x - 40 * s, yy - 70], [x + 90 * s, yy - 50], [x + 200 * s, yy - 10], [x + 240 * s, yy + 40]], true, 6), { fill: col, line: 0, seed: seed + i, grain: 0.3, off: [0, 0], shade: colD ? [{ pts: rect(x - 300, yy + 10, 600, 60), color: colD }] : undefined }); }
}
// a ship in the dark: hull silhouette + its lights
function ship(ctx, t, x, y, lit = 1) {
  const roll = Math.sin(t * 1.3) * 0.05;
  ctx.save(); ctx.translate(x, y); ctx.rotate(roll);
  shape(ctx, [[-220, 0], [220, 0], [180, 60], [-190, 60]], { fill: '#0E1220', line: 3, seed: 7200, grain: 0.1, lineColor: '#2C3550' });
  shape(ctx, rect(-80, -70, 160, 70), { fill: '#0E1220', line: 3, seed: 7201, grain: 0.1, lineColor: '#2C3550' });
  ink(ctx, [[0, -70], [0, -190]], 5, { color: '#2C3550', seed: 7202, taper: false });
  ctx.globalCompositeOperation = 'lighter';
  [[-50, -40], [-10, -40], [30, -40], [0, -190], [200, 10]].forEach(([lx, ly], i) => { const c = i === 4 ? '255,90,70' : '255,220,140'; const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 34); g.addColorStop(0, `rgba(${c},${0.9 * lit})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(lx - 40, ly - 40, 80, 80); });
  ctx.restore();
}

// ---------------------------------------------------------------- A · storm night (0–32 s)
// lampK: 1 on, 0 off; darkK: how black the world is (blackout)
export function stormNight(ctx, t, o = {}) {
  const lampK = o.lamp ?? 1, blk = o.black ?? 0;
  plane(ctx, rect(-600, -600, 3200, 1400), NIGHT.sky, { grain: 0.2 });
  plane(ctx, rect(-600, 300, 3200, 400), NIGHT.sky2, { grain: 0.2 });
  clouds(ctx, t, NIGHT.cloudD, null, 20, 24, 71, 7);
  bolt(ctx, t, 0.6, 420); bolt(ctx, t, 4.3, 1650); bolt(ctx, t, 17.0, 700); bolt(ctx, t, 27.8, 300);
  clouds(ctx, t, NIGHT.cloud, NIGHT.cloudD, 110, 46, 72, 6);
  // far island ridge
  shape(ctx, spline([[-200, 720], [100, 650], [420, 640], [700, 690], [900, 720]], false, 6).concat([[900, 760], [-200, 760]]), { fill: '#141A2A', line: 0, seed: 7300, off: [0, 0], grain: 0.2 });
  seaBand(ctx, t, 700, NIGHT.sea, NIGHT.seaL, 14, 7, 7310);
  if (o.ship) ship(ctx, t, o.ship[0], o.ship[1], o.shipLit ?? 1);
  rocks(ctx, ROCKS_LH, NIGHT.rock, 7320, '#1A1A22');
  lighthouse(ctx, t, { night: true, lamp: lampK, gusSmall: o.gusSmall, gusFace: o.gusFace });
  rocks(ctx, [[-100, 1100], [-60, 960], [120, 900], [330, 930], [460, 1000], [520, 1100]], NIGHT.rockL, 7330, '#22222C');
  rocks(ctx, [[1560, 1100], [1620, 950], [1800, 900], [2000, 940], [2050, 1100]], NIGHT.rockL, 7331, '#22222C');
  // spray bursts on the rocks
  for (const f of [3.0, 8.0, 12.8, 19.2, 24.6]) { const k = seg(t, f, f + 0.9); if (k > 0 && k < 1) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.28; shape(ctx, ellipse(1000 + i * 12 + Math.cos(a) * k * 220, 860 + Math.sin(a) * k * 260 + k * k * 160, 22 * (1 - k) + 4, 22 * (1 - k) + 4, 10), { fill: '#DCE6EE', line: 0, grain: 0, off: [0, 0], alpha: 1 - k }); } }
  if (blk > 0) { ctx.save(); ctx.globalAlpha = blk; ctx.fillStyle = '#05070D'; ctx.fillRect(-600, -600, 3200, 2400); ctx.restore(); if (o.ship) { ctx.save(); ctx.globalAlpha = blk; ship(ctx, t, o.ship[0], o.ship[1], 1); ctx.restore(); } }
  beam(ctx, t, lampK);
  rain(ctx, t, 300, 0.45 * (1 - blk * 0.5));
}

// ---------------------------------------------------------------- B · the harbour, morning after (32–62 s)
export const DOCK = 900;                                      // dock plank top
export function harbour(ctx, t, o = {}) {
  plane(ctx, rect(-600, -600, 3200, 1100), DAY.sky, { grain: 0.2 });
  plane(ctx, rect(-600, 380, 3200, 300), DAY.sky2, { grain: 0.2 });
  shape(ctx, ellipse(1500, 220, 80, 80, 30), { fill: '#FBE7A6', line: 0, grain: 0.1, off: [0, 0], alpha: 0.9 });
  clouds(ctx, t, DAY.cloud, '#E6D8BC', 90, 18, 81, 5);
  // distant lighthouse on its point (left), tiny
  ctx.save(); ctx.translate(260, 520); ctx.scale(0.28, 0.28); ctx.translate(-LH.x, -LH.base); lighthouse(ctx, t, { lamp: 0 }); ctx.restore();
  shape(ctx, spline([[-200, 560], [120, 500], [380, 510], [520, 560]], false, 6).concat([[520, 600], [-200, 600]]), { fill: PAL.avocado, line: 4, seed: 7400, grain: 0.3, off: [0, 0] });
  seaBand(ctx, t, 560, DAY.sea, PAL.tealL, 8, 6, 7410);
  // north rocks + the wreck (right)
  rocks(ctx, [[1180, 760], [1240, 600], [1380, 540], [1560, 560], [1720, 620], [1800, 760]], DAY.rock, 7420, DAY.rockD);
  wreck(ctx, t, 1480, 560);
  // the dock (near plane)
  plane(ctx, rect(-600, DOCK, 3200, 400), DAY.dock, { grain: 0.4 });
  for (let x = -40; x < 2000; x += 150) ink(ctx, [[x, DOCK + 4], [x - 30, 1100]], 3, { color: DAY.dockD, seed: 7430 + x, taper: false });
  ink(ctx, [[-600, DOCK], [2600, DOCK]], 6, { seed: 7440, taper: false });
  [[120], [1830]].forEach(([px], i) => { shape(ctx, rrect(px - 26, DOCK - 170, 52, 200, 10), { fill: PAL.brown, line: 4.5, seed: 7450 + i, grain: 0.4 }); ink(ctx, [[px - 30, DOCK - 120], [px + 30, DOCK - 110]], 6, { color: PAL.kraftL, seed: 7455 + i, taper: false }); });
  // barrel (Rollo's hiding place)
  shape(ctx, rrect(1660, DOCK - 150, 120, 150, 26), { fill: PAL.brownL, line: 4.5, seed: 7460, grain: 0.35 });
  [DOCK - 120, DOCK - 40].forEach((y, i) => ink(ctx, [[1662, y], [1778, y]], 6, { color: PAL.chromeD, seed: 7461 + i, taper: false }));
}
function wreck(ctx, t, x, y) {
  const r = 0.32 + Math.sin(t * 0.9) * 0.015;
  ctx.save(); ctx.translate(x, y); ctx.rotate(r);
  shape(ctx, spline([[-170, -20], [170, -30], [150, 50], [40, 80], [-120, 70]], true, 6), { fill: PAL.coral, line: 5, seed: 7470, grain: 0.35, shade: [{ pts: rect(-200, 30, 400, 60), color: PAL.coralD }] });
  shape(ctx, [[-30, 30], [10, 0], [40, 40], [0, 70]], { fill: PAL.ink, line: 0, seed: 7471, off: [0, 0] });            // the hole
  ink(ctx, [[-20, -30], [-10, -150]], 8, { seed: 7472, taper: false, color: PAL.brown });
  ink(ctx, [[-10, -150], [70, -200]], 8, { seed: 7473, taper: false, color: PAL.brown });                                // snapped mast
  shape(ctx, [[-10, -140], [60, -190], [40, -80]], { fill: PAL.white, line: 3.5, seed: 7474, grain: 0.3 });
  ctx.restore();
}
export function harbourCast(ctx, t) {
  // Gus walks on (37.8–40.2), stands; turns to us at 54.6 when the crew arrives
  const w = walk(t, 37.8, 40.2, -120, 560, 130);
  const pointed = t >= 43.2;
  const face = t < 43.2 ? 'neutral' : t < 48.0 ? 'wow' : t < 54.6 ? 'puzzled' : 'happy';
  const look = t < 54.6 ? [14, 0] : [0, 4];
  gus(ctx, t, { walk: w, y: DOCK + 10, s: 0.82, face, look,
    armF: t >= 46.2 && t < 54.6 ? { a1: -0.6, a2: -2.3 } : t >= 56 ? { a1: 0.2, a2: -1.0 } : undefined, handF: t >= 46.2 && t < 54.6 ? { kind: 'open', a: -2.4 } : t >= 56 ? { kind: 'open', a: -1.1 } : undefined });
  // the harbour master: steps forward and points (anticipation: wind-up back at 43.0)
  const ant = seg(t, 42.9, 43.25), jab = seg(t, 43.25, 43.45);
  const mw = walk(t, 38.6, 40.6, 2150, 1180, 130), hx = mw.x - 30 * Math.sin(ant * Math.PI) * (1 - jab) - 50 * eio(jab);
  if (t < 54.6) drawMaster(ctx, hx, DOCK + 10 + mw.bob * 0.6, 0.86, t, { flip: true, point: pointed ? 1 : ss(seg(t, 42.9, 43.3)), face: t >= 42.8 ? 'angry' : 'neutral', look: [-6, 0], shout: t >= 43.4 && t < 48.2 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 9)) : 0 });
  else { const k = eio(seg(t, 54.6, 55.6)); if (k < 1) drawMaster(ctx, lerp(1180, 2200, k), DOCK + 10, 0.86, t, { flip: false, face: 'angry' }); }
  // crew arrives (54.6–62)
  if (t >= 54.8) { const k = seg(t, 54.8, 56.0), px = lerp(2000, 1830, eio(k)), py = lerp(380, DOCK - 170, eio(k)); pip(ctx, t, { x: px, y: py, s: 0.62, fly: k < 1, flapRate: 5, flip: true, look: [-1, 0] }); }
  if (t >= 56.2) { const w2 = walk(t, 56.3, 57.9, 2100, 1060, 110); mabel(ctx, t, { x: w2.x, y: DOCK + 10, bob: w2.bob * 0.5, s: 0.55, look: [-3, 0], flip: false }); }
  if (t >= 58.0) { const h = hop(t, 58.2, 0.6, 1720, DOCK - 150, 1440, DOCK + 10, 160); rollo(ctx, t, { x: h.x, y: h.y, s: 0.62, squash: h.squash, look: [-3, 0] }); }
  else shape(ctx, ellipse(1720, DOCK - 150, 56, 12, 20), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
}

// ---------------------------------------------------------------- H · noon, the next day (292–312 s)
export function noon(ctx, t, o = {}) {
  plane(ctx, rect(-600, -600, 3200, 1400), '#9CCFE0', { grain: 0.2 });
  plane(ctx, rect(-600, 420, 3200, 300), '#CFE6E6', { grain: 0.2 });
  const sx = 520, sy = 150; rays(ctx, sx, sy, 16, 260, '#FFF1B8', { rot: t * 0.1, alpha: 0.5, r0: 70 }); shape(ctx, ellipse(sx, sy, 66, 66, 30), { fill: '#FFE37A', line: 4, seed: 7600, grain: 0.1 });
  clouds(ctx, t, DAY.cloud, '#E6D8BC', 80, 14, 91, 4);
  seaBand(ctx, t, 700, DAY.sea, PAL.tealL, 8, 7, 7610);
  rocks(ctx, ROCKS_LH, DAY.rock, 7620, DAY.rockD);
  // shadows at noon: short, straight down-right (every solid thing has one... except the Stranger)
  ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#2B2420'; ctx.beginPath(); ctx.ellipse(LH.x + 40, LH.base + 8, 150, 22, 0, 0, TAU); ctx.fill(); ctx.restore();
  const k = o.lamp ?? 1;
  lighthouse(ctx, t, { lamp: k });
  if (o.pulse) { const p = seg(t, o.pulse, o.pulse + 1.2); if (p > 0 && p < 1) { ctx.save(); ctx.globalAlpha = (1 - p) * 0.7; ink(ctx, ellipse(LH.x, LH.top - 70, 60 + p * 500, 60 + p * 500, 60), 10 * (1 - p) + 2, { closed: true, color: '#0B0E18', seed: 7630, taper: false }); ctx.restore(); } }
  if (o.stranger) {                                            // foreground rocks + the Stranger, back to us, facing the lighthouse
    rocks(ctx, [[-100, 1120], [-40, 930], [200, 860], [520, 880], [700, 960], [760, 1120]], DAY.rock, 7640, DAY.rockD);
    ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#2B2420'; ctx.beginPath(); ctx.ellipse(610, 935, 70, 12, 0, 0, TAU); ctx.fill(); ctx.restore();   // a rock's shadow (contrast)
    drawStranger(ctx, 330, 905, 0.95 * o.stranger, t);
  }
}
