// LAB: Capital-Case-style test (study §4): flat 2D cartoon history explainer, thin dark outlines, round heads + dot eyes,
// period costume = identity, painted flat sets, black serif chapter cards, an org-chart diagram. Our own archetype cast + invented companies
// ("Cornelius Hale", HALE OIL, the HALE TRUST). 16:9 1920x1080, 30 fps, 18 s.
export const W = 1920, H = 1080, DURATION = 18.0;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => { k = clamp(k); return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }, eout = k => 1 - Math.pow(1 - clamp(k), 3);
const back = k => { k = clamp(k) - 1; return k * k * (2.7 * k + 1.7) + 1; };
const hash = (a, b = 0) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
const INK = '#2b2622', LW = 4;
function shape(g, fill, draw, lw = LW) { g.beginPath(); draw(); g.fillStyle = fill; g.fill(); g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
const rr = (g, x, y, w, h, r) => { g.roundRect(x, y, w, h, r); };

// ---------- the figure: round head, dot eyes, costume. o: {skin, suit, shirt, hat:'top'|'bowler'|'cap'|null, tache:'walrus'|'thin'|null, beard, expr, walk, facing, arm}
function guy(g, x, y, s, o = {}, t = 0) {
  g.save(); g.translate(x, y); g.scale(s * (o.facing ?? 1), s);
  const ph = o.walk ? t * 9 : 0, sw = Math.sin(ph), bob = o.walk ? Math.abs(Math.cos(ph)) * 4 : Math.sin(t * 2) * 1.2;
  const suit = o.suit || '#3a3a44', pants = o.pants || '#2c2c34';
  // legs
  [[-1, sw], [1, -sw]].forEach(([s2, a]) => { g.save(); g.translate(s2 * 12, -92); g.rotate(a * .45); shape(g, pants, () => rr(g, -9, 0, 18, 88, 8)); shape(g, '#1e1b1a', () => g.ellipse(6, 90, 17, 8, 0, 0, 7)); g.restore(); });
  g.translate(0, -bob);
  // arms (back)
  const arm = (side, ang) => { g.save(); g.translate(side * 30, -175); g.rotate(ang); shape(g, suit, () => rr(g, -9, 0, 18, 70, 9)); shape(g, o.skin || '#f1cfa8', () => g.arc(0, 74, 10, 0, 7)); g.restore(); };
  arm(-1, o.arm?.[0] ?? (o.walk ? -sw * .4 : .12));
  // body: coat
  shape(g, suit, () => { g.moveTo(-34, -185); g.lineTo(34, -185); g.lineTo(42, -88); g.lineTo(-42, -88); g.closePath(); });
  shape(g, o.shirt || '#efe8dc', () => { g.moveTo(-10, -185); g.lineTo(10, -185); g.lineTo(0, -150); g.closePath(); }, 3);
  if (o.tie) shape(g, o.tie, () => { g.moveTo(-5, -178); g.lineTo(5, -178); g.lineTo(3, -140); g.lineTo(-3, -140); g.closePath(); }, 2);
  if (o.watch) { g.strokeStyle = '#d9a83a'; g.lineWidth = 3; g.beginPath(); g.arc(-14, -130, 14, .2, 2.4); g.stroke(); }
  [-1, 1].forEach(s2 => { g.fillStyle = INK; g.beginPath(); g.arc(0, -165 + s2 * 0 + (s2 > 0 ? 28 : 0), 3, 0, 7); g.fill(); });
  arm(1, o.arm?.[1] ?? (o.walk ? sw * .4 : -.12));
  // head
  const hx = 0, hy = -232, R = 46; shape(g, o.skin || '#f1cfa8', () => g.arc(hx, hy, R, 0, 7));
  shape(g, o.skin || '#f1cfa8', () => g.arc(hx + 40, hy + 4, 9, 0, 7), 3);   // ear-ish nose bump toward facing side
  if (o.hair) shape(g, o.hair, () => { g.arc(hx, hy, R, Math.PI * 1.05, Math.PI * 1.75); g.lineTo(hx - 10, hy - 20); g.closePath(); }, 3);
  // face
  const ex = o.expr || 'neutral', blink = ((t + (o.seed || 0)) % 3.4) < .1; g.fillStyle = INK;
  [[8, -10], [30, -10]].forEach(([dx, dy]) => { g.beginPath(); if (blink) { g.fillRect(hx + dx - 5, hy + dy, 10, 2.5); } else { g.ellipse(hx + dx, hy + dy, 4.5, ex === 'wide' ? 8 : 6, 0, 0, 7); g.fill(); } });
  g.strokeStyle = INK; g.lineWidth = 3.5;
  if (ex === 'angry') { g.beginPath(); g.moveTo(hx, hy - 26); g.lineTo(hx + 14, hy - 20); g.moveTo(hx + 38, hy - 26); g.lineTo(hx + 24, hy - 20); g.stroke(); }
  if (ex === 'smug') { g.beginPath(); g.moveTo(hx + 2, hy - 22); g.lineTo(hx + 14, hy - 24); g.moveTo(hx + 24, hy - 26); g.lineTo(hx + 37, hy - 21); g.stroke(); }
  if (o.tache === 'walrus') shape(g, o.hairC || '#5a4030', () => { g.moveTo(hx + 4, hy + 14); g.quadraticCurveTo(hx + 20, hy + 2, hx + 38, hy + 14); g.quadraticCurveTo(hx + 20, hy + 24, hx + 4, hy + 14); }, 2.5);
  if (o.tache === 'thin') { g.strokeStyle = o.hairC || INK; g.lineWidth = 4; g.beginPath(); g.moveTo(hx + 8, hy + 12); g.quadraticCurveTo(hx + 20, hy + 6, hx + 34, hy + 10); g.stroke(); }
  if (o.beard) shape(g, o.hairC || '#8a8a8a', () => { g.arc(hx + 6, hy + 14, 34, .05 * Math.PI, .95 * Math.PI); g.closePath(); }, 3);
  if (ex === 'smile' || ex === 'smug') { g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.arc(hx + 21, hy + 18, 10, .2, Math.PI - .2); g.stroke(); }
  if (ex === 'angry' || ex === 'wide') { g.beginPath(); g.fillStyle = INK; g.ellipse(hx + 21, hy + 26, 6, ex === 'wide' ? 8 : 3, 0, 0, 7); g.fill(); }
  // hats
  if (o.hat === 'top') { shape(g, '#1f1d22', () => rr(g, -36, hy - 112, 72, 76, 4)); shape(g, '#1f1d22', () => rr(g, -56, hy - 42, 112, 12, 6)); g.fillStyle = '#7a1f22'; g.fillRect(-35, hy - 52, 70, 10); }
  if (o.hat === 'bowler') { shape(g, o.hatC || '#2a2522', () => { g.arc(0, hy - 34, 40, Math.PI, 0); g.closePath(); }); shape(g, o.hatC || '#2a2522', () => rr(g, -54, hy - 38, 108, 10, 5)); }
  if (o.hat === 'cap') { shape(g, o.hatC || '#6b5a44', () => { g.ellipse(0, hy - 36, 46, 18, 0, Math.PI, 0); g.closePath(); }); shape(g, o.hatC || '#6b5a44', () => rr(g, 10, hy - 40, 52, 9, 4)); }
  g.restore();
}
const HALE = { suit: '#2f2c38', shirt: '#f2ece2', tie: '#7a1f22', hat: 'top', tache: 'walrus', hairC: '#6a4a32', watch: true };
const RIVAL = (c, i) => ({ suit: c, pants: '#3a332c', hat: i % 2 ? 'bowler' : 'cap', hatC: ['#3a2f26', '#5a4a3a', '#2a2522'][i % 3], tache: i % 3 ? 'thin' : null, beard: i === 2, hairC: '#7a7a7a', seed: i });

// ---------- sets
function sky(g, a, b) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
function hills(g, y, col, amp, f, off) { g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, y - Math.sin(x * f + off) * amp - Math.sin(x * f * 2.3 + off) * amp * .4); g.lineTo(W, H); g.closePath(); g.fillStyle = col; g.fill(); }
function derrick(g, x, y, s, t, i) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = INK; g.lineWidth = 5;
  shape(g, '#8a6a48', () => { g.moveTo(-60, 0); g.lineTo(-8, -320); g.lineTo(8, -320); g.lineTo(60, 0); g.closePath(); }, 4);
  g.fillStyle = '#f2dcae'; g.beginPath(); g.moveTo(-44, -6); g.lineTo(-6, -300); g.lineTo(6, -300); g.lineTo(44, -6); g.closePath(); g.fill();
  g.strokeStyle = '#8a6a48'; g.lineWidth = 6; for (let k = 1; k < 7; k++) { const yy = -k * 44, w = 60 - k * 7.5; g.beginPath(); g.moveTo(-w, yy); g.lineTo(w, yy - 40); g.moveTo(w, yy); g.lineTo(-w, yy - 40); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-60, 0); g.lineTo(-8, -320); g.lineTo(8, -320); g.lineTo(60, 0); g.stroke();
  // pump jack beam
  const a = Math.sin(t * 3 + i) * .25; g.save(); g.translate(90, -70); g.rotate(a); shape(g, '#4a4440', () => rr(g, -70, -8, 140, 16, 6)); shape(g, '#4a4440', () => { g.arc(70, 0, 16, -1.6, 1.6); g.closePath(); }); g.restore();
  shape(g, '#5a524a', () => { g.moveTo(80, 0); g.lineTo(90, -70); g.lineTo(100, 0); g.closePath(); }, 3);
  g.restore();
}
function barrel(g, x, y, s = 1, lab = true) { g.save(); g.translate(x, y); g.scale(s, s); shape(g, '#a8643a', () => rr(g, -30, -80, 60, 80, 10)); g.strokeStyle = INK; g.lineWidth = 4; [-58, -22].forEach(yy => { g.beginPath(); g.moveTo(-30, yy); g.lineTo(30, yy); g.stroke(); });
  if (lab) { g.fillStyle = '#f2e4c8'; g.font = '700 15px Lora'; g.textAlign = 'center'; g.fillText('HALE', 0, -36); } g.restore(); }
