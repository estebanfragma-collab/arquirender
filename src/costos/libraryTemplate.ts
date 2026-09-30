import ExcelJS from 'exceljs';
export async function downloadLibraryTemplate(){
 const w=new ExcelJS.Workbook();const s=w.addWorksheet('Mis costos');
 s.columns=[{header:'Foto',key:'image',width:24},{header:'Categoría',width:28},{header:'Descripción',width:65},{header:'Unidad',width:12},{header:'Cantidad',width:12},{header:'Costo unitario',width:20},{header:'Utilidad %',width:16},{header:'PVP unitario',width:20},{header:'PVP total',width:20}];
 s.addRow(['','MOBILIARIO Y MÓDULOS','Ejemplo: mostrador de atención','u',1,100,.25,{formula:'F2*(1+G2)',result:125},{formula:'E2*H2',result:125}]);s.getRow(2).height=95;s.getColumn(7).numFmt='0%';[6,8,9].forEach(c=>s.getColumn(c).numFmt='0.00');
 const help=w.addWorksheet('Cómo importar');help.getColumn(1).width=115;
 ['Inserta cada fotografía sobre la columna Foto, dentro de la fila de su rubro (imagen flotante anclada a esa fila).','Usa una fila por rubro y completa Categoría, Descripción, Unidad y Costo unitario.','Costo unitario es tu costo interno. PVP unitario incluye la utilidad; no lo importes como costo.','Cantidad y totales pertenecen al proyecto de ejemplo. La biblioteca conserva el precio por unidad.','Guarda como .xlsx. Las imágenes insertadas se importan; IMAGE(), enlaces y las imágenes en celda de Excel no son compatibles todavía.','Borra la fila de ejemplo antes de completar tu biblioteca.'].forEach(t=>help.addRow([t]));
 const url=URL.createObjectURL(new Blob([await w.xlsx.writeBuffer()],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download='biblioteca-costos-con-graficos.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
