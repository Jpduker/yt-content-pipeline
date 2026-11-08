// Page contract: window.READY, window.render(t), window.DUR, window.EV, window.SRT
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['600 60px Fred', '60px Pop', '60px Hand'].map(f => document.fonts.load(f)));
const lines = await (await fetch('lines.json')).json();
let durs = {}; try { durs = await (await fetch('voices/dur.json')).json(); } catch (e) {}
let words = {}; try { words = await (await fetch('voices/words.json')).json(); } catch (e) {}
const film = await import('./film.js');
await film.load(); film.setup(lines, durs, words);
window.DUR = film.DURATION; window.EV = film.events(); window.SRT = film.srtCues(); window.CHAPTERS = [];
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.render(g, t); };
window.READY = true;
