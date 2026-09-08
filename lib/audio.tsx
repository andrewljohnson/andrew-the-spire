import React from 'react';
import {musicKeys,MusicKey} from './room-music';
import {source} from './assets';
import {musicEnvelope} from './music-envelope';
import type {HitSound} from './hit-feedback';
import {useEffect,useState,useRef,useMemo} from 'react';
import {AppState} from 'react-native';
import {createAudioPlayer,AudioPlayer,setAudioModeAsync,useAudioPlayer} from 'expo-audio';
export function Music({enabled,assetsReady,track,leaving=false}:{enabled:boolean,assetsReady:boolean,track:MusicKey,leaving?:boolean}){
 const [ready,setReady]=useState(false),[active,setActive]=useState(AppState.currentState==='active');
 useEffect(()=>{let mounted=true;void setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:false,interruptionMode:'mixWithOthers'}).then(()=>{if(mounted)setReady(true);}).catch(()=>{if(mounted)setReady(true);});const listener=AppState.addEventListener('change',s=>setActive(s==='active'));return()=>{mounted=false;listener.remove();};},[]);
 if(!assetsReady||!ready)return null;
 return React.createElement(React.Fragment,null,...musicKeys.map(key=>React.createElement(RoomVoice,{key,musicKey:key,assetsReady,selected:track===key&&!leaving,enabled:enabled&&ready&&active})));
}
function RoomVoice({musicKey,assetsReady,selected,enabled}:{musicKey:MusicKey,assetsReady:boolean,selected:boolean,enabled:boolean}){
 const file=useMemo(()=>assetsReady?source(musicKey):null,[assetsReady,musicKey]);
 const player=useAudioPlayer(file,{updateInterval:500,keepAudioSessionActive:true});
 const gain=useRef(0);
 useEffect(()=>{
  const envelope=musicEnvelope(player,gain.current,enabled&&selected,enabled);
  envelope.tick(Date.now());
  const timer=setInterval(()=>{envelope.tick(Date.now());gain.current=player.volume;},25);
  return()=>{clearInterval(timer);gain.current=player.volume;};
 },[selected,enabled,player]);
 return null;
}

export function useCombatAudio(enabled:boolean){
 const light=useAudioPlayer(source('light'),{downloadFirst:true,keepAudioSessionActive:true});
 const heavy=useAudioPlayer(source('heavy'),{downloadFirst:true,keepAudioSessionActive:true});
 const blocked=useAudioPlayer(source('blocked'),{downloadFirst:true,keepAudioSessionActive:true});
 const fracture=useAudioPlayer(source('break'),{downloadFirst:true,keepAudioSessionActive:true});
 const guard=useAudioPlayer(source('guard'),{downloadFirst:true,keepAudioSessionActive:true});
 const live=useRef(enabled);live.current=enabled;
 useEffect(()=>{if(!enabled)[light,heavy,blocked,fracture,guard].forEach(p=>p.pause());},[enabled,light,heavy,blocked,fracture,guard]);
 return (kind:HitSound|'guard')=>{
  if(!live.current||AppState.currentState!=='active')return;
  const player={light,heavy,blocked,break:fracture,guard}[kind];player.volume=.55;
  void player.seekTo(0).then(()=>{if(live.current&&AppState.currentState==='active')player.play();}).catch(()=>{});
 };
}


/** Bursts are pre-rendered so iOS scheduling cannot swallow individual tats. */
export function useAttackAudio(enabled:boolean,ready:boolean){
 const players=useRef<AudioPlayer[]>([]),live=useRef(enabled);live.current=enabled;
 useEffect(()=>{if(!ready)return;players.current=Array.from({length:21},(_,i)=>createAudioPlayer(source(`tat${i+1}` as keyof typeof import('./assets').assets),{keepAudioSessionActive:true}));return()=>{players.current.forEach(p=>p.remove());players.current=[];};},[ready]);
 function stop(){players.current.forEach(p=>p.pause());}
 useEffect(()=>{if(!enabled)stop();},[enabled]);
 useEffect(()=>{const sub=AppState.addEventListener('change',s=>{if(s!=='active')stop();});return()=>sub.remove();},[]);
 return {stop,play:(count:number)=>{if(!live.current||AppState.currentState!=='active')return;const p=players.current[Math.max(1,Math.min(21,Math.round(count)))-1];if(!p)return;p.volume=.8;void p.seekTo(0).then(()=>{if(live.current&&AppState.currentState==='active')p.play();}).catch(()=>{});}};
}

export function useCharacterAudio(enabled:boolean,ready:boolean){
 const pool=useRef<Partial<Record<'road'|'dune'|'boss'|'rage',AudioPlayer>>>({}),live=useRef(enabled);live.current=enabled;
 useEffect(()=>{if(!ready)return;pool.current={road:createAudioPlayer(source('deathRoad'),{keepAudioSessionActive:true}),dune:createAudioPlayer(source('deathDune'),{keepAudioSessionActive:true}),boss:createAudioPlayer(source('deathBoss'),{keepAudioSessionActive:true}),rage:createAudioPlayer(source('rage'),{keepAudioSessionActive:true})};return()=>{Object.values(pool.current).forEach(p=>p.remove());pool.current={};};},[ready]);
 function stop(){Object.values(pool.current).forEach(p=>p.pause());}
 useEffect(()=>{if(!enabled)stop();},[enabled]);
 useEffect(()=>{const sub=AppState.addEventListener('change',s=>{if(s!=='active')stop();});return()=>sub.remove();},[]);
 return {stop,play:(key:'road'|'dune'|'boss'|'rage')=>{const p=pool.current[key];if(!p||!live.current||AppState.currentState!=='active')return;p.volume=.65;void p.seekTo(0).then(()=>{if(live.current&&AppState.currentState==='active')p.play();}).catch(()=>{});}};
}
