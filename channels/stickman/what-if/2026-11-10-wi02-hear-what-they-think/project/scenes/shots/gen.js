// WI02 shot builders. Every shot in story/shots.json carries params.k (builder) + data; this file draws them.
// Automatic from the voice timeline: lip-sync for spoken lines, thought threads (style v2 motif) for "-T" lines.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, text, talkAmount, FONTS, radGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { SETS, SC, GYf, F, lerpCam, table, longTable, chair, cup, steam, cafeCounter } from '../sets/world.js';
import { CAST, THREAD, GREEN, YELLOW } from '../cast.js';
import { cap } from './_cap.js';
import { drawChar, bust } from '../chars.js';

const base = new URL('../../timeline/', import.meta.url);
const LINES = await (await fetch(new URL('lines.json', base))).json();
const WALL = await (await fetch(new URL('words_all.json', base))).json();
// GrowKaz kit v1.1.0 bug: brows 'worried' render as angry and 'angry' as worried. Swap them here (kit stays untouched).
const BROW = { sad: 'angry', worried: 'angry', nervous: 'angry', scared: 'angry', cry: 'angry', angry: 'worried', determined: 'worried' };
const fixFace = ex => BROW[ex] ? { brows: BROW[ex] } : undefined;
const TAGOF = id => ({ YOU_TEE: 'YOU', MIRA_EVE: 'MIRA' }[id] || id);

// ---------- poses ----------
const sit = POSES.sit;
const P = {
  ...POSES,
  sitHands: { ...sit, eF: [30, -112], hF: [72, -112], eB: [24, -112], hB: [64, -110] },
  sitTalk: { ...sit, eF: [28, -116], hF: [54, -142], eB: [24, -112], hB: [64, -110] },
  sitLean: { ...sit, head: [18, -176], sh: [10, -144], eF: [38, -112], hF: [78, -112], eB: [32, -112], hB: [70, -110] },
  sitSmall: { ...sit, head: [2, -172], sh: [-1, -142], eF: [10, -108], hF: [24, -96], eB: [6, -108], hB: [20, -94] },
  sitSad: { ...sit, head: [12, -166], sh: [4, -140], eF: [24, -108], hF: [60, -110], eB: [18, -108], hB: [54, -108] },
  sitLaugh: { ...sit, head: [-4, -184], sh: [-2, -148], eF: [20, -112], hF: [16, -96], eB: [14, -112], hB: [10, -94] },
  sitThink: { ...sit, eF: [30, -122], hF: [20, -160], eB: [24, -112], hB: [64, -110] },
  sitPhone: { ...sit, eF: [26, -120], hF: [34, -154], eB: [10, -110], hB: [30, -84] },
  sitWrite: { ...sit, head: [14, -174], sh: [8, -144], eF: [34, -114], hF: [76, -114], eB: [28, -114], hB: [66, -112] },
  sitReach: { ...sit, head: [16, -178], sh: [10, -146], eF: [54, -124], hF: [104, -122], eB: [24, -112], hB: [64, -110] },
  sitArms: { ...sit, eF: [20, -126], hF: [-4, -132], eB: [14, -124], hB: [4, -130] },
  sitUp: { ...sit, head: [2, -186], sh: [0, -150] },
  sitCheer: { ...sit, eF: [24, -150], hF: [40, -186], eB: [-12, -150], hB: [-20, -186] },
  pointBoth: { ...POSES.point, eB: [20, -150], hB: [42, -160] },
};
const pose = (n, t, seed) => { const p = typeof n === 'string' ? P[n] || POSES.stand : n; return p; };
function seqVal(seq, k) { if (seq === undefined || seq === null) return undefined; if (!Array.isArray(seq) || !Array.isArray(seq[0])) return seq; let v = seq[0][1]; for (const [f, x] of seq) if (k >= f) v = x; return v; }
function poseSeq(seq, t, dur, seed) {
  if (!Array.isArray(seq)) return breathe(pose(seq || 'stand'), t, 1, seed);
  const pts = seq.map(([f, n]) => [f * dur, pose(n)]);
  return breathe(posesAt(t, pts, .28), t, 1, seed);
}
// ---------- voice timeline ----------
const linesIn = (a, b) => LINES.filter(l => l.end > a && l.start < b);
function talkFor(id, gt) { const tag = TAGOF(id); for (const l of LINES) if (!l.thought && l.tag === tag && gt > l.start - .05 && gt < l.end + .05) return talkAmount(gt, l.start, l.end); return 0; }
// v3 thought language (Vivek + Codex, 2026-11-10): no ribbon. A faint ivory "echo" outline slips off the THINKER's head and settles back,
// the background softens a little, edges darken; the words appear in the caption line in the thought style (_cap.js).
// Strong the first time (barista), fading as viewers learn the rule; none on "I miss him".
export const ECHO = { L003: .2, L008: 1, L016: .8, L019: .75, L024: .55, L028: .5, L039: .45, L041: .4, L049: .4, L052: .35, L055: .3, L057: .3, L066: 0, L081: .3, L083: .3, L088: .25, L096: .2 };
const IVORY = '#efe6d6';
function thoughtEnv(gt) { const l = LINES.find(l => l.thought && gt > l.start - .35 && gt < l.end + .5); if (!l) return [null, 0];
  const e = Math.min(ease.inOut(prog(gt, l.start - .35, l.start + .05)), 1 - ease.inOut(prog(gt, l.end + .05, l.end + .5))); return [l, e * (ECHO[l.id] ?? .3)]; }
