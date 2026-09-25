import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {saveFusion} from './fusion-cloud';
import type {Scene,RenderAsset} from './model';

export default function Fusion({scene,assets,panel}:{scene:Scene;assets:RenderAsset[];panel:HTMLElement|null}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[result,setResult]=useState<{url:string;name:string;blob:Blob;id:string;duration:number}|null>(null);
 const [saved,setSaved]=useState(false),[saving,setSaving]=useState(false);
 const savingLock=useRef(false);
 async function persist(item:NonNullable<typeof result>){
  if(savingLock.current)return;savingLock.current=true;setSaving(true);
  try{await saveFusion(item.blob,item.id,item.name,item.duration);setSaved(true);setMessage('Fusión guardada en Tus generaciones.');window.dispatchEvent(new Event('arqui-fusion-saved'));}
  catch(e){setMessage(e instanceof Error?e.message:'No se pudo guardar. Descarga el MP4 para conservarlo.');}
  finally{savingLock.current=false;setSaving(false);}
 }
 const title=scene.presetId==='render-transition'?'Fusión entre dos renders':'Fusión hacia vista general';
 const preview=useRef<HTMLElement|null>(null);
 const showResult=()=>preview.current?.scrollIntoView({behavior:'smooth',block:'start'});
 useEffect(()=>{if(result&&panel)preview.current?.scrollIntoView({behavior:'smooth',block:'start'});},[result,panel]);
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
   const item={url:url.current,name:title,blob,id:crypto.randomUUID(),duration:scene.duration};setResult(item);setSaved(false);setMessage('Fusión lista. Guardando en tu cuenta…');await persist(item);
  }catch(e){if(!task.signal.aborted)setMessage(e instanceof Error?e.message:'No se pudo crear el video.');}
  finally{if(!task.signal.aborted){setBusy(false);controller.current=null;}}
 }
 return <section className="vs-generation"><h3>Fusión controlada</h3><p>La primera imagen se desvanece mientras aparece la segunda durante 1,5 segundos. Se conservan las dos imágenes, sin movimiento de dron ni cambios generados por IA.</p><small>MP4 · sin audio · sin costo de generación. El video se crea en tu dispositivo y se guarda en Tus generaciones.</small>
 <div className="vs-generate-dock"><div className="vs-take-summary"><strong>{title}</strong><small>2 imágenes · {scene.duration} segundos · {scene.format} · sin costo</small></div><button className="vs-primary" disabled={busy||saving||!start||!end||start.id===end.id} onClick={generate}>{busy?'Creando fusión…':'Crear fusión suave · sin costo'}</button>{(!start||!end)&&<small>Selecciona las imágenes inicial y final.</small>}<p role="status">{message}</p>{result&&<div className="vs-fusion-actions"><button onClick={showResult}>Ver fusión</button><a href={result.url} download="fusion-suave.mp4">Descargar MP4</a></div>}{result&&!saved&&<button disabled={saving||busy} onClick={()=>persist(result)}>{saving?'Guardando…':'Reintentar guardar en mi cuenta'}</button>}</div>
 {panel&&result&&createPortal(<article ref={preview} className="vs-local-fusion" aria-label="Tu nueva fusión"><span className="vs-eyebrow">TU NUEVA FUSIÓN · LISTA</span><h3>{result.name}</h3><p>Fundido controlado · creado en este dispositivo</p><video controls src={result.url} playsInline/><a href={result.url} download="fusion-suave.mp4">Descargar fusión MP4</a><small>{saved?'Guardada en tu cuenta · también disponible en Tus generaciones.':'Aún no está guardada en tu cuenta. Descarga el archivo o reintenta guardar.'}</small></article>,panel)}
 </section>;
}
