// Island engine page contract for lemo-opuscar's renderer. The film folder holds timeline.json (from tools/timeline.py) + voices/.
import * as THREE from 'three';
import { makePost } from '/styles/hd-2d/demo/post_ts.js';
import { buildWorld } from './world.js';
import { drawOverlay, overlayReady } from './ui.js';

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
function bandOf(hero) {
  if (!hero) return .45;
  camera.updateMatrixWorld(); S.scene.updateMatrixWorld(); hero.getWorldPosition(_v); _v.y += .7; _v.project(camera);
  return Math.min(.8, Math.max(.2, _v.y * .5 + .5));
}
const shotAt = t => TL.shots.find(s => t >= s.a && t < s.b) || TL.shots[TL.shots.length - 1];
window.DUR = TL.DUR;
window.render = t => {
  const shot = shotAt(t);
  post.vig.uniforms.fade.value = 1; post.bloom.strength = .55; post.bloom.radius = .75; post.bloom.threshold = .85;
  V.warm.value = .1; V.sat.value = 1.05; V.amt.value = .62; V.contrast.value = .2;
  const r = S.update(t, shot, camera, post, renderer);
  if (TILT) { post.dof.tiltAmt = 17; post.dof.tiltC = r.fixedBand != null ? r.fixedBand : bandOf(r.hero); post.dof.tiltW = .075; post.dof.tiltF = .3; post.dof.maxCoc = Math.max(post.dof.maxCoc, 24); V.sat.value *= 1.16; V.contrast.value = .28; }
  if (Q.has('nodof')) post.dof.maxCoc = 0;
  post.composer.render();
  drawOverlay(t, shot);
  if (Q.has('debug')) { const g = ov.getContext('2d'); g.setTransform(1,0,0,1,0,0); g.fillStyle = '#0f0'; g.font = '28px monospace'; g.fillText(`${shot.id} ${shot.time} sun=${r.dbg}`, 20, 40); }
};
window.READY = true;
