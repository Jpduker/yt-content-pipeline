// WI02 3D shots (three-kit): café exterior (dawn / night pull-out) and the train on a viaduct at dusk.
import { E, V, registerShot, mood, ease, prog, alpha } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as UI from '/engine/ui2d.js';
import { CAST } from '../cast.js';
import { cap } from './_cap.js';

function street(T, st, M, lit) {
  st.add(T.ground(80, 80, M.floor, T.tiles(M.floor, 10, [16, 16])));
  st.add(T.box(80, .2, 6, '#2a2430', 0, .1, 6));                                     // road
  const cafe = T.building(10, 5, 6, { color: '#4a3440', win: M.practical, lit: lit }); cafe.position.set(0, 0, -3); st.add(cafe);
  for (const x of [-3, 0, 3]) { const w = T.windowPane(2.4, 2.2, { glowColor: M.practical, cols: 3, rows: 1, power: lit > .5 ? 1.4 : .7, interior: true }); w.position.set(x, 1.5, 0.02); st.add(w); }
  for (const [x, h] of [[-13, 9], [-24, 12], [13, 8], [24, 11], [-6, 14], [8, 16]]) { const b = T.building(9, h, 7, { color: '#2a2234', win: M.practical, lit: lit * .6 }); b.position.set(x, 0, -14 - (h % 3) * 3); st.add(b); }
  for (const x of [-7, 7]) st.add(T.tree3D(x, 3.5, 1.1, '#2a2030'));
}
const CAFE3D = { kind: '3d',
  init(T, info) { const night = info.night, M = mood(night ? 'night' : 'golden'), st = T.stage({ mood: night ? 'night' : 'golden', fov: 40, fog: [18, 70], keyPos: night ? [4, 8, 10] : [-14, 6, 10], keyIntensity: night ? 1.2 : 2.6, ambient: night ? .5 : 1.1, bloom: night ? .9 : .5 });
    street(T, st, M, night ? .9 : .25);
    if (night) for (const [id, x] of [['YOU', -.7], ['MIRA_EVE', .5]]) { const f = T.figure3D(CAST[id], { rim: M.rim, pose: POSES.stand }); f.position.set(x, 0, 1.4); f.rotation.y = id === 'YOU' ? .3 : Math.PI - .3; st.add(f); }
    return { stage: st }; },
  draw(s, t, info, T) { const d = info.dur;
    if (info.night) T.dolly(s.stage.camera, t, [[0, { pos: [0, 1.6, 5.5], look: [0, 1.3, 0] }], [d, { pos: [0, 4.5, 16], look: [0, 2.2, 0] }]]);
    else T.orbit(s.stage.camera, t, { target: [0, 2, 0], radius: 15, height: [3, 4.5], from: -.5, to: .15, dur: d }); },
  overlay(g, t, info) { cap(g, info.globalT); if (info.titleCard) { g.fillStyle = 'rgba(16,8,18,.45)'; g.fillRect(0, 0, E.W, E.H); } if (info.titleCard) UI.titleCard(g, t, { lines: ['WHAT IF YOU HEARD EVERY', 'THOUGHT ABOUT YOU?'], dur: info.dur, y: E.H * .42 }); },
};
registerShot('t3dawn', CAFE3D); registerShot('t3night', { ...CAFE3D });
registerShot('t3train', { kind: '3d',
  init(T) { const M = mood('dusk'), st = T.stage({ mood: 'dusk', fov: 38, fog: [25, 90], keyPos: [-20, 6, -10], keyIntensity: 2.2, ambient: .9, bloom: .7 });
    st.add(T.ground(200, 200, '#1e1626'));
    for (let i = -10; i <= 10; i++) { st.add(T.box(1.2, 6, 1.2, '#2a2032', i * 8, 3, 0)); }                    // viaduct piers
    st.add(T.box(180, .8, 3, '#2a2032', 0, 6.4, 0));
    const tr = []; for (let i = 0; i < 5; i++) { const car = T.box(7.6, 2.6, 2.6, '#8a7a90', 0, 8.1, 0); st.add(car); tr.push(car);
      for (let w = -3; w <= 3; w++) { const p = T.windowPane(.8, .8, { glowColor: M.practical, cols: 1, rows: 1, power: 1.2 }); p.position.set(w * 1.05, .2, 1.31); car.add(p); } }
    for (const [x, h] of [[-30, 20], [-12, 26], [8, 18], [26, 30], [44, 22]]) { const b = T.building(10, h, 8, { color: '#241c30', win: M.practical, lit: .5 }); b.position.set(x, 0, -30); st.add(b); }
    return { stage: st, tr }; },
  draw(s, t, info, T) { s.tr.forEach((c, i) => { c.position.x = -40 + i * 8 + t * 9; });
    T.dolly(s.stage.camera, t, [[0, { pos: [-24, 7.5, 16], look: [-10, 8, 0] }], [info.dur, { pos: [-6, 8.5, 14], look: [4, 8, 0] }]]); },
  overlay(g, t, info) { cap(g, info.globalT); },
});
