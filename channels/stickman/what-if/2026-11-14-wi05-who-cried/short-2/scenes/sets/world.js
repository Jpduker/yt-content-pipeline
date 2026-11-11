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
    if (o.chairsUp) { const k = o.chairsUp * Math.min(1, Math.max(0, (t - 1) / 2.5)); for (const x of [200, 1740]) { seg(g, [[x - 90, GY - 174], [x - 90 + 10 * k, GY - 174 - 120 * k]], 7, '#24181e'); seg(g, [[x + 90, GY - 174], [x + 90 - 10 * k, GY - 174 - 120 * k]], 7, '#24181e'); } }
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
  const M = mood(o.night ? 'night' : 'golden'), GY = GYf(), CX = E.W / 2, wall = shade(M.wall, -.35);
  layer(g, cam, .5, g => {
    g.fillStyle = wall; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2 + GY);
    FX.windowFrame(g, { x: CX + 280, y: GY - 640, w: 460, h: 380, cols: 2, rows: 1, frame: shade(wall, -.4), bar: 10, blinds: 11 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); FX.sun(g, x + w * .6, y + h * .7, 50, '#fff3dc', M.key, 3); });
    g.save(); g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 9; k++) { g.fillStyle = alpha(M.key, .07); poly(g, [[CX + 280, GY - 630 + k * 40], [CX + 280, GY - 615 + k * 40], [CX - 600, GY - 420 + k * 60], [CX - 600, GY - 440 + k * 60]], alpha(M.key, .06)); } g.restore();
    rr(g, CX - 560, GY - 600, 160, 220, 6); g.fillStyle = '#5a4060'; g.fill(); rr(g, CX - 380, GY - 560, 120, 160, 6); g.fillStyle = '#3d5a6a'; g.fill();   // posters (blank shapes)
  });
  layer(g, cam, .85, g => {
    planks(g, GY, M); FX.bed(g, { x: CX - 420, y: GY, w: 560, color: '#4a5a8a', frame: '#2a2034' });
    rr(g, CX + 170, GY - 150, 120, 150, 6); g.fillStyle = '#2a2034'; g.fill(); rr(g, CX + 200, GY - 166, 56, 14, 4); g.fillStyle = '#111'; g.fill();
    glow(g, CX + 228, GY - 166, o.night ? 260 : 40, '#9fe0ff', o.night ? .22 : .3);
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

// ================= v3 sets (WI03–WI05): the world grows =================
function pavement(g, GY, M, c0 = '#3a3440') { g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(c0, .05), shade(c0, -.45)]); g.fillRect(-E.W * 2, GY, E.W * 6, E.H); for (let x = -3000; x < 5000; x += 220) seg(g, [[x, GY + 4], [x - 90, GY + 300]], 2, 'rgba(0,0,0,.18)'); g.fillStyle = 'rgba(255,225,190,.12)'; g.fillRect(-E.W * 2, GY, E.W * 6, 5); }
function shopFront(g, x, GY, w, h, o) { const c = o.color || '#4a3a48'; g.fillStyle = c; g.fillRect(x, GY - h, w, h); g.fillStyle = shade(c, -.35); g.fillRect(x, GY - h, w, 26);
  rr(g, x + 30, GY - h + 150, w - 60 - (o.door ? 150 : 0), h - 230, 8); g.fillStyle = o.lit ? alpha(o.light || '#ffd59a', .85) : '#1c1826'; g.fill(); if (o.lit) glow(g, x + w / 2, GY - h / 2, w * .7, o.light || '#ffd59a', .16);
  { const wx = x + 30, wy = GY - h + 150, ww = w - 60 - (o.door ? 150 : 0), wh = h - 230; g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    for (let k = 0; k < 3; k++) { g.fillStyle = o.lit ? 'rgba(90,50,40,.5)' : 'rgba(255,255,255,.05)'; g.fillRect(wx, wy + wh * (.3 + k * .24), ww, 10); for (let j = 0; j < 6; j++) { g.fillStyle = o.lit ? ['rgba(120,60,40,.6)', 'rgba(70,90,60,.55)', 'rgba(140,90,40,.6)'][(j + k) % 3] : 'rgba(255,255,255,.04)'; rr(g, wx + 20 + j * ww / 6, wy + wh * (.3 + k * .24) - 46 - (j * 7 + k * 11) % 24, ww / 9, 46 + (j * 7 + k * 11) % 24, 6); g.fill(); } }
    g.fillStyle = shade(c, -.35); for (let k = 1; k < 3; k++) g.fillRect(wx + ww * k / 3 - 5, wy, 10, wh); g.restore(); }
  if (o.door) { rr(g, x + w - 160, GY - 330, 120, 330, 6); g.fillStyle = shade(c, -.5); g.fill(); circle(g, x + w - 60, GY - 170, 6, '#d8b060'); }
  g.fillStyle = o.awning || shade(c, .25); poly(g, [[x + 10, GY - h + 110], [x + w - 10, GY - h + 110], [x + w + 30, GY - h + 170], [x - 30, GY - h + 170]], o.awning || shade(c, .25));
  if (o.name) text(g, o.name, x + w / 2, GY - h + 70, { size: o.size || 40, font: 'Nunito', weight: 900, color: o.nameC || '#f2e6d0', spacing: 4 }); }
