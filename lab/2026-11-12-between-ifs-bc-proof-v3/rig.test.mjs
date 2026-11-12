import test from 'node:test';
import assert from 'node:assert/strict';
import {bodyPose,solveArm} from './rig.mjs';
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);

test('each arm keeps fixed bone lengths throughout the gesture range',()=>{
 for(let f=0;f<624;f++)for(const lift of [0,.2,.5,.8,1]){
  const p=bodyPose(f/24,{lift,leftGesture:(f%100)/100,recoil:f>480?1:0});
  for(const arm of [p.left,p.right]){
   assert.ok(Math.abs(dist(arm.shoulder,arm.elbow)-64)<1e-7);
   assert.ok(Math.abs(dist(arm.elbow,arm.wrist)-63)<1e-7);
  }
 }
});
test('right-arm lift does not drive or mirror the left arm',()=>{
 const a=bodyPose(3,{lift:0,leftGesture:.4}),b=bodyPose(3,{lift:1,leftGesture:.4});
 assert.deepEqual(a.left,b.left);
 assert.ok(dist(a.right.wrist,b.right.wrist)>50);
});
test('left gesture stays on its side and does not alter the right grip',()=>{
 const a=bodyPose(8,{lift:1,leftGesture:0}),b=bodyPose(8,{lift:1,leftGesture:1});
 assert.deepEqual(a.right,b.right);
 assert.ok(dist(a.left.wrist,b.left.wrist)>25);
 for(let i=0;i<=100;i++){
  const p=bodyPose(i/4,{lift:i/100,leftGesture:i/100,recoil:i/100});
  assert.ok(p.left.wrist[0]<-48);
  assert.ok(p.left.elbow[0]<-36);
  assert.ok(p.right.wrist[0]>55);
 }
});
test('unreachable targets clamp without stretching or invalid joints',()=>{
 for(const target of [[0,0],[10000,-10000],[1e-10,1e-10]]){
  const a=solveArm([0,0],target,64,63,1);
  assert.ok(a.elbow.every(Number.isFinite)&&a.wrist.every(Number.isFinite));
  assert.ok(Math.abs(dist(a.shoulder,a.elbow)-64)<1e-7);
  assert.ok(Math.abs(dist(a.elbow,a.wrist)-63)<1e-7);
 }
});
test('presenting arm bends below shoulder rather than folding upward',()=>{
 const p=bodyPose(4,{lift:1});
 assert.ok(p.right.elbow[1]>p.right.shoulder[1]+10);
 assert.ok(p.right.elbow[1]>p.right.wrist[1]+10);
});
