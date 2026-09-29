import { CATALOG } from '../poster-lab/catalog';
import { exportSvg, initialLayers, type LayerTemplate } from '../poster-lab/layers';

const designs = [...CATALOG].sort((a,b) => Number(b.kind === 'architecture') - Number(a.kind === 'architecture'));
const previews = Object.fromEntries(designs.map(p => [p.id, exportSvg(initialLayers(p.id as LayerTemplate).map(l => ({...l,id:`presentation-${p.id}-${l.id}`})))]));

export default function PosterTemplates({onSelect}:{onSelect:(id:LayerTemplate)=>void}) {
  return <div className="poster-template-gallery">
    <div className="poster-formats">9:16 · 4:5 · 1:1</div>

    <div className="poster-template-grid">{designs.map(p => <button key={p.id} onClick={()=>onSelect(p.id as LayerTemplate)} aria-label={`Aplicar ${p.name} a esta lámina`}>
      <div className="poster-design-preview" aria-hidden="true" dangerouslySetInnerHTML={{__html:previews[p.id]}}/>
      <strong>{p.name}</strong>
    </button>)}</div>
  </div>;
}
