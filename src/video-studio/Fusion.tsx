import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {Scene,RenderAsset} from './model';

export default function Fusion({scene,assets,panel}:{scene:Scene;assets:RenderAsset[];panel:HTMLElement|null}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[result,setResult]=useState<{url:string;name:string}|null>(null);
 const title=scene.presetId==='render-transition'?'Fusión entre dos renders':'Fusión hacia vista general';
 const controller=useRef<AbortController|null>(null),url=useRef('');
 const start=assets.find(a=>a.id===scene.startId),end=assets.find(a=>a.id===scene.endId);
 useEffect(()=>()=>{controller.current?.abort();if(url.current)URL.revokeObjectURL(url.current);},[]);
 async function generate(){
  if(controller.current||!start||!end)return;
  const task=new AbortController();controller.current=task;setBusy(true);setMessage('Preparando…');
  try{
   const {createFusion}=await import('./fusion-export');
   const blob=await createFusion(start.src,end.src,scene.format,scene.duration,task.signal,setMessage);
   if(task.signal.aborted)return;
   if(url.current)URL.revokeObjectURL(url.current);url.current=URL.createObjectURL(blob);
   setResult({url:url.current,name:title});setMessage('Fusión lista. Descárgala para conservarla o añadirla en Edición.');
  }catch(e){if(!task.signal.aborted)setMessage(e instanceof Error?e.message:'No se pudo crear el video.');}
  finally{if(!task.signal.aborted){setBusy(false);controller.current=null;}}
 }
 return <section className="vs-generation"><h3>Fusión controlada</h3><p>La primera imagen se desvanece mientras aparece la segunda durante 1,5 segundos. Se conservan las dos imágenes, sin movimiento de dron ni cambios generados por IA.</p><small>MP4 · sin audio · sin costo de generación. El video se crea en tu dispositivo. Descárgalo antes de cerrar.</small>
 <div className="vs-generate-dock"><div className="vs-take-summary"><strong>{title}</strong><small>2 imágenes · {scene.duration} segundos · {scene.format} · sin costo</small></div><button className="vs-primary" disabled={busy||!start||!end||start.id===end.id} onClick={generate}>{busy?'Creando fusión…':'Crear fusión suave · sin costo'}</button>{(!start||!end)&&<small>Selecciona las imágenes inicial y final.</small>}<p role="status">{message}</p></div>
 {panel&&result&&createPortal(<article className="vs-local-fusion"><h3>{result.name}</h3><p>Fundido controlado · creado en este dispositivo</p><video controls src={result.url} playsInline/><a href={result.url} download="fusion-suave.mp4">Descargar fusión MP4</a><small>Descarga el archivo y añádelo en Edición. No se guarda en el historial de generaciones.</small></article>,panel)}
 </section>;
}
