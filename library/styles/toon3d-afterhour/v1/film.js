// LAB v2: shot-for-shot replica of the Afterhour Theory short's first 24 s (references/videos/afterhour-theory/znWzWYHoLOg.mp4),
// matched against 4 fps frame sheets: same sets, palette, camera paths, cut points, caption timing.
// Our cast + invented brands only (KAI, NovaMind, Halcyon, TITAN). 1080x1920, 30 fps.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeGuy, pose, std, part, decal } from './toon.js';

export const W = 1080, H = 1920, DURATION = 24.0;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }, eout = k => 1 - Math.pow(1 - clamp(k), 3);
const ss = k => { k = clamp(k); return k * k * (3 - 2 * k); };
const hash = (a, b = 0) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const glow = (c, k = 2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: .4 });
const flat = c => new THREE.MeshBasicMaterial({ color: c });
const M = (geo, mat, x = 0, y = 0, z = 0, sh = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; return m; };
function tex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
function sign(w, h, draw, k = 1) { const t = tex(Math.round(w * 256), Math.round(h * 256), draw); return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: k > 1 ? false : true, color: new THREE.Color(k, k, k) })); }

let R, comp, rp, cam, cv, ctx;
const S = {}, C = {}, X = {};

export function init(canvas) {
  cv = canvas; ctx = cv.getContext('2d');
  R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setSize(W, H); R.setPixelRatio(1);
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  cam = new THREE.PerspectiveCamera(40, W / H, .03, 600);
  comp = new EffectComposer(R); rp = new RenderPass(null, cam); comp.addPass(rp);
  X.bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), .4, .4, .96); comp.addPass(X.bloom); comp.addPass(new OutputPass());
  C.hero = makeGuy({ hair: 'ridge', hairCol: 0x7a4426, body: 0x7d5440, legs: 0x7a4a2c, badge: 'K' });
  C.heroK = makeGuy({ hair: 'ridge', hairCol: 0x7a4426, body: 0x1d1d24, legs: 0x1d1d24, hands: 0x101014, badge: 'K' });
  C.rivA = makeGuy({ hair: 'curly', hairCol: 0x17171c, body: 0xa9bfd8, legs: 0x22222a, hands: 0x101014, spec: 'shades' });
  C.rivB = makeGuy({ hair: 'short', hairCol: 0x1d1a1a, body: 0x2c4f9e, legs: 0x22222a, hands: 0x101014, spec: 'glasses' });
  C.rivB2 = makeGuy({ hair: 'short', hairCol: 0x2a2018, body: 0x1d1d24, legs: 0x22222a, hands: 0x101014 });
  buildHub(); buildMoney(); buildStadium(); buildDC();
}

