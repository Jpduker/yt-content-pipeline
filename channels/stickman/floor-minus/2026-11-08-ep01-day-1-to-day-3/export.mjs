// Exports the film's timeline from the page: events.json ({dur, ev}), out/cues.json (subtitle cues), out/chapters.txt (YouTube chapters).
// Usage: node <episode>/export.mjs <episode> <lemo-opuscar>   — uses lemo's own page loader (core/render/page.mjs, playwright-core).
import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const [dir, lib] = process.argv.slice(2);
const { openDemo, closeServer } = await import(pathToFileURL(path.join(lib, 'core/render/page.mjs')).href);
const WIDE = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').includes('width="1080" height="1920"');
const { browser, page } = await openDemo(dir, { w: WIDE ? 1080 : 1920, h: WIDE ? 1920 : 1080, warnings: true });
const o = await page.evaluate(() => ({ dur: window.DUR, ev: window.EV || [], srt: window.SRT || [], ch: window.CHAPTERS || [] }));
fs.mkdirSync(path.join(dir, 'out'), { recursive: true });
fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify({ dur: o.dur, ev: o.ev }));
fs.writeFileSync(path.join(dir, 'out', 'cues.json'), JSON.stringify(o.srt));
fs.writeFileSync(path.join(dir, 'out', 'chapters.txt'), o.ch.map(([t, n]) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} ${n}`).join('\n') + '\n');
console.log('exported', o.ev.length, 'events,', o.srt.length, 'cues, dur', o.dur); await browser.close(); closeServer();
