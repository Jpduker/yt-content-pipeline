// Old Tales of the Island #1 "The Man Who Sold His Shadow": an original dark fable as a hanging scroll of nine
// portrait woodblock prints. 1080x1920, 24 fps, 56 s. Engine: print.js / traveler.js from lemo-opuscar's ukiyo-e
// demo (MIT), adapted to a portrait sheet. Figures step at 8 fps, water at 12 fps, the camera moves on ones.
import { clamp, lerp, seg, ss, eio, eo, hash, mulberry, vnoise, TAU } from './lib.js';
import { W, H, FR, PAL, TX, mk, buildTextures, inkify, stampLayer, drawSeal, rgba, smooth, carve, line, fillPath, bokashi, kasumi } from './print.js';
import { traveler } from './traveler.js';

export const DURATION = 56.5;
const q8 = t => Math.floor(t * 8) / 8, q12 = t => Math.floor(t * 12) / 12;
export const VO = { open: 0.4, forty: 3.3, mist: 8.9, offer: 14.0, agree: 19.2, dawn: 23.2, noon: 26.6, wife: 31.4, row: 34.4, return: 37.4, sea: 41.1, bay: 46.0, end: 50.0 };
const PSTART = [0, 2.9, 8.4, 18.7, 22.7, 26.1, 33.9, 36.9, 45.4], DIS = 0.9;     // v2: one continuous scroll-less film: each print dissolves into the next
// v2 camera: every print breathes with a slow zoom about its focus point (pull-backs at the start of the night sea and the ending)
const KB = [[640, 1320, 1.0, 1.12], [330, 900, 1.0, 1.1], [640, 900, 1.0, 1.16], [430, 1260, 1.06, 1.26], [560, 1260, 1.0, 1.1], [620, 1320, 1.0, 1.1], [600, 1260, 1.12, 1.0], [620, 1120, 1.0, 1.16], [540, 1000, 1.15, 1.0]];
const PEND = i => i < 8 ? PSTART[i + 1] : 53.0;
const NIGHT = '#0f1f3a', MOONP = '#f3ead2', SAND = '#dcc28e', SANDN = '#a99a78';
const REG = [[0, 0], [2.2, -1.3], [-1.8, 1.9], [1.5, 2.2]];

// ---------------------------------------------------------------- shared print pieces (static)
const sky = (x, top, bot, y0, y1, o = {}) => { x.fillStyle = bot; x.fillRect(0, 0, W, H); bokashi(x, 0, y0, W, y1, top, 1, 0, { rough: 26, seed: o.seed || 3, col2: bot, ...o }); };
function seaBlock(x, y0, y1, col, colL, seed = 1, lines = 9) {
  x.fillStyle = col; x.fillRect(0, y0, W, y1 - y0);
  bokashi(x, 0, y0 - 10, W, y0 + 140, colL, .9, 0, { rough: 18, seed });
  const R = mulberry(seed);
  for (let i = 0; i < lines; i++) {
    const y = y0 + 40 + (i + .5) * (y1 - y0 - 60) / lines, pts = [];
    for (let X = -40; X <= W + 40; X += 30) pts.push([X, y + Math.sin(X * .02 + i * 1.7 + R() * .3) * (4 + i * .7)]);
    line(x, pts, 2 + i * .25, rgba(colL, .55));
  }
}
function island(x, cx, by, w, h, col) { fillPath(x, [[cx - w / 2, by], [cx - w * .3, by - h * .5], [cx - w * .1, by - h], [cx + w * .15, by - h * .8], [cx + w * .35, by - h * .4], [cx + w / 2, by]], col); }
function frame(x) {
  x.strokeStyle = PAL.sumi; x.lineWidth = 3.4; x.strokeRect(FR.x0, FR.y0, FR.x1 - FR.x0, FR.y1 - FR.y0);
  x.lineWidth = 1.2; x.strokeRect(FR.x0 - 9, FR.y0 - 9, FR.x1 - FR.x0 + 18, FR.y1 - FR.y0 + 18);
}
function boatPts(cx, cy, L) { return [[cx - L / 2, cy - 22], [cx - L * .42, cy + 14], [cx + L * .38, cy + 14], [cx + L / 2 + 14, cy - 34], [cx + L / 2 - 8, cy - 18]]; }
function boat(x, cx, cy, L) { fillPath(x, boatPts(cx, cy, L), PAL.wood, true); x.strokeStyle = PAL.sumi; x.lineWidth = 2.6; x.beginPath(); smooth(x, boatPts(cx, cy, L), true); x.stroke(); line(x, [[cx - L * .46, cy - 8], [cx + L * .45, cy - 10]], 2, PAL.woodD); }

