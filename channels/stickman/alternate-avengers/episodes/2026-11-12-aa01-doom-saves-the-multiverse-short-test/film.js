// AA01 — What If Doom Was Saving the Multiverse?  1080x1920, ~40 s.  v2
// Unofficial fan fiction. Original visuals: approved mustard hero (rig v4) +
// an original dark-sovereign figure (not the franchise costume design).
import {sample,swayAngle,EASE,clamp,lerp} from '../../development/rig-v4/rig4.mjs';
import {loadSprites,drawHero,drawWatch,drawWardenHand,WARDEN_GRIP,heroGripWorld} from '../../development/rig-v4/cast.mjs';
const canvas=document.querySelector('canvas'),g=canvas.getContext('2d');
const W=1080,H=1920;canvas.width=innerWidth;canvas.height=innerHeight;
const S=await loadSprites();
const TL=await (await fetch('audio/timeline.json')).json();
const CUES=TL.cues;const TAU=Math.PI*2;
const line=id=>CUES.find(c=>c.id===id);
const word=(id,w)=>line(id).words.find(x=>x[0].toLowerCase().startsWith(w));
// ---- shared timing (score.py derives identically) ----
const T_CRACK=word('01','split')[1];
const T_S2=line('01').end+.55, T_S3=line('02').end+.5;
const T_S4=line('05').start-.5;
const T_OFFER=line('06').end+.15, T_GRAB=line('06').end+.85;
const T_CARRY=T_GRAB+.25, T_FLASH=line('07').start-.25;
const T_S5=line('07').start, T_S6=line('08').start-.3;
const T_RET_IN=line('08').start+.3, T_RELEASE=word('08','watch')[1], T_TAKE=T_RELEASE+.4;
const T_S7=line('09').start-.6, T_WALK=line('10').end+.4, T_CARD=line('10').end+3.3;
window.DUR=TL.DUR;
window.EV=[{t:T_CRACK,type:'crack'},{t:T_GRAB,type:'handover'},{t:T_FLASH,type:'heal'},{t:T_RELEASE,type:'return'},{t:T_CARD,type:'card'}];
const R=(seed=>()=> (seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff)(99);
const SCAT=Array.from({length:300},()=>[R(),R(),R(),R()]);
const ell=(x,y,rx,ry,c,rot=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,rot,0,TAU);g.fill()};
const glowAt=(x,y,r,c0)=>{const a=g.createRadialGradient(x,y,0,x,y,r);a.addColorStop(0,c0);a.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=a;g.fillRect(x-r,y-r,2*r,2*r)};
const ramp=(t,a,b,ez='smooth')=>EASE[ez](clamp((t-a)/(b-a)));

