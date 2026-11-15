// The Keeper's Island · proof 01 — page contract for lemo-opuscar's renderer (window.DUR, window.render(t), window.READY)
import * as THREE from 'three';
import { makePost } from '/styles/hd-2d/demo/post_ts.js';
import { DUR, shotAt } from './story.js';
import { buildIsland } from './island.js';
import { drawOverlay, overlayReady } from './ui.js';

const W = innerWidth || 1920, H = innerHeight || 1080, Q = new URLSearchParams(location.search);   // the renderer sets the viewport (--size)
const ov = document.getElementById('ov'); ov.width = W; ov.height = H;
const SS = +(Q.get('ss') ?? 2);
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(32, W / H, .3, 2000);
const S = buildIsland();
const post = makePost(renderer, S.scene, camera, W, H, { ssaa: SS });
post.bloom.strength = .55; post.bloom.radius = .75; post.bloom.threshold = .85;
const V = post.vig.uniforms; V.amt.value = .62; V.warm.value = .1; V.contrast.value = .2; V.sat.value = 1.05;
if (Q.has('nobloom')) post.bloom.enabled = false;
renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
await overlayReady();

const TILT = !Q.has('notilt'), TILT_C = { wide: .40 };   // tilt-shift is the look; the wide has no character to track
const _v = new THREE.Vector3();
function tiltCenter(shot) {
  if (TILT_C[shot.id] != null) return TILT_C[shot.id];
  let w = null; S.scene.traverse(o => { if (o.userData.char === 'gus' && o.visible) w = o; });
  if (!w) return .45;
  camera.updateMatrixWorld(); S.scene.updateMatrixWorld(); w.getWorldPosition(_v); _v.y += .7; _v.project(camera);
  return Math.min(.8, Math.max(.2, _v.y * .5 + .5));
}
window.DUR = DUR;
window.render = t => {
  const shot = shotAt(t);
  if (shot.id !== 'card') {
    post.vig.uniforms.fade.value = 1; post.bloom.strength = .55; post.bloom.threshold = .85; renderer.toneMappingExposure = 1.15;
    V.warm.value = .1; V.sat.value = 1.05; V.amt.value = .62; V.contrast.value = .2;
    S.update(t, shot, camera, post, renderer);
    if (TILT) { post.dof.tiltAmt = 17; post.dof.tiltC = tiltCenter(shot); post.dof.tiltW = .075; post.dof.tiltF = .3; post.dof.maxCoc = Math.max(post.dof.maxCoc, 24); V.sat.value *= 1.16; V.contrast.value = .28; }
    if (Q.has('nodof')) post.dof.maxCoc = 0;
    post.composer.render();
  } else { renderer.setRenderTarget(null); renderer.setClearColor('#000'); renderer.clear(); }
  drawOverlay(t, shot);
};
window.READY = true;
