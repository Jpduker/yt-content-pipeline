// The Keeper's Island cast, drawn pixel by pixel (3/4 side view facing right). Our own characters: Gus the keeper, Mabel the cat.
// Engine: lemo-opuscar 2.5D Pixel Art kit (px.js). One frame per pose, packed into an atlas; billboards take the scene lighting.
import * as THREE from 'three';
import { PX, ramp, hex, texOf, billboard, blob } from '/styles/hd-2d/demo/px.js';

export const SPX = 1 / 30;   // character pixel → metres (Gus ≈ 1.6 m)
const INK = hex('#1a1016');
const C = {
  coat: ramp(['#0b2a2a', '#114240', '#1a5c56', '#27776d', '#3a9583'], .22),   // Gus's sea-green oilskin: the one saturated colour no set uses
  skin: ramp(['#b07a5e', '#d79b7a', '#efc3a0', '#ffe0c4'], .22),
  beard: ramp(['#6f6c73', '#9d9aa2', '#c9c7ce', '#eeedf2'], .22),
  cap: ramp(['#141a30', '#222c4c', '#334470'], .22),
  trouser: ramp(['#1b1a22', '#2a2934', '#3b3947'], .22),
  boot: ramp(['#120c0a', '#261a14', '#3d2a1e'], .22),
  scarf: ramp(['#7a5a10', '#b88a22', '#e2b43c'], .22),
  brass: ramp(['#3e2a10', '#7a5a24', '#b88c3e', '#e6c26a'], .22),
  glass: ramp(['#ff8a1c', '#ffc14a', '#ffe79a', '#fffbe6'], .22),
  fur: ramp(['#3a3744', '#5e5a6a', '#857f92', '#a9a3b4'], .22),           // Mabel: slate grey
  bib: ramp(['#b9b4bf', '#dcd8e0', '#f4f2f6'], .22),
  eye: ramp(['#4a7a1a', '#8fd13a', '#d8ff7a'], .22),
};

// Hand lantern, 5 px wide × 8 px tall at (x, y) = top-left of the glass frame; lit 0..1 = flame size. E = emissive canvas.
function lantern(P, E, x, y, lit = 1) {
  P.set(x + 2, y - 2, C.brass(.4, 0, 0)); P.set(x + 1, y - 1, C.brass(.6, 0, 0)); P.set(x + 3, y - 1, C.brass(.6, 0, 0));
  P.rect(x, y, 5, 1, C.brass(.85, 0, 0));
  for (let j = 1; j <= 5; j++) for (let i = 0; i < 5; i++) {
    if (i === 0 || i === 4) { P.set(x + i, y + j, C.brass(i === 0 ? .7 : .35, i, j)); continue; }
    const cx = i - 2, cy = j - 3.2, r = Math.hypot(cx * 1.1, cy * .8), f = lit * (1.35 - r * .45);
    if (lit > .05 && f > .35) { const c = C.glass(Math.min(.99, f * .75), x + i, y + j); P.set(x + i, y + j, c); E && E.set(x + i, y + j, c); }
    else P.set(x + i, y + j, lit > .05 ? C.glass(.05, 0, 0) : hex('#3a3440'));
  }
  P.rect(x, y + 6, 5, 1, C.brass(.55, 0, 0));
}

