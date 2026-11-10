// WI02 sets (DIRECTION.md set bible). World scale: figures s = 1.6, ground GY = 0.82 H. Each set: fn(g, t, cam, o) → { GY, CX, M, spots }.
// Value rule: the window / practicals are the brightest things; black figures are staged in front of them.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, text, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const SC = 1.6;
export const GYf = () => E.H * V(0.82, 0.7);
export const F = (px, py, z = 1) => ({ x: px - E.W / 2, y: py - E.H / 2, z });          // camera that centres world point (px,py)
export const lerpCam = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k, r: (a.r || 0) + ((b.r || 0) - (a.r || 0)) * k });

// ---------- shared props ----------
export function table(g, x, GY, o = {}) {
  const top = GY - 162, c = o.color || '#1c1317', w = o.w || 260;
  seg(g, [[x, top], [x, GY - 6]], 10, c); seg(g, [[x - 50, GY - 4], [x + 50, GY - 4]], 8, c);
  rr(g, x - w / 2, top - 12, w, 16, 8); g.fillStyle = c; g.fill(); g.fillStyle = alpha(o.lip || '#ffd8a0', .35); g.fillRect(x - w / 2 + 6, top - 12, w - 12, 3);
  return top - 12;
}
export function longTable(g, x0, x1, GY, c = '#1c1317') { const top = GY - 162; for (const x of [x0 + 40, x1 - 40]) seg(g, [[x, top], [x, GY - 4]], 10, c); rr(g, x0, top - 12, x1 - x0, 18, 6); g.fillStyle = c; g.fill(); g.fillStyle = 'rgba(255,220,170,.3)'; g.fillRect(x0 + 6, top - 12, x1 - x0 - 12, 3); return top - 12; }
export function chair(g, x, GY, facing = 1, c = '#24181e') { g.save(); g.translate(x, 0); g.scale(facing, 1); FX.chair(g, -18 * SC, GY, SC, c); g.restore(); }
export function cup(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s);
  rr(g, -14, -30, 28, 30, 5); g.fillStyle = o.body || '#f2ece4'; g.fill(); seg(g, [[14, -24], [22, -18], [14, -10]], 4, o.body || '#f2ece4');
  if (o.sleeve) { g.fillStyle = o.sleeve; g.fillRect(-15, -22, 30, 13); }
  g.fillStyle = '#4a2a1a'; g.fillRect(-12, -30, 24, 5); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(4, -26, 10, 26); g.restore();
}
export function steam(g, x, y, t, a = .25, frozen = false) {
  for (let k = 0; k < 3; k++) { const ph = frozen ? k * .33 : (t * .5 + k / 3) % 1, yy = y - ph * 70, xx = x + Math.sin(ph * 6 + k * 2) * 8 + (k - 1) * 6;
    g.strokeStyle = `rgba(255,245,235,${a * Math.sin(ph * Math.PI)})`; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(xx, yy); g.quadraticCurveTo(xx + 10, yy - 12, xx, yy - 24); g.stroke(); }
}
function pendant(g, x, y, M, on = 1) {
  seg(g, [[x, -400], [x, y - 30]], 3, '#120c10'); poly(g, [[x - 44, y], [x + 44, y], [x + 18, y - 34], [x - 18, y - 34]], '#1a1216');
  if (on > 0) { glow(g, x, y + 6, 260, M.practical, .35 * on); FX.lightCone(g, x, y, { angle: Math.PI / 2, spread: .55, len: 620, color: M.practical, a: .09 * on }); circle(g, x, y + 2, 12, '#fff1d0'); }
}
function planks(g, GY, M, w0 = -E.W * 1.5, w = E.W * 4.5) {
  g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -.05), shade(M.dark, -.25)]); g.fillRect(w0, GY, w, E.H * 2);
  FX.floorLines(g, GY, GY + 600, 'rgba(0,0,0,.28)', .08);
}
function chalkMenu(g, x, y, w, h) {
  rr(g, x - 10, y - 10, w + 20, h + 20, 8); g.fillStyle = '#3a2a22'; g.fill(); g.fillStyle = '#1d2320'; g.fillRect(x, y, w, h);
  const items = [['KETTLE & CRUMB', ''], ['FLAT WHITE', '3.2'], ['OAT LATTE', '3.6'], ['BIG MUG', '2.4'], ['CRUMB CAKE', '2.9']];
  items.forEach(([a, b], i) => { const yy = y + 34 + i * (h - 50) / 4.3; text(g, a, x + (i ? 24 : w / 2), yy, { size: i ? 22 : 26, font: 'Nunito', weight: 900, color: i ? '#e8e2d4' : '#ffd47e', align: i ? 'left' : 'center', alpha: .85 }); if (b) text(g, b, x + w - 24, yy, { size: 22, font: 'Nunito', weight: 900, color: '#e8e2d4', align: 'right', alpha: .85 }); });
}
function espresso(g, x, GY0, t, M, hiss = 0) {
  rr(g, x - 70, GY0 - 120, 140, 120, 10); g.fillStyle = '#b8b2ba'; g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 70, GY0 - 40, 140, 40);
  rr(g, x - 54, GY0 - 104, 108, 40, 6); g.fillStyle = '#2a2328'; g.fill(); circle(g, x + 34, GY0 - 84, 7, '#ff8a5a'); glow(g, x + 34, GY0 - 84, 30, '#ff8a5a', .6);
  seg(g, [[x - 20, GY0 - 64], [x - 20, GY0 - 48]], 8, '#3a3236'); seg(g, [[x + 10, GY0 - 64], [x + 10, GY0 - 48]], 8, '#3a3236');
  steam(g, x + 52, GY0 - 120, t * (1 + hiss * 3), .25 + .4 * hiss);
}

