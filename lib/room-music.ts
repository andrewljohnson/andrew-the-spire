export const musicKeys=['musicTitle','musicMap','musicCrossing','musicReward','musicWell','musicBoss','musicVictory'] as const;
export type MusicKey=typeof musicKeys[number];
export function roomMusic(screen:string,step:number):MusicKey{if(screen==='fight')return step===2?'musicBoss':'musicCrossing';return ({title:'musicTitle',map:'musicMap',reward:'musicReward',bonus:'musicWell',finale:'musicVictory'} as Record<string,MusicKey>)[screen]??'musicTitle';}