function trainCar(g, x, y, kind, t) {
  g.save(); g.translate(x, y);
  [-90, 90].forEach(dx => { shape(g, '#2a2626', () => g.arc(dx, -20, 26, 0, 7)); g.save(); g.translate(dx, -20); g.rotate(-t * 8); g.strokeStyle = '#8a8a8a'; g.lineWidth = 3; g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.moveTo(0, -18); g.lineTo(0, 18); g.stroke(); g.restore(); });
  shape(g, '#3a3434', () => rr(g, -140, -50, 280, 16, 4));
  if (kind === 'tank') { shape(g, '#2f2c38', () => rr(g, -130, -150, 260, 100, 50)); g.fillStyle = '#e8d6b0'; g.font = '700 34px Lora'; g.textAlign = 'center'; g.fillText('HALE OIL', 0, -88); shape(g, '#2f2c38', () => rr(g, -16, -170, 32, 22, 4)); }
  else { shape(g, '#7a2a24', () => rr(g, -130, -160, 260, 110, 8)); shape(g, '#2a2626', () => rr(g, 60, -230, 34, 80, 4)); shape(g, '#2a2626', () => rr(g, -130, -190, 120, 40, 6));
    for (let i = 0; i < 4; i++) { const k = ((t * 1.2 + i * .25) % 1), r = 20 + k * 50; g.fillStyle = `rgba(235,232,226,${.75 * (1 - k)})`; g.beginPath(); g.arc(77 - k * 160, -240 - k * 160, r, 0, 7); g.fill(); } }
  g.restore();
}
// ---------- scenes
function titleCard(g, t, a, b) { g.fillStyle = '#0c0b0a'; g.fillRect(0, 0, W, H); const k = eout(seg(t, .15, .8));
  g.globalAlpha = k; g.fillStyle = '#d8cfbf'; g.font = '500 30px PopM'; g.textAlign = 'center'; g.fillText(a, W / 2, H / 2 - 40);
  g.font = 'italic 600 64px Lora'; g.fillStyle = '#f4ecdc'; g.fillText(b, W / 2, H / 2 + 40); g.fillRect(W / 2 - 60 * k, H / 2 + 80, 120 * k, 2); g.globalAlpha = 1; }
