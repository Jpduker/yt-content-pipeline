// spotlight-clay CAST v1 (2026-11-08): a MALE and a FEMALE clay figure that read apart at a glance, from every side.
// Built on the v2 rig (rig-v2.js: same joints, POSE / walkPose / applyPose all work unchanged) plus body shape, hair and outfit.
// Readability rules (Jp, v2 feedback "no clear male vs female"):
//   silhouette first: HIM = broad shoulders, straight torso, short hair, trousers;  HER = narrow shoulders, wider hips,
//   A-line skirt, long hair falling down the back + a ponytail, lashes;   colour second: HIM cool slate-blue top, HER warm terracotta.
// Every body part is ALSO registered as a collision capsule (userData.caps) so CHECK() can measure overlaps (see collide.js).
import * as THREE from 'three';
import { DIM, makePerson } from './rig-v2.js';

const M = (color, rough = .82) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
export const LOOK = {
  him: { skin: 0xd9c2a8, top: 0x4f6b8c, bottom: 0x2f3440, hair: 0x2a2220, shoulders: .1, hips: .062, torsoR: .062 },
  her: { skin: 0xe2c6ac, top: 0xc0603f, bottom: 0xc0603f, hair: 0x3a2418, shoulders: .068, hips: .082, torsoR: .05 },
};

