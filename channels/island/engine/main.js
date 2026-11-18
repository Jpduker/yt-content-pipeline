// Island engine page contract for lemo-opuscar's renderer. The film folder holds timeline.json (from tools/timeline.py) + voices/.
import * as THREE from 'three';
import { makePost } from '/styles/hd-2d/demo/post_ts.js';
import { buildWorld } from './world.js';
import { drawOverlay, overlayReady } from './ui.js';
import { makeMabel } from './cast.js'; window.__makeMabel = makeMabel;

const W = innerWidth || 1080, H = innerHeight || 1920, Q = new URLSearchParams(location.search), aspect = W / H;
const ov = document.getElementById('ov'); ov.width = W; ov.height = H;
const TL = await (await fetch('/@film/timeline.json')).json();
const SS = +(Q.get('ss') ?? 2);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(32, aspect, .3, 2000);
const S = buildWorld(aspect);
const post = makePost(renderer, S.scene, camera, W, H, { ssaa: SS });
const V = post.vig.uniforms;
if (Q.has('nobloom')) post.bloom.enabled = false;
await overlayReady(TL, aspect);

const TILT = !Q.has('notilt'), _v = new THREE.Vector3();
// Tilt-shift band (2026-11-18 frame review: Gus's face was soft in every close-up because the sharp band was a fixed 15% strip
// centred on his chest). The band now covers the hero's whole body on screen, centred towards the face.
const _h = new THREE.Vector3(), _bb = new THREE.Box3();
function bandOf(hero) {
  if (!hero) return [.45, .075];
  camera.updateMatrixWorld(); S.scene.updateMatrixWorld(); _bb.setFromObject(hero);
  if (_bb.isEmpty()) return [.45, .075];
  hero.getWorldPosition(_v); _h.copy(_v); _v.y = _bb.min.y; _h.y = _bb.max.y; _v.project(camera); _h.project(camera);
  const lo = _v.y * .5 + .5, hi = _h.y * .5 + .5, c = lo + .62 * (hi - lo), w = Math.max(.075, Math.min(.34, Math.max(hi - c, c - lo) + .03));
  return [Math.min(.85, Math.max(.15, c)), w];
}
const shotAt = t => TL.shots.find(s => t >= s.a && t < s.b) || TL.shots[TL.shots.length - 1];
window.DUR = TL.DUR; window.__dbg = { S, post, renderer, camera, THREE };
window.render = t => {
  const shot = shotAt(t);
  post.vig.uniforms.fade.value = 1; post.bloom.strength = .55; post.bloom.radius = .75; post.bloom.threshold = .85;
  V.warm.value = .1; V.sat.value = 1.05; V.amt.value = .62; V.contrast.value = .2;
  const r = S.update(t, shot, camera, post, renderer);
  if (TILT) { post.dof.tiltAmt = 17; { const [bc, bw] = r.fixedBand != null ? [r.fixedBand, .075] : bandOf(r.hero); post.dof.tiltC = bc; post.dof.tiltW = bw; } post.dof.tiltF = .3; post.dof.maxCoc = Math.max(post.dof.maxCoc, 24); V.sat.value *= 1.16; V.contrast.value = .28; }
  if (Q.has('nodof')) post.dof.maxCoc = 0;
  post.composer.render();
  drawOverlay(t, shot);
  if (Q.has('debug')) { const g = ov.getContext('2d'); g.setTransform(1,0,0,1,0,0); g.fillStyle = '#0f0'; g.font = '28px monospace'; g.fillText(`${shot.id} ${shot.time} sun=${r.dbg}`, 20, 40); }
};
// —— AUDIT hook (tools/audit.mjs): the scene state at time t, without rendering pixels.
// For every visible character: its sprite box on screen, how much of it is inside the frame, and which of 7 sample points
// (head, eyes, chest, belly, feet, left, right) are hidden behind scenery (raycast from the camera). Plus every UI box drawn.
const ray = new THREE.Raycaster(), _c = new THREE.Vector3(), _p = new THREE.Vector3();
let BLOCKERS = null;
function blockers() {
  if (BLOCKERS) return BLOCKERS; const castMeshes = new Set(); for (const k in S.cast) S.cast[k].root.traverse(o => castMeshes.add(o));
  BLOCKERS = []; S.scene.traverse(o => { if (!o.isMesh || castMeshes.has(o)) return; const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!m || m.blending === THREE.AdditiveBlending || (m.transparent && (m.opacity ?? 1) < .6) || m.depthWrite === false) return; BLOCKERS.push(o); });
  return BLOCKERS;
}
function visibleChain(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
window.__audit = t => {
  const shot = shotAt(t); S.update(t, shot, camera, post, renderer); camera.updateMatrixWorld(); S.scene.updateMatrixWorld(); drawOverlay(t, shot);
  const chars = [], B = blockers().filter(visibleChain);
  for (const k in S.cast) {
    const c = S.cast[k]; if (!visibleChain(c.root) || !c.mesh) continue; const m = c.mesh; m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, behind = false;
    for (const X of [bb.min.x, bb.max.x]) for (const Y of [bb.min.y, bb.max.y]) { _p.set(X, Y, 0).applyMatrix4(m.matrixWorld); const z = _p.clone().applyMatrix4(camera.matrixWorldInverse).z; if (z > -camera.near) behind = true; _p.project(camera);
      const sx = (_p.x * .5 + .5) * W, sy = (1 - (_p.y * .5 + .5)) * H; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy); }
    if (behind) { chars.push({ k, behind: true }); continue; }
    const area = Math.max(1, (x1 - x0) * (y1 - y0)), inF = Math.max(0, Math.min(x1, W) - Math.max(x0, 0)) * Math.max(0, Math.min(y1, H) - Math.max(y0, 0)) / area;
    const pts = { head: [.5, .88], eyes: [.55, .78], chest: [.5, .62], belly: [.5, .42], feet: [.5, .08], left: [.3, .5], right: [.7, .5] }, hid = [];
    camera.getWorldPosition(_c);
    for (const n in pts) { const [u, v] = pts[n]; _p.set(bb.min.x + (bb.max.x - bb.min.x) * u, bb.min.y + (bb.max.y - bb.min.y) * v, 0).applyMatrix4(m.matrixWorld);
      const dir = _p.clone().sub(_c), dist = dir.length(); ray.set(_c, dir.normalize()); ray.far = dist - .05; const hit = ray.intersectObjects(B, false)[0]; if (hit) hid.push(n + ':' + (hit.object.name || hit.object.geometry.type)); }
    chars.push({ k, x: Math.round(x0), y: Math.round(y0), w: Math.round(x1 - x0), h: Math.round(y1 - y0), inFrame: +inF.toFixed(2), hidden: hid, hero: !!shot.cast?.[k]?.hero });
  }
  return { t, shot: shot.id, ui: window.__ui.map(r => ({ ...r })), chars, W, H };
};
window.READY = true;
