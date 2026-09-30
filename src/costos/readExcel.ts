import ExcelJS from 'exceljs';
import type { ImportCell, ImportSheet } from './importModel';
function cellValue(value:ExcelJS.CellValue):ImportCell {
 if(value==null)return {value:null};
 if(typeof value==='number'||typeof value==='string')return {value};
 if(typeof value==='object' && !(value instanceof Date)){
  if('formula' in value||'sharedFormula' in value){const result=cellValue(value.result);return {...result,formula:true,error:result.value===null?'Fórmula sin resultado guardado. Abre y guarda el archivo en Excel.':result.error};}
  if('richText' in value)return {value:value.richText.map(v=>v.text).join('')};
  if('text' in value)return {value:value.text};
  if('error' in value)return {value:null,error:`Error de Excel: ${value.error}`};
 }
 return {value:null};
}
export async function readExcel(buffer:ArrayBuffer):Promise<ImportSheet[]>{
  const workbook=new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer,{ignoreNodes:['conditionalFormatting','dataValidations','extLst']});
  const sheets:ImportSheet[]=[];let count=0;
  for(const sheet of workbook.worksheets){
   if(sheet.rowCount>10000||sheet.columnCount>100)throw Error('La hoja supera 10.000 filas o 100 columnas. Guarda una copia con solo la tabla de costos.');
   const rows:ImportCell[][]=[];
   for(let r=1;r<=sheet.rowCount;r++){
    const row:ImportCell[]=[];
    for(let c=1;c<=sheet.columnCount;c++){
     const cell=sheet.getCell(r,c);row.push({...cellValue(cell.value),percent:cell.numFmt?.includes('%')});
     if(++count>1_000_000)throw Error('El archivo contiene demasiadas celdas. Usa una copia con solo la tabla de costos.');
    }
    rows.push(row);
   }
   const images:Record<number,string>={};const imageWarnings:string[]=[];
   for(const drawing of sheet.getImages()){
    const row=Math.floor(drawing.range.tl.nativeRow)+1;
    if(row<1||row>sheet.rowCount)continue;
    const media=workbook.getImage(Number(drawing.imageId));
    if(!media?.buffer||!['png','jpeg','jpg'].includes(media.extension)){imageWarnings.push(`Fila ${row}: formato de imagen no compatible.`);continue;}
    if(images[row]){imageWarnings.push(`Fila ${row}: varias imágenes; se conserva la primera.`);continue;}
    try{
     const bytes=new Uint8Array(media.buffer);const bitmap=await createImageBitmap(new Blob([bytes]));
     const scale=Math.min(1,480/Math.max(bitmap.width,bitmap.height));
     const canvas=new OffscreenCanvas(Math.max(1,Math.round(bitmap.width*scale)),Math.max(1,Math.round(bitmap.height*scale)));const ctx=canvas.getContext('2d');if(!ctx)throw Error();
     ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
     const blob=await canvas.convertToBlob({type:'image/jpeg',quality:.75});const buffer=new Uint8Array(await blob.arrayBuffer());
     if(buffer.length>250000)throw Error();
     let binary='';for(const byte of buffer)binary+=String.fromCharCode(byte);images[row]='data:image/jpeg;base64,'+btoa(binary);
    }catch{imageWarnings.push(`Fila ${row}: no se pudo leer el gráfico.`);}
   }
   sheets.push({name:sheet.name,rows,images,imageWarnings});
  }
  return sheets;
}
