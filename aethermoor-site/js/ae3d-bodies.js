/* Realms of Aethermoor - Blender-made unit bodies (assets/models/units/*.glb + manifest.json).
   Replaces the procedural humanoid body inside the unit kits when a matching Blender body exists; the kits keep
   attaching weapons, shields, quivers and faction flair at the hand/shoulder points this module returns.
   Bodies load lazily; until one is loaded the old procedural figure is used, then units upgrade in place. */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok||!window.AE3DGLB)return;
const T3=THREE,DIR='assets/models/units/';
const RACE_H={human:25.4,elf:26.4,dwarf:21.5,orc:25.6,undead:25.4};      // target figure height in prefab units
const RACE_W={human:1,elf:.84,dwarf:1.34,orc:1.32,undead:.88};
let manifest=null,manifestState=0;
const bodies=new Map();                                                  // key -> {state,parts,info}
let pendingInval=0;
const srgb=v=>v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055;
const hexOf=c=>(Math.round(srgb(c.r)*255)<<16)|(Math.round(srgb(c.g)*255)<<8)|Math.round(srgb(c.b)*255);
const TINT=/tabard|clanred|cloak|bandana|ragsred|clothgreen|clothdark/i;

function invalidateSoon(){
  if(pendingInval)return;
  pendingInval=setTimeout(()=>{pendingInval=0;if(AE.unitGeoInvalidate)AE.unitGeoInvalidate();},250);
}
function loadManifest(){
  if(manifestState)return;manifestState=1;
  fetch(DIR+'manifest.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(m=>{manifest=m;manifestState=2;invalidateSoon();})
    .catch(e=>{manifestState=3;console.warn('unit manifest',e);});
}
function ensure(key){
  let b=bodies.get(key);if(b)return b.state==='ok'?b:null;
  if(!manifest){loadManifest();return null;}
  if(!manifest[key]){bodies.set(key,{state:'missing'});return null;}
  b={state:'loading'};bodies.set(key,b);
  AE3DGLB.load(DIR+key+'.glb').then(root=>{
    root.updateMatrixWorld(true);
    const parts=[];
    root.traverse(o=>{
      if(!o.isMesh)return;
      const m=o.material,c=m.color;
      parts.push({geo:o.geometry,mat:m,matrix:o.matrixWorld.clone(),name:m.name||'',rgb:[srgb(c.r),srgb(c.g),srgb(c.b)],metal:m.metalness||0,rough:m.roughness===undefined?.8:m.roughness,em:m.emissive?Math.max(m.emissive.r,m.emissive.g,m.emissive.b):0});
    });
    b.parts=parts;b.info=manifest[key];b.state='ok';invalidateSoon();
  }).catch(e=>{b.state='failed';console.warn('unit body',key,e);});
  return null;
}
// which Blender body for this race / armour tier / role
function variant(st,o,hero){
  const race=st.race;if(!RACE_H[race])return null;
  if(hero)return 'hero_'+st.id;
  const a=o.armor||'chain',archer=o.rp==='draw'||o.rp==='xbowR';
  if(race==='human'||race==='undead'){
    if(archer&&race==='human')return 'human_leather';
    if(archer&&race==='undead')return 'undead_leather';
    if(a==='robe')return race+'_robe';
    if(a==='plate'||a==='heavy')return race+'_heavy';
    if(a==='chain')return race==='undead'?'undead_bare':'human_chain';
    return race+'_bare';                                                 // cloth / leather / bare / none
  }
  if(a==='bare'&&race==='orc')return 'orc_bare';
  if(a==='plate'||a==='heavy')return race+'_heavy';
  if(a==='chain')return race+'_chain';
  return race+'_leather';                                                // cloth / leather / robe / none
}
AE.BODY={
  /* adds the body to prefab `p` (feet at y=0, facing +z); returns the same fields UP.figure returns, or null */
  build(p,st,o,hero){
    const key=variant(st,o,hero);if(!key)return null;
    const b=ensure(key);if(!b)return null;
    const info=b.info,race=st.race,Ht=(RACE_H[race]||25.4),s=Ht/info.h,bulk=o.bulk||1;
    p.pushT(0,0,0,0,0,0,[s*bulk,s,s*bulk]);
    for(const pt of b.parts){
      let rgb=pt.rgb;
      if(TINT.test(pt.name)&&st.cloth!==undefined){const t=new T3.Color(st.cloth),mx=(a,bb,k)=>a+(bb-a)*k;rgb=[mx(rgb[0],t.r,.78),mx(rgb[1],t.g,.78),mx(rgb[2],t.b,.78)];}
      p.push(pt.matrix);
      p.add(pt.geo,new T3.Color(rgb[0],rgb[1],rgb[2]),{m:pt.metal,r:pt.rough,e:pt.em});
      p.pop();
    }
    p.pop();
    const sc=v=>[v[0]*s*bulk,v[1]*s,v[2]*s*bulk];
    // attach things at the real palm/grip point (a little out from and below the wrist) when the rig gave one
    let R=sc(info.gripR||info.handR),L=sc(info.gripL||info.handL);
    const axR=info.axisR||[0,-1,0],axL=info.axisL||[0,-1,0];
    if(info.weapon){R=R.slice();L=R.slice();R.skip=true;L.skip=true;}   // the body already carries its weapon
    else if(o.rp==='draw'){L=R.slice();}                                // no bow-string line across the hips
    return {R,L,axisR:axR,axisL:axL,top:Ht,hy:Ht*.88,hr:Ht*.108*(race==='dwarf'?1.14:1),shY:Ht*.736,hipY:Ht*.43,W:RACE_W[race]||1,body:key,blender:true};
  },
  variant,ensure,
  ready:()=>manifestState===2
};
// start fetching the manifest straight away so the first units already have bodies
loadManifest();
})();
