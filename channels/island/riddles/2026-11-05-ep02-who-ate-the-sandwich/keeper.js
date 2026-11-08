// Gus, the lighthouse keeper: an original character for this channel (mid-century limited animation).
// Front view, feet at (0,0), cap top ≈ -555. Body is a held drawing; only arms, hands, eyes, brows, mouth move.
// Hand drawing technique (four-finger UPA glove: stroke the union first, fill second) learned from the
// lemo-opuscar midcentury-toon demo; the character, proportions and costume are our own.
import { PAL, shape, ink, ellipse, spline, xform, move, rrect, TAU, reg, path } from './engine/toon.js';

export const KC = { navy: '#34405E', navyD: '#252E45', stripe: '#E4613F', sweater: '#FBF6EA', beard: '#F7F1E3', beardD: '#DCD2BE' };
const UA = 92, FA = 86;

export function drawHand(ctx, x, y, a, kind = 'open', side = 1, k = 1, skin = PAL.skin) {
  const parts = [], seps = [];
  const E = (cx, cy, rx, ry, rot = 0) => parts.push(ellipse(cx, cy, rx, ry, 18, 0, TAU, rot));
  E(12, 0, 15, 13.5);
  if (kind === 'open') { [-0.62, 0, 0.62].forEach(r => E(12 + Math.cos(r) * 25, Math.sin(r) * 25, 12, 5, r)); E(4, -15 * side, 10, 5, -1.35 * side); }
  else if (kind === 'point') { E(38, -5 * side, 19, 4.8); E(25, 5 * side, 7, 6); E(20, 11 * side, 6, 5.5); E(8, -14 * side, 8.5, 5, -1.0 * side); }
  else { E(26, -8, 6.5, 6.5); E(28, 1, 6.5, 6.5); E(25, 10, 6, 6); E(12, -14 * side, 9, 5.5, -0.4 * side); seps.push([[22, -3.5], [30, -3.5]], [[22, 5.5], [29, 5.5]]); }
  const P = parts.map(p => xform(p, x, y, a, k));
  ctx.save(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6 * k; ctx.lineJoin = 'round';
  for (const p of P) { path(ctx, p); ctx.stroke(); }
  const o = reg(77, 0.6); ctx.fillStyle = skin;
  for (const p of P) { path(ctx, move(p, o[0] * 0.5, o[1] * 0.5)); ctx.fill(); }
  ctx.lineWidth = 2.4 * k; ctx.lineCap = 'round';
  for (const s2 of seps) { const q = xform(s2, x, y, a, k); ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.stroke(); }
  ctx.restore();
}

// a coral sleeve as a thick ink ribbon with a colour ribbon printed off-register on top
export function sleeve(ctx, pts, w, seed, col = KC.stripe) {
  ink(ctx, pts, w, { seed, taper: false, wob: 0.08 });
  const o = reg(seed, 1);
  ink(ctx, move(pts, o[0] * 0.6, o[1] * 0.6), w * 0.66, { seed: seed + 1, taper: false, wob: 0.05, color: col });
}

function joints(which, arm) {
  const sh = which === 'F' ? [80, -352] : [-80, -352];
  const el = [sh[0] + Math.cos(arm.a1) * UA, sh[1] + Math.sin(arm.a1) * UA];
  const ha = [el[0] + Math.cos(arm.a2) * FA, el[1] + Math.sin(arm.a2) * FA];
  return { sh, el, ha, a2: arm.a2 };
}
const REST = { F: { a1: 1.2, a2: 1.42 }, B: { a1: 1.94, a2: 1.72 } };

function drawArm(ctx, which, arm, hand, seed) {
  const J = joints(which, arm || REST[which]);
  const P = spline([J.sh, [(J.sh[0] + J.el[0]) / 2, (J.sh[1] + J.el[1]) / 2], J.el, [(J.el[0] + J.ha[0]) / 2, (J.el[1] + J.ha[1]) / 2], J.ha], false, 6);
  sleeve(ctx, P, 30, seed);
  drawHand(ctx, J.ha[0], J.ha[1], hand?.a ?? J.a2, hand?.kind || 'open', which === 'F' ? -1 : 1, 1.05);
}

function eye(ctx, x, y, face, blink, i) {
  if (blink > 0.5 || face === 'happy') {
    ink(ctx, face === 'happy' ? [[x - 9, y + 3], [x, y - 6], [x + 9, y + 3]] : [[x - 9, y], [x + 9, y]], 4.2, { seed: 80 + i, taper: false });
  } else {
    const r = face === 'wow' ? 9 : 7.2;
    shape(ctx, ellipse(x, y, r * 0.8, r * 1.3, 14), { fill: PAL.ink, line: 0, grain: 0, off: [0, 0] });
    shape(ctx, ellipse(x + 1.6, y - 3.6, 2.3, 2.7, 8), { fill: PAL.white, line: 0, grain: 0, off: [0, 0] });
  }
  // brows: puzzled = one up one down; wow = both high
  let by = y - 22, tilt = 0;
  if (face === 'wow') by = y - 30;
  if (face === 'puzzled') { by = i ? y - 30 : y - 18; tilt = i ? -4 : 3; }
  ink(ctx, [[x - 11, by + tilt], [x + 11, by - tilt - 2]], 5, { seed: 90 + i, taper: true });
}

// pose: { x, y, s, face, blink, look:[dx,dy], armF:{a1,a2}, armB, handF:{kind,a}, handB, walk (0..1 phase, legs scissor) }
export function drawKeeper(ctx, p) {
  const s = p.s ?? 1, face = p.face || 'neutral', look = p.look || [0, 0];
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s, s);
  // legs + boots (held; scissor only when walking)
  const w = p.walk ?? null, lift = w === null ? [0, 0] : [Math.max(0, Math.sin(w * TAU)) * 22, Math.max(0, -Math.sin(w * TAU)) * 22];
  [[-30, 0], [30, 1]].forEach(([lx, i]) => {
    shape(ctx, rrect(lx - 22, -182 - lift[i], 44, 150, 14), { fill: KC.navy, line: 4, seed: 300 + i, grain: 0.3 });
    shape(ctx, ellipse(lx + (i ? 10 : -10), -22 - lift[i], 40, 22, 20), { fill: PAL.ink, line: 0, seed: 310 + i, grain: 0.1, off: [0, 0] });
  });
  drawArm(ctx, 'B', p.armB, p.handB, 330);
  // striped sweater: bean body, stripes clipped inside
  const body = spline([[-92, -330], [-60, -392], [0, -404], [60, -392], [92, -330], [100, -230], [84, -168], [0, -152], [-84, -168], [-100, -230]], true, 8);
  shape(ctx, body, { fill: KC.sweater, line: 0, seed: 320, grain: 0.25 });
  const o = reg(321, 1);
  ctx.save(); path(ctx, move(body, o[0], o[1])); ctx.clip(); ctx.fillStyle = KC.stripe;
  for (let k = 0; k < 6; k++) ctx.fillRect(-120 + o[0], -380 + k * 40 + o[1], 240, 18);
  ctx.restore();
  ink(ctx, body, 4.4, { closed: true, seed: 322, breaks: 0.15 });
  drawArm(ctx, 'F', p.armF, p.handF, 340);
  // head: round face, white beard, red nose, navy cap
  shape(ctx, ellipse(0, -452, 70, 72, 40), { fill: PAL.skin, line: 4.2, seed: 350, grain: 0.15, breaks: 0.2 });
  const beard = spline([[-74, -448], [-60, -410], [-34, -376], [0, -364], [34, -376], [60, -410], [74, -448], [44, -430], [18, -440], [0, -432], [-18, -440], [-44, -430]], true, 6);
  shape(ctx, beard, { fill: KC.beard, line: 4, seed: 351, grain: 0.2, breaks: 0.25, shade: [{ pts: ellipse(0, -372, 60, 16, 20), color: KC.beardD, alpha: 0.8 }] });
  if (face === 'wow') shape(ctx, ellipse(0, -404, 13, 16, 16), { fill: PAL.coralD, line: 3.4, seed: 352, grain: 0, breaks: 0 });
  else if (face === 'happy') ink(ctx, spline([[-22, -410], [0, -398], [22, -410]], false, 5), 4, { seed: 353 });
  else if (face === 'puzzled') ink(ctx, spline([[-16, -404], [-4, -410], [6, -402], [18, -408]], false, 5), 4, { seed: 354 });
  shape(ctx, ellipse(0, -446, 15, 12, 16), { fill: PAL.coralL, line: 3.4, seed: 355, grain: 0.1, breaks: 0 });
  [-27, 27].forEach((x, i) => eye(ctx, x + look[0], -472 + look[1], face, p.blink ?? 0, i));
  // cap: crown + brim + badge
  shape(ctx, spline([[-74, -500], [-64, -546], [0, -562], [64, -546], [74, -500]], true, 6), { fill: KC.navy, line: 4.2, seed: 360, grain: 0.3 });
  shape(ctx, ellipse(0, -500, 86, 14, 30), { fill: KC.navyD, line: 4, seed: 361, grain: 0.2 });
  shape(ctx, ellipse(0, -526, 13, 13, 16), { fill: PAL.mustard, line: 3, seed: 362, grain: 0.1, breaks: 0 });
  ctx.restore();
}
