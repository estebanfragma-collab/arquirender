import {Outlet, useLocation} from 'react-router-dom';
import {Image, Film, PanelsTopLeft, FolderOpen, Scissors} from 'lucide-react';
import './studio-layout.css';
export default function StudioLayout(){
 const {pathname}=useLocation();
 return <div className="arqui-dashboard"><aside className="arqui-navigation"><a className="arqui-wordmark" href="/app">arqui<span>render</span><small>ESTUDIO CREATIVO</small></a><p>CREAR</p><nav aria-label="Estudio de ArquiRender">{[{href:'/app',label:'Renders',Icon:Image},{href:'/app/videos',label:'Video',Icon:Film},{href:'/app/edicion',label:'Edición',Icon:Scissors},{href:'/app/presentaciones',label:'Presentaciones',Icon:PanelsTopLeft},{href:'/app/proyectos',label:'Mis proyectos',Icon:FolderOpen, Scissors}].map(({href,label,Icon})=><a key={href} href={href} aria-current={pathname===href?'page':undefined}><Icon size={18}/>{label}</a>)}</nav><div className="arqui-nav-note">De la idea al render.<br/>Del render a la presentación.</div></aside><div className="arqui-content"><Outlet/></div></div>;
}
export function StudioProjects(){return <main className="arqui-projects"><h1>Mis proyectos</h1><p>Continúa con tus presentaciones y secuencias guardadas.</p><div><a href="/app/presentaciones?projects=1"><PanelsTopLeft/><h2>Presentaciones</h2><p>Abre tus láminas y sigue diseñando.</p></a><a href="/app/videos?projects=1"><Film/><h2>Proyectos de video</h2><p>Recupera tus escenas, imágenes y prompts.</p></a><a href="/app/edicion"><Scissors/><h2>Montaje de video</h2><p>Continúa el montaje guardado en este equipo.</p></a></div></main>;}
