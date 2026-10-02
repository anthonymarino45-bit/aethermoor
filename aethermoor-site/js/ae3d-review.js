/* Realms of Aethermoor V5.7.0 - developer review helpers (console only; no effect on gameplay).
   aeReview.capture(name)        -> composite 3D + overlay frame (PUT to a dev server that accepts /__capture/, else returns dataURL)
   aeReview.sheet(opts)          -> renders every unit type for a set of factions into a turntable-style review sheet
   aeReview.reveal()             -> reveal the whole map for inspection (debug only) */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const R=window.aeReview={};
R.composite=function(crop){
  draw(performance.now());
  const a=document.getElementById('map3d'),b=document.getElementById('map');
  const w=a.width,h=a.height,c=document.createElement('canvas');const cr=crop||[0,0,view.w,view.h];const sx=w/view.w;
  c.width=Math.round(cr[2]*sx);c.height=Math.round(cr[3]*sx);const x=c.getContext('2d');
  threeWorld.renderer.render(threeWorld.scene,threeWorld.camera);
  x.drawImage(a,cr[0]*sx,cr[1]*sx,cr[2]*sx,cr[3]*sx,0,0,c.width,c.height);
  x.drawImage(b,cr[0],cr[1],cr[2],cr[3],0,0,c.width,c.height);
  return c;
};
R.put=async function(name,canvas,type='image/png'){
  const blob=await new Promise(r=>canvas.toBlob(r,type,.92));
  try{const res=await fetch('__capture/'+name,{method:'PUT',body:blob});return res.ok?'saved '+name:'status '+res.status;}catch(e){return 'capture endpoint unavailable';}
};
R.capture=async function(name,crop){return R.put(name,R.composite(crop),name.endsWith('.jpg')?'image/jpeg':'image/png');};
R.quick=function(seed='4242',opts={}){pickSeed=String(seed);if(opts.size)pickMapSize=opts.size;if(opts.type)pickMapType=opts.type;beginGame();closeModal();if(opts.reveal!==false)R.reveal();const u=G.units.find(u=>u.o===G.player);if(u)centerOn(u.x,u.y);cam.z=opts.z||1;return {build:AE.world&&Math.round(AE.world.buildMs)};};
// review sheet: rows = factions, columns = unit keys (portrait renders straight from the in-game models)
R.sheet=async function(name,owners,keys,cell=220){
  owners=owners||[0,10,1,11,2,12,3,13,4,14];keys=keys||Object.keys(UNITS);
  const cols=owners.length>1?keys.length:Math.min(8,keys.length),rows=owners.length>1?owners.length:Math.ceil(keys.length/cols);
  const lab=owners.length>1?150:0,head=owners.length>1?28:0,c=document.createElement('canvas');c.width=lab+cols*cell;c.height=head+rows*(cell+22);
  const x=c.getContext('2d');x.fillStyle='#1d2430';x.fillRect(0,0,c.width,c.height);x.font='bold 14px Georgia';x.fillStyle='#f6de9a';x.textAlign='center';
  const imgs=[];
  for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){
    const o=owners.length>1?owners[r]:owners[0],k=owners.length>1?keys[q]:keys[r*cols+q];if(!k)continue;
    const url=AE.unitIcon(k,o);const im=new Image();imgs.push(new Promise(res=>{im.onload=()=>{const X=lab+q*cell,Y=head+r*(cell+22);x.fillStyle=(r+q)%2?'#252e3c':'#2a3446';x.fillRect(X,Y,cell,cell+22);x.drawImage(im,X+4,Y+2,cell-8,cell-8);x.fillStyle='#f3e6bf';x.font='12px Georgia';x.textAlign='center';x.fillText((UNITS[k].n||k).slice(0,26),X+cell/2,Y+cell+12);res();};im.src=url;}));
  }
  await Promise.all(imgs);
  if(owners.length>1){x.textAlign='left';x.font='bold 15px Georgia';owners.forEach((o,r)=>{x.fillStyle=CIVS[o].color;x.fillText(CIVS[o].name,8,head+r*(cell+22)+cell/2);x.fillStyle='#aab';x.font='12px Georgia';x.fillText(CIVS[o].race,8,head+r*(cell+22)+cell/2+18);x.font='bold 15px Georgia';});}
  return R.put(name,c,'image/jpeg');
};
// montage: run setups, capture crops and tile them into a single review image
R.montage=async function(name,shots,cols=2,label=true){
  const canv=[];for(const s of shots){if(s.setup)await s.setup();await new Promise(r=>setTimeout(r,s.wait||450));const c=R.composite(s.crop);if(label&&s.label){const x=c.getContext('2d');x.font='bold 16px Georgia';x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,x.measureText(s.label).width+16,26);x.fillStyle='#f6de9a';x.fillText(s.label,8,18);}canv.push(c);}
  const w=canv[0].width,h=canv[0].height,rows=Math.ceil(canv.length/cols),out=document.createElement('canvas');out.width=w*cols;out.height=h*rows;const x=out.getContext('2d');canv.forEach((c,i)=>x.drawImage(c,(i%cols)*w,Math.floor(i/cols)*h));
  return R.put(name,out,'image/jpeg');
};
R.reveal=function(){if(!G)return;G.vis[G.player].fill(2);miniDirty=true;};
R.goto=function(pred){const t=G.tiles.find(pred);if(t){centerOn(t.x,t.y);}return t;};
})();
