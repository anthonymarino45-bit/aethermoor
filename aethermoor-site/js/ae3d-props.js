/* Realms of Aethermoor V5.7.0 - nature, improvement and resource prop library (merged vertex-coloured geometry, instanced per map chunk). */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const T3=THREE,P=()=>new AE.Prefab();
const PROPS={};AE.PROPS=PROPS;
const def=(k,fn)=>{Object.defineProperty(PROPS,k,{configurable:true,enumerable:true,get(){const g=fn();g.userData.keep=true;Object.defineProperty(PROPS,k,{value:g,enumerable:true});return g;}});};
const heightGrad=(lo,hi,y0,y1)=>lp=>lo+(hi-lo)*AE.clamp((lp.y-y0)/(y1-y0),0,1);
const mixTo=(hex,amt)=>{const c=new T3.Color(hex);return (lp,col)=>col.lerp(c,amt(lp));};

// ---------------------------------------------------------------- trees
function pine(p,{h=1,w=1,col=0x24502c,snow=0,seed=1}={}){
  p.cyl(.55*w,.85*w,4*h,0x5a3d25,{y:2*h,seg:6,r:.95});
  const tiers=4;for(let i=0;i<tiers;i++){const r=(4.9-i*1.05)*w,hh=(6.2-i*.6)*h,y=(3.2+i*2.65)*h+hh/2;
    const c=AE.hsl(col,0,0,(i-1.5)*.025);
    p.cone(r,hh,c,{y,seg:8,noise:.7,nseed:seed+i,r:.92,grad:lp=>.78+.38*AE.clamp((lp.y+hh/2)/hh,0,1),paint:snow?(lp,cc)=>{const t=AE.clamp((lp.y+hh*.15)/(hh*.5),0,1)*snow;cc.lerp(new T3.Color(0xeef4f8),t);}:null});}
  return p;
}
function broad(p,{h=1,w=1,cols=[0x3c7a31,0x4f8c38,0x2f6a2b],seed=1,n=5}={}){
  p.limb([0,0,0],[0,6.2*h,0],1.05*w,.7*w,0x5b4029,{seg:7,caps:false});
  p.limb([0,4.6*h,0],[2.2*w,7.2*h,.6],.45*w,.3*w,0x5b4029,{seg:5,caps:false});p.limb([0,4.2*h,0],[-2.0*w,6.8*h,-.8],.45*w,.3*w,0x5b4029,{seg:5,caps:false});
  const R=AE.rng(seed*31+7);
  // canopy built from many small irregular leaf clumps so it reads as foliage, not a ball
  const clumps=n+5;
  for(let i=0;i<clumps;i++){const a=i*2.399+R()*.5,rr=(i===0?0:1.2+Math.sqrt(i/clumps)*3.4)*w,y=(8.6+(1-rr/(4.6*w))*2.6+(R()-.5)*1.6)*h,r=(2.0+R()*1.1)*w,c=cols[i%cols.length];
    p.ico(r,c,{x:Math.cos(a)*rr,y,z:Math.sin(a)*rr,d:1,noise:r*.55,nseed:seed*7+i,r:.92,sy:.8,grad:lp=>.62+.55*AE.clamp((lp.y+r*.8)/(1.6*r),0,1),jit:.22});}
  return p;
}
function cypress(p,{h=1,col=0x2f5f2e,seed=1}={}){p.cyl(.5,.7,3,0x5a3d25,{y:1.5,seg:6});p.sph(2.6,col,{y:9*h,sy:2.6*h,ws:9,hs:8,noise:.8,nseed:seed,grad:heightGrad(.75,1.15,-2.6,2.6)});return p;}
function palm(p,{h=1,seed=1}={}){
  const R=AE.rng(seed*13+3);let x=0,y=0,z=0;const lean=.25+R()*.25,ang=R()*6.28;
  for(let i=0;i<6;i++){const nx=x+Math.cos(ang)*lean*1.6*(i/5),ny=y+2.5*h,nz=z+Math.sin(ang)*lean*1.6*(i/5);p.limb([x,y,z],[nx,ny,nz],.75-i*.05,.7-i*.05,i%2?0x7a5a35:0x8c6a40,{seg:6,caps:false});x=nx;y=ny;z=nz;}
  p.sph(1.2,0x6a4a2a,{x,y:y-.2,z});
  for(let i=0;i<8;i++){const a=i/8*6.283+R()*.3;p.pushT(x,y,z,0,-a,0);p.pushT(0,0,0,0,0,-(.35+R()*.35));
    p.cone(1.25,10*h,i%2?0x3f8f3a:0x4f9f40,{x:5*h,y:-1.2,z:0,rz:-1.57,sz:.28,seg:4,grad:heightGrad(1.1,.8,-5,5)});p.pop();p.pop();}
  for(let i=0;i<3;i++)p.sph(.6,0x5a3f22,{x:x+Math.cos(i*2.1)*.9,y:y-1,z:z+Math.sin(i*2.1)*.9,ws:6,hs:5});
  return p;
}
function jungleTree(p,{seed=1}={}){
  const R=AE.rng(seed*17+5);p.limb([0,0,0],[.6,12,.3],1.2,.75,0x6b5236,{seg:7,caps:false});
  for(let i=0;i<4;i++){const a=i*1.57+R()*.5;p.limb([.5,9+i*.6,.2],[.5+Math.cos(a)*4,12.5+R(),.2+Math.sin(a)*4],.4,.3,0x6b5236,{seg:5,caps:false});}
  const cols=[0x1f6a2c,0x2d8a3a,0x16552a,0x3a9a3e];
  for(let i=0;i<6;i++){const a=i/6*6.283+R()*.4,rr=i?3.6:0;p.sph(i?3.4:4.4,cols[i%4],{x:.5+Math.cos(a)*rr,y:13.5+R()*1.5,z:.3+Math.sin(a)*rr,sy:.55,ws:9,hs:6,noise:1.1,nseed:seed+i,grad:heightGrad(.72,1.18,-2,2),jit:.12});}
  for(let i=0;i<3;i++)p.limb([.5+Math.cos(i*2.1)*3,12.5,Math.sin(i*2.1)*3],[.8+Math.cos(i*2.1)*3.4,4+R()*3,Math.sin(i*2.1)*3.4],.12,.1,0x2f6a2a,{seg:4,caps:false});
  return p;
}
function bush(p,{col=0x3f7a30,seed=1,s=1}={}){for(let i=0;i<3;i++){const a=i*2.1+seed;p.ico(1.9*s*(1-i*.15),AE.hsl(col,0,0,(i-1)*.04),{x:Math.cos(a)*1.4*s,y:1.3*s,z:Math.sin(a)*1.4*s,d:1,noise:.7,nseed:seed+i,sy:.8,grad:heightGrad(.7,1.15,-1.5,1.5)});}return p;}
function fern(p,{seed=1}={}){const R=AE.rng(seed);for(let i=0;i<7;i++){const a=i/7*6.283+R()*.4;p.pushT(0,.3,0,0,-a,0);p.cone(.9,6,i%2?0x3a8a34:0x2c7a2a,{x:2.6,y:.8,rz:-1.2,sz:.25,seg:4});p.pop();}return p;}
function rock(p,{r=2.5,col=0x7b756c,seed=1,snow=0,moss=0,sy=.7}={}){p.ico(r,col,{d:1,noise:r*.55,nseed:seed,flat:true,sy,r:.95,jit:.18,paint:(lp,cc)=>{const up=lp.y/r;if(snow&&up>.15)cc.lerp(new T3.Color(0xf0f5f8),AE.clamp((up-.15)*2.5,0,1)*snow);if(moss&&up>.35)cc.lerp(new T3.Color(0x5b7a34),moss*.8);}});return p;}
function cactus(p,{h=1,seed=1}={}){const c=0x5f8f45;p.cyl(1.05,1.15,9*h,c,{y:4.5*h,seg:8,flat:true,grad:heightGrad(.8,1.1,-4.5,4.5)});p.sph(1.05,c,{y:9*h,ws:8,hs:5,ts:0,tl:1.6});
  const R=AE.rng(seed);for(const s of[-1,1]){if(R()<.25)continue;const y=3.5*h+R()*2*h;p.limb([0,y,0],[s*2.8,y+.3,0],.6,.6,c,{seg:7,caps:true});p.limb([s*2.8,y+.3,0],[s*2.8,y+3.5*h,0],.6,.55,c,{seg:7});}return p;}
