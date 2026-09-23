import { supabase } from '@/integrations/supabase/client';
const db = supabase as any;
const bucket = 'presentation-images';
export type CloudAsset = { id:string; name:string; src:string; storagePath?:string };
export type Snapshot = {version:number;assets:CloudAsset[];pages:{id:string;images:string[];[key:string]:unknown}[];template:string;active:string};
export type CloudRow = {id:string;name:string;revision:number;updated_at:string};
export async function listPresentations(userId:string):Promise<CloudRow[]> {
 const {data,error}=await db.from('presentations').select('id,name,revision,updated_at').eq('user_id',userId).order('updated_at',{ascending:false});
 if(error)throw new Error('No se pudo cargar Mis presentaciones. Reintenta.');
 return data||[];
}
export async function openPresentation(id:string,userId:string):Promise<CloudRow & {document:Snapshot}> {
 const {data,error}=await db.from('presentations').select('*').eq('id',id).eq('user_id',userId).single();
 if(error)throw new Error('No se pudo abrir la presentación.');
 if(data.document?.version!==1||!Array.isArray(data.document.pages)||!data.document.pages.length||!Array.isArray(data.document.assets))throw new Error('El formato de esta presentación no es compatible.');
 const assets=await Promise.all(data.document.assets.map(async(a:CloudAsset)=>{
   if(!a.storagePath?.startsWith(userId+'/'))throw new Error('Imagen no válida en esta presentación.');
   const {data:signed,error:e}=await supabase.storage.from(bucket).createSignedUrl(a.storagePath,86400);
   if(e)throw new Error('No se pudieron cargar las imágenes.');
   return {...a,src:signed.signedUrl};
 }));
 return {...data,document:{...data.document,assets}};
}
export async function savePresentation(userId:string,name:string,document:Snapshot,existing?:{id:string;revision:number}):Promise<CloudRow> {
 const {data:auth}=await supabase.auth.getUser();
 if(auth.user?.id!==userId)throw new Error('Tu sesión cambió. Vuelve a iniciar sesión.');
 if(!name.trim())throw new Error('Escribe un nombre para la presentación.');
 const used=new Set(document.pages.flatMap(p=>p.images));
 const assets:CloudAsset[]=[];
 for(const a of document.assets.filter(a=>used.has(a.id))){
   let path=a.storagePath;
   if(!path){
     const response=await fetch(a.src);if(!response.ok)throw new Error('No se pudo guardar una imagen. Reintenta.');
     const blob=await response.blob();
     if(!['image/png','image/jpeg','image/webp'].includes(blob.type)||blob.size>20971520)throw new Error('Usa imágenes JPG, PNG o WebP de hasta 20 MB.');
     const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(b=>b.toString(16).padStart(2,'0')).join('');
     path=`${userId}/${hash}.${blob.type==='image/jpeg'?'jpg':blob.type.split('/')[1]}`;
     const {error}=await supabase.storage.from(bucket).upload(path,blob,{contentType:blob.type,upsert:false});
     // Immutable content-addressed objects can be shared by copies of the same user's document.
     if(error){
       const {error:readError}=await supabase.storage.from(bucket).createSignedUrl(path,60);
       if(readError)throw new Error('No se pudo subir una imagen. Tu presentación anterior permanece intacta.');
     }
   }
   assets.push({...a,src:'',storagePath:path});
 }
 const payload={name:name.trim(),document:{...document,assets},user_id:userId};
 const query=existing?db.from('presentations').update(payload).eq('id',existing.id).eq('user_id',userId).eq('revision',existing.revision):db.from('presentations').insert(payload);
 const {data,error}=await query.select('id,name,revision,updated_at').maybeSingle();
 if(error)throw new Error('No se pudo guardar en la nube. Conserva el borrador y reintenta.');
 if(!data)throw new Error('Esta presentación cambió en otro equipo o fue eliminada. Guarda una copia para conservar tus cambios.');
 return data;
}
export async function deletePresentation(id:string,userId:string,revision:number){
 const {data,error}=await db.from('presentations').delete().eq('id',id).eq('user_id',userId).eq('revision',revision).select('id');
 if(error||!data?.length)throw new Error('No se pudo eliminar: actualiza la lista y vuelve a intentar.');
}
