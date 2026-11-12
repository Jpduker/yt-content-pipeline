import {bodyPose} from './rig.mjs';
// Artwork-led character revision, derived from the original user-selected B sample. All animation is a pure function of seconds.
// Same interface as lemo-opuscar: window.render(t), DUR, READY. No timers.
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const W=1920,H=1080;canvas.width=innerWidth;canvas.height=innerHeight;
const bg=new Image();bg.src='../../assets/environments/workshop-blue-hour.png';await bg.decode();
let voice=[];try{voice=await(await fetch('audio/cues.json')).json()}catch{}
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const ramp=(t,a,b)=>ease((t-a)/(b-a));
const TAU=Math.PI*2;
function path(pts,fill,stroke='#332a28',lw=3){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.lineJoin='round';g.stroke()}}
function ellipse(x,y,rx,ry,c,rot=0){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,rot,0,TAU);g.fill()}
function line(pts,c,w){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke()}
function rr(x,y,w,h,r,c){g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=c;g.fill()}
function glow(x,y,r,c){const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,c);a.addColorStop(1,'rgba(40,180,215,0)');g.fillStyle=a;g.fillRect(x-r,y-r,r*2,r*2)}
function label(s,x,y,size=24,col='#fff0d4',align='left'){g.font=`600 ${size}px "Trebuchet MS",sans-serif`;g.fillStyle=col;g.textAlign=align;g.fillText(s,x,y)}
const C={ink:'#302c2a',skin:'#f1d8ac',skinShade:'#c7a67d',jacket:'#c89335',light:'#ebbc5a',dark:'#875422'};

