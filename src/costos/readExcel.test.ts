import {it,expect,vi,afterEach} from 'vitest';
import ExcelJS from 'exceljs';
import {readExcel} from './readExcel';
import {guessMapping,reviewRows} from './importModel';
import {draftItems} from './analysis';
import {BASE,fromEntry} from './library';
afterEach(()=>vi.unstubAllGlobals());
it('carries embedded graphics from the Excel row into the cost library and a quote',async()=>{
 const w=new ExcelJS.Workbook();const s=w.addWorksheet('Costos');s.addRow(['Foto','Categoría','Descripción','Unidad','Costo unitario']);s.addRow(['','MOBILIARIO','Mostrador','u',200]);s.addRow(['','PISOS','Piso','m2',15]);
 const id=w.addImage({buffer:Buffer.from('image'),extension:'png'});s.addImage(id,{tl:{col:0,row:1},ext:{width:80,height:80}});
 vi.stubGlobal('createImageBitmap',vi.fn().mockResolvedValue({width:80,height:80,close:vi.fn()}));
 vi.stubGlobal('OffscreenCanvas',class {width=80;height=80;getContext(){return {fillStyle:'',fillRect(){},drawImage(){}};}async convertToBlob(){return {arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer};}});
 const buffer=await w.xlsx.writeBuffer();const [sheet]=await readExcel(buffer as ArrayBuffer);
 const rows=reviewRows(sheet,guessMapping(sheet.rows[0]),{header:1,last:3,decimal:'.',fraction:false,defaultMarkup:25,category:'',file:'test.xlsx'}).accepted;
 expect(rows[0].entry.image).toBe('data:image/jpeg;base64,AQID');expect(rows[1].entry.image).toBeUndefined();expect(fromEntry(rows[0].entry).image).toBe(rows[0].entry.image);expect(rows[0].entry.cost).toBe(200);
});
it('uses the matching library graphic in an AI quotation',()=>{
 const e=BASE.find(e=>e.image)!;expect(e).toBeTruthy();
 const [item]=draftItems({items:[{element:e.description,rubricId:e.id,unit:e.unit,quantity:2,status:'ESTIMADO',priceKind:'PRECIO DE BASE',source:'plano',evidence:'visible',observation:''}],questions:[]},[e]);
 expect(item.image).toBe(e.image);expect(item.cost).toBe(e.cost);
});
