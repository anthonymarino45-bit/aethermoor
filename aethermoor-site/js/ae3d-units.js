/* Realms of Aethermoor V5.7.0 - 3D miniature units.
   Every unit definition (56) has its own kit; each kit is re-interpreted per race (anatomy, armour language, weapons,
   mounts, siege and ship styling) and per faction (palette, heraldry, signature details). One merged mesh per unit. */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const T3=THREE,PI=Math.PI,UP=AE.UP,MT=UP.MT,mix=AE.mix,shade=AE.shadeHex;
const FULLHELM=new Set(['bascinet','great','sunhelm','winged','horned','ironmask','spiked','boarskull','nemes','hood','antlerhood','kettle','cap','wizard','hat','turban']);
function helmFor(st,armor){
  const heavy=armor==='plate'||armor==='heavy',mid=armor==='chain';
  switch(st.key){
    case 'aldermark':return heavy?'great':mid?'bascinet':armor==='leather'?'kettle':null;
    case 'valedawn':return heavy||mid?'sunhelm':armor==='leather'?'kettle':null;
    case 'sylvanor':return heavy||mid?'winged':armor==='leather'?'hood':null;
    case 'thornwild':return armor==='robe'||armor==='cloth'?null:'antlerhood';
    case 'khazrum':return heavy||mid?'horned':'cap';
    case 'ironveil':return heavy||mid?'ironmask':'cap';
    case 'grommash':return heavy||mid?'spiked':null;
    case 'skarr':return heavy||mid?'boarskull':null;
    case 'nekhara':return heavy||mid||armor==='robe'?'nemes':null;
    case 'nocthyr':return 'hood';
    case 'barbarian':return mid||heavy?'spiked':null;
  }
  return mid||heavy?'bascinet':null;
}
function flairOpts(st){
  const o={};
  if(st.key==='sylvanor')o.longHair=true;
  if(st.key==='thornwild'){o.mantle=0x5b6a2c;o.paint=0x4a8a2a;}
  if(st.key==='skarr')o.paint=0xf0a36d;
  if(st.key==='grommash')o.paint=0x9a1c1c;
  if(st.key==='valedawn')o.longHair=true;
  return o;
}
// standard figure with race/faction defaults
function fig(p,st,o={}){
  const armor=o.armor||'chain',helm=o.helm===undefined?helmFor(st,armor):o.helm;
  // Blender-made body when one is available (races: human/elf/dwarf/orc/undead); the procedural figure is the fallback
  if(!o.ride&&AE.BODY){const bf=AE.BODY.build(p,st,{...o,armor},curHero);if(bf)return bf;}
  const f=UP.figure(p,st,{...flairOpts(st),...o,armor,helm,fullHelm:FULLHELM.has(helm)});
  // faction signature details
  const sY=f.shY,W=f.W;
  if(st.flair==='sun'&&armor!=='robe'&&!o.noFlair){p.cyl(1.3,1.3,.3,0xffe28a,{y:sY-2,z:2.95*W*(o.bulk||1),rx:PI/2,seg:14,...MT.gold,e:.7});}
  if(st.flair==='rune'&&!o.noFlair)p.cyl(3.25*W*(o.bulk||1),3.25*W*(o.bulk||1),.35,0xffb040,{y:f.hipY+1.9,sz:.8,seg:14,e:1.3});
  if(st.flair==='iron'&&!o.noFlair){for(const sd of[-1,1])p.cyl(.45,.45,7,0xb07a3a,{x:sd*1.4,y:sY-2,z:-3.2*W,seg:6,...MT.gold});p.cyl(.9,.9,1.4,0x3a3a3a,{y:sY+2.2,z:-3.2*W,seg:8,...MT.metal});}
  if(st.flair==='tusk'&&!o.noFlair)for(let i=0;i<7;i++){const a=-1.1+i*.37;p.cone(.22,1.2,0xf6efe0,{x:Math.sin(a)*2.4*W,y:sY-.4-Math.cos(a)*.6,z:Math.cos(a)*2.2*W,rx:PI,seg:4});}
  if(st.flair==='pharaoh'&&!o.noFlair)p.cyl(3.6*W,3.2*W,.6,st.trim,{y:sY+.2,seg:16,sz:.85,...MT.gold,paint:(lp,c)=>{if(Math.abs(Math.atan2(lp.z,lp.x)*3)%1<.5)c.set(0x2a6ab8);}});
  if(st.flair==='shadow'&&!o.noFlair)for(let i=0;i<4;i++){const a=i*1.57+.4;p.cone(.7,3,0x8a6aff,{x:Math.cos(a)*3.4,y:1.6,z:Math.sin(a)*3.4,seg:5,e:1.2});}
  return f;
}
let curHero=false;
function at(p,h,r,fn){if(h&&h.skip)return;p.pushT(h[0],h[1],h[2],r?r[0]:0,r?r[1]:0,r?r[2]:0);fn();p.pop();}
function quiver(p,st,f,side=1){p.pushT(side*1.6*f.W,f.shY-4,-3.1*f.W,.25,0,side*.25);p.cyl(1.1,.9,8,st.leather,{seg:8,...MT.leather});for(let i=0;i<5;i++){p.cyl(.12,.12,3,0xd8c8a0,{x:(i%3-1)*.45,y:4.8,z:(i>2?.4:-.3)});p.cone(.4,1,st.flair==='sun'?0xffe08a:st.race==='undead'?0x8a4ad8:0xe8e8e8,{x:(i%3-1)*.45,y:6.6,z:(i>2?.4:-.3),seg:3});}p.pop();}
function backpack(p,st,f){p.box(6*f.W,7,4,st.leather,{y:f.shY-3.4,z:-4.2*f.W,...MT.leather,jit:.1});p.cyl(1.3,1.3,7.2,mix(st.cloth,0xc8b890,.5),{y:f.shY+.8,z:-4.2*f.W,rz:PI/2,seg:10,...MT.cloth});p.cyl(1.2,1.4,2,0x6a6a6a,{x:2*f.W,y:f.shY-7.6,z:-5,seg:8,...MT.metal});}
function hawk(p,st,col=0x8a6a4a){p.sph(1.1,col,{sx:.8,sy:1.2});p.sph(.7,col,{y:1.5,z:.3});p.cone(.25,.7,0xe8b030,{y:1.4,z:1,rx:PI/2,seg:4});for(const sd of[-1,1])p.box(3.2,.25,1.8,shade(col,.85),{x:sd*1.8,y:.6,rz:sd*.5});}
function orb(p,col,r=1.4){p.sph(r,col,{e:2.4,ws:12,hs:9});p.torus(r*1.5,.12,col,{rx:1.2,e:1.6});}
function crew(p,st,x,z,ry=0){p.pushT(x,0,z,0,ry,0,.6);fig(p,st,{armor:'leather',rp:'rest',lp:'rest',noFlair:true});p.pop();}
const BIGWING=(p,col)=>{for(const sd of[-1,1])for(let i=0;i<6;i++){p.cone(.9,8-i*.6,col,{x:sd*(3+i*.9),y:22-i*.6,z:-3.4,rz:sd*(1.0+i*.13),sz:.25,seg:4,e:.6});}};

const KITS={};
const kit=(names,fn)=>names.split(',').forEach(n=>KITS[n]=fn);
const staffTop=st=>({aldermark:'orb',valedawn:'sun',sylvanor:'crystal',thornwild:'antler',khazrum:'crystal',ironveil:'gear',grommash:'skull',skarr:'skull',nekhara:'skull',nocthyr:'moon'}[st.key]||'orb');
const glowCol=st=>({aldermark:0x7ac8ff,valedawn:0xffd56a,sylvanor:0x7affc0,thornwild:0x9aff5a,khazrum:0xffb040,ironveil:0x6af0ff,grommash:0xff5a2a,skarr:0xff8a3a,nekhara:0xb46aff,nocthyr:0x9a7aff}[st.key]||0x8ad8ff);
const relTop=st=>({aldermark:'cross',valedawn:'sun',sylvanor:'crystal',thornwild:'antler',khazrum:'crystal',ironveil:'gear',grommash:'skull',skarr:'skull',nekhara:'skull',nocthyr:'moon'}[st.key]||'cross');

