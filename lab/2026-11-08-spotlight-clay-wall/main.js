// "The Wall of I'm Fine": spotlight-clay proof shot (original metaphor). 1080x1920, 30 s, one continuous shot.
// Page contract: window.READY, window.render(t), window.DUR, window.EV. Everything is a function of t.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makePerson, POSE, mixPose, walkPose, applyPose } from './rig.js';

const W = 1080, H = 1920, DUR = 30.0;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a)), ss = k => k * k * (3 - 2 * k), eio = k => k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
const eo = k => 1 - (1 - k) ** 3, back = (k, s = 1.7) => 1 + (s + 1) * (k - 1) ** 3 + s * (k - 1) ** 2;
const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- renderer + stage
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1.25); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .85;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x060608); scene.fog = new THREE.Fog(0x060608, 7, 16);
const camera = new THREE.PerspectiveCamera(40, W / H, .1, 60);
const composer = new EffectComposer(renderer); composer.setPixelRatio(1.25); composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .38, .5, .92); composer.addPass(bloom); composer.addPass(new OutputPass());

// glossy floor: a real reflection under a dark, slightly see-through skin
const refl = new Reflector(new THREE.CircleGeometry(14, 64), { textureWidth: W / 2, textureHeight: H / 2, color: 0x6a6a72 });
refl.rotation.x = -Math.PI / 2; scene.add(refl);
const skin = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: .6, transparent: true, opacity: .88 }));
skin.rotation.x = -Math.PI / 2; skin.position.y = .002; skin.receiveShadow = true; scene.add(skin);

