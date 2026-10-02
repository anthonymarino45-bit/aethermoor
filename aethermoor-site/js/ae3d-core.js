/* Realms of Aethermoor V5.7.0 Graphics Overhaul - core 3D renderer.
   Presentation only: no gameplay rules, saves, AI or input semantics are changed here.
   Overrides the legacy threeWorld* hooks used by toScreen/toTile/draw/startPlay. */
'use strict';
(function(){
const AE=window.AE3=window.AE3||{};
AE.ok=!!window.THREE;
if(!AE.ok)return;
const T3=THREE;

// ---------------------------------------------------------------- constants
AE.VERSION='5.7.0';
AE.WATER_Y=-7.6;          // sea surface height
AE.K=1.32;                // screen px per world unit at cam.z=1 (ground plane, at view centre)
AE.FOV=32;
AE.PITCH=50*Math.PI/180;  // camera elevation angle
AE.TOP={grass:0,plains:0,desert:0,tundra:.25,snow:.55,hills:1.6,mountain:2.6,coast:-12,ocean:-18};
AE.SUN_DIR=new T3.Vector3(-.78,.82,-.30).normalize();
const HEXD=[[1,0],[.5,-.8660254],[-.5,-.8660254],[-1,0],[-.5,.8660254],[.5,.8660254]];
AE.HEXD=HEXD;

// ---------------------------------------------------------------- small math helpers
AE.clamp=(v,a,b)=>v<a?a:v>b?b:v;
AE.smooth=(a,b,v)=>{const t=AE.clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
AE.lerp=(a,b,t)=>a+(b-a)*t;
AE.hash=function(a,b,c){let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263)+Math.imul((c|0)+1013,1274126177)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295;};
AE.rng=function(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};};
AE.tileRand=(t,salt)=>AE.hash(t.x*7+((G&&G.seed)||1)%9973,t.y*13+salt*31,salt);
AE.vn=function(x,y,s){return vnoise(x,y,s||0);};          // value noise from the rules engine (deterministic)
AE.fbm2=function(x,y,s){return (vnoise(x,y,s)*.6+vnoise(x*2.1,y*2.1,s+5)*.28+vnoise(x*4.3,y*4.3,s+9)*.12);};
AE.col=h=>new T3.Color(h);
AE.lin=v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4); // sRGB -> linear (vertex colours are linear in the shader)
AE.mix=(a,b,t)=>new T3.Color(a).lerp(new T3.Color(b),t).getHex();
AE.shadeHex=(h,f)=>{const c=new T3.Color(h);c.multiplyScalar(f);return c.getHex();};
AE.hsl=(h,dh,ds,dl)=>{const c=new T3.Color(h),o={h:0,s:0,l:0};c.getHSL(o);return new T3.Color().setHSL((o.h+dh+1)%1,AE.clamp(o.s+ds,0,1),AE.clamp(o.l+dl,0,1)).getHex();};
AE.mat4=function(x,y,z,rx,ry,rz,sx,sy,sz){const m=new T3.Matrix4();m.compose(new T3.Vector3(x,y,z),new T3.Quaternion().setFromEuler(new T3.Euler(rx,ry,rz,'YXZ')),new T3.Vector3(sx,sy,sz));return m;};

