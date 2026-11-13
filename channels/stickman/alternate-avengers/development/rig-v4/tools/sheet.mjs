// Contact sheet / strip from rendered stills.  Usage (from an episode dir):
//   node ../../development/rig-v4/tools/sheet.mjs out/sheet.jpg 10 out/frame-*.jpg
//   (cols=10; files sorted by their time stamp). Labels each tile with its time.
import fs from 'node:fs';import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);const {createCanvas,Image}=req('@napi-rs/canvas');
const [out,colsArg,...files]=process.argv.slice(2);
if(!out||!files.length){console.error('usage: sheet.mjs OUT.jpg COLS frame-*.jpg');process.exit(2)}
const ts=f=>parseFloat((f.match(/frame-([\d.]+)/)||[0,0])[1]);
files.sort((a,b)=>ts(a)-ts(b));
const first=new Image();first.src=fs.readFileSync(files[0]);
const cols=+colsArg||10,w=Math.min(240,Math.floor(2400/cols)),h=Math.round(w*first.height/first.width);
const rows=Math.ceil(files.length/cols);
const cv=createCanvas(w*cols,h*rows),g=cv.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,w*cols,h*rows);
files.forEach((f,i)=>{const im=new Image();im.src=fs.readFileSync(f);const x=(i%cols)*w,y=Math.floor(i/cols)*h;
 g.drawImage(im,x,y,w,h);g.fillStyle='#000a';g.fillRect(x,y,62,22);g.fillStyle='#7f7';g.font='15px sans-serif';g.fillText(ts(f).toFixed(2),x+5,y+16)});
fs.writeFileSync(out,cv.toBuffer('image/jpeg',87));console.log('sheet',out,files.length,'tiles');
