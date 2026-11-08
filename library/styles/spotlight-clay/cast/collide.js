// CHECK pass for spotlight-clay (Jp v2 feedback: "characters/objects pass THROUGH each other").
// Every frame: world-space capsules of every figure (makeCast userData.caps) vs each other, and vs box obstacles (bricks, props).
// Reports every pair that interpenetrates by more than `tol` metres. A render is only allowed when the whole film reports 0.
//   import { checkFrame } from './collide.js';  window.CHECK = t => { render(t); return checkFrame(figures, boxes); };
//   figures: [{ name, P }]  (P = makeCast(...));  boxes: [{ name, mesh, half: [x,y,z] }]  (axis-aligned in the mesh's local frame)
import * as THREE from 'three';
const v = () => new THREE.Vector3();
const A = v(), B = v(), C = v(), D = v(), P1 = v(), P2 = v(), Q = v();
export function worldCaps(P) {
  P.updateMatrixWorld(true);
  return P.userData.caps.map(c => ({ name: c.name, r: c.r, a: v().fromArray(c.a).applyMatrix4(c.g.matrixWorld), b: v().fromArray(c.b).applyMatrix4(c.g.matrixWorld) }));
}
// closest distance between segments p1q1 and p2q2 (Ericson, Real-Time Collision Detection 5.1.9)
export function segSeg(p1, q1, p2, q2) {
  const d1 = A.subVectors(q1, p1), d2 = B.subVectors(q2, p2), r = C.subVectors(p1, p2);
  const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r); let s, t;
  if (a <= 1e-9 && e <= 1e-9) return p1.distanceTo(p2);
  if (a <= 1e-9) { s = 0; t = Math.min(1, Math.max(0, f / e)); }
  else { const c = d1.dot(r);
    if (e <= 1e-9) { t = 0; s = Math.min(1, Math.max(0, -c / a)); }
    else { const b = d1.dot(d2), den = a * e - b * b; s = den > 1e-9 ? Math.min(1, Math.max(0, (b * f - c * e) / den)) : 0; t = (b * s + f) / e;
      if (t < 0) { t = 0; s = Math.min(1, Math.max(0, -c / a)); } else if (t > 1) { t = 1; s = Math.min(1, Math.max(0, (b - c) / a)); } } }
  P1.copy(p1).addScaledVector(d1, s); P2.copy(p2).addScaledVector(d2, t); return P1.distanceTo(P2);
}
// capsule vs oriented box: sample the segment, measure distance to the box in the box's local frame
const inv = new THREE.Matrix4();
function segBox(a, b, r, box) {
  inv.copy(box.mesh.matrixWorld).invert(); let best = 1e9;
  for (let i = 0; i <= 8; i++) {
    Q.lerpVectors(a, b, i / 8).applyMatrix4(inv);
    const dx = Math.max(Math.abs(Q.x) - box.half[0], 0), dy = Math.max(Math.abs(Q.y) - box.half[1], 0), dz = Math.max(Math.abs(Q.z) - box.half[2], 0);
    const inside = Math.abs(Q.x) < box.half[0] && Math.abs(Q.y) < box.half[1] && Math.abs(Q.z) < box.half[2];
    const d = inside ? -Math.min(box.half[0] - Math.abs(Q.x), box.half[1] - Math.abs(Q.y), box.half[2] - Math.abs(Q.z)) : Math.hypot(dx, dy, dz);
    best = Math.min(best, d - r);
  }
  return best;                                                       // < 0 means the capsule pokes into the box by that much
}
export function checkFrame(figures, boxes = [], tol = .004) {
  const out = [], W = figures.map(f => ({ name: f.name, caps: worldCaps(f.P) }));
  for (let i = 0; i < W.length; i++) for (let j = i + 1; j < W.length; j++)
    for (const c1 of W[i].caps) for (const c2 of W[j].caps) { const pen = c1.r + c2.r - segSeg(c1.a, c1.b, c2.a, c2.b); if (pen > tol) out.push({ a: `${W[i].name}.${c1.name}`, b: `${W[j].name}.${c2.name}`, depth: +pen.toFixed(3) }); }
  boxes.forEach(bx => bx.mesh.updateMatrixWorld(true));
  for (const f of W) for (const c of f.caps) for (const bx of boxes) { const d = segBox(c.a, c.b, c.r, bx); if (-d > tol) out.push({ a: `${f.name}.${c.name}`, b: bx.name, depth: +(-d).toFixed(3) }); }
  return out;
}