function oilfield(g, t) {
  const pan = eio(seg(t, 0, 5)) * 260; sky(g, '#f3c58a', '#f7e2b8');
  g.fillStyle = 'rgba(255,240,200,.8)'; g.beginPath(); g.arc(1500 - pan * .1, 260, 70, 0, 7); g.fill();
  g.save(); g.translate(-pan * .3, 0); hills(g, 640, '#d9a46a', 30, .003, 1); g.restore();
  g.save(); g.translate(-pan * .6, 0); for (let i = 0; i < 9; i++) derrick(g, 120 + i * 260, 700 - (i % 2) * 20, .55 + (i % 3) * .05, t, i); g.restore();
  g.save(); g.translate(-pan, 0); g.fillStyle = '#b98656'; g.fillRect(-200, 760, W + 800, H); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-200, 760); g.lineTo(W + 600, 760); g.stroke();
  for (let i = 0; i < 14; i++) barrel(g, 200 + i * 150 + (i % 2) * 40, 840 + (i % 3) * 30, .9 + (i % 2) * .1);
  guy(g, 520 + t * 140, 1000, 1.25, { ...HALE, walk: t < 4.2, expr: t > 4.3 ? 'smug' : 'smile', arm: t > 4.3 ? [.12, -2.2] : null }, t);
  // a worker rolling a barrel
  const wx = 1300 - t * 60; guy(g, wx, 990, 1.1, { ...RIVAL('#5a6a7a', 1), walk: true, facing: -1, expr: 'neutral' }, t + .3); barrel(g, wx - 110, 990, 1.1);
  g.restore();
  // ledger counter (in-world number)
  const n = Math.floor(eio(seg(t, 1.2, 4.6)) * 1000000); g.fillStyle = 'rgba(20,16,12,.82)'; g.beginPath(); g.roundRect(70, 70, 470, 110, 14); g.fill();
  g.fillStyle = '#e9c76a'; g.font = '600 26px PopM'; g.textAlign = 'left'; g.fillText('BARRELS A YEAR', 100, 112); g.font = '700 50px Lora'; g.fillStyle = '#fff6e2'; g.fillText(n.toLocaleString('en-US'), 100, 162);
}
function railway(g, t) {
  sky(g, '#bcd3d8', '#eadfc6'); hills(g, 560, '#9fb38a', 40, .0025, 2); hills(g, 640, '#86a070', 25, .004, 5);
  g.fillStyle = '#c9b48e'; g.fillRect(0, 700, W, H); g.fillStyle = '#7a6a56'; g.fillRect(0, 900, W, 26);
  for (let x = -40; x < W + 40; x += 46) { g.fillStyle = '#5a4a3a'; g.fillRect(x, 926, 26, 10); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 924); g.lineTo(W, 924); g.stroke();
  // station platform + the rivals
  shape(g, '#cdbb9a', () => rr(g, 1200, 420, 620, 260, 4)); shape(g, '#7a2a24', () => { g.moveTo(1170, 430); g.lineTo(1510, 300); g.lineTo(1850, 430); g.closePath(); }); g.fillStyle = INK; g.font = '700 30px Lora'; g.textAlign = 'center'; g.fillStyle = '#f4ecdc'; g.fillText('GRANGE STATION', 1510, 408);
  shape(g, '#a6886a', () => rr(g, 1140, 690, 740, 40, 6));
  for (let i = 0; i < 3; i++) guy(g, 1330 + i * 170, 700, .9, { ...RIVAL(['#6a5a3a', '#4a5a6a', '#5a3a3a'][i], i), expr: t > 2.2 ? 'angry' : 'wide', facing: -1 }, t + i);
  // train passes right → left
  const tx = W + 300 - t * 620; for (let i = 0; i < 8; i++) trainCar(g, tx + i * 290, 910, i === 0 ? 'engine' : 'tank', t);
  g.fillStyle = 'rgba(20,16,12,.82)'; g.beginPath(); g.roundRect(70, 70, 620, 110, 14); g.fill(); g.fillStyle = '#e9c76a'; g.font = '600 26px PopM'; g.textAlign = 'left'; g.fillText('SECRET RAILROAD DISCOUNT', 100, 112);
  g.font = '700 50px Lora'; g.fillStyle = '#fff6e2'; g.fillText('−' + Math.round(eio(seg(t, .6, 2)) * 50) + '%', 100, 162);
}
function trust(g, t) {
  g.fillStyle = '#efe6d4'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(80,60,40,.08)'; g.lineWidth = 2; for (let x = 0; x < W; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const top = [W / 2, 260], k0 = back(seg(t, .1, .6));
  const kids = [['GRANGE REFINING', 240], ['NORTHFIELD OIL', 640], ['ATLAS PIPELINE', 1040], ['BAYLOR KEROSENE', 1440], ['IRONVALE BARRELS', 1760]];
  kids.forEach(([name, x], i) => { const a = seg(t, .9 + i * .35, 1.3 + i * .35); if (a <= 0) return; const y = 720;
    g.strokeStyle = INK; g.lineWidth = 4; g.setLineDash([]); g.beginPath(); g.moveTo(top[0], top[1] + 70); g.lineTo(top[0], 470); g.lineTo(lerp(top[0], x, eout(a)), 470); if (a > .8) g.lineTo(x, y - 60); g.stroke();
    const s = back(seg(t, 1.1 + i * .35, 1.5 + i * .35)); if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s);
    shape(g, '#fff9ee', () => rr(g, -170, -60, 340, 120, 14)); g.fillStyle = INK; g.font = '700 28px Lora'; g.textAlign = 'center'; g.fillText(name, 0, 10);
    if (t > 3.6 + i * .12) { g.fillStyle = '#7a1f22'; g.font = '600 20px PopM'; g.fillText('OWNED BY HALE', 0, 44); } g.restore(); });
  g.save(); g.translate(...top); g.scale(k0, k0); shape(g, '#2f2c38', () => rr(g, -230, -80, 460, 160, 18)); g.fillStyle = '#f4ecdc'; g.font = '700 46px Lora'; g.textAlign = 'center'; g.fillText('THE HALE TRUST', 0, 16); g.restore();
  guy(g, 1720, 360, .7, { ...HALE, expr: 'smug' }, t);
}
function boardroom(g, t) {
  sky(g, '#5a3a2c', '#3a2620'); g.fillStyle = '#6a4632'; g.fillRect(0, 0, W, 640); for (let x = 60; x < W; x += 220) { g.fillStyle = '#7a5440'; g.fillRect(x, 0, 140, 640); }
  shape(g, '#c9b48e', () => rr(g, 760, 90, 400, 280, 6)); g.fillStyle = '#6a8aa0'; g.fillRect(780, 110, 360, 240); g.fillStyle = '#8aa0b0'; for (let i = 0; i < 6; i++) g.fillRect(800 + i * 56, 230 - i * 14, 30, 120 + i * 14);
  g.fillStyle = '#2a1c16'; g.fillRect(0, 640, W, H);
  const slam = t > 2.0 && t < 2.3, sh = slam ? Math.sin(t * 90) * 6 : 0; g.save(); g.translate(0, sh);
  // seated rivals around the table (bowlers)
  for (let i = 0; i < 4; i++) { const x = 330 + i * 330 + (i > 1 ? 280 : 0); guy(g, x, 900, 1.05, { ...RIVAL(['#5a4a3a', '#3a4a5a', '#4a3a3a', '#5a5a44'][i], i), facing: i < 2 ? 1 : -1, expr: t > 2.1 ? 'wide' : 'neutral' }, t + i); }
  guy(g, W / 2, 900, 1.25, { ...HALE, expr: t > 1.9 ? 'angry' : 'smug', arm: t > 1.7 ? [.1, t < 2.0 ? -2.6 : -.4] : [.1, -.1] }, t);
  shape(g, '#5a3220', () => { g.moveTo(140, 800); g.lineTo(W - 140, 800); g.lineTo(W - 40, 940); g.lineTo(40, 940); g.closePath(); });
  shape(g, '#efe6d4', () => { g.moveTo(W / 2 - 110, 830); g.lineTo(W / 2 + 110, 830); g.lineTo(W / 2 + 125, 880); g.lineTo(W / 2 - 125, 880); g.closePath(); }, 3); g.fillStyle = INK; g.font = '700 18px Lora'; g.textAlign = 'center'; g.fillText('SELL TO HALE — OR ELSE', W / 2, 862);
  g.restore();
  if (slam) { g.strokeStyle = INK; g.lineWidth = 5; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .35; g.beginPath(); g.moveTo(W / 2 + 120 + Math.cos(a) * 40, 780 + Math.sin(a) * 40); g.lineTo(W / 2 + 120 + Math.cos(a) * 80, 780 + Math.sin(a) * 80); g.stroke(); } }
}
const SCENES = [[0, 2.4, (g, t) => titleCard(g, t, 'CHAPTER ONE', 'The Kerosene King')], [2.4, 7.4, oilfield], [7.4, 11.0, railway], [11.0, 15.0, trust], [15.0, 18.0, boardroom]];
const SUBS = [[2.6, 'In 1865, Cornelius Hale owned one small refinery.'], [5.0, 'Within five years he was moving a million barrels.'], [7.6, 'His secret? The railroads.'], [9.0, 'He shipped so much oil, they gave him a discount nobody else got.'],
  [11.2, 'Then he formed the Hale Trust,'], [12.8, 'and one by one, his rivals stopped being rivals.'], [15.2, 'Those who refused got one meeting.'], [16.8, 'Just one.']];