function van(g, x, GY, c = '#e8e2d6') { rr(g, x - 250, GY - 260, 380, 220, 18); g.fillStyle = c; g.fill(); poly(g, [[x + 130, GY - 220], [x + 220, GY - 220], [x + 290, GY - 120], [x + 290, GY - 40], [x + 130, GY - 40]], c);
  poly(g, [[x + 150, GY - 200], [x + 210, GY - 200], [x + 262, GY - 124], [x + 150, GY - 124]], '#2a3448'); g.fillStyle = '#1f8a8a'; g.fillRect(x - 250, GY - 140, 540, 16); text(g, 'GOOD MOVE', x - 60, GY - 190, { size: 30, font: 'Nunito', weight: 900, color: '#1f6a6a' });
  for (const wx of [x - 150, x + 190]) { circle(g, wx, GY - 34, 44, '#15121a'); circle(g, wx, GY - 34, 18, '#8a8490'); } }
function bus(g, x, GY, o = {}) { const c = '#c9463c'; rr(g, x - 520, GY - 380, 1040, 350, 26); g.fillStyle = c; g.fill(); g.fillStyle = shade(c, -.3); g.fillRect(x - 520, GY - 120, 1040, 14);
  for (let k = 0; k < 4; k++) { rr(g, x - 480 + k * 180, GY - 340, 150, 130, 10); g.fillStyle = alpha('#ffe9c0', .7); g.fill(); }
  rr(g, x + 270, GY - 345, 200, 310, 10); g.fillStyle = '#231a22'; g.fill(); rr(g, x + 284, GY - 332, 172, 150, 6); g.fillStyle = alpha('#ffe9c0', .55); g.fill();          // door + driver window
  rr(g, x - 200, GY - 372, 400, 26, 6); g.fillStyle = '#15121a'; g.fill(); text(g, '9  RIVERSIDE', x, GY - 359, { size: 20, font: 'Nunito', weight: 900, color: '#ffc04a' });
  for (const wx of [x - 340, x + 180]) { circle(g, wx, GY - 30, 50, '#15121a'); circle(g, wx, GY - 30, 20, '#8a8490'); } }
