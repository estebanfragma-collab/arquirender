import {FFmpeg} from '@ffmpeg/ffmpeg';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';

export function fusionArgs(format:string,duration:number){
 const [w,h]=format==='9:16'?[720,1280]:format==='1:1'?[720,720]:[1280,720];
 const fade=1.5,offset=(duration-fade)/2;
 const normal=`scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,format=yuv420p,settb=AVTB`;
 return ['-loop','1','-i','start','-loop','1','-i','end','-filter_complex_threads','1','-filter_complex',`[0:v]${normal}[a];[1:v]${normal}[b];[a][b]xfade=transition=fade:duration=${fade}:offset=${offset},format=yuv420p[v]`,'-map','[v]','-t',String(duration),'-an','-c:v','libx264','-preset','ultrafast','-crf','20','-threads','1','-movflags','+faststart','fusion.mp4'];
}
export async function createFusion(start:string,end:string,format:string,duration:number,signal:AbortSignal,status:(s:string)=>void){
 const ff=new FFmpeg();const abort=()=>ff.terminate();signal.addEventListener('abort',abort);
 try{
  if(signal.aborted)throw Error('Cancelado.');
  status('Preparando la fusión…');await ff.load({coreURL,wasmURL});
  for(const [name,url] of [['start',start],['end',end]]){
   const response=await fetch(url,{signal});if(!response.ok)throw Error('No se pudo abrir una imagen. Vuelve a seleccionarla.');
   const blob=await response.blob();if(blob.size>20*1024*1024)throw Error('La imagen supera los 20 MB.');
   await ff.writeFile(name,new Uint8Array(await blob.arrayBuffer()));
  }
  status('Creando el fundido suave…');
  if(await ff.exec(fusionArgs(format,duration))!==0)throw Error('No se pudo crear la fusión. Reintenta.');
  const bytes=await ff.readFile('fusion.mp4');if(typeof bytes==='string')throw Error('No se pudo leer el video.');
  return new Blob([new Uint8Array(bytes)],{type:'video/mp4'});
 }finally{signal.removeEventListener('abort',abort);ff.terminate();}
}
