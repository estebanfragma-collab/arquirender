import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,it,expect,vi} from 'vitest';
import LayerEditor from '../poster-lab/LayerEditor';
import {initialLayers} from '../poster-lab/layers';
afterEach(cleanup);
it('applies edited layers to the presentation without writing a standalone draft',()=>{
 const write=vi.spyOn(Storage.prototype,'setItem');
 const apply=vi.fn();
 render(<LayerEditor template="P03" document={{layers:initialLayers('P03'),format:'9:16'}} onBack={()=>{}} onApply={apply}/>);
 fireEvent.change(screen.getByLabelText('Texto',{exact:true}),{target:{value:'MI CASA'}});
 fireEvent.click(screen.getByText('Aplicar a la lámina'));
 expect(apply.mock.calls[0][0].layers.find(l=>l.id==='title').text).toBe('MI CASA');
 expect(write).not.toHaveBeenCalled();write.mockRestore();
});
