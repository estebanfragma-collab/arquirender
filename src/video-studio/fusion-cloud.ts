import {supabase} from '@/integrations/supabase/client';
export type SavedFusion={id:string;name:string;duration:number;created_at:string;storage_path:string;url:string};
const db=supabase as any;
export async function saveFusion(blob:Blob,id:string,name:string,duration:number){
 const {data:auth,error}=await supabase.auth.getUser();
 if(error||!auth.user)throw Error('Inicia sesión para guardar la fusión.');
 const user=auth.user.id,path=`${user}/${id}.mp4`;
 // Idempotent retry after an uncertain upload or database response.
 const {data:existing,error:readError}=await db.from('video_fusions').select('id').eq('id',id).eq('user_id',user).maybeSingle();
 if(readError)throw Error('No pudimos guardar en tu cuenta. Descarga el MP4 y reintenta guardar.');
 if(existing)return;
 const {error:uploadError}=await supabase.storage.from('video-fusions').upload(path,blob,{contentType:'video/mp4',upsert:false});
 if(uploadError&&String((uploadError as any).statusCode)!=='409')throw Error('No pudimos subir la fusión. Descarga el MP4 y reintenta guardar.');
 const {error:insertError}=await db.from('video_fusions').insert({id,user_id:user,name,duration,storage_path:path});
 if(insertError&&insertError.code!=='23505')throw Error('El archivo se subió, pero falta añadirlo al historial. Reintenta guardar.');
}
export async function listFusions():Promise<SavedFusion[]>{
 const {data:auth,error}=await supabase.auth.getUser();if(error||!auth.user)return [];
 const {data,error:err}=await db.from('video_fusions').select('id,name,duration,created_at,storage_path').eq('user_id',auth.user.id).order('created_at',{ascending:false}).limit(30);
 if(err)throw Error('No se pudo cargar el historial de fusiones.');
 return Promise.all((data||[]).map(async(row:any)=>{
  const {data:signed,error}=await supabase.storage.from('video-fusions').createSignedUrl(row.storage_path,3600);
  if(error)throw Error('No se pudo abrir una fusión guardada. Actualiza el historial.');
  return {...row,url:signed.signedUrl};
 }));
}
