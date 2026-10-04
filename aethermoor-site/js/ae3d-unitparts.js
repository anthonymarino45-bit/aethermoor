/* Realms of Aethermoor V5.7.0 - miniature parts library: race anatomy, heads, helms, weapons, shields, heraldry,
   mounts, dragons, siege engines and ships. Everything is merged into one vertex-coloured geometry per unit type and faction. */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const T3=THREE,PI=Math.PI;
const UP=AE.UP={};
// material channel presets (metalness, roughness, emissive)
const MT={cloth:{m:0,r:.86},leather:{m:.05,r:.7},metal:{m:.82,r:.3},chain:{m:.7,r:.5},gold:{m:.9,r:.24},skin:{m:0,r:.66},bone:{m:0,r:.6},wood:{m:0,r:.8},glow:(e)=>({m:0,r:.4,e})};
UP.MT=MT;
const RACE={human:{hl:1,ht:1,w:1,hs:1,arm:1},elf:{hl:1.1,ht:1.03,w:.84,hs:.94,arm:1.03},dwarf:{hl:.6,ht:.9,w:1.34,hs:1.14,arm:.9},orc:{hl:.92,ht:1.1,w:1.32,hs:1.0,arm:1.15},undead:{hl:1.02,ht:1,w:.88,hs:.98,arm:1}};
UP.RACE=RACE;
const shade=AE.shadeHex,mix=AE.mix;

// ---------------------------------------------------------------- heraldic emblems (drawn in a local plane facing +z, ~size units wide)
function emblem(p,st,kind,s,col){
  col=col??st.trim;const g={...MT.gold};
  switch(kind||st.emblem){
    case 'lion':p.sph(1.1*s,col,{y:.3*s,sz:.35,...g});for(let i=0;i<8;i++){const a=i/8*6.283;p.cone(.42*s,1.1*s,col,{x:Math.cos(a)*1.1*s,y:.3*s+Math.sin(a)*1.1*s,rz:a-PI/2,sz:.4,seg:4,...g});}p.box(.35*s,1.6*s,.3*s,col,{y:-1.4*s,...g});break;
    case 'sun':p.cyl(1*s,1*s,.3,col,{rx:PI/2,seg:16,...g,e:.25});for(let i=0;i<10;i++){const a=i/10*6.283;p.cone(.38*s,1.2*s,col,{x:Math.cos(a)*1.55*s,y:Math.sin(a)*1.55*s,rz:a-PI/2,sz:.35,seg:4,...g,e:.2});}break;
    case 'leaf':p.ext([[0,-2*s],[.9*s,-.6*s],[.8*s,.8*s],[0,2*s],[-.8*s,.8*s],[-.9*s,-.6*s]],.3,col,{...g});p.box(.15*s,3.4*s,.36,shade(col,.7),{});break;
    case 'antler':for(const sd of[-1,1]){p.limb([0,-1.4*s,0],[sd*.8*s,0,0],.22*s,.18*s,col,{seg:5});p.limb([sd*.8*s,0,0],[sd*1.6*s,1.6*s,0],.18*s,.12*s,col,{seg:5});p.limb([sd*1.1*s,.6*s,0],[sd*.5*s,1.5*s,0],.14*s,.1*s,col,{seg:4});}break;
    case 'anvil':p.box(2.6*s,.7*s,.4,col,{y:.5*s,...g});p.box(1*s,1*s,.4,col,{y:-.3*s,...g});p.box(2*s,.5*s,.4,col,{y:-1.1*s,...g});p.cone(.5*s,1*s,col,{x:-1.7*s,y:.5*s,rz:PI/2,sz:.4,seg:4,...g});break;
    case 'gear':p.torus(1.15*s,.38*s,col,{rs:5,ts:14,...g});for(let i=0;i<8;i++){const a=i/8*6.283;p.box(.6*s,.7*s,.45,col,{x:Math.cos(a)*1.6*s,y:Math.sin(a)*1.6*s,rz:a,...g});}p.sph(.45*s,col,{sz:.5,...g});break;
    case 'fist':p.box(1.8*s,1.6*s,.5,col,{y:.4*s});for(let i=0;i<4;i++)p.sph(.42*s,col,{x:(-0.66+i*.44)*s,y:1.25*s,sz:.6});p.box(1.1*s,1.4*s,.45,col,{y:-1.1*s});break;
    case 'boar':p.sph(1.2*s,col,{sx:1,sy:.85,sz:.35});p.box(.9*s,.6*s,.4,col,{y:-.9*s});for(const sd of[-1,1]){p.cone(.25*s,1.3*s,0xf6efe0,{x:sd*.7*s,y:-.7*s,rz:sd*.5,sz:.6,seg:5});p.cone(.3*s,.8*s,col,{x:sd*.9*s,y:1*s,rz:-sd*.5,sz:.4,seg:4});}break;
    case 'ankh':p.torus(.7*s,.25*s,col,{y:1*s,rs:5,ts:12,...g,sy:1.25});p.box(2.2*s,.45*s,.4,col,{...g});p.box(.5*s,2.6*s,.4,col,{y:-1.3*s,...g});break;
    case 'moon':p.ext(crescent(1.6*s),.3,col,{...g,e:.35});p.sph(.25*s,col,{x:1.4*s,y:1.2*s,e:.8});p.sph(.18*s,col,{x:1.8*s,y:.4*s,e:.8});break;
    case 'anchor':p.box(.35*s,2.6*s,.35,col,{...g});p.box(1.6*s,.3*s,.35,col,{y:.9*s,...g});p.torus(1*s,.22*s,col,{y:-.4*s,arc:PI,rz:PI,rs:4,ts:10,...g});break;
    case 'coin':p.cyl(1.3*s,1.3*s,.35,col,{rx:PI/2,seg:16,...g});p.cyl(.9*s,.9*s,.4,shade(col,.8),{rx:PI/2,seg:16,...g});break;
    case 'skull':p.sph(1*s,0xe8e0c8,{sz:.5});p.box(.9*s,.6*s,.4,0xe8e0c8,{y:-.8*s});for(const sd of[-1,1])p.sph(.28*s,0x111111,{x:sd*.38*s,y:.05*s,z:.25});break;
  }
}
function crescent(r){const pts=[];for(let i=0;i<=12;i++){const a=-PI*.75+i/12*PI*1.5;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}for(let i=12;i>=0;i--){const a=-PI*.62+i/12*PI*1.24;pts.push([Math.cos(a)*r*.72+r*.42,Math.sin(a)*r*.72]);}return pts;}
UP.emblem=emblem;UP.crescent=crescent;

