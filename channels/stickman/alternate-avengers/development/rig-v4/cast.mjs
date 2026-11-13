// CAST V4 — drawing module shared by the rig exercise and AA01.
// Uses the canonical approved mustard-hero sprites; preserves V2 face/texture.
import {clamp,lerp,EASE,sample,solveArm,forearmAngle,swayAngle,heroPose} from './rig4.mjs';
const TAU=Math.PI*2;

export async function loadSprites(base='../../assets/characters/mustard-hero/v1/'){
 const S={};
 for(const n of ['curious','happy','awe','fear','torso-clean','upper-sleeve','lower-sleeve','hand-rest','hand-open','hand-closed','legs']){
  const im=new Image();im.src=base+n+'.png';await im.decode();S[n]=im;
 }
 return S;
}

function segment(g,im,a,b,width){
 const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);
 g.save();g.translate(a[0],a[1]);g.rotate(Math.atan2(dy,dx)-Math.PI/2);
 g.drawImage(im,-width/2,-7,width,len+14);g.restore();
}
const ell=(g,x,y,rx,ry,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,rot,0,TAU);g.fill()};

// hand-local anchor where a held prop attaches, per hand pose
export const GRIP={open:[24,-4],closed:[1,7],rest:[2,12]};

const wrapA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
// hand frame: rotation + mirror per side/pose, given forearm angle fa.
// The open-palm sprite extends +x; on the far (left) arm it must mirror.
export function handFrame(side,pose,fa,extra=0){
 if(pose==='open'){
  if(side==='L')return {rot:wrapA(fa+Math.PI)*.35+extra,mx:-1};
  return {rot:fa*.35+extra,mx:1};
 }
 if(pose==='rest')return {rot:(fa-Math.PI/2)*.9+extra,mx:1};
 return {rot:(fa-Math.PI/2)*.75+extra,mx:1}; // closed follows forearm loosely
}
function drawHand(g,S,pose,frame){
 g.save();g.rotate(frame.rot);g.scale(frame.mx,1);
 if(pose==='open')g.drawImage(S['hand-open'],-3,-21,46,28);
 else if(pose==='closed')g.drawImage(S['hand-closed'],-8,-4,18,31);
 else g.drawImage(S['hand-rest'],-7,-3,16,31);
 g.restore();
}

// ---- pocket watch (original prop carried over from the approved proof) ------
export function drawWatch(g,t,{active=false,s=1,sway=0,hang=true}={}){
 const c=active?'#72f4ef':'#efc263';
 g.save();g.scale(s,s);
 if(hang){g.rotate(sway);g.translate(0,52)} // crown pinched at origin, body hangs
 const glow=g.createRadialGradient(0,0,0,0,0,110);
 glow.addColorStop(0,active?'rgba(77,232,232,.22)':'rgba(246,178,63,.12)');glow.addColorStop(1,'rgba(0,0,0,0)');
 g.fillStyle=glow;g.fillRect(-110,-110,220,220);
 ell(g,0,0,43,43,'#3a3530');ell(g,0,0,35,35,'#172d35');
 g.strokeStyle=c;g.lineWidth=3;g.beginPath();g.arc(0,0,33,0,TAU);g.stroke();
 for(let i=0;i<12;i++){const a=i*TAU/12;
  g.beginPath();g.moveTo(Math.sin(a)*25,Math.cos(a)*25);g.lineTo(Math.sin(a)*30,Math.cos(a)*30);
  g.strokeStyle='#c9bb8d';g.lineWidth=2;g.stroke()}
 const a=active?1.4:t*2;
 g.beginPath();g.moveTo(0,0);g.lineTo(Math.sin(a)*23,-Math.cos(a)*23);g.strokeStyle=c;g.lineWidth=2.5;g.lineCap='round';g.stroke();
 g.beginPath();g.moveTo(0,0);g.lineTo(-14,-8);g.strokeStyle='#eac86f';g.lineWidth=3;g.stroke();
 ell(g,0,0,4,4,c);
 g.beginPath();g.roundRect(-7,-52,14,13,3);g.fillStyle='#bc8c48';g.fill(); // crown
 g.restore();
}

