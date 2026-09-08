import {AppState} from 'react-native';
import * as Haptics from 'expo-haptics';

/** One tactile contact per strike; armor fractures have a sharper edge. */
export function rumbleHit(damage:number,brokeBlock=false){
 if(AppState.currentState!=='active')return;
 const style=brokeBlock?Haptics.ImpactFeedbackStyle.Rigid:damage>=5?Haptics.ImpactFeedbackStyle.Heavy:damage>0?Haptics.ImpactFeedbackStyle.Light:Haptics.ImpactFeedbackStyle.Soft;
 void Haptics.impactAsync(style).catch(()=>{});
}
