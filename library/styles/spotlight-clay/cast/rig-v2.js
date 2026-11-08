// Clay stickman rig for spotlight-clay (original): sphere head, capsule torso and limbs, tiny ink face.
// Pose angles are in radians; positive = forward (towards the figure's +z). Feet are kept on the floor automatically.
import * as THREE from 'three';

export const DIM = { head: .13, torso: .5, thigh: .42, shin: .42, upper: .3, fore: .28, r: .034 };
const cap = (len, r, mat) => { const g = new THREE.CapsuleGeometry(r, len, 6, 14); g.translate(0, -len / 2, 0); const m = new THREE.Mesh(g, mat); m.castShadow = true; return m; };
const lerp = (a, b, k) => a + (b - a) * k;

export function makePerson({ color = 0x8f8f95, emissive = 0x000000, glow = 0, hair = null } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: .82, metalness: 0, emissive, emissiveIntensity: glow });
  const ink = new THREE.MeshBasicMaterial({ color: 0x121214 });
  const root = new THREE.Group(), hips = new THREE.Group(), torso = new THREE.Group(), head = new THREE.Group();
  root.add(hips); hips.add(torso);
  const tm = cap(DIM.torso, .05, mat); tm.geometry.translate(0, DIM.torso, 0); torso.add(tm);
  head.position.y = DIM.torso + .07; torso.add(head);
  const hm = new THREE.Mesh(new THREE.SphereGeometry(DIM.head, 32, 24), mat); hm.position.y = DIM.head; hm.castShadow = true; head.add(hm);
  const eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(.013, 10, 8), ink); e.scale.set(1, 1.35, .5); e.position.set(s * .045, DIM.head + .02, DIM.head * .93); head.add(e); return e; });
  const brows = [-1, 1].map(s => { const b = new THREE.Mesh(new THREE.BoxGeometry(.04, .008, .01), ink); b.position.set(s * .047, DIM.head + .065, DIM.head * .9); head.add(b); return b; });
  // v2: a mouth that can smile, go flat, or turn down (three tiny arcs, one visible at a time)
  const arc = (bend) => { const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12 - .5; pts.push(new THREE.Vector3(u * .07, -bend * (1 - 4 * u * u) * .018, 0)); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, .0045, 6, false), ink); m.position.set(0, DIM.head - .045, DIM.head * .96); head.add(m); return m; };
  const mouths = { smile: arc(1), flat: arc(0), sad: arc(-1) };
  if (hair === 'bun') { const b = new THREE.Mesh(new THREE.SphereGeometry(.06, 16, 12), mat); b.position.set(0, DIM.head * 1.9, -.05); head.add(b); }
  const arm = s => { const sh = new THREE.Group(); sh.position.set(s * .075, DIM.torso - .06, 0); torso.add(sh);
    sh.add(cap(DIM.upper, DIM.r, mat)); const el = new THREE.Group(); el.position.y = -DIM.upper; sh.add(el);
    el.add(cap(DIM.fore, DIM.r * .95, mat)); const hand = new THREE.Mesh(new THREE.SphereGeometry(.042, 14, 10), mat); hand.position.y = -DIM.fore; hand.castShadow = true; el.add(hand);
    return { sh, el, hand }; };
  const leg = s => { const hp = new THREE.Group(); hp.position.set(s * .07, 0, 0); hips.add(hp);
    hp.add(cap(DIM.thigh, DIM.r * 1.1, mat)); const kn = new THREE.Group(); kn.position.y = -DIM.thigh; hp.add(kn);
    kn.add(cap(DIM.shin, DIM.r, mat)); const ft = cap(.09, DIM.r * 1.05, mat); ft.rotation.x = Math.PI / 2; ft.position.set(0, -DIM.shin, .0); kn.add(ft);
    return { hp, kn, ft }; };
  const A = [arm(-1), arm(1)], L = [leg(-1), leg(1)];
  root.userData = { hips, torso, head, A, L, eyes, brows, mat, mouths };
  return root;
}

