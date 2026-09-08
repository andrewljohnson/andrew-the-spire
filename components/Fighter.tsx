import React,{useEffect,useRef,useId} from 'react';
import {Animated,View,StyleSheet,Easing} from 'react-native';
import {EnemyFlavor,deathDuration} from '../lib/character';
import {DeathRemains,BellCracks} from './CharacterFX';
import {HeroExpression} from './HeroExpression';
import {Image} from 'expo-image';
import {picture,source} from '../lib/assets';
import Svg,{Defs,ClipPath,Polygon,Image as SvgImage} from 'react-native-svg';

const clips={head:'25,0 100,0 100,35 66,35 66,41 42,45 25,43',body:'0,0 25,0 25,43 42,45 66,41 66,35 100,35 100,80 64,80 64,88 47,88 47,74 0,74',front:'0,74 47,74 47,100 0,100',back:'47,88 64,88 64,80 100,80 100,100 47,100'};
function Layer({part,size}:{part:keyof typeof clips,size:number}){const id=useId().replace(/[^a-zA-Z0-9]/g,'');return <Svg width={size} height={size} viewBox="0 0 100 100"><Defs><ClipPath id={id}><Polygon points={clips[part]}/></ClipPath></Defs><SvgImage href={source('enemy')} x={0} y={0} width={100} height={100} clipPath={`url(#${id})`}/></Svg>;}
export type Motion={serial:number,kind:'attack'|'hit'|'guard'|'brace',distance:number,heavy?:boolean,brokeBlock?:boolean}|null;
export function Fighter({hero=false,boss=false,flavor='road',enraged=false,prepareKey='',prepareGuard=false,victorious=false,size,motion,target=false,over=false,strength=0,dead=false,offset=0,reduced=false}:{hero?:boolean,boss?:boolean,flavor?:EnemyFlavor,enraged?:boolean,prepareKey?:string,prepareGuard?:boolean,victorious?:boolean,size:number,motion:Motion,target?:boolean,over?:boolean,strength?:number,dead?:boolean,offset?:number,reduced?:boolean}){
 const heroArt=picture('hero'),enemyArt=picture(boss?'boss':'enemy');
 const rage=useRef(new Animated.Value(0)).current,prepare=useRef(new Animated.Value(0)).current,relax=useRef(new Animated.Value(0)).current;
 useEffect(()=>{const a=Animated.timing(rage,{toValue:enraged?1:0,duration:reduced?0:850,useNativeDriver:true});a.start();return()=>a.stop();},[rage,enraged,reduced]);
 useEffect(()=>{prepare.setValue(reduced?1:0);const a=Animated.timing(prepare,{toValue:1,duration:500,useNativeDriver:true});a.start();return()=>a.stop();},[prepareKey,prepare,reduced]);
 useEffect(()=>{const a=Animated.timing(relax,{toValue:victorious?1:0,duration:reduced?0:700,useNativeDriver:true});a.start();return()=>a.stop();},[relax,victorious,reduced]);
 const idle=useRef(new Animated.Value(0)).current,action=useRef(new Animated.Value(0)).current,death=useRef(new Animated.Value(1)).current;
 useEffect(()=>{if(reduced||dead){idle.setValue(0);return;}const anim=Animated.loop(Animated.sequence([Animated.delay(offset),Animated.timing(idle,{toValue:1,duration:4200,easing:Easing.linear,useNativeDriver:true}),Animated.timing(idle,{toValue:0,duration:0,useNativeDriver:true})]));anim.start();return()=>anim.stop();},[idle,offset,reduced,dead]);
 useEffect(()=>{action.setValue(0);if(!motion)return;const anim=Animated.timing(action,{toValue:1,duration:700,easing:Easing.linear,useNativeDriver:true});anim.start();return()=>anim.stop();},[motion,action]);
 useEffect(()=>{const a=Animated.timing(death,{toValue:dead?0:1,duration:reduced?0:deathDuration(flavor),useNativeDriver:true});a.start();return()=>a.stop();},[dead,death,reduced,flavor]);
 const rotation=idle.interpolate({inputRange:[0,.12,.25,.45,.58,.72,.88,1],outputRange:['0deg','-.7deg','.5deg','0deg','.8deg','-.5deg','.5deg','0deg']});
 const head=idle.interpolate({inputRange:[0,.1,.2,.3,.45,.56,.68,.83,1],outputRange:['0deg','-5deg','3deg','0deg','5deg','-3deg','0deg','2deg','0deg']});
 const dx=motion?.kind==='attack'?action.interpolate({inputRange:flavor==='dune'&&!hero?[0,.26,.35,.43,.51,.59,.7,.84,1]:[0,.23,.35,.44,.58,.82,1],outputRange:flavor==='dune'&&!hero?[0,-.03*motion.distance,motion.distance,.72*motion.distance,motion.distance,.7*motion.distance,.92*motion.distance,.2*motion.distance,0]:[0,-(boss?.14:.07)*motion.distance,motion.distance,motion.distance,.7*motion.distance,.12*motion.distance,0]}):motion?.kind==='hit'?action.interpolate({inputRange:[0,.34,.35,.44,.65,1],outputRange:[0,0,(hero?-1:1)*size*(motion.heavy?.19:.09),(hero?-1:1)*size*(motion.heavy?.19:.09),(hero?-1:1)*size*(motion.heavy?.09:.035),0]}):0;
 const tilt=action.interpolate({inputRange:[0,.16,.34,.42,.7,1],outputRange:motion?.kind==='brace'?['0deg','-3deg','-4deg','-4deg','0deg','0deg']:motion?.kind==='attack'?['0deg',hero?'-6deg':'6deg',hero?'10deg':boss?'-18deg':'-10deg',hero?'10deg':boss?'-18deg':'-10deg','0deg','0deg']:['0deg','0deg',hero?'-9deg':'9deg',hero?'-9deg':'9deg','0deg','0deg']});
 const impact=action.interpolate({inputRange:[0,.31,.35,.43,.62,1],outputRange:[0,0,1,1,0,0]});
 return <Animated.View pointerEvents="none" style={{width:size,height:size}}>
  <Animated.View style={{width:size,height:size,opacity:death.interpolate({inputRange:[0,.3,1],outputRange:[flavor==='dune'?0:.18,.7,1]}),transformOrigin:'50% 100%',transform:reduced?[]:[{scaleY:death.interpolate({inputRange:[0,.45,1],outputRange:[flavor==='boss'?.38:.16,.72,1]})},{translateX:death.interpolate({inputRange:[0,.5,1],outputRange:[flavor==='dune'?size*.3:0,flavor==='dune'?size*.15:0,0]})},{rotate:death.interpolate({inputRange:[0,.5,1],outputRange:[flavor==='dune'?'23deg':'-16deg','5deg','0deg']})}]}}>
  <Animated.View style={{transform:reduced?[]:[{translateX:dx}],position:'absolute',bottom:0,left:size*.27,width:size*.46,height:8,borderRadius:50,backgroundColor:'#04141ddd'}}/>
  <Animated.View style={{width:size,height:size,transform:reduced?[]:[{translateX:dx},{rotate:motion?tilt:'0deg'}],transformOrigin:'50% 95%'}}>
   {target&&<Image source={hero?heroArt:enemyArt} tintColor={over?'#a4ffe3':'#f2c46c'} style={[StyleSheet.absoluteFill,{width:size,height:size,transform:[{scale:over?1.055:1.02+strength*.025}],opacity:over?1:.35+strength*.55}]}/>}
   <Animated.View style={{width:size,height:size,transform:reduced?[]:[{rotate:motion?'0deg':rotation},{rotate:relax.interpolate({inputRange:[0,1],outputRange:['0deg','-3deg']})},{rotate:prepare.interpolate({inputRange:[0,1],outputRange:[prepareGuard?'3deg':'-2deg','0deg']})},{scaleY:rage.interpolate({inputRange:[0,1],outputRange:[1,1.025]})}],transformOrigin:'50% 98%'}}>
    {hero||boss?<Image source={hero?heroArt:enemyArt} style={{width:size,height:size}}/>:<><Layer part="body" size={size}/><Animated.View style={[StyleSheet.absoluteFill,{transform:[{rotate:head}],transformOrigin:'50% 44%'}]}><Layer part="head" size={size}/></Animated.View>{(['front','back'] as const).map((part,i)=><Animated.View key={part} style={[StyleSheet.absoluteFill,{transform:[{translateY:idle.interpolate({inputRange:[0,.12,.3,.48,.62,1],outputRange:i?[0,-size*.015,0,0,0,0]:[0,0,0,-size*.015,0,0]})}]}]}><Layer part={part} size={size}/></Animated.View>)}</>}
    {hero&&!reduced&&<HeroExpression size={size} opacity={motion?.kind==='hit'?impact:idle.interpolate({inputRange:[0,.17,.21,.34,.4,.69,.73,.83,.9,1],outputRange:[0,0,1,1,0,0,.85,.85,0,0]})}/>}
    {boss&&enraged&&!reduced&&<Animated.View style={[StyleSheet.absoluteFill,{opacity:rage.interpolate({inputRange:[0,.3,1],outputRange:[0,.5,.06]})}]}><Image source={enemyArt} tintColor="#ffc96b" style={{width:size,height:size}}/></Animated.View>}
    {boss&&(enraged||dead)&&<BellCracks size={size} dead={dead}/>}
   </Animated.View>
   {(motion?.kind==='guard'||motion?.kind==='brace')&&<Animated.View style={[StyleSheet.absoluteFill,{opacity:impact,overflow:'hidden',transform:reduced?[]:[{translateY:action.interpolate({inputRange:[0,.3,.65,1],outputRange:[size,size,0,0]})}]}]}><Animated.View style={{transform:reduced?[]:[{translateY:action.interpolate({inputRange:[0,.3,.65,1],outputRange:[-size,-size,0,0]})}]}}><Image source={hero?heroArt:enemyArt} tintColor="#bcffe9" style={{width:size,height:size,opacity:.65}}/></Animated.View></Animated.View>}
  </Animated.View>
  {motion?.kind==='hit'&&<Animated.View style={[StyleSheet.absoluteFill,{opacity:impact,transform:[{scale:1.1}]}]}>{[-35,32,-65].map((angle,i)=><View key={i} style={{position:'absolute',left:size*.18+i*6,top:size*(.38+i*.1),width:size*(.68-i*.14),height:4-i,backgroundColor:'#fff1bc',borderRadius:10,transform:[{rotate:`${angle}deg`}]}}/>)}</Animated.View>}

  {!reduced&&motion?.kind==='attack'&&<Animated.View style={[StyleSheet.absoluteFill,{opacity:action.interpolate({inputRange:[0,.15,.3,.75,1],outputRange:[0,0,.55,.15,0]})}]}>{[-1,1,2,-2].map((n,i)=><Animated.View key={i} style={{position:'absolute',bottom:2,left:size*.45,width:10+i*3,height:5+i,borderRadius:10,backgroundColor:'#d8b97c',transform:[{translateX:action.interpolate({inputRange:[0,1],outputRange:[0,n*size*.16]})},{translateY:action.interpolate({inputRange:[0,1],outputRange:[0,-8-i*4]})},{scale:action.interpolate({inputRange:[0,1],outputRange:[.3,1.8]})}]}}/>)}</Animated.View>}
  {!reduced&&motion?.brokeBlock&&<Animated.View style={[StyleSheet.absoluteFill,{opacity:action.interpolate({inputRange:[0,.34,.36,.9,1],outputRange:[0,0,1,0,0]})}]}>{Array.from({length:8},(_,i)=><Animated.View key={i} style={{position:'absolute',left:size*.5,top:size*.5,width:5,height:12,backgroundColor:'#b7fff0',transform:[{translateX:action.interpolate({inputRange:[0,.34,1],outputRange:[0,0,Math.cos(i*Math.PI/4)*size*.45]})},{translateY:action.interpolate({inputRange:[0,.34,1],outputRange:[0,0,Math.sin(i*Math.PI/4)*size*.45]})},{rotate:`${i*45}deg`}]}}/>)}</Animated.View>}
  </Animated.View>
  {dead&&<DeathRemains flavor={flavor} size={size} reduced={reduced}/>}
 </Animated.View>;
}
