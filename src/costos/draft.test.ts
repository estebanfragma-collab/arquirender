import {it,expect,vi,afterEach} from 'vitest';
import {draftItems} from './analysis';
import {analysisLibrary,BASE} from './library';
import {totals,example,generatedBudget,groupedItems} from './model';
import {quoteWorkbook} from './exportQuote';
import {readFileSync} from 'node:fs';
afterEach(()=>vi.unstubAllGlobals());
it('prices all proposed rows from references while excluding genuinely unvalued lines',()=>{
 const e={...BASE[0],id:'mine',cost:100,markup:30};
 const rows=draftItems({items:[{element:'Módulo adaptado',rubricId:'mine',unit:e.unit,quantity:2,status:'ESTIMADO',priceKind:'PRECIO ESTIMADO',priceFactor:1.5,source:'foto',evidence:'Dimensión comercial supuesta',observation:''},{element:'Sin referencia',rubricId:null,unit:'u',quantity:1,status:'RUBRO PENDIENTE',source:'foto',evidence:'Visible',observation:''}],questions:[]},[e]);
 expect(rows[0].cost).toBe(150);expect(rows[1].pendingCost).toBe(true);expect(totals({...example(),items:rows,tax:15}).total).toBe(448.5);
 expect(analysisLibrary([e])[0].id).toBe('mine');expect(analysisLibrary([e],'personal')).toEqual([e]);
});
it('exports the supplied template with live formulas and technical review',async()=>{
 const bytes=readFileSync('src/costos/quote-template.xlsx');vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}));
 const book=await quoteWorkbook({...example(),tax:15});const s=book.getWorksheet('PLANTILLA COTIZACIÓN')!;
 expect(s.getCell('I4').value).toBe(.15);expect(s.getCell('F10').value).toEqual({formula:'IF(OR(D10="",E10=""),"",ROUND(D10*E10,2))'});
 expect(book.getWorksheet('REVISIÓN TÉCNICA')!.rowCount).toBe(7);
 const output=await book.xlsx.writeBuffer();expect(output.byteLength).toBeGreaterThan(1000);
});

it('replaces all earlier project rows and groups client chapters with unclassified last',()=>{
 const old={...example(),items:[...example().items,{...example().items[0],analysisEvidence:{source:'Casa anterior',status:'CONFIRMADO',evidence:'Anterior',observation:''}}]};
 const fresh=[{...example().items[0],description:'Vitrina',category:'MOBILIARIO Y MÓDULOS'}];
 expect(generatedBudget(old,fresh).items).toEqual(fresh);
 expect(groupedItems([{...fresh[0],category:undefined},...fresh]).map(g=>g.category)).toEqual(['MOBILIARIO Y MÓDULOS','SIN CLASIFICAR']);
});