// =============================================================== HUB: navy command room, pink dusk windows, globe on a ring platform
function buildHub() {
  const s = new THREE.Scene(); S.hub = s;
  s.background = skyTex(); s.fog = new THREE.Fog(0xe29aa8, 40, 120);
  s.add(new THREE.HemisphereLight(0x8090ff, 0x1a1440, .9));
  const key = new THREE.DirectionalLight(0xffd9de, 1.6); key.position.set(3, 8, -6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 }); key.shadow.bias = -.0005; s.add(key);
  const fill = new THREE.DirectionalLight(0xfff0e6, 1.5); fill.position.set(3, 4, 9); s.add(fill);
  const cy = new THREE.PointLight(0x4ff0ff, 8, 7, 2); cy.position.set(-1.3, 2.2, 0); s.add(cy);
  // floor: navy tiles + darker checker patches
  const fl = tex(1024, 1024, (g, w, h) => { g.fillStyle = '#272a55'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = hash(i, j) > .7 ? '#1d1f44' : hash(i, j) > .4 ? '#2b2e5c' : '#25285a'; g.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); } g.strokeStyle = '#3a3e74'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); } }, [3, 3]);
  const floor = M(new THREE.PlaneGeometry(16, 13), new THREE.MeshStandardMaterial({ map: fl, roughness: .3, metalness: .2 }), 0, 0, -1); floor.rotation.x = -Math.PI / 2; s.add(floor);
  const out = M(new THREE.PlaneGeometry(80, 60), std(0x2b2c3c), 0, -.02, 20); out.rotation.x = -Math.PI / 2; s.add(out);
  const frame = std(0x232646, { roughness: .45 }), dark = std(0x151733);
  // back wall: tall windows (open: the sky texture shows through)
  for (let i = -4; i <= 4; i++) s.add(M(new THREE.BoxGeometry(.16, 5.2, .2), frame, i * 1.75, 2.6, -7.5));
  s.add(M(new THREE.BoxGeometry(16, .5, .3), frame, 0, .25, -7.5)); s.add(M(new THREE.BoxGeometry(16, .35, .3), frame, 0, 3.4, -7.5));
  // side walls
  [-8, 8].forEach(x => s.add(M(new THREE.BoxGeometry(.3, 5.4, 13), dark, x, 2.7, -1)));
  // ceiling + white diagonal light bars + cyan neon trim
  s.add(M(new THREE.BoxGeometry(16.4, .4, 13.2), std(0x12142c), 0, 5.4, -1));
  for (let i = 0; i < 6; i++) { const b = M(new THREE.BoxGeometry(.1, .05, 3.6), glow(0xffffff, 2.4), -5 + i * 2.2, 5.17, -1.5 + (i % 2) * 2); b.rotation.y = .75; s.add(b); }
  const neon = glow(0x34e6ff, 3);
  s.add(M(new THREE.BoxGeometry(16.4, .07, .07), neon, 0, 5.18, 5.5)); s.add(M(new THREE.BoxGeometry(16.4, .07, .07), neon, 0, 5.18, -7.3));
  s.add(M(new THREE.BoxGeometry(16.6, .08, .08), neon, 0, 5.62, 5.62));      // outer roof edge (seen from outside)
  s.add(M(new THREE.BoxGeometry(.07, .07, 12.8), neon, -7.82, 5.18, -1)); s.add(M(new THREE.BoxGeometry(.07, .07, 12.8), neon, 7.82, 5.18, -1));
  // FRONT glass wall at z = 5.5: mullions + transom + faint glass
  for (let i = -4; i <= 4; i++) s.add(M(new THREE.BoxGeometry(.13, 5.2, .13), frame, i * 1.75 + .875, 2.6, 5.5));
  s.add(M(new THREE.BoxGeometry(16.4, .22, .16), frame, 0, 4.9, 5.5)); s.add(M(new THREE.BoxGeometry(16.4, .28, .16), frame, 0, .14, 5.5));
  const glass = M(new THREE.PlaneGeometry(16, 5.2), new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: .07, roughness: .05, metalness: .5, depthWrite: false }), 0, 2.6, 5.5); s.add(glass);
  for (let i = 0; i < 6; i++) { const st = M(new THREE.PlaneGeometry(.05, 1.6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .22, depthWrite: false }), -6 + i * 2.5, 3.1, 5.52); st.rotation.z = .6; s.add(st); }
  // left wall: server racks with round lights; right corner: a dark console column
  for (let i = 0; i < 4; i++) { const r = M(new THREE.BoxGeometry(.6, 3, 1.1), std(0x1b1d3b), -7.5, 1.5, -5.6 + i * 1.2); s.add(r);
    for (let k = 0; k < 5; k++) s.add(M(new THREE.CircleGeometry(.07, 14), glow(k % 2 ? 0x3fd6ff : 0x6a6f9a, .6), -7.19, .6 + k * .5, -5.6 + i * 1.2).rotateY(Math.PI / 2)); }
  s.add(M(new THREE.BoxGeometry(1.1, 2.6, .9), std(0x1a1c36), 5.2, 1.3, 3.5, true));
  s.add(M(new THREE.BoxGeometry(.08, 1.9, .08), glow(0x34e6ff, 2), 4.62, 1.3, 3.96));
  // master plan board (back-left)
  const board = sign(2.6, 1.7, (g, w, h) => { g.fillStyle = '#0d0f24'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c23a'; g.lineWidth = 16; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f2e7b0'; g.font = '800 54px Poppins'; g.textAlign = 'center'; g.fillText('THE MASTER PLAN', w / 2, 90);
    const tiles = [['K', '#2a2d36'], ['⚡', '#e8c23a'], ['▲', '#d8d8de'], ['◎', '#3b82f6']]; tiles.forEach(([tx, c], i) => { const x = 70 + i * 140, y = 150; g.fillStyle = '#1e7a3a'; g.fillRect(x, y, 110, 110); g.fillStyle = c; g.fillRect(x + 12, y + 12, 86, 86); g.fillStyle = '#fff'; g.font = '800 60px Poppins'; g.fillText(tx, x + 55, y + 78); });
    g.strokeStyle = '#3fd6ff'; g.lineWidth = 6; g.beginPath(); g.moveTo(70, 330); g.lineTo(600, 330); g.stroke(); }, 1.1);
  board.position.set(-4.2, 2.7, -7.25); s.add(board);
  const board2 = sign(2.0, 1.0, (g, w, h) => { g.fillStyle = '#0d0f24'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c23a'; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#e8c23a'; g.font = '800 120px Poppins'; g.fillText('⚡', 50, 170); g.font = '700 40px Poppins'; g.fillStyle = '#ddd'; g.fillText('VOLTA ENERGY', 190, 150); }, 1.1);
  board2.position.set(-1.6, 3.6, -7.25); s.add(board2);
  // outside: pink sky dome is the background; rocket + launch tower behind the building
  const tower = new THREE.Group(); tower.position.set(1.6, 0, -18); s.add(tower);
  const tm = std(0x55556a, { roughness: .6 });
  [[-.7, -.7], [.7, -.7], [-.7, .7], [.7, .7]].forEach(([x, z]) => tower.add(M(new THREE.BoxGeometry(.18, 15, .18), tm, x, 7.5, z)));
  for (let y = 0; y < 15; y += 1.1) { [[0, .7, 0], [0, -.7, 0]].forEach(([x, z]) => { const b = M(new THREE.BoxGeometry(1.6, .1, .1), tm, 0, y, z); tower.add(b); const d = M(new THREE.BoxGeometry(2.0, .08, .08), tm, 0, y + .55, z); d.rotation.z = (y % 2.2 < 1.1 ? 1 : -1) * .6; tower.add(d); }); }
  const rk = new THREE.Group(); rk.position.set(3.2, 0, -18); s.add(rk);
  rk.add(M(new THREE.CylinderGeometry(.8, .8, 12, 24), std(0xf1f1f4, { roughness: .4 }), 0, 6, 0)); rk.add(M(new THREE.ConeGeometry(.8, 2.4, 24), std(0xf1f1f4), 0, 13.2, 0));
  rk.add(M(new THREE.CylinderGeometry(.82, .82, .5, 24), std(0x2a2a33), 0, 9.6, 0));
  // globe on its platform
  const G = new THREE.Group(); G.position.set(-1.3, 0, -1.3); s.add(G); X.G = G;
  G.add(M(new THREE.CylinderGeometry(3.0, 3.0, .04, 64), std(0x1b1d40, { roughness: .3 }), 0, .02, 0));
  const ringY = new THREE.Mesh(new THREE.TorusGeometry(2.7, .03, 8, 120), glow(0xf4c430, 2.5)); ringY.rotation.x = Math.PI / 2; ringY.position.y = .05; G.add(ringY);
  const ringC = new THREE.Mesh(new THREE.TorusGeometry(1.95, .025, 8, 120), glow(0x34e6ff, 2.2)); ringC.rotation.x = Math.PI / 2; ringC.position.y = .05; G.add(ringC);
  G.add(M(new THREE.CylinderGeometry(1.0, 1.15, .78, 48), std(0x161836, { roughness: .35 }), 0, .39, 0, true));
  // race ring (the mini track that circles the globe base)
  const trk = tex(1024, 64, (g, w, h) => { g.fillStyle = '#1b1c26'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8e8f0'; for (let i = 0; i < 40; i++) g.fillRect(i * 26, 30, 12, 4); g.fillStyle = '#34e6ff'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5); });
  const ring = M(new THREE.RingGeometry(1.2, 1.75, 96, 1), new THREE.MeshStandardMaterial({ map: trk, roughness: .5, emissive: 0x111111 }), 0, .8, 0); ring.rotation.x = -Math.PI / 2; G.add(ring);
  fixRingUV(ring.geometry, 1.2, 1.75);
  G.add(M(new THREE.CylinderGeometry(1.76, 1.76, .06, 96, 1, true), glow(0x34e6ff, 1.6), 0, .78, 0));
  const gate = new THREE.Group(); gate.position.set(0, .8, 1.48); G.add(gate); const gy = glow(0xf4d02a, 1.6);
  gate.add(M(new THREE.BoxGeometry(.04, .42, .04), gy, -.3, .21, 0)); gate.add(M(new THREE.BoxGeometry(.04, .42, .04), gy, .3, .21, 0)); gate.add(M(new THREE.BoxGeometry(.66, .05, .05), gy, 0, .42, 0));
  X.minis = [0xe8e8f0, 0x22232c, 0xe06a2c, 0xe8e8f0].map((c, i) => { const k = makeKart(c, 0xffffff); k.scale.setScalar(.12); G.add(k); return k; });
  // the globe: dark ocean grid + glowing cyan continents
  const gl = tex(2048, 1024, (g, w, h) => { g.fillStyle = '#0f3f78'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7ff3f0'; g.strokeStyle = '#ffffff'; g.lineWidth = 8; const blob = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h)); g.closePath(); g.fill(); g.stroke(); };
    blob([[.12, .2], [.2, .15], [.3, .18], [.33, .3], [.28, .42], [.24, .47], [.27, .55], [.3, .62], [.32, .8], [.29, .88], [.26, .75], [.22, .6], [.18, .5], [.14, .4], [.1, .3]]);
    blob([[.45, .2], [.55, .16], [.62, .22], [.6, .35], [.56, .42], [.6, .5], [.58, .7], [.53, .8], [.49, .66], [.46, .5], [.44, .38], [.47, .3]]);
    blob([[.64, .18], [.8, .14], [.92, .22], [.9, .34], [.82, .42], [.74, .4], [.68, .3]]); blob([[.82, .62], [.9, .6], [.92, .7], [.85, .74]]);
    g.strokeStyle = 'rgba(120,230,255,.75)'; g.lineWidth = 3; for (let i = 1; i < 18; i++) { g.beginPath(); g.moveTo(i * w / 18, 0); g.lineTo(i * w / 18, h); g.stroke(); } for (let i = 1; i < 9; i++) { g.beginPath(); g.moveTo(0, i * h / 9); g.lineTo(w, i * h / 9); g.stroke(); } });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 48), new THREE.MeshBasicMaterial({ map: gl, color: 0xd8e4ff, transparent: true, opacity: .97 }));
  globe.position.y = 1.92; G.add(globe); X.globe = globe;
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.12, 24, 16), new THREE.MeshBasicMaterial({ color: 0x7fe9ff, wireframe: true, transparent: true, opacity: .25 })); shell.position.y = 1.92; G.add(shell);
  const orb1 = new THREE.Mesh(new THREE.TorusGeometry(1.45, .022, 8, 140), glow(0xf4c430, 2.6)); orb1.position.y = 1.92; orb1.rotation.set(1.35, .25, 0); G.add(orb1); X.orb1 = orb1;
  const orb2 = new THREE.Mesh(new THREE.TorusGeometry(1.3, .016, 8, 140), glow(0x34e6ff, 2.2)); orb2.position.y = 1.92; orb2.rotation.set(1.75, -.35, 0); G.add(orb2); X.orb2 = orb2;
  // the KAI cube that lands on the globe at 16.4 s
  const cube = part(new THREE.BoxGeometry(.2, .16, .08), std(0x3a3d46, { roughness: .4 }), .008); const d = decal('K', null, '#ffffff', .13); d.position.z = .042; cube.add(d);
  const dir = V(.38, -.18, .91).normalize(); cube.position.copy(dir.clone().multiplyScalar(1.07)); cube.lookAt(dir.clone().multiplyScalar(3)); globe.add(cube); X.cube = cube;
  // the hero, puppet rig, falling bills
  C.hero.position.set(.55, 0, 0); C.hero.rotation.y = -.28; s.add(C.hero);
  X.cross = new THREE.Group(); const wood = std(0x8a5a33);
  X.cross.add(part(new THREE.BoxGeometry(.9, .045, .045), wood, .01)); X.cross.add(part(new THREE.BoxGeometry(.045, .045, .5), wood, .01)); s.add(X.cross);
  X.pups = [[0xf3e3e3, '▲', '#d64545'], [0xf2c21a, '◎', '#222'], [0x2a2d36, 'K', '#fff'], [0x3b8cf0, '✦', '#fff']].map(([c, ic, fc]) => {
    const p = new THREE.Group(); const body = part(new THREE.BoxGeometry(.2, .26, .14), std(c, { roughness: .5 }), .012); p.add(body);
    const h = part(new THREE.SphereGeometry(.07, 16, 12), std(0xf3f1ec), .01); h.position.y = .2; p.add(h);
    const dc = decal(ic, null, fc, .15); dc.position.z = .072; p.add(dc);
    const str = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, 1, 4), flat(0xf0f0f0)); p.userData.str = str; s.add(str); s.add(p); return p; });
  const billT = tex(128, 64, (g, w, h) => { g.fillStyle = '#7fd38a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3f8f4c'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#3f8f4c'; g.beginPath(); g.arc(w / 2, h / 2, 14, 0, 7); g.fill(); });
  const billM = new THREE.MeshStandardMaterial({ map: billT, side: THREE.DoubleSide, emissive: 0x2a6a33, emissiveIntensity: .4 });
  X.bills = [...Array(46)].map((_, i) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(.26, .13), billM); s.add(b); return b; });
}
function fixRingUV(geo, r0, r1) { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), r = Math.hypot(x, y), a = Math.atan2(y, x); uv.setXY(i, (a / (Math.PI * 2) + .5) * 6, (r - r0) / (r1 - r0)); } }
function skyTex() { return tex(512, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e48fa3'); gr.addColorStop(.45, '#e9a0ad'); gr.addColorStop(1, '#f0b7b4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const rg = g.createRadialGradient(w * .2, h * .35, 10, w * .2, h * .35, 220); rg.addColorStop(0, 'rgba(255,235,235,.55)'); rg.addColorStop(1, 'rgba(255,235,235,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); }); }

// =============================================================== karts
function makeKart(body = 0x1b1b22, trim = 0xffffff, logo) {
  const k = new THREE.Group(), b = std(body, { roughness: .45 }), tr = std(trim, { roughness: .4 }), tyre = std(0x111116, { roughness: .8 });
  k.add(part(new THREE.BoxGeometry(2.0, .16, .8), b, .02)).position.y = .3;
  const nose = part(new THREE.BoxGeometry(.7, .14, .5), b, .02); nose.position.set(1.15, .3, 0); k.add(nose);
  const fw = part(new THREE.BoxGeometry(.18, .06, 1.25), tr, .015); fw.position.set(1.5, .26, 0); k.add(fw);
  const seat = part(new THREE.BoxGeometry(.5, .55, .56), b, .02); seat.position.set(-.45, .62, 0); seat.rotation.z = -.15; k.add(seat);
  const rw = part(new THREE.BoxGeometry(.2, .05, 1.1), tr, .015); rw.position.set(-1.0, .95, 0); k.add(rw);
  [[-.25, .5], [.25, .5]].forEach(([z]) => { const s = part(new THREE.BoxGeometry(.05, .5, .05), b, .01); s.position.set(-1.0, .7, z); k.add(s); });
  [-.41, .41].forEach(z => k.add(M(new THREE.BoxGeometry(1.5, .06, .03), tr, .1, .32, z)));
  const sw = part(new THREE.TorusGeometry(.12, .02, 6, 16), tyre, .008); sw.position.set(.35, .68, 0); sw.rotation.y = Math.PI / 2; sw.rotation.x = .5; k.add(sw);
  const col = part(new THREE.CylinderGeometry(.015, .015, .45, 6), tyre, .006); col.position.set(.55, .5, 0); col.rotation.z = .9; k.add(col);
  k.userData.wheels = [[.85, .55], [.85, -.55], [-.8, .58], [-.8, -.58]].map(([x, z], i) => { const w = new THREE.Group(); w.position.set(x, .26, z); k.add(w);
    const ty = part(new THREE.CylinderGeometry(i < 2 ? .24 : .27, i < 2 ? .24 : .27, .26, 24), tyre, .015); ty.rotation.x = Math.PI / 2; w.add(ty);
    const hub = M(new THREE.CircleGeometry(.12, 20), std(0xdfe3ee), 0, 0, Math.sign(z) * .135); if (z < 0) hub.rotation.y = Math.PI; w.add(hub); return w; });
  if (logo) { const d = decal(logo, null, '#ffffff', .3); d.position.set(.2, .34, .42); k.add(d); }
  return k;
}
function seat(k, guy) { guy.position.set(-.4, .42, 0); guy.rotation.y = Math.PI / 2; guy.scale.setScalar(.72); k.add(guy); return guy; }

// =============================================================== MONEY: glass wall, pyramid of cash, the trillion sign
function buildMoney() {
  const s = new THREE.Scene(); S.money = s; s.background = new THREE.Color(0xe39aa9);
  s.add(new THREE.HemisphereLight(0xb0b8ff, 0x231a40, 1.0));
  const sun = new THREE.DirectionalLight(0xffe0e6, 1.8); sun.position.set(-2, 7, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); s.add(sun);
  const fl = M(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x23254a, roughness: .3, metalness: .2 })); fl.rotation.x = -Math.PI / 2; s.add(fl);
  const tile = tex(512, 512, (g, w, h) => { g.fillStyle = '#25274e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#363a6c'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); } }, [6, 6]);
  fl.material.map = tile;
  // back pink wall with a dark slab, the cash pyramid behind glass
  s.add(M(new THREE.BoxGeometry(30, 12, .3), std(0xe6a1ad, { roughness: .9 }), 0, 6, -6));
  s.add(M(new THREE.BoxGeometry(3.2, 3.6, .1), std(0x2b2c4a), 2.6, 2.6, -5.8));
  s.add(M(new THREE.BoxGeometry(14, .3, 5), std(0x3a3560), 0, .15, -3));
  s.add(M(new THREE.BoxGeometry(14, .06, .1), glow(0xe8a33a, 1.2), 0, .31, -.6));
  const bm = std(0x6ccf72, { roughness: .55 }), bl = std(0x4fae5a, { roughness: .6 });
  const geo = new THREE.BoxGeometry(.56, .28, .44); const N = 11; const inst = new THREE.InstancedMesh(geo, bm, 400), m4 = new THREE.Matrix4(); let n = 0;
  for (let r = 0; r < N; r++) { const cnt = N + 2 - r; for (let i = 0; i < cnt; i++) for (let d = 0; d < 3; d++) { if (n >= 400) break; m4.makeTranslation((i - (cnt - 1) / 2) * .58, .44 + r * .29, -2.3 - d * .46 + r * .0); inst.setMatrixAt(n++, m4); } }
  inst.count = n; inst.castShadow = true; inst.receiveShadow = true; s.add(inst);
  const edge = new THREE.InstancedMesh(new THREE.BoxGeometry(.57, .05, .45), bl, 400); n = 0;
  for (let r = 0; r < N; r++) { const cnt = N + 2 - r; for (let i = 0; i < cnt; i++) { m4.makeTranslation((i - (cnt - 1) / 2) * .58, .44 + r * .29 - .1, -2.3); edge.setMatrixAt(n++, m4); } } edge.count = n; s.add(edge);
  X.trill = sign(3.4, .5, (g, w, h) => { g.fillStyle = '#f6d94a'; g.font = '800 92px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$1,000,000,000,000', w / 2, h / 2 + 6); }, 1.6);
  X.trill.position.set(0, 3.95, -2.6); s.add(X.trill);
  // glass partition (mullions) + ceiling with light bars
  const fr = std(0x1f2242, { roughness: .4 });
  for (let i = -4; i <= 4; i++) s.add(M(new THREE.BoxGeometry(.12, 5, .12), fr, i * 1.55, 2.5, 0));
  s.add(M(new THREE.BoxGeometry(16, .18, .16), fr, 0, .09, 0)); s.add(M(new THREE.BoxGeometry(16, .3, .2), fr, 0, 4.95, 0));
  s.add(M(new THREE.PlaneGeometry(16, 5), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: .08, roughness: 0, metalness: .6, depthWrite: false }), 0, 2.5, .01));
  for (let i = 0; i < 4; i++) { const st = M(new THREE.PlaneGeometry(.04, 1.4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .25, depthWrite: false }), -3 + i * 2.3, 3.0, .03); st.rotation.z = .65; s.add(st); }
  s.add(M(new THREE.BoxGeometry(16, .3, 10), std(0x101228), 0, 5.6, 3));
  for (let i = 0; i < 4; i++) { const b = M(new THREE.BoxGeometry(.1, .05, 3.2), glow(0xffffff, 2.4), -2.5 + i * 2.2, 5.43, 3.5); b.rotation.y = i % 2 ? .45 : -.25; s.add(b); }
}

