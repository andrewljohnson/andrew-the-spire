import React,{useId} from 'react';
import {Animated,StyleSheet} from 'react-native';
import Svg,{Defs,ClipPath,Polygon,Image as SvgImage} from 'react-native-svg';
import {source} from '../lib/assets';
export function HeroExpression({size,opacity}:{size:number,opacity:Animated.AnimatedInterpolation<number>}){
 const id='expression'+useId().replace(/[^a-zA-Z0-9]/g,'');
 // Only the face interior is composited: the generated alternate frame cannot move the body or silhouette.
 return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill,{opacity}]}><Svg width={size} height={size} viewBox="0 0 100 100"><Defs><ClipPath id={id}><Polygon points="49.6,15.6 53.4,16 53.8,17.8 52.5,18.3 50,17.8"/><Polygon points="50.4,18.6 53.8,18.9 54,19.9 53.1,21.1 51.3,20.7"/></ClipPath></Defs><SvgImage href={source('grimace')} x={-2.5} y={0} width={100} height={100} clipPath={`url(#${id})`}/></Svg></Animated.View>;
}
