import {FFmpeg} from '@ffmpeg/ffmpeg';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';
import {dimensions,duration,totalDuration,validate,type Edit,type Media} from './model';
export async function exportMontage(edit:Edit,media:Media[],status:(s:string)=>void,signal:AbortSignal){
 validate(edit,media);
 if(signal.aborted)throw Error('Exportación cancelada.');
 const ff=new FFmpeg();const abort=()=>ff.terminate();signal.addEventListener('abort',abort);
 const exec=async(args:string[])=>{if(signal.aborted)throw Error('Exportación cancelada.');if(await ff.exec(args)!==0)throw Error('No se pudo procesar un archivo. Prueba con videos MP4 (H.264) y música MP3.');};
 try{
  status('Preparando el exportador… La primera vez se descarga el motor de video.');
  await ff.load({coreURL,wasmURL});
  const [w,h]=dimensions(edit),parts:string[]=[];
  for(let i=0;i<edit.clips.length;i++){
   if(signal.aborted)throw Error('Exportación cancelada.');
   const clip=edit.clips[i],asset=media.find(m=>m.id===clip.mediaId)!;
   status(`Exportando fragmento ${i+1} de ${edit.clips.length}…`);
   await ff.writeFile('source',new Uint8Array(await asset.file.arrayBuffer()));
   const out=`part${i}.mp4`;
   await exec(['-ss',String(clip.start),'-i','source','-t',String(duration(clip)),'-map','0:v:0','-an','-vf',`setpts=(PTS-STARTPTS)/${clip.speed},scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30`,'-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p','-threads','1',out]);
   await ff.deleteFile('source');parts.push(out);
  }
  status('Uniendo los fragmentos…');
  await ff.writeFile('list.txt',parts.map(p=>`file '${p}'`).join('\n'));
  await exec(['-f','concat','-safe','0','-i','list.txt','-c','copy','-movflags','+faststart','joined.mp4']);
  for(const part of parts)await ff.deleteFile(part);
  let output='joined.mp4';
  if(edit.music){
   status('Añadiendo la música…');await ff.writeFile('music',new Uint8Array(await edit.music.file.arrayBuffer()));
   await exec(['-i','joined.mp4','-ss',String(edit.musicStart),'-i','music','-map','0:v:0','-map','1:a:0','-af',`asetpts=PTS-STARTPTS,volume=${edit.volume},apad`,'-t',String(totalDuration(edit.clips)),'-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart','final.mp4']);output='final.mp4';
  }
  const bytes=await ff.readFile(output);if(typeof bytes==='string')throw Error('No se pudo leer el video exportado.');
  return new Blob([new Uint8Array(bytes)],{type:'video/mp4'});
 }finally{signal.removeEventListener('abort',abort);ff.terminate();}
}