// =============================================================== STADIUM: orange track, green field, block-crowd stands
function buildStadium() {
  const s = new THREE.Scene(); S.stad = s; s.background = new THREE.Color(0x5d6a8c); s.fog = new THREE.Fog(0x7d88a8, 30, 90);
  s.add(new THREE.HemisphereLight(0xdfe8ff, 0x557040, 1.1));
  const sun = new THREE.DirectionalLight(0xfff2e0, 2.2); sun.position.set(6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 14, bottom: -14, near: 1, far: 60 }); sun.shadow.bias = -.0004; s.add(sun); X.sun = sun; s.add(sun.target);
  const trackT = tex(256, 1024, (g, w, h) => { g.fillStyle = '#d4663f'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < 3000; i++) g.fillRect(hash(i) * w, hash(i, 3) * h, 2, 2); g.fillStyle = '#f2f2f2'; for (let i = 0; i <= 6; i++) g.fillRect(0, i * h / 6 - 3, w, 6); }, [30, 1]);
  const tr = M(new THREE.PlaneGeometry(200, 6), new THREE.MeshStandardMaterial({ map: trackT, roughness: .85 })); tr.rotation.x = -Math.PI / 2; tr.position.z = .5; tr.receiveShadow = true; s.add(tr);
  const grass = M(new THREE.PlaneGeometry(200, 60), new THREE.MeshStandardMaterial({ color: 0x5fa83c, roughness: .9 }), 0, -.01, 33.5); grass.rotation.x = -Math.PI / 2; s.add(grass);
  const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(.05, .14, 4), std(0x3f8a2c), 900), m4 = new THREE.Matrix4();
  for (let i = 0; i < 900; i++) { m4.makeTranslation((hash(i) - .5) * 80, .06, 3.8 + hash(i, 2) * 14); tufts.setMatrixAt(i, m4); } s.add(tufts);
  const strip = M(new THREE.PlaneGeometry(200, 1.4), new THREE.MeshStandardMaterial({ color: 0x3fae58, roughness: .9 }), 0, .005, -3.2); strip.rotation.x = -Math.PI / 2; s.add(strip);
  // pit wall + sponsor boards (invented brands)
  s.add(M(new THREE.BoxGeometry(200, .9, .2), std(0xe8eaf0), 0, .45, -3.95));
  for (let i = -12; i <= 12; i++) { const b = sign(4.6, .8, (g, w, h) => { g.fillStyle = i % 3 ? '#14141a' : '#eef0f5'; g.fillRect(0, 0, w, h); g.fillStyle = i % 3 ? '#fff' : '#2b8a3e'; g.font = '800 120px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['K', 'NOVAMIND', 'HALCYON'][(i + 30) % 3], w / 2, h / 2 + 8); }); b.position.set(i * 5.2, .5, -3.83); s.add(b); }
  // stands: stepped rows + instanced crowd (colour body + white head)
  const rows = 9, cols = 140; const step = std(0x8a96b8, { roughness: .9 });
  for (let r = 0; r < rows; r++) s.add(M(new THREE.BoxGeometry(200, .6, 1.1), step, 0, 1.1 + r * .62, -4.8 - r * 1.1));
  const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(.36, .42, .3), std(0xffffff, { roughness: .6 }), rows * cols), heads = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 12, 10), std(0xf3f1ec), rows * cols);
  const pal = [0xe0b23a, 0x3b74e0, 0x8e5bd6, 0xd94a4a, 0x3fb06a, 0xe07a2c, 0x5fc0e0, 0xd65aa0], col = new THREE.Color(); let n = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (hash(r, c) < .28) continue; const x = (c - cols / 2) * .72 + (r % 2) * .3, y = 1.62 + r * .62, z = -4.7 - r * 1.1;
    m4.makeTranslation(x, y, z); bodies.setMatrixAt(n, m4); m4.makeTranslation(x, y + .36, z); heads.setMatrixAt(n, m4); bodies.setColorAt(n, col.setHex(pal[Math.floor(hash(c, r) * 8)])); n++; }
  bodies.count = heads.count = n; s.add(bodies, heads);
  s.add(M(new THREE.BoxGeometry(200, .5, 12), std(0x2a3150), 0, 8.2, -9));     // roof overhang
  for (let i = -20; i < 20; i++) s.add(M(new THREE.BoxGeometry(.1, 7, .1), std(0x2a3150), i * 5, 4.6, -14));
  // floating sponsor discs
  X.discs = ['N', 'H'].map((L, i) => { const d = sign(1.4, 1.4, (g, w, h) => { g.fillStyle = '#f2f2f4'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, 7); g.fill(); g.strokeStyle = '#999'; g.lineWidth = 10; g.stroke(); g.fillStyle = i ? '#3b82f6' : '#222'; g.font = '800 200px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L, w / 2, h / 2 + 12); }); s.add(d); return d; });
  // karts + drivers
  X.kA = makeKart(0x17171d, 0xf2f2f5, 'N'); seat(X.kA, C.rivA); s.add(X.kA);
  X.kB = makeKart(0xeef1f6, 0x2f6fe0, 'H'); seat(X.kB, C.rivB); const p2 = C.rivB2; p2.position.set(-1.0, .5, 0); p2.rotation.y = Math.PI / 2; p2.scale.setScalar(.68); X.kB.add(p2); s.add(X.kB);
  X.kH = makeKart(0x17171d, 0xf2f2f5, 'K'); seat(X.kH, C.heroK); s.add(X.kH);
  const sack = part(new THREE.SphereGeometry(.42, 20, 14), std(0xdfe4ee, { roughness: .9 }), .015); sack.scale.set(1, 1.1, 1); sack.position.set(-1.2, 1.0, 0); X.kH.add(sack);
}

// =============================================================== DATA CENTRE aerial: green land, the TITAN hall, solar fields, distant city
function buildDC() {
  const s = new THREE.Scene(); S.dc = s;
  s.background = tex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c98a9e'); gr.addColorStop(.5, '#e6a99a'); gr.addColorStop(1, '#f2c79e'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  s.fog = new THREE.Fog(0xe9b6a4, 90, 300);
  s.add(new THREE.HemisphereLight(0xffe2d0, 0x5a7a40, 1.2));
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.4); sun.position.set(-14, 20, 10); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 80 }); s.add(sun);
  const gr = M(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x8cbf4e, roughness: 1 })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; s.add(gr);
  const patch = (x, z, w, d, c) => { const p = M(new THREE.PlaneGeometry(w, d), std(c, { roughness: 1 }), x, .01, z); p.rotation.x = -Math.PI / 2; s.add(p); };
  patch(-6, -12, 10, 6, 0x9fca5c); patch(9, -18, 12, 8, 0x7fb246); patch(-14, 4, 8, 10, 0x9ccb5f);
  // road + forecourt
  patch(0, 9, 120, 1.6, 0x4a4d57); patch(0, 5, 14, 5.5, 0xb7b5c2);
  for (let i = -3; i <= 3; i++) patch(i * 1.6, 7.4, .5, 1.4, 0xb7b5c2);
  // the hall
  const roofT = tex(1024, 512, (g, w, h) => { g.fillStyle = '#eef0f6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8cbe0'; g.lineWidth = 3; for (let i = 0; i < 24; i++) { g.beginPath(); g.moveTo(i * w / 24, 0); g.lineTo(i * w / 24, h); g.stroke(); } for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(0, i * h / 10); g.lineTo(w, i * h / 10); g.stroke(); }
    g.fillStyle = '#9aa0d8'; for (let i = 0; i < 30; i++) g.fillRect(hash(i) * w, hash(i, 4) * h, 26, 16); });
  const hall = new THREE.Mesh(new THREE.BoxGeometry(11, 1.3, 5), [std(0xe4e6ee), std(0xe4e6ee), new THREE.MeshStandardMaterial({ map: roofT, roughness: .8 }), std(0xe4e6ee), std(0xdadced), std(0xe4e6ee)]);
  hall.position.set(0, .65, 0); hall.castShadow = hall.receiveShadow = true; s.add(hall);
  const lg = sign(1.4, 1.0, (g, w, h) => { g.fillStyle = '#121218'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 200px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('K', w / 2, h / 2 + 14); });
  lg.rotation.x = -Math.PI / 2; lg.position.set(0, 1.32, -.9); s.add(lg);
  const lg2 = sign(1.2, .8, (g, w, h) => { g.fillStyle = '#121218'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 160px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('K', w / 2, h / 2 + 10); }); lg2.position.set(0, .75, 2.52); s.add(lg2);
  s.add(M(new THREE.BoxGeometry(.6, .7, .2), std(0x5aa0ff), 0, .35, 2.55));
  // solar arrays (left) + cooling units (right) + parked cars
  const pv = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, .05, .6), std(0x4b5cc8, { roughness: .3, metalness: .3 }), 300), m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.4, 0, 0)); let n = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) { m4.compose(V(-9.5 - c * 1.35, .35, -2.5 + r * .9), q, V(1, 1, 1)); pv.setMatrixAt(n++, m4); } pv.count = n; pv.castShadow = true; s.add(pv);
  const ac = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .4, .5), std(0xb9bccb), 60); n = 0; for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { m4.makeTranslation(6.4 + c * .7, .2, -1.6 + r * .8); ac.setMatrixAt(n++, m4); } ac.count = n; ac.castShadow = true; s.add(ac);
  const car = new THREE.InstancedMesh(new THREE.BoxGeometry(.32, .2, .6), std(0xffffff), 80), col = new THREE.Color(); n = 0;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) { if (hash(r, c) < .2) continue; m4.makeTranslation(7 + c * .45, .1, 3.2 + r * .9); car.setMatrixAt(n, m4); car.setColorAt(n, col.setHex([0x2a2a33, 0xd8d8e0, 0x3b74e0, 0xc23a3a, 0x8a8a96][Math.floor(hash(c, r + 9) * 5)])); n++; } car.count = n; s.add(car);
  s.add(M(new THREE.BoxGeometry(.5, .5, .9), std(0xf2f2f5), -2.5, .25, 6.5, true)); s.add(M(new THREE.BoxGeometry(.5, .5, .9), std(0xf2f2f5), 3.4, .25, 5.8, true));
  // trees (instanced) + distant city skyline + dome + river
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.06, .08, .5, 6), std(0x6a4a2e), 500), crown = new THREE.InstancedMesh(new THREE.SphereGeometry(.42, 10, 8), std(0x3f8f3a, { roughness: .9 }), 500); n = 0;
  for (let i = 0; i < 1400 && n < 500; i++) { const x = (hash(i) - .5) * 90, z = -60 + hash(i, 7) * 80; if (Math.abs(x) < 16 && z > -6 && z < 10) continue; if (Math.abs(z - 9) < 1.4) continue;
    const sc = .45 + hash(i, 2) * .45; m4.compose(V(x, .25 * sc, z), new THREE.Quaternion(), V(sc, sc, sc)); trunk.setMatrixAt(n, m4); m4.compose(V(x, .75 * sc, z), new THREE.Quaternion(), V(sc, sc, sc)); crown.setMatrixAt(n, m4); n++; }
  trunk.count = crown.count = n; trunk.castShadow = crown.castShadow = true; s.add(trunk, crown);
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0x9a8fc8, { roughness: .8 }), 200); n = 0;
  for (let i = 0; i < 200; i++) { const h = 2 + hash(i, 5) * 9, x = (hash(i) - .5) * 70; m4.compose(V(x * 1.6, h * .6 / 2, -150 - hash(i, 9) * 14), new THREE.Quaternion(), V(1.2 + hash(i, 1) * 2, h * .6, 1.5)); city.setMatrixAt(n++, m4); } s.add(city);
  const dome = M(new THREE.SphereGeometry(4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(0xd9d6e6), -16, 0, -55); s.add(dome);
  patch(28, -30, 14, 70, 0x4a7fbf);
}

