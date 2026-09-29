export type Item = { image?:string; generated?:boolean;category?:string;priceKind?:string;priceReference?:string;priceFactor?:number;pendingQuantity?:boolean;pendingCost?:boolean; analysisEvidence?: {source:string;evidence:string;status:string;observation:string}; id: string; libraryId?: string; description: string; unit: string; quantity: number; cost: number; markup: number };
export type Budget = { version: 1; name: string; client: string; projectType: 'local' | 'casa'; mode: 'included' | 'fees'; feeType: 'percent' | 'fixed'; fee: number; tax: number; notes: string; items: Item[] };
export const money = (n: number) => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(n);
export const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const number = (n: number) => Number.isFinite(n) ? Math.min(1e9, Math.max(0, n)) : 0;
export function line(item: Item, mode: Budget['mode']) {
  const costTotal = round(item.quantity * item.cost);
  const price = round(item.cost * (mode === 'included' ? 1 + item.markup / 100 : 1));
  return { costTotal, price, total: round(item.quantity * price) };
}
export function totals(b: Budget) {
  const lines = b.items.filter(i=>!i.pendingQuantity&&!i.pendingCost).map(i => line(i, b.mode));
  const cost = round(lines.reduce((a, i) => a + i.costTotal, 0));
  const subtotal = round(lines.reduce((a, i) => a + i.total, 0));
  const fees = b.mode === 'fees' ? round(b.feeType === 'percent' ? cost * b.fee / 100 : b.fee) : 0;
  const beforeTax = round(subtotal + fees);
  const tax = round(beforeTax * b.tax / 100);
  return { cost, subtotal, fees, beforeTax, tax, total: round(beforeTax + tax), added: round(beforeTax - cost) };
}
export const newItem = (): Item => ({ id: crypto.randomUUID(), description: '', unit: 'm²', quantity: 1, cost: 0, markup: 25 });
export function example(): Budget {
  return { version: 1, name: 'Mi primer presupuesto', client: '', projectType: 'local', mode: 'included', feeType: 'percent', fee: 15, tax: 0, notes: 'Honorarios de administración incluidos. Define aquí el alcance, las exclusiones, el plazo y la validez de tu oferta.', items: [
    { ...newItem(), generated:true, description: 'Pintura de paredes', quantity: 100, cost: 4 },
    { ...newItem(), generated:true, description: 'Cielo raso de gypsum', quantity: 60, cost: 12 },
    { ...newItem(), generated:true, description: 'Instalación de luminarias', unit: 'u', quantity: 12, cost: 25 },
    { ...newItem(), generated:true, description: 'Transporte e instalación', unit: 'glb', quantity: 1, cost: 200 },
  ] };
}
export function validBudget(v: unknown): v is Budget {
  if (!v || typeof v !== 'object') return false;
  const b = v as Budget;
  const positive = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1e9;
  return b.version === 1 && typeof b.name === 'string' && typeof b.client === 'string' && typeof b.notes === 'string' && ['local','casa'].includes(b.projectType) && ['included','fees'].includes(b.mode) && ['percent','fixed'].includes(b.feeType) && positive(b.fee) && positive(b.tax) && Array.isArray(b.items) && b.items.length <= 1000 && b.items.every(i => i && typeof i.id === 'string' && (i.libraryId === undefined || typeof i.libraryId === 'string') && (i.image === undefined || (typeof i.image === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(i.image) && i.image.length<350000)) && typeof i.description === 'string' && typeof i.unit === 'string' && positive(i.quantity) && positive(i.cost) && positive(i.markup));
}

export const CHAPTERS=['MOBILIARIO Y MÓDULOS','ROTULACIÓN Y SEÑALÉTICA','VIDRIO Y ALUMINIO','ACABADOS Y GYPSUM','PISOS','ILUMINACIÓN','OBRA CIVIL','VARIOS, TRANSPORTE Y MONTAJE','SIN CLASIFICAR'];
export function categoryOf(i:Pick<Item,'category'>):string {
 const c=(i.category||'').toUpperCase();
 if(CHAPTERS.includes(c))return c;
 if(/MÓDULOS|MOBILIARIO/.test(c))return CHAPTERS[0];
 if(/FACHADA|VIDRI/.test(c))return CHAPTERS[2];
 if(/VARIOS|EXTRA|TRANSPORTE/.test(c))return CHAPTERS[7];
 return i.category?.trim()||'SIN CLASIFICAR';
}
export function groupedItems(items:Item[]) {
 const names=[...new Set(items.map(categoryOf))];
 names.sort((a,b)=>(CHAPTERS.includes(a)?CHAPTERS.indexOf(a):8)-(CHAPTERS.includes(b)?CHAPTERS.indexOf(b):8));
 return names.map(category=>({category,items:items.filter(i=>categoryOf(i)===category)}));
}
export function generatedBudget(b:Budget,items:Item[]):Budget{return {...b,items};}
