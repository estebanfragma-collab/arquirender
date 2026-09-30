import { useEffect, useRef, useState } from 'react';
import { analysisLibrary, CostEntry } from './library';
import { categoryOf, Item, money } from './model';

export default function CategoryPicker({category,entries,items,onClose,onAdd}:{category:string;entries:CostEntry[];items:Item[];onClose:()=>void;onAdd:(entries:CostEntry[])=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>element?.close();},[]);
 const [search,setSearch]=useState('');
 const [selected,setSelected]=useState<Set<string>>(new Set());
 const products=analysisLibrary(entries).filter(e=>categoryOf(e)===category);
 const normalize=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const visible=products.filter(e=>normalize(e.description+' '+e.unit).includes(normalize(search)));
 const existing=new Set(items.map(i=>i.libraryId));
 return <dialog ref={dialog} className="cost-category-picker" aria-labelledby="cost-picker-title" aria-describedby="cost-picker-description" onCancel={onClose}>
  <h2 id="cost-picker-title">Añadir productos · {category}</h2>
  <p id="cost-picker-description">Completa lo que falta en esta categoría. Selecciona productos de la base ArquiRender y de Mis costos; después ajusta sus cantidades en la tabla.</p>
  <input aria-label="Buscar productos de esta categoría" placeholder="Buscar por descripción o unidad…" value={search} onChange={e=>setSearch(e.target.value)}/>
  <p>{visible.length} productos · {selected.size} seleccionados</p>
  <div className="cost-picker-list">{visible.map(e=><label key={e.id} className="cost-picker-product"><input type="checkbox" aria-label={`Seleccionar ${e.description}`} disabled={existing.has(e.id)} checked={selected.has(e.id)} onChange={event=>setSelected(previous=>{const next=new Set(previous);if(event.target.checked)next.add(e.id);else next.delete(e.id);return next;})}/>{e.image?<img src={e.image} alt=""/>:<span className="cost-picker-no-image">Sin gráfico</span>}<span><strong>{e.description}</strong><small>{entries.some(p=>p.id===e.id)?'Mis costos':'Base ArquiRender'}{existing.has(e.id)?' · Ya está en el presupuesto':''}</small></span><span className="cost-picker-price">{money(e.cost)}<small>Costo / {e.unit}</small></span></label>)}{!visible.length&&<p>No hay productos para esta búsqueda en la categoría.</p>}</div>
  <div className="cost-picker-footer"><button onClick={onClose}>Volver al presupuesto</button><button className="cost-picker-add" disabled={!selected.size} onClick={()=>onAdd(products.filter(e=>selected.has(e.id)&&!existing.has(e.id)))}>Añadir {selected.size || ''} al presupuesto</button></div>
 </dialog>;
}
