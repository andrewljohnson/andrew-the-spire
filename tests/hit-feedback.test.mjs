import test from 'node:test';
import assert from 'node:assert/strict';
import {hitFeedback,attackPresentation} from '../lib/hit-feedback.ts';
test('light and heavy cues use health damage after armor and overkill cap',()=>{
 assert.deepEqual(hitFeedback(6,0,24).sounds,['heavy']);
 assert.deepEqual(hitFeedback(15,0,24).sounds,['heavy']);
 assert.deepEqual(hitFeedback(15,0,3).sounds,['light']);
 assert.deepEqual(hitFeedback(10,6,24).sounds,['break','light']);
});
test('blocked attacks clang, shield exhaustion also cracks even with no health damage',()=>{
 assert.deepEqual(hitFeedback(4,6,24).sounds,['blocked']);
 assert.deepEqual(hitFeedback(6,6,24).sounds,['break','blocked']);
 assert.deepEqual(hitFeedback(15,6,24).sounds,['break','heavy']);
});
test('armor bypass deals health damage without a false shield break',()=>{
 const hit=hitFeedback(15,6,24,true);assert.equal(hit.absorbed,0);assert.equal(hit.brokeBlock,false);assert.deepEqual(hit.sounds,['heavy']);
});
test('multiple enemy attacks consume shared block before classifying the next hit',()=>{
 const first=hitFeedback(8,10,36);const second=hitFeedback(6,10-first.absorbed,36-first.damage);
 assert.deepEqual(first.sounds,['blocked']);assert.deepEqual(second.sounds,['break','light']);assert.equal(second.damage,4);
});

test('damage per hit determines weight, hit count determines the number of sounds',()=>{
 assert.equal(attackPresentation(1,1).beats,1);assert.equal(attackPresentation(1,1).heavy,false);
 assert.equal(attackPresentation(5,1).beats,1);assert.equal(attackPresentation(5,1).heavy,true);
 assert.equal(attackPresentation(1,5).beats,5);assert.equal(attackPresentation(1,5).heavy,false);
 assert.deepEqual(hitFeedback(1,0,36).sounds,['light']);assert.deepEqual(hitFeedback(5,0,36).sounds,['heavy']);
});
