import React,{useEffect,useMemo,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,AppState,Modal,Platform,Pressable,StyleSheet,Text,useWindowDimensions,View,ScrollView} from 'react-native';
import {Image} from 'expo-image';
import {prepareAssets,picture} from './lib/assets';
import {roomMusic} from './lib/room-music';
import {CardReward} from './components/CardReward';
import {chooseGift} from './lib/journey';
import {Title,MapScreen,BonusRoom,Finale,Reward} from './components/Journey';
import {StatusBar} from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import * as Haptics from 'expo-haptics';
import {SafeAreaProvider,useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg,{Path,Defs,LinearGradient,Stop,Rect} from 'react-native-svg';
import {cards,start,play,endTurn,intent,HERO_HP,bossStart,Relic,RewardCard,Card as BattleCard} from './lib/battle';
import {layout,enemyAt,onScreen} from './lib/layout';
import {Music,useCombatAudio,useAttackAudio,useCharacterAudio} from './lib/audio';
import {hitFeedback,attackDuration,attackPresentation} from './lib/hit-feedback';
import {CardFace,HandCard} from './components/Card';
import {Impact,beatGap} from './lib/polish';
import {rumbleHit} from './lib/rumble';
import {useImpactDisplay,DamageNumber} from './components/Feedback';
import {CardFlight,Flight} from './components/CardFlight';
import {enemyFlavor,deathDuration,newlyEnraged} from './lib/character';
import {CardEffect,Cast,IntentButton} from './components/CharacterFX';
import {CardInspector} from './components/CardInspector';
import {Fighter,Motion} from './components/Fighter';
const gold='#f0d297';
const paths={shield:'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z',bolt:'m13 2-9 12h7l-1 8 10-12h-7l1-8Z',menu:'M4 6h16M4 12h16M4 18h16',draw:'m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5',back:'m9 5 7 7-7 7'};
function Icon({name,size=18,color=gold}:{name:keyof typeof paths,size?:number,color?:string}){return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d={paths[name]} stroke={color} strokeWidth={2.2} fill="none" strokeLinejoin="round" strokeLinecap="round"/></Svg>;}
function Health({name,hp,max,block,bonus=0,enemy=false,hit=null,reduced=false}:{name:string,hp:number,max:number,block:number,bonus?:number,enemy?:boolean,hit?:Impact|null,reduced?:boolean}){const shown=useImpactDisplay(hp,block,hit),shieldPulse=useRef(new Animated.Value(1)).current,previousBlock=useRef(block);useEffect(()=>{if(block>previousBlock.current&&!reduced){shieldPulse.setValue(1.35);Animated.spring(shieldPulse,{toValue:1,speed:18,bounciness:7,useNativeDriver:true}).start();}previousBlock.current=block;},[block,reduced,shieldPulse]);hp=shown.hp;block=shown.block;return <View accessible accessibilityLabel={`${name}, ${hp} of ${max} health, ${block} block`} style={styles.stats}>{hit&&<DamageNumber value={shown.damage} serial={hit.serial} reduced={reduced}/>}<Text style={styles.actorName}>{name}</Text><View style={styles.health}><View style={[StyleSheet.absoluteFill,{width:`${hp/max*100}%`,backgroundColor:enemy?'#b98750':'#509e91'}]}/><Text style={styles.healthText}>{hp} / {max}</Text></View><Animated.View style={[styles.statusLine,{transform:[{scale:shieldPulse}]}]}>{block>0&&<><Icon name="shield" size={13}/><Text style={styles.small}>{block}</Text></>}{bonus>0&&<Text style={styles.small}>  +{bonus}</Text>}</Animated.View></View>;}
function Game(){
 const {width,height}=useWindowDimensions(),insets=useSafeAreaInsets();
 const [screen,setScreen]=useState<'title'|'map'|'fight'|'bonus'|'reward'|'finale'>('title'),[step,setStep]=useState(0),[relic,setRelic]=useState<Relic>('none'),[turns,setTurns]=useState(0);
 const [deckReward,setDeckReward]=useState<RewardCard|undefined>(undefined);
 const [ready,setReady]=useState(false),[loadError,setLoadError]=useState(false);
 function load(){setLoadError(false);void prepareAssets().then(()=>setReady(true)).catch(()=>setLoadError(true));}
 useEffect(load,[]);
 const field=useMemo(()=>{const f=layout(width,height,insets.left,insets.right);if(step===2){const size=Math.min(height*.57,(width-insets.left-insets.right)*.28);f.enemies=[{x:insets.left+(width-insets.left-insets.right)*.71-size/2,y:f.ground-size,width:size,height:size}];}return f;},[width,height,insets.left,insets.right,step]);
 const [battle,setBattle]=useState(start),[sound,setSound]=useState(true),[busy,setBusy]=useState(false),[reduced,setReduced]=useState(false);
 const [menu,setMenu]=useState(false),[help,setHelp]=useState(false),[inspect,setInspect]=useState<BattleCard|null>(null),[intentId,setIntentId]=useState<number|null>(null);
 const [drag,setDrag]=useState<{card:BattleCard,x:number,y:number,progress:number}|null>(null);
 const [cast,setCast]=useState<Cast|null>(null);
 const [flight,setFlight]=useState<Flight|null>(null),[hits,setHits]=useState<{hero:Impact|null,enemies:(Impact|null)[]}>({hero:null,enemies:[null,null]});
 const curtain=useRef(new Animated.Value(0)).current,transitioning=useRef(false);
 const [cover,setCover]=useState(false),[leaving,setLeaving]=useState(false);
 function travel(change:()=>void){if(transitioning.current)return;transitioning.current=true;setCover(true);setLeaving(true);Animated.timing(curtain,{toValue:1,duration:450,useNativeDriver:true}).start(({finished})=>{if(!finished){setLeaving(false);transitioning.current=false;setCover(false);return;}change();setLeaving(false);Animated.timing(curtain,{toValue:0,duration:reduced?0:240,useNativeDriver:true}).start(()=>{transitioning.current=false;setCover(false);});});}
 const [motions,setMotions]=useState<{hero:Motion,enemies:Motion[]}>({hero:null,enemies:[null,null]});
 const serial=useRef(0),locked=useRef(false),timers=useRef<ReturnType<typeof setTimeout>[]>([]),battleRef=useRef(battle);battleRef.current=battle;
 const glow=useRef(new Animated.Value(0)).current,focusDim=useRef(new Animated.Value(0)).current;
 useEffect(()=>{const a=Animated.timing(focusDim,{toValue:drag?1:0,duration:reduced?0:140,useNativeDriver:true});a.start();return()=>a.stop();},[!!drag,reduced,focusDim]);
 const effect=useCombatAudio(sound),attackAudio=useAttackAudio(sound,ready),characterAudio=useCharacterAudio(sound,ready);
 useEffect(()=>{void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(()=>{});if(Platform.OS==='android')void NavigationBar.setVisibilityAsync('hidden').catch(()=>{});
  void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);const reduce=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);
  return()=>{reduce.remove();timers.current.forEach(clearTimeout);};
 },[]);
 useEffect(()=>{setDrag(null);},[width,height]);
 useEffect(()=>{const listener=AppState.addEventListener('change',state=>{if(state!=='active')setDrag(null);else if(Platform.OS==='android')void NavigationBar.setVisibilityAsync('hidden').catch(()=>{});});return()=>listener.remove();},[]);
 useEffect(()=>{glow.setValue(0);if(battle.energy!==0||busy||reduced)return;const animation=Animated.loop(Animated.sequence([Animated.timing(glow,{toValue:1,duration:700,useNativeDriver:true}),Animated.timing(glow,{toValue:0,duration:700,useNativeDriver:true})]));animation.start();return()=>animation.stop();},[battle.energy,busy,reduced,glow]);
 function later(fn:()=>void,delay:number){const t=setTimeout(()=>{timers.current=timers.current.filter(x=>x!==t);fn();},delay);timers.current.push(t);}

 function reset(){travel(()=>{attackAudio.stop();characterAudio.stop();setCast(null);setFlight(null);setHits({hero:null,enemies:[null,null]});timers.current.forEach(clearTimeout);timers.current=[];locked.current=false;setBusy(false);setBattle(start());setDrag(null);setInspect(null);setIntentId(null);setMotions({hero:null,enemies:[null,null]});setMenu(false);setHelp(false);setStep(0);setRelic('none');setDeckReward(undefined);setTurns(0);setScreen('title');});}
 function enter(){travel(()=>{if(step===1){setScreen('bonus');return;}setBattle(step===2?bossStart(battle.hp,relic,deckReward):start());setScreen('fight');});}
 function reward(choice:Reward){travel(()=>{const gift=chooseGift(battle.hp,relic,choice);setBattle(s=>({...s,hp:gift.hp}));setRelic(gift.relic);setStep(2);setScreen('map');});}
 function advance(){travel(()=>{setTurns(t=>t+battle.turn);setIntentId(null);if(step===2){setScreen('finale');void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(()=>{});}else{setScreen('reward');}});}
 function takeCard(key:RewardCard){travel(()=>{setDeckReward(key);setStep(1);setScreen('map');});}
 function fly(card:BattleCard,x:number,y:number,valid:boolean,target?:number){
  const i=battle.hand.findIndex(c=>c.id===card.id),slot=i-(battle.hand.length-1)/2;
  const rect=target===undefined?field.hero:field.enemies[target];
  setFlight({card,x:Math.max(77,Math.min(width-77,x)),y:Math.max(161,Math.min(height-57,y)),scale:drag?1.12-.52*(drag.progress*drag.progress*(3-2*drag.progress)):1,valid,toScale:field.cardWidth/138,angle:slot*7,toX:valid?rect.x+rect.width/2:field.handCenter+slot*field.cardWidth*.76,toY:valid?rect.y+rect.height*.6:height-field.cardHeight*.19+slot*slot*3+52});
 }
 function drop(card:BattleCard,x:number,y:number){setDrag(null);if(locked.current)return;const s=battleRef.current,d=cards[card.key];
  const target=enemyAt(x,y,field.enemies,s.enemies.filter(e=>e.hp>0).map(e=>e.id));
  const result=onScreen(x,y,width,height)?play(s,card.id,target):s;
  fly(card,x,y,result!==s,target);if(result===s)return;
  locked.current=true;setBusy(true);const next=++serial.current;
  const raw=d.damage+s.bonus+(s.relic==='ember'?2:0),victim=s.enemies.find(e=>e.id===target);
  const impact=d.damage&&victim?hitFeedback(raw,victim.block,victim.hp,card.key==='pierce'):null;
  const distance=target===undefined?0:field.enemies[target].x+field.enemies[target].width/2-(field.hero.x+field.hero.width/2)-field.enemies[target].width*.35;
  setCast({serial:next,key:card.key==='bulwark'?'veil':card.key==='spark'?'pierce':card.key==='riposte'?'cut':card.key,x:field.hero.x+field.hero.width/2,y:field.hero.y+field.hero.height*.6,toX:target===undefined?field.hero.x+field.hero.width/2:field.enemies[target].x+field.enemies[target].width/2,toY:target===undefined?field.hero.y+field.hero.height*.6:field.enemies[target].y+field.enemies[target].height*.5,size:field.hero.width});
  setMotions({hero:{serial:next,kind:d.damage?'attack':'guard',distance},enemies:s.enemies.map(e=>impact&&e.id===target?{serial:next,kind:'hit',distance:0,heavy:impact.damage>=5,brokeBlock:impact.brokeBlock}:null)});
  // Consume the card at contact, while HP and block use the beat-by-beat presentation.
  later(()=>{setFlight(null);if(impact&&victim){impact.sounds.forEach(effect);setHits({hero:null,enemies:s.enemies.map(e=>e.id===target?{serial:next,raw,perHit:raw,hp:victim.hp,block:victim.block,damage:impact.damage,absorbed:impact.absorbed}:null)});}else effect('guard');setBattle({...result,enemies:impact?s.enemies:result.enemies,status:impact?'playing':result.status});if(impact)rumbleHit(impact.damage,impact.brokeBlock);},245);
  const duration=Math.max(700,245+(impact?attackPresentation(raw,1).duration:0)+100);
  later(()=>{setBattle(result);setCast(null);setHits({hero:null,enemies:[null,null]});setMotions({hero:null,enemies:[null,null]});const killed=result.enemies.filter(e=>e.hp===0&&s.enemies[e.id].hp>0);killed.forEach(e=>characterAudio.play(enemyFlavor(step===2,e.id)));if(step===2&&newlyEnraged(s.enemies[0].hp,result.enemies[0].hp))characterAudio.play('rage');const breath=killed.length?Math.max(...killed.map(e=>deathDuration(enemyFlavor(step===2,e.id))))+250:0;later(()=>{setBusy(false);locked.current=false;},breath);},duration);
 }
 function finishTurn(){if(locked.current||drag||flight||battle.status!=='playing')return;locked.current=true;setBusy(true);setIntentId(null);const s=battle;
  let at=0,remainingBlock=s.block,remainingHp=s.hp;
  for(const e of s.enemies.filter(e=>e.hp>0)){
   if(remainingHp<=0)break;
   const move=intent(s,e.id),next=++serial.current,impact=move.damage?hitFeedback(move.damage,remainingBlock,remainingHp):null;
   const hit=impact?{serial:next,raw:move.damage,hp:remainingHp,block:remainingBlock,damage:impact.damage,absorbed:impact.absorbed}:null;
   if(impact){remainingBlock-=impact.absorbed;remainingHp-=impact.damage;}
   later(()=>setMotions({hero:impact?{serial:next,kind:impact.damage===0?'brace':'hit',distance:0,heavy:false,brokeBlock:impact.brokeBlock}:null,enemies:s.enemies.map(other=>other.id===e.id?{serial:next,kind:impact?'attack':'guard',distance:-(field.enemies[e.id].x+field.enemies[e.id].width/2-(field.hero.x+field.hero.width/2)-field.hero.width*.35)}:null)}),at);
   later(()=>{if(impact&&hit){attackAudio.play(move.damage);impact.sounds.filter(cue=>cue==='blocked'||cue==='break').forEach(effect);setHits({hero:hit,enemies:[null,null]});}else{effect('guard');setBattle(b=>({...b,enemies:b.enemies.map(other=>other.id===e.id?{...other,block:move.block}:other)}));}},at+245);
   if(hit)for(let beat=0;beat<move.damage;beat++){
    const absorbed=beat<hit.absorbed,damage=!absorbed&&beat-hit.absorbed<hit.damage?1:0;
    const breaks=hit.block>0&&hit.absorbed===hit.block&&beat===hit.absorbed-1;
    if(absorbed||damage)later(()=>rumbleHit(damage,breaks),at+245+beat*beatGap(move.damage));
   }
   at+=Math.max(720,245+(impact?attackDuration(move.damage):0)+120);
  }
  later(()=>{setBattle(endTurn(s));setHits({hero:null,enemies:[null,null]});setBusy(false);locked.current=false;setMotions({hero:null,enemies:[null,null]});},at);
 }
 const affordable=drag&&cards[drag.card.key].cost<=battle.energy;
 const dragTarget=affordable?cards[drag.card.key].target:null;
 const hovered=drag?enemyAt(drag.x,drag.y,field.enemies,battle.enemies.filter(e=>e.hp>0).map(e=>e.id)):undefined;
 const valid=!!drag&&!!affordable&&onScreen(drag.x,drag.y,width,height)&&(dragTarget!=='enemy'||hovered!==undefined);

 const cardScale=drag?1.12-.52*(drag.progress*drag.progress*(3-2*drag.progress)):1;
 const previewW=138,previewH=202;
 return <View style={styles.game}>
  <StatusBar hidden/><Music assetsReady={ready} enabled={sound} track={roomMusic(screen,step)} leaving={leaving}/>
  {ready&&screen==='fight'&&<>
  <Image source={picture('background')} contentFit="fill" style={StyleSheet.absoluteFill}/>
  <View pointerEvents="none" style={[StyleSheet.absoluteFill,{backgroundColor:'#061c2635'}]}/><Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill,{backgroundColor:'#061c2645',opacity:focusDim}]}/>
  <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}><Defs><LinearGradient id="quietTop" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#061c26" stopOpacity={.42}/><Stop offset="1" stopColor="#061c26" stopOpacity={0}/></LinearGradient><LinearGradient id="quietHand" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#061c26" stopOpacity={0}/><Stop offset="1" stopColor="#061c26" stopOpacity={.6}/></LinearGradient></Defs><Rect width={width} height={105} fill="url(#quietTop)"/><Rect y={height-105} width={width} height={105} fill="url(#quietHand)"/></Svg>
  <View style={{position:'absolute',left:field.hero.x,top:field.hero.y,zIndex:motions.hero?.kind==='attack'?5:1}}><Fighter hero victorious={battle.status==='won'} size={field.hero.width} motion={motions.hero} reduced={reduced} target={!!dragTarget&&dragTarget!=='enemy'} over={valid&&dragTarget!=='enemy'}/></View>
  <View style={{position:'absolute',left:field.hero.x+field.hero.width/2-55,top:Math.max(12,field.hero.y-73),zIndex:8}}><Health name="Iria" hp={battle.hp} max={HERO_HP} block={battle.block} bonus={battle.bonus} hit={hits.hero} reduced={reduced}/></View>
  {battle.enemies.map(e=>{const rect=field.enemies[e.id],move=intent(battle,e.id);return <React.Fragment key={e.id}>
   <View style={{position:'absolute',left:rect.x,top:rect.y,zIndex:motions.enemies[e.id]?.kind==='attack'?4:2}}><Fighter boss={step===2} flavor={enemyFlavor(step===2,e.id)} enraged={step===2&&e.hp>0&&e.hp<=36} prepareKey={`${battle.turn}-${move.damage}-${e.hp<=36}`} prepareGuard={!move.damage} size={rect.width} motion={motions.enemies[e.id]} offset={e.id*1300} reduced={reduced} dead={e.hp===0} target={dragTarget==='enemy'&&e.hp>0} over={valid&&hovered===e.id} strength={drag?Math.max(0,1-Math.hypot(drag.x-(rect.x+rect.width/2),drag.y-(rect.y+rect.height/2))/(rect.width*1.3)):0}/></View>
   {e.hp>0&&<><View style={{position:'absolute',left:rect.x+rect.width/2-55,top:Math.max(12,rect.y-76),zIndex:8}}><Health name={e.name} hp={e.hp} max={e.maxHp} block={e.block} enemy hit={hits.enemies[e.id]} reduced={reduced}/></View>
   <IntentButton revision={`${battle.turn}-${move.damage}`} reduced={reduced} accessibilityRole="button" accessibilityLabel={`${e.name}: ${move.damage?`${move.damage} hits for 1`:'defend'}`} hitSlop={8} onPress={()=>setIntentId(intentId===e.id?null:e.id)} style={[styles.intent,{left:rect.x+rect.width/2-27,top:rect.y-28}]}>{move.damage?<Text style={styles.intentText}>1×{move.damage}</Text>:<Icon name="shield" size={20}/>}</IntentButton>
   {intentId===e.id&&<Pressable onPress={()=>setIntentId(null)} style={[styles.intentNote,{left:Math.min(width-205,Math.max(12,rect.x+rect.width/2-95)),top:Math.max(8,rect.y-124)}]}><Text style={styles.noteText}>Enemy intends to {move.damage?'attack.':'defend.'}</Text></Pressable>}</>}
  </React.Fragment>;})}
  <Pressable accessibilityRole="button" accessibilityLabel="Game menu" onPress={()=>setMenu(true)} style={[styles.menuButton,{right:Math.max(12,insets.right)}]}><Icon name="menu" size={23}/></Pressable>
  <View style={[styles.energyPanel,{left:Math.max(12,insets.left)}]}><View style={styles.energyRow}><Icon name="bolt" size={21}/><Text style={styles.energy}>{battle.energy}</Text></View><View style={styles.piles}><Icon name="draw" size={14}/><Text style={styles.small}>{battle.deck.length}</Text><Text style={styles.small}> / {battle.discard.length}</Text></View></View>
  {battle.hand.map((card,index)=><HandCard key={`${battle.turn}-${card.id}`} card={card} lifted={drag?battle.hand.findIndex(c=>c.id===drag.card.id):-1} hidden={inspect?.id===card.id||drag?.card.id===card.id||flight?.card.id===card.id} reduced={reduced} index={index} count={battle.hand.length} width={field.cardWidth} height={field.cardHeight} center={field.handCenter} energy={battle.energy} disabled={busy||!!flight||battle.status!=='playing'} onInspect={setInspect} onDrag={(c,x,y,progress)=>setDrag({card:c,x,y,progress})} onDrop={drop} onCancel={()=>setDrag(null)}/>)}
  <Animated.View style={{position:'absolute',right:Math.max(14,insets.right),bottom:14,opacity:glow.interpolate({inputRange:[0,1],outputRange:[.75,1]}),transform:[{scale:glow.interpolate({inputRange:[0,1],outputRange:[1,1.04]})}],zIndex:15}}><Pressable accessibilityRole="button" onPress={finishTurn} disabled={busy||battle.status!=='playing'} style={[styles.endTurn,{opacity:busy?.4:1}]}><Text style={[styles.endText,battle.energy===0&&styles.endGlow]}>END TURN</Text><Icon name="back" size={17}/></Pressable></Animated.View>
  {drag&&<View pointerEvents="none" style={{position:'absolute',left:Math.max(8,Math.min(width-previewW-8,drag.x-previewW/2)),top:Math.max(8,Math.min(height-previewH-8,drag.y-previewH*.76)),width:previewW,height:previewH,transform:[{scale:cardScale},{rotate:`${dragTarget==='enemy'&&hovered!==undefined?Math.max(-12,Math.min(12,(field.enemies[hovered].x+field.enemies[hovered].width/2-drag.x)*.08)):0}deg`},{translateX:valid&&hovered!==undefined?Math.max(-12,Math.min(12,(field.enemies[hovered].x+field.enemies[hovered].width/2-drag.x)*.12)):0}],zIndex:50,opacity:affordable?1:.6}}><View style={{borderRadius:9,borderWidth:2,borderColor:valid?'#a3ffdd':gold}}><CardFace card={drag.card} width={previewW} height={previewH} large/></View></View>}
  {cast&&<CardEffect cast={cast} reduced={reduced}/>}
  {flight&&<CardFlight flight={flight} reduced={reduced} onDone={()=>{if(!flight.valid)setFlight(null);}}/>}
  </>}
  {screen==='title'&&<Title ready={ready} error={loadError} onStart={()=>travel(()=>setScreen('map'))} onRetry={load} reduced={reduced}/>}
  {screen==='map'&&<MapScreen step={step} hp={battle.hp} relic={relic} onEnter={enter} reduced={reduced}/>}
  {screen==='reward'&&<CardReward width={width} height={height} reduced={reduced} onChoose={takeCard}/>}
  {screen==='bonus'&&<BonusRoom hp={battle.hp} onChoose={reward} reduced={reduced}/>}
  {screen==='finale'&&<Finale hp={battle.hp} turns={turns} onAgain={reset} reduced={reduced}/>}
  {inspect&&<CardInspector card={inspect} width={width} height={height} originX={field.handCenter+(battle.hand.findIndex(c=>c.id===inspect.id)-(battle.hand.length-1)/2)*field.cardWidth*.76} originY={height-field.cardHeight*.15} reduced={reduced} onClose={()=>setInspect(null)}/>}
  <Modal visible={menu||help} transparent animationType="fade" supportedOrientations={['landscape','landscape-left','landscape-right']} onRequestClose={()=>{setMenu(false);setHelp(false);}} statusBarTranslucent navigationBarTranslucent><View style={styles.modalBackdrop}><Pressable style={StyleSheet.absoluteFill} onPress={()=>{setMenu(false);setHelp(false);}}/>{help?<View style={styles.help}><ScrollView><Text style={styles.dialogTitle}>How to play</Text><Text style={styles.helpText}>Tap a card to inspect. Hide or swipe to close.{"\n\n"}Drag attacks onto a living enemy. Drag block spells anywhere to cast.{"\n\n"}Tap an intent for a hint. Block clears each turn. You get 3 energy and draw 5 cards; the discard pile restocks your deck.</Text></ScrollView><Pressable style={styles.hide} onPress={()=>setHelp(false)}><Text style={styles.buttonText}>Close</Text></Pressable></View>:<View style={[styles.menuPanel,{right:Math.max(12,insets.right)}]}><Pressable accessibilityRole="switch" accessibilityState={{checked:sound}} style={styles.menuItem} onPress={()=>setSound(!sound)}><Text style={styles.buttonText}>Sound</Text><Text style={styles.small}>{sound?'On':'Off'}</Text></Pressable><Pressable style={styles.menuItem} onPress={reset}><Text style={styles.buttonText}>Restart</Text></Pressable><Pressable style={styles.menuItem} onPress={()=>{setMenu(false);setHelp(true);}}><Text style={styles.buttonText}>How to play</Text></Pressable><Pressable style={styles.menuItem} onPress={()=>setMenu(false)}><Text style={styles.buttonText}>Close</Text></Pressable></View>}</View></Modal>
  {screen==='fight'&&battle.status!=='playing'&&!busy&&<View style={styles.result}><Text style={styles.dialogTitle}>{battle.status==='won'?'The road opens.':'Even glass remembers.'}</Text><Text style={styles.helpText}>{battle.status==='won'?`${battle.turn} turns · ${battle.hp} health`:'Another chance awaits.'}</Text><Pressable style={styles.hide} onPress={battle.status==='won'?advance:reset}><Text style={styles.buttonText}>{battle.status==='won'?(step===2?'Ring the final bell':'Continue'):'Try again'}</Text></Pressable></View>}
 {cover&&<Animated.View style={[StyleSheet.absoluteFill,{backgroundColor:'#05161f',opacity:curtain,zIndex:1000}]} />}
 </View>;
}
export default function App(){return <SafeAreaProvider><Game/></SafeAreaProvider>;}
const styles=StyleSheet.create({
 game:{flex:1,backgroundColor:'#081e24',overflow:'hidden'},stats:{width:110,alignItems:'center'},actorName:{color:'#f5e5c5',fontSize:12,fontWeight:'600',marginBottom:4,textShadowColor:'#061823',textShadowRadius:3,textShadowOffset:{width:0,height:1}},health:{width:110,height:17,backgroundColor:'#10232d',borderWidth:1,borderColor:'#d7ba7e',borderRadius:3,overflow:'hidden'},healthText:{fontSize:12,fontWeight:'800',color:'#fff4de',textAlign:'center',lineHeight:15},statusLine:{height:20,flexDirection:'row',alignItems:'center',gap:4},small:{fontSize:12,color:'#e0d5b9'},intent:{position:'absolute',width:54,height:30,borderWidth:1,borderColor:'#d4b87b',backgroundColor:'#102b30e8',borderRadius:9,alignItems:'center',justifyContent:'center',zIndex:9},intentText:{color:gold,fontSize:17,fontWeight:'800'},intentNote:{position:'absolute',width:190,padding:10,borderWidth:1,borderColor:'#d1b679',backgroundColor:'#102b30',borderRadius:6,zIndex:30},noteText:{fontSize:13,color:'#f5e5c5',textAlign:'center'},menuButton:{position:'absolute',top:10,width:44,height:40,borderWidth:1,borderColor:'#9a895788',backgroundColor:'#102b30d9',borderRadius:8,alignItems:'center',justifyContent:'center',zIndex:20},energyPanel:{position:'absolute',bottom:20,zIndex:16},energyRow:{flexDirection:'row',alignItems:'center',gap:3},energy:{fontSize:34,color:gold,fontWeight:'700'},piles:{flexDirection:'row',alignItems:'center',gap:3},endTurn:{minWidth:132,minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6},endText:{fontSize:18,fontWeight:'900',color:gold,letterSpacing:.5},endGlow:{color:'#fff1bc',textShadowColor:'#ffc956',textShadowRadius:12,textShadowOffset:{width:0,height:0}},modalBackdrop:{flex:1,backgroundColor:'#04161bc9',alignItems:'center',justifyContent:'center'},hide:{minHeight:40,paddingVertical:9,paddingHorizontal:28,backgroundColor:'#173840',borderWidth:1,borderColor:'#ba9f63',borderRadius:18,marginTop:10,alignItems:'center',justifyContent:'center'},buttonText:{fontSize:16,color:'#f3e6c9',fontWeight:'600'},menuPanel:{position:'absolute',top:14,width:195,backgroundColor:'#102b30',borderWidth:1,borderColor:'#af955c',borderRadius:8,padding:6},menuItem:{height:48,paddingHorizontal:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},help:{width:'70%',maxWidth:560,maxHeight:'85%',backgroundColor:'#102b30',padding:22,borderRadius:12,borderWidth:1,borderColor:'#af955c'},dialogTitle:{fontSize:27,color:'#f2deb8',fontWeight:'700',textAlign:'center',marginBottom:12},helpText:{fontSize:15,lineHeight:22,color:'#e2ddca',textAlign:'center'},result:{position:'absolute',top:22,right:60,width:300,padding:15,borderRadius:12,borderWidth:1,borderColor:'#bda17166',backgroundColor:'#061a24bd',alignItems:'center',justifyContent:'center',zIndex:60}
});
