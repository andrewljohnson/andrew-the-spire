export type EnemyFlavor='road'|'dune'|'boss';
export function enemyFlavor(boss:boolean,id:number):EnemyFlavor{return boss?'boss':id===0?'road':'dune';}
export function deathDuration(flavor:EnemyFlavor){return {road:1350,dune:1550,boss:2600}[flavor];}
export function newlyEnraged(before:number,after:number){return before>36&&after>0&&after<=36;}