// —— Gus —— p: { step 0..3 | undefined, bob, arm:'low'|'fwd'|'up', look 0..2 (head raised), blink, lit }
function drawGus(P, E, p) {
  const by = p.bob || 0, look = p.look || 0, lit = p.lit ?? 1, arm = p.arm || 'low';
  // Legs: trousers + boots (4-frame walk)
  const st = p.step ?? -1;
  const legs = st < 0 ? [[12, 0], [18, 0]] : [[[10, 0], [20, -1]], [[13, -1], [17, 0]], [[20, -1], [10, 0]], [[17, 0], [13, -1]]][st];
  legs.forEach(([lx, ly], i) => {
    for (let y = 38; y < 45 + ly; y++) for (let x = lx; x < lx + 5; x++) P.set(x, y, C.trouser(i ? .55 : .85 - (x === lx ? .3 : 0), x, y));
    for (let y = 44 + ly; y < 49 + ly; y++) for (let x = lx - 1; x < lx + 6; x++) P.set(x, y, C.boot(y > 46 + ly ? .25 : (i ? .55 : .85) - (x === lx - 1 ? .3 : 0), x, y));
  });
  // Long oilskin coat: shoulders at `top`, flares to the hem, a vertical seam, two brass buttons
  const top = 17 + by, bot = 40, shL = 9, shR = 23, hmL = 7 - (p.hem || 0), hmR = 26 + (p.hem || 0);
  P.poly([[shL, top], [shR, top], [hmR, bot], [hmL, bot]], (x, y) => {
    const u = (y - top) / (bot - top), l = hmL * u + shL * (1 - u), r = hmR * u + shR * (1 - u), s = (x - l) / (r - l);
    let v = .66 - s * .42 + (1 - u) * .12; if (s > .60 && s < .66) v -= .28; if ((x + (y >> 2)) % 6 === 0 && u > .3) v -= .14; if (s < .1) v += .1;
    return C.coat(v, x, y);
  });
  P.set(20, top + 7, C.brass(.95, 0, 0)); P.set(20, top + 13, C.brass(.95, 0, 0));
  P.rect(8, top + 11, 17, 2, C.boot(.45, 0, 0)); P.set(19, top + 11, C.brass(.9, 0, 0));   // belt + buckle
  // Scarf (mustard): collar band + a tail over the shoulder
  P.rect(11, top - 1, 10, 2, C.scarf(.6, 0, 0)); P.rect(11, top - 1, 10, 1, C.scarf(.9, 0, 0)); P.rect(9, top + 1, 2, 5, C.scarf(.45, 0, 0)); P.set(9, top + 6, C.scarf(.3, 0, 0));
  // Head (3/4, facing right), raised by `look`
  const hx = 16, hy = 11 + by - look;
  P.ellipse(hx + 1, hy, 5.5, 6, (x, y, dx, dy) => C.skin(.62 - dx * .15 - dy * .25, x, y));
  // Beard: full, white, down to the chest
  P.poly([[hx - 3, hy + 1], [hx + 6, hy + 1 - look * .5], [hx + 6, hy + 6], [hx + 3, hy + 11], [hx - 2, hy + 9]], (x, y) => C.beard(.78 - (y - hy) * .035 + ((x + y) % 4 === 0 ? -.15 : 0), x, y));
  // Wool cap (navy beanie) with a folded brim
  P.ellipse(hx + .5, hy - 4.5, 6.2, 3.6, (x, y, dx, dy) => C.cap(.65 - dy * .3 - dx * .1, x, y)); P.rect(hx - 5, hy - 3, 12, 2, C.cap(.35, 0, 0)); P.rect(hx - 5, hy - 3, 12, 1, C.cap(.8, 0, 0));
  // Brows, eyes, nose
  P.rect(hx + 2, hy - 2, 3, 1, C.beard(.95, 0, 0)); P.rect(hx - 1, hy - 2, 2, 1, C.beard(.8, 0, 0));
  if (p.blink) { P.set(hx + 4, hy - 1, C.skin(.2, 0, 0)); P.set(hx + 1, hy - 1, C.skin(.2, 0, 0)); }
  else { P.set(hx + 4, hy - 1, INK); P.set(hx + 1, hy - 1, INK); P.set(hx + 4, hy - 2 + 1, hex('#2a2030')); }
  P.rect(hx + 5, hy, 2, 2, C.skin(.85, 0, 0)); P.set(hx + 6, hy + 1, C.skin(.45, 0, 0));
  // Arm + lantern
  const sl = pts => pts.forEach(([x, y]) => { P.set(x, y, C.coat(.75, x, y)); P.set(x, y + 1, C.coat(.45, x, y)); P.set(x - 1, y + 1, C.coat(.35, x, y)); });
  if (arm === 'low') { sl([[22, top + 3], [23, top + 5], [23, top + 7], [23, top + 9], [23, top + 11]]); P.rect(22, top + 13, 3, 2, C.skin(.55, 0, 0)); lantern(P, E, 21, top + 16, lit); }
  if (arm === 'fwd') { sl([[22, top + 3], [23, top + 4], [25, top + 5], [26, top + 6], [27, top + 7]]); P.rect(28, top + 7, 2, 2, C.skin(.6, 0, 0)); lantern(P, E, 27, top + 11, lit); }
  if (arm === 'up') { sl([[22, top + 2], [23, top], [24, top - 2], [25, top - 4], [25, top - 6]]); P.rect(25, top - 9, 2, 2, C.skin(.6, 0, 0)); lantern(P, E, 24, top - 5, lit); }
  P.set(8, top + 9, C.skin(.35, 0, 0));   // far hand
}
const GUS = {
  idle0: { arm: 'low' }, idle1: { arm: 'low', bob: 1 }, blink: { arm: 'low', blink: 1 },
  w0: { step: 0, arm: 'low', hem: 1 }, w1: { step: 1, arm: 'low', bob: -1 }, w2: { step: 2, arm: 'low', hem: -1 }, w3: { step: 3, arm: 'low', bob: -1 },
  fwd: { arm: 'fwd' }, up: { arm: 'up' }, up1: { arm: 'up', bob: 1 },
  look: { arm: 'low', look: 2 }, look1: { arm: 'low', look: 2, bob: 1 }, lookBlink: { arm: 'low', look: 2, blink: 1 },
  lookUp: { arm: 'up', look: 2 }, lookUp1: { arm: 'up', look: 2, bob: 1 },
};
// Lantern glass centre per arm pose, in frame pixels (x from left, y from top)
const GUS_LAMP = { low: [23.5, 36.5], fwd: [29.5, 31.5], up: [26.5, 15.5] };