// ---------------------------------------------------------------- terrain height model (shared by mesh + props + picking)
AE.isWater=t=>!!(t&&T[t.t]&&T[t.t].water);
AE.tileTop=t=>t?(AE.TOP[t.t]??0)+(T[t.t]&&!T[t.t].water?(AE.tileRand(t,77)-.5)*.9:0):0;
const bumpCache=new Map();
AE.resetCaches=function(){bumpCache.clear();};
AE.tileBumps=function(t){
  const k=t.y*G.W+t.x;let b=bumpCache.get(k);if(b&&b.t===t.t)return b;
  b={t:t.t,list:[],dune:null};
  if(t.t==='hills'){const n=2+(AE.tileRand(t,3)>.45?1:0);for(let i=0;i<n;i++){const a=AE.tileRand(t,10+i)*6.283,r=(i?.24:.06+AE.tileRand(t,19)*.1)*S;b.list.push({x:Math.cos(a)*r,z:Math.sin(a)*r,r:(.30+AE.tileRand(t,20+i)*.14)*S,a:(i?6:9)+AE.tileRand(t,30+i)*3.4});}}
  else if(t.t==='mountain'){for(let i=0;i<3;i++){const a=AE.tileRand(t,40+i)*6.283,r=AE.tileRand(t,50+i)*.35*S;b.list.push({x:Math.cos(a)*r,z:Math.sin(a)*r,r:(.25+AE.tileRand(t,60+i)*.15)*S,a:1.6+AE.tileRand(t,70+i)*1.8});}}
  else if(t.t==='snow'||t.t==='tundra'){for(let i=0;i<2;i++){const a=AE.tileRand(t,80+i)*6.283,r=AE.tileRand(t,90+i)*.4*S;b.list.push({x:Math.cos(a)*r,z:Math.sin(a)*r,r:(.28+AE.tileRand(t,95+i)*.2)*S,a:t.t==='snow'?1.4:.8});}}
  if(t.t==='desert'){const a=AE.tileRand(t,99)*6.283;b.dune={dx:Math.cos(a),dz:Math.sin(a),ph:AE.tileRand(t,98)*6.283,amp:2.0+AE.tileRand(t,97)*1.4};}
  bumpCache.set(k,b);return b;
};
AE.hexNorm=function(lx,lz){let m=0;for(const d of HEXD){const v=(lx*d[0]+lz*d[1]);if(v>m)m=v;}return m/(HW*.5);}; // 0 centre .. 1 edge
AE.heightLocal=function(t,lx,lz){
  if(!t)return AE.WATER_Y-10;
  if(AE.isWater(t))return AE.tileTop(t);
  const wx=worldPos(t.x,t.y).x+lx,wz=worldPos(t.x,t.y).y+lz;
  let h=AE.tileTop(t)+(vnoise(wx*.045,wz*.045,7)-.5)*.9+(vnoise(wx*.13,wz*.13,9)-.5)*.32;
  const b=AE.tileBumps(t),hn=AE.hexNorm(lx,lz),fall=1-AE.smooth(.58,.9,hn);
  for(const q of b.list){const dx=lx-q.x,dz=lz-q.z;h+=q.a*Math.exp(-(dx*dx+dz*dz)/(q.r*q.r))*fall;}
  if(b.dune){const s=lx*b.dune.dx+lz*b.dune.dz;h+=Math.sin(s*.16+b.dune.ph+Math.sin(lx*.05)*1.4)*b.dune.amp*fall*(.55+.45*vnoise(wx*.03,wz*.03,3));}
  return h;
};
AE.heightAt=function(wx,wz){const t=AE.tileAtWorld(wx,wz);if(!t)return AE.WATER_Y;const p=worldPos(t.x,t.y);return AE.heightLocal(t,wx-p.x,wz-p.y);};
AE.surfaceY=function(wx,wz){const t=AE.tileAtWorld(wx,wz);if(!t||AE.isWater(t))return AE.WATER_Y;const p=worldPos(t.x,t.y);return AE.heightLocal(t,wx-p.x,wz-p.y);};
AE.tileAtWorld=function(wx,wz){
  const q=wx/HW-wz/(3*S),r=wz/(1.5*S);let x=q,z=r,y=-x-z;let rx=Math.round(x),ry=Math.round(y),rz=Math.round(z);
  const dx=Math.abs(rx-x),dy=Math.abs(ry-y),dz=Math.abs(rz-z);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;
  const row=rz,col=rx+((rz-(rz&1))>>1);return tileAt(col,row);
};
// Height used for placing units/labels on a tile centre (stand on the ground, never inside a hill mound).
AE.standY=function(t){if(!t)return 0;if(AE.isWater(t))return AE.WATER_Y;return Math.max(AE.tileTop(t),AE.heightLocal(t,0,0));};
AE.labelY=function(t){if(!t)return 0;if(AE.isWater(t))return AE.WATER_Y+1;return AE.standY(t)+(t.t==='mountain'?10:0);};