// each print: up to three colour blocks (g1 blues, g2 earth/green, g3 reds) + a key block (g0), cached once
const PR = [
  { // 1 shore at dusk
    g1: x => { sky(x, '#8db0c6', '#efc4a8', 120, 900, { seed: 4 }); bokashi(x, 0, 820, W, 980, '#e3a08a', 0, .9, { seed: 5 }); island(x, 820, 990, 300, 70, '#8b8a80'); seaBlock(x, 990, 1230, PAL.prus, PAL.sky, 6, 6); },
    g2: x => { x.fillStyle = SAND; x.fillRect(0, 1210, W, 700); bokashi(x, 0, 1210, W, 1420, PAL.ochre, .7, 0, { seed: 7 }); boat(x, 210, 1320, 300); },
    g0: x => { line(x, [[0, 1218], [300, 1206], [620, 1222], [W, 1210]], 3); carve(x, [[150, 1300], [150, 1060]], 6, { seed: 2 }); },
  },
  { // 2 forty days: the tally post and the empty net
    g1: x => { sky(x, '#b3b0a2', '#dfd6be', 80, 860, { seed: 8 }); seaBlock(x, 880, 1060, '#4a5c6e', '#8b9aa6', 9, 4); },
    g2: x => { x.fillStyle = SAND; x.fillRect(0, 1050, W, 900); bokashi(x, 0, 1050, W, 1250, '#b39a6a', .6, 0, { seed: 10 });
      x.fillStyle = PAL.wood; x.fillRect(120, 560, 120, 1000); [600, 960].forEach(px => { x.fillStyle = PAL.woodD; x.fillRect(px - 9, 640, 18, 760); }); },
    g0: x => { x.strokeStyle = PAL.sumi; x.lineWidth = 3; x.strokeRect(120, 560, 120, 1000); line(x, [[600, 660], [960, 660]], 3);
      for (let i = 0; i <= 12; i++) line(x, [[600 + i * 30, 660], [600 + i * 30 + Math.sin(i) * 6, 1150 - (i % 3) * 30]], 1.6, PAL.sumiL);
      for (let j = 0; j < 14; j++) line(x, [[600, 690 + j * 34], [960, 690 + j * 34 + Math.sin(j) * 8]], 1.4, PAL.sumiL);
      [[700, 860, 70], [850, 1010, 60]].forEach(([a, b, r]) => { x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.ellipse(a, b, r, r * .8, 0, 0, TAU); x.fill(); x.restore(); line(x, [[a - r, b], [a - r * .5, b - r * .7], [a + r * .4, b - r * .8], [a + r, b + 4]], 2.2); }); },
  },
  { // 3 night: the mist woman rises
    g1: x => { sky(x, '#0b1830', '#2f4f73', 100, 1100, { seed: 11 }); seaBlock(x, 1080, 1890, '#13284a', '#4d6f98', 12, 12); },
    g2: x => { island(x, 160, 1085, 360, 90, '#22344f'); },
    g0: x => { x.fillStyle = MOONP; x.beginPath(); x.arc(820, 330, 78, 0, TAU); x.fill(); x.strokeStyle = '#8b8a80'; x.lineWidth = 2; x.stroke(); },
  },
  { // 4 the bargain: moonlit beach
    g1: x => { sky(x, '#0b1830', '#2f4f73', 60, 640, { seed: 13 }); seaBlock(x, 640, 900, '#13284a', '#4d6f98', 14, 5); x.fillStyle = MOONP; x.beginPath(); x.arc(250, 260, 60, 0, TAU); x.fill(); },
    g2: x => { x.fillStyle = SANDN; x.fillRect(0, 890, W, 1000); bokashi(x, 0, 890, W, 1100, '#6f6656', .6, 0, { seed: 15 }); },
    g0: x => { line(x, [[0, 896], [400, 884], [760, 900], [W, 888]], 3); },
  },
  { // 5 dawn: the nets overflow
    g1: x => { sky(x, '#bcd0d6', '#efc4a8', 60, 820, { seed: 16 }); bokashi(x, 0, 700, W, 880, '#e3a08a', 0, 1, { seed: 17 });
      x.fillStyle = PAL.beni; x.beginPath(); x.arc(540, 880, 150, Math.PI, TAU); x.fill(); seaBlock(x, 880, 1890, '#1d3a66', '#8db0c6', 18, 12); },
    g2: x => { island(x, 900, 885, 260, 60, '#8b8a80'); },
    g0: x => { line(x, [[0, 882], [W, 882]], 2.4); },
  },
  { // 6 noon in the village
    g1: x => { sky(x, '#8db0c6', '#f3e7c6', 40, 520, { seed: 19 }); x.fillStyle = PAL.beni; x.beginPath(); x.arc(880, 210, 56, 0, TAU); x.fill(); },
    g2: x => { x.fillStyle = PAL.ochreL; x.fillRect(0, 1150, W, 800); bokashi(x, 0, 1150, W, 1300, PAL.ochre, .5, 0, { seed: 20 });
      [[40, 360], [700, 1040]].forEach(([a, b], i) => { x.fillStyle = PAL.plaster; x.fillRect(a, 700, b - a, 450); x.fillStyle = '#6d6a63'; x.beginPath(); x.moveTo(a - 30, 720); x.lineTo((a + b) / 2, 560 - i * 20); x.lineTo(b + 30, 720); x.fill(); x.fillStyle = PAL.woodD; x.fillRect(a, 1000, b - a, 22); }); x.fillStyle = '#2b2622'; x.fillRect(800, 900, 150, 250); },
    g0: x => { [[40, 360], [700, 1040]].forEach(([a, b]) => { x.strokeStyle = PAL.sumi; x.lineWidth = 2.6; x.strokeRect(a, 700, b - a, 450); for (let k = 1; k < 4; k++) line(x, [[a + (b - a) * k / 4, 700], [a + (b - a) * k / 4, 1150]], 2, PAL.woodD); });
      line(x, [[0, 1150], [W, 1150]], 3); x.strokeStyle = PAL.sumi; x.strokeRect(800, 900, 150, 250); },
  },
  { // 7 he rows out
    g1: x => { sky(x, '#0b1830', '#2f4f73', 60, 820, { seed: 21 }); seaBlock(x, 820, 1890, '#13284a', '#4d6f98', 22, 14); x.fillStyle = MOONP; x.beginPath(); x.arc(230, 250, 64, 0, TAU); x.fill(); },
    g2: x => { for (let k = 0; k < 14; k++) { x.fillStyle = rgba(MOONP, .35 - k * .02); x.fillRect(200 + Math.sin(k) * 20, 840 + k * 60, 60 - k * 2, 10); } },
    g0: x => { },
  },
  { // 8 the shadow walks into the sea
    g1: x => { sky(x, '#0b1830', '#2f4f73', 60, 560, { seed: 23 }); seaBlock(x, 560, 1890, '#13284a', '#4d6f98', 24, 16); x.fillStyle = MOONP; x.beginPath(); x.arc(860, 230, 58, 0, TAU); x.fill(); },
    g2: x => { for (let k = 0; k < 16; k++) { x.fillStyle = rgba(MOONP, .3 - k * .015); x.fillRect(830 + Math.sin(k * 1.3) * 18, 580 + k * 70, 56 - k * 2, 10); } },
    g0: x => { },
  },
  { // 9 the still bay
    g1: x => { sky(x, '#13284a', '#8db0c6', 60, 1000, { seed: 25 }); seaBlock(x, 1000, 1890, '#1d3a66', '#8db0c6', 26, 10); x.fillStyle = MOONP; x.beginPath(); x.arc(540, 430, 92, 0, TAU); x.fill(); },
    g2: x => { island(x, 200, 1004, 420, 80, '#4a5568'); island(x, 900, 1004, 300, 50, '#5f6676'); },
    g0: x => { line(x, [[0, 1002], [W, 1002]], 2); },
  },
];
const BLK = [];
function buildPrints() {
  PR.forEach((p, i) => {
    const B = {};
    ['g1', 'g2', 'g0'].forEach((g, j) => {
      const c = mk(), x = c.getContext('2d'); p[g](x);
      if (g === 'g0') inkify(c, { speck: .12 }); else inkify(c, { speck: .3, grain: g === 'g1' ? .16 : .11, gx: hash(i * 3 + j) * 300 - 150, baren: .36, bx: (hash(i + j) - .5) * 300, by: (hash(i * 7 + j) - .5) * 300 });
      B[g] = c;
    });
    const s = mk(), sx = s.getContext('2d'); sx.drawImage(TX.paper, 0, 0);
    sx.drawImage(B.g1, REG[1][0], REG[1][1]); sx.drawImage(B.g2, REG[2][0], REG[2][1]); sx.drawImage(B.g0, 0, 0);
    BLK.push({ ...B, all: s });
  });
}

