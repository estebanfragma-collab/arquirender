import type { CostEntry } from './library';
export type ImportCell = { value: string | number | null; percent?: boolean; formula?: boolean; error?: string };
export type ImportSheet = { name: string; rows: ImportCell[][]; images?: Record<number,string>; imageWarnings?:string[] };
export type Mapping = { description: number; unit: number; cost: number; markup: number; category: number; quantity?:number };
export type ImportOptions = { header: number; last: number; decimal: ','|'.'; fraction: boolean; defaultMarkup: number; category: string; file: string };
export const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
export function parseNumber(value: string | number | null | undefined, decimal: ','|'.'): number | null {
 if (typeof value === 'number') return Number.isFinite(value) && value>=0 && value<=1e9 ? value : null;
 if (typeof value !== 'string' || !value.trim()) return null;
 let v=value.trim().replace(/USD|US\$|\$/gi,'').trim().replace(/\s/g,'');
 const thousands=decimal===','?'\\.':',';
 const pattern=new RegExp(`^\\+?(?:\\d+|\\d{1,3}(?:${thousands}\\d{3})+)(?:${decimal===','?',':'\\.'}\\d+)?$`);
 if(!pattern.test(v))return null;
 v=decimal===','?v.replace(/\./g,'').replace(',','.'):v.replace(/,/g,'');
 const n=Number(v); return Number.isFinite(n)&&n>=0&&n<=1e9?n:null;
}
export function guessMapping(row: ImportCell[]): Mapping {
 const names=row.map(c=>normalize(String(c?.value??'')));
 const find=(pattern:RegExp)=>names.findIndex(n=>pattern.test(n));
 return {description:find(/descripcion|concepto|detalle|rubro/),unit:find(/^(unidad|unid|und|u\.?)$/),cost:find(/^(costo unit(ario)?\.?|costo directo|costo|precio costo)$/),markup:find(/utilidad|recargo/),category:find(/categoria|capitulo/),quantity:find(/^cantidad$/)};
}
export function guessHeader(sheet:ImportSheet) { const i=sheet.rows.slice(0,60).findIndex(row=>{const m=guessMapping(row);return m.description>=0&&m.unit>=0&&m.cost>=0;}); return i>=0?i+1:1; }
export function entryKey(e: Pick<CostEntry,'description'|'unit'|'category'>) {return [e.description,e.unit,e.category].map(normalize).join('|');}
export function reviewRows(sheet:ImportSheet, map:Mapping, o:ImportOptions) {
 const accepted: {row:number; entry:CostEntry; cached:boolean}[]=[]; const issues:{row:number;reason:string}[]=[];
 for(let ri=o.header;ri<Math.min(o.last,sheet.rows.length);ri++){
  const row=sheet.rows[ri];if(!row?.some(c=>c?.value!==null&&c?.value!==''))continue;
  const text=(idx:number)=>String(row[idx]?.value??'').trim();
  const description=text(map.description),unit=text(map.unit),c=row[map.cost],m=row[map.markup];
  if(!description || !unit){issues.push({row:ri+1,reason:'Sin descripción o unidad (posible título o subtotal).'});continue;}
  const cost=c?.error?null:parseNumber(c?.value,o.decimal);
  let markup=o.defaultMarkup;
  if(map.markup>=0 && m?.value!==null && m?.value!==undefined && m.value!==''){
   const hasSymbol=typeof m.value==='string'&&m.value.trim().endsWith('%');
   const parsed=m.error?null:parseNumber(hasSymbol?String(m.value).trim().slice(0,-1):m.value,o.decimal);
   if(parsed===null){issues.push({row:ri+1,reason:'Utilidad no válida.'});continue;}
   markup=parsed*((m.percent||o.fraction)&&!hasSymbol?100:1);
  }
  if(cost===null || markup>1e9 || !Number.isFinite(markup)){issues.push({row:ri+1,reason:c?.error||'Costo vacío, negativo o no numérico.'});continue;}
  const entry:CostEntry={id:`import-${ri+1}`,description,unit,cost,markup,category:text(map.category)||o.category||'Importados',sourceFile:o.file,sourceSheet:sheet.name,sourceRow:ri+1,image:sheet.images?.[ri+1],source:'Excel personal',note:c?.formula?'Valor guardado en Excel; la fórmula no se recalcula.':undefined};
  accepted.push({row:ri+1,entry,cached:!!c?.formula});
 }
 return {accepted,issues};
}
export function mergeEntries(existing:CostEntry[],incoming:CostEntry[]) {
 const keys=new Set(existing.map(entryKey));const added:CostEntry[]=[];let duplicates=0;
 for(const e of incoming){const key=entryKey(e);if(keys.has(key)){duplicates++;continue;} keys.add(key);added.push({...e,id:crypto.randomUUID()});}
 return {entries:[...existing,...added],added:added.length,duplicates};
}
