import React,{useEffect,useRef} from 'react';
import {Animated} from 'react-native';
import {Card} from '../lib/battle';
import {CardFace} from './Card';
export type Flight={card:Card,x:number,y:number,toX:number,toY:number,scale:number,valid:boolean,toScale:number,angle:number};
export function CardFlight({flight,onDone,reduced}:{flight:Flight,onDone:()=>void,reduced:boolean}){
 const a=useRef(new Animated.Value(0)).current,done=useRef(onDone);done.current=onDone;
 useEffect(()=>{const anim=flight.valid||reduced?Animated.timing(a,{toValue:1,duration:reduced?0:200,useNativeDriver:true}):Animated.spring(a,{toValue:1,speed:22,bounciness:5,useNativeDriver:true});anim.start(({finished})=>{if(finished)done.current();});return()=>anim.stop();},[a,flight,reduced]);
 return <Animated.View pointerEvents="none" style={{position:'absolute',left:flight.x-69,top:flight.y-153,width:138,height:202,zIndex:55,opacity:flight.valid?a.interpolate({inputRange:[0,.6,1],outputRange:[1,.8,0]}):1,transform:[{translateX:a.interpolate({inputRange:[0,1],outputRange:[0,flight.toX-flight.x]})},{translateY:a.interpolate({inputRange:[0,1],outputRange:[0,flight.toY-flight.y]})},{scale:a.interpolate({inputRange:[0,1],outputRange:[flight.scale,flight.valid?.15:flight.toScale]})},{rotate:a.interpolate({inputRange:[0,1],outputRange:['0deg',flight.valid?'-10deg':`${flight.angle}deg`]})}]}}><CardFace card={flight.card} width={138} height={202} large/></Animated.View>;
}