export function makeCast(kind = 'him', o = {}) {
  const L = { ...LOOK[kind], ...o };
  const P = makePerson({ color: L.skin });
  const U = P.userData, head = U.head;
  // --- body shape: move shoulders / hips apart or together
  U.A.forEach((a, i) => { a.sh.position.x = (i ? 1 : -1) * L.shoulders; });
  U.L.forEach((l, i) => { l.hp.position.x = (i ? 1 : -1) * L.hips; });
  // --- clothes: recolour torso/limb meshes (rig-v2 makes them with one shared material; give each part its own)
  const top = M(L.top), bottom = M(L.bottom), skin = U.mat;
  const torsoMesh = U.torso.children.find(c => c.isMesh);
  torsoMesh.material = top; torsoMesh.scale.set(L.torsoR / .05, 1, L.torsoR / .05);
  U.A.forEach(a => { a.sh.children.filter(c => c.isMesh).forEach(m => m.material = top); a.el.children.filter(c => c.isMesh && c !== a.hand).forEach(m => m.material = kind === 'her' ? skin : top); });
  U.L.forEach(l => { l.hp.children.filter(c => c.isMesh).forEach(m => m.material = kind === 'her' ? skin : bottom); l.kn.children.filter(c => c.isMesh).forEach(m => m.material = kind === 'her' ? skin : bottom); });
  const hairM = M(L.hair, .7), shoe = M(kind === 'him' ? 0x5a3a26 : 0x2a2226, .6);
  U.L.forEach(l => { l.ft.material = shoe; });
  // shoulders yoke: a flattened capsule across the top of the torso makes the shoulder line read (wider on him)
  const yoke = new THREE.Mesh(new THREE.CapsuleGeometry(.045, L.shoulders * 2, 6, 12), top); yoke.rotation.z = Math.PI / 2; yoke.position.y = DIM.torso - .045; yoke.scale.z = .9; yoke.castShadow = true; U.torso.add(yoke);
  if (kind === 'him') {
    // short hair: a cap over the top/back of the head + a side-swept fringe
    const cap = new THREE.Mesh(new THREE.SphereGeometry(DIM.head * 1.06, 32, 20, 0, Math.PI * 2, 0, Math.PI * .42), hairM);
    cap.position.y = DIM.head + .004; cap.rotation.x = -.55; cap.castShadow = true; head.add(cap);
    const fringe = new THREE.Mesh(new THREE.CapsuleGeometry(.03, .09, 4, 10), hairM); fringe.rotation.set(.5, 0, 1.25); fringe.position.set(.03, DIM.head + .105, DIM.head * .74); head.add(fringe);
    // belt line
    const belt = new THREE.Mesh(new THREE.TorusGeometry(L.torsoR * 1.02, .012, 6, 24), M(0x1d1f24)); belt.rotation.x = Math.PI / 2; belt.position.y = .03; U.torso.add(belt);
  } else {
    // long hair: crown cap + a curtain down the back to the shoulder blades + side locks + a ponytail that swings (userData.tail)
    const cap = new THREE.Mesh(new THREE.SphereGeometry(DIM.head * 1.07, 32, 20, 0, Math.PI * 2, 0, Math.PI * .46), hairM);
    cap.position.y = DIM.head + .004; cap.rotation.x = -.5; cap.castShadow = true; head.add(cap);
    const back = new THREE.Mesh(new THREE.CapsuleGeometry(DIM.head * .92, .2, 8, 16), hairM); back.scale.set(1, 1, .45); back.position.set(0, DIM.head - .1, -.06); back.castShadow = true; head.add(back);
    [-1, 1].forEach(s => { const lock = new THREE.Mesh(new THREE.CapsuleGeometry(.03, .17, 4, 10), hairM); lock.position.set(s * DIM.head * .9, DIM.head - .06, .02); lock.rotation.z = s * .08; lock.castShadow = true; head.add(lock); });
    const tie = new THREE.Group(); tie.position.set(0, DIM.head * 1.55, -DIM.head * .85); head.add(tie);
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(.035, .2, 6, 12), hairM); tail.geometry.translate(0, -.13, 0); tail.castShadow = true; tie.add(tail); U.tail = tie;
    tie.add(new THREE.Mesh(new THREE.TorusGeometry(.03, .009, 6, 14), M(0xe8b43a)));
    // lashes: three tiny ink flicks per eye
    const ink = new THREE.MeshBasicMaterial({ color: 0x121214 });
    U.eyes.forEach((e, i) => { for (let k = 0; k < 2; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(.016, .004, .004), ink); l.position.set((i ? 1 : -1) * (.058 + k * .006), DIM.head + .037 - k * .004, DIM.head * .9); l.rotation.z = (i ? -1 : 1) * (.6 + k * .3); head.add(l); } });
    // A-line skirt (open cone frustum) from the waist to just above the knee
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(.07, .2, .3, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0x8a3b2a, roughness: .85, side: THREE.DoubleSide }));
    sk.position.y = -.12; sk.castShadow = true; U.hips.add(sk); U.skirt = sk;
  }
  // --- collision capsules (local segment endpoints on named groups; collide.js turns them into world space each frame)
  U.caps = [
    { name: 'torso', g: U.torso, a: [0, .02, 0], b: [0, DIM.torso - .02, 0], r: Math.max(L.torsoR, .05) },
    { name: 'shoulders', g: U.torso, a: [-L.shoulders, DIM.torso - .045, 0], b: [L.shoulders, DIM.torso - .045, 0], r: .045 },
    { name: 'head', g: U.head, a: [0, DIM.head, 0], b: [0, DIM.head + .001, 0], r: DIM.head * 1.05 },
    ...U.A.flatMap((a, i) => [{ name: `upper${i}`, g: a.sh, a: [0, 0, 0], b: [0, -DIM.upper, 0], r: DIM.r }, { name: `fore${i}`, g: a.el, a: [0, 0, 0], b: [0, -DIM.fore, 0], r: .042 }]),
    ...U.L.flatMap((l, i) => [{ name: `thigh${i}`, g: l.hp, a: [0, 0, 0], b: [0, -DIM.thigh, 0], r: DIM.r * 1.1 }, { name: `shin${i}`, g: l.kn, a: [0, 0, 0], b: [0, -DIM.shin, 0], r: DIM.r }]),
  ];
  if (kind === 'her') U.caps.push({ name: 'skirt', g: U.hips, a: [0, -.02, 0], b: [0, -.24, 0], r: .15 });
  U.kind = kind;
  return P;
}
// ponytail / skirt follow-through: call each frame with the figure's horizontal velocity (m/s) and time
export function secondary(P, vx = 0, t = 0) {
  const U = P.userData;
  if (U.tail) { U.tail.rotation.x = .35 + Math.min(.6, Math.abs(vx) * .4) + Math.sin(t * 5.2) * .05; U.tail.rotation.z = Math.sin(t * 3.1) * .12 - vx * .15; }
  if (U.skirt) { U.skirt.rotation.x = -vx * .08 + Math.sin(t * 4.4) * .015; }
}
