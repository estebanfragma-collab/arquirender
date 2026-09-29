import { describe, expect, it } from 'vitest';
import { example, line, totals, validBudget } from './model';
describe('presupuestos', () => {
 it('calcula el incremento sobre costo y los impuestos', () => {
  const b = example(); b.items = [{ id:'a', description:'Pintura', unit:'m²', quantity:100, cost:4, markup:25 }]; b.tax=15;
  expect(totals(b)).toEqual({cost:400,subtotal:500,fees:0,beforeTax:500,tax:75,total:575,added:100});
 });
 it('no duplica porcentajes y honorarios al cambiar de modalidad', () => {
  const b=example(); b.items=[{id:'a',description:'Obra',unit:'glb',quantity:1,cost:1000,markup:40}]; b.mode='fees'; b.fee=10;
  expect(totals(b).total).toBe(1100); b.feeType='fixed'; b.fee=250; expect(totals(b).total).toBe(1250);
  b.mode='included'; expect(totals(b).total).toBe(1400); expect(totals(b).fees).toBe(0);
 });
 it('multiplica el precio unitario redondeado que verá el cliente', () => {
  expect(line({id:'a',description:'',unit:'m²',quantity:3,cost:2.33,markup:15},'included')).toEqual({costTotal:6.99,price:2.68,total:8.04});
 });
 it('admite cantidades decimales y presupuestos sin rubros', () => {
  const b=example(); b.items=[]; expect(totals(b).total).toBe(0);
  b.items=[{id:'a',description:'',unit:'m²',quantity:2.5,cost:4,markup:0}]; expect(totals(b).total).toBe(10);
 });
 it('rechaza datos guardados incompletos o no finitos', () => {
  expect(validBudget(example())).toBe(true); expect(validBudget({version:1})).toBe(false);
  const b=example(); b.items[0].cost=Infinity; expect(validBudget(b)).toBe(false);
 });
});
