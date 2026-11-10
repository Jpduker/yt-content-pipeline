const cv = document.getElementById('c'), g = cv.getContext('2d');
await document.fonts.load('700 50px Poppins');
const film = await import('./film.js');
film.init(cv);
window.DUR = film.DURATION; window.EV = film.events(); window.SRT = [];
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.render(g, t); };
window.DBG = film.dbg; window.READY = true;