// ---- civilians
kit('settler',(p,st,I)=>{const f=fig(p,st,{armor:'cloth',rp:'carry',lp:'carry',helm:st.race==='human'?'hat':st.race==='undead'?'hood':null,cloth:mix(st.cloth,0x8a7a5a,.45),noFlair:true});backpack(p,st,f);
  // two-wheeled handcart with the settlement's belongings
  p.pushT(10,0,-3,0,-.5,0);UP.wheel(p,0,2.6,3.2,2.6,st.wood,st.metal2);UP.wheel(p,0,2.6,-3.2,2.6,st.wood,st.metal2);p.box(9,2.4,6,st.wood,{x:-1,y:4.6,...MT.wood});
  p.ico(2.2,0xc8b890,{x:-2,y:7,d:1,sy:.8});p.ico(1.8,0xb8a070,{x:1.4,y:6.8,z:1.2,d:1});p.limb([-5.5,4.6,1.6],[-9,2,1.6],.3,.3,st.wood,{seg:4});p.limb([-5.5,4.6,-1.6],[-9,2,-1.6],.3,.3,st.wood,{seg:4});
  if(st.race==='elf')p.ico(2.4,0x3f8a3a,{x:2,y:10.4,d:1,noise:.8});if(st.race==='undead'){p.box(3,2,7,0x2a2228,{x:-.5,y:7.4});p.sph(.8,glowCol(st),{x:2.8,y:9.8,e:2.6});}
  if(st.race==='orc'){p.sph(1.3,0xe6dcc0,{x:2.6,y:7.6});}if(st.race==='dwarf')p.box(.5,5,.5,0x6a6a6a,{x:-1,y:8,rz:.6,...MT.metal});
  p.pushT(-3,4,0);UP.banner(p,st,{h:12,w:4,fh:4});p.pop();p.pop();I.baseR=13;});
kit('worker',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'carry',lp:'rest',helm:st.race==='human'||st.race==='elf'?'hat':st.race==='dwarf'?'cap':st.race==='undead'?'hood':null,cloth:mix(st.cloth,0x7a6a4a,.5),noFlair:true,tabard:false});
  if(!f.blender)p.box(4.6*f.W,7,.4,0x8a6a42,{y:f.hipY+2,z:2.6*f.W,...MT.leather});
  // on a Blender body the shaft goes through the palm and leans out and forward, the way the hanging hand is angled
  at(p,f.R,f.blender?[.2,0,.2]:[-2.3,0,.3],()=>{if(f.blender)p.pushT(0,0,0,0,PI/2,0);p.cyl(.4,.45,14,st.wood,{y:3,seg:6,...MT.wood});p.ext([[0,-.6],[5,-1.6],[5.6,-.8],[0,.6],[-5.6,-.8],[-5,-1.6]],.7,0x8a8a90,{y:10,...MT.metal});if(f.blender)p.pop();});
  at(p,f.L,[0,0,0],()=>{p.cyl(2.2,1.6,2.4,0x9a7a4a,{y:-1.4,seg:9,...MT.wood});p.ico(1,0x8a8278,{y:.2,x:.6,flat:true});p.ico(.9,0x8a8278,{y:.1,x:-.7,flat:true});});
  p.pushT(-9,0,4,0,.6,0);UP.wheel(p,6,2,0,2,st.wood,st.metal2);p.box(6,2.4,4.6,st.wood,{x:1.4,y:3.6,...MT.wood});p.ico(1.8,0x8a8278,{x:1.4,y:5,flat:true,d:1});p.limb([-1.6,3.4,1.6],[-5,4.6,1.6],.3,.3,st.wood,{seg:4});p.limb([-1.6,3.4,-1.6],[-5,4.6,-1.6],.3,.3,st.wood,{seg:4});p.pop();
  I.baseR=12.5;});
kit('missionary',(p,st,I)=>{const f=fig(p,st,{armor:'robe',rp:'staffR',lp:'book',cloth:mix(st.cloth,0xf2ead6,.55),helm:st.key==='nocthyr'?'hood':st.key==='nekhara'?'nemes':null,noFlair:true});
  at(p,f.R,null,()=>UP.staff(p,st,{top:relTop(st),glow:glowCol(st),len:25}));
  at(p,f.L,[.9,0,0],()=>{p.box(3.4,.8,2.6,0x5a2a1a,{...MT.leather});p.box(3.2,.5,2.4,0xf6f0dc,{y:.6});p.sph(.6,glowCol(st),{y:1.6,e:2.2});});
  p.sph(.8,glowCol(st),{x:3.4,y:9,z:3,e:2});p.limb([3.4,9.8,3],[f.L[0],f.L[1]-1,f.L[2]],.06,.06,st.trim,{seg:3,caps:false});});
const gpBase=(p,st)=>{p.torus(13.5,.35,st.trim,{y:2.7,rx:PI/2,...MT.gold,e:.4});};
kit('great_scientist',(p,st,I)=>{const f=fig(p,st,{armor:'robe',rp:'cast',lp:'book',cloth:shade(st.cloth2,1.2),helm:st.race==='human'?'wizard':st.key==='nocthyr'?'hood':st.race==='undead'?'nemes':null,col:0x3a3a6a,noFlair:true});
  at(p,f.R,null,()=>{p.sph(1.5,0x7ad8ff,{y:2.4,e:2.4});p.torus(2.6,.14,st.trim,{y:2.4,rx:.6,...MT.gold});p.torus(3.2,.14,st.trim,{y:2.4,ry:1.2,rx:1.4,...MT.gold});p.sph(.4,0xffe08a,{x:3.2,y:2.6,e:2});});
  at(p,f.L,[.9,0,0],()=>{p.box(4,.9,3,0x3a2a5a,{...MT.leather});p.box(3.8,.5,2.8,0xf6f0dc,{y:.6});});
  for(const sd of[-1,1])p.torus(.55,.12,0xd8c060,{x:sd*.9,y:f.hy+.3,z:f.hr*.95,...MT.gold});
  p.box(2.4,3.4,2.4,0x5a3a22,{x:-6,y:1.7,z:-3,...MT.wood});p.box(2.2,.6,2.2,0x3a5aa8,{x:-6,y:3.7,z:-3});gpBase(p,st);});
kit('great_engineer',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'weapon',lp:'book',helm:st.race==='dwarf'?'cap':null,cloth:mix(st.cloth,0x6a5a3a,.4),tabard:false,noFlair:true});
  p.box(4.8*f.W,9,.4,0x6a4a2a,{y:f.hipY+3,z:2.7*f.W,...MT.leather});
  at(p,f.R,[.3,0,-.2],()=>{p.cyl(.45,.5,12,0x8a8a90,{y:4,seg:6,...MT.metal});p.ext([[-1.6,0],[-1.6,2.2],[-.6,3],[.6,3],[1.6,2.2],[1.6,0],[.8,0],[.8,1.6],[-.8,1.6],[-.8,0]],.8,0x9a9aa0,{y:10,...MT.metal});});
  at(p,f.L,null,()=>{p.cyl(.7,.7,6,0xe8e0c8,{rz:PI/2,seg:8});p.cyl(.75,.75,.4,0x3a5aa8,{x:2.6,rz:PI/2,seg:8});});
  p.pushT(0,f.shY-1,-4.4*f.W);UP.emblem(p,{...st,trim:0xb07a3a},'gear',2.2,0xb07a3a);p.pop();
  for(const sd of[-1,1])p.cyl(.6,.6,.7,0x2a2a2a,{x:sd*.9,y:f.hy+f.hr*.75,z:f.hr*.6,rx:PI/2-.4,seg:8,...MT.metal});
  p.box(5,3,3.6,0x7a5a32,{x:-7,y:1.5,z:-2,...MT.wood});UP.wheel(p,-7,4,-2,1.6,0xb07a3a,0x6a6a6a);gpBase(p,st);});
