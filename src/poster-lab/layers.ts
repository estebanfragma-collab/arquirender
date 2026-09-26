import {finalLayers,finalNames} from './final-templates';
import {editorialLayers,editorialNames} from './editorial-templates';
import {newLayers,newNames} from './new-templates';
import {remainingLayers,remainingNames} from './remaining-templates';
import {compactLayout} from './format-layouts';
export type Layer = {id:string; name:string; type:'text'|'rect'|'triangle'|'ellipse'|'image'|'bolt'|'wave'|'arc'|'semicircle'|'ribbon'|'paperCut'|'glasses'|'fish'; x:number;y:number;w:number;h:number;color:string;text:string;size:number;font:string;bold:boolean;src?:string;zoom?:number;offsetX?:number;offsetY?:number;mono?:boolean;crop?:'ellipse'|'none'|'bolt'|'wave'|'arch'|'rounded';rotation?:number;shadowColor?:string;fit?:'cover'|'contain';outline?:boolean;sliceIndex?:number;sepia?:boolean;panelIndex?:number;spriteIndex?:number;spriteColumns?:number;imageAlignTop?:boolean;textStroke?:string;imageFill?:boolean};
const shape=(id:string,name:string,type:Layer['type'],x:number,y:number,w:number,h:number,color:string):Layer=>({id,name,type,x,y,w,h,color,text:'',size:24,font:'Arial',bold:false});
const text=(id:string,name:string,value:string,x:number,y:number,size:number,bold=false)=>({...shape(id,name,'text',x,y,850,120,'#151918'),text:value,size,bold});
export type LayerTemplate = "P01" | "P02" | "P03" | "P04" | "P05" | "P06" | "P07" | "P08" | "P09" | "P10" | "P11" | "P12" | "P13" | "P14" | "P15" | "P16" | "P17" | "P18" | "P19" | "P20" | "P21" | "P22" | "P23" | "P24" | "P25" | "P26" | "P27" | "P28" | "P29" | "P30" | "P31" | "P32" | "P33" | "P34" | "P35" | "P36" | "P37" | "P38" | "P39" | "P40";
export function initialLayers(template:LayerTemplate="P03"):Layer[]{if(template in finalNames)return finalLayers(template);if(template in editorialNames)return editorialLayers(template);if(template in newNames)return newLayers(template);if(template in remainingNames)return remainingLayers(template);if(template==="P13")return companionLayers();if(template==="P12")return conferenceLayers();if(template==="P11")return architectureLayers();if(template==="P10")return archiveLayers();if(template==="P09")return galleryLayers();if(template==="P08")return signalLayers();if(template==="P06")return nightWalkLayers();if(template==="P05")return cinemaLayers();if(template==="P04")return electricLayers();if(template==="P02")return productLayers();if(template==="P01")return speakerLayers();if(template==="P07")return swissLayers();return [
 shape('paper','Fondo marfil','rect',0,0,1080,1920,'#f3efe4'),
 shape('diagonal','Diagonal verde','triangle',390,0,690,850,'#153f34'),
 text('header','Cabecera','ESTUDIO ABIERTO / EDICIÓN 07',90,130,22),
 shape('mark','Marca superior','rect',90,175,45,8,'#153f34'),
 text('title','Título','MANUAL\nDE CAMPO\nNOCTURNO',90,565,100),
 text('description','Descripción','UNA EXPOSICIÓN SOBRE FOTOGRAFÍA NOCTURNA,\nARCHIVOS BOTÁNICOS Y LA ARQUITECTURA\nDE LA ATENCIÓN.',90,960,24),
 text('curator','Curaduría','CURADURÍA: TU ESTUDIO',90,1090,22),
 ...[90,410,730].map((x,i)=>shape('mark'+i,'Marca de columna '+(i+1),'rect',x,1360,40,8,'#153f34')),
 ...[370,690].map((x,i)=>shape('separator'+i,'Separador '+(i+1),'rect',x,1355,1,370,'#81877f')),
 text('program','Etiqueta de programa','INAUGURACIÓN /\nPROGRAMA',90,1420,20),
 text('date','Fecha','JUEVES\n26 · 03',90,1530,42,true),
 text('hours','Horarios','APERTURA 18:30\nRECORRIDO 21:00\nÚLTIMO ACCESO 21:45',90,1640,18),
 text('exhibition','Etiqueta de exposición','EXPOSICIÓN /\nSERIE IMPRESA',410,1420,20),
 text('works','Número de obras','78\nOBRAS',410,1530,42,true),
 text('details','Detalles de exposición','16 NUEVAS PIEZAS\nSEIS ESTACIONES\nUN ARCHIVO',410,1640,18),
 text('venue','Etiqueta de sede','SEDE /\nSALA PRINCIPAL',730,1420,20),
 text('range','Fechas de exposición','27.03—19.04',730,1530,32,true),
 text('address','Dirección','TU DIRECCIÓN\nJUEVES A DOMINGO\n11:00—18:00',730,1640,18),
 shape('rule','Línea del pie','rect',90,1790,900,1,'#81877f'),
 text('footer','Crédito del pie','TU ESTUDIO / SERIE DE PÓSTERS / DOS TINTAS',90,1830,17),
 shape('square','Cuadrado final','rect',958,1810,32,32,'#153f34')
];}
function companionLayers():Layer[]{
 const blue='#0868cf',white='#fafafa',black='#101918';
 const t=(id:string,name:string,value:string,x:number,y:number,size:number,color=white)=>({...text(id,name,value,x,y,size),font:'Impact',color});
 return [
 shape('paper','Fondo azul','rect',0,0,1080,1920,blue),
 shape('base','Panel blanco','rect',0,1570,1080,350,white),
 {...shape('cats','Fotografía de los cinco gatos','image',0,890,1080,720,white),src:'/poster-lab/mascotas-gatos.png',fit:'cover',crop:'none',zoom:1},
 {...text('header','Cabecera','NOTAS DE COMPAÑÍA\nVIDA COTIDIANA / 2026',55,80,22),color:white},
 {...text('intro','Introducción','UN HOGAR TRANQUILO\nCOMPARTIDO CON GATOS',350,80,22),color:white},
 {...text('count','Descripción','CINCO VIDAS\nUNA RUTINA CÁLIDA',665,80,22),color:white},
 t('title','Título','UN',55,410,265),
 t('title2','Título segunda línea','HOGAR',55,685,245),
 ...['LA VIDA','ES MÁS','SUAVE','CUANDO','ESTAMOS','JUNTOS'].map((v,i)=>t('motto'+i,'Lema '+(i+1),v,800,270+i*78,36)),
 ...Array.from({length:6},(_,i)=>shape('line'+i,'Línea del lema '+(i+1),'rect',800,287+i*78,230,2,white)),
 shape('arc1','Trazo izquierdo','arc',140,755,270,75,white),
 {...shape('arc2','Trazo central','arc',465,770,160,55,white),rotation:-25},
 shape('arc3','Trazo derecho','arc',785,790,210,55,white),
 shape('dot1','Punto de nota','ellipse',55,1650,12,12,black),
 shape('dot2','Punto de compañía','ellipse',380,1650,12,12,black),
 text('note','Nota','MOMENTOS COTIDIANOS\nPARA CORAZONES AMABLES',80,1670,20),
 text('together','Nota de compañía','NOTAS SOBRE\nVIVIR JUNTOS',405,1670,20),
 t('footer','Mensaje final','DÍAS FELICES\nMEJOR EN COMPAÑÍA',55,1800,53,black),
 shape('ring1','Anillo superior','ellipse',820,1670,90,90,blue),
 shape('ring1Inside','Interior superior','ellipse',830,1680,70,70,white),
 shape('ring2','Anillo inferior','ellipse',800,1740,90,90,blue),
 shape('ring2Inside','Interior inferior','ellipse',810,1750,70,70,white),
 t('close','Sello','CERCA\nDE TI',935,1760,30,black),
 shape('bottomRule','Línea inferior','rect',55,1890,970,3,black)
 ];
}
function conferenceLayers():Layer[]{
 const black='#171918',cream='#eee8da',mustard='#dfb651',sage='#8bab9e',violet='#40394f';
 const t=(id:string,name:string,value:string,x:number,y:number,size:number)=>({...text(id,name,value,x,y,size),font:'Impact',color:black});
 return [
 shape('paper','Fondo crema','rect',0,0,1080,1920,cream),
 {...shape('portrait','Retrato del ponente','image',535,180,545,780,cream),src:'/poster-lab/retrato-base.png',crop:'none',fit:'contain',zoom:2,offsetX:-20,offsetY:0,mono:true},
 t('header','Cabecera','9.ª CONVENCIÓN DE INNOVACIÓN\nFORO DE APERTURA · CIUDAD Y FUTURO\nSESIÓN 01 / IMAGINAR LA CIUDAD',55,65,25),
 shape('emblem','Emblema exterior','ellipse',805,42,60,60,black),
 shape('emblemInner','Centro del emblema','ellipse',817,54,36,36,cream),
 t('brand','Marca del evento','INNOVACIÓN\nGLOBAL / 09',885,65,22),
 t('guest','Etiqueta del ponente','CONFERENCIA INVITADA',55,415,34),
 t('name','Nombre del ponente','ESTEBAN PONCE',55,485,46),
 text('role','Profesión','ARQUITECTURA Y DISEÑO URBANO',55,540,20),
 text('quote','Cita','Una ciudad es mucho más\nque un conjunto de edificios.\nEs una forma de vivir juntos,\nde compartir memoria y\nde imaginar lo que viene.',55,650,27),
 shape('yellow','Panel mostaza','rect',0,960,560,880,mustard),
 shape('green','Panel verde','rect',560,960,520,880,sage),
 t('forum','Tema del foro','FORO DE APERTURA\nCIUDAD Y DISEÑO DEL FUTURO',55,1040,27),
 t('title','Título','REIMAGINAR\nLA CIUDAD',55,1190,78),
 t('keynoteLabel','Etiqueta de apertura','PONENCIAS DE APERTURA',55,1345,24),
 text('keynotes','Ponentes de apertura','TU NOMBRE / Investigación urbana\nINVITADO 02 / Espacio público',55,1390,21),
 t('speakersLabel','Etiqueta de invitados','VOCES INVITADAS',55,1485,24),
 text('speakers','Invitados','INVITADO 03 / Arquitectura\nINVITADO 04 / Comunidades\nINVITADO 05 / Cultura y ciudad',55,1530,21),
 t('moderatorLabel','Etiqueta de moderación','MODERA',55,1660,24),
 text('moderator','Moderación','TU NOMBRE / Diseño y pensamiento',55,1705,21),
 t('presentedLabel','Etiqueta de organizadores','PRESENTAN',610,1120,27),
 text('presented','Organizadores','Tu institución\nDepartamento de planificación\nLaboratorio de futuros urbanos',610,1170,23),
 t('producedLabel','Etiqueta de producción','PRODUCCIÓN',610,1320,27),
 text('produced','Producción','Tu estudio de diseño\nCentro de estudios de la ciudad',610,1370,23),
 t('dateLabel','Etiqueta de fecha','FECHA',610,1515,27),
 text('date','Fecha y hora','23 SEPTIEMBRE 2026\n14:30—16:50',610,1565,24),
 t('venueLabel','Etiqueta de sede','SEDE',610,1675,27),
 text('venue','Sede','AUDITORIO PRINCIPAL\nTU CENTRO CULTURAL',610,1725,23),
 shape('bottom','Banda inferior','rect',0,1840,1080,80,violet),
 {...t('footerDate','Fecha del pie','23 SEP 2026',45,1890,25),color:cream},
 {...t('footerTime','Hora del pie','14:30—16:50',310,1890,25),color:cream},
 {...t('footerVenue','Sede del pie','TU CIUDAD / AUDITORIO PRINCIPAL',580,1890,23),color:cream}
 ];
}
function architectureLayers():Layer[]{
 const lime='#d5f22c',black='#101110';
 const t=(id:string,name:string,value:string,x:number,y:number,size:number)=>({...text(id,name,value,x,y,size),font:'Impact',color:black});
 const photo=(id:string,name:string,index:number,x:number,y:number,w:number,h:number):Layer=>({...shape(id,name,'image',x,y,w,h,'#ffffff'),src:'/poster-lab/arquitectura-estudio.png',panelIndex:index,crop:'none',fit:'cover',zoom:1});
 return [
 shape('paper','Fondo gris','rect',0,0,1080,1920,'#d9d9d5'),
 t('header','Cabecera','ESTUDIO ABIERTO / 02',55,90,28),
 shape('topRule','Línea superior','rect',55,112,225,2,black),
 {...text('issue','Número de edición','02',735,305,295),color:lime},
 t('date','Fecha','22.06.2026 · 15:00—18:00',735,350,25),
 t('room','Sala','SALA 27',735,395,30),
 t('title','Título','COMPARTIR',55,340,132),
 t('title2','Título segunda línea','A OTRA',55,505,145),
 t('title3','Título tercera línea','ESCALA',55,670,145),
 t('tagline','Tema','HABITAR\nENTRE\nESPACIOS',55,795,32),
 shape('accent1','Acento de tema','rect',55,922,25,25,lime),
 t('session','Sesión','SESIÓN\nPÚBLICA / 06',55,1100,30),
 shape('accent2','Acento de sesión','rect',55,1180,25,25,lime),
 photo('model','Foto de maqueta',0,350,700,310,560),
 photo('plans','Foto de planos',1,680,700,340,850),
 photo('door','Foto de acceso',2,185,1280,475,270),
 shape('infoRule','Línea de información','rect',55,1590,970,2,black),
 t('speaker','Nombre','TU NOMBRE',55,1670,43),
 text('role','Profesión','INVESTIGACIÓN ESPACIAL',55,1710,19),
 shape('accent3','Acento de nombre','rect',55,1750,20,20,lime),
 shape('divider','Separador','rect',340,1630,1,150,black),
 text('description','Descripción','¿CÓMO DAN FORMA LOS ESPACIOS\nCOTIDIANOS A NUESTRA VIDA?\nUNA MESA, UNA PUERTA,\nUN PASILLO COMPARTIDO.',380,1650,22),
 t('venue','Lugar','SALA 27',860,1705,29),
 shape('accent4','Acento de lugar','rect',860,1745,20,20,lime),
 shape('bottomRule','Línea inferior','rect',55,1810,970,2,black),
 text('footer','Pie','NOTAS DE CAMPO     /     ESPACIO COMÚN     /     NUEVAS FORMAS',55,1855,18),
 text('series','Serie','SERIE DE PEQUEÑOS ESPACIOS',700,1895,16)
 ];
}
function archiveLayers():Layer[]{
 const t=(id:string,name:string,value:string,x:number,y:number,size:number)=>({...text(id,name,value,x,y,size),font:'Courier New',color:'#514b42'});
 return [
 shape('paper','Papel de archivo','rect',0,0,1080,1920,'#e9e4d9'),
 t('header','Archivo','ARCHIVO NORTE / RETRATOS',60,75,24),
 t('serial','Número de registro','REGISTRO 26 · 041',735,75,21),
 t('edition','Edición','EXPOSICIÓN / MEMORIA Y MATERIA',60,118,19),
 shape('topRule','Línea superior','rect',60,145,960,1,'#847b6d'),
 {...text('title','Título','ESTRATOS',60,282,105),font:'Times New Roman',color:'#8d8374'},
 ...[0,1,2,3].map(i=>({...shape('strip'+i,['Fragmento superior','Fragmento de ojos','Fragmento de rostro','Fragmento inferior'][i],'image',[45,80,55,90][i],310+i*322,940,310,'#736554'),src:'/poster-lab/retrato-base.png',sliceIndex:i,sepia:true,crop:'none' as const,zoom:1})),
 {...text('memory','Tema superpuesto','ESTRATOS DE MEMORIA',450,890,35),font:'Times New Roman',color:'#fffaf0'},
 shape('circle','Círculo de archivo','ellipse',765,1390,245,245,'#9b754a'),
 {...t('seal','Sello','NR\n26—041',812,1490,34),color:'#f4eee2'},
 t('accession','Código de pieza','ACCESIÓN / NR-26-041',65,1680,30),
 {...text('subtitle','Subtítulo','LA MEMORIA TIENE CAPAS',65,1740,40),font:'Times New Roman',color:'#403a32'},
 t('dates','Fechas','18—27 OCT 2026',65,1815,25),
 t('venue','Lugar','SALA C / TU GALERÍA',635,1815,23),
 shape('bottomRule','Línea inferior','rect',60,1845,960,1,'#847b6d'),
 t('footer','Pie','FOTOGRAFÍA · ARCHIVO · IDENTIDAD',65,1890,20)
 ];
}
function galleryLayers():Layer[]{
 const t=(id:string,name:string,value:string,x:number,y:number,size:number)=>({...text(id,name,value,x,y,size),font:'Times New Roman',color:'#151515'});
 return [
 shape('paper','Fondo blanco','rect',0,0,1080,1920,'#faf9f6'),
 {...shape('photo','Fotografía urbana','image',60,1030,960,800,'#ffffff'),src:'/poster-lab/galeria-lluvia.png',fit:'cover',crop:'none',zoom:1,mono:false},
 t('title','Título','NUEVAS\nESCENAS\nURBANAS',60,170,82),
 t('kicker','Tema','CIUDAD EN MOVIMIENTO',460,190,18),
 t('subtitle','Subtítulo','IMÁGENES EN\nCONVERSACIÓN',460,245,33),
 t('range','Periodo','8 SEP — 20 OCT',460,335,26),
 t('motto','Lema','TODOS\nESTAMOS\nEN MOVIMIENTO',830,155,26),
 t('date','Fecha','8 SEP',60,830,54),
 t('time','Hora','14:00',60,890,38),
 t('talk','Conversación','IMÁGENES EN\nCONVERSACIÓN',310,820,35),
 t('description','Descripción','Una conversación sobre caminar,\nmirar y la ciudad que habitamos.',310,910,24),
 t('admission','Entrada','CHARLA ABIERTA · ENTRADA LIBRE',310,987,19),
 t('venueLabel','Etiqueta de sede','SEDE',770,835,21),
 t('venue','Lugar','ESPACIO DE ARTES\nSALA LUZ Y SOMBRA',770,895,22),
 t('entrance','Acceso','ENTRADA 2 · ALA ESTE',770,977,20),
 t('footer','Pie','EXPOSICIÓN DE FOTOGRAFÍA URBANA',60,1880,16),
 t('edition','Edición','PROYECTO ESPECIAL · 2026',470,1880,16),
 t('credit','Crédito','TU GALERÍA · ENTRADA LIBRE',785,1880,16)
 ];
}
function signalLayers():Layer[]{
 const lime='#9bed00',purple='#7025ff',black='#080808';
 const t=(id:string,name:string,value:string,x:number,y:number,size:number,color=black)=>({...text(id,name,value,x,y,size,true),font:'Impact',color});
 return [
 shape('paper','Fondo blanco','rect',0,0,1080,1920,'#fafafa'),
 shape('wave1','Onda superior','wave',450,510,560,670,lime),
 {...shape('wave2','Onda central','wave',440,910,590,550,lime),rotation:-10},
 shape('wave3','Onda inferior','wave',410,1280,620,390,lime),
 text('header','Cabecera','SEÑAL / ESTUDIO 05',55,85,25),
 t('title','Título','SEÑALES',50,330,205),
 t('title2','Segunda línea','ALTERADAS',50,535,178),
 {...t('lab','Laboratorio','LAB',50,835,240,purple),outline:true},
 t('experiment','Experimento','EXPERIMENTO\nDE FRECUENCIA',55,1090,53),
 {...text('date','Fecha','{ 18.05 }',55,1250,48,true),color:purple},
 text('manifesto','Manifiesto','DESVIARSE NO ES UN ERROR.\nES UNA NUEVA ENTRADA.\nSIGUE TU INTUICIÓN.',55,1320,23),
 text('annotation','Anotación','RUIDO /\nMOVIMIENTO /\nMEMORIA',865,880,22),
 shape('pointer','Línea de anotación','rect',810,900,180,2,black),
 shape('node','Punto de anotación','rect',800,896,9,9,black),
 text('index','Índice','NOVA ÍNDICE 04',180,1630,24),
 shape('rule','Línea principal','rect',50,1695,980,4,black),
 t('brand','Nombre del estudio','MORPHO LAB',50,1785,104),
 {...text('unit','Unidad','UNIDAD DE MEDIOS',50,1850,55),outline:true},
 shape('footerRule','Línea inferior','rect',50,1870,980,2,black),
 text('footer','Pie','INSTITUTO DE MEDIOS · SERIE EXPERIMENTAL',50,1908,18),
 {...text('district','Distrito','NOVA / 05—18',820,1908,18),color:purple},
 ...[0,1,2,3].map(i=>shape('cross'+i,'Marca técnica '+(i+1),'rect',i<2?920:970,i%2?180:110,i<2?65:2,i<2?2:65,purple)),
 ...Array.from({length:12},(_,i)=>shape('tick'+i,'Escala '+(i+1),'rect',1000,260+i*12,i%3?12:22,2,purple)),
 ...Array.from({length:9},(_,i)=>shape('check'+i,'Mosaico '+(i+1),'rect',55+(i%3)*14,1610+Math.floor(i/3)*14,9,9,purple))
 ];
}
function swissLayers():Layer[]{return [
 shape('paper','Fondo blanco','rect',0,0,1080,1920,'#f7f5ef'),
 shape('circle','Círculo rojo','ellipse',100,440,880,880,'#f01818'),
 {...shape('portrait','Retrato','image',200,420,680,1020,'#f01818'),src:'/poster-lab/suizo-retrato-v2.png',zoom:1,offsetX:0,offsetY:0,mono:false,crop:'none'},
 text('name','Nombre','ESTEBAN',60,285,150,true),
 text('surname','Apellido','PONCE',60,455,165,true),
 text('header','Cabecera','ESTUDIO ABIERTO / 2026',620,75,22,true),
 text('role','Profesión','ARQUITECTURA Y CREATIVIDAD',620,115,18),
 text('agenda','Agenda','18:00\nCONVERSACIÓN\nESTUDIO ABIERTO\n\n19:30\nENCUENTRO\nSALA PRINCIPAL',790,485,22,true),
 text('date','Fecha','17 FEB\nJUEVES',60,1250,42,true),
 text('title','Título','NOTAS SOBRE',60,1470,117,true),
 {...text('topic','Tema destacado','CREATIVIDAD',60,1640,125,true),color:'#f01818'},
 text('footer','Información final','UNA CONVERSACIÓN SOBRE IDEAS,\nESPACIOS Y NUEVAS FORMAS DE CREAR.',60,1760,25),
 text('venue','Lugar','TU ESTUDIO · TU CIUDAD',60,1850,22,true)
];}
export const templateNames:Record<LayerTemplate,string>={P01:'Conferencista geométrico',P02:'Producto editorial',P03:'Minimal diagonal',P04:'Collage eléctrico',P05:'Cine nocturno',P06:'Tipografía gigante',P07:'Retrato suizo',P08:'Ondas experimentales',P09:'Galería fotográfica',P10:'Retrato fragmentado',P11:'Revista de arquitectura',P12:'Conferencia en bloques',P13:'Mascotas y compañía',...finalNames,...remainingNames,...editorialNames,...newNames};
function speakerLayers():Layer[]{
 const blue='#07358f',red='#e62b08',cream='#f3efe4';
 return [
 shape('paper','Fondo marfil','rect',0,0,1080,1920,cream),
 shape('yellow','Círculo amarillo','ellipse',20,830,1000,1000,'#edaa00'),
 shape('inner','Interior del círculo','ellipse',200,1010,640,640,cream),
 {...shape('diagonal','Plano rojo','rect',480,880,850,1400,red),rotation:38},
 {...shape('portrait','Retrato','image',20,865,925,1255,blue),src:'/poster-lab/conferencista-retrato.png',crop:'none',zoom:1,mono:false},
 shape('sidebar','Banda azul','rect',910,0,170,1920,blue),
 {...text('title','Título','DALE RUMBO',50,210,154,true),font:'Impact'},
 {...text('title2','Título segunda línea','A TU',50,395,178,true),font:'Impact'},
 {...text('title3','Título tercera línea','IMAGINACIÓN',50,565,142,true),font:'Impact'},
 {...text('tagline','Subtítulo','REINVENTA LO COTIDIANO,',50,640,40,true),font:'Impact'},
 {...text('tagline2','Subtítulo segunda línea','DESCUBRE LO DESCONOCIDO',50,690,40,true),font:'Impact'},
 text('topics','Temas','CULTURA VISUAL / CIUDAD / NUEVOS MEDIOS',50,747,22,true),
 ...[blue,red,'#111111'].map((c,i)=>shape('dot'+i,'Punto '+(i+1),'ellipse',50+i*72,780,48,48,c)),
 {...text('brand','Marca','AR',941,145,70,true),color:cream},
 shape('rule1','Línea superior','rect',948,205,96,2,cream),
 {...text('name','Nombre','ESTEBAN PONCE',958,292,67,true),color:cream,rotation:90},
 shape('rule2','Línea central','rect',948,1080,96,2,cream),
 {...text('role','Profesión','ARQUITECTURA Y DISEÑO',960,1130,23,true),color:cream,rotation:90},
 {...text('studio','Estudio','ESTUDIO CREATIVO / CONFERENCIA',1005,1130,19),color:cream,rotation:90},
 {...text('arrow','Flecha','↗',940,1800,120),color:cream},
 shape('rule3','Línea inferior','rect',948,1830,96,2,cream),
 shape('dotEnd','Punto final','ellipse',973,1860,48,48,cream)
 ];
}
function productLayers():Layer[]{
 const blue='#083c99',cream='#f3ecdf',orange='#ef7a20';
 const copy=(id:string,name:string,value:string,x:number,y:number,size:number,bold=false)=>({...text(id,name,value,x,y,size,bold),color:blue});
 return [
 shape('paper','Fondo crema','rect',0,0,1080,1920,cream),
 shape('rail','Línea lateral','rect',200,65,2,1650,blue),
 {...shape('product','Audífonos','image',245,240,790,1070,blue),src:'/poster-lab/producto-audifonos.png',crop:'none',zoom:1,mono:false},
 {...copy('edition','Edición','NOTA DE CAMPO 07',75,575,24,true),rotation:-90},
 {...copy('club','Club','CLUB DE ESCUCHA',145,575,24,true),rotation:-90},
 shape('dotTop','Punto superior','ellipse',68,76,16,16,blue),
 shape('rule1','Línea del horario','rect',55,655,105,2,blue),
 copy('date','Fecha','JUE / 19 SEP',55,705,20),
 copy('time','Horario','19:30–21:00',55,740,20),
 shape('dotMid','Punto central','ellipse',68,800,16,16,blue),
 shape('rule2','Línea del lema','rect',55,1050,105,2,blue),
 copy('motto','Lema','MÁS ALLÁ\nDE LO OBVIO',55,1100,19),
 shape('rule3','Línea inferior lateral','rect',55,1190,105,2,blue),
 shape('dotBottom','Punto inferior','ellipse',68,1230,16,16,blue),
 copy('stamp','Sello editorial','ESCUCHA DE CERCA\nPIENSA EN GRANDE',690,130,19,true),
 shape('stampDot','Acento del sello','ellipse',930,175,13,13,orange),
 {...copy('title','Título','ESCUCHA',220,1460,166,true),font:'Impact'},
 {...copy('title2','Título segunda línea','DIFERENTE',55,1650,186,true),font:'Impact'},
 copy('set','Sesión','SESIÓN DESTACADA\nMAREA / 42 MIN',245,1765,23),
 copy('venue','Lugar y aforo','SOLO 12 PLAZAS\nPATIO SONORO, SALA 04\nTU CIUDAD',665,1765,23),
 shape('accent','Anillo naranja','ellipse',58,1838,30,30,orange),
 shape('accentInner','Interior del anillo','ellipse',64,1844,18,18,cream)
 ];
}
function electricLayers():Layer[]{
 const cream='#f5ead4';
 const copy=(id:string,name:string,value:string,x:number,y:number,size:number)=>({...text(id,name,value,x,y,size,true),font:'Impact',color:cream});
 return [
 shape('paper','Fondo rojo','rect',0,0,1080,1920,'#b50906'),
 shape('frame','Marco del rayo','bolt',57,322,876,1305,cream),
 {...shape('photo','Retratos','image',70,337,850,1275,cream),src:'/poster-lab/collage-retratos.png',crop:'bolt',zoom:1,mono:false},
 copy('title','Título','ECO',50,215,210),
 copy('title2','Título segunda línea','ESTÁTICO',50,375,140),
 {...copy('live','Lema','EN VIVO',460,145,52),font:'Georgia',rotation:-12},
 {...copy('live2','Lema segunda línea','TRANSMISIÓN',448,205,34),font:'Georgia',rotation:-12},
 copy('entry','Entrada','AFORO LIMITADO',817,78,28),
 shape('rule1','Separador de entrada','rect',817,97,205,2,cream),
 copy('admission','Admisión','ENTRADA 24',817,139,28),
 shape('rule2','Separador de edición','rect',817,159,205,2,cream),
 copy('edition','Edición','EDICIÓN 07\nNORTE',817,202,28),
 {...copy('day','Día','SÁBADO',965,460,138),rotation:90},
 copy('month','Mes','ABR',50,1510,110),
 copy('date','Fecha','18',50,1685,170),
 copy('doors','Hora','PUERTAS 21:30',50,1775,34),
 copy('venue','Lugar','SALA ÓRBITA',410,1775,60),
 shape('rule3','Línea del pie','rect',50,1815,980,2,cream),
 {...copy('footer','Pie','SEÑAL / SOMBRA / MOVIMIENTO',50,1870,26),font:'Arial'}
 ];
}
function cinemaLayers():Layer[]{
 const cream='#ead5ae',orange='#d45a28',black='#100e09';
 const copy=(id:string,name:string,value:string,x:number,y:number,size:number,color=cream)=>({...text(id,name,value,x,y,size,true),font:'Impact',color});
 const title=(id:string,name:string,value:string,x:number,y:number,size:number)=>({...text(id,name,value,x,y,size,true),font:'Georgia',color:cream});
 return [
 shape('paper','Fondo negro','rect',0,0,1080,1920,black),
 copy('kicker','Cabecera','FANTASÍA URBANA EN CORTO',50,65,25,orange),
 copy('edition','Edición','TRES NOCHES · 18 CORTOMETRAJES',640,65,23),
 {...title('title','Título','CALLES',105,236,170),shadowColor:orange},
 {...title('title2','Título segunda línea','DE LUZ',99,424,172),shadowColor:orange},
 shape('ruleTop','Línea de fechas','rect',50,470,980,2,orange),
 copy('dates','Fechas','16—18 OCT 2026',50,525,46,orange),
 copy('days','Días','VIE · SÁB · DOM',710,525,40),
 shape('ruleDates','Línea bajo fechas','rect',50,553,980,2,orange),
 {...shape('scene','Callejón nocturno','image',50,585,980,654,cream),src:'/poster-lab/cine-callejon.png',fit:'cover',crop:'none',zoom:1,mono:false},
 shape('tagBg','Fondo de la etiqueta','rect',65,575,700,64,orange),
 copy('tag','Etiqueta','UNA NOCHE DE FANTASÍA URBANA',85,620,32),
 copy('program','Etiqueta de programación','PROYECCIONES',50,1300,36,orange),
 copy('programNote','Nota de programación','PROGRAMA / SUBTÍTULOS EN ESPAÑOL',480,1300,25),
 ...[1325,1425,1525,1625].map((y,i)=>shape('scheduleRule'+i,'Separador de sesión '+(i+1),'rect',50,y,980,2,orange)),
 ...[
 ['VIE','19:30','EL MAPA NOCTURNO','6 CORTOS · 82 MIN'],
 ['SÁB','15:00','MILAGROS EN LA ESQUINA','5 CORTOS · 74 MIN'],
 ['DOM','18:00','ANTES DEL AMANECER','7 CORTOS · 91 MIN']
 ].flatMap(([day,hour,film,duration],i)=>[
 copy('day'+i,'Día sesión '+(i+1),day,50,1355+i*100,21),
 copy('hour'+i,'Hora sesión '+(i+1),hour,50,1400+i*100,39,orange),
 copy('film'+i,'Película '+(i+1),film,245,1392+i*100,37),
 copy('duration'+i,'Duración sesión '+(i+1),duration,820,1390+i*100,22)
 ]),
 copy('venueLabel','Etiqueta de sede','SEDE',50,1675,28,orange),
 copy('venue','Sede','CINE BRUMA · 90 BUTACAS\nCALLE DEL FAROL 14',50,1715,21),
 shape('col1','Separador de sede','rect',385,1650,1,155,orange),
 copy('ticketsLabel','Etiqueta de entradas','ENTRADAS',420,1675,28,orange),
 copy('tickets','Entradas','PASE DE FIN DE SEMANA\nINCLUYE LAS TRES SESIONES',420,1715,21),
 shape('col2','Separador de entradas','rect',760,1650,1,155,orange),
 copy('creditsLabel','Etiqueta de créditos','PRESENTAN',795,1675,28,orange),
 copy('credits','Créditos','ARCHIVO LUZ\nCINECLUB FAROL',795,1715,21),
 shape('footerRule','Línea final','rect',50,1825,980,1,orange),
 {...copy('footer','Pie','CALLES DE LUZ / CINE INDEPENDIENTE / TU CIUDAD',50,1870,19),font:'Courier New'}
 ];
}
function nightWalkLayers():Layer[]{
 const blue='#0763bf',white='#faf9f3',yellow='#ffcf00';
 const copy=(id:string,name:string,value:string,x:number,y:number,size:number,color=white)=>({...text(id,name,value,x,y,size,true),font:'Impact',color});
 return [
 shape('paper','Fondo azul','rect',0,0,1080,1920,blue),
 copy('header','Cabecera','PASEOS DE VERANO',50,100,40),
 copy('edition','Edición','EDICIÓN 07 / 2026',735,100,35),
 shape('ruleTop','Línea superior','rect',50,130,980,2,white),
 copy('schedule','Temporada','17 JUL—29 AGO · CADA VIERNES · 19:30',245,230,34),
 copy('title','Título','PASEO',45,710,360),
 copy('title2','Título segunda línea','NOCTURNO',45,1060,225),
 copy('subtitle','Subtítulo','JUNTO AL MAR, AL ANOCHECER',50,1225,48),
 shape('badge','Etiqueta amarilla','rect',50,1295,350,65,yellow),
 copy('distance','Distancia destacada','12 KM DE CAMINATA',70,1342,34,blue),
 shape('timeline','Línea del recorrido','rect',50,1450,980,2,white),
 ...[
 ['19:30','MUELLE SUR\nPUNTO DE ENCUENTRO'],
 ['20:10','VIEJO ALMACÉN\nREFLEJOS DEL RÍO'],
 ['21:20','ROMPEOLAS\nÚLTIMA LUZ'],
 ['22:15','MUELLE NORTE\nFIN DEL RECORRIDO']
 ].flatMap(([time,place],i)=>[
 shape('stop'+i,'Punto del recorrido '+(i+1),'ellipse',70+i*245,1439,24,24,white),
 copy('time'+i,'Hora parada '+(i+1),time,50+i*245,1525,45,i===3?yellow:white),
 copy('place'+i,'Lugar parada '+(i+1),place,50+i*245,1572,23,i===3?yellow:white)
 ]),
 shape('ruleBottom','Línea de información','rect',50,1655,980,2,white),
 copy('details','Detalles','12,4 KM EN TOTAL · APROX. 2 H 45 MIN\nPASEO FOTOGRÁFICO GUIADO',50,1720,28),
 copy('registration','Inscripción','ENTRADA LIBRE · INSCRÍBETE EN EL SITIO\nAFORO MÁXIMO: 200 PERSONAS',50,1820,25),
 shape('organizerBg','Fondo del organizador','rect',780,1700,250,160,white),
 copy('organizer','Organizador','CULTURA JOVEN\nBAHÍA SUR',800,1760,33,blue)
 ];
}
export type PosterFormat='9:16'|'4:5'|'1:1';
export const formatHeights:Record<PosterFormat,number>={'9:16':1920,'4:5':1350,'1:1':1080};
export function formatLayers(layers:Layer[],from:PosterFormat,to:PosterFormat,saved?:Layer[],template:LayerTemplate="P06"):Layer[]{
 const base=initialLayers(template);
 const layout=(format:PosterFormat)=>{
  if(format==='9:16')return base;
  if(template!=='P06')return compactLayout(base,template,format);
  const square=format==='1:1';
  const positions:Record<string,Partial<Layer>>={
   paper:{h:formatHeights[format]},header:{y:75,size:32},edition:{y:75,size:28},ruleTop:{y:100},schedule:{y:155,size:28},
   title:{y:square?390:465,size:square?280:330},title2:{y:square?585:715,size:215},
   subtitle:{y:square?655:805,size:36},badge:{x:745,y:square?620:770,w:285,h:48},distance:{x:760,y:square?655:805,size:27},
   timeline:{y:square?720:925},ruleBottom:{y:square?860:1090},details:{y:square?910:1150,size:24},registration:{y:square?1000:1250,size:22},
   organizerBg:{y:square?905:1140,h:130},organizer:{y:square?955:1190,size:29}
  };
  for(let i=0;i<4;i++){positions['stop'+i]={y:(square?720:925)-11};positions['time'+i]={y:square?777:987,size:38};positions['place'+i]={y:square?814:1030,size:21};}
  return base.map(l=>({...l,...positions[l.id]}));
 };
 const source=layout(from),target=layout(to);
 return layers.map(l=>{
  const old=source.find(x=>x.id===l.id),next=target.find(x=>x.id===l.id),cached=saved?.find(x=>x.id===l.id);
  if(cached)return {...l,fit:l.fit??next?.fit,x:cached.x,y:cached.y,w:cached.w,h:cached.h,size:cached.size,rotation:cached.rotation};
  if(old&&next)return {...l,fit:l.fit??next.fit,x:next.x+(l.x-old.x),y:next.y+(l.y-old.y)*formatHeights[to]/formatHeights[from],w:next.w*(l.w/old.w),h:next.h*(l.h/old.h),size:next.size*(l.size/old.size)};
  return {...l,y:l.y*formatHeights[to]/formatHeights[from]};
 });
}
export function loadFormat(template:LayerTemplate):PosterFormat{try{const value=localStorage.getItem(`poster-lab-${template}-format`);if(value==='4:5'||value==='1:1')return value;}catch{}return '9:16';}
const boltPoints=(w:number,h:number)=>[[.88,0],[.99,.37],[.74,.60],[.98,.70],[.98,1],[.40,.82],[.46,.77],[.01,.40],[.49,.25],[.44,.18]].map(([x,y])=>`${x*w},${y*h}`).join(' ');
export const localPortraits=['/poster-lab/bienestar-atlas.png','/poster-lab/moda-atlas.png','/poster-lab/taller-artesana.png','/poster-lab/taller-productos.png','/poster-lab/labial-salvia.png','/poster-lab/sofa-nube.png','/poster-lab/bolsos-atlas.png','/poster-lab/fresa-premium.png','/poster-lab/zapatillas-atlas.png','/poster-lab/mochi-caja.png','/poster-lab/retrato-esfera.png','/poster-lab/bruma-retrato.png','/poster-lab/bruma-paisaje.png','/poster-lab/sandwich-huevo.png','/poster-lab/desayuno-verde.png','/poster-lab/casa-curva.png','/poster-lab/vida-lenta-oficios.png','/poster-lab/naturaleza-gorrion.png','/poster-lab/senal-retrato.png','/poster-lab/montana-tinta.png','/poster-lab/vida-lenta-objetos.png','/poster-lab/cine-juvenil.png','/poster-lab/concierto-colina.png','/poster-lab/musica-cantante.png','/poster-lab/arquitectura-brutalista.png','/poster-lab/retrato-prisma.png','/poster-lab/costa-cormoran.png','/poster-lab/cruce-urbano.png','/poster-lab/mascotas-gatos.png','/poster-lab/arquitectura-estudio.png','/poster-lab/galeria-lluvia.png','/poster-lab/retrato-base.png','/poster-lab/suizo-retrato-v2.png','/poster-lab/conferencista-retrato.png','/poster-lab/producto-audifonos.png','/poster-lab/collage-retratos.png','/poster-lab/cine-callejon.png'];
export const LAYER_KEY='poster-lab-P03-layers-v1';
export const layerKey=(template:LayerTemplate,format:PosterFormat="9:16")=>`poster-lab-${template}-layers-${template==="P07"?"v2":"v1"}${format==="9:16"?"":"-"+format}`;
export function loadLayers(template:LayerTemplate="P03",format:PosterFormat="9:16"):Layer[]{try{const a=JSON.parse(localStorage.getItem(layerKey(template,format))||'null');if(Array.isArray(a)&&a.length<=150&&a.every(l=>l&&['text','rect','triangle','ellipse','image','bolt','wave','arc','semicircle','ribbon','paperCut','glasses','fish'].includes(l.type)&&['id','name','color','text','font'].every(k=>typeof l[k]==='string')&&['x','y','w','h','size'].every(k=>typeof l[k]==='number'&&Number.isFinite(l[k]))&&typeof l.bold==='boolean'&&(l.rotation===undefined||(typeof l.rotation==='number'&&Number.isFinite(l.rotation)))&&(l.type!=='image'||validImage(l.src)))&&new Set(a.map(l=>l.id)).size===a.length)return a;}catch{}if(template==='P07'&&format==='9:16'&&!localStorage.getItem(layerKey(template,format))){try{const old=JSON.parse(localStorage.getItem('poster-lab-P07-layers-v1')||'null');if(Array.isArray(old))return initialLayers(template).map(l=>{const prior=old.find(p=>p?.id===l.id&&p.type==='text'&&typeof p.text==='string');return l.type==='text'&&prior?{...l,text:prior.text}:l;});}catch{}}return format!=='9:16'?formatLayers(loadLayers(template),'9:16',format,undefined,template):initialLayers(template);}
export function validImage(src:unknown):src is string{return typeof src==='string' && (localPortraits.includes(src)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src));}
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export function layerTransform(l:Layer){return l.rotation?`rotate(${l.rotation} ${l.x} ${l.y})`:undefined;}
export function layerMarkup(l:Layer){const content=rawLayerMarkup(l);return l.rotation?`<g transform="${layerTransform(l)}">${content}</g>`:content;}
function rawLayerMarkup(l:Layer){
 if(l.type==='fish')return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="0 0 200 80"><path d="M 0 40 Q 70 -30 145 32 L 195 5 L 180 40 L 195 75 L 145 48 Q 70 110 0 40 Z" fill="${esc(l.color)}"/></svg>`;

 if(l.type==='glasses')return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="0 0 360 160"><g fill="none" stroke="${esc(l.color)}" stroke-width="10"><rect x="20" y="10" width="135" height="140" rx="24"/><rect x="205" y="10" width="135" height="140" rx="24"/><path d="M 0 50 H 20 M 155 50 H 205 M 340 50 H 360"/></g></svg>`;
 if(l.type==='text'&&l.imageFill&&!l.outline&&validImage(l.src)){const key=esc(l.id.replace(/[^a-zA-Z0-9_-]/g,''));return `<defs><pattern id="text-photo-${key}" patternUnits="userSpaceOnUse" x="${l.x}" y="${l.y-l.size}" width="${l.w}" height="${l.size*1.3}"><image href="${esc(l.src)}" width="${l.w}" height="${l.size*1.3}" preserveAspectRatio="xMidYMin slice"/></pattern></defs><text fill="url(#text-photo-${key})" font-family="${esc(l.font)}" font-size="${l.size}" font-weight="${l.bold?700:400}">${l.text.split('\n').map((t,i)=>`<tspan x="${l.x}" y="${l.y+i*l.size*1.15}">${esc(t)}</tspan>`).join('')}</text>`;}

 if(l.type==='semicircle')return `<path d="M ${l.x} ${l.y+l.h} A ${l.w/2} ${l.h} 0 0 1 ${l.x+l.w} ${l.y+l.h} Z" fill="${esc(l.color)}"/>`;
 if(l.type==='ribbon')return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d="M 0 790 L 345 565 L 555 280 L 555 145 L 815 0 L 1000 90 L 1000 175 L 820 95 L 675 180 L 695 480 L 525 610 L 390 760 L 0 1000 Z" fill="${esc(l.color)}"/></svg>`;
 if(l.type==='paperCut')return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path d="M 0 25 L 180 25 L 195 0 L 815 0 L 830 25 L 1000 25 L 1000 960 L 875 950 L 710 985 L 570 955 L 510 1000 L 430 970 L 0 940 Z" fill="${esc(l.color)}"/></svg>`;

 if(l.type==='arc')return `<path d="M ${l.x} ${l.y+l.h} Q ${l.x+l.w*.45} ${l.y-l.h*.7} ${l.x+l.w} ${l.y+l.h*.7}" fill="none" stroke="${esc(l.color)}" stroke-width="4" stroke-linecap="round"/>`;
 if(l.type==='wave'){const lines=Array.from({length:64},(_,i)=>{const a=i/63;return `<path d="M ${20+a*170} ${980-a*410} C ${-140+a*620} ${470-a*340}, ${900-a*640} ${600+a*160}, ${420+a*500} ${20+a*420}"/>`;}).join('');return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="0 0 1000 1000" preserveAspectRatio="none"><g fill="none" stroke="${esc(l.color)}" stroke-width="4">${lines}</g></svg>`;}
 if(l.type==='bolt')return `<polygon transform="translate(${l.x} ${l.y})" points="${boltPoints(l.w,l.h)}" fill="${esc(l.color)}"/>`;
 if(l.type==='ellipse')return `<ellipse cx="${l.x+l.w/2}" cy="${l.y+l.h/2}" rx="${l.w/2}" ry="${l.h/2}" fill="${esc(l.color)}"/>`;
 if(l.type==='image'){
 const key=esc(l.id.replace(/[^a-zA-Z0-9_-]/g,''));
 const zoom=Math.max(.5,Math.min(4,l.zoom||1));
 if(l.spriteIndex!==undefined){const cols=l.spriteColumns===2?2:3,n=Math.max(0,Math.min(cols*2-1,Math.round(l.spriteIndex))),sx=(n%cols)*512,sy=Math.floor(n/cols)*512;return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="${sx} ${sy} 512 512" overflow="hidden" preserveAspectRatio="xMidYMid meet"><defs><clipPath id="sprite-${key}"><rect x="${sx}" y="${sy}" width="512" height="512"/></clipPath></defs><g clip-path="url(#sprite-${key})"><image href="${validImage(l.src)?esc(l.src):''}" x="${l.offsetX||0}" y="${l.offsetY||0}" width="${cols*512*zoom}" height="${1024*zoom}"/></g></svg>`;}

 if(l.panelIndex!==undefined){
 const panel=Math.max(0,Math.min(2,Math.round(l.panelIndex))),ph=panel===2?600:1024;
 return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="${panel*512} 0 512 ${ph}" preserveAspectRatio="${l.fit==='contain'?'xMidYMid meet':'xMidYMid slice'}"><defs><clipPath id="panel-${key}">${l.crop==='bolt'?`<polygon transform="translate(${panel*512} 0)" points="${boltPoints(512,ph)}"/>`:`<ellipse cx="${panel*512+256}" cy="${ph/2}" rx="256" ry="${ph/2}"/>`}</clipPath><filter id="panel-mono-${key}"><feColorMatrix type="saturate" values="0"/></filter></defs><g ${l.crop==='none'?'':`clip-path="url(#panel-${key})"`}><image href="${validImage(l.src)?esc(l.src):''}" x="${l.offsetX||0}" y="${l.offsetY||0}" width="${1536*zoom}" height="${1024*zoom}" ${l.mono?`filter="url(#panel-mono-${key})"`:''}/></g></svg>`;
 }
 if(l.sliceIndex!==undefined){const index=Math.max(0,Math.min(3,Math.round(l.sliceIndex)));const band=1000*l.h/l.w;return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="0 ${index*band} 1000 ${band}" preserveAspectRatio="xMidYMid slice"><defs><filter id="sepia-${key}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".213 .715 .072 0 .04 .202 .679 .068 0 .03 .181 .608 .061 0 .01 0 0 0 1 0"/></filter></defs><image href="${validImage(l.src)?esc(l.src):''}" x="${-420+(l.offsetX||0)}" y="${-30+(l.offsetY||0)}" width="${2924*zoom}" height="${2152*zoom}" preserveAspectRatio="xMidYMid slice" ${l.sepia?`filter="url(#sepia-${key})"`:''}/></svg>`;}

 return `<svg x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" viewBox="0 0 ${l.w} ${l.h}"><defs><clipPath id="crop-${key}">${l.crop==='rounded'?`<rect width="${l.w}" height="${l.h}" rx="${Math.min(l.w,l.h)*.25}"/>`:l.crop==='arch'?`<path d="M 0 ${l.h} V ${l.w*.5} A ${l.w*.5} ${l.w*.5} 0 0 1 ${l.w} ${l.w*.5} V ${l.h} Z"/>`:l.crop==='bolt'?`<polygon points="${boltPoints(l.w,l.h)}"/>`:`<ellipse cx="${l.w/2}" cy="${l.h/2}" rx="${l.w/2}" ry="${l.h/2}"/>`}</clipPath><filter id="mono-${key}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter></defs><g ${l.crop==='none'?'':`clip-path="url(#crop-${key})"`}><image href="${validImage(l.src)?esc(l.src):''}" x="${l.offsetX||0}" y="${l.offsetY||0}" width="${l.w*zoom}" height="${l.h*zoom}" preserveAspectRatio="${l.fit==='cover'?(l.imageAlignTop?'xMidYMin slice':'xMidYMid slice'):'xMinYMin meet'}" ${l.mono?`filter="url(#mono-${key})"`:''}/></g></svg>`;
 }
