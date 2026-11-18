// The Keeper's Island — one diorama, data-driven: time of day, cast blocking, camera presets, props and the lamp come from each
// Short's timeline.json (see tools/timeline.py). Engine = lemo-opuscar 2.5D Pixel Art kit, imported by absolute path.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, cobbles, rock, woodPlanks, ground, billboard, glow, blob, mulberry } from '/styles/hd-2d/demo/px.js';
import { mats, mat, mesh, box, house, crate, barrel, ridge } from '/styles/hd-2d/demo/kit.js';
import { sky, stars, sea, particles, rain, beamCard, flick } from '/styles/hd-2d/demo/fx.js';
import { MAKERS, poseFrame } from './cast.js';
import { clamp, seg, ss, lerp, track } from '/core/lib.js';

export const SEA_Y = -1.3;
export const LH = { x: 21, y: 9, z: -24 };
const LAMP_Y = LH.y + 13.3;
export const ROCKS = { x: 12, y: .9, z: -46 };
export const CAVE = { x: -95, z: -95 };   // the sea-cave under the island: a cut-away ring of rock (its own set, far from the island)     // the north rocks (wreck site), a low reef off the shore
// Where feet stand (sprite roots), by zone
export function groundY(x, z) {
  if (Math.hypot(x - CAVE.x, z - CAVE.z) < 12) return .42;   // the cave's sand floor
  if (Math.hypot(x - LH.x, z - LH.z) < 8.3) return 9.17;
  if (Math.hypot(x - 7, z + 15) < 20.7) return 4.27;
  if (x > -4.6 && x < -1.4 && z > 27 && z < 42) return .02;
  if (Math.hypot(x - ROCKS.x, z - ROCKS.z) < 6) return ROCKS.y + .02;
  return .17;
}
// Time-of-day keys (sky, fog, sun, hemisphere, exposure, how strong the practicals are)
const TIMES = {
  night: { top: '#040716', mid: '#0e1a3a', hor: '#27405e', fog: '#141f36', fogD: .0095, sun: '#8aa4de', sunI: .95, sunPos: [-25, 60, 50], hemi: ['#36497a', '#0a0a12', .9], exp: 1.15, prac: 1, star: 1, lamp: 1, seaBright: 1 },
  dusk: { top: '#2a1c4a', mid: '#7a3a5a', hor: '#e08a50', fog: '#4a3448', fogD: .0065, sun: '#ffb070', sunI: 3.0, sunPos: [-70, 18, 40], hemi: ['#8a6a9a', '#3a2418', 1.5], exp: 1.5, prac: .4, star: .25, lamp: 1, seaBright: 1.2 },
  dawn: { top: '#3a5a8a', mid: '#9a9ab8', hor: '#f0c8a0', fog: '#8c92a8', fogD: .0055, sun: '#ffd8a8', sunI: 3.4, sunPos: [70, 34, -30], hemi: ['#b0bede', '#5a5044', 1.8], exp: 2.0, prac: .15, star: 0, lamp: 1, seaBright: 1.3 },
  day: { top: '#2a5a96', mid: '#5d86b0', hor: '#8e928c', fog: '#66788a', fogD: .0045, sun: '#fff1d6', sunI: 3.2, sunPos: [40, 70, 30], hemi: ['#9fb6d4', '#4a4434', 1.6, ], exp: 2.3, prac: 0, star: 0, lamp: 0, seaBright: 1.0 },
  cave: { top: '#03060a', mid: '#060c12', hor: '#0a1418', fog: '#0c2226', fogD: .012, sun: '#4a6a78', sunI: .5, sunPos: [-25, 60, 50], hemi: ['#7a8a88', '#14100c', 1.5], exp: 2.0, prac: 1, star: 0, lamp: 0, seaBright: .7 },
  storm: { top: '#0a0d18', mid: '#1a2030', hor: '#2c3444', fog: '#1a1d2c', fogD: .011, sun: '#7a8ab0', sunI: .7, sunPos: [-25, 60, 50], hemi: ['#2a3450', '#0a0a12', .8], exp: 1.1, prac: 1, star: 0, lamp: 1, seaBright: .8 },
};

function landDisc(rTop, rBot, h, segs, seed, tex, yTop) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, segs, 3), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + (fbm(Math.cos(a) * 3 + 5, Math.sin(a) * 3 + 5, seed, 3) - .5) * .22; p.setX(i, x * k); p.setZ(i, z * k); }
  g.computeVertexNormals(); g.translate(0, yTop - h / 2, 0); return mesh(g, tex);
}

