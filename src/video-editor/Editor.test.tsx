import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import Editor from './Editor';
import {initialEdit} from './model';
vi.mock('@/presentaciones-demo/storage',()=>({loadDraft:vi.fn(async()=>({edit:{...initialEdit,clips:[{id:'a',mediaId:'m',start:0,end:4,speed:1},{id:'b',mediaId:'n',start:0,end:4,speed:1}]},media:[{id:'m',name:'Primera',file:new Blob(),duration:4},{id:'n',name:'Segunda',file:new Blob(),duration:4}]})),saveDraft:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{}}));
vi.mock('@/video-studio/fusion-cloud',()=>({listFusions:vi.fn()}));
beforeEach(()=>{vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(null);vi.spyOn(HTMLMediaElement.prototype,'load').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();URL.createObjectURL=vi.fn(()=> 'blob:test');URL.revokeObjectURL=vi.fn();});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('splits at cursor, changes speed, adds overlap and undoes the edit',async()=>{
 render(<Editor/>);await screen.findByRole('button',{name:'Toma 1: Primera'});
 fireEvent.change(screen.getByLabelText('Posición del montaje'),{target:{value:'2'}});
 fireEvent.click(screen.getByRole('button',{name:'✂ Dividir'}));
 expect(screen.getByRole('button',{name:'Toma 3: Segunda'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'◷ Velocidad'}));
 fireEvent.click(screen.getByRole('button',{name:'2×'}));
 expect(screen.getByText('0:00.0 / 0:07.0')).toBeTruthy();
 fireEvent.click(screen.getByLabelText('Transición después de toma 2'));
 fireEvent.click(screen.getByRole('button',{name:'Fusión 0.5 s'}));
 expect(screen.getByText('0:00.0 / 0:06.5')).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(screen.getByText('0:00.0 / 0:07.0')).toBeTruthy();
});
it('accepts a dragged library item and reorders existing timeline clips',async()=>{
 render(<Editor/>);await screen.findByRole('button',{name:'Toma 1: Primera'});
 fireEvent.click(screen.getByRole('button',{name:'＋ Videos'}));
 const dataTransfer={setData:vi.fn(),files:[]};
 fireEvent.dragStart(screen.getByRole('button',{name:/Primera.*Añadir/}),{dataTransfer});
 fireEvent.drop(screen.getByRole('button',{name:'Toma 2: Segunda'}),{dataTransfer});
 expect(screen.getByRole('button',{name:'Toma 3: Segunda'})).toBeTruthy();
 fireEvent.dragStart(screen.getByRole('button',{name:'Toma 3: Segunda'}),{dataTransfer});
 fireEvent.drop(screen.getByRole('button',{name:'Toma 1: Primera'}),{dataTransfer});
 expect(screen.getByRole('button',{name:'Toma 1: Segunda'})).toBeTruthy();
});

it('duplicates a selected take and trims it using keyboard-accessible handles',async()=>{
 render(<Editor/>);await screen.findByRole('button',{name:'Toma 1: Primera'});
 fireEvent.keyDown(screen.getByLabelText('Recortar inicio'),{key:'ArrowRight'});
 expect(screen.getByLabelText('Recortar inicio').getAttribute('aria-valuenow')).toBe('0.1');
 fireEvent.click(screen.getByRole('button',{name:'▣ Duplicar'}));
 expect(screen.getByRole('button',{name:'Toma 2: Primera'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Deshacer'}));
 expect(screen.getByRole('button',{name:'Toma 2: Segunda'})).toBeTruthy();
});
