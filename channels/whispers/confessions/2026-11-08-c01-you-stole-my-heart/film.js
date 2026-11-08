// Whispers C01 v2 "You stole my heart" (LOCAL TEST: the music is a reel track we have no licence for). 1080x1920, 30 fps, 37.9 s.
// Vivek's own characters (vivek-cast Gemini sheets) brought to life. v2 (Vivek's notes): characters TALK (jaw/lips driven by the
// voice's real phoneme timings), blink, smile, lift brows, tilt and nod their heads, breathe and sway; she walks in; single
// close-ups alternate with two-shots of both. Captions are word-exact (timings from the TTS model, not estimated).
// Still no camera zooms. Shots join with slow dissolves.
export const W = 1080, H = 1920, DURATION = 37.9;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const hash = (x, y = 0) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
const key = (t, K) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t < K[i][0]) return lerp(K[i - 1][1], K[i][1], ss(seg(t, K[i - 1][0], K[i][0]))); return K[K.length - 1][1]; };

// shot: [t0, t1, asset, look]. look.talk = index of the face that speaks (HIM), look.smile[f] / brow[f] = keyframes per face.
const SHOTS = [
  [0.0, 4.4, 'him_window', { tint: [60, 90, 160, .18], glow: { x: .86, y: .74, r: .32, col: '160,200,255', flick: 1 }, parts: 'rain', talk: 0, smile: [[[0, 0], [2.6, .05], [3.6, .3]]], tiltBase: [.02] }],
  [4.0, 8.6, 'him_34', { bg: 'room', night: 1, tint: [255, 170, 90, .10], warmFrom: 6.2, parts: 'gather', talk: 0, smile: [[[4, .1], [8, .25]]], brow: [[[4, .3], [6, .6], [8, .2]]] }],
  [8.3, 13.6, 'her_34', { bg: 'room', tint: [255, 170, 90, .10], parts: 'gather', walk: [8.3, 10.0], smile: [[[8.3, 0], [12, .15]]], brow: [[[8.3, .5], [11, .2]]] }],
  [13.3, 16.9, 'her_front', { bg: 'room', tint: [255, 170, 90, .12], parts: 'gather', smile: [[[13.3, 0], [14.6, .2], [16.2, .55]]], brow: [[[13.3, .2], [15, .5], [16.9, .3]]] }],
  [16.6, 24.6, 'both', { tint: [255, 160, 80, .10], parts: 'gold', talk: 0, smile: [[[16.6, .1], [24.6, .3]], [[16.6, 0], [19.6, .1], [24.6, .3]]], brow: [[[16.6, .2]], [[16.6, .5], [20, .2], [24, .4]]], lean: 1 }],
  [24.3, 31.0, 'her_confess', { tint: [255, 180, 120, .10], parts: 'hearts', smile: [[[24.3, 0], [28.6, .1], [30.6, .5]]], brow: [[[24.3, .7], [28.8, .8], [30.6, .3]]], glint: 1 }],
  [30.7, 37.9, 'both', { tint: [255, 150, 70, .14], parts: 'gold', talk: 0, smile: [[[30.7, .3], [33.2, .65]], [[30.7, .3], [33.4, .7]]], brow: [[[30.7, .3]], [[30.7, .3]]], lean: 1 }],
];
let IMG = {}, RIG = {}, EN = { energy: [0], onset: [0] }, gl, glc, PROG, TEX = {}, U = {};
const energyAt = t => { const i = Math.min(EN.energy.length - 1, Math.max(0, Math.round(t * 30))); return EN.energy[i] || 0; };
const onsetAt = t => { const i = Math.min(EN.onset.length - 1, Math.max(0, Math.round(t * 30))); return EN.onset[i] || 0; };

