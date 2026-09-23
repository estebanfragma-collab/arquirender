import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Scene } from './model';
type Job={model:string;duration:number;id:string;sceneId:string;name:string;state:string;estimatedUsd:number;url:string|null;expiresAt:string};
async function request(body:unknown){
 const {data,error}=await supabase.functions.invoke('video-clips',{body,signal:AbortSignal.timeout(90000)});
 if(error){let message='No se pudo completar la operación. Consulta tus clips antes de volver a generar.';try{const result=await error.context?.json();if(result?.error)message=result.error;}catch{}throw new Error(message);}return data;
}
const pending=(j:Job)=>['queued','in_progress'].includes(j.state)||j.state==='completed'&&!j.url;
const labels:Record<string,string>={submitting:'Enviando · consulta el estado antes de repetir',queued:'En cola',in_progress:'Generando tu clip…',completed:'Clip listo',failed:'El proveedor rechazó la toma. Revisa el saldo o la escena.',nsfw:'El proveedor no aceptó esta escena.',canceled:'Cancelado',unknown:'Envío por confirmar. No repitas la generación; revisaremos esta toma.'};
export default function Clips({scene,blocked}:{scene:Scene;blocked:boolean}){
 const [jobs,setJobs]=useState<Job[]>([]),[quote,setQuote]=useState<{job:Job;basis:string}|null>(null);
 const [engine,setEngine]=useState('dop');
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const lock=useRef(false),mounted=useRef(true);
 const signature=JSON.stringify({scene,engine});
 const latest=useRef(signature);latest.current=signature;
 const merge=(job:Job)=>setJobs(js=>[job,...js.filter(j=>j.id!==job.id)]);
 useEffect(()=>{mounted.current=true;request({action:'list'}).then(d=>{if(mounted.current)setJobs(d.jobs||[]);}).catch(e=>{if(mounted.current)setMessage(e.message);});return()=>{mounted.current=false;};},[]);
 useEffect(()=>{setQuote(null);},[signature]);
 useEffect(()=>{
  if(!jobs.some(pending))return;
  let alive=true;const timer=setTimeout(async()=>{try{for(const job of jobs.filter(pending)){const d=await request({action:'status',id:job.id});if(alive){merge(d.job);setMessage('');}}}catch(e){if(alive){setMessage((e as Error).message);setJobs(js=>[...js]);}}},12000);
  return()=>{alive=false;clearTimeout(timer);};
 },[jobs]);
 async function run(action:'quote'|'start'|'refresh'){
  if(lock.current)return;lock.current=true;setBusy(true);setMessage('');
  try{
   if(action==='quote'){const s=signature;const d=await request({action,scene,engine});if(latest.current===s)setQuote({job:d.job,basis:s});}
   else if(action==='start'&&quote&&quote.basis===signature){const id=quote.job.id;setQuote(null);const d=await request({action,id});merge(d.job);}
   else if(action==='refresh'){const d=await request({action:'list'});setJobs(d.jobs||[]);for(const j of d.jobs||[]){if(pending(j)){const result=await request({action:'status',id:j.id});merge(result.job);}}}
  }catch(e){setMessage((e as Error).message);if(action==='start'){try{const d=await request({action:'list'});setJobs(d.jobs||[]);}catch{}}}
  finally{lock.current=false;if(mounted.current)setBusy(false);}
 }
 const active=jobs.some(j=>['submitting','queued','in_progress','unknown'].includes(j.state));
 return <section className="vs-generation"><span className="vs-eyebrow">GENERA TU CLIP · PRUEBA PRIVADA</span><h3>Del render al movimiento.</h3><p>Prueba económica · sin audio. El costo se consulta antes de generar.</p><small>En esta prueba, el clip puede conservar la proporción de la imagen original.</small>
 <label>Modelo de la prueba<select value={engine} disabled={busy} onChange={e=>setEngine(e.target.value)}><option value="dop">DoP Lite · económico · 5 segundos</option><option value="minimax">MiniMax Hailuo 2.3 · estándar</option></select></label><small>{engine==='minimax'?'Una imagen inicial. La opción de 5 s genera un clip de 6 s en MiniMax.':'DoP genera tomas de 5 segundos. Consulta el precio antes de cada toma.'}</small>
 <button disabled={busy||blocked||!scene.prompt.trim()||active} onClick={()=>run('quote')}>{busy?'Consultando…':'Consultar costo de esta toma'}</button>
 {quote&&quote.basis===signature&&<div className="vs-clip-quote"><p><strong>USD {quote.job.estimatedUsd.toFixed(3)}</strong> por esta toma de {quote.job.duration} segundos.</p><button className="vs-primary" disabled={busy||active} onClick={()=>run('start')}>Generar clip · USD {quote.job.estimatedUsd.toFixed(3)}</button><small>Al generar, envías las imágenes y el prompt a Higgsfield. Cotización válida durante 10 minutos.</small></div>}
 <small>Prueba limitada a USD 1 en total. Se utiliza el saldo de video; no los créditos de renders.</small>
 {message&&<p role="status" className="vs-warning">{message}</p>}
 {jobs.length>0&&<div className="vs-clips"><h4>Tus últimas tomas</h4>{jobs.map(j=><article key={j.id}><strong>{j.name}</strong><small>{j.model?.includes('minimax')?'MiniMax':j.model?.includes('dop')?'DoP Lite':'Prueba anterior · Kling'} · {j.duration}s</small><p>{j.state==='completed'&&!j.url?'Generado · pendiente de guardar':labels[j.state]||j.state}</p>{j.url?<><video src={j.url} controls preload="none" playsInline/><a href={j.url} target="_blank" rel="noreferrer">Abrir / descargar clip</a></>:null}<small>Costo estimado: USD {j.estimatedUsd.toFixed(3)}</small></article>)}</div>}
 <button disabled={busy} onClick={()=>run('refresh')}>Actualizar mis clips</button>
 </section>;
}