function deadTree(p,{seed=1}={}){const R=AE.rng(seed);p.limb([0,0,0],[.3,7,0],.7,.35,0x6a5a4a,{seg:5});for(let i=0;i<4;i++){const a=R()*6.28,y=3+i*1.1;p.limb([.15,y,0],[Math.cos(a)*3,y+2+R()*1.5,Math.sin(a)*3],.25,.12,0x6a5a4a,{seg:4});}return p;}
function reeds(p,{seed=1}={}){const R=AE.rng(seed);for(let i=0;i<9;i++){const x=(R()-.5)*4,z=(R()-.5)*4,h=3+R()*3;p.cone(.22,h,i%3?0x7a8a46:0x9a9a52,{x,y:h/2,z,seg:3,rx:(R()-.5)*.3,rz:(R()-.5)*.3});if(i%3===0)p.cyl(.28,.28,1,0x6a4a2a,{x,y:h*.8,z,seg:5});}return p;}
function tuft(p,{col=0x5b8f3a,seed=1}={}){const R=AE.rng(seed);for(let i=0;i<6;i++)p.cone(.35,2+R()*1.5,AE.hsl(col,0,0,(R()-.5)*.1),{x:(R()-.5)*1.6,y:1,z:(R()-.5)*1.6,seg:3,rx:(R()-.5)*.5,rz:(R()-.5)*.5});return p;}
function flowerPatch(p,{col=0xf4f1e4,seed=1}={}){const R=AE.rng(seed);for(let i=0;i<10;i++){const x=(R()-.5)*5,z=(R()-.5)*5;p.cyl(.08,.08,1.4,0x3f7a2a,{x,y:.7,z,seg:3});p.sph(.45,col,{x,y:1.5,z,ws:5,hs:4,e:.05});}return p;}

for(let v=0;v<3;v++){def('pine'+v,()=>pine(P(),{h:[1,1.18,.9][v],w:[1,.82,1.15][v],col:[0x24502c,0x1f472a,0x2e5a2e][v],seed:v*5+1}).build());
  def('pineSnow'+v,()=>pine(P(),{h:[1,1.15,.92][v],w:[1,.85,1.1][v],col:[0x2a4f36,0x234733,0x305a3a][v],snow:1,seed:v*5+2}).build());}