// ---------------------------------------------------------------- shadows (a figure re-drawn flat in sumi, laid on the ground)
let SH = null, SHX = null;
function shadowOf(drawFig) { SHX.setTransform(1, 0, 0, 1, 0, 0); SHX.globalCompositeOperation = 'source-over'; SHX.clearRect(0, 0, W, H); drawFig(SHX); SHX.globalCompositeOperation = 'source-in'; SHX.fillStyle = '#1a1714'; SHX.fillRect(0, 0, W, H); SHX.globalCompositeOperation = 'source-over'; return SH; }
// lay it on the ground from the feet (px,py): shear sideways (shx) and squash (sq); keep only the part below cut (0..1 of its height)
function layShadow(x, c, px, py, shx, sq, alpha = .55, keep = 1, hgt = 300) {
  x.save(); x.globalAlpha = alpha; x.translate(px, py); x.transform(1, 0, -shx, -sq, 0, 0);
  if (keep < 1) { x.beginPath(); x.rect(-W, -hgt * keep, 3 * W, hgt * keep + 40); x.clip(); }
  x.drawImage(c, -px, -py); x.restore();
}

// ---------------------------------------------------------------- the mist woman (original design: paper-white robe, sumi hair, beni lips)
function mistWoman(x, cx, by, s, o = {}) {
  const t = o.t || 0, wv = Math.sin(t * 2.2) * 6, reach = o.reach || 0;
  x.save(); x.translate(cx, by); x.scale(s, s); x.globalAlpha = o.alpha ?? 1;
  // hair: long strands flowing right with the wind
  for (let k = 0; k < 9; k++) { const pts = []; for (let j = 0; j <= 8; j++) pts.push([-30 + k * 6 + j * 22 + Math.sin(j * .8 + t * 2 + k) * 8, -560 + j * 34 + k * 4]); line(x, pts, 5 - k * .3, PAL.sumi); }
  // robe: tall, wide sleeves, the hem dissolving into mist
  const robe = [[-40, -470], [40, -470], [70, -380], [80, -200], [110 + wv, -40], [60, 0], [-60, 0], [-110 - wv, -40], [-80, -200], [-70, -380]];
  fillPath(x, robe, PAL.white); x.strokeStyle = PAL.greyL; x.lineWidth = 2.2; x.beginPath(); smooth(x, robe, true); x.stroke();
  line(x, [[-10, -460], [-24, -300], [-14, -120]], 1.6, PAL.greyL); line(x, [[16, -460], [28, -300], [20, -120]], 1.6, PAL.greyL);
  // sleeve (the reaching arm)
  const sl = [[-60, -420], [lerp(-150, -330, reach), lerp(-300, -380, reach)], [lerp(-170, -360, reach), lerp(-230, -330, reach)], [-80, -260]];
  fillPath(x, sl, PAL.white); x.beginPath(); smooth(x, sl, true); x.stroke();
  if (reach > .05) { x.fillStyle = '#efe6d2'; x.beginPath(); x.ellipse(lerp(-160, -370, reach), lerp(-262, -362, reach), 14, 8, -.4, 0, TAU); x.fill(); x.strokeStyle = PAL.greyL; x.stroke(); }
  // face
  x.fillStyle = '#f4ecdc'; x.beginPath(); x.ellipse(0, -520, 34, 44, 0, 0, TAU); x.fill(); x.strokeStyle = PAL.greyL; x.lineWidth = 2; x.stroke();
  fillPath(x, [[-36, -560], [0, -578], [36, -560], [30, -530], [0, -556], [-30, -530]], PAL.sumi);
  line(x, [[-18, -520], [-6, -518]], 2.2, PAL.sumi); line(x, [[6, -518], [18, -520]], 2.2, PAL.sumi);
  x.fillStyle = PAL.beni; x.beginPath(); x.ellipse(0, -494, 6, 3.5, 0, 0, TAU); x.fill();
  x.restore();
}
function mistBands(x, t, y0, n, a = .85) { for (let k = 0; k < n; k++) { const w = 520 + hash(k) * 300, cx = ((hash(k + 9) * W + t * (14 + k * 6)) % (W + w)) - w / 2, cy = y0 + k * 70; kasumi(x, cx, cy, w, 44 + hash(k + 3) * 20, PAL.white, a * .55); } }