kit('great_merchant',(p,st,I)=>{const f=fig(p,st,{armor:'robe',rp:'weapon',lp:'book',cloth:st.key==='nocthyr'?0x3a2a6a:mix(st.cloth2,0x8a2a6a,.4),helm:st.race==='human'||st.race==='orc'?'turban':st.race==='dwarf'?'cap':st.key==='nocthyr'?'hood':null,noFlair:true});
  at(p,f.R,null,()=>{p.sph(1.5,0x8a6a3a,{y:-1,...MT.leather});p.cyl(.25,.25,.8,st.trim,{y:.5,...MT.gold});});
  at(p,f.L,[.9,0,0],()=>{p.box(.3,3,.3,st.trim,{y:1.6,...MT.gold});p.box(4.6,.25,.25,st.trim,{y:3,...MT.gold});for(const sd of[-1,1]){p.cyl(1,1,.25,st.trim,{x:sd*2.2,y:1.4,seg:10,...MT.gold});p.limb([sd*2.2,3,0],[sd*2.2,1.5,0],.05,.05,st.trim,{seg:3,caps:false});}});
  p.box(5.6,3.6,4,0x6a3a1a,{x:-6.4,y:1.8,z:2,...MT.wood});p.box(5.8,.5,4.2,st.trim,{x:-6.4,y:3.4,z:2,...MT.gold});for(let i=0;i<9;i++)p.cyl(.7,.7,.3,0xffd24a,{x:-8.4+(i%3)*1.6,y:3.9+Math.floor(i/3)*.3,z:1+Math.floor(i/3)*.8,seg:10,...MT.gold,e:.15});
  p.box(4,3,3,0xa07a4a,{x:6.5,y:1.5,z:-3,...MT.wood});p.ico(1.8,0xc84a3a,{x:6.5,y:4,z:-3,d:1});gpBase(p,st);});
kit('great_general',(p,st,I)=>{const f=fig(p,st,{armor:'plate',rp:'bannerR',lp:'hip',cape:true,helm:helmFor(st,'plate'),plume:st.plume});
  at(p,f.R,null,()=>{p.pushT(0,-9,0);UP.banner(p,st,{h:30,w:8,fh:10});p.pop();});
  p.pushT(f.L[0]+.5,f.hipY+.5,1.5,0,0,.35);UP.sword(p,st,{len:9});p.pop();gpBase(p,st);});
kit('great_prophet',(p,st,I)=>{const f=fig(p,st,{armor:'robe',rp:'staffR',lp:'cast',cloth:mix(st.cloth,0xfaf6ea,.7),helm:st.key==='nocthyr'?'hood':st.key==='nekhara'?'nemes':null,noFlair:true});
  at(p,f.R,null,()=>UP.staff(p,st,{top:relTop(st)==='cross'?'sun':relTop(st),glow:glowCol(st),len:28}));at(p,f.L,null,()=>orb(p,glowCol(st),1.1));
  UP.helm(p,st,'halo',f.hy,f.hr);p.torus(10,.25,glowCol(st),{y:3,rx:PI/2,e:2});gpBase(p,st);});

// ---- infantry
kit('scout',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'spearR',lp:'shield',helm:st.race==='dwarf'?'cap':st.race==='orc'?null:'hood',hoodCol:st.cloth2,cape:mix(st.cloth2,0x4a5a2a,.4),tabard:false});
  at(p,f.R,null,()=>{p.cyl(.35,.4,24,st.wood,{y:5,seg:6,...MT.wood});p.cone(.35,1.6,0x8a8a90,{y:17.6,seg:4,...MT.metal});});
  if(st.race==='orc'){p.pushT(8,0,4,0,-.7,0,.45);UP.quad(p,st,st.key==='skarr'?'darkwarg':'warg',{noSaddle:true});p.pop();}
  else if(st.race==='undead'){at(p,[f.L[0],f.L[1]+1,f.L[2]],null,()=>hawk(p,st,0x1a1a20));}
  else at(p,[f.L[0],f.L[1]+1,f.L[2]],null,()=>hawk(p,st,st.race==='elf'?0xe8e0d0:0x8a6a4a));
  p.pushT(-1.6*f.W,f.shY-3,-3.2*f.W,0,0,.6);UP.bow(p,st,{r:5.5,arc:1.9});p.pop();p.cyl(.7,.7,4,0xc8a050,{x:2.6,y:f.hipY+1,z:2,rx:.3,rz:.5,seg:8,...MT.gold});});
kit('warrior',(p,st,I)=>{const f=fig(p,st,{armor:st.race==='dwarf'?'chain':'leather',rp:'weapon',lp:'shield',helm:st.race==='human'&&st.key==='aldermark'?'kettle':undefined});
  at(p,f.R,[.25,0,0],()=>{if(st.race==='orc'||st.race==='dwarf')UP.axe(p,st,{len:10});else UP.sword(p,st,{len:8.5});});at(p,f.L,[0,-.35,0],()=>UP.shield(p,st,{type:st.race==='human'?'runeround':undefined,s:.9}));});
kit('archer',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'draw',lp:'bowArm',helm:st.race==='elf'?(st.key==='thornwild'?'antlerhood':'hood'):st.race==='human'?'hood':undefined,hoodCol:st.cloth2,tabard:st.race!=='elf'});
  at(p,f.L,[0,0,.12],()=>UP.bow(p,st,{r:st.race==='dwarf'?6:st.race==='elf'?9.5:8.5,arc:st.race==='elf'?2.3:2.1}));
  p.limb([f.L[0],f.L[1],f.L[2]],[f.R[0],f.R[1],f.R[2]],.12,.12,0xd8c8a0,{seg:3,caps:false});quiver(p,st,f);});
kit('skirmisher',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'hip',lp:'bowArm',helm:st.race==='undead'?(st.key==='nocthyr'?'hood':null):'cap',col:st.cloth,lean:.12,tabard:false,cloth:mix(st.cloth,0x8a6a42,.25)});
  at(p,f.L,[0,0,.2],()=>UP.bow(p,st,{r:5.5,arc:2}));
  p.pushT(-1.2*f.W,f.shY-3.5,-3.2*f.W,.15,0,-.3);for(let i=0;i<3;i++){p.cyl(.22,.22,14,st.wood,{x:(i-1)*.6,y:3,seg:5,...MT.wood});p.cone(.45,1.6,0x9a9aa0,{x:(i-1)*.6,y:10.8,seg:4,...MT.metal});}p.pop();
  p.box(5,1.2,.3,st.cloth,{y:f.hy+.4,z:-f.hr*.9,...MT.cloth});quiver(p,st,f,-1);});
kit('spear',(p,st,I)=>{const f=fig(p,st,{armor:'chain',rp:'spearR',lp:'shield'});at(p,f.R,null,()=>UP.spear(p,st,{len:36,pennant:st.race==='elf'||st.race==='human'?st.cloth:null}));at(p,f.L,[0,-.3,0],()=>UP.shield(p,st,{s:1}));});
kit('sword',(p,st,I)=>{const f=fig(p,st,{armor:'chain',rp:'raised',lp:'shield',pauldrons:true});at(p,f.R,[-.3,0,.2],()=>UP.sword(p,st,{len:11,mithril:true,glow:.35}));at(p,f.L,[0,-.3,0],()=>UP.shield(p,st,{s:1.05}));});
kit('heavy_infantry',(p,st,I)=>{const f=fig(p,st,{armor:'heavy',bulk:1.1,rp:'weapon',lp:'shield',helm:st.race==='human'&&st.key==='aldermark'?'great':undefined,crest:true});
  at(p,f.R,[.5,0,0],()=>UP.spear(p,st,{len:20,style:st.race==='undead'?'bonespear':st.race==='orc'?'crude':undefined}));
  at(p,f.L,[0,-.2,0],()=>UP.shield(p,st,{type:st.race==='dwarf'&&st.key==='khazrum'?'irontower':'tower',s:1.12}));I.baseR=12;});