for(let v=0;v<3;v++){def('broad'+v,()=>broad(P(),{h:[1,1.1,.9][v],w:[1,.9,1.12][v],cols:[[0x2f6527,0x3f7a2e,0x264f20],[0x3a7026,0x4f8434,0x2d5a22],[0x2c5f2c,0x3c7436,0x22502a]][v],seed:v*11+3}).build());}
for(let v=0;v<3;v++){def('autumn'+v,()=>broad(P(),{h:[1,.95,1.08][v],w:[1,1.05,.92][v],cols:[[0xa9692c,0xc0913a,0x7c4a24],[0xb8903a,0xc9a84a,0x8a6a2a],[0x8f4a26,0xa9692c,0x6e3a1f]][v],seed:v*19+5}).build());}
// low-detail stand-ins used when the camera is zoomed far out (same silhouettes and colours, a fraction of the triangles)
function pineLo(col,snow){const p=P();p.cyl(.6,.8,4,0x5a3d25,{y:2,seg:4});for(let i=0;i<2;i++){const r=4.6-i*1.9,hh=9-i*2,y=4+i*5+hh/2;p.cone(r,hh,AE.hsl(col,0,0,i*.04),{y,seg:6,paint:snow?(lp,cc)=>{if(lp.y>0)cc.lerp(new T3.Color(0xeef4f8),.7);}:null,grad:lp=>.8+.3*AE.clamp((lp.y+hh/2)/hh,0,1)});}return p.build();}
function broadLo(cols){const p=P();p.cyl(.9,1.1,7,0x5b4029,{y:3.5,seg:5});for(let i=0;i<3;i++){const a=i*2.1;p.ico(3.3,cols[i%3],{x:Math.cos(a)*1.8,y:9.6+(i%2),z:Math.sin(a)*1.8,d:0,noise:.8,nseed:i,sy:.85,grad:lp=>.7+.45*AE.clamp(lp.y/3.3+.5,0,1)});}return p.build();}
def('pineLo',()=>pineLo(0x24502c));def('pineSnowLo',()=>pineLo(0x2a4f36,1));
def('broadLo',()=>broadLo([0x2f6527,0x3f7a2e,0x264f20]));def('autumnLo',()=>broadLo([0xa9692c,0xc0913a,0x7c4a24]));
def('palmLo',()=>{const p=P();p.limb([0,0,0],[1,13,0],.7,.5,0x7a5a35,{seg:4,caps:false});for(let i=0;i<5;i++){const a=i/5*6.283;p.cone(1.2,9,0x3f8f3a,{x:1+Math.cos(a)*4,y:12.4,z:Math.sin(a)*4,rz:Math.cos(a)*1.3,rx:-Math.sin(a)*1.3,sz:.3,seg:3});}return p.build();});
def('jungleLo',()=>{const p=P();p.limb([0,0,0],[.6,12,.3],1.1,.7,0x6b5236,{seg:4,caps:false});for(let i=0;i<3;i++){const a=i*2.1;p.sph(4,i%2?0x2d8a3a:0x1f6a2c,{x:Math.cos(a)*2.6,y:13.5,z:Math.sin(a)*2.6,sy:.55,ws:6,hs:4});}return p.build();});
AE.LOD={pine0:'pineLo',pine1:'pineLo',pine2:'pineLo',pineSnow0:'pineSnowLo',pineSnow1:'pineSnowLo',pineSnow2:'pineSnowLo',broad0:'broadLo',broad1:'broadLo',broad2:'broadLo',autumn0:'autumnLo',autumn1:'autumnLo',autumn2:'autumnLo',palm0:'palmLo',palm1:'palmLo',jungle0:'jungleLo',jungle1:'jungleLo'};
AE.TINY=new Set(['tuft','tuftDry','flowersW','flowersY','flowersP','fern','reeds','bush0','bush1','bush2','rock0','rockSand0','rockSnow0','rockMoss0','roadJunction']);
def('cypress',()=>cypress(P(),{seed:4}).build());
for(let v=0;v<2;v++)def('palm'+v,()=>palm(P(),{h:v?1.12:1,seed:v*7+9}).build());
for(let v=0;v<2;v++)def('jungle'+v,()=>jungleTree(P(),{seed:v*9+2}).build());
for(let v=0;v<3;v++)def('bush'+v,()=>bush(P(),{col:[0x3f7a30,0x56813a,0x2e6a2f][v],seed:v*3+1,s:[1,1.2,.85][v]}).build());
def('fern',()=>fern(P(),{seed:3}).build());
for(let v=0;v<3;v++){def('rock'+v,()=>rock(P(),{r:[2.2,3.2,4.6][v],col:[0x7b756c,0x857a6c,0x6f6a64][v],seed:v*7+2}).build());def('rockMoss'+v,()=>rock(P(),{r:[3,4.2,5.6][v],col:[0x7a7468,0x80766a,0x6c675f][v],seed:v*5+8,moss:1,sy:.65}).build());def('rockSnow'+v,()=>rock(P(),{r:[2.6,3.6,5][v],col:[0x7c7f86,0x868991,0x73767d][v],seed:v*3+4,snow:1}).build());def('rockSand'+v,()=>rock(P(),{r:[2,3,4.2][v],col:[0xb08a5f,0xa58059,0xb9946a][v],seed:v*2+6,sy:.55}).build());}
for(let v=0;v<2;v++)def('cactus'+v,()=>cactus(P(),{h:v?1.2:.9,seed:v*5+3}).build());
def('deadTree',()=>deadTree(P(),{seed:5}).build());
def('reeds',()=>reeds(P(),{seed:2}).build());
def('tuft',()=>tuft(P(),{seed:3}).build());def('tuftDry',()=>tuft(P(),{col:0xa59a4e,seed:5}).build());
def('flowersW',()=>flowerPatch(P(),{col:0xf4f1e4,seed:2}).build());def('flowersY',()=>flowerPatch(P(),{col:0xf1cf3a,seed:3}).build());def('flowersP',()=>flowerPatch(P(),{col:0xc8a0ea,seed:4}).build());

// ---------------------------------------------------------------- mountains (heightfield discs, faceted rock with snow caps)
function mountainGeo(seed,{R=37,H=44,peaks=null,snowLine=.55,green=1}={}){
  const rnd=AE.rng(seed*101+11),NR=13,NS=34;
  const pk=peaks||[{x:0,z:0,r:R*.95,h:H}];
  if(!peaks){const n=1+(rnd()>.4?1:0)+(rnd()>.7?1:0);for(let i=0;i<n;i++){const a=rnd()*6.28,d=R*(.35+rnd()*.25);pk.push({x:Math.cos(a)*d,z:Math.sin(a)*d,r:R*(.45+rnd()*.2),h:H*(.48+rnd()*.25)});}}
  const hf=(x,z)=>{let h=0;for(const q of pk){const u=Math.hypot(x-q.x,z-q.z)/q.r;if(u<1)h=Math.max(h,q.h*Math.pow(1-u,1.18));}
    const n=vnoise(x*.09+seed,z*.09,seed),rid=1-Math.abs(2*vnoise(x*.16,z*.16+seed,seed+3)-1);h+=(n-.5)*H*.12+rid*H*.13*AE.clamp(h/H,0,1);
    const rr=Math.hypot(x,z)/R;h*=1-AE.smooth(.78,1,rr);return h-1.5*AE.smooth(.85,1,rr);};
  const pts=[];for(let i=0;i<=NR;i++){const row=[];const rho=i/NR;for(let j=0;j<NS;j++){const a=j/NS*6.283+(i%2)*.09;const jr=i&&i<NR?(rnd()-.5)*.05:0;const x=Math.cos(a)*R*(rho+jr),z=Math.sin(a)*R*(rho+jr);row.push([x,hf(x,z),z]);}pts.push(row);}
  const pos=[];const tri=(a,b,c)=>{pos.push(...a,...b,...c);};
  for(let i=0;i<NR;i++)for(let j=0;j<NS;j++){const j2=(j+1)%NS;const a=pts[i][j],b=pts[i][j2],c=pts[i+1][j],d=pts[i+1][j2];if(i===0){tri(pts[0][0],d,c);}else{tri(a,d,c);tri(a,b,d);}}
  // also close the centre fan properly
  const g=new T3.BufferGeometry();const P3=new Float32Array(pos);g.setAttribute('position',new T3.BufferAttribute(P3,3));g.computeVertexNormals();
  const N=g.attributes.normal.array,cnt=P3.length/3,col=new Float32Array(cnt*3),mat=new Float32Array(cnt*3);
  const rock1=new T3.Color(0x6d655c),rock2=new T3.Color(0x968a7b),rock3=new T3.Color(0x5a534c),snow=new T3.Color(0xf3f6f9),snowSh=new T3.Color(0xcdd8e6),grass=new T3.Color(0x56683a),tmp=new T3.Color();
  for(let f=0;f<cnt;f+=3){const cy=(P3[f*3+1]+P3[f*3+4]+P3[f*3+7])/3,cx=(P3[f*3]+P3[f*3+3]+P3[f*3+6])/3,cz=(P3[f*3+2]+P3[f*3+5]+P3[f*3+8])/3,ny=N[f*3+1];
    const hn=cy/H,strata=vnoise(cx*.05,cy*.35,seed+9),nz=vnoise(cx*.2,cz*.2,seed+4);
    tmp.copy(rock1).lerp(rock2,AE.clamp(strata*1.2-.1,0,1));if(nz>.7)tmp.lerp(rock3,.5);
    if(ny<.45)tmp.multiplyScalar(.82);
    const sl=snowLine+(nz-.5)*.18;if(hn>sl&&ny>.38){tmp.lerp(ny>.6?snow:snowSh,AE.clamp((hn-sl)*6,0,1)*AE.clamp((ny-.38)*3,0,1));}
    if(green&&hn<.16&&ny>.55)tmp.lerp(grass,AE.clamp((.16-hn)*6,0,1)*.8);
    for(let k=0;k<3;k++){col[(f+k)*3]=AE.lin(tmp.r);col[(f+k)*3+1]=AE.lin(tmp.g);col[(f+k)*3+2]=AE.lin(tmp.b);mat[(f+k)*3]=0;mat[(f+k)*3+1]=.93;mat[(f+k)*3+2]=0;}}
  g.setAttribute('color',new T3.BufferAttribute(col,3));g.setAttribute('aMat',new T3.BufferAttribute(mat,3));g.computeBoundingSphere();return g;
}
for(let v=0;v<5;v++)def('mount'+v,()=>mountainGeo(v*13+3,{R:38+v*1.5,H:[44,50,40,47,42][v]}));
for(let v=0;v<3;v++)def('mountSmall'+v,()=>mountainGeo(v*29+71,{R:22,H:[24,28,21][v],peaks:[{x:0,z:0,r:21,h:[24,28,21][v]}],snowLine:.62}));
def('hillMound',()=>mountainGeo(301,{R:20,H:9,peaks:[{x:0,z:0,r:20,h:9}],snowLine:9,green:1}));