function echo(g, x, y, r, line, gt, side = 1) {
  const k = ECHO[line.id] ?? .3; if (k <= 0) return;
  const q = prog(gt, line.start - .12, line.start + .6); if (q <= 0 || q >= 1) return;
  const a = Math.sin(Math.PI * q) * k, off = Math.sin(Math.PI * q) * r * .16;
  g.save(); g.globalAlpha *= a; g.strokeStyle = IVORY; g.lineWidth = Math.max(2, r * .06);
  g.beginPath(); g.arc(x + side * off, y - off * .35, r * 1.04, 0, Math.PI * 2); g.stroke();
  g.globalAlpha *= .45; g.lineWidth = Math.max(1.5, r * .035); g.beginPath(); g.arc(x + side * off * 1.9, y - off * .7, r * 1.08, 0, Math.PI * 2); g.stroke();
  g.restore();
}
function listenVignette(g, amt) { if (amt <= .01) return; g.save(); g.fillStyle = radGrad(g, E.W / 2, E.H * .48, E.H * .35, E.W * .75, ['rgba(10,4,12,0)', `rgba(10,4,12,${.42 * amt})`]); g.fillRect(0, 0, E.W, E.H); g.restore(); }
function thoughtNow(gt) { return LINES.find(l => l.thought && gt > l.start - .25 && gt < l.end + 1.1); }

// ---------- motif: thought threads ----------
function wordsUpTo(line, gt) { return WALL.filter(w => w.line === line.id && w.t0 <= gt + .02).map(w => w.w); }
function wrap(words, n = 22) { const out = []; let cur = ''; for (const w of words) { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out.slice(-3); }
export function thread(g, a, b, line, gt, o = {}) {
  const col = THREAD[line.tag] || '#fff', k = ease.out(prog(gt, line.start - .2, line.start + .6)), fade = 1 - prog(gt, line.end + .4, line.end + 1.1);
  if (k <= 0 || fade <= 0) return;
  const cx = (a[0] + b[0]) / 2, cy = Math.min(a[1], b[1]) - (o.arc ?? 200);
  const pt = s => [(1 - s) ** 2 * a[0] + 2 * (1 - s) * s * cx + s * s * b[0], (1 - s) ** 2 * a[1] + 2 * (1 - s) * s * cy + s * s * b[1]];
  g.save(); g.globalAlpha *= fade; g.globalCompositeOperation = 'lighter';
  const N = 48; for (let i = 0; i < N * k; i++) { const s0 = i / N, s1 = Math.min(k, (i + 1) / N), [x0, y0] = pt(s0), [x1, y1] = pt(s1), w = (o.w ?? 9) * (1 - .6 * s0) * (1 + .15 * Math.sin(gt * 6 + i * .5));
    seg(g, [[x0, y0 + Math.sin(gt * 3 + i * .4) * 3], [x1, y1 + Math.sin(gt * 3 + i * .4 + .4) * 3]], w, alpha(col, .55)); }
  const [hx, hy] = pt(k); glow(g, hx, hy, 46, col, .7); glow(g, a[0], a[1], 70, col, .25);
  g.restore();
  if (k >= 1 && !o.noRing) { g.save(); g.globalAlpha *= fade; FX.rings(g, b[0], b[1], gt - line.start, { count: 2, r0: 20, r1: o.ringR ?? 110, speed: 1.2, color: col, a: .6, w: 3 }); g.restore(); }
  if (o.noText) return;
  const ws = wordsUpTo(line, gt); if (!ws.length) return;
  const m = g.getTransform(), pxs = m.a, tx0 = o.tx ?? a[0], ty0 = o.ty ?? (a[1] - 70);
  const dp = m.transformPoint(new DOMPoint(tx0, ty0)), PX = E.PX || 1;
  const L = wrap(ws, o.wrap ?? 22), sz = o.size ?? V(50, 58), lh = sz * 1.18;
  let sx = dp.x / PX, sy = dp.y / PX - (L.length - 1) * lh;
  const maxW = Math.max(...L.map(l => l.length)) * sz * .5;
  sx = clamp(sx, maxW / 2 + 60, E.W - maxW / 2 - 60); sy = clamp(sy, V(130, 260), E.H * .62 - (L.length - 1) * lh);
  g.save(); g.setTransform(PX, 0, 0, PX, 0, 0);
  L.forEach((s, i) => text(g, s, sx, sy + i * lh, { size: sz, font: FONTS.ui, weight: 900, italic: true, color: shade(col, .55), glow: 24, glowColor: alpha(col, .9), alpha: fade, stroke: sz * .14, strokeColor: 'rgba(20,10,20,.7)' }));
  g.restore();
}
// ---------- overlays ----------
function clockBadge(g, str, t) { const a = ease.out(prog(t, .1, .5)); rr(g, V(60, 60), V(56, 90), 150, 52, 26); g.fillStyle = `rgba(18,12,22,${.55 * a})`; g.fill(); text(g, str, V(135, 135), V(83, 117), { size: 30, font: FONTS.ui, weight: 900, color: S().ui.gold, alpha: a }); }
function rulesBadge(g, n, t, hot) { UI.badge(g, { str: `RULES ${n}`, color: hot ? S().ui.accent : S().ui.gold, a: ease.out(prog(t, 0, .3)) }); }
function freezeTint(g) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.45)'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
function fgBlur(g, kind, t, side = -1, col) {
  blurLayer(g, 12, g => {
    if (kind === 'shoulder') { const x = side < 0 ? -40 : E.W + 40, y = E.H + 60; g.fillStyle = col || '#0d0a10'; g.beginPath(); g.ellipse(x, y, 520, 330, 0, 0, 7); g.fill(); circle(g, x + side * -60, E.H - 330, 210, S().ink); }
    else if (kind === 'cup') { cup(g, E.W - 260, E.H + 10, 5.5, { sleeve: col }); }
    else if (kind === 'plant') { for (let k = 0; k < 8; k++) circle(g, 60 + (k * 53) % 220, E.H - 80 - (k * 71) % 300, 120, k % 2 ? '#1f3a28' : '#183022'); }
    else if (kind === 'pole') { seg(g, [[E.W * .86, -100], [E.W * .86, E.H + 100]], 60, '#8a8090'); }
    else if (kind === 'monitor') { rr(g, -120, E.H - 420, 640, 460, 20); g.fillStyle = '#0c0c14'; g.fill(); }
  });
}