// —— Mabel the cat —— 20×14 frame. p: { step 0..3 | undefined, tail 0..2, sit, blink, ear }
function drawMabel(P, E, p) {
  const sit = !!p.sit, st = p.step ?? -1, tail = p.tail || 0;
  // Tail (a curve behind the body)
  const tp = sit ? [[2, 12], [1, 11], [1, 9], [2, 7], [3, 6]] : [[1, 8 - tail], [1, 6 - tail], [2, 4 - tail], [3, 3 - tail], [4, 3 - tail]];
  tp.forEach(([x, y], i) => P.set(x, y, C.fur(.45 + i * .08, x, y)));
  // Body
  if (sit) P.ellipse(8, 9, 4.5, 4.8, (x, y, dx, dy) => C.fur(.6 - dx * .2 - dy * .25, x, y));
  else P.ellipse(8, 8.5, 6, 3.4, (x, y, dx, dy) => C.fur(.6 - dx * .15 - dy * .3, x, y));
  // Legs (trot: 4 frames)
  if (sit) { P.rect(5, 12, 2, 2, C.fur(.4, 0, 0)); P.rect(10, 12, 2, 2, C.fur(.55, 0, 0)); }
  else { const L = st < 0 ? [[4, 0], [6, 0], [10, 0], [12, 0]] : [[[3, 0], [7, -1], [9, -1], [13, 0]], [[5, -1], [6, 0], [11, 0], [12, -1]], [[7, -1], [3, 0], [13, 0], [9, -1]], [[6, 0], [5, -1], [12, -1], [11, 0]]][st];
    L.forEach(([x, dy], i) => { for (let y = 11; y < 14 + dy; y++) P.set(x, y, C.fur(i % 2 ? .35 : .55, x, y)); }); }
  // Head + ears
  const hx = 14, hy = sit ? 5 : 5;
  P.ellipse(hx, hy, 3.4, 3, (x, y, dx, dy) => C.fur(.7 - dx * .15 - dy * .2, x, y));
  P.poly([[hx - 3, hy - 2], [hx - 2, hy - 5 + (p.ear || 0)], [hx - 1, hy - 2]], (x, y) => C.fur(.5, x, y));
  P.poly([[hx + 1, hy - 2], [hx + 2, hy - 5], [hx + 3, hy - 2]], (x, y) => C.fur(.6, x, y));
  // White bib + muzzle
  P.rect(hx - 1, hy + 1, 3, 2, C.bib(.6, 0, 0)); P.rect(hx - 2, hy + 3, 3, 2, C.bib(.4, 0, 0));
  // Eyes (green, half-closed = sleepy Mabel)
  if (p.blink) { P.set(hx + 1, hy, C.fur(.2, 0, 0)); P.set(hx - 1, hy, C.fur(.2, 0, 0)); }
  else { P.set(hx + 1, hy, C.eye(.8, 0, 0)); P.set(hx - 1, hy, C.eye(.8, 0, 0)); P.set(hx + 1, hy - 1, C.fur(.25, 0, 0)); P.set(hx - 1, hy - 1, C.fur(.25, 0, 0)); }
  P.set(hx + 3, hy + 1, hex('#e8907a'));   // nose
}
const MABEL = {
  sit0: { sit: 1 }, sit1: { sit: 1, ear: 1 }, sitBlink: { sit: 1, blink: 1 },
  w0: { step: 0, tail: 0 }, w1: { step: 1, tail: 1 }, w2: { step: 2, tail: 2 }, w3: { step: 3, tail: 1 },
  stand: {}, standBlink: { blink: 1 },
};


// —— Dunn, the harbour master —— black peaked cap, dark coat, red muffler, clipboard. p: { step, bob, blink, arm:'clip'|'point' }
const CD = { coat: ramp(['#0e0f16', '#1b1d28', '#2a2d3c', '#3b3f52'], .22), muff: ramp(['#5a1010', '#8e1c1c', '#c23030'], .22), cap: ramp(['#0a0a10', '#15161e', '#23242e'], .22), paper: ramp(['#b8b2a2', '#e4ddcb', '#f6f1e4'], .22) };
function drawDunn(P, E, p) {
  const by = p.bob || 0, st = p.step ?? -1;
  const legs = st < 0 ? [[12, 0], [18, 0]] : [[[10, 0], [20, -1]], [[13, -1], [17, 0]], [[20, -1], [10, 0]], [[17, 0], [13, -1]]][st];
  legs.forEach(([lx, ly], i) => { for (let y = 36; y < 45 + ly; y++) for (let x = lx; x < lx + 5; x++) P.set(x, y, CD.coat(i ? .5 : .8 - (x === lx ? .3 : 0), x, y));
    for (let y = 44 + ly; y < 49 + ly; y++) for (let x = lx - 1; x < lx + 6; x++) P.set(x, y, C.boot(y > 46 + ly ? .25 : .7, x, y)); });
  const top = 17 + by;
  P.poly([[9, top], [23, top], [25, 37], [7, 37]], (x, y) => { const s = (x - 7) / 18; let v = .7 - s * .4; if (s > .5 && s < .56) v -= .3; return CD.coat(v, x, y); });
  P.set(19, top + 6, C.brass(.9, 0, 0)); P.set(19, top + 11, C.brass(.9, 0, 0)); P.set(19, top + 16, C.brass(.9, 0, 0));
  P.rect(10, top - 1, 12, 3, CD.muff(.6, 0, 0)); P.rect(10, top - 1, 12, 1, CD.muff(.9, 0, 0)); P.rect(20, top + 2, 2, 6, CD.muff(.45, 0, 0));
  const hx = 16, hy = 11 + by;
  P.ellipse(hx + 1, hy, 5.5, 6, (x, y, dx, dy) => C.skin(.5 - dx * .15 - dy * .25, x, y));
  P.rect(hx - 1, hy + 2, 6, 2, C.beard(.3, 0, 0));   // grey moustache, dark
  P.ellipse(hx + .5, hy - 4.5, 6.4, 3, (x, y, dx, dy) => CD.cap(.6 - dy * .3, x, y)); P.rect(hx - 5, hy - 3, 13, 2, CD.cap(.3, 0, 0)); P.rect(hx - 1, hy - 2, 9, 1, CD.cap(.15, 0, 0));   // peak
  if (p.blink) { P.set(hx + 4, hy - 1, C.skin(.2, 0, 0)); P.set(hx + 1, hy - 1, C.skin(.2, 0, 0)); } else { P.set(hx + 4, hy - 1, INK); P.set(hx + 1, hy - 1, INK); }
  P.rect(hx + 2, hy - 2, 4, 1, C.beard(.4, 0, 0)); P.rect(hx + 5, hy, 2, 2, C.skin(.8, 0, 0));
  const sl = pts => pts.forEach(([x, y]) => { P.set(x, y, CD.coat(.75, x, y)); P.set(x, y + 1, CD.coat(.45, x, y)); });
  if ((p.arm || 'clip') === 'clip') { sl([[22, top + 3], [23, top + 5], [24, top + 7], [25, top + 8]]); P.rect(24, top + 6, 6, 8, CD.paper(.3, 0, 0)); P.rect(25, top + 7, 4, 6, CD.paper(.8, 0, 0)); P.rect(26, top + 8, 2, 1, INK); P.rect(26, top + 10, 2, 1, INK); P.set(26, top + 14, C.skin(.6, 0, 0)); }
  else { sl([[22, top + 3], [24, top + 2], [26, top + 1], [28, top], [30, top - 1]]); P.rect(31, top - 2, 2, 2, C.skin(.6, 0, 0)); }
}
const DUNN = { idle0: {}, idle1: { bob: 1 }, blink: { blink: 1 }, point: { arm: 'point' }, point1: { arm: 'point', bob: 1 }, w0: { step: 0 }, w1: { step: 1, bob: -1 }, w2: { step: 2 }, w3: { step: 3, bob: -1 } };