export function buildWorld(aspect) {
  const scene = new THREE.Scene(), MM = mats();
  scene.fog = new THREE.FogExp2('#141f36', .0095);
  const SK = sky({ moonDir: new THREE.Vector3(.45, .32, -1), top: '#040716', mid: '#0e1a3a', hor: '#27405e' }); scene.add(SK.mesh);
  const ST = stars(1100, 11); scene.add(ST);
  const sun = new THREE.DirectionalLight('#8aa4de', .85); sun.position.set(-25, 60, 50); sun.target.position.set(8, 2, -14);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 240 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#36497a', '#0a0a12', .7); scene.add(hemi);

  // —— Land ——
  const rockM = mat(rock(128, 128, { seed: 7, cols: ['#0e0e14', '#1c1b22', '#2b2932', '#3c3a44', '#514e58'] }));
  const grassM = mat(ground(128, 128, { seed: 3, grass: ['#0a1410', '#112218', '#182f20', '#213e28', '#2c4e32'] }));
  const shoreM = mat(cobbles(96, 96, { seed: 5, cols: ['#14141a', '#23232b', '#33323c', '#45444f', '#5a5863'] }));
  const add = (m, x, z) => { m.position.set(x, 0, z); scene.add(m); return m; };
  add(landDisc(34, 38, 3.2, 28, 1, rockM, 0), 4, -6); add(landDisc(33.6, 33.6, .3, 28, 1, shoreM, .15), 4, -6);
  add(landDisc(21, 25, 4.2, 24, 2, rockM, 4), 7, -15); add(landDisc(20.7, 20.7, .3, 24, 2, grassM, 4.15), 7, -15);
  add(landDisc(8.5, 12.5, 5.2, 18, 3, rockM, 9), LH.x, LH.z); add(landDisc(8.3, 8.3, .3, 18, 3, grassM, 9.15), LH.x, LH.z);
  add(landDisc(6, 8, 2.4, 14, 5, rockM, ROCKS.y), ROCKS.x, ROCKS.z);   // the north rocks
  const pathM = mat(ground(96, 96, { seed: 8, mask: () => 0, dirt: ['#1a140e', '#2b2116', '#3d2f1f', '#4f3e2a'] }));
  scene.add(mesh(new THREE.BoxGeometry(24, .08, 1.9).translate(4, 4.19, -11), pathM));
  // stair up to the headland (terrace → head), a stepped ramp of rock boxes
  for (let i = 0; i < 8; i++) scene.add(mesh(new THREE.BoxGeometry(2.2, .62, 1.2).translate(14.6 + i * .55, 4.3 + i * .6, -14.5 - i * .95), rockM));

  // —— Village + quay + jetty ——
  const houses = [
    house({ x: -12, z: 2, w: 5.6, d: 4.8, h: 4.2, wall: 'wall', roof: 'roof', door: 1.2, windows: [[-1.4, 2.1]], upper: [[.9, 3.4]] }),
    house({ x: -5.5, z: 4.5, w: 5, d: 4.4, h: 4.8, wall: 'wall3', roof: 'roof3', door: -1.1, windows: [[1.1, 2.1]], upper: [[-1, 3.9]] }),   // the post office
    house({ x: 2, z: 6, w: 4.6, d: 4.2, h: 3.8, wall: 'wall2', roof: 'roof2', windows: [[-.8, 2]], side: [[.3, 2.2, 1]] }),
    house({ x: -17.5, z: -4, w: 5, d: 5, h: 5.2, wall: 'wall3', roof: 'roof', windows: [[0, 2.6]], upper: [[0, 4.1]] }),
    house({ x: 9, z: 9, w: 4.4, d: 4, h: 3.6, wall: 'wall2', roof: 'roof3', chimney: false, windows: [[0, 2]] }),                 // the harbour office
    house({ x: -20, z: 6, w: 4.2, d: 4, h: 3.4, wall: 'wall', roof: 'roof2', windows: [[.6, 1.9]] }),
  ];
  houses.forEach(h => scene.add(h));
  const winMats = []; const collectEm = g => g.traverse(o => { const m = o.material; if (m && m.emissive && m.emissive.getHex() !== 0 && !winMats.includes(m)) { m.userData.em0 = m.emissiveIntensity; winMats.push(m); } }); houses.forEach(collectEm);
  const winLights = [[-13, 2.4, 4.6], [-4.6, 2.6, 6.9], [1.6, 2.2, 8.3], [9, 2.1, 11.2], [-19.5, 2, 8.2]].map(([x, y, z]) => { const L = new THREE.PointLight('#ff9d4a', 8, 9, 2); L.position.set(x, y, z); scene.add(L); return L; });
  // post office sign (a small board with a pixel horn/envelope mark) + harbour office sign
  { const P = new PX(24, 10); P.fill((x, y) => (x === 0 || y === 0 || x === 23 || y === 9) ? [40, 30, 20] : (y > 2 && y < 7 && x > 5 && x < 18 && ((x + y) % 3 === 0)) ? [230, 200, 120] : [110, 80, 50]);
    const s = billboard(texOf(P.done()), 1.2, .5, { shadow: false }); s.position.set(-7.6, 3.1, 6.9); scene.add(s); }
  const R = mulberry(12);
  [[-8.5, 7.5], [-1.5, 8.6], [5.3, 8.2], [12.5, 11.2]].forEach(([x, z]) => { const c = crate(.75 + R() * .2); c.position.set(x, .17, z); c.rotation.y = R() * .6; scene.add(c); });
  [[-9.6, 8.6], [-9, 9.2], [6.2, 9.4]].forEach(([x, z]) => { const b = barrel(); b.position.set(x, .17, z); scene.add(b); });
  const deckM = mat(woodPlanks(96, 96, { pw: 5, len: 96, seed: 8 }));
  scene.add(mesh(new THREE.BoxGeometry(3, .22, 15).translate(-3, -.11, 34.5), deckM, { swap: true }));
  for (let z = 28; z <= 41; z += 2.2) for (const x of [-4.3, -1.7]) scene.add(mesh(new THREE.CylinderGeometry(.14, .16, 3.2, 8).translate(x, -1.7, z), MM.beam));
  const lamps = [];
  function lampPost(x, y, z, hgt = 2.8) {
    const g = new THREE.Group(); g.add(box(.14, hgt, .14, MM.plankDark));
    const arm = box(.6, .08, .08, MM.plankDark); arm.position.set(.25, hgt - .15, 0); g.add(arm);
    const lm = new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: '#ffb45a', emissiveIntensity: 4 });
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(.26, .34, .26), lm); lamp.position.set(.5, hgt - .42, 0); g.add(lamp);
    const L = new THREE.PointLight('#ffae55', 13, 13, 2); L.position.set(.5, hgt - .5, 0); g.add(L);
    const gl = glow('#ffb25e', 1.6, 1.2); gl.position.copy(lamp.position); g.add(gl);
    g.position.set(x, y, z); scene.add(g); lamps.push({ g, L, gl, lm }); return g;
  }
  lampPost(-3, 0, 41.2); lampPost(-6.5, .17, 6.2, 3.1); lampPost(11, .17, 7.4, 3);
  const boatM = mat(woodPlanks(64, 64, { pw: 4, len: 64, seed: 21, cols: ['#150d0a', '#2c1b12', '#4a2d1c', '#6b4228'] }));
  { const hull = mesh(new THREE.BoxGeometry(2.1, .7, 4.6), boatM); hull.position.set(.9, SEA_Y + .32, 36); hull.rotation.y = .12; scene.add(hull);
    const bl = glow('#ffb25e', .9, 1); bl.position.set(1.1, SEA_Y + 1.1, 38.1); scene.add(bl); lamps.push({ gl: bl }); }

  // —— Terrace: cottage, wall, pines, grass ——
  const cottage = house({ x: -2, z: -17.5, w: 5.2, d: 4.6, h: 3.6, wall: 'wall', roof: 'roof2', door: 1.1, windows: [[-1.2, 2]], side: [[.4, 2.1, 1]] }); cottage.position.y = 4.27; scene.add(cottage);
  collectEm(cottage);
  const cotL = new THREE.PointLight('#ff9d4a', 9, 9, 2); cotL.position.set(-3.2, 6.5, -14.8); scene.add(cotL); winLights.push(cotL);
  const wallM = mat(rock(96, 96, { seed: 4, cols: ['#15141a', '#26252c', '#383640', '#4b4852'] }));
  scene.add(mesh(new THREE.BoxGeometry(14, .7, .5).translate(2, 4.62, -13.4), wallM));
  const gP = new PX(12, 10); gP.fill((x, y) => { const c = Math.abs(x - 5.5), k = fbm(x * .7, y * .9, 44); return (y > 3 && k > .42 - (9 - y) * .03 && c < 5.5 - Math.abs(y - 9) * .2) ? (k > .55 ? [96, 142, 98] : [58, 98, 66]) : null; });
  const gTex = texOf(gP.done()), RG = mulberry(31), tufts = [];
  for (let i = 0; i < 40; i++) { const a = RG() * Math.PI * 2, r = 4 + RG() * 15, x = 7 + Math.cos(a) * r, z = -15 + Math.sin(a) * r; if (Math.abs(z + 11) < 1.2 && x > -4 && x < 16) continue;
    const b = billboard(gTex, .55 + RG() * .25, .42 + RG() * .2, { shadow: false }); b.position.set(x, 4.27 + .2, z); scene.add(b); tufts.push(b); }
  for (let x = -6; x < 16; x += 1.1) { const b = billboard(gTex, .9, .7, { shadow: false }); b.position.set(x + RG() * .5, 4.27 + .3, -11 + 4.6 + RG() * .8); scene.add(b); tufts.push(b); }
  const pineM = mat(rock(64, 64, { seed: 9, cols: ['#06120c', '#0c1f14', '#12301d', '#1a4226'] }));
  [[-12, -22], [-14.5, -19.5], [16.5, -8.5], [14, -5.5], [-9, -26], [-16, -12]].forEach(([x, z], i) => { const h = 3.6 + (i % 3) * .8; const c = mesh(new THREE.ConeGeometry(1.3, h, 7).translate(0, h / 2 + .4, 0), pineM); c.position.set(x, 4.27, z); scene.add(c);
    scene.add(mesh(new THREE.CylinderGeometry(.14, .18, .5, 6).translate(x, 4.5, z), MM.beam)); });

  // —— The lighthouse (ours) ——
  const tower = new THREE.Group();
  { const P = new PX(48, 112), Wt = ramp(['#8e8c8a', '#bcb8b1', '#dedad1', '#f2eee4']), Tl = ramp(['#0f4a48', '#196e68', '#25908a', '#36aea4']);
    P.fill((x, y) => { const band = y >= 46 && y < 66, v = .55 + (h2(x >> 1, y >> 1, 2) - .5) * .2 - (y % 8 === 0 ? .14 : 0) - (x % 12 === 0 ? .08 : 0); return band ? Tl(v, x, y) : Wt(v, x, y); });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 2.1, 11.5, 16), new THREE.MeshStandardMaterial({ map: texOf(P.done()), roughness: .9 })); body.position.y = 5.75; body.castShadow = body.receiveShadow = true; tower.add(body);
    const gal = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 1.6, .3, 16), new THREE.MeshStandardMaterial({ color: '#1c1c22' })); gal.position.y = 11.6; tower.add(gal);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, p = new THREE.Mesh(new THREE.BoxGeometry(.08, .9, .08), new THREE.MeshStandardMaterial({ color: '#2a2a32' })); p.position.set(Math.cos(a) * 1.95, 12.2, Math.sin(a) * 1.95); tower.add(p); }
    const room = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.7, 8), new THREE.MeshStandardMaterial({ color: '#1a1a20', emissive: '#fff0c0', emissiveIntensity: 0 })); room.position.y = 12.6; tower.add(room);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4a3a2a', metalness: .4, roughness: .5 })); dome.position.y = 13.4; tower.add(dome);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.9, .2), new THREE.MeshStandardMaterial({ color: '#2a1a12' })); door.position.set(0, .95, 2.05); tower.add(door);
    const dlm = new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: '#ffb45a', emissiveIntensity: 3.5 });
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(.2, .26, .2), dlm); doorL.position.set(.9, 2.5, 2.1); tower.add(doorL);
    // the lamp-room clock: a pale face on the gallery wall (for the clock riddle)
    const CP = new PX(12, 12); CP.fill((x, y) => Math.hypot(x - 5.5, y - 5.5) < 5.5 ? ((x === 5 || x === 6) && y > 2 && y < 6 ? [30, 20, 20] : (y === 5 && x > 5 && x < 10 ? [30, 20, 20] : [235, 225, 200])) : null);
    const clock = billboard(texOf(CP.done()), .5, .5, { shadow: false, em: texOf(CP.done()), emCol: '#ffffff', emI: .6 }); clock.position.set(0, 11.0, 2.0); tower.add(clock);
    tower.userData = { room, dlm };
  }
  tower.position.set(LH.x, LH.y, LH.z); scene.add(tower);
  const doorLamp = new THREE.PointLight('#ffae55', 4, 8, 2); doorLamp.position.set(LH.x + .9, LH.y + 2.4, LH.z + 2.6); doorLamp.castShadow = true; doorLamp.shadow.mapSize.set(1024, 1024); doorLamp.shadow.bias = -.004; scene.add(doorLamp);
  const doorGlow = glow('#ffb25e', .7, 1); doorGlow.position.set(LH.x + .9, LH.y + 2.5, LH.z + 2.15); scene.add(doorGlow);
  const lhGlow = glow('#fff2c4', 9, 1.6); lhGlow.position.set(LH.x, LAMP_Y, LH.z); scene.add(lhGlow);
  const lhL = new THREE.PointLight('#ffe6b0', 0, 70, 1.6); lhL.position.copy(lhGlow.position); scene.add(lhL);
  const beams = [0, 1].map(() => { const b = beamCard(150, 1.0, 12, '#fff0c8', { k: .5, fall: 1.4 }); scene.add(b); return b; });
  // the cellar hatch: a dark door set into the headland's south face, at terrace level
  const hatch = new THREE.Group();
  { const d = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, .25), new THREE.MeshStandardMaterial({ color: '#1a1410' })); d.position.y = .8; hatch.add(d);
    const fr = mesh(new THREE.BoxGeometry(1.7, 2.0, .18).translate(0, 1.0, -.08), wallM); hatch.add(fr);
    for (const [x, y] of [[-.35, .6], [.35, .6], [-.35, 1.2], [.35, 1.2]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, .06), new THREE.MeshStandardMaterial({ color: '#8a6a30', emissive: '#6a4a10', emissiveIntensity: .4 })); m.position.set(x, y, .14); hatch.add(m); } }
  hatch.position.set(LH.x - 7.4, 4.27, LH.z + 9.6); hatch.rotation.y = .35; scene.add(hatch);
  // props toggled per shot
  const wreck = new THREE.Group();
  { const hull = mesh(new THREE.BoxGeometry(2.6, 1.0, 6.5), boatM); hull.rotation.set(.1, .5, -.55); wreck.add(hull);
    const mast = mesh(new THREE.CylinderGeometry(.08, .1, 4.5, 6).translate(0, 2.2, 0), MM.beam); mast.rotation.z = -.9; mast.position.set(.4, .3, .5); wreck.add(mast);
    const SP = new PX(8, 12); SP.fill((x, y) => [200 - y * 6, 190 - y * 6, 170 - y * 6]); const sail = billboard(texOf(SP.done()), 1.6, 2.2, { shadow: false }); sail.position.set(1.6, 1.4, .8); wreck.add(sail); }
  wreck.position.set(ROCKS.x + 1, ROCKS.y + .3, ROCKS.z + 1); wreck.visible = false; scene.add(wreck);
  const prints = new THREE.Group();   // footprints on the path (dark decals)
  { const PP = new PX(6, 8); PP.fill((x, y) => (Math.hypot(x - 2.5, y - 4) < 2.6 && y > 1) || (y < 2 && x > 1 && x < 4) ? [20, 14, 10] : null); const pt = texOf(PP.done());
    for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.42, .58), new THREE.MeshBasicMaterial({ map: pt, transparent: true, opacity: 1, depthWrite: false, color: '#c8a020' })); m.rotation.x = -Math.PI / 2; m.rotation.z = -.4; m.position.set(6 + i * .55, 4.25, -11 + (i % 2 ? .18 : -.18)); prints.add(m); } }
  prints.visible = false; scene.add(prints);

  // —— The sea-cave (Chapter 2): sand floor, rock ring with a crack facing the sea, a stair down, the under-lamp, an old foghorn ——
  const cave = new THREE.Group();
  { const sandM = mat(ground(96, 96, { seed: 41, mask: () => 0, dirt: ['#2a2418', '#3d3422', '#52462e', '#6a5a3c'] }));
    const wetM = mat(rock(96, 96, { seed: 42, cols: ['#0a1014', '#121c22', '#1c2a30', '#28383e'] }));
    const floor = mesh(new THREE.CylinderGeometry(11, 11, 1.2, 28).translate(0, -.18, -1.5), sandM); cave.add(floor);
    const shelf = mesh(new THREE.BoxGeometry(14, .6, 4).translate(0, -1.3, 7.5), wetM); cave.add(shelf);   // low wet shelf at the water's edge
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; if (a > 1.05 && a < 1.45) continue;   // the crack (toward the open sea, +x+z)
      const r = 11.5 + (i % 3) * .6, h = 6 + ((i * 7) % 5) * .9, b = mesh(new THREE.BoxGeometry(3.4, h, 2.6).translate(0, h / 2 - 1.5, 0), wetM);
      b.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); b.rotation.y = -a + Math.PI / 2; cave.add(b); }
    for (let i = 0; i < 6; i++) cave.add(mesh(new THREE.BoxGeometry(2.4, .5, 1.1).translate(-8.6 + i * .25, 4.6 - i * .78, -6 + i * .9), wetM));   // stair down from the hatch
    // the under-lamp: a stone plinth, an old brass lantern-house with a lens facing the crack
    const plinth = mesh(new THREE.CylinderGeometry(.9, 1.1, 1.4, 10).translate(3, .7, -2.5), wetM); cave.add(plinth);
    const lensM = new THREE.MeshStandardMaterial({ color: '#2a2418', emissive: '#ffe2a0', emissiveIntensity: 0 });
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .9, 8), lensM); lens.position.set(3, 1.85, -2.5); cave.add(lens);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(.7, .5, 8), new THREE.MeshStandardMaterial({ color: '#6a4a24', metalness: .5, roughness: .5 })); cap.position.set(3, 2.55, -2.5); cave.add(cap);
    // the old foghorn: a brass trumpet on a frame, mouth toward the crack
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(.18, .75, 2.4, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#8a6a2a', metalness: .6, roughness: .4, side: THREE.DoubleSide }));
    horn.rotation.z = -Math.PI / 2; horn.rotation.y = -.7; horn.position.set(-2.5, 1.3, 1.5); cave.add(horn);
    cave.add(mesh(new THREE.BoxGeometry(.3, 1.1, .3).translate(-3.4, .55, 1.0), MM.beam));
    // chests and rope of the wreckers' store
    [[-5, -5], [-4.2, -5.6], [5.5, -6]].forEach(([x, z]) => { const c = crate(.8); c.position.set(x, .42, z); cave.add(c); });
    const uL = new THREE.PointLight('#ffd890', 0, 18, 1.6); uL.position.set(3.4, 1.9, -1.9); uL.castShadow = true; uL.shadow.mapSize.set(1024, 1024); uL.shadow.bias = -.004; cave.add(uL);
    const uG = glow('#ffe2a0', 1.2, 1.0); uG.position.set(3, 1.85, -2.5); cave.add(uG);
    const ub = beamCard(60, .8, 6, '#fff0c8', { k: .5, fall: 1.2 }); scene.add(ub);
    const teal = new THREE.PointLight('#3ad0c0', 0, 14, 2); teal.position.set(0, -.4, 8); cave.add(teal);   // phosphorescent water
    const amb = new THREE.PointLight('#b08a5a', 0, 30, 1.2); amb.position.set(-2, 7, -2); cave.add(amb);   // a soft fill so the cave reads (the 'readability' light)
    cave.userData = { lensM, uL, uG, ub, teal, amb };
  }
  cave.position.set(CAVE.x, 0, CAVE.z); scene.add(cave);
  // a ship at sea (storm nights) and the folded yellow coat on the north rocks
  const ship = new THREE.Group();
  { const hull = mesh(new THREE.BoxGeometry(3.4, 1.4, 9), boatM); hull.position.y = .3; ship.add(hull);
    for (const z of [-2, 2]) ship.add(mesh(new THREE.CylinderGeometry(.1, .12, 7, 6).translate(0, 4, z), MM.beam));
    const sl = glow('#ffb25e', 1.4, 1.2); sl.position.set(0, 2.2, 4.4); ship.add(sl); const sr = glow('#ff5040', .9, 1); sr.position.set(-1.6, 1.4, 0); ship.add(sr); }
  ship.position.set(30, SEA_Y, -78); ship.rotation.y = .5; ship.visible = false; scene.add(ship);
  const coat = new THREE.Group();
  { const CP2 = new PX(12, 6); CP2.fill((x, y) => (y > 0 && x > 0 && x < 11) ? (y < 2 ? [150, 116, 20] : ((x + y) % 4 ? [232, 194, 42] : [200, 160, 30])) : null);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .55), new THREE.MeshLambertMaterial({ map: texOf(CP2.done()), transparent: true, alphaTest: .5 })); c.rotation.x = -Math.PI / 2; c.position.y = .03; coat.add(c); }
  coat.position.set(ROCKS.x - .6, ROCKS.y + .05, ROCKS.z - .8); coat.visible = false; scene.add(coat);
  const barge = new THREE.Group();
  { const hull = mesh(new THREE.BoxGeometry(4.2, 1.2, 10), boatM); hull.position.y = .2; barge.add(hull);
    const cab = mesh(new THREE.BoxGeometry(2.6, 1.8, 3).translate(0, 1.6, -2.4), MM.wall2); barge.add(cab);
    const crane = mesh(new THREE.CylinderGeometry(.12, .14, 5, 6).translate(0, 3.2, 2.2), MM.beam); crane.rotation.x = .5; barge.add(crane);
    const hornB = new THREE.Mesh(new THREE.CylinderGeometry(.12, .5, 1.6, 10, 1, true), new THREE.MeshStandardMaterial({ color: '#8a6a2a', metalness: .6, roughness: .4, side: THREE.DoubleSide })); hornB.rotation.z = -Math.PI / 2; hornB.position.set(1.4, 2.7, -2.4); barge.add(hornB);
    const bl2 = glow('#dfe8ff', 1.0, 1.2); bl2.position.set(0, 2.8, -3.9); barge.add(bl2); }
  barge.position.set(15, SEA_Y, 20); barge.rotation.y = -.3; barge.visible = false; scene.add(barge);
  // Crane's shadow, left on the cave wall (S41+): a dark bowler-hat silhouette with a pale thin smile
  const cshadow = new THREE.Group();
  { const SP = new PX(16, 32); SP.fill((x, yy) => { const y = 31 - yy, head = Math.hypot(x - 7.5, y - 23) < 3.6, hat = (y > 25 && y < 28 && x > 2 && x < 13) || (y >= 27 && y < 31 && x > 4 && x < 11), body = y < 20 && y > 0 && Math.abs(x - 7.5) < 5 - (20 - y) * .06, cane = (x === 14 || x === 13) && y < 15 && y > 0;
      const smile = (y === 21 && x > 4 && x < 11) || (y === 22 && (x === 4 || x === 11)) || (y === 22 && x > 5 && x < 10 && false); if (smile) return [92, 128, 112]; return head || hat || body || cane ? [3, 5, 6] : null; });
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 4.6), new THREE.MeshBasicMaterial({ map: texOf(SP.done()), transparent: true, opacity: .96, depthWrite: false })); sm.position.y = 2.5; cshadow.add(sm); const gl = new THREE.PointLight('#5ad8b8', 16, 8, 1.2); gl.position.set(0, 2.2, 2.2); cshadow.add(gl); }
  cshadow.position.set(CAVE.x + 9.4, .42, CAVE.z + 4.9); cshadow.rotation.y = Math.atan2(-9.4, -4.9); cshadow.visible = false; scene.add(cshadow);
  // three cables behind the lamp room (Ch1 S06): two whole, the third cut through with a bright copper end
  const cables = new THREE.Group();
  { const cm = new THREE.MeshStandardMaterial({ color: '#8a7656', roughness: .5, emissive: '#2a2010', emissiveIntensity: .6 }), cu = new THREE.MeshStandardMaterial({ color: '#d08040', emissive: '#c06020', emissiveIntensity: .8, metalness: .6 });
    [-.42, 0, .42].forEach((x, i) => { if (i < 2) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.9, 6), cm); c.position.set(x, 12.55, 1.22); cables.add(c); }
      else { [[13.15, .7], [12.0, .8]].forEach(([y, h]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, h, 6), cm); c.position.set(x, y, 1.22); cables.add(c); });
        [12.78, 12.42].forEach(y => { const e = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .06, 6), cu); e.position.set(x, y, 1.22); cables.add(e); }); } }); }
  cables.position.set(LH.x, LH.y, LH.z); cables.visible = false; scene.add(cables);
  // a second lantern far along the path (Ch1 S05): shot.farlight = { from: [x,y,z], to: [x,y,z] }
  const farlight = new THREE.Group();
  { const g = glow('#ffc870', 1.1, 1.0); farlight.add(g); const pl = new THREE.PointLight('#ffb860', 6, 6, 1.6); farlight.add(pl); }
  farlight.visible = false; scene.add(farlight);
  // a ring of twelve lanterns on the ground (Ch4): shot.ringAt = [x, y, z, radius]
  const ring = new THREE.Group();
  { const lm = new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: '#ffb45a', emissiveIntensity: 3 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, l = new THREE.Group(); l.add(new THREE.Mesh(new THREE.BoxGeometry(.18, .26, .18), lm)); const g = glow('#ffb25e', .7, 1); l.add(g); l.position.set(Math.cos(a), .14, Math.sin(a)); l.userData.a = a; ring.add(l); }
    [0, 1, 2].forEach(i => { const pl = new THREE.PointLight('#ffae55', 7, 9, 1.6); pl.userData.a = i / 3 * Math.PI * 2; ring.add(pl); }); }
  ring.visible = false; scene.add(ring);
  // a small silver locket on a chain, dragged by whoever has cast spec carry: 'locket' (S20 v2)
  const carried = new THREE.Group();
  { const m = new THREE.MeshStandardMaterial({ color: '#e4e8f0', metalness: .6, roughness: .2, emissive: '#9aa4b8', emissiveIntensity: .9 });
    const lk = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .02, 14), m); lk.rotation.z = Math.PI / 2.4; lk.position.y = .045; carried.add(lk);
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.015, 5, 4), m); b.position.set(.045 + i * .04, .025 + Math.sin(i) * .008, 0); carried.add(b); }
    const gl = glow('#e8f0ff', .06, .22); gl.position.y = .07; carried.add(gl); }   // 2026-11-18 review: a .55 glow read as a grey frying pan
  carried.visible = false; scene.add(carried);
  // puffs (a sneeze, dust): shot.puffs = [{t, at:[x,y,z], n, col, dir:[x,z]}]
  const puffs = []; for (let i = 0; i < 14; i++) { const p = glow('#eef4f8', .22, .9); p.visible = false; scene.add(p); puffs.push(p); }
  // rings on water: shot.rings = [{t, at:[x,y,z], col, r}]
  const ringM = new THREE.MeshBasicMaterial({ color: '#7affc8', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const wring = new THREE.Mesh(new THREE.RingGeometry(.86, 1, 48), ringM); wring.rotation.x = -Math.PI / 2; wring.visible = false; scene.add(wring);
  const wring2 = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 48), ringM.clone()); wring2.rotation.x = -Math.PI / 2; wring2.visible = false; scene.add(wring2);
  const _wp = new THREE.Vector3();
  const PROPS = { ring, wreck, prints, ship, coat, barge, cshadow, cables, farlight };

  // —— Sea, ridges, mist, rain ——
  const SEA = sea(1400, { ppm: 9 }); SEA.mesh.position.y = SEA_Y; scene.add(SEA.mesh);
  [[-300, -520, 520, 60, '#1a2742', 3], [220, -560, 700, 50, '#15213a', 7]].forEach(([x, z, w, h, c, s]) => { const r = ridge(w, h, c, s, { ppm: 1.4 }); r.position.set(x, SEA_Y - 2, z); scene.add(r); });
  const R2 = mulberry(77), dust = [...Array(180)].map(() => [R2() * 60 - 24, R2() * 9, R2() * 50 - 36, R2() * 10]);
  const MIST = particles(dust.length, (i, t, o) => { const d = dust[i]; o.x = d[0] + Math.sin(t * .2 + d[3]) * .8 + t * .18; o.y = d[1] + Math.sin(t * .3 + d[3] * 2) * .3; o.z = d[2]; o.a = .22 + .18 * Math.sin(t * 1.3 + d[3]); o.s = .06; o.r = .7; o.g = .8; o.b = 1; }, { soft: 1 }); scene.add(MIST);
  const RAIN = rain(1400, [-40, 0, -60, 60, 24, 50], { speed: 22, len: .9, opacity: .28 }); RAIN.visible = false; scene.add(RAIN);
  const GP = new PX(6, 3); GP.fill((x, y) => (y === 1 && (x < 2 || x > 3)) || (y === 0 && (x === 2 || x === 3)) ? [230, 230, 236] : null); const gTexG = texOf(GP.done());
  const gulls = [0, 1, 2].map(i => { const b = billboard(gTexG, 1.1, .55, { shadow: false }); scene.add(b); return b; });

  // —— Cast ——
  const cast = {}; for (const k in MAKERS) { cast[k] = MAKERS[k](); cast[k].root.visible = false; scene.add(cast[k].root); }
  const lanternL = new THREE.PointLight('#ffb050', 0, 10, 2); lanternL.castShadow = true; lanternL.shadow.mapSize.set(1024, 1024); lanternL.shadow.bias = -.004; lanternL.shadow.camera.near = .05; scene.add(lanternL);
  const lanternG = glow('#ffc070', 1.1, 1.2); scene.add(lanternG);
  const fill = new THREE.PointLight('#9fb2e8', 1.6, 7, 2); scene.add(fill);
  const fill2 = new THREE.PointLight('#9fb2e8', 1.2, 7, 2); scene.add(fill2);

  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const portrait = aspect < 1;

  // Resolve a character's position/pose for this shot at time t → { x, y, z, pose, flip }
  function block(spec, lt, dur) {
    const u = clamp(lt / Math.max(.01, dur)), at = spec.at, to = spec.to || spec.at;
    const w0 = spec.walk ? spec.walk[0] : 0, w1 = spec.walk ? spec.walk[1] : dur;
    const k = spec.to ? clamp((lt - w0) / Math.max(.01, w1 - w0)) : 0;
    const x = lerp(at[0], to[0], k), z = lerp(at[1], to[1], k), y = spec.y != null ? spec.y : groundY(x, z) + (spec.dy || 0);
    const walking = spec.to && lt > w0 && lt < w1;
    let pose = spec.pose || 'idle'; if (walking) pose = spec.walkPose || (spec.fly ? 'fly' : 'walk');
    if (spec.poses) for (const [tt, p] of spec.poses) if (lt >= tt) pose = p;
    let flip = spec.face === 'l' ? true : spec.face === 'r' ? false : (spec.to ? to[0] < at[0] : false);
    if (spec.faces) for (const [tt, f] of spec.faces) if (lt >= tt) flip = f === 'l';   // turn around mid-shot: faces [[t, 'l'|'r']]
    let jy = 0, sx = 1, sy = 1;   // acting: acts [{t, kind:'sneeze'|'jump'|'flinch'|'shiver'}] → squash & stretch on the sprite
    for (const a of (spec.acts || [])) { const d = lt - a.t; if (d < -.6 || d > 1.2) continue;
      if (a.kind === 'sneeze') { if (d < 0) { const w = 1 + d / .6; sy *= 1 + .14 * w; sx *= 1 - .06 * w; } else if (d < .5) { const e = Math.exp(-d * 7); sy *= 1 - .22 * e; sx *= 1 + .18 * e; jy += .08 * Math.sin(Math.min(1, d / .25) * Math.PI) * (1 - d * 2); } }
      else if (a.kind === 'jump' && d >= 0 && d < .45) jy += .35 * Math.sin(d / .45 * Math.PI);
      else if (a.kind === 'flinch' && d >= 0 && d < .6) { const e = Math.exp(-d * 6); sx *= 1 - .1 * e; jy += .05 * e; }
      else if (a.kind === 'shiver' && d >= 0) sx *= 1 + .03 * Math.sin(d * 60); }
    return { x, y: y + jy, z, pose, flip, sx, sy, hidden: spec.hide != null && lt >= spec.hide, lit: spec.lit ?? 1 };
  }

  function update(t, shot, cam, post, renderer) {
    const lt = t - shot.a, dur = shot.b - shot.a, TM = TIMES[shot.time || 'night'];
    // —— Time of day ——
    scene.fog.color.set(TM.fog); scene.fog.density = TM.fogD;
    SK.u.top.value.set(TM.top); SK.u.mid.value.set(TM.mid); SK.u.hor.value.set(TM.hor); SK.u.k.value = 1;
    ST.visible = TM.star > 0; if (ST.material.uniforms.t) ST.material.uniforms.t.value = t;
    sun.color.set(TM.sun); sun.intensity = TM.sunI; sun.position.set(...TM.sunPos); hemi.color.set(TM.hemi[0]); hemi.groundColor.set(TM.hemi[1]); hemi.intensity = TM.hemi[2];
    renderer.toneMappingExposure = TM.exp;
    const prac = TM.prac;
    winLights.forEach((L, i) => { const dc = cam.position.distanceTo(L.position); L.intensity = 8 * prac * Math.min(1, dc / 14) ** 2 * (1 + .04 * Math.sin(t * 3 + i)); });   // windows near the lens stop blowing out
    const winNear = Math.min(1, Math.min(...winLights.map(L => cam.position.distanceTo(L.position))) / 11);   // close to any window: dim all window glass so it does not bloom
    winMats.forEach(m => { m.emissiveIntensity = (m.userData.em0 * prac * .7) * (.05 + .95 * winNear * winNear) + .05; m.color.setScalar(prac > 0 ? 1 : .45); });
    if (post && post.vig) { post.vig.uniforms.warm.value = { day: .22, dawn: .18, dusk: .26, night: .1, storm: .04, cave: .08 }[shot.time || 'night'] ?? .1; }
    lamps.forEach((L, i) => { const near = L.gl ? Math.min(1, cam.position.distanceTo(L.gl.getWorldPosition(_wp)) / 26) : 1; if (L.L) L.L.intensity = 12 * prac * flick(t, 5 + i * 3) * (.3 + .7 * near); if (L.gl) L.gl.material.opacity = prac * near; if (L.lm) L.lm.emissiveIntensity = 4 * prac * (.12 + .88 * near * near); });
    doorLamp.intensity = 4 * prac * flick(t, 2); doorGlow.material.opacity = prac; tower.userData.dlm.emissiveIntensity = 3.5 * prac;
    MIST.visible = TM.prac > .3; MIST.userData.update(t);
    RAIN.visible = shot.weather === 'rain' || shot.time === 'storm'; if (RAIN.visible) { RAIN.userData.update(t, [-6, 0]); }
    for (const k in PROPS) PROPS[k].visible = !!(shot.props && shot.props.includes(k));
    prints.children.forEach(m => m.material.color.set(shot.printsCol || '#c8a020'));
    prints.position.set(...(shot.printsAt ? [shot.printsAt[0] - 8.2, shot.printsAt[1] - 4.25, shot.printsAt[2] + 11] : [0, 0, 0]));   // move the footprint trail (default: the cliff path)
    if (shot.ringAt) { const [rx, ry, rz, rr] = shot.ringAt; ring.visible = true; ring.position.set(rx, ry, rz); ring.children.forEach(c => { const a = c.userData.a; c.position.set(Math.cos(a) * rr * (c.isLight ? .8 : 1), c.isLight ? 1.2 : .14, Math.sin(a) * rr * (c.isLight ? .8 : 1)); }); }
    if (shot.lightsOut != null) {   // the village lights die one by one from shot-time lightsOut (windows, lamp posts, then the window glass)
      const k0 = lt - shot.lightsOut; winLights.forEach((L, i) => { if (k0 > i * .9) L.intensity = 0; });
      lamps.forEach((L, i) => { if (k0 > .45 + i * .9) { if (L.L) L.L.intensity = 0; if (L.gl) L.gl.material.opacity = 0; if (L.lm) L.lm.emissiveIntensity = 0; } });
      const f = Math.max(0, 1 - Math.max(0, k0) / 5); winMats.forEach(m => { m.emissiveIntensity *= f; }); }
    puffs.forEach(p => p.visible = false); let pi = 0;
    for (const f of (shot.puffs || [])) { const d = lt - f.t; if (d < 0 || d > 1.0) continue; const n = f.n || 6, dir = f.dir || [1, 0];
      for (let i = 0; i < n && pi < puffs.length; i++, pi++) { const p = puffs[pi], a = (i / n - .5) * 1.4, sp = (.5 + (i % 3) * .25) * (f.speed || 1);
        p.visible = true; p.position.set(f.at[0] + (dir[0] * Math.cos(a) - dir[1] * Math.sin(a)) * d * sp, f.at[1] + d * .25 + Math.sin(i) * .05, f.at[2] + (dir[1] * Math.cos(a) + dir[0] * Math.sin(a)) * d * sp);
        p.material.opacity = (f.op || .7) * (1 - d); p.scale.setScalar((f.size || .22) * (1 + d * 2.2)); if (f.col) p.material.color.set(f.col); } }
    [wring, wring2].forEach(w => w.visible = false);
    (shot.rings || []).forEach((r, i) => { const d = lt - r.t, w = [wring, wring2][i % 2]; if (d < 0 || d > 2.6) return; w.visible = true; w.position.set(r.at[0], r.at[1], r.at[2]);
      const sc = (r.r || 2.4) * (.15 + d * .9); w.scale.set(sc, sc, sc); w.material.opacity = .9 * Math.max(0, 1 - d / 2.6); if (r.col) w.material.color.set(r.col);
      if (d > .45) { const w2 = [wring, wring2][(i + 1) % 2]; w2.visible = true; w2.position.copy(w.position); const s2 = (r.r || 2.4) * (.1 + (d - .45) * .9); w2.scale.set(s2, s2, s2); w2.material.opacity = .6 * Math.max(0, 1 - (d - .45) / 2.2); } });
    if (shot.farlight) { farlight.visible = true; const f = shot.farlight, k = clamp(lt / dur); farlight.position.set(f.from[0] + (f.to[0] - f.from[0]) * k, f.from[1] + (f.to[1] - f.from[1]) * k + Math.sin(t * 2.4) * .08, f.from[2] + (f.to[2] - f.from[2]) * k); }
    { const C2 = cave.userData, inCave = shot.time === 'cave', ul = inCave ? (shot.under == null ? 0 : (typeof shot.under === 'number' ? (lt > shot.under ? 1 : 0) : (shot.under === 'on' ? 1 : 0))) : 0;
      C2.lensM.emissiveIntensity = ul * 1.8 * flick(t, 13); C2.uL.intensity = ul * 12 * flick(t, 13); C2.uG.material.opacity = ul; C2.teal.intensity = inCave ? 3 : 0; C2.amb.intensity = inCave ? 22 : 0;
      C2.ub.visible = ul > 0; if (ul > 0) { const o = new THREE.Vector3(CAVE.x + 3, 1.85, CAVE.z - 2.5), dir = new THREE.Vector3(.6, -.02, .8).normalize(); C2.ub.userData.aim(o, dir, cam); C2.ub.material.uniforms.k.value = .35 * ul; C2.ub.material.uniforms.t.value = t; } }
    // identity guard (2026-11-18 frame review: Rollo turned green under the cave's teal water light). Each character keeps a little of
    // its own colour as self-light so coloured practicals tint it without changing who it is. Gus keeps his lantern emissive map.
    { const self = shot.time === 'cave' ? .32 : (TM.prac > 0 ? .12 : 0);
      for (const k in cast) { const m = cast[k].mesh && cast[k].mesh.material; if (!m || k === 'gus') continue;
        if (!m.userData.selfLit) { if (m.emissiveMap) { m.userData.selfLit = 'own'; continue; } m.emissiveMap = m.map; m.emissive.set('#ffffff'); m.userData.selfLit = 1; m.needsUpdate = true; }
        if (m.userData.selfLit === 1) m.emissiveIntensity = self * (k === 'stranger' ? .35 : 1); } }
    if (barge.visible) { barge.position.y = SEA_Y + Math.sin(t * 1.1) * .12; }
    if (ship.visible) { ship.position.y = SEA_Y + Math.sin(t * 1.3) * .25; ship.rotation.z = Math.sin(t * .9) * .06; }
    gulls.forEach((g, i) => { const vis = TM.prac < .5; g.visible = vis; if (vis) { const a = t * .25 + i * 2.1; g.position.set(-6 + Math.cos(a) * (14 + i * 3), 12 + i * 1.5 + Math.sin(t * 1.3 + i) * .4, 2 + Math.sin(a) * (10 + i * 2)); g.rotation.y = Math.atan2(cam.position.x - g.position.x, cam.position.z - g.position.z); } });

    // —— Cast blocking ——
    const B = {}; let hero = null; carried.visible = false;
    for (const k in cast) cast[k].root.visible = false;
    for (const k in (shot.cast || {})) {
      const c = cast[k]; if (!c) continue; const b = block(shot.cast[k], lt, dur); B[k] = b;
      c.root.visible = !b.hidden; c.root.position.set(b.x, b.y, b.z); c.frame(poseFrame(k, b.pose, t, k.length)); c.root.scale.set(b.sx, b.sy, b.sx);
      if (shot.cast[k].carry) { carried.visible = !b.hidden; carried.position.set(b.x + (b.flip ? .32 : -.32), b.y + .05, b.z); } c.mesh.castShadow = shot.cast[k].shadow ?? (k !== 'stranger' && k !== 'shade');
      if (!hero || shot.cast[k].hero) hero = k;
    }
    // framing rule (2026-11-18 audit): close-ups ('dive') aim at the FACE, so the face sits mid-frame, clear of the Shorts top bar and the captions
    const EYE = { rollo: .2, mabel: .32, pip: .3 }, FACE = { rollo: .22, mabel: .4, pip: .32 }, aimY = k => shot.cast[k].eye ?? (shot.cam.type === 'dive' ? (FACE[k] ?? 1.3) : (EYE[k] ?? .8));
    const heroP = hero ? new THREE.Vector3(B[hero].x, B[hero].y + aimY(hero), B[hero].z) : V(shot.cam.at || [LH.x, LH.y + 6, LH.z]);

    // —— Camera presets (portrait: higher and closer, subject lower in frame) ——
    const C = shot.cam || { type: 'map' }, cd = shot.camEnd || dur, u = ss(clamp(lt / cd)), lin = clamp(lt / cd);   // camEnd: the last shot holds still under the question + outro
    const pm = portrait ? 1 : 1; let pos, look, fov = C.fov || 30;
    if (C.type === 'map') {
      const P0 = C.from || [-62, 58, 86], P1 = C.to || [-52, 50, 72], L0 = C.look || [6, 3, -6], L1 = C.look2 || C.look || [8, 4, -9];
      pos = V(P0).lerp(V(P1), lin); look = V(L0).lerp(V(L1), lin); fov = C.fov || (portrait ? 44 : 36);
    } else if (C.type === 'track') {   // lateral tracking of the hero; the camera leads a little
      const side = C.side || 'south', s = side === 'south' ? 1 : -1, lead = (B[hero] && B[hero].flip ? -1 : 1) * (C.lead ?? 2.2);
      const h = (C.h ?? 5.6) * (portrait ? 1.15 : 1), d = (C.d ?? 14);
      pos = new THREE.Vector3(heroP.x + lead, B[hero].y + h, heroP.z + s * d); look = new THREE.Vector3(heroP.x + lead * .35, heroP.y + (portrait ? -.2 : .1), heroP.z); fov = (C.fov || 28) * (portrait ? 1.4 : 1);
    } else {   // 'stage' | 'dive' | 'top' | 'orbit': polar around the target
      const tgt = C.at ? V(C.at) : heroP.clone();
      const az0 = (C.az ? C.az[0] : 35) * Math.PI / 180, az1 = (C.az ? (C.az[1] ?? C.az[0]) : (C.az0 ?? 35)) * Math.PI / 180;
      const defaults = { stage: [10, 5.2], dive: [7.5, 3.0], top: [.01, 30], orbit: [12, 7] }[C.type] || [10, 5.2];
      const d0 = (C.d ? C.d[0] : defaults[0]), d1 = (C.d ? (C.d[1] ?? C.d[0]) : defaults[0]), h0 = (C.h ? C.h[0] : defaults[1]), h1 = (C.h ? (C.h[1] ?? C.h[0]) : defaults[1]);
      const pk = portrait ? [1, 1.15] : [1, 1], ue = C.ease === 'in' ? lin * lin : C.ease === 'out' ? 1 - (1 - lin) * (1 - lin) : C.ease === 'lin' ? lin : u;
      let zk = 1; if (C.punch) { const d = lt - C.punch.t; zk = d < -.25 ? 1 : d < 0 ? 1 + .04 * (1 + d / .25) : d < .2 ? lerp(1.04, C.punch.k || .5, (d / .2) ** 2) : (C.punch.k || .5) * (1 + .03 * Math.exp(-(d - .2) * 9) * Math.cos((d - .2) * 30)); }   // crash zoom: wind back 4 %, punch in over 0.2 s, settle
      const az = lerp(az0, az1, C.type === 'orbit' ? lin : ue), d = lerp(d0, d1, ue) * pk[0] * zk, h = lerp(h0, h1, ue) * pk[1] * (C.punch ? (.6 + .4 * zk) : 1);
      pos = new THREE.Vector3(tgt.x + Math.sin(az) * d, tgt.y + h, tgt.z + Math.cos(az) * d);
      look = tgt.clone().add(V(C.lookOff || [0, portrait ? -.3 : 0, 0]));
      if (C.type === 'top') look = tgt.clone().add(new THREE.Vector3(0, -1, .001));
      fov = (C.fov || 30) * (portrait ? 1.45 : 1);
    }
    if (C.drift) { pos.x += Math.sin(t * .3) * C.drift; pos.z += Math.cos(t * .23) * C.drift * .5; }
    for (const sh of [...(C.shake || []), ...(C.punch && C.punch.shake ? [{ t: C.punch.t + .2, amp: C.punch.shake }] : [])]) { const d = lt - sh.t; if (d > 0 && d < .6) { const e = (sh.amp || .08) * Math.exp(-d * 9); pos.x += Math.sin(d * 97) * e; pos.y += Math.cos(d * 83) * e; look.x += Math.sin(d * 71) * e * .5; } }
    cam.position.copy(pos); cam.fov = fov; cam.aspect = aspect; cam.updateProjectionMatrix(); cam.lookAt(look);
    for (const k in B) cast[k].face(cam, B[k].flip);   // after the camera, so the first frame of a cut is right
    tufts.forEach((b, i) => { b.rotation.y = Math.atan2(cam.position.x - b.position.x, cam.position.z - b.position.z); b.rotation.z = Math.sin(t * 1.7 + i) * .06; });

    // —— The lamp ——
    const LS = shot.lamp == null ? (TM.lamp ? 'on' : 'off') : shot.lamp;
    let lh = 0;
    if (LS === 'on') lh = 1;
    else if (typeof LS === 'object') {
      if (LS.flicker != null) { const f0 = LS.flicker, f1 = f0 + (LS.len || .8); lh = lt < f0 ? 1 : lt < f1 ? [.25, 1, .12, .65, .04][Math.min(4, Math.floor((lt - f0) / (f1 - f0) * 5))] : (LS.back != null && lt > LS.back ? 1 : 0); }
      else if (LS.out != null) lh = lt < LS.out ? 1 : (LS.back != null && lt > LS.back ? 1 : 0);
      else if (LS.on_at != null) lh = lt > LS.on_at ? 1 : 0;
    }
    const lampVis = lh * (TM.prac > 0 ? 1 : .55);   // in daylight the lamp reads as a pale disc + faint beam
    const nearLamp = Math.min(1, cam.position.distanceTo(lhGlow.position) / 22); lhGlow.material.opacity = lampVis * (.25 + .75 * nearLamp); lhGlow.scale.setScalar(9 * (.6 + .4 * lh) * (TM.prac > 0 ? 1 : .6)); lhL.intensity = lh * 900 * (TM.prac > 0 ? 1 : .2) * (.3 + .7 * nearLamp); tower.userData.room.material.emissiveIntensity = lh * 6;
    let face = 0;
    beams.forEach((bm, i) => { const ang = t * .5 + i * Math.PI, dir = new THREE.Vector3(Math.cos(ang), -.04, Math.sin(ang)); const side = bm.userData.aim(lhGlow.position, dir, cam);
      bm.visible = lh > .02; bm.material.uniforms.k.value = .2 * lh * Math.pow(side, 1.5) * (TM.prac > 0 ? 1 : .35); bm.material.uniforms.t.value = t;
      const toward = dir.dot(cam.position.clone().sub(lhGlow.position).normalize()); face = Math.max(face, Math.pow(Math.max(0, toward), 30)); });
    lhGlow.scale.multiplyScalar(1 + face * 1.4 * lh);
    const nearTower = cam.position.distanceTo(new THREE.Vector3(LH.x, LH.y, LH.z)) < 40;
    const dark = (TM.prac > 0 && nearTower) ? (1 - lh) * (LS === 'off' ? 0 : 1) : 0;   // the dying lamp darkens its own headland
    hemi.intensity *= 1 - .45 * dark; sun.intensity *= 1 - .4 * dark; renderer.toneMappingExposure *= 1 - .2 * dark;
    // lightning: events [{t, kind:'flash'}] relative to the shot
    let fl = 0; for (const e of (shot.events || [])) if (e.kind === 'flash') { const d = lt - e.t; if (d > 0) fl = Math.max(fl, d < .15 ? 1 : d < .25 ? .3 : d < .31 ? .9 : Math.exp(-(d - .31) / .25)); }
    if (fl > 0) { hemi.intensity += 1.6 * fl; sun.intensity += 1.2 * fl; renderer.toneMappingExposure += .35 * fl; SK.u.k.value = 1 + 1.5 * fl; }

    SEA.u.t.value = t; SEA.u.camPos.value.copy(cam.position); SEA.u.fogColor.value.copy(scene.fog.color); SEA.u.fogDensity.value = scene.fog.density; if (SEA.u.bright) SEA.u.bright.value = TM.seaBright;
    SEA.setLights([{ p: lhGlow.position, c: new THREE.Color('#fff0c8'), i: lh * 1.2 * prac }, { p: new THREE.Vector3(-2.5, 2.4, 41.2), c: new THREE.Color('#ffae55'), i: .8 * prac }, { p: new THREE.Vector3(1.1, .4, 38), c: new THREE.Color('#ffb45a'), i: .4 * prac }, { p: new THREE.Vector3(-4.6, 2.5, 7), c: new THREE.Color('#ff9d4a'), i: .35 * prac }]);

    // —— Gus's lantern (key light wherever he is); fills in front of the two nearest characters ——
    const gus = cast.gus, gb = B.gus;
    if (gb && gus.root.visible) {
      const fr = poseFrame('gus', gb.pose, t, 3), lp = gus.lanternPos(fr, gb.flip), toCam = cam.position.clone().sub(lp).setY(0).normalize().multiplyScalar(.45);
      const lit = (shot.cast.gus.lit ?? (TM.prac > 0 ? 1 : 0));
      lanternL.position.copy(lp).add(toCam); lanternL.intensity = 2.6 * lit * flick(t, 9); lanternG.position.copy(lp); lanternG.material.opacity = .8 * lit; gus.mesh.material.emissiveIntensity = 2.2 * Math.max(.15, lit);
    } else { lanternL.intensity = 0; lanternG.material.opacity = 0; }
    const fills = [fill, fill2]; let fi = 0;
    for (const k in B) { if (fi >= 2) break; const b = B[k], toC = cam.position.clone().sub(new THREE.Vector3(b.x, b.y, b.z)).setY(0).normalize().multiplyScalar(2.2); fills[fi].position.set(b.x + toC.x, b.y + 1.6, b.z + toC.z); fills[fi].intensity = TM.prac > 0 ? 2.4 : .6; fills[fi].color.set(TM.prac > 0 ? '#9fb2e8' : '#fff4e0'); fi++; }
    for (; fi < 2; fi++) fills[fi].intensity = 0;

    // —— Focus ——
    post.dof.focus = cam.position.distanceTo(C.type === 'map' ? V(C.focus || [LH.x, LH.y + 6, LH.z]) : heroP);
    post.dof.aper = C.aper || { map: 520, track: 380, stage: 260, dive: 140, top: 300, orbit: 260 }[C.type] || 260; post.dof.maxCoc = 22;
    return { hero: hero ? cast[hero].root : null, fixedBand: C.type === 'map' ? (C.band ?? .42) : null, dbg: sun.intensity.toFixed(2) + '/' + hemi.intensity.toFixed(2) + '/' + renderer.toneMappingExposure.toFixed(2) + '/' + scene.fog.color.getHexString() };
  }
  return { scene, update, cast };
}
