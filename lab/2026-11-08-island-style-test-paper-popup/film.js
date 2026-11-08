// The Keeper's Island · STYLE TEST "The Bottle That Lied" (9:16, 24 s). Style: lemo paper-popup grammar, rendered in 2D canvas:
// a pop-up book on a warm desk; every set piece and actor is a flat cut-paper card (dark-brown ink, off-white border, grey cardboard
// edge, paper grain) that RISES from the page with an overshoot, back to front. Gus is a paper puppet with brass split-pin joints.
// Captions: NEW "pull-tab" style: each phrase is printed on a torn paper strip that slides out of the page; the spoken word gets a
// yellow highlighter swipe, word-exact (timings from the voice model). No camera zooms: cuts are page turns.
export const W = 1080, H = 1920, DURATION = 24.0;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const back = t => { t = clamp(t); const s = 1.9; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const hash = (x, y = 0) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
const INK = '#3B2416', CREAM = '#FBF3E2', EDGE = '#9C9284';
// ------------------------------------------------------------------ paper card factory (cached)
let GRAIN;
function grain() { const c = new OffscreenCanvas(256, 256), g = c.getContext('2d'), d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (hash(i, 3) - .5) * 60 + (hash(i >> 9, 7) - .5) * 20; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; } g.putImageData(d, 0, 0); return c; }
const CACHE = new Map();
function card(key, w, h, draw, border = 12, edge = 6) {
  if (CACHE.has(key)) return CACHE.get(key);
  const P = border + edge + 4, art = new OffscreenCanvas(w + P * 2, h + P * 2), a = art.getContext('2d');
  a.translate(P, P); a.lineJoin = a.lineCap = 'round'; draw(a); a.setTransform(1, 0, 0, 1, 0, 0);
  const out = new OffscreenCanvas(w + P * 2, h + P * 2), o = out.getContext('2d');
  const ring = (r, col, dy) => { const s = new OffscreenCanvas(out.width, out.height), q = s.getContext('2d');
    for (let k = 0; k < 24; k++) { const an = k / 24 * Math.PI * 2; q.drawImage(art, Math.cos(an) * r, Math.sin(an) * r + dy); }
    q.globalCompositeOperation = 'source-in'; q.fillStyle = col; q.fillRect(0, 0, s.width, s.height); return s; };
  o.drawImage(ring(border, EDGE, edge), 0, 0); o.drawImage(ring(border, CREAM, 0), 0, 0); o.drawImage(art, 0, 0);
  o.globalCompositeOperation = 'source-atop'; o.fillStyle = o.createPattern(GRAIN, 'repeat'); o.fillRect(0, 0, out.width, out.height);
  const c = { cv: out, P, w, h }; CACHE.set(key, c); return c;
}
// draw a card standing on the page: (x, y) = bottom-centre; rise 0..1 = lying flat -> standing (with overshoot); sh = cast shadow
function stand(ctx, c, x, y, rise = 1, o = {}) {
  const k = rise >= 1 ? 1 : back(rise); if (k <= 0.001) return;
  const sc = o.s || 1, rot = o.rot || 0, flip = o.flip ? -1 : 1;
  // shadow: the cut-out silhouette, flattened onto the page away from the lamp (lamp at upper left)
  ctx.save(); ctx.translate(x + 18 * sc, y); ctx.transform(1, 0, .55, -.22 * clamp(k), 0, 0); ctx.scale(sc * flip, sc); ctx.globalAlpha = .22 * clamp(k); ctx.filter = 'blur(6px) brightness(0)';
  ctx.drawImage(c.cv, -c.cv.width / 2, -c.cv.height + c.P); ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc * flip, sc * Math.max(.02, k)); ctx.transform(1, 0, (1 - clamp(k)) * .25, 1, 0, 0);
  ctx.drawImage(c.cv, -c.cv.width / 2, -c.cv.height + c.P);
  if (k < 1) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = `rgba(60,40,20,${(1 - clamp(k)) * .35})`; ctx.fillRect(-c.cv.width / 2, -c.cv.height, c.cv.width, c.cv.height); }
  ctx.restore();
}
// ------------------------------------------------------------------ art (wobbly ink drawings)
const wob = (ctx, pts, close = true, amp = 2, seed = 1) => { ctx.beginPath(); pts.forEach(([x, y], i) => { const dx = (hash(i, seed) - .5) * amp, dy = (hash(i, seed + 9) - .5) * amp; i ? ctx.lineTo(x + dx, y + dy) : ctx.moveTo(x + dx, y + dy); }); if (close) ctx.closePath(); };
const ell = (cx, cy, rx, ry, n = 28, seed = 3) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, j = 1 + (hash(i, seed) - .5) * .05; return [cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]; });
const fillInk = (ctx, col, lw = 5) => { ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke(); };
function waveArt(w, col, dark, amp, seed) { return a => {
  const pts = [[0, 120]]; for (let x = 0; x <= w; x += 20) pts.push([x, 40 + Math.sin(x / 70 + seed) * amp + Math.sin(x / 23 + seed * 2) * 4]); pts.push([w, 120]);
  wob(a, pts, true, 1.5, seed); fillInk(a, col, 5);
  a.strokeStyle = dark; a.lineWidth = 4; for (let x = 30; x < w; x += 90) { a.beginPath(); a.arc(x, 62 + Math.sin(x / 70 + seed) * amp, 18, Math.PI * 1.1, Math.PI * 1.9); a.stroke(); }
}; }
function islandArt(a) {
  wob(a, [[0, 230], [40, 170], [120, 140], [210, 150], [300, 175], [380, 230]], true, 3, 4); fillInk(a, '#D9B26A', 5);              // sand
  wob(a, [[60, 175], [120, 120], [200, 110], [270, 135], [320, 178]], true, 3, 5); fillInk(a, '#6E9F5A', 5);                          // grass
  a.fillStyle = '#5B8A4B'; wob(a, [[150, 145], [190, 128], [230, 140], [200, 152]], true, 2, 6); a.fill();
}
function lighthouseArt(a) {
  wob(a, [[30, 330], [50, 70], [110, 70], [130, 330]], true, 2, 7); fillInk(a, CREAM, 5);
  a.save(); a.clip(); a.fillStyle = '#D9473B'; for (let y = 100; y < 330; y += 80) a.fillRect(0, y, 160, 40); a.restore(); wob(a, [[30, 330], [50, 70], [110, 70], [130, 330]], true, 2, 7); a.strokeStyle = INK; a.lineWidth = 5; a.stroke();
  wob(a, [[40, 70], [120, 70], [120, 40], [40, 40]], true, 1, 8); fillInk(a, '#F6D35B', 4);
  wob(a, [[30, 42], [80, 0], [130, 42]], true, 1, 9); fillInk(a, '#D9473B', 5);
  wob(a, [[62, 330], [62, 280], [98, 280], [98, 330]], true, 1, 10); fillInk(a, '#6B4A33', 4);
}
function bottleArt(barn) { return a => {   // a green bottle with a cork (and barnacles on the insert version)
  wob(a, [[60, 0], [100, 0], [100, 60], [130, 110], [140, 330], [20, 330], [30, 110], [60, 60]], true, 2, 11); fillInk(a, 'rgba(110,170,140,0.92)', 6);
  a.fillStyle = 'rgba(255,255,255,0.35)'; wob(a, [[45, 130], [58, 115], [60, 300], [45, 300]], true, 1, 12); a.fill();
  wob(a, [[58, -40], [102, -40], [100, 6], [60, 6]], true, 1, 13); fillInk(a, '#B98A55', 5);
  a.save(); wob(a, [[60, 0], [100, 0], [100, 60], [130, 110], [140, 330], [20, 330], [30, 110], [60, 60]], true, 2, 11); a.clip();   // the rolled note inside
  if (!barn) { a.fillStyle = CREAM; a.fillRect(55, 150, 50, 160); a.strokeStyle = INK; a.lineWidth = 3; a.strokeRect(55, 150, 50, 160); } a.restore();
  if (barn) for (let i = 0; i < 15; i++) { const x = 20 + hash(i, 2) * 120, y = 190 + hash(i, 3) * 140, r = 15 + hash(i, 4) * 13;
    wob(a, [[x - r, y + r * .5], [x - r * .8, y - r * .1], [x - r * .45, y - r * .75], [x + r * .45, y - r * .8], [x + r * .85, y - r * .1], [x + r, y + r * .5]], true, 2.5, 40 + i); fillInk(a, '#D8D0BE', 3);
    a.fillStyle = '#B3A994'; wob(a, [[x + r * .1, y - r * .7], [x + r * .45, y - r * .8], [x + r * .85, y - r * .1], [x + r, y + r * .5], [x + r * .2, y + r * .5]], true, 1.5, 60 + i); a.fill();
    a.fillStyle = '#5E5649'; a.beginPath(); a.ellipse(x, y - r * .62, r * .32, r * .14, 0, 0, Math.PI * 2); a.fill();
    a.strokeStyle = '#8F8673'; a.lineWidth = 2; a.beginPath(); a.moveTo(x - r * .5, y - r * .3); a.lineTo(x - r * .65, y + r * .4); a.moveTo(x, y - r * .45); a.lineTo(x, y + r * .45); a.stroke(); }
}; }
function noteArt(a) {
  wob(a, [[0, 20], [620, 0], [640, 340], [10, 360]], true, 4, 14); fillInk(a, '#F7ECD2', 5);
  a.fillStyle = INK; a.font = '64px Hand'; a.fillText('HELP!', 50, 105); a.font = '52px Hand'; a.fillText('My ship sank', 50, 185); a.fillStyle = '#B5322A'; a.fillText('yesterday.', 50, 255);
  a.fillStyle = INK; a.font = '40px Hand'; a.fillText('— Capt. R.', 380, 320);
}
// Gus as a paper puppet: separate cards for body, head (face states), and two arms pinned at the shoulder
function gusBody(a) {
  wob(a, [[10, 0], [150, 0], [160, 170], [0, 170]], true, 2, 21); fillInk(a, CREAM, 5);
  a.save(); a.clip(); a.fillStyle = '#E2624E'; for (let y = 22; y < 170; y += 44) a.fillRect(0, y, 170, 22); a.restore(); wob(a, [[10, 0], [150, 0], [160, 170], [0, 170]], true, 2, 21); a.strokeStyle = INK; a.lineWidth = 5; a.stroke();
  wob(a, [[8, 170], [152, 170], [148, 300], [92, 300], [80, 220], [68, 300], [12, 300]], true, 2, 22); fillInk(a, '#283A63', 5);
  wob(a, [[0, 300], [70, 300], [72, 330], [-8, 330]], true, 1, 23); fillInk(a, '#2B1D14', 4); wob(a, [[90, 300], [160, 300], [168, 330], [88, 330]], true, 1, 24); fillInk(a, '#2B1D14', 4);
}
function gusHead(state) { return a => {
  wob(a, ell(90, 100, 78, 74, 30, 31), true, 1.5, 31); fillInk(a, '#F2C8A0', 5);
  wob(a, [[22, 112], [60, 150], [90, 190], [122, 150], [160, 112], [150, 165], [90, 215], [30, 165]], true, 3, 32); fillInk(a, '#FFFFFF', 5);   // beard
  wob(a, ell(90, 118, 15, 12, 16, 33), true, 1, 33); fillInk(a, '#E0675B', 4);                                                                   // nose
  wob(a, [[8, 62], [30, 10], [150, 10], [172, 62]], true, 2, 34); fillInk(a, '#283A63', 5); wob(a, [[0, 62], [180, 62], [176, 78], [4, 78]], true, 1, 35); fillInk(a, '#1E2C4C', 4);
  wob(a, ell(90, 38, 14, 11, 14, 36), true, 1, 36); fillInk(a, '#E6B84A', 3);                                                                    // badge
  a.fillStyle = INK; a.strokeStyle = INK; a.lineWidth = 5;
  if (state.blink) { a.beginPath(); a.moveTo(50, 100); a.lineTo(72, 100); a.moveTo(108, 100); a.lineTo(130, 100); a.stroke(); }
  else { a.beginPath(); a.ellipse(61, 98, 7, state.wide ? 12 : 9, 0, 0, Math.PI * 2); a.ellipse(119, 98, 7, state.wide ? 12 : 9, 0, 0, Math.PI * 2); a.fill(); }
  a.lineWidth = 6; const bu = state.aha ? -14 : state.squint ? 6 : 0;                                                                              // brows
  a.beginPath(); a.moveTo(45, 80 + bu); a.lineTo(76, 76 + bu + (state.squint ? 6 : 0)); a.moveTo(104, 76 + (state.squint ? 0 : bu)); a.lineTo(135, 80 + (state.squint ? -8 : bu)); a.stroke();
  if (state.aha) { a.beginPath(); a.ellipse(90, 160, 13, 16, 0, 0, Math.PI * 2); a.fillStyle = '#5A2A22'; a.fill(); a.stroke(); }
}; }
function gusArm(a) { wob(a, [[0, 0], [34, 0], [36, 120], [2, 120]], true, 1.5, 41); fillInk(a, '#E2624E', 5); wob(a, ell(19, 132, 20, 18, 14, 42), true, 1, 42); fillInk(a, '#F2C8A0', 4); }
function shipArt(a) { wob(a, [[0, 90], [240, 90], [210, 130], [30, 130]], true, 2, 51); fillInk(a, '#3D3A44', 5); wob(a, [[110, 90], [110, 0], [190, 80]], true, 2, 52); fillInk(a, '#6F6A78', 5); }
function calArt(n) { return a => { wob(a, [[0, 0], [260, 0], [260, 300], [0, 300]], true, 2, 61); fillInk(a, CREAM, 5); wob(a, [[0, 0], [260, 0], [260, 70], [0, 70]], true, 1, 62); fillInk(a, '#D9473B', 5);
  a.fillStyle = CREAM; a.font = '44px Pop'; a.textAlign = 'center'; a.fillText('DAY', 130, 52); a.fillStyle = INK; a.font = '150px Pop'; a.fillText(String(n), 130, 250); }; }
