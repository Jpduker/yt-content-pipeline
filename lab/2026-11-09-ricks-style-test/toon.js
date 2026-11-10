// Afterhour-look character kit v2: big white egg head with a painted face, bean torso, stick legs, mitt hands,
// ridged hair, BLACK INK OUTLINE on every part (inverted hull). Our own cast; outfit + hair = identity.
import * as THREE from 'three';

export const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .7, metalness: 0, ...o });
const INK = new THREE.MeshBasicMaterial({ color: 0x0b0b10, side: THREE.BackSide });
export function ink(m, w = .035) {           // outline shell: same geometry, scaled out along normals
  const g = m.geometry.clone(); const p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * w, p.getY(i) + n.getY(i) * w, p.getZ(i) + n.getZ(i) * w);
  const o = new THREE.Mesh(g, INK); o.castShadow = false; m.add(o); return m;
}
export const part = (geo, mat, w = .03, sh = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = sh; m.receiveShadow = true; return ink(m, w); };

// ---------- face painter (front of a SphereGeometry is u = .25 → x = 256 of 1024)
const CACHE = new Map();
export function face(expr = 'smug', o = {}) {
  const look = o.look || [0, 0], blink = o.blink ? 1 : 0, spec = o.spec || '', anger = o.anger ? 1 : 0;
  const key = [expr, look.join(','), blink, spec, anger, o.talk ? 1 : 0].join('|');
  if (CACHE.has(key)) return CACHE.get(key);
  const W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#f3f1ec'; g.fillRect(0, 0, W, H);
  const cx = 256 + look[0] * 16, cy = 250 + look[1] * 10; g.lineCap = 'round'; g.lineJoin = 'round';
  const gray = '#5e5e66', dark = '#24242b';
  const E = { smug: ['lid', 'flat', 'smirk'], grin: ['lid', 'flat', 'teeth'], evil: ['lid', 'down', 'teeth'], annoyed: ['lid', 'down', 'flat'],
    happy: ['arc', 'up', 'teeth'], shock: ['open', 'up', 'o'], neutral: ['dot', 'flat', 'flat'], side: ['side', 'flat', 'flat'] }[expr] || ['dot', 'flat', 'flat'];
  // brows: thick soft gray bars
  g.strokeStyle = gray; g.lineWidth = 15;
  [-1, 1].forEach(s => { const x0 = cx + s * 30, x1 = cx + s * 82; let y0 = cy - 46, y1 = cy - 46;
    if (E[1] === 'down') { y0 += 10; y1 -= 6; } if (E[1] === 'up') { y0 -= 10; y1 -= 6; }
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
  // eyes
  [-1, 1].forEach(s => { const x = cx + s * 56;
    if (blink || E[0] === 'arc') { g.strokeStyle = dark; g.lineWidth = 9; g.beginPath(); g.arc(x, cy + 8, 18, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); return; }
    if (E[0] === 'lid' || E[0] === 'side') { g.fillStyle = dark; g.beginPath(); g.ellipse(x + (E[0] === 'side' ? 12 * s * 0 + 12 : look[0] * 6), cy + 2, 13, 11, 0, 0, Math.PI); g.fill();
      g.strokeStyle = gray; g.lineWidth = 10; g.beginPath(); g.moveTo(x - 30, cy); g.lineTo(x + 30, cy - 2); g.stroke(); return; }
    if (E[0] === 'open') { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, cy, 22, 26, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = dark; g.lineWidth = 5; g.stroke(); g.fillStyle = dark; g.beginPath(); g.arc(x + look[0] * 6, cy + 3, 10, 0, Math.PI * 2); g.fill(); return; }
    g.fillStyle = dark; g.beginPath(); g.ellipse(x, cy, 10, 14, 0, 0, Math.PI * 2); g.fill(); });
  if (spec === 'shades') { g.fillStyle = '#16161c'; [-1, 1].forEach(s => { g.beginPath(); g.ellipse(cx + s * 58, cy + 4, 42, 25, 0, 0, Math.PI * 2); g.fill(); }); g.strokeStyle = '#16161c'; g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 18, cy - 4); g.lineTo(cx + 18, cy - 4); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.35)'; [-1, 1].forEach(s => { g.beginPath(); g.ellipse(cx + s * 58 - 14, cy - 6, 10, 5, -.4, 0, Math.PI * 2); g.fill(); }); }
  if (spec === 'glasses') { g.strokeStyle = '#1a1a20'; g.lineWidth = 7; [-1, 1].forEach(s => { g.beginPath(); g.roundRect(cx + s * 58 - 36, cy - 22, 72, 46, 10); g.stroke(); }); g.beginPath(); g.moveTo(cx - 22, cy - 6); g.lineTo(cx + 22, cy - 6); g.stroke(); }
  if (anger) { g.strokeStyle = '#d23a3a'; g.lineWidth = 6; const ax = cx - 40, ay = cy - 110; g.beginPath(); g.moveTo(ax - 12, ay - 12); g.lineTo(ax + 12, ay + 12); g.moveTo(ax + 12, ay - 12); g.lineTo(ax - 12, ay + 12); g.stroke(); }
  // mouth
  const my = cy + 70, m = o.talk && E[2] !== 'teeth' ? 'talk' : E[2]; g.strokeStyle = dark;
  if (m === 'flat') { g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 24, my); g.lineTo(cx + 24, my); g.stroke(); }
  if (m === 'smirk') { g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 30, my + 4); g.quadraticCurveTo(cx + 6, my + 12, cx + 34, my - 8); g.stroke(); }
  if (m === 'o' || m === 'talk') { g.fillStyle = dark; g.beginPath(); g.ellipse(cx, my + 4, 16, m === 'o' ? 22 : 12, 0, 0, Math.PI * 2); g.fill(); }
  if (m === 'teeth') { const w = 150, h = 52; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(cx - w / 2, my - h / 2, w, h, 16); g.fill(); g.lineWidth = 7; g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(cx - w / 2, my); g.lineTo(cx + w / 2, my); for (let k = -3; k <= 3; k++) { g.moveTo(cx + k * 19, my - h / 2); g.lineTo(cx + k * 19, my + h / 2); } g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; CACHE.set(key, t); return t;
}

