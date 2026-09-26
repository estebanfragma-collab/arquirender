import type {Layer,LayerTemplate,PosterFormat} from './layers';
export const editorialNames={P27:'Movimiento naranja',P28:'Cine entre la bruma',P29:'Desayuno pop',P30:'Cocina de cada día',P31:'Arquitectura serena'};
const sh=(id:string,name:string,type:Layer['type'],x:number,y:number,w:number,h:number,color:string):Layer=>({id,name,type,x,y,w,h,color,text:'',size:24,font:'Arial',bold:false});
const r=(id:string,name:string,x:number,y:number,w:number,h:number,color:string)=>sh(id,name,'rect',x,y,w,h,color);
const t=(id:string,name:string,text:string,x:number,y:number,size:number,color='#161815',font='Arial',bold=false):Layer=>({...sh(id,name,'text',x,y,980,size*1.2,color),text,size,font,bold});
const im=(id:string,name:string,asset:string,x:number,y:number,w:number,h:number,fit:Layer['fit']='cover'):Layer=>({...sh(id,name,'image',x,y,w,h,'#fff'),src:`/poster-lab/${asset}.png`,fit,crop:'none',zoom:1});
export function editorialLayers(template:LayerTemplate,format:PosterFormat='9:16'):Layer[]{
 const v=format==='9:16',q=format==='1:1',H=v?1920:q?1080:1350,cream='#f4f0e8',ink='#171916',orange='#ed9213',blue='#065da5',green='#123c2d';
 if(template==='P27'){
 const top=160, bodyH=H-340;
 return [r('paper','Fondo marfil',0,0,1080,H,cream),r('bar1','Bloque naranja superior',230,top+60,110,bodyH*.42,orange),r('bar2','Bloque naranja inferior',260,top+bodyH*.53,220,bodyH*.47,orange),
 sh('ring','Círculo naranja','ellipse',650,H*.46,380,380,'#edb966'),sh('ringHole','Interior del círculo','ellipse',725,H*.46+75,230,230,cream),
 ...Array.from({length:9},(_,i)=>r('gridX'+i,'Retícula vertical '+i,55+i*25,H-450,1,220,'#77776f')),
 ...Array.from({length:9},(_,i)=>r('gridY'+i,'Retícula horizontal '+i,55,H-450+i*25,200,1,'#77776f')),
 r('ruleV','Eje vertical',970,220,1,H-380,'#898981'),r('ruleH','Eje horizontal',25,H*.52,1010,1,orange),
 ...['G','I','R','O'].map((c,i)=>({...t(i===0?'title':'letter'+i,i===0?'Título':'Letra '+c,c,110+(i%2)*75,top+bodyH*(i+1)/4,v?350:q?165:225,ink,'Arial',true),outline:true})),
 im('photo','Retrato con esfera','retrato-esfera',v?280:425,240,v?850:600,H-410,'contain'),
 t('header','Cabecera','VELORA / NOTAS DE CAMPO',55,60,21),t('date','Fecha','ABRIL 2027',820,60,21),
 t('motto','Lema','LA FORMA CAMBIA CUANDO MIRAS.\nVE DESPACIO. OBSERVA MÁS.',570,130,q?19:22),
 t('index','Índice','04\n27\n01',55,H*.57,23),t('index2','Índice inferior','12\n46\n59',930,H-225,21),
 r('square','Marca negra',480,200,24,24,ink),
 t('footerTitle','Título del pie','MOVIMIENTO SIN RUIDO',55,H-105,q?45:56,ink,'Impact'),
 t('footer','Subtítulo','UN ESTUDIO DE EQUILIBRIO / LUZ / ESPACIO',55,H-57,20),t('handle','Firma','@TU_ESTUDIO',810,H-30,18)];
 }
 if(template==='P28'){
 const py=v?270:q?180:210,ph=H-py-300,sy=py+ph*(v?.32:.23);
 return [r('paper','Papel cálido',0,0,1080,H,'#e8e4d7'),im('photo','Retrato en semitono','bruma-retrato',165,py,750,ph),im('strip','Franja de niebla','bruma-paisaje',0,sy,1080,q?140:190),
 t('director','Dirección','UNA PELÍCULA DE\nTU NOMBRE',50,65,23),t('cast','Reparto','CON TU REPARTO\nNOMBRE · NOMBRE\nNOMBRE · NOMBRE',795,65,21),
 t('award','Festival','SELECCIÓN OFICIAL\nFESTIVAL DE CINE\n2026',435,80,21),
 ...Array.from({length:7},(_,i)=>({...sh('leafL'+i,'Laurel izquierdo '+i,'ellipse',375-i*7,65+i*18,12,25,ink),rotation:-40})),
 ...Array.from({length:7},(_,i)=>({...sh('leafR'+i,'Laurel derecho '+i,'ellipse',680+i*7,65+i*18,12,25,ink),rotation:40})),
 t('quote','Reseña','«La niebla se llevó el paisaje. Nos dejó la memoria.»',100,H-225,q?26:30,ink,'Georgia'),
 t('title','Título','LA BRUMA',50,H-85,q?154:168,ink,'Arial',true),t('footer','Créditos','TU PRODUCTORA PRESENTA · ESTRENO EN OCTUBRE · 2026',235,H-30,18)];
 }
 if(template==='P29'){
 const py=v?480:q?260:340,ph=v?1030:q?590:740;
 return [r('paper','Amarillo yema',0,0,1080,H,'#f4cf39'),t('title','Título','HAOSHI',120,v?285:q?170:215,v?200:q?165:185,blue,'Arial',true),
 im('photo','Sándwich de huevo','sandwich-huevo',(1080-Math.min(ph,1000))/2,py,Math.min(ph,1000),ph,'contain'),
 {...t('breakfast','Subtítulo','Desayunos',660,py+20,v?66:48,cream),rotation:-7},
 t('eat','Lema lateral','COME\nBIEN',35,py+ph*.4,v?52:36,blue,'Arial',true),
 t('time','Lema inferior','TU MEJOR\nMAÑANA',620,H-245,v?68:q?40:52,blue,'Arial',true),
 sh('arc1','Trazo izquierdo','arc',55,H-290,390,90,blue),sh('arc2','Trazo inferior','arc',80,H-230,390,85,blue),
 ...[0,1,2].map(i=>t('star'+i,'Estrella '+i,'✦',920+i*28,py+150+i*85,60-i*12,blue)),
 t('since','Desde','EST. 2026',60,H-65,23,blue,'Arial',true),t('footer','Información','SÁNDWICHES DE AUTOR\nRECIÉN HECHOS · SERVIDOS CALIENTES',320,H-92,21,blue,'Arial',true)];
 }
 if(template==='P30'){
 const py=v?780:q?440:565,ph=v?820:q?450:575;
 return [r('paper','Verde bosque',0,0,1080,H,green),t('header','Cabecera','GRANOS & VERDES · COCINA SIN PRISA',200,v?140:80,25,'#abc09c'),
 t('title','Título','Fresco cada',95,v?370:q?205:270,v?145:q?116:130,cream,'Arial',true),t('title2','Título segunda línea','día',420,v?555:q?325:420,v?160:q?130:145,cream,'Arial',true),
 {...t('motto','Lema','Las buenas mañanas empiezan aquí',160,py-(q?45:90),v?42:q?35:39,'#dea24e'),rotation:-2},
 {...im('photo','Tostada de aguacate','desayuno-verde',75,py,930,ph),crop:'rounded'},
 t('ingredients','Ingredientes','AGUACATE · HUEVO TIERNO · PAN DE MASA MADRE',100,py+ph+65,q?23:25,'#b5c5a8'),
 r('line','Línea del pie',480,H-105,120,2,'#d6d8b9'),t('footer','Horario','RECIÉN HECHO · TODOS LOS DÍAS 7:00–11:00',260,H-50,21,'#b5c5a8')];
 }
 if(template==='P31'){
 const py=v?240:q?125:170,ph=v?1120:q?565:740,fy=py+ph+80;
 return [r('paper','Fondo blanco cálido',0,0,1080,H,'#fafaf7'),
 ...Array.from({length:6},(_,i)=>r('sketchV'+i,'Línea de croquis '+i,70+i*165,0,1,py+80,'#e3e5df')),
 ...Array.from({length:4},(_,i)=>r('sketchH'+i,'Línea horizontal de croquis '+i,0,20+i*55,1080,1,'#e3e5df')),
 t('nav','Cabecera','ÍNDICE          ESPACIOS          NOTAS',220,60,25),
 im('photo','Fachada curva','casa-curva',70,py,560,ph),{...im('detail1','Detalle de fachada','casa-curva',670,py+ph*.13,340,ph*.42),zoom:2,offsetX:-110},
 {...im('detail2','Escalera y jardín','casa-curva',670,py+ph*.60,340,ph*.40),zoom:2,offsetY:-100},
 r('accent1','Bloque azul superior',670,py,180,80,'#337f95'),r('accent2','Bloque azul inferior',450,py+ph-50,180,50,'#337f95'),
 t('number','Número de edición','02',100,py+95,68,'#fff','Arial',true),t('number2','Número de detalle','48',880,py+ph-30,58,'#fff','Arial',true),
 t('kicker','Antetítulo','UN ESTUDIO DE LUZ',70,fy,29),t('title','Título','forma\nserena',70,fy+(v?135:80),v?100:q?60:75,ink,'Arial',true),
 t('description','Descripción','Un espacio puede ser sereno sin estar vacío.\nLa luz recorre las superficies y da a cada\nrincón una razón para quedarse.\n\nMateria, sombra y proporción.\nArquitectura para habitar despacio.',440,fy+65,v?23:q?17:20),
 t('footer','Pie editorial','●  ●  ●     NOTAS DE CAMPO / EDICIÓN 04',70,H-40,19)];
 }
 return [];
}
