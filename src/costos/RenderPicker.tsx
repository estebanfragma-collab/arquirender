import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
export type SavedRender = {id:string;src:string;name:string};
type Row = {id:string;imagen_generada_url:string|null;estilo:string|null;created_at:string};
export default function RenderPicker({selected,onChange,limit}:{selected:SavedRender[];onChange:(items:SavedRender[])=>void;limit:number}) {
 const [open,setOpen]=useState(false),[renders,setRenders]=useState<SavedRender[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[page,setPage]=useState(0),[more,setMore]=useState(false),[retry,setRetry]=useState(0);
 useEffect(()=>{if(!open)return;let alive=true;setLoading(true);setError('');void(async()=>{
 const {data,error:authError}=await supabase.auth.getSession();if(authError||!data.session)throw new Error('Inicia sesión en ArquiRender para elegir tus renders.');
 const userId=data.session.user.id;
 const {data:rows,error:queryError}=await supabase.from('renders' as never).select('id,imagen_generada_url,estilo,created_at').eq('user_id',userId).order('created_at',{ascending:false}).range(page*48,page*48+47);
 if(queryError)throw new Error('No pudimos cargar tus renders. Reintenta.');
 const {data:latest}=await supabase.auth.getSession();if(!alive||latest.session?.user.id!==userId)return;
 const result=(rows||[]) as unknown as Row[];
 const assets=result.filter(r=>r.imagen_generada_url).map(r=>({id:r.id,src:r.imagen_generada_url!,name:`${r.estilo||'Render'} · ${new Date(r.created_at).toLocaleString('es')}`}));
 setRenders(old=>page?[...old,...assets.filter(a=>!old.some(b=>b.id===a.id))]:assets);setMore(result.length===48);
 })().catch(e=>{if(alive)setError(e.message);}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[open,page,retry]);
 return <div className="cost-render-picker"><button type="button" aria-expanded={open} onClick={()=>{setOpen(!open);setPage(0);}}>Elegir de mis renders</button><p>{selected.length} renders seleccionados · Puedes combinarlos con archivos del equipo.</p>
 {selected.length>0&&<div className="cost-render-grid">{selected.map(r=><div key={r.id}><img src={r.src} alt={r.name}/><button type="button" onClick={()=>onChange(selected.filter(s=>s.id!==r.id))}>Quitar {r.name}</button></div>)}</div>}
 {open&&<section aria-label="Mis renders"><h3>Selecciona renders del mismo proyecto</h3><button type="button" onClick={()=>setOpen(false)}>Cerrar selección</button>{error&&<p role="alert">{error} <button type="button" onClick={()=>setRetry(n=>n+1)}>Reintentar</button></p>}{!loading&&!error&&!renders.length&&<p>Aún no tienes renders guardados en tu cuenta.</p>}
 <div className="cost-render-grid">{renders.map(r=>{const checked=selected.some(s=>s.id===r.id);return <button type="button" key={r.id} aria-pressed={checked} disabled={!checked&&selected.length>=limit} onClick={()=>onChange(checked?selected.filter(s=>s.id!==r.id):[...selected,r])}><img loading="lazy" src={r.src} alt={r.name}/><span>{checked?'✓ Seleccionado · ':''}{r.name}</span></button>;})}</div>
 {loading&&<p role="status">Cargando tus renders…</p>}{more&&!loading&&<button type="button" onClick={()=>setPage(p=>p+1)}>Ver más renders</button>}{selected.length>=limit&&<p>Alcanzaste el límite de archivos e imágenes. Los PDF cuentan por página al analizar.</p>}</section>}
 </div>;
}
