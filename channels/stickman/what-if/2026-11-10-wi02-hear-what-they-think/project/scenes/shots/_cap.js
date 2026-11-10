// WI02 captions (style v2 §6): karaoke chunks that never cross a line or a sentence break; thoughts are not captioned.
import { E, V, S, ease, prog, text, measure } from '/engine/core.js';
const base = new URL('../../timeline/', import.meta.url);
const LINES = await (await fetch(new URL('lines.json', base))).json();
const WALL = await (await fetch(new URL('words_all.json', base))).json();
// thought captions (v3): lower-case-as-written italic ivory in quotes, revealed one PHRASE at a time, in the same fixed caption line
function phrases(l) { const W = WALL.filter(w => w.line === l.id), out = []; let cur = [];
  W.forEach((w, i) => { cur.push(w); if (/[.,?!…—:]$/.test(w.w) || i === W.length - 1) { out.push(cur); cur = []; } }); return out; }
const PH = {};
function thoughtCap(g, gt, y) {
  const l = LINES.find(l => l.thought && gt >= l.start - .05 && gt <= l.end + .7); if (!l) return false;
  const P = PH[l.id] || (PH[l.id] = phrases(l)); let cur = P[0]; for (const ph of P) if (gt >= ph[0].t0 - .05) cur = ph;
  const str = '“' + cur.map(w => w.w).join(' ').replace(/^[—]/, '') + '”', a = Math.min(ease.out(prog(gt, cur[0].t0 - .05, cur[0].t0 + .2)), 1 - prog(gt, l.end + .4, l.end + .7));
  let sz = V(56, 66); const w = measure(g, str, sz, 'Nunito', 800); if (w > E.W * .86) sz *= E.W * .86 / w;
  text(g, str, E.W / 2, y, { size: sz, font: 'Nunito', weight: 800, italic: true, color: '#efe6d6', alpha: a, stroke: sz * .14, strokeColor: 'rgba(16,8,18,.8)', glow: 14, glowColor: 'rgba(239,230,214,.35)' });
  return true;
}
let CH = null;
function chunks() {
  if (CH) return CH; CH = []; const W = E.words || []; let cur = [];
  const flush = () => { if (cur.length) CH.push(cur); cur = []; };
  for (let i = 0; i < W.length; i++) {
    const w = W[i], prev = W[i - 1];
    if (prev && (w.start - prev.end > .32 || /[.?!…:—]$/.test(prev.word) || cur.length >= 4 || (cur.length >= 3 && /,$/.test(prev.word)))) flush();
    cur.push(w);
  }
  flush(); return CH;
}
export function cap(g, gt) {
  if (E.cfg.captions === false && !E.cfg.myCaptions) return; const shot = E.shots.find(s => gt >= s.start && gt < s.end); if (shot && shot.captions === false) return;
  const BAR0 = { none: 0, wide: V(60, 0), scope: V(138, 170), thin: V(30, 60) }, bv0 = b => typeof b === 'number' ? b : BAR0[b ?? E.cfg.bars ?? 'wide'] ?? 0;
  const si0 = E.shots.indexOf(shot), bar0 = Math.max(bv0(shot?.bars), si0 > 0 ? bv0(E.shots[si0 - 1].bars) : 0, si0 >= 0 && si0 < E.shots.length - 1 ? bv0(E.shots[si0 + 1].bars) : 0);
  if (thoughtCap(g, gt, Math.min(V(E.H - 150, E.H * .79), E.H - bar0 - V(62, 80)))) return;
  const C = chunks(); const c = C.find(c => gt >= c[0].start - .05 && gt <= c[c.length - 1].end + .3); if (!c) return;
  const BAR = { none: 0, wide: V(60, 0), scope: V(138, 170), thin: V(30, 60) }, bv = b => typeof b === 'number' ? b : BAR[b ?? E.cfg.bars ?? 'wide'] ?? 0;
  const si = E.shots.indexOf(shot), bar = Math.max(bv(shot?.bars), si > 0 ? bv(E.shots[si - 1].bars) : 0, si >= 0 && si < E.shots.length - 1 ? bv(E.shots[si + 1].bars) : 0);
  const y = Math.min(V(E.H - 150, E.H * .79), E.H - bar - V(62, 80)), size = V(60, 76), strs = c.map(w => w.word.toUpperCase());
  let sz = size; const tot = () => strs.reduce((a, s) => a + measure(g, s, sz), 0) + sz * .3 * (strs.length - 1); if (tot() > E.W * .86) sz *= E.W * .86 / tot();
  let x = E.W / 2 - tot() / 2;
  strs.forEach((s, k) => { const w = c[k], on = gt >= w.start - .03, cur = on && (k === c.length - 1 || gt < c[k + 1].start - .03), ww = measure(g, s, sz);
    const pop = cur ? 1 + .08 * ease.out(prog(gt, w.start, w.start + .12)) : 1; g.save(); g.translate(x + ww / 2, y); g.scale(pop, pop);
    text(g, s, 0, 0, { size: sz, color: cur ? S().ui.gold : '#ffffff', stroke: sz * .16, strokeColor: 'rgba(0,0,0,.85)', alpha: on ? 1 : .55 }); g.restore(); x += ww + sz * .3; });
}
