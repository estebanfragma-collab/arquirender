import {useEffect,useState} from 'react';

// Decode a small set of real frames, one at a time; never load a player per tile.
export function Filmstrip({src,start,end}:{src:string;start:number;end:number}){
 const [frames,setFrames]=useState<string[]>([]);
 useEffect(()=>{
  let cancelled=false;
  const video=document.createElement('video'),canvas=document.createElement('canvas');
  video.muted=true;video.preload='auto';video.src=src;canvas.width=120;canvas.height=72;
  const ctx=canvas.getContext('2d');let index=0;const images:string[]=[];
  const seek=()=>{video.currentTime=Math.min(end-.02,Math.max(0,start+(end-start)*(index+.1)/6));};
  video.onloadedmetadata=seek;
  video.onseeked=()=>{if(cancelled||!ctx)return;try{const scale=Math.max(120/video.videoWidth,72/video.videoHeight),w=video.videoWidth*scale,h=video.videoHeight*scale;ctx.drawImage(video,(120-w)/2,(72-h)/2,w,h);images.push(canvas.toDataURL('image/jpeg',.65));setFrames([...images]);index++;if(index<6)seek();}catch{}};
  return()=>{cancelled=true;video.onloadedmetadata=null;video.onseeked=null;video.removeAttribute('src');video.load();};
 },[src,start,end]);
 return <span className="ve-filmstrip" aria-hidden="true">{frames.map((frame,i)=><img key={i} src={frame} alt=""/>)}</span>;
}
