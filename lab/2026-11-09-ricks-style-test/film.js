// LAB: Ricks-Clips-style test (study: references/videos/STUDY-2026-11-09-stickman-styles.md §2). Our own story + cast:
// "The bell that warned a kingdom". Rich warm 3D worlds (castle at night, bell tower, throne hall), white-head chibis where COSTUME = identity,
// one-word white captions mid-low, constant push. 9:16 1080x1920, 30 fps, 12 s.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeGuy, pose, std, part } from './toon.js';

export const W = 1080, H = 1920, DURATION = 12.0;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const hash = (a, b = 0) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
const glow = (c, k = 2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k });
const M = (geo, mat, x = 0, y = 0, z = 0, sh = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; return m; };
function tex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t; }
let R, comp, rp, cam, bloom; const S = {}, C = {}, X = {};

// ---- costumes on the shared chibi rig
function crown(P) { const h = P.userData.head, g = new THREE.Group(); g.position.y = .4; h.add(g); const gold = std(0xf2c230, { metalness: .6, roughness: .3, emissive: 0x4a3300 });
  g.add(part(new THREE.CylinderGeometry(.3, .32, .14, 24, 1, true), gold, .012)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, s = part(new THREE.ConeGeometry(.06, .16, 6), gold, .01); s.position.set(Math.cos(a) * .3, .14, Math.sin(a) * .3); g.add(s);
    const j = M(new THREE.SphereGeometry(.03, 8, 6), glow(i % 2 ? 0xd2283c : 0x2a7ae0, 1.2), Math.cos(a) * .315, 0, Math.sin(a) * .315); g.add(j); } return g; }
function cape(P, color) { const c = part(new THREE.ConeGeometry(.5, 1.05, 24, 1, true), std(color, { side: THREE.DoubleSide, roughness: .8 }), .015); c.position.set(0, .3, -.04); P.userData.torso.add(c);
  const fur = part(new THREE.TorusGeometry(.27, .07, 8, 24), std(0xf4efe6, { roughness: 1 }), .012); fur.rotation.x = Math.PI / 2; fur.position.y = .78; P.userData.torso.add(fur); }
function wingHat(P) { const h = P.userData.head, k = std(0x16161c), g = new THREE.Group(); g.position.y = .32; h.add(g);
  g.add(part(new THREE.CylinderGeometry(.34, .36, .22, 20), k, .012)); const top = part(new THREE.CylinderGeometry(.18, .2, .2, 16), k, .01); top.position.set(0, .15, -.08); g.add(top);
  [-1, 1].forEach(s => { const w = part(new THREE.BoxGeometry(.5, .05, .1), k, .01); w.position.set(s * .5, .08, -.12); g.add(w); }); }
function helmet(P) { const h = P.userData.head, st = std(0xb4bcc8, { metalness: .35, roughness: .4 }); const d = part(new THREE.SphereGeometry(.45, 24, 14, 0, Math.PI * 2, 0, Math.PI * .45), st, .012); d.position.y = .02; h.add(d);
  const sp = part(new THREE.ConeGeometry(.05, .25, 8), std(0xc23a2a), .01); sp.position.y = .5; h.add(sp); const rim = part(new THREE.TorusGeometry(.43, .03, 6, 24), st, .008); rim.rotation.x = Math.PI / 2; rim.position.y = .08; h.add(rim); }