// ---------- builder: SCENE (wide / two-shot / OTS / medium) ----------
function scene(g, t, info) {
  const p = info, dur = info.dur, k = ease.inOut(clamp(t / dur)), gt = info.globalT, frozen = !!p.freeze;
  const c0 = p.cam?.[0] || [960, 560, .75], c1 = p.cam?.[1] || [c0[0] - 20, c0[1], c0[2] * 1.03];
  const cam = lerpCam(F(...c0), F(...c1), k); if (p.roll) cam.r = p.roll;
  const [thL, thAmt] = frozen ? [null, 0] : thoughtEnv(gt); let S0;
  const drawSet = g => { S0 = SETS[p.set](g, frozen ? (p.ft ?? 0) : t, cam, { ...(p.so || {}), frozen, counterAt1: p.set === 'cafe' }); };
  if (thAmt > .03) blurLayer(g, 7 * thAmt, drawSet); else drawSet(g);
  const { GY, CX, M } = S0, rim = { color: (S0.MI || M).rim, dir: p.rimDir || [0, -1], w: 4 }, figs = {};
  layer(g, cam, 1, g => {
    if (p.hub) { chair(g, CX + 210, GY, -1); chair(g, CX - 210, GY, 1); }
    if (p.chairs) for (const [x, f] of p.chairs) chair(g, x, GY, f);
    for (const w of p.who || []) {
      const wt = frozen && w.id !== p.hero ? (p.ft ?? 0) : t;
      let x = w.x ?? 0, ps;
      if (w.walk) { const [x0, x1, f0, f1] = w.walk, q = clamp((t / dur - f0) / (f1 - f0)); x = lerp(x0, x1, ease.inOut(q)); ps = q > 0 && q < 1 ? walkPose(t * Math.PI * 2 * (w.slow ? .65 : .9)) : poseSeq(w.pose, wt, dur, w.seed || 1); }
      else ps = poseSeq(w.pose, wt, dur, w.seed || 1);
      const y = (w.y ?? GY) + (seqVal(w.dy, t / dur) || 0), s = (w.s ?? SC), facing = seqVal(w.f, t / dur) ?? 1;
      const fig = { x, y, s, facing, outfit: CAST[w.id], pose: ps, rot: seqVal(w.rot, t / dur), expr: seqVal(w.expr, t / dur) || 'neutral', face: fixFace(seqVal(w.expr, t / dur)), look: seqVal(w.look, t / dur) || [facing * .3, 0],
        talk: frozen ? 0 : talkFor(w.id, gt), headF: seqVal(w.hf, t / dur), blink: frozen && w.id !== p.hero ? false : (t + (w.seed || 1) * .7) % (2.9 + (w.seed || 1) * .27) > 2.75, rim, prop: w.prop, dim: w.dim, shadow: !/sit/.test(JSON.stringify(w.pose || '')) };
      drawChar(g, w.id, fig, t);
      if (fig.talk > .05) FX.rings(g, x + facing * 60 * s / SC, y - 190 * s, t, { count: 2, r0: 14, r1: 60, color: '#fff1e6', a: .3 });
      const [hx, hy, hr] = headPos(fig); figs[w.id] = { hx, hy, hr, x, y, s, facing }; figs[TAGOF(w.id)] = figs[w.id];
    }
    if (p.hub) { const top = table(g, CX, GY); cup(g, CX - 40, top, 1.2, { sleeve: p.sleeve }); cup(g, CX + 60, top, 1.2, { sleeve: p.sleeve2 }); steam(g, CX - 40, top - 40, t, .3, frozen); steam(g, CX + 60, top - 40, t + .4, .3, frozen); if (p.napkin) napkinOnTable(g, CX + (p.napkinX ?? -70), top, p.napkin); }
    if (p.long) { const top = longTable(g, CX - 560, CX + 560, GY); for (const x of [CX - 380, CX - 140, CX + 160, CX + 420]) { rr(g, x - 50, top - 14, 100, 14, 4); g.fillStyle = '#d8d0c8'; g.fill(); } if (p.napkin) napkinOnTable(g, CX - 90, top, p.napkin); }
    if (p.set === 'cafe') cafeCounter(g, frozen ? 0 : t, GY, S0.M, { ...(p.so || {}), frozen });
    // thought echo on the thinker (if in frame)
    if (thL && figs[thL.tag]) { const a = figs[thL.tag]; echo(g, a.hx, a.hy, a.hr, thL, gt, -a.facing); }
  });
  if (frozen) { FX.drops(g, t, { count: 34, color: '#d8e4ff', rMax: 6, drift: 1.5 }); freezeTint(g); }
  FX.dust(g, frozen ? 0 : t, { count: 36, color: '#ffe2bd', a: .3 });
  if (p.streak) FX.lensStreak(g, E.W / 2, E.H * .32, E.W * 1.2, '#ffe0b0', .16);
  if (p.fg) fgBlur(g, p.fg, t, p.fgSide ?? -1, p.fgCol);
  listenVignette(g, thAmt);
  if (p.recall) recall(g, t, p);
  if (p.readout) UI.readout(g, { value: p.readout, x: E.W * .92, y: E.H * .19, align: 'right', a: ease.out(prog(t, .3, .7)) });
  overlays(g, t, p);
}
function recall(g, t, p) {
  const L = p.recall.map(id => LINES.find(l => l.id === id)), y0 = E.H * .15;
  { const a = ease.out(prog(t, .1, .5)); rr(g, E.W * .14, y0 - V(50, 60), E.W * .72, V(78, 96) * (L.length - 1) + V(100, 120), 24); g.fillStyle = `rgba(16,8,18,${.55 * a})`; g.fill(); }
  L.forEach((l, i) => { const a = ease.out(prog(t, .2 + i * .35, .7 + i * .35)) * (p.dimOthers && i > 0 ? .35 : 1); if (a <= 0) return;
    text(g, '“' + l.text + '”', E.W / 2, y0 + i * V(78, 96), { size: V(44, 50), font: FONTS.ui, weight: 800, italic: true, color: i === 0 && p.hiFirst ? '#fff6e6' : IVORY, alpha: a, stroke: 6, strokeColor: 'rgba(16,8,18,.7)' }); });
}
function overlays(g, t, p) {
  cap(g, p.globalT);
  if (p.clock) clockBadge(g, p.clock, t);
  if (p.rules) { const [a, b] = Array.isArray(p.rules) ? p.rules : [p.rules, p.rules]; const n = Math.round(lerp(a, b, ease.inOut(prog(t, .2, p.dur * .8)))); rulesBadge(g, n, t, n >= 20); }
  if (p.flashIn) { const q = 1 - prog(t, 0, .35); if (q > 0) { g.fillStyle = `rgba(235,242,255,${.6 * q})`; g.fillRect(0, 0, E.W, E.H); } }
}
function napkinOnTable(g, x, top, n) { g.save(); g.translate(x, top - 3); g.fillStyle = '#f4efe6'; poly(g, [[-46, 0], [46, 0], [40, -10], [-40, -10]], '#f4efe6'); g.restore(); }

