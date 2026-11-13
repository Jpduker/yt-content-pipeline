// growkaz-ifverse v3 shot builders (WI03+): blended parametric faces, head badges (numbers / teardrops), ghost text bubbles, new inserts, grade + depth of field.
// WI02 shot builders. Every shot in story/shots.json carries params.k (builder) + data; this file draws them.
// Automatic from the voice timeline: lip-sync for spoken lines, thought threads (style v2 motif) for "-T" lines.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, text, talkAmount, FONTS, radGrad, linGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { SETS, SC, GYf, F, lerpCam, table, longTable, chair, cup, steam, cafeCounter, cardboard, drawHorse as drawHorseI } from '../sets/world.js';
import { CAST, THREAD, GREEN, YELLOW } from '../cast.js';
import { cap } from './_cap.js';
import { drawChar, bust, mixEx, exP } from '../chars.js';

const base = new URL('../../timeline/', import.meta.url);
const LINES = await (await fetch(new URL('lines.json', base))).json();
const WALL = await (await fetch(new URL('words_all.json', base))).json();
// GrowKaz kit v1.1.0 bug: brows 'worried' render as angry and 'angry' as worried. Swap them here (kit stays untouched).
const BROW = { sad: 'angry', worried: 'angry', nervous: 'angry', scared: 'angry', cry: 'angry', angry: 'worried', determined: 'worried' };
const fixFace = ex => BROW[ex] ? { brows: BROW[ex] } : undefined;
const TAGOF = id => ({ YOU_TEE: 'YOU', MIRA_EVE: 'MIRA', MIRA_HOME: 'MIRA' }[id] || id);
let VERT = null; const GQ = [];
// v3.1: the kit's blurLayer draws at identity (ignores the 9:16 wrapper's transform), so vertical frames got the blurred set squashed into the top half.
let _vb = null;
function vblur(g, amount, fn) { if (!VERT || amount <= .3) return blurLayer(g, amount, fn);
  const cv = g.canvas; if (!_vb || _vb.width !== cv.width || _vb.height !== cv.height) { _vb = document.createElement('canvas'); _vb.width = cv.width; _vb.height = cv.height; }
  const x = _vb.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, _vb.width, _vb.height); x.setTransform(g.getTransform()); fn(x);
  const sc = g.getTransform().a; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${Math.max(.5, amount * sc * .9)}px)`; g.drawImage(_vb, 0, 0); g.filter = 'none'; g.restore(); }

const MOTIF = (E.shots || []).find(s => s.params?.motif)?.params.motif || 'echo';      // 'echo' (WI02 thoughts) | 'ghost' (WI03 unsent texts)
// expression sequence -> blended parameters (0.22 s cross-fade, so faces MOVE between emotions instead of popping)
function exAt(seq, t, dur) { if (!Array.isArray(seq) || !Array.isArray(seq[0])) return exP(seq || 'neutral');
  let i = 0; for (let k = 0; k < seq.length; k++) if (t / dur >= seq[k][0]) i = k; if (i === 0) return exP(seq[0][1]);
  return mixEx(seq[i - 1][1], seq[i][1], ease.inOut(clamp((t - seq[i][0] * dur) / .22))); }
function seqNum(seq, k) { if (!Array.isArray(seq)) return seq; let v = seq[0][1]; for (const [f, x] of seq) if (k >= f) v = x; return v; }
// ---------- head badges: the impossible rule, drawn the same way every time ----------
function badge(g, x, y, r, b, t, k) {   // b = { k: 'num' | 'tear', v: value | [[frac, value], ...], hot: threshold }
  if (!b) return; const v = seqNum(b.v, k), a = ease.outBack(clamp(prog(t, b.at ?? .05, (b.at ?? .05) + .35))); if (a <= 0 || v == null) return;
  const bob = Math.sin(t * 2.2 + x * .01) * r * .05, by = y - r * 1.75 + bob, str = String(v);
  g.save(); g.translate(x, by); g.scale(a, a);
  if (str === '∞') g.rotate(Math.sin(t * 3.1) * .12);
  if (b.k === 'mem') {   // WI07: a memory picture over the listener's head; "sorry" wipes it (eraser shimmer) and leaves a grey smudge
    const wa = b.wipeAt ?? 1e9, fa = b.fadeAt ?? 1e9, w = prog(t, wa, wa + .6), fd = prog(t, fa, fa + 1.6), W2 = r * 1.9, H2 = r * 1.3;
    if (w < 1 && !b.smudgeOnly) { g.save(); g.globalAlpha *= 1 - (w > .55 ? (w - .55) / .45 : 0); rr(g, -W2 / 2, -H2 / 2, W2, H2, r * .2); g.fillStyle = 'rgba(244,236,223,.95)'; g.fill(); g.strokeStyle = '#ffd47e'; g.lineWidth = r * .08; g.stroke(); memIcon(g, b.icon, r); g.restore();
      if (w > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const sx = -W2 / 2 + W2 * w; g.fillStyle = linGrad(g, sx - r, 0, sx + r * .3, 0, ['rgba(255,255,255,0)', 'rgba(255,255,255,.95)']); g.fillRect(sx - r, -H2 * .7, r * 1.3, H2 * 1.4); for (let i = 0; i < 6; i++) circle(g, sx + Math.sin(i * 2.1 + t * 9) * r * .3, -H2 / 2 + i * H2 / 5, r * .07, '#fff'); g.restore(); } }
    if ((w > .4 || b.smudgeOnly) && fd < 1) { const q = b.smudgeOnly ? 1 : ease.out(prog(t, wa + .25, wa + .9)); g.save(); g.globalAlpha *= q * (1 - fd) * .85; for (const [dx, dy, rr0] of [[-.5, .05, .5], [0, -.12, .62], [.5, .05, .5], [.2, .2, .45], [-.25, .22, .42]]) { g.fillStyle = 'rgba(150,150,160,.75)'; g.beginPath(); g.arc(dx * r * (1 + fd * .6), dy * r - fd * r * .5, rr0 * r * (1 + fd * .5), 0, 7); g.fill(); } g.restore(); }
    g.restore(); return; }
  if (b.k === 'num' || b.k === 'words') { const hot = (b.hot ?? (b.k === 'words' ? 10 : null)) != null && Number(v) <= (b.hot ?? 10), col = b.k === 'words' ? (hot ? '#ff6a4a' : '#f4f0e8') : hot ? '#ff6a4a' : '#ffd47e', fs = r * (str.length > 3 ? .62 : .8), w = Math.max(r * 1.25, fs * .62 * str.length + r * .5);
    glow(g, 0, 0, r * 1.5, col, hot ? .35 : .18); rr(g, -w / 2, -r * .52, w, r * 1.04, r * .3); g.fillStyle = 'rgba(18,12,22,.82)'; g.fill(); g.strokeStyle = col; g.lineWidth = Math.max(2, r * .07); g.stroke();
    text(g, str, 0, r * .04, { size: fs, font: FONTS.ui, weight: 900, color: col }); poly(g, [[-r * .14, r * .5], [r * .14, r * .5], [0, r * .74]], col); }
  else { const col = '#6ec2ff', dr = r * .42; glow(g, 0, 0, r * 1.3, col, .28);
    g.fillStyle = col; g.beginPath(); g.moveTo(0, -dr * 1.5); g.quadraticCurveTo(dr * 1.25, dr * .35, 0, dr); g.quadraticCurveTo(-dr * 1.25, dr * .35, 0, -dr * 1.5); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-dr * .3, dr * .1, dr * .16, dr * .3, .5, 0, 7); g.fill();
    if (Number(v) > 1) { const fs = r * .62; rr(g, dr * .7, -fs * .62, fs * .62 * str.length + fs * .5, fs * 1.2, fs * .35); g.fillStyle = 'rgba(18,12,22,.85)'; g.fill(); text(g, str, dr * .7 + (fs * .62 * str.length + fs * .5) / 2, 0, { size: fs, font: FONTS.ui, weight: 900, color: '#bfe4ff' }); } }
  g.restore();
}
function memIcon(g, icon, r) { const s = r / 40; g.save(); g.scale(s, s); g.lineWidth = 5; g.strokeStyle = '#2a2228'; g.fillStyle = '#2a2228';
  if (icon === 'controller') { rr(g, -26, -12, 52, 26, 12); g.fill(); seg(g, [[-6, -14], [6, 14]], 6, '#d8504a'); seg(g, [[6, -14], [-6, 14]], 6, '#d8504a'); }
  else if (icon === 'clock') { g.beginPath(); g.arc(0, 0, 18, 0, 7); g.stroke(); seg(g, [[0, 0], [0, -12]], 4, '#2a2228'); seg(g, [[0, 0], [10, 4]], 4, '#2a2228'); }
  else if (icon === 'wallet') { rr(g, -22, -12, 44, 26, 5); g.fill(); text(g, '£?', 0, 2, { size: 16, font: 'Nunito', weight: 900, color: '#ffd47e' }); }
  else if (icon === 'scooter') { g.beginPath(); g.arc(-16, 10, 7, 0, 7); g.arc(16, 10, 7, 0, 7); g.fill(); seg(g, [[-16, 10], [16, 10]], 5, '#2a2228'); seg(g, [[14, 10], [10, -16]], 5, '#2a2228'); seg(g, [[-24, 14], [24, 4]], 5, '#d8504a'); }
  else if (icon === 'words') { text(g, '“!!”', 0, 0, { size: 26, font: 'Nunito', weight: 900, color: '#d8504a' }); }
  else { circle(g, 0, 0, 10, '#d8504a'); }
  g.restore(); }
// ---------- ghost bubble: an unsent text. Typed as it is spoken, flickering, then deleted. ----------
function ghostLine(gt) { return MOTIF === 'ghost' ? LINES.find(l => l.thought && gt > l.start - .3 && gt < l.end + 1.25) : null; }
function ghostText(l, gt) { const W = WALL.filter(w => w.line === l.id); let str = ''; for (const w of W) { if (gt >= w.t1) str += w.w + ' '; else if (gt >= w.t0) { str += w.w.slice(0, Math.ceil(w.w.length * (gt - w.t0) / Math.max(.05, w.t1 - w.t0))); break; } else break; }
  str = str.trim(); const del = prog(gt, l.end + .55, l.end + 1.05); if (del > 0) str = str.slice(0, Math.floor(str.length * (1 - del))); return [str, del]; }
function ghostBubble(g, x, y, l, gt, o = {}) {   // screen-space bubble; tail points to (x, y)
  if (VERT) { GQ.push(o.scr ? [x, y, l, gt, o] : [(x - VERT.left) * VERT.k, y * VERT.k, l, gt, o]); return; }
  const [str, del] = ghostText(l, gt), a = Math.min(ease.out(prog(gt, l.start - .3, l.start - .05)), 1 - prog(gt, l.end + 1.05, l.end + 1.25)); if (a <= 0) return;
  const sz = o.size || V(54, 60), full = l.text, wFull = Math.min(E.W * .6, measureT(g, full, sz) + sz * 1.6), lines = wrapPx(g, str || ' ', sz, wFull - sz * 1.6), nL = Math.max(lines.length, Math.ceil((measureT(g, full, sz)) / (wFull - sz * 1.6))), h = sz * 1.25 * nL + sz * .9;
  const bx = clamp(x - wFull / 2 + (o.dx || 0), 40, E.W - wFull - 40), by = clamp(y - h - (o.up ?? 46), V(70, 150), E.H * .7), fl = .86 + .14 * Math.sin(gt * 23) * Math.sin(gt * 7.3);
  g.save(); g.globalAlpha *= a * fl;
  rr(g, bx, by, wFull, h, sz * .55); g.fillStyle = 'rgba(70,76,96,.86)'; g.fill(); g.setLineDash([12, 9]); g.strokeStyle = 'rgba(235,240,252,.95)'; g.lineWidth = 4; g.stroke(); g.setLineDash([]);
  if (!o.noTail) poly(g, [[clamp(x, bx + 30, bx + wFull - 30) - 16, by + h - 1], [clamp(x, bx + 30, bx + wFull - 30) + 16, by + h - 1], [clamp(x, bx + 30, bx + wFull - 30), by + h + 22]], 'rgba(70,76,96,.86)');
  lines.forEach((ln, i) => text(g, ln, bx + sz * .8, by + sz * .45 + sz * .62 + i * sz * 1.25, { size: sz, font: 'Nunito', weight: 800, color: '#eef1f8', align: 'left' }));
  if (Math.sin(gt * 9) > 0 || del > 0) { const lw = measureT(g, lines[lines.length - 1] || '', sz); g.fillStyle = '#eef1f8'; g.fillRect(bx + sz * .8 + lw + 6, by + sz * .45 + (lines.length - 1) * sz * 1.25 + sz * .18, 4, sz * .9); }
  text(g, del > 0 ? 'deleting…' : 'not sent', bx + wFull - sz * .5, by + h + sz * .5, { size: sz * .46, font: 'Nunito', weight: 800, italic: true, color: 'rgba(225,230,245,.8)', align: 'right' });
  g.restore();
}
function measureT(g, str, sz) { g.save(); g.font = `800 ${sz}px Nunito`; const w = g.measureText(str).width; g.restore(); return w; }
function wrapPx(g, str, sz, maxW) { const out = []; let cur = ''; for (const w of str.split(' ')) { const nx = (cur + ' ' + w).trim(); if (measureT(g, nx, sz) > maxW && cur) { out.push(cur); cur = w; } else cur = nx; } out.push(cur); return out; }
function toScreen(g, x, y) { const m = g.getTransform(), p = m.transformPoint(new DOMPoint(x, y)), PX = E.PX || 1; return [p.x / PX, p.y / PX]; }
// ---------- grade: vignette + soft key bloom, on every shot (depth and a finished look) ----------
function grade(g, p) { g.save(); g.fillStyle = radGrad(g, E.W / 2, E.H * .46, E.H * .42, E.W * .78, ['rgba(8,4,10,0)', 'rgba(8,4,10,.34)']); g.fillRect(0, 0, E.W, E.H);
  g.globalCompositeOperation = 'soft-light'; g.fillStyle = radGrad(g, E.W * (p.keyX ?? .7), E.H * .2, 0, E.W * .7, ['rgba(255,214,170,.28)', 'rgba(255,214,170,0)']); g.fillRect(0, 0, E.W, E.H); g.restore(); }

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
  phoneEar: { ...POSES.stand, eF: [28, -162], hF: [14, -204] }, standPhone: { ...POSES.phone },
  carry: { ...POSES.stand, head: [5, -206], eF: [28, -138], hF: [56, -134], eB: [24, -136], hB: [52, -130] }, hug: { ...POSES.stand, head: [15, -204], sh: [8, -172], eF: [42, -162], hF: [76, -174], eB: [38, -150], hB: [70, -160] },
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
function thoughtEnv(gt) { if (MOTIF === 'ghost') return [null, 0]; const l = LINES.find(l => l.thought && gt > l.start - .35 && gt < l.end + .5); if (!l) return [null, 0];
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
  vblur(g, 12, g => {
    if (kind === 'shoulder') { const x = side < 0 ? -40 : E.W + 40, y = E.H + 60; g.fillStyle = col || '#0d0a10'; g.beginPath(); g.ellipse(x, y, 520, 330, 0, 0, 7); g.fill(); circle(g, x + side * -60, E.H - 330, 210, S().ink); }
    else if (kind === 'cup') { cup(g, E.W - 260, E.H + 10, 5.5, { sleeve: col }); }
    else if (kind === 'plant') { for (let k = 0; k < 8; k++) circle(g, 60 + (k * 53) % 220, E.H - 80 - (k * 71) % 300, 120, k % 2 ? '#1f3a28' : '#183022'); }
    else if (kind === 'pole') { seg(g, [[E.W * .86, -100], [E.W * .86, E.H + 100]], 60, '#8a8090'); }
    else if (kind === 'audience') { for (let k = 0; k < 14; k++) { const x = -60 + k * 150 + (k % 2) * 40, y = E.H + 40 - (k % 3) * 24; g.fillStyle = '#0d0a10'; g.beginPath(); g.ellipse(x, y + 120, 110, 140, 0, 0, 7); g.fill(); circle(g, x, y - 60, 70, '#0d0a10'); } }
    else if (kind === 'monitor') { rr(g, -120, E.H - 420, 640, 460, 20); g.fillStyle = '#0c0c14'; g.fill(); }
  });
}


// ---------- v3.1 floaters: loose objects in world space (zero gravity, drops) ----------
function floater(g, f, t, GY, p) {
  const da = p.dropAt, q = da != null ? ease.in(clamp((t - da) / .45)) : 0, lift = p.liftAt != null ? ease.out(clamp((t - p.liftAt) / .8)) : 1;
  const ry = f.y ?? -400, y0 = GY + (f.rest ?? 0), yf = lerp(y0, GY + ry + Math.sin(t * 1.3 + (f.x || 0) * .01) * 14, lift), y = lerp(yf, y0, q), rot = (f.r ?? 0) + (q < 1 ? lift * t * (f.spin ?? 0) : 0);
  g.save(); g.translate(f.x, y); g.rotate(q >= 1 ? 0 : rot); const k = f.k;
  if (k === 'paper') { rr(g, -40, -54, 80, 108, 4); g.fillStyle = '#f4efe6'; g.fill(); for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(42,58,122,.5)'; g.fillRect(-28, -38 + i * 18, 56 - i * 8, 4); } }
  else if (k === 'mug') { rr(g, -26, -60, 52, 60, 8); g.fillStyle = f.c || '#e8e2d6'; g.fill(); g.strokeStyle = f.c || '#e8e2d6'; g.lineWidth = 9; g.beginPath(); g.arc(30, -32, 16, -1.2, 1.2); g.stroke(); }
  else if (k === 'cup') { poly(g, [[-20, -70], [20, -70], [15, 0], [-15, 0]], '#f2ece4'); g.fillStyle = '#3a6ea5'; g.fillRect(-19, -46, 38, 18); rr(g, -24, -80, 48, 12, 4); g.fillStyle = '#2a2228'; g.fill(); }
  else if (k === 'plant') { poly(g, [[-36, 0], [36, 0], [46, -70], [-46, -70]], '#b8683a'); for (let i = 0; i < 5; i++) circle(g, -40 + i * 20, -100 - (i % 2) * 24, 30, '#4a7a3a'); }
  else if (k === 'laptop') { rr(g, -80, -60, 160, 100, 6); g.fillStyle = '#2a2a36'; g.fill(); rr(g, -70, -52, 140, 84, 4); g.fillStyle = f.dead ? '#111' : '#9fc0ff'; g.fill(); rr(g, -96, 38, 192, 16, 4); g.fillStyle = '#3a3a46'; g.fill(); }
  else if (k === 'tray') { rr(g, -90, -8, 180, 14, 4); g.fillStyle = '#8a6a4a'; g.fill(); for (let i = 0; i < 4; i++) { g.save(); g.translate(-66 + i * 44, -8); poly(g, [[-14, -50], [14, -50], [10, 0], [-10, 0]], '#f2ece4'); g.fillStyle = '#3a6ea5'; g.fillRect(-13, -34, 26, 12); g.restore(); } }
  else if (k === 'bin') { poly(g, [[-70, 0], [70, 0], [86, -170], [-86, -170]], '#5a6070'); for (let i = -2; i <= 2; i++) seg(g, [[i * 28, -10], [i * 34, -160]], 4, '#4a5060'); if (f.laptop) { g.save(); g.translate(10, -170); g.rotate(-.5); rr(g, -70, -90, 140, 90, 6); g.fillStyle = '#2a2a36'; g.fill(); rr(g, -60, -82, 120, 74, 4); g.fillStyle = '#111'; g.fill(); g.restore(); } }
  else if (k === 'cabinet') { rr(g, -70, -260, 140, 260, 6); g.fillStyle = '#7a8090'; g.fill(); for (let i = 0; i < 3; i++) { rr(g, -58, -248 + i * 84, 116, 72, 4); g.strokeStyle = '#5a6070'; g.lineWidth = 4; g.stroke(); seg(g, [[-16, -214 + i * 84], [16, -214 + i * 84]], 6, '#3a3f4a'); } }
  else if (k === 'splash') { for (let i = 0; i < 9; i++) { g.fillStyle = '#7a4a2a'; g.beginPath(); g.ellipse(-60 + (i * 37) % 120, -20 + (i * 23) % 60, 16, 26, i, 0, 7); g.fill(); } }
  g.restore();
}

// ---------- v3.1 promise strings (O4): glowing gold string between two wrists; thin over time; snaps; a new one is tied ----------
function pstring(g, A, B, st, t, dur) {
  const k = t / dur, w = seqNum(st.w ?? 1, k), snap = st.snapAt != null ? prog(t, st.snapAt, st.snapAt + .9) : 0, tie = st.tieAt != null ? ease.out(prog(t, st.tieAt, st.tieAt + 1)) : 1;
  const hand = f => [f.x + f.facing * 40 * f.s / 1.6, f.y - (f.y - f.hy) * .5]; const a = A.x != null && A.facing != null ? hand(A) : A, b = B.facing != null ? hand(B) : B;
  const col = st.col || '#ffd47e', sag = st.sag ?? 26, wl = 9 * w;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  if (snap <= 0) { const ex = lerp(a[0], b[0], tie), ey = lerp(a[1], b[1], tie), mx = (a[0] + ex) / 2, my = (a[1] + ey) / 2 + sag * tie + Math.sin(t * 2) * 6;
    for (const [lw, al] of [[wl * 3.2, .18], [wl * 1.6, .35], [wl * .7, 1]]) { g.strokeStyle = alpha(col, al); g.lineWidth = Math.max(1, lw); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(mx, my, ex, ey); g.stroke(); }
    if (w < .45) for (let i = 0; i < 5; i++) { const q = (i + .5) / 5, x = (1 - q) ** 2 * a[0] + 2 * (1 - q) * q * mx + q * q * ex, y = (1 - q) ** 2 * a[1] + 2 * (1 - q) * q * my + q * q * ey; circle(g, x + Math.sin(t * 13 + i) * 5, y, 3, alpha(col, .7)); } }
  else { const d = snap * 160; for (const [p0, sgn] of [[a, 1], [b, -1]]) { const mx2 = p0[0] + sgn * (b[0] - a[0]) * .25, my2 = p0[1] + 40 + d; g.strokeStyle = alpha(col, .9 * (1 - snap * .6)); g.lineWidth = Math.max(1, wl * .7); g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(mx2, my2, mx2 + sgn * 30, my2 + 60); g.stroke(); }
    if (snap < .5) glow(g, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag, 90, '#fff3c8', .8 * (1 - snap * 2)); }
  g.restore(); }
// ---------- builder: SCENE (wide / two-shot / OTS / medium) ----------
function scene(g, t, info) {
  const p = info, dur = info.dur, k = ease.inOut(clamp(t / dur)), gt = info.globalT, frozen = !!p.freeze;
  const c0 = p.cam?.[0] || [960, 560, .75], c1 = p.cam?.[1] || [c0[0] - 20, c0[1], c0[2] * 1.03];
  const cam = p.cam?.[2] ? (k < .5 ? lerpCam(F(...c0), F(...c1), ease.inOut(k * 2)) : lerpCam(F(...c1), F(...p.cam[2]), ease.inOut(k * 2 - 1))) : lerpCam(F(...c0), F(...c1), k); if (p.roll) cam.r = p.roll;
  if (!frozen) { cam.x += Math.sin(t * .7 + (p.seed || 0)) * 3 / cam.z; cam.y += Math.sin(t * .9 + 1) * 2 / cam.z; }
  const dof = p.dof ?? (cam.z >= 1.45 ? Math.min(5, (cam.z - 1.2) * 4) : 0);
  const [thL, thAmt] = frozen ? [null, 0] : thoughtEnv(gt); let S0;
  const drawSet = g => { S0 = SETS[p.set](g, frozen ? (p.ft ?? 0) : t, cam, { ...(p.so || {}), frozen, counterAt1: p.set === 'cafe' }); };
  if (thAmt > .03 || dof > .5) vblur(g, Math.max(7 * thAmt, dof), drawSet); else drawSet(g);
  const { GY, CX, M } = S0, rim = { color: (S0.MI || M).rim, dir: p.rimDir || [0, -1], w: 4 }, figs = {};
  layer(g, cam, 1, g => {
    if (p.hub) { chair(g, CX + 210, GY, -1); chair(g, CX - 210, GY, 1); }
    if (p.floaters) for (const f of p.floaters.filter(f => f.back)) floater(g, f, t, GY, p);
    if (p.chairs) for (const [x, f] of p.chairs) chair(g, x, GY, f);
    for (const w of p.who || []) {
      const wt = frozen && w.id !== p.hero ? (p.ft ?? 0) : t;
      let x = w.x ?? 0, ps;
      if (w.walk) { const [x0, x1, f0, f1] = w.walk, q = clamp((t / dur - f0) / (f1 - f0)); x = lerp(x0, x1, ease.inOut(q)); ps = q > 0 && q < 1 ? walkPose(t * Math.PI * 2 * (w.slow ? .65 : .9)) : poseSeq(w.pose, wt, dur, w.seed || 1); }
      else ps = poseSeq(w.pose, wt, dur, w.seed || 1);
      const y = (w.y ?? GY) + (seqVal(w.dy, t / dur) || 0), s = (w.s ?? SC), facing = seqVal(w.f, t / dur) ?? 1;
      const fig = { x, y, s, facing, outfit: CAST[w.id], pose: ps, rot: seqVal(w.rot, t / dur), expr: seqVal(w.expr, t / dur) || 'neutral', ex: exAt(w.expr, t, dur), tear: w.tear != null ? prog(t, w.tear * dur, w.tear * dur + 1.4) : undefined, look: seqVal(w.look, t / dur) || [facing * .3, 0],
        talk: frozen ? 0 : talkFor(w.id, gt), headF: seqVal(w.hf, t / dur), blink: frozen && w.id !== p.hero ? false : (t + (w.seed || 1) * .7) % (2.9 + (w.seed || 1) * .27) > 2.75, rim, prop: w.prop, dim: w.dim, shadow: !/sit/.test(JSON.stringify(w.pose || '')) };
      drawChar(g, w.id, fig, t);
      if (fig.talk > .05) FX.rings(g, x + facing * 60 * s / SC, y - 190 * s, t, { count: 2, r0: 14, r1: 60, color: '#fff1e6', a: .3 });
      if (w.box) cardboard(g, x + facing * 62 * s, y - 104 * s, 1.25 * s / 1.6, { label: w.box === true ? '' : w.box });
      const [hx, hy, hr] = headPos(fig); figs[w.id] = { hx, hy, hr, x, y, s, facing, badge: w.badge, scr: toScreen(g, hx, hy - hr * 1.5) }; figs[TAGOF(w.id)] = figs[w.id];
    }
    if (p.hub) { const top = table(g, CX, GY); cup(g, CX - 40, top, 1.2, { sleeve: p.sleeve }); cup(g, CX + 60, top, 1.2, { sleeve: p.sleeve2 }); steam(g, CX - 40, top - 40, t, .3, frozen); steam(g, CX + 60, top - 40, t + .4, .3, frozen); if (p.napkin) napkinOnTable(g, CX + (p.napkinX ?? -70), top, p.napkin); }
    if (p.long) { const top = longTable(g, CX - 560, CX + 560, GY); for (const x of [CX - 380, CX - 140, CX + 160, CX + 420]) { rr(g, x - 50, top - 14, 100, 14, 4); g.fillStyle = '#d8d0c8'; g.fill(); } if (p.napkin) napkinOnTable(g, CX - 90, top, p.napkin); }
    if (p.set === 'cafe') cafeCounter(g, frozen ? 0 : t, GY, S0.M, { ...(p.so || {}), frozen });
    if (p.floaters) for (const f of p.floaters.filter(f => !f.back)) floater(g, f, t, GY, p);
    // thought echo on the thinker (if in frame)
    if (thL && figs[thL.tag]) { const a = figs[thL.tag]; echo(g, a.hx, a.hy, a.hr, thL, gt, -a.facing); }
    for (const st of p.strings || []) { const A = Array.isArray(st.a) ? st.a : figs[st.a], B = Array.isArray(st.b) ? st.b : figs[st.b]; if (A && B) pstring(g, A, B, st, t, dur); }
    for (const w of p.who || []) if (w.badge) { const a = figs[w.id]; badge(g, a.hx, a.hy, a.hr, w.badge, t, t / dur); }
    for (const b of p.tags || []) badge(g, b.x, b.y, b.r || 38, b, t, t / dur);
    const gl = p.ghost === false ? null : ghostLine(gt); if (gl) { const a = figs[gl.tag]; p._ghost = a ? [...toScreen(g, a.hx + a.facing * a.hr * 1.2, a.hy - a.hr * 1.3), gl] : [E.W / 2, E.H * .36, gl, true]; } else p._ghost = null;
  });
  if (p.twoGhost) for (const id of ['YOU', 'MIRA']) { const a = figs[id]; if (!a) continue; const fl = .6 + .25 * Math.sin(gt * 21 + a.x), q = ease.out(prog(t, id === 'YOU' ? 1.0 : .3, id === 'YOU' ? 1.5 : .8)); if (q <= 0) continue;
    g.save(); g.globalAlpha *= fl * q; const bw = 150 * cam.z, bh = 62 * cam.z, bx = (a.sx ?? 0), [sx, sy] = [a.scr[0], a.scr[1]]; rr(g, sx - bw / 2, sy - bh, bw, bh, bh * .4); g.fillStyle = 'rgba(126,132,150,.5)'; g.fill(); g.setLineDash([9, 7]); g.strokeStyle = 'rgba(225,230,245,.8)'; g.lineWidth = 3; g.stroke(); g.setLineDash([]); text(g, '· · ·', sx, sy - bh / 2, { size: 30 * cam.z, color: '#eef1f8', weight: 900 }); g.restore(); }
  if (p._ghost) ghostBubble(g, p._ghost[0], p._ghost[1], p._ghost[2], gt, { noTail: p._ghost[3], up: p._ghost[3] ? 0 : 40, scr: !p._ghost[3] });
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
  grade(g, p); if (p.label) { const a = Math.min(ease.out(prog(t, .15, .5)), 1 - prog(t, p.dur - .4, p.dur)); text(g, p.label, V(96, 80), E.H - V(150, 260), { size: V(34, 40), font: FONTS.ui, weight: 900, color: '#f4ecdf', align: 'left', alpha: a, stroke: 6, strokeColor: 'rgba(10,6,12,.6)', spacing: 3 }); }
  if (!VERT) { cap(g, p.globalT); vOverlay(g, t, p); }
  if (p.clock && !VERT) clockBadge(g, p.clock, t);
  if (p.rules) { const [a, b] = Array.isArray(p.rules) ? p.rules : [p.rules, p.rules]; const n = Math.round(lerp(a, b, ease.inOut(prog(t, .2, p.dur * .8)))); rulesBadge(g, n, t, n >= 20); }
  if (p.flashIn) { const q = 1 - prog(t, 0, .35); if (q > 0) { g.fillStyle = `rgba(235,242,255,${.6 * q})`; g.fillRect(0, 0, E.W, E.H); } }
}

// ---------- v3.1 screen overlays (premise text, question over the final action, freeze ring); drawn in final screen space, 16:9 or 9:16 ----------
function plate(g, str, x, y, sz, col, a, maxW) { const L = wrapPx(g, str, sz, maxW), lh = sz * 1.12, w = Math.max(...L.map(l => measureT(g, l, sz))) + sz * 1.1, h = lh * L.length + sz * .55;
  g.save(); g.globalAlpha *= a; rr(g, x - w / 2, y - h / 2, w, h, sz * .3); g.fillStyle = 'rgba(14,8,16,.78)'; g.fill(); g.strokeStyle = alpha(col, .9); g.lineWidth = 4; g.stroke();
  L.forEach((l, i) => text(g, l, x, y - h / 2 + sz * .28 + lh * (i + .5), { size: sz, font: FONTS.ui, weight: 900, color: col })); g.restore(); }
function vOverlay(g, t, p) {
  const vert = E.H > E.W, W = E.W, H = E.H, dur = p.dur;
  if (p.hookText) { const [a0, a1] = p.hookT || [0, 2.8], a = Math.min(ease.out(prog(t, a0, a0 + .15)), 1 - prog(t, a1 - .3, a1)), q = ease.outBack(prog(t, a0, a0 + .3));
    if (a > 0) { g.save(); g.translate(W / 2, vert ? 300 : 120); g.scale(q, q); plate(g, p.hookText, 0, 0, vert ? 74 : 56, '#ffd47e', a, vert ? W * .84 : W * .7); g.restore(); } }
  if (p.ask) { const at = p.ask.at ?? Math.max(0, dur - 2.2), a = ease.out(prog(t, at, at + .35));
    if (a > 0) plate(g, p.ask.text, W / 2, vert ? 300 : 130, vert ? 62 : 50, '#f4ecdf', a, vert ? W * .86 : W * .7); }
  if (p.fring) { const [f0, f1] = p.fring, q = prog(t, f0, f1); if (t >= f0 - .05 && t <= f1 + .25) { const cx = vert ? W - 130 : W - 150, cy = vert ? 580 : 150, r = vert ? 70 : 62, n = Math.max(0, Math.ceil(5 * (1 - q) - 1e-6));
      g.save(); circle(g, cx, cy, r + 8, 'rgba(14,8,16,.7)'); g.strokeStyle = 'rgba(160,190,255,.3)'; g.lineWidth = 12; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.strokeStyle = '#a8c8ff'; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - q)); g.stroke();
      text(g, String(n), cx, cy + 2, { size: r * 1.05, font: FONTS.ui, weight: 900, color: '#e8f0ff' }); g.restore(); } }
  if (p.stamp) { const a = ease.out(prog(t, .05, .35)); rr(g, vert ? 40 : 60, vert ? 150 : 56, vert ? 300 : 260, 64, 30); g.fillStyle = `rgba(18,12,22,${.6 * a})`; g.fill(); text(g, p.stamp, (vert ? 40 : 60) + (vert ? 150 : 130), (vert ? 150 : 56) + 33, { size: 34, font: FONTS.ui, weight: 900, color: S().ui.gold, alpha: a }); }
}
function napkinOnTable(g, x, top, n) { g.save(); g.translate(x, top - 3); g.fillStyle = '#f4efe6'; poly(g, [[-46, 0], [46, 0], [40, -10], [-40, -10]], '#f4efe6'); g.restore(); }

// ---------- builder: FACE (giant close-up) ----------
function face(g, t, info) {
  const p = info, dur = info.dur, gt = info.globalT, k = t / dur, frozen = !!p.freeze;
  const bc = p.bgCam || [960, 520, 1.5];
  vblur(g, 14, g => SETS[p.set](g, frozen ? 0 : t, F(bc[0] - 40 * k * (p.side ?? 1), bc[1], bc[2]), { ...(p.so || {}), frozen }));
  veil(g, '#120a10', .38);
  const side = p.side ?? 1, cx = E.W / 2 + (p.dx ?? 0) + side * V(-60, 0), cy = E.H * V(p.low ? .5 : .43, .45), r = V(p.low ? 195 : 215, 250) * (1 + (p.push ?? .05) * k);   // framed like the channel image: head + hoodie collar
  const M = mood(p.set === 'office' || p.set === 'lift' ? 'interiorCool' : ['train', 'platform'].includes(p.set) || p.so?.variant === 'dusk' ? 'dusk' : p.so?.variant === 'am' && p.set === 'street' ? 'golden' : 'interiorWarm');
  const talk = frozen ? 0 : talkFor(p.who, gt), tilt = (p.tilt || 0) + Math.sin(t * 1.3) * .012;
  const ex = seqVal(p.expr, k) || 'neutral', exB = exAt(p.expr, t, dur), lk = seqVal(p.look, k) || [side * .25, 0];
  const bob = (p.bob ?? 1) * Math.sin(t * 2.1) * 4 + (p.nod ? Math.max(0, Math.sin(Math.min(1, t / .9) * Math.PI * 2)) * 22 : 0) + (p.swallow != null ? 10 * Math.sin(Math.PI * clamp((t / dur - p.swallow) / .12)) : 0);
  if (p.reflect) { g.save(); g.globalAlpha = .62; g.translate(E.W, 0); g.scale(-1, 1); }
  bust(g, p.reflect ? E.W - cx : cx, cy + bob, r, p.who, { expr: ex, ex: exB, talk, blink: (t % 3.3) > 3.15, look: lk, rimColor: M.rim, rimSide: side, tilt, t, tear: p.tear != null ? prog(t, p.tear * dur, p.tear * dur + 1.6) : undefined });
  if (p.reflect) { g.restore(); veil(g, '#2a4a6a', .28); g.save(); g.globalAlpha = .5; for (const x of [E.W * .18, E.W * .82]) seg(g, [[x, 0], [x, E.H]], 26, '#1a1418'); text(g, 'KETTLE & CRUMB', E.W / 2, E.H * .2, { size: 70, weight: 700, color: 'rgba(242,230,208,.5)', spacing: 8 }); g.restore(); }
  if (p.badge) badge(g, cx, cy + bob - r * .5, r * .5, p.badge, t, k);
  { const gl = p.ghost === false ? null : ghostLine(gt); if (gl) ghostBubble(g, cx - side * r * (TAGOF(p.who) === gl.tag ? 2.1 : 2.4), cy - r * .15, gl, gt, { noTail: TAGOF(p.who) !== gl.tag, up: 0, size: V(52, 58) }); }
  if (talk > .05) FX.rings(g, cx + side * r * 1.05, cy, t, { count: 2, r0: 30, r1: 140, color: '#fff1e6', a: .3 });
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
  vblur(g, 16, g => SETS[p.set](g, t, F(bc[0] + 30 * k, bc[1], bc[2]), p.so || {})); veil(g, '#140c12', .32);
  const cx = E.W / 2, cy = E.H / 2, ink = S().ink;
  const tableTop = (yy = E.H * .72) => { g.fillStyle = '#2a1c20'; g.fillRect(-100, yy, E.W + 200, E.H); g.fillStyle = 'rgba(255,215,170,.25)'; g.fillRect(-100, yy, E.W + 200, 6); };
  const NAME = { BOSS: 'Boss', MUM: 'Mum', MIRA: 'Mira', PIZZA: 'Slice Palace', JO: 'Jo · group chat', SAM: 'Sam · group chat', COLL: 'Dana (work)', YOU: 'You', LIFT: 'Unknown' };
  const phone = (px, py, sc, draw, o = {}) => { g.save(); g.translate(px, py); g.rotate(o.rot ?? -.03); g.scale(sc, sc); rr(g, -200, -350, 400, 700, 44); g.fillStyle = '#0d0c12'; g.fill(); rr(g, -180, -325, 360, 650, 28); g.fillStyle = o.bg || '#161c2c'; g.fill();
    g.save(); g.beginPath(); rr(g, -180, -325, 360, 650, 28); g.clip(); draw(g); g.restore(); g.restore(); if (!o.noHand) HAND(g, px + 250 * sc, py + 330 * sc, -2.5, 210 * sc, 56 * sc); };
  const hdr = (g, name, sub) => { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(-180, -325, 360, 78); text(g, name, 0, -288, { size: 28, font: FONTS.ui, weight: 900, color: '#e8eef8' }); if (sub) text(g, sub, 0, -262, { size: 15, font: 'Nunito', weight: 800, color: '#8a94a8' }); };
  const gbub = (g, y, str, a = 1, from) => { const w = Math.min(300, Math.max(90, measureT(g, str, 22) + 34)); g.save(); g.globalAlpha *= a; rr(g, -160, y, w, 50, 18); g.fillStyle = 'rgba(126,132,150,.45)'; g.fill(); g.setLineDash([7, 6]); g.strokeStyle = 'rgba(225,230,245,.7)'; g.lineWidth = 2; g.stroke(); g.setLineDash([]);
    text(g, str, -144, y + 26, { size: 22, font: 'Nunito', weight: 800, color: '#eef1f8', align: 'left' }); if (from) text(g, from, -156, y - 12, { size: 14, font: 'Nunito', weight: 800, color: '#8a94a8', align: 'left' }); g.restore(); };
  switch (p.ins) {
    // ----- v3.1 inserts (narrow: they also read in the 9:16 crop, ~600 px wide around the centre) -----
    case 'comments': {   // an online argument; p.count = [from, to] word counter spinning above the phone
      const n = p.count ? Math.round(lerp(p.count[0], p.count[1], ease.inOut(prog(t, .15, dur * .9)))) : null;
      phone(cx, cy + 150, 1.18, g => { hdr(g, 'Hot Takes', '1,204 comments'); const off = (t * 150) % 84, names = ['@dev', '@bunlord', '@dev', '@sausage_truth', '@dev', '@m4yo'], said = ['IT IS A SANDWICH.', 'bread + filling ≠ sandwich', 'Explain a sub then. Go on.', 'a taco is not a sandwich', 'Hinged bread. Case closed.', 'ok fine you win'];
        for (let k = 0; k < 7; k++) { const i = (k + Math.floor(t * 150 / 84)) % 6, y = -230 + k * 84 - off, me = names[i] === '@dev'; rr(g, -160, y, 320, 66, 14); g.fillStyle = me ? '#3a2a1c' : '#2a3040'; g.fill(); text(g, names[i], -146, y + 18, { size: 15, font: 'Nunito', weight: 900, color: me ? '#e8743b' : '#8a94a8', align: 'left' }); text(g, said[i], -146, y + 44, { size: 19, font: 'Nunito', weight: 800, color: '#eef1f8', align: 'left' }); } }, { noHand: true });
      HAND(g, cx + 160 + Math.sin(t * 18) * 8, cy + 520, -2.2, 200, 56); HAND(g, cx - 170 - Math.sin(t * 17) * 8, cy + 530, -.95, 200, 56);
      if (n != null) badge(g, cx, cy - 210, 74, { k: 'words', v: n, at: 0 }, t, 0);
      break; }
    case 'contacts': {   // p.rows [[name, days]...], p.delAt (s): the top row breaks into pixels and the list slides up; p.clk [[t, 'HH:MM:SS'], ...]
      const da = p.delAt, q = da != null ? prog(t, da, da + .9) : 0, rows = p.rows || [], clk = seqNum(p.clk || [[0, '']], t);
      phone(cx, cy + (p.low ? 150 : 40), 1.3, g => { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(-180, -325, 360, 120); text(g, clk, 0, -262, { size: 46, font: FONTS.ui, weight: 900, color: '#e8eef8' }); text(g, 'Contacts', -150, -222, { size: 18, font: 'Nunito', weight: 900, color: '#8a94a8', align: 'left' });
        rows.forEach(([name, days], i) => { const y0 = -180 + i * 92 - (q > 0 ? 92 * ease.inOut(prog(t, da + .5, da + 1.1)) : 0), top = (q > .99 ? i === 1 : i === 0), dying = i === 0 && q > 0;
          if (dying && q >= 1) return; const pulse = top && !dying ? .5 + .5 * Math.sin(t * 7) : 0;
          g.save(); g.globalAlpha *= dying ? 1 - q : 1; rr(g, -165, y0, 330, 78, 14); g.fillStyle = pulse ? `rgba(255,90,70,${.18 + .3 * pulse})` : 'rgba(255,255,255,.05)'; g.fill(); if (pulse) { g.strokeStyle = `rgba(255,106,74,${.6 + .4 * pulse})`; g.lineWidth = 3; g.stroke(); }
          circle(g, -128, y0 + 39, 26, ['#5a7ac0', '#c8945a', '#8a5ad6', '#3fb950', '#e8743b'][i % 5]); text(g, name[0], -128, y0 + 40, { size: 24, font: FONTS.ui, weight: 900, color: '#fff' });
          text(g, name, -88, y0 + 30, { size: 24, font: FONTS.ui, weight: 900, color: '#eef1f8', align: 'left' }); text(g, days, -88, y0 + 56, { size: 16, font: 'Nunito', weight: 800, color: pulse ? '#ffb0a0' : '#8a94a8', align: 'left' }); g.restore();
          if (dying) for (let k = 0; k < 46; k++) { const px = -150 + (k * 37) % 300, py = y0 + 10 + (k * 23) % 60 + q * q * (220 + (k % 7) * 60), sz2 = 8 + (k % 3) * 4; g.fillStyle = `rgba(${k % 2 ? '238,241,248' : '255,140,110'},${1 - q})`; g.fillRect(px + Math.sin(k) * q * 40, py, sz2, sz2); } }); }, { noHand: p.noHand });
      break; }
    case 'callscreen': {   // ringing -> name breaks to "Unknown number" at p.delAt -> answered at p.answerAt (timer)
      const clk = seqNum(p.clk || [[0, '']], t), dq = p.delAt != null ? prog(t, p.delAt, p.delAt + .8) : 0, ans = p.answerAt != null && t >= p.answerAt;
      phone(cx, cy + 40, 1.3, g => { g.fillStyle = linGrad(g, 0, -325, 0, 325, ['#24304a', '#121826']); g.fillRect(-180, -325, 360, 650); text(g, clk, 0, -280, { size: 22, font: FONTS.ui, weight: 900, color: '#c8d0e0' });
        const nm = p.name || 'Dad'; g.save(); g.globalAlpha *= 1 - dq; circle(g, 0, -120, 70, '#c8945a'); text(g, nm[0], 0, -118, { size: 64, font: FONTS.ui, weight: 900, color: '#fff' }); text(g, nm, 0, -10, { size: 40, font: FONTS.ui, weight: 900, color: '#fff' }); g.restore();
        if (dq > 0) { for (let k = 0; k < 40; k++) { const px = -90 + (k * 29) % 180, py = -40 + (k * 17) % 50 + dq * dq * (200 + (k % 5) * 50); g.fillStyle = `rgba(238,241,248,${1 - dq})`; g.fillRect(px, py, 9, 9); }
          g.save(); g.globalAlpha *= dq; circle(g, 0, -120, 70, '#5a6070'); text(g, '?', 0, -116, { size: 64, font: FONTS.ui, weight: 900, color: '#fff' }); text(g, 'Unknown number', 0, -10, { size: 34, font: FONTS.ui, weight: 900, color: '#fff' }); g.restore(); }
        if (ans) { const sec = Math.floor(t - p.answerAt); text(g, `0:${String(sec).padStart(2, '0')}`, 0, 40, { size: 26, font: 'Nunito', weight: 800, color: '#9fe0b0' }); }
        else { text(g, p.incoming ? 'incoming call' : 'calling…', 0, 40, { size: 22, font: 'Nunito', weight: 800, color: '#c8d0e0', alpha: .6 + .4 * Math.sin(t * 5) }); FX.rings(g, 0, -120, t, { count: 3, r0: 70, r1: 170, color: '#9fc0ff', a: .35, w: 3 }); }
        circle(g, 0, 230, 40, ans ? '#d8504a' : '#3fb950'); }, { noHand: p.noHand });
      break; }
    case 'drawing': {   // fridge door close-up: the horse drawing turns the right way up at p.flipAt (Mum's hand)
      g.fillStyle = '#e8e6e2'; g.fillRect(cx - 520, -50, 1040, E.H + 100); seg(g, [[cx + 360, cy - 260], [cx + 360, cy + 40]], 22, '#a8a6a2');
      const fq = p.flipAt != null ? ease.inOut(prog(t, p.flipAt, p.flipAt + .9)) : (p.up ? 1 : 0);
      g.save(); g.translate(cx - 40, cy + 20); g.rotate(Math.PI * (1 - fq)); rr(g, -270, -200, 540, 400, 8); g.fillStyle = '#fbf6ec'; g.fill(); g.restore();
      g.save(); g.translate(cx - 40, cy + 20); g.rotate(Math.PI * (1 - fq)); drawHorseI(g, 0, 20, 1.45); g.restore();
      circle(g, cx - 40, cy - 190, 18, '#d8504a');
      if (p.flipAt != null && t > p.flipAt - .5 && t < p.flipAt + 1.6) HAND(g, cx + 280 - 60 * fq, cy + 180 - 160 * fq, -2.4 + fq * 1.2, 190, 50, p.handCol || '#d8504a');
      break; }
    case 'hand': {   // digits written on a palm as they are read out
      g.fillStyle = '#1a1420'; g.fillRect(-100, -100, E.W + 200, E.H + 200); glow(g, cx, cy, 600, '#ffd59a', .18);
      g.save(); g.translate(cx, cy + 80); g.fillStyle = S().ink; g.beginPath(); g.ellipse(0, 0, 230, 280, 0, 0, 7); g.fill(); for (let k = 0; k < 4; k++) { rr(g, -170 + k * 92, -520 + Math.abs(k - 1.5) * 40, 74, 300, 37); g.fill(); } g.save(); g.rotate(-.9); rr(g, -330, -40, 200, 74, 37); g.fill(); g.restore();
      const str = p.digits || '07700 900 412', n = Math.floor(str.length * prog(t, p.from ?? .2, p.to ?? dur * .9)); text(g, str.slice(0, n), -170, 40, { size: 58, font: 'Nunito', weight: 800, italic: true, color: '#e8eef8', align: 'left' });
      const lw2 = measureT(g, str.slice(0, n), 58); g.restore(); seg(g, [[cx - 170 + lw2, cy + 130], [cx - 60 + lw2, cy + 300]], 16, '#3a6ea5'); circle(g, cx - 170 + lw2, cy + 130, 6, '#e8eef8'); HAND(g, cx - 50 + lw2, cy + 310, -2.2, 130, 44, YELLOW);
      break; }
    case 'reply': {   // p.drafts: each draft typed then deleted, the last one sent (p.to = chat name)
      const D = p.drafts || ['ok'], seg1 = dur / D.length, i = Math.min(D.length - 1, Math.floor(t / seg1)), lt = t - i * seg1, last = i === D.length - 1 && !p.noSend, full = D[i];
      const typed = full.slice(0, Math.ceil(full.length * prog(lt, .05, seg1 * .45))), del = last ? 0 : prog(lt, seg1 * .62, seg1 * .95), str = typed.slice(0, Math.floor(typed.length * (1 - del))), sent = last && lt > seg1 * .6;
      phone(cx, cy + 40, 1.3, g => { hdr(g, p.to || 'Mira', 'online'); if (p.inMsg) { rr(g, -160, -200, 250, 56, 18); g.fillStyle = '#3a3f52'; g.fill(); text(g, p.inMsg, -146, -172, { size: 22, font: 'Nunito', weight: 800, color: '#fff', align: 'left' }); }
        if (sent) { const w = Math.max(70, measureT(g, full, 26) + 40); rr(g, 160 - w, -110, w, 60, 20); g.fillStyle = '#3b82f6'; g.fill(); text(g, full, 160 - w / 2, -80, { size: 26, font: 'Nunito', weight: 800, color: '#fff' }); text(g, 'Delivered', 150, -32, { size: 15, font: 'Nunito', weight: 800, color: '#8a94a8', align: 'right' }); }
        else { rr(g, -165, 190, 262, 64, 22); g.fillStyle = '#232b40'; g.fill(); text(g, str + (Math.sin(gt * 9) > 0 ? '|' : ''), -150, 222, { size: 21, font: 'Nunito', weight: 800, color: '#fff', align: 'left' }); } }, { noHand: false });
      break; }
    case 'photo': {   // a photo message: a very small room
      phone(cx, cy + 40, 1.3, g => { hdr(g, p.sfrom || 'Mira', 'now'); rr(g, -150, -210, 280, 320, 18); g.fillStyle = '#3a3f52'; g.fill(); rr(g, -138, -198, 256, 250, 10); g.fillStyle = '#c8b090'; g.fill(); g.fillStyle = '#e8dcc8'; g.fillRect(-138, -198, 256, 150);
        rr(g, -120, -90, 140, 50, 6); g.fillStyle = '#5a7ac0'; g.fill(); rr(g, 40, -150, 60, 108, 4); g.fillStyle = '#7a5a3a'; g.fill(); rr(g, -60, -180, 70, 50, 4); g.fillStyle = '#9fe0ff'; g.fill(); circle(g, 90, -170, 10, '#f2c21a');
        text(g, p.msg || 'new flat!!', -130, 78, { size: 22, font: 'Nunito', weight: 800, color: '#fff', align: 'left' }); }, { bg: '#141a2a' });
      break; }
    case 'chips': { tableTop(E.H * .78); g.save(); g.translate(cx, E.H * .78 - 40); poly(g, [[-120, -260], [120, -260], [40, 30], [-40, 30]], '#f2ece4'); seg(g, [[-120, -260], [120, -260]], 10, '#d8504a');
      for (let k = 0; k < 14; k++) { const x = -100 + k * 15, h = 90 + (k * 37) % 70; g.save(); g.translate(x, -250); g.rotate((k % 5 - 2) * .1); rr(g, -9, -h, 18, h, 4); g.fillStyle = k % 3 ? '#f2c260' : '#e8a840'; g.fill(); g.restore(); } g.restore();
      steam(g, cx, E.H * .78 - 380, t, .6); HAND(g, cx - 260, E.H * .7, -.3, 200, 52); if (p.second) HAND(g, cx + 300 - 80 * ease.inOut(prog(t, .4, 1.2)), E.H * .5, Math.PI + .3, 200, 48, YELLOW); break; }
    case 'tie': { const q = ease.outBack(prog(t, .1, .5)); g.fillStyle = GREEN; g.fillRect(cx - 520, -50, 1040, E.H + 100); seg(g, [[cx - 80, -20], [cx - 100, 420]], 14, shade(GREEN, -.5)); seg(g, [[cx + 80, -20], [cx + 100, 380]], 14, shade(GREEN, -.5));
      g.save(); g.translate(cx + 40, cy - 120 + (1 - q) * 200); g.rotate(-.08); poly(g, [[-40, 0], [40, 0], [26, 60], [-26, 60]], '#c8302a'); poly(g, [[-26, 60], [26, 60], [70, 460], [0, 540], [-70, 460]], '#d8403a'); for (let k = 0; k < 6; k++) seg(g, [[-60, 140 + k * 60], [60, 100 + k * 60]], 10, 'rgba(255,220,160,.35)'); g.restore();
      HAND(g, cx + 70, cy - 130 + (1 - q) * 200, -1.65, 200, 56); break; }
    case 'pile': {   // the hero's phone: unsent texts pile up; the one being "spoken" types itself at the bottom
      const gl = ghostLine(gt), msgs = p.msgs || [], cnt = p.count ? Math.round(lerp(p.count[0], p.count[1], ease.inOut(prog(t, .2, dur * .85)))) : null;
      phone(cx - (p.side ?? 0) * 260, cy - 150 * (p.sc ?? 1.9), p.sc ?? 1.9, g => { hdr(g, 'Messages', 'not sent');
        const shown = msgs.slice(0, Math.max(1, Math.ceil(msgs.length * prog(t, 0, dur * .7) + (p.pre ?? 1)))); const y0 = 190 - (gl ? 78 : 0);
        shown.slice(-5).reverse().forEach(([from, str], i) => gbub(g, y0 - i * 78, str, (.9 - i * .12) * (.8 + .2 * Math.sin(gt * 19 + i * 2)), from));
        if (gl) { const [str, del] = ghostText(gl, gt); gbub(g, 210, (str || '') + (Math.sin(gt * 9) > 0 ? '|' : ''), .75 + .25 * Math.sin(gt * 23), NAME[gl.tag]); } }, { noHand: p.noHand });
      if (cnt != null) UI.badge(g, { x: VERT ? VERT.left + E.H * 9 / 16 - 30 : undefined, y: VERT ? 150 : undefined, str: `${p.countLabel || 'UNSENT'} ${cnt}`, color: cnt > 100 ? S().ui.accent : S().ui.gold, a: ease.out(prog(t, 0, .3)) });
      break; }
    case 'typing': {   // YOU typing a reply to Mira; p.line = the YOU-T line, p.delT = global time the backspace starts
      const l = LINES.find(x => x.id === p.lid), W = WALL.filter(w => w.line === p.lid); let str = p.full ? l.text : W.filter(w => gt >= w.t0).map(w => w.w).join(' ');
      const del = p.delT != null ? prog(gt, p.delT, p.delT + (p.delDur ?? 1.1)) : 0; if (del > 0) str = l.text.slice(0, Math.floor(l.text.length * (1 - del)));
      phone(cx, cy - 60, 2.0, g => { hdr(g, 'Mira', 'online'); g.translate(0, -120); gbub(g, -70, "I'm not okay", .7 + .2 * Math.sin(gt * 17), '03:02 · not sent');
        rr(g, -165, 190, 262, 64, 22); g.fillStyle = '#232b40'; g.fill(); const lines2 = wrapPx(g, str || '', 21, 226).slice(-2); lines2.forEach((ln, i) => text(g, ln, -150, 212 + i * 24 - (lines2.length - 1) * 4, { size: 21, font: 'Nunito', weight: 800, color: '#ffffff', align: 'left' }));
        if (Math.sin(gt * 9) > 0) { const lw2 = measureT(g, lines2[lines2.length - 1] || '', 21); g.fillStyle = '#fff'; g.fillRect(-148 + lw2, 200 + (lines2.length - 1) * 20, 3, 26); }
        const hot = p.send ? .6 + .4 * Math.sin(t * 6) : .35; circle(g, 136, 222, 30, alpha('#3b82f6', del > 0 ? .25 : hot)); poly(g, [[124, 208], [152, 222], [124, 236]], '#fff');
        if (del > 0) { rr(g, 60, 134, 110, 44, 10); g.fillStyle = alpha('#ff6a4a', .9); g.fill(); text(g, 'DELETE', 115, 157, { size: 17, font: FONTS.ui, weight: 900, color: '#fff' }); } }, { noHand: true });
      const tx = del > 0 ? cx + 250 : cx + 290, ty = del > 0 ? cy + 60 : cy + 30 + (p.send ? Math.sin(t * 3) * 8 : 0); HAND(g, tx + 190, ty + 240, -2.2, 230, 70);
      break; }
    case 'real': {   // a real, sent message: solid blue, no flicker
      const q = ease.outBack(prog(t, p.at ?? .5, (p.at ?? .5) + .4));
      phone(cx, cy + 150, 2.0, g => { hdr(g, p.sfrom || 'Mira', 'now'); if (q > 0) { const L2 = wrapPx(g, p.msg, 24, 250), h = 34 * L2.length + 30; g.save(); g.translate(-150, -120); g.scale(q, q); rr(g, 0, 0, 290, h, 22); g.fillStyle = p.inc ? '#3a3f52' : '#3b82f6'; g.fill(); L2.forEach((ln, i) => text(g, ln, 20, 32 + i * 34, { size: 24, font: 'Nunito', weight: 800, color: '#fff', align: 'left' })); g.restore(); if (!p.inc) text(g, 'Delivered', 130, -120 + h + 22, { size: 15, font: 'Nunito', weight: 800, color: '#8a94a8', align: 'right', alpha: prog(t, 1.1, 1.5) }); } }, { bg: '#141a2a' });
      if (q > 0 && q < 1.05) FX.rings(g, cx, cy, t - (p.at ?? .5), { count: 2, r0: 60, r1: 420, color: '#3b82f6', a: .35, w: 4 });
      break; }
    case 'call': {   // phone call with a face on screen (mum)
      phone(cx - 40, cy + 20, 1.42, g => { g.fillStyle = linGrad(g, 0, -325, 0, 325, ['#6a4a3a', '#3a2a2e']); g.fillRect(-180, -325, 360, 650); for (let k = 0; k < 3; k++) { rr(g, -150 + k * 105, -290, 84, 110, 6); g.fillStyle = ['#8a5a3a', '#7a6a4a', '#8a4a3a'][k]; g.fill(); }
        glow(g, 60, -200, 260, '#ffd59a', .25); const tk = talkFor(p.who || 'MUM', gt); bust(g, 0, 10 + Math.sin(t * 1.7) * 3, 96, p.who || 'MUM', { expr: seqVal(p.expr, k) || 'smile', ex: exAt(p.expr, t, dur), talk: tk, blink: (t % 3.1) > 2.95, look: [0, .1], rimColor: '#ffb45a', rimSide: 1, t });
        if (p.badge) badge(g, 0, 10 - 96 * .52, 96 * .5, p.badge, t, k);
        text(g, p.name || 'Mum', 0, 252, { size: 28, font: FONTS.ui, weight: 900, color: '#fff' }); const sec = Math.floor(t + (p.t0 || 4)); text(g, `0:${String(sec).padStart(2, '0')}`, 0, 284, { size: 18, font: 'Nunito', weight: 800, color: '#d8c8b8' }); }, { rot: .02 });
      break; }
    case 'tree': {   // flashback: the school play
      g.fillStyle = '#1a1220'; g.fillRect(0, 0, E.W, E.H); for (const sx of [-1, 1]) { g.fillStyle = '#8a2a3a'; g.beginPath(); g.moveTo(cx + sx * E.W * .5, 0); g.lineTo(cx + sx * E.W * .26, 0); g.quadraticCurveTo(cx + sx * E.W * .3, E.H * .5, cx + sx * E.W * .36, E.H); g.lineTo(cx + sx * E.W * .5, E.H); g.fill(); }
      g.fillStyle = '#5a4034'; g.fillRect(0, E.H * .78, E.W, E.H * .22); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,230,180,.16)'; g.beginPath(); g.moveTo(cx - 60, 0); g.lineTo(cx + 60, 0); g.lineTo(cx + 330, E.H * .8); g.lineTo(cx - 330, E.H * .8); g.fill(); g.restore();
      const sw = Math.sin(t * 2.4) * .06; g.save(); g.translate(cx, E.H * .78); g.rotate(sw); g.fillStyle = '#6a4a2a'; g.fillRect(-34, -190, 68, 190); for (const [dx, dy, r0] of [[0, -330, 150], [-110, -250, 105], [110, -250, 105]]) circle(g, dx, dy, r0, '#3f8a4a');
      circle(g, 0, -235, 52, S().ink); for (const ex of [-17, 17]) { g.fillStyle = '#f4ecdf'; g.beginPath(); g.ellipse(ex, -240, 6, 12, 0, 0, 7); g.fill(); } g.strokeStyle = '#f4ecdf'; g.lineWidth = 5; g.beginPath(); g.arc(0, -226, 16, .2, Math.PI - .2); g.stroke();
      seg(g, [[-34, -120], [-120, -170 + Math.sin(t * 5) * 14]], 14, '#6a4a2a'); seg(g, [[34, -120], [120, -170 - Math.sin(t * 5) * 14]], 14, '#6a4a2a'); g.restore();
      for (let k = 0; k < 9; k++) circle(g, cx - 720 + k * 180, E.H + 20, 70, '#0e0a12');
      text(g, 'SCHOOL PLAY · AGE 7', cx, E.H * .12, { size: 40, font: FONTS.ui, weight: 900, color: '#ffd47e', alpha: ease.out(prog(t, .2, .6)), spacing: 3 }); break; }
    case 'boxes': { tableTop(E.H * .8); const n = Math.round(lerp(p.n0 ?? 1, p.n ?? 6, ease.inOut(prog(t, dur * .25, dur * .8)))); for (let k = 0; k < n; k++) { const col = k % 3, row = Math.floor(k / 3); g.save(); g.translate(cx - 420 + col * 420, E.H * .8 - row * 300); g.scale(3.6, 3.6); rr(g, -44, -80, 88, 80, 4); g.fillStyle = '#b88a5a'; g.fill(); g.fillStyle = '#9a7048'; g.fillRect(-44, -80, 88, 12); g.fillStyle = '#e8d8b8'; g.fillRect(-8, -80, 16, 80); text(g, ['BOOKS', 'KITCHEN', 'MISC', 'SHOES', 'DESK', 'MUGS'][k], 0, -34, { size: 12, font: 'Nunito', weight: 900, color: '#5a3a20' }); g.restore(); } break; }
    case 'mug': { tableTop(E.H * .7); g.save(); g.translate(cx, E.H * .7); for (const [dx, c, r0] of [[-150, '#3fb950', 150], [130, '#8a8490', 160], [0, '#5a7ac0', 175]]) { g.fillStyle = c; g.beginPath(); g.ellipse(dx, -90, r0, 110, 0, 0, 7); g.fill(); g.fillStyle = shade(c, -.2); g.beginPath(); g.ellipse(dx, -60, r0 * .9, 70, 0, 0, 7); g.fill(); }
      rr(g, -70, -250 - Math.sin(Math.min(1, t) * Math.PI) * 30, 140, 150, 16); g.fillStyle = '#f2ece4'; g.fill(); g.strokeStyle = '#f2ece4'; g.lineWidth = 22; g.beginPath(); g.arc(86, -175, 40, -1.2, 1.2); g.stroke(); circle(g, 0, -170, 26, '#3fb950'); g.restore(); HAND(g, cx - 330, E.H * .52, -.2, 200, 48); HAND(g, cx + 360, E.H * .5, Math.PI + .2, 200, 48, '#141018'); break; }
    case 'card': { tableTop(E.H * .68); const q = ease.out(prog(t, .1, .7)); g.save(); g.translate(cx, cy - 20 + (1 - q) * 80); g.rotate(-.05); g.scale(1.5, 1.5); rr(g, -330, -210, 660, 420, 14); g.fillStyle = '#f7f1e4'; g.fill(); rr(g, -330, -210, 660, 420, 14); g.strokeStyle = '#3fb950'; g.lineWidth = 8; g.stroke();
      (p.lines || []).forEach((ln, i) => text(g, ln, 0, -90 + i * 86, { size: p.size || 46, font: FONTS.ui, weight: 800, italic: true, color: '#2a3a7a', alpha: ease.out(prog(t, .4 + i * (p.gap ?? .9), .9 + i * (p.gap ?? .9))) })); g.restore(); if (p.hands) { HAND(g, cx - 430, cy + 250, -.9, 180, 46, '#141018'); HAND(g, cx + 430, cy + 250, Math.PI + .9, 180, 46, '#141018'); } break; }
    case 'wallet': { tableTop(E.H * .62); rr(g, cx - 330, E.H * .2, 660, 110, 12); g.fillStyle = '#2a2430'; g.fill(); text(g, 'LOST & FOUND', cx, E.H * .2 + 58, { size: 50, font: FONTS.ui, weight: 900, color: '#ffd47e' }); const q = ease.inOut(prog(t, .2, 1.1)); g.save(); g.translate(cx - 420 + q * 420, E.H * .62 - 26); rr(g, -110, -50, 220, 76, 12); g.fillStyle = '#7a4a2a'; g.fill(); g.fillStyle = '#5a3418'; g.fillRect(-110, -18, 220, 8); circle(g, 80, -12, 10, '#d8b060'); g.restore(); HAND(g, cx - 640 + q * 420, E.H * .56, -.1, 200, 46); FX.snow && FX.snow(g, t, { count: 30 }); break; }
    case 'drums': { tableTop(E.H * .8); g.save(); g.translate(cx, E.H * .8); circle(g, 0, -150, 150, '#2a2430'); circle(g, 0, -150, 120, '#e8e0d0'); circle(g, 0, -150, 30, '#d8504a'); for (const [dx, dy, r0] of [[-230, -200, 80], [230, -200, 80]]) { g.fillStyle = '#3a3440'; g.beginPath(); g.ellipse(dx, dy, r0, 50, 0, 0, 7); g.fill(); g.fillStyle = '#e8e0d0'; g.beginPath(); g.ellipse(dx, dy - 22, r0, 26, 0, 0, 7); g.fill(); }
      for (const [dx, dy] of [[-360, -420], [360, -460]]) { seg(g, [[dx, 0], [dx, dy]], 8, '#8a8490'); g.fillStyle = '#d8b060'; g.beginPath(); g.ellipse(dx, dy + Math.sin(t * 22 + dx) * 6, 120, 16, Math.sin(t * 22 + dx) * .08, 0, 7); g.fill(); } g.restore();
      for (let k = 0; k < 3; k++) FX.rings(g, cx + (k - 1) * 360, E.H * .42, t + k * .3, { count: 2, r0: 40, r1: 260, color: '#ffd47e', a: .35, w: 5 }); text(g, '3 A.M.', cx, E.H * .16, { size: 60, font: FONTS.ui, weight: 900, color: '#ff8a5a', alpha: ease.out(prog(t, .2, .6)) }); break; }
    case 'coins': { tableTop(E.H * .66); rr(g, cx - 300, E.H * .66 - 60, 600, 60, 14); g.fillStyle = '#3a4250'; g.fill(); const n = Math.floor(lerp(0, 140, prog(t, .1, dur * .85))); for (let k = 0; k < Math.min(n, 60); k++) { const x = cx - 270 + (k * 97) % 540, y = E.H * .66 - 66 - (k % 5) * 9; g.fillStyle = k % 3 ? '#c8854a' : '#b0703a'; g.beginPath(); g.ellipse(x, y, 20, 7, 0, 0, 7); g.fill(); }
      HAND(g, cx - 380, E.H * .36 + Math.sin(t * 9) * 10, .5, 200, 46); FX.rain(g, t, { count: 90, color: 'rgba(190,215,255,.5)' }); UI.badge(g, { str: `PENNIES ${n}`, color: S().ui.gold, a: 1 }); break; }
    case 'plant': { tableTop(E.H * .74); g.save(); g.translate(cx, E.H * .74); poly(g, [[-90, 0], [90, 0], [120, -170], [-120, -170]], '#b8683a'); for (let k = 0; k < 6; k++) { const a0 = -1.9 + k * .55 + (k % 2 ? .3 : 0); g.strokeStyle = '#5a6a3a'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -170); g.quadraticCurveTo(Math.cos(a0) * 190, -330, Math.cos(a0) * 300, -190 + Math.sin(t * 1.2 + k) * 6); g.stroke(); } g.restore(); badge(g, cx, E.H * .3, 80, { k: 'num', v: p.v ?? 4, hot: 5 }, t, k); break; }
    case 'cake': { tableTop(); const q = ease.inOut(prog(t, .2, 1.0)); g.save(); g.translate(cx - 360 + q * 380, E.H * .72); g.beginPath(); g.ellipse(0, -14, 230, 50, 0, 0, 7); g.fillStyle = '#efe8de'; g.fill(); poly(g, [[-110, -30], [110, -30], [90, -150], [-90, -150]], '#f29ac0'); g.fillStyle = '#fff3e6'; g.fillRect(-100, -96, 200, 16); circle(g, 0, -168, 22, '#d8504a'); g.restore(); HAND(g, cx - 620 + q * 380, E.H * .66, -.1, 200, 46); break; }
    case 'shelf': { g.save(); g.translate(cx, cy - 40); g.rotate(lerp(.14, 0, ease.outBack(prog(t, dur * .35, dur * .7)))); rr(g, -520, 0, 1040, 44, 8); g.fillStyle = '#5a3a28'; g.fill(); g.restore(); for (const dx of [-420, 420]) circle(g, cx + dx, cy - 18, 12, '#c8c0b0'); HAND(g, cx + 470, cy + 150, -1.9, 170, 46); seg(g, [[cx + 424, cy - 12], [cx + 452, cy + 90]], 14, '#e8a030'); break; }
    case 'coffee': { tableTop(E.H * .7); const q = ease.out(prog(t, .1, .8)); cup(g, cx - 300 + q * 300, E.H * .7, 8, { sleeve: YELLOW }); steam(g, cx - 300 + q * 300, E.H * .7 - 250, t, .5); HAND(g, cx - 560 + q * 300, E.H * .5, -.05, 220, 50); if (p.count) UI.badge(g, { str: p.count, color: S().ui.gold, a: ease.out(prog(t, .3, .6)) }); break; }
    case 'scroll': { phone(cx, cy + 20, 1.42, g => { hdr(g, 'Mira', 'since March'); const off = (t * 240) % 760; for (let k = 0; k < 16; k++) { const y = 300 - k * 76 + off - 300, me = k % 3 !== 1, w = 120 + (k * 53) % 150; rr(g, me ? 160 - w : -160, y, w, 48, 18); g.fillStyle = me ? '#3b82f6' : '#3a3f52'; g.fill(); } }, { bg: '#10141f' }); break; }
    case 'tape': { tableTop(E.H * .68); g.save(); g.translate(cx, E.H * .68 - 150); ring(g, 0, 0, 150, 70, '#c8a060'); ring(g, 0, 0, 82, 10, '#8a6a3a'); g.rotate(-.2); g.fillStyle = '#d8b878'; g.fillRect(140, -40, 420 * ease.out(prog(t, .2, 1.2)), 70); g.restore(); break; }
    case 'bench': { tableTop(E.H * .82); g.fillStyle = '#5a4034'; rr(g, cx - 620, E.H * .6, 1240, 56, 12); g.fill(); rr(g, cx - 620, E.H * .36, 1240, 48, 12); g.fill(); for (const dx of [-520, 520]) seg(g, [[cx + dx, E.H * .36], [cx + dx, E.H * .82]], 26, '#1c1620');
      g.save(); g.translate(cx + 80, E.H * .6); g.rotate(.5); g.scale(3.4, 3.4); poly(g, [[-16, 0], [16, 0], [34, -70], [-34, -70]], '#e8dcc8'); for (const [dx, dy, c] of [[-22, -92, '#f06a8a'], [4, -104, '#ffd47e'], [26, -88, '#f29ac0'], [-6, -80, '#ff8a5a']]) { circle(g, dx, dy, 15, c); circle(g, dx, dy, 5, '#fff3dc'); } g.restore(); break; }
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
  vblur(g, 6, g => SETS[info.set || 'cafe'](g, t, F(...(info.bgCam || [960, 520, .62])), info.so || { variant: 'am' })); veil(g, '#160c14', .55);
  UI.titleCard(g, t, { lines: info.lines || ['WHAT IF…'], dur: info.dur, y: E.H * .42 });
}
function end(g, t, info) {
  UI.endScreen(g, t, { question: info.question || 'What would YOU do?', cast: [] });
  const ids = info.cast || ['MIRA', 'YOU'], GY = E.H * .93, rim = { color: '#ffb45a', dir: [0, -1], w: 4 };
  ids.forEach((id, i) => { const a = ease.out(prog(t, .3 + i * .12, .8 + i * .12)); if (a <= 0) return; const x = E.W / 2 + (i - (ids.length - 1) / 2) * 240, q = id === 'YOU' ? 1.2 : 1;
    drawChar(g, id, { x, y: GY + (1 - a) * 60, s: 1.6 * q, facing: i < ids.length / 2 ? 1 : -1, pose: breathe(id === 'YOU' ? POSES.wave : POSES.stand, t, 1, i + 1), expr: id === 'YOU' ? 'happy' : 'smile', rim, alpha: a, blink: (t + i) % 3.3 > 3.15 }, t); });
}
function charsheet(g, t, info) {
  backdrop(g, ['#2a1c30', '#3b2a4a', '#5a3a50']); const rim = { color: '#ffb45a', dir: [1, -.3], w: 4 };
  const ids = info.ids || ['YOU', 'MIRA', 'MIRA_EVE', 'BARISTA', 'BOSS', 'COLL', 'TRAIN'], names = info.names || ids;
  const ex = info.ex || 'neutral';
  ids.forEach((id, i) => { const x = 150 + i * 270;
    bust(g, x, 230, 78, id, { expr: ex, rimSide: 1, rimColor: '#ffb45a', t });
    drawChar(g, id, { x: x - 55, y: 900, s: 1.45, facing: 1, pose: POSES.stand, expr: ex, rim }, t);
    drawChar(g, id, { x: x + 60, y: 900, s: 1.45, facing: -1, pose: POSES.stand, expr: ex, rim: { ...rim, dir: [-1, -.3] } }, t);
    text(g, names[i], x, 1010, { size: 30, font: FONTS.ui, weight: 900, color: '#f4ecdf' }); });
  text(g, 'expression: ' + ex, E.W / 2, 1060, { size: 24, font: FONTS.ui, weight: 800, color: '#ffd47e' });
}
function faces(g, t, info) {
  backdrop(g, ['#2a1c30', '#3b2a4a']); const L = info.list || ['neutral', 'smile', 'happy', 'laugh', 'tender', 'relief', 'tearsmile', 'surprised', 'shocked', 'confused', 'worried', 'nervous', 'guilty', 'pressed', 'holdback', 'sad', 'hurt', 'teary', 'cry', 'angry', 'wince'];
  L.forEach((e, i) => { const x = 140 + (i % 7) * 275, y = 170 + Math.floor(i / 7) * 350; bust(g, x, y, 78, info.who || 'YOU', { expr: e, rimSide: 1, rimColor: '#ffb45a', t, tear: ['cry', 'teary', 'tearsmile'].includes(e) ? .6 : undefined });
    text(g, e.toUpperCase(), x, y + 215, { size: 26, font: FONTS.ui, weight: 900, color: '#ffd47e' }); });
}
// ---------- vertical (Shorts): the 16:9 stage is drawn 1.78x larger and panned to the subject; captions and bubbles are laid out for 9:16 ----------
function panFor(info, t) { if (info.vx != null) return info.vx; if (info.k === 'face') return 960 - (info.side ?? 1) * 1920 * .06;
  if (info.k === 'scene' && Array.isArray(info.who) && info.cam) { const k = clamp(t / Math.max(.01, info.dur)), c0 = info.cam[0], c1 = info.cam[1] || c0, cx = lerp(c0[0], c1[0], ease.inOut(k)), z = lerp(c0[2], c1[2], ease.inOut(k));
    const gt = info.globalT, sp = LINES.find(l => !l.thought && gt >= l.start - .2 && gt <= l.end + .2 && l.tag !== 'N'), fx = w => (w.walk ? lerp(w.walk[0], w.walk[1], clamp((k - w.walk[2]) / Math.max(.01, w.walk[3] - w.walk[2]))) : w.x);
    const main = info.who.filter(w => !/^X\d/.test(w.id)), spk = sp && main.find(w => TAGOF(w.id) === sp.tag), xs = (main.length ? main : info.who).map(fx), mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    const span = (Math.max(...xs) - Math.min(...xs)) * z, f = span < 480 ? mid : (spk ? fx(spk) : (main.find(w => w.id === 'YOU') ? fx(main.find(w => w.id === 'YOU')) : mid)); return 960 + (f - cx) * z; }
  return 960; }
function shortEnd(g, t, info) {   // last 2 s of a Short: drawn straight in 9:16
  backdrop(g, ['#2a1630', '#160c1c']); glow(g, E.W / 2, E.H * .42, E.W * .9, '#ff9a5a', .16); const q = ease.outBack(prog(t, .05, .5));
  g.save(); g.translate(E.W / 2, E.H * .36); g.scale(q, q); bust(g, 0, 0, 150, 'YOU', { expr: 'smile', rimColor: '#ffb45a', rimSide: 1, t, blink: (t % 3.3) > 3.15 }); g.restore();
  text(g, 'FULL STORY', E.W / 2, E.H * .58, { size: 92, font: FONTS.ui, weight: 900, color: '#ffd47e', alpha: prog(t, .2, .5), spacing: 4 });
  text(g, 'ON THE CHANNEL', E.W / 2, E.H * .635, { size: 64, font: FONTS.ui, weight: 900, color: '#f4ecdf', alpha: prog(t, .35, .65), spacing: 4 });
  (info.lines || []).forEach((ln, i) => text(g, ln, E.W / 2, E.H * .72 + i * 54, { size: 40, font: 'Nunito', weight: 800, italic: true, color: 'rgba(244,236,223,.85)', alpha: prog(t, .5, .8) }));
}
const B0 = { charsheet, faces, scene, face, insert, blueprint, topdown, title, end }, B = { shortEnd };
for (const k in B0) B[k] = (g, t, info) => { if (!E.vertical) return B0[k](g, t, info);
  const W0 = E.W, H0 = E.H, kk = H0 / 1080, vis = W0 / kk, left = clamp(panFor(info, t) - vis / 2, 0, 1920 - vis);
  E.W = 1920; E.H = 1080; E.vertical = false; VERT = { left, k: kk }; GQ.length = 0; g.save(); g.scale(kk, kk); g.translate(-left, 0);
  try { B0[k](g, t, info); } finally { g.restore(); E.W = W0; E.H = H0; E.vertical = true; VERT = null; }
  for (const q of GQ) ghostBubble(g, ...q); cap(g, info.globalT); vOverlay(g, t, info); if (info.clock && !info.stamp) vOverlay(g, t, { ...info, hookText: null, ask: null, fring: null, stamp: info.clock }); };
for (const s of E.shots || []) {
  if (s.params?.k === '3d') continue;
  registerShot(s.id, { draw(g, t, info) { const f = B[info.k]; if (!f) { text(g, 'missing builder ' + info.k, E.W / 2, E.H / 2, { color: '#f44' }); return; } f(g, t, info); } });
}
