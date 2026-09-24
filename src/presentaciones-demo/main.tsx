import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, Plus, Copy, Trash2, Check, ImagePlus, Layers, FileText } from 'lucide-react';
import day from './assets/dia.webp';
import dusk from './assets/tarde.webp';
import night from './assets/noche.webp';
import './style.css';
import {pageTemplate, setPageTemplate, sheetPrintStyles, type TemplateId} from './templates';
import type { CloudRow, Snapshot } from './cloud';
import { loadDraft, saveDraft, imageData } from './storage';
import { AnalysisPanel } from './AnalysisPanel';

type Asset = { id: string; src: string; name: string };
type Page = { id: string; title: string; text: string; heading: string; project: string; signature: string; showNumber?: boolean; template?: TemplateId; images: string[] };
const pageDefaults = { heading: 'ARQUIRENDER\n— PROPUESTA', project: 'EDIFICIO BOUTIQUE', signature: 'GEMELOS PONCE' };
const initialAssets: Asset[] = [{id:'day',src:day,name:'Fachada · día'},{id:'dusk',src:dusk,name:'Fachada · atardecer'},{id:'night',src:night,name:'Fachada · noche'}];
const templates = [
  {id:'editorial',name:'Editorial',desc:'Imagen y relato, en equilibrio.',format:'Horizontal'},
  {id:'inmersiva',name:'Inmersiva',desc:'El render ocupa el escenario.',format:'Horizontal'},
  {id:'materialidad',name:'Materialidad',desc:'Una vista principal y dos detalles.',format:'Horizontal'},
  {id:'sintesis',name:'Síntesis',desc:'Una idea por página, para el móvil.',format:'Vertical'},
];
const uid = () => crypto.randomUUID();
function Demo({accountId, history = []}:{accountId?:string;history?:Asset[]}) {
  const draftKey = accountId ? `account:${accountId}` : 'draft';
  const [assets,setAssets] = useState(accountId ? history : initialAssets);
  const [pages,setPages] = useState<Page[]>(accountId ? [{id:'cover',heading:'',project:'',signature:'',title:'',text:'',images:[]}] : [{...pageDefaults,id:'cover',title:'Una nueva mirada\na la ciudad.',text:'Edificio boutique\nPropuesta arquitectónica · Gemelos Ponce',images:['night']},{...pageDefaults,id:'views',title:'Arquitectura que\nse vive de día.',text:'Una vista general para presentar el carácter del proyecto.',images:['day','dusk']}]);
  const [active,setActive] = useState('cover');
  const [template,setTemplate] = useState('editorial');
  const [name,setName] = useState('Mi presentación');
  const [cloudRow,setCloudRow] = useState<CloudRow|null>(null);
  const [documents,setDocuments] = useState<CloudRow[]>([]);
  const [showDocuments,setShowDocuments] = useState(false);
  const [cloudBusy,setCloudBusy] = useState(false);
  const [aiBusy,setAiBusy] = useState(false);
  const [preview,setPreview] = useState(false);
  const [notice,setNotice] = useState('');
  const [ready,setReady] = useState(false);
  const [saving,setSaving] = useState(false);
  const [exporting,setExporting] = useState(false);
  const [saveStatus,setSaveStatus] = useState('Cargando borrador…');
  const dirty = useRef(false);
  const clean = useRef<{assets:Asset[];pages:Page[];template:string;name:string}|null>(null);
  const revision = useRef(0);
  useEffect(()=>{
    loadDraft<{version:number;assets:Asset[];pages:Page[];template:string;active:string;name?:string;cloudRow?:CloudRow}>(draftKey).then(d=>{
      if(d?.version===1 && d.pages?.length && templates.some(t=>t.id===d.template)) {
        setAssets([...d.assets.map(a=>(accountId?history:initialAssets).find(i=>i.id===a.id)||a), ...history.filter(a=>!d.assets.some(saved=>saved.id===a.id))]);setPages(d.pages.map(p=>({...pageDefaults,...p})));setTemplate(d.template);
        setActive(d.pages.some(p=>p.id===d.active)?d.active:d.pages[0].id);
        setName(d.name||'Mi presentación');setCloudRow(d.cloudRow||null);setSaveStatus('Borrador local recuperado');
      } else setSaveStatus('Todavía no has guardado este borrador');
    }).catch(()=>setSaveStatus('No se pudo recuperar el guardado local')).finally(()=>setReady(true));
  },[]);
  useEffect(()=>{if(!ready)return;revision.current++;dirty.current=!(clean.current?.assets===assets&&clean.current?.pages===pages&&clean.current?.template===template&&clean.current?.name===name);setSaveStatus(dirty.current?'Cambios sin guardar':accountId?'Guardado en tu cuenta':'Guardado en este navegador');},[assets,pages,template,name]);
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty.current){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[]);
  const snapshot = ():Snapshot => ({version:1,assets,pages,template,active});
  const save = async(copy=false)=>{
    const savedRevision=revision.current;setSaving(true);
    const copyName=copy?`${name.slice(0,110)} · copia`:name;
    let row=cloudRow;
    try{
      try{await saveDraft({...snapshot(),name,cloudRow},draftKey);}catch(e){if(!accountId)throw e;}
      if(accountId){
        row=await (await import('./cloud')).savePresentation(accountId,copyName,snapshot(),copy?undefined:cloudRow||undefined);
        setCloudRow(row);setName(row.name);
        try{await saveDraft({...snapshot(),name:row.name,cloudRow:row},draftKey);}catch{/* Cloud commit already succeeded. */}
      }
      if(savedRevision===revision.current){clean.current={assets,pages,template,name:row?.name||name};dirty.current=false;setSaveStatus(accountId?'Guardado en tu cuenta':'Guardado en este navegador');}
      setNotice(accountId?'Presentación guardada en la nube. Puedes abrirla desde otro equipo.':'Borrador guardado.');
    }catch(e){setSaveStatus('Cambios pendientes de guardar');setNotice(e instanceof Error?e.message:'No se pudo guardar. Reintenta.');}
    finally{setSaving(false);}
  };
  const refreshDocuments=async()=>{
    if(!accountId)return;setCloudBusy(true);setShowDocuments(true);
    try{setDocuments(await (await import('./cloud')).listPresentations(accountId));}
    catch(e){setNotice(e instanceof Error?e.message:'No se pudo cargar la lista.');}
    finally{setCloudBusy(false);}
  };
  const openCloud=async(id:string)=>{
    if(!accountId|| (dirty.current&&!window.confirm('Hay cambios sin guardar. ¿Abrir otra presentación y descartarlos?')))return;
    setCloudBusy(true);
    try{
      const row=await (await import('./cloud')).openPresentation(id,accountId);const d=row.document;
      if(!templates.some(t=>t.id===d.template))throw new Error('Plantilla no compatible.');
      const mergedAssets=[...d.assets,...history.filter(a=>!d.assets.some(saved=>saved.id===a.id))];clean.current={assets:mergedAssets,pages:d.pages as Page[],template:d.template,name:row.name};setAssets(mergedAssets);setPages(d.pages as Page[]);setTemplate(d.template);setActive(d.pages[0].id);setName(row.name);setCloudRow({id:row.id,name:row.name,revision:row.revision,updated_at:row.updated_at});setShowDocuments(false);setNotice('Presentación recuperada de tu cuenta.');
      try{await saveDraft({...d,name:row.name,cloudRow:{id:row.id,name:row.name,revision:row.revision,updated_at:row.updated_at}},draftKey);}catch{/* Loaded cloud document is still available. */}
    }catch(e){setNotice(e instanceof Error?e.message:'No se pudo abrir.');}
    finally{setCloudBusy(false);}
  };
  const newDocument=()=>{
    if(dirty.current&&!window.confirm('Hay cambios sin guardar. ¿Crear una presentación nueva y descartarlos?'))return;
    setPages([{id:'cover',heading:'',project:'',signature:'',title:'',text:'',images:[]}]);setActive('cover');setAssets(history);setName('Mi presentación');setCloudRow(null);setShowDocuments(false);
  };
  const removeCloud=async(row:CloudRow)=>{
    if(!accountId||!window.confirm(`¿Eliminar «${row.name}» de tu cuenta? Esta acción no se puede deshacer.`))return;
    setCloudBusy(true);
    try{await (await import('./cloud')).deletePresentation(row.id,accountId,row.revision);setDocuments(ds=>ds.filter(d=>d.id!==row.id));if(cloudRow?.id===row.id){setCloudRow(null);await saveDraft({...snapshot(),name,cloudRow:null},draftKey);}setNotice('Presentación eliminada.');}
    catch(e){setNotice(e instanceof Error?e.message:'No se pudo eliminar.');}
    finally{setCloudBusy(false);}
  };
  const exportPdf = async()=>{
    setExporting(true);
    try {
      await document.fonts.ready;
      await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>('.print-document img')).map(img=>img.decode()));
      setNotice('En la ventana de impresión elige «Guardar como PDF», sin encabezados ni pies de página.');
      window.print();
    } catch {setNotice('Una imagen no se pudo cargar. Revísala antes de exportar.');}
    finally {setExporting(false);}
  };
  const current = pages.find(p=>p.id===active)!;
  const index = pages.indexOf(current);
  const activeTemplate = pageTemplate(current, template);
  const update = (changes:Partial<Page>) => setPages(ps=>ps.map(p=>p.id===active?{...p,...changes}:p));
  const add = (duplicate=false) => {const p:Page=duplicate?{...current,template:activeTemplate,id:uid(),images:[...current.images]}:{template:activeTemplate,heading:'',project:'',signature:'',id:uid(),title:'Una nueva perspectiva.',text:'Escribe aquí lo que quieres transmitir al cliente.',images:[]};setPages(ps=>[...ps.slice(0,index+1),p,...ps.slice(index+1)]);setActive(p.id);};
  const move = (direction:number) => {const next=index+direction;if(next<0||next>=pages.length)return;setPages(ps=>{const copy=[...ps];[copy[index],copy[next]]=[copy[next],copy[index]];return copy;});};
  const remove = () => {if(pages.length===1)return;setPages(ps=>ps.filter(p=>p.id!==active));setActive(pages[index===0?1:index-1].id);};
  const toggle = (id:string) => {if(current.images.includes(id)){update({images:current.images.filter(i=>i!==id)});return;}if(current.images.length>=3){setNotice('Cada página admite hasta tres imágenes. Añade otra página para continuar.');return;}setNotice('');update({images:[...current.images,id]});};
  const upload = async (files:FileList|null) => {
    if(!files)return;
    const selected=Array.from(files);
    const valid=selected.filter(f=>['image/jpeg','image/png','image/webp'].includes(f.type)&&f.size<=20*1024*1024);
    const results=await Promise.allSettled(valid.map(async f=>({id:uid(),name:f.name,src:await imageData(f)})));
    const loaded=results.flatMap(r=>r.status==='fulfilled'?[r.value]:[]);
    setAssets(a=>[...a,...loaded]);
    setNotice(loaded.length===selected.length?'Imágenes añadidas. Pulsa Guardar para conservarlas.':'Se omitieron archivos no válidos. Usa JPG, PNG o WebP de hasta 20 MB.');
  };
  function Sheet({page,number}:{page:Page;number:number}) {
    const selected=page.images.map(id=>assets.find(a=>a.id===id)).filter(Boolean) as Asset[];
    const hasCopy = [page.heading,page.project,page.title,page.text,page.signature].some(t=>t.trim());
    return <article className={`sheet ${pageTemplate(page, template)}${hasCopy?'':' image-only'}`} aria-label={`Página ${number}: ${page.title}`}>
      <div className="sheet-copy"><div className="folio-brand">{page.heading.trim() && page.heading.split('\n').map((line,i)=>i===0?<React.Fragment key={i}>{line}</React.Fragment>:<span key={i}>{line}</span>)}</div><div className="sheet-message">{page.project.trim()&&<span className="eyebrow">{page.project}</span>}{page.title.trim()&&<h2>{page.title}</h2>}{page.text.trim()&&<p>{page.text}</p>}</div><div className="folio">{page.signature.trim()&&<b>{page.signature}</b>}{hasCopy&&page.showNumber!==false&&<span>{String(number).padStart(2,'0')}</span>}</div></div>
      <div className={`sheet-images count-${selected.length}`}>{selected.length?selected.map((a,i)=><img key={a.id} src={a.src} alt={a.name} className={`photo-${i}`} />):<div className="empty"><ImagePlus size={32}/><p>Selecciona imágenes para esta página</p></div>}</div>
    </article>;
  }
  if(!ready)return <div className="loading" role="status">Abriendo tu estudio de presentaciones…</div>;
  return <div className="studio">
    <style>{sheetPrintStyles}</style>
    <div className="print-document" aria-hidden="true">{pages.map((p,i)=><Sheet key={p.id} page={p} number={i+1}/>)}</div>
    <fieldset className="editor-controls" disabled={saving||cloudBusy||aiBusy}>
    <header className="top"><a href={accountId?'/app':'/presentaciones-demo.html'} target={accountId?'_top':undefined} className="brand">arqui<span>render</span><small>ESTUDIO DE PRESENTACIONES</small></a>{accountId&&<nav className="studio-nav" aria-label="Herramientas de ArquiRender"><a href="/app" target="_top">Renders</a><span aria-current="page">Presentaciones</span><a href="/app/videos" target="_top">Video</a></nav>}<span className="demo-label">{accountId ? 'PRESENTACIONES' : 'PROTOTIPO LOCAL'}</span><button className="save-button" disabled={saving} onClick={()=>save()}>{saving?'Guardando…':accountId?'Guardar en mi cuenta':'Guardar'}</button><button className="save-button" disabled={exporting} onClick={exportPdf}>{exporting?'Preparando…':'Exportar PDF'}</button><button className="primary" onClick={()=>setPreview(!preview)}><FileText size={16}/>{preview?'Volver al editor':'Ver presentación'}</button></header>
    {accountId&&<section className="cloud-toolbar"><label>Nombre de la presentación<input maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label><button onClick={refreshDocuments}>Mis presentaciones</button><button onClick={newDocument}>Nueva</button><button onClick={()=>save(true)}>Guardar una copia</button><span role="status">{saveStatus}</span></section>}
    {showDocuments&&<section className="cloud-list"><div><h2>Mis presentaciones</h2><button onClick={()=>setShowDocuments(false)}>Cerrar</button><button onClick={refreshDocuments}>Actualizar</button></div>{cloudBusy?<p>Cargando…</p>:documents.length?documents.map(d=><article key={d.id}><div><strong>{d.name}</strong><small>{new Date(d.updated_at).toLocaleString('es')}</small></div><button onClick={()=>openCloud(d.id)}>Abrir</button><button onClick={()=>removeCloud(d)}>Eliminar</button></article>):<p>Aquí aparecerán las presentaciones que guardes en tu cuenta.</p>}</section>}
    <div className="intro"><div><span className="eyebrow">DEL RENDER A LA PROPUESTA</span><h1>Tu proyecto, bien presentado.</h1><p>Escoge tus imágenes. Dale una estructura. Cuenta la idea.</p></div><div className="local-note"><span role="status">{saveStatus}</span><br/>{accountId?'Pulsa Guardar en mi cuenta antes de cerrar.':'Un borrador local · pulsa Guardar antes de cerrar.'}</div></div>
    {preview?<main className="preview"><div className="preview-heading"><h2>Presentación completa</h2><span>{pages.length} páginas · listas para exportar</span></div>{pages.map((p,i)=><Sheet key={p.id} page={p} number={i+1}/>)}</main>:<>
    <section className="template-section"><div className="section-title"><h2><span>01</span> Estilo de la lámina {index+1}</h2><span>Solo cambia esta lámina; conserva sus imágenes y textos</span></div><div className="templates">{templates.map(t=><button key={t.id} className={`template ${activeTemplate===t.id?'selected':''}`} aria-pressed={activeTemplate===t.id} onClick={()=>setPages(ps=>setPageTemplate(ps,active,t.id as TemplateId))}><div className={`mini ${t.id}`}><i/><b/><em/></div><div><strong>{t.name}</strong><small>{t.desc}</small></div><span className="format">{t.format}</span>{activeTemplate===t.id&&<Check className="check" size={17}/>}</button>)}</div></section>
    <main className="workspace"><aside className="library"><h2><span>02</span> {accountId?'Tus renders':'Tus imágenes'}</h2>{accountId&&assets.length===0&&<p>Todavía no tienes renders guardados. Puedes añadir imágenes o volver al generador desde el logotipo.</p>}<p>Selecciona hasta tres por página. Solo se usan las que tú eliges.</p><div className="asset-list">{assets.map(a=><button key={a.id} className={`asset ${current.images.includes(a.id)?'chosen':''}`} aria-pressed={current.images.includes(a.id)} onClick={()=>toggle(a.id)}><img src={a.src} alt={a.name}/><span>{a.name}</span><b>{current.images.includes(a.id)?current.images.indexOf(a.id)+1:'+'}</b></button>)}</div><label className="upload"><ImagePlus size={17}/> Añadir mis imágenes<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>{upload(e.target.files);e.target.value='';}}/></label><p className="privacy">{accountId?'Al guardar en tu cuenta se suben únicamente las imágenes elegidas para las páginas.':'Tus archivos se quedan en este navegador. No se suben a la plataforma.'}</p><p role="status">{notice}</p></aside>
    <section className="canvas"><div className="canvas-bar"><h2><span>03</span> Compón tu presentación</h2><span>{index+1} / {pages.length}</span></div><Sheet page={current} number={index+1}/><div className="page-tools"><span>Orden de página</span><button aria-label="Mover página antes" disabled={index===0} onClick={()=>move(-1)}><ArrowLeft size={17}/></button><button aria-label="Mover página después" disabled={index===pages.length-1} onClick={()=>move(1)}><ArrowRight size={17}/></button><button onClick={()=>add(true)}><Copy size={16}/> Duplicar</button><button disabled={pages.length===1} onClick={remove}><Trash2 size={16}/> Eliminar</button></div><div className="page-strip">{pages.map((p,i)=><button key={p.id} aria-pressed={p.id===active} className={p.id===active?'active':''} onClick={()=>setActive(p.id)}><Layers size={16}/><span>{String(i+1).padStart(2,'0')}</span><span className="page-strip-copy">{p.title.split('\n')[0]||'Sin título'}<small>{templates.find(t=>t.id===pageTemplate(p,template))?.name}</small></span></button>)}<button onClick={()=>add()}><Plus size={17}/> Añadir página</button></div></section>
    <aside className="properties"><h2>Contenido de la página</h2>{accountId&&<AnalysisPanel key={`${cloudRow?.id||'local'}:${active}:${current.images.join(',')}`} sources={current.images.map(id=>assets.find(a=>a.id===id)?.src).filter(Boolean) as string[]} onBusy={setAiBusy} onApply={changes=>{update(changes);setNotice('Textos aplicados. Puedes editarlos y guardar la presentación.');}}/>}<p className="field-help">Los cinco textos son opcionales. Deja un campo vacío para quitarlo.</p><label>Encabezado / marca<textarea aria-label="Encabezado / marca" rows={2} maxLength={80} value={current.heading} onChange={e=>update({heading:e.target.value})}/></label><label>Nombre del proyecto<textarea aria-label="Nombre del proyecto" rows={2} maxLength={70} value={current.project} onChange={e=>update({project:e.target.value})}/></label><label>Título<textarea aria-label="Título" rows={3} maxLength={90} value={current.title} onChange={e=>update({title:e.target.value})}/></label><label>Descripción<textarea aria-label="Descripción" rows={5} maxLength={250} value={current.text} onChange={e=>update({text:e.target.value})}/></label><label>Firma / estudio<textarea aria-label="Firma / estudio" rows={2} maxLength={80} value={current.signature} onChange={e=>update({signature:e.target.value})}/></label><label className="number-option"><input type="checkbox" checked={current.showNumber!==false} onChange={e=>update({showNumber:e.target.checked})}/> Mostrar número de página</label><div className="hint"><span className="eyebrow">TU CRITERIO PRIMERO</span><p>Usa vistas del mismo proyecto y una materialidad coherente. Elige el orden de las fotos marcándolas del 1 al 3.</p></div><div className="next"><strong>Tu presentación, a salvo</strong><p>{accountId?'Guardar en mi cuenta conserva esta presentación en la nube.':'Guardar conserva este borrador y sus imágenes en este navegador.'} Exportar PDF abre la impresión: elige «Guardar como PDF». {accountId?'Abre Mis presentaciones para continuar desde otro equipo. Si hay cambios en dos equipos, guarda una copia para no sobrescribirlos.':'La conexión a tu cuenta vendrá después.'}</p></div></aside></main></>}
    </fieldset>
    <div className="global-status" role="status">{saving?'Guardando presentación e imágenes…':cloudBusy?'Cargando…':aiBusy?'Analizando las imágenes de esta página…':notice}</div><footer>ARQUIRENDER · PRESENTACIONES <span>Composición de láminas · sin consumo de créditos</span></footer>
  </div>;
}
// The editor lives in a separate document to isolate its styles from the generator.
function ConnectedEditor() {
  const [account,setAccount] = useState<{id:string;assets:Asset[]}|null>(null);
  const [status,setStatus] = useState('Cargando tu sesión y tus renders…');
  const [retry,setRetry] = useState(0);
  const [failed,setFailed] = useState(false);
  useEffect(()=>{
    let alive=true;
    let cleanup=()=>{};
    setAccount(null);setFailed(false);setStatus('Cargando tu sesión y tus renders…');
    void import('@/integrations/supabase/client').then(async ({supabase})=>{
      let currentId:string|null=null;
      const sub=supabase.auth.onAuthStateChange((_event,session)=>{
        if(currentId && session?.user.id!==currentId && alive){setAccount(null);setStatus('Tu sesión cambió. Vuelve a abrir Presentaciones desde ArquiRender.');}
      });
      cleanup=()=>sub.data.subscription.unsubscribe();
      if(!alive){cleanup();return;}
      const {data,error}=await supabase.auth.getSession();
      if(!alive)return;
      if(error)throw error;
      const user=data.session?.user;
      if(!user){setStatus('Inicia sesión en ArquiRender para trabajar con tus renders.');return;}
      currentId=user.id;
      const {data:renders,error:historyError}=await (supabase as any).from('renders')
        .select('id,imagen_generada_url,estilo,created_at').eq('user_id',user.id).order('created_at',{ascending:false});
      if(!alive)return;
      if(historyError)throw historyError;
      const {data:latest}=await supabase.auth.getSession();
      if(!alive||latest.session?.user.id!==user.id)return;
      setAccount({id:user.id,assets:(renders||[]).filter(r=>r.imagen_generada_url).map(r=>({id:`render:${r.id}`,src:r.imagen_generada_url,name:`${r.estilo||'Render'} · ${new Date(r.created_at).toLocaleDateString('es')}`}))});
    }).catch(()=>{if(alive){setStatus('No pudimos cargar tu historial. Tus renders no se han modificado.');setFailed(true);}});
    return()=>{alive=false;cleanup();};
  },[retry]);
  if(account)return <Demo key={account.id} accountId={account.id} history={account.assets}/>;
  return <main className="loading"><h1>Presentaciones</h1><p role="status">{status}</p><p style={{marginTop:24}}><a href="/app" target="_top">Volver a ArquiRender</a></p>{failed&&<button style={{marginTop:20,padding:12}} onClick={()=>setRetry(n=>n+1)}>Reintentar</button>}</main>;
}
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('mode')==='app'?<ConnectedEditor/>:<Demo/>);
