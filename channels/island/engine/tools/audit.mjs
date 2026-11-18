// Scene/UI audit: node styles/island-engine/tools/audit.mjs <short_dir> [--step 0.25] [--size 1080x1920]  → <short_dir>/audit.json
// Samples window.__audit(t) (main.js) every step seconds: character boxes, occlusion raycasts, UI boxes. No pixels are rendered.
import fs from 'fs'; import path from 'path';
import { openDemo, closeServer, takeSize } from '../../../core/render/page.mjs';
const args = process.argv.slice(2); const take = k => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : null; };
const { w, h } = takeSize(args.length && args.includes('--size') ? args : [...args, '--size', '1080x1920']); const step = +(take('--step') || .25); const dir = args[0];
const { browser, page } = await openDemo(dir, { w, h, q: 'ss=1', warnings: false });
const errs = []; page.on('pageerror', e => errs.push(String(e)));
if (!(await page.evaluate(() => typeof window.__audit === 'function'))) { console.error('AUDIT-BROKEN: the page has no __audit (engine failed to load?)', errs.join(' | ')); process.exit(3); }
const DUR = await page.evaluate(() => window.DUR), out = [];
for (let t = 0; t < DUR; t += step) out.push(await page.evaluate(t => window.__audit(t), +t.toFixed(3)));
if (errs.length) { console.error('AUDIT-BROKEN: page errors while sampling:', errs.join(' | ')); process.exit(3); }
fs.writeFileSync(path.join(dir, 'audit.json'), JSON.stringify(out)); console.log(dir, out.length, 'samples');
await browser.close(); closeServer();
