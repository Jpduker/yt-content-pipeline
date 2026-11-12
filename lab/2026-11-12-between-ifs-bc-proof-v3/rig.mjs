// Screen-space sides, deliberately explicit. No shared arm rotation or mirrored pose.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function solveArm(shoulder,target,upper=64,lower=63,bend=1){
 let dx=target[0]-shoulder[0],dy=target[1]-shoulder[1],d=Math.hypot(dx,dy);
 if(d<1e-9){dx=0;dy=1;d=1}
 const ux=dx/d,uy=dy/d;
 const reach=clamp(d,Math.abs(upper-lower)+.001,upper+lower-.001);
 const a=(upper*upper-lower*lower+reach*reach)/(2*reach);
 const h=Math.sqrt(Math.max(0,upper*upper-a*a));
 return {
  shoulder:[...shoulder],
  elbow:[shoulder[0]+ux*a-uy*h*bend,shoulder[1]+uy*a+ux*h*bend],
  wrist:[shoulder[0]+ux*reach,shoulder[1]+uy*reach]
 };
}
export function bodyPose(t,{lift=0,leftGesture=0,recoil=0}={}){
 lift=clamp(lift);leftGesture=clamp(leftGesture);recoil=clamp(recoil);
 const left=solveArm([-22,-247],[-57-16*leftGesture-8*recoil+Math.sin(t*1.2)*.5,-133-24*leftGesture-18*recoil],64,63,1);
 const right=solveArm([38,-249],[67+57*lift+Math.sin(t*1.4)*.4,-133-100*lift],64,63,1);
 return {left,right};
}
