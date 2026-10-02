/* Realms of Aethermoor V5.7.0 - procedural painted, seamless terrain textures (generated once at load, cached). */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const T3=THREE;
const TEX={};AE.TEX=TEX;

function hexRGB(h){return [(h>>16)&255,(h>>8)&255,h&255];}
function ramp(stops,t){t=Math.max(0,Math.min(1,t));for(let i=1;i<stops.length;i++){if(t<=stops[i][0]){const a=stops[i-1],b=stops[i],k=(t-a[0])/Math.max(1e-6,b[0]-a[0]),ca=hexRGB(a[1]),cb=hexRGB(b[1]);return [ca[0]+(cb[0]-ca[0])*k,ca[1]+(cb[1]-ca[1])*k,ca[2]+(cb[2]-ca[2])*k];}}return hexRGB(stops[stops.length-1][1]);}
function rgba(h,a){const c=hexRGB(h);return `rgba(${c[0]},${c[1]},${c[2]},${a})`;}
// periodic value noise for seamless tiling
function periodicNoise(n,period,oct,seed,persist=.5){
  const out=new Float32Array(n*n);let amp=1,tot=0;
  for(let o=0;o<oct;o++){
    const P=period<<o,lat=new Float32Array(P*P);const r=AE.rng(seed*977+o*131+7);for(let i=0;i<lat.length;i++)lat[i]=r();
    for(let y=0;y<n;y++){const fy=y/n*P,iy=Math.floor(fy),ty=fy-iy,sy=ty*ty*(3-2*ty),y0=iy%P,y1=(iy+1)%P;
      for(let x=0;x<n;x++){const fx=x/n*P,ix=Math.floor(fx),tx=fx-ix,sx=tx*tx*(3-2*tx),x0=ix%P,x1=(ix+1)%P;
        const a=lat[y0*P+x0],b=lat[y0*P+x1],c=lat[y1*P+x0],d=lat[y1*P+x1];out[y*n+x]+=amp*((a+(b-a)*sx)*(1-sy)+(c+(d-c)*sx)*sy);}}
    tot+=amp;amp*=persist;}
  for(let i=0;i<out.length;i++)out[i]/=tot;return out;
}
function stretch(arr){let mn=1,mx=0;for(const v of arr){if(v<mn)mn=v;if(v>mx)mx=v;}const k=1/Math.max(1e-4,mx-mn);for(let i=0;i<arr.length;i++)arr[i]=(arr[i]-mn)*k;return arr;}
function makeCanvas(n){const c=document.createElement('canvas');c.width=c.height=n;return c;}
// base layer: tileable fbm through a colour ramp, painted at low res then upscaled for soft brushy variation
function baseLayer(ctx,N,stops,seed,period=4,oct=5,detail=null){
  const n=256,nz=stretch(periodicNoise(n,period,oct,seed)),nz2=detail?stretch(periodicNoise(n,period*4,3,seed+5)):null;
  const c=makeCanvas(n),x=c.getContext('2d'),img=x.createImageData(n,n);
  for(let i=0;i<n*n;i++){let t=nz[i];if(nz2)t=t*.78+nz2[i]*.22;const col=ramp(stops,t);img.data[i*4]=col[0];img.data[i*4+1]=col[1];img.data[i*4+2]=col[2];img.data[i*4+3]=255;}
  x.putImageData(img,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // draw 3x3 tiled to keep wrapped edges smooth after scaling
  for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)ctx.drawImage(c,ox*N,oy*N,N,N);
}
function wrap(N,x,y,r,fn){for(let oy=-N;oy<=N;oy+=N)for(let ox=-N;ox<=N;ox+=N){const X=x+ox,Y=y+oy;if(X>-r&&X<N+r&&Y>-r&&Y<N+r)fn(X,Y);}}
function blobs(ctx,N,R,count,hex,alpha,rmin,rmax){for(let i=0;i<count;i++){const x=R()*N,y=R()*N,r=rmin+R()*(rmax-rmin),a=alpha*(.6+R()*.6);wrap(N,x,y,r,(X,Y)=>{const g=ctx.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,rgba(hex,a));g.addColorStop(1,rgba(hex,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y,r,0,6.2832);ctx.fill();});}}
function strokes(ctx,N,R,count,cols,lmin,lmax,wmin,wmax,alpha,dirBias=null){ctx.lineCap='round';for(let i=0;i<count;i++){const x=R()*N,y=R()*N,len=lmin+R()*(lmax-lmin),a=dirBias!=null?dirBias+(R()-.5)*1.1:R()*6.2832,w=wmin+R()*(wmax-wmin),c=cols[(R()*cols.length)|0],bend=(R()-.5)*len*.5;
  wrap(N,x,y,len,(X,Y)=>{ctx.strokeStyle=rgba(c,alpha*(.55+R()*.45));ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(X,Y);const ex=X+Math.cos(a)*len,ey=Y+Math.sin(a)*len;ctx.quadraticCurveTo((X+ex)/2+Math.cos(a+1.57)*bend,(Y+ey)/2+Math.sin(a+1.57)*bend,ex,ey);ctx.stroke();});}}
