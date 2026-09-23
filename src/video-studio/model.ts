export const movements = [
  {id:'push',label:'Acercamiento suave',instruction:'Slow, restrained dolly-in toward the visible main subject; no revealing unseen rooms or rear facades.'},
  {id:'slide',label:'Desplazamiento lateral',instruction:'Short, slow lateral camera slide with subtle parallax, staying within the visible architecture.'},
  {id:'rise',label:'Elevación suave',instruction:'Small, slow upward camera movement; do not reveal a roof plan or hidden geometry.'},
  {id:'fixed',label:'Cámara fija · ambiente',instruction:'Locked-off camera. Only subtle natural environmental movement already supported by the reference.'},
];
export type Scene = {id:string;name:string;mode:'animate'|'transition';startId:string;endId:string;movement:string;duration:5|10;format:'16:9'|'9:16'|'1:1';brief:string;prompt:string;notes:string;promptBasis:string};
export type RenderAsset = {id:string;src:string;name:string};
export type VideoProject = {id:string;name:string;scenes:Scene[];revision:number;updated_at:string};
export const newScene = (n=1):Scene => ({id:crypto.randomUUID(),name:`Escena ${String(n).padStart(2,'0')}`,mode:'animate',startId:'',endId:'',movement:'push',duration:5,format:'16:9',brief:'',prompt:'',notes:'',promptBasis:''});
export function basis(s:Scene){return JSON.stringify([s.mode,s.startId,s.mode==='transition'?s.endId:'',s.movement,s.duration,s.format,s.brief]);}
export function sceneError(s:Scene,assets:RenderAsset[]){
  if(!assets.some(a=>a.id===s.startId))return 'Escoge la imagen inicial de esta escena.';
  if(s.mode==='transition'&&!assets.some(a=>a.id===s.endId))return 'Escoge la imagen final de esta escena.';
  if(s.mode==='transition'&&s.startId===s.endId)return 'Elige dos imágenes distintas para la transición.';
  return '';
}
export function projectScript(name:string,scenes:Scene[],assets:RenderAsset[]){
  const assetName=(id:string)=>assets.find(a=>a.id===id)?.name||'Sin seleccionar';
  return `${name}\nESTUDIO DE VIDEO · ARQUIRENDER\n\n`+scenes.map((s,i)=>[
    `${i+1}. ${s.name}`,s.mode==='transition'?'Transición entre dos imágenes':'Animación de una imagen',
    `Inicio: ${assetName(s.startId)}`,...(s.mode==='transition'?[`Final: ${assetName(s.endId)}`]:[]),
    `Cámara: ${movements.find(m=>m.id===s.movement)?.label}`,`Duración: ${s.duration} s · Formato: ${s.format}`,
    ...(s.brief?[`Intención: ${s.brief}`]:[]),`Prompt:\n${s.prompt||'Pendiente de preparar.'}`,
    ...(s.promptBasis&&s.promptBasis!==basis(s)?['Revisar: cambiaron las imágenes o los ajustes después de preparar este prompt.']:[]),
    ...(s.notes?[`Revisión recomendada: ${s.notes}`]:[]),
  ].join('\n')).join('\n\n────────────────────────\n\n');
}

export function validScenes(value:unknown):value is Scene[]{
  if(!Array.isArray(value)||value.length<1||value.length>24)return false;
  const keys=['id','name','startId','endId','brief','prompt','notes','promptBasis'];
  return new Set(value.map(s=>s?.id)).size===value.length && value.every(s=>s&&keys.every(k=>typeof s[k]==='string')&&s.id&&s.name.length<=80&&s.brief.length<=1000&&s.prompt.length<=2200&&s.notes.length<=700&&['animate','transition'].includes(s.mode)&&movements.some(m=>m.id===s.movement)&&[5,10].includes(s.duration)&&['16:9','9:16','1:1'].includes(s.format));
}
