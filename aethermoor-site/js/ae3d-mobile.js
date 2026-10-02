/* Realms of Aethermoor — touch controls for phones/tablets.
   One finger: drag = pan, tap = select/act, long-press = deselect.  Two fingers: pinch = zoom (+pan).
   With a unit selected, tapping an empty/enemy tile first PREVIEWS the path, a second tap on the same tile confirms the order
   (stops accidental moves with a fat finger).  Mouse input is untouched. */
(function(){
'use strict';
const ZMIN=.42,ZMAX=1.7,MOVE_PX=10,LONG_MS=480;
function init(c){
  c.style.touchAction='none';
  let one=null,pinch=null,lastPreview='';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const modalOpen=()=>{const m=document.getElementById('modal');return m&&m.style.display==='flex';};
  const mid=ts=>({x:(ts[0].clientX+ts[1].clientX)/2,y:(ts[0].clientY+ts[1].clientY)/2});
  const dist=ts=>Math.hypot(ts[0].clientX-ts[1].clientX,ts[0].clientY-ts[1].clientY);
  const ownHere=t=>{try{if(unitsAt(t.x,t.y).some(u=>u.o===G.player))return true;if(t.city!=null){const ci=cityOf(t.city);if(ci&&ci.o===G.player)return true;}}catch(e){}return false;};

  c.addEventListener('touchstart',e=>{
    e.preventDefault();
    if(typeof G==='undefined'||!G||typeof running==='undefined'||!running||modalOpen())return;
    if(e.touches.length===1){const t=e.touches[0];one={x:t.clientX,y:t.clientY,cx:cam.x,cy:cam.y,moved:false,t0:performance.now(),dead:false};pinch=null;}
    else if(e.touches.length>=2){if(one)one.dead=true;const m=mid(e.touches);pinch={d:dist(e.touches),z:cam.z,cx:cam.x,cy:cam.y,wx:(m.x-view.w/2)/cam.z+cam.x,wy:(m.y-view.h/2)/cam.z+cam.y};}
  },{passive:false});

  c.addEventListener('touchmove',e=>{
    e.preventDefault();
    if(pinch&&e.touches.length>=2){
      const m=mid(e.touches),nz=clamp(pinch.z*dist(e.touches)/Math.max(8,pinch.d),ZMIN,ZMAX);
      cam.z=nz;cam.x=pinch.wx-(m.x-view.w/2)/nz;cam.y=pinch.wy-(m.y-view.h/2)/nz;return;
    }
    if(one&&e.touches.length===1&&!one.dead){
      const t=e.touches[0],dx=t.clientX-one.x,dy=t.clientY-one.y;
      if(!one.moved&&Math.hypot(dx,dy)>MOVE_PX)one.moved=true;
      if(one.moved){cam.x=one.cx-dx/cam.z;cam.y=one.cy-dy/cam.z;}
    }
  },{passive:false});

  c.addEventListener('touchend',e=>{
    e.preventDefault();
    if(e.touches.length>=1){ if(e.touches.length===1&&pinch){const t=e.touches[0];one={x:t.clientX,y:t.clientY,cx:cam.x,cy:cam.y,moved:true,t0:performance.now(),dead:true};}pinch=null;return; }
    pinch=null;
    const o=one;one=null;
    if(!o||o.moved||o.dead||typeof G==='undefined'||!G||typeof running==='undefined'||!running||modalOpen())return;
    const t=e.changedTouches[0],held=performance.now()-o.t0;
    if(held>=LONG_MS){clearSel();lastPreview='';return;}
    const tile=toTile(t.clientX,t.clientY);if(!tile){return;}
    const key=tile.x+','+tile.y,su=typeof selUnit==='function'?selUnit():null;
    // two-step order: preview the path first, confirm with a second tap on the same tile
    if(su&&su.o===G.player&&!(tile.x===su.x&&tile.y===su.y)&&!ownHere(tile)&&lastPreview!==key){
      lastPreview=key;setHover(tile);return;
    }
    lastPreview='';
    setHover(tile);clickTile(tile);
  },{passive:false});
  c.addEventListener('touchcancel',()=>{one=null;pinch=null;},{passive:true});

  // minimap: drag to move the camera
  const mini=document.getElementById('mini');
  if(mini){
    const go=ev=>{ev.preventDefault();const t=ev.touches[0];if(!t||typeof miniToWorld!=='function')return;const r=mini.getBoundingClientRect(),p=miniToWorld((t.clientX-r.left)*mini.width/r.width,(t.clientY-r.top)*mini.height/r.height);cam.x=p.x;cam.y=p.y;};
    mini.addEventListener('touchstart',go,{passive:false});mini.addEventListener('touchmove',go,{passive:false});
  }
  // no page zoom / no double-tap zoom / no text selection or callout on UI buttons
  document.documentElement.style.touchAction='manipulation';
}
// ---- phone / small-screen layout (portrait phones and short landscape screens). Desktop layout is untouched.
const css=`
@media (max-width:760px),(max-height:520px){
 body{overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
 button{min-height:34px}
 /* top bar */
 #top{height:46px;padding:0 0 0 58px;border-radius:0 0 12px 12px;overflow-x:auto;overflow-y:hidden;max-width:100vw;scrollbar-width:none}
 #top::-webkit-scrollbar{display:none}
 #emblem{transform:scale(.5);transform-origin:left top;left:6px;top:-2px}
 .stat{padding:0 8px;font-size:13px;gap:4px}.stat b{font-size:14px}.stat .pos{font-size:11px}.stat .ic{font-size:15px}
 #research{min-width:0;height:32px;padding:0 8px;margin-left:6px;gap:6px}#research .rn{font-size:11px}#research .rb{width:56px;height:6px}
 #turnbox{padding:0 50px 0 10px;font-size:13px;white-space:nowrap}
 #menub{width:36px;height:36px;top:5px;right:6px;font-size:18px}
 /* button rail becomes a scrollable strip under the top bar */
 #rail{transform:none!important;top:46px;left:0;right:0;width:auto;flex-direction:row;gap:6px;padding:5px 8px;border-radius:0 0 12px 12px;border:none;border-bottom:2px solid #b8923f;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;background:linear-gradient(#0b1630ee,#0b1630bb)}
 #rail::-webkit-scrollbar{display:none}
 #rail .ib{flex:0 0 auto;width:38px;height:38px;font-size:18px}
 /* selection card (bottom-left) and minimap / next-unit (bottom-right) */
 #sel{transform:none!important;left:0;bottom:0;width:calc(100vw - 112px);max-width:none;min-height:0;padding:0 0 0 62px;border-radius:0 12px 0 0}
 #sel .portrait{width:66px;height:104px;font-size:36px;border-radius:0 40px 0 0}
 #sel .ptitle{font-size:12.5px;padding:5px;letter-spacing:1px;border-radius:0 12px 0 0}
 #sel .prow{padding:3px 10px;font-size:11.5px}
 #sel .sub{display:none}
 #sel .pact{padding:6px 8px;gap:5px;flex-wrap:wrap}#sel .pact .ib{width:40px;height:36px;font-size:17px;border-radius:8px}
 #br{transform:none!important;width:108px;right:0;bottom:0}
 #prodhead{background:none;border:none;padding:0;margin:0 6px -14px auto;width:62px;height:62px;display:block;position:relative;z-index:2}
 #nextlabel{display:none}
 #next{position:static;width:62px;height:62px;font-size:26px;margin:0;border-width:3px}
 #minibox{padding:5px;border-radius:12px 0 0 0}
 /* panels */
 #city{width:auto!important;left:0;right:0;top:92px;bottom:0;border-radius:14px 14px 0 0;z-index:8;padding:10px}
 #info{top:94px;left:6px;font-size:11px;max-width:58vw;padding:5px 7px}
 #notes{top:94px;right:4px;width:54vw}.note{font-size:11px;padding:4px 7px}
 #banner{font-size:26px;letter-spacing:3px}
 #modal>.panel{padding:12px;max-width:100vw;max-height:96vh;border-radius:10px}
 #modal h1{font-size:19px}.x{right:6px;top:6px}
 .awrow,.audrow{grid-template-columns:1fr}
 /* setup screen */
 #start{padding:0}
 .setupFrame{width:100vw;height:100dvh;max-height:100dvh;border-width:0;border-radius:0}
 .setupFrame:before,.setupFrame:after{display:none}
 .setupTitle{height:44px;font-size:17px;letter-spacing:2px}
 .setupBody,.advancedGrid{grid-template-columns:minmax(0,1fr)!important}
 .setupLeft{padding:10px 12px;min-width:0}.setupSide{min-height:200px;padding:10px}
 .setupLeader{grid-template-columns:68px minmax(0,1fr);gap:10px}.setupPortrait{width:62px;height:62px}
 .setupRow{grid-template-columns:46px minmax(0,1fr);gap:10px;padding:8px 0}.setupIcon{width:42px;height:42px;font-size:19px}
 .setupFooter{flex-wrap:wrap;padding:8px;gap:6px}.setupFooter .group{flex:1 1 100%}.setupFooter button{min-width:0;flex:1;padding:9px 8px;font-size:14px}.setupFooter .startBtn{min-width:0}
 .advancedWrap{padding:10px;max-height:calc(100dvh - 130px)}
 .playerSlot{grid-template-columns:36px minmax(0,1fr) minmax(0,1fr)!important}
 select,input[type=number]{max-width:100%}
}
@media (max-height:520px) and (min-width:761px){
 /* short landscape phone: keep bottom cards compact */
 #sel{width:min(60vw,430px)}#sel .portrait{height:92px}
}
`;
const st=document.createElement('style');st.id='ae-mobile-css';st.textContent=css;document.head.appendChild(st);

function boot(){const c=document.getElementById('map');if(!c||typeof cam==='undefined'||typeof view==='undefined'){setTimeout(boot,250);return;}init(c);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