// ---------------------------------------------------------------- per-print live layer (figures, water, props), drawn in sheet space
const FISH = (x, px, py, s, o = {}) => traveler(x, px, py, s, { noStaff: true, ...o });
function live(i, x, t) {
  const t8 = q8(t), t12 = q12(t);
  if (i === 0) {                                                  // dusk: the man and his long shadow; small waves lap
    const fig = c => FISH(c, 640, 1460, 360, { t: t8, wind: 1 });
    layShadow(x, shadowOf(fig), 640, 1460, -1.25, .5, .62);
    fig(x);
    for (let k = 0; k < 2; k++) { const u = (t12 * .4 + k * .5) % 1; line(x, [[0, 1214 + u * 30], [W, 1214 + u * 30 + Math.sin(u * 3) * 6]], 2.4, rgba(PAL.white, .8 * (1 - u))); }
  }
  if (i === 1) {                                                  // forty tally strokes cut into the post, the man sits facing the sea
    const n = t < 3.3 ? 0 : Math.min(40, Math.floor(seg(t, 3.5, 7.6) * 40 + .001));
    for (let k = 0; k < n; k++) { const g = Math.floor(k / 5), r = k % 5, gx = 136 + (g % 2) * 52, gy = 600 + Math.floor(g / 2) * 120;
      if (r < 4) carve(x, [[gx + r * 10, gy], [gx + r * 10 + 2, gy + 80]], 4.5, { seed: k }); else carve(x, [[gx - 6, gy + 66], [gx + 44, gy + 12]], 4.5, { seed: k }); }
    FISH(x, 470, 1420, 300, { mode: 'sit', t: t8, cup: 0, flip: true });
  }
  if (i === 2 || i === 3 && false) {}
  if (i === 2) {                                                  // the woman of mist rises from the sea; later she reaches toward him
    const rise = eio(seg(q8(t), 9.4, 12.6)), reach = eio(seg(q8(t), 15.2, 16.6));
    x.save(); x.beginPath(); x.rect(0, 0, W, 1240); x.clip();
    mistWoman(x, 640, lerp(1900, 1240, rise), 1.05, { t: t8, reach });
    x.restore();
    mistBands(x, t, 1150, 4, .8);
    const bob = Math.sin(t12 * 2) * 5;
    x.save(); x.translate(0, bob); boat(x, 250, 1560, 300); FISH(x, 270, 1530, 200, { t: t8, flip: true, tilt: -.2 }); x.restore();
  }
  if (i === 3) {                                                  // the bargain: his shadow peels off the sand and rolls up like a sheet
    const fig = c => FISH(c, 360, 1480, 330, { t: t8, flip: true });
    const r = eio(seg(q8(t), 20.2, 21.6)), fly = eio(seg(q8(t), 21.7, 22.6)), H0 = 330;
    if (r < 1) layShadow(x, shadowOf(fig), 360, 1480, -1.2, .45, .62, 1 - r, H0);
    if (r > 0 && fly < 1) {                                       // the roll: a small sumi cylinder at the peeling edge, then it flies to her sleeve
      const k = 1 - r, ex = 360 + 1.2 * H0 * k, ey = 1480 + .45 * H0 * k, rx = lerp(ex, 1000, fly), ry = lerp(ey, 760, fly) - Math.sin(fly * Math.PI) * 140, rr = 14 + r * 26;
      x.save(); x.translate(rx, ry); x.rotate(-.35 + fly * 4); x.fillStyle = '#1a1714'; x.beginPath(); x.ellipse(0, 0, 70 * (1 - fly * .5), rr * (1 - fly * .4), 0, 0, TAU); x.fill(); x.strokeStyle = PAL.greyD; x.lineWidth = 2; x.beginPath(); x.ellipse(0, 0, 50 * (1 - fly * .5), rr * .5, 0, 0, TAU); x.stroke(); x.restore();
    }
    fig(x);
    x.save(); x.globalAlpha = .95; mistWoman(x, 1180, 1100, .9, { t: t8, reach: 1 }); x.restore();
    mistBands(x, t, 820, 3, .6);
  }
  if (i === 4) {                                                  // dawn: the net bulges with fish
    const bob = Math.sin(t12 * 2.2) * 6;
    x.save(); x.translate(0, bob);
    const net = [[160, 1200], [420, 1150], [540, 1300], [430, 1470], [200, 1460]];
    fillPath(x, net, rgba('#b3b0a2', .5)); x.strokeStyle = PAL.sumiL; x.lineWidth = 1.4; for (let k = 0; k < 9; k++) line(x, [[170 + k * 40, 1160 + k * 4], [200 + k * 30, 1460]], 1.3, PAL.sumiL);
    for (let k = 0; k < 26; k++) { const fx = 200 + hash(k) * 300, fy = 1210 + hash(k + 40) * 240, a = hash(k + 7) * 6 + (Math.floor(t8 * 8 + k) % 7 === 0 ? .4 : 0);
      x.save(); x.translate(fx, fy); x.rotate(a); fillPath(x, [[-26, 0], [-6, -10], [20, -4], [30, -12], [30, 12], [20, 4], [-6, 10]], k % 3 ? '#8db0c6' : '#bcd0d6'); x.strokeStyle = PAL.sumi; x.lineWidth = 1.6; x.beginPath(); smooth(x, [[-26, 0], [-6, -10], [20, -4], [30, -12], [30, 12], [20, 4], [-6, 10]], true); x.stroke(); x.restore(); }
    boat(x, 640, 1420, 420);
    FISH(x, 660, 1390, 300, { t: t8, holdHat: false, flip: false });
    x.restore();
  }
  if (i === 5) {                                                  // noon: everyone has a shadow but him
    const vill = [[170, 1480, 300, true], [360, 1500, 290, true]];
    vill.forEach(([px, py, s, fl], k) => { const f = c => FISH(c, px, py, s, { flip: fl, hatOff: true, t: t8, lean: .15 }); layShadow(x, shadowOf(f), px, py, .35, .22, .62); f(x);
      if (t > 27.4) for (let j = 0; j < 3; j++) { const ph = (t8 * 1.5 + j * .33 + k * .2) % 1; line(x, [[px + 40 + ph * 50, py - s * .85 - j * 14], [px + 54 + ph * 50, py - s * .9 - j * 14 - 6], [px + 68 + ph * 50, py - s * .85 - j * 14]], 2, rgba(PAL.sumi, 1 - ph)); } });
    FISH(x, 700, 1560, 330, { t: t8 });                           // no shadow under him (that is the whole point)
    const turn = q8(t) > 31.9;                                    // the wife in the doorway turns her back
    const wf = c => FISH(c, 875, 1150, 230, { mode: turn ? 'back' : 'side', hatOff: true, t: t8, flip: false });
    layShadow(x, shadowOf(wf), 875, 1150, .1, .14, .45); wf(x);
  }
  if (i === 6) {                                                  // he rows out at night
    const st = Math.sin(t8 * 4) * .5 + .5, bx = lerp(760, 520, seg(t, 33.9, 37));
    boat(x, bx, 1300, 360); FISH(x, bx + 20, 1272, 230, { t: t8, lean: lerp(-.15, .15, st) });
    line(x, [[bx - 30, 1180], [bx - 150 - st * 40, 1360 + st * 20]], 5, PAL.woodD);
    for (let k = 0; k < 3; k++) { const u = (t12 * .5 + k / 3) % 1; x.strokeStyle = rgba(PAL.white, .6 * (1 - u)); x.lineWidth = 2; x.beginPath(); x.ellipse(bx - 170, 1370, 30 + u * 90, 6 + u * 14, 0, 0, TAU); x.stroke(); }
    mistBands(x, t, 700, 3, .7);
  }
  if (i === 7) {                                                  // she gives it back; it stands on the water, walks into the sea, and he follows
    const tq = q8(t);
    x.save(); x.globalAlpha = 1 - seg(t, 39.5, 41); mistWoman(x, 860, 1080, .8, { t: t8, reach: 1 - seg(t, 38.6, 39.4) }); x.restore();
    const land = eio(seg(tq, 37.6, 38.4)), walk = seg(tq, 41.2, 43.6), sx = lerp(620, 900, walk), sink = walk * 260, turn = tq > 39.6;
    const sh = c => FISH(c, sx, lerp(900, 1240, land) + sink, 240, { flip: true, mode: turn ? 'back' : 'side', t: t8 });
    if (land > 0) { x.save(); x.beginPath(); x.rect(0, 0, W, 1240); x.clip(); x.drawImage(shadowOf(sh), 0, 0); x.restore();
      x.save(); x.globalAlpha = .35; x.translate(0, 2 * 1240); x.scale(1, -1); x.beginPath(); x.rect(0, 0, W, 1240); x.clip(); x.drawImage(SH, 0, 0); x.restore(); }
    const fwalk = seg(tq, 42.3, 43.9), fsink = fwalk * 300, bx = 260;
    boat(x, bx, 1300, 320);
    if (fwalk <= 0) FISH(x, bx + 10, 1272, 230, { t: t8, flip: true });
    else { x.save(); x.beginPath(); x.rect(0, 0, W, 1300); x.clip(); FISH(x, lerp(bx + 10, 560, fwalk), 1272 + fsink, 230, { t: t8, flip: true, mode: 'walk', ph: t8 }); x.restore(); }
    for (let k = 0; k < 2; k++) { const u = (t12 * .5 + k / 2) % 1, cx = walk > 0 ? sx : 620; if (land > .9) { x.strokeStyle = rgba(PAL.white, .5 * (1 - u)); x.lineWidth = 2; x.beginPath(); x.ellipse(cx, 1244, 40 + u * 110, 6 + u * 16, 0, 0, TAU); x.stroke(); } }
  }
  if (i === 8) {                                                  // still bay: two shadows cross the water, nobody casting them
    const u = (t - 44.6) / 8.6;
    [[0, 0], [1, 120]].forEach(([k, dy]) => { const px = lerp(-200, 1200, (u * .8 + k * .18)), py = 1300 + dy;
      const f = c => FISH(c, px, py, 300, { flip: true, mode: 'walk', ph: q8(t) * .8 + k * .5, t: t8, noStaff: true });
      const c = shadowOf(f); x.save(); x.globalAlpha = .82; x.drawImage(c, 0, 0); x.restore();
      x.save(); x.globalAlpha = .28; x.translate(0, 2 * py); x.scale(1, -1); x.drawImage(c, 0, 0); x.restore();
      for (let j = 0; j < 2; j++) { const uu = (q12(t) * .4 + j / 2 + k * .3) % 1; x.strokeStyle = rgba(PAL.white, .45 * (1 - uu)); x.lineWidth = 2; x.beginPath(); x.ellipse(px, py + 4, 40 + uu * 90, 5 + uu * 12, 0, 0, TAU); x.stroke(); } });
    mistBands(x, t, 1050, 2, .55);
  }
}