// =============================================================== camera timeline (keys: [t, pos, look, fov])
const HERO = V(.55, 0, 0), HEAD = V(.55, 1.72, .02), GLOBE = V(-1.3, 1.92, -1.3);
const SH = [];
function shot(t0, t1, set, keys, o = {}) { SH.push({ t0, t1, set, keys, ...o }); }
function camAt(keys, t) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1] || a, k = b === a ? 0 : (b[4] || eio)(seg(t, a[0], b[0]));
  const v = (A, B) => { A = typeof A === 'function' ? A(t) : A; B = typeof B === 'function' ? B(t) : B; return V(lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)); };
  return { p: v(a[1], b[1]), l: v(a[2], b[2]), fov: lerp(a[3] || 40, b[3] || 40, k), roll: lerp(a[5] || 0, b[5] || 0, k) };
}
const lin = k => k;
// kart paths along the stadium track (x as a function of time)
const xA = t => -2 + (t - 6.0) * 7.2, xB = t => -3 + (t - 8.6) * 6.6, xH = t => -1 + (t - 10.8) * 5.8;
// 0.00  exterior through the glass wall → dolly in (whip-fast) → medium on the hero beside the globe
shot(0, 1.86, 'hub', [[0, [.3, 1.9, 25.0], [.1, 4.1, 0], 36], [.45, [.28, 1.85, 22.5], [.1, 3.9, 0], 36], [.8, [.5, .7, 9.5], [-.3, 1.55, -.8], 44], [1.02, [2.1, 1.1, 6.9], [.4, 1.0, 0], 40, eout], [1.66, [2.0, 1.12, 6.6], [.4, 1.0, 0], 40], [1.86, [2.0, 1.12, 6.6], [5.0, 1.0, 2.6], 40, k => k * k]], { blur: t => (t > .45 && t < .9) || t > 1.7 ? 5 : 0 });
// 1.86  whip lands on the trillion-dollar pyramid behind glass
shot(1.86, 3.3, 'money', [[1.86, [0, 1.25, 5.9], [-2.4, 2.0, 0], 46], [2.05, [0, 1.25, 5.9], [0, 2.05, 0], 46, eout], [3.3, [0, 1.3, 5.6], [0, 2.1, 0], 46]], { blur: t => t < 2.0 ? 5 : 0 });
// 3.10  dissolve into the globe, swing over the top, down onto the race ring
shot(3.3, 4.55, 'hub', [[3.3, [-1.1, 3.3, .2], [-1.3, 1.9, -1.3], 50], [3.62, [-1.0, 4.6, 2.6], [-1.3, .8, -.6], 46], [3.9, [1.5, 1.75, 1.6], [-1.2, .9, -.1], 46], [4.35, [1.3, 1.6, 1.3], [-1.4, .9, -.2], 46], [4.55, [.4, 1.0, .7], [-1.4, .9, -.2], 40]], { blur: t => t > 3.5 && t < 3.95 ? 4 : 0, fadeIn: [3.1, 3.42, 'money'] });
// 4.55  white flash → stadium: high wide, low pass, then tracking alongside each kart
shot(4.55, 5.2, 'stad', [[4.55, [11, 8.5, 13], [3, 0, -1], 38], [5.2, [10, 7.6, 12], [2.4, 0, -1], 38]], { flash: [4.35, 4.5, 4.8] });
shot(5.2, 5.62, 'stad', [[5.2, [-3.0, .6, 4.5], [1.5, .9, -.4], 44], [5.62, [-3.2, .6, 4.5], [-1, .9, 0], 44]], { blur: () => 3 });
shot(5.62, 7.2, 'stad', [[5.62, t => [xA(t) + 3.6, 2.1, 6.2], t => [xA(t) - .1, .85, 0], 42], [7.2, t => [xA(t) + 2.4, 2.0, 5.9], t => [xA(t) - .2, .85, 0], 42]]);
shot(7.2, 7.72, 'stad', [[7.2, [xA(7.2) + 1.6, 1.8, 5.0], [xA(7.2) + 2, .9, 0], 42], [7.72, [xA(7.2) + 2.2, 1.8, 5.0], [xA(7.2) + 3.6, .9, -.6], 42]], { blur: () => 3 });
shot(7.72, 10.0, 'stad', [[7.72, t => [xB(t) + 4.2, 2.0, 6.2], t => [xB(t) + .2, .9, 0], 40], [8.3, t => [xB(t) + 2.8, 2.0, 5.8], t => [xB(t) - .3, 1.0, 0], 40], [9.6, t => [xB(t) + 2.4, 1.95, 5.6], t => [xB(t) - .4, 1.0, 0], 40], [10.0, [xB(9.6) + 2.4, 1.95, 5.6], [xB(9.6) + 3.4, .9, 0], 40]], { blur: t => t < 7.95 || t > 9.6 ? 4 : 0 });
shot(10.0, 11.72, 'stad', [[10.0, [xH(10.2) + 4.5, 1.7, 4.8], [xH(10.2) + 2, .9, 0], 40], [10.25, t => [xH(t) + 2.3, 1.7, 4.4], t => [xH(t) - .1, 1.0, 0], 40, eout], [11.72, t => [xH(t) + 2.1, 1.7, 4.2], t => [xH(t) - .1, 1.0, 0], 40]], { blur: t => t < 10.25 ? 4 : 0 });
// 11.72 top-down on the hub ring → crane down to the puppet master → push to his face
shot(11.72, 14.75, 'hub', [[11.72, [.2, 11.5, 1.2], [.0, 0, -.6], 42], [12.0, [.2, 10.8, 1.4], [.1, 0, -.4], 42], [12.55, [.8, 3.0, 6.4], [.55, 1.05, 0], 42], [13.3, [.75, 1.7, 5.4], [.55, 1.3, 0], 42], [14.35, [.7, 1.65, 4.8], [.55, 1.35, 0], 42], [14.75, [.6, 1.75, 2.3], [.55, 1.62, 0], 40, k => k * k]], { blur: t => (t > 12.0 && t < 12.5) || t > 14.5 ? 4 : 0 });
// 14.75 orbit round the head to look over his shoulder at the globe
const orbit = (a, r, y) => [HEAD.x + Math.sin(a) * r, HEAD.y + y, HEAD.z + Math.cos(a) * r];
shot(14.75, 16.72, 'hub', [[14.75, t => orbit(lerp(.45, 2.15, eio(seg(t, 14.75, 16.6))), lerp(3.4, 3.0, seg(t, 14.75, 16.6)), -.05), t => { const k = eio(seg(t, 14.75, 16.6)); return [lerp(HEAD.x - .2, GLOBE.x, k * .7), lerp(HEAD.y, GLOBE.y, k * .7), lerp(HEAD.z, GLOBE.z, k * .7)]; }, 42], [16.72, t => orbit(2.15, 3.0, -.05), [lerp(HEAD.x, GLOBE.x, .7), lerp(HEAD.y, GLOBE.y, .7), lerp(HEAD.z, GLOBE.z, .7)], 42]]);
// 16.72 rise: globe + plan board, the head as a foreground silhouette
shot(16.72, 18.72, 'hub', [[16.72, orbit(2.15, 3.0, -.05), [-.9, 1.8, -1.0], 42], [17.0, [1.6, 2.3, 3.7], [-1.2, 1.9, -1.6], 42, eout], [18.72, [1.65, 2.32, 3.5], [-1.25, 1.9, -1.6], 42]], { blur: t => t < 16.95 ? 4 : 0 });
// 18.72 the globe close; 20.4 push into the KAI cube; 21.72 aerial on TITAN
shot(18.72, 20.4, 'hub', [[18.72, [-1.0, 1.85, 3.5], [-1.3, 1.85, -1.3], 40], [20.4, [-1.05, 1.82, 3.2], [-1.25, 1.8, -1.3], 40]]);
shot(20.4, 21.72, 'hub', [[20.4, [-1.05, 1.82, 3.2], [-1.25, 1.8, -1.3], 40], [21.0, () => cubeCam(1.1), () => cubeLook(), 40], [21.45, () => cubeCam(.6), () => cubeLook(), 40], [21.72, () => cubeCam(.2), () => cubeLook(), 40, k => k * k]], { blur: t => (t > 20.4 && t < 20.75) || t > 21.4 ? 5 : 0 });
shot(21.72, 24.0, 'dc', [[21.72, [-.3, 16, 54], [0, 0, -2], 40], [24.0, [-.3, 15, 50], [0, 0, -2], 40, lin]]);
const _w = new THREE.Vector3(), _n = new THREE.Vector3();
function cubeCam(d) { X.cube.getWorldPosition(_w); _n.set(0, 0, 1).applyQuaternion(X.cube.getWorldQuaternion(new THREE.Quaternion())); return [_w.x + _n.x * d, _w.y + _n.y * d, _w.z + _n.z * d]; }
function cubeLook() { X.cube.getWorldPosition(_w); return [_w.x, _w.y, _w.z]; }

