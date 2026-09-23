import { supabase } from '@/integrations/supabase/client';
import type { VideoProject, Scene, RenderAsset } from './model';
import { prepareImage } from '@/presentaciones-demo/analysis';
// These new tables are absent from the repository's generated schema until it is refreshed.
const db=supabase as any;
export async function listProjects(userId:string):Promise<VideoProject[]> {
  const {data,error}=await db.from('video_projects').select('id,name,scenes,revision,updated_at').eq('user_id',userId).order('updated_at',{ascending:false});
  if(error)throw new Error('No pudimos cargar tus proyectos de video.');return data||[];
}
export async function saveProject(userId:string,name:string,scenes:Scene[],existing?:{id:string;revision:number}):Promise<VideoProject>{
  const {data:auth,error:authError}=await supabase.auth.getUser();
  if(authError||auth.user?.id!==userId)throw new Error('Tu sesión cambió. Vuelve a abrir el estudio.');
  const payload={name:name.trim()||'Mi video',scenes};
  const query=existing?db.from('video_projects').update(payload).eq('id',existing.id).eq('user_id',userId).eq('revision',existing.revision):db.from('video_projects').insert({...payload,user_id:userId});
  const {data,error}=await query.select('id,name,scenes,revision,updated_at').maybeSingle();
  if(error)throw new Error('No se pudo guardar. Tus escenas siguen abiertas; reintenta.');
  if(!data)throw new Error('Este proyecto cambió en otro equipo. Usa «Guardar una copia» para conservar tu versión.');
  return data;
}
export async function proposeScene(scene:Scene,assets:RenderAsset[]):Promise<{prompt:string;notes:string}>{
  const ids=scene.mode==='transition'?[scene.startId,scene.endId]:[scene.startId];
  const images=await Promise.all(ids.map(async id=>{const asset=assets.find(a=>a.id===id);if(!asset)throw new Error('No se encontró una imagen de la escena.');return prepareImage(asset.src);}));
  const {data,error}=await supabase.functions.invoke('video-scene-prompt',{body:{images,mode:scene.mode,movement:scene.movement,duration:scene.duration,format:scene.format,brief:scene.brief},signal:AbortSignal.timeout(60000)});
  if(error){let message='No se pudo preparar el prompt. Tu texto anterior se conserva.';try{const result=await error.context?.json();if(typeof result?.error==='string')message=result.error;}catch{}throw new Error(message);}
  if(typeof data?.prompt!=='string'||typeof data?.notes!=='string')throw new Error('La respuesta de la IA no es válida.');return data;
}
