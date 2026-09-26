import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import LayerEditor from './LayerEditor';
import {exportSvg,initialLayers,LAYER_KEY,loadLayers} from './layers';
beforeEach(()=>localStorage.clear());afterEach(cleanup);
it('edits and deletes text, supports undo/redo and persists layers',()=>{
 render(<LayerEditor onBack={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'MI EXPOSICIÓN'}});
 expect(loadLayers().find(l=>l.id==='title')?.text).toBe('MI EXPOSICIÓN');
 fireEvent.click(screen.getByRole('button',{name:'Borrar capa'}));
 expect(loadLayers().some(l=>l.id==='title')).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(loadLayers().find(l=>l.id==='title')?.text).toBe('MI EXPOSICIÓN');
 fireEvent.click(screen.getByRole('button',{name:'Rehacer'}));
 expect(loadLayers().some(l=>l.id==='title')).toBe(false);
});
it('exports actual editable text without editor controls and escapes supplied content',()=>{
 const layers=initialLayers();layers.find(l=>l.id==='title')!.text='A & B <script>';
 const result=exportSvg(layers);
 expect(result).toContain('width="1080" height="1920"');
 expect(result).toContain('A &amp; B &lt;script&gt;');
 expect(result).not.toContain('<script>');
 expect(result).not.toContain('stroke-dasharray');
 expect(result).toContain('<text');
});
it('recovers corrupt saved data without crashing and supports an intentionally empty canvas',()=>{
 localStorage.setItem(LAYER_KEY,'[{"id":"broken"}]');expect(loadLayers()).toEqual(initialLayers());
 localStorage.setItem(LAYER_KEY,'[]');expect(loadLayers()).toEqual([]);
});

it('keeps Swiss work separate from the approved minimalist template',()=>{
 const original=initialLayers();localStorage.setItem(LAYER_KEY,JSON.stringify(original));
 render(<LayerEditor template="P07" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'T Nombre'}));
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'OTRO NOMBRE'}});
 expect(loadLayers('P07').find(l=>l.id==='name')?.text).toBe('OTRO NOMBRE');
 expect(loadLayers('P03')).toEqual(original);
 fireEvent.click(screen.getByRole('button',{name:'▧ Retrato'}));
 expect(screen.getByLabelText('Reemplazar foto')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Encuadre X'),{target:{value:'-100'}});
 expect(loadLayers('P07').find(l=>l.id==='portrait')?.offsetX).toBe(-100);
});
it('exports image crop and circle as separate layers and rejects remote image sources',()=>{
 const swiss=initialLayers('P07');
 expect(swiss.find(l=>l.id==='circle')?.type).toBe('ellipse');
 const source=exportSvg(swiss);
 expect(source).not.toContain('clip-path="url(#crop-portrait)"');
 swiss.find(l=>l.id==='portrait')!.crop='ellipse';
 expect(exportSvg(swiss)).toContain('clip-path="url(#crop-portrait)"');
 expect(source).toContain('preserveAspectRatio="xMinYMin meet"');
 swiss.find(l=>l.id==='portrait')!.src='https://example.com/tracker';
 expect(exportSvg(swiss)).not.toContain('https://example.com');
});

it('carries previous Swiss text into the redesigned composition without overwriting its old draft',()=>{
 const old=initialLayers('P07');old.find(l=>l.id==='name')!.text='MI NOMBRE';
 const saved=JSON.stringify(old);localStorage.setItem('poster-lab-P07-layers-v1',saved);
 expect(loadLayers('P07').find(l=>l.id==='name')?.text).toBe('MI NOMBRE');
 expect(loadLayers('P07').find(l=>l.id==='portrait')?.crop).toBe('none');
 expect(localStorage.getItem('poster-lab-P07-layers-v1')).toBe(saved);
});