kit('longs',(p,st,I)=>{const f=fig(p,st,{armor:'plate',rp:'twoR',lp:'twoL',cape:true,pauldrons:true});at(p,f.R,[.35,0,.45],()=>{if(st.race==='dwarf')UP.axe(p,st,{len:15,heavy:true,double:true});else if(st.race==='orc')UP.axe(p,st,{len:16,heavy:true});else UP.sword(p,st,{len:16,style:st.race==='undead'&&st.key==='nekhara'?'khopesh':undefined});});I.baseR=12;});
kit('xbow',(p,st,I)=>{const f=fig(p,st,{armor:'chain',rp:'xbowR',lp:'xbowL',helm:st.key==='aldermark'?'kettle':undefined});at(p,f.R,[0,0,0],()=>UP.crossbow(p,st));
  p.pushT(0,f.shY-4,-3.6*f.W,.15,0,0);p.box(6.4,10,.8,st.cloth,{...MT.cloth});p.box(6.8,.6,1,st.trim,{y:4.8,...MT.gold});UP.emblem(p,st,null,.9,st.trim);p.pop();quiver(p,st,f,-1);});
kit('mage',(p,st,I)=>{const f=fig(p,st,{armor:'robe',rp:'staffR',lp:'cast',helm:st.race==='human'?'wizard':st.race==='elf'?(st.key==='thornwild'?'antlerhood':'hood'):st.race==='dwarf'?'hood':st.race==='orc'?null:st.key==='nekhara'?'nemes':'hood',cape:st.cloth2});
  at(p,f.R,null,()=>UP.staff(p,st,{top:staffTop(st),glow:glowCol(st)}));at(p,f.L,null,()=>orb(p,glowCol(st)));
  if(st.race==='orc')for(let i=0;i<5;i++)p.sph(.45,0xe6dcc0,{x:Math.sin(-1+i*.5)*2.4,y:f.shY-.8,z:2.4});});
kit('battle_priest',(p,st,I)=>{const f=fig(p,st,{armor:'plate',rp:'raised',lp:'book',cape:mix(st.cloth,0xf2ead6,.4)});
  at(p,f.R,[-.2,0,0],()=>UP.hammer(p,st,{len:9}));at(p,f.L,[.9,0,0],()=>{p.box(3.6,.9,2.8,0x6a2a1a,{...MT.leather});p.box(3.4,.5,2.6,0xf6f0dc,{y:.6});p.sph(.7,glowCol(st),{y:1.6,e:2.4});});
  p.pushT(0,f.shY+2,-3.6*f.W);UP.emblem(p,st,st.flair==='sun'?'sun':st.emblem,1.6,0xffe08a);p.pop();p.torus(9.5,.22,glowCol(st),{y:3,rx:PI/2,e:1.4});});

// ---- mounted (face +x)
function mounted(p,st,I,mountKind,rider,mo={}){
  I.face='x';I.baseR=mo.baseR||15;
  const sd=UP.quad(p,st,mountKind,mo);
  p.pushT(sd.x+(mo.dx||0),sd.y,0,0,PI/2,0);rider();p.pop();
}
kit('rider',(p,st,I)=>mounted(p,st,I,st.mount,()=>{const f=fig(p,st,{ride:true,armor:'leather',rp:'raised',lp:'reins',cape:true});at(p,f.R,[-.2,0,.25],()=>{if(st.race==='orc'||st.race==='dwarf')UP.axe(p,st,{len:10});else UP.sword(p,st,{len:9});});}));
kit('knight',(p,st,I)=>mounted(p,st,I,st.mount,()=>{const f=fig(p,st,{ride:true,armor:'plate',rp:'lance',lp:'shield',cape:true,pauldrons:true});at(p,f.R,[1.32,0,0],()=>UP.spear(p,st,{len:38,style:st.race==='undead'?'bonespear':'pike',pennant:st.cloth}));at(p,f.L,[0,-.3,0],()=>UP.shield(p,st,{s:.9}));},{barding:st.cloth,chanfron:true}));
kit('war_beast',(p,st,I)=>mounted(p,st,I,st.beast,()=>{const f=fig(p,st,{ride:true,armor:'leather',rp:'raised',lp:'reins',mantle:st.race==='human'?null:0x6a5a4a});at(p,f.R,[-.2,0,.2],()=>UP.axe(p,st,{len:11}));},{baseR:15}));
kit('sunlancer',(p,st,I)=>mounted(p,st,I,'horse',()=>{const f=fig(p,st,{ride:true,armor:'plate',rp:'lance',lp:'shield',cape:0xf2ead6,helm:'sunhelm',pauldrons:true});at(p,f.R,[1.32,0,0],()=>UP.spear(p,st,{len:38,style:'sunspear',pennant:0xffd25a}));at(p,f.L,[0,-.3,0],()=>UP.shield(p,st,{type:'sunround',s:.95,emblem:'sun'}));},{col:0xf4f0e6,mane:0xe8d090,barding:0xf2ead6,chanfron:true}));
kit('boar_raider',(p,st,I)=>mounted(p,st,I,'boar',()=>{const f=fig(p,st,{ride:true,armor:'leather',rp:'raised',lp:'shield',helm:'boarskull'});at(p,f.R,[-.2,0,.2],()=>UP.axe(p,st,{len:11,heavy:true}));at(p,f.L,[0,-.3,0],()=>UP.shield(p,st,{type:'hide',s:.9}));},{baseR:15}));
kit('beast_rider',(p,st,I)=>mounted(p,st,I,'stag',()=>{const f=fig(p,st,{ride:true,armor:'leather',rp:'lance',lp:'reins',helm:'antlerhood'});at(p,f.R,[1.25,0,0],()=>UP.spear(p,st,{len:30,style:'thornspear'}));},{col:0x6a4a2a,baseR:15}));

// ---- siege & naval
kit('treb',(p,st,I)=>{I.face='x';I.baseR=17;p.pushT(0,0,0,0,0,0,.92);UP.trebuchet(p,st);p.pop();crew(p,st,8,7,-.8);});
kit('bombard',(p,st,I)=>{I.face='x';I.baseR=15;UP.bombard(p,st);crew(p,st,-6,-6,-1.2);});
kit('runic_bombard',(p,st,I)=>{I.face='x';I.baseR=16;UP.bombard(p,st,{runic:true});crew(p,st,-7,-6,-1.2);});
kit('galley',(p,st,I)=>{I.face='x';I.naval=true;I.baseR=19;UP.ship(p,st,{war:false});});
kit('warship',(p,st,I)=>{I.face='x';I.naval=true;I.baseR=22;p.pushT(0,0,0,0,0,0,.92);UP.ship(p,st,{war:true});p.pop();});

// ---- dragons
const DRAGON={aldermark:[0x34589a,0xd9c27a,0x24406e],valedawn:[0xd9a63a,0xfaf0d0,0xb07a2a],sylvanor:[0x2e7a4a,0xd8ead0,0x1e5a3a],thornwild:[0x5a6a2a,0xb89a5a,0x3a4a1a],khazrum:[0xa84a1a,0xe8b05a,0x7a2a10],ironveil:[0x3a3e44,0xb07a3a,0x24272c],grommash:[0x8a1a1a,0x2a2a2a,0x5a0a0a],skarr:[0x5a2a1a,0xd89a5a,0x3a1a10],nekhara:[0xe6dcc0,0xe6dcc0,0x5a3a8a],nocthyr:[0x2a2850,0xd56bdc,0x15142e],barbarian:[0xa8301a,0xe8a050,0x6a1a10]};
function dragonKit(p,st,I,rider,o={}){I.face='x';I.baseR=18;I.flying=true;
  p.cyl(.8,1,8,0x5a4a3a,{y:4,seg:8,...MT.wood});
  const c=DRAGON[st.key]||DRAGON.barbarian;
  p.pushT(0,7,0);const sd=UP.dragon(p,st,{col:c[0],belly:c[1],wing:c[2],bone:st.key==='nekhara',membrane:true,eye:st.key==='nocthyr'?0xd56bdc:st.key==='nekhara'?0xb46aff:0xffd040,fire:o.fire,s:o.s||1});
  if(st.key==='ironveil'){p.box(10,1,7,st.metal,{y:17,...MT.metal});}
  if(rider){p.pushT(sd.x,sd.y,0,0,PI/2,0,.9);rider();p.pop();}
  p.pop();}
