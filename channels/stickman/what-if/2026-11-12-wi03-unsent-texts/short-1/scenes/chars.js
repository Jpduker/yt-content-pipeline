// WI02 characters: our own heads, hair, hats and faces on top of the kit body, so a character looks the SAME in wide shots and close-ups.
// HERO RULE (Vivek, 2026-11-10, strict): the hero matches the channel image (Gemini_Generated_Image_g8xao4g8xao4g8xa.jfif):
// smooth round black head, no hair, no cap; tall white oval eyes; short thin brows; small curved smile; green hoodie, hood down around the neck,
// drawstrings; warm amber rim light. Never change it per shot.
import { E, S, circle, seg, rr, poly, glow, alpha, shade, mix } from '/engine/core.js';
import { drawFigure, headPos, POSES } from '/engine/rig2d.js';
import { CAST } from './cast.js';

const FEAT = '#f4ecdf';
// ---------- face v3: parametric, so expressions BLEND and read on a phone (JP 2026-11-11: "emotions were not conveyed") ----------
// bl brow lift · bt brow tilt (+ inner end up = sad/worried, − = angry) · ab one brow up · eh/ew eye size · lt top lid · lb bottom lid (cheeks)
// mc mouth curve (+ smile, − frown) · mw width · mo open · am crooked mouth · wob wobble · press pressed lips · tw tears welling · sw sweat · dr droop (head + shoulders)
const Z = { bl: 0, bt: 0, ab: 0, eh: 1, ew: 1, lt: 0, lb: 0, mc: .25, mw: .85, mo: 0, am: 0, wob: 0, press: 0, tw: 0, sw: 0, dr: 0 };
export const EX = {
  neutral: {}, smile: { mc: .62, mw: 1.05, lb: .14 }, happy: { mc: .95, mw: 1.12, mo: .45, lb: .5, bl: .06 }, joy: { mc: 1, mw: 1.22, mo: .75, lb: .8, bl: .12 },
  laugh: { mc: 1, mw: 1.2, mo: .95, lb: .95, lt: .1, bl: .1 }, tender: { mc: .5, mw: .92, bt: .4, bl: .05, lt: .2, lb: .18 }, relief: { mc: .45, bt: .35, lt: .4, eh: .92, dr: .15 },
  flat: { mc: 0, lt: .32, bl: -.04 }, pressed: { mc: 0, mw: .62, eh: 1.06, bl: .04, bt: .2, press: 1 }, holdback: { mc: -.1, mw: .6, press: 1, bt: .7, bl: .05, tw: .5, dr: .2 },
  surprised: { eh: 1.28, ew: 1.1, bl: .17, mo: .38, mw: .5, mc: 0 }, shocked: { eh: 1.45, ew: 1.16, bl: .24, mo: .75, mw: .62, mc: 0 }, awe: { eh: 1.32, bl: .19, mo: .25, mw: .45, mc: .2 },
  sad: { bt: .85, bl: .03, eh: .9, lt: .28, mc: -.65, mw: .8, dr: .6 }, hurt: { bt: 1.1, bl: .07, lt: .16, mc: -.5, mw: .72, wob: .7, tw: .6, dr: .45 },
  teary: { bt: 1, bl: .05, lt: .22, mc: -.3, mw: .75, wob: .5, tw: 1, dr: .35 }, cry: { bt: 1.1, lt: 1, mc: -.85, mo: .22, tw: 1, dr: .8 },
  worried: { bt: .8, bl: .06, eh: 1.06, mc: -.22, wob: .5, mw: .8, dr: .15 }, nervous: { bt: .6, bl: .05, eh: 1.1, mc: -.05, wob: .9, mw: .9, sw: 1 }, scared: { bt: .9, bl: .16, eh: 1.32, mo: .3, wob: .6, mc: -.2 },
  guilty: { bt: .7, lt: .38, mc: -.28, mw: .62, dr: .5 }, confused: { ab: .9, mc: -.12, am: .5, mw: .7 }, thinking: { ab: .55, mc: .05, mw: .6, lt: .12 },
  angry: { bt: -.9, lt: .28, mc: -.45, mw: .8, bl: -.07 }, determined: { bt: -.55, lt: .16, mc: .1, mw: .7 }, smirk: { am: 1, mc: .42, lt: .16, mw: .9 },
  sleepy: { lt: .78, mc: .1, bl: -.05, dr: .3 }, wince: { lt: .62, lb: .5, bt: .7, mc: -.3, mw: .9, wob: .4 }, tearsmile: { mc: .6, mw: 1, bt: .7, bl: .05, lb: .3, tw: .9 },
};
export const exP = e => typeof e === 'string' ? { ...Z, ...(EX[e] || {}) } : { ...Z, ...(e || {}) };
export function mixEx(a, b, k) { const A = exP(a), B = exP(b), o = {}; for (const key in Z) o[key] = A[key] + (B[key] - A[key]) * k; return o; }
export function face(g, x, y, r, o = {}) {
  const f = o.facing ?? 1, front = !!o.front, P = exP(o.ex || o.expr), name = typeof o.expr === 'string' ? o.expr : '';
  const lk = o.look || (name === 'thinking' ? [.6, -.7] : name === 'guilty' ? [0, .7] : [0, 0]), talk = o.talk || 0, ink = S().ink;
  const cx = x + (front ? 0 : f * r * .30) + lk[0] * r * .05, cy = y - r * .02 + lk[1] * r * .04 + P.dr * r * .03;
  const ey = cy - r * .12, sep = front ? r * .30 : r * .25;
  const eyes = front ? [[cx - sep, 1, -1], [cx + sep, 1, 1]] : [[cx - f * r * .2, .78, -f], [cx + f * r * .26, 1, f]];   // [x, scale, outer side]
  const lw = r * .085, col = FEAT;
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  eyes.forEach(([ex0, sx, out], i) => {
    const w = r * .088 * sx * P.ew, h = r * .17 * P.eh, px = ex0 + lk[0] * r * .035, py = ey + lk[1] * r * .03;
    const lt = o.blink ? 1 : P.lt;
    if (lt >= .95) { g.strokeStyle = col; g.lineWidth = lw * .9; g.beginPath(); g.moveTo(px - w * 1.25, py + h * .25); g.quadraticCurveTo(px, py + h * (.25 + .3 * (P.mc < 0 ? 1 : -.6)), px + w * 1.25, py + h * .25); g.stroke(); }
    else {
      g.fillStyle = col; g.beginPath(); g.ellipse(px, py, w, h, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = ink;
      if (lt > .01) { const tl = P.bt * h * .5 * out; g.beginPath(); g.moveTo(px - w * 1.5, py - h * 1.2); g.lineTo(px + w * 1.5, py - h * 1.2); g.lineTo(px + w * 1.5, py - h + 2 * h * lt + tl); g.lineTo(px - w * 1.5, py - h + 2 * h * lt - tl); g.closePath(); g.fill(); }
      if (P.lb > .01) { const R = w * 1.9; g.beginPath(); g.arc(px, py + h - 2 * h * P.lb * .78 + R, R, 0, Math.PI * 2); g.fill(); }
      if (P.tw > .05) { g.strokeStyle = `rgba(150,205,255,${.95 * P.tw})`; g.lineWidth = lw * .7; g.beginPath(); g.ellipse(px, py, w * .82, h * .86, 0, Math.PI * .15, Math.PI * .85); g.stroke(); }
    }
    if (o.lashes && lt < .95 && P.lb < .6) seg(g, [[px + out * w * .95, py - h * .5], [px + out * w * 1.6, py - h * .72]], lw * .5, col);
    if (o.glasses) { g.strokeStyle = alpha(col, .9); g.lineWidth = lw * .45; g.beginPath(); g.arc(ex0, ey, r * .2 * sx, 0, Math.PI * 2); g.stroke(); }
    // brow
    if (name !== 'sleepy') { const bw = r * .14 * sx, by = ey - r * (.3 + .05 * (P.eh - 1) * 4) - P.bl * r + (i === 1 ? -P.ab * r * .13 : P.ab * r * .035);
      const inner = -out, yi = by - P.bt * r * .085, yo = by + P.bt * r * .045;
      seg(g, [[ex0 + inner * bw, yi], [ex0 + out * bw, yo]], lw * .85, col); }
  });
  if (o.glasses) seg(g, [[eyes[0][0] + r * .2 * eyes[0][1] * (front ? 1 : f), ey], [eyes[1][0] - r * .2 * (front ? 1 : f), ey]], lw * .4, alpha(col, .9));
  // mouth
  const my = cy + r * .33, mx = cx + (front ? 0 : f * r * .05); let mw = r * .235 * P.mw, mo = P.mo, mc = P.mc;
  if (talk > .05) { mo = Math.max(mo * .5, .12 + .62 * talk); mw *= .78 + .1 * (1 - talk); mc *= .6; }
  const xl = mx - mw, xr = mx + mw, yl = my - mc * r * .05 + P.am * r * .02, yr = my - mc * r * .05 - P.am * r * .075, cyy = my + mc * r * .17;
  if (mo > .06) { g.fillStyle = col; g.beginPath(); g.moveTo(xl, yl); g.quadraticCurveTo(mx, my + mc * r * .06 - mo * r * .03, xr, yr); g.quadraticCurveTo(mx, cyy + mo * r * .3, xl, yl); g.closePath(); g.fill(); g.strokeStyle = col; g.lineWidth = lw * .5; g.stroke(); }
  else { g.strokeStyle = col; g.lineWidth = lw * (P.press > .5 ? 1.2 : 1); g.beginPath(); const N = 14, tt = (o.t || 0);
    for (let i = 0; i <= N; i++) { const q = i / N, xx = (1 - q) ** 2 * xl + 2 * (1 - q) * q * mx + q * q * xr, yy = (1 - q) ** 2 * yl + 2 * (1 - q) * q * cyy + q * q * yr + Math.sin(q * Math.PI * 3 + tt * 9) * P.wob * r * .022; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke();
    if (P.press > .5) { seg(g, [[xl - r * .03, yl - r * .025], [xl, yl + r * .015]], lw * .6, col); seg(g, [[xr + r * .03, yr - r * .025], [xr, yr + r * .015]], lw * .6, col); } }
  if (P.sw > .5) { g.fillStyle = 'rgba(170,215,255,.9)'; g.beginPath(); const sx0 = cx + (front ? r * .62 : -f * r * .1), sy0 = cy - r * .52; g.moveTo(sx0, sy0 - r * .12); g.quadraticCurveTo(sx0 + r * .08, sy0 + r * .02, sx0, sy0 + r * .07); g.quadraticCurveTo(sx0 - r * .08, sy0 + r * .02, sx0, sy0 - r * .12); g.fill(); }
  if (o.tear != null && o.tear > 0) { const q = Math.min(1, o.tear), ex0 = eyes[1][0], h = r * .17 * P.eh; g.fillStyle = 'rgba(170,215,255,.95)'; const ty = ey + h * .9 + q * r * .5, tr = r * .05 * Math.min(1, q * 4);
    g.beginPath(); g.moveTo(ex0, ty - tr * 2.2); g.quadraticCurveTo(ex0 + tr * 1.3, ty, ex0, ty + tr); g.quadraticCurveTo(ex0 - tr * 1.3, ty, ex0, ty - tr * 2.2); g.fill(); }
  g.restore();
}

// ---------- hair / hats (drawn in world space around a head at (x,y) radius r) ----------
// back: -1 = behind the head is to the left. front: front-facing bust.
function tail(g, pts, w0, w1, fill) {   // tapered stroke along a quadratic (root, ctrl, tip)
  const [[x0, y0], [x1, y1], [x2, y2]] = pts, N = 18, L = [], R = [];
  for (let i = 0; i <= N; i++) { const t = i / N, x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * x1 + t * t * x2, y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
    const dx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1), dy = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1), n = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * t ** .8) / 2;
    L.push([x - dy / n * w, y + dx / n * w]); R.push([x + dy / n * w, y - dx / n * w]); }
  g.fillStyle = fill; g.beginPath(); [...L, ...R.reverse()].forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
  circle(g, x2, y2, w1 / 2, fill);
}
export const HAIR = {
  // Mira: high ponytail with a yellow scrunchie, tapered, swinging slightly; same design in wide shots and close-ups
  ponytail: { behind(g, x, y, r, back, o) { const sw = Math.sin((o.t || 0) * 2.2) * r * .06, ink = S().ink;
      const P = [[x + back * r * .62, y - r * .72], [x + back * r * 1.55, y - r * .55 + sw * .3], [x + back * r * 1.18 + sw, y + r * 1.05]];
      if (o.rim) tail(g, P.map(([a, b]) => [a + o.rim[0], b + o.rim[1]]), r * .5, r * .14, o.rimCol);
      tail(g, P, r * .5, r * .14, ink); },
    front(g, x, y, r, back, o) { const c = o.tie || '#f2c21a'; g.save(); g.translate(x + back * r * .93, y - r * .66); g.rotate(back * .9); rr(g, -r * .1, -r * .17, r * .2, r * .34, r * .08); g.fillStyle = c; g.fill(); g.fillStyle = shade(c, -.25); g.fillRect(-r * .1, -r * .02, r * .2, r * .06); g.restore(); } },
  bun: { behind(g, x, y, r, back) { circle(g, x + back * r * .55, y - r * .9, r * .42, S().ink); } },
  beanie: { front(g, x, y, r, back, o) { const c = o.color || '#f29ac0', d = shade(c, -.28), top = y - r * .5;
      g.save(); g.beginPath(); g.rect(x - r * 1.3, y - r * 1.4, r * 2.6, r * .92); g.clip(); circle(g, x - back * r * .04, y - r * .02, r * 1.07, c); g.restore();
      for (let i = -3; i <= 3; i++) seg(g, [[x + i * r * .26, top - r * .12], [x + i * r * .22, y - r * .95]], r * .035, alpha(d, .5));
      rr(g, x - r * 1.1, top - r * .16, r * 2.2, r * .24, r * .1); g.fillStyle = d; g.fill(); circle(g, x - back * r * .15, y - r * 1.12, r * .2, shade(c, .2)); } },
  headband: { behind(g, x, y, r, back) { circle(g, x + back * r * .6, y - r * .82, r * .36, S().ink); },
    front(g, x, y, r, back, o) { const c = o.color || '#8a5ad6'; g.save(); g.beginPath(); g.arc(x, y, r * 1.02, 0, Math.PI * 2); g.clip(); g.fillStyle = c; g.fillRect(x - r * 1.2, y - r * .66, r * 2.4, r * .2); g.restore(); } },
  capBack: { front(g, x, y, r, back, o) { const c = o.color || '#e8743b';
      g.save(); g.beginPath(); g.rect(x - r * 1.3, y - r * 1.4, r * 2.6, r * 1.0); g.clip(); circle(g, x, y - r * .02, r * 1.05, c); g.restore();
      if (!o.front) seg(g, [[x + back * r * .55, y - r * .42], [x + back * r * 1.5, y - r * .34]], r * .2, shade(c, -.3));
      else rr(g, x - r * .3, y - r * .5, r * .6, r * .1, r * .05), g.fillStyle = shade(c, -.3), g.fill();
      g.strokeStyle = alpha('#fff', .35); g.lineWidth = r * .06; g.beginPath(); g.arc(x, y - r * .1, r * .8, Math.PI * 1.2, Math.PI * 1.45); g.stroke(); } },
  cap: { front(g, x, y, r, back, o) { const c = o.color || '#2a2430'; g.save(); g.beginPath(); g.rect(x - r * 1.3, y - r * 1.4, r * 2.6, r * 1.0); g.clip(); circle(g, x, y, r * 1.04, c); g.restore(); if (!o.front) seg(g, [[x - back * r * .4, y - r * .42], [x - back * r * 1.4, y - r * .34]], r * .2, shade(c, -.2)); } },
  bunTop: { behind(g, x, y, r, back) { circle(g, x + back * r * .2, y - r * 1.02, r * .4, S().ink); } },
  flatcap: { front(g, x, y, r, back, o) { const c = o.color || '#2aa6a0'; g.save(); g.beginPath(); g.rect(x - r * 1.4, y - r * 1.5, r * 2.8, r * .98); g.clip(); g.fillStyle = c; g.beginPath(); g.ellipse(x - back * r * .08, y - r * .1, r * 1.12, r * 1.02, 0, 0, Math.PI * 2); g.fill(); g.restore();
      seg(g, [[x - back * r * .5, y - r * .52], [x - back * r * 1.35, y - r * .44]], r * .16, shade(c, -.3)); rr(g, x - r * 1.05, y - r * .6, r * 2.1, r * .12, r * .05); g.fillStyle = shade(c, -.25); g.fill(); } },
  peaked: { front(g, x, y, r, back, o) { const c = o.color || '#1f8a8a'; g.save(); g.beginPath(); g.rect(x - r * 1.4, y - r * 1.6, r * 2.8, r * 1.02); g.clip(); circle(g, x, y - r * .05, r * 1.08, c); g.restore();
      rr(g, x - r * 1.08, y - r * .66, r * 2.16, r * .2, r * .06); g.fillStyle = shade(c, -.4); g.fill(); seg(g, [[x - back * r * .3, y - r * .5], [x - back * r * 1.3, y - r * .4]], r * .17, '#15151c');
      circle(g, x - back * r * .1, y - r * .95, r * .1, '#ffd47e'); } },
  curly: { behind(g, x, y, r, back) { for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * .13); circle(g, x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9, r * .32, S().ink); } } },
};
// per character head spec: hair/hat + colour, lashes
export const HEAD = {
  YOU: {}, MIRA: { hair: 'ponytail', tie: '#f2c21a', lashes: true }, MIRA_EVE: { hair: 'ponytail', tie: '#f2c21a', lashes: true },
  BARISTA: { hair: 'capBack', color: '#e8743b' }, BOSS: {}, COLL: { hair: 'headband', color: '#8a5ad6', lashes: true },
  TRAIN: { hair: 'beanie', color: '#f29ac0', lashes: true },
  MIRA_HOME: { hair: 'ponytail', tie: '#f2c21a', lashes: true }, MUM: { hair: 'bunTop', lashes: true, glasses: true }, NEIGH: { hair: 'flatcap', color: '#2aa6a0' },
  DRIVER: { hair: 'peaked', color: '#1f8a8a' }, LIFT: { hair: 'curly', lashes: true }, YOU_REF: {},
  X1: {}, X2: { hair: 'cap', color: '#2a2430' }, X3: { hair: 'curly' }, X4: { hair: 'bun', lashes: true }, X5: { hair: 'beanie', color: '#3a3040' },
};

