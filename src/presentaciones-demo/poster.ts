import {initialLayers,exportSvg,formatHeights,type Layer,type LayerTemplate,type PosterFormat} from '../poster-lab/layers';
export type PosterDocument={template:LayerTemplate;format:PosterFormat;layers:Layer[]};
type Asset={id:string;src:string;name:string};
export function createPoster(template:LayerTemplate,images:Asset[]):PosterDocument {
 let index=0;
 return {template,format:'9:16',layers:initialLayers(template).map(l=>l.type==='image'&&images.length?{...l,src:`asset://${images[index++%images.length].id}`,panelIndex:undefined,spriteIndex:undefined,spriteColumns:undefined,zoom:1,offsetX:0,offsetY:0} : l)};
}
export function resolvePoster(poster:PosterDocument,assets:Asset[]) {
 return poster.layers.map(l=>l.src?.startsWith('asset://')?{...l,src:assets.find(a=>a.id===l.src!.slice(8))?.src||''}:l);
}
export function posterSvg(poster:PosterDocument,assets:Asset[],prefix:string){
 return exportSvg(resolvePoster(poster,assets).map(l=>({...l,id:`${prefix}-${l.id}`})),poster.format);
}
export function posterRatio(poster:PosterDocument){return 1080/formatHeights[poster.format];}
