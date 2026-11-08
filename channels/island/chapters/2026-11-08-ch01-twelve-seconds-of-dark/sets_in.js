// Interior sets for Chapter 1: the lamp room (day / night / blackout), the stair cutaway, the cellar door, the sea tunnel.
import { PAL, shape, plane, ink, rays, ellipse, rect, rrect, spline, sparkle, star, text, clamp, lerp, seg, ss, eio, back, twos, TAU, hash } from './engine/toon.js';
import { gus, pip, mabel, rollo, walk, hop, drawStranger, lantern } from './cast2.js';
import { drawPip, pawPrint } from './suspects.js';

export const FL = 900;                                         // lamp-room floor line
export const CLOCK = { x: 250, face: 300 }, LAMP = { x: 960, y: 330 }, WIN = { x: 1520, y: 400, w: 240, h: 330 }, HATCH = { x0: 520, x1: 720 }, JBOX = { x: 1340, y: 640 };
const C = { wall: '#F2E3C4', wallD: '#E6D2AC', floor: PAL.brownL, floorD: PAL.brown, step: PAL.mustard, stepD: PAL.mustardD };

// ---------------------------------------------------------------- the clock (pendulum + hands)
// slowK: pendulum bob position (0 = right place, 1 = moved down = runs slow); hands show hh:mm:ss
export function clock(ctx, t, o = {}) {
  const { x, face } = CLOCK;
  shape(ctx, rrect(x - 90, face - 120, 180, FL - face + 120, 18), { fill: PAL.brown, line: 5, seed: 8000, grain: 0.35, shade: [{ pts: rect(x + 40, face - 120, 60, 900), color: '#5E3A24' }] });
  shape(ctx, ellipse(x, face, 76, 76, 40), { fill: PAL.white, line: 5, seed: 8001, grain: 0.15 });
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; ink(ctx, [[x + Math.cos(a) * 60, face + Math.sin(a) * 60], [x + Math.cos(a) * 68, face + Math.sin(a) * 68]], i % 3 ? 3 : 6, { seed: 8002 + i, taper: false }); }
  const [hh, mm, sc] = o.time || [3, 11, 0];
  const am = (mm + sc / 60) / 60 * TAU - Math.PI / 2, ah = ((hh % 12) + mm / 60) / 12 * TAU - Math.PI / 2, as = sc / 60 * TAU - Math.PI / 2;
  ink(ctx, [[x, face], [x + Math.cos(ah) * 38, face + Math.sin(ah) * 38]], 8, { seed: 8020, taper: false });
  ink(ctx, [[x, face], [x + Math.cos(am) * 56, face + Math.sin(am) * 56]], 5, { seed: 8021, taper: false });
  ink(ctx, [[x, face], [x + Math.cos(as) * 62, face + Math.sin(as) * 62]], 2.5, { seed: 8022, taper: false, color: PAL.coral });
  shape(ctx, ellipse(x, face, 7, 7, 10), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  // glass door with the pendulum
  shape(ctx, rrect(x - 56, face + 110, 112, 380, 14), { fill: '#3B2618', line: 4, seed: 8030, grain: 0.2 });
  const sw = Math.sin(t * Math.PI * (1 - (o.slow ?? 0) * 0.05)) * 0.22, L = 230 + (o.slow ?? 0) * 70;
  const bx = x + Math.sin(sw) * L, by = face + 130 + Math.cos(sw) * L;
  ink(ctx, [[x, face + 130], [bx, by]], 4, { color: PAL.chrome, seed: 8031, taper: false });
  shape(ctx, ellipse(bx, by, 26, 26, 20), { fill: PAL.mustard, line: 4, seed: 8032, grain: 0.1 });
  if (o.mark) { const k = o.mark; ctx.save(); ctx.globalAlpha = k; ink(ctx, [[x - 40, face + 360], [x + 40, face + 360]], 4, { color: PAL.coral, seed: 8033, taper: false }); text(ctx, 'WAS', x + 48, face + 368, { font: '600 26px Jost', fill: PAL.coral }); ctx.restore(); }
}
// ---------------------------------------------------------------- the big lens
export function lamp(ctx, t, on = 1, night = false) {
  const { x, y } = LAMP;
  shape(ctx, rrect(x - 110, y + 230, 220, FL - y - 230, 14), { fill: PAL.plum, line: 5, seed: 8100, grain: 0.3, shade: [{ pts: rect(x + 50, y + 230, 70, 600), color: '#563A54' }] });
  shape(ctx, rrect(x - 150, y + 210, 300, 34, 8), { fill: PAL.ink, line: 0, seed: 8101, off: [0, 0] });
  if (on > 0 && night) rays(ctx, x, y, 22, 900, '#FFE9A0', { rot: twos(t) * 0.25, alpha: 0.09 * on, r0: 150 });
  const lens = spline([[x - 140, y + 30], [x - 120, y - 120], [x, y - 170], [x + 120, y - 120], [x + 140, y + 30], [x + 100, y + 200], [x - 100, y + 200]], true, 8);
  shape(ctx, lens, { fill: on > 0 ? '#FFF3B0' : '#2A3040', line: 5, seed: 8105, grain: 0.15 });
  for (let k = 0; k < 6; k++) ink(ctx, ellipse(x, y + 10, 30 + k * 22, 26 + k * 28, 30, Math.PI * 1.05, Math.PI * 1.95), 3, { color: on > 0 ? PAL.mustardD : '#454C60', seed: 8110 + k, taper: true });
  for (let k = 0; k < 6; k++) ink(ctx, ellipse(x, y + 10, 30 + k * 22, 26 + k * 28, 30, Math.PI * 0.05, Math.PI * 0.95), 3, { color: on > 0 ? PAL.mustardD : '#454C60', seed: 8120 + k, taper: true });
  if (on > 0) { sparkle(ctx, x - 60, y - 80, 26, { fill: PAL.white }); if (night) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 20, x, y, 700); g.addColorStop(0, `rgba(255,220,140,${0.55 * on})`); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - 800, y - 800, 1600, 1600); ctx.restore(); } }
  shape(ctx, rrect(x - 160, y - 210, 320, 40, 12), { fill: PAL.ink, line: 0, seed: 8130, off: [0, 0] });
}
// ---------------------------------------------------------------- cables: 3 from the lamp base to a junction box; #2 cut
export function cables(ctx, t, o = {}) {
  const cut = o.cut ?? 0, spark = o.spark ?? 0;
  shape(ctx, rrect(JBOX.x - 50, JBOX.y - 60, 100, 120, 10), { fill: PAL.chromeD, line: 4.5, seed: 8200, grain: 0.3 });
  text(ctx, '⚡', JBOX.x, JBOX.y + 14, { font: '44px Jost', fill: PAL.mustard, align: 'center' });
  const cols = [PAL.ink, '#3A3A46', PAL.ink];
  for (let i = 0; i < 3; i++) {
    const y0 = FL - 14 - i * 10, pts = spline([[LAMP.x + 110, y0], [1110, FL - 6 - i * 8], [1240, FL - 4 - i * 6], [JBOX.x - 30 + i * 30, FL - 30], [JBOX.x - 30 + i * 30, JBOX.y + 60]], false, 8);
    if (i === 1 && cut > 0) {                                     // cut through near x≈1170; the two ends spring apart
      const a = pts.filter(p => p[0] < 1160), b = pts.filter(p => p[0] > 1190);
      const da = [-22 * cut, -34 * cut], db = [26 * cut, -26 * cut];
      ink(ctx, a.map(([x, y]) => [x + da[0] * (x - LAMP.x) / 200, y + da[1] * Math.max(0, (x - 1050) / 110)]), 9, { color: cols[i], seed: 8210, taper: false, wob: 0.05 });
      ink(ctx, b.map(([x, y]) => [x + db[0] * Math.max(0, (1300 - x) / 110), y + db[1] * Math.max(0, (1300 - x) / 110)]), 9, { color: cols[i], seed: 8211, taper: false, wob: 0.05 });
      const ea = a[a.length - 1], eb = b[0];
      [[ea[0] + da[0], ea[1] + da[1]], [eb[0] + db[0], eb[1] + db[1]]].forEach(([x, y], j) => { shape(ctx, ellipse(x, y, 9, 9, 10), { fill: '#D9824A', line: 2.5, seed: 8212 + j, grain: 0 }); for (let w = 0; w < 4; w++) ink(ctx, [[x, y], [x + (j ? 1 : -1) * (6 + w * 3) * -1, y - 10 + w * 6]], 2, { color: '#D9824A', seed: 8216 + w + j * 4, taper: true });
        if (spark > 0 && Math.floor(t * 12) % 3 !== j) for (let s = 0; s < 4; s++) sparkle(ctx, x + (hash(Math.floor(t * 12), s, j) - 0.5) * 60, y - hash(Math.floor(t * 12), s + 5, j) * 40, 10 + 8 * hash(s, j), { fill: PAL.mustardL, alpha: spark }); });
      if (o.smudge) { const k = o.smudge; shape(ctx, ellipse(eb[0] + db[0] + 14, eb[1] + db[1] - 2, 14 * k, 8 * k, 12), { fill: PAL.mustard, line: 0, seed: 8215, off: [0, 0], grain: 0.2 }); }
    } else ink(ctx, pts, 9, { color: cols[i], seed: 8210 + i * 3, taper: false, wob: 0.05 });
  }
}
// ---------------------------------------------------------------- swim-fin print (the riddle 1 clue): long paddle, ribbed web, straight back edge
export function finPrint(ctx, x, y, s = 1, a = 0, alpha = 1, wet = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  const P = [[-34, 0], [-30, -10], [40, -16], [96, -26], [104, 0], [96, 26], [40, 16], [-30, 10]];
  shape(ctx, P, { fill: wet ? '#6E8FA6' : '#8C7A62', line: 0, seed: 8300, grain: 0.3, off: [0, 0], alpha: 0.85 });
  for (let k = 0; k < 4; k++) ink(ctx, [[30 + k * 4, -12 + k * 8], [98, -20 + k * 13]], 2.4, { color: '#4C6A80', seed: 8301 + k, taper: true });
  ink(ctx, [[-34, -10], [-34, 10]], 4, { color: '#4C6A80', seed: 8306, taper: false });
  if (wet) sparkle(ctx, 60, -6, 8, { fill: PAL.white, alpha: 0.8 });
  ctx.restore();
}
export const PRINTS = Array.from({ length: 9 }, (_, i) => ({ x: 1440 - i * 128, y: FL + 40 + (i % 2) * 34, a: Math.PI + (i % 2 ? 0.06 : -0.06) }));
// ---------------------------------------------------------------- windows (sea window right, small land window left)
function windowSea(ctx, t, night, o = {}) {
  const { x, y, w, h } = WIN, x0 = x - w / 2, y0 = y - h / 2;
  shape(ctx, rrect(x0 - 18, y0 - 18, w + 36, h + 36, 12), { fill: PAL.white, line: 5, seed: 8400, grain: 0.2 });
  plane(ctx, rect(x0, y0, w, h * 0.55), night ? '#1B2338' : '#9CCFE0', { grain: 0.2 });
  plane(ctx, rect(x0, y0 + h * 0.55, w, h * 0.45), night ? '#1E3A4A' : PAL.teal, { grain: 0.2 });
  for (let r = 0; r < 3; r++) { const pts = []; for (let xx = x0; xx <= x0 + w; xx += 20) pts.push([xx, y0 + h * 0.62 + r * 36 + Math.sin(xx / 30 + twos(t) * 2 + r) * 5]); ink(ctx, pts, 3.5, { color: night ? '#2F5566' : PAL.tealL, seed: 8401 + r, taper: false }); }
  if (night) { ctx.save(); ctx.strokeStyle = 'rgba(200,215,235,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 26; i++) { const yy = y0 + ((hash(i, 1) * h + twos(t, 24) * 900) % h), xx = x0 + hash(i, 2) * w; ctx.moveTo(xx, yy); ctx.lineTo(xx - 8, yy + 24); } ctx.stroke(); ctx.restore(); }
  ink(ctx, [[x, y0], [x, y0 + h]], 5, { seed: 8405, taper: false }); ink(ctx, [[x0, y], [x0 + w, y]], 5, { seed: 8406, taper: false });
  shape(ctx, rrect(x0 - 40, y0 + h + 10, w + 80, 26, 6), { fill: PAL.white, line: 4.5, seed: 8407, grain: 0.2 });           // sill
  if (o.web) web(ctx, x0 + 10, y0 + 10, w - 20, h - 20, o.web, t);
}
export function web(ctx, x, y, w, h, k = 1, t = 0) {
  const cx = x + w * 0.55, cy = y + h * 0.42, spokes = 10, R = Math.max(w, h) * 0.72;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalAlpha = k;
  ctx.strokeStyle = 'rgba(250,250,255,0.85)'; ctx.lineWidth = 2;
  for (let i = 0; i < spokes; i++) { const a = i * TAU / spokes + 0.2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
  for (let r = 18; r < R; r += 22) { ctx.beginPath(); for (let i = 0; i <= spokes; i++) { const a = i * TAU / spokes + 0.2, rr = r * (1 + Math.sin(i * 1.7 + r) * 0.04) + Math.sin(t * 2 + r) * 1.5; const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
  // the spider, small and smug
  shape(ctx, ellipse(cx, cy - 4 + Math.sin(t * 1.5) * 3, 10, 12, 10), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
  ctx.restore();
}
// ---------------------------------------------------------------- room shell
export function lampRoom(ctx, t, o = {}) {
  const night = o.night, on = o.lamp ?? 1;
  plane(ctx, rect(-600, -1200, 3200, FL + 1200), night ? '#3A4560' : C.wall, { grain: 0.25 });
  for (let x = -300; x < 2300; x += 160) ink(ctx, [[x, -300], [x, FL]], 3, { color: night ? '#323C55' : C.wallD, seed: 8500 + x, taper: false, breaks: 0.3 });
  plane(ctx, rect(-600, 60, 3200, 26), night ? '#2B3348' : PAL.kraft, { grain: 0.3 });
  windowSea(ctx, t, night, { web: o.web });
  // small round porthole left of the lamp
  shape(ctx, ellipse(640, 300, 70, 70, 30), { fill: PAL.white, line: 5, seed: 8510, grain: 0.2 }); plane(ctx, ellipse(640, 300, 52, 52, 30), night ? '#1B2338' : '#9CCFE0', { grain: 0.2 });
  clock(ctx, t, { time: o.time, slow: o.slow, mark: o.mark });
  // floor + stair hatch (yellow top step from EP02's painted stairs)
  plane(ctx, rect(-600, FL, 3200, 1400), night ? '#4A3A33' : C.floor, { grain: 0.35 });
  for (let y = FL + 50; y < 2200; y += 60) ink(ctx, [[-600, y], [2600, y]], 3, { color: night ? '#3A2C26' : C.floorD, seed: 8520 + y, taper: false, breaks: 0.4 });
  shape(ctx, [[HATCH.x0, FL + 2], [HATCH.x1, FL + 2], [HATCH.x1 + 40, FL + 130], [HATCH.x0 - 40, FL + 130]], { fill: '#2B2018', line: 4.5, seed: 8530, grain: 0.2 });
  shape(ctx, rect(HATCH.x0 - 10, FL + 40, HATCH.x1 - HATCH.x0 + 20, 34), { fill: C.step, line: 4, seed: 8531, grain: 0.3 });
  shape(ctx, rect(HATCH.x0 - 26, FL + 92, HATCH.x1 - HATCH.x0 + 52, 34), { fill: C.stepD, line: 4, seed: 8532, grain: 0.3 });
  [HATCH.x0 - 10, (HATCH.x0 + HATCH.x1) / 2, HATCH.x1 + 10].forEach((px, i) => shape(ctx, rrect(px - 7, FL - 150, 14, 152, 5), { fill: PAL.brown, line: 3.5, seed: 8533 + i, grain: 0.3 })); shape(ctx, rrect(HATCH.x0 - 22, FL - 160, HATCH.x1 - HATCH.x0 + 44, 20, 8), { fill: PAL.brownL, line: 4, seed: 8537, grain: 0.3 });
  if (o.yellowPrints) for (let i = 0; i < 3; i++) { const k = clamp(o.yellowPrints * 3 - i); if (k > 0) pawPrint(ctx, HATCH.x0 + 40 + i * 60, FL + 56 + (i % 2) * 40, 2.2 * k, 0.4); }
  ink(ctx, [[-600, FL], [2600, FL]], 6, { seed: 8540, taper: false });
  cables(ctx, t, { cut: o.cut, spark: o.spark, smudge: o.smudge });
  lamp(ctx, t, on, night);
  if (o.prints) PRINTS.forEach((p, i) => { const k = clamp(o.prints * 9 - i); if (k > 0) finPrint(ctx, p.x, p.y, 0.9 * Math.min(1, k * 1.3), p.a, Math.min(1, k * 2)); });
  // drips from the window sill down to the first print
  if (o.prints) for (let i = 0; i < 4; i++) shape(ctx, ellipse(WIN.x - 60 + i * 12, WIN.y + WIN.h / 2 + 60 + i * 70, 5, 8, 8), { fill: '#6E8FA6', line: 0, grain: 0, off: [0, 0], alpha: o.prints });
}
// a picnic basket + plate of stake-out sandwiches (n left 0..6)
export function basket(ctx, x, y, n) {
  shape(ctx, rrect(x - 90, y - 70, 180, 70, 12), { fill: PAL.kraft, line: 4.5, seed: 8600, grain: 0.4 });
  for (let k = 0; k < 4; k++) ink(ctx, [[x - 80, y - 60 + k * 16], [x + 80, y - 60 + k * 16]], 2.5, { color: PAL.kraftD, seed: 8601 + k, taper: false });
  ink(ctx, spline([[x - 70, y - 70], [x, y - 150], [x + 70, y - 70]], false, 6), 7, { color: PAL.kraftD, seed: 8606, taper: false });
  for (let i = 0; i < n; i++) { const sx = x - 60 + (i % 3) * 60, sy = y - 78 - Math.floor(i / 3) * 22; shape(ctx, [[sx - 26, sy + 10], [sx + 26, sy + 10], [sx, sy - 22]], { fill: PAL.kraftL, line: 3, seed: 8610 + i, grain: 0.2, shade: [{ pts: rect(sx - 30, sy + 2, 60, 6), color: PAL.avocado }] }); }
}

// ---------------------------------------------------------------- flashback panel: a diver climbs in the sea window in the storm (riddle 1 answer)
export function diverFlashback(ctx, t, t0, x, y, w, h) {
  const k = eio(seg(t, t0, t0 + 0.35)); if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.03); ctx.scale(k, k);
  shape(ctx, rect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28), { fill: PAL.white, line: 5, seed: 8700, grain: 0.2, off: [8, 8] });
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip();
  plane(ctx, rect(-w / 2, -h / 2, w, h), '#22304A', { grain: 0.3 });
  ctx.strokeStyle = 'rgba(200,215,235,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 40; i++) { const yy = -h / 2 + ((hash(i, 1) * h + twos(t, 24) * 900) % h), xx = -w / 2 + hash(i, 2) * w; ctx.moveTo(xx, yy); ctx.lineTo(xx - 8, yy + 26); } ctx.stroke();
  shape(ctx, rect(-w * 0.28, -h * 0.42, w * 0.56, h * 0.6), { fill: '#C9C2B4', line: 5, seed: 8701, grain: 0.2 });                 // the window frame from outside
  plane(ctx, rect(-w * 0.24, -h * 0.38, w * 0.48, h * 0.52), '#F6D77A', { grain: 0.1 });
  // the diver: silhouette climbing over the sill (rises, one fin over)
  const c = eio(seg(t, t0 + 0.4, t0 + 2.4)), dy = lerp(h * 0.5, h * 0.05, c);
  ctx.save(); ctx.translate(0, dy);
  const D = '#0E1220';
  shape(ctx, ellipse(-10, -150, 42, 46, 20), { fill: D, line: 0, seed: 8702, off: [0, 0] });
  shape(ctx, rrect(-40, -168, 70, 26, 10), { fill: '#6E8FA6', line: 3, seed: 8703, grain: 0 });                                 // mask glint
  shape(ctx, spline([[-60, -110], [40, -110], [60, 40], [-70, 40]], true, 6), { fill: D, line: 0, seed: 8704, off: [0, 0] });
  ink(ctx, spline([[40, -90], [110, -150], [150, -170]], false, 5), 26, { color: D, seed: 8705, taper: false });                // arm over the sill
  ink(ctx, spline([[30, 30], [110, -10], [160, -60]], false, 5), 26, { color: D, seed: 8706, taper: false });
  shape(ctx, [[150, -60], [250, -110], [262, -84], [170, -40]], { fill: '#4C6A80', line: 3, seed: 8707, grain: 0.2 });          // a fin
  ctx.restore();
  ctx.restore();
  text(ctx, 'THAT NIGHT · 3:11 AM', 0, h / 2 + 4, { font: '600 26px Jost', fill: PAL.ink, align: 'center', track: 3 });
  ctx.restore();
}

// ---------------------------------------------------------------- the stair cutaway (207–222 s): a tall section through the tower, the camera follows the crew down
export const STAIR = { top: 0, bottom: 2600 };
export function stairCutaway(ctx, t, o = {}) {
  plane(ctx, rect(-600, -600, 3200, 3800), '#3B2E2A', { grain: 0.3 });
  // tower walls (thick, curved stone section)
  shape(ctx, [[360, -200], [520, -200], [470, 2800], [260, 2800]], { fill: '#C9C2B4', line: 5, seed: 8800, grain: 0.35 });
  shape(ctx, [[1400, -200], [1560, -200], [1660, 2800], [1450, 2800]], { fill: '#C9C2B4', line: 5, seed: 8801, grain: 0.35 });
  plane(ctx, [[520, -200], [1400, -200], [1450, 2800], [470, 2800]], '#F2E3C4', { grain: 0.25 });
  // floors: lamp room (y 300), kitchen (y 1250), store (y 2000), cellar (y 2600)
  [[300, 'LAMP ROOM'], [1250, 'KITCHEN'], [2000, 'STORE'], [2600, '']].forEach(([y, l], i) => { plane(ctx, rect(480, y, 960, 40), PAL.brown, { grain: 0.35 }); ink(ctx, [[480, y], [1440, y]], 5, { seed: 8810 + i, taper: false }); if (l) text(ctx, l, 1380, y - 20, { font: '600 26px Jost', fill: PAL.inkSoft, align: 'right', track: 3 }); });
  // zigzag stairs between floors: flights alternate direction
  const FLIGHTS = [[300, 1250, 600, 1300], [1250, 2000, 1300, 620], [2000, 2600, 620, 1260]];
  FLIGHTS.forEach(([y0, y1, x0, x1], f) => { const n = 9; for (let i = 0; i < n; i++) { const u = i / n, x = lerp(x0, x1, u), y = lerp(y0 + 40, y1, (i + 1) / n), w = (x1 - x0) / n;
    shape(ctx, rect(Math.min(x, x + w), y - 6, Math.abs(w) + 2, 22), { fill: PAL.mustard, line: 3.5, seed: 8820 + f * 20 + i, grain: 0.3 });
    if (o.prints != null) { const id = f * n + i, k = clamp(o.prints * 27 - id); if (k > 0) pawPrint(ctx, x + w * 0.5, y + 2, 1.6 * k, x1 > x0 ? 0.3 : -0.3); } } });
  // kitchen: table + the EP02 plate (crumbs) as a wink
  shape(ctx, rrect(980, 1110, 260, 26, 8), { fill: PAL.coral, line: 4.5, seed: 8860, grain: 0.3 }); [[1000], [1210]].forEach(([x], i) => shape(ctx, rect(x, 1136, 16, 114), { fill: PAL.brown, line: 3.5, seed: 8861 + i }));
  shape(ctx, ellipse(1110, 1104, 70, 13, 24), { fill: PAL.white, line: 4, seed: 8863, grain: 0.1 });
  // store: crates + nets
  [[700, 1880], [820, 1900]].forEach(([x, y], i) => { shape(ctx, rect(x, y, 110, 120), { fill: PAL.kraft, line: 4, seed: 8870 + i, grain: 0.35 }); ink(ctx, [[x, y], [x + 110, y + 120]], 3, { color: PAL.kraftD, seed: 8872 + i, taper: false }); });
  // cellar door at the bottom (round, iron)
  shape(ctx, ellipse(960, 2470, 110, 120, 40), { fill: '#4A4E5C', line: 5, seed: 8880, grain: 0.35 });
  for (let k = 0; k < 6; k++) { const a = k * TAU / 6; shape(ctx, ellipse(960 + Math.cos(a) * 90, 2470 + Math.sin(a) * 100, 8, 8, 8), { fill: PAL.chrome, line: 2, seed: 8881 + k, grain: 0 }); }
}

// ---------------------------------------------------------------- the cellar door (222–270 s)
// symbols, left→right as carved: sun, wave, net, moon. Answer order: net, moon, sun, wave.
export const STONES = ['sun', 'wave', 'net', 'moon'];
export const DOOR = { x: 960, y: 470, r: 290 };
export function stoneIcon(ctx, kind, x, y, r, col = PAL.ink) {
  ctx.save(); ctx.translate(x, y);
  if (kind === 'sun') { for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ink(ctx, [[Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55], [Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85]], 5, { color: col, seed: 8900 + i, taper: false }); } ink(ctx, ellipse(0, 0, r * 0.36, r * 0.36, 20), 5, { closed: true, color: col, seed: 8910 }); }
  if (kind === 'moon') ink(ctx, ellipse(0, 0, r * 0.6, r * 0.6, 24, -1.1, 4.2).concat(ellipse(r * 0.28, -r * 0.1, r * 0.48, r * 0.48, 24, 3.9, -0.8)), 5, { color: col, seed: 8911, taper: false });
  if (kind === 'wave') for (let k = 0; k < 2; k++) { const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([(u - 0.5) * r * 1.5, k * r * 0.4 - r * 0.2 + Math.sin(u * TAU * 1.5) * r * 0.15]); } ink(ctx, pts, 5, { color: col, seed: 8912 + k, taper: false }); }
  if (kind === 'net') { for (let i = -2; i <= 2; i++) { ink(ctx, [[i * r * 0.25 - r * 0.2, -r * 0.6], [i * r * 0.25 + r * 0.2, r * 0.6]], 3.5, { color: col, seed: 8915 + i, taper: false }); ink(ctx, [[i * r * 0.25 + r * 0.2, -r * 0.6], [i * r * 0.25 - r * 0.2, r * 0.6]], 3.5, { color: col, seed: 8920 + i, taper: false }); } }
  ctx.restore();
}
export function cellar(ctx, t, o = {}) {
  plane(ctx, rect(-600, -1200, 3200, 2600), '#5E5A58', { grain: 0.4 });
  for (let r = -8; r < 0; r++) for (let c = -1; c < 14; c++) { const x = c * 160 + ((r + 8) % 2) * 80, y = r * 90 - 40; shape(ctx, rrect(x + 4, y + 4, 152, 82, 12), { fill: (r + c + 8) % 3 ? '#6E6A66' : '#67635F', line: 3, seed: 9500 + (r + 8) * 20 + c, grain: 0.4, lineColor: '#3A3634', breaks: 0.3 }); }
  for (let r = 0; r < 12; r++) for (let c = -1; c < 14; c++) { const x = c * 160 + (r % 2) * 80, y = r * 90 - 40; shape(ctx, rrect(x + 4, y + 4, 152, 82, 12), { fill: (r + c) % 3 ? '#6E6A66' : '#67635F', line: 3, seed: 9000 + r * 20 + c, grain: 0.4, lineColor: '#3A3634', breaks: 0.3 }); }
  plane(ctx, rect(-600, 900, 3200, 1400), '#3E3A38', { grain: 0.4 }); ink(ctx, [[-600, 900], [2600, 900]], 6, { seed: 9300, taper: false });
  const open = o.open ?? 0, { x, y, r } = DOOR;
  shape(ctx, ellipse(x, y, r + 40, r + 40, 60), { fill: '#3A3634', line: 5, seed: 9301, grain: 0.3 });
  // tunnel behind (visible as the door swings): dark, a far glint of sea
  plane(ctx, ellipse(x, y, r, r, 60), '#0E1018', { grain: 0.2 });
  if (open > 0) { shape(ctx, ellipse(x, y + 60, 70 * open, 40 * open, 30), { fill: '#2F5566', line: 0, grain: 0.2, off: [0, 0] }); sparkle(ctx, x + 20, y + 54, 14 * open, { fill: PAL.white, alpha: open }); }
  // the door: swings on its left hinge (flat-cartoon swing = horizontal squash toward the hinge)
  const sx = 1 - open * 0.92;
  ctx.save(); ctx.translate(x - r, y); ctx.scale(sx, 1); ctx.translate(-(x - r), -y);
  shape(ctx, ellipse(x, y, r, r, 60), { fill: '#4A4E5C', line: 6, seed: 9302, grain: 0.35, shade: [{ pts: ellipse(x + 60, y + 40, r * 0.8, r * 0.9, 40), color: '#3C404C', alpha: 0.6 }] });
  for (let k = 0; k < 12; k++) { const a = k * TAU / 12; shape(ctx, ellipse(x + Math.cos(a) * (r - 30), y + Math.sin(a) * (r - 30), 11, 11, 10), { fill: PAL.chrome, line: 2.5, seed: 9310 + k, grain: 0 }); }
  // the lock plate with four stones
  shape(ctx, rrect(x - 250, y - 70, 500, 140, 20), { fill: '#8E8A84', line: 5, seed: 9330, grain: 0.35 });
  STONES.forEach((s, i) => {
    const sx2 = x - 180 + i * 120, pressed = o.pressed?.[s] ?? 0, glow = o.glow?.[s] ?? 0;
    shape(ctx, ellipse(sx2, y + pressed * 6, 50, 50, 30), { fill: glow > 0 ? PAL.mustardL : '#B9B3A8', line: 4.5, seed: 9340 + i, grain: 0.35 });
    stoneIcon(ctx, s, sx2, y + pressed * 6, 44, PAL.ink);
    const n = o.num?.[s]; if (n) { const k = back(seg(t, n[1], n[1] + 0.25), 2); ctx.save(); ctx.translate(sx2 + 40, y - 52); ctx.scale(k, k); shape(ctx, ellipse(0, 0, 26, 26, 20), { fill: PAL.coral, line: 4, seed: 9350 + i, grain: 0.1 }); text(ctx, String(n[0]), 0, 14, { font: '40px Slab', fill: PAL.white, align: 'center' }); ctx.restore(); }
  });
  ctx.restore();
  // the carving above the door
  shape(ctx, rrect(x - 420, 80, 840, 70, 10), { fill: '#77726C', line: 4, seed: 9360, grain: 0.4 });
  text(ctx, "TELL THE SHADOW'S STORY · FIRST TO LAST", x, 128, { font: '34px Slab', fill: '#2E2A28', align: 'center', track: 2, maxW: 800 });
}

// ---------------------------------------------------------------- the sea tunnel (270–292 s): lantern light, two print trails, shadows on the wall
export function tunnel(ctx, t, o = {}) {
  plane(ctx, rect(-600, -600, 4000, 2000), '#2A2826', { grain: 0.4 });
  // wall (where the shadows fall) as a lighter band, rough top edge
  plane(ctx, [[-600, 160], [3400, 220], [3400, 820], [-600, 760]], '#6E6258', { grain: 0.45 });
  for (let k = 0; k < 18; k++) { const x = k * 200 - 300; ink(ctx, spline([[x, 200 + k * 3], [x + 40, 420], [x - 20, 700 + k * 3]], false, 5), 3, { color: '#5A5048', seed: 9400 + k, taper: true, breaks: 0.4 }); }
  // wet sand floor sloping down to the sea at the far right
  plane(ctx, [[-600, 760], [3400, 820], [3400, 1400], [-600, 1400]], '#B59C78', { grain: 0.4 });
  plane(ctx, [[2700, 810], [3400, 820], [3400, 1400], [2500, 1400]], '#2F5566', { grain: 0.3 });
  for (let r = 0; r < 3; r++) { const pts = []; for (let y = 820; y < 1400; y += 30) pts.push([2600 - (y - 820) * 0.35 + Math.sin(y / 40 + twos(t) * 2 + r) * 14 + r * 40, y]); ink(ctx, pts, 4, { color: PAL.tealL, seed: 9420 + r, taper: false }); }
  // two print trails toward the sea: fins (left track) and boots (right track)
  for (let i = 0; i < 16; i++) { const x = 200 + i * 160, kf = clamp((o.prints ?? 0) * 16 - i);
    if (kf > 0) { finPrint(ctx, x, 900 + (i % 2) * 24, 0.7, 0.02, kf, 0); boot(ctx, x + 60, 1010 + (i % 2) * 24, 0.8, kf); } }
}
function boot(ctx, x, y, s, a) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; shape(ctx, spline([[-30, -12], [20, -14], [36, 0], [20, 14], [-30, 12]], true, 5), { fill: '#7E6A4E', line: 0, seed: 9440, grain: 0.3, off: [0, 0] }); for (let k = 0; k < 3; k++) ink(ctx, [[-22 + k * 14, -9], [-22 + k * 14, 9]], 2, { color: '#5E4C36', seed: 9441 + k, taper: false }); ctx.restore(); }
