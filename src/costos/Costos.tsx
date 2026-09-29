import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowLeft, Printer, Eye, Download, Upload, Calculator, Check } from 'lucide-react';
import { Budget, Item, example, line, money, newItem, number, totals, validBudget } from './model';
import './costos.css';
import Library from './CostLibrary';
import CostAnalysis from './CostAnalysis';
import { CostEntry, LIBRARY_KEY, validLibrary, fromEntry, entryFromItem } from './library';
const KEY = 'arquirender-budget-v1';
function read() { try { const raw = localStorage.getItem(KEY); if (raw) { const b = JSON.parse(raw); if (validBudget(b)) return b; } } catch { /* Keep editor usable when storage is unavailable. */ } return example(); }
function Numeric({ label, value, onChange, pending=false, step = '0.01' }: { label: string; value: number; pending?:boolean; onChange: (v: number) => void; step?: string }) {
  return <input aria-label={label} type="number" min="0" max="1000000000" step={step} placeholder={pending?"Por definir":undefined} value={pending?'':value} onChange={e => onChange(number(e.target.valueAsNumber))} onFocus={e => e.target.select()} />;
}
export default function Costos() {
  const [budget, setBudget] = useState<Budget>(read);
  const [section, setSection] = useState<'budget'|'library'>('budget');
  const [entries, setEntries] = useState<CostEntry[]>(() => { try { const v = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]'); return validLibrary(v) ? v : []; } catch { return []; } });
  const [librarySaved, setLibrarySaved] = useState(false);
  useEffect(() => { try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(entries)); setLibrarySaved(true); } catch { setLibrarySaved(false); } }, [entries]);
  const saveToLibrary = (i: Item) => {
    if (!i.description.trim() || !i.unit.trim()) { setNotice('Escribe una descripción y una unidad antes de guardar el rubro.'); return; }
    const existing = entries.find(e => e.id === i.libraryId);
    if (existing && !window.confirm('¿Actualizar este rubro en Mis costos? Los demás rubros del presupuesto no cambiarán.')) return;
    const entry = {...existing, ...entryFromItem(i, existing?.id), category: existing?.category || 'Mis rubros'};
    setEntries(es => [...es.filter(e => e.id !== entry.id), entry]);
    setBudget(b => ({...b, items: b.items.map(r => r.id === i.id ? {...r, libraryId: entry.id} : r)}));
    setNotice(existing ? 'Rubro actualizado en Mis costos.' : 'Rubro guardado en Mis costos.');
  };
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [general, setGeneral] = useState(25);
  const [notice, setNotice] = useState('');
  const t = totals(budget);
  const pending=budget.items.filter(i=>i.pendingQuantity||i.pendingCost).length;
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(budget)); setSaved(true); } catch { setSaved(false); } }, [budget]);
  const change = (patch: Partial<Budget>) => setBudget(b => ({ ...b, ...patch }));
  const edit = (id: string, patch: Partial<Item>) => setBudget(b => ({ ...b, items: b.items.map(i => i.id === id ? { ...i, ...patch, ...(patch.quantity!==undefined?{pendingQuantity:false}:{}), ...(patch.cost!==undefined?{pendingCost:false}:{}) } : i) }));
  const changeMode = (mode: Budget['mode']) => { change({ mode }); setNotice(mode === 'fees' ? 'Ahora los rubros se cobran al costo y los honorarios se suman al final. Revisa también las condiciones de tu oferta.' : 'Ahora se aplica el porcentaje de cada rubro. Los honorarios separados no se suman. Revisa también las condiciones de tu oferta.'); };
  const backup = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(budget, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'presupuesto-arquirender.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  const restore = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('Archivo demasiado grande');
      const imported = JSON.parse(await file.text());
      if (!validBudget(imported)) throw new Error('Formato no compatible');
      if (!window.confirm('Abrir este respaldo reemplazará el borrador actual. ¿Continuar?')) return;
      setBudget({ ...imported, items: imported.items.map((i: Item) => ({ ...i, id: crypto.randomUUID() })) });
      setNotice('Respaldo abierto.');
    } catch { setNotice('No se pudo abrir el respaldo. Selecciona un archivo JSON descargado desde Costos.'); }
  };
  return <main className="cost-studio">
    <header className="cost-header"><div><span className="cost-eyebrow">ESTUDIO DE COSTOS · PRIMERA VERSIÓN</span><h1>Del proyecto al presupuesto.</h1><p>Controla tus costos. Define tu precio.</p></div><div className="cost-actions"><label className="cost-restore"><Upload size={16}/> Abrir respaldo<input aria-label="Abrir respaldo" type="file" accept=".json,application/json" onChange={e => { void restore(e.target.files?.[0]); e.target.value = ''; }}/></label><button onClick={backup}><Download size={16}/> Respaldo</button><button onClick={()=>{void import('./exportQuote').then(m=>m.exportQuote(budget)).catch(()=>setNotice('No se pudo exportar el Excel. Reintenta.'));}}>Descargar Excel</button><button className="cost-primary" onClick={() => { setPreview(!preview); setSection('budget'); }}>{preview ? <ArrowLeft size={16}/> : <Eye size={16}/>} {preview ? 'Volver a editar' : 'Vista del cliente'}</button></div></header>
    <nav className="cost-tabs cost-main-tabs" aria-label="Secciones de costos"><button aria-pressed={!preview && section==='budget'} onClick={()=>{setPreview(false);setSection('budget');}}>Presupuesto</button><button aria-pressed={!preview && section==='library'} onClick={()=>{setPreview(false);setSection('library');}}>Biblioteca de costos</button><button aria-pressed={preview} onClick={()=>setPreview(true)}>Cotización del cliente</button></nav>
    {!preview && section==='library' && <Library entries={entries} onChange={setEntries} saved={librarySaved} onAdd={e=>setBudget(b=>({...b,items:[...b.items,fromEntry(e)]}))}/>}
    {!preview && section==='budget' && <>
      <div className="cost-save" role="status">{saved ? <><Check size={14}/> Borrador guardado en este navegador</> : 'No se pudo guardar en este navegador. Descarga un respaldo.'}</div>
      <section className="cost-meta"><label>Nombre del presupuesto<input value={budget.name} onChange={e => change({ name: e.target.value })}/></label><label>Cliente<input placeholder="Nombre del cliente" value={budget.client} onChange={e => change({ client: e.target.value })}/></label><label>Tipo de proyecto<select value={budget.projectType} onChange={e => change({ projectType: e.target.value as Budget['projectType'] })}><option value="local">Local comercial / interiores</option><option value="casa">Casa / vivienda</option></select></label></section>
      <CostAnalysis projectType={budget.projectType} entries={entries} onGenerate={items=>{setBudget(b=>({...b,items:[...b.items.filter(i=>!i.generated),...items]}));setTimeout(()=>document.getElementById('cost-budget-table')?.scrollIntoView?.({behavior:'smooth'}),100);setNotice('Cotización preliminar lista. Las partidas de IA de la versión anterior se reemplazan; tus partidas manuales se conservan.');}}/>
      <section className="cost-method"><div><span className="cost-eyebrow">01 / FORMA DE COBRO</span><h2>Tu presupuesto, a tu manera.</h2></div><div className="cost-options"><button aria-pressed={budget.mode === 'included'} onClick={() => changeMode('included')}><strong>Todo incluido</strong><span>Tu porcentaje dentro de cada rubro.</span></button><button aria-pressed={budget.mode === 'fees'} onClick={() => changeMode('fees')}><strong>Costos + honorarios</strong><span>Tu remuneración al final del presupuesto.</span></button></div></section>
      {notice && <p className="cost-notice" role="status">{notice}</p>}
      {pending>0&&<p className="cost-notice">Total parcial: {pending} partidas por definir no están sumadas. Completa sus cantidades o costos en la tabla.</p>}
      <section className="cost-metrics"><div><span>Costo de la obra</span><strong>{money(t.cost)}</strong></div><div><span>{budget.mode === 'included' ? 'Incremento sobre el costo' : 'Honorarios'}</span><strong>{money(t.added)}</strong><small>{budget.mode === 'included' ? 'Para cubrir administración, honorarios y utilidad.' : 'Calculados sobre el costo, sin impuestos.'}</small></div><div className="cost-highlight"><span>Total para el cliente</span><strong>{money(t.total)}</strong><small>{budget.tax ? `Incluye impuesto del ${budget.tax}%` : 'Sin impuestos añadidos'}</small></div></section>
      <section id="cost-budget-table" className="cost-work"><div className="cost-toolbar"><div><span className="cost-eyebrow">02 / RUBROS</span><h2>Construye tu cotización</h2></div>{budget.mode === 'included' && <div className="cost-bulk"><label>Utilidad general %<Numeric label="Utilidad general" value={general} onChange={setGeneral}/></label><button onClick={() => { change({ items: budget.items.map(i => ({ ...i, markup: general })) }); setNotice(`Se aplicó ${general}% sobre el costo a todos los rubros.`); }}>Aplicar a todos</button></div>}</div>
      <p className="cost-help">Cotización preliminar en USD. Edita cantidades, costos y utilidad. Las estimaciones conservan su fundamento en Revisión técnica.</p>
      <div className="cost-table-wrap"><table className="cost-table"><thead><tr><th>Descripción</th><th>Unidad</th><th>Cantidad</th><th>Costo unit.</th><th>Costo total</th>{budget.mode === 'included' && <th>Utilidad %</th>}<th>PVP unit.</th><th>PVP total</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{budget.items.map((i, index) => { const l = line(i, budget.mode); return <tr key={i.id}><td><input aria-label={`Descripción ${index + 1}`} placeholder="Descripción del rubro" value={i.description} onChange={e => edit(i.id, { description: e.target.value })}/>{i.generated&&<small>{i.category} · {i.priceKind} · {i.analysisEvidence?.status}</small>}</td><td><input aria-label={`Unidad ${index + 1}`} value={i.unit} onChange={e => edit(i.id, { unit: e.target.value })}/></td><td><Numeric label={`Cantidad ${index + 1}`} value={i.quantity} pending={i.pendingQuantity} onChange={v => edit(i.id, { quantity: v })}/></td><td><Numeric label={`Costo unitario ${index + 1}`} value={i.cost} pending={i.pendingCost} onChange={v => edit(i.id, { cost: v })}/></td><td>{i.pendingCost||i.pendingQuantity?'Por definir':money(l.costTotal)}</td>{budget.mode === 'included' && <td><Numeric label={`Utilidad ${index + 1}`} value={i.markup} onChange={v => edit(i.id, { markup: v })}/></td>}<td>{i.pendingCost?'Por definir':money(l.price)}</td><td className="cost-line-total">{i.pendingCost||i.pendingQuantity?'Por definir':money(l.total)}</td><td><button title="Guardar los datos de esta partida en tu biblioteca" aria-label={`Guardar rubro ${index + 1} en Mis costos`} onClick={() => saveToLibrary(i)}>{entries.some(e=>e.id===i.libraryId)?'Actualizar en Mis costos':'Guardar en Mis costos'}</button><button aria-label={`Eliminar rubro ${index + 1}`} onClick={() => change({ items: budget.items.filter(r => r.id !== i.id) })}><Trash2 size={15}/></button></td></tr>; })}</tbody></table></div>
      {!budget.items.length && <p className="cost-empty">Añade tu primer rubro para comenzar.</p>}
      <button className="cost-add" onClick={()=>setSection('library')}>Desde la biblioteca</button> <button className="cost-add" onClick={() => change({ items: [...budget.items, newItem()] })}><Plus size={17}/> Añadir rubro</button>
      {budget.mode === 'included' && <p className="cost-help">Utilidad % se aplica sobre el costo. PVP unitario = costo × (1 + porcentaje / 100).</p>}
      </section>
      <details className="cost-work"><summary>Revisión técnica · supuestos y origen de precios</summary>{budget.items.filter(i=>i.analysisEvidence).map(i=><article key={i.id} className="cost-ai-row"><strong>{i.description}</strong><p>{i.category} · {i.priceKind} · {i.analysisEvidence?.status}</p><p>Referencia: {i.priceReference||'Sin precio comparable'} · Factor: {i.priceFactor??1}</p><p>{i.analysisEvidence?.source}</p><p>{i.analysisEvidence?.evidence}</p><p>{i.analysisEvidence?.observation}</p></article>)}</details>
      <section className="cost-bottom"><label>Alcance y condiciones<textarea rows={5} value={budget.notes} onChange={e => change({ notes: e.target.value })}/></label><div className="cost-summary">
      {budget.mode === 'fees' && <div className="cost-fee"><label>Honorarios<select value={budget.feeType} onChange={e => change({ feeType: e.target.value as Budget['feeType'] })}><option value="percent">Porcentaje del costo de obra</option><option value="fixed">Monto fijo en USD</option></select></label><label>{budget.feeType === 'percent' ? 'Porcentaje %' : 'Monto USD'}<Numeric label="Valor de honorarios" value={budget.fee} onChange={v => change({ fee: v })}/></label><small>Base: {money(t.cost)} de costos. No incluye impuestos ni porcentajes por rubro.</small></div>}
      <label>Impuesto %<Numeric label="Impuesto" value={budget.tax} onChange={v => change({ tax: v })}/></label><div><span>Subtotal de rubros</span><b>{money(t.subtotal)}</b></div>{budget.mode === 'fees' && <div><span>Honorarios</span><b>{money(t.fees)}</b></div>}<div><span>Impuestos</span><b>{money(t.tax)}</b></div><div className="cost-grand"><span>Total</span><b>{money(t.total)}</b></div></div></section>
    </>}
    <section className={`cost-client ${preview ? 'is-visible' : ''}`} aria-hidden={!preview}>
      <div className="cost-print-actions"><p>Así verá el cliente tu cotización. Los costos internos y porcentajes por rubro están ocultos.</p><button onClick={() => window.print()}><Printer size={16}/> Imprimir / Guardar PDF</button></div>
      <article className="cost-paper"><div className="cost-paper-top"><span>COTIZACIÓN</span><Calculator size={26}/></div><h2>{budget.name || 'Presupuesto'}</h2><p>{budget.client || 'Cliente por definir'} · {budget.projectType === 'casa' ? 'Vivienda' : 'Local comercial / interiores'}</p><table><thead><tr><th>Descripción</th><th>Unidad</th><th>Cantidad</th><th>Precio unit.</th><th>Total</th></tr></thead><tbody>{budget.items.map(i => { const l = line(i, budget.mode); return <tr key={i.id}><td>{i.description || 'Rubro sin descripción'}</td><td>{i.unit}</td><td>{i.pendingQuantity?'Por definir':i.quantity}</td><td>{i.pendingCost?'Por definir':money(l.price)}</td><td>{i.pendingCost||i.pendingQuantity?'Por definir':money(l.total)}</td></tr>; })}</tbody></table><div className="cost-paper-totals"><p><span>Subtotal</span><b>{money(t.subtotal)}</b></p>{budget.mode === 'fees' && <p><span>Honorarios {budget.feeType === 'percent' ? `(${budget.fee}% sobre costos)` : '(monto fijo)'}</span><b>{money(t.fees)}</b></p>}<p><span>Impuestos ({budget.tax}%)</span><b>{money(t.tax)}</b></p><p className="cost-paper-grand"><span>Total USD</span><b>{money(t.total)}</b></p></div>{pending>0&&<p>Total parcial: {pending} partidas pendientes de valoración, no incluidas.</p>}<h3>Alcance y condiciones</h3><p className="cost-paper-notes">{budget.notes || 'Sin condiciones especificadas.'}</p><footer>Preparado con ArquiRender</footer></article>
    </section>
  </main>;
}
