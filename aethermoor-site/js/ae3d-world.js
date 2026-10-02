/* Realms of Aethermoor V5.7.0 - world builder: chunked bevelled hex terrain, water, rivers, roads, features, improvements, resources. */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const T3=THREE,CH=10,UVS=1/125;
const W=AE.world=null;
const corner=i=>{const a=(60*i-30)*Math.PI/180;return [Math.cos(a),Math.sin(a)];};
const CORNERS=[0,1,2,3,4,5,6].map(i=>corner(i%6));
const SIDE_K=i=>(6-i)%6; // my side index -> DIRS direction index
function nbrDir(t,k){const d=DIRS[t.y&1][k];return tileAt(t.x+d[0],t.y+d[1]);}
AE.nbrDir=nbrDir;

// ---------------------------------------------------------------- materials
const MATS={};
function terrainMat(kind){
  if(MATS[kind])return MATS[kind];
  const tex=AE.paintTexture(kind);
  const m=AE.stdMat({map:tex,roughness:kind==='snow'||kind==='hills_s'?.82:.97,ground:true,vertexColors:true,bumpMap:tex,bumpScale:kind==='desert'?.25:.45,key:'t'});
  MATS[kind]=m;return m;
}
function cliffMat(){if(MATS.cliff)return MATS.cliff;const tex=AE.paintTexture('cliff');MATS.cliff=AE.stdMat({map:tex,roughness:.98,ground:false,vertexColors:true,bumpMap:tex,bumpScale:.8,key:'c'});return MATS.cliff;}
function roadMat(){if(MATS.road)return MATS.road;const tex=AE.paintTexture('road');MATS.road=AE.stdMat({map:tex,roughness:.97,ground:true,vertexColors:true,key:'r'});MATS.road.polygonOffset=true;MATS.road.polygonOffsetFactor=-2;MATS.road.polygonOffsetUnits=-2;return MATS.road;}
AE.MATS=MATS;

function waterMaterial(shoreTex,rect){
  const u={...AE.U,uShore:{value:shoreTex},uShoreRect:{value:new T3.Vector4(rect.x,rect.z,rect.w,rect.h)},uSunDir:{value:AE.SUN_DIR.clone()},uCamPos:{value:new T3.Vector3()},uFogColor:{value:new T3.Color(0x9db6c9)},uFogNear:{value:2000},uFogFar:{value:9000}};
  const m=new T3.ShaderMaterial({uniforms:u,
    vertexShader:`varying vec3 vW;varying float vDepth;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vDepth=-mv.z;gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform sampler2D uShore;uniform vec4 uShoreRect;uniform vec3 uSunDir;uniform vec3 uCamPos;uniform vec3 uFogColor;uniform float uFogNear;uniform float uFogFar;
${AE.GLSL_TILE}
varying vec3 vW;varying float vDepth;
float wH(vec2 p,float t){return aeNoise(p*.030+vec2(t*.21,t*.15))*1.0+aeNoise(p*.071-vec2(t*.33,-t*.24))*.55+aeNoise(p*.16+vec2(-t*.52,t*.43))*.25;}
void main(){
  vec2 p=vW.xz;float t=uTime;
  vec3 sh=texture2D(uShore,(p-uShoreRect.xy)/uShoreRect.zw).rgb;
  float nearL=sh.r,wide=sh.g,shelf=sh.b;
  float depth=clamp(1.-(shelf*.85+wide*.45),0.,1.);
  vec3 cShallow=vec3(.11,.42,.46),cMid=vec3(.04,.26,.39),cDeep=vec3(.020,.13,.27),cAbyss=vec3(.010,.065,.17);
  vec3 base=mix(cShallow,cMid,smoothstep(0.,.32,depth));base=mix(base,cDeep,smoothstep(.28,.66,depth));base=mix(base,cAbyss,smoothstep(.72,1.,depth));
  base*=.92+.16*aeNoise(p*.004+3.);
  float e=1.2,h0=wH(p,t),hx=wH(p+vec2(e,0.),t),hz=wH(p+vec2(0.,e),t);
  vec3 n=normalize(vec3(-(hx-h0)*2.2,1.,-(hz-h0)*2.2));
  vec3 L=normalize(uSunDir),V=normalize(uCamPos-vW);
  float diff=.62+.38*max(dot(n,L),0.);
  float spec=pow(max(dot(reflect(-L,n),V),0.),110.)*1.6;
  float spark=step(.93,aeNoise(p*.55+vec2(t*1.3,-t*.9)))*pow(max(dot(reflect(-L,n),V),0.),18.)*1.2;
  float fres=pow(1.-max(dot(n,V),0.),3.);
  vec3 col=base*diff+vec3(.55,.70,.82)*fres*.28+vec3(1.,.95,.84)*(spec+spark);
  // caustic shimmer in the shallows
  float ca=aeNoise(p*.09+vec2(t*.4,t*.25))*aeNoise(p*.13-vec2(t*.3,-t*.35));col+=vec3(.10,.16,.14)*smoothstep(.25,.6,ca)*(1.-smoothstep(.0,.35,depth))*.8;
  // shoreline foam: breaking edge + incoming bands
  float fn=aeNoise(p*.11+vec2(t*.35,-t*.2));
  float edge=smoothstep(.20,.46,nearL+(fn-.5)*.14);
  float band=(1.-smoothstep(.0,.16,abs(fract(nearL*2.6-t*.22)-.5)))*smoothstep(.06,.30,nearL)*(1.-edge)*smoothstep(.35,.7,aeNoise(p*.06+t*.1));
  float foam=clamp(edge*(.75+.25*fn)+band*.45,0.,1.);
  col=mix(col,vec3(.90,.95,.96),foam*.88);
  // faint hex lattice on open water
  vec2 c=aeCell(p);vec2 lp=p-aeCenter(c);float ap=uHexDim.y*.5,em=1e4;for(int k=0;k<6;k++)em=min(em,ap-dot(lp,aeDir(k)));
  col+=vec3(.55,.75,.85)*(1.-smoothstep(.4,1.4,em))*.03*(1.-foam);
  col=mix(col,uFogColor,smoothstep(uFogNear,uFogFar,vDepth)*.7);
  gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  gl_FragColor.rgb=aeApplyTile(gl_FragColor.rgb,vW,1.);
}`});
  return m;
}
function riverMaterial(){
  if(MATS.river)return MATS.river;
  const u={...AE.U,uSunDir:{value:AE.SUN_DIR.clone()},uCamPos:{value:new T3.Vector3()}};
  MATS.river=new T3.ShaderMaterial({uniforms:u,
    vertexShader:`attribute vec2 aRiv;varying vec3 vW;varying vec2 vR;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vR=aRiv;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform vec3 uSunDir;uniform vec3 uCamPos;${AE.GLSL_TILE}
varying vec3 vW;varying vec2 vR;
void main(){float t=uTime;vec2 p=vW.xz;
  float fl=aeNoise(vec2(vR.x*.12-t*.9,vR.y*3.))*.6+aeNoise(vec2(vR.x*.31-t*1.6,vR.y*6.+2.))*.4;
  vec3 col=mix(vec3(.08,.34,.42),vec3(.16,.50,.55),smoothstep(.3,.8,fl));
  float edge=abs(vR.y-.5)*2.;col=mix(col,vec3(.26,.56,.52),smoothstep(.55,1.,edge)*.6);
  vec3 n=normalize(vec3((fl-.5)*.5,1.,(aeNoise(p*.2+t)-.5)*.5));vec3 V=normalize(uCamPos-vW);
  col+=vec3(1.,.95,.85)*pow(max(dot(reflect(-normalize(uSunDir),n),V),0.),60.)*1.1;
  col+=vec3(.8,.9,.9)*smoothstep(.72,.95,fl)*.18;
  gl_FragColor=vec4(col,1.);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  gl_FragColor.rgb=aeApplyTile(gl_FragColor.rgb,vW,1.);}`});
  MATS.river.polygonOffset=true;MATS.river.polygonOffsetFactor=-1;MATS.river.polygonOffsetUnits=-1;
  return MATS.river;
}

