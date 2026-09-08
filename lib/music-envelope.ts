type Player={volume:number,loop:boolean,playing:boolean,play:()=>void,pause:()=>void};
/** Poll the native player directly: an initial status event can be missed while loading. */
export function musicEnvelope(player:Player,initial:number,selected:boolean,enabled:boolean){
 let began:number|undefined,lastAttempt=-Infinity,done=false;
 const target=selected?.55:0,duration=selected?1000:400;
 player.loop=true;player.volume=enabled?initial:0;
 return {tick(now:number){
  if(!enabled){if(!done){player.pause();done=true;}return;}
  // play() queues playback even before AVPlayer has finished loading.
  if(selected&&!player.playing&&now-lastAttempt>=1000){player.play();lastAttempt=now;}
  if(done)return;
  if(selected&&!player.playing)return;
  began??=now;
  const f=Math.min(1,Math.max(0,(now-began)/duration)),eased=f*f*(3-2*f);
  player.volume=initial+(target-initial)*eased;
  if(f===1){done=true;if(!selected)player.pause();}
 }};
}