// ---------- CAFÉ "Kettle & Crumb" (hub) ----------
// variant: 'am' (golden morning) · 'pm' (dusk, lamps on) · 'night' (dark street, lamps strong)
export function cafe(g, t, cam, o = {}) {
  const v = o.variant || 'am', M = mood(v === 'am' ? 'golden' : v === 'pm' ? 'dusk' : 'night'), MI = mood('interiorWarm');
  const GY = GYf(), CX = E.W / 2, lamps = v === 'am' ? .35 : 1, fr = o.frozen;
  const wall = v === 'am' ? shade(MI.wall, -.25) : shade(MI.wall, -.45), wallDark = shade(wall, -.45);
  const winTop = GY - 640, winBot = GY - 250;
  layer(g, cam, .15, g => {                                    // the street outside
    backdrop(g, M.sky);
    if (v === 'am') FX.sun(g, CX + 520, winTop + 120, 60, '#fff3dc', M.key, 4);
    if (v === 'night') FX.stars(g, fr ? 0 : t, { count: 40, seed: 5, area: [-E.W, -200, E.W * 3, winTop + 200] });
    FX.facade(g, { x: -E.W, y: winBot + 40, w: E.W * 3.4, h: 420, color: v === 'am' ? '#6a4a52' : '#2a2034', win: M.practical, dark: v === 'am' ? '#4a3240' : '#151020', cols: 22, rows: 3, lit: v === 'am' ? .15 : .65, seed: 11 });
    for (const x of [-300, 620, 1540, 2460]) FX.lampPost(g, x, winBot + 40, 300, { light: M.practical, on: v !== 'am', a: .25 });
  });
  layer(g, cam, .5, g => {                                     // back wall with the big window
    g.fillStyle = wall; g.fillRect(-E.W * 1.5, -E.H, E.W * 4.5, winTop + E.H); g.fillRect(-E.W * 1.5, winBot, E.W * 4.5, GY - winBot + 4);
    g.fillRect(-E.W * 1.5, winTop - 2, E.W * 1.5 + 140, winBot - winTop + 4); g.fillRect(2380, winTop - 2, E.W * 3, winBot - winTop + 4);
    for (let x = 140; x <= 2380; x += 280) seg(g, [[x, winTop], [x, winBot]], 12, wallDark);
    seg(g, [[140, winTop], [2380, winTop]], 16, wallDark); seg(g, [[140, winBot], [2380, winBot]], 22, wallDark);
    text(g, 'KETTLE & CRUMB', 1260, winTop + 70, { size: 46, weight: 700, color: alpha('#f2e6d0', .35), spacing: 6 });   // window lettering (mirror-free, our own brand)
    g.fillStyle = shade(wall, .06); g.fillRect(-E.W * 1.5, GY - 120, E.W * 4.5, 120);                                     // wainscot
    seg(g, [[-E.W * 1.5, GY - 120], [E.W * 3, GY - 120]], 6, wallDark);
    chalkMenu(g, -660, winTop - 20, 420, 260);
    FX.door(g, { x: -1150, y: GY, w: 170, h: 400, color: wallDark, open: o.door ?? .15, light: M.practical });
    for (const x of [-860, -820]) seg(g, [[x, GY - 520], [x, GY - 480]], 6, wallDark);                                    // coat hooks
    if (o.jacket) { poly(g, [[-858, GY - 500], [-900, GY - 330], [-816, GY - 330]], o.jacket); }
    glow(g, 1260, (winTop + winBot) / 2, 900, M.key, v === 'am' ? .18 : .06);
  });
  layer(g, cam, .85, g => {                                    // floor, counter, pendants, other tables
    planks(g, GY, MI);
    FX.pool(g, CX, GY + 40, 700, 70, M.key, v === 'am' ? .22 : .08);
    if (!o.counterAt1) cafeCounter(g, t, GY, M, o);
    for (const x of [-180, 1960]) { rr(g, x - 30, GY - 160, 60, 160, 14); g.fillStyle = '#3a2a2a'; g.fill(); for (let k = 0; k < 7; k++) circle(g, x - 40 + (k * 31) % 80, GY - 210 - (k * 47) % 110, 34, k % 2 ? '#2f4a36' : '#26402f'); }  // plants
    for (const x of [-60, 960, 1980]) pendant(g, x, GY - 560, MI, lamps);
    if (!o.noSide) { table(g, 1740, GY); table(g, 200, GY); cup(g, 1700, GY - 176, 1.1); cup(g, 230, GY - 176, 1.1); }
    if (o.chairsUp) { const k = o.chairsUp; for (const x of [200, 1740]) { seg(g, [[x - 90, GY - 174], [x - 90 + 10 * k, GY - 174 - 120 * k]], 7, '#24181e'); seg(g, [[x + 90, GY - 174], [x + 90 - 10 * k, GY - 174 - 120 * k]], 7, '#24181e'); } }
  });
  return { GY, CX, M, MI, spots: { seatL: CX - 210, seatR: CX + 210, barista: -470, door: -1060, x1: 200 - 200, x2: 1740 - 200, x3: 1740 + 200 } };
}