// ---------------------------------------------------------------- weapons (grip at origin, pointing +y)
function sword(p,st,o={}){
  const L=o.len||11,style=o.style||st.sword,glow=o.glow||0;
  let blade=st.metal===0x45484c?0xa8aeb4:mix(st.metal,0xf4f7fa,.35),edge=0xf4f7fa,guard=st.trim,grip=st.leather;
  if(o.mithril){blade=0xc8ecff;}
  const bm={m:.88,r:.2,e:glow};
  p.cyl(.38,.42,2.6,grip,{y:.2,seg:6,...MT.leather});p.sph(.6,guard,{y:-1.4,...MT.gold,ws:8,hs:6});
  if(style==='leaf'){p.ext([[0,0],[.75,L*.35],[.55,L*.8],[0,L],[-.55,L*.8],[-.75,L*.35]],.28,blade,{y:1.4,...bm});p.ext([[-2.2,0],[-1,.6],[0,.2],[1,.6],[2.2,0],[0,-.5]],.5,guard,{y:1.4,...MT.gold});}
  else if(style==='thorn'){p.ext([[-.55,0],[.55,0],[.35,L],[0,L*1.08],[-.35,L]],.4,0x5a3e24,{y:1.4,...MT.wood});for(let i=1;i<6;i++){const y=1.4+i*L/6;p.cone(.22,1.2,0x8a6a3a,{x:.55,y,rz:-1.2,seg:4});p.cone(.22,1.2,0x8a6a3a,{x:-.55,y:y+.6,rz:1.2,seg:4});}p.box(3,.6,.7,0x6a4a2a,{y:1.4});}
  else if(style==='broad'){p.ext([[-1,0],[1,0],[.9,L*.82],[0,L*.95],[-.9,L*.82]],.38,blade,{y:1.4,...bm});p.box(4.4,.9,1,guard,{y:1.3,...MT.gold});p.box(.25,L*.7,.42,st.flair==='rune'?0xffb040:0x6af0ff,{y:1.4+L*.38,e:st.flair==='rune'||st.flair==='iron'?1.4:0});}
  else if(style==='cleaver'||style==='jagged'){p.ext([[-.8,0],[1,0],[2.2,L*.65],[1.6,L*.95],[-.5,L*.92]],.45,style==='jagged'?0x6a5a4a:0x5a5e62,{y:1.4,m:.6,r:.45});if(style==='jagged')for(let i=0;i<5;i++)p.cone(.35,1,0x6a5a4a,{x:2.1-i*.05,y:1.4+L*(.3+i*.13),rz:-1.57,seg:3});p.box(3.2,.8,.9,0x3a3a3a,{y:1.3,m:.5,r:.5});}
  else if(style==='khopesh'){p.box(.6,L*.45,.3,0xc8a24a,{y:1.4+L*.22,...MT.gold});p.torus(L*.32,.42,0xd8b24a,{x:L*.32,y:1.4+L*.45,arc:PI*.95,rz:PI*.55,rs:4,ts:12,sz:.6,...MT.gold});p.box(2.6,.6,.8,st.trim,{y:1.3,...MT.gold});}
  else if(style==='curved'){p.ext([[-.5,0],[.5,0],[.9,L*.5],[1.6,L*.95],[.7,L*.75],[-.3,L*.4]],.26,0x2a2e44,{y:1.4,m:.8,r:.25});p.ext([[.5,0],[.62,0],[1.05,L*.5],[1.75,L*.95],[1.6,L*.95],[.92,L*.5]],.3,0x8af0ff,{y:1.4,e:2});p.box(2.6,.6,.8,st.trim,{y:1.3,...MT.gold});}
  else{p.box(1.05,L,.3,blade,{y:1.4+L/2,...bm});p.cone(.75,1.6,blade,{y:1.4+L+.8,sz:.4,seg:4,...bm});p.box(.3,L*.85,.34,shade(blade,.8),{y:1.4+L*.45,...bm});p.box(4.2,.7,.9,guard,{y:1.3,...MT.gold});}
}
function axe(p,st,o={}){
  const L=o.len||12,head=o.heavy?1.5:1,crude=st.race==='orc';
  p.cyl(.42,.48,L,crude?0x4a3020:st.wood,{y:L/2-1.5,seg:6,...MT.wood});
  const bc=crude?0x5a5e62:mix(st.metal,0xffffff,.2);
  p.pushT(0,L-2.6,0);
  for(const sd of (o.double?[1,-1]:[1])){p.ext([[0,-1.4*head],[2.6*head,-2.6*head],[3.4*head,0],[2.6*head,2.6*head],[0,1.4*head]],.5,bc,{x:sd*.2,ry:sd<0?PI:0,m:.8,r:.3});}
  p.box(1.2,2.4*head,1.2,st.trim,{...MT.gold});if(st.flair==='rune')p.box(.2,1.8*head,1.3,0xffb040,{x:1.6*head,e:1.6});
  p.pop();
}
function hammer(p,st,o={}){
  const L=o.len||12,big=o.big?1.6:1;
  p.cyl(.45,.5,L,st.wood,{y:L/2-1.5,seg:6,...MT.wood});
  p.box(5*big,3*big,3*big,mix(st.metal,0x888888,.2),{y:L-1.5,...MT.metal});
  p.box(5.4*big,.6*big,3.3*big,st.trim,{y:L-1.5+1.1*big,...MT.gold});p.box(5.4*big,.6*big,3.3*big,st.trim,{y:L-1.5-1.1*big,...MT.gold});
  if(st.flair==='rune'||st.flair==='iron')p.box(.4,1.6*big,3.4*big,st.flair==='rune'?0xffb040:0x6af0ff,{y:L-1.5,x:2.6*big,e:1.8});
}
function spear(p,st,o={}){
  const L=o.len||30,style=o.style||st.spear,head=mix(st.metal,0xffffff,.25),sh=style==='bonespear'||style==='bone'?0xe0d6bc:st.wood;
  p.cyl(.36,.4,L,sh,{y:L/2-5,seg:6,...MT.wood});const ty=L-5;
  if(style==='glaive'){p.ext([[-.5,0],[.6,0],[1.6,3.5],[.4,7],[-.4,4]],.3,head,{y:ty,...MT.metal});p.box(2.4,.5,.6,st.trim,{y:ty,...MT.gold});}
  else if(style==='sunspear'){p.cone(.9,5,0xffe08a,{y:ty+2.5,seg:6,...MT.gold,e:.3});p.torus(1.8,.28,st.trim,{y:ty,...MT.gold,e:.4});for(let i=0;i<8;i++){const a=i/8*6.283;p.cone(.25,.9,st.trim,{x:Math.cos(a)*2.4,y:ty+Math.sin(a)*2.4,rz:a-PI/2,sz:.4,seg:4,...MT.gold,e:.4});}}
  else if(style==='thornspear'){p.cone(.8,5,0x8a6a3a,{y:ty+2.5,seg:5,flat:true});for(let i=0;i<6;i++)p.cone(.18,1,0x9a7a3a,{y:ty-1-i*2.6,x:(i%2?.4:-.4),rz:i%2?-1.2:1.2,seg:3});p.sph(.6,0x6aa82a,{y:ty-1,e:.6,ws:6,hs:5});}
  else if(style==='dwarfpike'){p.ext([[-1,0],[1,0],[.7,4],[0,6],[-.7,4]],.4,head,{y:ty,...MT.metal});p.box(2,.8,1,st.trim,{y:ty,...MT.gold});}
  else if(style==='crude'||style==='bone'){p.cone(1.1,5,style==='bone'?0xe8dcc0:0x5a5a5a,{y:ty+2.5,seg:4,flat:true});p.cyl(.6,.6,1.4,st.leather,{y:ty-.4,seg:5});if(style==='bone')p.sph(.9,0xe8dcc0,{y:ty-2,sx:1.2});}
  else if(style==='bonespear'){p.cone(.9,6,0xd9b04a,{y:ty+3,seg:4,...MT.gold});p.cyl(.8,.8,1,st.trim,{y:ty-.2,seg:6,...MT.gold});}
  else if(style==='scythe'){p.ext([[0,0],[1,1],[8,2.4],[11,1.2],[6,.4]],.3,0x2e3248,{y:ty+.5,m:.8,r:.25});p.ext([[6,.4],[11,1.2],[10.6,.9],[6,.1]],.34,0x8af0ff,{y:ty+.5,e:2});}
  else if(style==='halberd'){p.cone(.6,5,head,{y:ty+3,seg:4,...MT.metal});p.ext([[0,-1.6],[3.6,-2.6],[4,0],[3.6,2.6],[0,1.6]],.4,head,{y:ty,x:.2,...MT.metal});p.cone(.4,2.4,head,{y:ty,x:-1.4,rz:PI/2,seg:4,...MT.metal});}
  else{p.cone(.8,4.6,head,{y:ty+2.3,seg:4,...MT.metal});p.cyl(.5,.5,.8,st.trim,{y:ty,seg:6,...MT.gold});}
  if(o.pennant){p.box(.2,3,5,o.pennant,{y:ty-2.5,z:2.6,...MT.cloth});}
}
function bow(p,st,o={}){
  const r=o.r||8,arc=o.arc||2.1,style=o.style||st.bow;
  let col=st.wood,tube=.38,e=0,stringC=0xe8e2d0;
  if(style==='recurve')col=0xe8dcc0;else if(style==='thorn')col=0x4a3420;else if(style==='crude')col=0x5a4a3a;else if(style==='bone')col=0xe0d6bc;else if(style==='shadow'){col=0x2a2840;stringC=0xd56bdc;}else if(style==='short'){col=0x6a4a2a;tube=.45;}else if(style==='moon'){col=0xd8e8ff;e=1.1;}
  p.pushT(0,0,0,0,-PI/2,0);
  p.torus(r,tube,col,{x:-r,rz:-arc/2,arc,rs:5,ts:14,...MT.wood,e});
  const ty=Math.sin(arc/2)*r,tz=-r+Math.cos(arc/2)*r;
  if(style==='recurve'||style==='moon'){for(const sd of[-1,1])p.cone(.35,2,col,{x:tz,y:sd*ty,rz:sd*.5,seg:4,e});}
  if(style==='thorn')for(let i=-3;i<=3;i++)if(i)p.cone(.15,.9,0x8a6a3a,{x:-r+Math.cos(i*.25)*r+.4,y:Math.sin(i*.25)*r,rz:-1.4,seg:3});
  p.pop();
  p.limb([0,ty,tz+.0],[0,-ty,tz],.08,.08,stringC,{seg:3,caps:false,e:style==='shadow'||style==='moon'?1.5:0});
  p.cyl(.55,.55,2.2,st.leather,{seg:6});
}
function crossbow(p,st,o={}){
  p.box(1.2,1.1,9,st.wood,{z:1,...MT.wood});p.box(1.4,1.6,2.4,st.wood,{z:-3,y:-.6,...MT.wood});
  p.pushT(0,0,5,PI/2,0,0);p.pushT(0,0,0,0,0,-PI/2);p.torus(5,.45,st.race==='dwarf'?0x4a4a4a:st.metal,{x:-5,rz:-1,arc:2,rs:5,ts:10,...MT.metal});p.pop();p.pop();
  p.limb([-4.2,.2,2.8],[4.2,.2,2.8],.07,.07,0xe8e2d0,{seg:3,caps:false});p.cyl(.15,.15,6,0xd8d0c0,{rx:PI/2,z:2.5,y:.7,seg:4});
  if(st.race==='dwarf')p.cyl(.8,.8,1.6,st.trim,{x:.9,z:-2.5,rz:PI/2,seg:8,...MT.gold});
  if(st.flair==='wild')for(let i=0;i<4;i++)p.cone(.15,1,0x8a6a3a,{x:(i%2?.7:-.7),z:-1+i*1.6,rz:i%2?-1.3:1.3,seg:3});
}
function staff(p,st,o={}){
  const L=o.len||27,top=o.top||'orb',gc=o.glow??0x8ad8ff;
  const wood=top==='skull'?0x2a2228:top==='moon'?0x2a2840:st.wood;
  p.cyl(.4,.46,L,wood,{y:L/2-6,seg:6,...MT.wood});const ty=L-6;
  if(top==='orb'){for(let i=0;i<3;i++){const a=i*2.09;p.limb([0,ty,0],[Math.cos(a)*1.3,ty+2.4,Math.sin(a)*1.3],.25,.18,st.trim,{seg:4,...MT.gold});}p.sph(1.5,gc,{y:ty+2.6,e:2.2,ws:10,hs:8});}
  else if(top==='crystal'){p.cyl(0,1.2,4.2,gc,{y:ty+3.4,seg:5,flat:true,e:1.8});p.cyl(1.2,0,1.6,gc,{y:ty+.7,seg:5,flat:true,e:1.8});for(const sd of[-1,1])p.limb([0,ty,0],[sd*1.4,ty+3,0],.22,.15,st.trim,{seg:4,...MT.gold});}
  else if(top==='sun'){p.cyl(1.6,1.6,.4,0xffe28a,{y:ty+2.6,rx:PI/2,seg:16,...MT.gold,e:1.2});for(let i=0;i<12;i++){const a=i/12*6.283;p.cone(.3,1.4,0xffd25a,{x:Math.cos(a)*2.4,y:ty+2.6+Math.sin(a)*2.4,rz:a-PI/2,sz:.4,seg:4,...MT.gold,e:1});}}
  else if(top==='skull'){p.sph(1.4,0xe8dec4,{y:ty+2.2,sy:1.05});p.box(1.4,.8,1.2,0xe8dec4,{y:ty+1,z:.3});for(const sd of[-1,1])p.sph(.35,gc,{x:sd*.5,y:ty+2.2,z:1.1,e:3});p.cone(1,3.2,gc,{y:ty+4.4,seg:6,e:2.4});}
  else if(top==='moon'){p.ext(crescent(2.2),.4,0xd8e2ff,{y:ty+2.6,...MT.gold,e:.9});p.sph(.8,gc,{y:ty+2.4,x:.6,e:2.6});}
  else if(top==='antler'){for(const sd of[-1,1]){p.limb([0,ty,0],[sd*1.8,ty+3,0],.3,.2,0xd8c8a0,{seg:4});p.limb([sd*1.2,ty+2,0],[sd*2.6,ty+3.8,.4],.18,.12,0xd8c8a0,{seg:4});}p.sph(1,gc,{y:ty+1.6,e:2});}
  else if(top==='gear'){p.torus(1.6,.45,st.trim,{y:ty+2.2,rs:5,ts:12,...MT.gold});for(let i=0;i<8;i++){const a=i/8*6.283;p.box(.6,.7,.6,st.trim,{x:Math.cos(a)*2.1,y:ty+2.2+Math.sin(a)*2.1,rz:a,...MT.gold});}p.sph(.8,gc,{y:ty+2.2,e:2.2});}
  else if(top==='cross'){p.box(.6,4,.6,st.trim,{y:ty+2,...MT.gold});p.box(2.6,.6,.6,st.trim,{y:ty+2.8,...MT.gold});}
}
function shield(p,st,o={}){
  const type=o.type||st.shield,s=o.s||1,f=o.field??st.cloth,rim=st.trim;
  if(type==='heater'||type==='leafkite'||type==='crescentkite'||type==='kite'){
    const long=type!=='heater';const pts=long?[[-2.6,2.8],[2.6,2.8],[2.6,.2],[0,-5.4],[-2.6,.2]]:[[-3,3],[3,3],[3,-.4],[0,-4.2],[-3,-.4]];
    const ps=pts.map(q=>[q[0]*s,q[1]*s]);
    p.ext(ps.map(q=>[q[0]*1.1,q[1]*1.08]),.5,rim,{z:-.2,...MT.gold});p.ext(ps,.7,f,{z:.1,...MT.cloth,r:.6});
    if(type==='leafkite')p.box(.4*s,7*s,.3,rim,{z:.5,y:-1*s,...MT.gold});
    emblem(p,st,o.emblem,.9*s,rim);
  }else if(type==='irontower'||type==='tower'){
    p.box(6.4*s,9*s,.9,st.metal,{...MT.metal});p.box(6.8*s,.6*s,1.1,st.trim,{y:4.2*s,...MT.gold});p.box(6.8*s,.6*s,1.1,st.trim,{y:-4.2*s,...MT.gold});
    for(let i=0;i<6;i++)p.sph(.3*s,st.trim,{x:(i%2?2.6:-2.6)*s,y:(-3+Math.floor(i/2)*3)*s,z:.5,...MT.gold});
    p.pushT(0,.4*s,.55);emblem(p,st,o.emblem,.85*s,st.trim);p.pop();
  }else{
    const r=3.3*s;const col=type==='wicker'?0x9a7a42:type==='hide'?0x8a6a4a:type==='boneround'?0xd8ccb0:f;
    p.cyl(r,r,.7,col,{rx:PI/2,seg:16,jit:type==='wicker'||type==='hide'?.25:0,...MT.cloth,r:.6});
    p.torus(r,.35,type==='hide'||type==='wicker'?0x5a3a22:rim,{rs:4,ts:16,...(type==='hide'||type==='wicker'?MT.wood:MT.gold)});
    p.sph(.9*s,rim,{z:.4,sz:.6,...MT.gold});
    if(type==='spikeround'){for(let i=0;i<6;i++){const a=i/6*6.283;p.cone(.4*s,1.6*s,0x2a2a2a,{x:Math.cos(a)*2.2*s,y:Math.sin(a)*2.2*s,z:.8,rx:PI/2,seg:4,...MT.metal});}p.cone(.6*s,2.2*s,0x2a2a2a,{z:1,rx:PI/2,seg:5,...MT.metal});}
    else if(type==='runeround'){p.torus(2.1*s,.18,0xffb040,{z:.4,rs:3,ts:14,e:1.5});}
    else if(type==='hide'){for(const sd of[-1,1])p.cone(.35*s,2.2*s,0xf2ead6,{x:sd*1.3*s,y:-1.3*s,z:.6,rz:sd*.9,seg:5});emblem(p,st,'boar',.7*s,0x2a1a10);}
    else if(type==='wicker'){p.pushT(0,0,.5);emblem(p,st,'antler',.8*s,0xe8d8b0);p.pop();}
    else{p.pushT(0,0,.5);emblem(p,st,o.emblem,.85*s,rim);p.pop();}
  }
}
function banner(p,st,o={}){
  const H=o.h||30,w=o.w||7,fh=o.fh||9,style=o.style||st.banner;
  p.cyl(.38,.42,H,st.wood,{y:H/2,seg:6,...MT.wood});
  const fin=st.flair==='sun'?'sun':st.race==='undead'?'skull':st.race==='orc'?'spike':'point';
  if(fin==='sun'){p.sph(.9,st.trim,{y:H+.6,e:.6,...MT.gold});}else if(fin==='skull'){p.sph(1,0xe6dcc0,{y:H+.8});}else if(fin==='spike'){p.cone(.6,2.6,0x2a2a2a,{y:H+1.3,seg:4,...MT.metal});}else p.cone(.6,2,st.trim,{y:H+1,seg:6,...MT.gold});
  p.box(w+1,.5,.5,st.trim,{x:w/2,y:H-1,...MT.gold});
  const fy=H-1-fh/2;
  if(style==='swallow'||style==='sunpennant'){p.ext([[0,fh/2],[w,fh/2],[w,-fh/2],[w*.6,-fh*.2],[0,-fh/2]],.3,st.cloth,{x:0,y:fy,...MT.cloth});}
  else if(style==='ragged'||style==='tattered'||style==='hide'){p.ext([[0,fh/2],[w,fh/2],[w*.9,-fh*.35],[w*.7,-fh*.15],[w*.55,-fh/2],[w*.3,-fh*.25],[0,-fh*.45]],.3,style==='hide'?0xa07a52:st.cloth,{y:fy,...MT.cloth});}
  else if(style==='skullpole'){p.ext([[0,fh/2],[w,fh/2],[w,-fh*.3],[w*.5,-fh/2],[0,-fh*.3]],.3,st.cloth,{y:fy,...MT.cloth});p.sph(1.4,0xe6dcc0,{y:H-fh-2,z:.6});for(const sd of[-1,1])p.cone(.3,1.6,0xf2ead6,{x:sd*.8,y:H-fh-2.8,z:1,rz:sd*.6,seg:4});}
  else if(style==='leafbanner'){p.ext([[0,fh/2],[w,fh/2],[w*.8,-fh*.1],[w*.5,-fh/2],[w*.2,-fh*.1]],.3,st.cloth,{y:fy,...MT.cloth});}
  else{p.box(w,fh,.3,st.cloth,{x:w/2,y:fy,...MT.cloth});}
  p.box(w*.98,.45,.4,st.trim,{x:w/2,y:H-1.5,...MT.gold});
  p.pushT(w/2,fy+fh*.08,.3);emblem(p,st,o.emblem,Math.min(w,fh)*.2,st.trim);p.pop();
}
// Weapons are modelled with the head/blade plane facing front-back; a held weapon should show its head forward.
// Blender-body kits set UP.heldRoll (a quarter turn about the shaft) so these four are turned when held.
// A Blender hand closes into a fist whose knuckle line (UP.heldAxis, set by the kits' at()) is the direction a shaft passes through it:
// shaft weapons are turned (minimally) so their shaft lies exactly along it, i.e. through the middle of the fist.
const _R3=new T3.Matrix4(),_Ri=new T3.Matrix4(),_Ql=new T3.Matrix4(),_dk=new T3.Vector3(),_tg=new T3.Vector3(),_qq=new T3.Quaternion();
const held=(fn,roll)=>function(p,st,o){
  let pushed=0;const ax=UP.heldAxis;
  if(ax){
    _R3.extractRotation(p.M);_dk.set(0,1,0).applyMatrix4(_R3).normalize();_tg.set(ax[0],ax[1],ax[2]).normalize();if(_dk.dot(_tg)<0)_tg.negate();
    if(_dk.angleTo(_tg)<1.0){_qq.setFromUnitVectors(_dk,_tg);_Ql.makeRotationFromQuaternion(_qq);_Ri.copy(_R3).invert();p.push(_Ri.clone().multiply(_Ql).multiply(_R3));pushed++;}
  }
  if(roll&&UP.heldRoll){p.pushT(0,0,0,0,UP.heldRoll,0);pushed++;}
  fn(p,st,o);while(pushed--)p.pop();
};
UP.heldRoll=0;UP.heldAxis=null;
UP.sword=held(sword,true);UP.axe=held(axe,true);UP.hammer=held(hammer,true);UP.spear=held(spear,true);UP.bow=held(bow,false);UP.crossbow=crossbow;UP.staff=held(staff,false);UP.shield=shield;UP.banner=held(banner,false);