// ---------------------------------------------------------------- shared small builders
function cottage(p,{x=0,z=0,ry=0,s=1,wall=0xe6dcc4,roof=0xa8452f,timber=0x5a3e28}={}){
  p.pushT(x,0,z,0,ry,0,s);
  p.box(7,5,5.5,wall,{y:2.5,jit:.06});p.box(7.2,.5,5.7,timber,{y:.25});
  for(const sx of[-3.4,3.4])p.box(.45,5,.45,timber,{x:sx,y:2.5,z:2.8});for(const sx of[-3.4,3.4])p.box(.45,5,.45,timber,{x:sx,y:2.5,z:-2.8});
  p.box(7.4,.45,.4,timber,{y:4.9,z:2.85});p.box(7.4,.45,.4,timber,{y:4.9,z:-2.85});
  // gabled roof (two slabs)
  p.box(8.2,.6,3.9,roof,{y:6.4,z:1.45,rx:.72,jit:.08});p.box(8.2,.6,3.9,roof,{y:6.4,z:-1.45,rx:-.72,jit:.08});
  p.ext([[-2.75,0],[2.75,0],[0,2.5]],.2,wall,{x:3.45,y:5,ry:1.5708});p.ext([[-2.75,0],[2.75,0],[0,2.5]],.2,wall,{x:-3.45,y:5,ry:1.5708});
  p.box(1.3,2.2,.2,0x4a3020,{x:-1.2,y:1.1,z:2.8});p.box(1.1,1,.2,0x2c3a4a,{x:1.8,y:2.8,z:2.8,e:.15});
  p.box(1,3,1,0x7a6a5a,{x:2.4,y:7,z:-1});
  p.pop();return p;
}
AE.cottage=cottage;
function fenceRing(p,{rx=20,rz=14,n=14,col=0xb08a5a}={}){const pts=[];for(let i=0;i<n;i++){const a=i/n*6.283;pts.push([Math.cos(a)*rx,Math.sin(a)*rz]);}
  for(let i=0;i<n;i++){const [x,z]=pts[i],[x2,z2]=pts[(i+1)%n];p.box(.55,3.2,.55,AE.shadeHex(col,.85),{x,y:1.6,z});const mx=(x+x2)/2,mz=(z+z2)/2,len=Math.hypot(x2-x,z2-z),ang=Math.atan2(z2-z,x2-x);
    p.box(len,.35,.3,col,{x:mx,y:2.4,z:mz,ry:-ang});p.box(len,.35,.3,col,{x:mx,y:1.3,z:mz,ry:-ang});}return p;}
function animalCow(p,{col=0x7a4a2a,patch=0xf2ede0,horns=1,s=1}={}){p.pushT(0,0,0,0,0,0,s);
  p.sph(2.2,col,{y:3.2,sx:1.55,sy:.95,sz:1,ws:10,hs:7,paint:(lp,c)=>{if(patch&&vnoise(lp.x*1.2+3,lp.z*1.2,4)>.6)c.set(patch);}});
  p.sph(1.05,col,{x:3.6,y:3.9,sx:1.25,ws:8,hs:6});p.box(.8,.5,.9,0xd9b8a0,{x:4.7,y:3.6});
  if(horns){p.cone(.25,1.2,0xe8e0c8,{x:3.6,y:4.9,z:.7,rx:.6,seg:4});p.cone(.25,1.2,0xe8e0c8,{x:3.6,y:4.9,z:-.7,rx:-.6,seg:4});}
  for(const [lx,lz] of [[-2,.9],[-2,-.9],[2,.9],[2,-.9]])p.cyl(.4,.32,2.4,AE.shadeHex(col,.8),{x:lx,y:1.2,z:lz,seg:5});
  p.pop();return p;}
function animalSheep(p,{s=1}={}){p.pushT(0,0,0,0,0,0,s);p.ico(2,0xf1ece0,{y:3,sx:1.4,sz:1.05,d:1,noise:.5,nseed:2});p.sph(.85,0x3a3330,{x:2.8,y:3.4,sx:1.3,ws:7,hs:5});for(const [lx,lz] of [[-1.4,.8],[-1.4,-.8],[1.4,.8],[1.4,-.8]])p.cyl(.28,.25,1.8,0x2e2a28,{x:lx,y:.9,z:lz,seg:4});p.pop();return p;}
function animalHorse(p,{col=0x6a4026,mane=0x2a1a10,s=1}={}){p.pushT(0,0,0,0,0,0,s);
  p.sph(2,col,{y:4.6,sx:1.7,sy:.9,sz:.85,ws:10,hs:7});p.limb([2.6,5,0],[3.8,7.4,0],.9,.65,col,{seg:7});p.sph(.9,col,{x:4.6,y:7.6,sx:1.5,sy:.8,sz:.75,ws:8,hs:6});
  p.box(2.6,.8,.3,mane,{x:3.1,y:7,rz:-.9});p.limb([-3.2,5,0],[-4.2,2.6,0],.35,.2,mane,{seg:5});
  for(const [lx,lz] of [[-2.2,.7],[-2.2,-.7],[2.2,.7],[2.2,-.7]])p.limb([lx,4,lz],[lx,0,lz],.42,.32,AE.shadeHex(col,.85),{seg:5});p.pop();return p;}
