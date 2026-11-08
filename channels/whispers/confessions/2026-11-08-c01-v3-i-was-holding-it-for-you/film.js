// Whispers C01 v3 "I Was Holding It for You" (LOCAL TEST). 9:16 1080x1920, 30 fps, 37.9 s.
// AUDIO = the reel track AS IS (it already contains the male narration + music): no TTS, no remix -> no double voice.
// PICTURE = Vivek's 12-shot storyboard (ChatGPT sheets, vivek-cast) cut to the narration's real phrase onsets (measured from the
// reel's own typed captions + the speech-band energy of its audio). Frames are shown EXACTLY as drawn (Vivek: no face/eye motion,
// keep the storyboard static); shots join with short dissolves; memories (05-08) are graded paler; captions typed on the voice.
export const W = 1080, H = 1920, DURATION = 37.9;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, seg = (t, a, b) => clamp((t - a) / (b - a)), ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const hash = (x, y = 0) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
const key = (t, K) => { if (!K) return 0; if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t < K[i][0]) return lerp(K[i - 1][1], K[i][1], ss(seg(t, K[i - 1][0], K[i][0]))); return K[K.length - 1][1]; };
let IMG = {}, gl, glc, PROG, TEX = {}, U = {};
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
      vec2 r = (p - e) / vec2(er[i]*1.25, er[i]*.85);
      float inside = 1. - smoothstep(.78, 1.0, length(r));
      float lidY = -1. + 2.*blink[i];                                             // the upper lid comes down
      float lidC = lidY + .22*blink[i]*(1. - r.x*r.x);                            // ... as a soft downward curve
      float cov = inside * (1. - smoothstep(lidC - .1, lidC + .02, r.y)) * smoothstep(.02, .15, blink[i]);
      if (cov > lid) { lid = cov; skinAt = e + vec2(r.x*er[i]*.5, er[i]*1.55); } // skin sampled from the clean cheek below
      lash = max(lash, inside * (1. - smoothstep(.05, .16, abs(r.y - lidC))) * (1. - smoothstep(.55, .95, abs(r.x))) * smoothstep(.25, .6, blink[i]));
      float g = exp(-pow(distance(p, e + vec2(0., -er[i]*1.9)) / (er[i]*1.4), 2.));
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
  col.rgb = mix(col.rgb, vec3(.16,.09,.08), lash*.8);
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
// ---------------------------------------------------------------- face landmarks per shot (frame px; placed by hand on the storyboard)
const F = (eL, eR, er, m, mw, hc, hr, nk, closed = false) => ({ eL, eR, er, m, mw, hc, hr, nk: nk || [hc[0], hc[1] + hr * .95], closed });
const RIG = {
  S01: [F([308, 712], [425, 705], 22, [375, 817], 80, [283, 667], 230, [300, 917]), F([758, 775], [867, 750], 22, [833, 875], 70, [850, 750], 210, [900, 950])],
  S02: [null, F([487, 637], [662, 597], 30, [603, 783], 110, [600, 617], 330, [633, 933])],
  S03: [F([440, 570], [648, 533], 30, [590, 725], 120, [550, 583], 330, [533, 933])],
  S04: [F([342, 558], [458, 553], 22, [400, 653], 70, [317, 533], 230, [300, 750]), F([683, 600], [775, 575], 22, [733, 700], 70, [750, 583], 220, [783, 783])],
  S05: [null, F([612, 442], [712, 425], 18, [678, 517], 55, [650, 433], 170, [667, 633])],
  S06: [F([257, 725], [373, 700], 22, [340, 858], 65, [267, 700], 220, [283, 950]), F([748, 500], [832, 492], 18, [823, 575], 55, [800, 483], 180, [850, 700])],
  S07: [null, F([500, 683], [733, 600], 32, [683, 842], 120, [667, 700], 380, [750, 1033])],
  S08: [F([462, 575], [678, 533], 30, [653, 725], 120, [600, 600], 340, [600, 983])],
  S09: [F([257, 563], [398, 542], 20, [357, 653], 60, [283, 533], 200, [317, 750]), F([715, 600], [798, 580], 18, [790, 683], 60, [783, 583], 180, [817, 783])],
  S10: [F([433, 592], [575, 575], 20, [500, 675], 60, [450, 567], 210, null, true), F([683, 783], [783, 750], 18, [775, 858], 55, [750, 750], 180, null, true)],
  S11: [null, F([445, 608], [653, 558], 32, [637, 742], 120, [633, 583], 360, [700, 917])],
  S12: [F([432, 433], [523, 417], 18, [440, 542], 55, [433, 417], 200, null, true), F([607, 600], [723, 587], 18, [690, 683], 55, [667, 600], 170, null, true)],
};
// ---------------------------------------------------------------- the narration (reel audio), phrase by phrase: [text, voice start, voice end]
const PHRASES = [
  ['You stole my heart,', .05, 1.25], ["but I'll let you keep it,", 2.45, 3.35], ['because some things are worth losing', 4.45, 6.2],
  ["if it's to the right person.", 7.2, 8.45], ['From the moment you walked in,', 10.0, 11.4], ['my world rearranged itself around you,', 12.3, 14.6],
  ['quietly,', 15.5, 16.1], ['completely.', 16.95, 17.4], ["I didn't choose this,", 18.8, 19.9], ['it chose me.', 21.0, 21.6],
  ['Every ordinary day with you', 23.2, 24.6], ['feels like something out of a story', 26.0, 27.6], ['I never want to end,', 28.0, 29.1],
  ['so keep my heart.', 30.5, 31.4], ['I was only ever holding it', 32.7, 33.7], ['for you…', 35.45, 35.9]];