// ---------------------------------------------------------------- WebGL: one textured quad, 2.5D + a face rig per face (max 2)
const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x*.5+.5, .5-p.y*.5); gl_Position = vec4(p,0.,1.); }`;
const FS = `precision highp float; varying vec2 uv; uniform sampler2D img, dep, hair; uniform float t, breath, sway, bodyRot; uniform vec2 par, shift;
uniform vec2 eL[2], eR[2], mo[2], hc[2], nk[2]; uniform float er[2], mw[2], hr[2], blink[2], open[2], smile[2], brow[2], tilt[2], nod[2];
const vec2 R = vec2(1080.,1920.);
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x - s*v.y, s*v.x + c*v.y); }
void main(){
  vec2 p = uv*R - shift;                                              // whole figure walks (shift) ...
  vec2 piv = vec2(540., 2300.); p = piv + rot(p - piv, -bodyRot);     // ... and sways around a point below the frame
  vec2 u0 = p / R;
  float d = texture2D(dep, clamp(u0,.001,.999)).r;
  vec2 q = u0 + par*(d-.45)*.035;                                     // parallax
  q.y -= breath*.0045*smoothstep(.42,.95,u0.y)*d;                     // breathing (chest / shoulders)
  float hm = texture2D(hair, clamp(u0,.001,.999)).r;
  q += hm*sway*vec2(sin(t*1.1+u0.y*7.)*.0045 + sin(t*2.3+u0.y*13.)*.0015, sin(t*.8+u0.x*6.)*.0018);
  p = q*R;
  float lid = 0., lash = 0., mouthIn = 0.; vec2 skinAt = vec2(0.);
  for (int i = 0; i < 2; i++) {
    if (hr[i] <= 0.) continue;
    float wh = 1. - smoothstep(hr[i]*.8, hr[i]*1.35, distance(p, hc[i]));          // head weight
    p = nk[i] + rot(p - nk[i], -tilt[i]*wh); p.y -= nod[i]*wh;                         // head tilt + nod
    // eyes: lids close from the top; skin sampled from just above the eye
    for (int k = 0; k < 2; k++) {
      vec2 e = k == 0 ? eL[i] : eR[i];
      vec2 r = (p - e) / vec2(er[i]*1.15, er[i]*.82);
      float inside = 1. - smoothstep(.85, 1.05, length(r));
      float ly = -1.05 + 2.1*blink[i];
      float cov = inside * (1. - smoothstep(ly - .08, ly + .08, r.y));
      if (cov > lid) { lid = cov; skinAt = e + vec2(r.x*er[i]*.6, -er[i]*1.35); }
      lash = max(lash, inside * (1. - smoothstep(.0, .14, abs(r.y - ly))) * smoothstep(.12, .3, blink[i]));
      float g = exp(-pow(distance(p, e + vec2(0., -er[i]*1.9)) / (er[i]*1.4), 2.));          // brows lift
      p.y += brow[i]*er[i]*.32*g;
    }
    // mouth: jaw drops (content below the lip line moves down), dark interior opens, corners lift on a smile
    vec2 r = (p - mo[i]) / (mw[i]*.5);
    float ap = open[i]*mw[i]*.26;
    float inner = 1. - smoothstep(.8, 1.05, length(vec2(r.x/.62, (p.y - (mo[i].y + ap*.5)) / max(ap*.5 + .6, .6))));
    mouthIn = max(mouthIn, inner * smoothstep(.04, .12, open[i]));
    float jaw = exp(-r.x*r.x/1.4 - pow(max(r.y, 0.), 2.)/7.) * smoothstep(-.15, .2, r.y);
    p.y -= ap*jaw;
    for (int c = 0; c < 2; c++) { vec2 cp = mo[i] + vec2(c == 0 ? -mw[i]*.5 : mw[i]*.5, 0.); float g = exp(-pow(distance(p, cp)/(mw[i]*.28), 2.));
      p.y += smile[i]*mw[i]*.09*g; p.x += (c == 0 ? 1. : -1.)*smile[i]*mw[i]*.05*g; }
  }
  vec2 s = p / R;
  if (s.x < 0. || s.x > 1. || s.y < 0. || s.y > 1.) { gl_FragColor = vec4(0.); return; }
  vec4 col = texture2D(img, s);
  vec3 skin = texture2D(img, clamp(skinAt / R, .001, .999)).rgb;
  col.rgb = mix(col.rgb, skin*.96, lid);
  col.rgb = mix(col.rgb, vec3(.12,.07,.07), lash*.85);
  col.rgb = mix(col.rgb, vec3(.24,.07,.08), mouthIn*.92);
  gl_FragColor = vec4(col.rgb*col.a, col.a);
}`;
function initGL() {
  glc = new OffscreenCanvas(W, H); gl = glc.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true, alpha: true });
  const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  PROG = gl.createProgram(); gl.attachShader(PROG, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(PROG, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(PROG); gl.useProgram(PROG);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(PROG, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  ['img', 'dep', 'hair', 't', 'breath', 'sway', 'bodyRot', 'par', 'shift', 'eL', 'eR', 'mo', 'hc', 'nk', 'er', 'mw', 'hr', 'blink', 'open', 'smile', 'brow', 'tilt', 'nod'].forEach(n => U[n] = gl.getUniformLocation(PROG, n));
}
function tex(img) { const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return tx; }
export async function load() {
  const names = [...new Set(SHOTS.map(s => s[2]))];
  const get = async src => { const r = await fetch(src); return await createImageBitmap(await r.blob(), { premultiplyAlpha: 'none' }); };
  initGL();
  RIG = await (await fetch('assets/rig.json')).json();
  for (const n of names) { IMG[n] = { img: await get(`assets/${n}.png`), d: await get(`assets/${n}_d.png`), h: await get(`assets/${n}_h.png`) }; TEX[n] = { img: tex(IMG[n].img), d: tex(IMG[n].d), h: tex(IMG[n].h) }; }
  try { EN = await (await fetch('energy.json')).json(); } catch (e) {}
}
// ---------------------------------------------------------------- performance: lips from phonemes, blinks, head motion
const VIS = { a: 1, 'ɑ': 1, 'æ': .9, 'ʌ': .85, 'ɔ': .8, 'ɛ': .65, e: .6, 'ə': .5, 'ɜ': .55, 'ɚ': .45, 'ɪ': .4, i: .35, o: .6, 'ʊ': .4, u: .35, 'ɐ': .7,
  m: 0, b: 0, p: 0, f: .12, v: .12, w: .25, 'ɹ': .25, l: .3, 'θ': .2, 'ð': .2, j: .25, h: .4 };
let PH = [];   // [{t0,t1,v}] absolute times
function openAt(t) {   // average over ~80 ms so the jaw moves smoothly but lands on the phoneme
  let acc = 0; for (let k = -2; k <= 2; k++) { const tt = t + k * .02 + .02; const p = PH.find(q => tt >= q.t0 && tt < q.t1); acc += p ? p.v : 0; } return acc / 5;
}
const blinkAt = (t, seed) => {   // a blink every 2.6–4.6 s (deterministic), 0.16 s long; slower blinks for emotion
  let b = 0; for (let k = 0; k < 16; k++) { const c = 1.2 + k * 3.4 + hash(k, seed) * 1.8; b = Math.max(b, 1 - clamp(Math.abs(t - c) / .08)); } return ss(b);
};
function figure(n, t, local, look) {
  const T = TEX[n], faces = RIG[n] || []; gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  [['img', T.img], ['dep', T.d], ['hair', T.h]].forEach(([u, tx], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx); gl.uniform1i(U[u], i); });
  const e = energyAt(t), sp = openAt(t);
  gl.uniform1f(U.t, t);
  gl.uniform1f(U.breath, Math.sin(t * Math.PI * 2 / 4.2) * (1 + e * .6));
  gl.uniform1f(U.sway, .7 + e * 1.1);
  gl.uniform2f(U.par, Math.sin(local * .35 + 1) * .7 + Math.sin(t * .17) * .25, Math.sin(local * .27) * .3);
  // body: gentle weight shift; she walks in from the right on look.walk
  let sx = 0, sy = 0, rotB = Math.sin(t * .55 + local) * .006;
  if (look.walk) { const k = seg(t, look.walk[0], look.walk[1]); sx = (1 - ss(k)) * 760; const step = Math.abs(Math.sin(k * Math.PI * 3.5)) * (1 - k); sy = -step * 26; rotB += Math.sin(k * Math.PI * 7) * .015 * (1 - k); }
  gl.uniform2f(U.shift, sx, sy); gl.uniform1f(U.bodyRot, rotB);
  const A = k => [0, 1].map(i => faces[i] ? k(faces[i], i) : 0);
  const v2 = k => [0, 1].flatMap(i => faces[i] ? faces[i][k] : [0, 0]);
  gl.uniform2fv(U.eL, v2('eL')); gl.uniform2fv(U.eR, v2('eR')); gl.uniform2fv(U.mo, v2('m')); gl.uniform2fv(U.hc, v2('hc')); gl.uniform2fv(U.nk, v2('nk'));
  gl.uniform1fv(U.er, A(f => f.er)); gl.uniform1fv(U.mw, A(f => f.mw)); gl.uniform1fv(U.hr, A(f => f.hr));
  const talking = i => look.talk === i;
  gl.uniform1fv(U.open, A((f, i) => talking(i) ? sp * .9 : 0));
  gl.uniform1fv(U.blink, A((f, i) => blinkAt(t, i * 7 + n.length)));
  gl.uniform1fv(U.smile, A((f, i) => look.smile && look.smile[i] ? key(t, look.smile[i]) * (talking(i) ? 1 - sp * .5 : 1) : 0));
  gl.uniform1fv(U.brow, A((f, i) => (look.brow && look.brow[i] ? key(t, look.brow[i]) : 0) + (talking(i) ? sp * .25 : 0)));
  // head: slow tilt + speech nods; in two-shots HIM leans his head toward her, she tilts toward him
  gl.uniform1fv(U.tilt, A((f, i) => (look.tiltBase ? look.tiltBase[i] || 0 : 0) + Math.sin(t * .7 + i * 2) * .018 + (look.lean ? (i === 0 ? -.035 : .03) * ss(seg(local, 0, 3)) : 0) + (talking(i) ? Math.sin(t * 5.3) * sp * .012 : 0)));
  gl.uniform1fv(U.nod, A((f, i) => (talking(i) ? sp * 5 : 0) + Math.sin(t * .9 + i) * 2));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return glc;
}
// ---------------------------------------------------------------- 2D layers
function roomBg(ctx, t, toward, night) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, night ? '#151A2A' : '#2A1A1C'); g.addColorStop(1, night ? '#2A2630' : '#4A2C22'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const e = energyAt(t);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 34; i++) { const x0 = hash(i, 1) * W, y0 = hash(i, 2) * H, k = ss(toward) * .55, x = lerp(x0, W * .5 + (x0 - W * .5) * .55, k) + Math.sin(t * .3 + i) * 20, y = lerp(y0, H * .42 + (y0 - H * .42) * .6, k);
    const r = 30 + hash(i, 3) * 70, a = (.10 + hash(i, 4) * .14) * (.7 + e * .6); const c = night ? (hash(i, 5) > .5 ? '150,180,255' : '255,190,120') : (hash(i, 5) > .5 ? '255,190,120' : '255,140,90');
    const gg = ctx.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `rgba(${c},${a})`); gg.addColorStop(.7, `rgba(${c},${a * .6})`); gg.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = gg; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.restore();
}
function particles(ctx, t, kind, a) {
  const e = energyAt(t), on = onsetAt(t);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  if (kind === 'rain') { ctx.strokeStyle = 'rgba(200,220,255,0.22)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 70; i++) { const x = hash(i, 7) * W, y = (hash(i, 8) * H + t * (500 + hash(i, 9) * 300)) % H; ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 30); } ctx.stroke(); }
  const n = kind === 'gold' ? 60 : kind === 'hearts' ? 26 : kind === 'gather' ? 30 : 0;
  for (let i = 0; i < n; i++) {
    const sp = 30 + hash(i, 1) * 60, x = (hash(i, 2) * W + Math.sin(t * .5 + i) * 40), y = H - ((hash(i, 3) * H + t * sp) % (H + 100)), r = (2 + hash(i, 4) * 5) * (1 + e * 1.2 + on * 2);
    const c = kind === 'gold' ? '255,200,110' : kind === 'hearts' ? '255,170,170' : '255,210,160', al = (.25 + .5 * hash(i, 5)) * (.5 + e);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4); g.addColorStop(0, `rgba(${c},${al})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  }
  ctx.restore();
}
function grade(ctx, t, look) {
  const e = energyAt(t);
  let [r, g, b, k] = look.tint; if (look.warmFrom && t > look.warmFrom) { const w = ss(seg(t, look.warmFrom, look.warmFrom + 2.5)); r = lerp(r, 255, w); g = lerp(g, 170, w); b = lerp(b, 100, w); k = lerp(k, .14, w); }
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${k + e * .08})`; ctx.fillRect(0, 0, W, H); ctx.restore();
  if (look.glow) { const G = look.glow, fl = G.flick ? .85 + .15 * Math.sin(t * 23) * Math.sin(t * 7) : 1; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gg = ctx.createRadialGradient(G.x * W, G.y * H, 0, G.x * W, G.y * H, G.r * W); gg.addColorStop(0, `rgba(${G.col},${.32 * fl})`); gg.addColorStop(1, `rgba(${G.col},0)`); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sx = ((t * 60) % (W * 2)) - W * .5; const sg = ctx.createLinearGradient(sx - 300, 0, sx + 300, H * .3); sg.addColorStop(0, 'rgba(255,220,180,0)'); sg.addColorStop(.5, `rgba(255,220,180,${.06 * e})`); sg.addColorStop(1, 'rgba(255,220,180,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .5, H * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,5,8,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function glint(ctx, t, n) {   // a wet shine in her eyes on the confession
  const f = (RIG[n] || [])[0]; if (!f) return; const a = .35 + .25 * Math.sin(t * 2.1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  [f.eL, f.eR].forEach(([x, y], i) => { const g = ctx.createRadialGradient(x + f.er * .3, y + f.er * .25, 0, x + f.er * .3, y + f.er * .25, f.er * .5); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - f.er, y - f.er, f.er * 2, f.er * 2); });
  ctx.restore();
}
function drawShot(ctx, t, s) {
  const [t0, , n, look] = s, local = t - t0;
  if (look.bg === 'room') roomBg(ctx, t, seg(t, t0, t0 + 5), look.night && !(look.warmFrom && t > look.warmFrom + 1.2));
  ctx.drawImage(figure(n, t, local, look), 0, 0);
  if (look.glint) glint(ctx, t, n);
  particles(ctx, t, look.parts, 1);
  grade(ctx, t, look);
}
// ---------------------------------------------------------------- captions: "ink whisper", word-exact
let V = [], WORDS = {};
export function setup(lines, durs, words = {}, phon = {}) {
  WORDS = words; let end = 0;
  V = lines.map(l => { const d = durs[l.id] ?? l.text.split(/\s+/).length / 2.75; const t = Math.max(l.start, end + .15); end = t + d;
    if (t > l.start + .6) console.warn(`line ${l.id} pushed ${(t - l.start).toFixed(2)} s late`); return { id: l.id, t, dur: d, text: l.text }; });
  PH = []; V.forEach(v => (phon[v.id] || []).forEach(([ph, a, b]) => { if (ph in VIS) PH.push({ t0: v.t + a, t1: v.t + b, v: VIS[ph] }); else if ((ph === 'ː' || ph === 'ˈ' || ph === 'ˌ') && PH.length) PH[PH.length - 1].t1 = v.t + b; }));
}
export function events() { return V.map(v => ({ t: v.t, type: 'vo', id: v.id })); }
export function srtCues() { return V.map((v, i) => ({ t0: v.t, t1: Math.min(V[i + 1] ? V[i + 1].t - .05 : DURATION, v.t + v.dur + .6), text: v.text })); }
function caption(ctx, t) {
  const c = srtCues().map((q, i) => ({ ...q, v: V[i] })).find(q => t >= q.t0 - .1 && t < q.t1 + .4); if (!c) return;
  const out = 1 - seg(t, c.t1, c.t1 + .4), words = c.text.split(/\s+/), WT = WORDS[c.v.id];
  ctx.save(); ctx.font = '500 58px Mincho'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const lines = []; let cur = []; words.forEach(w => { const tryL = [...cur, w].join(' '); if (ctx.measureText(tryL).width > 900 && cur.length) { lines.push(cur); cur = [w]; } else cur.push(w); }); if (cur.length) lines.push(cur);
  const lh = 82, y0 = H * .80 - (lines.length - 1) * lh / 2; let wi = 0;
  lines.forEach((ln, li) => {
    const lw = ctx.measureText(ln.join(' ')).width; let x = W / 2 - lw / 2;
    ln.forEach(w => {
      const tw = WT && WT[wi] ? c.v.t + WT[wi].t0 : c.v.t + wi / words.length * c.v.dur, k = ss(seg(t, tw - .02, tw + .14));
      const now = WT && WT[wi] ? t >= c.v.t + WT[wi].t0 && t < c.v.t + WT[wi].t1 + .05 : false; wi++;
      const ww = ctx.measureText(w + ' ').width;
      if (k > 0) { ctx.save(); ctx.globalAlpha = k * out; ctx.shadowColor = 'rgba(20,6,12,0.9)'; ctx.shadowBlur = 18;
        ctx.fillStyle = now ? '#FFFFFF' : '#F3E3D3'; ctx.fillText(w, x, y0 + li * lh + (1 - k) * 6); ctx.restore(); }
      x += ww;
    });
  });
  ctx.restore();
}
export function render(ctx, t) {
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const act = SHOTS.filter(s => t >= s[0] && t < s[1]);
  act.forEach((s, i) => {
    const a = i === 0 ? 1 : ss(seg(t, s[0], act[0][1]));
    if (i === 0) drawShot(ctx, t, s);
    else { const off = new OffscreenCanvas(W, H), o = off.getContext('2d'); drawShot(o, t, s); ctx.save(); ctx.globalAlpha = a; ctx.drawImage(off, 0, 0); ctx.restore(); }
  });
  const fade = Math.min(ss(seg(t, 0, .8)), 1 - ss(seg(t, DURATION - 1.4, DURATION)));
  if (fade < 1) { ctx.save(); ctx.globalAlpha = 1 - fade; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  caption(ctx, t);
  ctx.save(); ctx.globalAlpha = .35; ctx.font = '600 26px Jost, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.fillText('LOCAL TEST · music not licensed', W - 30, 50); ctx.restore();
}
