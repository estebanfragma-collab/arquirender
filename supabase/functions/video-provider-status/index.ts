// Read-only credential probe: no generation endpoint is called and no key is returned.
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
let cache:{until:number;message:string}|undefined;
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply(405,{error:'Usa POST.'});
 const token=req.headers.get('Authorization');if(!token?.startsWith('Bearer '))return reply(401,{error:'Inicia sesión.'});
 try{
  const auth=await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,{headers:{Authorization:token,apikey:Deno.env.get('SUPABASE_ANON_KEY')||''},signal:AbortSignal.timeout(10000)});
  if(!auth.ok)return reply(401,{error:'Vuelve a iniciar sesión.'});
  const user=await auth.json();if(!user.id||user.is_anonymous)return reply(401,{error:'Inicia sesión con tu cuenta.'});
  if(cache&&cache.until>Date.now())return reply(200,{message:cache.message});
  const key=(Deno.env.get('HIGGSFIELD_API_KEY')||'').trim().replace(/^Key\s+/i,'');
  if(!key)return reply(200,{message:'La clave de video todavía no está configurada.'});
  if(!/^[^\s:]+:[^\s:]+$/.test(key))return reply(200,{message:'La clave está guardada, pero su formato necesita revisión antes de conectar el proveedor.'});
  // A random nonexistent request yields 404 after authentication; an invalid credential
  // must yield 401 on the same endpoint before we report acceptance.
  const endpoint=`https://api.higgsfield.ai/requests/${crypto.randomUUID()}/status`;
  const probe=async(value:string)=>{const r=await fetch(endpoint,{headers:{Authorization:`Key ${value}`},signal:AbortSignal.timeout(15000),redirect:'error'});await r.body?.cancel();return r.status;};
  const control=await probe('invalid:invalid');
  if(control!==401)return reply(200,{message:'No pudimos confirmar la autenticación del proveedor. No se generó ningún video.'});
  const status=await probe(key);
  const message=status===404?'Higgsfield acepta la clave. Puedes consultar el costo de una toma en el estudio de video. Esta comprobación no genera clips ni verifica el saldo.':status===401?'Higgsfield rechazó la clave. Revisa que hayas copiado el valor completo.':'El proveedor no permitió confirmar la conexión. Reintenta más tarde; no se generó ningún video.';
  cache={until:Date.now()+60000,message};return reply(200,{message});
 }catch{return reply(503,{error:'No se pudo comprobar la conexión. No se ha generado ningún video.'});}
});
