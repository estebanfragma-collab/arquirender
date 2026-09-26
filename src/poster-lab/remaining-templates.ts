import type {Layer,LayerTemplate,PosterFormat} from './layers';

const shape=(id:string,name:string,type:Layer['type'],x:number,y:number,w:number,h:number,color:string):Layer=>({id,name,type,x,y,w,h,color,text:'',size:24,font:'Arial',bold:false});
const txt=(id:string,name:string,text:string,x:number,y:number,size:number,color='#151515',font='Arial',bold=false):Layer=>({...shape(id,name,'text',x,y,900,120,color),text,size,font,bold});
const photo=(id:string,name:string,src:string,x:number,y:number,w:number,h:number):Layer=>({...shape(id,name,'image',x,y,w,h,'#fff'),src:'/poster-lab/'+src+'.png',crop:'none',fit:'cover',zoom:1});
const rect=(id:string,name:string,x:number,y:number,w:number,h:number,color:string)=>shape(id,name,'rect',x,y,w,h,color);
const circle=(id:string,name:string,x:number,y:number,d:number,color:string)=>shape(id,name,'ellipse',x,y,d,d,color);
export const remainingNames={P14:'Música en semitono',P15:'Arquitectura de impacto',P16:'Geometría en papel',P17:'Archivo cultural',P18:'Retrato futurista',P19:'Foto y acento rojo',P20:'Texto en perspectiva'};