export function cafeCounter(g, t, GY, M, o = {}) {
  const fr = o.frozen;
    g.fillStyle = '#2a1c20'; g.fillRect(-760, GY - 190, 640, 190); g.fillStyle = '#3e2a2c'; g.fillRect(-772, GY - 202, 664, 14);  // counter
    for (let k = 0; k < 6; k++) seg(g, [[-740 + k * 106, GY - 176], [-740 + k * 106, GY - 14]], 2, 'rgba(0,0,0,.35)');
    espresso(g, -330, GY - 202, fr ? 0 : t, M, o.hiss || 0);
    g.beginPath(); g.ellipse(-620, GY - 230, 52, 34, 0, Math.PI, 0); g.fillStyle = 'rgba(230,240,255,.25)'; g.fill(); circle(g, -620, GY - 214, 16, '#c88a5a');  // cake dome
}

// ---------- BEDROOM (dawn, blinds) ----------
export function bedroom(g, t, cam, o = {}) {
  const M = mood('golden'), GY = GYf(), CX = E.W / 2, wall = shade(M.wall, -.35);
  layer(g, cam, .5, g => {
    g.fillStyle = wall; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2 + GY);
    FX.windowFrame(g, { x: CX + 280, y: GY - 640, w: 460, h: 380, cols: 2, rows: 1, frame: shade(wall, -.4), bar: 10, blinds: 11 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); FX.sun(g, x + w * .6, y + h * .7, 50, '#fff3dc', M.key, 3); });
    g.save(); g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 9; k++) { g.fillStyle = alpha(M.key, .07); poly(g, [[CX + 280, GY - 630 + k * 40], [CX + 280, GY - 615 + k * 40], [CX - 600, GY - 420 + k * 60], [CX - 600, GY - 440 + k * 60]], alpha(M.key, .06)); } g.restore();
    rr(g, CX - 560, GY - 600, 160, 220, 6); g.fillStyle = '#5a4060'; g.fill(); rr(g, CX - 380, GY - 560, 120, 160, 6); g.fillStyle = '#3d5a6a'; g.fill();   // posters (blank shapes)
  });
  layer(g, cam, .85, g => {
    planks(g, GY, M); FX.bed(g, { x: CX - 420, y: GY, w: 560, color: '#4a5a8a', frame: '#2a2034' });
    rr(g, CX + 170, GY - 150, 120, 150, 6); g.fillStyle = '#2a2034'; g.fill(); rr(g, CX + 200, GY - 166, 56, 14, 4); g.fillStyle = '#111'; g.fill();
    glow(g, CX + 228, GY - 166, 40, '#9fe0ff', .3);
  });
  return { GY, CX, M, spots: { bed: CX - 240 } };
}

