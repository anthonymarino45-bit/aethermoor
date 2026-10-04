/* Realms of Aethermoor — minimal GLB loader (static meshes + flat PBR materials; no skins, animations or textures).
   Built for the leader/unit models exported from Blender, so the game needs no external loader library.
   AE3DGLB.load(url) -> Promise<THREE.Group>   (cached; use .clone-safe sharing of geometry/materials) */
(function(){
'use strict';
const T=window.THREE;if(!T)return;
const COMP={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
const NUM={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
const GET={5120:'getInt8',5121:'getUint8',5122:'getInt16',5123:'getUint16',5125:'getUint32',5126:'getFloat32'};

function parse(buf){
  const dv=new DataView(buf);
  if(dv.getUint32(0,true)!==0x46546C67)throw new Error('not a GLB file');
  let off=12,json=null,bin=null;
  while(off<buf.byteLength){
    const len=dv.getUint32(off,true),type=dv.getUint32(off+4,true),data=buf.slice(off+8,off+8+len);
    if(type===0x4E4F534A)json=JSON.parse(new TextDecoder().decode(data));
    else if(type===0x004E4942)bin=data;
    off+=8+len;
  }
  if(!json||!bin)throw new Error('GLB missing JSON/BIN chunk');
  return {json,bin};
}
function readAccessor(g,i){
  const a=g.json.accessors[i],bv=g.json.bufferViews[a.bufferView],C=COMP[a.componentType],n=NUM[a.type];
  const start=(bv.byteOffset||0)+(a.byteOffset||0),stride=bv.byteStride;
  if(!stride||stride===C.BYTES_PER_ELEMENT*n)return new C(g.bin.slice(start,start+a.count*n*C.BYTES_PER_ELEMENT));
  const out=new C(a.count*n),dv=new DataView(g.bin),get=GET[a.componentType],sz=C.BYTES_PER_ELEMENT;   // interleaved fallback
  for(let k=0;k<a.count;k++)for(let c=0;c<n;c++)out[k*n+c]=dv[get](start+k*stride+c*sz,true);
  return out;
}
function makeMaterial(def){
  const p=(def&&def.pbrMetallicRoughness)||{},c=p.baseColorFactor||[1,1,1,1];
  const m=new T.MeshStandardMaterial({roughness:p.roughnessFactor!==undefined?p.roughnessFactor:.8,metalness:p.metallicFactor!==undefined?p.metallicFactor:0});
  m.color.setRGB(c[0],c[1],c[2]);
  if(def&&def.emissiveFactor)m.emissive.setRGB(def.emissiveFactor[0],def.emissiveFactor[1],def.emissiveFactor[2]);
  if(def&&def.doubleSided)m.side=T.DoubleSide;
  if(def&&def.alphaMode==='BLEND'){m.transparent=true;m.opacity=c[3];m.depthWrite=false;}
  else if(def&&def.alphaMode==='MASK')m.alphaTest=def.alphaCutoff!==undefined?def.alphaCutoff:.5;
  m.name=(def&&def.name)||'';
  return m;
}
function build(g){
  const mats=(g.json.materials||[]).map(makeMaterial),fallback=makeMaterial(null);
  const meshCache=new Map();
  const getMesh=idx=>{
    if(meshCache.has(idx))return meshCache.get(idx);
    const def=g.json.meshes[idx],list=[];
    for(const pr of def.primitives){
      if(pr.mode!==undefined&&pr.mode!==4)continue;            // triangles only
      const geo=new T.BufferGeometry(),at=pr.attributes;
      geo.setAttribute('position',new T.BufferAttribute(readAccessor(g,at.POSITION),3));
      if(at.NORMAL!==undefined)geo.setAttribute('normal',new T.BufferAttribute(readAccessor(g,at.NORMAL),3));
      else geo.computeVertexNormals();
      if(at.TEXCOORD_0!==undefined)geo.setAttribute('uv',new T.BufferAttribute(readAccessor(g,at.TEXCOORD_0),2));
      if(pr.indices!==undefined)geo.setIndex(new T.BufferAttribute(readAccessor(g,pr.indices),1));
      list.push({geo,mat:pr.material!==undefined?mats[pr.material]:fallback});
    }
    meshCache.set(idx,list);return list;
  };
  const node=i=>{
    const nd=g.json.nodes[i],o=new T.Object3D();o.name=nd.name||'';
    if(nd.matrix){o.matrix.fromArray(nd.matrix);o.matrix.decompose(o.position,o.quaternion,o.scale);}
    else{
      if(nd.translation)o.position.fromArray(nd.translation);
      if(nd.rotation)o.quaternion.fromArray(nd.rotation);
      if(nd.scale)o.scale.fromArray(nd.scale);
    }
    if(nd.mesh!==undefined)for(const {geo,mat} of getMesh(nd.mesh)){const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;o.add(m);}
    if(nd.children)for(const c of nd.children)o.add(node(c));
    return o;
  };
  const root=new T.Group(),scene=g.json.scenes[g.json.scene||0];
  for(const n of scene.nodes)root.add(node(n));
  return root;
}
const cache=new Map();
window.AE3DGLB={
  parse,build,
  load(url){
    if(cache.has(url))return cache.get(url);
    // Some hosts can't serve .glb; a "<url>.json" file holding {"b64":"..."} is accepted as a fallback.
    const fromB64=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
    const p=fetch(url).then(r=>{if(!r.ok)throw new Error('GLB '+r.status);return r.arrayBuffer();})
      .catch(()=>fetch(url+'.json').then(r=>{if(!r.ok)throw new Error('GLB '+r.status+' '+url);return r.json();}).then(j=>fromB64(j.b64)))
      .then(b=>build(parse(b)));
    cache.set(url,p);return p;
  }
};
})();
