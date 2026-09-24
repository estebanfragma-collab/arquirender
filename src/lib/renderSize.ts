export function sizeForDimensions(width:number,height:number){
 const ratio=width/height;
 if(!Number.isFinite(ratio)||ratio<=0)return '1536x1024';
 const r=Math.min(3,Math.max(1/3,ratio));
 if(Math.abs(r-1)<.01)return '1024x1024';
 const edge = r>=1.5 || r<=2/3 ? 1536 : 1248;
 return r>=1 ? `${edge}x${Math.round(edge/r/16)*16}` : `${Math.round(edge*r/16)*16}x${edge}`;
}
export function renderSize(src:string):Promise<string>{
 if(!src)return Promise.resolve('1536x1024');
 return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(sizeForDimensions(image.naturalWidth,image.naturalHeight));image.onerror=()=>reject(new Error('No se pudo leer el formato de la imagen.'));image.src=src;});
}
