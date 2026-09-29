import { useEffect, useState } from 'react';
export default function Attachments({files,onRemove}:{files:File[];onRemove:(index:number)=>void}) {
 const [urls,setUrls]=useState<string[]>([]);
 useEffect(()=>{const next=files.map(f=>f.type.startsWith('image/')?URL.createObjectURL(f):'');setUrls(next);return()=>next.forEach(url=>{if(url)URL.revokeObjectURL(url);});},[files]);
 return <div className="cost-render-grid" aria-label="Archivos adjuntos">{files.map((file,index)=><div key={`${file.name}-${file.lastModified}-${index}`}>{urls[index]?<img src={urls[index]} alt={file.name}/>:<p>PDF · {file.name}</p>}<p>{file.name}</p><button type="button" onClick={()=>onRemove(index)}>Quitar archivo {file.name}</button></div>)}</div>;
}