function dots(ctx,N,R,count,cols,rmin,rmax,alpha){for(let i=0;i<count;i++){const x=R()*N,y=R()*N,r=rmin+R()*(rmax-rmin),c=cols[(R()*cols.length)|0];wrap(N,x,y,r,(X,Y)=>{ctx.fillStyle=rgba(c,alpha*(.6+R()*.4));ctx.beginPath();ctx.arc(X,Y,r,0,6.2832);ctx.fill();});}}
function pebbles(ctx,N,R,count,base,rmin,rmax,alpha=1){for(let i=0;i<count;i++){const x=R()*N,y=R()*N,r=rmin+R()*(rmax-rmin),sq=.55+R()*.4,rot=R()*3.14,c=AE.hsl(base,0,(R()-.5)*.08,(R()-.5)*.16);
  wrap(N,x,y,r*2,(X,Y)=>{ctx.save();ctx.translate(X,Y);ctx.rotate(rot);ctx.fillStyle=rgba(0x000000,.28*alpha);ctx.beginPath();ctx.ellipse(r*.25,r*.3,r,r*sq,0,0,6.2832);ctx.fill();
    const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,rgba(AE.hsl(c,0,0,.14),alpha));g.addColorStop(1,rgba(AE.hsl(c,0,0,-.12),alpha));ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,r,r*sq,0,0,6.2832);ctx.fill();ctx.restore();});}}