// ---------------------------------------------------------------- heads and helms
function helm(p,st,type,hy,hr,o={}){
  const met=o.metal??st.metal,M=MT.metal;
  switch(type){
    case 'bascinet':p.sph(hr*1.1,met,{y:hy+hr*.12,ts:0,tl:1.85,...M});p.cyl(hr*1.05,hr*1.18,hr*.7,shade(met,.8),{y:hy-hr*.55,seg:12,...MT.chain});p.box(hr*.25,hr*1.1,hr*.2,met,{y:hy+hr*.1,z:hr*1.05,...M});
      p.sph(hr*.7,o.plume??st.plume,{y:hy+hr*1.3,z:-hr*.6,sy:1.6,sz:.7,rx:-.5,...MT.cloth});p.torus(hr*1.08,hr*.08,st.trim,{y:hy-hr*.05,rx:PI/2,...MT.gold});break;
    case 'great':p.cyl(hr*1.08,hr*1.12,hr*2.3,met,{y:hy+hr*.05,seg:12,...M});p.sph(hr*1.08,met,{y:hy+hr*1.15,ts:0,tl:1.57,...M});p.box(hr*1.6,hr*.18,hr*.3,0x101014,{y:hy+hr*.25,z:hr*1.05});p.box(hr*.2,hr*1.3,hr*.15,st.trim,{y:hy-hr*.1,z:hr*1.12,...MT.gold});
      if(o.crest!==false)p.box(hr*.3,hr*.9,hr*1.8,o.plume??st.plume,{y:hy+hr*2.1,...MT.cloth});break;
    case 'kettle':p.sph(hr*1.06,met,{y:hy+hr*.15,ts:0,tl:1.7,...M});p.cyl(hr*1.75,hr*1.75,hr*.15,met,{y:hy+hr*.1,seg:16,...M});break;
    case 'sunhelm':p.sph(hr*1.1,0xf2dfa0,{y:hy+hr*.12,ts:0,tl:1.85,...MT.gold});p.torus(hr*1.1,hr*.1,st.trim,{y:hy,rx:PI/2,...MT.gold});
      for(let i=0;i<9;i++){const a=PI*.12+i/8*PI*.76;p.cone(hr*.18,hr*1.1,0xffd25a,{x:Math.cos(a)*hr*1.3,y:hy+hr*.4+Math.sin(a)*hr*1.3,z:-hr*.3,rz:a-PI/2,sz:.5,seg:4,...MT.gold,e:.5});}
      p.sph(hr*.5,st.plume,{y:hy+hr*1.4,z:-hr*.5,sy:1.7,sz:.6,rx:-.4,...MT.cloth});break;
    case 'winged':p.sph(hr*1.08,met,{y:hy+hr*.2,sy:1.32,ts:0,tl:1.8,...M});p.box(hr*.18,hr*1.1,hr*.16,st.trim,{y:hy,z:hr*1.05,...MT.gold});
      for(const sd of[-1,1])p.ext([[0,0],[hr*1.6,hr*1.8],[hr*.9,hr*.6],[hr*1.5,hr*1.0],[hr*.3,-hr*.2]],hr*.15,mix(met,0xffffff,.3),{x:sd*hr*.9,y:hy+hr*.3,z:-hr*.2,ry:sd>0?-.5:PI+.5,...M});break;
    case 'antlerhood':p.sph(hr*1.16,st.cloth,{y:hy+hr*.2,z:-hr*.25,ts:0,tl:1.75,...MT.cloth,jit:.15});
      p.sph(hr*.7,0xe6dcc0,{y:hy+hr*1.05,z:hr*.3,sx:.9,sy:.55,sz:1.2,...MT.bone});
      for(const sd of[-1,1]){const b=[sd*hr*.5,hy+hr*1.2,0],m1=[sd*hr*1.6,hy+hr*2.4,-hr*.2],t1=[sd*hr*2.0,hy+hr*3.6,-hr*.4];p.limb(b,m1,hr*.16,hr*.13,0xd8c8a0,{seg:5});p.limb(m1,t1,hr*.13,hr*.08,0xd8c8a0,{seg:5});p.limb(m1,[sd*hr*.9,hy+hr*3.0,hr*.2],hr*.1,hr*.07,0xd8c8a0,{seg:4});p.limb([sd*hr*1.85,hy+hr*3.0,-hr*.3],[sd*hr*2.8,hy+hr*3.4,-hr*.1],hr*.09,hr*.06,0xd8c8a0,{seg:4});}break;
    case 'horned':p.sph(hr*1.1,met,{y:hy+hr*.15,ts:0,tl:1.75,...M});p.torus(hr*1.08,hr*.14,st.trim,{y:hy-hr*.05,rx:PI/2,...MT.gold});p.box(hr*.22,hr*1.0,hr*.25,st.trim,{y:hy+hr*.05,z:hr*1.05,...MT.gold});
      for(const sd of[-1,1]){const a=[sd*hr*.95,hy+hr*.6,0],b=[sd*hr*1.7,hy+hr*1.1,0],c=[sd*hr*1.9,hy+hr*1.9,-hr*.1];p.limb(a,b,hr*.3,hr*.22,0xeae0c8,{seg:6,...MT.bone});p.limb(b,c,hr*.22,hr*.06,0xeae0c8,{seg:6,...MT.bone});}break;
    case 'ironmask':p.sph(hr*1.12,met,{y:hy+hr*.12,ts:0,tl:2.1,...M});p.box(hr*1.7,hr*1.2,hr*.4,shade(met,.85),{y:hy-hr*.05,z:hr*.9,...M});
      for(const sd of[-1,1]){p.cyl(hr*.32,hr*.32,hr*.35,0x2a2a2a,{x:sd*hr*.42,y:hy+hr*.15,z:hr*1.1,rx:PI/2,seg:10,...M});p.cyl(hr*.24,hr*.24,hr*.38,st.eye,{x:sd*hr*.42,y:hy+hr*.15,z:hr*1.14,rx:PI/2,seg:10,e:2.2});}
      for(let i=0;i<5;i++)p.sph(hr*.08,st.trim,{x:(-.8+i*.4)*hr,y:hy-hr*.55,z:hr*1.12,...MT.gold});p.box(hr*.2,hr*.8,hr*1.9,st.trim,{y:hy+hr*1.1,...MT.gold});break;
    case 'spiked':p.sph(hr*1.1,met,{y:hy+hr*.12,ts:0,tl:1.8,...M});for(let i=0;i<5;i++){const a=-.9+i*.45;p.cone(hr*.16,hr*.9,shade(met,.8),{x:Math.sin(a)*hr*.6,y:hy+hr*1.1+Math.cos(a)*hr*.1,z:-hr*.2,rz:-a*.6,seg:4,...M});}
      for(const sd of[-1,1]){p.box(hr*.3,hr*1,hr*.9,met,{x:sd*hr*.95,y:hy-hr*.3,z:hr*.3,...M});p.cone(hr*.22,hr*1.3,0xe0d6c0,{x:sd*hr*1.1,y:hy+hr*.9,rz:-sd*.7,seg:5,...MT.bone});}break;
    case 'boarskull':p.sph(hr*1.06,0x6a4a30,{y:hy+hr*.1,ts:0,tl:1.9,...MT.leather,jit:.2});p.sph(hr*.9,0xe8dcc0,{y:hy+hr*.95,z:hr*.35,sx:.95,sy:.7,sz:1.35,...MT.bone});
      p.cyl(hr*.4,hr*.5,hr*.6,0xd8ccb0,{y:hy+hr*.75,z:hr*1.55,rx:PI/2,seg:8,...MT.bone});for(const sd of[-1,1]){p.cone(hr*.15,hr*.9,0xfaf4e4,{x:sd*hr*.45,y:hy+hr*.5,z:hr*1.6,rx:-.4,rz:sd*.4,seg:5});p.sph(hr*.16,0x111111,{x:sd*hr*.42,y:hy+hr*1.15,z:hr*1.05});p.cone(hr*.25,hr*.6,0x6a4a30,{x:sd*hr*.7,y:hy+hr*1.55,z:hr*.1,rz:-sd*.5,seg:4});}
      p.box(hr*.4,hr*.5,hr*1.6,st.plume,{y:hy+hr*1.5,z:-hr*.5,...MT.cloth});break;
    case 'nemes':p.sph(hr*1.08,st.cloth,{y:hy+hr*.12,ts:0,tl:1.75,...MT.cloth});for(const sd of[-1,1])p.box(hr*.7,hr*2.0,hr*.5,st.cloth,{x:sd*hr*.95,y:hy-hr*.9,z:hr*.1,rz:sd*.12,...MT.cloth,paint:(lp,c)=>{if(Math.floor((lp.y+5)*1.2)%2)c.set(st.trim);}});
      p.torus(hr*1.08,hr*.12,st.trim,{y:hy+hr*.25,rx:PI/2,...MT.gold});p.cone(hr*.2,hr*.8,st.trim,{y:hy+hr*.55,z:hr*1.05,rx:.3,seg:5,...MT.gold,e:.3});break;
    case 'hood':p.sph(hr*1.24,o.hoodCol??st.cloth,{y:hy+hr*.15,ts:0,tl:2.1,...MT.cloth,sy:1.1});p.sph(hr*1.05,0x07070c,{y:hy,z:hr*.38,sz:.55,ts:1.0,tl:1.4});p.cone(hr*.7,hr*1.2,o.hoodCol??st.cloth,{y:hy+hr*1.3,z:-hr*.5,rx:-.6,seg:8,...MT.cloth});
      if(st.flair==='shadow'){p.pushT(0,hy+hr*1.2,hr*.95,-.2,0,0);p.ext(crescent(hr*.55),hr*.12,0xd8e0ff,{rz:PI/2,e:1.6,...MT.gold});p.pop();}break;
    case 'cap':p.sph(hr*1.05,o.col??st.leather,{y:hy+hr*.2,ts:0,tl:1.4,...MT.leather});break;
    case 'hat':p.sph(hr*1.02,o.col??0xc8a85a,{y:hy+hr*.3,ts:0,tl:1.4,...MT.cloth});p.cyl(hr*1.9,hr*1.9,hr*.12,o.col??0xc8a85a,{y:hy+hr*.35,seg:16,...MT.cloth});break;
    case 'wizard':p.cone(hr*1.3,hr*3.4,o.col??st.cloth,{y:hy+hr*2.1,rx:-.12,seg:10,...MT.cloth});p.cyl(hr*2,hr*2,hr*.12,o.col??st.cloth,{y:hy+hr*.45,seg:16,...MT.cloth});p.torus(hr*1.25,hr*.1,st.trim,{y:hy+hr*.6,rx:PI/2,...MT.gold});break;
    case 'turban':p.sph(hr*1.25,o.col??0xf0e6d0,{y:hy+hr*.55,sy:.75,...MT.cloth,jit:.1});p.sph(hr*.35,st.trim,{y:hy+hr*.7,z:hr*1.1,e:.6,...MT.gold});p.cone(hr*.25,hr*1,o.plume??0xffffff,{y:hy+hr*1.3,z:hr*.9,rx:.3,seg:5});break;
    case 'crown':p.cyl(hr*1.0,hr*.95,hr*.5,st.trim,{y:hy+hr*.85,seg:12,open:true,...MT.gold});for(let i=0;i<6;i++){const a=i/6*6.283;p.cone(hr*.18,hr*.6,st.trim,{x:Math.cos(a)*hr*.98,y:hy+hr*1.35,z:Math.sin(a)*hr*.98,seg:4,...MT.gold});}p.sph(hr*.18,0xff3a4a,{y:hy+hr*.9,z:hr*1.0,e:.6});break;
    case 'halo':p.torus(hr*1.4,hr*.12,0xfff0a0,{y:hy+hr*1.4,rx:PI/2,e:2.2});break;
  }
}
function head(p,st,o,neckY,hy,hr,W){
  const race=st.race,skel=race==='undead'&&!o.flesh,sk=o.skin??st.skin,bone=st.id===14?0x9a94bc:0xe6dcc0;
  p.limb([0,neckY-1.2,0],[0,neckY+.8,0],(skel?.45:1.15)*W,(skel?.4:1.05)*W,skel?bone:sk,{seg:8,caps:false,...MT.skin});
  if(skel){
    p.sph(hr*.95,bone,{y:hy+hr*.08,sy:1.06,...MT.bone});p.box(hr*1.05,hr*.5,hr*.95,bone,{y:hy-hr*.72,z:hr*.18,...MT.bone});
    for(const sd of[-1,1]){p.sph(hr*.28,0x08060c,{x:sd*hr*.36,y:hy+hr*.04,z:hr*.72});p.sph(hr*.13,st.eye,{x:sd*hr*.36,y:hy+hr*.04,z:hr*.92,e:3.2});}
    p.box(hr*.2,hr*.25,hr*.2,0x08060c,{y:hy-hr*.3,z:hr*.9});p.box(hr*.8,hr*.14,hr*.1,0xf4ecd4,{y:hy-hr*.62,z:hr*.66});return;
  }
  p.sph(hr,sk,{y:hy,sy:1.06,...MT.skin,ws:14,hs:10});
  // face: eyes, brow, nose
  const ez=hr*.86;for(const sd of[-1,1]){p.sph(hr*.15,0xf6f2ea,{x:sd*hr*.36,y:hy+hr*.08,z:ez,sz:.5});p.sph(hr*.09,o.eye??st.eye,{x:sd*hr*.36,y:hy+hr*.08,z:ez+hr*.07,e:race==='orc'||st.flair==='iron'?1.2:0});p.box(hr*.42,hr*.1,hr*.16,shade(st.hair,.9),{x:sd*hr*.36,y:hy+hr*.3,z:ez,rz:sd*(race==='orc'?.35:-.12)});}
  p.sph(hr*(race==='dwarf'?.26:.17),shade(sk,.92),{y:hy-hr*.12,z:hr*.95,sy:1.2});
  if(race==='elf')for(const sd of[-1,1])p.cone(hr*.26,hr*1.7,sk,{x:sd*hr*1.25,y:hy+hr*.45,z:-hr*.05,rz:-sd*1.0,sz:.5,seg:6,...MT.skin});
  if(race==='orc'){p.sph(hr*.8,sk,{y:hy-hr*.45,z:hr*.25,sx:1.15,sy:.65,...MT.skin});for(const sd of[-1,1]){p.cone(hr*.13,hr*.55,0xfaf2dc,{x:sd*hr*.42,y:hy-hr*.2,z:hr*.8,seg:5});p.cone(hr*.2,hr*.6,sk,{x:sd*hr*1.0,y:hy+hr*.25,rz:-sd*1.3,sz:.5,seg:5});}
    if(st.flair==='tusk'){for(const sd of[-1,1])p.box(hr*.12,hr*.6,hr*.06,0xf0a36d,{x:sd*hr*.5,y:hy-hr*.05,z:hr*.93,e:.15});}}
  if(o.paint){for(const sd of[-1,1])p.box(hr*.5,hr*.12,hr*.08,o.paint,{x:sd*hr*.4,y:hy-hr*.12,z:hr*.95,rz:sd*.3});}
  const hair=o.hair??st.hair;
  if(!o.fullHelm){
    if(race==='elf'){p.sph(hr*1.05,hair,{y:hy+hr*.2,ts:0,tl:1.5,...MT.cloth});p.box(hr*1.8,hr*2.4,hr*.6,hair,{y:hy-hr*.6,z:-hr*.65,...MT.cloth});}
    else if(race==='orc'){if(st.flair==='tusk')p.box(hr*.35,hr*.6,hr*1.8,hair,{y:hy+hr*1.0,z:-hr*.1,...MT.cloth});else{p.sph(hr*.4,hair,{y:hy+hr*1.0,z:-hr*.4});p.limb([0,hy+hr*1.0,-hr*.5],[0,hy+hr*.2,-hr*1.4],hr*.2,hr*.1,hair,{seg:5});}}
    else if(race!=='dwarf'||!o.helm){p.sph(hr*1.04,hair,{y:hy+hr*.18,ts:0,tl:1.45,...MT.cloth});if(o.longHair)p.box(hr*1.6,hr*1.9,hr*.5,hair,{y:hy-hr*.55,z:-hr*.6,...MT.cloth});}
  }
  if(race==='dwarf'){const bc=o.beard??hair;p.cone(hr*.95,hr*2.5,bc,{y:hy-hr*1.35,z:hr*.55,rx:PI+.25,seg:10,...MT.cloth,jit:.12});for(const sd of[-1,1]){p.sph(hr*.32,bc,{x:sd*hr*.32,y:hy-hr*.22,z:hr*.9,sx:1.4,sy:.6});}
    if(st.flair==='iron'){p.torus(hr*.3,hr*.07,st.trim,{y:hy-hr*2.2,z:hr*.95,rx:PI/2+.25,...MT.gold});p.torus(hr*.25,hr*.07,st.trim,{y:hy-hr*2.6,z:hr*1.05,rx:PI/2+.25,...MT.gold});}
    else for(const sd of[-1,1])p.cone(hr*.18,hr*1.2,bc,{x:sd*hr*.55,y:hy-hr*2.0,z:hr*.85,rx:PI,seg:5});}
}
UP.helm=helm;UP.head=head;

