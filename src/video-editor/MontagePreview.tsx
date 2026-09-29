import {useEffect,useRef,useState} from 'react';
import {timeline,locate,blendProgress,type Clip} from './model';

// Keep clip decoders keyed across junctions: an outgoing video must never reload
// just because the next clip became the primary timeline position.
export function MontagePreview({clips,cursor,playing,source,onReady,onError,width,height}:{clips:Clip[];cursor:number;playing:boolean;source:(id:string)=>string;onReady:(ready:boolean)=>void;onError:()=>void;width:number;height:number}){
 const buffer=useRef<HTMLCanvasElement|null>(null);
 const canvas=useRef<HTMLCanvasElement>(null),videos=useRef(new Map<string,HTMLVideoElement>());
 const [generation,refresh]=useState(0);
 const rows=timeline(clips),index=locate(clips,cursor)?.index??0;
 const nearby=rows.slice(Math.max(0,index-1),index+2);
 useEffect(()=>{
  const visible=rows.filter(r=>cursor>=r.start&&cursor<r.end);
  if(!visible.length&&rows.length)visible.push(rows[rows.length-1]);
  let ready=true;
  for(const r of nearby){
   const v=videos.current.get(r.clip.id);if(!v){ready=false;continue;}
   const target=Math.min(r.clip.end-.001,r.clip.start+Math.max(0,Math.min(r.end-r.start,cursor-r.start))*r.clip.speed);
   const showing=visible.includes(r);
   v.playbackRate=r.clip.speed;
   if(v.readyState>=1&&!v.seeking&&Math.abs(v.currentTime-target)>(playing&&showing ? .25 : .015))v.currentTime=target;
   if(showing&&(v.readyState<2||v.seeking))ready=false;
   if(playing&&showing&&v.readyState>=2&&!v.seeking){if(v.paused)void v.play().catch(onError);}else v.pause();
  }
  onReady(ready);
  if(!ready)return; // Retain the last complete composition during decoder waits.
  const ctx=canvas.current?.getContext('2d');if(!ctx)return;
  ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);
  const layer=buffer.current||(buffer.current=document.createElement('canvas'));if(layer.width!==width)layer.width=width;if(layer.height!==height)layer.height=height;const layerCtx=layer.getContext('2d')!;
  visible.forEach((r,i)=>{
   const v=videos.current.get(r.clip.id)!;
   if(!v.videoWidth||!v.videoHeight)return;
   const previous=visible[i-1];
   ctx.globalAlpha=previous?blendProgress((cursor-r.start)/previous.overlap,previous.clip.transitionKind):1;
   // Opaque letterboxing for each layer gives the same result as FFmpeg pad+xfade.
   layerCtx.fillStyle='#000';layerCtx.fillRect(0,0,width,height);
   const scale=Math.min(width/v.videoWidth,height/v.videoHeight),w=v.videoWidth*scale,h=v.videoHeight*scale;
   layerCtx.drawImage(v,(width-w)/2,(height-h)/2,w,h);ctx.drawImage(layer,0,0);
  });
  ctx.globalAlpha=1;
 },[clips,cursor,playing,generation,width,height]);
 useEffect(()=>()=>onReady(false),[]);
 return <><canvas ref={canvas} width={width} height={height} aria-label="Vista previa del montaje" style={{width:'100%',height:'100%',objectFit:'contain'}}/>{nearby.map(r=><video key={r.clip.id} ref={v=>{if(v)videos.current.set(r.clip.id,v);else videos.current.delete(r.clip.id);}} src={source(r.clip.mediaId)} preload="auto" muted playsInline style={{position:'absolute',width:1,height:1,opacity:0,pointerEvents:'none'}} onCanPlay={()=>refresh(n=>n+1)} onLoadedData={()=>refresh(n=>n+1)} onSeeked={()=>refresh(n=>n+1)} onError={onError}/>)}</>;
}
