export const HERO_HP=36;
export const cards = {
 riposte:{name:'Thorn Reply',cost:1,type:'Attack',target:'enemy',text:'4 damage. 4 block.',damage:4,block:4,art:'sword'},
 bulwark:{name:'Moon Bastion',cost:2,type:'Skill',target:'self',text:'12 block.',damage:0,block:12,art:'veil'},
 spark:{name:'Needle Wisp',cost:0,type:'Attack',target:'enemy',text:'3 damage.',damage:3,block:0,art:'sun'},
 cut: {name:'Glasscut',cost:1,type:'Attack',target:'enemy',text:'6 damage.',damage:6,block:0,art:'sword'},
 veil: {name:'Ivory Veil',cost:1,type:'Skill',target:'self',text:'5 block.',damage:0,block:5,art:'veil'},
 mirror: {name:'Mirror Step',cost:1,type:'Spell',target:'none',text:'5 block. Next attack +4 this turn.',damage:0,block:5,art:'mirror'},
 pierce: {name:'Sunneedle',cost:2,type:'Attack',target:'enemy',text:'15 damage. Ignores block.',damage:15,block:0,art:'sun'},
} as const;
export type CardKey=keyof typeof cards;
export type Card={id:number,key:CardKey};
export type Enemy={id:number,name:string,hp:number,maxHp:number,block:number};
export type Relic='none'|'ember'|'ward';
export type Battle={encounter?:'sentries'|'boss',relic?:Relic,hp:number,enemies:Enemy[],block:number,energy:number,bonus:number,turn:number,hand:Card[],deck:Card[],discard:Card[],log:string,status:'playing'|'won'|'lost'};
const order:CardKey[]=['cut','veil','cut','mirror','veil','cut','veil','pierce','cut','veil'];
export function start():Battle {const deck=order.map((key,id)=>({key,id}));return {hp:HERO_HP,enemies:[{id:0,name:'Road Sentry',hp:24,maxHp:24,block:0},{id:1,name:'Dune Sentry',hp:24,maxHp:24,block:0}],block:0,energy:3,bonus:0,turn:1,hand:deck.slice(0,5),deck:deck.slice(5),discard:[],log:'Two sentries bar your path.',status:'playing'};}
export const rewardCards=['riposte','bulwark','spark'] as const;
export type RewardCard=typeof rewardCards[number];
export function bossStart(hp:number,relic:Relic,reward?:RewardCard):Battle {const fresh=start();if(reward){fresh.hand=[{id:10,key:reward},...fresh.hand.slice(0,4)];fresh.deck=[...start().hand.slice(4),...fresh.deck];}return {...fresh,hp:Math.max(1,Math.min(HERO_HP,hp)),encounter:'boss',relic,block:relic==='ward'?3:0,enemies:[{id:0,name:'The Bellkeeper',hp:72,maxHp:72,block:0}]};}
export function intent(s:Battle,enemyId:number){if(s.encounter==='boss'){const phase=(s.turn-1)%4,enraged=s.enemies[0].hp<=36;return [{damage:8,block:0},{damage:0,block:10},{damage:12,block:0},{damage:6,block:0}].map(i=>({...i,damage:i.damage+(i.damage&&enraged?3:0)}))[phase];}const phase=(s.turn-1)%3;if(enemyId===1)return phase===0?{damage:0,block:6}:phase===1?{damage:4,block:0}:{damage:6,block:0};return phase===0?{damage:4,block:0}:phase===1?{damage:0,block:6}:{damage:8,block:0};}
export function play(s:Battle,id:number,targetId?:number):Battle {
 const c=s.hand.find(c=>c.id===id);if(!c||s.status!=='playing'||cards[c.key].cost>s.energy)return s;
 const d=cards[c.key],target=s.enemies.find(e=>e.id===targetId&&e.hp>0);if(d.damage&&!target)return s;
 const raw=d.damage+(d.damage?s.bonus+(s.relic==='ember'?2:0):0),absorbed=c.key==='pierce'?0:Math.min(target?.block??0,raw),damage=raw-absorbed;
 const enemies=s.enemies.map(e=>d.damage&&e.id===targetId?{...e,hp:Math.max(0,e.hp-damage),block:e.block-absorbed}:e);
 return {...s,enemies,energy:s.energy-d.cost,block:s.block+d.block,bonus:c.key==='mirror'?s.bonus+4:d.damage?0:s.bonus,hand:s.hand.filter(x=>x.id!==id),discard:[...s.discard,c],status:enemies.every(e=>e.hp===0)?'won':'playing',log:`${d.name} · ${d.damage?`${damage} damage to ${target?.name}`:`${d.block} block`}`};
}
export function endTurn(s:Battle):Battle {
 if(s.status!=='playing')return s;
 const total=s.enemies.filter(e=>e.hp>0).reduce((n,e)=>n+intent(s,e.id).damage,0),hurt=Math.max(0,total-s.block);
 let deck=[...s.deck],discard=[...s.discard,...s.hand];const hand:Card[]=[];
 for(let i=0;i<5;i++){if(!deck.length){deck=discard;discard=[];}const c=deck.shift();if(c)hand.push(c);}
 const hp=Math.max(0,s.hp-hurt);
 return {...s,hp,enemies:s.enemies.map(e=>({...e,block:e.hp>0?intent(s,e.id).block:0})),turn:s.turn+1,energy:3,block:s.relic==='ward'?3:0,bonus:0,hand,deck,discard,status:hp===0?'lost':'playing',log:`${hurt} damage taken · ${Math.min(s.block,total)} blocked.`};
}
