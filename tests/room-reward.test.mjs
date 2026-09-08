import test from 'node:test';
import assert from 'node:assert/strict';
import {bossStart,start,rewardCards,play,endTurn} from '../lib/battle.ts';
import {roomMusic,musicKeys} from '../lib/room-music.ts';
test('every room has a distinct score including reward and boss',()=>{assert.deepEqual(['title','map','fight','reward','bonus','boss','finale'].map(s=>roomMusic(s==='boss'?'fight':s,s==='boss'?2:0)),musicKeys);});
test('one selected reward joins the boss opener and restocks without duplication',()=>{for(const reward of rewardCards){let s=bossStart(29,'ward',reward);assert.equal(s.hp,29);assert.equal(s.hand[0].key,reward);for(let turn=0;turn<8;turn++){const all=[...s.hand,...s.deck,...s.discard];assert.equal(all.length,11);assert.equal(new Set(all.map(c=>c.id)).size,11);assert.equal(all.filter(c=>c.key===reward).length,1);s=endTurn({...s,hp:100});}}assert.equal([...start().hand,...start().deck].length,10);});
test('reward choices offer hybrid defense, large block, or free damage',()=>{let s=bossStart(30,'none','riposte');s=play(s,10,0);assert.equal(s.block,4);assert.equal(s.enemies[0].hp,68);assert.equal(s.energy,2);s=play(bossStart(30,'none','bulwark'),10);assert.equal(s.block,12);assert.equal(s.energy,1);s=play(bossStart(30,'none','spark'),10,0);assert.equal(s.energy,3);assert.equal(s.enemies[0].hp,69);});
