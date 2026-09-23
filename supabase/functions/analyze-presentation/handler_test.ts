import { createHandler } from './handler.ts';
const assert=(ok:unknown,message='Assertion failed')=>{if(!ok)throw new Error(message);};
const env=(key:string)=>({SUPABASE_URL:'https://test.invalid',SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'service',OPENAI_API_KEY:'test-key'}[key]);
const input={images:['data:image/jpeg;base64,/9j/AAAA'],brief:'Luz natural'};
const req=(body:unknown=input,auth=true)=>new Request('https://test.invalid',{method:'POST',headers:auth?{Authorization:'Bearer user'}:{},body:JSON.stringify(body)});
function mock(opts:{auth?:boolean;permit?:string;provider?:number;refusal?:boolean}={}){
  const calls:string[]=[];
  const fetcher:typeof fetch=async(url,init)=>{
    const path=String(url);calls.push(path);
    if(path.endsWith('/auth/v1/user'))return Response.json(opts.auth===false?{}:{id:'user'},{status:opts.auth===false?401:200});
    if(path.includes('/rpc/'))return Response.json(opts.permit||'ok');
    const body=JSON.parse(String(init?.body));assert(body.model==='gpt-4.1-mini-2025-04-14');assert(body.messages[1].content[1].image_url.url===input.images[0]);assert(body.store===false);
    return Response.json({model:body.model,choices:[{finish_reason:'stop',message:opts.refusal?{refusal:'no'}:{content:JSON.stringify({title:'Fachada luminosa',text:'Una propuesta abierta al exterior.',observation:''})}}]},{status:opts.provider||200});
  };
  return {handler:createHandler(env,fetcher),calls};
}
Deno.test('anonymous and expired sessions cannot spend',async()=>{const m=mock({auth:false});assert((await m.handler(req(input,false))).status===401);assert(m.calls.length===0);assert((await m.handler(req())).status===401);assert(m.calls.length===1);});
Deno.test('invalid input and oversized actual body cannot spend',async()=>{const m=mock();for(const data of [{...input,images:[]},{...input,images:['https://localhost/secret']},{...input,brief:'x'.repeat(1001)},null])assert((await m.handler(req(data))).status===400);assert((await m.handler(req({brief:'x'.repeat(3000000)}))).status===413);assert(m.calls.every(c=>c.endsWith('/user')));});
Deno.test('rate limited calls never reach OpenAI',async()=>{for(const permit of ['daily','wait']){const m=mock({permit});assert((await m.handler(req())).status===429);assert(m.calls.length===2);}});
Deno.test('real image input is passed and structured proposal returned',async()=>{const m=mock();const r=await m.handler(req());assert(r.status===200);assert((await r.json()).title==='Fachada luminosa');assert(m.calls.length===3);});
Deno.test('provider failures and refusals are safe errors',async()=>{assert((await mock({provider:500}).handler(req())).status===502);assert((await mock({refusal:true}).handler(req())).status===422);});
Deno.test('preflight works and GET rejected',async()=>{const m=mock();assert((await m.handler(new Request('https://test.invalid',{method:'OPTIONS'}))).status===204);assert((await m.handler(new Request('https://test.invalid'))).status===405);assert(m.calls.length===0);});