// ================= sky =================
function sky(t,heal=0){
 const gr=g.createLinearGradient(0,0,0,H);
 gr.addColorStop(0,`rgb(${20+26*heal},${34+30*heal},${56+26*heal})`);
 gr.addColorStop(.42,`rgb(${24+14*heal},${42+16*heal},${66+14*heal})`);
 gr.addColorStop(.8,'#17293d');gr.addColorStop(1,'#101c2b');
 g.fillStyle=gr;g.fillRect(-600,-600,W+1200,H+1200); // bleed: camera pans + shake never expose edges
 // moon high left
 glowAt(190,230,180,'rgba(214,232,240,.16)');
 ell(190,230,46,46,'#dde8ee');ell(174,218,12,12,'#c3d2da');ell(206,244,8,8,'#c9d8df');
 // cloud bands
 g.fillStyle='rgba(30,52,74,.55)';
 for(const [cx,cy,cw] of [[260,420,500],[760,330,560],[520,620,640],[880,780,460]]){
  g.beginPath();g.ellipse(cx+Math.sin(t*.1)*12,cy,cw/2,34,0,0,TAU);g.fill()}
 for(let i=0;i<110;i++){const [a,b,c]=SCAT[i];
  ell(a*W,b*H*.6,.8+c,.8+c,`rgba(205,228,238,${.16+.26*c})`)}
}
function fissure(t,open,heal=0){
 if(open<=0||heal>=1)return;
 const seg=[[540,-40],[480,230],[585,470],[505,730],[600,980],[520,1180]];
 const zip=1-heal;
 g.save();g.globalAlpha=open*(heal>0?.5+.5*zip:1);
 glowAt(545,560,470*open,`rgba(64,220,232,${.20*open*zip+.05})`);
 g.strokeStyle='#9bf9f4';g.shadowColor='#4fd8dd';g.shadowBlur=30;g.lineCap='round';g.lineJoin='round';
 const upTo=seg.length*zip;
 g.lineWidth=9*open;g.beginPath();
 seg.forEach((p,i)=>{if(i>upTo)return;const wob=Math.sin(t*2.2+i)*3;
  i?g.lineTo(p[0]+wob,p[1]):g.moveTo(p[0],p[1])});
 g.stroke();
 g.lineWidth=3*open;
 for(const [bx,by,dx,dy] of [[500,300,-150,90],[565,520,170,70],[520,800,-130,120],[585,1030,140,100],[480,180,120,-60]]){
  if(by>1180*zip+60)continue;
  g.beginPath();g.moveTo(bx,by);g.lineTo(bx+dx*open,by+dy*open);g.stroke();
 }
 g.restore();
}
// buildings framing both sides; windows carry the warmth
function buildings(t,mut=0){
 const warm=1-mut*.55;
 const blocks=[ // [x,w,topY,shade]
  [-30,230,1010,'#141f2d'],[180,170,1120,'#182435'],[320,130,1210,'#121c29'],
  [W-210,250,980,'#141f2d'],[W-330,160,1100,'#182435'],[W-430,120,1230,'#121c29']];
 for(const [x,w,topY,c] of blocks){
  g.fillStyle=c;g.fillRect(x,topY,w,1560-topY+40);
  g.fillStyle='rgba(10,16,26,.5)';g.fillRect(x,topY,w,14);
 }
 let wi=0;
 for(const [x,w,topY] of blocks.map(b=>[b[0],b[1],b[2]])){
  for(let yy=topY+40;yy<1480;yy+=74){
   for(let xx=x+22;xx<x+w-26;xx+=56){
    const r=SCAT[(wi++)%300];
    if(r[0]>.42)continue;
    g.fillStyle=`rgba(255,${176+40*r[1]},${96+30*r[2]},${(0.16+.3*r[2])*warm})`;
    g.fillRect(xx,yy,22,30);
   }
  }
 }
 // far skyline band
 g.fillStyle='rgba(22,36,54,.8)';
 for(const [x,w,h] of [[380,90,210],[470,70,160],[560,120,250],[690,80,180]]){
  g.fillRect(x,1560-280-h*.4,w,h*.4+40)}
}
function street(t,mut){
 const healP=ramp(t,T_FLASH,T_S5+1.5)*.7;
 sky(t,healP);
 fissure(t,t>T_CRACK?1:0,t>T_FLASH?ramp(t,T_FLASH-.1,T_S5+1.2):0);
 buildings(t,mut);
 const rd=g.createLinearGradient(0,1400,0,H+500);
 rd.addColorStop(0,mut?'#1b2533':'#202d3f');rd.addColorStop(1,'#0d1724');
 g.fillStyle=rd;g.fillRect(-400,1400,W+800,H);
 g.fillStyle='rgba(11,19,29,.65)';g.fillRect(-400,1400,W+800,26); // curb
 g.strokeStyle='rgba(224,200,150,.08)';g.lineWidth=3;
 for(let i=0;i<6;i++){g.beginPath();g.moveTo(-300,1480+i*95);g.lineTo(W+300,1462+i*95);g.stroke()}
 // puddle glints
 for(let i=0;i<12;i++){const [a,b,c]=SCAT[i+250];
  ell(a*W,1500+b*330,26+c*30,4,`rgba(110,200,220,${.05+.08*c})`)}
 // lamp
 g.strokeStyle='#2a323c';g.lineWidth=13;g.beginPath();g.moveTo(140,1560);g.lineTo(140,1060);g.stroke();
 g.beginPath();g.moveTo(140,1060);g.quadraticCurveTo(140,1010,200,1010);g.stroke();
 ell(208,1018,24,15,'#473f28');
 glowAt(208,1030,260,`rgba(240,178,84,${mut?.12:.22})`);
 glowAt(208,1500,300,`rgba(240,178,84,${mut?.05:.10})`);
 // drifting teal motes
 for(let i=0;i<46;i++){const [a,b,c]=SCAT[i+170];
  const y=(b*H+t*(9+7*c))%H;
  ell(a*W,y,1.2+c,1.2+c,`rgba(140,226,230,${.09+.12*c})`)}
 // depth fog over the far end
 const fog=g.createLinearGradient(0,1280,0,1560);
 fog.addColorStop(0,'rgba(36,58,82,0)');fog.addColorStop(1,`rgba(36,58,82,${.33-.1*mut})`);
 g.fillStyle=fog;g.fillRect(-400,1280,W+800,290);
}
// ================= the sovereign =================
function sovereign(t,{x,y,s,brace=0,eye=1,talk=0,walk=0,fade=1}){
 if(fade<=0)return;
 g.save();g.globalAlpha=fade;g.translate(x,y);g.scale(s,s);
 const bob=walk?Math.sin(t*6.4)*4:Math.sin(t*1.5)*1.5;
 g.translate(0,bob);
 glowAt(0,-20,170,'rgba(79,216,221,.10)'); // ground presence
 const sw=walk?Math.sin(t*6.4)*26:0;
 g.fillStyle='#10151d';
 g.beginPath();g.roundRect(-34+sw*.4,-210,30,214,12);g.fill();
 g.beginPath();g.roundRect(6-sw*.4,-210,30,214,12);g.fill();
 const bd=g.createLinearGradient(0,-900,0,-160);
 bd.addColorStop(0,'#232e3e');bd.addColorStop(1,'#101722');
 g.fillStyle=bd;
 g.beginPath();g.moveTo(-96,-180);g.lineTo(-70,-840);g.lineTo(-30,-905);g.lineTo(34,-905);g.lineTo(76,-835);g.lineTo(100,-180);g.closePath();g.fill();
 // teal rim light down the fissure-side edge
 g.strokeStyle='rgba(96,224,230,.5)';g.lineWidth=4;
 g.beginPath();g.moveTo(-93,-200);g.lineTo(-68,-836);g.lineTo(-29,-900);g.stroke();
 g.fillStyle='#1b2434';
 g.beginPath();g.moveTo(-118,-800);g.lineTo(-64,-862);g.lineTo(-52,-800);g.closePath();g.fill();
 g.beginPath();g.moveTo(122,-796);g.lineTo(66,-858);g.lineTo(54,-796);g.closePath();g.fill();
 g.strokeStyle='#141c28';g.lineCap='round';g.lineWidth=34;
 if(brace>0){
  g.beginPath();g.moveTo(-72,-800);g.quadraticCurveTo(-120,-930,-96,-1050);g.stroke();
  g.beginPath();g.moveTo(74,-800);g.quadraticCurveTo(130,-940,100,-1060);g.stroke();
 }else{
  g.beginPath();g.moveTo(-74,-790);g.quadraticCurveTo(-98,-600,-86,-420);g.stroke();
  g.beginPath();g.moveTo(76,-790);g.quadraticCurveTo(102,-590,90,-430);g.stroke();
 }
 g.strokeStyle=`rgba(79,216,221,${.4+.3*Math.sin(t*2.1)})`;g.lineWidth=2.5;
 for(const [ax,ay,bx,by] of [[-40,-760,-18,-600],[30,-700,12,-520],[-6,-860,8,-740]]){
  g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke();}
 ell(2,-955,64,74,'#1a2230');
 g.strokeStyle='rgba(96,224,230,.35)';g.lineWidth=3;
 g.beginPath();g.ellipse(2,-955,64,74,0,2.2,4.3);g.stroke();
 if(talk)glowAt(2,-950,120,'rgba(88,232,238,.14)');
 const blink=(Math.sin(t*.7)>.985)?.2:1;
 const pulse=eye*(0.55+0.45*(talk?Math.abs(Math.sin(t*9)):.6))*blink;
 glowAt(-20,-962,36,`rgba(88,232,238,${.4*pulse})`);
 glowAt(26,-962,36,`rgba(88,232,238,${.4*pulse})`);
 ell(-20,-962,10,5.5,`rgba(186,252,252,${.95*pulse})`,-.06);
 ell(26,-962,10,5.5,`rgba(186,252,252,${.95*pulse})`,.06);
 g.restore();
}
function passerby(t,x0,y,s,dir,t0,speed,c='#070b11'){
 const x=x0+dir*(t-t0)*speed;
 if(x<-140||x>W+140)return;
 g.save();g.translate(x,y);g.scale(s*dir,s);
 glowAt(0,-130,150,'rgba(240,186,110,.07)');          // lamp spill keys them out
 const sw=Math.sin(t*7.2)*16;
 g.fillStyle=c;
 g.beginPath();g.roundRect(-16+sw*.5,-120,14,122,7);g.fill();
 g.beginPath();g.roundRect(4-sw*.5,-120,14,122,7);g.fill();
 g.beginPath();g.roundRect(-22,-250,46,140,18);g.fill();
 ell(1,-282,26,28,c);
 g.strokeStyle='rgba(126,214,226,.4)';g.lineWidth=2.5;  // cool rim
 g.beginPath();g.moveTo(-20,-244);g.lineTo(-20,-128);g.stroke();
 g.beginPath();g.ellipse(1,-282,26,28,0,2.4,4.2);g.stroke();
 g.restore();
}
// ================= captions =================
function caption(t){
 const cue=CUES.find(c=>t>=c.start&&t<c.end+.12);if(!cue)return;
 const wi=cue.words.findIndex(w=>t>=w[1]&&t<w[2]);
 const idx=wi<0?(t>=cue.end?cue.words.length-1:0):wi;
 const CH=3,base=Math.floor(idx/CH)*CH;
 const shown=cue.words.slice(base,base+CH);
 const hot=cue.speaker==='doom'?'#72f4ef':'#f1bf64';
 g.font='800 76px "Trebuchet MS",sans-serif';g.textAlign='left';
 const widths=shown.map(w=>g.measureText(w[0]+' ').width);
 const tw=widths.reduce((a,b)=>a+b,0);let x=(W-tw)/2;
 for(let i=0;i<shown.length;i++){
  const w=shown[i],on=base+i===idx;
  g.lineJoin='round';g.strokeStyle='rgba(10,16,24,.92)';g.lineWidth=14;
  g.strokeText(w[0],x,1560);
  g.fillStyle=on?hot:'#f7eedb';g.fillText(w[0],x,1560);
  x+=widths[i];
 }
}
// ================= camera on the street world =================
const cam={k:[[T_S3,[500,1120,1.0]],
 [line('04').start,[560,1100,1.14,'smooth']],[line('04').end+.4,[560,1100,1.14]],
 [T_S4,[470,1160,1.12,'smooth']],
 [line('06').start-.3,[440,1180,1.3,'smooth']],[line('06').end+.2,[440,1180,1.32]],
 [T_GRAB-.3,[520,1115,1.22,'smooth']],[T_CARRY+.5,[520,1115,1.22]],
 [T_S5,[500,1150,1.0,'smooth']],
 [T_S6,[520,1230,1.1]],[T_RET_IN+.3,[552,1222,1.9,'smooth']],[T_TAKE+.7,[552,1222,1.9]],
 [T_S7+.4,[470,1140,1.3,'smooth']],[line('10').start,[560,1090,1.26,'smooth']],
 [T_WALK,[540,1110,1.08,'smooth']],[T_CARD,[540,1110,1.0]]]};