// ---------- OFFICE (blue hour, monitors) ----------
export function office(g, t, cam, o = {}) {
  const M = mood(o.warm ? 'dusk' : 'interiorCool'), MC = mood('interiorCool'), GY = GYf(), CX = E.W / 2, wall = shade(MC.wall, -.2);
  layer(g, cam, .2, g => { backdrop(g, M.sky); FX.skyline(g, { x: -E.W, y: GY - 200, w: E.W * 3.4, minH: 120, maxH: 520, color: '#1c2040', windowColor: alpha('#ffd59a', .7), lit: .3, seed: 31 }); });
  layer(g, cam, .5, g => {
    g.fillStyle = wall; g.fillRect(-E.W * 1.5, -E.H, E.W * 4.5, GY - 720 + E.H); g.fillRect(-E.W * 1.5, GY - 230, E.W * 4.5, 240);
    for (let x = -600; x <= 2600; x += 300) seg(g, [[x, GY - 720], [x, GY - 230]], 10, shade(wall, -.4));
    rr(g, CX + 120, GY - 560, 420, 260, 8); g.fillStyle = '#e8eaf2'; g.fill();                              // whiteboard + invented chart
    for (let k = 0; k < 5; k++) { const h = [60, 110, 80, 150, 120][k]; g.fillStyle = k === 3 ? '#e05a4a' : '#5a7ac0'; g.fillRect(CX + 170 + k * 70, GY - 330 - h, 40, h); }
    text(g, 'Q3 PLAN', CX + 330, GY - 525, { size: 28, font: 'Nunito', weight: 900, color: '#2a2a3a' });
  });
  layer(g, cam, .85, g => {
    planks(g, GY, MC);
    for (const [x, f] of [[CX - 330, 1], [CX + 700, -1], [CX - 1100, 1], [CX + 1500, -1]]) {
      rr(g, x - 170, GY - 175, 340, 14, 4); g.fillStyle = '#1e2032'; g.fill(); seg(g, [[x - 150, GY - 165], [x - 150, GY]], 8, '#1e2032'); seg(g, [[x + 150, GY - 165], [x + 150, GY]], 8, '#1e2032');
      FX.screen(g, { x: x + f * 40 - 70, y: GY - 300, w: 140, h: 100, glowC: MC.practical, a: .3 }, (g, sx, sy, w, h) => { for (let k = 0; k < 5; k++) { g.fillStyle = alpha(MC.practical, .5); g.fillRect(sx + 12, sy + 14 + k * 16, 40 + ((k * 37 + x) % 70), 6); } });
      seg(g, [[x + f * 40, GY - 200], [x + f * 40, GY - 178]], 8, '#111');
    }
  });
  return { GY, CX, M: MC, spots: { you: CX - 470, boss: CX + 330, coll: CX + 840 } };
}