// ---------------------------------------------------------------- shared uniforms + GLSL
AE.U={uTileTex:{value:null},uPalTex:{value:null},uMapSize:{value:new T3.Vector2(1,1)},uHexDim:{value:new T3.Vector2(44,76.21)},uTime:{value:0},uPulse:{value:0},uFogOn:{value:1}};
AE.GLSL_COMMON=`
uniform sampler2D uTileTex;uniform sampler2D uPalTex;uniform vec2 uMapSize;uniform vec2 uHexDim;uniform float uTime;uniform float uPulse;uniform float uFogOn;
float aeHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float aeNoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(aeHash(i),aeHash(i+vec2(1.,0.)),u.x),mix(aeHash(i+vec2(0.,1.)),aeHash(i+vec2(1.,1.)),u.x),u.y);}
float aeFbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*aeNoise(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return s;}
vec2 aeCell(vec2 p){float S=uHexDim.x,HW=uHexDim.y;float q=p.x/HW-p.y/(3.*S);float r=p.y/(1.5*S);float x=q,z=r,y=-x-z;float rx=floor(x+.5),ry=floor(y+.5),rz=floor(z+.5);float dx=abs(rx-x),dy=abs(ry-y),dz=abs(rz-z);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;return vec2(rx+(rz-mod(rz,2.))*.5,rz);}
vec4 aeData(vec2 c){if(c.x<0.||c.y<0.||c.x>=uMapSize.x||c.y>=uMapSize.y)return vec4(0.,0.,0.,1.);return texture2D(uTileTex,(c+.5)/uMapSize);}
vec2 aeCenter(vec2 c){return vec2(uHexDim.y*(c.x+.5*mod(c.y,2.)),1.5*uHexDim.x*c.y);}
`;
AE.GLSL_TILE=AE.GLSL_COMMON+`
vec2 aeNb(vec2 c,int k){bool odd=mod(c.y,2.)>.5;if(k==0)return c+vec2(1.,0.);if(k==1)return c+(odd?vec2(1.,-1.):vec2(0.,-1.));if(k==2)return c+(odd?vec2(0.,-1.):vec2(-1.,-1.));if(k==3)return c+vec2(-1.,0.);if(k==4)return c+(odd?vec2(0.,1.):vec2(-1.,1.));return c+(odd?vec2(1.,1.):vec2(0.,1.));}
vec2 aeDir(int k){if(k==0)return vec2(1.,0.);if(k==1)return vec2(.5,-.8660254);if(k==2)return vec2(-.5,-.8660254);if(k==3)return vec2(-1.,0.);if(k==4)return vec2(-.5,.8660254);return vec2(.5,.8660254);}
float aeBit(float f,float b){return mod(floor(f/b),2.);}
vec3 aeApplyTile(vec3 col,vec3 wp,float ground){
  vec2 p=wp.xz;vec2 c=aeCell(p);vec2 lp=p-aeCenter(c);float ap=uHexDim.y*.5;
  vec4 d=aeData(c);
  float own=floor(d.r*255.+.5)-1.;float flags=floor(d.g*255.+.5);float vis=floor(d.b*255.+.5)/100.;
  float visS=vis,emin=1e4,bLine=0.,bGlow=0.;
  for(int k=0;k<6;k++){
    float e=ap-dot(lp,aeDir(k));emin=min(emin,e);
    vec4 n=aeData(aeNb(c,k));
    float nvis=floor(n.b*255.+.5)/100.;
    visS+=(nvis-vis)*.5*(1.-smoothstep(0.,24.,e));
    float nown=floor(n.r*255.+.5)-1.;
    if(own>=0.&&abs(nown-own)>.5){bLine=max(bLine,1.-smoothstep(1.4,3.4,e));bGlow=max(bGlow,1.-smoothstep(0.,20.,e));}
  }
  // drifting cloud shadows
  if(uFogOn>.5){float cs=aeFbm(p*.0011+uTime*vec2(.0045,.0026));col*=mix(1.,.80,smoothstep(.54,.74,cs));}
  if(ground>.5){
    float ring=smoothstep(.8,2.4,emin)*(1.-smoothstep(3.6,6.,emin));
    float inner=1.-smoothstep(3.,28.,emin);
    if(aeBit(flags,1.)>.5){col=mix(col,col*vec3(.86,1.06,1.22)+vec3(.0,.035,.06),.6);col+=vec3(.42,.86,1.)*(ring*.62+inner*.10);}
    if(aeBit(flags,2.)>.5){col=mix(col,col*vec3(1.25,.72,.66),.45);col+=vec3(1.,.28,.16)*(ring*(.75+.35*uPulse)+inner*.18);}
    if(aeBit(flags,8.)>.5){col+=vec3(.45,1.,.5)*ring*.42;}
    if(aeBit(flags,16.)>.5){col+=vec3(1.,.8,.3)*ring*.85;}
    if(aeBit(flags,32.)>.5){col=mix(col,col*vec3(1.18,1.06,.72),.4);col+=vec3(1.,.82,.32)*(ring*.7+inner*.08);}
    if(aeBit(flags,64.)>.5){col+=vec3(1.,.86,.45)*inner*.16;}
    if(aeBit(flags,4.)>.5){col+=vec3(1.,.97,.86)*ring*.55;}
    if(own>=0.){vec3 oc=texture2D(uPalTex,vec2((own+.5)/16.,.5)).rgb;
      float g2=bGlow*bGlow;
      col=mix(col,col*.55+oc*.62,g2*.62);
      float halo=1.-smoothstep(2.6,6.5,emin);
      col=mix(col,oc*1.18+vec3(.05),clamp(bLine*.92+halo*bGlow*.0,0.,1.));
      col+=mix(oc,vec3(1.),.55)*bLine*smoothstep(.55,1.,bLine)*.45;}
  }
  if(uFogOn>.5){
    visS=clamp(visS,0.,2.);float explored=clamp(visS,0.,1.),visible=clamp(visS-1.,0.,1.);
    float lum=dot(col,vec3(.299,.587,.114));
    vec3 dim=mix(vec3(lum),col,.34)*vec3(.60,.64,.74);
    col=mix(dim,col,visible);
    float fn=aeFbm(p*.0032+vec2(uTime*.0035,uTime*.0018));
    float fn2=aeNoise(p*.011-uTime*.01);
    vec3 fogC=mix(vec3(.050,.066,.094),vec3(.165,.195,.245),fn)+vec3(.02,.022,.03)*fn2;
    col=mix(fogC,col,explored);
  }
  return col;
}
`;
AE.GLSL_VHIDE=AE.GLSL_COMMON;

// Patch any MeshStandardMaterial with fog-of-war, borders/overlays (ground), per-vertex material channels and wind.
AE.patch=function(mat,o={}){
  const ground=o.ground?1:0,matAttr=!!o.matAttr,hide=!!o.hide,wind=o.wind||0;
  mat.onBeforeCompile=sh=>{
    for(const k in AE.U)sh.uniforms[k]=AE.U[k];
    let vs=sh.vertexShader,fs=sh.fragmentShader;
    vs=vs.replace('#include <common>','#include <common>\nvarying vec3 vAeW;\n'+(matAttr?'attribute vec3 aMat;varying vec3 vAeMat;\n':'')+AE.GLSL_VHIDE);
    if(wind)vs=vs.replace('#include <begin_vertex>',`#include <begin_vertex>
#ifdef USE_INSTANCING
vec2 aeIP=instanceMatrix[3].xz;
#else
vec2 aeIP=vec2(0.);
#endif
{vec2 aeWIP=(modelMatrix*vec4(aeIP.x,0.,aeIP.y,1.)).xz;vec2 aeCC=aeCell(aeWIP);vec4 aeDD=aeData(aeCC);if(aeDD.a<.75){float aeK=smoothstep(15.,27.,length(aeWIP-aeCenter(aeCC)));transformed.y*=mix(.3,1.,aeK);transformed.xz*=mix(.55,1.,aeK);}}
{float aeSw=max(position.y,0.)*${(+wind).toFixed(3)};transformed.x+=sin(uTime*1.7+aeIP.x*.051+aeIP.y*.033)*aeSw;transformed.z+=cos(uTime*1.31+aeIP.x*.041+aeIP.y*.02)*aeSw*.7;}`);
    vs=vs.replace('#include <color_vertex>',`#include <color_vertex>
#if defined(USE_INSTANCING_COLOR)&&defined(USE_COLOR)
vColor.rgb=color.rgb*mix(vec3(1.),instanceColor.rgb,step(.985,min(color.r,min(color.g,color.b))));
#endif`);
    vs=vs.replace('#include <project_vertex>',`#include <project_vertex>
{vec4 aeWp=vec4(transformed,1.);
#ifdef USE_INSTANCING
aeWp=instanceMatrix*aeWp;
#endif
vAeW=(modelMatrix*aeWp).xyz;}
${matAttr?'vAeMat=aMat;':''}
${hide?`
#ifdef USE_INSTANCING
{vec4 aeHd=aeData(aeCell((modelMatrix*vec4(instanceMatrix[3].xyz,1.)).xz));if(aeHd.b<.2&&uFogOn>.5)gl_Position=vec4(0.,0.,-3.,1.);}
#endif
`:''}`);
    fs=fs.replace('#include <common>','#include <common>\nvarying vec3 vAeW;\n'+(matAttr?'varying vec3 vAeMat;\n':'')+AE.GLSL_TILE);
    if(matAttr){
      fs=fs.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=vAeMat.y;');
      fs=fs.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=vAeMat.x;');
      fs=fs.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*vAeMat.z;');
    }
    fs=fs.replace('#include <dithering_fragment>',`gl_FragColor.rgb=aeApplyTile(gl_FragColor.rgb,vAeW,${ground}.);\n#include <dithering_fragment>`);
    sh.vertexShader=vs;sh.fragmentShader=fs;
  };
  mat.customProgramCacheKey=()=>'ae'+ground+(+matAttr)+(+hide)+wind+(o.key||'');
  return mat;
};
AE.stdMat=function(o={}){
  const m=new T3.MeshStandardMaterial({color:o.color??0xffffff,vertexColors:o.vertexColors!==false,roughness:o.roughness??.85,metalness:o.metalness??0,map:o.map||null,bumpMap:o.bumpMap||null,bumpScale:o.bumpScale??1,flatShading:!!o.flatShading,transparent:!!o.transparent,opacity:o.opacity??1,side:o.side??T3.FrontSide,depthWrite:o.depthWrite!==false});
  if(o.emissive){m.emissive=new T3.Color(o.emissive);m.emissiveIntensity=o.emissiveIntensity??1;}
  return AE.patch(m,o);
};

