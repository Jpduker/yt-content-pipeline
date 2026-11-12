// Original art-development proof. All animation is a pure function of seconds.
// Same interface as lemo-opuscar: window.render(t), DUR, READY. No timers.
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const W=1920,H=1080;canvas.width=innerWidth;canvas.height=innerHeight;
const bg=new Image();bg.src='assets/workshop.png';await bg.decode();
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

// The SAME head function supplies wides, close-ups and expression sheet.
function head(t,{ex='curious',talk=0,look=0,tilt=0}={}){
 g.save();g.rotate(tilt);
 const grad=g.createLinearGradient(-70,-140,80,20);grad.addColorStop(0,'#ffe9c3');grad.addColorStop(.5,C.skin);grad.addColorStop(1,'#bf9b75');
 ellipse(2,-68,66,77,grad,-.12);
 g.strokeStyle=C.ink;g.lineWidth=3.5;g.beginPath();g.ellipse(2,-68,66,77,-.12,0,TAU);g.stroke();
 // warm edge, tiny ear, neck and cheek keep the face from reading as a flat circle
 g.save();g.globalAlpha=.32;line([[-53,-105],[-59,-77],[-55,-51]],'#fff5cf',5);g.restore();
 ellipse(-55,-53,10,15,'#d7b58b');line([[-59,-57],[-53,-60],[-51,-49]],'#a78362',2);
 const blink=(Math.sin(t*1.37+1)>.996)?0.12:1;
 const fear=ex==='fear',awe=ex==='awe',happy=ex==='happy',squint=ex==='suspicious';
 const ey=-77+(fear?-2:0), er=awe?1.3:fear?1.2:1,eyh=squint?6:16;
 const eye=(x,scale)=>{
   if(happy){g.beginPath();g.arc(x,ey+6,10,Math.PI*1.1,Math.PI*1.9);g.strokeStyle=C.ink;g.lineWidth=5;g.stroke()}
   else ellipse(x+look*4,ey,7*scale*er,eyh*blink*er,C.ink,-.07);
 };
 eye(7,.8);eye(37,1);
 if(fear){line([[0,-110],[14,-117]],C.ink,3.5);line([[28,-117],[43,-110]],C.ink,3.5)}
 else if(awe){line([[-1,-116],[14,-121]],C.ink,3.5);line([[29,-122],[46,-118]],C.ink,3.5)}
 else if(squint){line([[0,-101],[15,-97]],C.ink,4);line([[29,-98],[44,-103]],C.ink,4)}
 else {line([[0,-110],[15,-114]],C.ink,3.5);line([[29,-115],[44,-109]],C.ink,3.5)}
 // projecting nose and cheek tone
 g.save();g.globalAlpha=.20;ellipse(38,-44,18,9,'#b87550');g.restore();
 if(talk>.1){ellipse(25,-28,13,5+talk*10,C.ink);g.save();g.beginPath();g.ellipse(25,-28,13,5+talk*10,0,0,TAU);g.clip();ellipse(27,-18,10,6,'#c17d67');g.restore()}
 else if(awe){ellipse(24,-27,8,11,C.ink)}
 else if(fear){line([[13,-25],[23,-29],[35,-24]],C.ink,3.5)}
 else if(squint){line([[14,-27],[33,-28]],C.ink,3.5)}
 else {g.beginPath();g.moveTo(11,-32);g.quadraticCurveTo(24,-17,37,-31);g.strokeStyle=C.ink;g.lineWidth=3.5;g.stroke()}
 g.restore();
}
function joint(root,a,len){return[root[0]+Math.sin(a)*len,root[1]+Math.cos(a)*len]}
function hand(x,y,a=0,open=false){g.save();g.translate(x,y);g.rotate(a);ellipse(0,0,11,15,C.skin,.2);line([[-7,-5],[-8,-14],[-4,-17]],C.skin,6);if(open){line([[0,-9],[0,-23]],C.skin,5);line([[6,-7],[9,-19]],C.skin,5)}g.restore()}
function limb(p0,p1,p2,width,col){line([p0,p1,p2],C.ink,width+5);line([p0,p1,p2],col,width);line([[p0[0]-3,p0[1]],[p1[0]-3,p1[1]]],C.light,3)}
function character(x,y,s,t,o={}){
 g.save();g.translate(x,y);g.scale(s,s);if(o.flip)g.scale(-1,1);
 const walk=o.walk||0,phase=t*8,breath=Math.sin(t*2.3)*1.8;
 const sway=Math.sin(phase)*walk;
 // shadow is fixed to ground, not the breathing torso
 ellipse(3,0,56,9,'rgba(15,23,28,.35)');
 const hipL=[-20,-146],hipR=[17,-146];
 const kneeL=[-22+sway*17,-82],kneeR=[18-sway*17,-83];
 const footL=[-24+sway*23,-12-Math.max(0,sway)*12],footR=[23-sway*23,-12-Math.max(0,-sway)*12];
 line([hipL,kneeL,footL],C.ink,24);line([hipR,kneeR,footR],'#252c32',25);
 line([[-28,-132],[-31,-87]],'#53606a',3);
 ellipse(footL[0]+8,footL[1]+6,24,10,'#222d35',-.04);ellipse(footR[0]+8,footR[1]+6,25,10,'#222d35');
 g.translate(0,breath+(o.drop||0));
 const shoulderL=[-35,-248],shoulderR=[35,-248];
 const el=joint(shoulderL,o.la??.18,65),hl=joint(el,o.lf??-.12,62);
 const er=joint(shoulderR,o.ra??-.2,63),hr=joint(er,o.rf??-.15,62);
 limb(shoulderL,el,hl,26,C.dark);hand(...hl,-.2);
 // neck, then jacket as a shaded closed body
 rr(-14,-290,30,40,8,C.skinShade);
 const j=g.createLinearGradient(-45,0,52,0);j.addColorStop(0,'#b7802a');j.addColorStop(.45,'#dba547');j.addColorStop(1,'#9d652a');
 path([[-34,-266],[-48,-244],[-39,-161],[-30,-140],[36,-140],[45,-165],[47,-244],[26,-267],[7,-251],[-9,-252]],j,C.ink,3.5);
 // hood folds and collar
 path([[-34,-267],[-17,-280],[4,-268],[26,-279],[40,-265],[23,-239],[6,-251],[-12,-239]],'#ad772c',C.ink,3);
 path([[-14,-269],[2,-252],[-12,-232],[-26,-250]],C.light,C.dark,2);
 path([[18,-267],[3,-251],[19,-234],[31,-253]],'#d5a044',C.dark,2);
 line([[5,-248],[8,-149]],'#785027',3);line([[9,-246],[12,-151]],'#efc66b',1.7);
 line([[-13,-243],[-17,-217]],'#eed197',2.4);ellipse(-17,-215,2.5,4,'#f1d9a2');
 line([[23,-241],[27,-216]],'#eed197',2.4);ellipse(27,-214,2.5,4,'#f1d9a2');
 path([[-34,-194],[-15,-200],[-13,-168],[-32,-164]],'#bd8734','#956028',1.8);
 line([[-37,-154],[36,-154]],'#efbd5a',2);line([[-36,-218],[-28,-207]],'#986028',2);
 // front arm, wrist position shared with prop attachment
 limb(shoulderR,er,hr,27,C.jacket);rr(hr[0]-13,hr[1]-8,26,13,4,'#94622b');
 hand(...hr,o.rf||0,o.open);
 if(o.device){g.save();g.translate(hr[0]+8,hr[1]-12);device(t,o.active??false,.45);g.restore()}
 g.save();g.translate(o.hx||0,-280+(o.hy||0));head(t,o);g.restore();
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
   room(t,0);let x=mix(1015,1090,ramp(t,0,2.5));let reach=ramp(t,1.7,4.0);
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
 label('BETWEEN THE IFS',80,87,23,'#f1d8ac');label('ART + MOTION TEST 01',W-80,87,19,'#d9d6c8','right');
 caption(t);
 const end=ramp(t,24,25.5);if(end){g.fillStyle=`rgba(9,20,30,${end*.62})`;g.fillRect(0,0,W,H);g.save();g.globalAlpha=end;label('THE BORROWED SECOND',W/2,485,65,'#f7e8ca','center');label('One impossible possibility.',W/2,550,27,'#b8d9db','center');g.restore()}
 // clean cinematic bars after all world drawing
 g.fillStyle='#0c1822';g.fillRect(0,0,W,38);g.fillRect(0,H-38,W,38);
 const fade=1-ramp(t,0,.5);if(fade){g.fillStyle=`rgba(9,20,29,${fade})`;g.fillRect(0,0,W,H)}
};
window.render(0);window.READY=true;