export const POSE = {
  stand:  { lean: .02, headP: 0, headY: 0, aL: [.05, .12, .1], aR: [.05, .12, .1], lL: [0, .02], lR: [0, .02], drop: 0 },
  crouch: { lean: .55, headP: .3, headY: 0, aL: [1.05, .25, .12], aR: [1.05, .25, .12], lL: [1.25, 2.0], lR: [1.15, 1.9], drop: 0 },
  carry:  { lean: -.08, headP: -.05, headY: 0, aL: [.85, 1.25, .18], aR: [.85, 1.25, .18], lL: [.15, .3], lR: [-.05, .1], drop: 0 },
  place:  { lean: .3, headP: .25, headY: 0, aL: [1.35, .25, .1], aR: [1.35, .25, .1], lL: [.45, .55], lR: [-.15, .1], drop: 0 },
  nod:    { lean: .04, headP: .35, headY: 0, aL: [.05, .15, .1], aR: [.05, .15, .1], lL: [0, .02], lR: [0, .02], drop: 0 },
  thumb:  { lean: .0, headP: -.05, headY: 0, aL: [.05, .12, .1], aR: [.5, 1.7, .15], lL: [0, .02], lR: [.05, .05], drop: 0 },
  ask:    { lean: .12, headP: .1, headY: 0, aL: [.05, .15, .1], aR: [1.25, .35, .05], lL: [.1, .1], lR: [-.05, .05], drop: 0 },
  slump:  { lean: -.3, headP: .8, headY: 0, aL: [.95, .5, .22], aR: [.95, .5, .22], lL: [1.95, 2.5], lR: [1.85, 2.4], drop: 0 },
  sitAway:{ lean: .3, headP: .6, headY: 0, aL: [1.1, .7, .15], aR: [1.1, .7, .15], lL: [1.95, 2.5], lR: [1.9, 2.45], drop: 0 },
  look:   { lean: -.15, headP: -.5, headY: 0, aL: [.95, .5, .25], aR: [.95, .5, .25], lL: [1.95, 2.5], lR: [1.85, 2.4], drop: 0 },
  rise:   { lean: .65, headP: .1, headY: 0, aL: [1.1, .3, .25], aR: [1.1, .3, .25], lL: [1.4, 2.1], lR: [1.0, 1.6], drop: 0 },
  push:   { lean: .42, headP: -.15, headY: 0, aL: [1.75, .1, .05], aR: [1.75, .1, .05], lL: [.25, .35], lR: [-.55, .05], drop: 0 },
  reach:  { lean: .15, headP: -.05, headY: 0, aL: [.1, .2, .1], aR: [1.45, .15, .05], lL: [.25, .2], lR: [-.2, .05], drop: 0 },
  hold:   { lean: .05, headP: .12, headY: 0, aL: [.1, .2, .1], aR: [1.1, .9, -.15], lL: [.05, .05], lR: [0, .02], drop: 0 },
  lift:   { lean: -.05, headP: -.3, headY: 0, aL: [.15, .2, .1], aR: [.15, .2, .1], lL: [.0, .02], lR: [.0, .02], drop: 0 },
};
export function mixPose(a, b, k) {
  const o = {};
  for (const key in a) { if (key === 'mood') continue; o[key] = Array.isArray(a[key]) ? a[key].map((v, i) => lerp(v, b[key][i], k)) : lerp(a[key], b[key] ?? a[key], k); }
  o.mood = k < .5 ? (a.mood || 'neutral') : (b.mood || 'neutral');
  return o;
}
export function walkPose(ph, amp = 1) {
  const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2);
  return { lean: .06, headP: 0, headY: 0, aL: [-.35 * s * amp, .25, .1], aR: [.35 * s * amp, .25, .1],
    lL: [.42 * s * amp, (.12 + .55 * Math.max(0, c)) * amp], lR: [-.42 * s * amp, (.12 + .55 * Math.max(0, -c)) * amp], drop: Math.abs(s) * .025 * amp };
}
export function applyPose(P, p, blink = 0) {
  const U = P.userData;
  U.torso.rotation.x = p.lean; U.head.rotation.x = p.headP; U.head.rotation.y = p.headY || 0;
  [p.aL, p.aR].forEach((a, i) => { const s = i ? 1 : -1; U.A[i].sh.rotation.set(-a[0], 0, s * a[2]); U.A[i].el.rotation.x = -a[1]; });
  [p.lL, p.lR].forEach((l, i) => { U.L[i].hp.rotation.x = -l[0]; U.L[i].kn.rotation.x = l[1]; U.L[i].ft.rotation.x = Math.PI / 2 - (l[1] - l[0]); });
  // keep the lower foot on the floor: vertical drop of each leg = thigh·cos(h) + shin·cos(h − k)
  const drop = l => DIM.thigh * Math.cos(l[0]) + DIM.shin * Math.cos(l[0] - l[1]);
  U.hips.position.y = Math.max(drop(p.lL), drop(p.lR)) + .035 - (p.drop || 0);
  U.eyes.forEach(e => e.scale.y = blink ? .15 : 1.35);
  // mood: brows tilt (inner ends up = sad/worried, down = strain), mouth shape
  const mood = p.mood || 'neutral', tilt = { sad: .45, worried: .3, strain: -.35, relief: .15, smile: 0, neutral: 0 }[mood] ?? 0;
  U.brows.forEach((b, i) => { b.rotation.z = (i ? -1 : 1) * tilt; b.position.y = DIM.head + .065 + (mood === 'strain' ? -.008 : mood === 'sad' ? .004 : 0); });
  const mshape = { sad: 'sad', worried: 'sad', strain: 'flat', relief: 'smile', smile: 'smile', neutral: 'flat' }[mood] || 'flat';
  for (const k in U.mouths) U.mouths[k].visible = k === mshape;
}