// ---------------------------------------------------------------- the humanoid figure
// pose presets: [elbow, hand] relative to the shoulder of that side (x mirrored for the left arm)
const POSE={
  rest:[[.9,-4.6,.2],[.9,-8.8,1.2]],
  weapon:[[1.3,-4.4,1.6],[.9,-7.4,4.2]],
  shield:[[1.4,-4.0,1.8],[.3,-6.0,4.8]],
  raised:[[1.6,1.6,1.0],[1.0,5.6,2.0]],
  bowArm:[[-.6,-.6,4.4],[-1.6,-.4,8.6]],
  draw:[[1.6,-.2,-2.4],[-2.8,-.6,1.8]],
  xbowR:[[.4,-4.6,2.6],[-2.5,-4.2,6.8]],
  xbowL:[[.4,-4.6,3.0],[-2.4,-3.6,9.5]],
  staffR:[[1.6,-3.5,1.6],[1.6,-6.5,3.0]],
  cast:[[1.5,-1,2.5],[1.2,2.6,4.6]],
  carry:[[1,-4.4,.6],[-1,-3,2.6]],
  bannerR:[[1.6,-2.0,2.0],[1.4,-2.5,3.6]],
  book:[[1.0,-4.6,1.6],[-1.0,-5.2,4.6]],
  low:[[1.4,-4.4,1.4],[1.4,-7.0,4.0]],
  twoR:[[.6,-4.5,2.6],[-2.6,-6.5,5.2]],
  twoL:[[.4,-5.0,2.4],[-3.8,-8,5.0]],
  reins:[[.6,-4.2,2.2],[-1.6,-6,5.5]],
  lance:[[1.2,-3.0,-.4],[-.2,-4.0,3.5]],
  spearR:[[1.4,-4.4,1.2],[1.6,-6.6,2.6]],
  hip:[[1.8,-4,-.4],[1.2,-7.2,.2]],
};
UP.POSE=POSE;
function figure(p,st,o={}){
  const R=RACE[st.race],W=R.w*(o.w||1),bulk=o.bulk||1,skel=st.race==='undead'&&!o.flesh,bone=st.id===14?0x9a94bc:0xe6dcc0;
  const ride=o.ride;
  const hipY=ride?0:11*R.hl,TH=8.8*R.ht*(o.th||1),shY=hipY+TH-1.1,neckY=hipY+TH,hr=2.75*R.hs*(o.head||1),hy=neckY+hr*.95;
  const armor=o.armor||'cloth',C={cloth:o.cloth??st.cloth,cloth2:o.cloth2??st.cloth2,metal:o.metal??st.metal,metal2:st.metal2,trim:st.trim,leather:st.leather,skin:o.skin??st.skin};
  const metalA=armor==='plate'||armor==='heavy',chainA=armor==='chain';
  const legC=metalA?C.metal:chainA?C.metal2:armor==='leather'?C.leather:armor==='bare'?C.cloth2:C.cloth2,legM=metalA?MT.metal:chainA?MT.chain:MT.cloth;
  const torsoC=metalA?C.metal:chainA?C.metal2:armor==='leather'?C.leather:armor==='bare'?C.skin:C.cloth,torsoM=metalA?MT.metal:chainA?MT.chain:armor==='bare'?MT.skin:MT.cloth;
  const lean=(st.race==='orc'&&!ride?.16:0)+(o.lean||0);
  // ---- legs
  if(!ride){
    if(armor==='robe'){p.cyl(3.1*W,5.4*W*bulk,hipY+1.2,C.cloth,{y:(hipY+1.2)/2,seg:14,...MT.cloth,grad:lp=>.8+.25*AE.clamp(lp.y/(hipY+1.2)+.5,0,1)});p.cyl(5.5*W,5.6*W,.6,C.trim,{y:.6,seg:14,...MT.gold});for(const sd of[-1,1])p.box(2.1*W,1.4,3.2,skel?bone:C.leather,{x:sd*1.9*W,y:.7,z:1.6});}
    else for(const sd of[-1,1]){const hip=[sd*1.95*W,hipY,0],knee=[sd*2.1*W,hipY*.5,.6],ank=[sd*2.15*W,1.4,0];const lr=skel&&!metalA&&!chainA?.5:1;
      p.limb(hip,knee,1.75*W*bulk*lr,1.4*W*lr,skel&&!metalA&&!chainA?bone:legC,{seg:8,...legM});p.limb(knee,ank,1.4*W*lr,1.15*W*lr,skel&&!metalA&&!chainA?bone:(metalA?C.metal:legC),{seg:8,...legM});
      if(metalA)p.sph(1.35*W,C.metal,{x:knee[0],y:knee[1],z:knee[2]+.3,...MT.metal});
      p.box(2.7*W,1.9,4.3,armor==='bare'?0x3a2a1a:metalA?shade(C.metal,.8):(skel&&!chainA?bone:C.leather),{x:ank[0],y:.85,z:.7,...(metalA?MT.metal:MT.leather)});}
  }else{
    for(const sd of[-1,1]){const hip=[sd*1.9*W,0,0],knee=[sd*3.4*W,-1.2,3.2],ank=[sd*3.6*W,-6.4,1.8];p.limb(hip,knee,1.4*W,1.15*W,legC,{seg:8,...legM});p.limb(knee,ank,1.15*W,.95*W,metalA?C.metal:legC,{seg:8,...legM});p.box(2.1*W,1.6,3.4,metalA?shade(C.metal,.8):C.leather,{x:ank[0],y:ank[1]-.6,z:ank[2]+.6,...MT.leather});}
  }
  p.pushT(0,hipY,0,lean,0,0);
  const hy0=hipY;// local frame from here: y measured from hips
  const L=y=>y-hy0;
  // ---- pelvis / torso
  if(skel&&armor!=='plate'&&armor!=='heavy'&&armor!=='chain'&&armor!=='robe'){
    p.sph(2.2*W,bone,{y:L(hipY+.6),sy:.6,...MT.bone});p.cyl(.55,.6,TH,bone,{y:L(hipY+TH/2),seg:6,...MT.bone});
    for(let i=0;i<5;i++)p.torus(2.6*W*(1-i*.06),.32,bone,{y:L(hipY+3.4+i*1.15),rx:PI/2,sz:.75,arc:PI*1.6,rz:-PI*.3,rs:4,ts:12,...MT.bone});
    p.sph(.9,0x0a0610,{y:L(hipY+5),z:.2});
  }else{
    p.sph(3.0*W*bulk,armor==='robe'?C.cloth:legC,{y:L(hipY+.8),sy:.62,sz:.8,...legM});
    p.cyl(3.85*W*bulk,3.25*W*bulk,TH,torsoC,{y:L(hipY+TH/2),seg:14,sz:.74,...torsoM,grad:lp=>.86+.2*AE.clamp(lp.y/TH+.5,0,1)});
    if(metalA){p.sph(3.45*W*bulk,C.metal,{y:L(hipY+TH*.62),z:.95,sx:1.02,sy:1.05,sz:.62,...MT.metal});p.box(.4,TH*.6,.4,C.trim,{y:L(hipY+TH*.55),z:2.95*bulk,...MT.gold});}
    if(armor==='bare'){p.box(.9,TH*1.1,.6,C.leather,{y:L(hipY+TH*.55),z:2.2,rz:.75,...MT.leather});p.sph(1.4*W,shade(C.skin,.9),{x:-1.4*W,y:L(hipY+TH*.7),z:1.7,sz:.5});p.sph(1.4*W,shade(C.skin,.9),{x:1.4*W,y:L(hipY+TH*.7),z:1.7,sz:.5});}
  }
  // tabard / skirt
  if(o.tabard!==false&&(chainA||metalA||armor==='leather')){p.box(4.2*W,TH*.95,.35,C.cloth,{y:L(hipY+TH*.35),z:2.7*W*bulk,...MT.cloth});p.box(4.2*W,TH*.95,.35,C.cloth,{y:L(hipY+TH*.35),z:-2.7*W*bulk,...MT.cloth});p.box(4.4*W,.5,.42,C.trim,{y:L(hipY-TH*.1),z:2.75*W*bulk,...MT.gold});
    if(o.tabardEmblem!==false){p.pushT(0,L(hipY+TH*.5),3.0*W*bulk);emblem(p,st,null,.65,C.trim);p.pop();}}
  if(armor==='leather'||armor==='cloth'||armor==='bare'){p.cyl(3.4*W*bulk,4.0*W*bulk,3.6,armor==='bare'?0x6a4a30:C.cloth,{y:L(hipY-1),seg:12,...MT.cloth,jit:armor==='bare'?.2:0});}
  // belt
  if(!(skel&&armor==='none'))p.cyl(3.42*W*bulk,3.42*W*bulk,1,C.leather,{y:L(hipY+1.2),seg:14,sz:.8,...MT.leather}),p.box(1.3,1.1,.5,C.trim,{y:L(hipY+1.2),z:2.75*W*bulk,...MT.gold});
  // ---- arms
  const hands={};
  for(const sd of[-1,1]){
    const key=sd<0?(o.rp||'rest'):(o.lp||'rest'),pz=POSE[key]||POSE.rest,a=R.arm;
    const sh=[sd*4.45*W*bulk,L(shY),0],el=[sh[0]+sd*pz[0][0]*a,sh[1]+pz[0][1]*a,pz[0][2]*a],hd=[sh[0]+sd*pz[1][0]*a,sh[1]+pz[1][1]*a,pz[1][2]*a];
    const armC=skel&&!metalA&&!chainA&&armor!=='robe'?bone:metalA?C.metal:chainA?C.metal2:armor==='bare'?C.skin:armor==='robe'?C.cloth:C.cloth,armM=metalA?MT.metal:chainA?MT.chain:MT.cloth;
    const ar=(skel&&!metalA&&!chainA&&armor!=='robe'?.5:1)*W*bulk*(st.race==='orc'?1.15:1);
    p.limb(sh,el,1.45*ar,1.22*ar,armC,{seg:8,...armM});p.limb(el,hd,1.22*ar,(armor==='robe'?1.4:1.05)*ar,armor==='robe'?C.cloth:(metalA?C.metal:armC),{seg:8,...armM});
    if(armor==='robe')p.cyl(1.0*ar,1.6*ar,1.4,C.trim,{x:hd[0],y:hd[1]+.9,z:hd[2],...MT.gold});
    p.sph(1.2*W*(st.race==='orc'?1.25:1),metalA?shade(C.metal,.85):(skel?bone:C.skin),{x:hd[0],y:hd[1],z:hd[2],...(metalA?MT.metal:MT.skin)});
    if(metalA||o.pauldrons){const pr=(armor==='heavy'?2.6:2.15)*W*bulk;p.sph(pr,o.pauldronC??C.metal,{x:sh[0]+sd*.4,y:sh[1]+.5,z:0,ts:0,tl:1.7,sz:.95,...MT.metal});p.torus(pr*.92,.22,C.trim,{x:sh[0]+sd*.4,y:sh[1]+.3,rx:PI/2,...MT.gold});
      if(st.race==='orc')for(let i=0;i<3;i++)p.cone(.42,2,0x2a2a2a,{x:sh[0]+sd*(.8+i*.6),y:sh[1]+1.6,z:-.6+i*.6,rz:-sd*.5,seg:4,...MT.metal});
      if(st.flair==='leaf')p.ext([[0,0],[1.6,2.6],[0,4],[-1.6,2.6]],.25,C.trim,{x:sh[0]+sd*.6,y:sh[1]+1,z:0,rz:-sd*.6,...MT.gold});}
    if(chainA&&!o.pauldrons)p.sph(1.8*W*bulk,C.leather,{x:sh[0]+sd*.3,y:sh[1]+.4,ts:0,tl:1.6,...MT.leather});
    hands[sd<0?'R':'L']=[hd[0],hd[1]+hy0,hd[2]];
  }
  // ---- cape (behind)
  if(o.cape){const cc=o.cape===true?C.cloth:o.cape,len=TH+hipY*.75;p.box(7.4*W*bulk,len,.45,cc,{y:L(shY-len/2+.6),z:-2.9*W*bulk,rx:.09,...MT.cloth,grad:lp=>.75+.3*AE.clamp(lp.y/len+.5,0,1)});p.box(7.6*W*bulk,.7,.6,C.trim,{y:L(shY+.3),z:-2.6*W*bulk,...MT.gold});}
  if(o.mantle){p.sph(4.6*W*bulk,o.mantle,{y:L(shY+.2),sy:.55,sz:.8,...MT.cloth,jit:.25});}
  // ---- head
  head(p,st,{...o,helm:o.helm},L(neckY),L(hy),hr,W);
  if(o.helm)helm(p,st,o.helm,L(hy),hr,o);
  p.pop();
  const ry=lean;// convert hand positions through the lean rotation (small)
  const rot=(h)=>{const y=h[1]-hipY,z=h[2];return [h[0],hipY+y*Math.cos(ry)-z*Math.sin(ry),y*Math.sin(ry)+z*Math.cos(ry)];};
  return {R:rot(hands.R),L:rot(hands.L),top:hy+hr*1.1,hy,hr,shY,hipY,W};
}
UP.figure=figure;