function decal(text, bg, fg, size = .12) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(8, 8, 112, 112, 22); g.fill(); }
  g.fillStyle = fg; g.font = '900 84px Poppins, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
}
export { decal };

// ---------- the figure. Feet at y = 0, ~1.95 tall.  o: { hair:'ridge'|'curly'|'short'|'none', hairCol, body, legs, badge, spec }
export function makeGuy(o = {}) {
  const P = new THREE.Group(), U = P.userData; U.o = o;
  const bodyM = std(o.body ?? 0x5a3b2a, { roughness: .8 }), legM = std(o.legs ?? 0x6a4128), dark = std(o.hands ?? 0x2a1d17);
  const root = new THREE.Group(); P.add(root); U.root = root;
  // legs (thin sticks) + oval feet
  U.legs = [-1, 1].map(s => { const hp = new THREE.Group(); hp.position.set(s * .1, .48, 0); root.add(hp);
    const leg = part(new THREE.CylinderGeometry(.034, .034, .44, 10), legM, .022); leg.position.y = -.22; hp.add(leg);
    const ft = part(new THREE.SphereGeometry(.075, 16, 10), dark, .02); ft.scale.set(1, .55, 1.6); ft.position.set(0, -.44, .05); hp.add(ft); return hp; });
  // bean torso
  const torso = new THREE.Group(); torso.position.y = .48; root.add(torso); U.torso = torso;
  const bean = part(new THREE.SphereGeometry(.3, 32, 24), bodyM, .03); bean.scale.set(1, 1.42, .86); bean.position.y = .36; torso.add(bean);
  if (o.badge) { const d = decal(o.badge, null, '#ffffff', .1); d.position.set(.0, .52, .262); torso.add(d); }
  // arms: short capsules + mitts
  U.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * .25, .58, 0); torso.add(sh);
    const a = part(new THREE.CapsuleGeometry(.05, .2, 6, 10), bodyM, .02); a.position.y = -.14; sh.add(a);
    const hand = new THREE.Group(); hand.position.y = -.3; sh.add(hand);
    hand.add(part(new THREE.SphereGeometry(.065, 14, 10), dark, .02)); return { sh, hand, s }; });
  // head (egg) + face
  const neck = new THREE.Group(); neck.position.y = .8; torso.add(neck); U.neck = neck;
  const headM = new THREE.MeshStandardMaterial({ map: face('smug', o), emissive: 0xffffff, emissiveMap: face('smug', o), emissiveIntensity: .32, roughness: .5 }); U.headM = headM;
  const head = part(new THREE.SphereGeometry(.42, 48, 32), headM, .028); head.scale.set(1, 1.06, .96); head.position.y = .36; neck.add(head); U.head = head;
  const hairM = std(o.hairCol ?? 0x6e4128, { roughness: .75 }), capM = std(new THREE.Color(o.hairCol ?? 0x6e4128).multiplyScalar(.7).getHex(), { roughness: .8 });
  if (o.hair && o.hair !== 'none') {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.435, 64, 24, 0, Math.PI * 2, 0, Math.PI * .42), capM); cap.castShadow = true; cap.rotation.x = -.62; head.add(cap);
    const rows = o.hair === 'ridge' ? [.3, .17, .03, -.11, -.25] : o.hair === 'curly' ? [.32, .2, .08, -.04, -.16, -.28] : [];
    rows.forEach((z, i) => { const r = Math.sqrt(Math.max(.01, .44 * .44 - z * z)) * 1.01;
      const tor = part(new THREE.TorusGeometry(r, o.hair === 'ridge' ? .055 : .05, 10, 40, Math.PI * .86), hairM, .016); tor.rotation.z = Math.PI * .07; tor.position.z = z; tor.position.y = .03 - (i === 0 ? .02 : 0); head.add(tor); });
    if (o.hair === 'curly') for (let i = 0; i < 26; i++) { const a = i * 2.4, th = .2 + (i % 7) * .1; const b = part(new THREE.SphereGeometry(.06, 10, 8), hairM, .012); b.position.setFromSphericalCoords(.44, th, a); if (b.position.z > .25 && b.position.y < .3) continue; head.add(b); }
    if (o.hair === 'short') { const fr = part(new THREE.CapsuleGeometry(.06, .3, 4, 10), hairM, .015); fr.rotation.z = 1.45; fr.position.set(0, .3, .27); head.add(fr); }
  }
  U.headR = .42;
  return P;
}
// pose: armL/armR = [forwardRaise, outward] radians; head: turn/nod/tilt; sit drops the hips & folds the legs
export function pose(P, s = {}) {
  const U = P.userData, t = s.t ?? 0;
  U.root.position.y = (s.sit ? -.1 : 0) + (s.bob ?? Math.sin(t * 2.4) * .01);
  U.torso.rotation.set(s.lean ?? 0, 0, (s.sway ?? Math.sin(t * 1.3) * .02));
  U.neck.rotation.set(s.nod ?? 0, s.turn ?? 0, s.tilt ?? 0);
  const arm = (A, v = [0, .12]) => { A.sh.rotation.set(-v[0], 0, v[1] * A.s); };
  arm(U.arms[0], s.armL); arm(U.arms[1], s.armR);
  U.legs.forEach(l => { l.rotation.x = s.sit ? -1.45 : 0; });
  const bl = s.blink ?? (((t + (s.seed ?? 0)) % 3.1) < .1);
  U.headM.map = U.headM.emissiveMap = face(s.expr || 'smug', { ...U.o, look: s.look, blink: bl, anger: s.anger, talk: s.talk });
}
