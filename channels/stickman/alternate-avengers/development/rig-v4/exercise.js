// RIG EXERCISE 04 — acting + object handover, 1080x1920, 10 s.
// Tests: independent arms, elbow directions, wrist orientation, torso support,
// planted feet, stable prop contact, cross-character handover, recoil, settle.
import {sample,swayAngle,EASE,clamp,lerp} from './rig4.mjs';
import {loadSprites,drawHero,heroGripWorld,drawWatch,drawWardenHand,WARDEN_GRIP} from './cast.mjs';
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const W=1080,H=1920;canvas.width=innerWidth;canvas.height=innerHeight;
const S=await loadSprites();
const TAU=Math.PI*2;

const HERO={x:430,y:1430,s:2.15};
const XFER=[741,845];           // world point where the watch is pinned during the exchange
const WARDEN_S=1.35;            // palm grip lands on XFER: pos = XFER - WARDEN_GRIP*WARDEN_S

// ---------------- hero acting track ----------------
const anim={
 ex:[[0,'curious'],[1.4,'happy'],[4.4,'curious'],[4.9,'awe'],[6.6,'fear'],[7.9,'awe'],[9.0,'curious']],
 lean:[[0,0],[1.15,0],[1.4,-.028,'smooth'],[1.85,.05,'back'],[3.2,.045],[3.5,.06,'smooth'],[4.4,.05],
       [5.3,.09,'smooth'],[6.35,.1],[6.75,-.055,'back'],[7.9,-.03],[9.3,0,'smooth']],
 drop:[[0,0],[1.15,0],[1.38,4,'out'],[1.8,-1.5,'back'],[2.4,0],[6.55,0],[6.8,5,'out'],[7.6,2],[9.2,0,'smooth']],
 headTilt:[[0,-.02],[1.9,.06,'smooth'],[3.4,.12,'smooth'],[4.4,.05],[5.0,-.16,'smooth'],[6.7,-.22],[8.2,-.1,'smooth'],[9.4,-.02,'smooth']],
 headNod:[[0,0],[1.9,3,'back'],[4.9,-9,'smooth'],[6.8,-13],[8.4,-5,'smooth'],[9.5,0]],
 // RIGHT arm: raise watch -> hold -> offer up to MEET -> release -> settle down
 armR:[[0,[64,-128]],[1.15,[64,-128]],[1.42,[52,-138],'smooth'],           // anticipation: wind slightly back/down
       [1.95,[76,-204],'back'],[3.3,[78,-202]],[4.6,[80,-205]],            // present chest-high, moving hold
       [5.45,[118,-268],'smooth'],[6.3,[126,-283],'out'],                  // offer up toward the big hand
       [6.9,[108,-214],'smooth'],[7.7,[70,-136],'out'],[9.5,[64,-128]]],   // withdraw, settle
 armRBend:[[0,1]],
 armRHand:[[0,'closed'],[6.5,'open'],[7.15,'rest']],                        // releases only after the grab closes
 armRWrist:[[0,9]],
 // LEFT arm: rest -> palm-up "see?" gesture at 3.3-4.6 (right must not move) -> rest
 armL:[[0,[-58,-130]],[3.15,[-58,-130]],[3.35,[-52,-140],'smooth'],
       [3.8,[-98,-204],'back'],[4.5,[-96,-201]],
       [5.3,[-62,-136],'out'],[9.0,[-58,-130]]],
 armLBend:[[0,-1]],
 armLHand:[[0,'rest'],[3.5,'open'],[5.2,'rest']],
 armLWrist:[[0,9]],
};
// ---------------- the other hand ----------------
const warden={
 pos:[[4.4,[W+340,-520]],[5.35,[XFER[0]+70,XFER[1]-260],'out'],[6.28,[XFER[0],XFER[1]-40.5],'smooth'],
      [6.95,[XFER[0],XFER[1]-40.5]],[7.45,[XFER[0]+60,XFER[1]-200],'smooth'],[8.6,[W+400,-560],'in']],
 closed:[[0,0],[6.28,0],[6.46,1,'out']],
 alpha:[[4.4,0],[4.75,1,'out'],[8.35,1],[8.6,0]],
};
// prop ownership: hero right hand until contact, then warden
const T_HOLD_END=6.30, T_CARRY=6.58; // hero-held -> world-pinned -> warden-held
// watch sway impulses: end of raise, start of offer, the grab, the carry-away
const SWAY=[[1.95,.5],[3.8,.12],[5.45,.33],[6.46,.38],[7.45,.3]];

