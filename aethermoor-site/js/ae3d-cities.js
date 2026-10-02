/* Realms of Aethermoor V5.7.0 - 3D cities (4 growth tiers x faction architecture), walls/castles, harbours, outskirts,
   world wonders, monster lairs, discovery sites and natural wonders. Presentation only. */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const T3=THREE,PI=Math.PI,UP=AE.UP,MT=UP.MT,mix=AE.mix,shade=AE.shadeHex;
const ARCH={aldermark:'human',valedawn:'sun',sylvanor:'elf',thornwild:'wild',khazrum:'dwarf',ironveil:'iron',grommash:'orc',skarr:'warclan',nekhara:'necro',nocthyr:'shadow',barbarian:'orc'};
const archOf=st=>ARCH[st.key]||'human';

// ---------------------------------------------------------------- building blocks
function crenels(p,x,y,z,w,d,col,n=null){const nx=n||Math.max(2,Math.round(w/2.2)),nz=Math.max(2,Math.round(d/2.2));for(let i=0;i<nx;i++){const xx=x-w/2+(i+.5)*w/nx;p.box(1.2,1.4,1.2,col,{x:xx,y,z:z+d/2-.5});p.box(1.2,1.4,1.2,col,{x:xx,y,z:z-d/2+.5});}for(let i=1;i<nz-1;i++){const zz=z-d/2+(i+.5)*d/nz;p.box(1.2,1.4,1.2,col,{x:x+w/2-.5,y,z:zz});p.box(1.2,1.4,1.2,col,{x:x-w/2+.5,y,z:zz});}}
function roundTower(p,x,z,r,h,wall,roof,o={}){
  p.cyl(r,r*1.08,h,wall,{x,y:h/2,z,seg:12,jit:.06,r:.92});p.cyl(r*1.18,r*1.12,1.2,shade(wall,.9),{x,y:h+.2,z,seg:12});
  if(o.flat){for(let i=0;i<8;i++){const a=i/8*6.283;p.box(1.1,1.4,1.1,wall,{x:x+Math.cos(a)*r*1.05,y:h+1.4,z:z+Math.sin(a)*r*1.05});}}
  else p.cone(r*1.35,o.roofH||r*2.4,roof,{x,y:h+.8+(o.roofH||r*2.4)/2,z,seg:12,r:.6,jit:.05});
  for(let i=0;i<(o.windows??2);i++){const a=.3+i*1.4;p.box(.7,1.4,.3,o.win??0x2a2a30,{x:x+Math.cos(a)*r*1.02,y:h*.55+i*2,z:z+Math.sin(a)*r*1.02,ry:-a+PI/2,e:o.win?1.4:0});}
}
function squareTower(p,x,z,w,h,wall,roof,o={}){p.box(w,h,w,wall,{x,y:h/2,z,jit:.06,r:.92});p.box(w*1.12,1,w*1.12,shade(wall,.88),{x,y:h+.3,z});if(o.flat)crenels(p,x,h+1.4,z,w*1.1,w*1.1,wall);else p.cone(w*.92,o.roofH||w*1.3,roof,{x,y:h+.8+(o.roofH||w*1.3)/2,z,seg:4,ry:PI/4,r:.6});
  p.box(.8,1.6,.3,o.win??0x2a2a30,{x,y:h*.6,z:z+w/2+.1,e:o.win?1.2:0});}