// ---------------------------------------------------------------- geometry builder (merged, vertex coloured "prefabs")
const geoCache=new Map();
function cachedGeo(key,fn){let g=geoCache.get(key);if(!g){g=fn();geoCache.set(key,g);}return g;}
AE.G={
  box:(w,h,d)=>cachedGeo(`b${w}|${h}|${d}`,()=>new T3.BoxGeometry(w,h,d)),
  cyl:(rt,rb,h,seg=10,open=false)=>cachedGeo(`c${rt}|${rb}|${h}|${seg}|${open}`,()=>new T3.CylinderGeometry(rt,rb,h,seg,1,open)),
  cone:(r,h,seg=10)=>cachedGeo(`k${r}|${h}|${seg}`,()=>new T3.ConeGeometry(r,h,seg,1)),
  sph:(r,w=12,h=8,ps=0,pl=Math.PI*2,ts=0,tl=Math.PI)=>cachedGeo(`s${r}|${w}|${h}|${ps}|${pl}|${ts}|${tl}`,()=>new T3.SphereGeometry(r,w,h,ps,pl,ts,tl)),
  ico:(r,d=0)=>cachedGeo(`i${r}|${d}`,()=>new T3.IcosahedronGeometry(r,d)),
  dod:(r)=>cachedGeo(`d${r}`,()=>new T3.DodecahedronGeometry(r,0)),
  oct:(r)=>cachedGeo(`o${r}`,()=>new T3.OctahedronGeometry(r,0)),
  torus:(r,t,rs=6,ts=14,arc=Math.PI*2)=>cachedGeo(`t${r}|${t}|${rs}|${ts}|${arc}`,()=>new T3.TorusGeometry(r,t,rs,ts,arc)),
  lathe:(pts,seg=12)=>cachedGeo(`l${pts.join(';')}|${seg}`,()=>new T3.LatheGeometry(pts.map(p=>new T3.Vector2(p[0],p[1])),seg)),
  extrude:(pts,depth,bevel=0)=>cachedGeo(`e${pts.join(';')}|${depth}|${bevel}`,()=>{const s=new T3.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();const g=new T3.ExtrudeGeometry(s,{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,curveSegments:6});g.translate(0,0,-depth/2);return g;}),
  plane:(w,h)=>cachedGeo(`p${w}|${h}`,()=>new T3.PlaneGeometry(w,h)),
};
const _q=new T3.Quaternion(),_v1=new T3.Vector3(),_v2=new T3.Vector3(),_up=new T3.Vector3(0,1,0),_pc=new T3.Color();
AE.Prefab=class{
  constructor(){this.parts=[];this.stack=[new T3.Matrix4()];}
  get M(){return this.stack[this.stack.length-1];}
  push(m){this.stack.push(this.M.clone().multiply(m));return this;}
  pushT(x=0,y=0,z=0,rx=0,ry=0,rz=0,s=1){const sv=Array.isArray(s)?s:[s,s,s];return this.push(AE.mat4(x,y,z,rx,ry,rz,sv[0],sv[1],sv[2]));}
  pop(){if(this.stack.length>1)this.stack.pop();return this;}
  add(geom,color,o={}){
    const s=o.s??1,m=AE.mat4(o.x||0,o.y||0,o.z||0,o.rx||0,o.ry||0,o.rz||0,o.sx??s,o.sy??s,o.sz??s);
    this.parts.push({g:geom,c:new T3.Color(color),m:this.M.clone().multiply(m),mr:[o.m??0,o.r??.72,o.e??0],flat:!!o.flat,grad:o.grad||null,paint:o.paint||null,jit:o.jit||0,noise:o.noise||0,nseed:o.nseed||0});return this;
  }
  box(w,h,d,c,o){return this.add(AE.G.box(w,h,d),c,o);}
  cyl(rt,rb,h,c,o={}){return this.add(AE.G.cyl(rt,rb,h,o.seg||10,!!o.open),c,o);}
  cone(r,h,c,o={}){return this.add(AE.G.cone(r,h,o.seg||10),c,o);}
  sph(r,c,o={}){return this.add(AE.G.sph(r,o.ws||12,o.hs||8,0,Math.PI*2,o.ts||0,o.tl||Math.PI),c,o);}
  ico(r,c,o={}){return this.add(AE.G.ico(r,o.d||0),c,o);}
  torus(r,t,c,o={}){return this.add(AE.G.torus(r,t,o.rs||6,o.ts||14,o.arc||Math.PI*2),c,o);}
  lathe(pts,c,o={}){return this.add(AE.G.lathe(pts,o.seg||12),c,o);}
  ext(pts,depth,c,o={}){return this.add(AE.G.extrude(pts,depth,o.bevel||0),c,o);}
  // tapered limb/segment between two points
  limb(a,b,r1,r2,c,o={}){
    _v1.set(a[0],a[1],a[2]);_v2.set(b[0],b[1],b[2]);const d=_v2.clone().sub(_v1),len=d.length();if(len<1e-4)return this;
    _q.setFromUnitVectors(_up,d.normalize());const mid=_v1.clone().add(_v2).multiplyScalar(.5);
    const m=new T3.Matrix4().compose(mid,_q,new T3.Vector3(1,1,1));
    const g=AE.G.cyl(+r2.toFixed(3),+r1.toFixed(3),+len.toFixed(3),o.seg||8);
    this.parts.push({g,c:new T3.Color(c),m:this.M.clone().multiply(m),mr:[o.m??0,o.r??.72,o.e??0],flat:!!o.flat,grad:null,jit:0,noise:0});
    if(o.caps!==false){this.sph(r1*1.0,c,{x:a[0],y:a[1],z:a[2],ws:8,hs:6,m:o.m,r:o.r,e:o.e});this.sph(r2*1.0,c,{x:b[0],y:b[1],z:b[2],ws:8,hs:6,m:o.m,r:o.r,e:o.e});}
    return this;
  }
  build(){return AE.mergeParts(this.parts);}
};
AE.mergeParts=function(parts){
  let nv=0,ni=0;const prepared=[];
  for(const p of parts){let g=p.g;if(p.flat&&g.index)g=g.toNonIndexed();const n=g.attributes.position.count;prepared.push({p,g,n});nv+=n;ni+=g.index?g.index.count:n;}
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=new Float32Array(nv*3),mat=new Float32Array(nv*3),idxA=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
  let vo=0,io=0;const nm=new T3.Matrix3(),v=new T3.Vector3(),n=new T3.Vector3(),lp=new T3.Vector3();
  for(const {p,g,n:cnt} of prepared){
    nm.getNormalMatrix(p.m);const P=g.attributes.position,N=g.attributes.normal;
    for(let i=0;i<cnt;i++){
      lp.set(P.getX(i),P.getY(i),P.getZ(i));v.copy(lp);
      if(p.noise){const s=p.nseed||0,k=p.noise;v.x+=(vnoise(lp.x*.9+s,lp.y*.9,s)-.5)*k;v.y+=(vnoise(lp.y*.9,lp.z*.9+s,s+1)-.5)*k;v.z+=(vnoise(lp.z*.9,lp.x*.9,s+2)-.5)*k;}
      v.applyMatrix4(p.m);pos[(vo+i)*3]=v.x;pos[(vo+i)*3+1]=v.y;pos[(vo+i)*3+2]=v.z;
      if(N){n.set(N.getX(i),N.getY(i),N.getZ(i)).applyMatrix3(nm).normalize();nor[(vo+i)*3]=n.x;nor[(vo+i)*3+1]=n.y;nor[(vo+i)*3+2]=n.z;}
      let r=p.c.r,gg=p.c.g,b=p.c.b;
      if(p.paint){_pc.copy(p.c);p.paint(lp,_pc,v);r=_pc.r;gg=_pc.g;b=_pc.b;}
      if(p.grad){const f=p.grad(lp);r*=f;gg*=f;b*=f;}
      if(p.jit){const f=1+(AE.hash(Math.round(lp.x*50),Math.round(lp.y*50),Math.round(lp.z*50))-.5)*p.jit;r*=f;gg*=f;b*=f;}
      col[(vo+i)*3]=AE.lin(r);col[(vo+i)*3+1]=AE.lin(gg);col[(vo+i)*3+2]=AE.lin(b);
      mat[(vo+i)*3]=p.mr[0];mat[(vo+i)*3+1]=p.mr[1];mat[(vo+i)*3+2]=p.mr[2];
    }
    if(g.index){const I=g.index;for(let i=0;i<I.count;i++)idxA[io+i]=I.getX(i)+vo;io+=I.count;}else{for(let i=0;i<cnt;i++)idxA[io+i]=vo+i;io+=cnt;}
    vo+=cnt;
  }
  const out=new T3.BufferGeometry();out.setAttribute('position',new T3.BufferAttribute(pos,3));out.setAttribute('normal',new T3.BufferAttribute(nor,3));out.setAttribute('color',new T3.BufferAttribute(col,3));out.setAttribute('aMat',new T3.BufferAttribute(mat,3));out.setIndex(new T3.BufferAttribute(idxA,1));
  // flat-shaded parts: recompute normals per face from the transformed positions
  let off=0;for(const {p,g,n:cnt} of prepared){if(p.flat){for(let i=0;i<cnt;i+=3){const a=off+i;const ax=pos[a*3],ay=pos[a*3+1],az=pos[a*3+2],bx=pos[a*3+3],by=pos[a*3+4],bz=pos[a*3+5],cx=pos[a*3+6],cy=pos[a*3+7],cz=pos[a*3+8];let ux=bx-ax,uy=by-ay,uz=bz-az,wx=cx-ax,wy=cy-ay,wz=cz-az;let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;for(let j=0;j<3;j++){nor[(a+j)*3]=nx;nor[(a+j)*3+1]=ny;nor[(a+j)*3+2]=nz;}}}off+=cnt;}
  out.computeBoundingSphere();out.computeBoundingBox();
  return out;
};
AE.prefabMat=null; // created on init (shared by every prefab)
AE.disposeObj=function(o){if(!o)return;o.traverse(q=>{if(q.geometry&&!q.geometry.userData.keep)q.geometry.dispose();});if(o.parent)o.parent.remove(o);};

