// 2D overlay for Island Shorts/long-forms: hook plate, narration subtitles, dialogue box (typed), closing question, fades.
// Authored in a logical space (portrait 1080×1920 / landscape 1920×1080) and scaled onto the real canvas.
const cv = document.getElementById('ov'), g = cv.getContext('2d');
let TL = null, W = 1080, H = 1920, portrait = true;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };

export async function overlayReady(timeline, aspect) {
  TL = timeline; portrait = aspect < 1; W = portrait ? 1080 : 1920; H = portrait ? 1920 : 1080;
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
function blackout(t) {
  let a = 0;
  for (const s of TL.shots.slice(1)) { const c = s.a; if (t < c && t > c - .3) a = Math.max(a, ss((t - (c - .3)) / .3)); if (t >= c && t < c + .45) a = Math.max(a, 1 - ss((t - c) / .45)); }
  a = Math.max(a, ss(seg(t, TL.DUR - .7, TL.DUR - .05)), 1 - ss(seg(t, 0, .5)));
  if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); }
}
export function drawOverlay(t, shot) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
  for (const s of TL.shots) for (const v of s.vo) { if (v.dlg) dialogue(t, v); else subtitle(t, v); }
  if (TL.hook) plate(TL.hook, portrait ? 330 : 150, ss(seg(t, .25, .75)) * (1 - ss(seg(t, TL.hookEnd - .5, TL.hookEnd))), { label: TL.label });
  if (TL.ask) plate(TL.ask, portrait ? 330 : 150, ss(seg(t, TL.askAt, TL.askAt + .6)) * (1 - ss(seg(t, TL.DUR - .6, TL.DUR - .1))), { size: portrait ? 56 : 50 });
  blackout(t);
}