function flagPole(p,st,x,z,h){p.pushT(x,0,z,0,-.5,0);UP.banner(p,st,{h,w:h*.32,fh:h*.32});p.pop();}
function house(p,st,arch,x,z,ry,s,R){
  p.pushT(x,0,z,0,ry,0,s);
  const v=R();
  switch(arch){
    case 'human':AE.cottage(p,{roof:v<.5?st.roof:st.roof2,wall:v<.3?0xe6dcc4:v<.6?0xd8ccb0:0xcdbb9a});break;
    case 'sun':p.box(7,5.4,6,st.wall,{y:2.7,jit:.05});p.box(7.4,.6,6.4,st.trim,{y:5.6,...MT.gold});if(v<.5)p.sph(2.4,st.roof,{y:5.8,ts:0,tl:1.6,...MT.gold});else p.box(6.6,.5,5.6,st.roof2,{y:6.1});p.box(1.4,2.4,.2,0x6a4a2a,{y:1.2,z:3.05});for(const sd of[-1,1])p.box(1,1.2,.2,0x2a3a5a,{x:sd*2.2,y:3.4,z:3.05});break;
    case 'elf':p.cyl(3.4,3.6,6,st.wall,{y:3,seg:10});p.cone(4.4,7,v<.5?st.roof:st.roof2,{y:9.5,seg:10,r:.55});p.cone(.4,2.4,st.trim,{y:13.8,seg:5,...MT.gold});p.box(1.2,2.6,.3,0x5a4a2a,{y:1.3,z:3.5});p.box(.8,1.2,.3,0x7affc0,{y:4,z:3.45,e:1});break;
    case 'wild':p.box(10,4,5.5,0x7a5a36,{y:2,jit:.12});p.box(10.6,.6,3.6,0x8a7a42,{y:5.3,z:1.4,rx:.62,jit:.2});p.box(10.6,.6,3.6,0x8a7a42,{y:5.3,z:-1.4,rx:-.62,jit:.2});p.ico(1.4,0x4f7a2a,{x:3,y:6.4,d:1,sy:.6});for(const sd of[-1,1])p.limb([sd*5,5,0],[sd*6.4,8.6,0],.3,.2,0xe8dcc0,{seg:4});break;
    case 'dwarf':p.box(8,4.4,6.4,0x9a8a78,{y:2.2,jit:.1,flat:true});p.box(8.6,.8,3.8,st.roof,{y:5.2,z:1.5,rx:.35,...MT.metal});p.box(8.6,.8,3.8,st.roof,{y:5.2,z:-1.5,rx:-.35,...MT.metal});p.box(1.6,4,1.6,0x6a6058,{x:2.6,y:6.4,z:-1});p.sph(.8,0xffa040,{x:2.6,y:8.6,z:-1,e:2});p.box(1.6,2.4,.3,0x4a3020,{y:1.2,z:3.25});p.box(.9,.9,.3,0xffb050,{x:-2.4,y:2.6,z:3.25,e:1.4});break;
    case 'iron':p.box(7.4,6,6.4,0x5a5f66,{y:3,...MT.metal,r:.5});p.box(7.8,.6,6.8,0xb07a3a,{y:6.2,...MT.gold});p.cyl(.9,1.1,6,0x3a3a3a,{x:2.4,y:8.6,z:-1.6,seg:8,...MT.metal});p.sph(1.6,0xc8ccd0,{x:2.4,y:12.4,z:-1.6,e:.25});p.box(5,.9,.3,0xffb050,{y:3.6,z:3.25,e:1.2});break;
    case 'orc':p.sph(4.4,0x7a5232,{y:0,ts:0,tl:1.6,sy:1.15,jit:.2});for(let i=0;i<5;i++){const a=i/5*6.283;p.limb([Math.cos(a)*3.6,0,Math.sin(a)*3.6],[Math.cos(a)*.6,6.8,Math.sin(a)*.6],.25,.2,0x4a3020,{seg:4});}p.box(1.8,2.6,.4,0x1a120a,{y:1.3,z:4.1});p.sph(.9,0xe6dcc0,{y:3.6,z:4.2});break;
    case 'warclan':p.cone(4.4,8.6,v<.5?0x8a3a2a:0xa0582a,{y:4.3,seg:7,jit:.15});for(let i=0;i<3;i++)p.limb([0,6,0],[Math.cos(i*2.1)*1.6,10,Math.sin(i*2.1)*1.6],.2,.15,0x4a3020,{seg:4});p.box(1.6,2.6,.3,0x1a120a,{y:1.3,z:3.6,rx:-.45});break;
    case 'necro':p.box(6.6,5,6,0x5c5668,{y:2.5,jit:.1});p.cone(5.4,5.4,0x403a4c,{y:7.7,seg:4,ry:PI/4});for(const sd of[-1,1])p.box(.9,1.6,.2,0xb46aff,{x:sd*1.8,y:3,z:3.05,e:2});p.box(1.4,2.4,.2,0x120a18,{y:1.2,z:3.05});break;
    case 'shadow':p.box(6,6.4,6,0x464a72,{y:3.2,jit:.08});p.cone(4.6,8.6,0x33386a,{y:10.7,seg:4,ry:PI/4});p.box(.9,1.8,.2,0x6af0ff,{y:4,z:3.05,e:2.2});p.cyl(.15,.15,2.4,0xd8e0ff,{y:16,seg:4,e:.8});break;
  }
  p.pop();
}
// central keep / signature structure per architecture and tier
function keep(p,st,arch,tier,cap){
  const s=.75+tier*.17+(cap?.12:0);
  switch(arch){
    case 'human':{const h=10+tier*4+(cap?4:0);squareTower(p,0,0,9*s,h,st.stone,st.roof,{roofH:9*s,win:0xffd890});if(tier>=1)roundTower(p,-7*s,4*s,2.6*s,h*.7,st.stone,st.roof,{win:0xffd890});if(tier>=2)roundTower(p,7*s,-4*s,2.6*s,h*.8,st.stone,st.roof);if(tier>=3){p.box(16*s,h*.45,9*s,st.stone,{y:h*.22,z:-3});crenels(p,0,h*.45+.8,-3,16*s,9*s,st.stone);}break;}
    case 'sun':{const h=12+tier*4+(cap?5:0);p.cyl(4.6*s,5.2*s,h,st.wall,{y:h/2,seg:14});p.torus(5*s,.5,st.trim,{y:h,rx:PI/2,...MT.gold});p.sph(5*s,0xe8b84a,{y:h+.4,ts:0,tl:1.6,...MT.gold});p.cone(.8,6*s,st.trim,{y:h+5.4*s+2,seg:6,...MT.gold,e:.5});p.sph(1.2,0xffe08a,{y:h+9*s,e:2.2});
      if(tier>=1)for(const sd of[-1,1])p.cyl(2*s,2.2*s,h*.7,st.wall,{x:sd*7*s,y:h*.35,z:2,seg:10}),p.sph(2.2*s,0xe8b84a,{x:sd*7*s,y:h*.7+.4,z:2,ts:0,tl:1.6,...MT.gold});
      if(tier>=2){p.box(16*s,5,8*s,st.wall,{y:2.5,z:-4});for(let i=0;i<6;i++)p.cyl(.5,.5,5,st.trim,{x:-7*s+i*2.8*s,y:2.5,z:-4+4*s+.2,seg:6,...MT.gold});}break;}
    case 'elf':{const h=16+tier*5+(cap?5:0);p.cyl(2.6*s,3.4*s,h,st.wall,{y:h/2,seg:12});p.cone(3.8*s,9*s,st.roof,{y:h+4.5*s,seg:12,r:.5});p.cone(.4,4,st.trim,{y:h+9*s+2,seg:5,...MT.gold,e:.4});
      for(let i=0;i<3;i++)p.torus(3*s,.3,st.trim,{y:h*(.3+i*.25),rx:PI/2,...MT.gold});p.box(1,2,.3,0x7affc0,{y:h*.7,z:3*s,e:1.4});
      if(tier>=1){p.pushT(-9*s,0,-6*s,0,0,0,1.6+tier*.25);p.limb([0,0,0],[0,9,0],1.6,1.1,0x6a5a3a,{seg:8});for(let i=0;i<8;i++){const a=i*2.4;p.ico(3.4,i%2?0x3f8a4a:0x2f7a3e,{x:Math.cos(a)*2.6,y:11+Math.sin(i)*1.2,z:Math.sin(a)*2.6,d:1,noise:1.2,nseed:i,sy:.8});}p.pop();}
      if(tier>=2)for(const sd of[-1,1]){p.cyl(1.6*s,2*s,h*.6,st.wall,{x:sd*7*s,y:h*.3,z:3*s,seg:10});p.cone(2.4*s,6*s,st.roof2,{x:sd*7*s,y:h*.6+3*s,z:3*s,seg:10});p.limb([0,h*.55,0],[sd*7*s,h*.5,3*s],.4,.4,st.wall,{seg:6});}break;}
    case 'wild':{const sc=1.2+tier*.35+(cap?.2:0);p.pushT(0,0,-2,0,0,0,sc);p.limb([0,0,0],[.5,13,0],3,2,0x5a4028,{seg:10});for(let i=0;i<5;i++){const a=i*1.26;p.limb([0,1.5,0],[Math.cos(a)*5,-.5,Math.sin(a)*5],1.2,.5,0x5a4028,{seg:6});p.limb([.3,10,0],[Math.cos(a)*6,14,Math.sin(a)*6],.9,.5,0x5a4028,{seg:6});}
      for(let i=0;i<10;i++){const a=i*2.4,r=i?5+Math.sqrt(i)*1.4:0;p.ico(4.6,i%3?0x3f7a2e:0x56883a,{x:Math.cos(a)*r,y:16+Math.sin(i*1.7)*2,z:Math.sin(a)*r,d:1,noise:1.6,nseed:i+3,sy:.7,grad:lp=>.7+.4*AE.clamp(lp.y/4+.5,0,1)});}
      p.cyl(5,5,.6,0x6a4a2a,{y:8,seg:12});p.box(3,3,3,0x7a5a36,{x:2,y:9.8,z:1});p.pop();
      if(tier>=1)for(let i=0;i<3;i++){const a=i*2.1+.4;p.limb([Math.cos(a)*10,0,Math.sin(a)*10],[Math.cos(a)*10,8,Math.sin(a)*10],.5,.4,0x5a4028,{seg:5});p.sph(1,0xe6dcc0,{x:Math.cos(a)*10,y:8.6,z:Math.sin(a)*10});for(const sd of[-1,1])p.limb([Math.cos(a)*10,8.8,Math.sin(a)*10],[Math.cos(a)*10+sd*2,11,Math.sin(a)*10],.2,.12,0xe6dcc0,{seg:4});}break;}
    case 'dwarf':{const s2=1+tier*.28;p.pushT(0,0,-5,0,0,0,s2);p.ico(11,0x7a6e62,{y:1,sy:.8,d:1,noise:4,nseed:11,flat:true,jit:.15,paint:(lp,c)=>{if(lp.y>6)c.lerp(new T3.Color(0x8a9a6a),.3);}});
      p.box(10,9,3,st.stone,{y:4.5,z:8.4,jit:.08});p.box(5,6,1,0x1a120a,{y:3,z:9.6});p.box(5.6,.8,1.2,st.trim,{y:6.2,z:9.7,...MT.gold});p.box(5,6,.2,0xffa040,{y:3,z:9.2,e:.9});
      for(const sd of[-1,1]){squareTower(p,sd*6.4,8.2,4,11,st.stone,st.roof,{flat:true});p.box(.4,.4,.2,0xffb050,{x:sd*6.4,y:7,z:10.3,e:1.6});}
      p.cyl(1.6,2,8,0x5a5048,{x:4,y:12,z:-2,seg:8});p.sph(1.6,0xffa040,{x:4,y:16.6,z:-2,e:1.8});p.pop();break;}
    case 'iron':{const h=12+tier*4+(cap?4:0);p.box(12*s,h,10*s,0x5a5f66,{y:h/2,z:-2,...MT.metal,r:.5});p.box(12.6*s,1,10.6*s,0xb07a3a,{y:h,z:-2,...MT.gold});p.sph(4*s,0xb07a3a,{y:h+.5,z:-2,ts:0,tl:1.6,...MT.gold});
      for(const sd of[-1,1]){p.cyl(1.2*s,1.5*s,h+8,0x3a3a3a,{x:sd*4.6*s,y:(h+8)/2,z:-6*s,seg:8,...MT.metal});p.sph(2.2,0xc8ccd0,{x:sd*4.6*s,y:h+10,z:-6*s,e:.2});p.sph(1.6,0xd8dce0,{x:sd*4.6*s+1,y:h+12.4,z:-6*s,e:.2});}
      for(let i=0;i<4;i++)p.box(2.4,1,.3,0xffb050,{x:-4.5*s+i*3*s,y:h*.6,z:3*s+.2,e:1.4});UP.emblem(p,st,'gear',2*s,0xb07a3a);break;}
    case 'orc':{const h=9+tier*3.5+(cap?3:0);for(let i=0;i<3;i++)p.box((14-i*3.6)*s,h/3,(12-i*3)*s,0x3a3634,{y:h/6+i*h/3,z:-2,jit:.15});
      for(let i=0;i<6;i++)p.cone(.7,4,0x1a1a1a,{x:(-5+i*2)*s,y:h+2,z:-2+(i%2)*2,seg:4,...MT.metal});p.box(3,4,.4,0x1a0a0a,{y:2,z:4*s});p.sph(1.4,0xe6dcc0,{y:h*.75,z:2*s});
      for(const sd of[-1,1]){p.limb([sd*6*s,0,4*s],[sd*6*s,h+5,4*s],.5,.4,0x3a2a1a,{seg:5});p.sph(1.2,0xe6dcc0,{x:sd*6*s,y:h+5.6,z:4*s});p.cone(1.2,2.4,0xff6a2a,{x:sd*3*s,y:1.2,z:5*s,seg:6,e:2});}break;}
    case 'warclan':{const sc=.9+tier*.2;p.pushT(0,0,-3,0,0,0,sc);p.box(16,7,8,0x6a4a2a,{y:3.5,jit:.15});p.box(17,.8,5,0x8a3a2a,{y:8.6,z:2,rx:.6});p.box(17,.8,5,0x8a3a2a,{y:8.6,z:-2,rx:-.6});
      p.sph(2.2,0xe6dcc0,{y:9,z:4.6,sx:1.2,sz:1.4});for(const sd of[-1,1])p.cone(.5,3,0xfaf2dc,{x:sd*1.2,y:7.8,z:6.2,rx:-.6,rz:sd*.4,seg:5});p.box(3,4.6,.4,0x1a0a0a,{y:2.3,z:4.1});p.pop();
      p.cone(2,3.6,0xff7a2a,{x:-6,y:1.8,z:7,seg:6,e:2.2});for(let i=0;i<7;i++){const a=i/7*6.283;p.ico(.8,0x5a5450,{x:-6+Math.cos(a)*2.4,y:.5,z:7+Math.sin(a)*2.4,flat:true});}break;}
    case 'necro':{const h=10+tier*4+(cap?4:0);for(let i=0;i<4;i++)p.box((14-i*3.2)*s,h/4,(14-i*3.2)*s,0x6a6476,{y:h/8+i*h/4,z:-3,jit:.08});p.cone(2.4*s,4*s,0xd9b04a,{y:h+2*s,z:-3,seg:4,ry:PI/4,...MT.gold,e:.4});
      for(const sd of[-1,1]){p.box(1.6*s,h*.9,1.6*s,0x403a4c,{x:sd*9*s,y:h*.45,z:4*s});p.cone(1.2*s,3*s,0xd9b04a,{x:sd*9*s,y:h*.9+1.5*s,z:4*s,seg:4,...MT.gold});p.box(.4,2,.3,0xb46aff,{x:sd*9*s,y:h*.6,z:4*s+.9*s,e:2});}
      p.box(3,4.4,.4,0x120a18,{y:2.2,z:4.2*s});p.sph(1.2,0xb46aff,{y:h*.55,z:4*s,e:2.4});break;}
    case 'shadow':{const h=16+tier*5+(cap?5:0);p.box(8*s,h,8*s,0x464a72,{y:h/2,z:-2});p.cone(6*s,10*s,0x33386a,{y:h+5*s,z:-2,seg:4,ry:PI/4});p.cyl(0,1.4,4,0xd56bdc,{y:h+12*s,z:-2,seg:5,e:2.4,flat:true});
      for(const sd of[-1,1]){p.box(4*s,h*.65,4*s,0x464a72,{x:sd*7*s,y:h*.33,z:2});p.cone(3.4*s,7*s,0x33386a,{x:sd*7*s,y:h*.65+3.5*s,z:2,seg:4,ry:PI/4});p.cyl(0,.8,2.4,0x6af0ff,{x:sd*7*s,y:h*.65+8*s,z:2,seg:5,e:2.2,flat:true});}
      for(let i=0;i<3;i++)p.box(.8,2.4,.2,0x6af0ff,{x:(-1.6+i*1.6)*s,y:h*.6,z:-2+4*s+.1,e:2});p.pushT(0,h*.85,-2+4*s+.3);p.ext(UP.crescent(2.2*s),.4,0xd8e0ff,{...MT.gold,e:1.2});p.pop();break;}
  }
}
function walls(p,st,arch,R,castle){
  const n=6,stone=arch==='iron'?0x5a5f66:arch==='necro'?0x5c5668:arch==='shadow'?0x464a72:arch==='sun'?st.wall:st.stone,wood=arch==='orc'||arch==='warclan'||arch==='wild';
  const H=castle?8:6,T=castle?3:2.2;
  for(let i=0;i<n;i++){const a=(i/n)*6.283+PI/6,a2=((i+1)/n)*6.283+PI/6,x=Math.cos(a)*R,z=Math.sin(a)*R,x2=Math.cos(a2)*R,z2=Math.sin(a2)*R,mx=(x+x2)/2,mz=(z+z2)/2,len=Math.hypot(x2-x,z2-z),ang=-Math.atan2(z2-z,x2-x);
    const front=mz>R*.6;
    if(wood){const posts=Math.round(len/1.6);for(let k=0;k<posts;k++){const f=(k+.5)/posts;if(front&&Math.abs(f-.5)<.14)continue;const px=x+(x2-x)*f,pz=z+(z2-z)*f,hh=H+((k*7)%3)*.6;p.cyl(.75,.8,hh,0x6a4a2a,{x:px,y:hh/2,z:pz,seg:6,jit:.1});p.cone(.75,1.6,0x8a6a42,{x:px,y:hh+.8,z:pz,seg:6});}
      if(arch==='wild')for(let k=0;k<4;k++)p.ico(1.2,0x3f6a2a,{x:x+(x2-x)*(k/4+.1),y:2+(k%2),z:z+(z2-z)*(k/4+.1),d:1});}
    else{if(front){const gw=7;for(const sd of[-1,1]){const segL=(len-gw)/2,cx=mx+Math.cos(-ang)*sd*(gw/2+segL/2),cz=mz+Math.sin(-ang)*sd*(gw/2+segL/2);p.box(segL,H,T,stone,{x:cx,y:H/2,z:cz,ry:ang,jit:.08});}
        p.box(gw+2,H+3,T+1.4,shade(stone,.92),{x:mx,y:(H+3)/2,z:mz,ry:ang});p.box(gw-1,H-.6,T+1.6,0x1a120a,{x:mx,y:(H-.6)/2-.4,z:mz,ry:ang});crenels(p,mx,H+3.6,mz,gw+2,T+1.4,stone);flagPole(p,st,mx+3,mz+1.2,12);}
      else{p.box(len,H,T,stone,{x:mx,y:H/2,z:mz,ry:ang,jit:.08});for(let k=0;k<Math.round(len/2.4);k++){const f=(k+.5)/Math.round(len/2.4),px=x+(x2-x)*f,pz=z+(z2-z)*f;p.box(1.2,1.3,T,stone,{x:px,y:H+.65,z:pz,ry:ang});}}}
    // corner towers
    if(wood){p.box(3,H+4,3,0x6a4a2a,{x,y:(H+4)/2,z});p.cone(3,3,0x8a6a42,{x,y:H+5.5,z,seg:4,ry:PI/4});}
    else if(arch==='human'||arch==='elf'||arch==='sun')roundTower(p,x,z,2.6+(castle?.6:0),H+4+(castle?3:0),stone,arch==='sun'?0xe8b84a:st.roof,{windows:1});
    else squareTower(p,x,z,4+(castle?1:0),H+4+(castle?3:0),stone,st.roof,{flat:true});
  }
}
// ---------------------------------------------------------------- wonders
const WONDER={
  hanging:(p,st)=>{for(let i=0;i<4;i++){const w=16-i*3.4;p.box(w,3.2,w,0xd8c8a0,{y:1.6+i*3.2,jit:.05});for(let k=0;k<6;k++){const a=k/6*6.283;p.ico(1.4,k%2?0x3f8a3a:0x5aa04a,{x:Math.cos(a)*w*.48,y:3.6+i*3.2,z:Math.sin(a)*w*.48,d:1});}}p.box(1.4,12,.3,0x7ad8ff,{y:6,z:8.1,e:.5});p.box(1.4,8,.3,0x7ad8ff,{x:4,y:4,z:8.1,e:.5});p.ico(2.4,0x4a9a3a,{y:15,d:1});},
  library:(p,st)=>{p.box(18,9,12,0xe8e0cc,{y:4.5});p.box(20,1.2,14,0xd8c8a0,{y:9.6});p.ext([[-10,0],[10,0],[0,5]],14,0xd8c8a0,{y:10.2,ry:0,rx:0,sz:1});for(let i=0;i<7;i++)p.cyl(.8,.9,8,0xf4efe2,{x:-8.4+i*2.8,y:4.5,z:7,seg:10});p.sph(5,0x4a6a9a,{y:12,ts:0,tl:1.6,...MT.metal,r:.35});p.box(4,5,.3,0x3a2a1a,{y:2.5,z:6.2});},
  oracle:(p,st)=>{p.cyl(10,11,2,0xe8e0d0,{y:1,seg:20});for(let i=0;i<10;i++){const a=i/10*6.283;p.cyl(.8,.9,10,0xf4efe2,{x:Math.cos(a)*8,y:7,z:Math.sin(a)*8,seg:10});}p.cyl(9,9,1.2,0xe8e0d0,{y:12.6,seg:20});p.sph(8.6,0xa8c8d8,{y:13,ts:0,tl:1.4,...MT.metal,r:.3});p.sph(2,0xb8a0ff,{y:6,e:2.6});p.torus(3.2,.25,0xd8c8ff,{y:6,rx:1.2,e:2});},
  forge:(p,st)=>{p.ico(12,0x6a5e54,{y:2,sy:.9,d:1,noise:4,nseed:5,flat:true});p.box(10,8,4,0x5a5048,{y:4,z:9});p.box(6,6,.4,0xff8030,{y:3,z:11.2,e:2.2});p.box(9,2,4,0x3a3a3c,{y:13,z:2,...MT.metal});p.box(5,3,3,0x3a3a3c,{y:10.5,z:2,...MT.metal});p.cyl(1.6,2,10,0x4a4440,{x:-5,y:14,z:-3,seg:8});p.sph(2,0xff8030,{x:-5,y:19.6,z:-3,e:2.4});},
  spire:(p,st)=>{for(let i=0;i<9;i++)p.box(6-i*.5,4,6-i*.5,i%2?0x5a3a8a:0x7a5aaa,{y:2+i*4,ry:i*.35});p.cyl(0,2.2,8,0x9af0ff,{y:41,seg:6,e:2.4,flat:true});for(const sd of[-1,1])p.ext([[0,0],[8,6],[12,2],[9,0],[12,-3],[6,-2]],.5,0x6a3a3a,{x:sd*2,y:24,rz:sd>0?0:PI,ry:sd>0?0:PI});},
};
// ---------------------------------------------------------------- lairs, sites, natural wonders
const LAIRB={
  goblin:p=>{for(let i=0;i<3;i++){const a=i*2.1;p.cone(4.2,6.4,i%2?0x6a5a3a:0x7a6a42,{x:Math.cos(a)*9,y:3.2,z:Math.sin(a)*9,seg:6,jit:.25});}p.limb([0,0,0],[0,12,0],.6,.5,0x5a3a22,{seg:5});p.sph(1.4,0xe6dcc0,{y:12.6});for(const sd of[-1,1])p.cone(.5,2,0x6aa83a,{x:sd*1.6,y:12.6,rz:-sd*1.2,seg:4});p.cone(1.4,2.8,0xff7a2a,{x:3,y:1.4,z:5,seg:6,e:2.2});for(let i=0;i<5;i++)p.cyl(.2,.2,2.6,0xe6dcc0,{x:-4+i,y:.3,z:6,rz:1.57,ry:i});},
  ogre:p=>{p.ico(13,0x6a6258,{y:1,sy:.65,d:1,noise:4,nseed:8,flat:true});p.sph(5,0x0c0a08,{y:2,z:8,sy:1.1,sz:.5});p.cyl(4,3,4,0x3a3a3a,{x:-8,y:2,z:6,seg:10,...MT.metal});p.sph(3.4,0x7a8a3a,{x:-8,y:4,z:6,sy:.2,e:.3});for(let i=0;i<6;i++)p.cyl(.4,.3,3.6,0xe6dcc0,{x:6+i*.8,y:.5,z:8-i*.6,rz:1.4,ry:i});p.sph(1.6,0xe6dcc0,{x:5,y:1,z:10});},
  troll:p=>{for(let i=0;i<5;i++){const a=i*1.3;p.ico(5+i%2*2,0x6a6a62,{x:Math.cos(a)*7,y:3,z:Math.sin(a)*5,d:1,noise:2,nseed:i,flat:true,paint:(lp,c)=>{if(lp.y>2)c.lerp(new T3.Color(0x4a6a2a),.6);}});}p.sph(4,0x0a0a08,{y:2,z:6,sz:.4});p.box(10,1.2,3,0x7a7468,{x:9,y:4,z:2,rz:.3});for(let i=0;i<4;i++)p.cyl(.4,.3,3,0xe6dcc0,{x:-4+i,y:.4,z:9,rz:1.5,ry:i*.7});},
  wyrm:p=>{for(let i=0;i<9;i++){const a=i/9*6.283;p.ico(3+(i%3),0x3a3230,{x:Math.cos(a)*10,y:2,z:Math.sin(a)*10,d:1,noise:1.4,nseed:i,flat:true});}p.cyl(9,10,1,0x2a1a10,{y:.5,seg:14});for(let i=0;i<3;i++)p.sph(2,0xd8c8a0,{x:(i-1)*3.4,y:2.4,z:(i%2)*2,sy:1.3,paint:(lp,c)=>{if(vnoise(lp.x*2,lp.y*2,3)>.6)c.set(0x8a5a2a);}});p.cone(2,4,0xff5a1a,{x:4,y:2,z:-4,seg:6,e:2.6});p.sph(1.2,0xff8a2a,{x:-4,y:1,z:-3,e:2.6});},
};
const SITEB={
  ruins:p=>{for(let i=0;i<5;i++){const a=i*1.25,h=4+(i%3)*3;p.cyl(1.2,1.3,h,0xd8d0c0,{x:Math.cos(a)*8,y:h/2,z:Math.sin(a)*7,seg:10,jit:.1});}p.box(10,1.4,2,0xd0c8b8,{y:9,x:-2,z:-6,rz:.06});for(let i=0;i<6;i++)p.ico(1.4,0xc8c0b0,{x:(i-3)*2.6,y:.6,z:4+(i%2)*2,flat:true});p.ico(2.4,0x4a7a2a,{x:4,y:1,z:-2,d:1});},
  shrine:p=>{for(let i=0;i<6;i++){const a=i/6*6.283;p.box(2.2,7+(i%2)*2,1.4,0x9a958a,{x:Math.cos(a)*9,y:4,z:Math.sin(a)*9,ry:-a,flat:true,noise:.4});}p.cyl(3,3.6,1.4,0xd8d0c0,{y:.7,seg:10});p.ext(UP.crescent(2.6),.6,0xd8e0ff,{y:6,e:1.8,...MT.gold});p.sph(.8,0xb8c8ff,{y:4.4,e:2.6});},
  tower:p=>{p.cyl(5,6,20,0x8a8478,{y:10,seg:12,jit:.12});p.cyl(5.4,5.4,2,0x7a7468,{y:20,seg:12,open:true});for(let i=0;i<5;i++){const a=i*1.3;p.box(1.6,2+(i%3),1.6,0x8a8478,{x:Math.cos(a)*5,y:21.5,z:Math.sin(a)*5});}p.box(1.2,2,.3,0x6af0ff,{y:14,z:5.6,e:2.2});for(let i=0;i<5;i++)p.ico(1.6,0x8a8478,{x:6+i,y:.6,z:5-i*1.4,flat:true});},
  antiquity:p=>{p.cyl(7,6,1.2,0x6a4a2a,{y:-.2,seg:12});for(let i=0;i<4;i++){p.box(.4,3,.4,0x6a4a2a,{x:-8+i*5.3,y:1.5,z:-8});}p.box(16,.25,.2,0xd8c8a0,{y:2.6,z:-8});p.cone(4,5,0xd8c69a,{x:8,y:2.5,z:-4,seg:4,ry:.4});p.box(3,2,2,0x8a6a3a,{x:-7,y:1,z:4});p.box(2.4,1.6,2,0x7a5a32,{x:-6,y:2.8,z:4.4});p.sph(1.4,0xd9a64a,{x:1,y:.6,z:1,...MT.gold,e:.3});p.cyl(.6,.8,3,0xc8a87a,{x:-1.6,y:.8,z:-1,rx:1.2,seg:8});},
};
const NWB={
  worldtree:p=>{p.limb([0,0,0],[0,26,0],7,4,0x5a4632,{seg:12});for(let i=0;i<7;i++){const a=i*.9;p.limb([0,3,0],[Math.cos(a)*14,-1,Math.sin(a)*14],3,1,0x5a4632,{seg:6});p.limb([0,20,0],[Math.cos(a)*16,30,Math.sin(a)*16],2.4,1.2,0x5a4632,{seg:6});}
    for(let i=0;i<16;i++){const a=i*2.4,r=i?9+Math.sqrt(i)*3:0;p.ico(9,i%3?0x3f8a3a:0x5aa04a,{x:Math.cos(a)*r,y:34+Math.sin(i)*4,z:Math.sin(a)*r,d:1,noise:3,nseed:i,sy:.7,grad:lp=>.7+.4*AE.clamp(lp.y/9+.5,0,1)});}for(let i=0;i<14;i++)p.sph(.7,0xbfff9a,{x:Math.cos(i)*12,y:24+Math.sin(i*3)*6,z:Math.sin(i)*12,e:2.4});},
  moonspire:p=>{p.torus(16,4,0x8a8a94,{rx:PI/2,y:0,rs:6,ts:20,jit:.2});p.cyl(15,15,.6,0x2a3044,{y:-.5,seg:20});p.cyl(0,3.4,30,0xdfe8ff,{y:15,seg:6,...MT.metal,e:.6,flat:true});p.sph(2.4,0xcfe0ff,{y:31,e:2.4});for(let i=0;i<6;i++){const a=i/6*6.283;p.cyl(0,1.2,8,0xb8c8ff,{x:Math.cos(a)*8,y:4,z:Math.sin(a)*8,seg:5,e:1.2,flat:true});}},
  dragonbone:p=>{for(let i=0;i<7;i++){const x=-18+i*6;p.torus(9-Math.abs(i-3)*1.2,1,0xe6dcc0,{x,y:0,arc:PI,ry:PI/2,rs:5,ts:12,...MT.bone});}p.cyl(1.4,1.4,44,0xe6dcc0,{y:9,rz:PI/2,seg:8,...MT.bone});p.sph(5,0xe6dcc0,{x:24,y:6,sx:1.6,...MT.bone});for(const sd of[-1,1]){p.sph(1.4,0x0a0806,{x:27,y:7.5,z:sd*2.6});p.limb([22,10,sd*2],[16,16,sd*4],1,.3,0xe6dcc0,{seg:5});}},
  mirrorlake:p=>{p.cyl(22,22,.4,0xcfe6f0,{y:.2,seg:28,m:1,r:.02});p.torus(22,1.6,0x6a6a62,{rx:PI/2,y:0,rs:5,ts:28,jit:.2});for(let i=0;i<10;i++){const a=i/10*6.283;p.ico(2+(i%3),0x7a7468,{x:Math.cos(a)*24,y:1,z:Math.sin(a)*24,flat:true,d:1});}for(let i=0;i<6;i++)p.cone(.3,5,0x7a8a46,{x:Math.cos(i)*20,y:2.5,z:Math.sin(i)*20,seg:3});},
  starfall:p=>{p.torus(15,3,0x5a5050,{rx:PI/2,rs:6,ts:20,jit:.2});p.cyl(14,14,.6,0x1a1420,{y:-.4,seg:20});for(let i=0;i<9;i++){const a=i/9*6.283,r=i?8:0,h=6+(i%3)*4;p.cyl(0,1.6+(i%2),h,i%2?0x9af0ff:0xd8a0ff,{x:Math.cos(a)*r,y:h/2,z:Math.sin(a)*r,rx:Math.sin(a)*.3,rz:Math.cos(a)*.3,seg:5,e:2,flat:true});}},
};
// ---------------------------------------------------------------- per-city build
function cityGeo(c){
  const st=AE.fstyle(c.o),arch=archOf(st),tier=cityTier(c.pop),cap=!!c.cap,walled=c.bld&&c.bld.includes('walls'),castle=c.bld&&c.bld.includes('castle');
  const p=new AE.Prefab(),R=AE.rng(c.id*977+c.o*31+7),plaza=[16,22,28,33][tier];
  const ground=arch==='necro'||arch==='shadow'?0x5c5668:arch==='orc'||arch==='warclan'||arch==='wild'?0x6a5236:arch==='dwarf'||arch==='iron'?0x7a7064:0xb8a888;
  p.cyl(plaza,plaza+1.4,1.6,ground,{y:.2,seg:6,ry:PI/6,jit:.08,r:.95});
  // streets
  for(let i=0;i<3;i++)p.box(plaza*1.8,.3,3.4,shade(ground,.85),{y:1.05,ry:i*PI/3,r:.95});
  keep(p,st,arch,tier,cap);
  const nH=[4,8,12,16][tier];const slots=[];
  for(let i=0;i<nH;i++){let tries=0;while(tries++<40){const a=R()*6.283,r=plaza*(.48+R()*.48);const x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<9&&z>-12&&z<8)continue;if(slots.some(q=>(q[0]-x)**2+(q[1]-z)**2<70))continue;if(z>plaza*.55&&Math.abs(x)<5)continue;slots.push([x,z]);house(p,st,arch,x,z,-a+PI/2+(R()-.5)*.4,.78+R()*.22,R);break;}}
  if(walled||castle)walls(p,st,arch,plaza+3,castle);
  else if(tier>=1&&(arch==='orc'||arch==='warclan'||arch==='wild'))walls(p,st,arch,plaza+2,false);
  // banners
  flagPole(p,st,-plaza*.55,plaza*.45,14+tier*2);if(tier>=2)flagPole(p,st,plaza*.6,-plaza*.2,14+tier*2);
  // wonders inside the city footprint
  (c.won||[]).forEach((w,i)=>{const a=-PI*.75+i*1.15,r=plaza*.72;p.pushT(Math.cos(a)*r,0,Math.sin(a)*r-2,0,-a,0,.52);(WONDER[w]||WONDER.library)(p,st);p.pop();});
  const g=p.build();g.userData.keep=false;return g;
}
function outskirtsGeo(c,tiles){
  const st=AE.fstyle(c.o),arch=archOf(st),p=new AE.Prefab(),R=AE.rng(c.id*31+5),cen=worldPos(c.x,c.y);
  for(const t of tiles){const w=worldPos(t.x,t.y),n=1+(R()<.5?1:0);for(let i=0;i<n;i++){const a=R()*6.283,r=S*(.3+R()*.35),lx=Math.cos(a)*r,lz=Math.sin(a)*r;p.pushT(w.x-cen.x+lx,AE.heightLocal(t,lx,lz)-AE.standY(tileAt(c.x,c.y))-.2,w.y-cen.y+lz);house(p,st,arch,0,0,R()*6.28,.62,R);p.pop();}
    if(R()<.6&&arch!=='necro'&&arch!=='shadow'){const a=R()*6.283,lx=Math.cos(a)*S*.42,lz=Math.sin(a)*S*.42;p.pushT(w.x-cen.x+lx,AE.heightLocal(t,lx,lz)-AE.standY(tileAt(c.x,c.y))-.1,w.y-cen.y+lz,0,R()*3,0,.45);for(let k=0;k<5;k++)p.box(30,1.2,2.4,k%2?0xd9b552:0x8fa848,{z:-6+k*3,y:.6,jit:.15});p.pop();}}
  return p.build();
}
function landmarkGeo(t){
  const p=new AE.Prefab();
  if(t.nw&&NWB[t.nw])NWB[t.nw](p);
  else if(t.camp){const k=typeof t.camp==='string'?t.camp:'goblin';(LAIRB[k]||LAIRB.goblin)(p);}
  else if(t.site&&SITEB[t.site])SITEB[t.site](p);
  return p.build();
}
AE.landmarkTop=t=>t.nw?(t.nw==='worldtree'?44:t.nw==='moonspire'?34:t.nw==='dragonbone'?16:t.nw==='starfall'?14:6):t.camp?14:t.site==='tower'?24:t.site==='shrine'?12:10;

