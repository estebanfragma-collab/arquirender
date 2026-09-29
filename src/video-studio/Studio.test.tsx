import {fireEvent,render,screen,cleanup,within} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {Editor} from './Studio';
vi.mock('./Clips',()=>({default:()=>null}));
vi.mock('./api',()=>({listProjects:vi.fn(),saveProject:vi.fn(),proposeScene:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{}}));
afterEach(()=>{cleanup();localStorage.clear();vi.restoreAllMocks();});
it('shows only compatible effects, keeps the mode stable, and clears old prompts when switching modes',()=>{
 vi.spyOn(window,'confirm').mockReturnValue(true);
 render(<Editor session={{id:'test',assets:[{id:'first',src:'/first.png',name:'First'},{id:'last',src:'/last.png',name:'Last'}]}}/>);
 const effects=()=>within(screen.getByRole('region',{name:'Efectos compatibles'}));
 expect(effects().queryByRole('button',{name:/Conectar día y noche/})).toBeNull();
 fireEvent.click(effects().getByRole('button',{name:/Acercamiento al proyecto/}));
 expect(screen.queryByRole('button',{name:'Elegir imagen final'})).toBeNull();
 expect(effects().getAllByRole('button',{pressed:true})).toHaveLength(1);
 fireEvent.click(screen.getByRole('button',{name:/De una imagen a otra/}));
 expect(screen.getByRole('button',{name:'Elegir imagen final'})).toBeTruthy();
 expect(screen.getByRole('textbox',{name:'Prompt de la escena'})).toHaveValue('');
 expect(effects().queryByRole('button',{name:/Acercamiento al proyecto/})).toBeNull();
 fireEvent.click(effects().getByRole('button',{name:/Conectar día y noche/}));
 expect(screen.getByRole('button',{name:/De una imagen a otra/})).toHaveAttribute('aria-pressed','true');
 expect(effects().queryByRole('button',{name:/Conectar seco y lluvia/})).toBeNull();
 expect(effects().getAllByRole('button',{pressed:true})).toHaveLength(1);
 expect(screen.getByRole('button',{name:'Elegir imagen final'})).toBeTruthy();
});

it('animates one visible reference without asking for a final image',()=>{
 render(<Editor session={{id:'rain-test',assets:[{id:'dry',src:'/dry.png',name:'Render seco'}]}}/>);
 fireEvent.click(screen.getByRole('button',{name:'Elegir imagen inicial'}));
 const picker=screen.getByText('Elegir imágenes de mis renders').closest('details');
 expect(picker).toHaveAttribute('open');
 fireEvent.click(screen.getByRole('button',{name:'Elegir Render seco'}));
 expect(picker).not.toHaveAttribute('open');
 fireEvent.click(screen.getByRole('button',{name:/Acercamiento al proyecto/}));
 const references=screen.getByRole('region',{name:'Imágenes de esta toma'});
 expect(within(references).getByRole('img')).toHaveAttribute('src','/dry.png');
 expect(screen.queryByRole('button',{name:'Elegir imagen final'})).toBeNull();
 expect((screen.getByRole('textbox',{name:'Prompt de la escena'}) as HTMLTextAreaElement).value).toContain('supplied architectural image');
});
it('removes unvalidated camera options and invalidates the prompt when custom camera changes',()=>{
 render(<Editor session={{id:'camera-test',assets:[]}}/>);
 const camera=screen.getByRole('combobox',{name:'Movimiento de cámara'});
 expect(within(camera).queryByRole('option',{name:'Desplazamiento lateral'})).toBeNull();
 expect(within(camera).queryByRole('option',{name:'Elevación suave'})).toBeNull();
 fireEvent.change(screen.getByRole('textbox',{name:'Prompt de la escena'}),{target:{value:'Old forward instruction'}});
 fireEvent.change(camera,{target:{value:'fixed'}});
 expect(screen.getByRole('textbox',{name:'Prompt de la escena'})).toHaveValue('');
 fireEvent.click(screen.getByRole('button',{name:/Acercamiento al proyecto/}));
 expect(screen.getByRole('textbox',{name:'Movimiento de cámara'})).toHaveAttribute('readonly');
 expect(screen.queryByRole('button',{name:/Detalle de materiales/})).toBeNull();
 expect(screen.queryByRole('button',{name:/Anochecer/})).toBeNull();
});

it('routes between-renders to the controlled fusion without AI prompt controls',()=>{
 render(<Editor session={{id:'two-renders-test',assets:[]}}/>);
 fireEvent.click(screen.getByRole('button',{name:/De una imagen a otra/}));
 fireEvent.click(screen.getByRole('button',{name:/Entre dos renders/}));
 expect(screen.getByText('Fusión entre dos renders')).toBeTruthy();
 expect(screen.getByRole('button',{name:'Crear fusión suave · sin costo'})).toBeDisabled();
 expect(screen.queryByRole('textbox',{name:'Prompt de la escena'})).toBeNull();
});