// ---------------------------------------------------------------- renderer / scene / camera
AE.state={camKey:'',frameMs:16,slowFrames:0,pr:1};
function initRenderer(){
  if(threeWorld.ready)return true;
  if(!threeWorld.enabled)return false;
  const c=document.getElementById('map3d');if(!c)return false;
  try{
    const r=new T3.WebGLRenderer({canvas:c,antialias:true,alpha:false,powerPreference:'high-performance'});
    AE.state.pr=Math.min(window.devicePixelRatio||1,1.75);r.setPixelRatio(AE.state.pr);
    r.outputEncoding=T3.sRGBEncoding;r.toneMapping=T3.ACESFilmicToneMapping;r.toneMappingExposure=1.0;
    r.shadowMap.enabled=true;r.shadowMap.type=T3.PCFSoftShadowMap;
    const sc=new T3.Scene();sc.background=new T3.Color(0x0c121b);
    sc.fog=new T3.Fog(0x9db6c9,2000,9000);
    const ca=new T3.PerspectiveCamera(AE.FOV,1,10,20000);
    const hemi=new T3.HemisphereLight(0xdce8f2,0x5a5232,.5);sc.add(hemi);
    const amb=new T3.AmbientLight(0xfff0dc,.10);sc.add(amb);
    const sun=new T3.DirectionalLight(0xffe4b4,1.75);sun.castShadow=true;
    const maxTex=r.capabilities.maxTextureSize||4096;const sm=maxTex>=8192?4096:2048;
    sun.shadow.mapSize.set(sm,sm);sun.shadow.bias=-.00035;sun.shadow.normalBias=.6;sun.shadow.radius=2.2;
    sc.add(sun);sc.add(sun.target);
    const bounce=new T3.DirectionalLight(0xa9c8ff,.28);bounce.position.set(.6,.5,.7);sc.add(bounce);
    threeWorld.renderer=r;threeWorld.scene=sc;threeWorld.camera=ca;AE.sun=sun;AE.hemi=hemi;
    AE.prefabMat=AE.stdMat({matAttr:true,roughness:.7,hide:false});
    AE.prefabMatHide=AE.stdMat({matAttr:true,roughness:.7,hide:true,key:'h'});
    AE.prefabMatWind=AE.stdMat({matAttr:true,roughness:.8,hide:true,wind:.022,key:'w'});
    // palette texture: owner colours
    const pal=new Uint8Array(16*4);for(let i=0;i<16;i++){const cc=CIVS[i]?new T3.Color(CIVS[i].color):new T3.Color(0xffffff);const hsl={h:0,s:0,l:0};cc.getHSL(hsl);cc.setHSL(hsl.h,Math.min(1,hsl.s*1.08),Math.min(.72,Math.max(.42,hsl.l*1.05)));pal[i*4]=cc.r*255;pal[i*4+1]=cc.g*255;pal[i*4+2]=cc.b*255;pal[i*4+3]=255;}
    const pt=new T3.DataTexture(pal,16,1,T3.RGBAFormat);pt.magFilter=pt.minFilter=T3.NearestFilter;pt.needsUpdate=true;AE.U.uPalTex.value=pt;
    AE.U.uHexDim.value.set(S,HW);
    threeWorld.ready=true;threeWorld.failed=false;threeWorld.active=true;c.style.display='block';
    window.threeWorldResize();
    return true;
  }catch(e){console.warn('Aethermoor 3D renderer unavailable; using classic map.',e);threeWorld.failed=true;threeWorld.active=false;if(c)c.style.display='none';return false;}
}
AE.camDist=function(){const ca=threeWorld.camera;return view.h/(2*Math.tan(ca.fov*Math.PI/360)*cam.z*AE.K);};
AE.updateCamera=function(force){
  const ca=threeWorld.camera;if(!ca)return;
  const key=cam.x.toFixed(2)+'|'+cam.y.toFixed(2)+'|'+cam.z.toFixed(4)+'|'+view.w+'|'+view.h;
  if(!force&&key===AE.state.camKey)return;AE.state.camKey=key;
  const d=AE.camDist(),fy=AE.focusY||0;
  ca.aspect=view.w/Math.max(1,view.h);ca.near=Math.max(5,d*.18);ca.far=d*5.5;
  ca.position.set(cam.x,fy+Math.sin(AE.PITCH)*d,cam.y+Math.cos(AE.PITCH)*d);ca.up.set(0,1,0);ca.lookAt(cam.x,fy,cam.y);
  ca.updateProjectionMatrix();ca.updateMatrixWorld(true);
  const sc=threeWorld.scene;if(sc.fog){sc.fog.near=d*1.05;sc.fog.far=d*3.6;}
  // keep the sun's shadow frustum wrapped around what is on screen
  const sun=AE.sun;if(sun){
    const pts=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([x,y])=>AE.groundAtNDC(x,y,0)).filter(Boolean);
    let R=200;for(const p of pts)R=Math.max(R,Math.hypot(p.x-cam.x,p.z-cam.y));R=Math.min(R*1.04+60,6000);
    const step=Math.pow(2,Math.ceil(Math.log2(R/64)))*4;R=Math.ceil(R/step)*step;
    const texel=2*R/sun.shadow.mapSize.x,fx=Math.round(cam.x/texel)*texel,fz=Math.round(cam.y/texel)*texel;
    sun.target.position.set(fx,0,fz);sun.position.set(fx+AE.SUN_DIR.x*2600,AE.SUN_DIR.y*2600,fz+AE.SUN_DIR.z*2600);
    const sc2=sun.shadow.camera;if(sc2.right!==R){sc2.left=-R;sc2.right=R;sc2.top=R;sc2.bottom=-R;sc2.near=100;sc2.far=6000;sc2.updateProjectionMatrix();}
    sun.target.updateMatrixWorld();
  }
};
const _ray=new T3.Raycaster(),_ndc=new T3.Vector2(),_hit=new T3.Vector3(),_plane=new T3.Plane(new T3.Vector3(0,1,0),0);
AE.groundAtNDC=function(nx,ny,h){const ca=threeWorld.camera;_ndc.set(nx,ny);_ray.setFromCamera(_ndc,ca);_plane.constant=-(h||0);return _ray.ray.intersectPlane(_plane,_hit)?_hit.clone():null;};
AE.groundAtScreen=function(sx,sy,h){return AE.groundAtNDC(sx/view.w*2-1,-sy/view.h*2+1,h);};
const _pv=new T3.Vector3();
AE.project=function(x,y,z){AE.updateCamera(false);_pv.set(x,y,z).project(threeWorld.camera);return {x:(_pv.x*.5+.5)*view.w,y:(-_pv.y*.5+.5)*view.h,z:_pv.z};};
AE.pxScale=function(){return cam.z*AE.K;}; // screen px per world unit near focus

