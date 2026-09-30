import {Outlet, useLocation} from 'react-router-dom';
import {Image, Film, PanelsTopLeft, FolderOpen, Scissors, Calculator, HardHat} from 'lucide-react';
import {useDocument} from '../costos/storage';
import {emptySavedBudgets,SAVED_BUDGETS_KEY,SavedBudgetsDocument,validSavedBudgets} from '../costos/projects';
import {emptyDocument,validWorksDocument,WORKS_KEY,WorksDocument,money} from '../obras/model';
import './studio-layout.css';
export default function StudioLayout(){
 const {pathname}=useLocation();
 return <div className="arqui-dashboard"><aside className="arqui-navigation"><a className="arqui-wordmark" href="/app">arqui<span>render</span><small>ESTUDIO CREATIVO</small></a><p>CREAR</p><nav aria-label="Estudio de ArquiRender">{[{href:'/app',label:'Renders',Icon:Image},{href:'/app/videos',label:'Video',Icon:Film},{href:'/app/edicion',label:'Edición',Icon:Scissors},{href:'/app/presentaciones',label:'Presentaciones',Icon:PanelsTopLeft},{href:'/app/costos',label:'Costos',Icon:Calculator},{href:'/app/obras',label:'Obras',Icon:HardHat},{href:'/app/proyectos',label:'Mis proyectos',Icon:FolderOpen}].map(({href,label,Icon})=><a key={href} href={href} aria-current={pathname===href?'page':undefined}><Icon size={18}/>{label}</a>)}</nav><div className="arqui-nav-note">De la idea al render.<br/>Del presupuesto a la obra.</div></aside><div className="arqui-content"><Outlet/></div></div>;
}
export function StudioProjects(){
 const [quotes,,,quotesReady]=useDocument<SavedBudgetsDocument>(SAVED_BUDGETS_KEY,emptySavedBudgets,validSavedBudgets);
 const [works,,,worksReady]=useDocument<WorksDocument>(WORKS_KEY,emptyDocument,validWorksDocument);
 if(!quotesReady||!worksReady)return <main className="arqui-projects" role="status">Abriendo tus proyectos…</main>;
 return <main className="arqui-projects"><h1>Mis proyectos</h1><p>Cotizaciones y obras guardadas, conectadas desde el presupuesto hasta la ejecución.</p>
  <section className="arqui-project-section"><div className="arqui-project-title"><div><Calculator/><h2>Cotizaciones</h2><span>{quotes.projects.length}</span></div><a href="/app/costos">Nueva cotización</a></div>{quotes.projects.length?<div className="arqui-saved-grid">{quotes.projects.map(project=><a key={project.id} href={`/app/costos?quote=${project.id}`}><span>COTIZACIÓN</span><h3>{project.name}</h3><p>{project.client||'Cliente por definir'}</p><strong>{money(project.total)}</strong><small>{project.itemCount} rubros · Actualizada {new Date(project.updatedAt).toLocaleDateString('es-EC')}</small></a>)}</div>:<p className="arqui-project-empty">Cuando pulses “Guardar cotización” en Costos aparecerá aquí.</p>}</section>
  <section className="arqui-project-section"><div className="arqui-project-title"><div><HardHat/><h2>Obras</h2><span>{works.works.length}</span></div><a href="/app/obras">Abrir gestor</a></div>{works.works.length?<div className="arqui-saved-grid">{works.works.map(work=><a key={work.id} href={`/app/obras?work=${work.id}`}><span>{work.status==='active'?'EN EJECUCIÓN':'OBRA'}</span><h3>{work.name}</h3><p>{work.client||'Cliente por definir'}{work.location?` · ${work.location}`:''}</p><strong>{money(work.budget)}</strong><small>{work.tasks.length} actividades en cronograma</small></a>)}</div>:<p className="arqui-project-empty">Crea una obra directamente o conviértela desde una cotización terminada.</p>}</section>
  <section className="arqui-tools"><a href="/app/presentaciones?projects=1"><PanelsTopLeft/><h2>Presentaciones</h2><p>Abre tus láminas y sigue diseñando.</p></a><a href="/app/videos?projects=1"><Film/><h2>Proyectos de video</h2><p>Recupera tus escenas, imágenes y prompts.</p></a><a href="/app/edicion"><Scissors/><h2>Montaje de video</h2><p>Continúa el montaje guardado en este equipo.</p></a></section>
 </main>;
}
