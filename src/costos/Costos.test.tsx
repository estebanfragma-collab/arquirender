import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import Costos from './Costos';
import {example} from './model';
beforeEach(()=>localStorage.setItem('arquirender-budget-v1',JSON.stringify(example())));
afterEach(() => {cleanup();localStorage.clear();});
it('edita, guarda y cambia a una cotización sin costos internos', () => {
 render(<Costos/>);
 fireEvent.change(screen.getByLabelText('Costo unitario 1'), {target:{value:'8'}});
 expect(JSON.parse(localStorage.getItem('arquirender-budget-v1')!).items[0].cost).toBe(8);
 fireEvent.click(screen.getByRole('button',{name:/Costos \+ honorarios/}));
 expect(screen.queryByLabelText('Utilidad 1')).toBeNull();
 fireEvent.change(screen.getByLabelText('Valor de honorarios'),{target:{value:'10'}});
 fireEvent.click(screen.getByRole('button',{name:/Vista del cliente/}));
 const table=screen.getByRole('table');
 expect(within(table).queryByText('Costo unit.')).toBeNull();
 expect(within(table).getByText('Precio unit.')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:/Volver a editar/}));
 fireEvent.click(screen.getByRole('button',{name:/Todo incluido/}));
 expect(screen.getByLabelText('Utilidad 1')).toHaveValue(25);
});
it('permite añadir y eliminar partidas',()=>{
 render(<Costos/>); fireEvent.click(screen.getByRole('button',{name:'Añadir rubro'}));
 expect(screen.getByLabelText('Descripción 5')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Eliminar rubro 5'}));
 expect(screen.queryByLabelText('Descripción 5')).toBeNull();
});
it('conecta biblioteca y presupuesto manteniendo precios independientes',()=>{
 render(<Costos/>);
 fireEvent.click(screen.getByRole('button',{name:'Biblioteca de costos'}));
 fireEvent.click(screen.getByRole('button',{name:'Crear rubro'}));
 fireEvent.change(screen.getByLabelText('Descripción del rubro'),{target:{value:'Piso de prueba'}});
 fireEvent.change(screen.getByLabelText('Costo unitario USD'),{target:{value:'20'}});
 fireEvent.click(screen.getByRole('button',{name:'Guardar rubro'}));
 fireEvent.click(screen.getByRole('button',{name:'Añadir al presupuesto'}));
 fireEvent.click(screen.getByRole('button',{name:'Editar Piso de prueba'}));
 fireEvent.change(screen.getByLabelText('Costo unitario USD'),{target:{value:'30'}});
 fireEvent.click(screen.getByRole('button',{name:'Guardar rubro'}));
 fireEvent.click(screen.getByRole('button',{name:'Presupuesto'}));
 expect(screen.getByLabelText('Costo unitario 5')).toHaveValue(20);
 fireEvent.change(screen.getByLabelText('Costo unitario 5'),{target:{value:'40'}});
 expect(JSON.parse(localStorage.getItem('arquirender-cost-library-v1')!)[0].cost).toBe(30);
 cleanup();render(<Costos/>);
 expect(screen.getByLabelText('Costo unitario 5')).toHaveValue(40);
 fireEvent.click(screen.getByRole('button',{name:'Biblioteca de costos'}));
 expect(screen.getByRole('heading',{name:'Piso de prueba'})).toBeTruthy();
});

it('starts empty and renders ordered client categories and subtotals without private prices',()=>{
 localStorage.clear();const {unmount}=render(<Costos/>);expect(screen.queryByLabelText('Descripción 1')).toBeNull();unmount();
 const b=example();b.items=[{...b.items[0],category:'PISOS'},{...b.items[1],category:'MOBILIARIO Y MÓDULOS'}];localStorage.setItem('arquirender-budget-v1',JSON.stringify(b));render(<Costos/>);fireEvent.click(screen.getByRole('button',{name:/Vista del cliente/}));
 const table=screen.getByRole('table');expect(within(table).getByText('Subtotal PISOS')).toBeTruthy();expect(within(table).queryByText('Costo unit.')).toBeNull();
 expect([...table.querySelectorAll('.cost-chapter')].map(e=>e.textContent)).toEqual(['MOBILIARIO Y MÓDULOS','PISOS']);
});

it('filters by category, edits the original row and preserves other categories',()=>{
 const b=example();b.items[0].category='PISOS';b.items[1].category='ILUMINACIÓN';
 localStorage.setItem('arquirender-budget-v1',JSON.stringify(b));render(<Costos/>);
 fireEvent.change(screen.getByLabelText('Filtrar presupuesto por categoría'),{target:{value:'ILUMINACIÓN'}});
 expect(screen.queryByLabelText('Descripción 1')).toBeNull();
 fireEvent.change(screen.getByLabelText('Cantidad 2'),{target:{value:'7'}});
 fireEvent.change(screen.getByLabelText('Categoría 2'),{target:{value:'PISOS'}});
 expect(screen.queryByLabelText('Descripción 2')).toBeNull();
 const saved=JSON.parse(localStorage.getItem('arquirender-budget-v1')!);
 expect(saved.items[1].quantity).toBe(7);expect(saved.items[0].quantity).toBe(100);
 fireEvent.click(screen.getByRole('button',{name:'Ver todos los rubros'}));
 expect(screen.getByLabelText('Categoría 2')).toHaveValue('PISOS');
});
it('keeps graphics and categories when saving a budget row to the library and client view',()=>{
 const b=example();b.items[0].category='PISOS';b.items[0].image='data:image/png;base64,aGVsbG8=';
 localStorage.setItem('arquirender-budget-v1',JSON.stringify(b));render(<Costos/>);
 fireEvent.click(screen.getByRole('button',{name:'Guardar rubro 1 en Mis costos'}));
 const saved=JSON.parse(localStorage.getItem('arquirender-cost-library-v1')!);
 expect(saved[0].category).toBe('PISOS');expect(saved[0].image).toBe(b.items[0].image);
 fireEvent.click(screen.getByRole('button',{name:/Vista del cliente/}));
 expect(screen.getByAltText(b.items[0].description)).toHaveAttribute('src',b.items[0].image);
});
