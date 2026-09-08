import React,{useRef,useEffect} from 'react';
import {Animated,View,Text,StyleSheet,PanResponder} from 'react-native';
import {handSlot} from '../lib/polish';
import {Image} from 'expo-image';
import {picture} from '../lib/assets';
import {cards,Card as BattleCard} from '../lib/battle';
export function CardFace({card,width,height,large=false}:{card:BattleCard,width:number,height:number,large?:boolean}){
 const d=cards[card.key],col=d.art==='veil'||d.art==='sun'?1:0,row=d.art==='mirror'||d.art==='sun'?1:0;
 const artWidth=width-10,artHeight=height*(large?.49:.42);
 return <View style={[styles.face,{width,height}]}>
  <View style={{flexDirection:'row',alignItems:'center',width:'100%',gap:3,marginBottom:3}}><View style={[styles.cost,large&&{width:28,height:28}]}><Text style={[styles.costText,large&&{fontSize:20}]}>{d.cost}</Text></View><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.name,{flex:1,fontSize:large?18:11}]}>{d.name}</Text></View>
  <View style={{width:artWidth,height:artHeight,overflow:'hidden',borderRadius:3}}><Image source={picture('cards')} style={{position:'absolute',width:artWidth*2,height:artHeight*2,left:-col*artWidth,top:-row*artHeight}} contentFit="fill"/></View>
  <Text style={[styles.description,{fontSize:large?15:11}]}>{d.text}</Text>
 </View>;
}
export function HandCard({card,index,count,width,height,center,energy,disabled,lifted=-1,hidden=false,reduced=false,onInspect,onDrag,onDrop,onCancel}:{card:BattleCard,index:number,count:number,width:number,height:number,center:number,energy:number,disabled:boolean,lifted?:number,hidden?:boolean,reduced?:boolean,onInspect:(card:BattleCard)=>void,onDrag:(card:BattleCard,x:number,y:number,progress:number)=>void,onDrop:(card:BattleCard,x:number,y:number)=>void,onCancel:()=>void}){
 const latest=useRef({disabled,onInspect,onDrag,onDrop,onCancel,card,height});latest.current={disabled,onInspect,onDrag,onDrop,onCancel,card,height};
 const gesture=useRef({moved:false,lifted:false,x:0,y:0});const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 function clear(){if(timer.current)clearTimeout(timer.current);timer.current=null;}
 useEffect(()=>()=>clear(),[]);
 const pan=useRef(PanResponder.create({
  onStartShouldSetPanResponder:()=>!latest.current.disabled,
  onMoveShouldSetPanResponder:()=>!latest.current.disabled,
  onPanResponderGrant:e=>{const x=e.nativeEvent.pageX,y=e.nativeEvent.pageY;gesture.current={moved:false,lifted:false,x,y};clear();timer.current=setTimeout(()=>{gesture.current.lifted=true;latest.current.onDrag(latest.current.card,x,y,0);},300);},
  onPanResponderMove:(e,g)=>{const distance=Math.hypot(g.dx,g.dy);if(distance>8){gesture.current.moved=true;clear();}if(gesture.current.moved||gesture.current.lifted)latest.current.onDrag(latest.current.card,g.moveX,g.moveY,Math.min(1,distance/140));},
  onPanResponderRelease:(e,g)=>{clear();if(gesture.current.moved)latest.current.onDrop(latest.current.card,g.moveX,g.moveY);else{latest.current.onCancel();latest.current.onInspect(latest.current.card);}},
  onPanResponderTerminate:()=>{clear();latest.current.onCancel();},onPanResponderTerminationRequest:()=>false,
 })).current;
 const position=handSlot(index,count,width,lifted),x=useRef(new Animated.Value(position.x)).current,y=useRef(new Animated.Value(position.y)).current,angle=useRef(new Animated.Value(position.angle)).current,arrival=useRef(new Animated.Value(reduced?1:0)).current;
 useEffect(()=>{const anim=Animated.parallel([Animated.spring(x,{toValue:position.x,speed:20,bounciness:3,useNativeDriver:true}),Animated.spring(y,{toValue:position.y,speed:20,bounciness:3,useNativeDriver:true}),Animated.spring(angle,{toValue:position.angle,speed:20,bounciness:3,useNativeDriver:true})]);if(reduced){x.setValue(position.x);y.setValue(position.y);angle.setValue(position.angle);}else anim.start();return()=>anim.stop();},[position.x,position.y,position.angle,reduced,x,y,angle]);
 useEffect(()=>{const anim=Animated.timing(arrival,{toValue:1,delay:reduced?0:index*45,duration:reduced?0:270,useNativeDriver:true});anim.start();return()=>anim.stop();},[arrival,reduced]);
 return <Animated.View {...pan.panHandlers} accessible accessibilityRole="button" accessibilityLabel={`${cards[card.key].name}, ${cards[card.key].cost} energy. Tap to inspect; drag to play.`} onAccessibilityTap={()=>onInspect(card)} style={{position:'absolute',left:center-width/2,bottom:-height*.31,width,height,transform:[{translateX:x},{translateY:Animated.add(y,arrival.interpolate({inputRange:[0,1],outputRange:[75,0]}))},{rotate:angle.interpolate({inputRange:[-30,30],outputRange:['-30deg','30deg']})}],zIndex:index+10,opacity:hidden?0:Animated.multiply(arrival,cards[card.key].cost>energy?.55:1)}}><CardFace card={card} width={width} height={height}/></Animated.View>;
}
const styles=StyleSheet.create({face:{borderWidth:2,borderColor:'#bd9b5c',borderRadius:7,backgroundColor:'#15313c',alignItems:'center',padding:3,overflow:'hidden'},cost:{borderWidth:1,borderColor:'#edcf88',borderRadius:20,width:23,height:23,backgroundColor:'#17454a',alignItems:'center',justifyContent:'center'},costText:{fontSize:16,color:'#fff0cd',fontWeight:'700'},name:{fontWeight:'800',color:'#f8e5be',marginHorizontal:1},description:{color:'#e8e2ce',textAlign:'center',lineHeight:17,marginTop:5,marginHorizontal:3}});