// —— Old Wren, the postmistress —— violet shawl over a grey dress, white bun, round spectacles, a candle lamp. p: { bob, blink, arm:'candle'|'open' }
const CW = { shawl: ramp(['#2a1640', '#4a2a70', '#6e449a', '#8f63b8'], .22), dress: ramp(['#2a2a30', '#43434c', '#5c5c66'], .22), hair: ramp(['#9c9aa0', '#cfcdd2', '#f0eef2'], .22), gold: ramp(['#6a5218', '#b08a2a', '#e0c060'], .22) };
function drawWren(P, E, p) {
  const by = p.bob || 0, top = 18 + by;
  P.poly([[11, 36], [21, 36], [24, 49], [8, 49]], (x, y) => CW.dress(.6 - (x - 8) / 16 * .35, x, y));
  P.poly([[8, top], [24, top], [26, top + 14], [6, top + 14]], (x, y) => { const s = (x - 6) / 20; return CW.shawl(.68 - s * .4 + ((x + y) % 5 === 0 ? -.12 : 0), x, y); });
  P.rect(12, top + 12, 8, 6, CW.dress(.5, 0, 0));
  const hx = 16, hy = 12 + by;
  P.ellipse(hx + 1, hy, 5.2, 5.6, (x, y, dx, dy) => C.skin(.55 - dx * .15 - dy * .2, x, y));
  P.ellipse(hx - 3, hy - 3, 3, 3, (x, y, dx, dy) => CW.hair(.7 - dy * .3, x, y)); P.ellipse(hx + 1, hy - 4.5, 5.6, 2.4, (x, y, dx, dy) => CW.hair(.75 - dy * .3, x, y));
  P.set(hx + 1, hy - 1, CW.gold(.9, 0, 0)); P.set(hx + 4, hy - 1, CW.gold(.9, 0, 0)); P.rect(hx + 2, hy - 1, 2, 1, CW.gold(.6, 0, 0)); P.set(hx, hy - 1, CW.gold(.6, 0, 0)); P.set(hx + 5, hy - 1, CW.gold(.6, 0, 0));
  if (!p.blink) { P.set(hx + 1, hy, INK); P.set(hx + 4, hy, INK); }
  P.rect(hx + 5, hy + 1, 2, 2, C.skin(.8, 0, 0)); P.rect(hx + 1, hy + 3, 3, 1, hex('#8a4a4a'));
  if ((p.arm || 'candle') === 'candle') { P.rect(22, top + 6, 3, 2, C.skin(.6, 0, 0)); P.rect(22, top + 2, 3, 4, CW.hair(.9, 0, 0)); const c = C.glass(.85, 0, 0); P.set(23, top + 1, c); P.set(23, top, C.glass(.98, 0, 0)); E && E.set(23, top + 1, c); E && E.set(23, top, C.glass(.98, 0, 0)); }
  else { P.rect(24, top + 4, 2, 2, C.skin(.6, 0, 0)); P.rect(6, top + 4, 2, 2, C.skin(.6, 0, 0)); }
}
const WREN = { idle0: {}, idle1: { bob: 1 }, blink: { blink: 1 }, open: { arm: 'open' }, open1: { arm: 'open', bob: 1 } };