// ---------- full figure: kit body + our head ----------
export function drawChar(g, id, fig, t = 0) {
  const H = HEAD[id] || {}, of = { ...CAST[id], head: 'none' }, f = fig.facing ?? 1;
  const o = { ...fig, outfit: of, expr: 'neutral', face: { brows: null } };
  const [hx, hy, hr] = headPos(o), rim = fig.rim, rw = (rim?.w ?? 4);
  const rimOff = rim ? [rim.dir[0] * rw * 1.2, rim.dir[1] * rw * 1.2] : null;
  const hair = H.hair && HAIR[H.hair];
  g.save(); if (fig.alpha != null) g.globalAlpha *= fig.alpha;
  if (hair?.behind) hair.behind(g, hx, hy, hr, -f, { t, rim: rimOff, rimCol: rim?.color, ...H });
  drawFigure(g, o);
  circle(g, hx, hy, hr * .995, S().ink);                                   // wipe the kit face
  const droop = exP(fig.ex || fig.expr).dr, hrot = (fig.rot || 0) + droop * .16 * f;
  g.save(); if (hrot) { g.translate(hx, hy + hr); g.rotate(hrot); g.translate(-hx, -hy - hr); }
  face(g, hx, hy, hr, { facing: fig.headF ?? f, expr: fig.expr, ex: fig.ex, talk: fig.talk, blink: fig.blink, look: fig.look, lashes: H.lashes, glasses: H.glasses, tear: fig.tear, t });
  if (hair?.front) hair.front(g, hx, hy, hr, -f, { ...H, t });
  g.restore(); g.restore();
  return [hx, hy, hr];
}