kit('dragon',(p,st,I)=>dragonKit(p,st,I,()=>{const f=fig(p,st,{ride:true,armor:'plate',rp:'lance',lp:'reins',cape:true});at(p,f.R,[1.2,0,0],()=>UP.spear(p,st,{len:30,pennant:st.cloth}));}));
kit('wyrm',(p,st,I)=>dragonKit(p,{...st,key:'barbarian'},I,null,{fire:true,s:1.05}));

// ---- monsters (barbarian / wild)
const MON={goblin:{...{}},};
kit('goblin',(p,st0,I)=>{const st={...st0,race:'orc',skin:0x7aa83a,hair:0x2a1a10,cloth:0x6a4a2a,cloth2:0x3a2a1a,metal:0x6a6a6a,key:'goblin'};
  p.pushT(0,0,0,0,0,0,.78);const f=UP.figure(p,st,{armor:'leather',rp:'weapon',lp:'shield',head:1.25,tabard:false,lean:.2});
  for(const sd of[-1,1])p.cone(.9,4.6,st.skin,{x:sd*f.hr*1.25,y:f.hy+.6,rz:-sd*1.35,sz:.4,seg:5});
  at(p,f.R,[.4,0,0],()=>{p.cyl(.3,.3,2,0x4a3020,{seg:5});p.ext([[-.4,0],[.4,0],[.2,6],[0,6.6],[-.6,5]],.3,0x8a8a8a,{y:1,...MT.metal});});
  at(p,f.L,null,()=>{p.cyl(2.6,2.6,.6,0x6a4a2a,{rx:PI/2,seg:8,jit:.3});p.sph(.6,0xe6dcc0,{z:.5});});p.pop();I.baseR=10;});
kit('ogre',(p,st0,I)=>{const st={...st0,race:'orc',skin:0xb89a7a,skin2:0x8a6a52,hair:0x3a2a1a,cloth:0x6a4a30,cloth2:0x4a3220,leather:0x4a3220,key:'ogre',eye:0xffd030};
  p.pushT(0,0,0,0,0,0,1.25);const f=UP.figure(p,st,{armor:'bare',bulk:1.45,w:1.1,rp:'raised',lp:'rest',head:.9,tabard:false,lean:.1});
  p.sph(5.4,st.skin,{y:f.hipY+4,z:1.6,sx:1,sy:.9,sz:.9,...MT.skin});
  at(p,f.R,[-.4,0,.2],()=>{p.limb([0,-2,0],[0,14,0],.9,2.2,0x5a3a22,{seg:7,...MT.wood});for(let i=0;i<6;i++)p.cone(.4,1.4,0xa0a0a0,{x:Math.cos(i)*2,y:9+i*.9,z:Math.sin(i)*2,rz:-Math.cos(i)*1.4,rx:Math.sin(i)*1.4,seg:4,...MT.metal});});p.pop();I.baseR=14;});
kit('troll',(p,st0,I)=>{const st={...st0,race:'orc',skin:0x6a8a7a,skin2:0x4a6a5a,hair:0x2a3a22,cloth:0x4a5a3a,cloth2:0x3a4a2a,leather:0x3a3a2a,key:'troll',eye:0xffe060};
  p.pushT(0,0,0,0,0,0,1.3);const f=UP.figure(p,st,{armor:'bare',bulk:1.1,w:.95,rp:'low',lp:'rest',head:.95,tabard:false,lean:.32,th:1.15});
  for(let i=0;i<6;i++)p.ico(1.2,0x4a6a2a,{x:Math.cos(i*1.1)*2.6,y:f.shY+.4+Math.sin(i)*.6,z:-1.4+Math.sin(i*1.1)*1.2,d:1,noise:.5});
  at(p,f.R,null,()=>{p.ico(3.2,0x7a7a74,{y:-2,d:1,noise:1.2,flat:true});});p.cone(.8,2,0xe8dcc0,{y:f.hy+1,x:-1.2,rz:.6,seg:4});p.cone(.8,2,0xe8dcc0,{y:f.hy+1,x:1.2,rz:-.6,seg:4});p.pop();I.baseR=14;});

// ---- unique units
kit('royal_guard',(p,st,I)=>{const f=fig(p,st,{armor:'heavy',bulk:1.05,rp:'spearR',lp:'shield',cape:true,helm:'great',plume:0xffffff,metal:mix(st.metal,0xe8d090,.25),pauldrons:true});
  UP.emblem(p,st,'lion',1.1,0xffd25a);at(p,f.R,null,()=>UP.spear(p,st,{len:36,style:'halberd'}));at(p,f.L,[0,-.3,0],()=>UP.shield(p,st,{type:'heater',s:1.1,emblem:'lion'}));
  p.pushT(0,f.top+2.6,0);UP.emblem(p,st,'lion',.9,0xffd25a);p.pop();I.baseR=12;});
kit('moonbow',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'draw',lp:'bowArm',helm:'hood',hoodCol:0x1e5a3a,cape:0x1e5a3a,pauldrons:true,pauldronC:st.metal});
  at(p,f.L,[0,0,.1],()=>UP.bow(p,st,{r:10.5,arc:2.3,style:'moon'}));p.limb(f.L,f.R,.12,.12,0xd8e8ff,{seg:3,caps:false,e:1.4});quiver(p,st,f);});
kit('hammerguard',(p,st,I)=>{const f=fig(p,st,{armor:'heavy',bulk:1.08,rp:'twoR',lp:'twoL',cape:true,pauldrons:true});at(p,f.R,[.35,0,.35],()=>UP.hammer(p,st,{len:15,big:true}));I.baseR=12;});
kit('orc_berserker',(p,st,I)=>{const f=fig(p,st,{armor:'bare',bulk:1.12,rp:'low',lp:'low',helm:null,paint:0xc81c1c,tabard:false});
  at(p,f.R,[.45,0,-.3],()=>UP.axe(p,st,{len:11}));at(p,f.L,[.45,0,.3],()=>UP.axe(p,st,{len:11}));p.ico(3.6,0x5a5550,{y:f.shY+.6,z:-1,d:1,noise:.9,sy:.5,sx:1.3});});
kit('grave_lancer',(p,st,I)=>{const f=fig(p,st,{armor:'chain',rp:'spearR',lp:'shield'});at(p,f.R,null,()=>UP.spear(p,st,{len:38,style:'bonespear',pennant:st.cloth}));at(p,f.L,[0,-.3,0],()=>UP.shield(p,st,{type:'boneround'}));});
kit('thorn_stalker',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'xbowR',lp:'xbowL',helm:'antlerhood',mantle:0x4a6a24});at(p,f.R,null,()=>UP.crossbow(p,st));for(let i=0;i<10;i++)p.ico(1.3,i%2?0x4a7a2a:0x6a8a3a,{x:Math.cos(i*.7)*3.4,y:f.hipY+2+i*.9,z:-2.6+Math.sin(i)*1.2,d:1,sy:.6});quiver(p,st,f,-1);});
kit('siegebreaker_guard',(p,st,I)=>{const f=fig(p,st,{armor:'heavy',bulk:1.12,rp:'twoR',lp:'twoL',pauldrons:true});at(p,f.R,[.35,0,.4],()=>{UP.hammer(p,st,{len:16,big:true});p.cyl(.5,.5,6,0xb07a3a,{y:13,x:2.5,rz:PI/2,seg:6,...MT.gold});});p.sph(1.2,0xd8dde2,{x:-2,y:f.top+2,z:-3,e:.3});p.sph(1.5,0xd8dde2,{x:-2.6,y:f.top+4,z:-3.6,e:.3});I.baseR=12;});
kit('nightbinder',(p,st,I)=>{const f=fig(p,st,{armor:'robe',rp:'staffR',lp:'cast',helm:'hood',cape:st.cloth2});at(p,f.R,null,()=>UP.staff(p,st,{top:'moon',glow:0xd56bdc}));
  at(p,f.L,null,()=>{p.sph(1.5,0x120a20,{e:.2});p.torus(2.2,.2,0xd56bdc,{rx:1.1,e:2.4});p.torus(2.6,.15,0x6af0ff,{ry:1.2,rx:.3,e:2});});
  for(let i=0;i<10;i++){const a=i/10*6.283;p.torus(.6,.18,0x8a8aa8,{x:Math.cos(a)*6,y:6+Math.sin(a*2)*2,z:Math.sin(a)*6,rx:a,ry:i%2?PI/2:0,...MT.metal});}});