export function init(canvas) {
  R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setSize(W, H); R.setPixelRatio(1);
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  cam = new THREE.PerspectiveCamera(40, W / H, .05, 800); comp = new EffectComposer(R); rp = new RenderPass(null, cam); comp.addPass(rp);
  bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .5, .5, .85); comp.addPass(bloom); comp.addPass(new OutputPass());
  C.king = makeGuy({ hair: 'short', hairCol: 0x3a2618, body: 0xb3222f, legs: 0x3a1a1a, hands: 0xf2f0ea }); crown(C.king); cape(C.king, 0x8a1424);
  C.off = makeGuy({ hair: 'none', body: 0x2f5aa8, legs: 0x1c1c26, hands: 0xf2f0ea }); wingHat(C.off);
  C.guard = makeGuy({ hair: 'none', body: 0x6b5a46, legs: 0x3a3028, hands: 0x2a221c }); helmet(C.guard);
  C.guard2 = makeGuy({ hair: 'none', body: 0x6b5a46, legs: 0x3a3028, hands: 0x2a221c }); helmet(C.guard2);
  buildCastle(); buildHall();
}
// ================= castle at night + bell tower (one scene)
function buildCastle() {
  const s = new THREE.Scene(); S.castle = s;
  s.background = tex(64, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1230'); gr.addColorStop(.6, '#22305e'); gr.addColorStop(1, '#4a4a7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; for (let i = 0; i < 90; i++) g.fillRect(hash(i) * w, hash(i, 2) * h * .6, 1, 1); });
  s.fog = new THREE.Fog(0x2a3466, 30, 140);
  s.add(new THREE.HemisphereLight(0x8fa2ff, 0x2a2440, 1.3));
  const moon = new THREE.DirectionalLight(0xc8d8ff, 2.6); moon.position.set(-20, 30, -10); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, far: 90 }); s.add(moon);
  const mo = M(new THREE.SphereGeometry(5, 32, 16), new THREE.MeshBasicMaterial({ color: 0xf6f2dc, fog: false }), -30, 42, -110, false); s.add(mo);
  const stone = tex(512, 512, (g, w, h) => { g.fillStyle = '#7a7486'; g.fillRect(0, 0, w, h); for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) { g.fillStyle = `hsl(255,6%,${40 + hash(r, c) * 14}%)`; g.fillRect(c * 64 + (r % 2) * 32 + 2, r * 32 + 2, 60, 28); } }, [6, 3]);
  const wallM = new THREE.MeshStandardMaterial({ map: stone, roughness: .95 });
  const grd = M(new THREE.PlaneGeometry(300, 300), std(0x2a3a2c, { roughness: 1 }), 0, 0, 0, false); grd.rotation.x = -Math.PI / 2; s.add(grd);
  s.add(M(new THREE.BoxGeometry(40, 9, 3), wallM, 0, 4.5, -6));
  for (let i = -19; i <= 19; i += 1.4) s.add(M(new THREE.BoxGeometry(.8, 1, 3), wallM, i, 9.5, -6));
  const tower = (x, z, h, r) => { s.add(M(new THREE.CylinderGeometry(r, r * 1.08, h, 24), wallM, x, h / 2, z)); s.add(M(new THREE.ConeGeometry(r * 1.25, r * 2, 24), std(0x2a3a7a, { roughness: .7 }), x, h + r, z));
    for (let k = 0; k < 3; k++) { const wnd = M(new THREE.PlaneGeometry(.6, 1.0), glow(0xffb85a, 2.2), x + Math.sin(k) * 0, 3 + k * 2.8, z + r + .01, false); s.add(wnd); } };
  tower(-12, -5, 15, 2.5); tower(12, -5, 15, 2.5); tower(-24, -12, 20, 3); tower(22, -14, 22, 3.2);
  // keep + bell tower in the middle (z -10)
  s.add(M(new THREE.BoxGeometry(10, 16, 6), wallM, 0, 8, -12)); for (let i = 0; i < 9; i++) s.add(M(new THREE.PlaneGeometry(.7, 1.1), glow(0xffb85a, 2), -3.6 + (i % 3) * 3.6, 6 + Math.floor(i / 3) * 3, -8.99, false));
  const bt = new THREE.Group(); bt.position.set(0, 16, -12); s.add(bt); X.bt = bt;
  bt.add(M(new THREE.BoxGeometry(4.4, .6, 4.4), wallM, 0, .3, 0)); [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]].forEach(([x, z]) => bt.add(M(new THREE.BoxGeometry(.6, 4.2, .6), wallM, x, 2.6, z)));
  bt.add(M(new THREE.ConeGeometry(3.6, 3.2, 4), std(0x2a3a7a), 0, 6.3, 0)).rotation.y = Math.PI / 4;
  bt.add(M(new THREE.BoxGeometry(4.4, .5, 4.4), wallM, 0, 4.7, 0));
  const bl = new THREE.PointLight(0xffb060, 40, 12, 2); bl.position.set(2.5, 2.2, 2.5); bt.add(bl);
  const yoke = M(new THREE.BoxGeometry(3.4, .25, .3), std(0x5a3a22), 0, 4.1, 0); bt.add(yoke);
  const bell = new THREE.Group(); bell.position.set(0, 4.0, 0); bt.add(bell); X.bell = bell;
  const prof = [[0, 0], [.35, .02], [.6, -.25], [.72, -.9], [.95, -1.45], [1.05, -1.6], [.9, -1.6]].map(([x, y]) => new THREE.Vector2(x, y));
  const bronze = std(0xd09a38, { metalness: .35, roughness: .4, emissive: 0x4a2a08 });
  bell.add(part(new THREE.LatheGeometry(prof, 32), bronze, .02)); X.bellM = bronze;
  const clap = M(new THREE.SphereGeometry(.18, 12, 10), std(0x3a2a1a), 0, -1.35, 0); bell.add(clap);
  // torches on the wall
  X.fl = [];
  for (let i = -3; i <= 3; i++) { const p = new THREE.PointLight(0xffa040, 6, 6, 2); p.position.set(i * 4.2, 8.6, -4.2); s.add(p); s.add(M(new THREE.ConeGeometry(.16, .4, 8), glow(0xffa040, 4), i * 4.2, 8.6, -4.3, false)); X.fl.push(p); }
  C.guard.position.set(1.2, 16.6, -10.3); C.guard.rotation.y = .2; s.add(C.guard);
  C.guard2.position.set(-5, 9, -4.6); C.guard2.rotation.y = 0; s.add(C.guard2);
  // dark trees + road in front
  const tr = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 3, 7), std(0x152a24), 80), m4 = new THREE.Matrix4(); for (let i = 0; i < 80; i++) { m4.makeTranslation((hash(i) - .5) * 90, 1.5, 6 + hash(i, 3) * 30); if (Math.abs((hash(i) - .5) * 90) < 6) m4.makeTranslation(30, 1.5, 40); tr.setMatrixAt(i, m4); } tr.castShadow = true; s.add(tr);
  const rd = M(new THREE.PlaneGeometry(6, 60), std(0x5a4a3a, { roughness: 1 }), 0, .01, 25, false); rd.rotation.x = -Math.PI / 2; s.add(rd);
}
// ================= throne hall
function buildHall() {
  const s = new THREE.Scene(); S.hall = s; s.background = new THREE.Color(0x1a0d0a); s.fog = new THREE.Fog(0x2a120c, 18, 50);
  s.add(new THREE.HemisphereLight(0xffc89a, 0x2a1008, .8));
  const sun = new THREE.DirectionalLight(0xffc07a, 2.2); sun.position.set(-6, 9, 4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); s.add(sun);
  const fl = tex(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#d9c8a8' : '#8a6a4a'; g.fillRect(i * 64, j * 64, 64, 64); } }, [8, 8]);
  const floor = M(new THREE.PlaneGeometry(30, 40), new THREE.MeshStandardMaterial({ map: fl, roughness: .35, metalness: .1 }), 0, 0, 0, false); floor.rotation.x = -Math.PI / 2; s.add(floor);
  const carpet = M(new THREE.PlaneGeometry(2.4, 30), std(0xa31a26, { roughness: 1 }), 0, .01, 4, false); carpet.rotation.x = -Math.PI / 2; s.add(carpet);
  [-1.25, 1.25].forEach(x => { const b = M(new THREE.PlaneGeometry(.12, 30), std(0xe8b830), x, .015, 4, false); b.rotation.x = -Math.PI / 2; s.add(b); });
  const wallM = std(0xb8885a, { roughness: .9 }); s.add(M(new THREE.BoxGeometry(30, 14, .5), wallM, 0, 7, -8));
  [-15, 15].forEach(x => s.add(M(new THREE.BoxGeometry(.5, 14, 40), wallM, x, 7, 4)));
  const gold = std(0xe8b830, { metalness: .6, roughness: .3, emissive: 0x3a2400 });
  for (let z = -6; z <= 14; z += 4) [-4.5, 4.5].forEach(x => { s.add(M(new THREE.CylinderGeometry(.45, .5, 9, 20), std(0xefe2c8), x, 4.5, z)); s.add(M(new THREE.BoxGeometry(1.2, .4, 1.2), gold, x, 9.1, z)); s.add(M(new THREE.BoxGeometry(1.2, .3, 1.2), gold, x, .15, z));
    const ban = M(new THREE.PlaneGeometry(1.0, 3.2), std(0xa31a26, { side: THREE.DoubleSide }), x + (x < 0 ? .52 : -.52), 6.5, z); ban.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; s.add(ban); });
  // tall arched windows with sunset light on the back wall
  for (let i = -2; i <= 2; i++) { const w = M(new THREE.PlaneGeometry(1.6, 5), glow(0xffb070, 1.6), i * 3.4, 7, -7.7, false); s.add(w); }
  // dais + throne
  s.add(M(new THREE.BoxGeometry(6, .5, 3.5), std(0x7a5a3a), 0, .25, -5.6)); s.add(M(new THREE.BoxGeometry(4.4, .5, 2.6), std(0x8a6a48), 0, .75, -5.8));
  const th = new THREE.Group(); th.position.set(0, 1.0, -6.1); s.add(th);
  th.add(M(new THREE.BoxGeometry(1.5, .6, 1.2), gold, 0, .3, 0)); th.add(M(new THREE.BoxGeometry(1.5, 2.6, .25), gold, 0, 1.6, -.5)); th.add(M(new THREE.BoxGeometry(1.2, 2.0, .05), std(0xa31a26), 0, 1.5, -.36));
  th.add(M(new THREE.SphereGeometry(.2, 12, 10), gold, -.7, 3.0, -.5)); th.add(M(new THREE.SphereGeometry(.2, 12, 10), gold, .7, 3.0, -.5));
  th.add(M(new THREE.BoxGeometry(.2, .5, 1.2), gold, -.75, .8, 0)); th.add(M(new THREE.BoxGeometry(.2, .5, 1.2), gold, .75, .8, 0));
  // chandelier
  const ch = new THREE.Group(); ch.position.set(0, 9, -1); s.add(ch); X.ch = ch; ch.add(M(new THREE.TorusGeometry(1.2, .06, 8, 32), gold).rotateX(Math.PI / 2));
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ch.add(M(new THREE.SphereGeometry(.09, 8, 6), glow(0xffd080, 4), Math.cos(a) * 1.2, .15, Math.sin(a) * 1.2, false)); }
  const cl = new THREE.PointLight(0xffc070, 18, 14, 2); cl.position.set(0, 8.5, -1); s.add(cl);
  C.king.position.set(0, 1.05, -6.0); s.add(C.king);
  C.off.position.set(-.6, 0, -2.4); C.off.rotation.y = Math.PI * .92; s.add(C.off);
  X.dust = [...Array(40)].map((_, i) => { const d = M(new THREE.SphereGeometry(.03, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffe0b0, transparent: true, opacity: .6 }), 0, 0, 0, false); s.add(d); return d; });
}
// ================= shots
const SH = [
  { t0: 0, t1: 3.2, set: 'castle', k: [[0, [0, 4, 27], [0, 10, -10], 44], [3.2, [0, 9, 15], [0, 16, -10], 44]] },
  { t0: 3.2, t1: 6.4, set: 'castle', k: [[3.2, [5.2, 19.6, -1.8], [.3, 19.3, -11.5], 40], [6.4, [4.0, 19.3, -3.6], [.4, 19.2, -11.3], 40]] },
  { t0: 6.4, t1: 9.6, set: 'hall', k: [[6.4, [0, 3.2, 14], [0, 2.2, -6], 40], [9.6, [0, 2.6, 2.0], [0, 2.2, -6], 40]] },
  { t0: 9.6, t1: 12, set: 'hall', k: [[9.6, [.4, 2.9, -2.6], [0, 2.75, -6], 38], [12, [.3, 2.85, -3.3], [0, 2.75, -6], 38]] },
];
const V3 = (a) => new THREE.Vector3(...a);
function camAt(sh, t) { const [a, b] = sh.k, k = eio(seg(t, a[0], b[0])); return { p: V3(a[1]).lerp(V3(b[1]), k), l: V3(a[2]).lerp(V3(b[2]), k), fov: lerp(a[3], b[3], k) }; }
const WORDS = [[0, 'This'], [.3, 'kingdom'], [.8, 'had'], [1.0, 'a bell'], [1.5, 'that'], [1.75, 'rang'], [2.1, 'all'], [2.3, 'by itself'], [3.3, 'whenever'], [3.85, 'an enemy'], [4.5, 'came'], [4.8, 'close.'],
  [5.6, 'One night,'], [6.1, 'it rang.'], [6.9, 'The king'], [7.5, 'just'], [7.8, 'laughed.'], [8.9, '"Bells'], [9.2, "don't"], [9.45, 'lie?"'], [10.1, 'Big'], [10.4, 'mistake.']];
