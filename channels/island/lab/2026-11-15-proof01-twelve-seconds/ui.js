// 2D overlay for The Keeper's Island: chapter card, narration subtitles, title, fades. Our own card text; no library credit line.
import { VO, SHOTS, T } from './story.js';

const cv = document.getElementById('ov'), g = cv.getContext('2d');
const W = 1920, H = 1080;
let DURS = {};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); };

export async function overlayReady() {
  await Promise.all(['500 40px Cinzel', '700 40px Cinzel', 'italic 500 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '500 40px "Cormorant Garamond"'].map(f => document.fonts.load(f)));
  try { DURS = await (await fetch('voices/dur.json')).json(); } catch { DURS = { n1: 4.6, n2: 4.4, n3: 2.6, n4: 1.2 }; }
}
export const CREDIT = 'Voice: Kokoro TTS   ·   Made in code';

function ornament(cx, y, w, a) {
  g.save(); g.globalAlpha = a; g.strokeStyle = '#c9a863'; g.fillStyle = '#e2c989'; g.lineWidth = 1.5;
  for (const s of [-1, 1]) {
    const gr = g.createLinearGradient(cx, 0, cx + s * w, 0); gr.addColorStop(0, 'rgba(226,201,137,1)'); gr.addColorStop(1, 'rgba(226,201,137,0)');
    g.strokeStyle = gr; g.beginPath(); g.moveTo(cx + s * 16, y); g.lineTo(cx + s * w, y); g.stroke();
    g.beginPath(); g.arc(cx + s * 26, y, 2.5, 0, 7); g.fill();
  }
  g.beginPath(); g.moveTo(cx, y - 8); g.lineTo(cx + 8, y); g.lineTo(cx, y + 8); g.lineTo(cx - 8, y); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(cx, y - 3.5); g.lineTo(cx + 3.5, y); g.lineTo(cx, y + 3.5); g.lineTo(cx - 3.5, y); g.closePath(); g.fill();
  g.restore();
}
function spaced(text, x, y, sp) {
  const ws = [...text].map(c => g.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let cx = x - tot / 2; [...text].forEach((c, i) => { g.fillText(c, cx + ws[i] / 2, y); cx += ws[i] + sp; });
}
function glowText(fn, col, blur) { g.save(); g.shadowColor = col; g.shadowBlur = blur; fn(); g.restore(); fn(); }

// —— Chapter card (0–3.6 s): a lighthouse pixel-dot "pulse" instead of the demo's ember ——
function chapterCard(t) {
  const a0 = ss(seg(t, .3, 1.2)), a1 = ss(seg(t, 1.0, 1.9)), out = 1 - ss(seg(t, 2.9, 3.5));
  const bg = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 1100); bg.addColorStop(0, '#0f1a2a'); bg.addColorStop(1, '#020308');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = a0 * out; g.fillStyle = '#d8c28e'; g.font = '500 34px Cinzel'; spaced('CHAPTER  I', W / 2, 452, 10);
  ornament(W / 2, 500, 240 * (.4 + .6 * a0), a0 * out);
  g.globalAlpha = a1 * out; g.fillStyle = '#f3ead6'; g.font = 'italic 500 78px "Cormorant Garamond"';
  glowText(() => g.fillText('Twelve Seconds of Dark', W / 2, 578 - (1 - a1) * 10), 'rgba(255,190,110,.35)', 24);
  // The lamp's pulse: a warm dot that brightens and dies once (the premise, before a word is spoken)
  const p = Math.max(0, Math.sin(seg(t, .6, 3.0) * Math.PI)) * out;
  const eg = g.createRadialGradient(W / 2, 330, 0, W / 2, 330, 60); eg.addColorStop(0, `rgba(255,236,190,${.95 * p})`); eg.addColorStop(.2, `rgba(255,190,100,${.4 * p})`); eg.addColorStop(1, 'rgba(255,140,40,0)');
  g.globalAlpha = 1; g.fillStyle = eg; g.fillRect(W / 2 - 70, 260, 140, 140); g.fillStyle = `rgba(255,245,215,${p})`; g.fillRect(W / 2 - 3, 327, 6, 6);
  g.globalAlpha = 1;
}

function subtitle(t, v) {
  const d = DURS[v.id] || 3, a = ss(seg(t, v.t - .15, v.t + .2)) * (1 - ss(seg(t, v.t + d + .45, v.t + d + .8)));
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = 'italic 500 50px "Cormorant Garamond"';
  const y = H - 88, tw = g.measureText(v.sub).width;
  const sh = g.createLinearGradient(0, y - 70, 0, y + 40); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(.5, 'rgba(0,0,0,.38)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh; g.fillRect(W / 2 - tw / 2 - 160, y - 70, tw + 320, 110);
  g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 10; g.shadowOffsetY = 2; g.fillStyle = '#f6f0e2'; g.fillText(v.sub, W / 2, y);
  g.restore();
}

// —— Title (from T.titleIn): the dark world stays visible behind it ——
function title(t) {
  const a = ss(seg(t, T.titleIn, T.titleIn + 1.3)), out = 1 - ss(seg(t, 30.0, 30.9));
  if (a <= 0) return;
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = a * out * .45; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.globalAlpha = a * out; g.font = '700 108px Cinzel';
  const gr = g.createLinearGradient(0, 360, 0, 470); gr.addColorStop(0, '#fff3cf'); gr.addColorStop(.55, '#e2c27c'); gr.addColorStop(1, '#a8803e');
  g.fillStyle = gr; glowText(() => spaced('THE KEEPER’S ISLAND', W / 2, 420, 12), 'rgba(255,200,120,.55)', 40);
  ornament(W / 2, 502, 330 * (.3 + .7 * a), a * out);
  const b = ss(seg(t, T.titleIn + 1.6, T.titleIn + 2.4));
  g.globalAlpha = b * out; g.font = 'italic 500 50px "Cormorant Garamond"'; g.fillStyle = '#f3ead6'; g.fillText('Every light keeps a secret.', W / 2, 572);
  g.globalAlpha = ss(seg(t, T.titleIn + 2.6, T.titleIn + 3.4)) * out * .7; g.font = '500 24px "Cormorant Garamond"'; g.fillStyle = '#cfc6b2'; g.fillText(CREDIT, W / 2, H - 70);
  g.restore();
}

// —— Black between shots ——
const FADES = SHOTS.slice(1).map(s => [s.a, .3, .45]);
function blackout(t) {
  let a = 0;
  for (const [c, o, i] of FADES) { if (t < c && t > c - o) a = Math.max(a, ss((t - (c - o)) / o)); if (t >= c && t < c + i) a = Math.max(a, 1 - ss((t - c) / i)); }
  a = Math.max(a, ss(seg(t, 30.2, 31.0)));
  if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); }
}

export function drawOverlay(t, shot) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);   // UI authored at 1920×1080
  if (shot.id === 'card') { chapterCard(t); blackout(t); return; }
  for (const v of VO) subtitle(t, v);
  title(t);
  blackout(t);
}
