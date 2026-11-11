// WI02 characters: our own heads, hair, hats and faces on top of the kit body, so a character looks the SAME in wide shots and close-ups.
// HERO RULE (Vivek, 2026-11-10, strict): the hero matches the channel image (Gemini_Generated_Image_g8xao4g8xao4g8xa.jfif):
// smooth round black head, no hair, no cap; tall white oval eyes; short thin brows; small curved smile; green hoodie, hood down around the neck,
// drawstrings; warm amber rim light. Never change it per shot.
import { E, S, circle, seg, rr, poly, glow, alpha, shade, mix } from '/engine/core.js';
import { drawFigure, headPos, POSES } from '/engine/rig2d.js';
import { CAST } from './cast.js';

const FEAT = '#f4ecdf';
// ---------- face (Gemini style) ----------
// expressions: neutral smile happy joy surprised shocked awe sad worried nervous scared confused thinking angry determined smirk sleepy cry pressed
export function face(g, x, y, r, o = {}) {
  const f = o.facing ?? 1, front = !!o.front, ex = o.expr || 'neutral', lk = o.look || (ex === 'thinking' ? [.6, -.7] : ex === 'confused' ? [-.3, -.2] : [0, 0]), talk = o.talk || 0;
  const cx = x + (front ? 0 : f * r * .30) + lk[0] * r * .05, cy = y - r * .02 + lk[1] * r * .04;
  const ey = cy - r * .12, sep = front ? r * .30 : r * .25;
  const eyes = front ? [[cx - sep, 1], [cx + sep, 1]] : [[cx - f * r * .2, .78], [cx + f * r * .26, 1]];
  const lw = r * .075, col = FEAT;
  const big = ['surprised', 'shocked', 'awe', 'scared'].includes(ex) ? 1.22 : ex === 'pressed' ? 1.08 : ['sad', 'cry'].includes(ex) ? .92 : 1;
  const closed = o.blink || ['sleepy', 'cry'].includes(ex), happyEyes = ['happy', 'joy'].includes(ex);
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [ex0, sx] of eyes) {
    const w = r * .085 * sx * big, h = r * .17 * big;
    if (closed) seg(g, [[ex0 - w * 1.2, ey + h * .2], [ex0 + w * 1.2, ey + h * .2]], lw * .9, col);
    else if (happyEyes) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(ex0, ey + h * .35, w * 1.35, Math.PI * 1.12, Math.PI * 1.88); g.stroke(); }
    else { g.fillStyle = col; g.beginPath(); g.ellipse(ex0 + lk[0] * r * .03, ey + lk[1] * r * .03, w, h, 0, 0, Math.PI * 2); g.fill(); }
    if (o.lashes && !closed && !happyEyes) { const out = front ? Math.sign(ex0 - cx) : (sx < 1 ? -f : f); seg(g, [[ex0 + out * w * .9, ey - h * .55], [ex0 + out * w * 1.9, ey - h * .95]], lw * .55, col); }
  }
  // brows: d > 0 lifts the INNER end (worried/sad); d < 0 drops it (angry)
  const by = ey - r * .3 * (big > 1 ? 1.12 : 1), bw = r * .11;
  const BR = { worried: .07, sad: .07, nervous: .06, scared: .08, cry: .07, angry: -.08, determined: -.06, surprised: 0, shocked: 0, awe: 0, confused: 'c', thinking: 't', pressed: .03 };
  const d = BR[ex];
  if (ex !== 'sleepy') for (const [ex0, sx] of eyes) {
    const inner = front ? Math.sign(cx - ex0) : (sx < 1 ? f : -f);      // +1: inner end is to the right
    let lift = big > 1 ? r * .06 : 0;
    if (d === 'c') lift = ex0 === eyes[0][0] ? r * .13 : -r * .04;
    if (d === 't') lift = ex0 === eyes[1][0] ? r * .1 : -r * .01;
    const dd = typeof d === 'number' ? d * r : 0, x0 = ex0 - bw * sx, x1 = ex0 + bw * sx;
    const y0 = by - lift + (inner < 0 ? -dd : dd * .2), y1 = by - lift + (inner > 0 ? -dd : dd * .2);
    seg(g, [[x0, y0], [x1, y1]], lw * .75, col);
  }
  // mouth
  const my = cy + r * .32, mx = cx + (front ? 0 : f * r * .05), mw = r * .2;
  const arc = (w, dy, up) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); if (up) g.arc(mx, my - w * .6 + dy, w, Math.PI * .2, Math.PI * .8); else g.arc(mx, my + w * .9 + dy, w, Math.PI * 1.22, Math.PI * 1.78); g.stroke(); };
  if (talk > .05) { g.fillStyle = col; g.beginPath(); g.ellipse(mx, my, mw * .55, r * (.04 + .13 * talk), 0, 0, Math.PI * 2); g.fill(); }
  else switch (ex) {
    case 'happy': case 'joy': g.fillStyle = col; g.beginPath(); g.arc(mx, my - r * .03, mw * 1.05, 0, Math.PI); g.closePath(); g.fill(); break;
    case 'smile': case 'neutral': arc(mw * (ex === 'smile' ? 1.05 : .85), 0, true); break;
    case 'smirk': g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(mx - mw * .7, my); g.quadraticCurveTo(mx + mw * .3, my + r * .07, mx + mw * .9, my - r * .06); g.stroke(); break;
    case 'surprised': case 'awe': g.strokeStyle = col; g.lineWidth = lw * .9; g.beginPath(); g.ellipse(mx, my + r * .02, mw * .38, r * .08, 0, 0, Math.PI * 2); g.stroke(); break;
    case 'shocked': g.fillStyle = col; g.beginPath(); g.ellipse(mx, my + r * .03, mw * .5, r * .12, 0, 0, Math.PI * 2); g.fill(); break;
    case 'sad': case 'cry': arc(mw * .85, r * .02, false); break;
    case 'worried': case 'nervous': case 'scared': case 'confused': { g.strokeStyle = col; g.lineWidth = lw * .85; g.beginPath(); for (let i = 0; i <= 8; i++) { const xx = mx - mw * .75 + i * mw * 1.5 / 8, yy = my + Math.sin(i * Math.PI / 2) * r * .025; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); break; }
    case 'pressed': seg(g, [[mx - mw * .45, my + r * .01], [mx + mw * .45, my + r * .01]], lw * 1.25, col); seg(g, [[mx - mw * .62, my - r * .015], [mx - mw * .5, my + r * .02]], lw * .6, col); seg(g, [[mx + mw * .62, my - r * .015], [mx + mw * .5, my + r * .02]], lw * .6, col); break;
    default: seg(g, [[mx - mw * .55, my + r * .01], [mx + mw * .55, my + r * .01]], lw, col);
  }
  if (ex === 'nervous') { g.fillStyle = 'rgba(170,215,255,.9)'; g.beginPath(); const sx0 = cx + (front ? r * .62 : -f * r * .1), sy0 = cy - r * .52; g.moveTo(sx0, sy0 - r * .12); g.quadraticCurveTo(sx0 + r * .08, sy0 + r * .02, sx0, sy0 + r * .07); g.quadraticCurveTo(sx0 - r * .08, sy0 + r * .02, sx0, sy0 - r * .12); g.fill(); }
  if (ex === 'cry' || o.tear) { const q = o.tear ?? .6; g.fillStyle = 'rgba(190,225,255,.9)'; circle(g, eyes[1][0], ey + r * (.2 + .25 * q), r * .045, 'rgba(190,225,255,.9)'); }
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
  curly: { behind(g, x, y, r, back) { for (let i = 0; i < 7; i++) { const a = Math.PI * (1.05 + i * .13); circle(g, x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9, r * .32, S().ink); } } },
};
// per character head spec: hair/hat + colour, lashes
export const HEAD = {
  YOU: {}, MIRA: { hair: 'ponytail', tie: '#f2c21a', lashes: true }, MIRA_EVE: { hair: 'ponytail', tie: '#f2c21a', lashes: true },
  BARISTA: { hair: 'capBack', color: '#e8743b' }, BOSS: {}, COLL: { hair: 'headband', color: '#8a5ad6', lashes: true },
  TRAIN: { hair: 'beanie', color: '#f29ac0', lashes: true },
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
  g.save(); if (fig.rot) { g.translate(hx, hy); g.rotate(fig.rot); g.translate(-hx, -hy); }
  face(g, hx, hy, hr, { facing: fig.headF ?? f, expr: fig.expr, talk: fig.talk, blink: fig.blink, look: fig.look, lashes: H.lashes, tear: fig.tear });
  if (hair?.front) hair.front(g, hx, hy, hr, -f, { ...H, t });
  g.restore(); g.restore();
  return [hx, hy, hr];
}

// ---------- close-up bust (matches the channel image) ----------
export function bust(g, cx, cy, r, id, o = {}) {
  const H = HEAD[id] || {}, C = CAST[id] || {}, ink = S().ink, side = o.rimSide ?? 1, rc = o.rimColor || '#ffb45a', hairSide = o.hairSide ?? -side;
  g.save(); g.translate(cx, cy); if (o.tilt) g.rotate(o.tilt);
  const sy = r * 1.02, shW = r * 1.45;
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
  face(g, 0, 0, r, { front: true, expr: o.expr, talk: o.talk, blink: o.blink, look: o.look, lashes: H.lashes, tear: o.tear });
  if (hair?.front) hair.front(g, 0, 0, r, hairSide, { ...H, front: true, t: o.t });
  g.restore();
}
