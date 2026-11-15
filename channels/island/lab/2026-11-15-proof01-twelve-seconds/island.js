// The Keeper's Island: one diorama, three cameras. Shore village + jetty (sea level), grass terrace with the keeper's cottage and the
// cliff path, and the headland with OUR lighthouse (white tower, one teal band, copper dome). Night, cold moon vs amber practicals.
import * as THREE from 'three';
import { PX, ramp, hex, h2, fbm, texOf, cobbles, rock, woodPlanks, ground, billboard, glow, blob, mulberry } from '/styles/hd-2d/demo/px.js';
import { mats, mat, mesh, box, house, crate, barrel, ridge } from '/styles/hd-2d/demo/kit.js';
import { sky, stars, sea, particles, beamCard, flick } from '/styles/hd-2d/demo/fx.js';
import { makeGus, makeMabel, SPX } from './cast.js';
import { T } from './story.js';
import { clamp, seg, ss, lerp, track } from '/core/lib.js';

const SEA_Y = -1.3;
const LH = { x: 21, y: 9, z: -24 };            // lighthouse foot (headland top)
const LAMP_Y = LH.y + 13.3;                     // lamp height
const PATH = { z: -11, y: 4, x0: -1.5, x1: 9 }; // Gus's walk on the terrace

// Rough cylinder (rock/land), radius jittered per column so nothing reads as a perfect drum
function landDisc(rTop, rBot, h, segs, seed, tex, yTop) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, segs, 3), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + (fbm(Math.cos(a) * 3 + 5, Math.sin(a) * 3 + 5, seed, 3) - .5) * .22; p.setX(i, x * k); p.setZ(i, z * k); }
  g.computeVertexNormals(); g.translate(0, yTop - h / 2, 0);
  return mesh(g, tex);
}