// ---------- close-up bust (matches the channel image) ----------
export function bust(g, cx, cy, r, id, o = {}) {
  const H = HEAD[id] || {}, C = CAST[id] || {}, ink = S().ink, side = o.rimSide ?? 1, rc = o.rimColor || '#ffb45a', hairSide = o.hairSide ?? -side;
  const DR = exP(o.ex || o.expr).dr;
  g.save(); g.translate(cx, cy + DR * r * .07); g.rotate((o.tilt || 0) + DR * .07 * side);
  const sy = r * (1.02 + DR * .05), shW = r * (1.45 - DR * .06);
  // shoulders / clothes
  const torso = (fill, grow = 0) => { g.fillStyle = fill; g.beginPath(); g.moveTo(-shW - grow, r * 3.2); g.lineTo(-shW - grow, sy + r * .62); g.quadraticCurveTo(-shW * .95 - grow, sy - grow, -r * .45, sy - r * .05 - grow); g.lineTo(r * .45, sy - r * .05 - grow); g.quadraticCurveTo(shW * .95 + grow, sy - grow, shW + grow, sy + r * .62); g.lineTo(shW + grow, r * 3.2); g.closePath(); g.fill(); };
  const top = C.top, col = C.color || ink;
  g.fillStyle = ink; g.fillRect(-r * .22, r * .6, r * .44, sy - r * .45);          // neck (behind the collar)
  const hair = H.hair && HAIR[H.hair];
  if (hair?.behind) hair.behind(g, 0, 0, r, hairSide, { t: o.t, rim: [side * r * .05, -r * .02], rimCol: rc, ...H });
  // rim behind body + head
  g.save(); g.translate(side * r * .055, -r * .02); torso(rc); circle(g, 0, 0, r, rc); g.restore();
  g.fillStyle = ink; g.fillRect(-r * .22, r * .6, r * .44, sy - r * .45);
  if (top === 'hoodie') {
    torso(col);
    g.fillStyle = shade(col, -.32); g.beginPath(); g.ellipse(0, sy + r * .05, r * .95, r * .34, 0, 0, Math.PI * 2); g.fill();       // hood bunched round the neck
    g.fillStyle = col; g.beginPath(); g.ellipse(0, sy + r * .18, r * .78, r * .26, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = shade(col, -.45); g.lineWidth = r * .045; g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, sy + r * .1, r * .82, r * .28, 0, Math.PI * .05, Math.PI * .95); g.stroke();
    seg(g, [[-r * .2, sy + r * .3], [-r * .25, sy + r * .85]], r * .035, shade(col, -.5)); seg(g, [[r * .2, sy + r * .3], [r * .24, sy + r * .8]], r * .035, shade(col, -.5));   // drawstrings
    seg(g, [[-shW * .82, sy + r * .9], [-shW * .78, r * 3]], r * .04, shade(col, -.35)); seg(g, [[shW * .82, sy + r * .9], [shW * .78, r * 3]], r * .04, shade(col, -.35));     // seams
  } else if (top === 'trench') {
    torso(col); poly(g, [[-r * .42, sy - r * .02], [0, sy + r * .9], [r * .42, sy - r * .02]], ink);
    g.strokeStyle = shade(col, -.35); g.lineWidth = r * .05; g.beginPath(); g.moveTo(-r * .45, sy); g.lineTo(-r * .62, sy + r * .55); g.lineTo(-r * .1, sy + r * 1.1); g.moveTo(r * .45, sy); g.lineTo(r * .62, sy + r * .55); g.lineTo(r * .1, sy + r * 1.1); g.stroke();
  } else if (top === 'suit') {
    torso(col); poly(g, [[-r * .35, sy - r * .02], [0, sy + r * 1.0], [r * .35, sy - r * .02]], '#e8e4ee'); poly(g, [[-r * .08, sy + r * .02], [r * .08, sy + r * .02], [r * .1, sy + r * .85], [0, sy + r * .98], [-r * .1, sy + r * .85]], C.color2 || '#3a6ea5');
  } else if (top === 'tshirt') {
    torso(col); g.fillStyle = ink; g.beginPath(); g.ellipse(0, sy + r * .02, r * .44, r * .2, 0, 0, Math.PI); g.fill();
  } else torso(ink);
  circle(g, 0, 0, r, ink);
  face(g, 0, 0, r, { front: true, expr: o.expr, ex: o.ex, talk: o.talk, blink: o.blink, look: o.look, lashes: H.lashes, glasses: H.glasses, tear: o.tear, t: o.t });
  if (hair?.front) hair.front(g, 0, 0, r, hairSide, { ...H, front: true, t: o.t });
  g.restore();
}