// =============================================================== animate the world at time t
function animate(t) {
  // globe slowly turns until the cube lands; rings spin
  X.globe.rotation.y = -1.1 + Math.min(t, 16.3) * .12; X.orb1.rotation.z = t * .5; X.orb2.rotation.z = -t * .4;
  const cubeIn = seg(t, 16.3, 16.6); X.cube.visible = t > 16.3; X.cube.scale.setScalar(Math.max(.001, cubeIn < 1 ? 1.3 * Math.sin(cubeIn * 2) : 1));
  X.minis.forEach((k, i) => { const a = t * (1.2 + i * .13) + i * 1.6, r = 1.38 + (i % 2) * .2; k.position.set(Math.cos(a) * r, .8, -Math.sin(a) * r); k.rotation.y = a + Math.PI; });
  // hero in the hub
  const H = C.hero; H.visible = true;
  if (t < 11.7) { const ex = t < 1.1 ? 'grin' : t < 1.55 ? 'smug' : 'grin';
    pose(H, { t, expr: ex, armL: [.55, .35], armR: [.55, .35], turn: t < 1.1 ? .15 : .05, nod: -.04, look: [.1, 0] }); X.cross.visible = false; X.pups.forEach(p => { p.visible = false; p.userData.str.visible = false; }); }
  else { const ex = t < 12.6 ? 'happy' : t < 17.3 ? 'evil' : t < 17.95 ? 'smug' : 'evil';
    const turn = t > 17.3 && t < 17.95 ? .7 : t > 14.8 && t < 17.0 ? -.25 : 0;
    pose(H, { t, expr: ex, armL: [1.55, .5], armR: [1.55, -.15], turn, nod: t > 17.3 && t < 17.95 ? .25 : -.05, look: [0, 0], sway: Math.sin(t * 3) * .03 });
    // cross bar held at eye height in front; strings to 4 hanging puppets that dance
    X.cross.visible = t < 16.7; const cx = HERO.x + .12, cz = .62, cyy = 1.62 + Math.sin(t * 4) * .03; X.cross.position.set(cx, cyy, cz); X.cross.rotation.set(0, -.28, Math.sin(t * 4) * .12);
    X.pups.forEach((p, i) => { p.visible = X.cross.visible; p.userData.str.visible = p.visible; const ox = (i - 1.5) * .26, sw = Math.sin(t * 4 + i * 1.3);
      const top = V(cx + ox * .9, cyy, cz + .05), pos = V(cx + ox + sw * .04, .78 + Math.abs(Math.sin(t * 4 + i)) * .12, cz + .12);
      p.position.copy(pos); p.rotation.set(0, -.28 + sw * .2, sw * .15);
      const st = p.userData.str, mid = top.clone().add(pos).multiplyScalar(.5).setY((top.y + pos.y + .2) / 2), len = top.distanceTo(pos.clone().setY(pos.y + .2));
      st.position.copy(mid); st.scale.y = len; st.lookAt(top); st.rotateX(Math.PI / 2); });
  }
  X.bills.forEach((b, i) => { const on = t > 11.7 && t < 16.8; b.visible = on; if (!on) return; const fall = ((t - 11.7) * (1.1 + hash(i, 4) * .5) + hash(i, 2) * 5) % 5.5;
    b.position.set(HERO.x + (hash(i) - .5) * 4.2, 5.2 - fall, (hash(i, 1) - .5) * 4 + .6); b.rotation.set(t * (2 + hash(i, 6) * 3), t * 1.7 + i, t * (1 + hash(i, 8))); });
  // stadium
  if (t > 4.5 && t < 11.8) {
    const kp = (k, x, steerT) => { k.position.set(x, 0, .55); k.rotation.y = 0; k.userData.wheels.forEach(w => w.rotation.z = -x / .26); k.position.y = Math.abs(Math.sin(steerT * 18)) * .015; };
    kp(X.kA, t < 5.62 ? -1.2 + (t - 5.25) * 9 : xA(t), t); kp(X.kB, t < 7.72 ? -30 : xB(t), t + 1); kp(X.kH, t < 10.0 ? (t < 5.3 ? -6 + (t - 4.5) * 7 : -40) : xH(t), t + 2);
    if (t < 5.3) X.kH.position.z = -.8;
    pose(C.rivA, { t, sit: true, expr: 'smug', armL: [1.2, .1], armR: t > 5.9 && t < 6.9 ? [2.7, -.4] : [1.2, .1], nod: -.05, look: [.4, 0] });
    pose(C.rivB, { t, sit: true, expr: t > 8.6 ? 'happy' : 'grin', armL: [1.2, .1], armR: t > 8.4 && t < 9.4 ? [2.2 + Math.sin(t * 10) * .2, -.3] : [1.2, .1], turn: -.35 });
    pose(C.rivB2, { t, sit: true, expr: 'grin', armL: [1.4, .2], armR: [2.6, -.2], turn: -.2 });
    pose(C.heroK, { t, sit: true, expr: t < 10.45 ? 'side' : 'annoyed', anger: t > 10.6, armL: [1.2, .1], armR: [1.2, .1], turn: t < 10.45 ? .6 : -.5, look: [.3, 0] });
    X.discs[0].position.set(xA(Math.max(6, t)) - .6, 3.4, -2.6); X.discs[0].visible = t > 6.5 && t < 7.3; X.discs[0].scale.setScalar(eout(seg(t, 6.5, 6.75)) + .001);
    X.discs[1].position.set(xB(t) + .3, 3.0, -2.4); X.discs[1].visible = t > 8.2 && t < 10; X.discs[1].scale.setScalar(eout(seg(t, 8.2, 8.5)) + .001);
    X.sun.target.position.set(cam.position.x, 0, 0); X.sun.position.set(cam.position.x + 6, 12, 8);
  }
}