function flowers(ctx,N,R,count,cols,spread=7){for(let i=0;i<count;i++){const x=R()*N,y=R()*N,c=cols[(R()*cols.length)|0],k=3+(R()*7|0);for(let j=0;j<k;j++){const fx=x+(R()-.5)*spread*2,fy=y+(R()-.5)*spread*2,r=1.1+R()*1.3;wrap(N,fx,fy,r+2,(X,Y)=>{ctx.fillStyle=rgba(0x203a14,.35);ctx.beginPath();ctx.arc(X+.6,Y+.8,r,0,6.2832);ctx.fill();ctx.fillStyle=rgba(c,.95);ctx.beginPath();ctx.arc(X,Y,r,0,6.2832);ctx.fill();ctx.fillStyle=rgba(0xffe68a,.9);ctx.beginPath();ctx.arc(X,Y,r*.35,0,6.2832);ctx.fill();});}}}
function ripples(ctx,N,R,count,hexDark,hexLight,amp,alpha){for(let i=0;i<count;i++){const y0=R()*N,k=1+(R()*3|0),ph=R()*6.28,a=amp*(.5+R()*.8),x0=R()*N,len=N*(.15+R()*.35),k2=2+(R()*3|0),ph2=R()*6.28;
  for(const [hx,dy,al] of [[hexDark,0,alpha],[hexLight,2.2,alpha*.8]]){ctx.strokeStyle=rgba(hx,al);ctx.lineWidth=1.2+R()*1.3;
    wrap(N,x0,y0,len+a*2,(X,Y)=>{ctx.beginPath();for(let s=0;s<=len;s+=6){const xx=X+s,yy=Y+dy+Math.sin((xx/N)*6.2832*k+ph)*a+Math.sin((xx/N)*6.2832*k2+ph2)*a*.4;s?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();});}}}
function cracks(ctx,N,R,count,hex,alpha){ctx.lineCap='round';for(let i=0;i<count;i++){let x=R()*N,y=R()*N,a=R()*6.28;const segs=4+(R()*8|0),w=.8+R()*1.4;ctx.strokeStyle=rgba(hex,alpha);ctx.lineWidth=w;const pts=[[x,y]];for(let s=0;s<segs;s++){a+=(R()-.5)*1.2;x+=Math.cos(a)*(5+R()*9);y+=Math.sin(a)*(5+R()*9);pts.push([x,y]);}
  wrap(N,pts[0][0],pts[0][1],120,(X,Y)=>{const dx=X-pts[0][0],dy=Y-pts[0][1];ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(p[0]+dx,p[1]+dy):ctx.moveTo(p[0]+dx,p[1]+dy));ctx.stroke();});}}
function grassTufts(ctx,N,R,count,cols,size){for(let i=0;i<count;i++){const x=R()*N,y=R()*N,k=4+(R()*5|0),s=size*(.7+R()*.6);wrap(N,x,y,s*2,(X,Y)=>{ctx.fillStyle=rgba(0x10200c,.22);ctx.beginPath();ctx.ellipse(X+1.5,Y+2,s*.9,s*.55,0,0,6.2832);ctx.fill();ctx.lineCap='round';for(let j=0;j<k;j++){const a=-1.57+(j/(k-1)-.5)*1.8+(R()-.5)*.3,l=s*(.7+R()*.6);ctx.strokeStyle=rgba(cols[(R()*cols.length)|0],.9);ctx.lineWidth=1.3+R();ctx.beginPath();ctx.moveTo(X,Y);ctx.quadraticCurveTo(X+Math.cos(a)*l*.5,Y+Math.sin(a)*l*.6,X+Math.cos(a)*l,Y+Math.sin(a)*l);ctx.stroke();}});}}

