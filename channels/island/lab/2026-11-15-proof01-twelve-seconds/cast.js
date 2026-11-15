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
export const FRAMES = { GUS: Object.keys(GUS), MABEL: Object.keys(MABEL) };