// ================= hero acting =================
const heroAnim={
 ex:[[T_S3,'curious'],[line('03').start-.3,'suspicious'],[line('04').start,'awe'],
     [T_S4,'fear'],[line('06').start-.6,'curious'],[T_OFFER,'awe'],
     [T_S5+1.2,'fear'],[T_S6,'curious'],[T_RELEASE,'awe'],[T_TAKE+.5,'happy'],
     [line('10').start,'awe'],[T_WALK+1.4,'curious']],
 lean:[[T_S3,0],[line('03').start,.04,'smooth'],[line('04').start,.02],
     [T_S4,-.03,'smooth'],[line('06').start-.5,.02],[T_OFFER-.15,-.03],[T_OFFER+.35,.11,'back'],[T_GRAB,.12],
     [T_CARRY+.3,-.05,'back'],[T_S5,0,'smooth'],
     [T_RET_IN,.03,'smooth'],[T_TAKE,.05],[T_S7,.01,'smooth'],[T_WALK+1,0]],
 drop:[[T_S3,0],[T_OFFER-.15,4,'out'],[T_OFFER+.3,-2,'back'],[T_GRAB,0],[T_CARRY+.4,4,'out'],[T_S5,0,'smooth']],
 headTilt:[[T_S3,-.2],[line('04').end,-.24],[T_S4,-.02,'smooth'],[line('05').end,.1,'smooth'],
     [line('06').start,.16],[T_OFFER,-.18,'smooth'],[T_CARRY,-.24],[T_S5,.05,'smooth'],[line('07').end,.14],
     [T_S6,.1],[T_RET_IN,-.06,'smooth'],[T_TAKE,.12,'smooth'],[line('10').start,-.16,'smooth'],[T_WALK+1.6,-.04,'smooth']],
 headNod:[[T_S3,0],[line('04').end,-8],[T_S4,4,'smooth'],[T_OFFER,-10,'smooth'],[T_S5,2],[T_RET_IN,-4],[T_TAKE,6,'back'],[T_WALK,-6,'smooth']],
 armR:[[T_S3,[64,-128]],
   [T_S4,[64,-128]],[T_S4+.6,[70,-196],'back'],[line('05').end,[72,-194]],
   [line('06').start-.4,[68,-186]],
   [T_OFFER-.2,[56,-150],'smooth'],[T_OFFER+.5,[122,-280],'back'],[T_GRAB+.2,[124,-282]],
   [T_GRAB+.7,[108,-220],'smooth'],[T_CARRY+.8,[70,-138],'out'],
   [T_S6,[72,-150]],[T_RET_IN,[88,-208],'smooth'],[T_TAKE+1.4,[86,-206]],
   [T_S7+1,[78,-182],'smooth'],[T_WALK+1.5,[70,-168],'smooth']],
 armRBend:[[0,1]],
 armRHand:[[T_S3,'rest'],[T_S4+.35,'closed'],[T_GRAB+.28,'open'],[T_CARRY+.9,'rest'],
   [T_S6,'open'],[T_TAKE,'closed']],
 armRWrist:[[0,9]],
 armL:[[T_S3,[-58,-130]],[line('03').start-.1,[-54,-140],'smooth'],[line('03').start+.4,[-96,-208],'back'],
   [line('03').end,[-92,-204]],[line('04').end,[-62,-138],'out'],
   [T_S4,[-58,-130]],[T_OFFER,[-64,-148],'smooth'],[T_GRAB,[-70,-164],'smooth'],[T_S5,[-58,-130],'out'],
   [line('09').start,[-56,-134]],[line('09').start+.3,[-88,-196],'back'],[line('09').end,[-84,-192]],
   [line('10').start+.4,[-60,-134],'out']],
 armLBend:[[0,-1]],
 armLHand:[[T_S3,'rest'],[line('03').start+.3,'open'],[line('04').end+.3,'rest'],
   [line('09').start+.25,'open'],[line('10').start+.5,'rest']],
 armLWrist:[[0,9]],
};
const HERO_W={x:360,y:1560,s:1.6};
// Handover points are COMPUTED from the rig, never eyeballed: the watch is pinned
// exactly where the hero's grip is at the moment ownership changes.
const r1=v=>Math.round(v);
const XFER1=heroGripWorld(S,T_GRAB-.13,heroAnim,HERO_W,'R').map(r1);   // hero still holds (closed) just before the grab
const XFER2=heroGripWorld(S,T_TAKE+.01,heroAnim,HERO_W,'R').map(r1);   // hero's hand has just closed on it
window.XFER=[XFER1,XFER2];
const SWAY=[[T_S4+.7,.4],[T_OFFER+.5,.45],[T_GRAB+.3,.35],[T_RET_IN+.3,.3],[T_RELEASE,.42],[T_TAKE,.3]];
const SOV_W={x:905,y:1560,s:1.05};
// the great hand: forearm angled from the sovereign (right side, mid height)
const HAND_ROT=0.38;
const hand1={
 pos:[[T_OFFER-.4,[W+460,760]],[T_GRAB-.45,[XFER1[0]+120,XFER1[1]-210],'out'],[T_GRAB,[XFER1[0],XFER1[1]-40.5],'smooth'],
  [T_CARRY+.35,[XFER1[0],XFER1[1]-40.5]],[T_FLASH,[W+470,620],'in']],
 closed:[[0,0],[T_GRAB,0],[T_GRAB+.18,1,'out']],
 alpha:[[T_OFFER-.4,0],[T_OFFER-.05,1,'out'],[T_FLASH-.05,1],[T_FLASH+.2,0]],
};
const hand2={
 pos:[[T_RET_IN-.5,[W+470,700]],[T_RELEASE-.35,[XFER2[0]+120,XFER2[1]-200],'out'],[T_RELEASE,[XFER2[0],XFER2[1]-40.5],'smooth'],
  [T_TAKE+.3,[XFER2[0],XFER2[1]-40.5]],[T_TAKE+1.3,[W+480,640],'in']],
 closed:[[0,1],[T_RELEASE,1],[T_RELEASE+.2,0,'out']],
 alpha:[[T_RET_IN-.5,0],[T_RET_IN-.1,1,'out'],[T_TAKE+1.2,1],[T_TAKE+1.5,0]],
};
// ================= scenes =================
function s1_hook(t){
 sky(t,0);
 const open=t>T_CRACK?1:0;
 const sh=open?Math.exp(-(t-T_CRACK)*3.2)*20:0;
 g.save();g.translate(Math.sin(t*51)*sh,Math.cos(t*47)*sh*.7);
 fissure(t,open?ramp(t,T_CRACK,T_CRACK+.3,'out'):0);
 // city below, seen from a rooftop
 buildings(t,0);
 // rooftop ledge the hero stands on
 g.fillStyle='#19242f';g.beginPath();g.moveTo(-40,1330);g.lineTo(560,1300);g.lineTo(620,1348);g.lineTo(640,1960);g.lineTo(-40,1960);g.closePath();g.fill();
 g.fillStyle='rgba(224,190,130,.08)';g.fillRect(-40,1316,640,10);
 drawHero(g,S,t,{ex:[[0,'curious'],[T_CRACK-.15,'awe']],
  headTilt:[[0,-.08],[T_CRACK,-.3,'smooth']],
  armL:[[0,[-58,-130]]],armR:[[0,[64,-128]],[T_CRACK+.2,[58,-136],'smooth']],
  armLBend:[[0,-1]],armRBend:[[0,1]],armLHand:[[0,'rest']],armRHand:[[0,'rest']]},
  {x:300,y:1318,s:1.5});
 if(open){const f=Math.exp(-(t-T_CRACK)*5.5);g.fillStyle=`rgba(214,250,252,${f*.6})`;g.fillRect(-60,-60,W+120,H+120)}
 g.restore();
}
function s2_reveal(t){
 sky(t,0);
 const push=1+ramp(t,T_S2,T_S3)*.12;
 g.save();g.translate(W/2,760);g.scale(push,push);g.translate(-W/2,-760);
 g.save();g.globalAlpha=.45;fissure(t,1);g.restore();   // dim pass behind him
 sovereign(t,{x:650,y:1560,s:1.18,brace:1,eye:1,talk:0});
 fissure(t,1);                                          // bright pass in front: braced inside the tear
 g.save();g.globalAlpha=.85;
 for(let i=0;i<14;i++){const [a,b,c]=SCAT[i+60];
  const yy=(b*700+t*120*(0.5+c))%700;
  ell(455+a*180,430+yy*.9,2.5,9,'rgba(140,240,244,.55)')}
 g.restore();
 g.restore();
 // foreground rooftops silhouette for depth
 g.fillStyle='#0d141d';
 g.beginPath();g.moveTo(0,1700);g.lineTo(240,1650);g.lineTo(300,1700);g.lineTo(560,1660);g.lineTo(820,1706);g.lineTo(W,1664);g.lineTo(W,1920);g.lineTo(0,1920);g.closePath();g.fill();
}
window.render=function(t){
 g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);g.clearRect(0,0,W,H);
 if(t<T_S2)s1_hook(t);
 else if(t<T_S3)s2_reveal(t);
 else if(t<T_CARD){
  const c=sample(cam,'k',t,[500,1120,1]);
  g.save();
  g.translate(W/2,1120);g.scale(c[2],c[2]);g.translate(-c[0],-c[1]);
  const mut=ramp(t,T_S5,T_S5+1.2)*(1-ramp(t,T_S6-1,T_S6));
  street(t,mut);
  const sovFade=t<T_S5?1:t<T_S6?1-ramp(t,T_S5,T_S5+1.5):ramp(t,T_S6,T_S6+.8);
  const wk=t>T_WALK?1:0;
  const sx=SOV_W.x+(t>T_WALK?(t-T_WALK)*85:0);
  const ss=SOV_W.s*(t>T_WALK?Math.max(.55,1-(t-T_WALK)*.07):1);
  sovereign(t,{x:sx,y:SOV_W.y,s:ss,eye:1,
   talk:(t>=line('04').start&&t<line('04').end)||(t>=line('10').start&&t<line('10').end)?1:0,
   walk:wk,fade:sovFade*(t>T_WALK?Math.max(0,1-(t-T_WALK)*.22):1)});
  if(t>T_WALK)glowAt(sx,1500,330,'rgba(79,216,221,.10)');
  if(mut>0.01){
   passerby(t,-80,1600,1.05,1,T_S5+0.3,175);
   passerby(t,W+80,1575,.9,-1,T_S5+1.1,150,'#0a0f16');
   passerby(t,-120,1624,1.15,1,T_S5+2.0,185,'#05080d');
   // framed photo in the left building's lit window
   g.save();g.globalAlpha=mut;
   g.fillStyle='#232f41';g.fillRect(60,1190,260,210);
   g.fillStyle='rgba(240,205,130,.16)';g.fillRect(70,1200,240,190);
   g.fillStyle='#1a2534';g.fillRect(86,1216,208,158);
   for(const px of [136,196]){ell(px,1296,18,20,'#5d6b7c');g.fillStyle='#5d6b7c';g.fillRect(px-16,1312,32,42)}
   const fadeP=1-ramp(t,line('07').start+1.8,line('07').end);
   g.globalAlpha=mut*fadeP;ell(256,1296,18,20,'#c89335');g.fillStyle='#c89335';g.fillRect(240,1312,32,42);
   g.globalAlpha=mut*(1-fadeP)*.6;
   for(let i=0;i<9;i++){const [a,b]=SCAT[i+230];ell(250+a*34,1270-(1-fadeP)*130*b,2.2,2.2,'#e8c877')}
   g.restore();
  }
  const heroOwns= t<T_S4?null : t<T_GRAB-.12?'R' : null;
  const ownsBack=t>=T_TAKE?'R':null;
  const sway=swayAngle(t,SWAY);
  drawHero(g,S,t,heroAnim,{...HERO_W,prop:heroOwns||ownsBack,propActive:(t>T_OFFER&&t<T_FLASH)||t>T_RELEASE,propSway:sway,rig:new URLSearchParams(location.search).get('rig')==='1'});
  const h1p=sample(hand1,'pos',t,[W+460,760]),h1a=sample(hand1,'alpha',t,0);
  drawWardenHand(g,t,{x:h1p[0],y:h1p[1],s:1.0,rot:HAND_ROT,closed:sample(hand1,'closed',t,0),alpha:h1a});
  if(t>=T_GRAB-.12&&t<T_CARRY){g.save();g.translate(XFER1[0],XFER1[1]);drawWatch(g,t,{active:true,s:.67,sway,hang:true});g.restore()}
  if(t>=T_CARRY&&t<T_FLASH&&h1a>0){g.save();g.translate(h1p[0]+WARDEN_GRIP[0],h1p[1]+WARDEN_GRIP[1]);drawWatch(g,t,{active:true,s:.67,sway,hang:true});g.restore()}
  const h2p=sample(hand2,'pos',t,[W+470,700]),h2a=sample(hand2,'alpha',t,0);
  drawWardenHand(g,t,{x:h2p[0],y:h2p[1],s:1.0,rot:HAND_ROT,closed:sample(hand2,'closed',t,1),alpha:h2a});
  if(h2a>0&&t<T_TAKE&&t>=T_RET_IN-.2){
   const src=[h2p[0]+WARDEN_GRIP[0],h2p[1]+WARDEN_GRIP[1]];
   const px=t>=T_RELEASE?XFER2[0]:src[0],py=t>=T_RELEASE?XFER2[1]:src[1];
   g.save();g.translate(px,py);drawWatch(g,t,{active:true,s:.67,sway,hang:true});g.restore();
  }
  if(t>T_FLASH&&t<T_S5+1){const f=Math.exp(-(t-T_FLASH)*3.4);g.fillStyle=`rgba(224,252,250,${f*.8})`;g.fillRect(-700,-700,W+1400,H+1400)}
  g.restore();
 }else{
  sky(t,1);buildings(t,.45);
  g.fillStyle='rgba(7,13,20,.8)';g.fillRect(0,0,W,H);
  const a1=ramp(t,T_CARD,T_CARD+.6);
  g.save();g.globalAlpha=a1;
  g.save();g.translate(W/2,740);g.scale(1.6,1.6);drawWatch(g,t,{active:false,s:1,hang:false});g.restore();
  g.textAlign='center';
  g.font='800 78px "Trebuchet MS",sans-serif';
  g.lineJoin='round';g.strokeStyle='rgba(8,14,22,.9)';g.lineWidth=14;
  g.strokeText('Would you still call',W/2,1070);g.strokeText('him the villain?',W/2,1168);
  g.fillStyle='#f7eedb';g.fillText('Would you still call',W/2,1070);
  g.fillStyle='#72f4ef';g.fillText('him the villain?',W/2,1168);
  g.font='600 34px "Trebuchet MS",sans-serif';g.fillStyle='#b8d9db';
  g.fillText('BETWEEN THE IFS · ALTERNATE AVENGERS',W/2,1330);
  g.font='500 30px "Trebuchet MS",sans-serif';g.fillStyle='#8fa7ad';
  g.fillText('Unofficial fan fiction — an imagined story,',W/2,1420);
  g.fillText('not a real plot or leak.',W/2,1462);
  g.restore();
 }
 const v=g.createRadialGradient(W*.5,H*.46,H*.3,W*.5,H*.5,H*.78);
 v.addColorStop(0,'rgba(5,14,24,0)');v.addColorStop(1,'rgba(4,12,22,.42)');
 g.fillStyle=v;g.fillRect(0,0,W,H);
 g.textAlign='left';g.font='600 26px "Trebuchet MS",sans-serif';g.fillStyle='rgba(241,216,172,.85)';
 g.fillText('WHAT IF... · UNOFFICIAL FAN FICTION',44,78);
 caption(t);
 const fadeIn=1-ramp(t,0,.45);if(fadeIn>0){g.fillStyle=`rgba(8,16,26,${fadeIn})`;g.fillRect(0,0,W,H)}
 const end=ramp(t,DUR-1.0,DUR-.1);if(end>0){g.fillStyle=`rgba(6,12,20,${end*.9})`;g.fillRect(0,0,W,H)}
};
window.render(0);window.READY=true;