function signArt(a) { wob(a, [[0, 0], [760, 0], [760, 300], [0, 300]], true, 3, 71); fillInk(a, '#C79A62', 6);
  a.fillStyle = INK; a.textAlign = 'center'; a.font = '96px Pop'; a.fillText('WHO WROTE IT?', 380, 135); a.font = '46px Fred'; a.fillText('Your guess in the comments', 380, 205); a.font = '38px Fred'; a.fillStyle = '#8A3B2A'; a.fillText('Chapter 2 · Saturday', 380, 262); }
function dialArt(n) { return a => { wob(a, ell(120, 120, 118, 118, 36, 81), true, 1.5, 81); fillInk(a, '#F6D35B', 6); a.fillStyle = INK; a.font = '150px Pop'; a.textAlign = 'center'; a.fillText(String(n), 120, 172); }; }
function tabArt(txt, col) { return a => { a.font = '60px Pop'; const w = a.measureText(txt).width + 70; wob(a, [[0, 0], [w, 0], [w, 100], [0, 100]], true, 2, 91); fillInk(a, col, 5); a.fillStyle = INK; a.fillText(txt, 35, 72); }; }
// ------------------------------------------------------------------ the world
function desk(ctx, t) {   // warm wood desk + open book (2 pages, gutter), lamp pool upper-left
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#6B4429'); g.addColorStop(1, '#3E2616'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(30,15,5,0.25)'; ctx.lineWidth = 3; for (let i = 0; i < 26; i++) { ctx.beginPath(); const y = i * 80 + Math.sin(i) * 20; ctx.moveTo(0, y); ctx.bezierCurveTo(W * .3, y + 20, W * .7, y - 25, W, y + 10); ctx.stroke(); }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; ctx.fillStyle = '#EFE3C8'; ctx.fillRect(40, 120, W - 80, H - 240); ctx.restore();
  const pg = ctx.createLinearGradient(0, 120, 0, H - 120); pg.addColorStop(0, '#F7EEDB'); pg.addColorStop(.47, '#E8DCC0'); pg.addColorStop(.5, '#CDBF9F'); pg.addColorStop(.53, '#E8DCC0'); pg.addColorStop(1, '#F4EAD3');
  ctx.fillStyle = pg; ctx.fillRect(56, 136, W - 112, H - 272);
  ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.fillRect(56, 136, W - 112, H - 272);
}
function lamp(ctx) { const g = ctx.createRadialGradient(W * .2, H * .12, 50, W * .3, H * .3, H * .9); g.addColorStop(0, 'rgba(255,220,160,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0.38)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function backdrop(ctx, t, night) {   // the upright board (top page): paper sky with a cut-paper sun and clouds
  ctx.save(); ctx.beginPath(); ctx.rect(56, 136, W - 112, 820); ctx.clip();
  const g = ctx.createLinearGradient(0, 136, 0, 956); g.addColorStop(0, night ? '#2B3A63' : '#9FD0E6'); g.addColorStop(1, night ? '#5B5A86' : '#F3E0B5'); ctx.fillStyle = g; ctx.fillRect(56, 136, W - 112, 820);
  ctx.restore();
  stand(ctx, card('sun', 180, 180, a => { wob(a, ell(90, 90, 85, 85, 30, 2), true, 2, 2); fillInk(a, '#F6C445', 6); }), 820, 430 + Math.sin(t) * 6, 1);
  [[260, 360, 0], [700, 520, 1]].forEach(([x, y, i]) => stand(ctx, card('cloud' + i, 260, 110, a => { wob(a, [[0, 100], [20, 50], [70, 30], [110, 0], [170, 20], [220, 30], [260, 100]], true, 3, 5 + i); fillInk(a, '#FFFFFF', 5); }), x + Math.sin(t * .4 + i) * 20, y, 1));
}
function sea(ctx, t, rise, layer) {   // 4 wave strips; layer 'far' = first two, 'near' = last two (so things can sit between)
  const L = [[0, '#3E8FB0', '#2C6E8C', 18, 1040, 0], [1, '#4FA3C0', '#357F9D', 22, 1150, .12], [2, '#5DB5CE', '#3D8EA9', 24, 1290, .24], [3, '#73C6DA', '#4B9EB8', 26, 1440, .36]];
  L.filter(l => layer === 'far' ? l[0] < 3 : l[0] >= 3).forEach(([i, c, d, amp, y, dl]) => {
    const cc = card('wave' + i, 1180, 120, waveArt(1180, c, d, amp, i * 1.7));
    stand(ctx, cc, 540 + Math.sin(t * .8 + i * 1.3) * 26, y + Math.sin(t * 1.1 + i) * 8, seg(rise, dl, dl + .45));
  });
}
function gus(ctx, x, y, t, st, s = 1, armR = 0, armL = 0) {
  const body = card('gusBody', 160, 330, gusBody), arm = card('gusArm', 40, 155, gusArm);
  const k = st.rise ?? 1, bob = Math.sin(t * 2.2) * 3;
  stand(ctx, body, x, y, k, { s });
  if (k > .6) {
    const sy = y - 300 * s + bob, aph = clamp((k - .6) / .4);
    const pin = (ax, ang) => { ctx.save(); ctx.translate(ax, sy); ctx.rotate(ang); ctx.scale(s, s * aph); ctx.drawImage(arm.cv, -arm.cv.width / 2, -arm.P); ctx.restore();
      ctx.fillStyle = '#C9A24A'; ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ax, sy + 6 * s, 6 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); };   // brass split pin
    pin(x - 72 * s, .18 + armL + Math.sin(t * 1.7) * .04); pin(x + 72 * s, -.18 - armR - Math.sin(t * 1.5) * .04);
    const key = 'gusHead' + JSON.stringify(st.face || {}), head = card(key, 180, 220, gusHead(st.face || {}));
    stand(ctx, head, x + (st.look || 0) * 8, sy - 6 * s + bob * .5, 1, { s, rot: Math.sin(t * 1.3) * .03 + (st.tilt || 0) });
  }
}
// ------------------------------------------------------------------ scenes (page turns between them)
const PAGES = [0, 8.75, 13.55, 19.0];
function sceneWide(ctx, t, t0, part) {          // the island spread
  backdrop(ctx, t, false);
  const r = t - t0;
  sea(ctx, t, seg(r, 0, 1.2), 'far');
  stand(ctx, card('island', 380, 240, islandArt), 540, 1240, seg(r, .25, .8), { s: 1.6 });
  stand(ctx, card('lighthouse', 160, 340, lighthouseArt), 610, 1080, seg(r, .45, 1.0), { s: 1.25 });
  if (part === 'end') stand(ctx, card('ship', 240, 140, shipArt), 860, 1040 + Math.sin(t * 1.2) * 4, seg(t, 20.0, 20.8), { s: .6 });
  // Gus on the beach (enters at 5.9 in the opening; already there at the end)
  const gIn = part === 'end' ? 1 : seg(t, 5.85, 6.5);
  if (gIn > 0) {
    const look = part === 'end' ? 1 : (t > 7.2 ? 1 : 0), face = { blink: (t % 3.1) < .12, squint: part !== 'end' && t > 6.6 && t < 7.6, aha: part !== 'end' && t > 7.6, wide: part === 'end' && t > 21.0 };
    gus(ctx, 400, 1238, t, { rise: gIn, face, look, tilt: part === 'end' ? .06 : 0 }, .9, part === 'end' ? .9 : (t > 6.4 ? .8 : 0), 0);
  }
  // the bottle: bobbing in the near waves, then in Gus's raised hand
  const bc = card('bottle', 160, 380, bottleArt(false));
  if (part !== 'end' && t < 6.4) { const drift = seg(t, 3.3, 6.2); stand(ctx, bc, lerp(700, 520, ss(drift)) + Math.sin(t * .9) * 24, lerp(1430, 1330, ss(drift)) + Math.sin(t * 1.6) * 14, seg(r, .15, .6), { s: lerp(.95, .6, ss(drift)), rot: Math.sin(t * 1.4) * .22 }); }
  else stand(ctx, bc, 490, 960 + Math.sin(t * 2.2) * 3, 1, { s: .5, rot: -.3 });
  sea(ctx, t, seg(r, 0, 1.2), 'near');
  // the note pops out and unrolls (hook + reading)
  if (part !== 'end') { const k = seg(t, 2.6, 3.2) * (1 - seg(t, 5.55, 5.9)); if (k > 0) { const nc = card('note', 640, 360, noteArt); stand(ctx, nc, 540, 900, k, { s: 1.15, rot: -.04 }); } }
}
function sceneInsert(ctx, t, t0, answer) {     // close page: the bottle large on cream paper
  const r = t - t0;
  ctx.save(); ctx.fillStyle = '#EDE2C9'; ctx.fillRect(56, 136, W - 112, H - 272); ctx.restore();
  const bc = card('bottleB', 160, 380, bottleArt(true));
  stand(ctx, bc, 540, 1520 + Math.sin(t * 1.4) * 4, seg(r, 0, .45), { s: 2.35, rot: Math.sin(t * 1.1) * .02 });
  if (!answer) {
    const tab = card('tabLook', 520, 100, tabArt('PAUSE & LOOK', '#F6D35B')); stand(ctx, tab, 540, 400, seg(r, .4, .8));
    const n = t < 10.95 ? 3 : t < 11.95 ? 2 : t < 12.95 ? 1 : 0;
    if (n) { const dc = card('dial' + n, 240, 240, dialArt(n)); const kk = seg(t, [9.95, 10.95, 11.95][3 - n], [9.95, 10.95, 11.95][3 - n] + .35); stand(ctx, dc, 860, 700, kk, { s: .9, rot: (1 - back(kk)) * .5 }); }
  } else {
    // ink circle draws itself around the barnacles, then labels pop
    const k = seg(t, 13.75, 14.5); ctx.save(); ctx.strokeStyle = '#C0392B'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 60 * k; i++) { const a = i / 60 * Math.PI * 2.15 - 1.2, x = 545 + Math.cos(a) * 250 * (1 + Math.sin(i * .4) * .02), y = 1240 + Math.sin(a) * 150; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    stand(ctx, card('tabB', 500, 100, tabArt('BARNACLES', '#F6D35B')), 540, 470, seg(t, 14.0, 14.4));
    stand(ctx, card('tabW', 640, 100, tabArt('= WEEKS AT SEA', '#F4B6A0')), 540, 600, seg(t, 15.0, 15.4));
    if (t > 16.4) { const d = Math.min(30, 1 + Math.floor((t - 16.4) / 1.6 * 29)); stand(ctx, card('cal' + d, 260, 300, calArt(d)), 830, 1000, seg(t, 16.4, 16.8), { s: .85, rot: .06 }); }
  }
}
function pageTurn(ctx, t) {   // a quick paper page-turn wipe at each cut (a curling leaf crossing the frame)
  PAGES.slice(1).forEach(p => { const k = seg(t, p - .35, p + .1); if (k <= 0 || k >= 1) return; const x = W * (1 - ss(k) * 1.2);
    ctx.save(); const g = ctx.createLinearGradient(x - 160, 0, x + 40, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.7, 'rgba(0,0,0,0.25)'); g.addColorStop(1, '#F4EAD3');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 160, 136); ctx.quadraticCurveTo(x + 60, H / 2, x - 160, H - 136); ctx.lineTo(W, H - 136); ctx.lineTo(W, 136); ctx.closePath(); ctx.fill(); ctx.restore(); });
}
// ------------------------------------------------------------------ captions: "pull-tab" strip, word-exact highlighter
let V = [], WORDS = {};
export function setup(lines, durs, words = {}) {
  WORDS = words; let end = 0;
  V = lines.map(l => { const d = durs[l.id] ?? 2; const t = Math.max(l.start, end + .12); end = t + d; return { id: l.id, t, dur: d, text: l.text }; });
}
export function events() { return [...V.map(v => ({ t: v.t, type: 'vo', id: v.id })), ...SFX]; }
export function srtCues() { return V.map((v, i) => ({ t0: v.t, t1: Math.min(V[i + 1] ? V[i + 1].t - .05 : DURATION, v.t + v.dur + .5), text: v.text })); }
const SFX = [{ t: .25, type: 'sfx', id: 'pop' }, { t: .6, type: 'sfx', id: 'pop' }, { t: .85, type: 'sfx', id: 'pop' }, { t: 2.65, type: 'sfx', id: 'crinkle' }, { t: 5.6, type: 'sfx', id: 'fold' },
  { t: 5.9, type: 'sfx', id: 'pop' }, { t: 7.6, type: 'sfx', id: 'aha' }, ...PAGES.slice(1).map(p => ({ t: p - .3, type: 'sfx', id: 'page' })), { t: 9.25, type: 'sfx', id: 'pop' },
  { t: 9.95, type: 'sfx', id: 'tick' }, { t: 10.95, type: 'sfx', id: 'tick' }, { t: 11.95, type: 'sfx', id: 'tick' }, { t: 13.75, type: 'sfx', id: 'scribble' }, { t: 14.0, type: 'sfx', id: 'pop' },
  { t: 15.0, type: 'sfx', id: 'pop' }, { t: 16.4, type: 'sfx', id: 'flip' }, { t: 20.0, type: 'sfx', id: 'pop' }, { t: 21.6, type: 'sfx', id: 'thump' }];
