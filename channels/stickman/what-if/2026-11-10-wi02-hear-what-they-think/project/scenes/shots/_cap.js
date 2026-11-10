// WI02 captions (style v2 §6): karaoke chunks that never cross a line or a sentence break; thoughts are not captioned.
import { E, V, S, ease, prog, text, measure } from '/engine/core.js';
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
  const C = chunks(); const c = C.find(c => gt >= c[0].start - .05 && gt <= c[c.length - 1].end + .3); if (!c) return;
  const y = V(E.H - 150, E.H * .79), size = V(60, 76), strs = c.map(w => w.word.toUpperCase());
  let sz = size; const tot = () => strs.reduce((a, s) => a + measure(g, s, sz), 0) + sz * .3 * (strs.length - 1); if (tot() > E.W * .86) sz *= E.W * .86 / tot();
  let x = E.W / 2 - tot() / 2;
  strs.forEach((s, k) => { const w = c[k], on = gt >= w.start - .03, cur = on && (k === c.length - 1 || gt < c[k + 1].start - .03), ww = measure(g, s, sz);
    const pop = cur ? 1 + .08 * ease.out(prog(gt, w.start, w.start + .12)) : 1; g.save(); g.translate(x + ww / 2, y); g.scale(pop, pop);
    text(g, s, 0, 0, { size: sz, color: cur ? S().ui.gold : '#ffffff', stroke: sz * .16, strokeColor: 'rgba(0,0,0,.85)', alpha: on ? 1 : .55 }); g.restore(); x += ww + sz * .3; });
}