// ---------------------------------------------------------------- quadrupeds (face +x)
const QUAD={
  horse:{len:15,leg:10,g:4.2,neck:1,col:0x7a4a2a,mane:0x2a1a10,head:'horse'},
  elfhorse:{len:15,leg:10.6,g:3.8,neck:1.1,col:0xf3f3ee,mane:0xd8e6f0,head:'horse',slim:1},
  stag:{len:14,leg:10.5,g:3.6,neck:1.05,col:0x8a5a32,mane:0xe8dcc0,head:'stag',antlers:1},
  ram:{len:12.5,leg:7,g:4.4,neck:.6,col:0xd8ccb0,mane:0xb8ac90,head:'ram',horns:1,wool:1},
  ironram:{len:12.5,leg:7,g:4.5,neck:.6,col:0x5a5550,mane:0x2a2826,head:'ram',horns:1,armor:1},
  warg:{len:14,leg:8,g:4,neck:.4,col:0x5a5550,mane:0x2a2826,head:'wolf',fur:1},
  darkwarg:{len:14,leg:8,g:4,neck:.4,col:0x3a2a22,mane:0x1a120c,head:'wolf',fur:1},
  direwolf:{len:14,leg:8,g:3.8,neck:.4,col:0x6a6a52,mane:0x3a4a22,head:'wolf',fur:1,thorns:1},
  boar:{len:14,leg:6.4,g:5,neck:.3,col:0x5a3a2a,mane:0x2a1a10,head:'boar',tusks:1,fur:1},
  bonehorse:{len:15,leg:10,g:3.6,neck:1,col:0xe6dcc0,mane:0xa860ff,head:'horse',bones:1,flame:1},
  nightmare:{len:15,leg:10,g:4,neck:1,col:0x1a1a26,mane:0xd56bdc,head:'horse',flame:1},
  bear:{len:13,leg:6.8,g:5.4,neck:.4,col:0x5a3a22,mane:0x3a2412,head:'bear',fur:1},
  cavebear:{len:13,leg:6.8,g:5.4,neck:.4,col:0x6a5a4a,mane:0x4a3a2a,head:'bear',fur:1},
  lion:{len:14,leg:8,g:4,neck:.5,col:0xd8a050,mane:0x8a4a1a,head:'lion'},
  panther:{len:14,leg:7.6,g:3.6,neck:.5,col:0x15141e,mane:0x15141e,head:'cat',glowEye:0xd56bdc},
  bonehound:{len:13,leg:8,g:3.4,neck:.4,col:0xe6dcc0,mane:0xa860ff,head:'wolf',bones:1,flame:1},
};
function quad(p,st,kind,o={}){
  const q=QUAD[kind]||QUAD.horse,len=q.len,leg=q.leg,g=q.g,col=o.col??q.col,mane=o.mane??q.mane,by=leg+g*.6;
  const bones=!!q.bones,BM=bones?MT.bone:MT.skin;
  // body
  if(bones){p.cyl(.7,.7,len*.9,col,{y:by+g*.4,rz:PI/2,seg:6,...BM});for(let i=0;i<6;i++)p.torus(g*.9*(1-Math.abs(i-2.5)*.12),.35,col,{x:-len*.25+i*len*.11,y:by,rx:0,ry:PI/2,arc:PI*1.4,rz:-PI*.2,rs:4,ts:10,...BM});p.sph(g*.8,col,{x:-len*.38,y:by+g*.2,sy:.7,...BM});}
  else{p.sph(g,col,{y:by,sx:len/(2*g),sz:.9*(q.slim?.9:1),ws:16,hs:10,...BM,grad:lp=>.78+.3*AE.clamp(lp.y/g+.5,0,1),jit:q.fur?.1:0});p.sph(g*1.05,col,{x:len*.3,y:by+g*.15,sz:.9,...BM});p.sph(g*1.0,col,{x:-len*.3,y:by+g*.05,sz:.92,...BM});}
  if(q.wool)p.ico(g*1.2,0xf0e8d6,{y:by+g*.2,sx:len/(2.2*g),sz:.95,d:1,noise:1.2,nseed:4});
  // legs
  for(const [lx,lz] of [[len*.32,g*.55],[len*.32,-g*.55],[-len*.32,g*.55],[-len*.32,-g*.55]]){const k=[lx+(lx>0?.3:-.6),leg*.5,lz],f=[lx+(lx>0?.2:-.2),.8,lz];const lr=bones?.45:q.head==='bear'?1.35:1;
    p.limb([lx,by-g*.3,lz],k,1.2*lr,.85*lr,col,{seg:7,...BM});p.limb(k,f,.85*lr,.7*lr,col,{seg:7,...BM});p.cyl(.95*lr,1.05*lr,1.2,q.head==='horse'||q.head==='stag'||q.head==='ram'?0x2a2420:shade(col,.7),{x:f[0],y:.6,z:f[2],seg:7});}
  // neck + head
  const nb=[len*.4,by+g*.4,0],nt=[len*.4+q.neck*3.6,by+g*.4+q.neck*6.4+2,0];
  if(q.neck>.45){p.limb(nb,nt,g*.62,g*.45,col,{seg:8,...BM});}
  const hx=nt[0]+(q.neck>.45?1.6:2.2),hyy=q.neck>.45?nt[1]+.4:by+g*.5;
  if(q.head==='horse'||q.head==='stag'){p.sph(1.9,col,{x:hx,y:hyy,sx:1.5,sy:.9,sz:.8,...BM});p.sph(1.3,shade(col,.92),{x:hx+2.6,y:hyy-1.1,sx:1.2,sy:.8,sz:.75,...BM});for(const sd of[-1,1]){p.cone(.45,1.6,col,{x:hx-.8,y:hyy+1.8,z:sd*.7,seg:4});p.sph(.28,bones?q.mane:0x111111,{x:hx+.8,y:hyy+.4,z:sd*1.25,e:bones||q.flame?2.5:0});}
    if(!bones&&q.head==='horse')p.box(len*.36,1.2,.7,mane,{x:nb[0]+q.neck*1.6,y:(nb[1]+nt[1])/2+1.6,rz:-1.05,...MT.cloth,e:q.flame?1.6:0});
    if(q.flame){for(let i=0;i<5;i++)p.cone(.9,3,mane,{x:nb[0]+i*.9,y:nb[1]+2+i*1.5,z:0,rz:.6,seg:5,e:2.4});}
    if(q.antlers)for(const sd of[-1,1]){const b=[hx-.6,hyy+1.4,sd*.6],m=[hx-1,hyy+4.6,sd*2.2],t=[hx-2.2,hyy+7.4,sd*3];p.limb(b,m,.3,.24,0xe8dcc0,{seg:5});p.limb(m,t,.24,.14,0xe8dcc0,{seg:5});p.limb(m,[hx+.6,hyy+6.2,sd*2.6],.18,.12,0xe8dcc0,{seg:4});p.limb([hx-1.6,hyy+6.2,sd*2.6],[hx-3.4,hyy+6.6,sd*3.6],.16,.1,0xe8dcc0,{seg:4});}}
  else if(q.head==='ram'){p.sph(2,col,{x:hx,y:hyy,sx:1.3,sy:.95,...BM});p.sph(1.2,shade(col,.85),{x:hx+2,y:hyy-.6,...BM});for(const sd of[-1,1]){for(let i=0;i<6;i++){const a=i/6*PI*1.6;p.sph(.85-i*.06,0xd8cfb4,{x:hx-.4+Math.cos(a)*1.6,y:hyy+.6+Math.sin(a)*1.6,z:sd*(1.5+i*.2),...MT.bone});}p.sph(.25,0x111111,{x:hx+1,y:hyy+.4,z:sd*1.2});}
    if(q.armor){p.box(2.6,2.2,2.6,st.metal,{x:hx+.4,y:hyy+.3,...MT.metal});p.sph(.4,st.eye,{x:hx+1.7,y:hyy+.5,z:.7,e:2.4});p.sph(.4,st.eye,{x:hx+1.7,y:hyy+.5,z:-.7,e:2.4});}}
  else if(q.head==='wolf'||q.head==='cat'||q.head==='lion'){p.sph(2.2,col,{x:hx,y:hyy,sx:1.1,...BM});p.cone(1.2,3.2,shade(col,.95),{x:hx+2.4,y:hyy-.5,rz:-PI/2,sz:.85,seg:7,...BM});p.sph(.4,0x111111,{x:hx+3.9,y:hyy-.4});
    for(const sd of[-1,1]){p.cone(.6,1.8,col,{x:hx-.6,y:hyy+2,z:sd*1,rz:.1,seg:4});p.sph(.28,q.glowEye??(bones||q.flame?q.mane:0xffd030),{x:hx+1.2,y:hyy+.6,z:sd*1.1,e:2});}
    if(q.head==='lion')p.ico(3.1,mane,{x:hx-.8,y:hyy,d:1,noise:1,nseed:3,sx:.8});
    if(q.fur)p.ico(g*.95,mane,{x:len*.3,y:by+g*.5,d:1,noise:1.2,nseed:5,sx:1.1,sy:.8});
    if(q.flame)for(let i=0;i<5;i++)p.cone(.8,2.6,q.mane,{x:len*.3-i*1.6,y:by+g*1.1,rz:.5,seg:5,e:2.4});
    if(q.thorns)for(let i=0;i<7;i++)p.cone(.3,1.8,0x5a3a20,{x:len*.35-i*1.7,y:by+g*1.05,z:(i%2-.5)*1.4,rz:.4,seg:4});}
  else if(q.head==='boar'){p.sph(2.6,col,{x:hx,y:hyy,sx:1.3,sy:.95,...BM});p.cyl(1.1,1.3,1.6,0xc89a8a,{x:hx+3.2,y:hyy-.6,rz:PI/2,seg:9});for(const sd of[-1,1]){p.limb([hx+2.4,hyy-1.2,sd*1.1],[hx+3.6,hyy+.8,sd*1.6],.32,.12,0xfaf2dc,{seg:5});p.cone(.6,1.8,col,{x:hx-.4,y:hyy+2.2,z:sd*1.2,rz:.4,seg:4});p.sph(.25,0x111111,{x:hx+1.4,y:hyy+.6,z:sd*1.3});}
    p.box(len*.6,1.5,.8,mane,{x:0,y:by+g+.4,...MT.cloth,jit:.3});}
  else if(q.head==='bear'){p.sph(2.6,col,{x:hx,y:hyy,...BM});p.sph(1.3,shade(col,.8),{x:hx+2.2,y:hyy-.5,...BM});p.sph(.4,0x111111,{x:hx+3.3,y:hyy-.3});for(const sd of[-1,1]){p.sph(.8,col,{x:hx-.6,y:hyy+2.2,z:sd*1.6});p.sph(.25,0x111111,{x:hx+1.6,y:hyy+.7,z:sd*1.1});}
    p.ico(g*1.05,mane,{x:len*.25,y:by+g*.6,d:1,noise:1.2,nseed:7,sx:1.2,sy:.7});}
  // tail
  if(q.head==='horse'||q.head==='stag')p.limb([-len*.48,by+g*.3,0],[-len*.62,by-g*1.2,0],.7,.35,q.head==='stag'?0xe8dcc0:mane,{seg:5,e:q.flame?2:0});
  else if(q.head==='wolf'||q.head==='cat'||q.head==='lion')p.limb([-len*.48,by+g*.3,0],[-len*.75,by+g*.8,0],.8,.4,q.head==='lion'?col:mane,{seg:6});
  else p.limb([-len*.48,by+g*.3,0],[-len*.58,by-g*.2,0],.4,.2,col,{seg:4});
  // tack: saddle, barding
  const saddleY=by+g*.98;
  if(!o.noSaddle){p.box(4.6,1,g*1.6,st.leather,{y:saddleY,...MT.leather});p.box(4.8,.4,g*1.9,st.cloth,{y:saddleY-.6,...MT.cloth});}
  if(o.barding){p.box(len*.62,g*1.1,g*2.05,o.barding,{y:by-g*.15,...MT.cloth,grad:lp=>.8+.25*AE.clamp(lp.y+.5,0,1)});p.box(len*.64,.5,g*2.1,st.trim,{y:by-g*.7,...MT.gold});
    for(const sd of[-1,1]){p.pushT(0,by-g*.1,sd*g*1.04,0,sd<0?PI:0,0);emblem(p,st,null,1.1,st.trim);p.pop();}
    if(o.chanfron)p.box(3.2,1.6,2,st.metal,{x:hx+1.3,y:hyy+.3,...MT.metal});}
  return {x:0,y:saddleY+.6,z:0,len,hx,hy:hyy};
}
UP.quad=quad;UP.QUAD=QUAD;