// ---------------------------------------------------------------- shore / depth field (soft distance-to-land texture under the water shader)
function buildShore(b){
  const sc=.25,w=Math.ceil(b.w*sc),h=Math.ceil(b.h*sc);
  const mk=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const hexFill=(ctx,filter,pred,rad=S)=>{ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);ctx.filter=filter;ctx.fillStyle='#fff';for(const t of G.tiles){if(!pred(t))continue;const p=worldPos(t.x,t.y);const cx=(p.x-b.x)*sc,cy=(p.y-b.z)*sc;ctx.beginPath();for(let i=0;i<6;i++){const c=CORNERS[i];const x=cx+c[0]*rad*sc,y=cy+c[1]*rad*sc;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();}ctx.filter='none';};
  const land=t=>!AE.isWater(t);
  const cR=mk(),cG=mk(),cB=mk();
  hexFill(cR.getContext('2d'),'blur(3px)',land,S*1.02);
  hexFill(cG.getContext('2d'),'blur(22px)',land,S*1.1);
  hexFill(cB.getContext('2d'),'blur(14px)',t=>t.t!=='ocean',S*1.05);
  const out=mk(),o=out.getContext('2d'),img=o.createImageData(w,h);
  const dR=cR.getContext('2d').getImageData(0,0,w,h).data,dG=cG.getContext('2d').getImageData(0,0,w,h).data,dB=cB.getContext('2d').getImageData(0,0,w,h).data;
  for(let i=0;i<w*h;i++){img.data[i*4]=dR[i*4];img.data[i*4+1]=dG[i*4];img.data[i*4+2]=dB[i*4];img.data[i*4+3]=255;}
  o.putImageData(img,0,0);
  const tex=new T3.CanvasTexture(out);tex.flipY=false;tex.wrapS=tex.wrapT=T3.ClampToEdgeWrapping;tex.minFilter=T3.LinearFilter;tex.generateMipmaps=false;return tex;
}