// —— The Stranger —— yellow oilskin, hood up, ALWAYS seen from behind; casts no shadow (set in makeStranger). p: { step, bob }
const CS = { coat: ramp(['#5a4208', '#9a7412', '#cfa21e', '#e8c22a', '#f6dc6a'], .22) };
function drawStranger(P, E, p) {
  const by = p.bob || 0, st = p.step ?? -1, top = 14 + by;
  const legs = st < 0 ? [[12, 0], [18, 0]] : [[[10, 0], [20, -1]], [[13, -1], [17, 0]], [[20, -1], [10, 0]], [[17, 0], [13, -1]]][st];
  legs.forEach(([lx, ly]) => { for (let y = 44 + ly; y < 49 + ly; y++) for (let x = lx - 1; x < lx + 6; x++) P.set(x, y, C.boot(.35, x, y)); });
  P.poly([[9, top + 6], [23, top + 6], [26, 45], [6, 45]], (x, y) => { const s = (x - 6) / 20; let v = .7 - s * .38 + ((y - top) % 7 === 0 ? -.1 : 0); if (s > .47 && s < .53) v -= .25; return CS.coat(v, x, y); });
  P.ellipse(16, top + 2, 6, 6, (x, y, dx, dy) => CS.coat(.62 - dy * .3 - dx * .1, x, y));   // hood, from behind: no face
  P.rect(11, top + 5, 10, 2, CS.coat(.35, 0, 0));
}
const STRANGER = { idle0: {}, idle1: { bob: 1 }, w0: { step: 0 }, w1: { step: 1, bob: -1 }, w2: { step: 2 }, w3: { step: 3, bob: -1 } };

// —— Pip the seagull —— 22×18. p: { fly 0..3 | undefined, blink, head }
const CP = { body: ramp(['#9a9aa6', '#cfcfd8', '#f0f0f4', '#ffffff'], .22), wing: ramp(['#4e5160', '#767a8c', '#a3a7b8'], .22), beak: ramp(['#9a6a12', '#d9a21e', '#f0c23c'], .22), leg: ramp(['#b84a3a', '#e8705a'], .22) };
function drawPip(P, E, p) {
  const fly = p.fly;
  if (fly == null) {   // standing
    P.ellipse(10, 11, 6, 4, (x, y, dx, dy) => CP.body(.75 - dy * .3 - dx * .1, x, y));
    P.poly([[5, 9], [12, 8], [13, 12], [6, 13]], (x, y) => CP.wing(.6 - (y - 8) * .08, x, y));
    P.set(5, 15, CP.leg(.8, 0, 0)); P.set(5, 16, CP.leg(.8, 0, 0)); P.set(9, 15, CP.leg(.8, 0, 0)); P.set(9, 16, CP.leg(.8, 0, 0)); P.rect(4, 17, 3, 1, CP.leg(.5, 0, 0)); P.rect(8, 17, 3, 1, CP.leg(.5, 0, 0));
    P.ellipse(15, 7 - (p.head || 0), 3, 2.6, (x, y, dx, dy) => CP.body(.85 - dy * .25, x, y)); P.rect(17, 7 - (p.head || 0), 3, 1, CP.beak(.8, 0, 0)); P.set(20, 7 - (p.head || 0), CP.beak(.4, 0, 0));
    if (!p.blink) P.set(15, 6 - (p.head || 0), INK);
    P.poly([[3, 10], [5, 9], [5, 12]], () => CP.wing(.3, 0, 0));   // tail
  } else {
    P.ellipse(11, 10, 5, 2.6, (x, y, dx, dy) => CP.body(.8 - dy * .3, x, y));
    const wy = [[2, 4], [5, 7], [9, 11], [6, 8]][fly];   // wing tips: up, mid, down, mid
    P.poly([[7, 10], [13, 10], [20, wy[0]], [19, wy[1]]], (x, y) => CP.wing(.7 - (x - 7) * .03, x, y));
    P.poly([[7, 10], [13, 10], [1, wy[0] + 1], [2, wy[1] + 1]], (x, y) => CP.wing(.55, x, y));
    P.ellipse(16, 9, 2.6, 2.2, (x, y, dx, dy) => CP.body(.85, x, y)); P.rect(18, 9, 3, 1, CP.beak(.8, 0, 0)); P.set(16, 8, INK);
    P.poly([[6, 11], [8, 10], [8, 12]], () => CP.wing(.3, 0, 0));
  }
}
const PIP = { stand0: {}, stand1: { head: 1 }, standBlink: { blink: 1 }, fly0: { fly: 0 }, fly1: { fly: 1 }, fly2: { fly: 2 }, fly3: { fly: 3 } };