// ---------------------------------------------------------------- dragons (face +x)
function dragon(p,st,o={}){
  const s=o.s||1,col=o.col??st.cloth,belly=o.belly??st.trim,wing=o.wing??shade(col,.75),bone=!!o.bone,BM=bone?MT.bone:{m:.15,r:.5};
  p.pushT(0,0,0,0,0,0,s);
  if(bone){p.cyl(.9,.9,16,0xe6dcc0,{y:13,rz:PI/2,seg:6,...BM});for(let i=0;i<7;i++)p.torus(4.2*(1-Math.abs(i-3)*.12),.45,0xe6dcc0,{x:-6+i*2,y:12,ry:PI/2,arc:PI*1.3,rz:-PI*.15,rs:4,ts:10,...BM});}
  else{p.sph(5,col,{y:12,sx:1.9,sy:1,sz:.95,...BM,grad:lp=>.75+.35*AE.clamp(lp.y/5+.5,0,1)});p.sph(4,belly,{y:10.4,sx:1.7,sy:.7,sz:.85,...BM});for(let i=0;i<6;i++)p.cone(.8,2.6,belly,{x:-7+i*2.6,y:17,seg:4,rz:.3,...BM});}
  // neck + head
  let prev=[8,14,0];for(let i=1;i<=5;i++){const n=[8+i*1.6,14+i*2.2-(i>4?1:0),0];p.limb(prev,n,(3.2-i*.35),(3.0-i*.35),bone?0xe6dcc0:col,{seg:8,...BM});prev=n;}
  const hx=prev[0]+2,hy=prev[1]+.6;
  p.sph(2.6,bone?0xe6dcc0:col,{x:hx,y:hy,sx:1.4,sy:.9,...BM});p.box(4.6,1.6,2.6,bone?0xe6dcc0:col,{x:hx+3.6,y:hy-.6,...BM});p.box(3.8,.7,2.2,bone?0xd8ccb0:belly,{x:hx+3.4,y:hy-1.8,...BM});
  for(const sd of[-1,1]){p.limb([hx-1,hy+1.4,sd*1.2],[hx-4.6,hy+3.6,sd*2],.6,.15,o.horn??0xe8dcc0,{seg:5,...MT.bone});p.sph(.55,o.eye??0xffd040,{x:hx+1.6,y:hy+.8,z:sd*1.6,e:3});}
  if(o.fire){for(let i=0;i<3;i++)p.cone(.9-i*.2,3,0xff8a2a,{x:hx+7+i*1.4,y:hy-1,rz:-PI/2,seg:6,e:3});}
  // tail
  prev=[-9,12,0];for(let i=1;i<=6;i++){const n=[-9-i*2.6,12-i*1.1+Math.sin(i)*.6,Math.sin(i*.9)*1.5];p.limb(prev,n,2.4-i*.33,2.2-i*.33,bone?0xe6dcc0:col,{seg:7,...BM});prev=n;}p.cone(1.4,3,bone?0xe6dcc0:col,{x:prev[0]-1.4,y:prev[1],z:prev[2],rz:PI/2,sz:.3,seg:4});
  // legs
  for(const [lx,lz] of [[5,3.2],[5,-3.2],[-6,3.4],[-6,-3.4]]){p.limb([lx,10,lz],[lx+1,5,lz*1.1],1.6,1.1,bone?0xe6dcc0:col,{seg:7,...BM});p.limb([lx+1,5,lz*1.1],[lx+1.8,.8,lz*1.1],1.1,.9,bone?0xe6dcc0:col,{seg:7,...BM});for(let c=-1;c<=1;c++)p.cone(.35,1.4,0x2a2420,{x:lx+3,y:.5,z:lz*1.1+c*.6,rz:-PI/2,seg:4});}
  // wings
  for(const sd of[-1,1]){const sh=[2,16,sd*3.5],el=[-1,24,sd*11],tip=[-6,22,sd*21];
    p.limb(sh,el,1.1,.8,bone?0xe6dcc0:col,{seg:6,...BM});p.limb(el,tip,.8,.35,bone?0xe6dcc0:col,{seg:6,...BM});
    const fingers=[[-6,22,sd*21],[-10,14,sd*18],[-12,12,sd*11],[-9,13,sd*5]];for(const f of fingers)p.limb(el,f,.45,.2,bone?0xe6dcc0:col,{seg:5,...BM});
    if(!bone||o.membrane){const memb=bone?0x5a3a8a:wing;const pts=[sh,el,...fingers];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],c=pts[0];const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute([...a,...b,...el,...b,...a,...el],3));g.computeVertexNormals();p.add(g,memb,{...MT.cloth,r:.7,e:bone?.6:0});
      const g2=new T3.BufferGeometry();g2.setAttribute('position',new T3.Float32BufferAttribute([...el,...fingers[Math.min(i,3)],...fingers[Math.min(i+1,3)],...fingers[Math.min(i+1,3)],...fingers[Math.min(i,3)],...el],3));g2.computeVertexNormals();p.add(g2,memb,{...MT.cloth,r:.7,e:bone?.6:0});}}}
  p.pop();
  return {x:3.5*s,y:17.5*s,z:0};
}
UP.dragon=dragon;

