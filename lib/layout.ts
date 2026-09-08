export type Rect={x:number,y:number,width:number,height:number};
export function layout(width:number,height:number,leftInset=0,rightInset=0){
 const usable=width-leftInset-rightInset,ground=height*.84;
 const size=Math.min(height*.49,usable*.235);
 const hero={x:leftInset+usable*.2-size/2,y:ground-size,width:size,height:size};
 const enemies=[.60,.83].map((center,i)=>{const side=size*(i? .88:.96);return {x:leftInset+usable*center-side/2,y:ground-side,width:side,height:side};});
 const cardWidth=Math.min(90,Math.max(66,usable*.10));
 return {width,height,hero,enemies,cardWidth,cardHeight:cardWidth*1.48,handCenter:leftInset+usable*.32,ground};
}
export function enemyAt(x:number,y:number,rects:Rect[],living:number[]){return living.find(id=>{const r=rects[id];return r&&x>=r.x-8&&x<=r.x+r.width+8&&y>=r.y-8&&y<=r.y+r.height+8;});}
export function onScreen(x:number,y:number,width:number,height:number){return x>=0&&y>=0&&x<=width&&y<=height;}
