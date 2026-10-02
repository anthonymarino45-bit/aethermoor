/* Realms of Aethermoor V5.7.0 - 2D overlay pass on top of the 3D world: nameplates, resource medallions,
   unit status bars, path preview, combat effects, minimap. Falls back to the legacy 2D renderer when WebGL is unavailable. */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const legacyDraw=window.draw,legacyDrawMini=window.drawMini;
AE.legacyDraw=legacyDraw;
const DPR=()=>Math.min(2,window.devicePixelRatio||1);
const in3D=()=>!!(threeWorld.enabled&&threeWorld.active&&threeWorld.ready);
AE.in3D=in3D;

// ---------------------------------------------------------------- cached badge art
const badgeCache=new Map();
function medallion(key,icon,ring){
  let c=badgeCache.get(key);if(c)return c;
  const n=Math.round(64*DPR());c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),r=n/2;
  x.save();x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=n*.08;x.shadowOffsetY=n*.04;
  const g=x.createLinearGradient(0,0,0,n);g.addColorStop(0,ring[0]);g.addColorStop(.5,ring[1]);g.addColorStop(1,ring[2]);x.fillStyle=g;x.beginPath();x.arc(r,r,r*.92,0,6.283);x.fill();x.restore();
  x.strokeStyle='rgba(60,38,8,.9)';x.lineWidth=n*.025;x.beginPath();x.arc(r,r,r*.92,0,6.283);x.stroke();
  const ig=x.createRadialGradient(r*.8,r*.7,r*.1,r,r,r*.74);ig.addColorStop(0,'#2c3a52');ig.addColorStop(1,'#0c1220');x.fillStyle=ig;x.beginPath();x.arc(r,r,r*.72,0,6.283);x.fill();
  x.strokeStyle='rgba(255,236,170,.55)';x.lineWidth=n*.02;x.beginPath();x.arc(r,r,r*.72,0,6.283);x.stroke();
  x.font=`${Math.round(n*.46)}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(icon,r,r*1.06);
  const hl=x.createLinearGradient(0,0,0,r);hl.addColorStop(0,'rgba(255,255,255,.22)');hl.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=hl;x.beginPath();x.ellipse(r,r*.62,r*.55,r*.3,0,0,6.283);x.fill();
  badgeCache.set(key,c);return c;
}
const RING={gold:['#fff1b8','#d9a640','#7a5216'],red:['#ffd0c0','#d2593e','#6e1d10'],green:['#e8ffd0','#7fb64a','#2c5a14'],silver:['#ffffff','#b9c3cc','#56606a'],violet:['#efe0ff','#a77ad8','#45246e']};
function resMedallion(k){const r=RES[k];return medallion('r'+k,r.ico,r.type==='lux'?RING.gold:r.type==='strat'?RING.red:RING.green);}

// ---------------------------------------------------------------- helpers
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
AE.rr=rr;
function viewTileRange(){
  const pts=[[0,0],[view.w,0],[0,view.h],[view.w,view.h]].map(([x,y])=>AE.groundAtScreen(x,y,0)).filter(Boolean);
  if(pts.length<4)return {minI:0,maxI:G.W-1,minJ:0,maxJ:G.H-1};
  let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;for(const p of pts){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minZ=Math.min(minZ,p.z);maxZ=Math.max(maxZ,p.z);}
  return {minI:Math.max(0,Math.floor(minX/HW)-2),maxI:Math.min(G.W-1,Math.ceil(maxX/HW)+2),minJ:Math.max(0,Math.floor(minZ/(S*1.5))-2),maxJ:Math.min(G.H-1,Math.ceil(maxZ/(S*1.5))+3)};
}
AE.viewTileRange=viewTileRange;
const ui=()=>AE.clamp(.62+cam.z*.42,.72,1.35);
AE.ui=ui;
function projLocal(t,lx,lz,dy=0){const p=worldPos(t.x,t.y);const y=AE.isWater(t)?AE.WATER_Y+1:AE.heightLocal(t,lx,lz);return AE.project(p.x+lx,y+dy,p.y+lz);}
AE.projLocal=projLocal;

// ---------------------------------------------------------------- city nameplate (level badge, crown, name, growth/production)
function cityPlate(c,v){
  const t=tileAt(c.x,c.y),p=worldPos(c.x,c.y),tier=cityTier(c.pop),top=AE.standY(t)+[22,30,38,46][tier]+(c.cap?4:0);
  const s=AE.project(p.x,top,p.y);if(s.z>1)return;
  const k=ui(),owner=CIVS[c.o],own=c.o===G.player,vis2=v===2;
  const turnsG=c.yl&&c.yl.surplus>0?Math.ceil((c.need-c.fs)/c.yl.surplus):'-';
  const name=c.name.toUpperCase();ctx.font=`700 ${Math.round(14*k)}px Cinzel,Georgia,serif`;const tw=ctx.measureText(name).width;
  const h=26*k,badge=h+6*k,crownW=c.cap?18*k:0,rightW=own?54*k:30*k,w=badge*.62+crownW+tw+rightW+22*k,x0=s.x-w/2+badge*.3,y0=s.y-h-6*k;
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=10*k;ctx.shadowOffsetY=3*k;
  const g=ctx.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,'rgba(22,36,74,.97)');g.addColorStop(1,'rgba(8,15,36,.97)');ctx.fillStyle=g;rr(ctx,x0,y0,w,h,h/2);ctx.fill();ctx.shadowColor='transparent';
  ctx.strokeStyle='#d9b45c';ctx.lineWidth=1.6*k;rr(ctx,x0,y0,w,h,h/2);ctx.stroke();
  ctx.strokeStyle='rgba(255,236,170,.25)';ctx.lineWidth=1*k;rr(ctx,x0+2.5*k,y0+2.5*k,w-5*k,h-5*k,h/2-2.5*k);ctx.stroke();
  // faction stripe under the plate
  ctx.fillStyle=owner.color;rr(ctx,x0+h*.6,y0+h-3.2*k,w-h*1.1,2.6*k,1.3*k);ctx.fill();
  // level badge
  const bx=x0,by=y0+h/2,br=badge/2;const bg=ctx.createRadialGradient(bx-br*.3,by-br*.3,br*.1,bx,by,br);bg.addColorStop(0,AE.colLight(owner.color,.25));bg.addColorStop(1,AE.colLight(owner.color,-.22));
  ctx.fillStyle=bg;ctx.beginPath();ctx.arc(bx,by,br,0,6.283);ctx.fill();ctx.strokeStyle='#f6de9a';ctx.lineWidth=2*k;ctx.stroke();ctx.strokeStyle='rgba(60,40,10,.8)';ctx.lineWidth=1*k;ctx.beginPath();ctx.arc(bx,by,br+1.4*k,0,6.283);ctx.stroke();
  ctx.fillStyle='#fff';ctx.font=`700 ${Math.round(15*k)}px Cinzel,Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(c.pop,bx,by+1*k);
  let cx=x0+badge*.62+6*k;
  if(c.cap){ctx.font=`${Math.round(14*k)}px "Segoe UI Emoji",serif`;ctx.fillText('👑',cx+7*k,by);cx+=crownW;}
  ctx.textAlign='left';ctx.font=`700 ${Math.round(14*k)}px Cinzel,Georgia,serif`;ctx.fillStyle='#fdf3d0';ctx.fillText(name,cx,by+1*k);cx+=tw+8*k;
  ctx.font=`${Math.round(12*k)}px "Segoe UI Emoji",serif`;ctx.fillText('🌾',cx,by);ctx.font=`700 ${Math.round(12*k)}px Georgia,serif`;ctx.fillStyle='#d9f2b4';ctx.fillText(String(turnsG),cx+15*k,by+1*k);
  if(own){const pt=c.q?Math.max(1,Math.ceil((prodCost(c.q)-c.ps)/Math.max(.1,c.yl.p))):'-';ctx.font=`${Math.round(12*k)}px "Segoe UI Emoji",serif`;ctx.fillStyle='#fff';ctx.fillText('⚒',cx+28*k,by);ctx.font=`700 ${Math.round(12*k)}px Georgia,serif`;ctx.fillStyle='#f3c98a';ctx.fillText(String(pt),cx+42*k,by+1*k);}
  // growth / production / health bars
  const bw=w-h*1.3,bx0=x0+h*.75;let yb=y0+h+3*k;
  if(own){ctx.fillStyle='rgba(5,9,20,.85)';rr(ctx,bx0,yb,bw,4*k,2*k);ctx.fill();ctx.fillStyle='#7fd06a';rr(ctx,bx0,yb,bw*AE.clamp(c.fs/Math.max(1,c.need),0,1),4*k,2*k);ctx.fill();yb+=5*k;
    if(c.q){ctx.fillStyle='rgba(5,9,20,.85)';rr(ctx,bx0,yb,bw,4*k,2*k);ctx.fill();ctx.fillStyle='#e8a54a';rr(ctx,bx0,yb,bw*AE.clamp(c.ps/Math.max(1,prodCost(c.q)),0,1),4*k,2*k);ctx.fill();yb+=5*k;}}
  if(c.hp<c.maxhp){ctx.fillStyle='rgba(5,9,20,.9)';rr(ctx,bx0,yb,bw,5*k,2*k);ctx.fill();ctx.fillStyle=c.hp>c.maxhp*.5?'#4ade80':'#f87171';rr(ctx,bx0,yb,bw*c.hp/c.maxhp,5*k,2*k);ctx.fill();}
  if(!vis2){ctx.globalAlpha=1;}
  ctx.restore();
}
AE.colLight=(hex,d)=>{const c=new THREE.Color(hex),o={h:0,s:0,l:0};c.getHSL(o);c.setHSL(o.h,o.s,AE.clamp(o.l+d,0,1));return '#'+c.getHexString();};

