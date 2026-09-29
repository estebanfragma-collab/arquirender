import { Item } from './model';
export default function ItemGraphic({item,onChange,onError}:{item:Item;onChange:(image:string|undefined)=>void;onError:(message:string)=>void}) {
 const upload=async(file?:File)=>{
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10_000_000){onError('Elige una imagen JPG, PNG o WebP de hasta 10 MB.');return;}
  const url=URL.createObjectURL(file);
  try{
   const img=new Image();img.src=url;await img.decode();
   const scale=Math.min(1,480/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
   const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/jpeg',.75);if(data.length>=350000)throw new Error('Size');onChange(data);
  }catch{onError('No se pudo preparar la imagen. Prueba con otro archivo.');}finally{URL.revokeObjectURL(url);}
 };
 return <details className="cost-item-graphic"><summary>{item.image?'Ver gráfico del rubro':'Añadir gráfico del rubro'}</summary>{item.image&&<><img src={item.image} alt={item.description}/><button onClick={()=>onChange(undefined)}>Quitar gráfico</button></>}<label>Imagen para reconocer este rubro y mostrar al cliente<input aria-label={`Gráfico de ${item.description||'rubro sin descripción'}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}}/></label></details>;
}
