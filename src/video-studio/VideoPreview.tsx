import {useEffect,useRef,useState} from 'react';

/** Load a real opening frame only when this saved take approaches the viewport. */
export default function VideoPreview({src,name,thumbnail=false}:{src:string;name:string;thumbnail?:boolean}) {
 const host=useRef<HTMLDivElement>(null);
 const [visible,setVisible]=useState(false);
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{setReady(false);setFailed(false);},[src]);
 useEffect(()=>{
  if(!host.current)return;
  if(typeof IntersectionObserver==='undefined'){setVisible(true);return;}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}
  },{rootMargin:'100px'});
  observer.observe(host.current);
  return()=>observer.disconnect();
 },[]);
 return <div ref={host} className={thumbnail?"vs-video-preview ve-saved-thumbnail":"vs-video-preview"}>
  <video src={visible?src:undefined} controls={!thumbnail} muted={thumbnail} playsInline preload={visible?'metadata':'none'} aria-label={`${thumbnail?'Miniatura de':'Reproducir'} ${name}`}
   onLoadedMetadata={e=>{
    const video=e.currentTarget;
    if(video.paused&&video.currentTime===0&&Number.isFinite(video.duration)&&video.duration>0)
     video.currentTime=Math.min(0.1,video.duration/2);
   }}
   onLoadedData={()=>setReady(true)} onSeeked={()=>setReady(true)} onPlaying={()=>setReady(true)} onError={()=>setFailed(true)}/>
  {!ready&&<span className="vs-video-preview-status">{failed?(thumbnail?'Vista no disponible':'No se pudo cargar la vista previa. Actualiza tus clips.'):visible?(thumbnail?'Cargando…':'Cargando vista previa…'):'Vista previa al acercarte'}</span>}
 </div>;
}