// ---- the hero ----------------------------------------------------------------
// opts: {x,y,s, prop:'R'|'L'|null, propActive, rig:bool}
export function drawHero(g,S,t,anim,opts={}){
 const {x=0,y=0,s=1}=opts;
 const P=heroPose(anim,t);
 g.save();g.translate(x,y);g.scale(s,s);
 ell(g,3,0,51,8,'rgba(10,22,30,.30)');          // contact shadow — never moves
 g.drawImage(S.legs,-37,-162,77,166);           // planted feet
 const drawArm=(arm,side,hand,wrist,held)=>{
  ell(g,arm.elbow[0],arm.elbow[1],12,12,'#b77c2b');
  segment(g,S['upper-sleeve'],arm.shoulder,arm.elbow,28);
  segment(g,S['lower-sleeve'],arm.elbow,arm.wrist,25);
  const fa=forearmAngle(arm);
  const fr=handFrame(side,hand,fa,wrist===9?0:wrist);
  g.save();g.translate(arm.wrist[0],arm.wrist[1]);
  drawHand(g,S,hand,fr);
  if(held){g.rotate(fr.rot);const gp=GRIP[hand]||GRIP.closed;g.translate(gp[0]*fr.mx,gp[1]);held(g)}
  g.restore();
 };
 const heldR=opts.prop==='R'?(gg)=>drawWatch(gg,t,{active:opts.propActive,s:.42,sway:opts.propSway||0,hang:P.handR!=='open'}):null;
 const heldL=opts.prop==='L'?(gg)=>drawWatch(gg,t,{active:opts.propActive,s:.42,sway:opts.propSway||0,hang:P.handL!=='open'}):null;
 drawArm(P.left,'L',P.handL,P.wristL,heldL);        // far arm fully behind torso
 // torso rides the lean
 g.save();g.translate(P.sway,P.breathe+P.drop);g.translate(0,-152);g.rotate(P.lean);g.translate(0,152);
 g.drawImage(S['torso-clean'],-49,-289,105,165);g.restore();
 // far shoulder seam patch, clipped so the far arm stays behind the body
 g.save();g.beginPath();g.ellipse(P.left.shoulder[0],P.left.shoulder[1]+4,13,17,0,0,TAU);g.clip();
 ell(g,P.left.shoulder[0],P.left.shoulder[1]+4,13,17,'#b77c2b');
 segment(g,S['upper-sleeve'],P.left.shoulder,P.left.elbow,28);g.restore();
 drawArm(P.right,'R',P.handR,P.wristR,heldR);       // near arm in front
 g.save();g.translate(P.neck[0],P.neck[1]+P.headNod*.3);
 g.rotate(P.headTilt);
 const face=S[P.ex==='suspicious'?'curious':P.ex]||S.curious;
 g.drawImage(face,-65,-137,132,142);g.restore();
 if(opts.rig){
  for(const [arm,c] of [[P.left,'#87e3fa'],[P.right,'#ff91ca']]){
   g.strokeStyle=c;g.lineWidth=2;g.beginPath();g.moveTo(...arm.shoulder);g.lineTo(...arm.elbow);g.lineTo(...arm.wrist);g.stroke();
   for(const j of [arm.shoulder,arm.elbow,arm.wrist])ell(g,j[0],j[1],3,3,c);
  }
  g.strokeStyle='#ffd34f';g.beginPath();g.moveTo(-60,2);g.lineTo(60,2);g.stroke(); // ground line
 }
 g.restore();
 return P;
}
// world position of the hero's grip point (for prop handover geometry)
export function heroGripWorld(S,t,anim,opts,side='R'){
 const {x=0,y=0,s=1}=opts;
 const P=heroPose(anim,t);
 const arm=side==='R'?P.right:P.left,hand=side==='R'?P.handR:P.handL,wr=side==='R'?P.wristR:P.wristL;
 const fa=forearmAngle(arm);
 const fr=handFrame(side,hand,fa,wr===9?0:wr);
 const gp=GRIP[hand]||GRIP.closed;
 const gx=gp[0]*fr.mx,gy=gp[1];
 const lx=arm.wrist[0]+gx*Math.cos(fr.rot)-gy*Math.sin(fr.rot);
 const ly=arm.wrist[1]+gx*Math.sin(fr.rot)+gy*Math.cos(fr.rot);
 return [x+lx*s,y+ly*s];
}