// ---------------------------------------------------------------- terrain geometry per chunk
function tileKind(t){
  const f=t.f;
  if(t.t==='grass'||t.t==='plains')return f==='forest'?'forest':f==='jungle'?'jungle':t.t;
  if(t.t==='hills'){const cnt={};for(const n of nbrs(t.x,t.y)){if(AE.isWater(n)||n.t==='hills'||n.t==='mountain')continue;cnt[n.t]=(cnt[n.t]||0)+1;}
    let best='grass',bv=0;for(const k in cnt)if(cnt[k]>bv){bv=cnt[k];best=k;}return best==='desert'?'hills_d':best==='tundra'?'hills_t':best==='snow'?'hills_s':'hills';}
  return t.t;
}
function tileTint(t){
  const r=AE.tileRand(t,1),g=AE.tileRand(t,2);const c=new T3.Color(1,1,1);
  const l=.93+r*.14;c.setRGB(l*(1+(g-.5)*.05),l,l*(1-(g-.5)*.05));
  if(t.f==='forest'){if(t.t==='tundra'||t.t==='hills'||t.t==='snow')c.multiplyScalar(.80);}
  if(t.f==='jungle')c.multiplyScalar(.95);
  // broad regional tone variation so large plains do not look stamped
  const wp=worldPos(t.x,t.y),rv=vnoise(wp.x*.0022,wp.y*.0022,77);c.multiplyScalar(.94+rv*.12);
  return c;
}
function newBucket(){return {pos:[],nor:[],col:[],uv:[],idx:[],n:0};}
function addTile(t,buckets){
  const kind=tileKind(t),b=buckets[kind]||(buckets[kind]=newBucket());
  const N=(t.t==='hills'||t.t==='mountain'||t.t==='desert'||t.t==='snow')?6:4;
  const RIN=S*.87,RMID=S*.946,ROUT=S*.998,top=AE.tileTop(t),cen=worldPos(t.x,t.y),tint=tileTint(t);
  const vx=[],vz=[],vy=[],vr=[];
  const push=(x,z,y,ring)=>{vx.push(x);vz.push(z);vy.push(y);vr.push(ring);};
  push(0,0,AE.heightLocal(t,0,0),0);
  for(let k=1;k<=N;k++){const rk=RIN*k/N;for(let i=0;i<6;i++){const c0=CORNERS[i],c1=CORNERS[i+1];for(let m=0;m<k;m++){const f=m/k,x=(c0[0]+(c1[0]-c0[0])*f)*rk,z=(c0[1]+(c1[1]-c0[1])*f)*rk;push(x,z,AE.heightLocal(t,x,z),k===N?1:0);}}}
  const ringStart=k=>1+3*k*(k-1);
  const V=(k,i,m)=>{if(k===0)return 0;if(m>=k){i=(i+1)%6;m=0;}return ringStart(k)+i*k+m;};
  const idx=[];
  for(let k=1;k<=N;k++)for(let i=0;i<6;i++){
    for(let m=0;m<k;m++)idx.push(V(k-1,i,m),V(k,i,m+1),V(k,i,m));
    for(let m=0;m<k-1;m++)idx.push(V(k-1,i,m),V(k-1,i,m+1),V(k,i,m+1));
  }
  // bevel rings
  const rN=ringStart(N),cnt=6*N,mid0=vx.length;
  for(let j=0;j<cnt;j++){const s=RMID/RIN;push(vx[rN+j]*s,vz[rN+j]*s,vy[rN+j]-.75,2);}
  const out0=vx.length;
  for(let j=0;j<cnt;j++){const s=ROUT/RIN;push(vx[rN+j]*s,vz[rN+j]*s,top-2.3,3);}
  const strip=(a0,b0)=>{for(let j=0;j<cnt;j++){const j1=(j+1)%cnt;idx.push(a0+j,b0+j1,b0+j);idx.push(a0+j,a0+j1,b0+j1);}};
  strip(rN,mid0);strip(mid0,out0);
  // normals (accumulate)
  const nv=vx.length,nx=new Float32Array(nv),ny=new Float32Array(nv),nz=new Float32Array(nv);
  for(let q=0;q<idx.length;q+=3){const a=idx[q],bq=idx[q+1],c=idx[q+2];const ux=vx[bq]-vx[a],uy=vy[bq]-vy[a],uz=vz[bq]-vz[a],wx=vx[c]-vx[a],wy=vy[c]-vy[a],wz=vz[c]-vz[a];const fx=uy*wz-uz*wy,fy=uz*wx-ux*wz,fz=ux*wy-uy*wx;nx[a]+=fx;ny[a]+=fy;nz[a]+=fz;nx[bq]+=fx;ny[bq]+=fy;nz[bq]+=fz;nx[c]+=fx;ny[c]+=fy;nz[c]+=fz;}
  const base=b.n;
  for(let v=0;v<nv;v++){const l=Math.hypot(nx[v],ny[v],nz[v])||1;const X=cen.x+vx[v],Z=cen.y+vz[v];b.pos.push(X,vy[v],Z);b.nor.push(nx[v]/l,ny[v]/l,nz[v]/l);
    const ring=vr[v];let f=ring===3?.58:ring===2?.86:1;const slope=ny[v]/l;f*=.82+.18*Math.min(1,slope*1.05);
    if(t.t==='hills'||t.t==='mountain'){const hh=vy[v]-top;f*=.92+Math.min(.14,hh*.02);}
    b.col.push(AE.lin(tint.r*f),AE.lin(tint.g*f),AE.lin(tint.b*f));b.uv.push(X*UVS,Z*UVS);}
  for(const q of idx)b.idx.push(q+base);b.n+=nv;
  // cliff walls where the neighbour is lower (coast / lower land)
  const wb=buckets._cliff||(buckets._cliff=newBucket());
  for(let i=0;i<6;i++){const n=nbrDir(t,SIDE_K(i));const nTop=n?(AE.isWater(n)?AE.WATER_Y-3:AE.tileTop(n)):AE.WATER_Y-3;if(n&&!AE.isWater(n)&&nTop>=top-.4)continue;
    const bottom=AE.isWater(n)||!n?AE.WATER_Y-9:nTop-3,na=(60*i)*Math.PI/180,onx=Math.cos(na),onz=Math.sin(na);
    for(let m=0;m<N;m++){const j0=out0+i*N+m,j1=out0+((i*N+m+1)%cnt);
      const x0=cen.x+vx[j0],z0=cen.y+vz[j0],x1=cen.x+vx[j1],z1=cen.y+vz[j1],yt=top-2.3;const bi=wb.n;
      const u0=(i*N+m)/N*S/46+AE.tileRand(t,5)*3,u1=(i*N+m+1)/N*S/46+AE.tileRand(t,5)*3;
      wb.pos.push(x0,yt,z0,x1,yt,z1,x0,bottom,z0,x1,bottom,z1);for(let q=0;q<4;q++)wb.nor.push(onx,0,onz);
      const ct=AE.lin(.95*tint.r),cb=AE.lin(.42);wb.col.push(ct,ct,ct,ct,ct,ct,cb,cb*1.02,cb*1.05,cb,cb*1.02,cb*1.05);
      wb.uv.push(u0,yt/46,u1,yt/46,u0,bottom/46,u1,bottom/46);
      wb.idx.push(bi,bi+1,bi+2,bi+1,bi+3,bi+2);wb.n+=4;}
  }
}
function bucketMesh(b,mat,cast){
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(b.pos,3));g.setAttribute('normal',new T3.Float32BufferAttribute(b.nor,3));g.setAttribute('color',new T3.Float32BufferAttribute(b.col,3));g.setAttribute('uv',new T3.Float32BufferAttribute(b.uv,2));
  g.setIndex(b.n>65535?new T3.Uint32BufferAttribute(b.idx,1):new T3.Uint16BufferAttribute(b.idx,1));g.computeBoundingSphere();
  const m=new T3.Mesh(g,mat);m.receiveShadow=true;m.castShadow=!!cast;return m;
}