// ---------- CANTEEN (noon) ----------
export function canteen(g, t, cam, o = {}) {
  const M = mood('golden'), GY = GYf(), CX = E.W / 2, wall = '#5a4a52';
  layer(g, cam, .2, g => { backdrop(g, mood('day').sky); for (let k = 0; k < 8; k++) FX.tree(g, -400 + k * 380, GY - 250, 1.4 + (k % 3) * .3, '#4a6a4a'); });
  layer(g, cam, .5, g => {
    g.fillStyle = wall; g.fillRect(-E.W * 1.5, -E.H, E.W * 4.5, GY - 640 + E.H); g.fillRect(-E.W * 1.5, GY - 250, E.W * 4.5, 260);
    for (let x = -600; x <= 2600; x += 320) seg(g, [[x, GY - 640], [x, GY - 250]], 12, shade(wall, -.4));
    rr(g, CX - 900, GY - 740, 380, 90, 8); g.fillStyle = '#2a2228'; g.fill(); text(g, 'TODAY: SOUP 4 · PASTA 9 · STEAK 16', CX - 710, GY - 695, { size: 20, font: 'Nunito', weight: 900, color: '#ffd47e' });
    glow(g, CX, GY - 450, 900, M.key, .12);
  });
  layer(g, cam, .85, g => { planks(g, GY, M); FX.pool(g, CX, GY + 40, 800, 70, M.key, .2); });
  return { GY, CX, M, spots: { x1: CX - 400, you: CX - 140, x2: CX + 140, x3: CX + 420 } };
}

// ---------- TRAIN (dusk, lights sliding past) ----------
export function train(g, t, cam, o = {}) {
  const M = mood('dusk'), GY = GYf(), CX = E.W / 2, wall = '#3a2e40', sp = o.frozen ? 0 : 700, top = GY - 600, bot = GY - 300;
  layer(g, cam, .15, g => {
    backdrop(g, M.sky);
    const off = -(t * sp) % 2400;
    for (const d of [0, 2400]) FX.skyline(g, { x: -E.W + off + d, y: bot + 40, w: 2400, minH: 80, maxH: 300, color: '#2a2040', windowColor: alpha(M.practical, .8), lit: .4, seed: 41 });
    for (let k = 0; k < 6; k++) { const x = ((k * 520 - t * sp * 1.6) % 3200 + 3200) % 3200 - 600; seg(g, [[x, bot + 40], [x, top + 60]], 6, '#1a1424'); glow(g, x, top + 60, 60, M.practical, .5); }
  });
  layer(g, cam, .5, g => {
    g.fillStyle = wall; g.fillRect(-E.W * 1.5, -E.H, E.W * 4.5, top + E.H); g.fillRect(-E.W * 1.5, bot, E.W * 4.5, GY - bot);
    for (let x = -800; x <= 2800; x += 480) { rr(g, x, top, 420, bot - top, 30); g.strokeStyle = '#241a2a'; g.lineWidth = 16; g.stroke(); }
    for (let x = -800; x <= 2800; x += 480) { g.fillStyle = '#241a2a'; g.fillRect(x + 420, top, 60, bot - top); }
    rr(g, CX - 160, top - 130, 320, 80, 6); g.fillStyle = '#e8e0f0'; g.fill(); text(g, 'NEXT: RIVERSIDE', CX, top - 90, { size: 26, font: 'Nunito', weight: 900, color: '#3a2e40' });
    seg(g, [[-E.W, top - 30], [E.W * 3, top - 30]], 8, '#9a90a0');
  });
  layer(g, cam, .85, g => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#2a2230', '#140f18']); g.fillRect(-E.W * 1.5, GY, E.W * 4.5, E.H);
    for (const x of [CX - 300, CX + 300]) { rr(g, x - 150, GY - 140, 300, 40, 10); g.fillStyle = '#6a3a4a'; g.fill(); rr(g, x - 150, GY - 102, 300, 102, 4); g.fillStyle = '#2a1e28'; g.fill(); }
    for (let k = -3; k <= 3; k++) { const x = CX + k * 160, sw = Math.sin(t * 1.3 + k) * (o.frozen ? 0 : .08); g.save(); g.translate(x, top - 30); g.rotate(sw); seg(g, [[0, 0], [0, 80]], 4, '#9a90a0'); ring(g, 0, 96, 16, 5, '#c8c0d0'); g.restore(); }
    // sweeping light from passing lamps
    const ph = ((t * 1.1) % 1); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, E.W * (1.4 - ph * 2), 0, E.W * (1.7 - ph * 2), 0, [alpha(M.practical, 0), alpha(M.practical, o.frozen ? 0 : .07), alpha(M.practical, 0)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore();
  });
  return { GY, CX, M, spots: { you: CX - 260, woman: CX + 260 } };
}
export const SETS = { cafe, bedroom, office, canteen, train };