if(l.type==='text')return `<text fill="${l.outline?'none':esc(l.color)}" stroke="${l.outline?esc(l.color):l.textStroke?esc(l.textStroke):'none'}" stroke-width="1.8" font-family="${esc(l.font)}" font-size="${l.size}" style="${l.shadowColor?`text-shadow:6px 6px 0 ${esc(l.shadowColor)}`:''}" font-weight="${l.bold?700:400}">${l.text.split('\n').map((t,i)=>`<tspan x="${l.x}" y="${l.y+i*l.size*1.15}">${esc(t)}</tspan>`).join('')}</text>`;if(l.type==='triangle')return `<polygon fill="${esc(l.color)}" points="${l.x},${l.y} ${l.x+l.w},${l.y} ${l.x+l.w},${l.y+l.h}"/>`;return `<rect x="${l.x}" y="${l.y}" width="${l.w}" height="${l.h}" fill="${esc(l.color)}"/>`;}
export function exportSvg(layers:Layer[],format:PosterFormat="9:16"){return `<svg xmlns="http://www.w3.org/2000/svg" overflow="hidden" width="1080" height="${formatHeights[format]}" viewBox="0 0 1080 ${formatHeights[format]}">${layers.map(layerMarkup).join('')}</svg>`;}

/** Preserve a shared portrait and photo-filled text, but release atlas cropping on replacement. */
export function replaceLayerImage(layers:Layer[],target:string,src:string):Layer[]{
 const current=layers.find(l=>l.id===target);
 return layers.map(l=>{
  if(l.id===target||(current?.sliceIndex!==undefined&&l.sliceIndex!==undefined))return {...l,src,panelIndex:undefined,spriteIndex:undefined,spriteColumns:undefined,zoom:1,offsetX:0,offsetY:0};
  if(current?.type==='image'&&l.type==='text'&&l.src===current.src)return {...l,src};
  return l;
 });
}