export function render(g, t) {
  const sc = SCENES.find(s => t >= s[0] && t < s[1]) || SCENES[SCENES.length - 1]; const lt = t - sc[0];
  g.save(); const z = 1 + .03 * (lt / (sc[1] - sc[0])); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2); sc[2](g, lt); g.restore();
  const fade = Math.min(seg(t, sc[0], sc[0] + .25), 1 - seg(t, sc[1] - .2, sc[1])); if (sc[0] > 0 && fade < 1) { g.fillStyle = `rgba(12,11,10,${1 - fade})`; g.fillRect(0, 0, W, H); }
  // subtitles: small, white on a soft dark bar (Capital Case reads like a documentary)
  let s = null; for (const [a, str] of SUBS) if (t >= a && t < a + 2.6) s = str;
  if (s && sc[0] > 0) { g.font = '40px PopM'; g.textAlign = 'center'; const w = g.measureText(s).width + 60; g.fillStyle = 'rgba(10,9,8,.72)'; g.beginPath(); g.roundRect(W / 2 - w / 2, H - 132, w, 66, 12); g.fill(); g.fillStyle = '#fbf6ec'; g.fillText(s, W / 2, H - 86); }
  g.font = '22px PopM'; g.fillStyle = 'rgba(255,255,255,.4)'; g.textAlign = 'right'; g.fillText('LAB TEST', W - 30, 40);
}
