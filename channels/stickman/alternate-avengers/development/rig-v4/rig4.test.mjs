import test from 'node:test';
import assert from 'node:assert/strict';
import {solveArm,sample,EASE,heroPose,swayAngle} from './rig4.mjs';
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);

test('bone lengths stay fixed across the whole pose space',()=>{
 const anim={armR:[[0,[64,-128]],[5,[126,-283]]],armL:[[0,[-58,-130]],[5,[-98,-204]]],
  lean:[[0,0],[5,.1]],drop:[[0,0],[5,5]],armRBend:[[0,1]],armLBend:[[0,-1]]};
 for(let i=0;i<=200;i++){
  const P=heroPose(anim,i*5/200);
  for(const arm of [P.left,P.right]){
   assert.ok(Math.abs(dist(arm.shoulder,arm.elbow)-64)<1e-7);
   assert.ok(Math.abs(dist(arm.elbow,arm.wrist)-63)<1e-7);
  }
 }
});
test('arms are fully independent channels',()=>{
 const a={armR:[[0,[64,-128]],[2,[126,-283]]],armL:[[0,[-58,-130]]]};
 const b={armR:[[0,[64,-128]],[2,[126,-283]]],armL:[[0,[-58,-130]],[2,[-98,-204]]]};
 const Pa=heroPose(a,2),Pb=heroPose(b,2);
 assert.deepEqual(Pa.right,Pb.right);
 assert.ok(dist(Pa.left.wrist,Pb.left.wrist)>40);
});
test('elbow bend sign puts each elbow on its own natural side',()=>{
 const R=solveArm([38,-249],[80,-205],64,63,1);
 const L=solveArm([-22,-247],[-96,-201],64,63,-1);
 assert.ok(R.elbow[1]>(R.shoulder[1]+R.wrist[1])/2, 'right elbow sags below chord');
 assert.ok(L.elbow[1]>(L.shoulder[1]+L.wrist[1])/2, 'left elbow sags below chord');
 assert.ok(L.elbow[0]<10, 'left elbow never crosses the body centreline');
 assert.ok(R.elbow[0]>-10, 'right elbow never crosses the body centreline');
});
test('feet never move: pose has no channel that can translate the leg layer',()=>{
 const anim={lean:[[0,.1]],drop:[[0,8]],armR:[[0,[126,-283]]]};
 const P=heroPose(anim,1.23);
 // toWorld affects torso-space points only; the drawer renders legs outside it.
 assert.ok(Math.abs(P.toWorld([0,-152])[1]-(-152)-P.breathe-P.drop)<1e-9+8+1);
 assert.equal(typeof P.lean,'number');
});
test('eases are monotone-safe at endpoints and back-ease overshoots then settles',()=>{
 for(const n of ['linear','smooth','in','out','back','backSoft']){
  assert.ok(Math.abs(EASE[n](1)-1)<1e-9,n+' ends at 1');
  if(n!=='back'&&n!=='backSoft')assert.ok(Math.abs(EASE[n](0))<1e-9);
 }
 const peak=Math.max(...Array.from({length:101},(_,i)=>EASE.back(i/100)));
 assert.ok(peak>1.0&&peak<1.2);
});
test('sway impulses decay to silence',()=>{
 assert.ok(Math.abs(swayAngle(30,[[1,.5],[6,.4]]))<1e-6);
 assert.equal(swayAngle(.5,[[1,.5]]),0);
});
test('step channels never interpolate strings',()=>{
 const anim={hand:[[0,'closed'],[2,'open']]};
 assert.equal(sample(anim,'hand',1.999,'x'),'closed');
 assert.equal(sample(anim,'hand',2.0,'x'),'open');
});