function bg(t){
 const sky=g.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#101d2c');sky.addColorStop(.45,'#16293c');sky.addColorStop(1,'#0c1a26');
 g.fillStyle=sky;g.fillRect(0,0,W,H);
 // warm lamp pool from the left, cool rim from the right (C's blue/amber recipe)
 let gr=g.createRadialGradient(140,560,40,140,560,900);
 gr.addColorStop(0,'rgba(235,170,80,.20)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
 gr=g.createRadialGradient(W-60,300,60,W-60,300,1100);
 gr.addColorStop(0,'rgba(70,200,225,.10)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);
 // floorboards
 g.fillStyle='#1a2430';g.fillRect(0,1450,W,H-1450);
 g.strokeStyle='rgba(224,186,124,.08)';g.lineWidth=2;
 for(let i=0;i<7;i++){g.beginPath();g.moveTo(0,1480+i*64);g.lineTo(W,1466+i*64);g.stroke()}
 // faint wall props
 g.strokeStyle='rgba(224,186,124,.10)';g.lineWidth=5;
 g.beginPath();g.arc(210,420,110,0,TAU);g.stroke();
 g.beginPath();g.moveTo(210,420);g.lineTo(210,350);g.stroke();
 g.beginPath();g.moveTo(210,420);g.lineTo(258,436);g.stroke();
 for(let i=0;i<26;i++){const x=(i*173)%W,y=(i*127+t*14)%H;
  g.fillStyle='rgba(255,214,141,.10)';g.fillRect(x,y,2,2)}
}
window.DUR=10;
window.EV=[{t:1.5,type:'raise'},{t:3.4,type:'gestureL'},{t:6.46,type:'handover'},{t:8.6,type:'exit'}];
window.render=function(t){
 g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);g.clearRect(0,0,W,H);
 bg(t);
 const rigOn=new URLSearchParams(location.search).get('rig')==='1';
 const sway=swayAngle(t,SWAY);
 // hero holds the watch until the exchange begins
 drawHero(g,S,t,anim,{...HERO,prop:t<T_HOLD_END?'R':null,propActive:t>5.2,propSway:sway,rig:rigOn});
 // the dark hand
 const wp=sample(warden,'pos',t,[W+340,-520]);
 const wc=sample(warden,'closed',t,0),wa=sample(warden,'alpha',t,0);
 drawWardenHand(g,t,{x:wp[0],y:wp[1],s:WARDEN_S,closed:wc,alpha:wa});
 if(t>=T_HOLD_END&&t<T_CARRY){ // pinched in place: fingers close around a stationary watch
  g.save();g.translate(XFER[0],XFER[1]);drawWatch(g,t,{active:true,s:.9,sway:sway,hang:true});g.restore();
 }else if(t>=T_CARRY&&wa>0){   // then it rides the warden grip
  g.save();g.translate(wp[0]+WARDEN_GRIP[0]*WARDEN_S,wp[1]+WARDEN_GRIP[1]*WARDEN_S);
  drawWatch(g,t,{active:true,s:.9,sway:sway,hang:true});g.restore();
 }
 if(rigOn){ // contact diagnostics
  const hg=heroGripWorld(S,t,anim,HERO,'R');
  g.fillStyle='#7dff9b';g.beginPath();g.arc(hg[0],hg[1],6,0,TAU);g.fill();
  g.fillStyle='#ff6464';g.beginPath();g.arc(XFER[0],XFER[1],5,0,TAU);g.fill();
  g.fillStyle='#fff';g.font='26px sans-serif';g.textAlign='left';g.fillText('t='+t.toFixed(2),30,60);
 }
 // slate
 g.fillStyle='rgba(241,216,172,.85)';g.font='600 30px "Trebuchet MS",sans-serif';g.textAlign='left';
 g.fillText('ALTERNATE AVENGERS · RIG EXERCISE 04',48,86);
 g.textAlign='right';g.fillText(['idle','present R','gesture L (R holds)','offer','handover','recoil','settle'][t<1.2?0:t<3.3?1:t<4.6?2:t<6.46?3:t<7.1?4:t<8.6?5:6],W-48,86);
};
window.render(0);window.READY=true;
