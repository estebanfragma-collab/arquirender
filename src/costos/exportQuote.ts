import ExcelJS from 'exceljs';
import templateUrl from './quote-template.xlsx?url';
import { Budget } from './model';
export async function quoteWorkbook(b:Budget){
 const book=new ExcelJS.Workbook();const response=await fetch(templateUrl);if(!response.ok)throw new Error('No se pudo abrir la plantilla.');await book.xlsx.load(await response.arrayBuffer());
 const sheet=book.getWorksheet('PLANTILLA COTIZACIÓN')!;
 const style=Array.from({length:13},(_,i)=>JSON.parse(JSON.stringify(sheet.getRow(10).getCell(i+1).style)));
 for(const merge of [...sheet.model.merges])if(Number(merge.match(/\d+/)?.[0])>=9)sheet.unMergeCells(merge);
 for(let r=sheet.rowCount;r>=9;r--)sheet.spliceRows(r,1);
 sheet.getCell('C2').value=b.name;sheet.getCell('I2').value=b.client;sheet.getCell('C3').value=new Date();sheet.getCell('I3').value='ArquiRender';sheet.getCell('I4').value=b.tax/100;
 sheet.getCell('A6').value='Cotización preliminar. Cantidades y analogías estimadas: ver REVISIÓN TÉCNICA. Las partidas por definir no se suman.';
 const review=book.getWorksheet('REVISIÓN TÉCNICA')!;for(let r=review.rowCount;r>=4;r--)review.spliceRows(r,1);
 const chapters=[...new Set(b.items.map(i=>i.category||'OTROS RUBROS'))];const subtotalRows:number[]=[];
 const monetary=[5,6,8,9,10,12,13];
 for(const chapter of chapters){const heading=sheet.addRow([chapter]);sheet.mergeCells(heading.number,1,heading.number,13);heading.height=25;heading.getCell(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF344B5C'}};heading.getCell(1).font={bold:true,color:{argb:'FFFFFFFF'}};
 const first=sheet.rowCount+1;
 for(const item of b.items.filter(i=>(i.category||'OTROS RUBROS')===chapter)){
 const row=sheet.addRow([item.libraryId?.replace('base-','')||'',item.description,item.unit,item.pendingQuantity?null:item.quantity,item.pendingCost?null:item.cost,null,b.mode==='included'?item.markup/100:0,null,null,null,0,null,null]);const r=row.number;
 for(let c=1;c<=13;c++)row.getCell(c).style=JSON.parse(JSON.stringify(style[c-1]));
 row.height=Math.max(38,Math.min(140,Math.ceil(item.description.length/65)*14));row.getCell(2).alignment={wrapText:true,vertical:'top'};
 const formulas:Record<number,string>={6:`IF(OR(D${r}="",E${r}=""),"",ROUND(D${r}*E${r},2))`,8:`IF(F${r}="","",ROUND(F${r}*G${r},2))`,9:`IF(E${r}="","",ROUND(E${r}*(1+G${r}),2))`,10:`IF(OR(D${r}="",I${r}=""),"",ROUND(D${r}*I${r},2))`,12:`IF(J${r}="","",ROUND(J${r}*K${r},2))`,13:`IF(J${r}="","",J${r}-L${r})`};
 for(const [col,formula] of Object.entries(formulas))row.getCell(Number(col)).value={formula};
 monetary.forEach(c=>row.getCell(c).numFmt='"$"#,##0.00');[7,11].forEach(c=>row.getCell(c).numFmt='0.0%');
 review.addRow([item.libraryId||'',item.description,`${item.priceKind||'MANUAL'} · ${item.priceReference||''} · factor ${item.priceFactor??1}`,item.analysisEvidence?.evidence||'',item.analysisEvidence?.status||'MANUAL',item.pendingCost||item.pendingQuantity?'POR DEFINIR':item.generated?'REVISAR ESTIMACIÓN':'',item.analysisEvidence?.observation||'',item.analysisEvidence?.source||'']);
 }
 const last=sheet.rowCount;const subtotal=sheet.addRow(['',`SUBTOTAL ${chapter}`]);subtotalRows.push(subtotal.number);for(const c of [6,8,10,12,13])subtotal.getCell(c).value={formula:`SUM(${String.fromCharCode(64+c)}${first}:${String.fromCharCode(64+c)}${last})`};subtotal.font={bold:true};
 }
 const total=sheet.addRow(['','SUBTOTAL RUBROS']);for(const c of [6,8,10,12,13])total.getCell(c).value={formula:subtotalRows.length?subtotalRows.map(r=>`${String.fromCharCode(64+c)}${r}`).join('+'):'0'};
 let base=total.number;
 if(b.mode==='fees'){const fee=sheet.addRow(['','HONORARIOS']);fee.getCell(13).value={formula:b.feeType==='percent'?`ROUND(F${total.number}*${b.fee/100},2)`:String(b.fee)};const before=sheet.addRow(['','TOTAL SIN IVA']);before.getCell(13).value={formula:`M${total.number}+M${fee.number}`};base=before.number;}
 const tax=sheet.addRow(['',`IVA ${b.tax}%`]);tax.getCell(13).value={formula:`ROUND(M${base}*$I$4,2)`};const grand=sheet.addRow(['',b.items.some(i=>i.pendingCost||i.pendingQuantity)?'TOTAL PARCIAL CON IVA':'TOTAL CON IVA']);grand.getCell(13).value={formula:`M${base}+M${tax.number}`};
 sheet.addRow(['','PRELIMINAR · '+b.notes]);sheet.pageSetup.printArea=`A1:M${sheet.rowCount}`;
 review.eachRow(row=>{row.alignment={wrapText:true,vertical:'top'};if(row.number>3)row.height=60;});
 sheet.eachRow(row=>{[5,6,8,9,10,12,13].forEach(c=>{if(row.number>8)row.getCell(c).numFmt='"$"#,##0.00';});});
 book.calcProperties.fullCalcOnLoad=true;
 return book;
}
export async function exportQuote(b:Budget){
 const book=await quoteWorkbook(b);
 const bytes=await book.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download='cotizacion-preliminar.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