// ---------- builder: FACE (giant close-up) ----------
function face(g, t, info) {
  const p = info, dur = info.dur, gt = info.globalT, k = t / dur, frozen = !!p.freeze;
  const bc = p.bgCam || [960, 520, 1.5];
  blurLayer(g, 14, g => SETS[p.set](g, frozen ? 0 : t, F(bc[0] - 40 * k * (p.side ?? 1), bc[1], bc[2]), { ...(p.so || {}), frozen }));
  veil(g, '#120a10', .38);
  const side = p.side ?? 1, cx = E.W / 2 + (p.dx ?? 0) + side * V(-60, 0), cy = E.H * V(.43, .45), r = V(215, 250) * (1 + (p.push ?? .05) * k);   // framed like the channel image: head + hoodie collar
  const M = mood(p.set === 'office' ? 'interiorCool' : p.set === 'train' ? 'dusk' : 'interiorWarm');
  const talk = frozen ? 0 : talkFor(p.who, gt), tilt = (p.tilt || 0) + Math.sin(t * 1.3) * .012;
  const ex = seqVal(p.expr, k) || 'neutral', lk = seqVal(p.look, k) || [side * .25, 0];
  const bob = (p.bob ?? 1) * Math.sin(t * 2.1) * 4 + (p.nod ? Math.max(0, Math.sin(Math.min(1, t / .9) * Math.PI * 2)) * 22 : 0) + (p.swallow != null ? 10 * Math.sin(Math.PI * clamp((t / dur - p.swallow) / .12)) : 0);
  bust(g, cx, cy + bob, r, p.who, { expr: ex, talk, blink: (t % 3.3) > 3.15, look: lk, rimColor: M.rim, rimSide: side, tilt, t });
  if (talk > .05) FX.rings(g, cx + side * r * 1.05, cy, t, { count: 2, r0: 30, r1: 140, color: '#fff1e6', a: .3 });
  if (p.tear) { const q = prog(t, p.tear, p.tear + 1.2); if (q > 0) circle(g, cx + side * r * .28, cy - r * .02 + q * r * .45, 9, 'rgba(200,225,255,.85)'); }
  const [thL, thAmt] = frozen ? [null, 0] : thoughtEnv(gt);
  if (thL && TAGOF(p.who) === thL.tag) echo(g, cx, cy + bob, r, thL, gt, -side);
  listenVignette(g, thAmt * .8);
  if (p.ring) FX.rings(g, cx + side * r, cy, t, { count: 2, r0: 30, r1: 160, speed: .9, color: IVORY, a: .28, w: 2 });
  if (p.bubbles) for (let i = 0; i < 3; i++) { const q = prog(t, .3 + i * .45, .55 + i * .45), q2 = prog(t, .8 + i * .45, 1 + i * .45); if (q > 0 && q2 < 1) { const bx = cx + side * (r * 1.1 + i * 110), by = cy - r * 1.1 - i * 30; UI.bubble(g, bx, by, { w: 110 * ease.outBack(q), h: 64 * ease.outBack(q), str: String(i + 1) }); } }
  if (frozen) { FX.drops(g, t, { count: 30, color: '#d8e4ff', rMax: 6, drift: 1.2 }); freezeTint(g); }
  FX.dust(g, t, { count: 24, color: '#ffe2bd', a: .25 });
  overlays(g, t, p);
}

