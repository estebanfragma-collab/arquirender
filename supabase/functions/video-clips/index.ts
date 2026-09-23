import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.3';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
const MODELS={dop:'higgsfield-ai/dop/lite',minimax:'minimax/hailuo-2.3/standard/image-to-video'};
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9-]{36}$/i.test(v);
const fail=(message:string)=>{throw new Error(message);};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply(405,{error:'Usa POST.'});
 let stage='solicitud';
 try{
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const bearer=req.headers.get('authorization')?.replace(/^Bearer /,'');
  if(!bearer)return reply(401,{error:'Inicia sesión.'});
  const {data:auth,error:authError}=await db.auth.getUser(bearer);
  if(authError||!auth.user||auth.user.is_anonymous)return reply(401,{error:'Vuelve a iniciar sesión.'});
  const uid=auth.user.id;
  const {data:pilot}=await db.from('video_pilot_accounts').select('enabled').eq('user_id',uid).maybeSingle();
  if(!pilot?.enabled)return reply(403,{error:'La generación de clips está en prueba privada. Puedes seguir preparando tus escenas.'});
  const bodyReader=req.body?.getReader();let raw='';const decoder=new TextDecoder();if(bodyReader){for(;;){const {done,value}=await bodyReader.read();if(done)break;raw+=decoder.decode(value,{stream:true});if(raw.length>16000){await bodyReader.cancel();return reply(413,{error:'Solicitud demasiado grande.'});}}raw+=decoder.decode();}
  const input=JSON.parse(raw);
  const key=(Deno.env.get('HIGGSFIELD_API_KEY')||'').trim().replace(/^Key\s+/i,'');
  if(!/^[^\s:]+:[^\s:]+$/.test(key))return reply(503,{error:'La conexión de video necesita revisión.'});
  const provider=(path:string,body?:unknown)=>fetch(`https://api.higgsfield.ai/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Key ${key}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,redirect:'error',signal:AbortSignal.timeout(25000)});
  async function estimate(model:string,payload:unknown){
   const r=await provider(`estimate/${model}`,payload);if(!r.ok){const status=r.status;await r.body?.cancel();fail(`No se pudo cotizar este modelo (respuesta ${status}). No se ha generado ni cobrado ningún clip.`);}
   const result=await r.json();const cost=Number(result.usd);
   if(!Number.isFinite(cost)||cost<=0||cost>1)fail('El costo de esta toma supera el límite de USD 1 de la prueba.');return Math.ceil(cost*10000)/10000;
  }
  async function output(job:any){
   let url:string|null=null;
   if(job.storage_path){const {data}=await db.storage.from('video-clips').createSignedUrl(job.storage_path,3600);url=data?.signedUrl||null;}
   return {model:job.payload?.model||'kling-video/o3/first-last-frame',duration:job.payload?.model?(job.payload.input.duration||5):job.payload.duration,id:job.id,sceneId:job.scene_id,name:job.name,state:job.state,estimatedUsd:Number(job.estimated_usd),url,createdAt:job.created_at,expiresAt:job.expires_at};
  }
  async function update(id:string,changes:Record<string,unknown>){const {data,error}=await db.from('video_clip_jobs').update(changes).eq('id',id).eq('user_id',uid).select('*').single();if(error)fail('No se pudo actualizar la toma. Recupera su estado antes de intentar otra.');return data;}
  if(input.action==='list'){
   const {data,error}=await db.from('video_clip_jobs').select('*').eq('user_id',uid).neq('state','quoted').order('created_at',{ascending:false}).limit(30);
   if(error)fail('No se pudieron cargar tus clips.');return reply(200,{jobs:await Promise.all((data||[]).map(output))});
  }
  if(input.action==='quote'){
   const s=input.scene;
   if(!s||!uuid(s.id)||!uuid(s.startId)||!['animate','transition'].includes(s.mode)||![5,10].includes(s.duration)||!['16:9','9:16','1:1'].includes(s.format)||typeof s.prompt!=='string'||!s.prompt.trim()||s.prompt.length>2200)fail('Completa las imágenes, el prompt y los ajustes de la escena.');
   if(s.mode==='transition'&&(!uuid(s.endId)||s.endId===s.startId))fail('Selecciona dos imágenes distintas.');
   const ids=s.mode==='transition'?[s.startId,s.endId]:[s.startId];
   const {data:renders,error}=await db.from('renders').select('id,imagen_generada_url').eq('user_id',uid).in('id',ids);
   if(error||renders?.length!==ids.length)fail('No se encontraron estas imágenes en tu cuenta.');
   const source=(id:string)=>{const value=renders!.find(r=>r.id===id)?.imagen_generada_url;const u=new URL(value);const base=new URL(Deno.env.get('SUPABASE_URL')!);if(u.protocol!=='https:'||u.host!==base.host||!u.pathname.startsWith('/storage/v1/object/'))fail('Esta imagen no tiene una ubicación compatible con la prueba.');return u.href;};
   const engine=input.engine==='minimax'?'minimax':'dop';
   if(engine==='minimax'&&s.mode==='transition')fail('La prueba MiniMax admite una imagen inicial. Conserva la transición como plan para otro modelo.');
   if(engine==='dop'&&s.duration!==5)fail('La prueba DoP usa 5 segundos.');
   const model=MODELS[engine];
   const modelInput=engine==='dop'?{prompt:s.prompt.trim(),image_url:source(s.startId),enhance_prompt:false,...(s.mode==='transition'?{end_image_url:source(s.endId)}:{})}:{prompt:s.prompt.trim(),image_url:source(s.startId),duration:s.duration===10?10:6,prompt_optimizer:false};
   const payload={model,input:modelInput};
   const cost=await estimate(model,modelInput);
   const {data:job,error:err}=await db.from('video_clip_jobs').insert({user_id:uid,scene_id:s.id,name:String(s.name||'Escena').slice(0,80),payload,estimated_usd:cost}).select('*').single();
   if(err)fail('No se pudo guardar la cotización.');return reply(200,{job:await output(job)});
  }
  if(!uuid(input.id))fail('Toma no válida.');
  const {data:found}=await db.from('video_clip_jobs').select('*').eq('id',input.id).eq('user_id',uid).maybeSingle();
  if(!found)return reply(404,{error:'No se encontró esta toma.'});let job=found;
  if(input.action==='start'){
   if(job.state!=='quoted')return reply(200,{job:await output(job)});
   if(!Object.values(MODELS).includes(job.payload?.model))fail('Esta cotización pertenece a la prueba anterior. Consulta el costo con un modelo económico.');
   if(await estimate(job.payload.model,job.payload.input)>Number(job.estimated_usd))fail('El precio cambió. Consulta el costo de nuevo antes de generar.');
   const {data:claim,error}=await db.rpc('claim_video_clip',{p_user_id:uid,p_job_id:job.id});
   if(error)fail('No pudimos reservar la toma. No se envió a generar.');
   if(claim==='existing'){const {data}=await db.from('video_clip_jobs').select('*').eq('id',job.id).eq('user_id',uid).single();return reply(200,{job:await output(data)});}
   if(claim!=='claimed')fail(({expired:'El precio venció. Consúltalo otra vez.',active:'Hay una toma pendiente. Espera su resultado antes de generar otra.',budget:'Alcanzaste el límite de USD 1 de esta prueba privada.'} as Record<string,string>)[claim]||'La prueba no está habilitada.');
   // Never retry a submission: a timeout can still mean the provider accepted it.
   let r:Response;
   try{r=await provider(job.payload.model,job.payload.input);}catch{job=await update(job.id,{state:'unknown'});return reply(200,{job:await output(job)});}
   if(!r.ok){job=await update(job.id,{state:r.status>=400&&r.status<500&&r.status!==408?'failed':'unknown'});await r.body?.cancel();return reply(200,{job:await output(job)});}
   let result:any;try{result=await r.json();}catch{job=await update(job.id,{state:'unknown'});return reply(200,{job:await output(job)});}
   if(!uuid(result.request_id)){job=await update(job.id,{state:'unknown'});return reply(200,{job:await output(job)});}
   job=await update(job.id,{state:'queued',request_id:result.request_id});return reply(200,{job:await output(job)});
  }
  if(input.action!=='status')return reply(400,{error:'Acción no válida.'});
  if(job.request_id&&['queued','in_progress','completed'].includes(job.state)&&!job.storage_path){
   const r=await provider(`requests/${job.request_id}/status`);
   if(!r.ok)fail('El proveedor aún no devolvió el estado. No vuelvas a generar esta toma; reintenta consultar.');
   const result=await r.json();
   if(['queued','in_progress','failed','nsfw','canceled'].includes(result.status))job=await update(job.id,{state:result.status});
   else if(result.status==='completed'){
    const src=result.video?.url;
    if(typeof src!=='string')fail('El clip terminó, pero falta su enlace. Reintenta consultar.');
    // Persist completion before copying; retrying storage never resubmits the paid request.
    job=await update(job.id,{state:'completed',provider_url:src});
    const url=new URL(src);
    if(url.protocol!=='https:'||url.username||url.password||url.hostname==='localhost'||/^(\d|\[)/.test(url.hostname))fail('El enlace del clip requiere revisión.');
    stage='descarga';
    const video=await fetch(src,{headers:{'User-Agent':'Mozilla/5.0',Accept:'video/mp4,*/*'},redirect:'error',signal:AbortSignal.timeout(40000)});
    if(!video.ok||Number(video.headers.get('content-length')||0)>52428800)fail('El clip está listo, pero no se pudo guardar. Reintenta consultar.');
    // Stream to private storage: buffering large clips can exhaust an edge worker.
    if(!video.body)fail('El clip no devolvió contenido. Reintenta consultar.');
    let size=0;
    const bounded=video.body!.pipeThrough(new TransformStream<Uint8Array,Uint8Array>({
     transform(chunk,controller){size+=chunk.byteLength;if(size>52428800)throw new Error('El clip supera el tamaño admitido.');controller.enqueue(chunk);}
    }));
    const path=`${uid}/${job.id}.mp4`;
    stage='guardado del video';
    const stored=await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/video-clips/${path}`,{
     method:'POST',headers:{Authorization:`Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,apikey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,'Content-Type':'video/mp4','x-upsert':'true'},
     body:bounded,signal:AbortSignal.timeout(60000)
    });
    if(!stored.ok){await stored.body?.cancel();fail('El clip terminó, pero falta guardarlo. Reintenta consultar.');}
    await stored.body?.cancel();
    job=await update(job.id,{storage_path:path});
   }
  }
  return reply(200,{job:await output(job)});
 }catch(e){const message=e instanceof Error?e.message:'';return reply(400,{error:/^(No |El |La |Completa |Selecciona |Esta |Toma |Hay |Alcanzaste)/.test(message)?message:`No se pudo completar ${stage} (${e instanceof Error?e.name:'error'}). Consulta tus clips antes de volver a generar.`});}
});
