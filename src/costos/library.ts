import { Item, newItem } from './model';
export type CostEntry = { id: string; description: string; unit: string; cost: number; markup: number; category: string; source?: string; sourceFile?: string; sourceSheet?: string; sourceRow?: number; note?: string };
export const LIBRARY_KEY = 'arquirender-cost-library-v1';
import catalog from './catalog.json';
export const BASE: CostEntry[] = catalog;
export function fromEntry(e: CostEntry): Item { return {...newItem(),description:e.description,unit:e.unit,cost:e.cost,markup:e.markup,libraryId:e.id,category:e.category}; }
export function entryFromItem(i: Item, id: string = crypto.randomUUID()): CostEntry { return {id,description:i.description.trim(),unit:i.unit.trim(),cost:i.cost,markup:i.markup,category:'Mis rubros'}; }
export function validLibrary(value: unknown): value is CostEntry[] {
 const n=(v:unknown)=>typeof v==='number' && Number.isFinite(v) && v>=0 && v<=1e9;
 return Array.isArray(value) && value.length<=5000 && new Set(value.map(v=>v?.id)).size===value.length && value.every(v=>v && typeof v.id==='string' && !v.id.startsWith('base-') && typeof v.description==='string' && v.description.trim().length>0 && typeof v.unit==='string' && v.unit.trim().length>0 && typeof v.category==='string' && ['source','sourceFile','sourceSheet','note'].every(k=>v[k]===undefined||typeof v[k]==='string') && (v.sourceRow===undefined||n(v.sourceRow)) && n(v.cost) && n(v.markup));
}

export function analysisLibrary(personal:CostEntry[],mode:'combined'|'personal'='combined'):CostEntry[]{
 if(mode==='personal')return personal;
 const key=(e:CostEntry)=>e.description.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()+'|'+e.unit.toLowerCase().replace('²','2').replace('³','3');
 const custom=new Map(personal.map(e=>[key(e),e]));
 return [...custom.values(),...BASE.filter(e=>!custom.has(key(e)))];
}