// ---------- builder: INSERT (hands and props, big and simple) ----------
const HAND = (g, x, y, a, len = 220, w = 46, col = S().ink) => { const c = Math.cos(a), s = Math.sin(a); seg(g, [[x - c * len * 3, y - s * len * 3], [x, y]], w * 1.25, col); seg(g, [[x, y], [x + c * len * .35, y + s * len * .35]], w, col); seg(g, [[x + c * len * .1, y + s * len * .1], [x + c * len * .32 - s * 30, y + s * len * .32 + c * 30]], w * .7, col); };
function sleeveCol(id) { return CAST[id]?.color; }
function insert(g, t, info) {
  const p = info, dur = info.dur, k = t / dur, gt = info.globalT;
  const bc = p.bgCam || [960, 700, 2.2];
  blurLayer(g, 16, g => SETS[p.set](g, t, F(bc[0] + 30 * k, bc[1], bc[2]), p.so || {})); veil(g, '#140c12', .32);
  const cx = E.W / 2, cy = E.H / 2, ink = S().ink;
  const tableTop = (yy = E.H * .72) => { g.fillStyle = '#2a1c20'; g.fillRect(-100, yy, E.W + 200, E.H); g.fillStyle = 'rgba(255,215,170,.25)'; g.fillRect(-100, yy, E.W + 200, 6); };
  switch (p.ins) {
    case 'ear': { bust(g, cx + 120, cy + 10, 300, 'YOU', { expr: t < dur * .45 ? 'nervous' : 'worried', look: [-.3, 0], rimColor: '#ffb45a', rimSide: 1, t }); const q = ease.outBack(prog(t, .2, .6)); HAND(g, cx - 300 + 20 * q, cy + 70, -.25, 160, 60); FX.rings(g, cx - 330, cy + 60, t, { count: 3, r0: 40, r1: 300, color: '#e8743b', a: .55, w: 4 }); text(g, 'NO MUTE', cx + 520, cy - 300, { size: 40, font: FONTS.ui, weight: 900, color: S().ui.accent, alpha: ease.out(prog(t, .5, .9)) }); break; }
    case 'napkin': {
      tableTop(E.H * .55); const n = p.n ?? 4, lines = ['talk less', 'be funnier', 'be more confident', "don't make everything a joke", 'laugh first', 'stop the story early', 'order cheap', 'agree', 'smile less', 'smile more', 'ask, then listen', "don't interrupt", 'shorter emails', 'no puns', 'nod', 'check the time', 'match the mood', 'compliment shoes', 'never sigh', 'say sorry', 'less hands', 'quieter laugh', 'be easy'];
      g.save(); g.translate(cx - 40, cy + 30); g.rotate(-.06 + (p.flip ? Math.sin(prog(t, .2, 1) * Math.PI) * .1 : 0)); g.fillStyle = '#f4efe6'; rr(g, -330, -300, 660, 600, 10); g.fill();
      for (let y = -250; y < 290; y += 46) { g.fillStyle = 'rgba(120,110,100,.12)'; g.fillRect(-300, y, 600, 2); }
      const shown = p.writeTo ? lerp(p.n0 ?? 0, p.writeTo, ease.inOut(prog(t, .1, dur * .85))) : n; const sz = n > 8 || p.tight ? 22 : 36, step = n > 8 || p.tight ? 24 : 54;
      lines.slice(0, Math.ceil(shown)).forEach((s, i) => { const col = i < 12 ? 0 : 1, yy = -240 + (i % 12) * step + (sz < 30 ? 0 : 0); text(g, `${i + 1}. ${s}`, -300 + col * 310, yy, { size: sz, font: FONTS.ui, weight: 800, italic: true, color: '#2a3a7a', align: 'left', alpha: clamp((shown - i) * 2) }); });
      g.restore();
      if (p.pen) { const i = Math.max(0, Math.min(Math.ceil(shown), 23) - 1), yy = cy + 30 - 240 + (i % 12) * step, px = cx - 40 - 300 + (i >= 12 ? 310 : 0) + Math.min(280, (lines[i] || '').length * sz * .55) + Math.sin(t * 14) * 6;
        seg(g, [[px, yy + 6], [px + 70, yy + 50]], 10, '#e8c070'); circle(g, px, yy + 6, 4, '#2a3a7a'); HAND(g, px + 70, yy + 52, -2.45, 90, 34); }
      if (p.slide) { const q = ease.inOut(prog(t, .1, .9)); g.save(); g.translate(-280 * (1 - q), 0); g.restore(); }
      if (p.blur) veil(g, '#140c12', .25 * prog(t, dur * .5, dur));
      break; }
    case 'menu': { tableTop(); g.save(); g.translate(cx, cy - 10); g.rotate(-.04); rr(g, -330, -260, 660, 480, 12); g.fillStyle = '#f2ebe0'; g.fill();
      [['STEAK & FRIES', '16'], ['TRUFFLE PASTA', '14'], ['SALMON BOWL', '12'], ['SOUP OF THE DAY', '4']].forEach(([a, b], i) => { text(g, a, -280, -170 + i * 100, { size: 36, font: FONTS.ui, weight: 900, color: '#3a2a2a', align: 'left' }); text(g, b, 280, -170 + i * 100, { size: 36, font: FONTS.ui, weight: 900, color: '#3a2a2a', align: 'right' }); });
      const q = ease.inOut(prog(t, .2, dur * .8)); g.restore(); HAND(g, cx + 250, cy - 170 + q * 300 - 10, -2.6, 220, 40); break; }
    case 'cups': { tableTop(); cup(g, cx - 160, E.H * .72, 6, {}); cup(g, cx + 200, E.H * .72, 6, { sleeve: YELLOW }); steam(g, cx - 160, E.H * .72 - 190, t, .4); steam(g, cx + 200, E.H * .72 - 190, t + .3, .4); break; }
    case 'sleeve': { tableTop(); cup(g, cx, E.H * .74, 7, { sleeve: YELLOW, rot: Math.sin(t * 2) * .03 }); HAND(g, cx + 240, E.H * .6 + Math.sin(t * 4) * 12, -2.8, 200, 44); HAND(g, cx - 250, E.H * .62 - Math.sin(t * 4) * 12, -.3, 200, 44); break; }
    case 'phone': { const q = ease.outBack(prog(t, 0, .5)); g.save(); g.translate(cx, cy + 60 + (1 - q) * 300); rr(g, -190, -330, 380, 660, 40); g.fillStyle = '#0d0c12'; g.fill(); rr(g, -170, -300, 340, 600, 24); g.fillStyle = '#1a2236'; g.fill();
      text(g, 'Mira', 0, -260, { size: 32, font: FONTS.ui, weight: 900, color: '#e8eef8' }); const msg = 'Coffee? Rough day.', n = Math.floor(msg.length * prog(t, .5, 1.6));
      if (n > 0) { rr(g, -150, -200, 300, 80, 24); g.fillStyle = '#3a3f52'; g.fill(); text(g, msg.slice(0, n), -130, -160, { size: 28, font: FONTS.ui, weight: 800, color: '#ffffff', align: 'left' }); } else UI.bubble(g, -80, -160, { w: 110, h: 60, color: '#3a3f52' });
      g.restore(); HAND(g, cx + 230, cy + 260, -2.5, 200, 54); break; }
    case 'reach': { tableTop(E.H * .62); cup(g, cx + 360, E.H * .62, 5, { sleeve: YELLOW }); const q = key(t / dur, [[0, 0], [.45, 1], [.65, 1], [1, .1]], ease.inOut); HAND(g, cx - 500 + 420 * q, E.H * .58, -.05, 240, 50); HAND(g, cx + 420, E.H * .56, Math.PI + .05, 240, 50, '#141018'); break; }
    case 'plate': { tableTop(); g.save(); const q = ease.inOut(prog(t, .3, 1.4)); g.translate(cx - 80 + q * 360, E.H * .72); g.beginPath(); g.ellipse(0, -14, 230, 50, 0, 0, 7); g.fillStyle = '#efe8de'; g.fill(); poly(g, [[-60, -40], [60, -40], [40, -110], [-50, -100]], '#c88a5a'); g.restore(); HAND(g, cx - 260 + q * 360, E.H * .66, -.1, 200, 44); break; }
    case 'slide': { tableTop(E.H * .6); const q = ease.inOut(prog(t, .2, dur * .8)); g.save(); g.translate(cx - 420 + q * 420, E.H * .6 - 30); g.rotate(-.1 + q * .1); g.scale(1.6, 1.6); rr(g, -210, -40, 420, 70, 6); g.fillStyle = '#f4efe6'; g.fill(); for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(42,58,122,.6)'; g.fillRect(-180, -28 + i * 14, 300 - i * 40, 4); } g.restore(); HAND(g, cx - 420 + q * 420 - 200, E.H * .6 - 40, -.2, 200, 44); break; }
  }
  overlays(g, t, p);
}

// ---------- builder: BLUEPRINT (the rule) ----------
function blueprint(g, t, info) {
  UI.blueprint(g, {}); const c = UI.bpStroke(), cx = E.W / 2, gy = E.H * .74, gt = info.globalT;
  UI.lineFigure(g, { x: cx - 200, y: gy, s: 2.3, pose: POSES.stand, color: '#e8f0ff' });
  UI.lineFigure(g, { x: cx + 240, y: gy, s: 2.3, pose: POSES.talk, color: '#e8f0ff', facing: -1 });
  const q = ease.out(prog(t, .3, 1.2)); g.save(); g.setLineDash([14, 12]); g.strokeStyle = alpha(S().ui.gold, .9); g.lineWidth = 3; g.beginPath(); g.ellipse(cx - 200, gy - 240, 560 * q, 400 * q, 0, 0, 7); g.stroke(); g.restore();
  UI.dimension(g, t, { x1: cx - 200, y1: gy + 50, x2: cx + 240, y2: gy + 50, str: 'TALKING DISTANCE', start: .6 });
  const lt = prog(t, 1.8, 3.2); if (lt > 0) { const x = cx + 700 - lt * 520; text(g, '“…about you”', cx + 560, gy - 520, { size: 56, font: FONTS.ui, weight: 900, color: '#ffd47e', alpha: ease.out(prog(t, 1.2, 1.6)) }); seg(g, [[cx + 240, gy - 490], [cx - 160, gy - 470]], 4, alpha('#ffd47e', .8 * prog(t, 1.4, 1.9))); }
  const out = prog(t, 3.0, 4.3); if (out > 0) { const x = cx + 900 - out * 420; text(g, 'other thoughts', x + 200, gy - 760, { size: 44, font: FONTS.ui, weight: 800, color: alpha(c, .7) }); if (out > .8) text(g, '✕', cx + 520, gy - 690, { size: 70, color: S().ui.accent }); }
  UI.callout(g, t, { at: [cx - 200, gy - 480], to: [cx - 420, gy - 760], str: 'ONLY THOUGHTS ABOUT YOU', size: 40, start: .9 });
}
// ---------- builder: TOP-DOWN (the table from above) ----------
function topdown(g, t, info) {
  const cx = E.W / 2, cy = E.H / 2, z = 1 + .05 * t / info.dur; g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  g.fillStyle = '#20161a'; g.fillRect(-100, -100, E.W + 200, E.H + 200); FX.floorLines(g, -100, E.H + 100, 'rgba(0,0,0,.3)', .02);
  glow(g, cx, cy, 520, '#ffd28a', .25); circle(g, cx, cy, 250, '#3a2a2e'); ring(g, cx, cy, 250, 8, '#4e3a3c');
  for (const [x, col] of [[cx - 360, '#4a4550'], [cx + 360, '#3a3040']]) { g.fillStyle = col; g.beginPath(); g.ellipse(x, cy, 110, 150, 0, 0, 7); g.fill(); circle(g, x, cy, 80, S().ink); }
  circle(g, cx + 380, cy - 40, 30, '#141018'); // ponytail
  cup(g, cx - 120, cy + 30, 2.5, {}); cup(g, cx + 130, cy - 20, 2.5, { sleeve: YELLOW });
  g.restore();
  UI.dimension(g, t, { x1: cx - 280, y1: cy + 300, x2: cx + 280, y2: cy + 300, str: '< 1 m', start: .3 });
}
// ---------- builder: TITLE / END ----------
function title(g, t, info) {
  const M = mood('dusk'), cam = { z: 1.06 - .06 * ease.inOut(t / info.dur), y: -20 * t };
  SETS.cafe(g, t, F(960, 520, .62), { variant: 'am' }); veil(g, '#160c14', .5);
  UI.titleCard(g, t, { lines: ['WHAT IF YOU HEARD EVERY', 'THOUGHT ABOUT YOU?'], dur: info.dur, y: E.H * .42 });
}
function end(g, t, info) {
  UI.endScreen(g, t, { question: 'Would YOU want to hear what they think?', cast: [] });
  const ids = ['BARISTA', 'COLL', 'MIRA', 'YOU', 'BOSS', 'TRAIN'], GY = E.H * .93, rim = { color: '#ffb45a', dir: [0, -1], w: 4 };
  ids.forEach((id, i) => { const a = ease.out(prog(t, .3 + i * .12, .8 + i * .12)); if (a <= 0) return; const x = E.W / 2 + (i - 2.5) * 240, q = id === 'YOU' ? 1.2 : 1;
    drawChar(g, id, { x, y: GY + (1 - a) * 60, s: 1.6 * q, facing: i < 3 ? 1 : -1, pose: breathe(id === 'YOU' ? POSES.wave : POSES.stand, t, 1, i + 1), expr: id === 'YOU' ? 'happy' : 'smile', rim, alpha: a, blink: (t + i) % 3.3 > 3.15 }, t); });
}
function charsheet(g, t, info) {
  backdrop(g, ['#2a1c30', '#3b2a4a', '#5a3a50']); const rim = { color: '#ffb45a', dir: [1, -.3], w: 4 };
  const ids = ['YOU', 'MIRA', 'MIRA_EVE', 'BARISTA', 'BOSS', 'COLL', 'TRAIN'], names = ['YOU (hero)', 'MIRA (day)', 'MIRA (evening)', 'BARISTA', 'MANAGER', 'COLLEAGUE', 'TRAIN WOMAN'];
  const ex = info.ex || 'neutral';
  ids.forEach((id, i) => { const x = 150 + i * 270;
    bust(g, x, 230, 78, id, { expr: ex, rimSide: 1, rimColor: '#ffb45a', t });
    drawChar(g, id, { x: x - 55, y: 900, s: 1.45, facing: 1, pose: POSES.stand, expr: ex, rim }, t);
    drawChar(g, id, { x: x + 60, y: 900, s: 1.45, facing: -1, pose: POSES.stand, expr: ex, rim: { ...rim, dir: [-1, -.3] } }, t);
    text(g, names[i], x, 1010, { size: 30, font: FONTS.ui, weight: 900, color: '#f4ecdf' }); });
  text(g, 'expression: ' + ex, E.W / 2, 1060, { size: 24, font: FONTS.ui, weight: 800, color: '#ffd47e' });
}
function faces(g, t, info) {
  backdrop(g, ['#2a1c30', '#3b2a4a']); const L = ['neutral', 'smile', 'happy', 'flat', 'pressed', 'surprised', 'shocked', 'thinking', 'confused', 'worried', 'nervous', 'sad', 'angry', 'sleepy'];
  L.forEach((e, i) => { const x = 140 + (i % 7) * 275, y = 260 + Math.floor(i / 7) * 470; bust(g, x, y, 92, info.who || 'YOU', { expr: e, rimSide: 1, rimColor: '#ffb45a', t });
    text(g, e.toUpperCase(), x, y + 250, { size: 28, font: FONTS.ui, weight: 900, color: '#ffd47e' }); });
}
const B = { charsheet, faces, scene, face, insert, blueprint, topdown, title, end };
for (const s of E.shots || []) {
  if (s.params?.k === '3d') continue;
  registerShot(s.id, { draw(g, t, info) { const f = B[info.k]; if (!f) { text(g, 'missing builder ' + info.k, E.W / 2, E.H / 2, { color: '#f44' }); return; } f(g, t, info); } });
}