// ---------------------------------------------------------------- cartouches, seals, subtitles
function titleSlip(x, t, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(0, (1 - a) * -14);
  const x0 = 560, y0 = 110, w = 440, h = 180;
  x.fillStyle = PAL.beniL; x.fillRect(x0, y0, w, 52); x.fillStyle = '#f3e7c6'; x.fillRect(x0, y0 + 52, w, h - 52);
  x.strokeStyle = PAL.sumi; x.lineWidth = 3; x.strokeRect(x0, y0, w, h); x.lineWidth = 1.2; x.strokeRect(x0 + 5, y0 + 5, w - 10, h - 10); x.beginPath(); x.moveTo(x0 + 5, y0 + 52); x.lineTo(x0 + w - 5, y0 + 52); x.stroke();
  x.fillStyle = PAL.sumi; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 21px Shippori'; x.letterSpacing = '2px'; x.fillText('OLD TALES OF THE ISLAND', x0 + w / 2, y0 + 27); x.letterSpacing = '0px';
  x.font = '700 44px Shippori'; x.fillText('The Man Who', x0 + w / 2, y0 + 92); x.fillText('Sold His Shadow', x0 + w / 2, y0 + 142);
  x.restore();
}
const SEAL = '影';
function subtitle(x, t, SUBS) {
  const s = SUBS.find(q => t >= q.t0 && t < q.t1); if (!s) return;
  const a = Math.min(ss(seg(t, s.t0, s.t0 + .22)), 1 - ss(seg(t, s.t1 - .25, s.t1)));
  x.save(); x.globalAlpha = a; x.font = '500 50px Shippori';
  const words = s.text.split(' '), lines = []; let cur = '';
  words.forEach(w => { const tt = cur ? cur + ' ' + w : w; if (x.measureText(tt).width > 820 && cur) { lines.push(cur); cur = w; } else cur = tt; }); lines.push(cur);
  const lh = 64, bw = Math.max(...lines.map(l => x.measureText(l).width)) + 130, bh = 46 + lines.length * lh, by = 1700 - bh / 2;
  x.fillStyle = 'rgba(243,231,198,.96)'; x.fillRect(540 - bw / 2, by, bw, bh);
  x.strokeStyle = PAL.sumi; x.lineWidth = 2.6; x.strokeRect(540 - bw / 2, by, bw, bh); x.lineWidth = 1; x.strokeRect(540 - bw / 2 + 6, by + 6, bw - 12, bh - 12);
  drawSeal(x, SEAL, 540 - bw / 2 + 36, by + bh / 2, 34, 1, { seed: 3, normal: true });
  x.fillStyle = PAL.sumi; x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach((l, i) => x.fillText(l, 552, by + 23 + lh * (i + .5)));
  x.restore();
}

