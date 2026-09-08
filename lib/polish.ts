export type Impact={serial:number,raw:number,perHit?:number,hp:number,block:number,damage:number,absorbed:number};
export function beatGap(raw:number){return Math.max(45,Math.min(85,650/Math.max(1,raw-1)));}
export function impactAt(hit:Impact,beat:number){const n=Math.max(0,Math.min(hit.raw,beat*(hit.perHit??1)));const blocked=Math.min(hit.absorbed,n);const damage=Math.min(hit.damage,Math.max(0,n-hit.absorbed));return {hp:hit.hp-damage,block:hit.block-blocked,damage};}
export function handSlot(index:number,count:number,width:number,lifted:number){const slot=index-(count-1)/2;return {x:slot*width*.76+(lifted<0||index===lifted?0:index<lifted?-10:10),y:slot*slot*3,angle:slot*7};}
