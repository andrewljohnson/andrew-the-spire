import {test} from 'node:test';
import assert from 'node:assert/strict';
import {musicEnvelope} from '../lib/music-envelope.ts';
function fake(){return {volume:1,loop:false,playing:false,starts:0,pauses:0,play(){this.starts++;},pause(){this.pauses++;this.playing=false;}};}
test('delayed native loading queues playback and fades only after sound starts',()=>{
 const p=fake(),fade=musicEnvelope(p,0,true,true);
 fade.tick(0);fade.tick(1500);assert.equal(p.starts,2);assert.equal(p.volume,0);
 p.playing=true;fade.tick(2000);fade.tick(2500);assert.equal(p.volume,.275);
 fade.tick(3000);assert.equal(p.volume,.55);assert.equal(p.pauses,0);
});
test('departure fades completely then pauses; a new entry starts at silence',()=>{
 const p=fake();p.playing=true;const out=musicEnvelope(p,.55,false,true);
 out.tick(0);out.tick(200);assert.equal(p.volume,.275);assert.equal(p.pauses,0);
 out.tick(400);assert.equal(p.volume,0);assert.equal(p.pauses,1);
 const entry=musicEnvelope(p,p.volume,true,true);entry.tick(500);assert.equal(p.starts,1);assert.equal(p.volume,0);
});
test('mute stops immediately and interrupted playback restarts without resetting gain',()=>{
 const p=fake();p.playing=true;const fade=musicEnvelope(p,0,true,true);
 fade.tick(0);fade.tick(1000);p.playing=false;fade.tick(2000);assert.equal(p.starts,1);assert.equal(p.volume,.55);
 const mute=musicEnvelope(p,p.volume,false,false);mute.tick(2100);assert.equal(p.volume,0);assert.equal(p.pauses,1);
});
