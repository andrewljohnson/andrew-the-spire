import {Asset} from 'expo-asset';
import {Directory,File,Paths} from 'expo-file-system';
import {Image,ImageRef} from 'expo-image';
export const assets={
 musicTitle:require('../assets/audio/room-title.wav'),
 musicMap:require('../assets/audio/room-map.wav'),
 musicCrossing:require('../assets/audio/room-crossing.wav'),
 musicReward:require('../assets/audio/room-reward.wav'),
 musicWell:require('../assets/audio/room-well.wav'),
 musicBoss:require('../assets/audio/room-boss.wav'),
 musicVictory:require('../assets/audio/room-victory.wav'),

 deathRoad:require('../assets/audio/death-road.wav'),deathDune:require('../assets/audio/death-dune.wav'),deathBoss:require('../assets/audio/death-boss.wav'),rage:require('../assets/audio/rage-bow.wav'),
 tat1:require('../assets/audio/tats-1.wav'),
 tat2:require('../assets/audio/tats-2.wav'),
 tat3:require('../assets/audio/tats-3.wav'),
 tat4:require('../assets/audio/tats-4.wav'),
 tat5:require('../assets/audio/tats-5.wav'),
 tat6:require('../assets/audio/tats-6.wav'),
 tat7:require('../assets/audio/tats-7.wav'),
 tat8:require('../assets/audio/tats-8.wav'),
 tat9:require('../assets/audio/tats-9.wav'),
 tat10:require('../assets/audio/tats-10.wav'),
 tat11:require('../assets/audio/tats-11.wav'),
 tat12:require('../assets/audio/tats-12.wav'),
 tat13:require('../assets/audio/tats-13.wav'),
 tat14:require('../assets/audio/tats-14.wav'),
 tat15:require('../assets/audio/tats-15.wav'),
 tat16:require('../assets/audio/tats-16.wav'),
 tat17:require('../assets/audio/tats-17.wav'),
 tat18:require('../assets/audio/tats-18.wav'),
 tat19:require('../assets/audio/tats-19.wav'),
 tat20:require('../assets/audio/tats-20.wav'),
 tat21:require('../assets/audio/tats-21.wav'),

 background:require('../assets/art/desert-chunky.png'),hero:require('../assets/art/hero-surreal.png'),grimace:require('../assets/art/hero-surreal-grimace.png'),enemy:require('../assets/art/sentry-chunky.png'),boss:require('../assets/art/bellkeeper-chunky.png'),cards:require('../assets/art/card-icons.png'),
 light:require('../assets/audio/hit-light.wav'),heavy:require('../assets/audio/hit-heavy.wav'),blocked:require('../assets/audio/hit-blocked.wav'),break:require('../assets/audio/hit-break.wav'),guard:require('../assets/audio/guard.wav'),
};
type Key=keyof typeof assets;
const saved:Partial<Record<Key,string>>={},decoded:Partial<Record<Key,ImageRef>>={};
export function source(key:Key){return saved[key]?{uri:saved[key]}:assets[key];}
export function picture(key:Key){return decoded[key]??source(key);}
let pending:Promise<void>|undefined;
export function prepareAssets(){return pending??=prepare().catch(e=>{pending=undefined;throw e;});}
async function prepare(){
 const dir=new Directory(Paths.document,'spire-assets');dir.create({idempotent:true,intermediates:true});
 await Promise.all((Object.keys(assets) as Key[]).map(async key=>{
  const asset=Asset.fromModule(assets[key]);
  const file=new File(dir,`${key}-${asset.hash??'v1'}.${asset.type}`);
  if(!file.exists||file.size===0){await asset.downloadAsync();if(!asset.localUri)throw new Error('Asset unavailable');if(file.exists)file.delete();new File(asset.localUri).copy(file);}
  saved[key]=file.uri;
  if(['background','hero','grimace','enemy','boss','cards'].includes(key))decoded[key]=await Image.loadAsync(file.uri);
 }));
}