it('edits rotated speaker text, preserves its rotation in export and isolates the other drafts',()=>{
 const swiss=initialLayers('P07');localStorage.setItem('poster-lab-P07-layers-v2',JSON.stringify(swiss));
 render(<LayerEditor template="P01" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'T Nombre'}));
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'NOMBRE NUEVO'}});
 expect(loadLayers('P01').find(l=>l.id==='name')?.text).toBe('NOMBRE NUEVO');
 expect(exportSvg(loadLayers('P01'))).toContain('rotate(90 958 292)');
 expect(loadLayers('P07')).toEqual(swiss);
 fireEvent.change(screen.getByLabelText('Rotación (grados)'),{target:{value:'45'}});
 expect(loadLayers('P01').find(l=>l.id==='name')?.rotation).toBe(45);
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(loadLayers('P01').find(l=>l.id==='name')?.rotation).toBe(90);
});

it('edits the product template independently and exports its replaceable image',()=>{
 const previous=initialLayers('P01');localStorage.setItem('poster-lab-P01-layers-v1',JSON.stringify(previous));
 render(<LayerEditor template="P02" onBack={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'MI PRODUCTO'}});
 expect(loadLayers('P02').find(l=>l.id==='title')?.text).toBe('MI PRODUCTO');
 expect(loadLayers('P01')).toEqual(previous);
 fireEvent.click(screen.getByRole('button',{name:'▧ Audífonos'}));
 expect(screen.getByLabelText('Reemplazar foto')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'Borrar capa'}));
 expect(loadLayers('P02').some(l=>l.id==='product')).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(exportSvg(loadLayers('P02'))).toContain('/poster-lab/producto-audifonos.png');
 expect(exportSvg(loadLayers('P02'))).not.toContain('clip-path="url(#crop-product)"');
});

it('keeps the lightning frame and photo independent and exports the clipping path',()=>{
 render(<LayerEditor template="P04" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'◇ Marco del rayo'}));
 fireEvent.change(screen.getByLabelText('Color'),{target:{value:'#00ff00'}});
 expect(loadLayers('P04').find(l=>l.id==='frame')?.color).toBe('#00ff00');
 fireEvent.click(screen.getByRole('button',{name:'Borrar capa'}));
 expect(loadLayers('P04').some(l=>l.id==='photo')).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 fireEvent.click(screen.getByRole('button',{name:'▧ Retratos'}));
 expect(screen.getByLabelText('Recorte')).toHaveValue('bolt');
 const output=exportSvg(loadLayers('P04'));
 expect(output).toContain('clip-path="url(#crop-photo)"');
 expect(output).toContain('<clipPath id="crop-photo"><polygon');
 expect(output).toContain('/poster-lab/collage-retratos.png');
 fireEvent.change(screen.getByLabelText('Recorte'),{target:{value:'none'}});
 expect(exportSvg(loadLayers('P04'))).not.toContain('clip-path="url(#crop-photo)"');
});

it('edits individual cinema sessions without changing adjacent rows and keeps title shadow with its text',()=>{
 render(<LayerEditor template="P05" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'T Película 2'}));
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'MI NUEVA PELÍCULA'}});
 expect(loadLayers('P05').find(l=>l.id==='film1')?.text).toBe('MI NUEVA PELÍCULA');
 expect(loadLayers('P05').find(l=>l.id==='film0')?.text).toBe('EL MAPA NOCTURNO');
 fireEvent.click(screen.getByRole('button',{name:'T Título'}));
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'OTRAS'}});
 const svg=exportSvg(loadLayers('P05'));
 expect(svg).toContain('text-shadow:6px 6px 0 #d45a28');
 expect(svg).toContain('OTRAS');
 expect(svg).toContain('/poster-lab/cine-callejon.png');
});

