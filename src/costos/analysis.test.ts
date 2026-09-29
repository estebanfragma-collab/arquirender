import { describe,it,expect,vi } from 'vitest';
import { validateInput,validateResult,reviewResult,Input } from '../../supabase/functions/analyze-costs/validation';
import { createHandler } from '../../supabase/functions/analyze-costs/handler';
const body:Input={context:'Pintar sala',library:[{id:'p',description:'Pintura',unit:'m²',category:'Acabados'}],images:[{source:'1. sala.jpg',data:'data:image/jpeg;base64,/9j/AAAA'}]};
const item={status:'CONFIRMADO',element:'Pared',rubricId:'p',quantity:20,unit:'m²',source:'1. sala.jpg',evidence:'4 × 5 m confirmados',observation:''};
describe('cost analysis boundaries',()=>{
 it('rejects remote images and repeated library IDs',()=>{expect(validateInput(body)).toBe(true);expect(validateInput({...body,images:[{source:'x',data:'https://example.com/x'}]})).toBe(false);expect(validateInput({...body,library:[...body.library,...body.library]})).toBe(false);});
 it('rejects invented IDs, units, sources and zero quantities',()=>{for(const patch of [{rubricId:'invented'},{unit:'u'},{source:'invented'},{quantity:0},{quantity:null}])expect(validateResult({items:[{...item,...patch}],questions:[]},body)).toBe(false);});
 it('preserves genuinely pending quantities',()=>{expect(validateResult({items:[{...item,status:'PENDIENTE',quantity:null}],questions:['¿Altura de pared?']},body)).toBe(true);});
 it('auth and allowance precede paid call; prompt and price-free library are sent',async()=>{
 vi.stubGlobal('AbortSignal',{timeout:()=>undefined});
 const calls:string[]=[];
 const env=(k:string)=>({SUPABASE_URL:'https://local.invalid',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'service',OPENAI_API_KEY:'test'}[k]);
 const fetcher:typeof fetch=async(url,init)=>{calls.push(String(url));if(String(url).endsWith('/user'))return Response.json({id:'u'});if(String(url).includes('/rpc/'))return Response.json('ok');const payload=JSON.parse(String(init?.body));expect(payload.messages[0].content).toContain('No inventes precios');expect(payload.messages[0].content).toContain('ETAPA 1. INVENTARIO DESDE EL PROYECTO');expect(payload.messages[0].content).toContain('ETAPA 4. AUDITORÍA DE COBERTURA');expect(payload.messages[0].content).toContain('PROHIBIDO copiar longitudes');expect(payload.store).toBe(false);return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({items:[item],questions:[]})}}]});};
 const handler=createHandler(env,fetcher);
 expect((await handler(new Request('https://local.invalid',{method:'POST',body:JSON.stringify(body)}))).status).toBe(401);expect(calls).toHaveLength(0);
 expect((await handler(new Request('https://local.invalid',{method:'POST',headers:{Authorization:'Bearer user'},body:JSON.stringify(body)}))).status).toBe(200);expect(calls).toHaveLength(3);vi.unstubAllGlobals();
 });
});

it('keeps valid rows and downgrades missing quantities and mismatched units',()=>{
 const result=reviewResult({items:[item,{...item,quantity:null},{...item,unit:'u'},{...item,rubricId:'invented'},{...item,source:'invented'}],questions:[]},body)!;
 expect(result.items).toHaveLength(5);
 expect(result.items[0].status).toBe('CONFIRMADO');
 expect(result.items[1].status).toBe('PENDIENTE');
 expect(result.items[2].quantity).toBe(20);expect(result.items[2].rubricId).toBeNull();expect(result.items[2].unit).toBe('u');
 expect(result.items[3].rubricId).toBeNull();
 expect(result.items[4].quantity).toBeNull();
 expect(validateResult(result,body)).toBe(true);
});