// light: one spotlight from above + its visible cone, a faint cold fill
const spot = new THREE.SpotLight(0xfff1dc, 5.5, 0, .34, .75, 0); spot.position.set(0, 7.5, .6); spot.target.position.set(0, 0, 0);
spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.0004; spot.shadow.radius = 4; scene.add(spot, spot.target);
scene.add(new THREE.HemisphereLight(0x8090b0, 0x0a0a0a, .5));
const fill = new THREE.DirectionalLight(0xffe2c8, .35); fill.position.set(1.5, 2.5, 6); scene.add(fill);          // soft front fill so the clay reads
const rim = new THREE.DirectionalLight(0x9fb4ff, .9); rim.position.set(-2, 3, -5); scene.add(rim);                // cold rim from behind
const coneMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { amt: { value: .035 }, col: { value: new THREE.Color(0xfff1dc) } },
  vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying float vY; varying vec3 vN; varying vec3 vV; uniform float amt; uniform vec3 col; void main(){ float f = pow(abs(dot(vN, vV)), 2.2); float h = smoothstep(-3.6, 3.6, vY); gl_FragColor = vec4(col * amt * f * (0.35 + h), 1.); }` });
const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 7.2, 64, 1, true), coneMat); cone.position.set(0, 3.6, .3); scene.add(cone);
// dust in the beam
const DN = 260, dustGeo = new THREE.BufferGeometry(), dpos = new Float32Array(DN * 3); dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xfff1dc, size: .018, transparent: true, opacity: .55, depthWrite: false })); scene.add(dust);

// ---------------------------------------------------------------- the people
const hero = makePerson({ color: 0xf2f2f4, emissive: 0xffffff, glow: .1 }); scene.add(hero);
const FR = [ { home: [-1.15, -.95], face: .9 }, { home: [1.2, -.75], face: -.85 }, { home: [-1.55, .55], face: 1.6 }, { home: [1.5, .45], face: -1.5 } ]
  .map((f, i) => { const P = makePerson({ color: [0x8c8c92, 0x7c7c83, 0x93939a, 0x84848b][i], hair: i === 1 ? 'bun' : null }); scene.add(P); return { ...f, P }; });

// ---------------------------------------------------------------- the wall: 12 courses × 16 bricks on a ring
const RING = .75, NS = 16, NC = 12, BH = .15, brickMat = new THREE.MeshStandardMaterial({ color: 0xb8231d, roughness: .62, emissive: 0x000000 });
const bgeo = new RoundedBoxGeometry(.29, BH - .006, .14, 2, .02);
const B = [];
for (let c = 0; c < NC; c++) for (let j = 0; j < NS; j++) {
  const th = (j + (c % 2) * .5) * Math.PI * 2 / NS, mat = brickMat.clone(); mat.color.offsetHSL((hash(c * 16 + j, 7) - .5) * .02, (hash(c * 16 + j, 8) - .5) * .12, (hash(c * 16 + j, 9) - .5) * .09); const m = new THREE.Mesh(bgeo, mat); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  B.push({ m, c, j, th, x: RING * Math.sin(th), z: RING * Math.cos(th), y: c * BH + BH / 2 });
}
// build order: bricks 0 and 1 are carried by hand; the rest rain down faster and faster
const BUILD = B.map((b, k) => k < 2 ? [4.95, 7.35][k] : 7.6 + 3.3 * ((k - 2) / (B.length - 3)) ** .72);
const PUSHED = [7 * NS, 6 * NS];                                    // the two bricks he pushes out (front, chest height)
const PUSHT = [17.85, 18.55];
const angd = th => { const a = ((th + Math.PI) % (Math.PI * 2)) - Math.PI; return Math.abs(a); };
const keys = B.map((b, k) => PUSHED.includes(k) ? -1 : (NC - 1 - b.c) * .55 + angd(b.th) * 1.25 + hash(k, 3) * .5);
const kmax = Math.max(...keys);
const FALL = B.map((b, k) => PUSHED.includes(k) ? PUSHT[PUSHED.indexOf(k)] : 19.05 + 3.4 * (keys[k] / kmax) ** .8);

const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
// v2: dust puffs where bricks hit the floor (deterministic: a pool of sprites placed from the landing list)
const puffTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(220,210,200,.55)'); g.addColorStop(1, 'rgba(220,210,200,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const PUFFS = Array.from({ length: 70 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
let LANDS = null;
function landings() {                                                   // [time, x, z, size] for every brick that touches the floor
  const L = [[3.54, -.05, .44, 1.3], [5.99, .32, .44, 1.3]];
  B.forEach((b, k) => { if (k >= 2 && b.c === 0) L.push([BUILD[k] + .3, b.x, b.z, .8]); });
  B.forEach((b, k) => { const tf = FALL[k], out = RING + .35 + hash(k, 1) * .9 + b.c * .04; if (k % 2 === 0) L.push([tf + .6, Math.sin(b.th) * out, Math.cos(b.th) * out, .7 + b.c * .04]); });
  return L.sort((a, b) => a[0] - b[0]);
}
function puffs(t) {
  LANDS ||= landings(); let n = 0; PUFFS.forEach(s => s.visible = false);
  for (const [t0, x, z, s] of LANDS) { const u = (t - t0) / .9; if (u < 0 || u > 1 || n >= PUFFS.length) continue;
    const p = PUFFS[n++]; p.visible = true; p.position.set(x, .08 + u * .12, z); p.scale.setScalar((.25 + u * .55) * s); p.material.opacity = (1 - u) ** 1.5 * .8; }
}
const beamMat = coneMat.clone(); beamMat.uniforms = THREE.UniformsUtils.clone(coneMat.uniforms);
const beam = new THREE.Mesh(new THREE.ConeGeometry(.55, 3.2, 32, 1, true), beamMat); beam.rotation.x = -Math.PI / 2; beam.position.set(0, 1.1, .75 + 1.6); scene.add(beam);
function brickAt(k, t, handsMid) {
  const b = B[k], m = b.m; m.visible = true; m.scale.set(1, 1, 1);
  const tb = BUILD[k], tf = FALL[k];
  if (k < 2) {                                                     // dropped in front of him, picked up, carried, placed
    const td = [3.2, 5.65][k], land = td + .34, pick = [4.2, 6.45][k];
    if (t < td) { m.visible = false; return; }
    if (t < pick) { const u = seg(t, td, land); const y = lerp(3.2, .075, u * u) + (t > land ? Math.abs(Math.sin((t - land) * 18)) * .05 * Math.exp(-(t - land) * 9) : 0);
      m.position.set(k ? .32 : -.05, y, .44); m.rotation.set(0, k ? .4 : -.2, 0); return; }
    if (t < tb) { m.position.copy(handsMid); m.position.y -= .02; m.rotation.set(0, lerp(k ? .4 : -.2, b.th, seg(t, tb - .45, tb)), 0);
      if (t > tb - .45) { const u = eio(seg(t, tb - .45, tb)); m.position.lerp(tmp2.set(b.x, b.y, b.z), u); } }
    else if (t < tf) { m.position.set(b.x, b.y, b.z); m.rotation.set(0, b.th, 0); }
  } else if (t < tb) { m.visible = false; return; }
  else if (t < tf) {
    const u = seg(t, tb, tb + .3), land = tb + .3; m.position.set(b.x, lerp(b.y + 2.6, b.y, u * u), b.z); m.rotation.set(0, b.th, 0);
    if (t > land) { const s = Math.exp(-(t - land) * 14) * Math.sin((t - land) * 40) * .06; m.scale.set(1 + s, 1 - s, 1 + s); }
  }
  if (t >= tf) {                                                   // it falls OUTWARD, tumbling, and lies on the floor
    const u = clamp((t - tf) / .6), out = RING + .35 + hash(k, 1) * .9 + b.c * .04, ox = Math.sin(b.th), oz = Math.cos(b.th);
    const r = lerp(RING, out, eo(u)), y = lerp(b.y, .075, u * u) + Math.sin(Math.PI * u) * (.12 + b.c * .01);
    const roll = Math.round(1 + hash(k, 2) * 2) * Math.PI / 2;
    m.position.set(ox * r, y, oz * r); m.rotation.set(0, b.th + hash(k, 4) * .6 * u, 0); m.rotateX(-roll * eo(u));
    if (u >= 1) { const s = Math.exp(-(t - tf - .6) * 12) * Math.sin((t - tf - .6) * 36) * .05; m.scale.set(1 + s, 1 - s, 1 + s); }
  }
}

// ---------------------------------------------------------------- performance (keyframed poses with weight)
// track: [time, pose, ease]; the move INTO each key uses that key's ease (back = overshoot and settle)
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const [t0, p0] = keys[i - 1], [t1, p1, e] = keys[i], k = seg(t, t0, t1);
    return mixPose(p0, p1, e === 'back' ? back(k, 1.4) : e === 'heavy' ? eo(k) ** 1.4 : eio(k));
  }
  return keys[keys.length - 1][1];
}
const P = POSE, wth = (p, o) => ({ ...p, ...o });
const HERO = [
  [0, P.stand], [2.35, wth(P.stand, { headY: -.55 })], [2.75, wth(P.thumb, { headY: -.5 }), 'back'], [3.2, wth(P.stand, { headY: -.2 })],
  [3.6, wth(P.nod, { headP: .45 })], [3.95, wth(P.stand, { drop: -.02, lean: -.06 })], [4.3, P.crouch, 'heavy'], [4.75, P.carry, 'heavy'], [4.95, P.place, 'back'], [5.35, P.stand],
  [5.55, wth(P.stand, { headY: .55 })], [5.9, wth(P.thumb, { headY: .5 }), 'back'], [6.2, wth(P.nod, { headP: .45 })], [6.5, P.crouch, 'heavy'], [7.05, P.carry, 'heavy'], [7.35, wth(P.place, { headY: .25 }), 'back'], [7.75, P.stand],
  [9.2, wth(P.nod, { headP: .55, lean: .1 })], [10.1, wth(P.nod, { headP: .7, lean: .18, lL: [.2, .45], lR: [.15, .4] })], [11.0, P.slump, 'heavy'], [13.6, wth(P.slump, { headP: .9 })],
  [14.35, P.look, 'back'], [15.6, wth(P.look, { headP: -.6 })], [16.05, P.rise, 'heavy'], [16.55, wth(P.stand, { lean: .1 }), 'back'],
  [17.35, wth(P.push, { lean: .25, aL: [1.4, .9, .05], aR: [1.4, .9, .05] })], [17.8, P.push, 'heavy'], [18.1, wth(P.push, { lean: .1, aL: [1.2, .7, .1], aR: [1.2, .7, .1] })], [18.5, P.push, 'heavy'],
  [19.0, wth(P.stand, { headP: -.2 })], [22.6, wth(P.stand, { headP: -.1, aL: [.1, .2, .25], aR: [.1, .2, .25] })], [23.8, wth(P.stand, { headY: -.55, headP: .1 })],
  [24.4, wth(P.lift, { headY: -.5 }), 'back'], [26.5, wth(P.lift, { headY: -.3, headP: -.35 })], [30, P.lift],
];
const heroRoot = t => { const k = eio(seg(t, 16.6, 17.3)); return [0, lerp(0, .1, k) - eio(seg(t, 18.8, 19.6)) * .1]; };   // stays inside the ring: feet must not poke through the wall
function walkTo(P0, P1, t0, t1, t, speed = 1) { const k = seg(t, t0, t1), d = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]); return { x: lerp(P0[0], P1[0], k), z: lerp(P0[1], P1[1], k), ph: k * d / .55, walking: t > t0 && t < t1 }; }
function friend(i, t) {
  const F = FR[i], f = F.P, faceHero = (x, z) => Math.atan2(-x, -z);
  let x = F.home[0], z = F.home[1], yaw = F.face, pose = P.stand, blink = (t * 1.1 + i * .37) % 3.7 < .1;
  if (i === 0) {
    const go = walkTo(F.home, [-.5, .2], 1.0, 2.3, t), back_ = walkTo([-.5, .2], F.home, 3.35, 4.6, t), knock = walkTo(F.home, [-.62, 1.05], 12.6, 13.7, t), inn = walkTo([-.62, 1.05], [-.42, .42], 22.5, 23.9, t);
    if (t < 2.3) { ({ x, z } = go); yaw = go.walking ? Math.atan2(-.5 - F.home[0], .2 - F.home[1]) : yaw; pose = go.walking ? walkPose(go.ph) : P.stand; }
    else if (t < 3.35) { x = -.5; z = .2; yaw = Math.PI / 2; pose = track([[2.3, P.stand], [2.55, P.ask, 'back'], [3.0, P.ask], [3.3, P.stand]], t); }
    else if (t < 4.6) { ({ x, z } = back_); yaw = Math.atan2(F.home[0] + .5, F.home[1] - .2); pose = walkPose(back_.ph); }
    else if (t < 10.3) { yaw = F.face; pose = track([[4.6, P.stand], [9.6, P.stand], [10.3, P.sitAway, 'heavy']], t); }
    else if (t < 12.6) { pose = track([[10.3, P.sitAway], [12.0, P.sitAway], [12.6, P.rise, 'heavy']], t); yaw = F.face + .6; }
    else if (t < 13.7) { ({ x, z } = knock); yaw = Math.atan2(-.62 - F.home[0], 1.05 - F.home[1]); pose = walkPose(knock.ph); }
    else if (t < 22.5) { x = -.62; z = 1.05; yaw = faceHero(x, z); const kn = t >= 13.85 && t < 14.7 ? Math.abs(Math.sin((t - 13.85) * Math.PI / .28)) : 0;
      pose = t < 19.2 ? wth(P.reach, { aR: [1.45 - kn * .25, .15 + kn * .5, .05], headP: .05 }) : track([[19.2, P.reach], [20.0, wth(P.stand, { headP: -.1 })]], t); }
    else if (t < 23.9) { ({ x, z } = inn); yaw = faceHero(x, z) ; pose = walkPose(inn.ph, .8); }
    else { x = -.42; z = .42; yaw = Math.atan2(.42, -.42) ; pose = track([[23.9, P.stand], [24.4, P.hold, 'back'], [30, P.hold]], t); }
  } else {
    const ask = i === 1 ? track([[5.0, P.stand], [5.3, P.ask, 'back'], [5.8, P.ask], [6.1, P.stand]], t) : P.stand;
    if (t < 9.6 + i * .2) pose = t > 5 && t < 6.1 ? ask : wth(P.stand, { headY: Math.sin(t * .7 + i) * .25 });
    else if (t < 22.8 + i * .25) { pose = track([[9.6 + i * .2, P.stand], [10.4 + i * .2, P.sitAway, 'heavy'], [21.6 + i * .3, P.sitAway], [22.8 + i * .25, P.rise, 'heavy']], t); yaw = F.face + (t > 10 ? Math.PI * .75 * Math.sign(F.face) : 0) * (1 - seg(t, 21.6, 22.8)); }
    else { const w = walkTo(F.home, [F.home[0] * .55, F.home[1] * .55 + .2], 23.2 + i * .2, 24.6 + i * .2, t); x = w.x; z = w.z; yaw = faceHero(x, z); pose = w.walking ? walkPose(w.ph, .8) : wth(P.stand, { headP: -.05 }); }
  }
  pose = { ...pose, mood: t > 24 ? 'smile' : (i === 0 && t > 13.6 && t < 22.5) ? 'worried' : (t > 10.4 && t < 22.8) ? 'sad' : 'neutral' };
  f.position.set(x, 0, z); f.rotation.y = yaw; applyPose(f, pose, blink);
}

// ---------------------------------------------------------------- camera (one continuous move) and light
const CK = [[0, [0, 1.95, 7.2], [0, .95, 0]], [7.5, [0, 2.15, 6.7], [0, .9, 0]], [11.0, [0, 5.6, 3.3], [0, .15, .1]], [15.3, [.35, 5.8, 3.0], [0, .15, .1]],
  [18.0, [0, 5.0, 3.9], [0, .45, .2]], [21.5, [0, 2.6, 6.0], [0, .8, 0]], [25.0, [0, 1.8, 5.0], [0, 1.0, 0]], [30, [0, 1.65, 4.5], [0, 1.05, 0]]];
function cam(t) {
  let i = 1; while (i < CK.length - 1 && t > CK[i][0]) i++;
  const [t0, p0, l0] = CK[i - 1], [t1, p1, l1] = CK[i], k = ss(seg(t, t0, t1));
  camera.position.set(...p0.map((v, j) => lerp(v, p1[j], k))); camera.lookAt(...l0.map((v, j) => lerp(v, l1[j], k)));
}

// ---------------------------------------------------------------- captions v2: typed in sync with the voice (word onsets from voices/words.json)
const ov = document.getElementById('ov'), g = ov.getContext('2d');
export const VO = { l1: .6, l2: 3.3, l3: 7.9, l4: 11.3, l5: 15.3, hero: 17.0, l6: 19.4, l7: 24.8 };
let WORDS = {}, LINES = {};
function captions(t) {
  g.clearRect(0, 0, W, H);
  for (const [id, t0] of Object.entries(VO)) {
    const ws = WORDS[id]; if (!ws) continue;
    const nxt = Math.min(...Object.values(VO).filter(v => v > t0), DUR), end = Math.min(t0 + ws[ws.length - 1].t1 + .9, nxt - .45); if (t < t0 - .05 || t > end + .4) continue;
    const a = 1 - ss(seg(t, end, end + .4)), hero = id === 'hero';
    g.font = hero ? '700 64px Mono' : '700 50px Mono'; g.letterSpacing = hero ? '4px' : '3px'; g.textBaseline = 'middle';
    // wrap the whole line once (so words don't jump), then reveal letter by letter as each word is spoken
    const words = ws.map(w => hero ? w.w.toUpperCase() : w.w.toUpperCase()), lines = [[]]; let lw = 0; const sp = g.measureText(' ').width;
    words.forEach((w, i) => { const ww = g.measureText(w).width; if (lw + ww > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(i); lw += ww + sp; });
    const y0 = 1500 - (lines.length - 1) * 36;
    lines.forEach((ln, li) => {
      const full = ln.reduce((s, i) => s + g.measureText(words[i]).width, 0) + sp * (ln.length - 1); let x = W / 2 - full / 2;
      ln.forEach(i => {
        const w = words[i], ww = g.measureText(w).width, on = t0 + ws[i].t0 - .03, dur = Math.max(.08, ws[i].t1 - ws[i].t0) * .7;
        const n = Math.floor(clamp((t - on) / dur) * w.length), now = t >= on && t < t0 + ws[i].t1 + .1;
        if (n > 0) { g.globalAlpha = a * (now ? 1 : .82); g.fillStyle = hero ? '#ff6a5f' : now ? '#fff7ea' : '#d8d3cc'; g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 14;
          g.textAlign = 'left'; g.fillText(w.slice(0, n), x, y0 + li * 72); }
        x += ww + sp;
      });
    });
  }
  g.globalAlpha = 1; g.shadowBlur = 0;
  const fade = Math.max(1 - seg(t, 0, .6), seg(t, 29.2, 30));
  if (fade > 0) { g.globalAlpha = ss(fade); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
}

// ---------------------------------------------------------------- render
function render(t) {
  // hero
  const hp = track(HERO, t), [hx, hz] = heroRoot(t);
  hero.position.set(hx, 0, hz); hero.rotation.y = 0;
  const breath = Math.sin(t * 2.1) * .012; hp.lean += breath;
  hp.mood = t < 2.6 ? 'neutral' : t < 3.3 ? 'smile' : t < 5.7 ? 'neutral' : t < 6.4 ? 'smile' : t < 9 ? 'neutral' : t < 14.3 ? 'sad' : t < 15.6 ? 'worried' : t < 18.9 ? 'strain' : t < 23.8 ? 'relief' : 'smile';
  applyPose(hero, hp, (t * 1.3) % 4.1 < .1);
  hero.updateMatrixWorld(true);
  const hands = hero.userData.A.map(a => a.hand.getWorldPosition(new THREE.Vector3())), mid = hands[0].clone().add(hands[1]).multiplyScalar(.5);
  FR.forEach((_, i) => friend(i, t));
  B.forEach((_, k) => brickAt(k, t, mid));
  // light breathes with the story: narrow and cold inside the wall, wide and warm at the end
  const narrow = ss(seg(t, 9.5, 11.5)) * (1 - ss(seg(t, 18.5, 23)));
  spot.angle = lerp(.34, .2, narrow) + ss(seg(t, 23, 28)) * .08; spot.intensity = lerp(5.5, 7, narrow);
  spot.color.setHSL(lerp(.09, .07, seg(t, 23, 28)), lerp(.5, .8, seg(t, 23, 28)), .92);
  cone.scale.set(spot.angle / .34, 1, spot.angle / .34); coneMat.uniforms.amt.value = .035 + narrow * .015; coneMat.uniforms.col.value.copy(spot.color);
  for (let i = 0; i < DN; i++) { const r = Math.sqrt(hash(i, 1)) * 1.6 * (spot.angle / .34), a = hash(i, 2) * 6.283 + t * .05 * (hash(i, 5) - .5);
    dpos[i * 3] = Math.cos(a) * r * (.4 + (hash(i, 3) * 6) / 7.2); dpos[i * 3 + 1] = (hash(i, 3) * 6 + t * .06 * (hash(i, 4) + .3)) % 6; dpos[i * 3 + 2] = Math.sin(a) * r * .8 + .3; }
  dustGeo.attributes.position.needsUpdate = true;
  puffs(t);
  const bk = ss(seg(t, 17.85, 18.3)) * (1 - ss(seg(t, 20.5, 22.5))); beam.visible = bk > 0; beamMat.uniforms.amt.value = .04 * bk; beamMat.uniforms.col.value.copy(spot.color);
  cam(t);
  camera.position.x += Math.sin(t * .7) * .015; camera.position.y += Math.sin(t * .9 + 1) * .01;     // a breathing, hand-held camera
  composer.render();
  captions(t);
}

// ---------------------------------------------------------------- sound events (the same times drive the picture)
function events() {
  const E = []; const ev = (t, type, o = {}) => E.push({ t: +t.toFixed(3), type, ...o });
  Object.entries(VO).forEach(([id, t]) => ev(t, 'vo', { id }));
  ev(0, 'room', { dur: DUR });
  for (let s = 0; s < 3; s++) ev(1.15 + s * .42, 'step', { n: s }); ev(2.55, 'cloth', {}); for (let s = 0; s < 3; s++) ev(3.5 + s * .4, 'step', { n: s + 3 });
  ev(3.54, 'brick_drop', {}); ev(5.99, 'brick_drop', {}); ev(4.25, 'strain', {}); ev(6.55, 'strain', {}); ev(4.95, 'brick_place', {}); ev(7.35, 'brick_place', {});
  ev(5.3, 'cloth', {});
  BUILD.forEach((tb, k) => { if (k >= 2 && k % 3 === 0) ev(tb + .3, 'brick_land', { n: k, gain: .35 + .65 * (k / B.length) }); });
  ev(7.6, 'rumble', { dur: 3.6 });
  ev(10.9, 'slump', {}); [13.85, 14.13, 14.41].forEach((x, i) => ev(x, 'knock', { n: i }));
  ev(16.0, 'cloth', {}); for (let s = 0; s < 2; s++) ev(16.7 + s * .35, 'step', { n: s + 6 });
  PUSHT.forEach((x, i) => { ev(x - .45, 'strain', {}); ev(x, 'grind', {}); ev(x + .55, 'brick_drop', { gain: .8 }); });
  FALL.forEach((tf, k) => { if (!PUSHED.includes(k) && k % 3 === 1) ev(tf + .55, 'brick_land', { n: k, gain: .55 }); });
  ev(19.0, 'collapse', { dur: 4.0 });
  for (let s = 0; s < 3; s++) ev(22.7 + s * .45, 'step', { n: s + 8 }); ev(24.35, 'cloth', {});
  return E.sort((a, b) => a.t - b.t);
}
window.render = render; window.DUR = DUR; window.EV = events();
await document.fonts.load('700 50px Mono', 'A');
try { WORDS = await (await fetch('voices/words.json')).json(); } catch (e) {}
render(0);
window.READY = true;