const PAINT={
  grass(ctx,N,R){
    baseLayer(ctx,N,[[0,0x3f6223],[.28,0x5a7a2e],[.52,0x7a9338],[.76,0x98a444],[1,0xb6b25a]],11,3,5,true);
    blobs(ctx,N,R,46,0xc4bd6a,.30,50,150);blobs(ctx,N,R,52,0x2c4a1c,.30,50,150);blobs(ctx,N,R,30,0xa08a48,.18,30,90);
    strokes(ctx,N,R,7000,[0x2f4f1c,0x456a26,0x5f8530,0x7f9c3c,0xa8b25a],6,16,1.6,3.2,.72);
    grassTufts(ctx,N,R,300,[0x2f5320,0x4f7a2c,0x86a24a],12);
    dots(ctx,N,R,320,[0x243f16,0x34561f],2.5,6,.35);
    flowers(ctx,N,R,34,[0xf4f1e4,0xf4f1e4,0xf3d64b,0xcaa8ec,0xf0a8bd],12);
    dots(ctx,N,R,220,[0x8a6a3c,0x6f5530,0xb39a62],1.2,3,.45);
  },
  plains(ctx,N,R){
    baseLayer(ctx,N,[[0,0x7c7632],[.28,0x9a8c3c],[.52,0xb8a24c],[.78,0xcfb660],[1,0xe0c97c]],21,3,5,true);
    blobs(ctx,N,R,46,0x7f8f3a,.30,50,140);blobs(ctx,N,R,40,0xead08a,.26,50,130);blobs(ctx,N,R,30,0x8c6e3c,.20,25,70);
    strokes(ctx,N,R,7000,[0x857033,0xa48b3c,0xc2a656,0xdac479,0x6f7a34],7,18,1.4,2.8,.72);
    grassTufts(ctx,N,R,220,[0x9a8a3a,0xc4aa58,0x6f8a36],12);
    dots(ctx,N,R,260,[0x7b5d33,0x94743f],1.2,3.5,.4);
    flowers(ctx,N,R,16,[0xf3d64b,0xf6efe0,0xe9a548],10);
  },
  desert(ctx,N,R){
    baseLayer(ctx,N,[[0,0xc08f52],[.3,0xd3a868],[.6,0xe2bf84],[1,0xf1d9a6]],31,3,5,true);
    blobs(ctx,N,R,40,0xf6e1b4,.22,50,130);blobs(ctx,N,R,40,0xb27f48,.18,50,140);
    ripples(ctx,N,R,150,0xa97c47,0xf8e2b5,5,.32);
    pebbles(ctx,N,R,170,0x9c7a55,1.2,3.4,.9);dots(ctx,N,R,500,[0x8f6a43,0xb38a5a,0xf5e0b8],.6,1.5,.45);
    grassTufts(ctx,N,R,26,[0x8c8a48,0x6d6e3b,0xa79c58],6);
  },
  tundra(ctx,N,R){
    baseLayer(ctx,N,[[0,0x56614a],[.3,0x6c7756],[.55,0x838766],[.8,0x9c9a7c],[1,0xb5b096]],41,4,5,true);
    blobs(ctx,N,R,55,0x55703d,.25,30,90);blobs(ctx,N,R,26,0xeef3f5,.55,16,46);blobs(ctx,N,R,40,0xa4876a,.16,25,70);
    strokes(ctx,N,R,4200,[0x5b6646,0x75795a,0x8c8a68,0x6e7a4e],3,8,.9,1.6,.65);
    dots(ctx,N,R,700,[0xd5d8bd,0xc2a77e,0xe6e2cc,0x9fb27a],.7,2,.55);pebbles(ctx,N,R,120,0x82807a,1.4,4,.9);
  },
  snow(ctx,N,R){
    baseLayer(ctx,N,[[0,0xb6c8d8],[.35,0xcfdde9],[.7,0xe7eff6],[1,0xffffff]],51,4,5,true);
    blobs(ctx,N,R,50,0xa8bdd3,.25,40,120);blobs(ctx,N,R,60,0xffffff,.45,30,100);
    strokes(ctx,N,R,900,[0xffffff,0xdbe7f1,0xb9cadb],20,60,1,2.5,.35,.15);
    dots(ctx,N,R,900,[0xffffff,0xf4fbff],.5,1.3,.9);pebbles(ctx,N,R,40,0x8a8f97,1.2,3,.6);
  },
  hills(ctx,N,R){
    baseLayer(ctx,N,[[0,0x4a5f2a],[.3,0x627838],[.55,0x7f8a44],[.8,0x9f9a55],[1,0xb7a96a]],61,4,5,true);
    blobs(ctx,N,R,60,0x3d5524,.25,40,110);blobs(ctx,N,R,50,0xb3a56a,.2,30,90);blobs(ctx,N,R,40,0x8a6f4a,.2,20,60);
    strokes(ctx,N,R,6500,[0x435a26,0x5c7432,0x7b8a43,0x9e9a58],4,10,1,2,.7);
    pebbles(ctx,N,R,160,0x8b8378,1.5,5,.95);grassTufts(ctx,N,R,140,[0x3e5a22,0x6e8a3c],7);
    flowers(ctx,N,R,8,[0xf4f1e4,0xcaa8ec],6);
  },
  hills_d(ctx,N,R){
    baseLayer(ctx,N,[[0,0xa77a49],[.35,0xc0925b],[.65,0xd3ad73],[1,0xe6c792]],62,4,5,true);
    blobs(ctx,N,R,40,0x8d6440,.2,40,110);ripples(ctx,N,R,60,0x9c7044,0xf0d6a4,4,.25);
    pebbles(ctx,N,R,240,0x8b6f55,1.5,5,.95);grassTufts(ctx,N,R,30,[0x8c8a48,0x6d6e3b],6);
  },
  hills_t(ctx,N,R){
    baseLayer(ctx,N,[[0,0x4f5945],[.35,0x667055],[.65,0x7d806a],[1,0x9d9c86]],63,4,5,true);
    blobs(ctx,N,R,30,0xeef3f5,.5,16,50);pebbles(ctx,N,R,240,0x7c7a76,1.5,5,.95);
    strokes(ctx,N,R,3000,[0x5b6646,0x75795a,0x8c8a68],3,8,.9,1.6,.6);dots(ctx,N,R,500,[0xd5d8bd,0xc2a77e],.7,2,.5);
  },
  hills_s(ctx,N,R){
    baseLayer(ctx,N,[[0,0xa9bccd],[.4,0xc9d7e4],[.75,0xe5edf4],[1,0xffffff]],64,4,5,true);
    blobs(ctx,N,R,40,0x98aec4,.25,30,100);pebbles(ctx,N,R,160,0x7c8088,1.4,4.5,.85);dots(ctx,N,R,700,[0xffffff],.5,1.2,.9);
  },
  mountain(ctx,N,R){
    baseLayer(ctx,N,[[0,0x4e4943],[.3,0x645c53],[.6,0x7d7468],[.85,0x968b7d],[1,0xaba091]],71,5,5,true);
    blobs(ctx,N,R,40,0x4f6a33,.25,30,80);pebbles(ctx,N,R,520,0x7f776d,1.5,6,.95);cracks(ctx,N,R,90,0x2d2925,.45);
  },
  forest(ctx,N,R){
    baseLayer(ctx,N,[[0,0x1f3a19],[.3,0x2b4d20],[.6,0x3a6428],[1,0x557c35]],81,4,5,true);
    blobs(ctx,N,R,60,0x5d4a2a,.25,25,70);blobs(ctx,N,R,50,0x6a8a3a,.18,30,80);
    dots(ctx,N,R,1600,[0x7a5a2a,0x9a7a3a,0x5c3e22,0xa8852f,0x3a5a24],1,2.6,.6);
    strokes(ctx,N,R,3500,[0x24461c,0x3a6a28,0x4f7f32],4,10,1.2,2.4,.7);
    grassTufts(ctx,N,R,220,[0x2c5a21,0x447a2c,0x5f8f3a],9);
  },
  jungle(ctx,N,R){
    baseLayer(ctx,N,[[0,0x173d16],[.3,0x21521c],[.6,0x2f6a25],[1,0x4a8a34]],91,4,5,true);
    blobs(ctx,N,R,60,0x4e3a20,.25,25,70);blobs(ctx,N,R,60,0x64a03c,.2,30,80);
    strokes(ctx,N,R,4500,[0x1d4a19,0x2f6e26,0x4f9a38,0x6cb04a],5,14,1.4,3,.75);
    grassTufts(ctx,N,R,300,[0x2a6a22,0x4c9a34,0x6fb44a],10);dots(ctx,N,R,500,[0x5c3e22,0x7a5a2a],1,2.4,.55);
  },
  cliff(ctx,N,R){
    // vertical strata (texture v runs with height)
    baseLayer(ctx,N,[[0,0x4a3f36],[.3,0x5d5045],[.6,0x766759],[.85,0x8c7d6d],[1,0xa09180]],101,4,5,true);
    for(let i=0;i<70;i++){const y=R()*N,h=3+R()*14,c=R()>.5?0x3e342c:0x9a8a78;ctx.fillStyle=rgba(c,.18+R()*.18);wrap(N,0,y,h,(X,Y)=>{ctx.fillRect(0,Y,N,h);});}
    ctx.lineCap='round';for(let i=0;i<160;i++){let x=R()*N,y=R()*N;const len=20+R()*80;ctx.strokeStyle=rgba(0x231d18,.4);ctx.lineWidth=1+R()*2;const pts=[[x,y]];for(let s=0;s<6;s++){x+=(R()-.5)*8;y+=len/6;pts.push([x,y]);}wrap(N,pts[0][0],pts[0][1],len+20,(X,Y)=>{const dx=X-pts[0][0],dy=Y-pts[0][1];ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(p[0]+dx,p[1]+dy):ctx.moveTo(p[0]+dx,p[1]+dy));ctx.stroke();});}
    pebbles(ctx,N,R,140,0x857565,2,6,.6);blobs(ctx,N,R,30,0x3f5a2a,.25,15,40);
  },
  road(ctx,N,R){
    baseLayer(ctx,N,[[0,0x6e5639],[.4,0x8a6d48],[.75,0xa38660],[1,0xb99c74]],111,4,4,true);
    pebbles(ctx,N,R,700,0x9a8a74,2,5,.9);dots(ctx,N,R,600,[0x5a4630,0xc0a57e],.7,1.8,.5);
  },
  field(ctx,N,R){
    baseLayer(ctx,N,[[0,0x7a5a32],[.5,0x8f6b3c],[1,0xa57e4c]],121,4,4,true);
    dots(ctx,N,R,900,[0x5f4527,0xb08a5a],.8,2,.5);
  },
};
AE.paintTexture=function(kind){
  if(TEX[kind])return TEX[kind];
  const N=kind==='road'||kind==='field'?512:1024,c=makeCanvas(N),ctx=c.getContext('2d');
  const R=AE.rng(1000+kind.length*977+kind.charCodeAt(0)*31);
  (PAINT[kind]||PAINT.grass)(ctx,N,R);
  const tex=new T3.CanvasTexture(c);tex.encoding=T3.sRGBEncoding;tex.wrapS=tex.wrapT=T3.RepeatWrapping;tex.anisotropy=Math.min(8,threeWorld.renderer?threeWorld.renderer.capabilities.getMaxAnisotropy():4);tex.generateMipmaps=true;tex.minFilter=T3.LinearMipmapLinearFilter;
  TEX[kind]=tex;tex.userData.canvas=c;return tex;
};
// soft round sprite textures (glows, cloud puffs)
AE.radialTex=function(key,stops){
  if(TEX[key])return TEX[key];const n=128,c=makeCanvas(n),x=c.getContext('2d'),g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);for(const [o,col] of stops)g.addColorStop(o,col);x.fillStyle=g;x.fillRect(0,0,n,n);
  const t=new T3.CanvasTexture(c);t.encoding=T3.sRGBEncoding;TEX[key]=t;return t;
};
AE.cloudTex=function(){
  if(TEX.cloud)return TEX.cloud;const n=256,c=makeCanvas(n),x=c.getContext('2d'),R=AE.rng(777);
  for(let i=0;i<46;i++){const a=R()*6.28,r=R()*n*.28,px=n/2+Math.cos(a)*r*1.35,py=n/2+Math.sin(a)*r*.7,rr=n*(.08+R()*.13);const g=x.createRadialGradient(px,py,0,px,py,rr);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.6,'rgba(245,248,252,.25)');g.addColorStop(1,'rgba(240,245,250,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,rr,0,6.28);x.fill();}
  const t=new T3.CanvasTexture(c);t.encoding=T3.sRGBEncoding;TEX.cloud=t;return t;
};
})();