it('supports giant type sizes and edits a timeline stop independently',()=>{
 render(<LayerEditor template="P06" onBack={vi.fn()}/>);
 expect(screen.getByLabelText('Tamaño')).toHaveValue(360);
 fireEvent.change(screen.getByLabelText('Tamaño'),{target:{value:'380'}});
 expect(loadLayers('P06').find(l=>l.id==='title')?.size).toBe(380);
 fireEvent.click(screen.getByRole('button',{name:'T Hora parada 2'}));
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'20:30'}});
 expect(loadLayers('P06').find(l=>l.id==='time1')?.text).toBe('20:30');
 expect(loadLayers('P06').find(l=>l.id==='time0')?.text).toBe('19:30');
 expect(exportSvg(loadLayers('P06'))).not.toContain('<image');
});

it('switches formats preserving content and per-format positions, restores the last format, exports correct dimensions',()=>{
 const view=render(<LayerEditor template="P06" onBack={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'MI PASEO'}});
 fireEvent.change(screen.getByLabelText('Color'),{target:{value:'#ff0000'}});
 fireEvent.change(screen.getByLabelText('Formato'),{target:{value:'1:1'}});
 expect(screen.getByRole('group',{name:'Póster editable 1:1'})).toHaveAttribute('viewBox','0 0 1080 1080');
 expect(screen.getByLabelText('Texto')).toHaveValue('MI PASEO');
 expect(screen.getByLabelText('Color')).toHaveValue('#ff0000');
 fireEvent.change(screen.getByLabelText('Posición Y'),{target:{value:'400'}});
 fireEvent.change(screen.getByLabelText('Formato'),{target:{value:'9:16'}});
 expect(screen.getByLabelText('Posición Y')).toHaveValue(710);
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'NUEVO'}});
 fireEvent.change(screen.getByLabelText('Formato'),{target:{value:'1:1'}});
 expect(screen.getByLabelText('Posición Y')).toHaveValue(400);
 expect(screen.getByLabelText('Texto')).toHaveValue('NUEVO');
 view.unmount();render(<LayerEditor template="P06" onBack={vi.fn()}/>);
 expect(screen.getByLabelText('Formato')).toHaveValue('1:1');
 expect(screen.getByLabelText('Texto')).toHaveValue('NUEVO');
 expect(exportSvg(loadLayers('P06','1:1'),'1:1')).toContain('height="1080" viewBox="0 0 1080 1080"');
 fireEvent.change(screen.getByLabelText('Formato'),{target:{value:'4:5'}});
 expect(exportSvg(loadLayers('P06','4:5'),'4:5')).toContain('height="1350" viewBox="0 0 1080 1350"');
});

it('edits experimental waves independently and persists outlined typography',()=>{
 render(<LayerEditor template="P08" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'◇ Onda central'}));
 fireEvent.change(screen.getByLabelText('Color'),{target:{value:'#ff0088'}});
 expect(loadLayers('P08').find(l=>l.id==='wave2')?.color).toBe('#ff0088');
 expect(loadLayers('P08').find(l=>l.id==='wave1')?.color).toBe('#9bed00');
 fireEvent.click(screen.getByRole('button',{name:'Borrar capa'}));
 expect(loadLayers('P08').some(l=>l.id==='wave2')).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(loadLayers('P08').some(l=>l.id==='wave2')).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'T Laboratorio'}));
 expect(screen.getByLabelText('Solo contorno')).toBeChecked();
 fireEvent.click(screen.getByLabelText('Solo contorno'));
 expect(loadLayers('P08').find(l=>l.id==='lab')?.outline).toBe(false);
 expect(exportSvg(initialLayers('P08'))).toContain('<path d="M');
 expect(exportSvg(initialLayers('P08'))).toContain('stroke="#7025ff"');
});

