import { expect, it } from 'vitest';
import { initialLayers, exportSvg, replaceLayerImage, formatLayers, loadLayers, layerKey } from './layers';
it('replaces a nature photograph and its editable text fill together',()=>{
 const base=initialLayers('P21'),src='data:image/png;base64,AAAA';
 const changed=replaceLayerImage(base,'photo',src);
 expect(changed.find(l=>l.id==='title')).toMatchObject({type:'text',text:'AMOR',imageFill:true,src});
 expect(changed.find(l=>l.id==='photo')?.src).toBe(src);
 expect(exportSvg(changed)).toContain('patternUnits="userSpaceOnUse"');
 expect(exportSvg(changed)).not.toContain('/poster-lab/naturaleza-gorrion.png');
});
it('replaces one illustration without changing its siblings or keeping the atlas crop',()=>{
 const base=initialLayers('P24'),changed=replaceLayerImage(base,'craft1','data:image/png;base64,AAAA');
 expect(base.filter(l=>l.type==='image')).toHaveLength(10);
 expect(changed.find(l=>l.id==='craft1')).toMatchObject({spriteIndex:undefined,spriteColumns:undefined,zoom:1,offsetX:0,offsetY:0});
 expect(changed.find(l=>l.id==='craft0')).toEqual(base.find(l=>l.id==='craft0'));
 for(const format of ['9:16','4:5','1:1'] as const){
  const result=formatLayers(changed,'9:16',format,undefined,'P24');
  expect(result.find(l=>l.id==='craft1')?.spriteIndex).toBeUndefined();
  expect(exportSvg(result,format)).toContain('clip-path="url(#sprite-object0)"');
 }
});
it('persists the new cropping, photo fills, illustrations and shapes',()=>{
 localStorage.clear();
 for(const template of ['P21','P22','P23','P24','P25','P26'] as const){
  const base=initialLayers(template);
  localStorage.setItem(layerKey(template),JSON.stringify(base));
  expect(loadLayers(template)).toEqual(base);
 }
 const compact=formatLayers(initialLayers('P22'),'9:16','1:1',undefined,'P22');
 expect(compact.find(l=>l.id==='photo')).toMatchObject({crop:'arch',imageAlignTop:true,w:485});
 expect(exportSvg(initialLayers('P26'))).toContain('Q 70 -30');
});