/** Each format has its own composition; IDs remain stable to preserve edits. */
export function remainingLayers(template:LayerTemplate,format:PosterFormat='9:16'):Layer[]{
 const q=format==='1:1',v=format==='9:16',H=v?1920:q?1080:1350;
 const cream='#f3eddf',black='#161616',cyan='#00b9cf',blue='#083dcc',lime='#c6ed20',red='#e32d0c';
 const t=(id:string,name:string,value:string,x:number,y:number,size:number,color=black)=>txt(id,name,value,x,y,size,color,'Impact');
 const s=(id:string,name:string,value:string,x:number,y:number,size:number,color=black)=>txt(id,name,value,x,y,size,color,'Georgia');
 const a=(id:string,name:string,value:string,x:number,y:number,size:number,color=black)=>txt(id,name,value,x,y,size,color);
 if(template==='P14'){
  const py=v?650:q?300:410,ph=v?660:q?390:490,info=py+ph+70;
  return [rect('paper','Fondo crema',0,0,1080,H,cream),
   photo('photo','Cantante en semitono','musica-cantante',0,py,1080,ph),
   rect('topRule','Línea superior',55,95,970,2,black),
   a('header','Cabecera','VERANO DE GARAGE',55,65,22),a('specs','Ficha técnica','98 MIN / 16 MM / MONO',700,65,19),
   s('title','Título','EL RUIDO\nAPRENDE\nA CANTAR',55,v?235:q?155:180,v?100:q?57:70),
   s('tag1','Frase primera','Una guitarra prestada.',680,v?220:q?150:180,23),
   s('tag2','Frase segunda','Un garage en julio.',680,v?350:q?205:260,23),
   s('tag3','Frase tercera','Una canción sin terminar.',680,v?480:q?260:340,23),
   ...[0,1,2].map(i=>rect('dot'+i,'Acento '+(i+1),645,(v?202:q?133:163)+i*(v?130:q?55:80),10,10,cyan)),
   t('star','Asterisco superior','*',600,v?525:q?250:350,90,cyan),
   rect('labelBg','Etiqueta de foto',40,py+25,370,42,black),a('label','Texto de etiqueta','LADO A · CORTES DE GARAGE',58,py+53,18,cyan),
   {...t('vertical','Título lateral','VERANO ELÉCTRICO',40,py+110,28),rotation:90},
   rect('band','Banda negra',0,py+ph,1080,38,black),a('motto','Lema','DOS AMPLIS. UNA AZOTEA. SIN HORARIO.',235,py+ph+25,20,cream),
   s('date','Fecha','14.08',55,info+45,52),a('month','Mes','AGOSTO 2026',55,info+78,18),
   rect('divider1','Separador izquierdo',335,info-5,1,110,black),rect('divider2','Separador derecho',690,info-5,1,110,black),
   a('director','Dirección','UNA PELÍCULA DE\nTU NOMBRE',375,info+25,23),
   s('quote','Reseña','«Suena como un verano\nque no quieres terminar».',725,info+20,19),
   t('film','Nombre de película','ESTÁTICA',100,H-90,v?215:q?150:175,cyan),
   s('signature','Firma de película','Estática',430,H-85,v?92:q?65:80),
   a('credits','Créditos','TU ESTUDIO PRESENTA · TU REPARTO · TU MÚSICA',100,H-28,18),
   t('star2','Asterisco inferior','*',940,H-95,65,cyan)
  ];
 }
 if(template==='P15'){
  const py=v?820:q?360:490,ph=v?650:q?410:480,foot=py+ph;
  return [rect('paper','Fondo claro',0,0,1080,H,'#efeeea'),
   circle('circle','Círculo amarillo',v?485:610,v?180:120,v?760:q?490:590,'#e7e000'),
   a('header','Museo','TU MUSEO DE ARTE',55,65,23),a('edition','Edición','N.º 03 / OTOÑO 2026',710,65,21),rect('topRule','Línea superior',55,90,970,2,black),
   t('title','Título','CIUDAD\nPLEGADA',55,v?370:q?190:260,v?158:q?96:128),
   a('tagline','Lema','LA ARQUITECTURA ES EL ARTE DE PLEGAR',v?500:610,v?220:165,v?19:15),
   {...t('vertical','Título vertical','CIUDAD PLEGADA',1000,v?280:210,v?35:26),rotation:90},
   t('subtitle','Subtítulo','EXPOSICIÓN DE IMÁGENES ARQUITECTÓNICAS',55,py-24,v?26:20),
   photo('photo','Arquitectura brutalista','arquitectura-brutalista',0,py,1080,ph),
   a('dates','Fechas','06.11 — 20.12',55,foot+(v?130:80),v?82:q?58:66),
   a('hours','Horarios','10:00—19:00\nLUNES CERRADO\nAPERTURA 06.11 / 18:00',760,foot+(v?80:q?30:45),v?23:19),
   rect('infoRule','Línea de información',55,H-225,970,2,black),
   a('venue','Sede','SEDE\nTU MUSEO DE ARTE\nALA NORTE / TU DIRECCIÓN',55,H-175,v?24:20),
   a('admission','Entrada','ENTRADA GRATUITA\nRESERVA PREVIA',435,H-175,v?24:20),
   a('curator','Curaduría','CURADURÍA\nTU NOMBRE\nDISEÑO: TU ESTUDIO',775,H-175,v?24:20),
   rect('band','Banda inferior',0,H-65,1080,65,black),a('footer','Créditos','ORGANIZA: TU MUSEO · COLABORA: LABORATORIO DE IMAGEN URBANA',55,H-25,19,'#e7e000')
  ];
 }
 if(template==='P16'){
  const top=120,bottom=v?1300:q?705:895,boxH=bottom-top;
  return [rect('paper','Fondo crema',0,0,1080,H,cream),
   a('header','Cabecera','ARCO LUMEN\nESTUDIO DE FORMA / 2026',65,55,20),
   rect('blue','Campo azul',60,top,960,boxH,'#368db6'),
   s('motto','Lema','CRECER\nMÁS ALLÁ\nDE LO\nCONOCIDO',85,top+80,v?29:23),
   shape('sun','Medio sol','semicircle',150,top+boxH*.29,v?180:135,v?90:67.5,'#f58d58'),
   {...rect('diamond','Rombo amarillo',610,top+boxH*.16,18,18,'#f6d766'),rotation:45},
   shape('ribbon','Cinta geométrica','ribbon',60,top+boxH*.32,960,boxH*.61,cream),
   ...[0,1,2].map(i=>rect('square'+i,'Punto cuadrado '+(i+1),805+i*30,bottom-120,14,14,cream)),
   rect('cross1','Marca vertical superior',835,top+10,1,125,black),rect('cross2','Marca horizontal superior',790,top+120,220,1,black),
   rect('cross3','Marca vertical inferior',90,bottom-140,1,110,black),rect('cross4','Marca horizontal inferior',60,bottom-120,140,1,black),
   a('hours','Horario','HORARIO DEL ARCHIVO\n09:30—19:30',65,bottom+65,v?25:20),
   s('dates','Fechas','18.09\n—\n06.10',65,bottom+(v?210:145),v?65:q?34:44),
   s('title','Título','ARCHIVO\nFLOTANTE',520,bottom+(v?155:90),v?85:q?57:68),
   {...a('side','Texto lateral','EXPOSICIÓN DE FORMA / ARCHIVO FLOTANTE',1020,bottom+45,q?12:15),rotation:90},
   a('footer','Sede y créditos','PRESENTA: TU ESTUDIO  ·  SEDE: SALA EXPERIMENTAL  ·  TU CIUDAD',65,H-35,17)
  ];
 }
 if(template==='P17'){
  const panelY=130,panelH=v?820:q?420:550,after=panelY+panelH;
  return [rect('paper','Fondo papel',0,0,1080,H,cream),
   circle('yellow','Círculo amarillo',-80,H-(v?490:290),v?800:610,'#e7b71a'),
   shape('orange','Bloque naranja','paperCut',210,panelY,815,panelH,'#ee940b'),
   {...rect('slash1','Corte diagonal superior',450,panelY+70,60,panelH*.76,cream),rotation:-38},
   {...rect('slash2','Corte diagonal izquierdo',190,panelY+panelH*.46,34,panelH*.38,cream),rotation:-38},
   t('presenter','Presentador','PRESENTA\nTU UNIVERSIDAD\nDE LAS ARTES',55,175,v?25:20),
   t('host','Organizador','ORGANIZA\nLABORATORIO\nDE SONIDO',55,v?470:q?320:375,v?25:20),
   t('forum','Foro','6.º FORO\nDEL ARCHIVO\nSONORO URBANO',55,v?720:q?470:585,v?25:20),
   t('title','Título','VOLVER A',260,panelY+(v?220:q?125:150),v?140:q?98:115),
   t('title2','Título segunda línea','ESCUCHAR',260,panelY+(v?390:q?235:285),v?140:q?98:115),
   t('topic','Tema','LOS ARCHIVOS DE LA CIUDAD',260,panelY+panelH-150,v?38:29),
   t('description','Descripción','GRABACIONES DE CAMPO\nY MEMORIA COMUNITARIA',400,panelY+panelH-85,v?28:22),
   t('subtitle','Subtítulo','RECONSTRUIR EL SONIDO URBANO\nDESDE SUS ARCHIVOS',55,after+(v?110:65),v?49:q?32:39),
   shape('green','Papel verde','paperCut',790,after+(v?60:20),240,v?360:215,'#7fb5a5'),
   circle('seal','Sello negro',810,after+60,160,black),t('sealText','Texto del sello','ENTRADA LIBRE\nINSCRIPCIÓN PREVIA',835,after+125,17,cream),
   ...['TU NOMBRE','INVITADO 02','INVITADO 03'].map((n,i)=>t('speaker'+i,'Ponente '+(i+1),n,55+i*245,after+(v?310:q?190:235),v?30:24)),
   ...['RESTAURACIÓN\nDE AUDIO','INVESTIGACIÓN\nSONORA','HISTORIA ORAL\nY ARCHIVOS'].map((n,i)=>a('role'+i,'Profesión '+(i+1),n,55+i*245,after+(v?355:q?225:275),v?20:16)),
   t('venue','Sede','TU UNIVERSIDAD DE LAS ARTES\nAUDITORIO PRINCIPAL',95,H-(v?325:205),v?34:26),
   t('date','Fecha','SÁBADO 24 OCTUBRE 2026',95,H-(v?205:118),v?44:32),
   t('time','Horario','17:30—20:10',95,H-(v?130:70),v?52:36),
   a('credit','Crédito','TU ARCHIVO\nEDICIÓN 06 / 2026',790,H-65,20)
  ];
 }
 if(template==='P18'){
  const py=v?440:q?250:310,pw=v?820:(H-py-60)*2/3,px=1080-pw;
  return [rect('paper','Fondo gris',0,0,1080,H,'#f0f1f1'),
   photo('portrait','Retrato con prisma','retrato-prisma',px,py,pw,H-py-60),
   rect('badge','Etiqueta lima',700,50,325,45,lime),a('program','Programa','PERCEPCIÓN / 2026',718,80,21),t('brand','Marca','CAMPO PRISMA',795,133,28),
   t('title','Título','FRONTERA',55,v?300:q?205:230,v?170:q?135:150),
   rect('underline','Subrayado lima',55,v?325:q?230:255,v?750:610,14,lime),
   t('title2','Título segunda línea','SENSORIAL',55,v?525:q?380:435,v?163:q?125:140),
   t('subtitle','Subtítulo','REDEFINE EL LÍMITE',55,v?615:q?450:515,v?57:q?36:43),
   a('description','Descripción','LUZ, MATERIA Y MOVIMIENTO.\nOTRA FORMA DE PERCIBIR\nLO COTIDIANO.',55,v?705:q?510:590,v?27:21),
   {...a('dates','Fechas','18.10 — 26.10',1018,185,v?52:34),rotation:90},
   ...[0,1,2,3,4].map((i)=>rect('check'+i,'Cuadrado '+(i+1),55+(i%2)*50,(v?1040:q?620:780)+Math.floor(i/2)*50,48,48,black)),
   t('venue','Sede','UBICACIÓN\nTU ESPACIO A—07',55,H-260,v?31:24),
   rect('venueLine','Subrayado de sede',55,H-213,330,7,lime),
   a('code','Código','PF · 026',55,H-135,v?48:34),
   a('footer','Crédito','PROGRAMA DE INVESTIGACIÓN VISUAL',235,H-25,18),
   rect('topCross','Marca superior',28,25,90,1,black),rect('leftCross','Marca izquierda',42,12,1,85,black)
  ];
 }
 if(template==='P19'){
  return [rect('paper','Fondo claro',0,0,1080,H,'#eeeeeb'),
   photo('photo','Fotografía de costa','costa-cormoran',0,0,1080,H),
   a('header','Archivo','TU NOMBRE / ARCHIVO FOTOGRÁFICO\nEXPOSICIÓN N.º 07 · COSTA 2019—2026',55,70,v?22:18),
   a('venue','Galería y fechas','12 SEP — 30 NOV 2026\nTU GALERÍA / DISTRITO DEL PUERTO',665,70,v?21:17),
   t('title','Título','MAREA',55,v?390:q?265:310,v?190:q?135:155,red),
   t('title2','Título segunda línea','BAJA',55,v?625:q?420:495,v?210:q?155:175,red),
   s('script','Lema','luz lenta',590,v?645:q?350:480,v?65:q?44:52),
   rect('footerPanel','Fondo de información',0,H-190,1080,190,'#e8e8e3'),
   a('note','Nota de exposición','VEINTICUATRO COPIAS EN GELATINA DE PLATA.\nUN ESTUDIO DE LA MAREA, LA PACIENCIA\nY LA ÚLTIMA LUZ DEL DÍA.',55,H-135,v?23:19),
   a('admission','Entrada y horario','ENTRADA LIBRE\nTODOS LOS DÍAS / 10:00—19:00',710,H-135,v?23:19),
   rect('bottomRule','Línea roja',55,H-35,970,3,red)
  ];
 }
 if(template==='P20'){
  const rot=-12;
  return [rect('paper','Fondo blanco',0,0,1080,H,'#f5f1e8'),
   photo('photo','Cruce peatonal','cruce-urbano',0,0,1080,H),
   {...a('header','Fecha del diario','DÍA 269 / 26.09.2026',370,v?170:q?130:150,23,black),rotation:rot},
   {...s('morning','Nota de mañana','07:12 · CAMINAR. AIRE FRESCO.',180,v?270:q?210:240,24,black),rotation:rot},
   {...s('coffee','Nota de café','08:40 · CAFÉ PARA LLEVAR. TODOS CRUZAMOS.',160,v?860:q?475:600,v?25:21,black),rotation:rot},
   {...a('title','Título','DISEÑO',75,v?1110:q?650:795,v?152:q?118:132,black),bold:true,rotation:rot},
   {...a('title2','Título segunda línea','INCLUSIVO',100,v?1440:q?845:1020,v?133:q?103:117,black),bold:true,rotation:rot},
   {...a('step','Nota de paso','UN PASO MÁS.',740,v?630:q?355:440,21,black),bold:true,rotation:rot},
   {...s('evening','Nota final','18:20 · HOY TOMÉ EL CAMINO LARGO.',260,H-90,23,black),rotation:rot}
  ];
 }
 return [];
}
