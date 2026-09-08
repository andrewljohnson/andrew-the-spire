export type HitSound='light'|'heavy'|'blocked'|'break';
/** Classify the resolved impact, not the card's printed attack value. */
export function hitFeedback(raw:number,block:number,hp:number,ignoreBlock=false){
 const absorbed=ignoreBlock?0:Math.min(block,raw);
 const damage=Math.min(hp,Math.max(0,raw-absorbed));
 const brokeBlock=block>0&&absorbed===block;
 const sounds:HitSound[]=damage===0?['blocked']:[damage>=5?'heavy':'light'];
 if(brokeBlock)sounds.unshift('break');
 return {damage,absorbed,brokeBlock,sounds};
}

export function attackDuration(count:number){return ((count-1)*Math.max(.045,Math.min(.085,.65/Math.max(1,count-1)))+.05)*1000;}

/** Notation is damage per hit × hit count, rather than total damage × sound count. */
export function attackPresentation(damagePerHit:number,hitCount:number){return {beats:hitCount,heavy:damagePerHit>=5,duration:hitCount===1?430:attackDuration(hitCount)};}