// —— Rollo the mouse —— 14×10. p: { step, nibble }
const CR = { fur: ramp(['#6a4a2a', '#9a7244', '#c49a62', '#dcb882'], .22), ear: ramp(['#b85a6a', '#e88a9a'], .22) };
function drawRollo(P, E, p) {
  P.ellipse(6, 6, 4, 2.6, (x, y, dx, dy) => CR.fur(.7 - dy * .3 - dx * .1, x, y));
  P.ellipse(10, 5, 2.4, 2, (x, y, dx, dy) => CR.fur(.8 - dy * .2, x, y));
  P.ellipse(9, 2.5, 1.4, 1.4, () => CR.ear(.8, 0, 0)); P.ellipse(11.5, 2.5, 1.4, 1.4, () => CR.ear(.9, 0, 0));
  P.set(11, 5, INK); P.set(13, 6, hex('#e8907a'));
  for (let i = 0; i < 5; i++) P.set(1 + (i < 3 ? 0 : i - 2), 5 + i * (i < 3 ? 1 : 0) - (i >= 3 ? 1 : 0), hex('#d8707a'));   // tail
  const st = p.step ?? -1; const L = st < 0 ? [3, 5, 8, 10] : [[2, 6, 7, 11], [4, 5, 9, 10], [5, 3, 11, 8], [4, 6, 9, 11]][st];
  L.forEach((x, i) => P.set(x, 9 - (i % 2 && st >= 0 ? 1 : 0), CR.fur(.4, x, 9)));
  if (p.nibble) { P.rect(12, 7, 2, 2, C.scarf(.9, 0, 0)); }
}
const ROLLO = { idle0: {}, idle1: { nibble: 1 }, w0: { step: 0 }, w1: { step: 1 }, w2: { step: 2 }, w3: { step: 3 } };

// —— Marlo, the ferry pilot (Chapter 2) —— orange knit cap, navy sailor jumper, rolled trousers, a coil of rope. p: { step, bob, blink, arm:'rope'|'wave' }
const CM = { cap: ramp(['#7a2a08', '#c24a12', '#ee7a2a', '#ffa860'], .22), jumper: ramp(['#0c1430', '#18244a', '#283a6a', '#3a5288'], .22), trou: ramp(['#3a3020', '#5a4a30', '#7a6644'], .22), hair: ramp(['#1a0e08', '#3a2010', '#5a3418'], .22), rope: ramp(['#6a5430', '#a8884a', '#d0b070'], .22) };
function drawMarlo(P, E, p) {
  const by = p.bob || 0, st = p.step ?? -1;
  const legs = st < 0 ? [[12, 0], [18, 0]] : [[[10, 0], [20, -1]], [[13, -1], [17, 0]], [[20, -1], [10, 0]], [[17, 0], [13, -1]]][st];
  legs.forEach(([lx, ly], i) => { for (let y = 34; y < 44 + ly; y++) for (let x = lx; x < lx + 5; x++) P.set(x, y, CM.trou(i ? .5 : .8 - (x === lx ? .3 : 0), x, y));
    for (let y = 44 + ly; y < 49 + ly; y++) for (let x = lx - 1; x < lx + 6; x++) P.set(x, y, C.boot(y > 46 + ly ? .25 : .6, x, y)); });
  const top = 19 + by;
  P.poly([[10, top], [22, top], [23, 35], [9, 35]], (x, y) => { const s = (x - 9) / 14; let v = .7 - s * .4; if ((y - top) % 4 === 0) v += .12; return CM.jumper(v, x, y); });
  const hx = 16, hy = 13 + by;
  P.ellipse(hx + .5, hy - 1, 6, 6.2, (x, y, dx, dy) => CM.hair(.6 - dy * .2, x, y));   // hair behind (bob)
  P.ellipse(hx + 1, hy, 5, 5.4, (x, y, dx, dy) => C.skin(.5 - dx * .15 - dy * .25, x, y));
  P.ellipse(hx + .5, hy - 4.5, 5.8, 3.2, (x, y, dx, dy) => CM.cap(.65 - dy * .3, x, y)); P.rect(hx - 5, hy - 3, 11, 2, CM.cap(.4, 0, 0)); P.set(hx, hy - 8, CM.cap(.9, 0, 0)); P.set(hx + 1, hy - 8, CM.cap(.9, 0, 0));
  if (!p.blink) { P.set(hx + 1, hy - 1, INK); P.set(hx + 4, hy - 1, INK); }
  P.set(hx + 5, hy, C.skin(.8, 0, 0)); P.rect(hx + 2, hy + 2, 3, 1, hex('#9a4a40'));
  if ((p.arm || 'rope') === 'rope') { for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const r = Math.hypot(x, y); if (r > 1.4 && r < 3.2) P.set(23 + x, top + 9 + y, CM.rope(.7 - y * .06, x, y)); } P.rect(21, top + 3, 2, 5, CM.jumper(.6, 0, 0)); }
  else { P.rect(22, top - 2, 2, 5, CM.jumper(.7, 0, 0)); P.rect(23, top - 5, 2, 3, C.skin(.6, 0, 0)); }
}
const MARLO = { idle0: {}, idle1: { bob: 1 }, blink: { blink: 1 }, wave: { arm: 'wave' }, wave1: { arm: 'wave', bob: 1 }, w0: { step: 0 }, w1: { step: 1, bob: -1 }, w2: { step: 2 }, w3: { step: 3, bob: -1 } };