// ---------------------------------------------------------------- tile data texture (owner, overlays, visibility)
AE.tileData=null;AE.tileTex=null;AE.tileSig='';
AE.ensureTileTex=function(){
  if(AE.tileTex&&AE.tileTex.image.width===G.W&&AE.tileTex.image.height===G.H)return;
  if(AE.tileTex)AE.tileTex.dispose();
  AE.tileData=new Uint8Array(G.W*G.H*4);AE.tileTex=new T3.DataTexture(AE.tileData,G.W,G.H,T3.RGBAFormat);AE.tileTex.magFilter=AE.tileTex.minFilter=T3.NearestFilter;AE.tileTex.generateMipmaps=false;AE.tileTex.needsUpdate=true;
  AE.U.uTileTex.value=AE.tileTex;AE.U.uMapSize.value.set(G.W,G.H);
};
AE.updateTileTex=function(){
  AE.ensureTileTex();const D=AE.tileData,v=G.vis[G.player],n=G.W*G.H;
  const flags=new Uint8Array(n);
  try{
    if(reach)for(const [t] of reach)flags[t.y*G.W+t.x]|=1;
    if(targets)for(const t of targets)flags[t.y*G.W+t.x]|=2;
    if(hover)flags[hover.y*G.W+hover.x]|=4;
    if(cityView){for(const i of cityView.tiles||[])flags[i]|=((cityView.lock||[]).includes(i)?16:8);if(cityTileBuyMode)for(const t of tileBuyCandidates(cityView))flags[t.y*G.W+t.x]|=32;}
    const su=(G.sel&&G.sel.type==='unit')?unitOf(G.sel.id):null;if(su)flags[su.y*G.W+su.x]|=64;
  }catch(e){}
  const occ=new Uint8Array(n);for(const u of G.units){const i=u.y*G.W+u.x;if(v[i]===2)occ[i]=1;}for(const c of G.cities)occ[c.y*G.W+c.x]=1;
  let changed=false;
  for(let i=0;i<n;i++){const t=G.tiles[i],o=i*4,own=t.own>=0?t.own+1:0,vis=(v[i]||0)*100,a=occ[i]?128:255;if(D[o]!==own||D[o+1]!==flags[i]||D[o+2]!==vis||D[o+3]!==a){D[o]=own;D[o+1]=flags[i];D[o+2]=vis;D[o+3]=a;changed=true;}}
  if(changed)AE.tileTex.needsUpdate=true;
};

