import React,{useEffect,useRef} from 'react';
import {Animated,Modal,PanResponder,Pressable,Text,View,StyleSheet} from 'react-native';
import {Card} from '../lib/battle';
import {CardFace} from './Card';
export function CardInspector({card,width,height,originX,originY,reduced,onClose}:{card:Card,width:number,height:number,originX:number,originY:number,reduced:boolean,onClose:()=>void}){
 const a=useRef(new Animated.Value(0)).current,closing=useRef(false),closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const anim=Animated.spring(a,{toValue:1,speed:19,bounciness:3,useNativeDriver:true});if(reduced)a.setValue(1);else anim.start();return()=>anim.stop();},[a,reduced]);
 function hide(){if(closing.current)return;closing.current=true;Animated.timing(a,{toValue:0,duration:reduced?0:210,useNativeDriver:true}).start(({finished})=>{if(finished)closeRef.current();});}
 const hideRef=useRef(hide);hideRef.current=hide;
 const pan=useRef(PanResponder.create({onMoveShouldSetPanResponder:(_,g)=>Math.hypot(g.dx,g.dy)>8,onPanResponderRelease:(_,g)=>{if(Math.hypot(g.dx,g.dy)>40)hideRef.current();}})).current;
 return <Modal transparent supportedOrientations={['landscape','landscape-left','landscape-right']} onRequestClose={hide} statusBarTranslucent navigationBarTranslucent><View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Animated.View style={[StyleSheet.absoluteFill,{backgroundColor:'#04161be8',opacity:a}]}/><Pressable style={StyleSheet.absoluteFill} onPress={hide} accessibilityLabel="Hide card"/><Animated.View {...pan.panHandlers} style={{alignItems:'center',transform:reduced?[]:[{perspective:800},{translateX:a.interpolate({inputRange:[0,1],outputRange:[originX-width/2,0]})},{translateY:a.interpolate({inputRange:[0,1],outputRange:[originY-height/2,0]})},{scale:a.interpolate({inputRange:[0,1],outputRange:[.35,1]})},{rotateY:a.interpolate({inputRange:[0,1],outputRange:['28deg','0deg']})}]}}><CardFace card={card} width={Math.min(230,height*.58)} height={height*.72} large/><Pressable onPress={hide} style={{padding:10,marginTop:8,minWidth:90,alignItems:'center'}}><Text style={{color:'#f5dfaf',fontSize:16}}>Hide</Text></Pressable></Animated.View></View></Modal>;
}