kit('dawn_priest',(p,st,I)=>{const f=fig(p,st,{armor:'robe',rp:'staffR',lp:'book',cloth:0xf6f0e0,helm:null,longHair:true,noFlair:true});at(p,f.R,null,()=>UP.staff(p,st,{top:'sun',glow:0xffd56a}));
  at(p,f.L,[.4,0,0],()=>{p.limb([0,0,0],[0,-4,1],.06,.06,st.trim,{seg:3,caps:false});p.sph(1,st.trim,{y:-4.6,z:1,...MT.gold});p.sph(.6,0xffb46a,{y:-4.2,z:1.4,e:2.6});});
  UP.helm(p,st,'halo',f.hy,f.hr);p.torus(9.5,.22,0xffd56a,{y:3,rx:PI/2,e:1.6});});
kit('blood_reaver',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'twoR',lp:'twoL',helm:null,cape:0x8a1418,bulk:1.05});at(p,f.R,[.4,0,.4],()=>UP.spear(p,st,{len:26,style:'scythe'}));
  p.box(4.4,1.4,.6,0xe8dcc0,{y:f.hy+.3,z:f.hr*.85});for(let i=0;i<8;i++){const a=i/8*6.283;p.torus(.55,.16,0x6a6a6a,{x:Math.cos(a)*3.3*f.W,y:f.hipY+1.2,z:Math.sin(a)*2.6,ry:a,...MT.metal});}});
kit('shadeblade',(p,st,I)=>{const f=fig(p,st,{armor:'leather',rp:'low',lp:'low',helm:'hood',cape:st.cloth2,lean:.1});at(p,f.R,[.5,0,-.2],()=>UP.sword(p,st,{len:9,style:'curved'}));at(p,f.L,[.5,0,.2],()=>UP.sword(p,st,{len:9,style:'curved'}));p.box(2.8,.9,.4,0x12122a,{y:f.hy-.6,z:f.hr*.95});});

// ---- faction heroes (larger, caped, signature weapons)
const heroBase=(p,st,I)=>{I.hero=true;I.baseR=14;p.torus(14.2,.5,0xffd56a,{y:2.6,rx:PI/2,...MT.gold,e:.9});};
kit('hero_aldermark',(p,st,I)=>{p.pushT(0,0,0,0,0,0,1.18);const f=fig(p,st,{armor:'heavy',bulk:1.06,rp:'twoR',lp:'twoL',cape:0x1c3f8a,helm:'great',crest:false,metal:mix(st.metal,0xffe8a0,.35),pauldrons:true});
  at(p,f.R,[.35,0,.45],()=>UP.sword(p,st,{len:18,glow:.3}));p.pushT(0,f.top+1.8,0);UP.emblem(p,st,'lion',1.3,0xffd25a);p.pop();p.sph(1.6,0xffffff,{y:f.top+4.4,z:-1.6,sy:2,sz:.6});p.pop();heroBase(p,st,I);});
kit('hero_valedawn',(p,st,I)=>{p.pushT(0,0,0,0,0,0,1.18);const f=fig(p,st,{armor:'heavy',bulk:1.04,rp:'spearR',lp:'shield',cape:0xf6f0e0,helm:'sunhelm',pauldrons:true});
  at(p,f.R,null,()=>UP.spear(p,st,{len:36,style:'sunspear',pennant:0xffd25a}));at(p,f.L,[0,-.3,0],()=>UP.shield(p,st,{type:'sunround',emblem:'sun',s:1.1}));UP.helm(p,st,'halo',f.hy,f.hr);BIGWING(p,0xfff6dc);p.pop();heroBase(p,st,I);});
kit('hero_sylvanor',(p,st,I)=>{p.pushT(0,0,0,0,0,0,1.18);const f=fig(p,st,{armor:'leather',rp:'draw',lp:'bowArm',cape:0x1e5a3a,helm:null,longHair:true,pauldrons:true,w:.92});
  at(p,f.L,[0,0,.1],()=>UP.bow(p,st,{r:11,arc:2.4,style:'moon'}));p.limb(f.L,f.R,.13,.13,0xd8e8ff,{seg:3,caps:false,e:1.6});UP.helm(p,st,'crown',f.hy,f.hr);quiver(p,st,f);p.pop();heroBase(p,st,I);});
kit('hero_thornwild',(p,st,I)=>{p.pushT(0,0,0,0,0,0,1.18);const f=fig(p,st,{armor:'leather',rp:'draw',lp:'bowArm',helm:'antlerhood',mantle:0x6a5a3a,cape:0x3e4a1e});
  at(p,f.L,[0,0,.1],()=>UP.bow(p,st,{r:10.5,arc:2.3,style:'thorn'}));p.sph(1,0x9aff5a,{x:f.L[0],y:f.L[1]+3,z:f.L[2],e:2.4});p.limb(f.L,f.R,.12,.12,0x9aff5a,{seg:3,caps:false,e:1.2});quiver(p,st,f);
  p.pushT(-9,0,5,0,.8,0,.5);UP.quad(p,st,'direwolf',{noSaddle:true});p.pop();p.pop();heroBase(p,st,I);});
kit('hero_khazrum',(p,st,I)=>{p.pushT(0,0,0,0,0,0,1.18);const f=fig(p,st,{armor:'heavy',bulk:1.12,rp:'raised',lp:'shield',cape:0x7a2a12,pauldrons:true,metal:mix(st.metal,0xe8c070,.3)});
  at(p,f.R,[-.3,0,.2],()=>UP.hammer(p,st,{len:12,big:true}));at(p,f.L,[0,-.4,0],()=>{UP.shield(p,st,{type:'irontower',s:1.3,emblem:'anvil'});p.box(.5,9,.4,0xffb040,{z:.7,e:1.8});});p.pop();heroBase(p,st,I);});
kit('hero_ironveil',(p,st,I)=>{p.pushT(0,0,0,0,0,0,1.18);const f=fig(p,st,{armor:'heavy',bulk:1.14,rp:'twoR',lp:'twoL',pauldrons:true});
  at(p,f.R,[.35,0,.4],()=>{UP.hammer(p,st,{len:16,big:true});p.cyl(1,1,3,0xb07a3a,{y:13,x:-3.4,rz:PI/2,seg:8,...MT.gold});});
  p.box(3,3,.6,0xff8a2a,{y:f.shY-3,z:3.1*f.W,e:2.4});p.cyl(1.2,1.4,6,0x3a3a3a,{x:2,y:f.top+1,z:-3.4,seg:8,...MT.metal});p.sph(1.6,0xd8dde2,{x:2,y:f.top+5,z:-3.4,e:.3});p.pop();heroBase(p,st,I);});
kit('hero_grommash',(p,st,I)=>{p.pushT(0,0,0,0,0,0,1.24);const f=fig(p,st,{armor:'plate',bulk:1.18,rp:'twoR',lp:'twoL',helm:'spiked',mantle:0x6a6a62,pauldrons:true,cape:0x5a0a0a});
  at(p,f.R,[.35,0,.45],()=>UP.axe(p,st,{len:19,heavy:true,double:true}));p.pop();heroBase(p,st,I);});
kit('hero_skarr',(p,st,I)=>{p.pushT(0,0,0,0,0,0,1.2);const f=fig(p,st,{armor:'leather',bulk:1.05,rp:'low',lp:'low',helm:'boarskull',cape:0x8a1418,pauldrons:true,w:.95});
  at(p,f.R,[.45,0,-.3],()=>UP.sword(p,st,{len:11,style:'jagged'}));at(p,f.L,[.45,0,.3],()=>UP.sword(p,st,{len:11,style:'jagged'}));p.pop();heroBase(p,st,I);});
