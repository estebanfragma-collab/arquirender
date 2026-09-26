import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import PosterStudio from './PosterStudio';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('opens an editable design directly from the collection and returns',()=>{
 vi.spyOn(window,'scrollTo').mockImplementation(()=>{});
 render(<MemoryRouter><PosterStudio/></MemoryRouter>);
 expect(screen.getAllByRole('button',{name:/^Personalizar /})).toHaveLength(40);
 fireEvent.click(screen.getByRole('button',{name:'Personalizar Geometría en papel'}));
 expect(screen.getByRole('combobox',{name:'Formato'})).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Descargar PNG'})).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:/Volver al catálogo/}));
 expect(screen.getAllByRole('button',{name:/^Personalizar /})).toHaveLength(40);
});
it('supports a direct design link and safely ignores invalid template IDs',()=>{
 render(<MemoryRouter initialEntries={['/posters?diseno=P20']}><PosterStudio/></MemoryRouter>);
 expect(screen.getByRole('button',{name:'Descargar SVG'})).toBeInTheDocument();
 cleanup();
 render(<MemoryRouter initialEntries={['/posters?diseno=invalid']}><PosterStudio/></MemoryRouter>);
 expect(screen.getAllByRole('button',{name:/^Personalizar /})).toHaveLength(40);
});
