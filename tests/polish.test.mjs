import test from 'node:test';
import assert from 'node:assert/strict';
import {impactAt,beatGap,handSlot} from '../lib/polish.ts';
import {attackDuration} from '../lib/hit-feedback.ts';
test('four attack beats drain block first, then tick health with one cumulative total',()=>{const hit={serial:1,raw:4,hp:12,block:2,absorbed:2,damage:2};assert.deepEqual([1,2,3,4].map(n=>impactAt(hit,n)),[{hp:12,block:1,damage:0},{hp:12,block:0,damage:0},{hp:11,block:0,damage:1},{hp:10,block:0,damage:2}]);});
test('display respects armor bypass, fully blocked attacks and overkill caps',()=>{assert.deepEqual(impactAt({serial:1,raw:15,hp:3,block:8,absorbed:0,damage:3},15),{hp:0,block:8,damage:3});assert.deepEqual(impactAt({serial:1,raw:4,hp:12,block:8,absorbed:4,damage:0},4),{hp:12,block:4,damage:0});});
test('all visual beats fall within their pre-rendered audio burst',()=>{for(let raw=1;raw<=21;raw++){const last=(raw-1)*beatGap(raw);assert.ok(Math.abs(attackDuration(raw)-last-50)<.001);}});
test('lifting spreads neighbors symmetrically and closing a gap recenters the fan',()=>{assert.equal(handSlot(1,5,80,2).x,handSlot(1,5,80,-1).x-10);assert.equal(handSlot(3,5,80,2).x,handSlot(3,5,80,-1).x+10);assert.equal(handSlot(2,5,80,2).x,0);assert.equal(handSlot(0,4,80,-1).x,-handSlot(3,4,80,-1).x);});

test('a single five-damage strike changes health once, while five one-damage hits tick five times',()=>{
 const single={serial:1,raw:5,perHit:5,hp:12,block:0,absorbed:0,damage:5};
 assert.deepEqual(impactAt(single,1),{hp:7,block:0,damage:5});
 assert.deepEqual([1,2,3,4,5].map(n=>impactAt({...single,perHit:1},n).hp),[11,10,9,8,7]);
});
