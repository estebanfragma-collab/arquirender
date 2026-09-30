import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import CategoryPicker from './CategoryPicker';
import { fromEntry, type CostEntry } from './library';
it('matches category aliases, keeps selection while searching, and adds only missing products',()=>{
 const entries:CostEntry[]=[{id:'custom-a',description:'Mueble prueba alfa',category:'MÓDULOS DE EXHIBICIÓN',unit:'u',cost:20,markup:25},{id:'custom-b',description:'Mueble prueba beta',category:'MOBILIARIO Y MÓDULOS',unit:'u',cost:30,markup:25},{id:'custom-c',description:'Pintura prueba',category:'ACABADOS Y GYPSUM',unit:'m2',cost:4,markup:25}];
 HTMLDialogElement.prototype.showModal=vi.fn(function(this:HTMLDialogElement){this.setAttribute('open','');});HTMLDialogElement.prototype.close=vi.fn();
 const onAdd=vi.fn();render(<CategoryPicker category="MOBILIARIO Y MÓDULOS" entries={entries} items={[fromEntry(entries[1])]} onClose={()=>{}} onAdd={onAdd}/>);
 expect(screen.queryByText('Pintura prueba')).not.toBeInTheDocument();
 expect(screen.getByLabelText('Seleccionar Mueble prueba beta')).toBeDisabled();
 fireEvent.click(screen.getByLabelText('Seleccionar Mueble prueba alfa'));
 fireEvent.change(screen.getByLabelText('Buscar productos de esta categoría'),{target:{value:'beta'}});
 fireEvent.click(screen.getByRole('button',{name:'Añadir 1 al presupuesto'}));
 expect(onAdd).toHaveBeenCalledWith([entries[0]]);
});
