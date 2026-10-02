/* Realms of Aethermoor — Diplomacy / Trade screen (leader on stage, their items | trade table | your items).
   Display only: replaces renderTrade(); trade rules (aiAcceptsTrade, submitTrade, makePeace) are unchanged. */
(function(){
'use strict';
const css=`
#modal>#mbody.dq{padding:0;background:none;border:none;box-shadow:none;overflow:visible;max-height:none;max-width:none}
#mbody.dq>.x{z-index:30;background:#0b1626cc;border-color:#c9a24a}
.dq-stage{position:relative;width:min(1180px,96vw);height:min(720px,90vh);border:3px solid #b99c5a;border-radius:10px;overflow:hidden;box-shadow:0 0 0 2px #05080f,0 18px 60px #000c;background:#0a1220;font-family:Georgia,'Palatino Linotype',serif}
.dq-bg{position:absolute;inset:-12px;background-size:cover;background-position:center;filter:blur(3px) saturate(1.15) brightness(.78);transform:scale(1.04)}
.dq-vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 38%,transparent 25%,#02050bcc 100%),linear-gradient(180deg,#02050b88 0,transparent 22%,transparent 55%,#02050bdd 100%)}
.dq-fig{position:absolute;left:50%;top:132px;height:calc(100% - 202px);max-width:44%;transform:translateX(-50%);object-fit:contain;filter:drop-shadow(0 18px 18px #000a);pointer-events:none}
.dq-bubble{position:absolute;top:44px;left:calc(50% - 150px);width:min(560px,46%);display:flex;gap:0;align-items:center;z-index:5}
.dq-port{flex:0 0 92px;height:92px;border-radius:50%;border:4px solid var(--c,#c9a24a);box-shadow:0 0 0 2px #05080f,0 4px 14px #000a;background-color:#142238;background-repeat:no-repeat;position:relative;z-index:2;margin-right:-26px;overflow:hidden}
.dq-say{flex:1;background:linear-gradient(180deg,#14304bf2,#0b1c30f2);border:2px solid #c9b172;border-radius:6px;padding:10px 14px 11px 36px;color:#eee6cf;font-size:15px;line-height:1.35;box-shadow:0 6px 22px #000a;min-height:76px}
.dq-say b{display:block;color:#f3d98b;font-size:15px;letter-spacing:.4px}
.dq-say.bad{border-color:#d46a5a}.dq-say.good{border-color:#7fd69a}
.dq-side{position:absolute;bottom:62px;width:236px;top:176px;background:linear-gradient(180deg,#0f2438f4,#08131fee);border:2px solid #b99c5a;border-radius:8px;display:flex;flex-direction:column;z-index:4;box-shadow:0 8px 26px #000a}
.dq-side.l{left:14px}.dq-side.r{right:14px}
.dq-head{padding:9px 10px 7px;text-align:center;color:#f3d98b;font-size:15px;letter-spacing:1.5px;text-transform:uppercase;border-bottom:1px solid #b99c5a77;background:linear-gradient(#264a68,#12283b)}
.dq-list{overflow:auto;padding:6px 6px 8px;flex:1}
.dq-sec{margin:8px 4px 2px;color:#c9b172;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;border-bottom:1px solid #ffffff1c}
.dq-item{display:flex;justify-content:space-between;gap:6px;padding:5px 8px;margin:2px 0;border-radius:4px;color:#e9e2cb;font-size:13.5px;cursor:pointer;border:1px solid transparent}
.dq-item:hover{background:#ffffff16;border-color:#c9b17266}
.dq-item.off{opacity:.38;cursor:default;pointer-events:none}
.dq-item .n{color:#9fc8e8}
.dq-table{position:absolute;left:262px;right:262px;bottom:62px;height:clamp(130px,27%,196px);display:grid;grid-template-columns:1fr 1fr;gap:0;background:linear-gradient(180deg,#0b1a2bf0,#06101cf2);border:2px solid #b99c5a;border-radius:8px;z-index:4;box-shadow:0 8px 26px #000a}
.dq-col{padding:6px 10px;overflow:auto;border-right:1px solid #b99c5a55;display:flex;flex-direction:column;gap:4px}.dq-col:last-child{border-right:none}
.dq-col h5{margin:2px 0 4px;color:#c9b172;font-size:11px;letter-spacing:1.6px;text-align:center;text-transform:uppercase;font-weight:normal}
.dq-row{display:flex;align-items:center;gap:6px;padding:4px 7px;background:#ffffff0d;border:1px solid #ffffff1c;border-radius:4px;color:#f1ead2;font-size:13.5px}
.dq-row input{width:62px;background:#04080f;color:#fff3c8;border:1px solid #c9b172;border-radius:3px;padding:2px 4px;font:inherit;text-align:right}
.dq-row .sm{color:#9aa9c0;font-size:11.5px}.dq-row .sp{flex:1}
.dq-row .rm{cursor:pointer;color:#e58;font-size:15px;padding:0 4px;line-height:1}.dq-row .rm:hover{color:#ff9bb0}
.dq-peace{border-color:#7fd69a;background:#7fd69a14}
.dq-empty{margin:auto;color:#6f7e96;font-size:12.5px;text-align:center;padding:6px}
.dq-foot{position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:16px;z-index:6}
.dq-btn{min-width:200px;padding:9px 22px;font-size:17px;letter-spacing:2px;text-transform:uppercase;border-radius:5px;border:2px solid #c9b172;color:#f3e9c4;background:linear-gradient(#2c5a7e,#122c43);font-family:inherit;cursor:pointer;box-shadow:0 4px 14px #000a}
.dq-btn:hover:not(:disabled){background:linear-gradient(#3d78a3,#183a58);border-color:#f3d98b}
.dq-btn.go{background:linear-gradient(#2f7a4f,#134228)}.dq-btn.go:hover:not(:disabled){background:linear-gradient(#3fa066,#1b5a38)}
.dq-btn:disabled{opacity:.4;cursor:default}
.dq-btn.ask{min-width:300px;font-size:14px;letter-spacing:.8px}
.dq-locked .dq-side,.dq-locked .dq-table{pointer-events:none;opacity:.88}
@media(max-width:940px){.dq-foot{gap:6px;padding:0 8px}.dq-btn,.dq-btn.ask{min-width:0;padding:8px 10px;font-size:13px;letter-spacing:.4px}}
.dq-war{position:absolute;top:12px;left:16px;z-index:6;padding:4px 12px;border-radius:5px;font-size:13px;letter-spacing:1px;background:#0b1626d9;border:1px solid #c9a24a;color:#eee6cf}
.dq-war.w{border-color:#e0584c;color:#ffb7ae}
.dq-war b{color:#f3d98b}
@media(max-width:940px){
 .dq-stage{height:94vh}.dq-fig{display:none}
 .dq-bubble{left:12px;right:12px;width:auto;top:46px}
 .dq-side{top:150px;bottom:auto;height:calc(94vh - 150px - 330px);width:calc(50% - 18px);min-height:130px}
 .dq-side.l{left:12px}.dq-side.r{right:12px}
 .dq-table{left:12px;right:12px;bottom:70px;height:clamp(120px,30vh,200px)}
 .dq-foot{bottom:8px}
}
@media(max-width:520px){
 .dq-war{font-size:11px;padding:3px 8px;left:8px;top:8px;max-width:calc(100% - 64px)}
 .dq-bubble{top:40px}.dq-port{flex-basis:60px;height:60px;margin-right:-20px}
 .dq-say{font-size:12.5px;line-height:1.3;padding:6px 10px 7px 26px;min-height:0}.dq-say b{font-size:12.5px}
 .dq-side{top:138px;min-height:110px}.dq-head{font-size:12px;padding:6px 6px 5px;letter-spacing:.8px}
 .dq-item{font-size:12px;padding:4px 5px}.dq-sec{font-size:10px}
 .dq-row{font-size:12px;padding:3px 5px}.dq-row input{width:50px}
 .dq-btn,.dq-btn.ask{font-size:11px;letter-spacing:0;line-height:1.15;padding:5px 6px}
}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const FIELD=(side,kind)=>(side==='y'?'your':'their')+kind;
const DEFAULT_ADD={Gold:50,GPT:3};
function cap(side,kind){const civ=civOf(side==='y'?G.player:tradeDraft.other);return kind==='Gold'?Math.max(0,Math.floor(civ.gold)):50;}

// ---- leader portrait (3D hero miniature rendered large, cached)
// figCache[id] = {url, port} ; the raw render is shown at once, then cropped to the figure's outline
// (and a head-and-shoulders portrait window is computed) asynchronously, after which the screen refreshes once.
const figCache={},figBusy={};
function leaderFigure(id){
  if(figCache[id])return figCache[id];
  try{
    const hk=typeof heroUnitForCiv==='function'?heroUnitForCiv(id):null;
    if(hk&&window.AE3&&AE3.unitIcon&&window.threeWorld&&threeWorld.ready&&window.THREE){
      const u=AE3.unitIcon(hk,id,640);
      if(u){
        if(!figBusy[id]){figBusy[id]=1;const im=new Image();im.onload=()=>{try{figCache[id]=cropFigure(im);}catch(e){figCache[id]={url:u,port:null};console.warn('figure crop',e);}
          if(tradeDraft&&tradeDraft.other===id&&document.querySelector('.dq-stage'))renderTrade();};im.src=u;}
        return {url:u,port:null};
      }
    }
  }catch(e){console.warn('leader figure',e);}
  return null;
}
function cropFigure(im){
  const W=im.naturalWidth,H=im.naturalHeight,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0);
  const a=x.getImageData(0,0,W,H).data;let x0=W,x1=-1,y0=H,y1=-1;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++)if(a[(j*W+i)*4+3]>24){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j;}
  if(x1<0)return {url:im.src,port:null};
  const pad=6;x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(W-1,x1+pad);y1=Math.min(H-1,y1+pad);
  const cw=x1-x0+1,ch=y1-y0+1,o=document.createElement('canvas');o.width=cw;o.height=ch;o.getContext('2d').drawImage(c,x0,y0,cw,ch,0,0,cw,ch);
  // head sits above the torso: use the mean x of opaque pixels in the 30-50% band (ignores raised weapons/banners)
  let sx=0,n=0;for(let j=y0+Math.round(ch*.3);j<Math.min(H,y0+Math.round(ch*.5));j++)for(let i=x0;i<=x1;i++)if(a[(j*W+i)*4+3]>24){sx+=i-x0;n++;}
  const hx=n?sx/n:cw/2;
  // portrait window: a square covering the top ~38% of the figure, centred on the head
  const reg=Math.min(cw,ch*.38),left=Math.max(0,Math.min(cw-reg,hx-reg/2));
  const bgW=(cw/reg)*100,posX=cw>reg+1?left/(cw-reg)*100:50,posY=0;
  return {url:o.toDataURL('image/png'),port:`background-size:${bgW}% auto;background-position:${posX}% ${posY}%`};
}
function artUrl(id){const n=(typeof FACTION_ART_NAMES!=='undefined')&&FACTION_ART_NAMES[id];return n?`assets/factions/${n}.jpg`:'';}

// ---- what the leader says
function leaderLines(id){const p=aiPersonality(id),hot=p.agg>=1.2,soft=p.peace>=1.15;return{
  greet:hot?'Speak quickly. My time is not free.':soft?'Welcome. Let us see what we can arrange together.':'We are listening. What do you propose?',
  war:hot?'You dare come to me? State your terms for ending this war.':soft?'This war serves neither of us. Let us talk of peace.':'The war has gone on long enough. What are your terms?',
  yes:hot?'Fine. This will do.':soft?'This is a fair arrangement. We accept.':'Agreed. This arrangement suits us.',
  no:hot?'Is that all? Insulting. Offer more.':soft?'I fear this does not balance. Perhaps a little more?':'That does not satisfy us. Improve the terms.',
  needPeace:'While we are at war, we will discuss only a peace treaty.'};}
function draftHasItems(d){return !!(d.yourGold>0||d.theirGold>0||d.yourGPT>0||d.theirGPT>0||d.yourLux||d.theirLux||d.yourOpen||d.theirOpen||d.yourEmb||d.theirEmb||d.peace);}
function sayState(){
  const d=tradeDraft,id=d.other,L=leaderLines(id),war=atWar(G.player,id);
  if(d.done)return{t:L.yes+' The deal is signed.',k:'good'};
  if(d.submitted){d.submitted=false;if(war&&!d.peace)return{t:L.needPeace,k:'bad'};return{t:L.no+' (Use "What would make this deal work?" if you are unsure.)',k:'bad'};}
  if(d.note)return{t:d.note,k:d.noteK||''};
  if(!draftHasItems(d))return{t:war?L.war:L.greet,k:''};
  // the AI's verdict is only given when a deal is proposed (or asked for via the suggestion button)
  return{t:'Very well. Put your proposal to me when you are ready.',k:''};
}
function sayHtml(){const id=tradeDraft.other,s=sayState();return{html:`<b>${CIVS[id].leader} says:</b>${s.t}`,k:s.k};}
window.dqSay=function(){const el=document.getElementById('dq-say');if(!el||!tradeDraft)return;const s=sayHtml();el.className='dq-say '+s.k;el.innerHTML=s.html;const b=document.getElementById('dq-go');if(b)b.disabled=!draftHasItems(tradeDraft);};

// ---- editing
window.dqAdd=function(side,kind,val){const d=tradeDraft;if(!d||d.busy||d.done)return;d.note=null;const f=FIELD(side,kind);
  if(kind==='Gold'||kind==='GPT'){const m=cap(side,kind);if(m<=0){toast('Not enough gold to offer.');return;}d[f]=Math.min(m,DEFAULT_ADD[kind]);}
  else if(kind==='Lux')d[f]=val;else if(kind==='Open'||kind==='Emb')d[f]=true;renderTrade();};
window.dqRem=function(side,kind){const d=tradeDraft;if(!d||d.busy||d.done)return;d.note=null;d[FIELD(side,kind)]=(kind==='Lux')?'':(kind==='Open'||kind==='Emb'?false:0);renderTrade();};
window.dqNum=function(side,kind,el){const d=tradeDraft;if(!d||d.busy||d.done)return;d.note=null;let v=Math.floor(+el.value||0);v=Math.max(0,Math.min(cap(side,kind),v));d[FIELD(side,kind)]=v;if(+el.value!==v&&el.value!=='')el.value=v;dqSay();};
window.dqPeace=function(on){if(!tradeDraft||tradeDraft.busy||tradeDraft.done)return;tradeDraft.note=null;tradeDraft.peace=!!on;renderTrade();};

// "What would make this deal work?" — find the smallest change on the player's side that the AI would accept.
window.dqSuggest=function(){
  const d=tradeDraft;if(!d||d.busy||d.done)return;
  const id=d.other,war=atWar(G.player,id),O=civOf(id),L=leaderLines(id);
  const fin=(t,k)=>{d.note=t;d.noteK=k||'';renderTrade();};
  if(!draftHasItems(d))return fin('Name what you want from me, and I will tell you what it would cost.','');
  const ok=()=>{try{return aiAcceptsTrade(id,Object.assign({},d,{peace:!!d.peace&&war}));}catch(e){return false;}};
  const snap={yourGold:d.yourGold,yourGPT:d.yourGPT,yourLux:d.yourLux,yourOpen:d.yourOpen,yourEmb:d.yourEmb,theirEmb:d.theirEmb,theirGold:d.theirGold,theirGPT:d.theirGPT,peace:d.peace};
  const restore=()=>Object.assign(d,snap);
  const said=[];
  if(war&&!d.peace){d.peace=true;said.push('include a peace treaty');}
  if(ok()){return fin(said.length?`We would accept if you were to ${said.join(' and ')}.`:'This deal already works for us. Propose it whenever you like.','good');}
  const gmax=cap('y','Gold');
  // 1) gold alone
  let found=-1;for(let v=d.yourGold+1;v<=gmax;v++){d.yourGold=v;if(ok()){found=v;break;}}
  if(found>0){said.push(`offer ${found-snap.yourGold} more gold`);return fin(`We would accept if you were to ${said.join(' and ')}.`,'good');}
  // 2) everything on the table, trimmed back afterwards
  d.yourGold=gmax;let extras=[];
  if(!ok()&&!d.yourEmb&&!hasEmbassy(id,G.player)){d.yourEmb=true;extras.push('accept an embassy in your capital');}
  if(!ok()&&!d.yourOpen){d.yourOpen=true;extras.push('grant Open Borders');}
  if(!ok()&&!d.yourLux){const lx=availableTradeLux(G.player).find(r=>r!==d.theirLux);if(lx){d.yourLux=lx;extras.push(`give ${RES[lx].n}`);}}
  if(!ok()){while(d.yourGPT<50&&!ok())d.yourGPT++;if(d.yourGPT>snap.yourGPT)extras.push(`pay ${d.yourGPT} gold per turn`);}
  if(ok()){
    let lo=snap.yourGold;for(let v=snap.yourGold;v<=gmax;v++){d.yourGold=v;if(ok()){lo=v;break;}}
    d.yourGold=lo;if(lo>snap.yourGold)extras.unshift(`offer ${lo-snap.yourGold} more gold`);
    return fin(`We would accept if you were to ${said.concat(extras).join(', ')}.`,'good');
  }
  restore();
  // 3) nothing the player can add is enough: see whether asking for less would work
  if(d.theirGold>0||d.theirGPT>0){
    for(let g=d.theirGold;g>=0;g--){d.theirGold=g;if(ok()){const cut=snap.theirGold-g;return fin(cut>0?`We would accept if you asked for ${cut} less gold from us.`:'We would accept this.','good');}}
    d.theirGold=0;
    for(let p=d.theirGPT;p>=0;p--){d.theirGPT=p;if(ok())return fin(`We would accept if you asked for less gold per turn from us (${p}).`,'good');}
    restore();
  }
  fin('Nothing you could offer would balance this. Ask for less, or ask for something else.','bad');
};

// Propose the deal: the leader considers it, then visibly accepts or rejects.
window.dqSubmit=function(){
  const d=tradeDraft;if(!d||d.busy||d.done||!draftHasItems(d))return;
  d.busy=true;d.note=null;
  const el=document.getElementById('dq-say');if(el){el.className='dq-say';el.innerHTML=`<b>${CIVS[d.other].leader} says:</b>Hmm… let me consider this.`;}
  ['dq-go','dq-ask','dq-cancel'].forEach(i=>{const b=document.getElementById(i);if(b)b.disabled=true;});
  setTimeout(()=>{
    if(tradeDraft!==d||!document.querySelector('.dq-stage'))return;
    d.busy=false;d.submitted=true;
    const prev=window.openDiplo;let signed=false;window.openDiplo=function(){signed=true;};
    try{submitTrade();}finally{window.openDiplo=prev;}
    if(signed){d.done=true;d.submitted=false;renderTrade();}
  },750);
};

// ---- markup
function sideList(side){
  const d=tradeDraft,id=d.other,pid=side==='y'?G.player:id,civ=civOf(pid),war=atWar(G.player,id),lux=availableTradeLux(pid);
  const gold=Math.floor(civ.gold);
  const fG=d[FIELD(side,'Gold')]>0,fP=d[FIELD(side,'GPT')]>0,fO=!!d[FIELD(side,'Open')],selLux=d[FIELD(side,'Lux')];
  let h=`<div class="dq-item ${fG||gold<=0?'off':''}" onclick="dqAdd('${side}','Gold')"><span>🪙 Gold</span><span class="n">${gold}</span></div>
  <div class="dq-item ${fP?'off':''}" onclick="dqAdd('${side}','GPT')"><span>🪙 Gold per Turn</span></div>
  <div class="dq-sec">Luxury Resources</div>`;
  h+=lux.length?lux.map(r=>`<div class="dq-item ${selLux===r?'off':''}" onclick="dqAdd('${side}','Lux','${r}')"><span>${RES[r].ico} ${RES[r].n}</span><span class="n">(1)</span></div>`).join(''):'<div class="dq-empty">None available</div>';
  const fE=!!d[FIELD(side,'Emb')],haveE=side==='y'?hasEmbassy(id,G.player):hasEmbassy(G.player,id);
  h+=`<div class="dq-sec">Agreements</div><div class="dq-item ${fO?'off':''}" onclick="dqAdd('${side}','Open')"><span>🧭 Open Borders</span></div>
  <div class="dq-item ${fE||haveE?'off':''}" onclick="dqAdd('${side}','Emb')" title="${side==='y'?'They keep an embassy in your capital and can see it':'You keep an embassy in their capital and can see it'}"><span>🏛️ Accept Embassy</span><span class="n">${haveE?'(have)':''}</span></div>`;
  if(side==='y'&&war)h+=`<div class="dq-sec">Other</div><div class="dq-item ${d.peace?'off':''}" onclick="dqPeace(true)"><span>🕊️ Make Peace</span></div>`;
  return h;
}
function tableCol(side){
  const d=tradeDraft,rows=[];
  const gold=d[FIELD(side,'Gold')],gpt=d[FIELD(side,'GPT')],lux=d[FIELD(side,'Lux')],open=d[FIELD(side,'Open')];
  const rm=k=>`<span class="rm" title="Remove" onclick="dqRem('${side}','${k}')">✕</span>`;
  if(gold>0)rows.push(`<div class="dq-row"><span>🪙 Gold</span><span class="sp"></span><input type="number" min="0" max="${cap(side,'Gold')}" value="${gold}" oninput="dqNum('${side}','Gold',this)">${rm('Gold')}</div>`);
  if(gpt>0)rows.push(`<div class="dq-row"><span>🪙 Gold per Turn</span><span class="sp"></span><input type="number" min="0" max="50" value="${gpt}" oninput="dqNum('${side}','GPT',this)"><span class="sm">${DEAL_LENGTH} turns</span>${rm('GPT')}</div>`);
  if(lux)rows.push(`<div class="dq-row"><span>${RES[lux].ico} ${RES[lux].n}</span><span class="sp"></span><span class="sm">${DEAL_LENGTH} turns</span>${rm('Lux')}</div>`);
  if(d[FIELD(side,'Emb')]){const host=side==='y'?G.player:d.other,viewer=side==='y'?CIVS[d.other].name:'You',cap=embassyCapital(host);rows.push(`<div class="dq-row"><span>🏛️ Accept Embassy</span><span class="sp"></span><span class="sm">${viewer} ${side==='y'?'sees':'see'} ${cap?cap.name:'the capital'}</span>${rm('Emb')}</div>`);}
  if(open)rows.push(`<div class="dq-row"><span>🧭 Open Borders</span><span class="sp"></span><span class="sm">${DEAL_LENGTH} turns</span>${rm('Open')}</div>`);
  return rows.join('');
}

window.renderTrade=function(){
  if(!tradeDraft)return;
  const d=tradeDraft,id=d.other,C=CIVS[id],war=atWar(G.player,id);
  if(!war&&!d.done)d.peace=false;
  const fig=leaderFigure(id),art=artUrl(id),say=sayHtml();
  const portStyle=fig?(fig.port?`background-image:url(${fig.url});${fig.port}`:`background-image:url(${fig.url});background-size:250%;background-position:50% 8%`):`background-image:url(${art});background-size:cover;background-position:center 20%`;
  const them=tableCol('t'),you=tableCol('y'),peaceRow=d.peace?`<div class="dq-row dq-peace"><span>🕊️ Peace Treaty</span><span class="sp"></span><span class="sm">ends the war</span><span class="rm" title="Remove" onclick="dqPeace(false)">✕</span></div>`:'';
  const deals=dealsBetween(G.player,id).length;
  const html=`<div class="dq-stage ${d.done?'dq-locked':''}" style="--c:${C.color}">
   <div class="dq-bg" style="background-image:linear-gradient(${C.color}33,${C.color}11),url(${art})"></div><div class="dq-vig"></div>
   ${fig?`<img class="dq-fig" src="${fig.url}" alt="${C.leader}">`:`<div style="position:absolute;left:50%;bottom:90px;transform:translateX(-50%);font-size:200px;filter:drop-shadow(0 12px 14px #000a)">${C.ico}</div>`}
   <div class="dq-war ${war?'w':''}">${C.ico} <b>${C.name}</b> · ${aiPersonality(id).n} · ${war?'AT WAR':'At Peace'}${deals?` · 🤝 ${deals} active`:''}${hasEmbassy(G.player,id)?' · 🏛️ your embassy':''}${hasEmbassy(id,G.player)?' · 🏛️ their embassy':''}</div>
   <div class="dq-bubble"><div class="dq-port" style="${portStyle}"></div><div class="dq-say ${say.k}" id="dq-say">${say.html}</div></div>
   <div class="dq-side l"><div class="dq-head">${C.name} Items</div><div class="dq-list">${sideList('t')}</div></div>
   <div class="dq-side r"><div class="dq-head">Your Items</div><div class="dq-list">${sideList('y')}</div></div>
   <div class="dq-table"><div class="dq-col"><h5>${C.name} offers</h5>${them||'<div class="dq-empty">Choose items from their list</div>'}${d.peace?peaceRow:''}</div><div class="dq-col"><h5>You offer</h5>${you||'<div class="dq-empty">Choose items from your list</div>'}</div></div>
   <div class="dq-foot">${d.done?`<button class="dq-btn go" onclick="openDiplo()">Done</button>`:`<button class="dq-btn" id="dq-cancel" onclick="openDiplo()">Cancel</button><button class="dq-btn ask" id="dq-ask" onclick="dqSuggest()">What would make this deal work?</button><button class="dq-btn go" id="dq-go" ${draftHasItems(d)?'':'disabled'} onclick="dqSubmit()">Propose Deal</button>`}</div>
  </div>`;
  modal(html);document.getElementById('mbody').classList.add('dq');
};
// any other modal replaces the wide trade layout
const _modal=window.modal;window.modal=function(h){const b=document.getElementById('mbody');if(b)b.classList.remove('dq');return _modal(h);};
})();