export const events = () => WORDS.map(([t, w]) => ({ t, type: 'word', w }));
function animate(t) {
  X.fl.forEach((p, i) => p.intensity = 5 + Math.sin(t * 13 + i * 3) * 1.2 + Math.sin(t * 7.3 + i) * .8);
  const ring = t > 3.4 ? Math.sin((t - 3.4) * 5.5) * .45 * Math.min(1, (t - 3.4) * 2) : 0; X.bell.rotation.z = ring;
  pose(C.guard, { t, expr: t < 4.4 ? 'neutral' : 'shock', armL: t > 4.4 ? [2.6, .5] : [.3, .2], armR: t > 4.4 ? [2.6, .5] : [.3, .2], turn: t < 4.4 ? -.3 : .5, look: [.3, -.3] });
  pose(C.guard2, { t, expr: 'neutral', armL: [.2, .2], armR: [.2, .2] });
  const sh = t > 10.0 ? Math.sin(t * 40) * .05 * (1 - seg(t, 11.3, 12)) : 0;
  pose(C.king, { t, sit: true, expr: t < 7.6 ? 'smug' : t < 10.1 ? 'happy' : 'shock', armL: t > 7.7 && t < 10 ? [1.4 + Math.sin(t * 14) * .2, .3] : [.9, .2], armR: [.9, .2], nod: t > 7.7 && t < 10 ? -.15 + Math.sin(t * 14) * .08 : 0, tilt: sh * 3 });
  pose(C.off, { t, expr: t < 10 ? 'annoyed' : 'shock', armL: [.6, .1], armR: [.6, .1], lean: t < 8 ? .35 : .15, nod: .2 });
  C.king.position.x = sh; X.ch.rotation.z = sh * 2;
  X.dust.forEach((d, i) => { d.position.set((hash(i) - .5) * 8, ((hash(i, 2) * 8 - t * .3 * (1 + (t > 10 ? 6 : 0))) % 8 + 8) % 8, -6 + hash(i, 4) * 10); });
}
export function render(g, t) {
  const sh = SH.find(s => t >= s.t0 && t < s.t1) || SH[SH.length - 1];
  animate(t); const c = camAt(sh, t); const shake = t > 10 ? (1 - seg(t, 11.3, 12)) * .04 : 0;
  cam.position.copy(c.p).add(new THREE.Vector3(Math.sin(t * 50) * shake, Math.cos(t * 43) * shake, 0)); cam.lookAt(c.l); cam.fov = c.fov; cam.updateProjectionMatrix();
  rp.scene = S[sh.set]; bloom.strength = sh.set === 'castle' ? .7 : .45; comp.render();
  g.drawImage(R.domElement, 0, 0);
  // warm film grade: vignette
  const gr = g.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .7); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,4,0,.6)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  let w = null; for (const [a, s] of WORDS) if (t >= a) w = s;
  if (w) { g.font = '700 60px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = 'rgba(0,0,0,.9)'; g.strokeText(w, W / 2, H * .66); g.fillStyle = '#fff'; g.fillText(w, W / 2, H * .66); }
  g.font = '600 22px Poppins'; g.fillStyle = 'rgba(255,255,255,.35)'; g.textAlign = 'right'; g.fillText('LAB TEST', W - 30, 40);
}
export const dbg = () => ({});