export function buildIsland() {
  const scene = new THREE.Scene(), MM = mats();
  scene.fog = new THREE.FogExp2('#141f36', .0095);
  const SK = sky({ moonDir: new THREE.Vector3(.45, .32, -1), top: '#040716', mid: '#0e1a3a', hor: '#27405e' }); scene.add(SK.mesh);
  const ST = stars(1100, 11); scene.add(ST);

  // —— Lights: one cold moon with shadows, hemisphere fill ——
  const moon = new THREE.DirectionalLight('#8aa4de', .85); moon.position.set(-25, 60, 50); moon.target.position.set(8, 2, -14);
  moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 220 }); moon.shadow.bias = -.0006; moon.shadow.normalBias = .02;
  scene.add(moon, moon.target);
  const hemi = new THREE.HemisphereLight('#36497a', '#0a0a12', .7); scene.add(hemi);

  // —— Land: shore disc (y 0), grass terrace (y 4), headland (y 9) ——
  const rockM = mat(rock(128, 128, { seed: 7, cols: ['#0e0e14', '#1c1b22', '#2b2932', '#3c3a44', '#514e58'] }));
  const grassM = mat(ground(128, 128, { seed: 3, grass: ['#0a1410', '#112218', '#182f20', '#213e28', '#2c4e32'] }));
  const shoreM = mat(cobbles(96, 96, { seed: 5, cols: ['#14141a', '#23232b', '#33323c', '#45444f', '#5a5863'] }));
  const shore = landDisc(34, 38, 3.2, 28, 1, rockM, 0); shore.position.set(4, 0, -6); scene.add(shore);
  const shoreTop = landDisc(33.6, 33.6, .3, 28, 1, shoreM, .15); shoreTop.position.set(4, 0, -6); scene.add(shoreTop);
  const terrace = landDisc(21, 25, 4.2, 24, 2, rockM, 4); terrace.position.set(7, 0, -15); scene.add(terrace);
  const terraceTop = landDisc(20.7, 20.7, .3, 24, 2, grassM, 4.15); terraceTop.position.set(7, 0, -15); scene.add(terraceTop);
  const head = landDisc(8.5, 12.5, 5.2, 18, 3, rockM, 9); head.position.set(LH.x, 0, LH.z); scene.add(head);
  const headTop = landDisc(8.3, 8.3, .3, 18, 3, grassM, 9.15); headTop.position.set(LH.x, 0, LH.z); scene.add(headTop);
  // Dirt path across the terrace (a flat strip of trodden ground)
  const pathM = mat(ground(96, 96, { seed: 8, mask: () => 0, dirt: ['#1a140e', '#2b2116', '#3d2f1f', '#4f3e2a'] }));
  const path = mesh(new THREE.BoxGeometry(24, .08, 1.9).translate(4, PATH.y + .19, PATH.z), pathM); scene.add(path);

  // —— Shore village (five houses) + quay + jetty ——
  const houses = [
    house({ x: -12, z: 2, w: 5.6, d: 4.8, h: 4.2, wall: 'wall', roof: 'roof', door: 1.2, windows: [[-1.4, 2.1]], upper: [[.9, 3.4]] }),
    house({ x: -5.5, z: 4.5, w: 5, d: 4.4, h: 4.8, wall: 'wall3', roof: 'roof3', door: -1.1, windows: [[1.1, 2.1]], upper: [[-1, 3.9]] }),
    house({ x: 2, z: 6, w: 4.6, d: 4.2, h: 3.8, wall: 'wall2', roof: 'roof2', windows: [[-.8, 2]], side: [[.3, 2.2, 1]] }),
    house({ x: -17.5, z: -4, w: 5, d: 5, h: 5.2, wall: 'wall3', roof: 'roof', windows: [[0, 2.6]], upper: [[0, 4.1]] }),
    house({ x: 9, z: 9, w: 4.4, d: 4, h: 3.6, wall: 'wall2', roof: 'roof3', chimney: false, windows: [[0, 2]] }),
  ];
  houses.forEach(hh => scene.add(hh));
  const winLights = [[-13, 2.4, 4.6], [-4.6, 2.6, 6.9], [1.6, 2.2, 8.3], [9, 2.1, 11.2]].map(([x, y, z]) => { const L = new THREE.PointLight('#ff9d4a', 8, 9, 2); L.position.set(x, y, z); scene.add(L); return L; });
  const R = mulberry(12);
  [[-8.5, 7.5], [-1.5, 8.6], [5.3, 8.2]].forEach(([x, z]) => { const c = crate(.75 + R() * .2); c.position.set(x, 0, z); c.rotation.y = R() * .6; scene.add(c); });
  [[-9.6, 8.6], [-9, 9.2], [6.2, 9.4]].forEach(([x, z]) => { const b = barrel(); b.position.set(x, 0, z); scene.add(b); });
  // Jetty out to the south
  const deckM = mat(woodPlanks(96, 96, { pw: 5, len: 96, seed: 8 }));
  const deck = mesh(new THREE.BoxGeometry(3, .22, 15).translate(-3, -.11, 34.5), deckM, { swap: true }); scene.add(deck);
  for (let z = 28; z <= 41; z += 2.2) for (const x of [-4.3, -1.7]) scene.add(mesh(new THREE.CylinderGeometry(.14, .16, 3.2, 8).translate(x, -1.7, z), MM.beam));
  // Jetty lamp + the keeper's cottage lamp
  const lamps = [];
  function lampPost(x, y, z, hgt = 2.8) {
    const g = new THREE.Group(); g.add(box(.14, hgt, .14, MM.plankDark));
    const arm = box(.6, .08, .08, MM.plankDark); arm.position.set(.25, hgt - .15, 0); g.add(arm);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(.26, .34, .26), new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: '#ffb45a', emissiveIntensity: 4 })); lamp.position.set(.5, hgt - .42, 0); g.add(lamp);
    const L = new THREE.PointLight('#ffae55', 13, 13, 2); L.position.set(.5, hgt - .5, 0); g.add(L);
    const gl = glow('#ffb25e', 1.6, 1.2); gl.position.copy(lamp.position); g.add(gl);
    g.position.set(x, y, z); scene.add(g); lamps.push({ g, L }); return g;
  }
  lampPost(-3, 0, 41.2); lampPost(-6.5, 0, 6.2, 3.1);
  // Moored rowing boat (hull = planks, a pixel lamp on the bow)
  { const hull = mesh(new THREE.BoxGeometry(2.1, .7, 4.6), mat(woodPlanks(64, 64, { pw: 4, len: 64, seed: 21, cols: ['#150d0a', '#2c1b12', '#4a2d1c', '#6b4228'] })));
    hull.position.set(.9, SEA_Y + .32, 36); hull.rotation.y = .12; scene.add(hull);
    const bl = glow('#ffb25e', .9, 1); bl.position.set(1.1, SEA_Y + 1.1, 38.1); scene.add(bl); }

  // —— Keeper's cottage on the terrace, path-side lamp, a stone wall ——
  const cottage = house({ x: -2, z: -17.5, w: 5.2, d: 4.6, h: 3.6, wall: 'wall', roof: 'roof2', door: 1.1, windows: [[-1.2, 2]], side: [[.4, 2.1, 1]] }); cottage.position.y = PATH.y; scene.add(cottage);
  const cotL = new THREE.PointLight('#ff9d4a', 9, 9, 2); cotL.position.set(-3.2, PATH.y + 2.2, -14.8); scene.add(cotL);
  const wallM = mat(rock(96, 96, { seed: 4, cols: ['#15141a', '#26252c', '#383640', '#4b4852'] }));
  scene.add(mesh(new THREE.BoxGeometry(14, .7, .5).translate(2, PATH.y + .35, PATH.z - 2.4), wallM));

  // —— Grass tufts (billboards), pines ——
  const gP = new PX(12, 10); gP.fill((x, y) => { const c = Math.abs(x - 5.5), k = fbm(x * .7, y * .9, 44); return (y > 3 && k > .42 - (9 - y) * .03 && c < 5.5 - Math.abs(y - 9) * .2) ? (k > .55 ? [96, 142, 98] : [58, 98, 66]) : null; });
  const gTex = texOf(gP.done());
  const RG = mulberry(31), tufts = [];
  for (let i = 0; i < 40; i++) { const a = RG() * Math.PI * 2, r = 4 + RG() * 15, x = 7 + Math.cos(a) * r, z = -15 + Math.sin(a) * r; if (Math.abs(z - PATH.z) < 1.2 && x > -4 && x < 16) continue;
    const b = billboard(gTex, .55 + RG() * .25, .42 + RG() * .2, { shadow: false }); b.position.set(x, PATH.y + .3, z); scene.add(b); tufts.push(b); }
  // Foreground tufts between the tracking camera and the path (they blur into dark shapes)
  for (let x = -6; x < 16; x += 1.1) { const b = billboard(gTex, .9, .7, { shadow: false }); b.position.set(x + RG() * .5, PATH.y + .3, PATH.z + 4.6 + RG() * .8); scene.add(b); tufts.push(b); }
  const pineM = mat(rock(64, 64, { seed: 9, cols: ['#06120c', '#0c1f14', '#12301d', '#1a4226'] }));
  [[-12, -22], [-14.5, -19.5], [16.5, -8.5], [14, -5.5], [-9, -26]].forEach(([x, z], i) => { const h = 3.6 + (i % 3) * .8, c = mesh(new THREE.ConeGeometry(1.3, h, 7).translate(0, h / 2 + .4, 0), pineM); c.position.set(x, PATH.y, z); scene.add(c);
    scene.add(mesh(new THREE.CylinderGeometry(.14, .18, .5, 6).translate(x, PATH.y + .25, z), MM.beam)); });

  // —— The lighthouse (ours): white tower, one teal band, octagonal lamp room, copper dome ——
  const tower = new THREE.Group();
  { const P = new PX(48, 112), Wt = ramp(['#8e8c8a', '#bcb8b1', '#dedad1', '#f2eee4']), Tl = ramp(['#0f4a48', '#196e68', '#25908a', '#36aea4']);
    P.fill((x, y) => { const band = y >= 46 && y < 66, v = .55 + (h2(x >> 1, y >> 1, 2) - .5) * .2 - (y % 8 === 0 ? .14 : 0) - (x % 12 === 0 ? .08 : 0); return band ? Tl(v, x, y) : Wt(v, x, y); });
    const tm = new THREE.MeshStandardMaterial({ map: texOf(P.done()), roughness: .9 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 2.1, 11.5, 16), tm); body.position.y = 5.75; body.castShadow = true; body.receiveShadow = true; tower.add(body);
    const gal = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 1.6, .3, 16), new THREE.MeshStandardMaterial({ color: '#1c1c22' })); gal.position.y = 11.6; tower.add(gal);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, p = new THREE.Mesh(new THREE.BoxGeometry(.08, .9, .08), new THREE.MeshStandardMaterial({ color: '#2a2a32' })); p.position.set(Math.cos(a) * 1.95, 12.2, Math.sin(a) * 1.95); tower.add(p); }
    const room = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.7, 8), new THREE.MeshStandardMaterial({ color: '#1a1a20', emissive: '#fff0c0', emissiveIntensity: 0 })); room.position.y = 12.6; tower.add(room);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4a3a2a', metalness: .4, roughness: .5 })); dome.position.y = 13.4; tower.add(dome);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.9, .2), new THREE.MeshStandardMaterial({ color: '#2a1a12' })); door.position.set(0, .95, 2.05); tower.add(door);
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(.2, .26, .2), new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: '#ffb45a', emissiveIntensity: 3.5 })); doorL.position.set(.9, 2.5, 2.1); tower.add(doorL);
    tower.userData.room = room;
  }
  tower.position.set(LH.x, LH.y, LH.z); scene.add(tower);
  const doorLamp = new THREE.PointLight('#ffae55', 4, 8, 2); doorLamp.position.set(LH.x + .9, LH.y + 2.4, LH.z + 2.6); doorLamp.castShadow = true; doorLamp.shadow.mapSize.set(1024, 1024); doorLamp.shadow.bias = -.004; scene.add(doorLamp);
  const doorGlow = glow('#ffb25e', .7, 1); doorGlow.position.set(LH.x + .9, LH.y + 2.5, LH.z + 2.15); scene.add(doorGlow);
  const lhGlow = glow('#fff2c4', 9, 1.6); lhGlow.position.set(LH.x, LAMP_Y, LH.z); scene.add(lhGlow);
  const lhL = new THREE.PointLight('#ffe6b0', 0, 70, 1.6); lhL.position.copy(lhGlow.position); scene.add(lhL);
  const beams = [0, 1].map(() => { const b = beamCard(150, 1.0, 12, '#fff0c8', { k: .5, fall: 1.4 }); scene.add(b); return b; });

  // —— Sea, distant ridges, mist ——
  const SEA = sea(1400, { ppm: 9 }); SEA.mesh.position.y = SEA_Y; scene.add(SEA.mesh);
  [[-300, -520, 520, 60, '#1a2742', 3], [220, -560, 700, 50, '#15213a', 7]].forEach(([x, z, w, h, c, s]) => { const r = ridge(w, h, c, s, { ppm: 1.4 }); r.position.set(x, SEA_Y - 2, z); scene.add(r); });
  const R2 = mulberry(77), dust = [...Array(180)].map(() => [R2() * 60 - 24, R2() * 9, R2() * 50 - 36, R2() * 10]);
  const MIST = particles(dust.length, (i, t, o) => { const d = dust[i]; o.x = d[0] + Math.sin(t * .2 + d[3]) * .8 + t * .18; o.y = d[1] + Math.sin(t * .3 + d[3] * 2) * .3; o.z = d[2]; o.a = .22 + .18 * Math.sin(t * 1.3 + d[3]); o.s = .06; o.r = .7; o.g = .8; o.b = 1; }, { soft: 1 });
  scene.add(MIST);

  // —— Cast ——
  const gus = makeGus(), mabel = makeMabel(); scene.add(gus.root, mabel.root);
  const lanternL = new THREE.PointLight('#ffb050', 0, 10, 2); lanternL.castShadow = true; lanternL.shadow.mapSize.set(1024, 1024); lanternL.shadow.bias = -.004; lanternL.shadow.camera.near = .05; scene.add(lanternL);
  const lanternG = glow('#ffc070', 1.1, 1.2); scene.add(lanternG);
  const fill = new THREE.PointLight('#9fb2e8', 1.6, 7, 2); scene.add(fill);

  // —— Cameras (a vocabulary from the style: map-push, lateral tracking, medium-high 3/4) ——
  const DOOR = { x: LH.x + .4, z: LH.z + 3.6 };   // Gus at the door
  const cams = {
    wide: { p: track([[3.6, [-62, 58, 86]], [12.2, [-52, 50, 72]]]), l: track([[3.6, [6, 3, -6]], [12.2, [8, 4, -9]]]), fov: 36, aper: 520 },
    path: { fov: 30, aper: 380 },
    door: { p: track([[20, [DOOR.x + 4.5, LH.y + 7, DOOR.z + 12]], [26.4, [DOOR.x + 3.8, LH.y + 6.6, DOOR.z + 11]], [31, [DOOR.x + 3, LH.y + 9.5, DOOR.z + 15]]]), l: track([[20, [DOOR.x - .6, LH.y + 1.4, DOOR.z - .8]], [26.4, [DOOR.x - .6, LH.y + 1.6, DOOR.z - 1]], [31, [DOOR.x - .3, LH.y + 4.5, DOOR.z - 1.5]]]), fov: 30, aper: 170 },
  };

  function update(t, shot, cam, post, renderer) {
    // —— Gus's position (needed by the tracking camera) ——
    let gx = PATH.x0, gz = PATH.z, gy = PATH.y, walking = false, gflip = false, gf = 'idle0', mf = 'sit0', mx = gx - 1.4, mz = gz + .35, my = gy, mflip = false;
    const step8 = Math.floor(t * 8);
    if (shot.id === 'path') { const u = ss(seg(t, shot.a, shot.b)); gx = lerp(PATH.x0, PATH.x1, (t - shot.a) / (shot.b - shot.a)); walking = true; gf = ['w0', 'w1', 'w2', 'w3'][Math.floor(t * 8.5) % 4]; mx = gx - 1.5; mf = ['w0', 'w1', 'w2', 'w3'][Math.floor(t * 11) % 4]; }
    if (shot.id === 'door') {
      gx = DOOR.x; gz = DOOR.z; gy = LH.y; gflip = true;   // facing the tower (left)
      const lookT = t > 21.4;
      gf = lookT ? (step8 % 31 === 0 ? 'lookBlink' : (Math.floor(t * 1.4) % 2 ? 'lookUp1' : 'lookUp')) : (Math.floor(t * 1.4) % 2 ? 'idle1' : 'idle0');
      if (t > T.lhOut + .4) gf = Math.floor(t * 1.2) % 2 ? 'look1' : 'look';   // lantern lowered, still staring up
      mx = DOOR.x + 1.1; mz = DOOR.z + .2; my = LH.y; mflip = true; mf = step8 % 27 === 0 ? 'sitBlink' : (Math.floor(t * .9) % 2 ? 'sit1' : 'sit0');
    }
    gus.root.position.set(gx, gy, gz); gus.frame(gf); gus.face(cam, gflip);
    mabel.root.position.set(mx, my, mz); mabel.frame(mf); mabel.face(cam, mflip);
    gus.root.visible = mabel.root.visible = shot.id !== 'wide';

    // —— Camera ——
    const C = cams[shot.id] || cams.door;
    if (shot.id === 'path') { cam.position.set(gx + 2.4, PATH.y + 5.6, PATH.z + 14); cam.fov = 28; cam.updateProjectionMatrix(); cam.lookAt(gx + .8, PATH.y + .9, PATH.z); }
    else { cam.position.set(...C.p(t)); cam.fov = C.fov; cam.updateProjectionMatrix(); cam.lookAt(...C.l(t)); }
    SK.u.k.value = 1; ST.material.uniforms.t.value = t;
    SEA.u.t.value = t; SEA.u.camPos.value.copy(cam.position); SEA.u.fogColor.value.copy(scene.fog.color); SEA.u.fogDensity.value = scene.fog.density;
    winLights.forEach((L, i) => L.intensity = 8 * (1 + .04 * Math.sin(t * 3 + i)));
    lamps.forEach((L, i) => { L.L.intensity = 12 * flick(t, 5 + i * 3); });
    doorLamp.intensity = 4 * flick(t, 2); MIST.userData.update(t);
    tufts.forEach((b, i) => { b.rotation.y = Math.atan2(cam.position.x - b.position.x, cam.position.z - b.position.z); b.rotation.z = Math.sin(t * 1.7 + i) * .06; });

    // —— The lamp: turning all along, flickers at T.lhFlicker, dark from T.lhOut ——
    let lh = 1;
    if (t > T.lhFlicker && t < T.lhOut) { const u = (t - T.lhFlicker) / (T.lhOut - T.lhFlicker); lh = (u < .22 ? .25 : u < .4 ? 1 : u < .6 ? .12 : u < .72 ? .65 : .04) * (1 - u * .5); }
    else if (t >= T.lhOut) lh = 0;
    lhGlow.material.opacity = lh; lhGlow.scale.setScalar(9 * (.6 + .4 * lh)); lhL.intensity = lh * 900; tower.userData.room.material.emissiveIntensity = lh * 6;
    let face = 0;
    beams.forEach((bm, i) => { const ang = t * .5 + i * Math.PI, dir = new THREE.Vector3(Math.cos(ang), -.04, Math.sin(ang)); const side = bm.userData.aim(lhGlow.position, dir, cam);
      bm.visible = lh > .02; bm.material.uniforms.k.value = .2 * lh * Math.pow(side, 1.5); bm.material.uniforms.t.value = t;
      const toward = dir.dot(cam.position.clone().sub(lhGlow.position).normalize()); face = Math.max(face, Math.pow(Math.max(0, toward), 30)); });
    lhGlow.scale.multiplyScalar(1 + face * 1.4 * lh);
    // The world dims with the lamp in the door shot (the lamp was the headland's key); Gus's lantern stays
    const dark = shot.id === 'door' ? 1 - lh : 0;
    hemi.intensity = .7 - .45 * dark; moon.intensity = .85 - .5 * dark; renderer.toneMappingExposure = 1.15 - .25 * dark; SK.u.k.value = 1 - .45 * dark;

    const lights = [{ p: lhGlow.position, c: new THREE.Color('#fff0c8'), i: lh * 1.2 }, { p: new THREE.Vector3(-2.5, 2.4, 41.2), c: new THREE.Color('#ffae55'), i: .8 }, { p: new THREE.Vector3(1.1, .4, 38), c: new THREE.Color('#ffb45a'), i: .4 }, { p: new THREE.Vector3(-4.6, 2.5, 7), c: new THREE.Color('#ff9d4a'), i: .35 }];
    SEA.setLights(lights);

    // —— Gus's lantern: key light and the thing that survives ——
    const lp = gus.lanternPos(gf, gflip), toCam = cam.position.clone().sub(lp).setY(0).normalize().multiplyScalar(.45);
    lanternL.position.copy(lp).add(toCam); lanternL.intensity = gus.root.visible ? 2.6 * flick(t, 9) : 0; lanternG.position.copy(lp); lanternG.material.opacity = gus.root.visible ? .8 : 0;
    fill.position.set(gx + (gflip ? -.4 : .4), gy + 1.6, gz + 2.2); fill.intensity = gus.root.visible ? 1.7 : 0;

    // —— Focus ——
    if (shot.id === 'wide') { post.dof.focus = cam.position.distanceTo(new THREE.Vector3(LH.x, LH.y + 6, LH.z)); }
    else post.dof.focus = cam.position.distanceTo(new THREE.Vector3(gx, gy + .8, gz));
    post.dof.aper = C.aper; post.dof.maxCoc = 22;
  }
  return { scene, update };
}
