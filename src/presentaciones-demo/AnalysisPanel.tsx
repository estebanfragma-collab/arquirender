import { useState } from 'react';
import { analyzePage, type Proposal } from './analysis';

type Props = {sources:string[];onApply:(changes:{title?:string;text?:string})=>void;onBusy:(busy:boolean)=>void};
export function AnalysisPanel({sources,onApply,onBusy}:Props) {
  const [brief,setBrief]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [proposal,setProposal]=useState<Proposal|null>(null);
  const [titleSelected,setTitleSelected]=useState(true);
  const [textSelected,setTextSelected]=useState(true);
  async function analyze(){
    setBusy(true);onBusy(true);setError('');setProposal(null);
    try{setProposal(await analyzePage(sources,brief));setTitleSelected(true);setTextSelected(true);}
    catch(e){setError(e instanceof Error?e.message:'No se pudo analizar. Reintenta.');}
    finally{setBusy(false);onBusy(false);}
  }
  return <section className="analysis-panel" aria-label="Textos con IA" aria-busy={busy}>
    <h3>Textos con IA</h3>
    <p>Analiza las imágenes de esta página y recibe un título y una descripción. Tú decides qué aplicar.</p>
    <label>¿Qué quieres destacar?<textarea rows={3} maxLength={1000} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Ej.: la luz cálida y la relación con el exterior"/></label>
    <button className="primary" disabled={busy||!sources.length} onClick={analyze}>{busy?'Analizando imágenes…':'Analizar esta página con IA'}</button>
    {!sources.length&&<p>Primero selecciona al menos una imagen.</p>}
    <small>Se envían a OpenAI copias reducidas de las imágenes seleccionadas y tu indicación. Hasta 30 análisis diarios; no consume créditos de renders.</small>
    {error&&<p role="alert">{error}</p>}
    {proposal&&<div className="ai-proposal"><h3>Revisa la propuesta</h3>{proposal.observation&&<p role="status">{proposal.observation}</p>}
      <label className="number-option"><input type="checkbox" checked={titleSelected} onChange={e=>setTitleSelected(e.target.checked)}/> Aplicar título</label>
      <textarea aria-label="Título propuesto" rows={3} maxLength={90} value={proposal.title} onChange={e=>setProposal({...proposal,title:e.target.value})}/>
      <label className="number-option"><input type="checkbox" checked={textSelected} onChange={e=>setTextSelected(e.target.checked)}/> Aplicar descripción</label>
      <textarea aria-label="Descripción propuesta" rows={5} maxLength={250} value={proposal.text} onChange={e=>setProposal({...proposal,text:e.target.value})}/>
      <p>Aplicar reemplaza únicamente los campos marcados. Después puedes editarlos o dejarlos vacíos.</p>
      <button className="primary" disabled={!titleSelected&&!textSelected} onClick={()=>{onApply({...titleSelected?{title:proposal.title}:{},...textSelected?{text:proposal.text}:{}});setProposal(null);}}>Aplicar selección</button>
      <button onClick={()=>setProposal(null)}>Descartar propuesta</button>
    </div>}
  </section>;
}