// ---------------------------------------------------------------- camera over the hanging scroll
function printAt(t) { let k = 0; PSTART.forEach((p, i) => { if (t >= p - DIS) k = i; }); return k; }
let READY = false;
export function init() { buildTextures(); SH = mk(); SHX = SH.getContext('2d'); buildPrints(); READY = true; }
function sheet(x, i, t, rev = null) {
  if (rev === null) x.drawImage(BLK[i].all, 0, 0);
  else {                                                        // printing reveal, block by block
    x.drawImage(TX.paper, 0, 0);
    stampLayer(x, BLK[i].g1, rev[0], REG[1], [4, -5]); stampLayer(x, BLK[i].g2, rev[1], REG[2], [-6, 4]); stampLayer(x, BLK[i].g0, rev[2], [0, 0], [5, 5]);
  }
  if (rev === null || rev[3] > 0) { x.save(); x.beginPath(); x.rect(FR.x0, FR.y0, FR.x1 - FR.x0, FR.y1 - FR.y0); x.clip(); if (rev) x.globalAlpha = rev[3]; live(i, x, t); x.restore(); }
  x.save(); x.globalAlpha = .9; x.drawImage(TX.fiber, 0, 0); x.restore();
  frame(x);
}
let BUF = null;
function printLayer(x, i, t) {                                  // one print (sheet + live layer + seal + title) into the buffer
  const g = BUF.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAL.mount; g.fillRect(0, 0, W, H);
  const ending = i === 8 && t >= 53.0;
  if (ending) {
    if (t < 54.0) { sheet(g, 8, t); g.save(); g.globalAlpha = eio(seg(t, 53.0, 53.95)); g.drawImage(TX.paper, 0, 0); g.restore(); frame(g); }   // the print washes back to paper
    else if (t < 54.6) { g.drawImage(TX.paper, 0, 0); frame(g); }
    else sheet(g, 0, t, [seg(t, 54.6, 54.95), seg(t, 54.95, 55.3), seg(t, 55.3, 55.6), ss(seg(t, 55.6, 56.0))]);     // and print 1 comes back, block by block
  } else sheet(g, i, t);
  drawSeal(g, SEAL, 120, 1790, 58, ending ? 1 : Math.min(1, seg(t, PSTART[i] + .3, PSTART[i] + .5) + (i === 0 ? 1 : 0)), { seed: 7 + i, normal: true });
  if (i === 0 || (ending && t >= 55.6)) titleSlip(g, t, i === 0 ? 1 : ss(seg(t, 55.6, 56.1)));
  // slow zoom about the print's focus point (the reprinted first sheet sits at print 1's opening framing)
  const [fx, fy, z0, z1] = ending && t >= 54.0 ? KB[0] : KB[i], st = i === 0 ? 0 : PSTART[i] - DIS;
  const z = ending && t >= 54.0 ? z0 : lerp(z0, z1, ss(clamp((t - st) / (PEND(i) - st))));
  x.save(); x.translate(fx, fy); x.scale(z, z); x.translate(-fx, -fy); x.drawImage(BUF, 0, 0); x.restore();
}
export function renderFilm(x, t, SUBS, Q) {
  if (!BUF) BUF = mk();
  x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = PAL.mount; x.fillRect(0, 0, W, H);
  const k = printAt(t);
  if (k > 0 && t < PSTART[k]) {                                 // dissolve: the old print keeps moving under the new one
    printLayer(x, k - 1, t);
    x.save(); x.globalAlpha = eio(seg(t, PSTART[k] - DIS, PSTART[k])); printLayer(x, k, t); x.restore();
  } else printLayer(x, k, t);
  if (!(Q && Q.has('nosubs'))) subtitle(x, t, SUBS);
}