// ---------------------------------------------------------------- shots: [t0, t1, asset, performance]. M = face 0 (him), F = face 1 (her)
// perf keys: smile/brow/tilt/nod = per-face keyframes [[t, v], ...]; eyesShut = per-face keyframes 0..1 (slow, held closes); mem = memory grade
const SHOTS = [
  [0, 2.4, 'S01', { smile: [[[0, .15], [1.3, .35]], [[0, .1], [1.0, .3]]], brow: [[[0, .35], [1.6, .15]]], tilt: [[[0, 0], [2.4, -.02]], [[0, 0], [2.4, .025]]] }],
  [2.4, 4.4, 'S02', { smile: [null, [[2.4, 0], [3.3, .3]]], brow: [null, [[2.4, .1], [3.0, .35], [4.4, .2]]], nod: [null, [[2.4, 6], [3.1, -4], [4.4, -2]]] }],
  [4.4, 7.15, 'S03', { smile: [[[4.4, 0], [6.2, .35]]], brow: [[[4.4, .4], [5.6, .1]]], breathDeep: 1, nod: [[[4.4, 0], [5.4, 5], [6.5, 1]]] }],
  [7.15, 10.2, 'S04', { smile: [[[7.15, .1], [8.6, .35]], [[7.15, .15], [8.4, .4]]], tilt: [[[7.15, 0], [9.0, -.035]], [[7.15, 0], [9.0, .035]]], memIn: [9.6, 10.2] }],
  [9.95, 12.45, 'S05', { mem: 1, smile: [null, [[9.95, .05], [11.2, .35]]], tilt: [null, [[9.95, .04], [11.0, 0]]], sway: 1 }],
  [12.25, 15.65, 'S06', { mem: 1, brow: [[[12.25, 0], [12.9, .8], [14.6, .4]], [[12.25, .2]]], nod: [[[12.25, 6], [13.0, -6], [15.6, -4]], null], smile: [[[12.25, 0], [14.2, .25]], [[12.25, .2], [14, .35]]] }],
  [15.45, 18.95, 'S07', { mem: 1, smile: [null, [[15.45, .1], [16.4, .45]]], nod: [null, [[15.45, 0], [15.95, 14], [16.5, 14], [17.1, 3]]] }],
  [18.75, 23.35, 'S08', { mem: 1, nod: [[[18.75, 0], [20.1, 0], [20.6, 7], [21.4, 2]]], smile: [[[18.75, 0], [21.2, 0], [22.6, .4]]], breathDeep: 1, memOut: [22.9, 23.35] }],
  [23.15, 28.1, 'S09', { smile: [[[23.15, .2], [25, .45]], [[23.15, .3], [24.6, .5]]], laugh: [24.0, 25.4], tilt: [[[23.15, 0], [26, -.02]], [[23.15, 0], [26, .03]]] }],
  [27.9, 30.65, 'S10', { tilt: [[[27.9, 0], [30.5, -.02]], [[27.9, 0], [29.5, -.05]]], smile: [[[27.9, .1], [30, .3]], [[27.9, .1], [30, .3]]], slow: 1 }],
  [30.45, 32.85, 'S11', { smile: [null, [[30.45, .15], [31.6, .45]]], nod: [null, [[30.45, 0], [31.45, 0], [31.7, 9], [31.95, 0], [32.2, 6], [32.45, 0]]], brow: [null, [[30.45, .3], [32, .1]]] }],
  [32.65, 37.9, 'S12', { smile: [[[32.65, .1], [35.6, .4]], [[32.65, .1], [35.6, .45]]], tilt: [[[32.65, 0], [35.5, .03]], [[32.65, 0], [35.5, -.03]]], slow: 1 }],
];
const blinkAt = (t, seed) => { let b = 0; for (let k = 0; k < 14; k++) { const c = .9 + k * 3.1 + hash(k, seed) * 1.7; b = Math.max(b, 1 - clamp(Math.abs(t - c) / .085)); } return ss(b); };
export async function load() {
  const get = async src => { const r = await fetch(src); return await createImageBitmap(await r.blob(), { premultiplyAlpha: 'none' }); };
  initGL();
  for (const n of [...new Set(SHOTS.map(s => s[2]))]) { IMG[n] = { img: await get(`assets/${n}.png`), d: await get(`assets/${n}_d.png`), h: await get(`assets/${n}_h.png`) }; TEX[n] = { img: tex(IMG[n].img), d: tex(IMG[n].d), h: tex(IMG[n].h) }; }
}
function figure(n, t, local, P) {
  const T = TEX[n], faces = RIG[n] || []; gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  [['img', T.img], ['dep', T.d], ['hair', T.h]].forEach(([u, tx], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx); gl.uniform1i(U[u], i); });
  const per = P.slow ? 5.2 : 4.2, deep = P.breathDeep ? 1.5 : 1;
  gl.uniform1f(U.t, t);
  gl.uniform1f(U.breath, Math.sin(t * Math.PI * 2 / per) * deep + (P.laugh && t > P.laugh[0] && t < P.laugh[1] ? Math.sin(t * 22) * .8 * (1 - seg(t, P.laugh[0], P.laugh[1])) : 0));
  gl.uniform1f(U.sway, P.sway ? .9 : .45);
  gl.uniform2f(U.par, Math.sin(local * .3 + 1) * .45, Math.sin(local * .23) * .2);
  gl.uniform2f(U.shift, 0, 0); gl.uniform1f(U.bodyRot, Math.sin(t * .5 + local) * .002);
  const A = k => [0, 1].map(i => faces[i] ? k(faces[i], i) : 0), v2 = k => [0, 1].flatMap(i => faces[i] ? faces[i][k] : [0, 0]);
  gl.uniform2fv(U.eL, v2('eL')); gl.uniform2fv(U.eR, v2('eR')); gl.uniform2fv(U.mo, v2('m')); gl.uniform2fv(U.hc, v2('hc')); gl.uniform2fv(U.nk, v2('nk'));
  gl.uniform1fv(U.er, A(f => f.er)); gl.uniform1fv(U.mw, A(f => f.mw)); gl.uniform1fv(U.hr, A(f => f.hr)); gl.uniform1fv(U.open, [0, 0]);
  gl.uniform1fv(U.blink, A((f, i) => (f.closed || i === 0) ? 0 :   // HIM: no blinks (the warp would bend his glasses rims)
    Math.max(blinkAt(t, i * 5 + n.charCodeAt(2)), P.shutAt && P.shutAt[i] ? key(t, P.shutAt[i]) : 0)));
  gl.uniform1fv(U.smile, A((f, i) => P.smile && P.smile[i] ? key(t, P.smile[i]) : 0));
  gl.uniform1fv(U.brow, A((f, i) => P.brow && P.brow[i] ? key(t, P.brow[i]) : 0));
  gl.uniform1fv(U.tilt, A((f, i) => (P.tilt && P.tilt[i] ? key(t, P.tilt[i]) : 0) + Math.sin(t * .6 + i * 2) * .006));
  gl.uniform1fv(U.nod, A((f, i) => (P.nod && P.nod[i] ? key(t, P.nod[i]) : 0) + Math.sin(t * .8 + i) * 1.2));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return glc;
}
// ---------------------------------------------------------------- light, grade
function light(ctx, t, n, P) {
  if (P.mem || P.memIn || P.memOut) {                                             // memories: paler, less amber (fades in/out at the edges)
    let k = P.mem ? 1 : 0; if (P.memIn) k = seg(t, P.memIn[0], P.memIn[1]) * .0; if (P.memOut) k = 1 - seg(t, P.memOut[0], P.memOut[1]);
    if (k > 0) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${.32 * k})`; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(190,205,230,${.35 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  const v = ctx.createRadialGradient(W / 2, H * .45, H * .32, W / 2, H * .5, H * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,8,4,0.45)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function drawShot(ctx, t, s) { const [t0, , n, P] = s; ctx.drawImage(IMG[n].img, 0, 0, W, H); light(ctx, t, n, P); }   // v3 (Vivek): the storyboard frames exactly as drawn, no deformation
// ---------------------------------------------------------------- captions: whisper serif, lower band, typed word by word ON the voice
export function setup() {}
export function events() { return []; }
export function srtCues() { return PHRASES.map(([txt, a], i) => ({ t0: a, t1: PHRASES[i + 1] ? Math.min(PHRASES[i + 1][1] - .1, a + 4.5) : DURATION - .4, text: txt })); }
function caption(ctx, t) {
  const cues = srtCues(), i = cues.findIndex(c => t >= c.t0 - .05 && t < c.t1 + .35); if (i < 0) return;
  const c = cues[i], [txt, a, b] = PHRASES[i], words = txt.split(' '), out = 1 - seg(t, c.t1, c.t1 + .35);
  const cl = words.map(w => w.length + 1), tot = cl.reduce((x, y) => x + y, 0); let acc = 0;
  const times = words.map((w, j) => { const tw = a + (b - a) * acc / tot; acc += cl[j]; return tw; });
  ctx.save(); ctx.font = '500 60px Mincho'; ctx.textBaseline = 'alphabetic';
  const lines = []; let cur = []; words.forEach((w, j) => { if (ctx.measureText([...cur.map(q => words[q]), w].join(' ')).width > 880 && cur.length) { lines.push(cur); cur = []; } cur.push(j); }); if (cur.length) lines.push(cur);
  const lh = 84, y0 = 1650 - (lines.length - 1) * lh / 2, sp = ctx.measureText(' ').width;
  lines.forEach((ln, li) => { const lw = ln.reduce((s, j) => s + ctx.measureText(words[j]).width + sp, -sp); let x = W / 2 - lw / 2;
    ln.forEach(j => { const k = ss(seg(t, times[j] - .03, times[j] + .22)), ww = ctx.measureText(words[j]).width;
      if (k > 0) { ctx.save(); ctx.globalAlpha = k * out; ctx.shadowColor = 'rgba(25,10,5,0.95)'; ctx.shadowBlur = 22; ctx.fillStyle = '#FFF6EC'; ctx.fillText(words[j], x, y0 + li * lh + (1 - k) * 6); ctx.restore(); }
      x += ww + sp; }); });
  ctx.restore();
}
export function render(ctx, t) {
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const act = SHOTS.filter(s => t >= s[0] && t < s[1]);
  act.forEach((s, i) => { if (i === 0) return drawShot(ctx, t, s);
    const off = new OffscreenCanvas(W, H), o = off.getContext('2d'); drawShot(o, t, s); ctx.save(); ctx.globalAlpha = ss(seg(t, s[0], act[0][1])); ctx.drawImage(off, 0, 0); ctx.restore(); });
  const fin = ss(seg(t, DURATION - .6, DURATION)), st = 1 - ss(seg(t, 0, .4));
  if (st > 0) { ctx.fillStyle = `rgba(0,0,0,${st})`; ctx.fillRect(0, 0, W, H); }
  if (fin > 0) { ctx.fillStyle = `rgba(246,236,220,${fin})`; ctx.fillRect(0, 0, W, H); }                 // fade to warm cream (guide)
  caption(ctx, t);
  ctx.save(); ctx.globalAlpha = .35; ctx.font = '600 26px Jost, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.fillText('LOCAL TEST · reel audio, not licensed', W - 30, 50); ctx.restore();
}
