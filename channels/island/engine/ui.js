// 2D overlay for Island Shorts/long-forms: hook plate, narration subtitles, dialogue box (typed), closing question, fades.
// Authored in a logical space (portrait 1080×1920 / landscape 1920×1080) and scaled onto the real canvas.
const cv = document.getElementById('ov'), g = cv.getContext('2d');
let TL = null, W = 1080, H = 1920, portrait = true;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };

// Name tags: the first time a character is on screen in a video, a small "NAME · who they are" card slides in (viewers meet the cast in any order).
// shot.tags = [{ name, role, t?, big? }] overrides for that shot; cast entry tag: false skips one; timeline.tags === false turns it off.
const ROLES = { gus: ['GUS', 'the lighthouse keeper'], mabel: ['MABEL', 'his cat · the real detective'], pip: ['PIP', 'a gull who sees everything'], rollo: ['ROLLO', 'a very hungry mouse'],
  wren: ['OLD WREN', 'the postmistress · keeper of old tales'], dunn: ['DUNN', 'the harbour master'], marlo: ['MARLO', 'the ferry pilot'],
  crane: ['SILAS CRANE', 'a salvage merchant'], stranger: ['THE STRANGER', 'who is she?'] };
let TAGS = [];
function buildTags() {
  TAGS = []; if (TL.tags === false) return; const seen = new Set();
  TL.shots.forEach((s, i) => {
    const t0 = s.a + (i === 0 && TL.hook ? Math.max(.6, (TL.hookEnd || 0) + .2) : .7);
    if (s.tags) { s.tags.forEach((g, j) => TAGS.push({ t: s.a + (g.t ?? (.7 + j * 1.2)), d: g.d || 3.4, name: g.name, role: g.role, big: g.big, slot: j })); (s.tagsSeen || []).forEach(k => seen.add(k)); return; }
    let j = 0; for (const k in (s.cast || {})) { if (!ROLES[k] || seen.has(k) || s.cast[k].tag === false) continue; seen.add(k); TAGS.push({ t: t0 + j * 1.1, d: 3.2 + Math.max(0, 2.2 - j * 1.1), name: ROLES[k][0], role: ROLES[k][1], slot: j }); j++; }
  });
}
function nameTag(t, v) {
  const a = ss(seg(t, v.t, v.t + .45)) * (1 - ss(seg(t, v.t + v.d, v.t + v.d + .5))); if (a <= 0) return;
  const k = v.big ? 1.45 : 1, slot = v.slot || 0;
  const x = (portrait ? 64 : 84) - (1 - a) * 40, y = (portrait ? 540 : 110) + slot * 118 * k;
  g.save(); g.globalAlpha = a; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.font = `600 ${Math.round(40 * k)}px Cinzel`; const nw = g.measureText(v.name).width; g.font = `italic 500 ${Math.round(34 * k)}px "Cormorant Garamond"`; const rw = g.measureText(v.role).width;
  const bw = Math.max(nw, rw) + 60 * k, bh = 100 * k, gr = g.createLinearGradient(x, 0, x + bw, 0); gr.addColorStop(0, 'rgba(6,8,18,.86)'); gr.addColorStop(1, 'rgba(6,8,18,0)');
  g.fillStyle = gr; g.fillRect(x, y, bw + 60, bh); g.fillStyle = '#e2c989'; g.fillRect(x, y + 8, 4, bh - 16);
  g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 8; g.font = `600 ${Math.round(40 * k)}px Cinzel`; g.fillStyle = '#e8cf8f'; g.fillText(v.name, x + 24 * k, y + 46 * k);
  g.font = `italic 500 ${Math.round(34 * k)}px "Cormorant Garamond"`; g.fillStyle = '#f3ead6'; g.fillText(v.role, x + 24 * k, y + 84 * k); g.restore();
}
export async function overlayReady(timeline, aspect) {
  TL = timeline; portrait = aspect < 1; W = portrait ? 1080 : 1920; H = portrait ? 1920 : 1080; buildTags();
  await Promise.all(['500 40px Cinzel', '700 40px Cinzel', 'italic 500 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '500 40px "Cormorant Garamond"'].map(f => document.fonts.load(f)));
}
function wrap(text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; }
  if (cur) lines.push(cur); return lines;
}
function ornament(cx, y, w, a) {
  g.save(); g.globalAlpha = a; g.lineWidth = 1.5;
  for (const s of [-1, 1]) { const gr = g.createLinearGradient(cx, 0, cx + s * w, 0); gr.addColorStop(0, 'rgba(226,201,137,1)'); gr.addColorStop(1, 'rgba(226,201,137,0)'); g.strokeStyle = gr; g.beginPath(); g.moveTo(cx + s * 14, y); g.lineTo(cx + s * w, y); g.stroke(); }
  g.fillStyle = '#e2c989'; g.beginPath(); g.moveTo(cx, y - 5); g.lineTo(cx + 5, y); g.lineTo(cx, y + 5); g.lineTo(cx - 5, y); g.closePath(); g.fill(); g.restore();
}
// A gold-bordered plate with centred italic text (hook at the start, question at the end)
function plate(text, y, a, o = {}) {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle';
  const fs = o.size || (portrait ? 60 : 54); g.font = `italic 500 ${fs}px "Cormorant Garamond"`;
  const maxW = (portrait ? 900 : 1100), lines = wrap(text, maxW - 80), lh = fs * 1.12, bh = lines.length * lh + 64 + (o.label ? 36 : 0), bw = Math.min(maxW, Math.max(...lines.map(l => g.measureText(l).width)) + 110);
  const x = W / 2 - bw / 2, yy = y - bh / 2 + (1 - a) * 12;
  const gr = g.createLinearGradient(0, yy, 0, yy + bh); gr.addColorStop(0, 'rgba(14,18,34,.88)'); gr.addColorStop(1, 'rgba(6,8,18,.92)');
  g.fillStyle = gr; g.fillRect(x, yy, bw, bh); g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 2; g.strokeRect(x + 1, yy + 1, bw - 2, bh - 2); g.strokeStyle = 'rgba(214,190,130,.35)'; g.lineWidth = 1; g.strokeRect(x + 7, yy + 7, bw - 14, bh - 14);
  g.fillStyle = '#e2c989'; for (const [px, py] of [[x, yy], [x + bw, yy], [x, yy + bh], [x + bw, yy + bh]]) { g.beginPath(); g.moveTo(px, py - 6); g.lineTo(px + 6, py); g.lineTo(px, py + 6); g.lineTo(px - 6, py); g.closePath(); g.fill(); }
  let ty = yy + 32 + (o.label ? 36 : 0) + lh / 2;
  if (o.label) { g.font = '500 26px Cinzel'; g.fillStyle = '#d8c28e'; g.fillText(o.label.split('').join(String.fromCharCode(8202)), W / 2, yy + 40); g.font = `italic 500 ${fs}px "Cormorant Garamond"`; }
  g.fillStyle = '#f6f0e2'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 8;
  for (const l of lines) { g.fillText(l, W / 2, ty); ty += lh; }
  g.restore();
}
function subtitle(t, v) {
  const d = v.d || 3, a = ss(seg(t, v.t - .35, v.t + .05)) * (1 - ss(seg(t, v.t + d + .45, v.t + d + .8)));
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const fs = portrait ? 56 : 50; g.font = `italic 500 ${fs}px "Cormorant Garamond"`;
  const lines = wrap(v.sub, portrait ? 940 : 1500), lh = fs * 1.15, y0 = (portrait ? H - 430 : H - 88) - (lines.length - 1) * lh;
  const tw = Math.max(...lines.map(l => g.measureText(l).width));
  const sh = g.createLinearGradient(0, y0 - 70, 0, y0 + (lines.length - 1) * lh + 40); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(.5, 'rgba(0,0,0,.42)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh; g.fillRect(W / 2 - tw / 2 - 160, y0 - 70, tw + 320, (lines.length - 1) * lh + 110);
  g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 10; g.shadowOffsetY = 2; g.fillStyle = '#f6f0e2';
  lines.forEach((l, i) => g.fillText(l, W / 2, y0 + i * lh));
  g.restore();
}
function dialogue(t, v) {
  const d = v.d || 3, a = ss(seg(t, v.t - .3, v.t)) * (1 - ss(seg(t, v.t + d + .6, v.t + d + 1.0)));
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  const bw = portrait ? 960 : 1180, bh = portrait ? 250 : 210, x = W / 2 - bw / 2, y = (portrait ? H - 720 : H - 300) + (1 - a) * 14;
  const gr = g.createLinearGradient(0, y, 0, y + bh); gr.addColorStop(0, 'rgba(14,18,34,.86)'); gr.addColorStop(1, 'rgba(6,8,18,.9)');
  g.fillStyle = gr; g.fillRect(x, y, bw, bh); g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, bw - 2, bh - 2); g.strokeStyle = 'rgba(214,190,130,.35)'; g.lineWidth = 1; g.strokeRect(x + 7, y + 7, bw - 14, bh - 14);
  g.fillStyle = '#e2c989'; for (const [px, py] of [[x, y], [x + bw, y], [x, y + bh], [x + bw, y + bh]]) { g.beginPath(); g.moveTo(px, py - 6); g.lineTo(px + 6, py); g.lineTo(px, py + 6); g.lineTo(px - 6, py); g.closePath(); g.fill(); }
  // name plate
  g.font = '600 32px "Cormorant Garamond"'; g.textAlign = 'left'; g.textBaseline = 'middle'; const nw = g.measureText(v.dlg).width + 44;
  g.fillStyle = 'rgba(6,8,18,.95)'; g.fillRect(x + 28, y - 22, nw, 44); g.strokeStyle = 'rgba(214,190,130,.9)'; g.lineWidth = 2; g.strokeRect(x + 28, y - 22, nw, 44); g.fillStyle = '#e2c989'; g.fillText(v.dlg, x + 50, y);
  // typed text over 92 % of the voice
  const k = clamp((t - v.t) / (d * .92)), full = v.sub, n = Math.floor(full.length * k), shown = full.slice(0, n);
  const fs = portrait ? 44 : 42; g.font = `500 ${fs}px "Cormorant Garamond"`; g.fillStyle = '#f3ead6'; g.textBaseline = 'alphabetic';
  const lines = wrap(shown, bw - 100); let ty = y + 72; for (const l of lines) { g.fillText(l, x + 46, ty); ty += fs * 1.2; }
  if (k >= 1 && Math.floor(t * 2) % 2 === 0) { g.fillStyle = '#e2c989'; g.beginPath(); g.moveTo(x + bw - 46, y + bh - 36); g.lineTo(x + bw - 30, y + bh - 36); g.lineTo(x + bw - 38, y + bh - 24); g.closePath(); g.fill(); }
  g.restore();
}

// —— Long-form extras: chapter card (shot.card), solve-it countdown (shot.solve), end title (shot.title) ——
function cardShot(t, s) {
  const lt = t - s.a, d = s.b - s.a, a0 = ss(seg(lt, .3, 1.1)), a1 = ss(seg(lt, .9, 1.8)), out = 1 - ss(seg(lt, d - .7, d - .1));
  g.save(); const bg = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, Math.max(W, H)); bg.addColorStop(0, '#0f1a2a'); bg.addColorStop(1, '#020308');
  g.globalAlpha = Math.min(1, ss(seg(lt, 0, .3)) + (1 - out) * 0) * 1; g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = a0 * out; g.fillStyle = '#d8c28e'; g.font = '500 34px Cinzel'; g.fillText(s.card.label.split('').join(String.fromCharCode(8202)), W / 2, H / 2 - 88);
  ornament(W / 2, H / 2 - 40, 240 * (.4 + .6 * a0), a0 * out);
  g.globalAlpha = a1 * out; g.fillStyle = '#f3ead6'; g.font = 'italic 500 78px "Cormorant Garamond"'; g.shadowColor = 'rgba(255,190,110,.35)'; g.shadowBlur = 24; g.fillText(s.card.title, W / 2, H / 2 + 38);
  const p = Math.max(0, Math.sin(seg(lt, .5, d - .4) * Math.PI)) * out, eg = g.createRadialGradient(W / 2, H / 2 - 190, 0, W / 2, H / 2 - 190, 60);
  eg.addColorStop(0, `rgba(255,236,190,${.95 * p})`); eg.addColorStop(.2, `rgba(255,190,100,${.4 * p})`); eg.addColorStop(1, 'rgba(255,140,40,0)'); g.shadowBlur = 0; g.globalAlpha = 1; g.fillStyle = eg; g.fillRect(W / 2 - 70, H / 2 - 260, 140, 140);
  g.restore();
}
function solveShot(t, s) {
  const k = s.solve, t0 = s.b - k.secs - .9, lt = t - t0; if (lt < 0) return;
  const a = ss(seg(lt, 0, .5)) * (1 - ss(seg(t, s.b - .5, s.b - .1)));
  plate(k.q, portrait ? 330 : 170, a, { label: 'SOLVE IT · PAUSE NOW', size: portrait ? 54 : 50 });
  const n = Math.max(0, Math.ceil(k.secs - lt + .4)); if (n <= 0 || n > k.secs) return;
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'middle'; const cx = W / 2, cy = portrait ? 560 : 360, r = 52, f = (k.secs - lt + .4) % 1;
  g.fillStyle = 'rgba(6,8,18,.85)'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.strokeStyle = '#e2c989'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); g.stroke();
  g.fillStyle = '#f6f0e2'; g.font = '700 52px Cinzel'; g.fillText(String(n), cx, cy + 2); g.restore();
}
function titleShot(t, s) {
  const lt = t - s.a, d = s.b - s.a, a = ss(seg(lt, .4, 1.6)), out = 1 - ss(seg(lt, d - .9, d - .1)), T = s.title;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = a * out * .5; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.globalAlpha = a * out; g.font = `700 ${portrait ? 76 : 104}px Cinzel`; const gr = g.createLinearGradient(0, H / 2 - 120, 0, H / 2 - 20); gr.addColorStop(0, '#fff3cf'); gr.addColorStop(.55, '#e2c27c'); gr.addColorStop(1, '#a8803e');
  g.fillStyle = gr; g.shadowColor = 'rgba(255,200,120,.55)'; g.shadowBlur = 40; g.fillText(T.title, W / 2, H / 2 - 70); g.shadowBlur = 0;
  ornament(W / 2, H / 2, 330 * (.3 + .7 * a), a * out);
  g.globalAlpha = ss(seg(lt, 1.6, 2.4)) * out; g.font = 'italic 500 50px "Cormorant Garamond"'; g.fillStyle = '#f3ead6'; g.fillText(T.tag, W / 2, H / 2 + 70);
  g.globalAlpha = ss(seg(lt, 2.6, 3.4)) * out * .7; g.font = '500 24px "Cormorant Garamond"'; g.fillStyle = '#cfc6b2'; g.fillText(T.credit || '', W / 2, H - 70);
  g.restore();
  if (T.buttons !== false) { g.save(); g.globalAlpha = ss(seg(lt, 2.4, 2.9)) * out; buttons(t, s.a, H / 2 + (portrait ? 250 : 200), [3.0, 3.35, 3.7], null); g.restore(); }   // like · subscribe · bell on every end title
}
function blackout(t) {
  let a = 0;
  for (const s of TL.shots.slice(1)) { const c = s.a; if (t < c && t > c - .3) a = Math.max(a, ss((t - (c - .3)) / .3)); if (t >= c && t < c + .45) a = Math.max(a, 1 - ss((t - c) / .45)); }
  a = Math.max(a, ss(seg(t, TL.DUR - .7, TL.DUR - .05)), 1 - ss(seg(t, 0, .5)));
  if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); }
}
// —— OUTRO (Shorts): after the question, the music resolves and the episode closes with "next part" + like / subscribe / bell.
// Styles: 'lamp' (the lighthouse beam sweeps the frame and lights the buttons), 'mabel' (Mabel walks in and paws Subscribe), 'log' (the keeper's logbook + a red ink stamp).
// Hit times (seconds after outroAt) must match OUTRO_HITS in tools/mix.py.
const ICON = {
  thumb: ['....##....', '...###....', '...###....', '..####....', '#########.', '##########', '#########.', '##########', '#########.', '########..'],
  bell: ['....##....', '...####...', '..######..', '..######..', '..######..', '.########.', '.########.', '##########', '..........', '....##....'],
};
function pix(rows, x, y, k, col, a = 1) { g.save(); g.globalAlpha *= a; g.fillStyle = col; rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') g.fillRect(x + i * k, y + j * k, k, k); }); g.restore(); }
function pill(x, y, w, h, col, text, tcol, a = 1, sc = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x + w / 2, y + h / 2); g.scale(sc, sc); g.translate(-w / 2, -h / 2);
  const r = h / 2; g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, h, r); g.arcTo(w, h, 0, h, r); g.arcTo(0, h, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.closePath();
  g.fillStyle = col; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 14; g.fill(); g.shadowBlur = 0;
  g.font = `700 ${Math.round(h * .42)}px Cinzel`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = tcol; g.fillText(text, w / 2, h / 2 + 2); g.restore();
}
const pop = (t, at) => { const u = clamp((t - at) / .35); return u <= 0 ? 0 : 1 + .22 * Math.sin(u * Math.PI) * (1 - u * .4); };
function buttons(t, o, cy, hits, pressed) {   // thumb · SUBSCRIBE · bell, each lights at its hit time
  const k = portrait ? 9 : 8, bw = portrait ? 400 : 380, bh = portrait ? 104 : 92, gap = portrait ? 46 : 44, iw = 10 * k;
  const total = iw + gap + bw + gap + iw, x0 = W / 2 - total / 2;
  const on = i => clamp((t - (o + hits[i])) / .25), col = i => on(i) > 0 ? '#ffe7a6' : 'rgba(243,234,214,.55)';
  const p0 = pop(t, o + hits[0]) || 1, p2 = pop(t, o + hits[2]) || 1;
  g.save(); g.translate(x0 + iw / 2, cy); g.scale(p0, p0); pix(ICON.thumb, -iw / 2, -iw / 2, k, col(0)); g.restore();
  const sub = on(1) > 0 && pressed !== false ? (pressed === true ? ['#5a5a5a', 'SUBSCRIBED ✓'] : ['#d8352a', 'SUBSCRIBE']) : ['rgba(216,53,42,.55)', 'SUBSCRIBE'];
  pill(x0 + iw + gap, cy - bh / 2, bw, bh, sub[0], sub[1], '#fff8ec', 1, pop(t, o + hits[1]) || 1);
  const wob = on(2) > 0 ? Math.sin((t - o - hits[2]) * 22) * Math.exp(-(t - o - hits[2]) * 3) * .35 : 0;
  g.save(); g.translate(x0 + iw + gap + bw + gap + iw / 2, cy - iw / 2); g.rotate(wob); g.scale(p2, p2); pix(ICON.bell, -iw / 2, 0, k, col(2)); g.restore();
}
function nextLine(t, o, cy, a) {
  const n = TL.next; if (!n) return;
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 12;
  g.font = `600 ${portrait ? 36 : 30}px Cinzel`; g.fillStyle = '#e8cf8f'; g.fillText(`NEXT · PART ${n.part} · ${n.when}`, W / 2, cy);
  let fs = portrait ? 54 : 46; g.font = `italic 500 ${fs}px "Cormorant Garamond"`; while (g.measureText(n.title).width > W * .86 && fs > 30) { fs -= 2; g.font = `italic 500 ${fs}px "Cormorant Garamond"`; }
  g.fillStyle = '#fff8ec'; g.fillText(n.title, W / 2, cy + (portrait ? 64 : 54)); g.restore();
}
let MAB = null;
function mabelSprite() { if (MAB) return MAB; try { MAB = window.__makeMabel ? window.__makeMabel().atlas : null; } catch (e) { MAB = null; } return MAB; }
function outro(t) {
  const o = TL.outroAt; if (o == null || t < o) return; const st = TL.outro || 'lamp', u = t - o, fade = 1 - ss(seg(t, TL.DUR - .7, TL.DUR - .1));
  const veil = ss(seg(u, 0, .8)) * .55; g.fillStyle = `rgba(4,6,14,${veil})`; g.fillRect(0, 0, W, H);
  const cy = portrait ? H * .64 : H * .70;
  if (st === 'lamp') {
    const p = clamp((u - .2) / 1.7), bx = -W * .5 + p * W * 2.0;   // the lighthouse beam: a warm diagonal band sweeping left -> right
    if (p > 0 && p < 1) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(bx - 260, 0, bx + 260, 0); gr.addColorStop(0, 'rgba(255,214,140,0)'); gr.addColorStop(.5, `rgba(255,214,140,${.42 * Math.sin(p * Math.PI)})`); gr.addColorStop(1, 'rgba(255,214,140,0)');
      g.translate(bx, H / 2); g.rotate(-.18); g.translate(-bx, -H / 2); g.fillStyle = gr; g.fillRect(bx - 260, -H, 520, H * 3); g.restore(); }
    nextLine(t, o, cy - (portrait ? 190 : 150), ss(seg(u, .5, 1.0)) * fade);
    g.save(); g.globalAlpha = fade * ss(seg(u, .7, 1.0)); buttons(t, o, cy, [1.0, 1.35, 1.7], null); g.restore();
  } else if (st === 'mabel') {
    nextLine(t, o, cy - (portrait ? 290 : 230), ss(seg(u, .3, .8)) * fade);   // higher: Mabel sits on the button
    g.save(); g.globalAlpha = fade * ss(seg(u, .2, .6)); buttons(t, o, cy, [99, 2.5, 2.95], u > 2.5 ? true : null); g.restore();
    const A = mabelSprite(); if (A) {   // Mabel walks in from the right, sits by the button, paws it at 2.5 s
      const k = portrait ? 9 : 8, FW = 20, FH = 14, sx = W / 2 + (portrait ? 20 : 10), walkIn = ss(clamp((u - .3) / 1.6)), x = W + 40 - (W + 40 - sx) * walkIn;
      const tap = u > 2.2 && u < 2.7 ? Math.sin((u - 2.2) / .5 * Math.PI) : 0;
      const fr = walkIn < 1 ? ['w0', 'w1', 'w2', 'w3'][Math.floor(u * 11) % 4] : (u > 3.6 && u < 3.75 ? 'sitBlink' : 'sit0'), i = A.names.indexOf(fr);
      g.save(); g.globalAlpha = fade; g.imageSmoothingEnabled = false; g.translate(x - tap * 30, cy - (portrait ? 52 : 46) - FH * k + 10 + tap * 14); g.scale(-1, 1);
      g.drawImage(A.canvas, i * FW, 0, FW, FH, -FW * k, 0, FW * k, FH * k); g.restore(); }
  } else if (st === 'log') {   // the keeper's logbook page slides up; the next entry writes itself; a red ink SUBSCRIBE stamp lands
    const up = ss(seg(u, .1, .7)), pw = portrait ? 860 : 900, ph = portrait ? 520 : 400, px = W / 2 - pw / 2, py = cy - ph / 2 - (portrait ? 110 : 70) + (1 - up) * 120;
    g.save(); g.globalAlpha = fade * up; g.translate(px + pw / 2, py + ph / 2); g.rotate(-.02); g.translate(-pw / 2, -ph / 2);
    g.fillStyle = '#e9dcbc'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.fillRect(0, 0, pw, ph); g.shadowBlur = 0;
    g.strokeStyle = 'rgba(120,90,50,.25)'; g.lineWidth = 2; for (let y = 120; y < ph - 30; y += 58) { g.beginPath(); g.moveTo(40, y); g.lineTo(pw - 40, y); g.stroke(); }
    g.fillStyle = '#7a2e22'; g.font = `600 ${portrait ? 34 : 30}px Cinzel`; g.textAlign = 'left'; g.fillText("KEEPER'S LOG", 44, 70);
    const n = TL.next || { part: '?', title: '', when: '' }, line1 = `Next entry: Part ${n.part}, ${n.when.toLowerCase()}.`, line2 = n.title;
    const w = clamp((u - .7) / 1.2); let lf = portrait ? 46 : 40; g.font = `italic 500 ${lf}px "Cormorant Garamond"`; while (Math.max(g.measureText(line1).width, g.measureText(line2).width) > pw - 88 && lf > 28) { lf -= 2; g.font = `italic 500 ${lf}px "Cormorant Garamond"`; } g.fillStyle = '#2a2018';
    g.fillText(line1.slice(0, Math.round(line1.length * clamp(w * 1.6))), 44, 150); g.fillText(line2.slice(0, Math.round(line2.length * clamp(w * 1.6 - .6))), 44, 210);
    g.restore();
    const sa = clamp((u - 2.25) / .18), sc = sa > 0 ? 1.7 - .7 * ss(sa) : 0;
    if (sa > 0) { g.save(); g.globalAlpha = fade * .92; g.translate(W / 2 + (portrait ? 120 : 220), py + ph - (portrait ? 110 : 90)); g.rotate(-.14); g.scale(sc, sc);
      g.strokeStyle = '#c0281e'; g.lineWidth = 8; g.strokeRect(-220, -52, 440, 104); g.font = '700 58px Cinzel'; g.fillStyle = '#c0281e'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SUBSCRIBE', 0, 4); g.restore(); }
    const k = portrait ? 8 : 7, ba = clamp((u - 2.75) / .2);
    if (ba > 0) { const wob = Math.sin((u - 2.75) * 22) * Math.exp(-(u - 2.75) * 3) * .35; g.save(); g.globalAlpha = fade; g.translate(W / 2 - (portrait ? 300 : 360), py + ph - (portrait ? 140 : 120)); g.rotate(wob); pix(ICON.bell, -40, 0, k, '#7a2e22'); g.restore(); }
  }
}
export function drawOverlay(t, shot) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  const cur = TL.shots.find(s => t >= s.a && t < s.b) || TL.shots[TL.shots.length - 1];
  for (const s of TL.shots) for (const v of s.vo) { if (v.dlg) dialogue(t, v); else subtitle(t, v); }
  for (const v of TAGS) nameTag(t, v);
  if (cur.solve) solveShot(t, cur);
  if (cur.title) titleShot(t, cur);
  if (cur.card) { cardShot(t, cur); return; }
  if (TL.hook) plate(TL.hook, portrait ? 330 : 150, ss(seg(t, .25, .75)) * (1 - ss(seg(t, TL.hookEnd - .5, TL.hookEnd))), { label: TL.label });
  if (TL.ask) plate(TL.ask, portrait ? 330 : 150, ss(seg(t, TL.askAt, TL.askAt + .6)) * (1 - ss(seg(t, TL.DUR - .6, TL.DUR - .1))), { size: portrait ? 56 : 50 });
  outro(t);
  blackout(t);
}
