// Turnaround sheet for the clay cast: ?kind=him | her | pair.  Page contract: window.READY, window.render(t), window.DUR, window.CHECKS.
// him/her: front · 3/4 · side · back (full body) + 3 expressions (neutral · smile · sad).  pair: both side by side, same scale + CHECK.
import * as THREE from 'three';
import { makeCast, secondary } from './cast.js';
import { POSE, applyPose } from './rig-v2.js';
import { checkFrame } from './collide.js';
const Q = new URLSearchParams(location.search), KIND = Q.get('kind') || 'him', W = 1920, H = 1080;
await document.fonts.load('700 30px Mono');
const out = document.getElementById('c'), g = out.getContext('2d');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0b0e);
const floor = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), new THREE.MeshStandardMaterial({ color: 0x18181d, roughness: .5 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const spot = new THREE.SpotLight(0xfff1dc, 9, 0, .5, .7, 0); spot.position.set(.6, 4.5, 2.2); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.0004; scene.add(spot, spot.target);
scene.add(new THREE.HemisphereLight(0x8090b0, 0x0a0a0a, .7));
const rim = new THREE.DirectionalLight(0x9fb4ff, 1.4); rim.position.set(-2, 3, -4); scene.add(rim);
const fill = new THREE.DirectionalLight(0xffe2c8, .5); fill.position.set(-2, 2, 4); scene.add(fill);
const kinds = KIND === 'pair' ? ['him', 'her'] : [KIND];
const figs = kinds.map(k => { const P = makeCast(k); scene.add(P); return { name: k, P }; });
const cam = new THREE.PerspectiveCamera(26, 1, .05, 50);
const ROT = [['FRONT', 0], ['3/4', -.75], ['SIDE', -Math.PI / 2], ['BACK', Math.PI]];
const MOODS = [['NEUTRAL', 'neutral'], ['SMILE', 'smile'], ['SAD', 'sad']];
function view(x, y, w, h, fov, pos, look) {
  renderer.setViewport(x, H - y - h, w, h); renderer.setScissor(x, H - y - h, w, h); renderer.setScissorTest(true);
  cam.fov = fov; cam.aspect = w / h; cam.position.set(...pos); cam.lookAt(...look); cam.updateProjectionMatrix(); renderer.render(scene, cam);
}
const label = (s, x, y, size = 24, col = '#d8d8de') => { g.font = `700 ${size}px Mono`; g.fillStyle = col; g.textAlign = 'center'; g.fillText(s, x, y); };
window.CHECKS = [];
window.render = t => {
  renderer.setClearColor(0x0b0b0e); renderer.setScissorTest(false); renderer.clear();
  if (KIND !== 'pair') {
    const P = figs[0].P; applyPose(P, { ...POSE.stand, mood: 'neutral' }); secondary(P, 0, t);
    ROT.forEach(([n, r], i) => { P.rotation.y = r; view(20 + i * 335, 80, 330, 920, 26, [0, 1.0, 4.2], [0, .9, 0]); });
    MOODS.forEach(([n, m], i) => { P.rotation.y = -.25; applyPose(P, { ...POSE.stand, mood: m }); view(1380, 90 + i * 300, 520, 290, 13, [0, 1.6, 1.7], [0, 1.6, 0]); });
    g.drawImage(renderer.domElement, 0, 0);
    label(KIND === 'him' ? 'CLAY CAST · HIM' : 'CLAY CAST · HER', 690, 56, 34, KIND === 'him' ? '#8fb0d8' : '#e8957a');
    ROT.forEach(([n], i) => label(n, 185 + i * 335, 1040));
    MOODS.forEach(([n], i) => label(n, 1640, 90 + i * 300 + 280, 20, '#a0a0a8'));
    label('EXPRESSIONS', 1640, 56, 26, '#d8d8de');
  } else {
    figs[0].P.position.x = -.33; figs[1].P.position.x = .33;
    figs.forEach((f, i) => { applyPose(f.P, { ...POSE.stand, mood: i ? 'smile' : 'neutral' }); f.P.rotation.y = i ? -.35 : .35; secondary(f.P, 0, t); });
    view(0, 0, W, H, 28, [0, 1.05, 4.4], [0, .92, 0]);
    g.drawImage(renderer.domElement, 0, 0);
    label('HIM', 960 - 280, 1040, 30, '#8fb0d8'); label('HER', 960 + 280, 1040, 30, '#e8957a');
    window.CHECKS = checkFrame(figs);
    // self-test: push them into each other and make sure CHECK catches it
    figs[1].P.position.x = -.2; window.CHECKS_FORCED = checkFrame(figs).length; figs[1].P.position.x = .33;
    label(`CHECK: ${window.CHECKS.length} overlaps standing apart · ${window.CHECKS_FORCED} caught when pushed together`, 960, 60, 22, '#a0a0a8');
  }
};
window.DUR = 4; window.READY = true;