// —— Silas Crane, the salvage merchant (Chapter 3) —— cream suit, black bowler, silver cane, too-pale face; tall and thin. p: { step, bob, blink, arm:'cane'|'offer' }
const CC = { suit: ramp(['#8a7e64', '#bdb092', '#e2d8bc', '#f6efdc'], .22), hat: ramp(['#08080a', '#16161c', '#26262e'], .22), cane: ramp(['#6a6e78', '#a8aeb8', '#e6eaf0'], .22) };
function drawCrane(P, E, p) {
  const by = p.bob || 0, st = p.step ?? -1;
  const legs = st < 0 ? [[13, 0], [18, 0]] : [[[11, 0], [20, -1]], [[14, -1], [17, 0]], [[20, -1], [11, 0]], [[17, 0], [14, -1]]][st];
  legs.forEach(([lx, ly], i) => { for (let y = 32; y < 46 + ly; y++) for (let x = lx; x < lx + 4; x++) P.set(x, y, CC.suit(i ? .5 : .78 - (x === lx ? .25 : 0), x, y));
    for (let y = 46 + ly; y < 49 + ly; y++) for (let x = lx - 1; x < lx + 5; x++) P.set(x, y, CC.hat(.5, x, y)); });
  const top = 15 + by;
  P.poly([[11, top], [22, top], [23, 33], [10, 33]], (x, y) => { const s = (x - 10) / 13; let v = .75 - s * .4; if (s > .45 && s < .52) v -= .3; return CC.suit(v, x, y); });
  P.rect(15, top, 3, 7, hex('#3a0e14')); P.set(16, top + 1, hex('#8a1a2a'));   // dark waistcoat + red tie
  const hx = 16, hy = 9 + by;
  P.ellipse(hx + 1, hy, 4.6, 5.4, (x, y, dx, dy) => C.skin(.82 - dx * .1 - dy * .15, x, y));   // pale
  P.rect(hx - 5, hy - 4, 12, 1, CC.hat(.4, 0, 0)); P.rect(hx - 3, hy - 8, 8, 4, CC.hat(.6, 0, 0)); P.rect(hx - 2, hy - 9, 6, 1, CC.hat(.8, 0, 0));
  if (!p.blink) { P.set(hx + 1, hy - 1, INK); P.set(hx + 4, hy - 1, INK); }
  P.rect(hx + 1, hy + 3, 4, 1, hex('#6a3a3a'));   // thin smile
  if ((p.arm || 'cane') === 'cane') { P.rect(22, top + 3, 2, 10, CC.suit(.6, 0, 0)); for (let y = top + 12; y < 49; y++) P.set(24, y, CC.cane(.7, 0, y)); P.rect(23, top + 11, 3, 2, CC.cane(.95, 0, 0)); }
  else { P.rect(22, top + 2, 2, 4, CC.suit(.6, 0, 0)); P.rect(24, top + 4, 4, 2, CC.suit(.7, 0, 0)); P.rect(28, top + 3, 3, 3, hex('#f2ecd8')); }   // offering a paper
}
const CRANE = { idle0: {}, idle1: { bob: 1 }, blink: { blink: 1 }, offer: { arm: 'offer' }, offer1: { arm: 'offer', bob: 1 }, w0: { step: 0 }, w1: { step: 1, bob: -1 }, w2: { step: 2 }, w3: { step: 3, bob: -1 } };

function atlas(table, draw, FW, FH) {
  const names = Object.keys(table), n = names.length, P = new PX(FW * n, FH), E = new PX(FW * n, FH);
  names.forEach((k, i) => {
    const p1 = new PX(FW, FH), e1 = new PX(FW, FH); draw(p1, e1, table[k]); p1.outline(.3);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const c = p1.get(x, y); if (c) P.set(i * FW + x, y, c); const e = e1.get(x, y); if (e) E.set(i * FW + x, y, e); }
  });
  const tex = texOf(P.done()), em = texOf(E.done()); for (const t of [tex, em]) t.repeat.set(1 / n, 1);
  return { tex, em, names, n, canvas: P.c };
}

export function makeGus(extra = {}) {
  const TB = { ...GUS, ...extra }, FW = 34, FH = 50, A = atlas(TB, drawGus, FW, FH);
  const mesh = billboard(A.tex, FW * SPX, FH * SPX, { em: A.em, emCol: '#ffffff', emI: 2.2 });
  const root = new THREE.Group(); root.add(mesh); root.userData.char = 'gus';
  const sh = blob(.42, .55); sh.position.y = .015; root.add(sh);
  return {
    root, mesh, atlas: A,
    frame(name) { const i = A.names.indexOf(name); if (i < 0) throw new Error('frame ' + name); A.tex.offset.x = A.em.offset.x = i / A.n; },
    face(cam, flip = false) { root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); mesh.scale.x = flip ? -1 : 1; },
    lanternPos(name, flip = false) {
      const p = TB[name] || {}, k = GUS_LAMP[p.arm || 'low'], by = p.bob || 0;
      const v = new THREE.Vector3((k[0] - FW / 2) * SPX * (flip ? -1 : 1), (FH - k[1] - by) * SPX, .08);
      v.applyAxisAngle(new THREE.Vector3(0, 1, 0), root.rotation.y); return v.add(root.position);
    },
  };
}
export function makeMabel() {
  const FW = 20, FH = 14, A = atlas(MABEL, drawMabel, FW, FH);
  const mesh = billboard(A.tex, FW * SPX, FH * SPX, {});
  const root = new THREE.Group(); root.add(mesh); root.userData.char = 'mabel';
  const sh = blob(.22, .5); sh.position.y = .012; root.add(sh);
  return {
    root, mesh, atlas: A,
    frame(name) { const i = A.names.indexOf(name); if (i < 0) throw new Error('frame ' + name); A.tex.offset.x = i / A.n; },
    face(cam, flip = false) { root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); mesh.scale.x = flip ? -1 : 1; },
  };
}

