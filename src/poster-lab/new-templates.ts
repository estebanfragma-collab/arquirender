import type { Layer, LayerTemplate, PosterFormat } from './layers';
export const newNames = { P21:'Naturaleza con amor', P22:'Señal en movimiento', P23:'Montaña serena', P24:'Vida lenta', P25:'Cine juvenil', P26:'Concierto ilustrado' };
const shape=(id:string,name:string,type:Layer['type'],x:number,y:number,w:number,h:number,color:string):Layer=>({id,name,type,x,y,w,h,color,text:'',size:24,font:'Arial',bold:false});
const r=(id:string,name:string,x:number,y:number,w:number,h:number,color:string)=>shape(id,name,'rect',x,y,w,h,color);
const t=(id:string,name:string,text:string,x:number,y:number,size:number,color='#171918',font='Arial',bold=false):Layer=>({...shape(id,name,'text',x,y,950,size*1.2,color),text,size,font,bold});
const im=(id:string,name:string,asset:string,x:number,y:number,w:number,h:number):Layer=>({...shape(id,name,'image',x,y,w,h,'#fff'),src:`/poster-lab/${asset}.png`,crop:'none',fit:'cover',zoom:1});
export function newLayers(template:LayerTemplate,format:PosterFormat='9:16'):Layer[]{
 const v=format==='9:16',q=format==='1:1',H=v?1920:q?1080:1350;
 const cream='#f5f1e9',ink='#171918',blue='#649bd1',navy='#123754',orange='#c95413',yellow='#efef08',teal='#075e65';
 const a=(id:string,name:string,value:string,x:number,y:number,size:number,color=ink)=>t(id,name,value,x,y,size,color);
 const b=(id:string,name:string,value:string,x:number,y:number,size:number,color=ink)=>t(id,name,value,x,y,size,color,'Impact');
 const s=(id:string,name:string,value:string,x:number,y:number,size:number,color=ink)=>t(id,name,value,x,y,size,color,'Georgia');
 if(template==='P21'){
  const py=v?1050:q?475:670,ph=H-py-24;
  return [r('paper','Fondo marfil',0,0,1080,H,cream),im('photo','Gorrión en primavera','naturaleza-gorrion',24,py,1032,ph),
   s('mast1','Cabecera uno','INSTANTES',55,80,22),s('mast2','Cabecera dos','EN QUE',360,80,22),s('mast3','Cabecera tres','LA VIDA',630,80,22),s('mast4','Cabecera cuatro','SE DETIENE',865,80,22),
   b('header','Cabecera principal','FOTOGRAFÍA',155,v?330:q?210:245,v?108:q?86:96,blue),
   t('with','Palabra de enlace','Con',60,v?550:q?285:310,v?135:q?65:90,ink,'cursive'),
   {...t('title','Título','AMOR',42,v?880:q?440:590,v?335:q?200:250,blue,'Arial',true),imageFill:true,src:'/poster-lab/naturaleza-gorrion.png'},
   r('codebg','Fondo código',790,H-125,230,85,cream),
   ...Array.from({length:27},(_,i)=>r('bar'+i,'Barra del código '+(i+1),805+i*7.2,H-112,i%3===0?5:2,43,ink)),
   a('code','Número editorial','0 00000 96353 741',805,H-50,15),
  ];
 }
 if(template==='P22'){
  const py=v?885:q?200:320,ph=H-py-130;
  return [r('paper','Fondo amarillo',0,0,1080,H,yellow),r('ruleTop','Línea superior',40,55,1000,2,ink),
   a('edition','Edición','NOTA DE CAMPO 07',40,93,25),a('date','Fecha','18.04.2026 / 19:30',760,93,25),r('ruleHead','Línea de cabecera',40,115,1000,2,ink),
   {...im('detail','Detalle de manos','senal-retrato',40,145,v?435:390,v?240:210),crop:'rounded',zoom:2.3,offsetX:-80,offsetY:-200},
   a('title','Título','SEÑAL',40,v?575:q?530:570,v?240:q?112:115),
   a('title2','Título segunda línea','FUGAZ',40,v?815:q?690:730,v?235:q?108:110),
   {...im('photo','Retrato en movimiento','senal-retrato',v?90:555,py,v?900:485,ph),crop:'arch',fit:'cover',imageAlignTop:true},
   r('ruleBottom','Línea inferior',40,H-108,1000,2,ink),
   a('lab','Laboratorio','LABORATORIO VISUAL\nEDICIÓN 07',40,H-68,22),
   shape('badge','Sello circular','ellipse',735,H-93,68,68,ink),a('badgeText','Texto del sello','ENTRA',742,H-55,15,yellow),
   a('footer','Lema','ECOS FUGACES\nDE LA CIUDAD',840,H-65,19)
  ];
 }
 if(template==='P23'){
  const py=v?710:q?405:510,ph=v?845:q?430:570,fy=H-240;
  return [r('paper','Fondo de papel',0,0,1080,H,cream),im('photo','Paisaje en tinta','montana-tinta',0,py,1080,ph),
   s('title','Título','LA\nMONTAÑA\nSERENA',65,v?150:q?90:105,v?110:q?66:84),
   s('exhibition','Exposición','OBJETOS CONTEMPORÁNEOS\nY CULTURA DEL TÉ',645,v?150:85,22),
   s('dates','Fechas','11.04 — 07.06',645,v?260:q?165:185,36),s('season','Temporada','PRIMAVERA 2026',645,v?320:q?205:240,20),
   s('subtitle','Subtítulo','OBJETOS · TÉ · EL ESPACIO ENTRE AMBOS',65,v?555:q?325:415,21),
   s('poem','Poema','LOS OBJETOS GUARDAN MUNDOS. EL TÉ ABRE MONTAÑAS.\nEN EL SILENCIO, EL AGUA FLUYE Y LAS FLORES NACEN.',65,v?635:q?370:465,v?18:15),
   {...s('vertical','Poema lateral','OÍR LA LLUVIA EN EL TÉ',997,py+60,18),rotation:90},
   r('seal1','Sello rojo superior',930,py+ph*.45,57,70,'#ad583d'),s('sealText1','Texto sello superior','MONTE\nSERENO',935,py+ph*.45+28,12,cream),
   r('seal2','Sello rojo inferior',930,py+ph*.67,57,60,'#ad583d'),s('sealText2','Texto sello inferior','OÍR\nLLUVIA',938,py+ph*.67+25,13,cream),
   r('rule','Línea de créditos',65,fy,950,1,ink),r('divide1','Separador de créditos',425,fy+35,1,125,ink),r('divide2','Separador de organización',730,fy+35,1,125,ink),
   s('makers','Artistas','ARTISTAS INVITADOS\nTu nombre · Tu colectivo\nTu estudio · Tu taller',65,fy+45,18),
   s('curator','Curaduría','DIRECCIÓN ARTÍSTICA\nTu nombre\nCURADURÍA · Tu estudio',460,fy+45,18),
   s('organizer','Organización','ORGANIZA\nFundación Cultural\nESPACIO · Sala principal',760,fy+45,18),
   r('ruleFoot','Línea final',65,H-60,950,1,ink),s('footer','Información final','10:00–18:00 · ENTRADA LIBRE · TU CIUDAD · RESERVAS EN TU WEB',65,H-32,14)
  ];
 }
 if(template==='P24'){
  const oy=v?630:q?350:480,oh=v?330:q?175:215,gapY=v?355:q?182:230;
  const spots=[[50,0,290],[400,0,290],[760,0,240],[280,1,250],[780,1,260],[735,2,270]];
  const labels=['Tetera y tazas','Planta','Lámpara','Lana y tejido','Regadera','Cuaderno'];
  return [r('paper','Fondo crema',0,0,1080,H,'#f3e7dc'),
   b('header','Cabecera','FESTIVAL DE FIN DE SEMANA\nVIDA LENTA / 2026',55,80,v?33:24,orange),
   b('title','Título','VIDA\nLENTA',55,v?340:q?215:265,v?190:q?110:140,navy),
   b('motto','Lema','HAZ QUE CADA DÍA\nSE SIENTA TUYO',610,v?195:q?145:180,v?40:30,navy),
   r('rule1','Línea del lema',610,v?270:q?200:240,410,4,navy),
   b('dates','Fechas','8–9 Y 15–16 JUNIO',610,v?345:q?240:290,30,orange),
   b('workshops','Talleres','TINTES · CERÁMICA · MADERA\nTEJIDOS · TÉ · INTERCAMBIO',610,v?435:q?290:365,v?26:20,navy),
   r('rule2','Línea de talleres',610,v?525:q?325:410,410,4,navy),
   ...labels.map((name,i)=>({...im('object'+i,name,'vida-lenta-objetos',spots[i][0],oy+spots[i][1]*gapY,spots[i][2],oh),spriteIndex:i,fit:'contain' as const})),
   ...['Tijeras de jardín','Cuenco de naranjas','Cuchara','Agujas de tejer'].map((name,i)=>({...im('craft'+i,name,'vida-lenta-oficios',[45,530,60,400][i],oy+[1,1,2,2][i]*gapY,[180,200,260,260][i],oh),spriteIndex:i,spriteColumns:2,fit:'contain' as const})),
   b('footerTitle','Fecha destacada','DEL 8 AL 16 DE JUNIO',55,H-125,v?48:36,orange),
   b('venue','Lugar','PLAZA DE TU COMUNIDAD',610,H-125,v?36:28,navy),
   b('organizer','Organiza','ORGANIZA · COLECTIVO VIDA LENTA\nTALLERES, OFICIOS Y ENCUENTROS',55,H-65,21,navy),
   b('info','Información','INSCRIPCIONES · TU WEB\nENTRADA LIBRE',610,H-65,21,navy)
  ];
 }
 if(template==='P25'){
  const ph=v?1190:q?600:790,px=q?300:335;
  return [r('paper','Fondo papel',0,0,1080,H,cream),{...im('photo','Jóvenes en semitono','cine-juvenil',px,0,1080-px,ph),imageAlignTop:true},
   {...s('vertical','Frase vertical','CANCIONES SIN TERMINAR',210,55,v?52:q?33:41),rotation:90},
   {...s('vertical2','Frase vertical segunda','JUVENTUD Y ROCK',105,55,v?52:q?33:41),rotation:90},
   {...s('note','Nota lateral','un verano · una banda · ninguna prisa',285,65,v?19:15),rotation:90},
   r('strip','Cinta sobre la foto',965,40,48,ph-80,cream),
   {...s('stripText','Texto de cinta','TRES ACORDES. UN VERANO. SIN PLAN.',980,65,v?21:15),rotation:90},
   r('rule','Línea de información',50,ph+30,980,1,ink),
   a('date','Fecha','17.06',50,ph+105,v?65:45),a('release','Estreno','JUNIO 2026\nEN CINES',50,ph+145,20),
   s('director','Dirección','UNA PELÍCULA DE\nTU NOMBRE',360,ph+90,v?28:22),
   s('review','Reseña','«Como el primer amor\ny el primer ensayo».',755,ph+85,v?25:20),
   {...t('title','Título','AVENIDA',30,H-105,v?225:q?145:175,'#dddd00','Arial',true),textStroke:ink},
   t('signature','Firma','Eco',350,H-145,v?140:q?90:110,ink,'cursive'),
   a('credits','Créditos','TU ESTUDIO PRESENTA · TU REPARTO · MÚSICA ORIGINAL',60,H-35,18)
  ];
 }
 if(template==='P26'){
  const py=24,ph=v?710:q?380:490,mid=py+ph,bandY=mid+(v?245:q?160:190),bottom=H-(v?450:q?190:300);
  return [r('paper','Fondo crema',0,0,1080,H,'#f4ead7'),{...im('photo','Guitarrista en la colina','concierto-colina',24,py,1032,ph),imageAlignTop:true},
   r('banner','Banda del título',48,mid+35,v?355:340,v?170:110,teal),
   b('title','Título','PRIMER\nCONCIERTO',63,mid+(v?103:78),v?63:40,cream),
   shape('glasses','Gafas ilustradas','glasses',435,mid+40,v?360:320,v?170:105,'#604024'),
   b('venue','Lugar','SALA PÚBLICA\nDE TU CIUDAD',835,mid+65,v?33:26,teal),b('room','Sala','SALA 21',835,mid+(v?170:130),28,teal),
   r('rule1','Línea del horario',48,bandY,984,2,teal),b('schedule','Fecha y hora','2026  |  29 MAR  |  SÁB  |  19:00',60,bandY+(v?85:58),v?57:40,teal),r('rule2','Línea bajo horario',48,bandY+(v?120:80),984,2,teal),
   b('details','Detalles','PUERTAS 18:30 / CONCIERTO 19:00\nENTRADA · INCLUYE UNA BEBIDA\nINFORMACIÓN Y RESERVAS · TU WEB',55,bandY+(v?175:120),v?28:20,teal),
   r('pink','Fondo rosa inferior',0,bottom,1080,H-bottom,'#e99589'),
   r('leg1','Pantalón izquierdo',450,bottom+80,100,H-bottom-140,navy),r('leg2','Pantalón derecho',635,bottom+80,100,H-bottom-140,navy),
   r('sock1','Calcetín izquierdo',470,H-115,60,70,'#9da951'),r('sock2','Calcetín derecho',655,H-115,60,70,'#9da951'),
   ...Array.from({length:3},(_,i)=>[r('stripeL'+i,'Raya calcetín izquierdo '+i,470,H-108+i*18,60,6,'#e99589'),r('stripeR'+i,'Raya calcetín derecho '+i,655,H-108+i*18,60,6,'#e99589')]).flat(),
   shape('fish1','Pez izquierdo','fish',65,H-120,260,90,cream),shape('fish2','Pez derecho','fish',810,H-110,200,70,cream),
   shape('shoe1','Zapato izquierdo','ellipse',425,H-55,120,38,'#634126'),shape('shoe2','Zapato derecho','ellipse',648,H-55,120,38,'#634126'),
   {...r('diagonal','Banda diagonal',-50,bottom+70,1210,v?125:85,'#f4ead7'),rotation:-10},
   {...b('name','Nombre del artista','TU NOMBRE EN VIVO',65,bottom+(v?155:128),v?88:q?58:70,teal),rotation:-10}
  ];
 }
 return [];
}
