export const statuses = ['CONFIRMADO','ESTIMADO','PENDIENTE','RUBRO PENDIENTE','NECESIDAD POR CONFIRMAR'] as const;
export type Proposal = {status:typeof statuses[number];element:string;rubricId:string|null;quantity:number|null;unit:string;source:string;evidence:string;observation:string};
export type Result = {items:Proposal[];questions:string[]};
export type Input = {context:string;library:{id:string;description:string;unit:string;category:string}[];images:{source:string;data:string}[]};
const str=(x:unknown,max=2000):x is string=>typeof x==='string'&&x.length<=max;
export function validateInput(x:unknown):x is Input {
 const b=x as Input;
 return !!b && str(b.context,6000)&&!!b.context.trim()&&Array.isArray(b.library)&&b.library.length>0&&b.library.length<=1000&&new Set(b.library.map(e=>e?.id)).size===b.library.length&&b.library.every(e=>e&&str(e.id,200)&&!!e.id&&str(e.description,3000)&&str(e.unit,100)&&str(e.category,500))&&Array.isArray(b.images)&&b.images.length>0&&b.images.length<=12&&new Set(b.images.map(i=>i?.source)).size===b.images.length&&b.images.every(i=>i&&str(i.source,300)&&!!i.source&&str(i.data,1200000)&&/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(i.data));
}
export function validateResult(x:unknown,b:Input):x is Result {
 const r=x as Result;
 return !!r&&Array.isArray(r.items)&&r.items.length<=100&&Array.isArray(r.questions)&&r.questions.length<=30&&r.questions.every(q=>str(q))&&r.items.every(i=>{
 if(!i||!statuses.includes(i.status)||!str(i.element)||!i.element.trim()||!str(i.evidence)||!i.evidence.trim()||!str(i.observation)||!(b.images.some(s=>s.source===i.source)||(i.source==='Fuente pendiente de verificar'&&!['CONFIRMADO','ESTIMADO'].includes(i.status))))return false;
 const entry=b.library.find(e=>e.id===i.rubricId);
 if(i.rubricId!==null&&(!entry||entry.unit!==i.unit))return false;
 if(i.quantity!==null&&(typeof i.quantity!=='number'||!Number.isFinite(i.quantity)||i.quantity<=0||i.quantity>1e9))return false;
 return !['CONFIRMADO','ESTIMADO'].includes(i.status)||(!!entry&&i.quantity!==null);
 });
}
const text={type:'string'};
export const schema={type:'object',additionalProperties:false,properties:{items:{type:'array',items:{type:'object',additionalProperties:false,properties:{status:{type:'string',enum:statuses},element:text,rubricId:{type:['string','null']},quantity:{type:['number','null']},unit:text,source:text,evidence:text,observation:text},required:['status','element','rubricId','quantity','unit','source','evidence','observation']}},questions:{type:'array',items:text}},required:['items','questions']};

// Keep uncertain proposals visible, but never eligible for automatic acceptance.
export function reviewResult(x:unknown,b:Input):Result|null {
 const r=x as Result;
 if(!r||!Array.isArray(r.items)||r.items.length>100||!Array.isArray(r.questions)||r.questions.length>30||!r.questions.every(q=>str(q)))return null;
 const items:Proposal[]=[];
 for(const raw of r.items){
  if(!raw||!statuses.includes(raw.status)||!str(raw.element)||!raw.element.trim()||!str(raw.evidence)||!str(raw.observation)||!str(raw.source)||!str(raw.unit))return null;
  const i={...raw};const notes:string[]=[];
  const entry=b.library.find(e=>e.id===i.rubricId);
  if(!entry){i.rubricId=null;i.unit='';i.status='RUBRO PENDIENTE';notes.push('Selecciona un rubro compatible de la biblioteca.');}
  else if(entry.unit!==i.unit){i.unit=entry.unit;i.quantity=null;i.status='PENDIENTE';notes.push('La unidad propuesta no coincide con la biblioteca. Verifica la cantidad en '+entry.unit+'.');}
  if(typeof i.quantity!=='number'||!Number.isFinite(i.quantity)||i.quantity<=0||i.quantity>1e9){i.quantity=null;if(['CONFIRMADO','ESTIMADO'].includes(i.status))i.status='PENDIENTE';notes.push('Cantidad pendiente: requiere medidas o conteo confirmado.');}
  if(!b.images.some(s=>s.source===i.source)){notes.push('La IA indicó una fuente no verificable: '+i.source);i.source='Fuente pendiente de verificar';i.status='PENDIENTE';i.quantity=null;}
  if(!i.evidence.trim()){i.evidence='Fundamento pendiente de verificar.';i.status='PENDIENTE';i.quantity=null;}
  i.observation=[i.observation,...notes].filter(Boolean).join(' ').slice(0,2000);items.push(i);
 }
 const result={items,questions:r.questions};return validateResult(result,b)?result:null;
}
export function schemaFor(b:Input){
 return {...schema,properties:{...schema.properties,items:{...schema.properties.items,items:{...schema.properties.items.items,properties:{...schema.properties.items.items.properties,rubricId:{type:['string','null'],enum:[...b.library.map(e=>e.id),null]},source:{type:'string',enum:b.images.map(i=>i.source)}}}}}};
}