function simple(table, draw, FW, FH, name, o = {}) {
  const A = atlas(table, draw, FW, FH), mesh = billboard(A.tex, FW * SPX, FH * SPX, { em: o.em ? A.em : undefined, emCol: '#ffffff', emI: 2.2, shadow: o.shadow !== false });
  const root = new THREE.Group(); root.add(mesh); root.userData.char = name;
  if (o.shadow !== false) { const sh = blob(o.blob || .36, .5); sh.position.y = .012; root.add(sh); }
  return { root, mesh, atlas: A, frame(n) { const i = A.names.indexOf(n); if (i < 0) throw new Error(name + ' frame ' + n); A.tex.offset.x = i / A.n; if (o.em) A.em.offset.x = i / A.n; },
    face(cam, flip = false) { root.rotation.y = Math.atan2(cam.position.x - root.position.x, cam.position.z - root.position.z); mesh.scale.x = flip ? -1 : 1; } };
}
export const makeDunn = () => simple(DUNN, drawDunn, 34, 50, 'dunn', { blob: .42 });
export const makeWren = () => simple(WREN, drawWren, 34, 50, 'wren', { blob: .4, em: true });
export const makeStranger = () => { const c = simple(STRANGER, drawStranger, 34, 50, 'stranger', { shadow: false }); c.mesh.castShadow = false; return c; };
export const makePip = () => simple(PIP, drawPip, 22, 18, 'pip', { blob: .2 });
export const makeRollo = () => simple(ROLLO, drawRollo, 14, 10, 'rollo', { blob: .16 });
export const makeMarlo = () => simple(MARLO, drawMarlo, 34, 50, 'marlo', { blob: .38 });
export const makeCrane = () => simple(CRANE, drawCrane, 34, 50, 'crane', { blob: .36 });
export const MAKERS = { crane: makeCrane, marlo: makeMarlo, gus: makeGus, mabel: makeMabel, dunn: makeDunn, wren: makeWren, stranger: makeStranger, pip: makePip, rollo: makeRollo };
// Pose → frame name per character (walk cycles step at ~8.5 fps; idles alternate at ~1.4 Hz)
export function poseFrame(who, pose, t, seed = 0) {
  const w = ['w0', 'w1', 'w2', 'w3'][Math.floor(t * 8.5 + seed) % 4], i2 = Math.floor(t * 1.4 + seed) % 2, bl = Math.floor(t * 8 + seed) % 29 === 0;
  if (who === 'gus') return { walk: w, idle: bl ? 'blink' : (i2 ? 'idle1' : 'idle0'), look: bl ? 'lookBlink' : (i2 ? 'look1' : 'look'), up: i2 ? 'up1' : 'up', lookUp: i2 ? 'lookUp1' : 'lookUp', fwd: 'fwd' }[pose] || 'idle0';
  if (who === 'mabel') return { walk: ['w0', 'w1', 'w2', 'w3'][Math.floor(t * 11 + seed) % 4], sit: bl ? 'sitBlink' : (Math.floor(t * .9 + seed) % 2 ? 'sit1' : 'sit0'), idle: bl ? 'standBlink' : 'stand' }[pose] || 'sit0';
  if (who === 'dunn') return { walk: w, idle: bl ? 'blink' : (i2 ? 'idle1' : 'idle0'), point: i2 ? 'point1' : 'point' }[pose] || 'idle0';
  if (who === 'crane') return { walk: w, idle: bl ? 'blink' : (i2 ? 'idle1' : 'idle0'), offer: i2 ? 'offer1' : 'offer' }[pose] || 'idle0';
  if (who === 'marlo') return { walk: w, idle: bl ? 'blink' : (i2 ? 'idle1' : 'idle0'), wave: i2 ? 'wave1' : 'wave' }[pose] || 'idle0';
  if (who === 'wren') return { idle: bl ? 'blink' : (i2 ? 'idle1' : 'idle0'), open: i2 ? 'open1' : 'open' }[pose] || 'idle0';
  if (who === 'stranger') return { walk: w, idle: i2 ? 'idle1' : 'idle0' }[pose] || 'idle0';
  if (who === 'pip') return { fly: ['fly0', 'fly1', 'fly2', 'fly3'][Math.floor(t * 7 + seed) % 4], idle: bl ? 'standBlink' : (Math.floor(t * .8 + seed) % 2 ? 'stand1' : 'stand0') }[pose] || 'stand0';
  if (who === 'rollo') return { walk: ['w0', 'w1', 'w2', 'w3'][Math.floor(t * 12 + seed) % 4], idle: Math.floor(t * 2 + seed) % 2 ? 'idle1' : 'idle0' }[pose] || 'idle0';
  return 'idle0';
}
export const FRAMES = { GUS: Object.keys(GUS), MABEL: Object.keys(MABEL) };