// ---------------------------------------------------------------- landmarks: sites, natural wonders, lairs
function siteBadge(t,o){
  const k=ui();
  if(t.nw&&NATURAL_WONDERS[t.nw]){const w=NATURAL_WONDERS[t.nw],s=projLocal(t,0,0,AE.landmarkTop?AE.landmarkTop(t)+6:30);if(s.z>1)return;const m=medallion('nw'+t.nw,w.ico,RING.gold),sz=30*k;ctx.drawImage(m,s.x-sz/2,s.y-sz/2,sz,sz);
    ctx.font=`700 ${Math.round(11*k)}px Cinzel,Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3.5*k;ctx.strokeStyle='rgba(8,10,20,.9)';ctx.strokeText(w.n,s.x,s.y+sz*.75);ctx.fillStyle='#ffe9a8';ctx.fillText(w.n,s.x,s.y+sz*.75);}
  if(t.site&&SITE[t.site]&&o.vis===2){const s=projLocal(t,0,0,AE.landmarkTop?AE.landmarkTop(t)+4:22);if(s.z>1)return;const ring=t.site==='shrine'?RING.violet:t.site==='tower'?RING.silver:RING.gold,m=medallion('s'+t.site,SITE[t.site].ico,ring),sz=24*k;ctx.drawImage(m,s.x-sz/2,s.y-sz/2,sz,sz);}
  if(t.camp&&o.vis===2){const kind=typeof t.camp==='string'?t.camp:'goblin',L=LAIR[kind]||LAIR.goblin,s=projLocal(t,0,0,AE.landmarkTop?AE.landmarkTop(t)+5:24);if(s.z>1)return;const m=medallion('l'+kind,L.ico,RING.red),sz=24*k;ctx.drawImage(m,s.x-sz/2,s.y-sz/2,sz,sz);
    ctx.font=`700 ${Math.round(10*k)}px Cinzel,Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3*k;ctx.strokeStyle='rgba(20,5,5,.9)';ctx.strokeText(L.n,s.x,s.y+sz*.8);ctx.fillStyle='#ffc8bc';ctx.fillText(L.n,s.x,s.y+sz*.8);}
}

