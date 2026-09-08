import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {rewardCards,RewardCard,cards} from '../lib/battle';
import {CardFace} from './Card';
import {Torchlight} from './Journey';
export function CardReward({width,height,reduced,onChoose}:{width:number,height:number,reduced:boolean,onChoose:(card:RewardCard)=>void}){const h=Math.min(205,height*.54),w=h*.7;return <View style={styles.screen}><Torchlight reduced={reduced}/><Text style={styles.title}>A new edge.</Text><Text style={styles.note}>Choose one card for your deck.</Text><View style={{flexDirection:'row',gap:Math.min(30,width*.03),marginTop:12}}>{rewardCards.map((key,i)=><Pressable key={key} accessibilityRole="button" accessibilityLabel={`Take ${cards[key].name}. ${cards[key].cost} energy. ${cards[key].text}`} onPress={()=>onChoose(key)} style={({pressed})=>({alignItems:'center',opacity:pressed?.7:1})}><CardFace card={{id:10,key}} width={w} height={h} large/><Text style={styles.take}>Take</Text></Pressable>)}</View></View>;}
const styles=StyleSheet.create({screen:{...StyleSheet.absoluteFill,backgroundColor:'#081c25',alignItems:'center',justifyContent:'center',zIndex:70},title:{fontSize:26,fontWeight:'800',color:'#f3dfb1'},note:{color:'#cfc3a8',fontSize:13,marginTop:5},take:{color:'#f3dfb1',fontSize:14,fontWeight:'700',paddingVertical:10,paddingHorizontal:25}});
