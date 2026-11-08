// Page contract: window.READY, window.render(t), window.DUR, window.EV, window.SRT
const cv = document.getElementById('c'), g = cv.getContext('2d');
await document.fonts.load('500 60px Mincho');
const film = await import('./film.js');
await film.load(); film.setup();
window.DUR = film.DURATION; window.EV = film.events(); window.SRT = film.srtCues(); window.CHAPTERS = [];
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.render(g, t); };
window.READY = true;
