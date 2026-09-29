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
self.onmessage=async(event:MessageEvent<ArrayBuffer>)=>{
 try{
  const workbook=new ExcelJS.Workbook();
  await workbook.xlsx.load(event.data,{ignoreNodes:['drawing','picture','conditionalFormatting','dataValidations','extLst']});
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
   sheets.push({name:sheet.name,rows});
  }
  self.postMessage({sheets});
 }catch(error){self.postMessage({error:error instanceof Error?error.message:'No se pudo leer el Excel.'});}
};