// The illustrated sprite parts come from the original B design reference.
// We animate artwork directly rather than replacing it with procedural facial geometry.
const SPR={};
for(const n of ['curious','happy','awe','fear','torso-clean','upper-sleeve','lower-sleeve','hand-rest','hand-open','hand-closed','legs']){
 const im=new Image();im.src='../../assets/characters/mustard-hero/v1/'+n+'.png';await im.decode();SPR[n]=im;
}
function head(t,{ex='curious',tilt=0}={}){
 const name=ex==='suspicious'?'curious':ex;
 const im=SPR[name]||SPR.curious;
 g.save();g.rotate(tilt);g.drawImage(im,-65,-137,132,142);g.restore();
}
function hand(x,y,a=0,open=false){
 // Insert-only hand: dark material matches the illustrated character's hands.
 g.save();g.translate(x,y);g.rotate(a);ellipse(0,0,11,15,'#282524',.2);
 line([[-7,-5],[-8,-14],[-4,-17]],'#282524',6);
 if(open){line([[0,-9],[0,-23]],'#282524',5);line([[6,-7],[9,-19]],'#282524',5)}g.restore();
}
// Each sleeve is mapped between explicit joints, with overlap at elbows.
function segment(im,a,b,width){
 const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
 g.save();g.translate(...a);g.rotate(Math.atan2(dy,dx)-Math.PI/2);
 g.drawImage(im,-width/2,-6,width,len+12);g.restore();
}
function drawArm(arm,side,t,o){
 // Far-side arm is rendered before the body; near-side arm after it.
 ellipse(...arm.elbow,13,13,'#b77c2b');
 segment(SPR['upper-sleeve'],arm.shoulder,arm.elbow,28);
 segment(SPR['lower-sleeve'],arm.elbow,arm.wrist,25);
 g.save();g.translate(...arm.wrist);
 if(side==='left'){
   // Left wrist stays outside the torso. Its gesture never reads right-arm inputs.
   g.rotate(-.12+Math.sin(t*1.1)*.018);
   g.drawImage(SPR['hand-rest'],-7,-3,16,31);
 }else{
   // Open palm has a separately controlled wrist; prop uses that same grip frame.
   g.rotate(-.04+Math.sin(t*1.3)*.012);
   g.drawImage(SPR['hand-open'],-3,-21,46,28);
   if(o.device){g.save();g.translate(27,-22);device(t,o.active??false,.42);g.restore()}
 }
 g.restore();
}
function character(x,y,s,t,o={}){
 g.save();g.translate(x,y);g.scale(s,s);
 ellipse(3,0,51,8,'rgba(10,22,30,.30)');
 // Feet remain planted: body breathing no longer rotates the entire leg layer.
 g.drawImage(SPR.legs,-37,-162,77,166);
 const breath=Math.sin(t*2.0)*.7;
 g.translate(Math.sin(t*1.1)*.5,breath+(o.drop||0));
 const pose=bodyPose(t,{
   lift:clamp(((o.rf??.1)-.1)/1.8),
   leftGesture:clamp(((o.lf??-.1)+.1)/2)*.55,
   recoil:o.ex==='fear'?ramp(t,20,21.8):0
 });
 drawArm(pose.left,'left',t,o);
 g.drawImage(SPR['torso-clean'],-49,-289,105,165);
 // Only the shoulder seam is drawn over its socket; the far arm remains behind.
 g.save();g.beginPath();g.ellipse(pose.left.shoulder[0],pose.left.shoulder[1]+4,13,17,0,0,TAU);g.clip();
 ellipse(pose.left.shoulder[0],pose.left.shoulder[1]+4,13,17,'#b77c2b');
 segment(SPR['upper-sleeve'],pose.left.shoulder,pose.left.elbow,28);g.restore();
 drawArm(pose.right,'right',t,o);
 g.save();g.translate(1,-284+Math.sin(t*1.4+.8)*.7);
 head(t,{...o,tilt:(o.tilt||0)+Math.sin(t*1.3)*.012});g.restore();
 if(new URLSearchParams(location.search).get('rig')==='1'){
   for(const [side,arm] of Object.entries(pose)){
     const c=side==='left'?'#87e3fa':'#ff91ca';
     line([arm.shoulder,arm.elbow,arm.wrist],c,2);
     for(const j of [arm.shoulder,arm.elbow,arm.wrist])ellipse(...j,3,3,c);
   }
 }
 g.restore();
}
function device(t,active=false,s=1){
 g.save();g.scale(s,s);
 const c=active?'#72f4ef':'#efc263';
 glow(0,0,120,active?'rgba(77,232,232,.24)':'rgba(246,178,63,.13)');
 g.save();g.rotate(t*.5);g.strokeStyle='#b8853d';g.lineWidth=5;g.beginPath();g.ellipse(0,0,58,23,.4,0,TAU);g.stroke();g.restore();
 ellipse(0,0,43,43,'#3a3530');ellipse(0,0,35,35,'#172d35');
 g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(0,0,33,0,TAU);g.stroke();
 for(let i=0;i<12;i++){let a=i*TAU/12;line([[Math.sin(a)*25,Math.cos(a)*25],[Math.sin(a)*30,Math.cos(a)*30]],'#c9bb8d',2)}
 const a=active?1.4:t*2;
 line([[0,0],[Math.sin(a)*23,-Math.cos(a)*23]],c,2.5);line([[0,0],[-14,-8]],'#eac86f',3);
 ellipse(0,0,4,4,c);rr(-7,-54,14,13,3,'#bc8c48');g.restore();
}
function room(t,freeze=0){
 g.drawImage(bg,0,0,W,H);
 // Lamps breathe subtly, clockwork and rain continue to exist independently of camera.
 g.globalCompositeOperation='screen';glow(450,200,210,`rgba(255,176,62,${.05+.01*Math.sin(t*2)})`);g.globalCompositeOperation='source-over';
 const rt=mix(t,10.5,freeze);
 g.save();g.beginPath();g.rect(1380,0,540,H);g.clip();
 for(let i=0;i<110;i++){let x=1385+((i*101.37)%535),y=((i*79.7+rt*(190+(i%5)*35))%1140)-30;
   line([[x,y],[x-3,y+16]],`rgba(149,217,233,${.15+(i%4)*.07})`,1.2);
 }
 if(freeze>.5)for(let i=0;i<24;i++){let x=1410+(i*83%475),y=90+(i*107%800);ellipse(x,y,2.5,5,'rgba(177,242,250,.6)')}
 g.restore();
 // High foreground motes move until the freeze; warm interior remains visible.
 for(let i=0;i<35;i++){const x=70+(i*71)%1250,y=160+(i*137+rt*(5+i%4))%650;ellipse(x,y,1+i%2,1+i%2,'rgba(255,214,141,.18)')}
 if(freeze){g.fillStyle=`rgba(14,90,108,${freeze*.10})`;g.fillRect(0,0,W,H)}
}
function portal(t,p){
 if(p<=0)return;
 g.save();g.globalAlpha=p;g.translate(1510,450);glow(0,0,330,'rgba(70,226,235,.19)');
 g.strokeStyle='#7ff6f2';g.lineWidth=3;g.shadowColor='#59d9dd';g.shadowBlur=22;
 g.beginPath();g.moveTo(-30,-370);g.lineTo(8,-240);g.lineTo(-20,-140);g.lineTo(35,-20);g.lineTo(9,110);g.lineTo(45,240);g.stroke();
 for(let i=0;i<18;i++){let a=i*2.39;ellipse(Math.cos(a)*140,Math.sin(a)*300,2,2,'#b1fffa')}
 g.restore();
}
function silhouette(t,p){
 if(p<=0)return;
 g.save();g.globalAlpha=p;g.translate(1560,790);const step=ramp(t,20.5,23.8);
 ellipse(0,0,47,7,'rgba(5,18,29,.3)');
 line([[-13,-110],[-23,-55],[-30-step*12,0]],'#243a46',15);line([[12,-110],[20,-50],[29+step*10,-3]],'#243a46',16);
 path([[-22,-207],[23,-207],[30,-106],[-25,-106]],'#243a46',null);
 line([[-23,-193],[-41,-142],[-46,-105]],'#243a46',13);line([[23,-193],[34,-145],[25,-112]],'#243a46',13);
 ellipse(0,-239,30,38,'#243a46');line([[-25,-250],[-22,-263]],'#64b6c4',2);g.restore();
}
function caption(t){
 const cue=voice.find(c=>t>=c.start&&t<c.end);if(!cue)return;
 g.textAlign='left';
 const words=cue.text.split(/\s+/),chunkSize=6,dt=(t-cue.start)/(cue.end-cue.start),wi=Math.min(words.length-1,Math.floor(dt*words.length)),base=Math.floor(wi/chunkSize)*chunkSize;
 const shown=words.slice(base,base+chunkSize);g.font='600 35px "Trebuchet MS", sans-serif';
 const widths=shown.map(w=>g.measureText(w+' ').width),tw=widths.reduce((a,b)=>a+b,0);let x=(W-tw)/2;
 rr(x-26,H-132,tw+52,63,17,'rgba(15,25,34,.85)');
 shown.forEach((w,i)=>{g.fillStyle=base+i===wi?'#f1bf64':'#f7eedb';g.fillText(w,x,H-88);x+=widths[i]});
}
function vignette(){const v=g.createRadialGradient(W*.52,H*.47,H*.2,W*.5,H*.5,W*.64);v.addColorStop(0,'rgba(6,16,27,0)');v.addColorStop(1,'rgba(5,15,27,.45)');g.fillStyle=v;g.fillRect(0,0,W,H)}