// ---------------------------------------------------------------- legacy hook overrides
window.threeWorldInit=function(){return initRenderer();};
window.threeWorldAvailable=function(){return !!window.THREE;};
window.threeWorldUpdateCamera=function(){AE.updateCamera(true);};
window.threeWorldResize=function(){
  const r=threeWorld.renderer;if(!r)return;r.setPixelRatio(AE.state.pr);r.setSize(innerWidth,innerHeight,false);AE.state.camKey='';
};
window.threeWorldProject=function(x,y){
  if(!threeWorld.active||!threeWorld.camera){const p=worldPos(x,y);return {x:(p.x-cam.x)*cam.z+view.w/2,y:(p.y-cam.y)*cam.z+view.h/2};}
  const t=tileAt(x,y),p=worldPos(x,y);return AE.project(p.x,AE.labelY(t)+2,p.y);
};
window.threeWorldPickTile=function(sx,sy){
  if(!threeWorld.active||!threeWorld.camera||!G)return null;AE.updateCamera(false);
  // clicks on a tall miniature or city model select that model's tile (front-most first)
  if(AE.unitsRT&&AE.unitsRT.screen.size){let best=null,by=-1;for(const u of G.units){const s=AE.unitsRT.screen.get(u.id);if(!s)continue;const hw=Math.max(10,(s.footY-s.headY)*.32);if(sx>s.x-hw&&sx<s.x+hw&&sy>s.headY&&sy<s.footY&&s.footY>by){by=s.footY;best=tileAt(u.x,u.y);}}if(best)return best;}
  if(AE.citiesRT){const v=G.vis[G.player];for(const c of G.cities){if(!v[c.y*G.W+c.x])continue;const t=tileAt(c.x,c.y),w=worldPos(c.x,c.y),b=AE.project(w.x,AE.standY(t),w.y),tp=AE.project(w.x,AE.standY(t)+[16,22,28,34][cityTier(c.pop)],w.y),hw=(b.y-tp.y)*.9;if(sx>b.x-hw&&sx<b.x+hw&&sy>tp.y&&sy<b.y)return t;}}
  // ray-march the visible surface (terrain relief, water, mountain massifs) for exact hex picking
  const a=AE.groundAtScreen(sx,sy,46),b=AE.groundAtScreen(sx,sy,AE.WATER_Y);if(!a||!b)return null;
  const ph=(x,z)=>{const t=AE.tileAtWorld(x,z);if(!t)return AE.WATER_Y;let h=AE.surfaceY(x,z);if(t.t==='mountain'){const c=worldPos(t.x,t.y),d=Math.hypot(x-c.x,z-c.y)/38;if(d<1)h=Math.max(h,AE.tileTop(t)+40*Math.pow(1-d,1.25));}return h;};
  const n=Math.max(12,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z,b.y-a.y)/2.5));let px=a.x,py=a.y,pz=a.z;
  for(let i=1;i<=n;i++){const f=i/n,x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f,z=a.z+(b.z-a.z)*f;if(y<=ph(x,z)){let lo=0,hi=1;for(let k=0;k<6;k++){const m=(lo+hi)/2,mx=px+(x-px)*m,my=py+(y-py)*m,mz=pz+(z-pz)*m;if(my<=ph(mx,mz))hi=m;else lo=m;}return AE.tileAtWorld(px+(x-px)*hi,pz+(z-pz)*hi);}px=x;py=y;pz=z;}
  return AE.tileAtWorld(b.x,b.z);
};
window.threeWorldRebuild=function(force=false){
  if(!threeWorld.enabled)return;if(!initRenderer())return;
  if(force||!AE.world||AE.world.seed!==G?.seed){if(AE.buildWorld)AE.buildWorld();}
  else if(AE.syncWorld)AE.syncWorld(true);
};
window.threeWorldBuildStatic=function(){if(AE.buildWorld)AE.buildWorld();};
window.threeWorldSyncDynamic=function(force){if(AE.syncWorld)AE.syncWorld(!!force);};
window.threeWorldSyncUnits=function(){};
window.threeWorldDraw=function(now){
  if(!threeWorld.enabled)return;if(!threeWorld.ready&&!initRenderer())return;if(!G)return;
  if(!AE.world||AE.world.seed!==G.seed)AE.buildWorld();
  const t0=performance.now();
  AE.U.uTime.value=now/1000;AE.U.uPulse.value=.5+.5*Math.sin(now/170);
  AE.updateCamera(false);AE.updateTileTex();
  if(AE.syncWorld)AE.syncWorld(false);
  if(AE.syncCities)AE.syncCities(now);
  if(AE.syncUnits)AE.syncUnits(now);
  if(AE.animateWorld)AE.animateWorld(now);
  if(AE.updateLOD)AE.updateLOD();
  // the shadow map only needs re-rendering when the view, the world or a moving unit changes
  const sm=threeWorld.renderer.shadowMap;sm.autoUpdate=false;
  const ck=AE.state.camKey,moving=G.units.some(u=>(u.mt&&now-u.mt<500)||(u.lunge&&now-u.lunge.t<500))||(G.ghosts&&G.ghosts.length);
  if(ck!==AE.state.shadowKey||(AE.world&&AE.world.shadowDirty)||moving||now-(AE.state.shadowT||0)>250){sm.needsUpdate=true;AE.state.shadowKey=ck;AE.state.shadowT=now;if(AE.world)AE.world.shadowDirty=false;}
  threeWorld.renderer.render(threeWorld.scene,threeWorld.camera);
  // adaptive resolution: keep pan/zoom smooth on weaker GPUs
  // measure the real frame interval (captures GPU-bound slowness, ignores paused/hidden tabs)
  const dt=AE.state.lastNow?now-AE.state.lastNow:16;AE.state.lastNow=now;if(dt>0&&dt<200)AE.state.frameMs=AE.state.frameMs*.94+dt*.06;
  if(AE.state.frameMs>30&&AE.state.pr>.8){AE.state.slowFrames++;if(AE.state.slowFrames>90){AE.state.pr=Math.max(.8,AE.state.pr-.2);AE.state.slowFrames=0;window.threeWorldResize();}}else AE.state.slowFrames=Math.max(0,AE.state.slowFrames-1);
};
window.toggle3DWorld=function(){
  threeWorld.enabled=!threeWorld.enabled;threeWorld.active=false;try{localStorage.setItem('aethermoor_3d',threeWorld.enabled?'1':'0');}catch(e){}
  const c=document.getElementById('map3d');
  if(!threeWorld.enabled){if(c)c.style.display='none';}else{if(c)c.style.display='block';if(threeWorld.ready)threeWorld.active=true;window.threeWorldRebuild(true);}
  closeModal();toast(threeWorld.enabled?(window.THREE?'3D world enabled':'Three.js could not load; classic terrain remains active.'):'Classic 2D terrain enabled.');
};
})();