// ---------------------------------------------------------------- path preview
function drawPath(){
  if(!selPath||!selPath.length)return;const s0=G.sel&&G.sel.type==='unit'?unitOf(G.sel.id):null;const k=ui();
  const pts=[];if(s0){const t=tileAt(s0.x,s0.y);pts.push(projLocal(t,0,0,1.5));}
  for(const t of selPath)pts.push(projLocal(t,0,0,1.5));
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='rgba(30,18,0,.55)';ctx.lineWidth=6*k;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  ctx.setLineDash([9*k,7*k]);ctx.lineDashOffset=-(performance.now()/40)%32;ctx.strokeStyle='#ffe27a';ctx.lineWidth=3*k;ctx.shadowColor='rgba(255,210,90,.8)';ctx.shadowBlur=8*k;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);
  const l=pts[pts.length-1];ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(l.x,l.y,6*k,0,6.283);ctx.fill();ctx.strokeStyle='#5a3a06';ctx.lineWidth=1.5*k;ctx.stroke();
  // turn count marker on the destination
  const u=s0;if(u&&UNITS[u.k]){let mv=unitMove(u),left=u.mp,turns=1;for(let i=0;i<selPath.length;i++){const cst=1;left-=cst;if(left<0&&i<selPath.length){turns++;left=mv-cst;}}
    if(turns>1){ctx.font=`700 ${Math.round(11*k)}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#1a1205';ctx.fillText(turns,l.x,l.y+.5);}}
  ctx.restore();
}

// ---------------------------------------------------------------- unit overlay (health, status, hero)
function unitOverlay(u,sel){
  const sp=AE.unitScreen?AE.unitScreen(u):null;if(!sp||sp.z>1)return;const k=ui()*(sp.scale||1);
  const d=UNITS[u.k];
  if(u.hp<100||sel){const bw=34*k,bh=5*k,x=sp.x-bw/2,y=sp.footY+5*k;ctx.fillStyle='rgba(3,7,13,.9)';rr(ctx,x-1.5*k,y-1.5*k,bw+3*k,bh+3*k,3*k);ctx.fill();
    ctx.fillStyle=u.hp>60?'#4ade80':u.hp>30?'#facc15':'#f87171';rr(ctx,x,y,Math.max(2*k,bw*u.hp/100),bh,2*k);ctx.fill();ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(x+1*k,y+.8*k,Math.max(0,bw*u.hp/100-2*k),1*k);}
  const st=u.job?'🔨':u.auto?'🧭':u.healUntil?'❤️':u.fort?'🛡️':u.sleep?'💤':u.setup&&d.cls==='siege'?'🎯':u.emb?'⚓':null;
  if(st){const r=8.5*k,x=sp.x+15*k,y=sp.headY-2*k;ctx.fillStyle='rgba(10,19,48,.92)';ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();ctx.strokeStyle='#d9b45c';ctx.lineWidth=1.4*k;ctx.stroke();ctx.font=`${Math.round(10*k)}px "Segoe UI Emoji",serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(st,x,y+.5*k);}
  if(d.hero){ctx.font=`700 ${Math.round(14*k)}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3*k;ctx.strokeStyle='#2a1704';ctx.strokeText('★',sp.x,sp.headY-12*k);ctx.fillStyle='#ffe7a3';ctx.fillText('★',sp.x,sp.headY-12*k);}
  if(u.o===G.player&&canPromote&&canPromote(u)){ctx.font=`700 ${Math.round(11*k)}px Georgia`;ctx.fillStyle='#7CFC9A';ctx.textAlign='center';ctx.fillText('▲',sp.x-15*k,sp.headY-2*k);}
}

// ---------------------------------------------------------------- combat projectiles and floating text
function drawShots(now){
  G.shots=(G.shots||[]).filter(s=>now-s.t<460);const k=ui();
  for(const s of G.shots){const a=Math.min(1,(now-s.t)/360),t0=tileAt(s.sx,s.sy),t1=tileAt(s.tx,s.ty);if(!t0||!t1)continue;
    const p0=worldPos(s.sx,s.sy),p1=worldPos(s.tx,s.ty),y0=AE.standY(t0)+14,y1=AE.standY(t1)+10,dist=Math.hypot(p1.x-p0.x,p1.y-p0.y);
    const X=p0.x+(p1.x-p0.x)*a,Z=p0.y+(p1.y-p0.y)*a,Y=y0+(y1-y0)*a+Math.sin(a*Math.PI)*dist*.22,q=AE.project(X,Y,Z);
    const aa=Math.max(0,a-.06),Xb=p0.x+(p1.x-p0.x)*aa,Zb=p0.y+(p1.y-p0.y)*aa,Yb=y0+(y1-y0)*aa+Math.sin(aa*Math.PI)*dist*.22,qb=AE.project(Xb,Yb,Zb);
    ctx.save();
    if(s.kind==='magic'){ctx.globalAlpha=1-a*.2;ctx.shadowBlur=18*k;ctx.shadowColor=s.col||'#65b9ff';ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.arc(q.x,q.y,6*k,0,6.283);ctx.fill();ctx.strokeStyle=(s.col||'#65b9ff');ctx.lineWidth=4*k;ctx.beginPath();ctx.moveTo(qb.x,qb.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
    else if(s.kind==='cannon'){ctx.shadowBlur=10*k;ctx.shadowColor='#ffb347';ctx.fillStyle='#222';ctx.beginPath();ctx.arc(q.x,q.y,4.5*k,0,6.283);ctx.fill();ctx.strokeStyle='rgba(200,200,200,.5)';ctx.lineWidth=3*k;ctx.beginPath();ctx.moveTo(qb.x,qb.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
    else{const ang=Math.atan2(q.y-qb.y,q.x-qb.x);ctx.translate(q.x,q.y);ctx.rotate(ang);ctx.strokeStyle='#f6d98c';ctx.lineWidth=2*k;ctx.beginPath();ctx.moveTo(-11*k,0);ctx.lineTo(6*k,0);ctx.stroke();ctx.fillStyle='#fff4c7';ctx.beginPath();ctx.moveTo(9*k,0);ctx.lineTo(3*k,-3*k);ctx.lineTo(3*k,3*k);ctx.closePath();ctx.fill();}
    ctx.restore();}
}
function drawFx(now,v){
  G.fx=G.fx.filter(f=>now-f.t<1400);const k=ui();
  for(const f of G.fx){if(!v[idx(f.x,f.y)])continue;const t=tileAt(f.x,f.y),a=(now-f.t)/1400,p=worldPos(f.x,f.y),q=AE.project(p.x,AE.standY(t)+30+a*26,p.y);
    ctx.globalAlpha=1-a*a;ctx.font=`700 ${Math.round((16+4*(1-a))*k)}px Cinzel,Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=4*k;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(f.text,q.x,q.y);ctx.fillStyle=f.color;ctx.fillText(f.text,q.x,q.y);ctx.globalAlpha=1;}
}
function drawYield3D(t,yy){
  const k=ui(),items=[['🌾',yy.f,'#b8f08a'],['⚙',yy.p,'#f2c27a'],['🪙',yy.g,'#ffe066']].filter(i=>i[1]>0);if(!items.length)return;
  const s=projLocal(t,0,S*.38,1);const w=items.length*25*k+6*k,h=17*k;ctx.fillStyle='rgba(8,12,24,.86)';rr(ctx,s.x-w/2,s.y-h/2,w,h,h/2);ctx.fill();ctx.strokeStyle='rgba(217,180,92,.7)';ctx.lineWidth=1*k;ctx.stroke();
  let x=s.x-w/2+5*k;ctx.textBaseline='middle';ctx.textAlign='left';for(const [ic,n,col] of items){ctx.font=`${Math.round(10*k)}px "Segoe UI Emoji",serif`;ctx.fillStyle=col;ctx.fillText(ic,x,s.y);ctx.font=`700 ${Math.round(11*k)}px Georgia`;ctx.fillStyle='#fff';ctx.fillText(n,x+13*k,s.y+.5*k);x+=25*k;}
}