kit('hero_nekhara',(p,st,I)=>{p.pushT(0,1.5,0,0,0,0,1.2);const f=fig(p,st,{armor:'robe',rp:'staffR',lp:'cast',helm:'crown',cape:0x2a1450,cloth:0x3a1a6a});
  at(p,f.R,null,()=>UP.staff(p,st,{top:'skull',glow:0xb46aff,len:30}));at(p,f.L,null,()=>orb(p,0xb46aff,1.3));p.pop();p.torus(9,.3,0xb46aff,{y:3,rx:PI/2,e:2});heroBase(p,st,I);});
kit('hero_nocthyr',(p,st,I)=>{p.pushT(0,1.5,0,0,0,0,1.2);const f=fig(p,st,{armor:'robe',rp:'staffR',lp:'cast',helm:'hood',cape:0x15173a});
  at(p,f.R,null,()=>UP.staff(p,st,{top:'moon',glow:0xd56bdc,len:30}));at(p,f.L,null,()=>orb(p,0xd56bdc,1.2));
  for(let i=0;i<3;i++){const a=i*2.09;p.sph(.9,i%2?0x6af0ff:0xd56bdc,{x:Math.cos(a)*6,y:f.top+1+i,z:Math.sin(a)*6,e:2.6});}p.pop();heroBase(p,st,I);});

// ---------------------------------------------------------------- geometry cache + pedestal
const geoCache=new Map();
function pedestal(p,st,I){
  const R=I.baseR||11.5,team=st.team;
  p.lathe([[0,0],[R,0],[R+.6,.5],[R+.6,1.9],[R+.1,2.4],[R-.9,2.65],[0,2.65]],0x2c3038,{seg:28,m:.1,r:.6});
  p.cyl(R+.68,R+.68,1.05,team,{y:1.15,seg:28,open:true,m:.35,r:.4,e:.35});
  p.torus(R-.55,.22,I.hero?0xffd56a:st.trim,{y:2.66,rx:PI/2,ts:28,...MT.gold});
  // little scenic ground on top of the base
  p.cyl(R-1,R-1,.25,mix(0x4a5a2c,team,.08),{y:2.7,seg:24,r:.95});
  const r=AE.rng(R*13+(st.id|0));for(let i=0;i<5;i++){const a=r()*6.28,d=R*(.55+r()*.3);p.cone(.35,1.4,0x5f7a3a,{x:Math.cos(a)*d,y:3.4,z:Math.sin(a)*d,seg:3});}
}
function navalRing(p,st,I){const R=I.baseR||20;p.torus(R,.6,st.team,{y:.4,rx:PI/2,ts:36,e:.7,m:.2,r:.4});p.torus(R+1.2,.25,st.trim,{y:.4,rx:PI/2,ts:36,...MT.gold});}
AE.unitGeo=function(k,o){
  const key=k+'|'+o;let g=geoCache.get(key);if(g)return g;
  const st=AE.fstyle(o),p=new AE.Prefab(),I={face:'z',baseR:11.5,naval:false,hero:!!(UNITS[k]&&UNITS[k].hero)};
  const fn=KITS[k]||KITS.warrior;
  curHero=!!I.hero;
  try{
    p.pushT(0,2.65,0);fn(p,st,I);p.pop();
    if(I.naval){navalRing(p,st,I);}else pedestal(p,st,I);
    g=p.build();
  }catch(e){console.warn('unit kit failed',k,o,e);const q=new AE.Prefab();pedestal(q,st,I);q.cyl(3,3,20,st.cloth,{y:12});g=q.build();}
  g.computeBoundingBox();I.height=g.boundingBox.max.y;g.userData.info=I;g.userData.keep=true;geoCache.set(key,g);return g;
};
AE.unitKits=KITS;
// called when a Blender body finishes loading: rebuild unit meshes/icons so they pick it up
AE.unitGeoVer=0;
AE.unitGeoInvalidate=function(){geoCache.clear();AE.unitGeoVer++;try{iconCache.clear();}catch(e){}};

// ---------------------------------------------------------------- runtime unit layer
const U={meshes:new Map(),group:null,sel:null,ghosts:[],screen:new Map()};AE.unitsRT=U;
function ensureGroup(){if(!U.group||!U.group.parent){U.group=new T3.Group();threeWorld.scene.add(U.group);U.meshes.clear();}
  if(!U.sel){const tex=AE.radialTex('selglow',[[0,'rgba(255,230,140,.0)'],[.55,'rgba(255,220,120,.0)'],[.72,'rgba(255,220,120,.95)'],[.82,'rgba(255,240,180,.55)'],[1,'rgba(255,220,120,0)']]);
    U.sel=new T3.Mesh(new T3.PlaneGeometry(1,1),new T3.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,blending:T3.AdditiveBlending,toneMapped:false}));U.sel.rotation.x=-PI/2;U.sel.renderOrder=5;threeWorld.scene.add(U.sel);}
  if(!AE.flashMat){AE.flashMat=AE.stdMat({matAttr:true,emissive:0xffe2c0,emissiveIntensity:.55,key:'flash'});}
}
function slotFor(u,t,us){
  const mil=us.find(q=>!isCiv(q)),civ=us.find(q=>isCiv(q));const city=t.city!=null;
  if(city)return (mil&&civ)?(isCiv(u)?[-15,27]:[14,28]):[6,28];
  if(mil&&civ)return isCiv(u)?[-12,-9]:[9,6];
  return [0,3];
}
const ease=k=>1-(1-k)*(1-k);
AE.syncUnits=function(now){
  if(!G)return;ensureGroup();
  const v=G.vis[G.player],seen=new Set(),selId=G.sel&&G.sel.type==='unit'?G.sel.id:null;U.screen.clear();
  let selObj=null;
  for(const u of G.units){
    const i=u.y*G.W+u.x;if(v[i]!==2)continue;seen.add(u.id);
    let rec=U.meshes.get(u.id);
    if(!rec||rec.k!==u.k||rec.o!==u.o||rec.v!==AE.unitGeoVer){if(rec)U.group.remove(rec.mesh);const g=AE.unitGeo(u.k,u.o);const m=new T3.Mesh(g,AE.prefabMat);m.castShadow=true;m.receiveShadow=true;rec={mesh:m,k:u.k,o:u.o,v:AE.unitGeoVer,info:g.userData.info,ry:null,boat:null};U.meshes.set(u.id,rec);U.group.add(m);}
    const info=rec.info,t=G.tiles[i],us=unitsAt(u.x,u.y),slot=slotFor(u,t,us),c=worldPos(u.x,u.y);
    let X=c.x+slot[0],Z=c.y+slot[1];
    const water=AE.isWater(t);let Y=water?AE.WATER_Y:AE.heightLocal(t,slot[0],slot[1]);
    if(!water)Y=Math.max(Y,AE.tileTop(t)-.4);
    // movement interpolation with a small hop
    if(u.mt&&u.from){const k=(now-u.mt)/260;if(k<1&&k>=0){const ft=tileAt(u.from[0],u.from[1]);if(ft){const fp=worldPos(u.from[0],u.from[1]);const e=ease(k),fy=AE.isWater(ft)?AE.WATER_Y:AE.standY(ft);X=fp.x+slot[0]+(X-fp.x-slot[0])*e;Z=fp.y+slot[1]+(Z-fp.y-slot[1])*e;Y=fy+(Y-fy)*e+Math.sin(k*PI)*7;}}}
    if(u.lunge&&now-u.lunge.t<320){const tp=worldPos(u.lunge.x,u.lunge.y),k=Math.sin(Math.min(1,(now-u.lunge.t)/320)*PI)*.38;X+=(tp.x-X)*k;Z+=(tp.y-Z)*k;}
    const flash=u.flash&&now-u.flash<220;if(flash){X+=(Math.random()-.5)*2;}
    const bob=info.flying?Math.sin(now/520+u.id)*1.6+2:info.naval||u.emb?Math.sin(now/700+u.id)*.5:0;
    const civShared=isCiv(u)&&us.some(q=>!isCiv(q));const sc=(civShared?.86:1)*(t.city!=null?.9:1)*(info.naval?1.15:info.face==='x'?1.22:1.32);
    const m=rec.mesh;m.position.set(X,Y+bob,Z);m.scale.setScalar(sc*(u.emb&&!info.naval?.85:1));
    // facing: three-quarter view towards the camera, turned toward the last travel direction
    const target=info.face==='x'?(u.fl?PI+.42:-.42):(u.fl?-.5:.5);if(rec.ry==null)rec.ry=target;rec.ry+=(target-rec.ry)*.18;m.rotation.y=rec.ry+(info.naval?Math.sin(now/900+u.id)*.03:0);
    if(info.naval)m.rotation.z=Math.sin(now/800+u.id)*.03;
    m.material=flash?AE.flashMat:AE.prefabMat;m.visible=true;
    // embarked land units ride in a small boat
    if(u.emb&&!info.naval){if(!rec.boat){const st=AE.fstyle(u.o),bp=new AE.Prefab();UP.rowboat(bp,st);const bg=bp.build();rec.boat=new T3.Mesh(bg,AE.prefabMat);rec.boat.castShadow=true;U.group.add(rec.boat);}rec.boat.visible=true;rec.boat.position.set(X,AE.WATER_Y-.6+bob,Z);rec.boat.rotation.y=m.rotation.y+PI/2;m.position.y=AE.WATER_Y+1.2+bob;}
    else if(rec.boat)rec.boat.visible=false;
    const h=info.height*m.scale.y,foot=AE.project(X,m.position.y,Z+(info.baseR||11)*.9*m.scale.x),top=AE.project(X,m.position.y+h,Z),ctr=AE.project(X,m.position.y,Z);
    U.screen.set(u.id,{x:ctr.x,footY:foot.y,headY:top.y,z:ctr.z,scale:civShared?.86:1});
    if(u.id===selId)selObj={X,Y:m.position.y,Z,R:(info.baseR||11)*sc};
  }
  for(const [id,rec] of U.meshes){if(!seen.has(id)){rec.mesh.visible=false;if(rec.boat)rec.boat.visible=false;if(!G.units.some(q=>q.id===id)){U.group.remove(rec.mesh);if(rec.boat)U.group.remove(rec.boat);U.meshes.delete(id);}}}
  if(selObj){const s=(selObj.R*2+9)*(1+Math.sin(now/260)*.04);U.sel.visible=true;U.sel.position.set(selObj.X,selObj.Y+.5,selObj.Z);U.sel.scale.set(s,s,1);}else U.sel.visible=false;
  // death ghosts: fade and sink
  G.ghosts=(G.ghosts||[]).filter(g=>now-g.t<650);
  for(const gh of U.ghosts){if(!G.ghosts.includes(gh.src)){U.group.remove(gh.mesh);gh.mesh.material.dispose();gh.dead=true;}}
  U.ghosts=U.ghosts.filter(g=>!g.dead);
  for(const g of G.ghosts){if(v[idx(g.x,g.y)]!==2)continue;let gh=U.ghosts.find(q=>q.src===g);if(!gh){const mat=AE.stdMat({matAttr:true,transparent:true,key:'ghost'});const m=new T3.Mesh(AE.unitGeo(g.k,g.o),mat);U.group.add(m);gh={src:g,mesh:m};U.ghosts.push(gh);}
    const a=(now-g.t)/650,t=tileAt(g.x,g.y),c=worldPos(g.x,g.y);gh.mesh.position.set(c.x,(AE.isWater(t)?AE.WATER_Y:AE.standY(t))-a*10,c.y+3);gh.mesh.rotation.z=a*.6;gh.mesh.material.opacity=1-a;gh.mesh.material.emissive.setRGB(a,a*.4,a*.2);}
};
AE.unitScreen=function(u){return U.screen.get(u.id)||null;};

