import type {Relic} from './battle.ts';
import {HERO_HP} from './battle.ts';
export type Reward='heal'|'ember'|'ward';
export function chooseGift(hp:number,relic:Relic,reward:Reward){return {hp:reward==='heal'?Math.min(HERO_HP,hp+14):hp,relic:reward==='heal'?relic:reward};}
