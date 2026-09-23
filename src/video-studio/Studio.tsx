import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Copy, Download, Film, ImagePlus, Plus, Sparkles, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { movements, newScene, validScenes, basis, sceneError, projectScript, type Scene, type RenderAsset, type VideoProject } from './model';
import { listProjects, saveProject, proposeScene } from './api';
import './studio.css';

type Session = {id:string;assets:RenderAsset[]};
export default function VideoStudio(){
  const [session,setSession]=useState<Session|null>(null);
  const [message,setMessage]=useState('Abriendo tu estudio de video…');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let alive=true,currentId:string|undefined;
    setSession(null);setMessage('Abriendo tu estudio de video…');
    const {data:listener}=supabase.auth.onAuthStateChange((_event,s)=>{if(alive&&currentId&&s?.user.id!==currentId){setSession(null);setMessage('Tu sesión cambió. Vuelve a entrar desde ArquiRender.');}});
    void (async()=>{
      const {data,error}=await supabase.auth.getSession();if(error)throw error;
      if(!data.session){if(alive)setMessage('Inicia sesión en ArquiRender para trabajar con tus renders.');return;}
      currentId=data.session.user.id;
      const {data:renders,error:err}=await (supabase as any).from('renders').select('id,imagen_generada_url,estilo,created_at').eq('user_id',currentId).order('created_at',{ascending:false});
      if(err)throw err;
      const {data:latest}=await supabase.auth.getSession();if(!alive||latest.session?.user.id!==currentId)return;
      setSession({id:currentId,assets:(renders||[]).filter(r=>r.imagen_generada_url).map(r=>({id:r.id,src:r.imagen_generada_url,name:`${r.estilo||'Render'} · ${new Date(r.created_at).toLocaleDateString('es')}`}))});
    })().catch(()=>{if(alive)setMessage('No pudimos abrir tu historial. Reintenta en unos momentos.');});
    return()=>{alive=false;listener.subscription.unsubscribe();};
  },[attempt]);
  return <div className="video-studio">{session?<Editor key={session.id} session={session}/>:<main className="vs-loading"><Film/><h1>Estudio de video</h1><p role="status">{message}</p><a href="/app">Volver a ArquiRender</a><button onClick={()=>setAttempt(n=>n+1)}>Reintentar</button></main>}</div>;
}
function Editor({session}:{session:Session}){
  const draftKey=`arquirender-video:${session.id}`;
  const [draft]=useState(()=>{try{const d=JSON.parse(localStorage.getItem(draftKey)||'null');return d?.version===1&&validScenes(d.scenes)&&typeof d.name==='string'?d:null;}catch{return null;}});
  const [scenes,setScenes]=useState<Scene[]>(draft?.scenes||[newScene()]);
  const [active,setActive]=useState<string>(draft?.scenes?.[0]?.id||'');
  const [name,setName]=useState<string>(draft?.name||'Mi video');
  const [cloud,setCloud]=useState<{id:string;revision:number}|null>(draft?.cloud||null);
  const [busy,setBusy]=useState('');
  const [notice,setNotice]=useState('');
  const [localError,setLocalError]=useState(false);
  const [saved,setSaved]=useState(false);
  const [projects,setProjects]=useState<VideoProject[]|null>(null);
  const [slot,setSlot]=useState<'start'|'end'>('start');
  const [search,setSearch]=useState('');
  const [proposal,setProposal]=useState<{prompt:string;notes:string;basis:string}|null>(null);
  const dirty=useRef(false);
  const clean=useRef('');
  const current=scenes.find(s=>s.id===active)||scenes[0];
  const index=scenes.indexOf(current);
  const start=session.assets.find(a=>a.id===current.startId),end=session.assets.find(a=>a.id===current.endId);
  const validation=sceneError(current,session.assets);
  const stale=!!current.promptBasis&&current.promptBasis!==basis(current);
  useEffect(()=>{setProposal(null);setSlot('start');},[current.id]);
  useEffect(()=>{setProposal(null);},[current.startId,current.endId,current.mode,current.movement,current.duration,current.format,current.brief]);
  useEffect(()=>{dirty.current=JSON.stringify({name,scenes})!==clean.current;setSaved(!dirty.current&&!!cloud);const timer=setTimeout(()=>{try{localStorage.setItem(draftKey,JSON.stringify({version:1,name,scenes,cloud}));setLocalError(false);}catch{setLocalError(true);}},400);return()=>clearTimeout(timer);},[name,scenes,cloud]);
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty.current){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[]);
  const update=(change:Partial<Scene>)=>setScenes(ss=>ss.map(s=>s.id===current.id?{...s,...change}:s));
  const choose=(a:RenderAsset)=>{setNotice('');if(slot==='end'&&current.mode==='transition')update({endId:a.id});else update({startId:a.id});};
  const add=(copy=false)=>{if(scenes.length>=24)return;const s=copy?{...current,id:crypto.randomUUID(),name:`${current.name.slice(0,60)} · copia`}:newScene(scenes.length+1);setScenes(ss=>[...ss.slice(0,index+1),s,...ss.slice(index+1)]);setActive(s.id);};
  const remove=()=>{if(scenes.length===1)return;if(!confirm(`¿Quitar «${current.name}» de este borrador?`))return;const next=scenes.filter(s=>s.id!==current.id);setScenes(next);setActive(next[Math.min(index,next.length-1)].id);};
  const move=(direction:number)=>{const target=index+direction;if(target<0||target>=scenes.length)return;const ss=[...scenes];[ss[index],ss[target]]=[ss[target],ss[index]];setScenes(ss);};
  async function checkProvider(){
    setBusy('Comprobando conexión de video…');setNotice('');
    try{const {data,error}=await supabase.functions.invoke('video-provider-status');if(error)throw error;setNotice(data?.message||'No se pudo confirmar la conexión.');}catch{setNotice('No se pudo comprobar la conexión. No se ha generado ningún video.');}finally{setBusy('');}
  }
  async function generatePrompt(){
    if(validation){setNotice(validation);return;}setBusy('La IA está preparando tu escena…');setNotice('');setProposal(null);
    try{const result=await proposeScene(current,session.assets);setProposal({...result,basis:basis(current)});}
    catch(e){setNotice(e instanceof Error?e.message:'No se pudo preparar la propuesta.');}finally{setBusy('');}
  }
  async function save(copy=false){
    setBusy('Guardando tus escenas…');setNotice('');
    try{const row=await saveProject(session.id,copy?`${name.slice(0,110)} · copia`:name,scenes,copy?undefined:cloud||undefined);clean.current=JSON.stringify({name:row.name,scenes});setCloud({id:row.id,revision:row.revision});setName(row.name);setSaved(true);dirty.current=false;setNotice('Proyecto guardado en tu cuenta. Puedes continuarlo desde otro equipo.');}
    catch(e){setNotice(e instanceof Error?e.message:'No se pudo guardar.');}finally{setBusy('');}
  }
  async function showProjects(){setBusy('Cargando tus proyectos…');try{setProjects(await listProjects(session.id));}catch(e){setNotice(e instanceof Error?e.message:'No se pudo abrir la lista.');}finally{setBusy('');}}
  function openProject(p:VideoProject){if(!validScenes(p.scenes)){setNotice("Este proyecto no tiene un formato compatible.");return;}if(dirty.current&&!confirm('¿Abrir este proyecto? El borrador actual se reemplazará. Guarda una copia si quieres conservarlo.'))return;clean.current=JSON.stringify({name:p.name,scenes:p.scenes});setScenes(p.scenes);setName(p.name);setCloud({id:p.id,revision:p.revision});setActive(p.scenes[0].id);setProjects(null);setNotice('Proyecto recuperado de tu cuenta.');}
  async function copyPrompt(){try{await navigator.clipboard.writeText(current.prompt);setNotice('Prompt copiado. Añade también las imágenes inicial y final en el generador que elijas.');}catch{setNotice('No se pudo copiar automáticamente. Selecciona el prompt y cópialo.');}}
  function downloadPlan(){const url=URL.createObjectURL(new Blob([projectScript(name,scenes,session.assets)],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${name.replace(/[^\p{L}\p{N} -]/gu,'').slice(0,80)||'Mi video'} - escenas.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const filtered=session.assets.filter(a=>a.name.toLowerCase().includes(search.toLowerCase()));
  return <>
    <header className="vs-header"><a href="/app" className="vs-logo">arqui<span>render</span></a><nav><a href="/app">Renders</a><a href="/app/presentaciones">Presentaciones</a><span aria-current="page">Video <small>PRUEBA</small></span></nav></header>
    <fieldset disabled={!!busy} className="vs-controls">
    <section className="vs-intro"><div><span className="vs-eyebrow">DEL RENDER A LA ESCENA</span><h1>Tu arquitectura,<br/><em>en movimiento.</em></h1><p>Escoge las vistas. Dirige la cámara. Prepara cada toma.</p></div><div className="vs-project"><label>Nombre del video<input maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label><div className="vs-actions"><button className="vs-primary" onClick={()=>save()}><Check size={16}/>Guardar proyecto</button><button onClick={showProjects}>Mis proyectos</button><button onClick={()=>save(true)}>Guardar una copia</button><button onClick={()=>{if(dirty.current&&!confirm('¿Crear un proyecto nuevo? Guarda antes si quieres conservar estas escenas.'))return;const s=newScene();setScenes([s]);setActive(s.id);setCloud(null);setName('Mi video');setProjects(null);setNotice('Nuevo proyecto de video.');}}>Nuevo</button></div><small>{saved?'Guardado en tu cuenta':localError?'El respaldo local no está disponible. Guarda en tu cuenta.':'Borrador en este navegador · guarda para abrirlo en otro equipo.'}</small></div></section>
    {projects&&<section className="vs-project-list"><div className="vs-section-heading"><h2>Mis proyectos</h2><button onClick={()=>setProjects(null)} aria-label="Cerrar mis proyectos"><X size={18}/></button></div>{projects.length?projects.map(p=><article key={p.id}><div><strong>{p.name}</strong><small>{p.scenes.length} escenas · {new Date(p.updated_at).toLocaleDateString('es')}</small></div><button onClick={()=>openProject(p)}>Abrir</button></article>):<p>Aquí aparecerán los proyectos que guardes. Son planes de escenas; todavía no contienen clips generados.</p>}</section>}
    <section className="vs-workspace">
      <aside className="vs-library"><div className="vs-section-heading"><h2><span>01</span> Tus renders</h2><small>{session.assets.length}</small></div><p>Selecciona una vista para el espacio marcado en naranja.</p><label className="vs-search">Buscar en el historial<input placeholder="Estilo o fecha" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="vs-assets">{filtered.map(a=><button key={a.id} className={`vs-asset ${a.id===current.startId||current.mode==='transition'&&a.id===current.endId?'selected':''}`} onClick={()=>choose(a)} aria-label={`Elegir ${a.name}`}><img src={a.src} alt={a.name} loading="lazy"/><span>{a.name}</span>{a.id===current.startId&&<b>INICIO</b>}{current.mode==='transition'&&a.id===current.endId&&<b className="end">FINAL</b>}</button>)}</div>{!session.assets.length&&<p>Aún no tienes renders guardados. <a href="/app">Crea tu primer render</a> y vuelve al estudio.</p>}{session.assets.length>0&&!filtered.length&&<p>No hay imágenes que coincidan con la búsqueda.</p>}</aside>
      <main className="vs-director"><div className="vs-section-heading"><h2><span>02</span> Dirige tu escena</h2><span>{String(index+1).padStart(2,'0')} / {String(scenes.length).padStart(2,'0')}</span></div><label className="vs-scene-name">Nombre de la escena<input maxLength={80} value={current.name} onChange={e=>update({name:e.target.value})}/></label>
        <div className="vs-modes"><button aria-pressed={current.mode==='animate'} className={current.mode==='animate'?'selected':''} onClick={()=>{update({mode:'animate'});setSlot('start');}}><Film size={21}/><strong>Animar un render</strong><small>Una imagen, una toma.</small></button><button aria-pressed={current.mode==='transition'} className={current.mode==='transition'?'selected':''} onClick={()=>update({mode:'transition'})}><ImagePlus size={21}/><strong>De una imagen a otra</strong><small>Define el inicio y el final.</small></button></div>
        <div className={`vs-frames ${current.mode}`}>
          <button className={`vs-frame ${slot==='start'?'active':''}`} aria-label="Elegir imagen inicial" aria-pressed={slot==='start'} onClick={()=>setSlot('start')}>{start?<img src={start.src} alt="Vista inicial de la escena"/>:<div><ImagePlus size={30}/><p>Escoge un render del historial</p></div>}<span>01 · IMAGEN INICIAL</span></button>
          {current.mode==='transition'&&<><div className="vs-frame-arrow"><ArrowRight size={20}/></div><button className={`vs-frame ${slot==='end'?'active':''}`} aria-label="Elegir imagen final" aria-pressed={slot==='end'} onClick={()=>setSlot('end')}>{end?<img src={end.src} alt="Vista final de la escena"/>:<div><ImagePlus size={30}/><p>Escoge cómo termina la toma</p></div>}<span>02 · IMAGEN FINAL</span></button></>}
        </div><div className="vs-frame-tools"><small>Referencias de la escena · aún no es un video generado</small>{current.mode==='transition'&&<button disabled={!start||!end} onClick={()=>update({startId:current.endId,endId:current.startId})}>Intercambiar imágenes</button>}</div>
        {current.mode==='transition'&&<p className="vs-tip">Usa vistas compatibles del mismo proyecto. Un cambio extremo de encuadre puede deformar la arquitectura durante la transición.</p>}
        <div className="vs-settings"><label>Movimiento de cámara<select aria-label="Movimiento de cámara" value={current.movement} onChange={e=>update({movement:e.target.value})}>{movements.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label><label>Duración<select aria-label="Duración" value={current.duration} onChange={e=>update({duration:Number(e.target.value) as 5|10})}><option value={5}>5 segundos</option><option value={10}>10 segundos</option></select></label><label>Formato<select aria-label="Formato" value={current.format} onChange={e=>update({format:e.target.value as Scene['format']})}><option value="16:9">Horizontal · 16:9</option><option value="9:16">Vertical · 9:16</option><option value="1:1">Cuadrado · 1:1</option></select></label></div>
        <label>¿Qué debe transmitir esta toma?<textarea rows={3} maxLength={1000} placeholder="Ej.: un acercamiento lento para mostrar la luz cálida, sin cambiar ventanas ni materiales." value={current.brief} onChange={e=>update({brief:e.target.value})}/></label>
        <div className="vs-prompt-action"><button className="vs-primary" disabled={!!validation} onClick={generatePrompt}><Sparkles size={17}/>Preparar escena con IA</button><small>{validation||'La IA revisa tus imágenes. El prompt se propone antes de aplicarse.'}</small></div>
        {proposal&&<section className="vs-proposal"><span className="vs-eyebrow">PROPUESTA PARA REVISAR</span><h3>Así se movería tu cámara</h3><p>{proposal.notes}</p><label>Prompt propuesto<textarea aria-label="Prompt propuesto" rows={7} maxLength={2200} value={proposal.prompt} onChange={e=>setProposal({...proposal,prompt:e.target.value})}/></label><div className="vs-actions"><button className="vs-primary" disabled={!proposal.prompt.trim()||proposal.basis!==basis(current)} onClick={()=>{update({prompt:proposal.prompt,notes:proposal.notes,promptBasis:proposal.basis});setProposal(null);setNotice('Prompt aplicado a esta escena. Ya puedes copiarlo o guardar el proyecto.');}}>Usar este prompt</button><button onClick={()=>setProposal(null)}>Descartar</button></div></section>}
        <div className="vs-scene-tools"><button aria-label="Mover escena antes" disabled={index===0} onClick={()=>move(-1)}><ArrowLeft size={16}/></button><button aria-label="Mover escena después" disabled={index===scenes.length-1} onClick={()=>move(1)}><ArrowRight size={16}/></button><button disabled={scenes.length>=24} onClick={()=>add(true)}><Copy size={15}/>Duplicar escena</button><button disabled={scenes.length===1} onClick={remove}>Quitar escena</button></div>
      </main>
      <aside className="vs-output"><div className="vs-section-heading"><h2><span>03</span> Tu toma</h2></div><span className={`vs-status ${current.prompt&&!stale?'ready':''}`}>{current.prompt?(stale?'REVISAR AJUSTES':'PROMPT PREPARADO'):'POR PREPARAR'}</span><h3>La dirección está en tus manos.</h3><p>El prompt se prepara en inglés para usarlo en el generador que elijas. Puedes modificarlo aquí.</p><label>Prompt de la escena<textarea aria-label="Prompt de la escena" rows={12} maxLength={2200} placeholder="Prepara la escena con IA o escribe tu propio prompt." value={current.prompt} onChange={e=>update({prompt:e.target.value})}/></label>
        {stale&&<p className="vs-warning">Cambiaste las imágenes o los ajustes. Revisa el prompt o prepara una nueva propuesta antes de generar.</p>}
        <button disabled={!current.prompt.trim()} onClick={copyPrompt}><Copy size={16}/>Copiar prompt</button>
        {current.notes&&<details><summary>Notas de la IA</summary><p>{current.notes}</p></details>}
        <section className="vs-generation"><span className="vs-eyebrow">GENERACIÓN INTEGRADA</span><h3>El siguiente paso: el clip.</h3><p>La conexión de video está pendiente de activar. Mientras tanto, puedes llevar este prompt y tus imágenes a Kling o Magnific.</p><button disabled>Generación pendiente de activar</button><button onClick={checkProvider} style={{marginTop:8}}>Verificar conexión de video</button><small>No se han generado ni cobrado videos desde este estudio.</small></section>
        <small className="vs-ai-note">Preparar la escena envía copias reducidas de las imágenes seleccionadas a OpenAI. Hasta 30 propuestas diarias, sin gastar créditos de renders.</small>
      </aside>
    </section>
    <section className="vs-timeline"><div className="vs-section-heading"><div><span className="vs-eyebrow">TU SECUENCIA</span><h2>{scenes.length} escenas · {scenes.reduce((n,s)=>n+s.duration,0)} segundos previstos</h2></div><button onClick={downloadPlan}><Download size={16}/>Descargar plan de escenas</button></div><div className="vs-scene-strip">{scenes.map((s,i)=>{const image=session.assets.find(a=>a.id===s.startId);return <button key={s.id} aria-pressed={current.id===s.id} className={current.id===s.id?'selected':''} onClick={()=>setActive(s.id)}><div>{image?<img src={image.src} alt=""/>:<Film size={24}/>}<b>{String(i+1).padStart(2,'0')}</b></div><strong>{s.name||'Sin título'}</strong><small>{s.duration}s · {s.format} · {s.prompt?'Con prompt':'Pendiente'}</small></button>;})}<button className="vs-add-scene" disabled={scenes.length>=24} onClick={()=>add()}><Plus size={26}/><strong>Añadir escena</strong><small>Hasta 24 por proyecto</small></button></div></section>
    </fieldset><div className="vs-notice" role="status" aria-live="polite">{busy||notice}</div><footer className="vs-footer">ARQUIRENDER · ESTUDIO DE VIDEO <span>Primero la idea. Después el movimiento.</span></footer>
  </>;
}
