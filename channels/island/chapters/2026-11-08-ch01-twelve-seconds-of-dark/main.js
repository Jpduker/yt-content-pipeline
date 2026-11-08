// Page contract: window.READY, window.render(t), window.DUR, window.EV, window.SRT, window.CHAPTERS
import { textures } from './engine/toon.js';
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['700 80px Oleo', '400 80px Oleo', '80px Slab', '500 40px Jost', '600 40px Jost', '700 40px Jost'].map(f => document.fonts.load(f)));
textures();
const lines = await (await fetch('lines.json')).json();
let durs = {}; try { durs = await (await fetch('voices/dur.json')).json(); } catch (e) {}
let words = {}; try { words = await (await fetch('voices/words.json')).json(); } catch (e) {}
const film = await import('./film.js');
film.setup(lines, durs, words);
const SN = +(Q.get('short') || 0);                                   // ?short=1|2|3 → the vertical riddle Short (1080x1920)
if (SN) { cv.width = 1080; cv.height = 1920; window.DUR = film.setShort(SN); window.EV = []; window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.renderShort(g, t, SN); }; }
else { window.DUR = film.DURATION; window.EV = film.events(); window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.renderFilm(g, t, Q); }; }
window.SRT = film.srtCues(); window.CHAPTERS = film.CHAPTERS;
window.READY = true;