// ---------------------------------------------------------------- props per chunk (instanced)
const WIND=new Set(['pine0','pine1','pine2','pineSnow0','pineSnow1','pineSnow2','broad0','broad1','broad2','autumn0','autumn1','autumn2','cypress','palm0','palm1','jungle0','jungle1','bush0','bush1','bush2','fern','reeds','tuft','tuftDry','flowersW','flowersY','flowersP','res_cane','res_cotton']);
const CAST=k=>!/^(tuft|flowers|road|res_fish|res_pearls|plantFruit|orePile|farmW|farmG)/.test(k);
function scatter(t,R,count,minR,maxR,minGap,list){
  const out=[];let guard=0;while(out.length<count&&guard++<count*25){const a=R()*6.283,r=Math.sqrt(R());const x=Math.cos(a)*r*S,z=Math.sin(a)*r*S;const hn=AE.hexNorm(x,z);if(hn<minR||hn>maxR)continue;if((list||out).some(p=>(p[0]-x)**2+(p[1]-z)**2<minGap*minGap)||out.some(p=>(p[0]-x)**2+(p[1]-z)**2<minGap*minGap))continue;out.push([x,z]);}
  return out;
}
function climate(t){const ny=t.y/Math.max(1,G.H-1),lat=Math.abs(ny-.5)*2,wp=worldPos(t.x,t.y);return {lat,autumn:vnoise(wp.x*.004,wp.y*.004,31)};}
function addProp(L,key,x,y,z,ry=0,s=1,col){(L[key]||(L[key]=[])).push([x,y,z,ry,s,col]);}
function decorateTile(t,L){
  const R=AE.rng(((G.seed|0)%100000)*7919+t.x*92821+t.y*68917+3),c=worldPos(t.x,t.y),cl=climate(t);
  const place=(key,lx,lz,s=1,col,dy=0)=>{addProp(L,key,c.x+lx,AE.heightLocal(t,lx,lz)+dy,c.y+lz,R()*6.283,s,col);};
  const busy=t.city!=null||t.camp||t.site||t.nw;
  if(t.city!=null||t.nw)return;
  const imp=t.imp;
  // ---- forests / jungles
  if(t.f==='forest'||t.f==='jungle'){
    const jungle=t.f==='jungle',n=imp==='lumber'?9:imp?8:busy?7:jungle?13:20;
    const pts=scatter(t,R,n,imp?.5:jungle?.2:.16,.88,jungle?7:5.4);
    for(const [x,z] of pts){let key;const r=R();
      if(jungle)key=r<.42?'palm'+(R()<.5?0:1):r<.85?'jungle'+(R()<.5?0:1):'broad'+((R()*3)|0);
      else if(t.t==='tundra'||t.t==='snow')key=(cl.lat>.62||t.t==='snow'||R()<.4?'pineSnow':'pine')+((R()*3)|0);
      else if(t.t==='hills')key=r<.55?'pine'+((R()*3)|0):r<.85?'broad'+((R()*3)|0):'autumn'+((R()*3)|0);
      else{const aut=cl.autumn>.62?.28:cl.autumn>.5?.12:.03,pn=cl.lat>.45?.5:.32;key=r<aut?'autumn'+((R()*3)|0):r<aut+pn?'pine'+((R()*3)|0):r<aut+pn+.05?'cypress':'broad'+((R()*3)|0);}
      place(key,x,z,.9+R()*.45);}
    if(jungle)for(const [x,z] of scatter(t,R,5,.25,.85,4,pts))place('fern',x,z,.8+R()*.5);
    else for(const [x,z] of scatter(t,R,3,.25,.85,4,pts))place('bush'+((R()*3)|0),x,z,.7+R()*.4);
    return;
  }
  if(imp==='farm'||imp==='pasture'||imp==='plantation'||imp==='citadel'||imp==='academy'||imp==='manufactory'||imp==='customs'||imp==='holysite'){
    for(const [x,z] of scatter(t,R,2,.82,.9,6))place(t.t==='desert'?'tuftDry':'tuft',x,z,1);return;}
  const edge=busy||imp?.62:.36;
  if(t.t==='grass'){
    for(const [x,z] of scatter(t,R,3+(R()*3|0),edge,.88,5))place('tuft',x,z,.9+R()*.4);
    if(R()<.45)for(const [x,z] of scatter(t,R,1+(R()*2|0),edge,.85,7))place('bush'+((R()*3)|0),x,z,.8+R()*.4);
    if(R()<.32){const [p]=scatter(t,R,1,.55,.82,1);if(p)place(cl.autumn>.6&&R()<.5?'autumn'+((R()*3)|0):R()<.25?'cypress':'broad'+((R()*3)|0),p[0],p[1],.75+R()*.3);}
    if(R()<.5)for(const [x,z] of scatter(t,R,1,edge,.85,6))place(['flowersW','flowersY','flowersP'][(R()*3)|0],x,z,1+R()*.5);
    if(R()<.3)for(const [x,z] of scatter(t,R,1+(R()*2|0),edge,.85,5))place('rock'+((R()*2)|0),x,z,.7+R()*.5);
  }else if(t.t==='plains'){
    for(const [x,z] of scatter(t,R,4+(R()*3|0),edge,.88,5))place(R()<.6?'tuftDry':'tuft',x,z,.9+R()*.5);
    if(R()<.35)for(const [x,z] of scatter(t,R,1,edge,.85,7))place('bush'+((R()*3)|0),x,z,.8+R()*.4);
    if(R()<.25){const [p]=scatter(t,R,1,.55,.82,1);if(p)place(cl.autumn>.45&&R()<.6?'autumn'+((R()*3)|0):'broad'+((R()*3)|0),p[0],p[1],.75+R()*.3);}
    if(R()<.25)for(const [x,z] of scatter(t,R,1,edge,.85,6))place('flowersY',x,z,1);
    if(R()<.25)for(const [x,z] of scatter(t,R,1+(R()*2|0),edge,.85,5))place('rock'+((R()*2)|0),x,z,.7+R()*.5);
  }else if(t.t==='desert'){
    if(R()<.5)for(const [x,z] of scatter(t,R,1+(R()*2|0),edge,.85,8))place('cactus'+((R()*2)|0),x,z,.8+R()*.4);
    for(const [x,z] of scatter(t,R,1+(R()*3|0),edge,.88,6))place('rockSand'+((R()*3)|0),x,z,.7+R()*.6);
    if(R()<.4)for(const [x,z] of scatter(t,R,2,edge,.85,5))place('tuftDry',x,z,.8);
    if(R()<.12){const [p]=scatter(t,R,1,.5,.8,1);if(p)place('deadTree',p[0],p[1],.9);}
  }else if(t.t==='tundra'){
    for(const [x,z] of scatter(t,R,1+(R()*3|0),edge,.88,6))place((R()<.4?'rockSnow':'rock')+((R()*3)|0),x,z,.6+R()*.5);
    for(const [x,z] of scatter(t,R,3,edge,.88,5))place('tuftDry',x,z,.8);
    if(R()<.3)for(const [x,z] of scatter(t,R,1+(R()*2|0),.5,.82,8))place((cl.lat>.6?'pineSnow':'pine')+((R()*3)|0),x,z,.6+R()*.3);
  }else if(t.t==='snow'){
    for(const [x,z] of scatter(t,R,1+(R()*3|0),edge,.88,6))place('rockSnow'+((R()*3)|0),x,z,.6+R()*.6);
    if(R()<.18)for(const [x,z] of scatter(t,R,1+(R()*2|0),.5,.82,8))place('pineSnow'+((R()*3)|0),x,z,.6+R()*.3);
  }else if(t.t==='hills'){
    const k=tileKind(t),rk=k==='hills_s'||k==='hills_t'?'rockSnow':k==='hills_d'?'rockSand':'rockMoss';
    if(!busy&&!imp&&R()<.6){const [q]=scatter(t,R,1,.32,.62,1);if(q)addProp(L,'hillMound',c.x+q[0],AE.heightLocal(t,q[0],q[1])-2.2,c.y+q[1],R()*6.28,.55+R()*.35);}
    for(const [x,z] of scatter(t,R,2+(R()*3|0),edge,.88,7))place(rk+((R()*3)|0),x,z,.6+R()*.5);
    if(k==='hills')for(const [x,z] of scatter(t,R,1+(R()*3|0),edge,.86,6))place(R()<.6?'bush'+((R()*3)|0):'tuft',x,z,.8+R()*.4);
    if(k==='hills'&&R()<.35){const [p]=scatter(t,R,1,.5,.82,1);if(p)place(R()<.5?'pine'+((R()*3)|0):'broad'+((R()*3)|0),p[0],p[1],.75+R()*.25);}
    if(k==='hills_d'&&R()<.3)for(const [x,z] of scatter(t,R,1,edge,.85,8))place('cactus0',x,z,.8);
  }else if(t.t==='mountain'){
    const v=(AE.tileRand(t,7)*5)|0;addProp(L,'mount'+v,c.x+(R()-.5)*6,AE.tileTop(t)-1.2,c.y+(R()-.5)*6,R()*6.283,.92+R()*.18);
    const sm=1+(R()<.5?1:0);for(const [x,z] of scatter(t,R,sm,.55,.78,20))addProp(L,'mountSmall'+((R()*3)|0),c.x+x,AE.tileTop(t)-1,c.y+z,R()*6.283,.75+R()*.35);
    for(const [x,z] of scatter(t,R,3,.7,.9,6))place('rock'+((R()*3)|0),x,z,.6+R()*.5);
  }
}
function coastDecor(t,L){
  const R=AE.rng(((G.seed|0)%100000)*31+t.x*7121+t.y*3121+9),c=worldPos(t.x,t.y);
  for(let k=0;k<6;k++){const n=nbrDir(t,k);if(!n||AE.isWater(n))continue;if(R()>.42)continue;const d=AE.HEXD[k],off=HW*.5*(.74+R()*.12),side=(R()-.5)*S*.7;
    const x=c.x+d[0]*off-d[1]*side,z=c.y+d[1]*off+d[0]*side;addProp(L,'rock'+((R()*3)|0),x,AE.WATER_Y-1.2,z,R()*6.28,.9+R()*.9);
    if(R()<.35)addProp(L,'rock0',x+(R()-.5)*7,AE.WATER_Y-1,z+(R()-.5)*7,R()*6.28,.6+R()*.4);}
}
function improvementProps(t,L){
  const c=worldPos(t.x,t.y),R=AE.rng(t.x*7717+t.y*131+((G.seed|0)%997)),imp=t.imp,y0=AE.heightLocal(t,0,0);
  const rot=Math.floor(R()*6)*Math.PI/3;
  const at=(key,lx,lz,ry,s=1,col,dy=0)=>addProp(L,key,c.x+lx,AE.heightLocal(t,lx,lz)+dy,c.y+lz,ry,s,col);
  const resCol=t.r&&RES[t.r]?(AE.RES_PROP[t.r]&&AE.RES_PROP[t.r][1])||RES[t.r].color:null;
  if(imp==='farm'){at(AE.tileRand(t,9)<.6||t.r==='wheat'?'farmWheat':'farmGreen',0,3,rot+.2,.92,null,-.2);const a=R()*6.28;at('farmhouse',Math.cos(a)*S*.6,Math.sin(a)*S*.6,a+1.57,.85);}
  else if(imp==='mine'){at('mine',-4,-6,(R()-.5)*.6,1.35);at('orePile',10,8,R()*6,1.3,resCol||0x8a8278);}
  else if(imp==='lumber')at('lumber',2,4,R()*.8-.4,.95);
  else if(imp==='pasture'){at('pastureFence',0,4,(R()-.5)*.4,1);const kind=t.r==='cattle'?'cow':t.r==='steeds'?(R()<.5?'horse':'horseB'):'sheep';const n=kind==='sheep'?4:3;for(let i=0;i<n;i++){const a=i/n*6.28+R(),r=6+R()*7;at(kind,Math.cos(a)*r,4+Math.sin(a)*r*.6,R()*6.28,kind==='sheep'?.95:.92);}}
  else if(imp==='camp')at('camp',4,2,R()*.6,1.25);
  else if(imp==='plantation'){at('plantRows',0,2,rot,.95);at('plantFruit',0,2,rot,.95,resCol||0xd8463a);}
  else if(IMP[imp])at(imp,3,-2,R()*.5,1);
}
function resourceProps(t,L){
  if(!t.r||!RES[t.r]||t.city!=null)return;const rp=AE.RES_PROP[t.r];if(!rp)return;const r=RES[t.r],imp=t.imp;
  if(imp==='pasture'&&(t.r==='cattle'||t.r==='steeds'))return;if(imp==='mine'&&(r.family==='metal'||r.family==='crystal'))return;if(imp==='plantation'&&rp[0]!=='res_cotton'&&rp[0]!=='res_cane')return;
  const c=worldPos(t.x,t.y),water=AE.isWater(t),lx=S*.30,lz=-S*.30;
  const y=water?AE.WATER_Y+.1:AE.heightLocal(t,lx,lz),ry=AE.tileRand(t,23)*6.28;
  addProp(L,rp[0],c.x+lx,y,c.y+lz,ry,water?1.7:1.25,rp[1]||null);
}