function animalDeer(p,{s=1,col=0x9a6a3e}={}){p.pushT(0,0,0,0,0,0,s);p.sph(1.6,col,{y:3.8,sx:1.6,sy:.85,sz:.8,ws:9,hs:6});p.limb([2,4.2,0],[2.8,6.2,0],.6,.45,col,{seg:6});p.sph(.7,col,{x:3.3,y:6.4,sx:1.4,ws:7,hs:5});
  for(const sz of[-1,1]){p.limb([2.8,6.9,sz*.3],[2.4,8.6,sz*1.1],.12,.1,0xd8c8a8,{seg:4});p.limb([2.6,7.8,sz*.7],[3.4,8.8,sz*1.2],.1,.08,0xd8c8a8,{seg:4});}
  for(const [lx,lz] of [[-1.8,.55],[-1.8,-.55],[1.8,.55],[1.8,-.55]])p.limb([lx,3.4,lz],[lx,0,lz],.3,.2,AE.shadeHex(col,.8),{seg:5});p.pop();return p;}
AE.animal={cow:animalCow,sheep:animalSheep,horse:animalHorse,deer:animalDeer};

// ---------------------------------------------------------------- improvements
function farmField(p,{crop=0xd9b552,crop2=0xc79a3c,rows=8}={}){
  p.box(46,.5,34,0x6e512e,{y:.15});
  for(let i=0;i<rows;i++){const z=-15+i*(30/(rows-1));p.box(44,1.5,2.6,i%2?crop:crop2,{y:.9,z,jit:.15,grad:lp=>.8+.3*AE.clamp(lp.y+.75,0,1.5)});}
  return p;
}
def('farmWheat',()=>farmField(P(),{}).build());
def('farmGreen',()=>farmField(P(),{crop:0x7aa543,crop2:0x5f8f36}).build());
def('farmhouse',()=>{const p=P();cottage(p,{x:0,z:0,roof:0xa8452f});p.cyl(2.2,2.6,3.6,0xd8b860,{x:-7,y:1.8,z:3,seg:9});p.cone(2.6,2.4,0xc9a84e,{x:-7,y:4.8,z:3,seg:9});p.cyl(2,2.4,3,0xd8b860,{x:-8,y:1.5,z:-2.5,seg:9});p.cone(2.4,2,0xc9a84e,{x:-8,y:4,z:-2.5,seg:9});return p.build();});
def('mine',()=>{const p=P();
  p.ico(9,0x6f665c,{y:1,sy:.62,d:1,noise:3,nseed:4,flat:true,jit:.2});
  p.box(5.4,5.8,3,0x0d0b0a,{x:0,y:3,z:6.2});
  p.box(.9,6.6,.9,0x6a4a2c,{x:-3,y:3.3,z:7.4});p.box(.9,6.6,.9,0x6a4a2c,{x:3,y:3.3,z:7.4});p.box(7.6,.9,1.1,0x6a4a2c,{y:6.7,z:7.4});
  for(let i=0;i<6;i++)p.box(5,.3,.8,0x5a3a20,{y:.45,z:9+i*1.6});p.box(.3,.3,10,0x6c6c70,{x:-1.5,y:.7,z:12,m:.6,r:.4});p.box(.3,.3,10,0x6c6c70,{x:1.5,y:.7,z:12,m:.6,r:.4});
  p.box(4,2.4,3,0x5a4632,{y:2.2,z:14});for(const [x,z] of[[-1.6,13],[1.6,13],[-1.6,15],[1.6,15]])p.cyl(.7,.7,.4,0x3a3a3c,{x,y:.8,z,rz:1.57,seg:8,m:.5});
  p.box(.6,4,.6,0x6a4a2c,{x:6,y:2,z:5});p.cyl(.6,.6,.3,0xffb050,{x:6,y:4.3,z:5,e:1.2,seg:6});
  return p.build();});
def('orePile',()=>{const p=P();for(let i=0;i<6;i++){const a=i*1.2;p.ico(1.4+(i%3)*.4,0xffffff,{x:Math.cos(a)*1.8,y:.9,z:Math.sin(a)*1.6,flat:true,m:.55,r:.35,noise:.5,nseed:i});}return p.build();});
def('lumber',()=>{const p=P();
  for(let i=0;i<4;i++)p.cyl(1.3,1.3,13,i%2?0x8a5c31:0x9c6a3a,{x:-1+i*.1,y:1.3+(i>2?2.2:0),z:-4+i*2.7-(i>2?4:0),rx:1.5708,ry:.2,seg:9,paint:(lp,c)=>{if(Math.abs(lp.y)>6.4)c.set(0xd8b07a);}});
  for(const [x,z] of[[9,4],[11,-3],[-10,6]]){p.cyl(1.4,1.6,1.5,0x7a5232,{x,y:.75,z,seg:9});p.cyl(1.3,1.3,.1,0xd8b07a,{x,y:1.55,z,seg:9});}
  p.box(.3,2.6,.3,0x5a3a22,{x:9.2,y:2.6,z:4.2,rz:.4});p.box(1.6,.9,.2,0x9aa0a6,{x:9.9,y:3.7,z:4.2,m:.7,r:.3});
  cottage(p,{x:-8,z:-7,ry:.6,s:.7,wall:0x9a7a52,roof:0x5f4a2e});return p.build();});
def('pastureFence',()=>fenceRing(P(),{}).build());
def('sheep',()=>animalSheep(P()).build());def('cow',()=>animalCow(P()).build());def('horse',()=>animalHorse(P()).build());def('horseB',()=>animalHorse(P(),{col:0x2a2420,mane:0x111111}).build());def('deer',()=>animalDeer(P()).build());
def('camp',()=>{const p=P();
  for(const [x,z,r] of[[-6,-3,0],[5,-6,.8]]){p.cone(5.2,8,0xd8c69a,{x,y:4,z,ry:r,seg:5,jit:.1});p.cyl(.2,.2,9.5,0x5a3a22,{x,y:4.8,z,seg:4});}
  p.box(.4,5,.4,0x5a3a22,{x:-2,y:2.5,z:7});p.box(.4,5,.4,0x5a3a22,{x:6,y:2.5,z:7});p.box(8.5,.4,.4,0x5a3a22,{x:2,y:4.8,z:7});
  p.box(2.4,3,.2,0xa0703e,{x:0,y:3.2,z:7});p.box(2,2.6,.2,0x8a5a3a,{x:3.6,y:3.4,z:7});
  for(let i=0;i<7;i++){const a=i/7*6.28;p.ico(.6,0x6f6a64,{x:1+Math.cos(a)*1.8,y:.4,z:1+Math.sin(a)*1.8,flat:true});}
  p.cone(1,2.2,0xff9a3a,{x:1,y:1.2,z:1,e:1.6,seg:6});p.cone(.6,1.6,0xffe07a,{x:1,y:1.3,z:1,e:2,seg:5});
  return p.build();});
