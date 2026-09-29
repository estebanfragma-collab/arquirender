import { supabase } from '@/integrations/supabase/client';
import { prepareImage } from '@/presentaciones-demo/analysis';
import { pdfImages } from '@/presentaciones-demo/pdfImport';
import { CostEntry, fromEntry } from './library';
import { validateResult, type Result, type Proposal, type Input } from '../../supabase/functions/analyze-costs/validation';
import type { SavedRender } from './RenderPicker';
export type { Result, Proposal };
export async function analyzeCosts(files:File[],context:string,library:CostEntry[],progress:(s:string)=>void,renders:SavedRender[]=[]):Promise<Result> {
 const images:Input['images']=[];
 if(files.length+renders.length>12)throw new Error('Máximo 12 imágenes o páginas en total.');
 for(const render of renders)images.push({source:`Render ${render.id} · ${render.name}`.slice(0,300),data:await prepareImage(render.src,2000)});
 for(const [index,file] of files.entries()) {
  if(file.size>20*1024*1024)throw new Error('Máximo 20 MB por archivo.');
  if(file.type==='application/pdf') {
   const pages=await pdfImages(file,progress);
   if(images.length+pages.length>12)throw new Error('Selecciona hasta 12 imágenes o páginas en total. No se analizaron páginas parcialmente.');
   for(const page of pages)images.push({source:`${index+1}. ${page.name}`,data:await prepareImage(page.src,2000)});
  } else {
   if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Usa PDF, JPG, PNG o WebP.');
   const url=URL.createObjectURL(file);
   try {images.push({source:`${index+1}. ${file.name}`,data:await prepareImage(url,2000)});} finally {URL.revokeObjectURL(url);}
  }
  if(images.length>12)throw new Error('Máximo 12 imágenes o páginas.');
 }
 const body:Input={images,context,library:library.map(({id,description,unit,category})=>({id,description,unit,category}))};
 progress('Analizando el proyecto y contrastando la biblioteca…');
 const {data,error}=await supabase.functions.invoke('analyze-costs',{body,signal:AbortSignal.timeout(130000)});
 if(error){let message='No se pudo conectar al análisis. Verifica que la función analyze-costs esté publicada y tu sesión activa.';try{const r=await error.context?.json();if(typeof r?.error==='string')message=r.error;}catch{/* No response body. */}throw new Error(message);}
 if(!validateResult(data,body))throw new Error('La propuesta recibida no es válida. El presupuesto no cambió.');
 return data;
}
export function acceptedItem(p:Proposal,library:CostEntry[]) {
 const e=library.find(e=>e.id===p.rubricId);
 if(!e||e.unit!==p.unit||!['CONFIRMADO','ESTIMADO'].includes(p.status)||!p.quantity||!Number.isFinite(p.quantity)||p.quantity<=0||p.quantity>1e9)throw new Error('Completa y revisa el rubro y su cantidad.');
 return {...fromEntry(e),quantity:p.quantity,analysisEvidence:{source:p.source,evidence:p.evidence,status:p.status,observation:p.observation}};
}

export function draftItems(result:Result,library:CostEntry[]) {
 return result.items.map(p=>{
 const e=library.find(e=>e.id===p.rubricId);
 const factor=p.priceKind==='PRECIO DE BASE'?1:(p.priceFactor??1);
 const hasQuantity=typeof p.quantity==='number'&&Number.isFinite(p.quantity)&&p.quantity>0;
 return {id:crypto.randomUUID(),generated:true,libraryId:e?.id,description:p.element,unit:e?.unit||p.unit||'u',quantity:hasQuantity?p.quantity!:0,cost:e?Math.round(e.cost*factor*100)/100:0,markup:e?.markup??30,category:p.category||e?.category||'VARIOS, TRANSPORTE Y MONTAJE',priceKind:p.priceKind||'PRECIO DE BASE',priceReference:e?.description,priceFactor:factor,pendingQuantity:!hasQuantity,pendingCost:!e,analysisEvidence:{source:p.source,evidence:p.evidence,status:p.status,observation:p.observation}};
 });
}