// ---------------------------------------------------------------- rivers, roads, bridges
function riverGeometry(edges){
  const pos=[],riv=[],idx=[];let n=0;const W2=5.6;
  for(const e of edges){const {ax,az,bx,bz,y}=e;const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz),px=-dz/len*W2,pz=dx/len*W2,ex=dx/len*2.2,ez=dz/len*2.2;
    const x0=ax-ex,z0=az-ez,x1=bx+ex,z1=bz+ez;const u0=e.u,u1=e.u+len;
    pos.push(x0+px,y,z0+pz,x0-px,y,z0-pz,x1+px,y,z1+pz,x1-px,y,z1-pz);riv.push(u0,0,u0,1,u1,0,u1,1);idx.push(n,n+2,n+1,n+1,n+2,n+3);n+=4;
    for(const [cx,cz] of [[ax,az],[bx,bz]]){const c0=n;pos.push(cx,y+.01,cz);riv.push(e.u,.5);n++;for(let i=0;i<8;i++){const a=i/8*6.283;pos.push(cx+Math.cos(a)*W2,y+.01,cz+Math.sin(a)*W2);riv.push(e.u,.9);n++;}for(let i=0;i<8;i++)idx.push(c0,c0+1+((i+1)%8),c0+1+i);}
  }
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('aRiv',new T3.Float32BufferAttribute(riv,2));g.setIndex(idx);g.computeBoundingSphere();return g;
}
function roadGeometry(segs){
  const pos=[],nor=[],col=[],uv=[],idx=[];let n=0;const W2=3.4;
  for(const s of segs){const steps=7;let prev=null;for(let i=0;i<=steps;i++){const f=i/steps,x=s.ax+(s.bx-s.ax)*f,z=s.az+(s.bz-s.az)*f;const y=Math.max(AE.surfaceY(x,z),AE.WATER_Y+.6)+.45;
      const dx=s.bx-s.ax,dz=s.bz-s.az,len=Math.hypot(dx,dz)||1,px=-dz/len*W2,pz=dx/len*W2,u=(s.u0+f*len)/24;
      pos.push(x+px,y,z+pz,x-px,y,z-pz);nor.push(0,1,0,0,1,0);const cc=.92+AE.hash(i,s.u0|0,3)*.1;col.push(cc,cc,cc,cc,cc,cc);uv.push(u,0,u,.5);
      if(i){idx.push(n-2,n,n-1,n-1,n,n+1);}n+=2;}}
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();return g;
}
const isRoadNode=t=>!!t&&(t.road||t.city!=null)&&!AE.isWater(t);