def('plantRows',()=>{const p=P();for(let r=0;r<3;r++)for(let i=0;i<5;i++){const x=-14+i*7,z=-9+r*9;p.cyl(.35,.45,2,0x5a3e25,{x,y:1,z,seg:5});p.ico(2.6,r%2?0x3f7f34:0x4a8a3a,{x,y:3.6,z,d:1,noise:.8,nseed:r*5+i,sy:.85,grad:heightGrad(.75,1.15,-2,2)});}return p.build();});
def('plantFruit',()=>{const p=P();for(let r=0;r<3;r++)for(let i=0;i<5;i++){const x=-14+i*7,z=-9+r*9;for(let k=0;k<5;k++){const a=k*1.26+i;p.sph(.55,0xffffff,{x:x+Math.cos(a)*2.1,y:3.4+Math.sin(k*2.3)*1,z:z+Math.sin(a)*2.1,ws:6,hs:4,r:.5});}}return p.build();});
def('citadel',()=>{const p=P();const st=0x8c8478;
  for(let i=0;i<6;i++){const a=i/6*6.283,a2=(i+1)/6*6.283,x=Math.cos(a)*15,z=Math.sin(a)*15,x2=Math.cos(a2)*15,z2=Math.sin(a2)*15;p.cyl(3.2,3.8,8,st,{x,y:4,z,seg:7,flat:true,jit:.12});p.cone(3.5,3,0x5a5f6a,{x,y:9.5,z,seg:7});
    const mx=(x+x2)/2,mz=(z+z2)/2,len=Math.hypot(x2-x,z2-z);p.box(len,6,2.4,st,{x:mx,y:3,z:mz,ry:-Math.atan2(z2-z,x2-x),jit:.1});}
  p.box(9,10,9,0x9a9286,{y:5,jit:.1});p.cyl(.3,.3,8,0x5a3a22,{y:14});p.box(4,2.4,.2,0xffffff,{x:2,y:17,e:.05});
  return p.build();});
def('academy',()=>{const p=P();p.cyl(7,8,12,0xe4dcc9,{y:6,seg:12,jit:.05});p.sph(7.2,0x4f78b8,{y:12,ts:0,tl:1.57,ws:14,hs:7,m:.3,r:.35});p.cyl(.8,.9,5,0x9a9aa4,{x:2,y:16,z:1,rz:-.6,m:.6,r:.3});for(let i=0;i<8;i++){const a=i/8*6.28;p.box(1,10,1,0xd8cfb8,{x:Math.cos(a)*7.8,y:5,z:Math.sin(a)*7.8});}return p.build();});
def('manufactory',()=>{const p=P();p.box(20,10,14,0x8a4f3a,{y:5,jit:.12});p.box(21,1.2,15,0x4a4a52,{y:10.6});p.box(20.5,.6,7.6,0x5a5f6a,{y:12.6,z:3.6,rx:.5});p.box(20.5,.6,7.6,0x5a5f6a,{y:12.6,z:-3.6,rx:-.5});
  p.cyl(1.4,1.8,12,0x6a3a2a,{x:-6,y:14,z:-3,seg:8});p.cyl(1.2,1.6,10,0x6a3a2a,{x:6,y:13,z:-3,seg:8});p.torus(3,.7,0x8a8a92,{x:11,y:5,z:6,m:.6,r:.4});for(let i=0;i<4;i++)p.box(1.6,1,4,0xffc070,{x:-6+i*4,y:6,z:7.1,e:.8});return p.build();});
def('customs',()=>{const p=P();cottage(p,{s:1.5,wall:0xd8c49a,roof:0x2f6a8a});for(let i=0;i<5;i++)p.box(2.6,2.6,2.6,i%2?0x9a6a3a:0x7a5a32,{x:-10+(i%3)*3,y:1.3+(i>2?2.6:0),z:8,ry:i*.3});p.cyl(.4,.4,7,0x5a3a22,{x:9,y:3.5,z:7});p.box(4,.2,4,0xc84a3a,{x:9,y:7,z:7});return p.build();});
def('holysite',()=>{const p=P();for(let i=0;i<7;i++){const a=i/7*6.283;p.box(2.4,8+(i%2)*2,1.6,0x9a958a,{x:Math.cos(a)*13,y:4,z:Math.sin(a)*13,ry:-a,flat:true,jit:.15,noise:.4});}
  p.cyl(4,5,2,0xd8d0c0,{y:1,seg:10});p.cyl(2,2.4,4,0xe8e0d0,{y:4,seg:10});p.ico(1.5,0xfff2b0,{y:7.4,e:2.2,d:1});return p.build();});
def('roadJunction',()=>{const p=P();p.cyl(4.6,4.8,.5,0x9a7f5a,{y:.25,seg:10});return p.build();});
def('bridge',()=>{const p=P();const st=0xa09684;
  for(let i=0;i<9;i++){const x=-8+i*2,y=2+Math.sin((i/8)*Math.PI)*2.6;p.box(2.1,1,7.4,st,{x,y,jit:.15});}
  for(const z of[-3.9,3.9])for(let i=0;i<9;i++){const x=-8+i*2,y=3.2+Math.sin((i/8)*Math.PI)*2.6;p.box(2,1.2,.6,AE.shadeHex(st,.9),{x,y,z});}
  for(const x of[-9,9])for(const z of[-3.9,3.9])p.box(1.6,4,1.4,0x8a8070,{x,y:1.5,z});
  return p.build();});