it('edits gallery captions separately from its replaceable photograph',()=>{
 render(<LayerEditor template="P09" onBack={vi.fn()}/>);
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'MI GALERÍA'}});
 expect(loadLayers('P09').find(l=>l.id==='title')?.text).toBe('MI GALERÍA');
 fireEvent.click(screen.getByRole('button',{name:'▧ Fotografía urbana'}));
 expect(screen.getByLabelText('Reemplazar foto')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Ajuste de imagen'),{target:{value:'contain'}});
 expect(loadLayers('P09').find(l=>l.id==='photo')?.fit).toBe('contain');
 expect(loadLayers('P09').find(l=>l.id==='title')?.text).toBe('MI GALERÍA');
 expect(exportSvg(initialLayers('P09'))).toContain('/poster-lab/galeria-lluvia.png');
 expect(exportSvg(initialLayers('P09'))).toContain('Times New Roman');
 expect(localStorage.getItem('poster-lab-P08-layers-v1')).toBeNull();
});

it('keeps archive fragments independent and exports continuous crop windows',()=>{
 render(<LayerEditor template="P10" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'▧ Fragmento de ojos'}));
 fireEvent.change(screen.getByLabelText('Posición X'),{target:{value:'100'}});
 expect(loadLayers('P10').find(l=>l.id==='strip1')?.x).toBe(100);
 expect(loadLayers('P10').find(l=>l.id==='strip0')?.x).toBe(45);
 fireEvent.click(screen.getByLabelText('Tono sepia'));
 expect(loadLayers('P10').find(l=>l.id==='strip1')?.sepia).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Borrar capa'}));
 expect(loadLayers('P10').filter(l=>l.sliceIndex!==undefined)).toHaveLength(3);
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(loadLayers('P10').filter(l=>l.sliceIndex!==undefined)).toHaveLength(4);
 const layers=initialLayers('P10'),svg=exportSvg(layers),band=1000*310/940;
 expect(svg).toContain(`viewBox="0 ${band} 1000 ${band}"`);
 expect(svg).toContain('sepia-strip1');
 expect(localStorage.getItem('poster-lab-P09-layers-v1')).toBeNull();
});

it('edits architecture photos and lime accents independently',()=>{
 render(<LayerEditor template="P11" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'▧ Foto de maqueta'}));
 fireEvent.change(screen.getByLabelText('Encuadre X'),{target:{value:'-25'}});
 expect(loadLayers('P11').find(l=>l.id==='model')?.offsetX).toBe(-25);
 expect(loadLayers('P11').find(l=>l.id==='plans')?.offsetX).toBeUndefined();
 expect(screen.getByLabelText('Reemplazar foto')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'◇ Acento de tema'}));
 fireEvent.change(screen.getByLabelText('Color'),{target:{value:'#8844ee'}});
 expect(loadLayers('P11').find(l=>l.id==='accent1')?.color).toBe('#8844ee');
 expect(loadLayers('P11').find(l=>l.id==='accent2')?.color).toBe('#d5f22c');
 expect(exportSvg(initialLayers('P11'))).toContain('viewBox="1024 0 512 600"');
 expect(initialLayers('P11').filter(l=>l.type==='image')).toHaveLength(3);
 expect(localStorage.getItem('poster-lab-P10-layers-v1')).toBeNull();
});

it('edits conference panels, speaker and portrait independently',()=>{
 render(<LayerEditor template="P12" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'◇ Panel mostaza'}));
 fireEvent.change(screen.getByLabelText('Color'),{target:{value:'#cc8844'}});
 expect(loadLayers('P12').find(l=>l.id==='yellow')?.color).toBe('#cc8844');
 expect(loadLayers('P12').find(l=>l.id==='green')?.color).toBe('#8bab9e');
 fireEvent.click(screen.getByRole('button',{name:'T Nombre del ponente'}));
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'NUEVO PONENTE'}});
 expect(loadLayers('P12').find(l=>l.id==='name')?.text).toBe('NUEVO PONENTE');
 expect(loadLayers('P12').find(l=>l.id==='title')?.text).toBe('REIMAGINAR\nLA CIUDAD');
 fireEvent.click(screen.getByRole('button',{name:'▧ Retrato del ponente'}));
 expect(screen.getByLabelText('Blanco y negro')).toBeChecked();
 expect(screen.getByLabelText('Reemplazar foto')).toBeInTheDocument();
 expect(exportSvg(initialLayers('P12'))).toContain('/poster-lab/retrato-base.png');
 expect(localStorage.getItem('poster-lab-P11-layers-v1')).toBeNull();
});

