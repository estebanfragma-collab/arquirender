import type {Layer,LayerTemplate,PosterFormat} from './layers';
export const finalNames={P32:'Bienestar sonoro',P33:'Moda ligera',P34:'Taller de formas',P35:'Estudio de color',P36:'Sofá nube',P37:'Materiales de autor',P38:'Fruta fresca',P39:'Archivo de zapatillas',P40:'Mochi de temporada'};
const s=(id:string,name:string,type:Layer['type'],x:number,y:number,w:number,h:number,color:string):Layer=>({id,name,type,x,y,w,h,color,text:'',size:24,font:'Arial',bold:false});
const r=(id:string,name:string,x:number,y:number,w:number,h:number,color:string)=>s(id,name,'rect',x,y,w,h,color);
const t=(id:string,name:string,text:string,x:number,y:number,size:number,color='#131410',font='Arial',bold=false):Layer=>({...s(id,name,'text',x,y,1000,size*1.2,color),text,size,font,bold});
const im=(id:string,name:string,asset:string,x:number,y:number,w:number,h:number):Layer=>({...s(id,name,'image',x,y,w,h,'#fff'),src:`/poster-lab/${asset}.png`,fit:'contain',crop:'none',zoom:1});
const atlas=(id:string,name:string,asset:string,index:number,cols:number,x:number,y:number,w:number,h:number):Layer=>({...im(id,name,asset,x,y,w,h),spriteIndex:index,spriteColumns:cols});
export function finalLayers(template:LayerTemplate,format:PosterFormat='9:16'):Layer[]{
 const v=format==='9:16',q=format==='1:1',H=v?1920:q?1080:1350,C='#f8f0df',K='#141410',pink='#d74c88',blue='#244bd4';
 if(template==='P32'){
 const a=v?640:q?390:470,b=v?760:q?390:530;
 return [r('paper','Papel crema',0,0,1080,H,C),t('title','Título','BIENESTAR\nSONORO',45,190,v?148:q?110:130,K,'Impact'),t('motto','Lema','ENCUENTRA\nTU RITMO.',50,v?570:q?365:430,v?55:38,pink,'Impact'),
 atlas('girl','Chica con auriculares','bienestar-atlas',0,2,555,110,510,a),atlas('boy','Guitarrista','bienestar-atlas',1,2,15,H-b-100,650,b),atlas('tea','Taza de té','bienestar-atlas',2,2,95,v?650:q?430:550,300,v?400:250),
 r('badge','Cápsula roja',570,35,460,45,'#c94032'),t('header','Radio','ISLA SONORA · RADIO DE FIN DE SEMANA',590,65,18,C,'Impact'),
 t('star1','Estrella grande','✦',650,H*.60,v?160:100,'#f5ce22'),t('star2','Estrella pequeña','✦',850,H*.69,75,'#f5ce22'),t('note','Notas musicales','♪   ♫',700,H*.49,64),
 t('program','Programa','MÚSICA PARA\nESTAR MEJOR',775,H-275,25,pink),t('date','Fecha','27.11–04.12',640,H-110,q?54:65,pink,'Impact'),t('footer','Organización','PRESENTA TU ESTUDIO · SESIONES EN LÍNEA · ENCUENTRA TU SONIDO',65,H-35,19)];
 }
 if(template==='P33'){
 const py=v?660:q?365:450,gh=H-py-120,rh=gh/2-8;
 return [r('paper','Fondo blanco',0,0,1080,H,'#fff'),t('header','Serie','DÍAS LIGEROS / EDICIÓN VERANO',45,60,23,K,'Impact'),t('tag','Etiqueta','#VIVEELVERANO',790,60,22,K,'Impact'),
 t('title','Título','VIAJA LIGERO',45,v?270:q?165:205,v?146:q?100:120,K,'Impact'),s('dot1','Punto coral','ellipse',50,v?315:q?195:245,55,55,'#fb8d71'),s('dot2','Punto azul','ellipse',125,v?315:q?195:245,55,55,'#85b7c7'),
 t('second','Segunda línea','LLEGA LEJOS',235,v?420:q?260:320,v?132:q?85:105,K,'Impact'),t('third','Edición','SELECCIÓN SEMANAL',45,py-35,v?105:q?70:85,K,'Impact'),
 ...['Camisa azul','Pantalón blanco','Zapatillas coral','Sombrero azul','Bolso y pañuelo'].flatMap((name,i)=>{const x=i<3?45+i*335:45+(i-3)*505,y=py+(i<3?0:rh+16),w=i<3?320:490;return [atlas('item'+i,name,'moda-atlas',i,3,x,y,w,rh),r('pill'+i,'Fondo de código '+i,x+10,y+10,105,34,'#fff'),t('code'+i,'Código '+i,['● 101A','● 204C','● 307S','● 118M','● 402N'][i],x+18,y+35,22)];}),
 r('rule','Línea inferior',45,H-90,990,3,K),t('brand','Marca','MORI EN MOVIMIENTO',45,H-40,34,K,'Arial',true),t('footer','Lema de marca','MENOS PESO. MÁS VIDA.   /   NUEVO',650,H-40,20)];
 }
 if(template==='P34'){
 const ph=H-260;
 return [r('paper','Fondo arena',0,0,1080,H,'#ead9b8'),{...im('maker','Artesana en el taller','taller-artesana',0,100,800,ph),fit:'cover',imageAlignTop:true},
 t('brand','Estudio','ESTUDIO FORMA',700,70,30,'#285681','Arial',true),
 ...['Sillón de bouclé','Jarrón azul','Mesa roja'].map((name,i)=>atlas('item'+i,name,'taller-productos',i,2,800,170+i*(q?180:v?290:220),240,q?170:v?265:200)),
 r('sticker','Etiqueta amarilla',835,110,180,48,'#e2b92b'),t('new','Novedad','NUEVA OBRA',850,142,22,'#a95b24','Impact'),
 {...s('diagonal','Diagonal azul','triangle',1080,H-(v?640:q?285:410),v?640:q?285:410,820,'#265d96'),rotation:90},t('issue','Edición','EDICIÓN 07\n2026 / 850',820,H-(v?640:q?325:440),20,'#285681'),
 {...t('title','Título','FORMA',570,H-20,v?180:q?90:125,C,'Impact'),rotation:-24},t('tagline','Lema','EL NUEVO\nLENGUAJE\nDEL HOGAR',880,H-100,23,C)];
 }
 if(template==='P35'){
 const py=100,ph=H-300;
 return [r('paper','Papel cálido',0,0,1080,H,'#f5f1e6'),{...im('photo','Labial sobre piedra','labial-salvia',340,py,700,ph),fit:'cover'},
 {...t('title','Título','COLOR / ESTUDIO',150,H-300,v?123:q?72:90),rotation:-90},s('dot','Muestra terracota','ellipse',235,H-430,150,150,'#af563c'),
 t('header','Serie','ESTUDIO 08',45,55,23),t('header2','Categoría','MAQUILLAJE / OBJETOS',660,55,23),t('brand','Marca','SEREIN ATELIER',45,H-170,34),t('product','Producto','TINTA DE TERCIOPELO · N.º 08',45,H-120,23),
 r('rule','Línea de ficha',45,H-90,990,1,'#8c8b80'),t('finish','Acabado','ACABADO\nSATINADO MATE',45,H-58,18),t('tone','Tono','TONO\nTERRACOTA SUAVE',410,H-58,18),t('form','Forma','FORMA\nESTUCHE ESCULPIDO',790,H-58,18)];
 }
 if(template==='P36'){
 const sy=v?600:q?200:330,sw=1040,sh=v?690:q?500:600;
 return [r('paper','Marfil cálido',0,0,1080,H,'#f4f1e9'),t('header','Serie','MUEBLES NUBE · SERIE 01',50,60,18),t('catalog','Catálogo','CATÁLOGO / 2026',825,60,18),
 t('title','Título','QITA',40,sy+90,v?430:q?320:370,K,'Georgia'),im('sofa','Sofá modular','sofa-nube',20,sy,sw,sh),
 t('vertical','Nombre vertical','N\nU\nB\nE',1020,sy+140,18,K,'Georgia'),s('arc','Trazo inferior','arc',150,H-420,740,45,K),
 t('product','Descripción','NUBE LIGERA\nSOFÁ MODULAR',50,H-300,v?72:q?48:62,blue,'Georgia'),t('label','Etiqueta','DISEÑO PARA DESCANSAR',695,H-220,23,K,'Georgia'),
 r('rule','Línea del pie',50,H-160,980,1,'#87877f'),t('date','Fecha','2026 / 07 / 08',50,H-115,27),t('spec','Materiales','BOUCLÉ LAVABLE · CUATRO MÓDULOS\nRELLENO DE PLUMA Y ESPUMA DE ALTA RESILIENCIA',50,H-65,17,'#78786d'),r('mark','Marca azul',1010,H-115,20,20,blue)];
 }
 if(template==='P37'){
 const bh=v?1100:q?560:740;
 return [r('paper','Fondo chocolate',0,0,1080,H,'#160d07'),
 atlas('bag0','Bolso de lona','bolsos-atlas',0,3,0,80,320,bh),atlas('bag1','Bolso de piel','bolsos-atlas',1,3,255,0,400,bh),atlas('bag2','Bolso tejido','bolsos-atlas',2,3,565,40,600,bh),
 r('tab','Pestaña de archivo',1010,55,45,200,C),{...t('tabText','Nota lateral','NOTAS DE MATERIA',1023,80,15,K,'Georgia'),rotation:90},
 t('number','Número','01',270,bh+85,v?135:85,C,'Georgia',true),t('title','Título','ESTUDIO DE MATERIA',185,bh+155,v?50:q?36:42,C,'Georgia'),t('brand','Marca','QILAN ATELIER',275,bh+220,30,C,'Impact'),
 t('description','Descripción','TRES MATERIALES. UN MISMO GESTO.',100,H-255,q?36:43,C,'Arial',true),t('materials','Materiales','PIEL · LONA · FIBRA TEJIDA',225,H-190,30,C),
 t('specs','Ficha técnica','CORREA INTERCAMBIABLE · FORRO DE ALGODÓN · HERRAJES MATE\nLONA / 260 × 210 × 145 MM     PIEL / 255 × 205 × 140 MM\nTEJIDO / 275 × 225 × 155 MM',150,H-125,19,C),t('footer','Información','CONSULTAS Y PEDIDOS EN TU ESTUDIO                         COLECCIÓN 01 / 2026',130,H-35,16,C)];
 }
 if(template==='P38'){
 const py=v?710:q?320:455,sz=v?1000:q?730:860;
 return [r('paper','Crema cálido',0,0,1080,H,'#fcf0e1'),t('brand','Marca','BERRYVALE',75,85,43,K,'Georgia'),t('category','Categoría','FRUTA FRESCA',800,80,30,K,'Impact'),
 t('title','Título','EN SU PUNTO.\nFRESCA.\nDULCE.',50,v?340:q?200:250,v?150:q?102:125,K,'Impact'),
 r('rule','Línea de descripción',55,v?740:q?465:580,460,3,K),t('description','Descripción','MADURACIÓN NATURAL · SELECCIÓN DIARIA',55,v?785:q?505:620,20,K,'Impact'),
 im('fruit','Fresa con hojas','fresa-premium',v?30:300,py+30,sz,sz),t('motto','Lema','ENDULZA CADA DÍA',600,H-(v?350:150),q?33:42,'#fff','Impact'),
 t('weight','Peso neto','PESO NETO 500 g',55,H-90,30,K,'Impact'),t('storage','Conservación','MANTENER REFRIGERADO',55,H-45,27,K,'Impact')];
 }
 if(template==='P39'){
 const rh=(H-260)/5,colors=['#a8b9c0','#ad8f76','#c2a076','#242326','#b51d19'];
 return [r('paper','Papel de archivo',0,0,1080,H,'#e9e3d8'),t('header','Archivo','MANUAL DE COLOR / ARCHIVO 05',40,55,27,K,'Impact'),
 ...colors.flatMap((c,i)=>{const y=80+i*rh,fg=i>2?'#f4ece5':'#292a26';return [r('row'+i,'Fondo de color '+i,0,y,1080,rh,c),atlas('shoe'+i,'Zapatilla '+(i+1),'zapatillas-atlas',i,3,540,y-15,510,rh+30),t(i===0?'title':'color'+i,i===0?'Título':'Nombre de color '+i,['01 / AZUL TORMENTA','02 / MARRÓN MOCA','03 / LEOPARDO','04 / NEGRO NOCHE','05 / ROJO VIVO'][i],40,y+55,q?29:35,fg,'Impact'),t('hex'+i,'Código de color '+i,c.toUpperCase(),40,y+(q?80:95),q?18:22,fg),t('material'+i,'Material '+i,['ANTE Y MALLA\nSUELA CARAMELO','ANTE ENCERADO\nCOSTURAS AL TONO','TEXTURA ANIMAL\nSUELA BLANCA','NUBUCK MATE\nCORDONES NEGROS','ANTE Y MALLA\nCORDONES AL TONO'][i],40,y+rh-(q?48:65),q?18:24,fg)];}),
 r('footerBg','Fondo rosa',0,H-180,1080,180,'#e7c5c2'),t('palette','Paleta','PALETA',40,H-105,53,'#7f1817','Georgia'),t('footer','Serie','12 COLORES · 5 MODELOS',40,H-40,42,'#7f1817','Impact'),
 ...Array.from({length:24},(_,i)=>r('bar'+i,'Barra '+i,735+i*11,H-145,i%3===0?7:3,65,'#7f1817')),t('series','Edición','SERIE 05 / 2026',825,H-45,20,'#7f1817','Impact')];
 }
 if(template==='P40'){
 const py=v?610:q?340:420,sz=v?1100:q?650:830;
 return [r('paper','Fondo crema',0,0,1080,H,'#f7f3e9'),r('yellow','Bloque amarillo',220,py+130,860,sz-130,'#efdc9b'),r('mint','Bloque verde',0,H-420,300,200,'#83b69c'),r('coral','Bloque coral',980,py+320,100,220,'#ce695a'),
 t('title','Título','MORI MOCHI',55,v?180:q?110:140,v?105:q?75:88),t('subtitle','Producto','PASTELES DE ARROZ HELADOS',60,v?255:q?160:205,29),t('motto','Lema','SUAVE / FRÍO / BRILLANTE',60,v?345:q?215:270,23),
 ...['#659e7e','#f3ce46','#dd796e'].map((c,i)=>r('swatch'+i,'Sabor '+i,65+i*95,v?510:q?265:325,60,10,c)),t('flavors','Sabores','MATCHA · YUZU · FRUTOS ROJOS',60,v?565:q?310:370,23),
 r('banner','Banda azul',890,0,145,v?460:q?240:300,'#0a35a4'),t('snow','Copo de nieve','❄',926,80,58,'#fff'),t('cold','Conservación','MANTENER\nCONGELADO',902,135,17,'#fff'),t('set','Selección','TRES\nSABORES',923,v?335:q?195:240,22,'#fff'),
 im('box','Caja de nueve mochis','mochi-caja',0,py,sz,sz),s('badge','Sello negro','ellipse',55,H-440,230,230,K),t('count','Cantidad','09',85,H-280,140,'#fff'),t('pieces','Unidades','PIEZAS',115,H-235,28,'#fff'),
 r('footerBg','Pie blanco',45,H-150,990,120,'#fff'),t('season','Temporada','NUEVA\nTEMPORADA',70,H-95,23),t('price','Precio','$ 19,90',380,H-70,60),r('button','Etiqueta de compra',745,H-130,260,80,K),t('buy','Compra','PÍDELO AQUÍ',785,H-80,27,'#fff')];
 }
 return [];
}