// ---------------------------------------------------------------- portrait icons rendered from the same models
const iconCache=new Map();const iconRigs={};
function rig(S=256){
  if(iconRigs[S])return iconRigs[S];const sc=new T3.Scene();
  sc.add(new T3.HemisphereLight(0xeef4ff,0x403a30,.75));const key=new T3.DirectionalLight(0xfff0d8,1.25);key.position.set(-.6,1,.9);sc.add(key);const rim=new T3.DirectionalLight(0x9fc8ff,.65);rim.position.set(.8,.6,-1);sc.add(rim);
  const cam=new T3.PerspectiveCamera(24,1,1,2000);const rt=new T3.WebGLRenderTarget(S,S,{samples:4});rt.texture.encoding=T3.sRGBEncoding;
  iconRigs[S]={sc,cam,rt,buf:new Uint8Array(S*S*4)};return iconRigs[S];
}
AE.unitIcon=function(k,o,S=256){
  const key=S===256?k+'|'+o:k+'|'+o+'|'+S;let url=iconCache.get(key);if(url)return url;
  if(!threeWorld.ready)return null;
  const r=rig(S),g=AE.unitGeo(k,o),I=g.userData.info,mesh=new T3.Mesh(g,AE.prefabMat);
  mesh.rotation.y=I.face==='x'?-.55:.42;r.sc.add(mesh);
  const bb=new T3.Box3().setFromObject(mesh);
  // frame the body, not long pikes/lances/banners: clamp the box around the model's core
  const lim=I.naval?30:I.face==='x'?26:I.hero?26:22;bb.min.x=Math.max(bb.min.x,-lim);bb.max.x=Math.min(bb.max.x,lim);bb.min.z=Math.max(bb.min.z,-lim);bb.max.z=Math.min(bb.max.z,lim);bb.max.y=Math.min(bb.max.y,I.flying?44:I.hero?44:38);
  const size=bb.getSize(new T3.Vector3()),ctr=bb.getCenter(new T3.Vector3());
  const rad=Math.max(size.y*.6,size.x*.5,size.z*.45);r.cam.position.set(ctr.x,ctr.y+rad*.55,ctr.z+rad*4.2);r.cam.lookAt(ctr.x,ctr.y-rad*.06,ctr.z);r.cam.near=rad;r.cam.far=rad*10;r.cam.updateProjectionMatrix();
  const R3=threeWorld.renderer,prevRT=R3.getRenderTarget(),fog=AE.U.uFogOn.value,prevClear=R3.getClearColor(new T3.Color()),prevA=R3.getClearAlpha(),prevShadow=R3.shadowMap.autoUpdate;
  AE.U.uFogOn.value=0;R3.setRenderTarget(r.rt);R3.setClearColor(0x000000,0);R3.clear();R3.render(r.sc,r.cam);R3.readRenderTargetPixels(r.rt,0,0,S,S,r.buf);R3.setRenderTarget(prevRT);R3.setClearColor(prevClear,prevA);AE.U.uFogOn.value=fog;
  r.sc.remove(mesh);
  const c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d'),img=x.createImageData(S,S);
  for(let y=0;y<S;y++){img.data.set(r.buf.subarray((S-1-y)*S*4,(S-y)*S*4),y*S*4);}
  x.putImageData(img,0,0);url=c.toDataURL('image/png');iconCache.set(key,url);return url;
};
const legacyUnitImg=window.unitImg;
window.unitImg=function(k,civ,size){
  if(threeWorld.enabled&&threeWorld.ready&&window.THREE){try{const url=AE.unitIcon(k,civ);if(url)return `<img class="u3dicon" src="${url}" width="${size}" height="${size}" style="object-fit:contain;vertical-align:middle;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))" alt="">`;}catch(e){console.warn(e);}}
  return legacyUnitImg(k,civ,size);
};
// warm the icon cache for the player's own roster in idle time so the city panel opens instantly
AE.prewarmIcons=function(){if(!G||!threeWorld.ready)return;const list=Object.keys(UNITS).filter(k=>{const d=UNITS[k];return !d.monster&&(d.uniqueCiv==null||d.uniqueCiv===G.player)&&(!d.hero||d.heroCiv===G.player);});
  let i=0;const step=()=>{const t0=performance.now();while(i<list.length&&performance.now()-t0<12){try{AE.unitIcon(list[i],G.player);}catch(e){}i++;}if(i<list.length)setTimeout(step,30);};setTimeout(step,400);};
})();
