import {beforeEach,expect,it} from 'vitest';
import {formatLayers,formatHeights,initialLayers,exportSvg,layerKey,loadLayers,loadFormat,type LayerTemplate,type PosterFormat} from './layers';

beforeEach(()=>localStorage.clear());
const templates:LayerTemplate[]=['P01','P02','P03','P04','P05','P06','P07','P08','P09','P10','P11','P12','P13','P14','P15','P16','P17','P18','P19','P20','P21','P22','P23','P24','P25','P26','P27','P28','P29','P30','P31','P32','P33','P34','P35','P36','P37','P38','P39','P40'];
const formats:PosterFormat[]=['9:16','4:5','1:1'];
it.each(templates)('%s preserves content, deletions, custom layers and saved positions across formats',template=>{
 const base=initialLayers(template),original=JSON.stringify(base);
 const text=base.find(l=>l.type==='text')!;
 const deleted=base.find(l=>l.type==='text'&&l.id!==text.id)!;
 const edited=base.filter(l=>l.id!==deleted.id).map(l=>l.id===text.id?{...l,text:'MI TÍTULO',color:'#123456'}:l);
 edited.push({...text,id:'custom',text:'EXTRA',y:400});
 for(const format of formats){
  const result=formatLayers(edited,'9:16',format,undefined,template);
  expect(result.find(l=>l.id===text.id)).toMatchObject({text:'MI TÍTULO',color:'#123456'});
  expect(result.some(l=>l.id===deleted.id)).toBe(false);
  expect(result.find(l=>l.id==='custom')?.text).toBe('EXTRA');
  for(const l of result){
   for(const v of [l.x,l.y,l.w,l.h,l.size])expect(Number.isFinite(v)).toBe(true);
   if(l.type==='image')expect(l.src).toBe(base.find(b=>b.id===l.id)?.src);
   if(l.type==='ellipse')expect(l.w/l.h).toBeCloseTo(base.find(b=>b.id===l.id)!.w/base.find(b=>b.id===l.id)!.h);
  }
  expect(exportSvg(result,format)).toContain(`width="1080" height="${formatHeights[format]}"`);
  const saved=result.map(l=>l.id===text.id?{...l,x:77,y:88}:l);
  const returned=formatLayers(edited,'9:16',format,saved,template);
  expect(returned.find(l=>l.id===text.id)).toMatchObject({x:77,y:88,text:'MI TÍTULO'});
  localStorage.setItem(layerKey(template,format),JSON.stringify(saved));
  localStorage.setItem(`poster-lab-${template}-format`,format);
  expect(loadFormat(template)).toBe(format);
  expect(loadLayers(template,format)).toEqual(saved);
 }
 expect(JSON.stringify(base)).toBe(original);
});

it('adapts legacy cinema framing without overriding an explicit fit choice',()=>{
 const legacy=initialLayers('P05').map(l=>({...l,fit:undefined}));
 expect(formatLayers(legacy,'9:16','4:5',undefined,'P05').find(l=>l.id==='scene')?.fit).toBe('cover');
 const explicit=legacy.map(l=>({...l,fit:'contain' as const}));
 expect(formatLayers(explicit,'9:16','4:5',undefined,'P05').find(l=>l.id==='scene')?.fit).toBe('contain');
});

it('starts compact Swiss drafts with migrated text and compact geometry',()=>{
 localStorage.setItem('poster-lab-P07-layers-v1',JSON.stringify([{id:'name',type:'text',text:'NOMBRE GUARDADO'}]));
 const square=loadLayers('P07','1:1');
 expect(square.find(l=>l.id==='name')).toMatchObject({text:'NOMBRE GUARDADO',y:155});
 expect(square.find(l=>l.id==='paper')?.h).toBe(1080);
});
