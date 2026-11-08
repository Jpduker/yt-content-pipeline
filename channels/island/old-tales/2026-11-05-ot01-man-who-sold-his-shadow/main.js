// Page contract: window.READY, window.render(t), window.DUR, window.EV, window.SRT
import * as film from './film.js';
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), g = cv.getContext('2d');
await document.fonts.load('400 40px Yuji', '影'); await document.fonts.load('500 40px Shippori', 'Aa'); await document.fonts.load('700 40px Shippori', 'Aa');
const lines = await (await fetch('lines.json')).json();
let durs = {}; try { durs = await (await fetch('voices/dur.json')).json(); } catch (e) {}
const T = Object.fromEntries(lines.map(l => [l.id, l.caption || l.text])), ids = Object.keys(film.VO);
const SUBS = ids.map((id, i) => { const t0 = film.VO[id], nx = ids[i + 1] ? film.VO[ids[i + 1]] : film.DURATION; return { id, t0, t1: Math.min(nx - .1, t0 + Math.max(1.8, (durs[id] ?? 2.5) + .75)), text: T[id] }; });
film.init();
window.DUR = film.DURATION; window.EV = film.events(); window.SRT = SUBS.map(s => ({ t0: s.t0, t1: s.t1, text: s.text }));
window.render = t => film.renderFilm(g, t, SUBS, Q);
window.READY = true;
