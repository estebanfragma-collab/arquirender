import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, Search } from "lucide-react";
import { CATALOG } from "./catalog";
import { exportSvg, initialLayers, templateNames, type LayerTemplate } from "./layers";
import LayerEditor from "./LayerEditor";
import "./poster-lab.css";

// Each thumbnail uses the same layers as the editor, with unique SVG definition IDs.
const previews = Object.fromEntries(CATALOG.map(p => [p.id, exportSvg(initialLayers(p.id as LayerTemplate).map(l => ({ ...l, id: `${p.id}-${l.id}` })))]));
const categories = ["Todos", "Nuevos", ...new Set(CATALOG.map(p => p.category))];
export default function PosterStudio() {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState(() => params.get("coleccion") === "nuevos" ? "Nuevos" : "Todos");
  const [query, setQuery] = useState("");
  const selected = params.get("diseno") as LayerTemplate | null;
  useEffect(() => { document.title = "Poster Studio — Crea tu póster"; }, []);
  const open = (id?: string) => { setParams(id ? { diseno: id } : {}); window.scrollTo(0, 0); };
  if (selected && Object.prototype.hasOwnProperty.call(templateNames, selected)) return <LayerEditor key={selected} template={selected} onBack={() => open()} />;
  const visible = CATALOG.filter(p => (category === "Todos" || (category === "Nuevos" ? Number(p.id.slice(1)) >= 32 : p.category === category)) && `${p.name} ${p.category}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <div className="pl pl-studio">
    <header className="pl-header"><a className="pl-brand" href="/posters"><span>p.</span> poster studio <small>TU ESTUDIO CREATIVO</small></a><span className="pl-local">Guardado en este navegador</span></header>
    <main>
      <section className="pl-intro"><div><p className="pl-eyebrow">UNA IDEA. MUCHAS FORMAS DE CONTARLA.</p><h1>Hazlo tuyo.<br/><em>Crea tu próximo póster.</em></h1><p>Elige un diseño, cambia sus textos y colores, añade tus fotos y descarga.</p></div><div className="pl-intro-note"><span>{CATALOG.length} DISEÑOS EDITABLES</span><p>Historia · 9:16<br/>Publicación · 4:5<br/>Cuadrado · 1:1</p></div></section>
      <ol className="ps-steps"><li><b>01</b> Elige tu diseño</li><li><b>02</b> Personaliza cada pieza</li><li><b>03</b> Descarga y comparte</li></ol>
      <div className="pl-gallery-tools"><div className="pl-categories">{categories.map(c => <button key={c} className={category===c?"active":""} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="pl-search"><Search size={17}/><input aria-label="Buscar diseño" placeholder="Busca tu estilo…" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
      <p className="pl-gallery-count">{visible.length} diseños · textos, colores y fotos editables</p>
      <section className="pl-cards pl-catalog" aria-label="Diseños disponibles">{visible.map(p => <button className="pl-card" key={p.id} onClick={()=>open(p.id)} aria-label={`Personalizar ${p.name}`}><div className="ps-thumbnail" aria-hidden="true" dangerouslySetInnerHTML={{__html:previews[p.id]}}/><div className="pl-card-info"><div className="pl-card-meta"><span>{p.category}</span><span>3 formatos</span></div><strong>{p.name}</strong><div className="pl-card-bottom"><span>Personalizar diseño</span><ArrowUpRight size={18}/></div></div></button>)}</section>
      {!visible.length && <div className="pl-empty">No encontramos ese diseño. <button onClick={()=>{setQuery("");setCategory("Todos");}}>Ver todos</button></div>}
      <footer>POSTER STUDIO <span>Tus cambios se guardan en este navegador. Descarga una copia para conservarla.</span></footer>
    </main>
  </div>;
}
