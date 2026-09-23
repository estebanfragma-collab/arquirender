import { supabase } from '@/integrations/supabase/client';
export type Proposal = {title:string;text:string;observation:string};
export async function prepareImage(src:string):Promise<string> {
  const response=await fetch(src,{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('No se pudo cargar una imagen. Vuelve a abrir la presentación e inténtalo de nuevo.');
  const blob=await response.blob();
  if(blob.size>20*1024*1024)throw new Error('Una imagen supera los 20 MB.');
  const bitmap=await createImageBitmap(blob);
  try {
    const scale=Math.min(1,1024/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo preparar la imagen.');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const image=canvas.toDataURL('image/jpeg',0.8);
    if(image.length>900000)throw new Error('La imagen tiene demasiado detalle para analizarla. Prueba con otra vista.');
    return image;
  }finally{bitmap.close();}
}
export async function analyzePage(sources:string[],brief:string):Promise<Proposal> {
  if(sources.length<1||sources.length>3)throw new Error('Selecciona de una a tres imágenes para esta página.');
  const images=await Promise.all(sources.map(prepareImage));
  const {data,error}=await supabase.functions.invoke('analyze-presentation',{body:{images,brief},signal:AbortSignal.timeout(60000)});
  if(error){
    let message='No se pudo conectar con la IA. Tus textos siguen intactos.';
    try{const body=await error.context?.json();if(typeof body?.error==='string')message=body.error;}catch{/* Network error without response. */}
    throw new Error(message);
  }
  if(!data||typeof data.title!=='string'||typeof data.text!=='string'||typeof data.observation!=='string')throw new Error('La propuesta recibida no es válida. Reintenta.');
  return data;
}
