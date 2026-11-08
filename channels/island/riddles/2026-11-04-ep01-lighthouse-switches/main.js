// Page contract: window.READY, window.render(t), window.DUR, window.EV, window.SRT
import { textures } from './engine/toon.js';
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['700 80px Oleo', '400 80px Oleo', '80px Slab', '500 40px Jost', '600 40px Jost', '700 40px Jost'].map(f => document.fonts.load(f)));
textures();
const lines = await (await fetch('lines.json')).json();
let durs = {}; try { durs = await (await fetch('voices/dur.json')).json(); } catch (e) {}
const film = await import('./film.js');
film.setup(lines, durs);
window.DUR = film.DURATION; window.EV = film.events(); window.SRT = film.srtCues();
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.renderFilm(g, t, Q); };
window.READY = true;
