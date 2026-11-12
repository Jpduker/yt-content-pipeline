// Canvas adapter for machines where Chromium cannot open local sockets.
// Uses the EXACT film.js drawing code and render(t) interface, without a browser.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const req=createRequire(import.meta.url);
const {createCanvas,Image:BaseImage,GlobalFonts}=req(process.env.CANVAS_MODULE||'@napi-rs/canvas');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','Trebuchet MS');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','Trebuchet MS');
const arg=process.argv.slice(2), value=(s,d)=>arg.includes(s)?arg[arg.indexOf(s)+1]:d;
const width=+value('--width','1920'),height=width*9/16;
const cv=createCanvas(width,height);
globalThis.innerWidth=width;globalThis.innerHeight=height;
globalThis.window=globalThis;globalThis.document={querySelector:()=>cv};
globalThis.location={search:arg.includes('--faces')?'?sheet=faces':''};
class Image extends BaseImage{set src(v){super.src=fs.readFileSync(path.join(here,v))}get src(){return super.src}async decode(){}}
globalThis.Image=Image;
globalThis.fetch=async v=>({json:async()=>JSON.parse(fs.readFileSync(path.join(here,v),'utf8'))});
await import('./film.js');
fs.mkdirSync(path.join(here,'out'),{recursive:true});
if(arg.includes('--stills')||arg.includes('--faces')){
 const times=arg.includes('--faces')?[2]:[3.5,7.5,10.8,15.8,20.9,24.5];
 for(const t of times){render(t);const f=path.join(here,'out',arg.includes('--faces')?'expressions.png':`frame-${t}.jpg`);fs.writeFileSync(f,cv.toBuffer(arg.includes('--faces')?'image/png':'image/jpeg',95));console.log(f)}
}else{
 const output=path.resolve(value('--out',path.join(here,'out','picture.mp4')));
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','24','-c:v','mjpeg','-i','-','-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']});
 const ended=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',n=>n?reject(new Error('ffmpeg exit '+n)):resolve())});
 for(let i=0;i<Math.round(DUR*24);i++){
  render(i/24);const b=cv.toBuffer('image/jpeg',94);
  if(!ff.stdin.write(b))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%96===0)console.log(i,'/',DUR*24);
 }
 ff.stdin.end();await ended;console.log('Rendered',output);
}