// ---------------------------------------------------------------- chunk management
function chunkTiles(cx,cy){const out=[];for(let y=cy*CH;y<Math.min(G.H,(cy+1)*CH);y++)for(let x=cx*CH;x<Math.min(G.W,(cx+1)*CH);x++)out.push(G.tiles[y*G.W+x]);return out;}
function propSig(tiles){let s='';for(const t of tiles){let rm=0;if(isRoadNode(t))for(let k=0;k<6;k++)if(isRoadNode(nbrDir(t,k)))rm|=1<<k;s+=(t.f||'-')[0]+(t.imp||'-')+(t.r||'-')+rm+(t.city!=null?'C':'')+(t.camp?'L':'')+(t.site?'S':'')+(t.nw?'N':'')+'|';}return s;}
function terrSig(tiles){let s='';for(const t of tiles)s+=t.t[0]+t.t[1]+(t.f||'-')[0];return s;}
function buildChunkTerrain(ch){
  if(ch.terrain){AE.disposeObj(ch.terrain);}
  const g=new T3.Group(),buckets={};
  for(const t of ch.tiles)if(!AE.isWater(t))addTile(t,buckets);
  for(const k in buckets){if(k==='_cliff')continue;g.add(bucketMesh(buckets[k],terrainMat(k),k==='hills'||k.startsWith('hills_')||k==='mountain'));}
  if(buckets._cliff&&buckets._cliff.n)g.add(bucketMesh(buckets._cliff,cliffMat(),false));
  // rivers (static) belong to the chunk of the lower-index tile
  const edges=[];
  for(const t of ch.tiles){if(AE.isWater(t))continue;const cen=worldPos(t.x,t.y);for(let i=0;i<6;i++){const k=SIDE_K(i),n=nbrDir(t,k);if(!n||idx(n.x,n.y)<idx(t.x,t.y)||!hasRiverBetween(t,n))continue;
    const c0=CORNERS[i],c1=CORNERS[i+1],ax=cen.x+c0[0]*S,az=cen.y+c0[1]*S,bx=cen.x+c1[0]*S,bz=cen.y+c1[1]*S;
    const y=AE.isWater(n)?AE.WATER_Y+.3:Math.min(AE.tileTop(t),AE.tileTop(n))-.95;edges.push({ax,az,bx,bz,y,u:(t.x*31+t.y*17+i*7)});}}
  if(edges.length){const m=new T3.Mesh(riverGeometry(edges),riverMaterial());m.receiveShadow=false;g.add(m);}
  ch.terrain=g;AE.world.root.add(g);ch.tsig=terrSig(ch.tiles);
}
function buildChunkProps(ch){
  if(ch.props)AE.disposeObj(ch.props);
  const g=new T3.Group(),L={};
  for(const t of ch.tiles){if(AE.isWater(t)){coastDecor(t,L);resourceProps(t,L);continue;}decorateTile(t,L);if(t.imp)improvementProps(t,L);resourceProps(t,L);}
  // roads: half segments from each road node towards connected neighbours
  const segs=[],juncs=[],bridges=[];
  for(const t of ch.tiles){if(!isRoadNode(t))continue;const c=worldPos(t.x,t.y);let any=false;
    for(let k=0;k<6;k++){const n=nbrDir(t,k);if(!isRoadNode(n))continue;any=true;const d=AE.HEXD[k],mx=c.x+d[0]*HW*.5,mz=c.y+d[1]*HW*.5;segs.push({ax:c.x,az:c.y,bx:mx,bz:mz,u0:(t.x*13+t.y*7+k*5)%97});
      if(hasRiverBetween(t,n)&&idx(n.x,n.y)>idx(t.x,t.y)){bridges.push([mx,Math.min(AE.tileTop(t),AE.tileTop(n))-1.4,mz,-Math.atan2(d[1],d[0])]);}}
    if(any&&t.city==null)juncs.push([c.x,AE.heightLocal(t,0,0)+.3,c.y,0,1]);}
  if(segs.length){const m=new T3.Mesh(roadGeometry(segs),roadMat());m.receiveShadow=true;g.add(m);}
  for(const j of juncs)(L.roadJunction||(L.roadJunction=[])).push(j);
  for(const b of bridges)(L.bridge||(L.bridge=[])).push([b[0],b[1],b[2],b[3],1]);
  const m4=new T3.Matrix4(),q=new T3.Quaternion(),e=new T3.Euler(),v=new T3.Vector3(),sc=new T3.Vector3(),col=new T3.Color();
  for(const key in L){const list=L[key],geo=AE.PROPS[key];if(!geo||!list.length)continue;
    const mat=WIND.has(key)?AE.prefabMatWind:AE.prefabMatHide;const im=new T3.InstancedMesh(geo,mat,list.length);
    list.forEach((it,i)=>{v.set(it[0],it[1],it[2]);e.set(0,it[3]||0,0);q.setFromEuler(e);const s=it[4]||1;sc.set(s,s,s);m4.compose(v,q,sc);im.setMatrixAt(i,m4);col.set(it[5]!=null?it[5]:0xffffff);im.setColorAt(i,col);});
    im.userData.hi=geo;im.userData.lo=AE.LOD[key]?AE.PROPS[AE.LOD[key]]:null;im.userData.tiny=AE.TINY.has(key);
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=CAST(key);im.receiveShadow=true;im.computeBoundingSphere&&im.computeBoundingSphere();g.add(im);}
  ch.props=g;AE.world.root.add(g);ch.psig=propSig(ch.tiles);applyLOD(ch,AE.world.lod);AE.world.shadowDirty=true;
}
// zoom LOD: far view swaps vegetation for low-poly stand-ins and drops tiny ground dressing
function applyLOD(ch,lod){if(!ch.props)return;for(const m of ch.props.children){if(!m.isInstancedMesh)continue;if(m.userData.cast0===undefined)m.userData.cast0=m.castShadow;if(m.userData.lo){m.geometry=lod?m.userData.lo:m.userData.hi;m.castShadow=lod?false:m.userData.cast0;}if(m.userData.tiny){m.visible=!lod;}}}
AE.updateLOD=function(){const w=AE.world;if(!w)return;const lod=cam.z<.72;if(lod===w.lod)return;w.lod=lod;for(const ch of w.chunks)applyLOD(ch,lod);w.shadowDirty=true;};
function bounds(){const minX=-HW,minZ=-S*1.2,maxX=G.W*HW+HW*.5,maxZ=(G.H-1)*S*1.5+S*1.2;return {x:minX,z:minZ,w:maxX-minX,h:maxZ-minZ,cx:(minX+maxX)/2,cz:(minZ+maxZ)/2};}