// ---------------------------------------------------------------- siege engines (face +x)
function wheel(p,x,y,z,r,col,trim){p.cyl(r,r,1.2,col,{x,y,z,rx:PI/2,seg:12,...MT.wood});p.cyl(r*.35,r*.35,1.5,trim,{x,y,z,rx:PI/2,seg:8,...MT.metal});for(let i=0;i<4;i++)p.box(r*1.8,.4,1.3,shade(col,.8),{x,y,z,rz:i*PI/4});}
UP.wheel=wheel;
function trebuchet(p,st){
  const race=st.race,wood=race==='elf'?(st.flair==='wild'?0x5a3e24:0xd8c8a0):race==='undead'?0x2e2830:race==='orc'?0x5a3a22:st.wood,band=race==='undead'?0xe6dcc0:race==='elf'&&st.flair!=='wild'?st.trim:st.metal2;
  p.box(20,1.6,9,wood,{y:3,...MT.wood,jit:race==='orc'?.25:0});for(const z of[-4,4])p.box(20,1.2,1.2,band,{y:3.8,z,...MT.metal});
  for(const x of[-7,7])for(const z of[-5,5])wheel(p,x,2.4,z,2.4,wood,band);
  for(const z of[-3.5,3.5]){p.limb([-4,3.8,z],[0,19,z*.5],.8,.6,wood,{seg:6,...MT.wood});p.limb([4,3.8,z],[0,19,z*.5],.8,.6,wood,{seg:6,...MT.wood});}
  p.cyl(.8,.8,6,band,{y:19,rx:PI/2,seg:8,...MT.metal});
  p.limb([-11,26,0],[6,15,0],.75,.9,wood,{seg:6,...MT.wood});
  const cw=race==='undead'?0xe6dcc0:race==='dwarf'?0x6a6058:0x7a7064;p.box(4.6,5,4.6,cw,{x:6.5,y:12.4,...MT.metal,jit:.15});if(race==='dwarf')p.box(.4,3.4,4.8,st.flair==='iron'?0x6af0ff:0xffb040,{x:8.9,y:12.4,e:1.6});
  p.limb([-11,26,0],[-12,17,0],.15,.15,0xd8c8a0,{seg:3,caps:false});p.sph(1.6,race==='undead'?0xe6dcc0:0x8a8278,{x:-12,y:16.2,...MT.bone});
  if(race==='orc')for(let i=0;i<6;i++)p.cone(.5,2.6,0xe0d6c0,{x:-9+i*3.6,y:4.4,z:4.8,rx:.4,seg:4,...MT.bone});
  if(race==='elf'&&st.flair!=='wild')for(const z of[-3.6,3.6])p.ext([[0,0],[1.6,2.6],[0,4.4],[-1.6,2.6]],.3,st.cloth,{x:0,y:20.5,z,...MT.cloth});
  if(race==='elf'&&st.flair==='wild')for(let i=0;i<8;i++)p.ico(1.4,0x4a7a2a,{x:-8+i*2.2,y:4.6,z:(i%2?4.6:-4.6),d:1});
  p.pushT(-9,4,-4.4);banner(p,st,{h:12,w:4,fh:4.6});p.pop();
}
function bombard(p,st,o={}){
  const race=st.race,runic=!!o.runic,wood=race==='undead'?0x2e2830:race==='elf'?0xd8c8a0:st.wood;
  const barrelC=runic?0x4a5058:race==='human'?(st.flair==='sun'?0xd9b04a:0xb07a3a):race==='dwarf'?0x5a5f66:race==='orc'?0x2e3032:race==='undead'?0xe6dcc0:0x9ab8a8;
  p.box(13,2.2,7,wood,{y:3.2,...MT.wood});for(const z of[-4,4])wheel(p,-1,3.4,z,3.4,wood,st.metal2);
  p.pushT(1,7.4,0,0,0,.18);
  const L=runic?16:14,R0=runic?3:2.5;
  p.lathe([[0,-L/2],[R0*1.15,-L/2],[R0*1.2,-L/2+1.4],[R0,-L/2+2],[R0*.9,L/2-1.6],[R0*1.15,L/2-1],[R0*1.15,L/2],[R0*.7,L/2],[R0*.7,L/2-.5],[0,L/2-.5]],barrelC,{rz:-PI/2,seg:16,m:race==='undead'?0:.75,r:.32});
  if(race==='undead'){p.sph(R0*1.3,0xe6dcc0,{x:L/2,y:0,...MT.bone});for(const sd of[-1,1])p.sph(.6,st.eye,{x:L/2+1.4,y:.8,z:sd*1,e:3});}
  if(race==='orc')for(let i=0;i<5;i++)p.cone(.5,2,0x2a2a2a,{x:-L/2+2+i*2.6,y:R0+.6,seg:4,...MT.metal});
  for(let i=0;i<3;i++)p.torus(R0*1.05,.3,runic?st.trim:st.metal2,{x:-L/2+3+i*4,ry:PI/2,rs:4,ts:16,...MT.metal});
  if(runic){for(let i=0;i<4;i++)p.box(.6,.6,R0*2.15,0x6af0ff,{x:-L/2+4+i*3,e:2.2});p.cyl(1.6,1.6,4,0x8a5a3a,{x:-L/2,y:3.4,seg:10,...MT.metal});p.cyl(.4,.6,4,0x3a3a3a,{x:-L/2,y:6.6,seg:6});p.sph(1.4,0xd8dde2,{x:-L/2,y:9.4,e:.4});}
  if(race==='elf')p.cyl(0,1.2,3,st.flair==='wild'?0x6aa82a:0x8af0d0,{x:-L/2+1,y:R0+1.8,seg:5,e:1.8});
  p.pop();
  for(let i=0;i<4;i++)p.sph(1.1,0x2a2a2a,{x:-6+(i%2)*2.2,y:1.1+(i>1?1.8:0),z:5.5+(i%2),...MT.metal});
  p.pushT(-6,0,-4.5,0,-PI/2,0);banner(p,st,{h:12,w:4,fh:4.6});p.pop();
}
UP.trebuchet=trebuchet;UP.bombard=bombard;

