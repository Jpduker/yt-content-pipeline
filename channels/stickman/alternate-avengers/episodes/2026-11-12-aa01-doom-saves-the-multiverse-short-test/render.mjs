// Native canvas adapter (no browser needed). Generalised from latest-proof-v3:
// --film <module> --w <px> --h <px> --fps --out --stills t1,t2 --rig
import fs from 'node:fs';import path from 'node:path';
import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
const here=path.dirname(fileURLToPath(import.meta.url));
const req=createRequire(import.meta.url);
const {createCanvas,Image:BaseImage,GlobalFonts}=req('@napi-rs/canvas');
for(const [f,n] of [['DejaVuSans.ttf','Trebuchet MS'],['DejaVuSans-Bold.ttf','Trebuchet MS']])
 GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/'+f,n);
const arg=process.argv.slice(2),val=(s,d)=>arg.includes(s)?arg[arg.indexOf(s)+1]:d;
const W=+val('--w','1080'),H=+val('--h','1920'),FPS=+val('--fps','24');
const cv=createCanvas(W,H);
globalThis.innerWidth=W;globalThis.innerHeight=H;
globalThis.window=globalThis;globalThis.document={querySelector:()=>cv};
globalThis.location={search:arg.includes('--rig')?'?rig=1':''};
class Image extends BaseImage{set src(v){super.src=fs.readFileSync(path.join(here,v))}get src(){return super.src}async decode(){}}
globalThis.Image=Image;
globalThis.fetch=async v=>({json:async()=>JSON.parse(fs.readFileSync(path.join(here,v),'utf8'))});
await import('./'+val('--film','exercise.js'));
fs.mkdirSync(path.join(here,'out'),{recursive:true});
const stills=val('--stills','');
if(stills){
 for(const t of stills.split(',').map(Number)){
  render(t);
  const f=path.join(here,'out',`frame-${t.toFixed(2)}.jpg`);
  fs.writeFileSync(f,cv.toBuffer('image/jpeg',92));console.log(f);
 }
}else{
 const output=path.resolve(val('--out',path.join(here,'out','picture.mp4')));
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-an','-c:v','libx264','-preset','fast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']});
 const ended=new Promise((res,rej)=>{ff.on('error',rej);ff.on('close',n=>n?rej(new Error('ffmpeg '+n)):res())});
 const N=Math.round(DUR*FPS);
 const i0=Math.max(0,Math.round(+val('--f0','0'))),i1=Math.min(N,Math.round(+val('--f1',String(N))));
 for(let i=i0;i<i1;i++){
  render(i/FPS);const b=cv.toBuffer('image/jpeg',93);
  if(!ff.stdin.write(b))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%120===0)console.log(i,'/',N);
 }
 ff.stdin.end();await ended;console.log('Rendered',output);
}
