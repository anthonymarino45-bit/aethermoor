/* Realms of Aethermoor V5.7.0 - faction art direction table (race-first). Shared by units, cities, ships and banners.
   Five races, each represented by two factions that share anatomy but differ in palette, heraldry and signature details. */
'use strict';
(function(){
const AE=window.AE3;if(!AE||!AE.ok)return;
const base={
  // HUMANS
  0:{race:'human',key:'aldermark',flair:'royal',emblem:'lion',cloth:0x2152a8,cloth2:0x142f66,trim:0xd9b45e,metal:0xc9d0d6,metal2:0x6d7680,leather:0x6a4529,wood:0x6b4a2c,skin:0xdba27c,skin2:0xb47a5a,hair:0x5a3a22,plume:0xe8eef8,eye:0x2a2018,
     helm:'bascinet',shield:'heater',bow:'long',sword:'straight',spear:'pike',mount:'horse',mountCol:0x7a4a2a,mountMane:0x2a1a10,beast:'bear',roof:0x2f4f8a,roof2:0xa8452f,wall:0xe6dcc4,stone:0xc8bea8,banner:'swallow'},
  10:{race:'human',key:'valedawn',flair:'sun',emblem:'sun',cloth:0xf2ead2,cloth2:0xc89b3a,trim:0xffcf5a,metal:0xf0e0aa,metal2:0xb8964a,leather:0x8a5a32,wood:0x8a6a42,skin:0xc98a5e,skin2:0xa8683f,hair:0xe0c070,plume:0xffd25a,eye:0x3a2a18,
     helm:'sunhelm',shield:'sunround',bow:'long',sword:'straight',spear:'sunspear',mount:'horse',mountCol:0xf0ece2,mountMane:0xe8d090,beast:'lion',roof:0xd9a63a,roof2:0xe8d6a8,wall:0xf4eedf,stone:0xf0e8d4,banner:'sunpennant'},
  // ELVES
  1:{race:'elf',key:'sylvanor',flair:'leaf',emblem:'leaf',cloth:0x1e6b45,cloth2:0x0f3d29,trim:0xe0cf88,metal:0xc4d8cc,metal2:0x6f8a80,leather:0x5a4a2a,wood:0xc9b089,skin:0xf0d2b2,skin2:0xd4ac8c,hair:0xf2ecd6,plume:0xdff5e8,eye:0x2a6a48,
     helm:'winged',shield:'leafkite',bow:'recurve',sword:'leaf',spear:'glaive',mount:'elfhorse',mountCol:0xf3f3ee,mountMane:0xd8e6f0,beast:'stag',roof:0x2f7a5a,roof2:0x3f8f6a,wall:0xeeeadc,stone:0xe6e0d0,banner:'leafbanner'},
  11:{race:'elf',key:'thornwild',flair:'wild',emblem:'antler',cloth:0x5f7a2e,cloth2:0x4a3822,trim:0xd09a52,metal:0x8a6a40,metal2:0x4a3622,leather:0x6a4a2a,wood:0x5a3e24,skin:0xcf9f74,skin2:0xa87a52,hair:0x8a3a1e,plume:0x8fbf4a,eye:0x6aa82a,
     helm:'antlerhood',shield:'wicker',bow:'thorn',sword:'thorn',spear:'thornspear',mount:'stag',mountCol:0x8a5a32,mountMane:0x5a3a20,beast:'direwolf',roof:0x8a7a42,roof2:0x6a8a3a,wall:0x8a6a44,stone:0x7a6a52,banner:'hide'},
  // DWARVES
  2:{race:'dwarf',key:'khazrum',flair:'rune',emblem:'anvil',cloth:0x8a3f1a,cloth2:0x4a2412,trim:0xe8ad3a,metal:0xb3a58e,metal2:0x5e554a,leather:0x5a3a22,wood:0x6a4a2a,skin:0xdba27c,skin2:0xb47a5a,hair:0xc2561c,plume:0xd84a1a,eye:0x2a1a10,
     helm:'horned',shield:'runeround',bow:'short',sword:'broad',spear:'dwarfpike',mount:'ram',mountCol:0xd8ccb0,mountMane:0x9a8a6a,beast:'cavebear',roof:0xc0782a,roof2:0x8a4a1a,wall:0xb8a890,stone:0x9a8a78,banner:'square'},
  12:{race:'dwarf',key:'ironveil',flair:'iron',emblem:'gear',cloth:0x4a5a6c,cloth2:0x2a323c,trim:0xe0aa58,metal:0x8a929c,metal2:0x4a5058,leather:0x4a3a2c,wood:0x4a3a2c,skin:0xc8946e,skin2:0xa06c4a,hair:0x2e2a28,plume:0xd6a35b,eye:0xffb040,
     helm:'ironmask',shield:'irontower',bow:'short',sword:'broad',spear:'dwarfpike',mount:'ironram',mountCol:0x5a5550,mountMane:0x2a2826,beast:'ironram',roof:0x4a5058,roof2:0xb07a3a,wall:0x6a6560,stone:0x5a5550,banner:'square'},
  // ORCS
  3:{race:'orc',key:'grommash',flair:'spike',emblem:'fist',cloth:0x9a1c1c,cloth2:0x3a0f0f,trim:0xc9b89a,metal:0x60656c,metal2:0x34373b,leather:0x5a3a22,wood:0x4a3020,skin:0x6f9a3a,skin2:0x4f7428,hair:0x1a1a1a,plume:0x1a1a1a,eye:0xffd030,
     helm:'spiked',shield:'spikeround',bow:'crude',sword:'cleaver',spear:'crude',mount:'warg',mountCol:0x5a5550,mountMane:0x2a2826,beast:'warg',roof:0x7a4a2a,roof2:0x9a1c1c,wall:0x6a5a48,stone:0x3a3634,banner:'ragged'},
  13:{race:'orc',key:'skarr',flair:'tusk',emblem:'boar',cloth:0x6a1418,cloth2:0x2a1210,trim:0xece0c4,metal:0x6a5444,metal2:0x3a2c22,leather:0x6a4a30,wood:0x5a3a24,skin:0x9a8862,skin2:0x7a6a48,hair:0xd8d0c0,plume:0xf0a36d,eye:0xff6a2a,
     helm:'boarskull',shield:'hide',bow:'crude',sword:'jagged',spear:'bone',mount:'boar',mountCol:0x5a3a2a,mountMane:0x2a1a10,beast:'darkwarg',roof:0x8a3a2a,roof2:0xb06a3a,wall:0x7a5a40,stone:0x5a4a3a,banner:'skullpole'},
  // UNDEAD
  4:{race:'undead',key:'nekhara',flair:'pharaoh',emblem:'ankh',cloth:0x4a2a7a,cloth2:0x241540,trim:0xd9b04a,metal:0x7a7f8a,metal2:0x3a3e48,leather:0x3a2a20,wood:0x3a2e28,skin:0xe8dec4,skin2:0xb8ab8a,hair:0x1a1420,plume:0x8a4ad8,eye:0xc070ff,
     helm:'nemes',shield:'boneround',bow:'bone',sword:'khopesh',spear:'bonespear',mount:'bonehorse',mountCol:0xe8dec4,mountMane:0xa860ff,beast:'bonehound',roof:0x2a2632,roof2:0x5a3a8a,wall:0x4a4452,stone:0x3a3640,banner:'tattered'},
  14:{race:'undead',key:'nocthyr',flair:'shadow',emblem:'moon',cloth:0x2c3478,cloth2:0x161a40,trim:0xb8c4f0,metal:0x5a6288,metal2:0x2e3456,leather:0x2e2a3e,wood:0x2a2634,skin:0x8a84a8,skin2:0x5a5478,hair:0x0a0a14,plume:0xd56bdc,eye:0x6af0ff,
     helm:'hood',shield:'crescentkite',bow:'shadow',sword:'curved',spear:'scythe',mount:'nightmare',mountCol:0x1a1a26,mountMane:0xd56bdc,beast:'panther',roof:0x23264a,roof2:0x3a3f7a,wall:0x2e2f48,stone:0x34354e,banner:'tattered'},
};
// city-states and barbarians borrow a race but keep their own colours
const extra={
  5:{from:0,cloth:0x0f8a7a,cloth2:0x0a4a44,trim:0xd8e8e0,emblem:'anchor',roof:0x2a8a8a},
  6:{from:2,cloth:0x6a7480,cloth2:0x3a4048,trim:0xc8d0d8,emblem:'anvil',roof:0x5a6470},
  7:{from:1,cloth:0xc8508e,cloth2:0x6a2a4a,trim:0xf2d8e8,emblem:'leaf',roof:0xb8508a},
  8:{from:0,cloth:0xc8a01a,cloth2:0x6a5410,trim:0xfff0b0,emblem:'coin',roof:0xc8a01a},
  9:{from:3,cloth:0x5a4a3a,cloth2:0x2a221a,trim:0x9a8a6a,emblem:'skull',skin:0x7a8a4a,roof:0x5a4a3a,key:'barbarian'},
};
const cache={};
AE.fstyle=function(owner){
  if(cache[owner])return cache[owner];
  let st;
  if(base[owner])st={...base[owner]};else if(extra[owner]){const e=extra[owner];st={...base[e.from],...e};}else st={...base[0]};
  const civ=CIVS[owner]||CIVS[0];st.id=owner;st.team=parseInt((civ.color||'#888888').slice(1),16);st.team2=parseInt((civ.color2||'#ffffff').slice(1),16);
  // heraldic field colours: banners/shields use the realm colour as field and the trim as charge
  st.field=owner in base?st.cloth:st.cloth;
  cache[owner]=st;return st;
};
AE.raceOf=o=>AE.fstyle(o).race;
})();
