import {describe,it,expect} from 'vitest';
import {pageTemplate,setPageTemplate,sheetPrintStyles,documentFormat} from './templates';
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
 it('recupera documentos antiguos y conserva el formato elegido',()=>{expect(documentFormat(undefined)).toBe('16:9');expect(documentFormat(JSON.parse(JSON.stringify({format:'9:16'})).format)).toBe('9:16');});
 it('usa una sola medida de impresión para todas las páginas',()=>{
  expect(sheetPrintStyles('16:9')).toContain('size: 320mm 180mm');
  expect(sheetPrintStyles('9:16')).toContain('size: 180mm 320mm');
  expect(sheetPrintStyles('9:16')).toContain('page:presentation!important');
  expect(sheetPrintStyles('9:16')).toContain('break-inside:avoid!important');
 });
});
