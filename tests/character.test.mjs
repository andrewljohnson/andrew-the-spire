import test from 'node:test';
import assert from 'node:assert/strict';
import {enemyFlavor,deathDuration,newlyEnraged} from '../lib/character.ts';
import {start,bossStart,play} from '../lib/battle.ts';
test('each encounter enemy has its own death and the victory breath outlasts the sound',()=>{assert.deepEqual([enemyFlavor(false,0),enemyFlavor(false,1),enemyFlavor(true,0)],['road','dune','boss']);for(const [name,ms] of [['road',1350],['dune',1550],['boss',2600]])assert.equal(deathDuration(name),ms);});
test('rage announces only a living boss crossing half health',()=>{assert.equal(newlyEnraged(40,34),true);assert.equal(newlyEnraged(38,36),true);assert.equal(newlyEnraged(36,30),false);assert.equal(newlyEnraged(40,0),false);});
test('finishing blows identify a new death once without changing fight outcomes',()=>{let s=start();s={...s,enemies:s.enemies.map(e=>({...e,hp:1}))};const first=play(s,0,0);const dead=first.enemies.filter(e=>e.hp===0&&s.enemies[e.id].hp>0);assert.deepEqual(dead.map(e=>enemyFlavor(false,e.id)),['road']);assert.equal(first.status,'playing');const second=play(first,2,1);assert.equal(second.status,'won');assert.deepEqual(second.enemies.filter(e=>e.hp===0&&first.enemies[e.id].hp>0).map(e=>enemyFlavor(false,e.id)),['dune']);});
