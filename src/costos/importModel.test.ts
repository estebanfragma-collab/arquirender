import { describe, expect, it } from 'vitest';
import { guessHeader, guessMapping, parseNumber, reviewRows, mergeEntries, ImportSheet, ImportOptions } from './importModel';
import { BASE, validLibrary } from './library';
const sheet:ImportSheet={name:'central costos',rows:[
 [{value:'Presupuesto'}],
 ['Descripción','Unidad','Costo unit','% utilidad'].map(value=>({value})),
 [{value:'Pintura'},{value:'m²'},{value:'1.294,02'},{value:0.25,percent:true}],
 [{value:'Luz'},{value:'u'},{value:20,formula:true},{value:0}],
 [{value:'Pendiente'},{value:'u'},{value:null,error:'Fórmula sin resultado guardado'},{value:0}],
 [{value:'TOTAL'}],
]};
const options:ImportOptions={header:2,last:6,decimal:',',fraction:false,defaultMarkup:10,category:'Acabados',file:'prueba.xlsx'};
describe('importación de costos',()=>{
 it('lee separadores explícitos sin convertir vacíos ni errores en cero',()=>{
  expect(parseNumber('1.294,02',',')).toBe(1294.02);expect(parseNumber('$ 1,294.02','.')).toBe(1294.02);
  expect(parseNumber('',',')).toBeNull();expect(parseNumber('#VALUE!',',')).toBeNull();expect(parseNumber('-4',',')).toBeNull();expect(parseNumber('1.294,02','.')).toBeNull();expect(parseNumber(0,',')).toBe(0);
 });
 it('detecta cabeceras y diferencia porcentaje formateado y valor guardado',()=>{
  expect(guessHeader(sheet)).toBe(2);const map=guessMapping(sheet.rows[1]);
  const r=reviewRows(sheet,map,options);expect(r.accepted).toHaveLength(2);expect(r.accepted[0].entry.markup).toBe(25);expect(r.accepted[0].entry.cost).toBe(1294.02);expect(r.accepted[1].entry.markup).toBe(0);expect(r.accepted[1].cached).toBe(true);expect(r.issues).toHaveLength(2);
 });
 it('admite fracciones explícitas y porcentajes escritos',()=>{
  const s:ImportSheet={name:'Precios',rows:[sheet.rows[1],[{value:'A'},{value:'u'},{value:4},{value:'25%'}],[{value:'B'},{value:'u'},{value:4},{value:0.4}]]};
  const r=reviewRows(s,guessMapping(s.rows[0]),{...options,header:1,last:3,fraction:true});expect(r.accepted.map(r=>r.entry.markup)).toEqual([25,40]);
 });
 it('conserva precios existentes y evita duplicados del propio archivo',()=>{
  const a=reviewRows(sheet,guessMapping(sheet.rows[1]),options).accepted[0].entry;
  const original={...a,id:'personal',cost:5};const merged=mergeEntries([original],[a,a]);expect(merged.added).toBe(0);expect(merged.duplicates).toBe(2);expect(merged.entries[0].cost).toBe(5);
 });
 it('maestro unificado conserva indirectos en costo y utilidad separada',()=>{
 expect(BASE.length).toBe(698);expect(new Set(BASE.map(e=>e.id)).size).toBe(698);
 const first=BASE.find(e=>e.id==='base-CAM-0001')!;expect(first.cost).toBeCloseTo(61.96*1.22,5);expect(first.markup).toBe(30);
 expect(BASE.every(e=>e.sourceFile&&['MAESTRO PRECIOS','central costos'].includes(e.sourceSheet||'')&&e.sourceRow)).toBe(true);
 });
});