function caption(ctx, t) {
  const cues = srtCues(); const i = cues.findIndex(q => t >= q.t0 - .25 && t < q.t1 + .3); if (i < 0) return;
  const c = cues[i], v = V[i], WT = WORDS[v.id] || [], words = c.text.split(/\s+/);
  const kin = back(seg(t, c.t0 - .25, c.t0 + .1)), kout = ss(seg(t, c.t1, c.t1 + .3));
  ctx.save(); ctx.font = '600 60px Fred'; const sp = ctx.measureText(' ').width;
  const lines = []; let cur = [], cw = 0; words.forEach((w, j) => { const ww = ctx.measureText(w).width; if (cw + ww > 860 && cur.length) { lines.push(cur); cur = []; cw = 0; } cur.push(j); cw += ww + sp; }); if (cur.length) lines.push(cur);
  const lh = 78, sh = lines.length * lh + 50, y0 = 1560;
  const sx = lerp(-W, 0, kin) + kout * W * 1.1;
  ctx.translate(sx, 0);
  // torn paper strip with a pull tab
  ctx.save(); ctx.shadowColor = 'rgba(40,20,5,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8; ctx.fillStyle = '#FBF5E6';
  ctx.beginPath(); ctx.moveTo(60, y0); for (let x = 60; x <= W - 60; x += 24) ctx.lineTo(x, y0 + (hash(x, 1) - .5) * 8); for (let x = W - 60; x >= 60; x -= 24) ctx.lineTo(x, y0 + sh + (hash(x, 2) - .5) * 8); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#D9473B'; ctx.beginPath(); ctx.roundRect(W - 120, y0 + sh / 2 - 34, 90, 68, 14); ctx.fill(); ctx.fillStyle = CREAM; ctx.font = '600 28px Fred'; ctx.fillText('PULL', W - 112, y0 + sh / 2 + 10);
  ctx.font = '600 60px Fred';
  lines.forEach((ln, li) => {
    const lw = ln.reduce((s, j) => s + ctx.measureText(words[j]).width + sp, -sp); let x = (W - 60) / 2 - lw / 2 + 10; const y = y0 + 25 + (li + 1) * lh - 14;
    ln.forEach(j => { const w = words[j], ww = ctx.measureText(w).width, a0 = WT[j] ? v.t + WT[j].t0 : v.t + j / words.length * v.dur, a1 = WT[j] ? v.t + WT[j].t1 : a0 + .3;
      const on = t >= a0 - .02, now = t >= a0 - .02 && t < a1 + .08;
      if (now || (on && t < c.t1)) { const hk = ss(seg(t, a0 - .02, a0 + .12)); ctx.fillStyle = now ? 'rgba(246,211,91,0.95)' : 'rgba(246,211,91,0.35)'; ctx.beginPath(); ctx.roundRect(x - 6, y - 50, (ww + 12) * hk, 62, 10); ctx.fill(); }
      ctx.fillStyle = on ? INK : 'rgba(59,36,22,0.28)'; ctx.fillText(w, x, y); x += ww + sp; });
  });
  ctx.restore();
}
// ------------------------------------------------------------------ render
export async function load() { GRAIN = grain(); }
export function render(ctx, t) {
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.setTransform(1, 0, 0, 1, 0, 0);
  desk(ctx, t);
  ctx.save(); ctx.beginPath(); ctx.rect(56, 136, W - 112, H - 272); ctx.clip();
  if (t < PAGES[1]) sceneWide(ctx, t, 0, 'open');
  else if (t < PAGES[2]) sceneInsert(ctx, t, PAGES[1], false);
  else if (t < PAGES[3]) sceneInsert(ctx, t, PAGES[2] - .45, true);
  else sceneWide(ctx, t, PAGES[3] - 1.3, 'end');
  if (t > 21.4) { const k = seg(t, 21.4, 22.2), sw = Math.sin((t - 21.4) * 5) * .06 * (1 - seg(t, 21.4, 23.4)); const sc = card('sign', 760, 300, signArt);       // sign drops on strings and swings
    const y = lerp(-200, 760, back(k)); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(250, 136); ctx.lineTo(250 + Math.sin(sw) * 200, y - 280); ctx.moveTo(830, 136); ctx.lineTo(830 + Math.sin(sw) * 200, y - 280); ctx.stroke();
    stand(ctx, sc, 540, y, 1, { rot: sw }); }
  pageTurn(ctx, t);
  ctx.restore();
  lamp(ctx);
  caption(ctx, t);
  const f = Math.min(ss(seg(t, 0, .3)), 1 - ss(seg(t, DURATION - .5, DURATION))); if (f < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - f})`; ctx.fillRect(0, 0, W, H); }
}
