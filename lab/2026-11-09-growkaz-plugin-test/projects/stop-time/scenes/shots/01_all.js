// stop-time: Ifverse-look style test (GrowKaz kit). 6 shots, 19 s: café wide → falling cup → giant face snap → FREEZE walk → 3D orbit → title.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cafe, cafeGround, cafeTable, cup } from '../sets/cafe.js';
import { MAX, JAKE, BARISTA } from '../cast.js';

const SC = () => V(1.6, 1.7);
const seats = () => ({ max: E.W / 2 - V(210, 190), jake: E.W / 2 + V(210, 190) });
function chairAt(g, x, GY, s, facing, color) { g.save(); g.translate(x, 0); g.scale(facing, 1); FX.chair(g, -18 * s, GY, s, color); g.restore(); }
function coffeeArc(g, x, y, t, frozen) {   // the spill: drops in an arc, hanging when frozen
  for (let i = 0; i < 14; i++) { const a = -2.4 + i * .17, d = 40 + ((i * 37) % 60), px = x - 10 + Math.cos(a) * d + (frozen ? Math.sin(t * .6 + i) * 1.5 : 0), py = y + 30 - Math.sin(a) * d * .5; const r = 3 + (i % 4) * 2;
    circle(g, px, py, r, '#6a3a22'); circle(g, px - r * .3, py - r * .3, r * .3, 'rgba(255,230,200,.7)'); }
}
function table(g, t, o) {
  const cam = { z: o.z ?? 1, x: o.x ?? 0, y: o.y ?? 0 };
  const { GY, M } = cafe(g, t, cam, { mood: 'golden' }); const { max, jake } = seats(), s = SC(), rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, .92, g => { drawFigure(g, { x: E.W / 2 + V(560, 330), y: GY - 30, s: s * .8, facing: -1, outfit: BARISTA, pose: o.frozen ? POSES.holdFront : breathe(POSES.holdFront, t, 1, 4), expr: 'smile', rim, prop: 'cup', blink: false }); });
  layer(g, cam, 1, g => {
    chairAt(g, jake, GY, s, -1, '#24181e'); if (!o.maxUp) chairAt(g, max, GY, s, 1, '#24181e');
    const tb = cafeTable(g, E.W / 2, GY);
    o.cupDraw ? o.cupDraw(g, tb.top) : cup(g, E.W / 2 + 60, tb.top, 1.2);
    drawFigure(g, { x: o.maxX ?? max, y: GY, s, facing: o.maxFacing ?? 1, outfit: MAX, pose: o.maxPose || breathe(POSES.sit, t), expr: o.maxExpr || 'neutral', rim, shadow: false, trail: o.trail });
    drawFigure(g, { x: jake, y: GY, s, facing: -1, outfit: JAKE, pose: o.jakePose || breathe(POSES.sit, t, 1, 2), expr: o.jakeExpr || 'happy', rim, shadow: false, blink: o.frozen ? false : (t % 3.3) > 3.2 });
  });
  FX.dust(g, o.frozen ? 0 : t, { count: 40, color: '#ffe2bd', a: .35 });
  FX.lensStreak(g, E.W / 2, E.H * .3, E.W * 1.2, '#ffe0b0', .18);
  return { GY, M };
}
// s001 wide café, slow push; Jake's elbow catches the cup at the end
registerShot('s001', { draw(g, t) {
  const el = key(t, [[0, 0], [2.6, 0], [3.0, 1], [3.6, .8]]);
  table(g, t, { z: 1 + .08 * ease.inOut(t / 3.6), x: -30 * ease.inOut(t / 3.6), maxExpr: 'smile', jakeExpr: t > 3.0 ? 'scared' : 'happy', jakePose: { ...POSES.sit, eF: [28 - el * 6, -112 - el * 18], hF: [50 + el * 10, -128 - el * 6] },
    cupDraw: (g, top) => { const k = ease.out(prog(t, 2.9, 3.6)); cup(g, lerp(E.W / 2 + 60, E.W / 2 - 40, k), top - 30 * Math.sin(k * 3), 1.2, -1.2 * k); } });
} });
// s002 close on the table: the cup tips off the edge, coffee leaving it
registerShot('s002', { draw(g, t) {
  const GY = cafeGround(), top = GY - 162, cam = { z: V(2.0, 1.8), x: 20, y: top - E.H / 2 + 40 };
  cafe(g, t, cam, { mood: 'golden' }); const fall = Math.max(0, t - .3), cx = E.W / 2 - 120 - t * 40, cy = top + .5 * 300 * fall * fall;
  layer(g, cam, 1, g => { cafeTable(g, E.W / 2, GY); coffeeArc(g, cx, cy - 40, t, false); cup(g, cx, cy, 1.2, -1.2 - t * .8); });
  FX.speedLines(g, t, { a: .08 });
} });
// s003 giant face, determined → the snap (rings)
registerShot('s003', { draw(g, t) {
  blurLayer(g, 14, g => cafe(g, t, { z: 1.5, x: -150, y: -120 }, { mood: 'golden' })); veil(g, '#120a10', .4);
  const M = mood('golden'), r = V(300, 330) * (1 + .05 * t);
  bigFace(g, E.W / 2, E.H * V(.6, .55), r, { outfit: MAX, expr: t < .7 ? 'determined' : 'smirk', look: [.2, -.1], rimColor: M.rim, rimSide: -1 });
  if (t > 1.1) FX.rings(g, E.W * .78, E.H * .52, t - 1.1, { count: 3, r0: 20, r1: 260, speed: 2.4, color: '#e8f0ff', a: .7 });
  if (t > 1.05) { const k = 1 - prog(t, 1.05, 1.5); g.fillStyle = `rgba(230,240,255,${.5 * k})`; g.fillRect(0, 0, E.W, E.H); }
} });
// s004 FREEZE: world stops (cool tint, hanging drops, badge counting), only Max moves: stands, walks round the table to the cup
registerShot('s004', { draw(g, t) {
  const { max } = seats(), up = prog(t, .4, 1.1), wk = prog(t, 1.1, 3.6), X = lerp(max, E.W / 2 - 120, ease.inOut(wk));
  const pose = t < 1.1 ? posesAt(t, [[0, POSES.sit], [.4, POSES.sit], [1.0, POSES.stand]]) : wk < 1 ? walkPose(t * Math.PI * 2 * .9) : posesAt(t - 3.6, [[0, POSES.stand], [.3, POSES.reach]]);
  table(g, t, { z: 1.05 + .03 * t, frozen: true, maxUp: up > .5, maxX: X, maxPose: pose, maxExpr: wk < 1 ? 'awe' : 'smirk', jakeExpr: 'scared', jakePose: { ...POSES.sit, eF: [22, -130], hF: [60, -134] },
    cupDraw: (g, top) => { coffeeArc(g, E.W / 2 - 150, top + 70, t, true); cup(g, E.W / 2 - 150, top + 110, 1.2, -2.1); } });
  FX.drops(g, t, { count: 40, color: '#d8e4ff', rMax: 7, drift: 2 });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.45)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  const left = Math.max(0, 10 - Math.floor(t * 1.0)); UI.badge(g, { str: `${left}s`, a: ease.out(prog(t, .2, .6)) });
} });
// s005 3D orbit round the frozen table (three-kit), cup hanging in the air
registerShot('s005', { kind: '3d',
  init(T) {
    const M = mood('golden'), st = T.stage({ mood: 'golden', fov: V(34, 52), fog: [14, 45], keyPos: [-8, 9, 6], keyIntensity: 2.8, ambient: 1.2 });
    st.add(T.ground(60, 60, M.floor, T.tiles(M.floor, 10, [10, 10])));
    st.add(T.box(30, 7, .4, M.wall, 0, 3.5, -4));
    for (const x of [-6, -3, 3, 6]) { const w = T.windowPane(2.2, 2.6, { glowColor: M.practical, cols: 2, rows: 1, power: .8, interior: true }); w.position.set(x, 2.1, -3.78); st.add(w); }
    for (let i = 0; i < 30; i++) st.add(T.box(1, .6, 1.1, i % 2 ? '#efe4d4' : '#2f7a46', -15 + i + .5, 3.9, -3.3));
    st.add(T.cyl(.55, .55, .05, '#2a1d22', 0, .75, 0, 24), T.cyl(.05, .05, .75, '#2a1d22', 0, .37, 0));
    const cupM = T.cyl(.05, .04, .09, '#f2ece4', -.5, 1.05, .1); cupM.rotation.z = 2.1; st.add(cupM);
    for (let i = 0; i < 12; i++) st.add(T.sphere(.018 + (i % 3) * .008, '#6a3a22', -.45 - i * .03, 1.0 - Math.sin(i * .5) * .12, .1 + Math.cos(i) * .04));
    const jake = T.figure3D(JAKE, { rim: M.rim, pose: POSES.sit }); jake.position.set(.85, 0, 0); jake.rotation.y = Math.PI; st.add(jake);
    const max = T.figure3D(MAX, { rim: M.rim, pose: POSES.reach }); max.position.set(-1.0, 0, .3); st.add(max);
    st.add(T.tree3D(-12, 2, 1.2, '#2a1f2a'), T.tree3D(12, 1, 1.1, '#2a1f2a'));
    return { stage: st };
  },
  draw(s, t, info, T) { T.orbit(s.stage.camera, t, { target: [-.2, .9, 0], radius: V(4.6, 6.4), height: [2.4, 1.6], from: -1.1, to: .4, dur: info.dur }); },
  overlay(g, t) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.4)'; g.fillRect(0, 0, E.W, E.H); g.restore(); UI.badge(g, { str: `${Math.max(0, 6 - Math.floor(t))}s` }); },
});
// s006 title card over the dusk city
registerShot('s006', { draw(g, t, info) {
  const M = mood('dusk'), cam = { z: 1.06 - .06 * ease.inOut(t / info.dur), y: -20 * t };
  layer(g, cam, .2, g => { backdrop(g, M.sky); FX.sun(g, E.W / 2, E.H * V(.62, .55), V(90, 110), '#fff3dc', M.key, 5); FX.godRays(g, E.W / 2, E.H * V(.62, .55), { count: 14, angle: -Math.PI / 2, spread: Math.PI * 1.6, len: 1800, a: .06, t }); });
  layer(g, cam, .5, g => FX.skyline(g, { x: -200, y: E.H * V(.74, .66), w: E.W + 400, maxH: V(300, 500), color: '#2a1f36', windowColor: alpha(M.practical, .8), seed: 21 }));
  layer(g, cam, .8, g => { g.fillStyle = '#16111e'; g.fillRect(-E.W, E.H * V(.74, .66), E.W * 3, E.H); });
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: .4 });
  UI.titleCard(g, t, { lines: ['WHAT IF YOU COULD', 'STOP TIME?'], dur: info.dur, y: E.H * V(.4, .38) });
} });
