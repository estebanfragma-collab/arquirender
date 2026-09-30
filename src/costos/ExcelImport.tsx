import { useEffect, useRef, useState } from 'react';
import { CostEntry } from './library';
import { money } from './model';
import { ImportSheet, Mapping, guessHeader, guessMapping, reviewRows, mergeEntries } from './importModel';
type Props={entries:CostEntry[];onImport:(entries:CostEntry[],message:string)=>void;onClose:()=>void};
export default function ExcelImport({entries,onImport,onClose}:Props){
 const [sheets,setSheets]=useState<ImportSheet[]>([]),[selected,setSelected]=useState(0),[fileName,setFileName]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [header,setHeader]=useState(1),[last,setLast]=useState(1),[map,setMap]=useState<Mapping>({description:-1,unit:-1,cost:-1,markup:-1,category:-1});
 const [decimal,setDecimal]=useState<','|'.'>(','),[fraction,setFraction]=useState(false),[markup,setMarkup]=useState(0),[category,setCategory]=useState('Importados'),[excluded,setExcluded]=useState<Set<number>>(new Set());
 const worker=useRef<Worker|null>(null);const timer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>()=>{worker.current?.terminate();clearTimeout(timer.current);},[]);
 const configure=(s:ImportSheet)=>{const h=guessHeader(s);setHeader(h);setLast(s.rows.length);setMap(guessMapping(s.rows[h-1]||[]));setExcluded(new Set());};
 const load=async(file?:File)=>{
  if(!file)return; worker.current?.terminate();clearTimeout(timer.current);setSheets([]);setError('');
  if(!/\.xlsx$/i.test(file.name)){setError('Selecciona un archivo .xlsx. Para .xls, guárdalo primero como .xlsx.');setBusy(false);return;}
  if(file.size>50*1024*1024){setError('Máximo 50 MB. Divide la biblioteca en varios archivos.');setBusy(false);return;}
  setBusy(true);setFileName(file.name);
  try{
   const w=new Worker(new URL('./excel.worker.ts',import.meta.url),{type:'module'});worker.current=w;
   const fail=(message:string)=>{w.terminate();clearTimeout(timer.current);setBusy(false);setError(message);};
   w.onerror=()=>fail('No se pudo leer el archivo. Comprueba que sea un archivo .xlsx válido.');
   w.onmessage=(event:MessageEvent<{sheets?:ImportSheet[];error?:string}>)=>{if(event.data.error){fail(event.data.error);return;} const data=event.data.sheets||[];w.terminate();clearTimeout(timer.current);setBusy(false);if(!data.length){setError('El archivo no contiene hojas.');return;}setSheets(data);const i=Math.max(0,data.findIndex(s=>s.name.trim().toLowerCase()==='central costos'));setSelected(i);configure(data[i]);};
   timer.current=setTimeout(()=>fail('La lectura tardó demasiado. Usa una copia con solo los costos.'),45000);
   const buffer=await file.arrayBuffer();w.postMessage(buffer,[buffer]);
  }catch{setBusy(false);setError('No se pudo abrir el archivo.');}
 };
 const sheet=sheets[selected];
 const review=sheet?reviewRows(sheet,map,{header,last,decimal,fraction,defaultMarkup:markup,category,file:fileName}):{accepted:[],issues:[]};
 const chosen=review.accepted.filter(r=>!excluded.has(r.row));
 const result=mergeEntries(entries,chosen.map(r=>r.entry));
 const mappingValid=map.description>=0&&map.unit>=0&&map.cost>=0&&new Set([map.description,map.unit,map.cost]).size===3;
 return <section className="cost-import"><div className="cost-toolbar"><div><h2>Importar biblioteca con gráficos</h2><p className="cost-help">Importamos imágenes PNG/JPG insertadas sobre la fila y sus datos. Las imágenes dentro de celdas y la fórmula IMAGE aún no se importan. La cantidad del proyecto no se reutiliza: la IA calculará la de la nueva cotización.</p></div><button onClick={onClose}>Cerrar importación</button></div>
 <label className="cost-restore">Seleccionar Excel (.xlsx)<input aria-label="Seleccionar Excel" type="file" accept=".xlsx" disabled={busy} onChange={e=>{void load(e.target.files?.[0]);e.target.value='';}}/></label>
 {busy&&<p role="status">Leyendo {fileName}…</p>}{error&&<p role="alert" className="cost-notice">{error}</p>}
 {sheet&&<><div className="cost-import-controls"><label>Hoja<select value={selected} onChange={e=>{const i=+e.target.value;setSelected(i);configure(sheets[i]);}}>{sheets.map((s,i)=><option key={s.name} value={i}>{s.name}</option>)}</select></label><label>Fila de encabezados<input type="number" min="1" max={sheet.rows.length} value={header} onChange={e=>{const h=Math.min(sheet.rows.length,Math.max(1,+e.target.value));setHeader(h);setMap(guessMapping(sheet.rows[h-1]||[]));setExcluded(new Set());}}/></label><label>Última fila<input type="number" min={header} max={sheet.rows.length} value={last} onChange={e=>setLast(Math.min(sheet.rows.length,Math.max(header,+e.target.value)))}/></label><label>Decimales en texto<select value={decimal} onChange={e=>setDecimal(e.target.value as ','|'.')}><option value=",">Coma: 1.234,56</option><option value=".">Punto: 1,234.56</option></select></label></div>
 <div className="cost-import-controls">{([['description','Descripción'],['unit','Unidad'],['cost','Costo unitario'],['markup','Utilidad (opcional)'],['category','Categoría (opcional)']] as [keyof Mapping,string][]).map(([key,label])=><label key={key}>{label}<select value={map[key]} onChange={e=>{setMap({...map,[key]:+e.target.value});setExcluded(new Set());}}><option value={-1}>Selecciona columna</option>{(sheet.rows[header-1]||[]).map((c,i)=><option value={i} key={i}>{i+1} · {String(c.value??'Sin título').slice(0,60)}</option>)}</select></label>)}</div>
 <div className="cost-import-controls"><label>Categoría si está vacía<input value={category} onChange={e=>setCategory(e.target.value)}/></label><label>Utilidad si está vacía %<input type="number" min="0" max="1000000" value={markup} onChange={e=>setMarkup(Math.max(0,Math.min(1000000,+e.target.value)))}/></label><label>Utilidad numérica sin formato %<select value={fraction?'fraction':'points'} onChange={e=>setFraction(e.target.value==='fraction')}><option value="points">25 significa 25%</option><option value="fraction">0,25 significa 25%</option></select></label></div>
 <p className="cost-help">Usa el costo unitario, no el PVP ni el total de la partida. Los porcentajes formateados como % se reconocen automáticamente. Las fórmulas usan el resultado guardado en Excel; no se recalculan.</p>
 {!mappingValid?<p role="alert">Selecciona columnas distintas para descripción, unidad y costo.</p>:<><p>{review.accepted.filter(r=>r.entry.image).length} con gráfico · {review.accepted.length} filas válidas · {review.issues.length} omitidas · {result.duplicates} repetidas (se conservan tus precios actuales).</p>
 <div className="cost-import-preview"><table className="cost-table"><thead><tr><th>Incluir</th><th>Fila</th><th>Descripción</th><th>Unidad</th><th>Costo unit.</th><th>Utilidad %</th></tr></thead><tbody>{review.accepted.map(r=><tr key={r.row}><td><input type="checkbox" aria-label={`Incluir fila ${r.row}`} checked={!excluded.has(r.row)} onChange={()=>setExcluded(old=>{const next=new Set(old);if(next.has(r.row))next.delete(r.row);else next.add(r.row);return next;})}/></td><td>{r.row}</td><td>{r.entry.image&&<img className="cost-quote-graphic" src={r.entry.image} alt={r.entry.description}/>} {r.entry.description}{r.cached&&<small> · valor guardado</small>}</td><td>{r.entry.unit}</td><td>{money(r.entry.cost)}</td><td>{r.entry.markup}</td></tr>)}</tbody></table></div>
 {!!sheet.imageWarnings?.length&&<p role="status">{sheet.imageWarnings.join(" ")}</p>}{review.issues.length>0&&<details><summary>Ver filas omitidas</summary><ul>{review.issues.map(i=><li key={i.row}>Fila {i.row}: {i.reason}</li>)}</ul></details>}
 <button className="cost-primary" disabled={!result.added || result.entries.length>5000} onClick={()=>onImport(result.entries,`${result.added} rubros importados. ${result.duplicates} repetidos omitidos.`)}>Añadir {result.added} rubros a Mis costos</button>{result.entries.length>5000&&<p>La biblioteca admite hasta 5.000 rubros.</p>}</>}
 </>}
 </section>;
}