// ---------------------------------------------------------------- ships (face +x, waterline at y=0)
function ship(p,st,o={}){
  const war=!!o.war,L=war?34:28,B=war?10:8,race=st.race;
  const hull=race==='elf'?(st.flair==='wild'?0x5a4028:0xe8dcc0):race==='undead'?0x2e2834:race==='orc'?0x4a3020:race==='dwarf'?0x4a3a2c:0x6a452a;
  const trimC=race==='undead'?0xe6dcc0:st.trim;
  const prof=[[-L/2,4.2],[L/2-4,3.6],[L/2+2,6.4],[L/2+3,7.2],[L/2-1,3.2],[L/2-6,-2.2],[-L/2+3,-2.4],[-L/2,0]];
  p.ext(prof,B,hull,{...MT.wood,jit:.08});p.box(L-2,.6,B-1.2,shade(hull,1.25),{y:3.6,...MT.wood});
  p.ext(prof.map(q=>[q[0],q[1]+.3]),B+.4,trimC,{sy:.12,y:3.4,...MT.gold});
  if(race==='dwarf')for(let i=0;i<6;i++)p.box(2.4,3,B+.3,st.metal2,{x:-L/2+4+i*4.6,y:1,...MT.metal});
  // stern castle
  p.box(7,war?6:4,B-1,hull,{x:-L/2+4,y:war?6.6:5.6,...MT.wood});p.box(7.4,.6,B-.6,trimC,{x:-L/2+4,y:war?9.8:7.8,...MT.gold});
  // masts + sails
  const masts=war?[[2,30],[-8,24]]:[[0,24]];
  for(const [mx,mh] of masts){p.cyl(.6,.75,mh,st.wood,{x:mx,y:3.6+mh/2,seg:7,...MT.wood});p.box(.5,.5,B+3,st.wood,{x:mx,y:3.6+mh*.82,...MT.wood});
    const sw=B+2,sh=mh*.55,sy=3.6+mh*.53;const sail=race==='undead'?0x3a2a4a:st.cloth;
    p.box(.5,sh,sw,sail,{x:mx+.8,y:sy,...MT.cloth,jit:race==='undead'||race==='orc'?.25:0,grad:lp=>.85+.2*AE.clamp(lp.y/sh+.5,0,1)});
    p.box(.6,.7,sw+.2,st.trim,{x:mx+.9,y:sy+sh/2,...MT.gold});
    p.pushT(mx+1.3,sy,0,0,PI/2,0);emblem(p,st,null,Math.min(sw,sh)*.16,st.trim);p.pop();
    p.box(.3,2.6,4,st.trim,{x:mx,y:3.6+mh+1.2,z:2,...MT.cloth});}
  // oars or guns
  if(!war){for(let i=0;i<7;i++)for(const sd of[-1,1])p.box(.5,.5,9,0x8a6a42,{x:-L/2+6+i*3.2,y:2.4,z:sd*(B/2+3.4),rx:sd*.45,...MT.wood});}
  else{for(let i=0;i<5;i++)for(const sd of[-1,1]){p.box(1.6,1.4,.3,0x111111,{x:-L/2+9+i*4.2,y:2.2,z:sd*(B/2+.05)});p.cyl(.45,.55,2.4,0x2a2a2a,{x:-L/2+9+i*4.2,y:2.2,z:sd*(B/2+1),rx:PI/2,seg:8,...MT.metal});}
    p.box(4,1.4,3,st.wood,{x:L/2-6,y:4.8,...MT.wood});p.box(5,.6,.6,st.metal2,{x:L/2-4,y:5.8,...MT.metal});}
  // figurehead by race
  const fx=L/2+3.2,fy=6.8;
  if(race==='human'){if(st.flair==='sun'){p.sph(1.4,st.trim,{x:fx,y:fy,...MT.gold,e:.4});for(let i=0;i<8;i++){const a=i/8*6.283;p.cone(.3,1.2,st.trim,{x:fx,y:fy+Math.sin(a)*2,z:Math.cos(a)*2,rx:a,seg:4,...MT.gold});}}else{p.sph(1.5,st.trim,{x:fx,y:fy,...MT.gold});p.ico(1.9,st.trim,{x:fx-.6,y:fy,d:0,...MT.gold});}}
  else if(race==='elf'){if(st.flair==='wild'){for(const sd of[-1,1])p.limb([fx,fy,0],[fx+1,fy+3.6,sd*2.2],.3,.15,0xe8dcc0,{seg:4});p.sph(1.2,0x8a5a32,{x:fx,y:fy});}else{p.limb([fx-1,fy-1,0],[fx+1,fy+2.6,0],.7,.5,0xf4f2ea,{seg:6});p.sph(.9,0xf4f2ea,{x:fx+1.6,y:fy+3,sx:1.4});p.cone(.3,1.2,0xe8a030,{x:fx+3,y:fy+2.8,rz:-PI/2,seg:4});}}
  else if(race==='dwarf'){p.box(2.4,2.4,2.4,st.metal,{x:fx,y:fy,...MT.metal});p.cone(1,2,st.trim,{x:fx+1.8,y:fy,rz:-PI/2,seg:4,...MT.gold});}
  else if(race==='orc'){p.sph(1.6,0x5a3a2a,{x:fx,y:fy,sx:1.3});for(const sd of[-1,1])p.cone(.3,2,0xfaf2dc,{x:fx+1.2,y:fy-.4,z:sd*.8,rz:-1,seg:4});}
  else{p.sph(1.6,0xe6dcc0,{x:fx,y:fy,...MT.bone});for(const sd of[-1,1])p.sph(.4,st.eye,{x:fx+1.2,y:fy+.3,z:sd*.6,e:3});}
  if(race==='undead')for(let i=0;i<3;i++)p.sph(.5,st.eye,{x:-L/2+6+i*8,y:5,z:B/2,e:2.4});
}
UP.ship=ship;
function rowboat(p,st){p.ext([[-6,2],[6,2],[7,3],[5.4,-.6],[-5.4,-.6],[-6.4,1]],5,st.wood,{...MT.wood});p.box(11,.4,4,shade(st.wood,1.2),{y:1.6,...MT.wood});p.box(.4,.4,9,0x8a6a42,{x:1,y:2.4,rx:.3});}
UP.rowboat=rowboat;
})();
