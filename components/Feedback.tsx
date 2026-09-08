import React,{useEffect,useRef,useState} from 'react';
import {Animated,StyleSheet,Text,View} from 'react-native';
import {Impact,impactAt,beatGap} from '../lib/polish';
export function useImpactDisplay(hp:number,block:number,hit:Impact|null){
 const [tick,setTick]=useState<{serial:number,beat:number}|null>(null);
 useEffect(()=>{if(!hit){setTick(null);return;}setTick({serial:hit.serial,beat:1});const timers=Array.from({length:Math.ceil(hit.raw/(hit.perHit??1))-1},(_,i)=>setTimeout(()=>setTick({serial:hit.serial,beat:i+2}),(i+1)*beatGap(hit.raw)));return()=>timers.forEach(clearTimeout);},[hit]);
 return hit?impactAt(hit,tick?.serial===hit.serial?tick.beat:0):{hp,block,damage:0};
}
export function DamageNumber({value,serial,reduced}:{value:number,serial:number,reduced:boolean}){
 const a=useRef(new Animated.Value(0)).current;
 useEffect(()=>{a.setValue(0);const anim=Animated.timing(a,{toValue:1,duration:1100,useNativeDriver:true});anim.start();return()=>anim.stop();},[serial,a]);
 return <Animated.Text pointerEvents="none" style={{position:'absolute',top:110,left:20,width:70,textAlign:'center',fontSize:value>=8?29:23,fontWeight:'900',color:'#ffead0',textShadowColor:'#4d1f16',textShadowRadius:4,opacity:a.interpolate({inputRange:[0,.7,1],outputRange:[1,1,0]}),transform:reduced?[]:[{translateY:a.interpolate({inputRange:[0,1],outputRange:[0,-25]})}]}}>{value>0?`−${value}`:''}</Animated.Text>;
}
