import { CATALOG } from '../poster-lab/catalog';
import { exportSvg, initialLayers, type LayerTemplate } from '../poster-lab/layers';

const designs = [...CATALOG].sort((a,b) => Number(b.kind === 'architecture') - Number(a.kind === 'architecture'));
const previews = Object.fromEntries(designs.map(p => [p.id, exportSvg(initialLayers(p.id as LayerTemplate).map(l => ({...l,id:`presentation-${p.id}-${l.id}`})))]));

export default function PosterTemplates() {
  return <div className="poster-template-gallery">
    <div className="poster-formats">9:16 · 4:5 · 1:1</div>
    <a className="poster-open-catalog" href="/posters" target="_blank" rel="noopener noreferrer">Abrir estudio de pósters ↗</a>
    <div className="poster-template-grid">{designs.map(p => <a key={p.id} href={`/posters?diseno=${p.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Editar ${p.name} en una pestaña nueva`}>
      <div className="poster-design-preview" aria-hidden="true" dangerouslySetInnerHTML={{__html:previews[p.id]}}/>
      <strong>{p.name} ↗</strong>
    </a>)}</div>
  </div>;
}