// ---------------------------------------------------------------- sync
const CR={cities:new Map(),marks:new Map(),group:null,last:0};AE.citiesRT=CR;
AE.syncCities=function(now){
  if(!G)return;if(!CR.group||!CR.group.parent){CR.group=new T3.Group();threeWorld.scene.add(CR.group);CR.cities.clear();CR.marks.clear();}
  if(now-CR.last<350)return;CR.last=now;const v=G.vis[G.player];
  const live=new Set();
  for(const c of G.cities){live.add(c.id);const vis=v[idx(c.x,c.y)];
    const outs=[];if(cityTier(c.pop)>=1){const cand=nbrs(c.x,c.y).filter(t=>!AE.isWater(t)&&!T[t.t].block&&t.city==null&&!t.imp&&!t.camp&&!t.site&&!t.nw&&t.f!=='forest'&&t.f!=='jungle'&&t.t!=='hills'&&t.own===c.o);const n=Math.min(cand.length,cityTier(c.pop)+Math.floor(c.pop/6));for(let i=0;i<n;i++)outs.push(cand[(i*2+c.id)%cand.length]);}
    const sig=[c.o,cityTier(c.pop),c.cap?1:0,(c.bld||[]).includes('walls')?1:0,(c.bld||[]).includes('castle')?1:0,(c.won||[]).join(','),outs.map(t=>t.x+'.'+t.y).join(';')].join('|');
    let rec=CR.cities.get(c.id);
    if(!rec||rec.sig!==sig){if(rec){AE.disposeObj(rec.group);}const g=new T3.Group();const t=tileAt(c.x,c.y),w=worldPos(c.x,c.y),y=AE.standY(t);
      const m=new T3.Mesh(cityGeo(c),AE.prefabMat);m.castShadow=true;m.receiveShadow=true;g.add(m);
      if(outs.length){const o=new T3.Mesh(outskirtsGeo(c,outs),AE.prefabMat);o.castShadow=true;o.receiveShadow=true;g.add(o);}
      if((c.bld||[]).includes('harbor')){const wt=nbrs(c.x,c.y).find(n=>AE.isWater(n));if(wt){const ww=worldPos(wt.x,wt.y),dx=ww.x-w.x,dz=ww.y-w.y,ang=Math.atan2(dz,dx);const hp=new AE.Prefab();hp.pushT(dx*.55,AE.WATER_Y-y+.6,dz*.55,0,-ang,0);for(let i=0;i<6;i++)hp.box(3,.7,6.4,0x7a5a36,{x:i*3,jit:.12});for(let i=0;i<4;i++)hp.cyl(.5,.5,6,0x5a3a22,{x:i*5,y:-2.4,z:3.4,seg:6});hp.pushT(10,-.8,-8,0,.3,0,.45);UP.ship(hp,AE.fstyle(c.o),{war:false});hp.pop();hp.pop();const hm=new T3.Mesh(hp.build(),AE.prefabMat);hm.castShadow=true;g.add(hm);}}
      g.position.set(w.x,y,w.y);g.children[0].scale.setScalar(1.18);CR.group.add(g);rec={sig,group:g};CR.cities.set(c.id,rec);}
    rec.group.visible=vis>0;}
  for(const [id,rec] of CR.cities)if(!live.has(id)){AE.disposeObj(rec.group);CR.cities.delete(id);}
  // landmarks
  const liveM=new Set();
  for(const t of G.tiles){if(!t.nw&&!t.camp&&!t.site)continue;const key=t.y*G.W+t.x;liveM.add(key);const sig=(t.nw||'')+'|'+(t.camp||'')+'|'+(t.site||'');let rec=CR.marks.get(key);
    if(!rec||rec.sig!==sig){if(rec)AE.disposeObj(rec.mesh);const m=new T3.Mesh(landmarkGeo(t),AE.prefabMat);const w=worldPos(t.x,t.y);m.position.set(w.x,AE.isWater(t)?AE.WATER_Y:AE.standY(t)-.3,w.y);m.rotation.y=AE.tileRand(t,61)*.8-.4;m.castShadow=true;m.receiveShadow=true;CR.group.add(m);rec={sig,mesh:m};CR.marks.set(key,rec);}
    rec.mesh.visible=v[key]>0;}
  for(const [k,rec] of CR.marks)if(!liveM.has(k)){AE.disposeObj(rec.mesh);CR.marks.delete(k);}
};
AE.cityBuilders={keep,house,walls,WONDER,LAIRB,SITEB,NWB,cityGeo};
})();