AE.buildWorld=function(){
  if(!threeWorld.ready||!G)return;
  const t0=performance.now();
  if(AE.world&&AE.world.root){AE.disposeObj(AE.world.root);}
  AE.resetCaches();AE.ensureTileTex();AE.updateTileTex();
  const root=new T3.Group();threeWorld.scene.add(root);
  AE.world={seed:G.seed,root,chunks:[],lastSync:0,bounds:bounds()};
  const b=AE.world.bounds;
  // water plane + soft shoreline field
  const shoreRect={x:b.x-200,z:b.z-200,w:b.w+400,h:b.h+400};
  const shore=buildShore(shoreRect);
  const wm=waterMaterial(shore,shoreRect);AE.world.waterMat=wm;
  const water=new T3.Mesh(new T3.PlaneGeometry(b.w+16000,b.h+16000),wm);water.rotation.x=-Math.PI/2;water.position.set(b.cx,AE.WATER_Y,b.cz);root.add(water);AE.world.water=water;AE.world.shore=shore;
  const nCX=Math.ceil(G.W/CH),nCY=Math.ceil(G.H/CH);
  for(let cy=0;cy<nCY;cy++)for(let cx=0;cx<nCX;cx++){const ch={cx,cy,tiles:chunkTiles(cx,cy),terrain:null,props:null,tsig:'',psig:''};AE.world.chunks.push(ch);buildChunkTerrain(ch);buildChunkProps(ch);}
  if(AE.buildSky)AE.buildSky(root);
  AE.world.buildMs=performance.now()-t0;threeWorld.seed=G.seed;
  if(AE.prewarmIcons)AE.prewarmIcons();
};
AE.syncWorld=function(force){
  if(!AE.world)return;const now=performance.now();if(!force&&now-AE.world.lastSync<450)return;AE.world.lastSync=now;
  for(const ch of AE.world.chunks){const ts=terrSig(ch.tiles);if(ts!==ch.tsig)buildChunkTerrain(ch);const ps=propSig(ch.tiles);if(ps!==ch.psig)buildChunkProps(ch);}
};
// soft drifting cloud banks high above the map (fade out as the camera zooms in)
AE.buildSky=function(root){
  const b=AE.world.bounds,tex=AE.cloudTex(),R=AE.rng((G.seed|0)%9999+5),list=[];
  // cloud banks frame the world along its edges (like the reference), never hazing the playfield centre
  const per=2*(b.w+b.h),n=Math.round(per/260);
  for(let i=0;i<n;i++){const mat=new T3.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:.6,fog:false,toneMapped:false});const s=new T3.Sprite(mat);const sc=260+R()*300;s.scale.set(sc*1.6,sc,1);
    let d=R()*per,x,z;const o=(R()-.35)*320;if(d<b.w){x=b.x+d;z=b.z-o;}else if((d-=b.w)<b.h){x=b.x+b.w+o;z=b.z+d;}else if((d-=b.h)<b.w){x=b.x+d;z=b.z+b.h+o;}else{d-=b.w;x=b.x-o;z=b.z+d;}
    s.position.set(x,120+R()*90,z);s.userData.v=0;s.userData.base=.55+R()*.3;s.renderOrder=20;root.add(s);list.push(s);}
  AE.world.clouds=list;
};
AE.animateSky=function(now){
  const w=AE.world;if(!w||!w.clouds)return;const b=w.bounds,dt=Math.min(.1,(now-(w.skyT||now))/1000);w.skyT=now;
  const f=AE.clamp((1.05-cam.z)/.6,0,1);const ca=threeWorld.camera;
  for(const s of w.clouds){s.position.x+=s.userData.v*dt;if(s.position.x>b.x+b.w+500)s.position.x=b.x-500;
    const d=ca.position.distanceTo(s.position),near=AE.clamp((d-AE.camDist()*.35)/(AE.camDist()*.4),0,1);s.material.opacity=s.userData.base*f*near;s.visible=s.material.opacity>.01;}
};
AE.animateWorld=function(now){
  const w=AE.world;if(!w)return;const ca=threeWorld.camera;
  if(w.waterMat){w.waterMat.uniforms.uCamPos.value.copy(ca.position);const f=threeWorld.scene.fog;if(f){w.waterMat.uniforms.uFogNear.value=f.near;w.waterMat.uniforms.uFogFar.value=f.far;w.waterMat.uniforms.uFogColor.value.copy(f.color);}}
  if(MATS.river)MATS.river.uniforms.uCamPos.value.copy(ca.position);
  if(AE.animateSky)AE.animateSky(now);
};
})();
