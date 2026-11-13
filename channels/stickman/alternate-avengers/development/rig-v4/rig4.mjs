// RIG V4 — keyframed acting rig for the Alternate Avengers hero.
// Fixes over V3: per-arm elbow bend sign, wrist orientation control, prop
// ownership with contact-locked handover, torso lean above planted feet,
// anticipation/overshoot eases, moving holds. Pure functions of t.

export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;

// ---- eases -----------------------------------------------------------------
export const EASE={
 linear:x=>x,
 smooth:x=>x*x*(3-2*x),
 in:x=>x*x*x,
 out:x=>1-Math.pow(1-x,3),
 // decisive action: fast in, slight overshoot, settle (easeOutBack)
 back:x=>{const c=1.70158,k=c+1;return 1+k*Math.pow(x-1,3)+c*Math.pow(x-1,2)},
 // softer overshoot for heavy things
 backSoft:x=>{const c=0.9,k=c+1;return 1+k*Math.pow(x-1,3)+c*Math.pow(x-1,2)},
 hold:()=>0,
};

// ---- channel sampling --------------------------------------------------------
// anim = { name:[[t,value,ease?],...] }  values: number | [x,y] | string(step)
export function sample(anim,name,t,dflt){
 const keys=anim[name];
 if(!keys||!keys.length)return dflt;
 if(t<=keys[0][0])return keys[0][1];
 for(let i=keys.length-1;i>=0;i--){
  if(t>=keys[i][0]){
   if(i===keys.length-1)return keys[i][1];
   const [t0,v0]=keys[i],[t1,v1,ez='smooth']=keys[i+1];
   if(typeof v1==='string'||typeof v0==='string')return v0; // step
   const u=EASE[ez]?EASE[ez]((t-t0)/(t1-t0)):EASE.smooth((t-t0)/(t1-t0));
   if(Array.isArray(v0))return [lerp(v0[0],v1[0],u),lerp(v0[1],v1[1],u)];
   return lerp(v0,v1,u);
  }
 }
 return dflt;
}

// ---- two-bone IK -------------------------------------------------------------
// bend: +1 elbow on one side of the chord, -1 on the other. For a character at
// origin facing screen-right: near (screen-right) arm wants +1, far (screen-left)
// arm wants -1, so BOTH elbows sag downward/outward instead of one folding up.
export function solveArm(shoulder,target,upper=64,lower=63,bend=1){
 let dx=target[0]-shoulder[0],dy=target[1]-shoulder[1],d=Math.hypot(dx,dy);
 if(d<1e-9){dx=0;dy=1;d=1}
 const ux=dx/d,uy=dy/d;
 const reach=clamp(d,Math.abs(upper-lower)+.001,upper+lower-.001);
 const a=(upper*upper-lower*lower+reach*reach)/(2*reach);
 const h=Math.sqrt(Math.max(0,upper*upper-a*a));
 return {
  shoulder:[shoulder[0],shoulder[1]],
  elbow:[shoulder[0]+ux*a-uy*h*bend,shoulder[1]+uy*a+ux*h*bend],
  wrist:[shoulder[0]+ux*reach,shoulder[1]+uy*reach],
  dir:[ux,uy],reach
 };
}
export const forearmAngle=arm=>Math.atan2(arm.wrist[1]-arm.elbow[1],arm.wrist[0]-arm.elbow[0]);

// ---- damped impulse (deterministic secondary motion, e.g. hanging watch sway)
// events: [[t0, amplitude(rad)], ...]  -> angle at time t
export function swayAngle(t,events,freq=5.2,damp=2.6){
 let a=0;
 for(const [t0,A] of events){
  const dt=t-t0;
  if(dt>0)a+=A*Math.exp(-damp*dt)*Math.sin(freq*dt);
 }
 return a;
}

// ---- pose assembly -----------------------------------------------------------
// Returns everything the drawer needs for one frame of the hero.
// anim channels used:
//  lean(rad) drop(px) breathe(0..1 scale) ex(string) headTilt headNod(px)
//  armR:[x,y] targets in TORSO space, armRBend, armRHand(step), armRWrist(rad offset | 9=auto)
//  armL likewise. Shoulder anchors ride the leaned torso.
export const SH_L=[-22,-247],SH_R=[38,-249],HIP=[0,-152];
export function heroPose(anim,t){
 const lean=sample(anim,'lean',t,0);
 const drop=sample(anim,'drop',t,0);
 const breathe=Math.sin(t*2.0)*.7;
 const sway=Math.sin(t*1.1)*.5;
 // torso transform: rotate about HIP by lean, then small translate
 const cs=Math.cos(lean),sn=Math.sin(lean);
 const toWorld=p=>{
  const x=p[0]-HIP[0],y=p[1]-HIP[1];
  return [HIP[0]+x*cs-y*sn+sway,HIP[1]+x*sn+y*cs+breathe+drop];
 };
 const shL=toWorld(SH_L),shR=toWorld(SH_R);
 const tgtL=sample(anim,'armL',t,[-57,-133]),tgtR=sample(anim,'armR',t,[67,-133]);
 const left=solveArm(shL,toWorld(tgtL),64,63,sample(anim,'armLBend',t,-1));
 const right=solveArm(shR,toWorld(tgtR),64,63,sample(anim,'armRBend',t,1));
 return {
  lean,drop,breathe,sway,toWorld,left,right,
  handL:sample(anim,'armLHand',t,'rest'),handR:sample(anim,'armRHand',t,'rest'),
  wristL:sample(anim,'armLWrist',t,9),wristR:sample(anim,'armRWrist',t,9),
  ex:sample(anim,'ex',t,'curious'),
  headTilt:sample(anim,'headTilt',t,0)+Math.sin(t*1.3)*.012,
  headNod:sample(anim,'headNod',t,0)+Math.sin(t*1.4+.8)*.7,
  neck:toWorld([1,-284])
 };
}