function bench(g, x, GY) { for (const dx of [-110, 110]) seg(g, [[x + dx, GY], [x + dx, GY - 70]], 10, '#1c1620'); rr(g, x - 150, GY - 84, 300, 16, 5); g.fillStyle = '#5a4034'; g.fill(); rr(g, x - 150, GY - 150, 300, 14, 5); g.fill(); seg(g, [[x - 130, GY - 76], [x - 130, GY - 150]], 8, '#1c1620'); seg(g, [[x + 130, GY - 76], [x + 130, GY - 150]], 8, '#1c1620'); }
function flowers(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-16, 0], [16, 0], [34, -70], [-34, -70]], '#e8dcc8'); for (const [dx, dy, c] of [[-22, -92, '#f06a8a'], [4, -104, '#ffd47e'], [26, -88, '#f29ac0'], [-6, -80, '#ff8a5a']]) { circle(g, dx, dy, 15, c); circle(g, dx, dy, 5, '#fff3dc'); } g.restore(); }
// STREET: variant 'am' | 'dusk' | 'night'. o.park (trees + bench instead of shops), o.van, o.bus (x), o.steps (front door of the hero's building), o.bench, o.flowers
export function street(g, t, cam, o = {}) {
  const v = o.variant || 'am', M = mood(v === 'am' ? 'golden' : v === 'dusk' ? 'dusk' : 'night'), GY = GYf(), CX = E.W / 2, lit = v !== 'am';
  layer(g, cam, .12, g => { backdrop(g, M.sky); if (v === 'am') FX.sun(g, CX + 700, GY - 760, 56, '#fff3dc', M.key, 4); if (v === 'night') { FX.stars(g, t, { count: 50, seed: 9, area: [-E.W, -300, E.W * 3, GY - 500] }); FX.moon(g, CX - 620, GY - 800, 44); }
    FX.clouds && v !== 'night' && FX.clouds(g, { y: GY - 820, count: 5, color: alpha('#fff', .25), t });
    FX.skyline(g, { x: -E.W, y: GY - 260, w: E.W * 3.6, minH: 160, maxH: 520, color: v === 'am' ? '#8a6a72' : '#1c1830', windowColor: alpha(M.practical, .8), lit: lit ? .45 : .08, seed: 71 }); });
  layer(g, cam, .5, g => {
    if (o.park) { g.fillStyle = v === 'am' ? '#5a7a52' : '#1e2e2a'; g.fillRect(-E.W * 2, GY - 220, E.W * 6, 230); for (let k = 0; k < 9; k++) FX.tree(g, -900 + k * 430, GY - 60, 2.1 + (k % 3) * .45, v === 'am' ? (k % 2 ? '#3f6a44' : '#35603c') : '#16241e'); }
    else { const C = v === 'am' ? ['#7a5a62', '#6a5a78', '#80685a', '#5f6a7a'] : ['#2c2436', '#262a40', '#33262e', '#222838'];
      shopFront(g, -1500, GY, 700, 640, { color: C[0], name: 'LAUNDRY', lit: lit, door: 1 });
      shopFront(g, -760, GY, 760, 700, { color: C[1], name: 'CRUMB & CO · BAKERY', size: 34, lit: true, door: 1, awning: '#d8884a', light: '#ffd9a0' });
      shopFront(g, 40, GY, 820, 760, { color: C[2], name: o.steps ? 'No. 14' : 'KETTLE & CRUMB', lit: lit || !o.steps, door: 1, awning: o.steps ? undefined : '#3a5a4a' });
      shopFront(g, 900, GY, 780, 680, { color: C[3], name: 'IRON HABIT GYM', size: 36, lit: false, door: 1, nameC: '#c8d4e8' });
      shopFront(g, 1720, GY, 760, 720, { color: C[0], name: 'BOOKS', lit: lit, door: 1, awning: '#6a4a7a' });
      if (o.closed) { g.save(); g.translate(1290, GY - 330); g.rotate(-.06); rr(g, -150, -40, 300, 80, 8); g.fillStyle = '#f2e6d0'; g.fill(); text(g, 'CLOSED DOWN', 0, 2, { size: 30, font: 'Nunito', weight: 900, color: '#a03a2a' }); g.restore(); } }
    for (const x of [-420, 700, 1820, 2940]) FX.lampPost(g, x, GY, 420, { light: M.practical, on: lit, a: .3 });
  });
  layer(g, cam, .85, g => { pavement(g, GY, M, v === 'am' ? '#6a5a5e' : '#2a2630'); FX.pool(g, CX, GY + 50, 800, 70, M.key, v === 'am' ? .2 : .08);
    if (o.steps) { for (let k = 0; k < 3; k++) { g.fillStyle = shade('#5a4a52', -.1 * k); g.fillRect(330 - k * 30, GY - 30 * (3 - k), 300 + k * 60, 30); } }
    if (o.bench != null) bench(g, o.bench, GY); if (o.flowers != null) flowers(g, o.flowers, GY - 86, 1.1);
    if (o.bus != null) bus(g, o.bus, GY, o); if (o.van != null) van(g, o.van + (o.vanGo ? Math.max(0, t - o.vanGo) ** 2 * 420 : 0), GY);
    if (o.boxes) for (let k = 0; k < o.boxes; k++) cardboard(g, (o.boxX ?? 760) + (k % 2) * 96, GY - Math.floor(k / 2) * 84, 1); });
  return { GY, CX, M, spots: {} };
}
export function cardboard(g, x, y, s = 1, o = {}) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -44, -80, 88, 80, 4); g.fillStyle = o.color || '#b88a5a'; g.fill(); g.fillStyle = shade(o.color || '#b88a5a', -.22); g.fillRect(-44, -80, 88, 12); g.fillStyle = '#e8d8b8'; g.fillRect(-8, -80, 16, 80); if (o.label) text(g, o.label, 0, -34, { size: 13, font: 'Nunito', weight: 900, color: '#5a3a20' }); g.restore(); }
// HALL: Mira's flat. o.boxes (count), o.shelf ('broken' | 'fixed'), o.dinner (table dressed), o.night
export function hall(g, t, cam, o = {}) {
  const M = mood(o.night ? 'night' : 'dusk'), MI = mood('interiorWarm'), GY = GYf(), CX = E.W / 2, wall = shade('#c9a227', -.62), dark = shade(wall, -.45);
  layer(g, cam, .2, g => { backdrop(g, M.sky); FX.skyline(g, { x: -E.W, y: GY - 240, w: E.W * 3.4, minH: 100, maxH: 420, color: '#2a2040', windowColor: alpha(M.practical, .8), lit: .5, seed: 23 }); });
  layer(g, cam, .5, g => {
    g.fillStyle = wall; g.fillRect(-E.W * 1.5, -E.H, E.W * 4.5, E.H * 2 + GY);
    FX.windowFrame(g, { x: CX + 420, y: GY - 660, w: 420, h: 400, cols: 2, rows: 2, frame: dark, bar: 10 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h); });
    FX.door(g, { x: -640, y: GY, w: 190, h: 430, color: dark, open: o.door ?? 0, light: M.practical });
    for (const [x, y, w, h, c] of [[CX - 520, GY - 620, 150, 190, '#f2c21a'], [CX - 340, GY - 590, 120, 150, '#6a8ab0'], [CX - 190, GY - 640, 100, 130, '#d8704a']]) { rr(g, x, y, w, h, 5); g.fillStyle = shade(c, -.3); g.fill(); rr(g, x + 10, y + 10, w - 20, h - 20, 3); g.fillStyle = c; g.fill(); }   // her prints
    g.save(); g.translate(CX + 60, GY - 420); g.rotate(o.shelf === 'broken' ? .16 : 0); rr(g, -150, 0, 300, 16, 4); g.fillStyle = '#3a2a22'; g.fill(); if (o.shelf !== 'broken') for (const [x, h, c] of [[-120, 70, '#8a5ad6'], [-90, 90, '#3fb950'], [-55, 60, '#e8743b'], [60, 54, '#f2c21a']]) { g.fillStyle = c; g.fillRect(x, -h, 24, h); } g.restore();
    g.fillStyle = shade(wall, .08); g.fillRect(-E.W * 1.5, GY - 110, E.W * 4.5, 110); seg(g, [[-E.W * 1.5, GY - 110], [E.W * 3, GY - 110]], 6, dark);
    glow(g, CX + 630, GY - 460, 700, M.key, .1);
  });
  layer(g, cam, .85, g => { planks(g, GY, MI); FX.pool(g, CX, GY + 40, 700, 70, MI.key, .16); pendant(g, CX, GY - 600, MI, 1);
    rr(g, CX - 760, GY - 150, 300, 150, 20); g.fillStyle = '#5a3a4a'; g.fill(); rr(g, CX - 780, GY - 230, 340, 100, 24); g.fillStyle = '#6a4458'; g.fill();          // sofa
    const n = o.boxes || 0; for (let k = 0; k < n; k++) { const col = Math.floor(k / 3), row = k % 3; cardboard(g, CX + 440 + col * 104 + (row % 2) * 8, GY - row * 82, 1.15, { label: ['BOOKS', 'KITCHEN', 'MISC', 'SHOES', 'DESK', 'MUGS'][k % 6] }); }
    if (o.dinner) { g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(CX + 10, GY - 180, 46, 10, 0, 0, 7); g.fill(); poly(g, [[CX - 16, GY - 182], [CX + 36, GY - 182], [CX + 30, GY - 214], [CX - 10, GY - 214]], '#f29ac0'); circle(g, CX + 10, GY - 220, 6, '#d8504a'); } });
  return { GY, CX, M: MI, spots: {} };
}
// PLATFORM (dusk): o.doors 0..1 open, o.go = time the train starts to leave
export function platform(g, t, cam, o = {}) {
  const M = mood('dusk'), GY = GYf(), CX = E.W / 2, dx = o.go != null ? Math.max(0, t - o.go) ** 2 * 260 : 0;
  layer(g, cam, .12, g => { backdrop(g, M.sky); FX.sun(g, CX - 500, GY - 420, 70, '#ffd9b0', M.key, 5); FX.skyline(g, { x: -E.W, y: GY - 300, w: E.W * 3.6, minH: 100, maxH: 380, color: '#2a2040', windowColor: alpha(M.practical, .8), lit: .45, seed: 51 }); });
  layer(g, cam, .55, g => {   // the train
    g.save(); g.translate(dx, 0); const top = GY - 560, c = '#d8d2c8';
    rr(g, -1700, top, 4200, 470, 40); g.fillStyle = c; g.fill(); g.fillStyle = '#c9463c'; g.fillRect(-1700, top + 300, 4200, 34); g.fillStyle = '#2a2430'; g.fillRect(-1700, GY - 100, 4200, 100);
    for (let x = -1560; x < 2400; x += 330) { if (Math.abs(x - 750) < 120) continue; rr(g, x, top + 70, 250, 180, 18); g.fillStyle = alpha('#ffe2b0', .78); g.fill(); }
    const dW = 150 * (1 - (o.doors ?? 0)); rr(g, 760, top + 50, 320, 400, 12); g.fillStyle = '#3a2e36'; g.fill(); rr(g, 772, top + 62, 296, 376, 8); g.fillStyle = alpha('#ffe2b0', .85); g.fill();
    g.fillStyle = c; g.fillRect(772, top + 62, dW, 376); g.fillRect(1068 - dW, top + 62, dW, 376); g.strokeStyle = '#8a8490'; g.lineWidth = 4; g.strokeRect(772, top + 62, dW, 376); g.strokeRect(1068 - dW, top + 62, dW, 376);
    if (o.inWindow) { circle(g, 1260, top + 150, 44, '#15121a'); g.fillStyle = '#f2c21a'; g.fillRect(1296, top + 112, 12, 22); }
    g.restore(); });
  layer(g, cam, .85, g => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#4a4250', '#1c1620']); g.fillRect(-E.W * 2, GY, E.W * 6, E.H); g.fillStyle = '#ffd24a'; g.fillRect(-E.W * 2, GY + 8, E.W * 6, 10);
    for (const x of [-500, 500, 1500, 2500]) { seg(g, [[x, GY], [x, GY - 760]], 22, '#2a2430'); }
    g.fillStyle = '#2a2430'; g.fillRect(-E.W * 2, GY - 790, E.W * 6, 40);
    rr(g, 220, GY - 720, 300, 90, 8); g.fillStyle = '#15121a'; g.fill(); text(g, 'PLATFORM 2', 370, GY - 690, { size: 26, font: 'Nunito', weight: 900, color: '#ffc04a' }); text(g, o.sign || '18:42  NORTHGATE', 370, GY - 656, { size: 20, font: 'Nunito', weight: 800, color: '#ffe9c0' });
    bench(g, -160, GY); FX.pool(g, CX, GY + 40, 800, 60, M.key, .14); });
  return { GY, CX, M, spots: {} };
}
// LIFT: a small steel box; the floor indicator counts
export function lift(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = GYf(), CX = E.W / 2;
  layer(g, cam, .6, g => { g.fillStyle = '#39404e'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.fillStyle = linGrad(g, CX - 520, 0, CX + 520, 0, ['#5a6474', '#7a8494', '#5a6474']); g.fillRect(CX - 520, GY - 760, 1040, 760);
    seg(g, [[CX, GY - 760], [CX, GY]], 6, '#2a303c'); for (const x of [CX - 520, CX + 520]) seg(g, [[x, GY - 760], [x, GY]], 14, '#2a303c');
    rr(g, CX - 110, GY - 850, 220, 70, 8); g.fillStyle = '#10141c'; g.fill(); text(g, '▲ ' + (3 + Math.floor(t * .8) % 9), CX, GY - 815, { size: 38, font: 'Nunito', weight: 900, color: '#ff8a4a' });
    rr(g, CX + 560, GY - 420, 70, 200, 8); g.fillStyle = '#2a303c'; g.fill(); for (let k = 0; k < 4; k++) circle(g, CX + 595, GY - 385 + k * 44, 12, k === 1 ? '#ffb45a' : '#8a94a4');
    seg(g, [[CX - 500, GY - 300], [CX + 500, GY - 300]], 10, '#aab4c4'); glow(g, CX, GY - 900, 700, '#dfe8ff', .22); });
  layer(g, cam, .85, g => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#2a303c', '#151820']); g.fillRect(-E.W, GY, E.W * 3, E.H); });
  return { GY, CX, M, spots: {} };
}
export const SETS = { cafe, bedroom, office, canteen, train, street, hall, platform, lift };