it('edits companion text, blue background and decorative arcs independently',()=>{
 render(<LayerEditor template="P13" onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'◇ Fondo azul'}));
 fireEvent.change(screen.getByLabelText('Color'),{target:{value:'#224488'}});
 expect(loadLayers('P13').find(l=>l.id==='paper')?.color).toBe('#224488');
 fireEvent.click(screen.getByRole('button',{name:'T Título'}));
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'MI'}});
 expect(loadLayers('P13').find(l=>l.id==='title')?.text).toBe('MI');
 expect(loadLayers('P13').find(l=>l.id==='title2')?.text).toBe('HOGAR');
 fireEvent.click(screen.getByRole('button',{name:'◇ Trazo izquierdo'}));
 fireEvent.click(screen.getByRole('button',{name:'Borrar capa'}));
 expect(loadLayers('P13').some(l=>l.id==='arc1')).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(loadLayers('P13').find(l=>l.id==='arc1')?.type).toBe('arc');
 fireEvent.click(screen.getByRole('button',{name:'▧ Fotografía de los cinco gatos'}));
 expect(screen.getByLabelText('Reemplazar foto')).toBeInTheDocument();
 expect(exportSvg(initialLayers('P13'))).toContain('/poster-lab/mascotas-gatos.png');
 expect(exportSvg(initialLayers('P13'))).toContain('stroke-linecap="round"');
 expect(localStorage.getItem('poster-lab-P12-layers-v1')).toBeNull();
});

it.each(['P14','P15','P16','P17','P18','P19','P20','P21','P22','P23','P24','P25','P26','P27','P28','P29','P30','P31','P32','P33','P34','P35','P36','P37','P38','P39','P40'] as const)('%s edits text and shapes, changes format and restores deleted layers',template=>{
 const base=initialLayers(template);
 render(<LayerEditor template={template} onBack={vi.fn()}/>);
 fireEvent.click(screen.getByRole('button',{name:'T Título'}));
 fireEvent.change(screen.getByLabelText('Texto'),{target:{value:'TÍTULO PERSONALIZADO'}});
 fireEvent.change(screen.getByLabelText('Formato'),{target:{value:'1:1'}});
 expect(loadLayers(template,'1:1').find(l=>l.id==='title')?.text).toBe('TÍTULO PERSONALIZADO');
 const decor=base.find(l=>l.type!=='text'&&l.type!=='image')!;
 fireEvent.click(screen.getByRole('button',{name:'◇ '+decor.name}));
 fireEvent.change(screen.getByLabelText('Color'),{target:{value:'#ab1234'}});
 expect(loadLayers(template,'1:1').find(l=>l.id===decor.id)?.color).toBe('#ab1234');
 fireEvent.click(screen.getByRole('button',{name:'Borrar capa'}));
 expect(loadLayers(template,'1:1').some(l=>l.id===decor.id)).toBe(false);
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(loadLayers(template,'1:1').find(l=>l.id===decor.id)?.color).toBe('#ab1234');
 const image=base.find(l=>l.type==='image');
 if(image){fireEvent.click(screen.getByRole('button',{name:'▧ '+image.name}));expect(screen.getByLabelText('Reemplazar foto')).toBeInTheDocument();}
 expect(localStorage.getItem('poster-lab-P13-layers-v1')).toBeNull();
});

it('renders paper geometry as editable paths and preserves rotation in exports',()=>{
 expect(exportSvg(initialLayers('P16'))).toContain('<path');
 expect(exportSvg(initialLayers('P17'))).toContain('rotate(-38');
 expect(exportSvg(initialLayers('P20'))).toContain('rotate(-12');
});