// =============================================================== render
const WORDS = [[0, "You're"], [.25, 'Max'], [.5, 'Ryder,'], [1.25, "the world's"], [1.75, 'first'], [2.0, 'trillionaire,'], [3.25, "and you're"], [3.5, 'losing'], [4.0, 'the AI race'],
  [4.75, 'to a company'], [5.25, 'you co-founded.'], [6.75, 'NovaMind.'], [8.25, 'And Halcyon'], [9.0, 'are beating'], [9.25, 'you too,'], [10.25, 'and it annoys'], [11.0, 'you.'],
  [11.75, 'But they'], [12.0, "don't"], [12.25, 'know'], [12.5, 'your'], [12.75, 'secret'], [13.0, 'genius'], [13.25, 'master'], [14.0, 'plan.'], [15.0, 'First,'], [15.5, 'you need'],
  [15.75, 'an AI company,'], [17.0, 'so you build'], [17.5, 'KAI.'], [18.75, 'Now to train'], [19.5, 'your'], [19.75, 'AI model,'], [20.5, 'you need'], [20.75, 'GPUs,'], [21.75, 'so KAI builds'], [23.0, 'TITAN,']];
export const events = () => WORDS.map(([t, w]) => ({ t, type: 'word', w }));
function shotAt(t) { return SH.find(s => t >= s.t0 && t < s.t1) || SH[SH.length - 1]; }
function draw3d(set, t, sh) {
  animate(t); const c = camAt(sh.keys, t); cam.position.copy(c.p); cam.up.set(0, 1, 0); if (Math.abs(c.p.x - c.l.x) < .05 && Math.abs(c.p.z - c.l.z) < .05) c.l.z -= .06;
  cam.lookAt(c.l); cam.fov = c.fov; cam.updateProjectionMatrix(); rp.scene = S[set];
  if (set === 'hub') { X.top = X.top || S.hub.children.filter(o => o.position.y > 5); X.top.forEach(o => o.visible = c.p.y < 5.1); }
  X.bloom.strength = set === 'hub' ? .38 : set === 'money' ? .3 : .18; comp.render(); return R.domElement;
}
export const dbg = () => ({ cam: cam.position.toArray(), kA: X.kA.position.toArray(), kAs: X.kA.scale.toArray(), rivA: C.rivA.getWorldPosition(new THREE.Vector3()).toArray() });
export function render(g, t) {
  const sh = shotAt(t), n = sh.blur ? sh.blur(t) : 0;
  g.globalAlpha = 1; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (n) { for (let i = 0; i < n; i++) { g.globalAlpha = 1 / (i + 1); g.drawImage(draw3d(sh.set, t - (i / n) * (1 / 30) * 1.6, sh), 0, 0); } }
  else g.drawImage(draw3d(sh.set, t, sh), 0, 0);
  g.globalAlpha = 1;
  if (sh.fadeIn && t < sh.fadeIn[1]) { /* dissolve handled from the previous shot */ }
  // money → globe dissolve: overlay the hub view on top of the last money frames
  const nx = SH.find(s => s.fadeIn && t >= s.fadeIn[0] && t < s.t0);
  if (nx) { g.globalAlpha = ss(seg(t, nx.fadeIn[0], nx.t0)) * .85; g.drawImage(draw3d(nx.set, t, { ...nx, keys: [[0, nx.keys[0][1], nx.keys[0][2], nx.keys[0][3]]] }), 0, 0); g.globalAlpha = 1; }
  // white flash
  const fl = SH.find(s => s.flash && t >= s.flash[0] && t < s.flash[2]);
  if (fl) { const [a, p, b] = fl.flash, k = t < p ? seg(t, a, p) : 1 - seg(t, p, b); g.fillStyle = `rgba(245,252,255,${ss(k)})`; g.fillRect(0, 0, W, H); }
  vignette(g); caption(g, t);
}
let VIG;
function vignette(g) {
  if (!VIG) { VIG = document.createElement('canvas'); VIG.width = W; VIG.height = H; const v = VIG.getContext('2d'); const gr = v.createRadialGradient(W / 2, H * .48, H * .22, W / 2, H * .5, H * .62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.62)'); v.fillStyle = gr; v.fillRect(0, 0, W, H); }
  g.drawImage(VIG, 0, 0);
}
function caption(g, t) {
  let w = null; for (const [a, s] of WORDS) if (t >= a) w = s; if (!w) return;
  g.font = '700 50px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const y = H * .705; g.lineWidth = 11; g.strokeStyle = 'rgba(10,10,14,.92)'; g.strokeText(w, W / 2, y); g.fillStyle = '#fff'; g.fillText(w, W / 2, y);
  g.font = '600 22px Poppins'; g.fillStyle = 'rgba(255,255,255,.35)'; g.textAlign = 'right'; g.fillText('LAB TEST', W - 30, 40);
}