// ---------------------------------------------------------------- resources (instanced; white parts are tinted per resource via instance colour)
def('res_sheaves',()=>{const p=P();for(let i=0;i<5;i++){const a=i*1.3,x=Math.cos(a)*2.6,z=Math.sin(a)*2.4;p.cone(1.5,4.4,0xd9b552,{x,y:2.2,z,seg:7,jit:.15,rz:(i%2-.5)*.2});p.cyl(1,1,.4,0x9a7a3a,{x,y:1.6,z,seg:7});}return p.build();});
def('res_crystal',()=>{const p=P();for(let i=0;i<6;i++){const a=i*1.1,r=i?2.2:0,h=4+(i%3)*1.8;p.cyl(0,.9+(i%2)*.4,h,0xffffff,{x:Math.cos(a)*r,y:h/2,z:Math.sin(a)*r,seg:6,rx:Math.sin(a)*.35*(i?1:0),rz:-Math.cos(a)*.35*(i?1:0),flat:true,m:.1,r:.18,e:.55});}p.ico(2.4,0x6a6a70,{y:.4,sy:.4,flat:true});return p.build();});
def('res_ore',()=>{const p=P();p.ico(3.4,0x6d6760,{y:1.2,sy:.7,flat:true,noise:1,nseed:2,d:1});for(let i=0;i<7;i++){const a=i*.9;p.ico(.8,0xffffff,{x:Math.cos(a)*2.4,y:1.6+Math.sin(i)*.6,z:Math.sin(a)*2,m:.8,r:.25,e:.15,flat:true});}return p.build();});
def('res_marble',()=>{const p=P();for(let i=0;i<4;i++)p.box(3.4,2.4,2.6,0xe8e4dc,{x:(i%2)*3.6-1.8,y:1.2+(i>1?2.4:0),z:(i>1?.6:0),ry:i*.2,jit:.06,r:.4});p.box(1.2,5,1.2,0xe8e4dc,{x:4.6,y:2.5,z:-2});return p.build();});
def('res_bush',()=>{const p=P();for(let i=0;i<3;i++){const a=i*2.1;p.ico(2,0x3f7a30,{x:Math.cos(a)*2.4,y:2,z:Math.sin(a)*2.4,d:1,noise:.6,nseed:i,sy:.85});}return p.build();});
def('res_berries',()=>{const p=P();for(let i=0;i<3;i++){const a=i*2.1;for(let k=0;k<6;k++){const b=k*1.05;p.sph(.5,0xffffff,{x:Math.cos(a)*2.4+Math.cos(b)*1.6,y:2.2+Math.sin(k*1.7)*.8,z:Math.sin(a)*2.4+Math.sin(b)*1.6,ws:6,hs:4,r:.45});}}return p.build();});
def('res_fruit',()=>{const p=P();for(let i=0;i<3;i++){const a=i*2.1;p.ico(2,0x3f7a30,{x:Math.cos(a)*2.4,y:2,z:Math.sin(a)*2.4,d:1,noise:.6,nseed:i,sy:.85});for(let k=0;k<6;k++){const b=k*1.05;p.sph(.5,0xffffff,{x:Math.cos(a)*2.4+Math.cos(b)*1.6,y:2.2+Math.sin(k*1.7)*.8,z:Math.sin(a)*2.4+Math.sin(b)*1.6,ws:6,hs:4,r:.45});}}return p.build();});
def('res_cotton',()=>{const p=P();for(let i=0;i<6;i++){const a=i*1.05,x=Math.cos(a)*2.6,z=Math.sin(a)*2.6;p.cyl(.15,.2,3,0x5a6a34,{x,y:1.5,z,seg:4});for(let k=0;k<3;k++)p.ico(.7,0xf6f3ea,{x:x+(k-1)*.6,y:2.8+k*.3,z,d:1});}return p.build();});
def('res_cane',()=>{const p=P();for(let i=0;i<10;i++){const x=(i%5)*1.4-2.8,z=Math.floor(i/5)*2-1;p.cyl(.25,.3,6,0x8aa04a,{x,y:3,z,seg:5});p.cone(.5,2.4,0x6a9a3a,{x:x+.4,y:5.6,z,rz:-.8,sz:.3,seg:3});}return p.build();});
def('res_vines',()=>{const p=P();for(let r=0;r<2;r++){p.box(9,.2,.2,0x5a3a22,{y:3.4,z:r*3-1.5});for(let i=0;i<4;i++){const x=-3.4+i*2.3,z=r*3-1.5;p.cyl(.2,.25,3.6,0x5a3a22,{x,y:1.8,z,seg:4});p.ico(1.1,0x3f7a30,{x,y:3.6,z,d:1,sy:.8});for(let k=0;k<3;k++)p.sph(.5,0xffffff,{x:x+(k-1)*.5,y:2.7,z:z+.6,ws:6,hs:4});}}return p.build();});
def('res_mushroom',()=>{const p=P();for(let i=0;i<6;i++){const a=i*1.05,x=Math.cos(a)*2,z=Math.sin(a)*2,s=.7+(i%3)*.3;p.cyl(.35*s,.45*s,1.4*s,0xeee4d0,{x,y:.7*s,z,seg:6});p.sph(1*s,0xffffff,{x,y:1.4*s,z,ts:0,tl:1.6,ws:8,hs:4,sy:.7});}return p.build();});
def('res_treasure',()=>{const p=P();p.box(5,3,3.4,0x7a4a22,{y:1.5});p.cyl(1.7,1.7,5,0x8a5a2a,{y:3,rz:1.5708,seg:8,ts:0});p.box(5.2,.4,3.6,0xd9b04a,{y:3,m:.8,r:.25});for(let i=0;i<8;i++)p.cyl(.6,.6,.25,0xffd24a,{x:-3+i*.9,y:.15+(i%3)*.25,z:2.6,m:.9,r:.2,e:.1,seg:8});p.box(1,2.4,1,0xffffff,{x:4,y:1.2,z:-1,r:.3});return p.build();});
def('res_vases',()=>{const p=P();for(let i=0;i<4;i++)p.lathe([[0,0],[1,.1],[1.4,1.2],[1.1,2.6],[.6,3.2],[.8,3.6],[0,3.6]],0xe8eef2,{x:(i%2)*3-1.5,z:Math.floor(i/2)*3-1.5,seg:10,r:.25,paint:(lp,c)=>{if(Math.abs(lp.y-1.6)<.45)c.set(0x3a5aa8);}});return p.build();});
def('res_salt',()=>{const p=P();for(let i=0;i<4;i++)p.cone(2+(i%2)*.6,2.4+(i%2),0xf4f2ea,{x:(i%2)*4-2,y:1.2,z:Math.floor(i/2)*4-2,seg:8,jit:.1});return p.build();});
def('res_incense',()=>{const p=P();for(let i=0;i<3;i++){const x=i*3-3;p.cyl(.7,1,1.6,0xb08a5a,{x,y:.8,seg:8});p.cyl(.15,.15,2,0x6a4a2a,{x,y:2.4,seg:4});p.sph(.5,0xffb46a,{x,y:3.5,e:1.5,ws:6,hs:4});}p.ico(2,0x6a8a3a,{x:0,y:1.6,z:3,d:1,sy:.8});return p.build();});
def('res_silk',()=>{const p=P();bush(p,{col:0x4f7f34,seed:4,s:1.1});for(let i=0;i<7;i++){const a=i*.9;p.sph(.5,0xf2eef8,{x:Math.cos(a)*1.8,y:2.2+Math.sin(i)*.6,z:Math.sin(a)*1.8,sy:1.5,ws:6,hs:5,e:.08});}return p.build();});
def('res_flowers',()=>{const p=P();for(let i=0;i<14;i++){const a=i*2.4,r=1+(i%4)*.9,x=Math.cos(a)*r,z=Math.sin(a)*r;p.cyl(.08,.08,1.8,0x3f7a2a,{x,y:.9,z,seg:3});p.sph(.6,0xffffff,{x,y:1.9,z,ws:6,hs:4,e:.05});}return p.build();});
def('res_fish',()=>{const p=P();for(let i=0;i<3;i++){const a=i*2.1;p.pushT(Math.cos(a)*3,.4,Math.sin(a)*3,0,a,0);p.sph(.9,0xc8d8e0,{sx:2.2,sy:.7,sz:.6,m:.6,r:.25,ws:8,hs:5});p.cone(.7,1.2,0xa8b8c4,{x:-2.2,rz:1.57,sz:.3,seg:4,m:.5});p.pop();p.torus(2,.12,0xe8f6fa,{x:Math.cos(a)*3,y:.1,z:Math.sin(a)*3,rx:1.5708,e:.2});}return p.build();});
def('res_crab',()=>{const p=P();for(let i=0;i<2;i++){p.pushT(i*4-2,.6,i*2-1,0,i*1.2,0);p.sph(1.3,0xd55c45,{sy:.55,ws:8,hs:5,r:.5});for(const s of[-1,1]){p.limb([.8,.2,s*.8],[2.2,.3,s*1.6],.25,.3,0xc84a35,{seg:4});p.sph(.5,0xd55c45,{x:2.4,y:.4,z:s*1.7,sx:1.4,ws:6,hs:4});}p.pop();}p.ico(2,0x8a7a62,{x:2,y:-.4,z:2,flat:true,sy:.5});return p.build();});
def('res_whale',()=>{const p=P();p.sph(3.6,0x536f89,{sx:2.3,sy:.6,sz:1,ws:12,hs:7,r:.4,paint:(lp,c)=>{if(lp.y<-.6)c.set(0xc8d0d8);}});p.pushT(-8.5,.6,0,0,0,.4);p.cone(1.2,3,0x536f89,{rz:1.57,seg:4,sz:.4});p.box(.5,.3,5,0x536f89,{x:-1.4,y:.2});p.pop();
  for(let i=0;i<5;i++)p.sph(.5+i*.08,0xeaf6fb,{x:5.2,y:2+i*.9,z:(i%2-.5)*.4,e:.3,ws:6,hs:4});return p.build();});