// ---- the other presence: a colossal dark hand (original design) --------------
// An original "dark sovereign" fan-interpretation visual: obsidian plates,
// teal rim light. Deliberately NOT the comic/film character design.
export function drawWardenHand(g,t,{x,y,s=1,closed=0,alpha=1,rim='#46e2eb',rot=.78}={}){
 if(alpha<=0)return;
 g.save();g.globalAlpha=alpha;g.translate(x,y);g.scale(s,s);
 // forearm from off-screen top-right
 g.save();g.rotate(rot);
 const grad=g.createLinearGradient(0,-900,0,40);
 grad.addColorStop(0,'#0b0f15');grad.addColorStop(1,'#1c232e');
 g.fillStyle=grad;g.beginPath();g.roundRect(-80,-940,160,940,42);g.fill();
 g.strokeStyle='rgba(70,226,235,.5)';g.lineWidth=3.5;
 g.beginPath();g.moveTo(-77,-880);g.lineTo(-77,-50);g.stroke();
 for(const yy of [-420,-300,-180]){g.strokeStyle='rgba(70,226,235,.22)';g.lineWidth=2.5;g.beginPath();g.moveTo(-80,yy);g.lineTo(80,yy+34);g.stroke()}
 g.restore();
 // palm
 const pg=g.createRadialGradient(0,0,8,0,0,95);
 pg.addColorStop(0,'#232c3a');pg.addColorStop(1,'#121820');
 g.fillStyle=pg;g.beginPath();g.ellipse(0,0,78,66,-.25,0,TAU);g.fill();
 g.strokeStyle='rgba(70,226,235,.4)';g.lineWidth=2.5;g.beginPath();g.ellipse(0,0,78,66,-.25,0,TAU);g.stroke();
 // four long fingers + thumb curl with `closed`
 const curl=EASE.smooth(clamp(closed));
 for(let i=0;i<4;i++){
  const bx=-58+i*36,len=112-Math.abs(i-1.3)*11;
  const a0=lerp(.5,1.72,curl)+i*.05, a1=lerp(.18,1.5,curl);
  g.save();g.translate(bx,40);g.rotate(a0-.9);
  g.fillStyle='#1a212c';g.beginPath();g.roundRect(-12,0,24,len*.58,11);g.fill();
  g.strokeStyle='rgba(70,226,235,.3)';g.lineWidth=2;g.strokeRect(-12,2,24,len*.56);
  g.translate(0,len*.56);g.rotate(a1*.85);
  g.fillStyle='#161c26';g.beginPath();g.roundRect(-10,0,20,len*.46,10);g.fill();
  g.translate(0,len*.44);g.rotate(a1*.5);
  g.fillStyle='#12171f';g.beginPath();g.roundRect(-8,0,16,len*.3,8);g.fill();
  g.restore();
 }
 g.save();g.translate(70,10);g.rotate(lerp(-.15,-1.25,curl));
 g.fillStyle='#1a212c';g.beginPath();g.roundRect(-11,0,22,66,10);g.fill();g.restore();
 g.restore();
}
export const WARDEN_GRIP=[0,30]; // palm-local point a pinched prop hangs from