// ---------------------------------------------------------------- sound events
let EVS = [];
const ev = (t, type, o = {}) => EVS.push({ t: +t.toFixed(4), type, ...o });
export function events() { EVS = [];
  Object.entries(VO).forEach(([id, t]) => ev(t, 'vo', { id }));
  ev(0, 'waves', { dur: 2.9 }); ev(2.9, 'wind', { dur: 5.5 }); ev(8.4, 'night', { dur: 10.3 }); ev(18.7, 'night', { dur: 4.0 }); ev(22.7, 'waves', { dur: 3.4 }); ev(26.1, 'village', { dur: 7.8 }); ev(33.9, 'night', { dur: 11.5 }); ev(44.9, 'still', { dur: 9.6 });
  PSTART.slice(1).forEach(p => ev(p - DIS, 'dissolve', { dur: DIS }));
  PSTART.slice(1).forEach(p => ev(p + .3, 'seal', {}));
  for (let k = 0; k < 40; k++) ev(3.5 + k * 4.1 / 40, 'carve', { n: k });
  ev(9.4, 'rise', { dur: 3.2 }); ev(15.2, 'breath', { dur: 1.4 });
  ev(20.2, 'peel', { dur: 1.4 }); ev(21.7, 'whoosh', { dur: .9 });
  for (let k = 0; k < 4; k++) ev(23.0 + k * .7, 'splash', { n: k });
  [27.6, 28.6, 29.5].forEach((x, k) => ev(x, 'whisper', { n: k })); ev(31.9, 'door', {});
  for (let k = 0; k < 4; k++) ev(34.0 + k * .75, 'oar', { n: k });
  ev(37.6, 'drop', {}); ev(41.2, 'wade', { dur: 2.4 }); ev(42.3, 'wade', { dur: 1.6 });
  ev(52.9, 'bell', {}); ev(54.55, 'clap', {}); ev(54.6, 'baren', { dur: 1.0 }); ev(55.6, 'seal', {});
  EVS.sort((a, b) => a.t - b.t); return EVS; }