window.DUR=26;
window.EV=[{t:9.9,type:'clock'},{t:10.5,type:'freeze'},{t:18.6,type:'crack'},{t:21.4,type:'step'}];
window.render=function(t){
 const freeze=ramp(t,10.35,10.6);g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);g.clearRect(0,0,W,H);
 // Contact/expression sheet mode uses precisely the same character module.
 const mode=new URLSearchParams(location.search).get('sheet');
 if(mode==='faces'){
  g.fillStyle='#1e303c';g.fillRect(0,0,W,H);label('BETWEEN THE IFS  /  EXPRESSION DEVELOPMENT',85,100,34);
  ['curious','happy','awe','suspicious','fear'].forEach((ex,i)=>{g.save();g.translate(190+i*380,420);g.scale(2,2);head(2,{ex});g.restore();label(ex.toUpperCase(),190+i*380,510,24,'#e4bc75','center')});
  character(960,1010,1.15,1.4,{ex:'happy',device:true,ra:-.6,rf:1.9});label('SINGLE SHARED RIG  ·  ORIGINAL MUSTARD-JACKET PROTAGONIST',80,1020,23,'#abc0c8');return;
 }
 g.save();
 if(t<5.5){
   // Establishing action: character steps in and raises the device.
   room(t,0);let x=1090;let reach=ramp(t,1.7,4.0);
   character(x,930,1.38,t,{ex:t<3?'curious':'happy',walk:1-ramp(t,1.6,2.8),ra:mix(-.2,-.75,reach),rf:mix(-.1,1.9,reach),device:true,tilt:-.06,look:1});
 }else if(t<10){
   // Medium close-up, action readable, background stays in its established geography.
   g.translate(-500,-55);g.scale(1.45,1.45);room(t,0);
   const p=ramp(t,7.3,9.5);character(920,920,1.7,t,{ex:t<7.5?'happy':'curious',ra:-.75,rf:1.9,la:mix(.15,.9,p),lf:mix(-.1,1.9,p),device:true,tilt:mix(-.08,.03,p),look:1});
 }else if(t<13.4){
   // Prop insert: actual code clock, hand and activation are synchronized to the cue.
   g.translate(-440,-120);g.scale(1.5,1.5);room(t,freeze);
   g.fillStyle='rgba(9,26,36,.38)';g.fillRect(0,0,W,H);
   g.save();g.translate(900,450);g.scale(2.9,2.9);
   line([[-130,95],[-65,50],[-25,35]],C.ink,35);line([[-130,95],[-65,50],[-25,35]],C.jacket,29);hand(-19,30,1.0,true);
   device(t,freeze>.5,1);g.restore();
   if(freeze>0){g.globalCompositeOperation='screen';glow(900,450,450,`rgba(95,233,234,${.14*freeze})`);g.globalCompositeOperation='source-over'}
 }else if(t<18.5){
   // Return to wide: show time stopping through the rain rather than a title card.
   room(t,freeze);const p=ramp(t,13.4,15.3);
   portal(t,ramp(t,16.8,18.5)*.35);
   character(1090,930,1.38,t,{ex:'awe',ra:mix(-.75,-.2,p),rf:mix(1.9,1.35,p),device:true,active:true,look:1,tilt:.07,open:true});
 }else if(t<23.8){
   // Close-up on the reaction; a moving silhouette remains visible in the doorway.
   g.translate(-650,-100);g.scale(1.55,1.55);room(t,freeze);portal(t,.8);silhouette(t,ramp(t,19,20.5));
   character(1000,920,1.65,t,{ex:t<20?'suspicious':'fear',ra:-.3,rf:1.4,device:true,active:true,look:1,tilt:mix(.02,-.1,ramp(t,20,22)),drop:ramp(t,20,22)*4});
 }else{
   room(t,freeze);portal(t,.8);silhouette(t,1);character(1090,930,1.38,t,{ex:'fear',ra:-.3,rf:1.4,device:true,active:true,look:1,tilt:-.1});
 }
 g.restore();vignette();
 // modest series identity, never covers faces
 label('BETWEEN THE IFS',80,87,23,'#f1d8ac');label('ART + MOTION TEST 03',W-80,87,19,'#d9d6c8','right');
 caption(t);
 const end=ramp(t,24,25.5);if(end){g.fillStyle=`rgba(9,20,30,${end*.62})`;g.fillRect(0,0,W,H);g.save();g.globalAlpha=end;label('THE BORROWED SECOND',W/2,485,65,'#f7e8ca','center');label('One impossible possibility.',W/2,550,27,'#b8d9db','center');g.restore()}
 // clean cinematic bars after all world drawing
 g.fillStyle='#0c1822';g.fillRect(0,0,W,38);g.fillRect(0,H-38,W,38);
 const fade=1-ramp(t,0,.5);if(fade){g.fillStyle=`rgba(9,20,29,${fade})`;g.fillRect(0,0,W,H)}
};
window.render(0);window.READY=true;