def('res_pearls',()=>{const p=P();for(let i=0;i<3;i++){const a=i*2.1,x=Math.cos(a)*2.6,z=Math.sin(a)*2.6;p.sph(1.4,0xb8a890,{x,y:.3,z,sy:.35,ws:8,hs:4});p.sph(1.4,0xb8a890,{x,y:.9,z:z-.6,sy:.3,rx:-.7,ws:8,hs:4});p.sph(.55,0xffffff,{x,y:.7,z,m:.3,r:.1,e:.25,ws:8,hs:6});}return p.build();});
def('res_elephant',()=>{const p=P();p.sph(3,0x8b7f78,{y:5,sx:1.45,sy:1,sz:1,ws:10,hs:7});p.sph(1.8,0x8b7f78,{x:4.2,y:5.8,ws:9,hs:6});p.limb([5.6,5.4,0],[6.4,2.2,0],.6,.35,0x8b7f78,{seg:6});
  for(const s of[-1,1]){p.sph(1.7,0x7f746e,{x:3.8,y:6,z:s*1.6,sx:.3,ws:7,hs:6});p.limb([5.4,4.6,s*.6],[6.6,4.4,s*1.2],.25,.12,0xf2ead8,{seg:5});}
  for(const [lx,lz] of [[-2.6,1.2],[-2.6,-1.2],[2.4,1.2],[2.4,-1.2]])p.cyl(.95,.9,3.4,0x7f746e,{x:lx,y:1.7,z:lz,seg:7});return p.build();});
def('res_furs',()=>{const p=P();animalDeer(p,{s:.75,col:0xb06a32});p.box(.3,4,.3,0x5a3a22,{x:-4,y:2,z:2});p.box(.3,4,.3,0x5a3a22,{x:0,y:2,z:2});p.box(4.6,.3,.3,0x5a3a22,{x:-2,y:3.9,z:2});p.box(1.8,2.4,.15,0xc07a3a,{x:-2.6,y:2.6,z:2});p.box(1.6,2,.15,0xe8e0d0,{x:-1,y:2.8,z:2});return p.build();});
def('res_cattle',()=>{const p=P();animalCow(p,{s:.85});p.pushT(-5,0,4,0,2.2,0);animalCow(p,{s:.75,col:0x4a2e1e,patch:0xeee6d6});p.pop();return p.build();});
def('res_steeds',()=>{const p=P();animalHorse(p,{s:.85,col:0x6a5a6a,mane:0xd8e8ff});p.pushT(-5,0,4,0,2.5,0);animalHorse(p,{s:.75,col:0x3a3448,mane:0xd8e8ff});p.pop();return p.build();});
def('res_deer',()=>{const p=P();animalDeer(p,{s:.95});p.pushT(-4,0,3.5,0,2.4,0);animalDeer(p,{s:.7,col:0xb07a48});p.pop();return p.build();});
def('res_spice',()=>{const p=P();for(let i=0;i<4;i++){const a=i*1.57+.4,x=Math.cos(a)*2.6,z=Math.sin(a)*2.6;p.ico(1.7,0x4a7a2e,{x,y:1.7,z,d:1,sy:.9,noise:.5,nseed:i});for(let k=0;k<4;k++)p.cone(.35,1.3,0xffffff,{x:x+Math.cos(k*1.6)*1.1,y:2.6,z:z+Math.sin(k*1.6)*1.1,seg:4,rz:.4*(k%2?1:-1),e:.08});}return p.build();});
// map RES key -> {prop, tint?}
AE.RES_PROP={wheat:['res_sheaves'],cattle:['res_cattle'],deer:['res_deer'],fish:['res_fish'],mithril:['res_ore',0x9fd0ef],steeds:['res_steeds'],crystal:['res_crystal',0x63d5ff],
  citrus:['res_fruit',0xf3a72f],cloves:['res_spice',0xb0583a],cocoa:['res_fruit',0x8a5232],copperLux:['res_ore',0xd07a3c],cotton:['res_cotton'],crab:['res_crab'],dyes:['res_flowers',0xb45cc8],furs:['res_furs'],
  civGems:['res_crystal',0xe36cff],civGold:['res_ore',0xf2c94c],incense:['res_incense'],ivory:['res_elephant'],jewelry:['res_treasure'],marble:['res_marble'],nutmeg:['res_spice',0x9a5f3b],civPearls:['res_pearls'],pepper:['res_spice',0xd8352a],
  porcelain:['res_vases'],salt:['res_salt'],civSilk:['res_silk'],silver:['res_ore',0xd8e0e6],civSpices:['res_spice',0xe08a32],sugar:['res_cane'],truffles:['res_mushroom',0xb08a6a],whales:['res_whale'],civWine:['res_vines',0x6a2848],
  gems:['res_crystal',0x79d7ff],gold:['res_ore',0xffb53d],wine:['res_vines',0xe1924f],spice:['res_spice',0xe3582e],silk:['res_silk'],moon:['res_pearls']};
})();
