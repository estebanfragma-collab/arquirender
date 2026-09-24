import {describe,it,expect} from 'vitest';
import {pageTemplate,setPageTemplate,sheetPrintStyles} from './templates';
describe('estilos por lámina',()=>{
 it('cambia solo la seleccionada y mantiene texto, imágenes y las otras páginas',()=>{
  const original=[{id:'a',title:'Primera',images:['x']},{id:'b',title:'Segunda',images:['y']}];
  const pages=setPageTemplate(original,'b','inmersiva');
  expect(pages[0]).toBe(original[0]);expect(pages[1]).toEqual({...original[1],template:'inmersiva'});
  expect(pageTemplate(pages[0],'materialidad')).toBe('materialidad');expect(pageTemplate(pages[1],'materialidad')).toBe('inmersiva');
  const recovered=JSON.parse(JSON.stringify({version:1,template:'materialidad',pages}));
  expect(recovered.pages.map((p:any)=>pageTemplate(p,recovered.template))).toEqual(['materialidad','inmersiva']);
 });
 it('admite documentos anteriores y mantiene estilo al duplicar o reordenar',()=>{
  const old={id:'a',images:['x']};expect(pageTemplate(old,'sintesis')).toBe('sintesis');
  const copy={...old,id:'copy',template:pageTemplate(old,'sintesis')};
  const pages=setPageTemplate([old,copy],'a','editorial').reverse();
  expect(pages.map(p=>pageTemplate(p,'sintesis'))).toEqual(['sintesis','editorial']);
  expect(pageTemplate({template:'invalid'},'invalid')).toBe('editorial');
 });
 it('imprime tamaños de página distintos según el estilo de cada lámina',()=>{
  expect(sheetPrintStyles).toContain('@page sheetPortrait { size: 210mm 280mm');
  expect(sheetPrintStyles).toContain('.sheet.sintesis { page: sheetPortrait; }');
  expect(sheetPrintStyles).toContain('.sheet { page: sheetLandscape; }');
 });
});