// ---------------------------------------------------------------- main draw override
window.draw=function(now){
  if(!G)return;
  if(!in3D()){if(threeWorld.enabled&&!threeWorld.failed&&window.threeWorldInit&&threeWorldInit()){}else return legacyDraw(now);}
  if(!in3D())return legacyDraw(now);
  const v=G.vis[G.player];
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,view.w,view.h);
  threeWorldDraw(now);
  const R=viewTileRange(),k=ui();
  // resource medallions (lower-left of each explored tile, like the reference look)
  const showRes=cam.z>.64;
  if(showRes){const sz=24*k;for(let j=R.minJ;j<=R.maxJ;j++)for(let i=R.minI;i<=R.maxI;i++){const t=G.tiles[j*G.W+i];if(!t.r||!RES[t.r]||!v[j*G.W+i]||t.city!=null)continue;const s=projLocal(t,-S*.40,S*.34,.5);if(s.z>1)continue;ctx.globalAlpha=v[j*G.W+i]===2?1:.72;ctx.drawImage(resMedallion(t.r),s.x-sz/2,s.y-sz/2,sz,sz);}ctx.globalAlpha=1;}
  // improvements built by great people get a small medallion so they stay identifiable
  drawPath();
  // landmarks + cities + units in back-to-front row order
  const vt=[];for(let j=R.minJ;j<=R.maxJ;j++)for(let i=R.minI;i<=R.maxI;i++){const vis=v[j*G.W+i];if(vis)vt.push({t:G.tiles[j*G.W+i],vis});}
  for(const o of vt){const t=o.t;if(t.nw||t.site||t.camp)siteBadge(t,o);}
  if(cityView&&cityTileBuyMode){for(const t of tileBuyCandidates(cityView)){const s=projLocal(t,0,0,2);ctx.font=`700 ${Math.round(12*k)}px Cinzel,Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3*k;ctx.strokeStyle='rgba(20,12,0,.9)';const txt=tileBuyCost(cityView,t)+' 🪙';ctx.strokeText(txt,s.x,s.y);ctx.fillStyle='#fff3b0';ctx.fillText(txt,s.x,s.y);}}
  const selId=G.sel&&G.sel.type==='unit'?G.sel.id:null;
  if(AE.syncUnits){for(const o of vt){if(o.vis!==2)continue;for(const u of unitsAt(o.t.x,o.t.y))unitOverlay(u,u.id===selId);}}
  else{for(const o of vt){if(o.vis!==2)continue;const us=unitsAt(o.t.x,o.t.y);if(!us.length)continue;const p=toScreen(o.t.x,o.t.y);const mil=us.find(u=>!isCiv(u)),cv=us.find(u=>isCiv(u));if(cv)drawUnit(cv,p.x,p.y,cam.z,mil?-21:0,mil?18:6,cv.id===selId,now,true);if(mil)drawUnit(mil,p.x,p.y,cam.z,0,2,mil.id===selId,now,true);}}
  for(const o of vt){if(o.t.city!=null){const c=cityOf(o.t.city);if(c)cityPlate(c,o.vis);}}
  if(cityView){for(const i of cityView.tiles){const t=G.tiles[i];drawYield3D(t,tileYield(t,cityView.o));}}
  drawShots(now);drawFx(now,v);
  // gentle warm grade + vignette, kept light so the painted world stays readable
  const vg=ctx.createRadialGradient(view.w/2,view.h*.48,Math.min(view.w,view.h)*.42,view.w/2,view.h/2,Math.max(view.w,view.h)*.78);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(4,8,18,.30)');ctx.fillStyle=vg;ctx.fillRect(0,0,view.w,view.h);
  drawMini();
};

// ---------------------------------------------------------------- minimap (parchment chart + view footprint)
let miniBase=null,miniSig='';
const MCOL={ocean:[36,82,104],coast:[78,140,152],grass:[104,146,70],plains:[176,160,88],desert:[214,186,128],tundra:[140,146,118],snow:[232,238,240],hills:[140,130,84],mountain:[118,106,94]};
window.drawMini=function(){
  if(!miniC||!G)return;if(!in3D())return legacyDrawMini();
  const v=G.vis[G.player],Wc=miniC.width,Hc=miniC.height;
  let sig=G.W+'x'+G.H+'|'+G.cities.length+'|';let h=0;for(let i=0;i<G.tiles.length;i++){h=(h*31+(v[i]|0)*7+(G.tiles[i].own+2))|0;}sig+=h;
  if(!miniBase||sig!==miniSig||miniDirty){miniSig=sig;miniDirty=false;
    miniBase=miniBase||document.createElement('canvas');miniBase.width=Wc;miniBase.height=Hc;const m=miniBase.getContext('2d');
    // parchment ground
    const pg=m.createLinearGradient(0,0,Wc,Hc);pg.addColorStop(0,'#d9c592');pg.addColorStop(1,'#b89c62');m.fillStyle=pg;m.fillRect(0,0,Wc,Hc);
    const R=AE.rng(91);for(let i=0;i<260;i++){m.fillStyle=`rgba(${R()<.5?'110,80,40':'250,236,200'},${.05+R()*.06})`;m.beginPath();m.arc(R()*Wc,R()*Hc,1+R()*6,0,6.283);m.fill();}
    const sx=Wc/(G.W*HW),sy=Hc/(G.H*S*1.5),rad=S*Math.max(sx,sy)*1.08;
    for(let i=0;i<G.tiles.length;i++){const vis=v[i];if(!vis)continue;const t=G.tiles[i],p=worldPos(t.x,t.y);let c=MCOL[t.t]||[120,120,120];
      if(t.f==='forest')c=[c[0]*.62,c[1]*.82,c[2]*.6];else if(t.f==='jungle')c=[c[0]*.5,c[1]*.78,c[2]*.55];
      if(vis===1){const l=(c[0]+c[1]+c[2])/3;c=[c[0]*.55+l*.25,c[1]*.55+l*.25,c[2]*.55+l*.28];}
      m.fillStyle=`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;const x=p.x*sx,y=p.y*sy;m.beginPath();for(let q=0;q<6;q++){const a=(60*q-30)*Math.PI/180;const xx=x+Math.cos(a)*rad,yy=y+Math.sin(a)*rad*(sy/sx);q?m.lineTo(xx,yy):m.moveTo(xx,yy);}m.closePath();m.fill();
      if(t.own>=0){m.fillStyle=CIVS[t.own].color+'55';m.fill();}}
    // territory outlines
    m.lineWidth=1.2;for(let i=0;i<G.tiles.length;i++){const t=G.tiles[i];if(t.own<0||!v[i])continue;const p=worldPos(t.x,t.y);for(let k2=0;k2<6;k2++){const n=AE.nbrDir(t,k2);if(n&&n.own===t.own)continue;const a1=(-60*k2-30)*Math.PI/180,a2=(-60*k2+30)*Math.PI/180;m.strokeStyle=CIVS[t.own].color;m.beginPath();m.moveTo((p.x+Math.cos(a1)*S)*sx,(p.y+Math.sin(a1)*S)*sy);m.lineTo((p.x+Math.cos(a2)*S)*sx,(p.y+Math.sin(a2)*S)*sy);m.stroke();}}
    for(const c of G.cities){if(!v[idx(c.x,c.y)])continue;const p=worldPos(c.x,c.y);m.fillStyle=CIVS[c.o].color;m.strokeStyle='#fff3c4';m.lineWidth=1.2;m.beginPath();m.arc(p.x*sx,p.y*sy,c.cap?3.4:2.6,0,6.283);m.fill();m.stroke();}
    for(const c of G.camps||[]){if(v[idx(c.x,c.y)]!==2)continue;const p=worldPos(c.x,c.y);m.fillStyle='#c0392b';m.fillRect(p.x*sx-1.5,p.y*sy-1.5,3,3);}
    // inner frame
    m.strokeStyle='rgba(80,52,14,.75)';m.lineWidth=2;m.strokeRect(1,1,Wc-2,Hc-2);
  }
  miniX.clearRect(0,0,Wc,Hc);miniX.drawImage(miniBase,0,0);
  const sx=Wc/(G.W*HW),sy=Hc/(G.H*S*1.5);
  const pts=[[0,0],[view.w,0],[view.w,view.h],[0,view.h]].map(([x,y])=>AE.groundAtScreen(x,y,0));
  if(pts.every(Boolean)){miniX.save();miniX.strokeStyle='rgba(255,255,255,.95)';miniX.lineWidth=1.6;miniX.shadowColor='rgba(0,0,0,.8)';miniX.shadowBlur=3;miniX.beginPath();pts.forEach((p,i)=>{const x=p.x*sx,y=p.z*sy;i?miniX.lineTo(x,y):miniX.moveTo(x,y);});miniX.closePath();miniX.stroke();miniX.restore();}
};
// legacy sprite preloading is not needed by the 3D renderer (it requested many non-existent sheets)
const legacyPreload=window.preloadExternalSprites;
window.preloadExternalSprites=function(){if(threeWorld.enabled&&window.THREE)return;return legacyPreload&&legacyPreload();};
})();
