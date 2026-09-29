import {expect,it,vi} from 'vitest';
import {proposeScene} from './api';
import {applyPreset} from './presets';
import {newScene} from './model';
const {invoke}=vi.hoisted(()=>({invoke:vi.fn().mockResolvedValue({data:{prompt:'result',notes:'notes'},error:null})}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{functions:{invoke}}}));
vi.mock('@/presentaciones-demo/analysis',()=>({prepareImage:vi.fn().mockResolvedValue('data:image/jpeg;base64,/9j/AA')}));
it('sends the full user idea separately from long preset instructions',async()=>{
 Object.defineProperty(AbortSignal,'timeout',{configurable:true,value:()=>new AbortController().signal});
 const scene={...applyPreset(newScene(),'add-rain'),startId:'img',brief:'Personas usando este espacio. '+ 'x'.repeat(950)};
 await proposeScene(scene,[{id:'img',name:'Render',src:'/render.jpg'}]);
 const body=invoke.mock.calls[0][1].body;
 expect(body.brief).toBe(scene.brief);
 expect(body.presetPrompt).toBe(scene.prompt);
 expect(body.presetPrompt.length).toBeGreaterThan(1000);
});
