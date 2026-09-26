import {finalLayers,finalNames} from './final-templates';
import {editorialLayers,editorialNames} from './editorial-templates';
import {newLayers,newNames} from './new-templates';
import {remainingLayers,remainingNames} from './remaining-templates';
import type {Layer,LayerTemplate,PosterFormat} from './layers';

// Art-directed placements. Images retain their aspect ratio; text remains real text.
export function compactLayout(base:Layer[],template:LayerTemplate,format:PosterFormat):Layer[]{
 if(template in finalNames)return finalLayers(template,format);
 if(template in editorialNames)return editorialLayers(template,format);
 if(template in newNames)return newLayers(template,format);
 if(template in remainingNames)return remainingLayers(template,format);
 if(format==='9:16')return base;
 const q=format==='1:1',height=q?1080:1350;
 const p:Record<string,Partial<Layer>>={paper:{h:height}};
 const set=(id:string,values:Partial<Layer>)=>{p[id]=values;};
 if(template==='P01'){
  Object.assign(p,{
   yellow:{x:80,y:q?490:650,w:850,h:850},inner:{x:233,y:q?643:803,w:544,h:544},
   diagonal:{x:490,y:q?560:760,w:720,h:1200},portrait:{x:q?235:120,y:q?495:655,w:q?675:820,h:(q?675:820)*1255/925},sidebar:{h:height},
   title:{y:q?160:190,size:q?112:130},title2:{y:q?295:355,size:q?130:150},title3:{y:q?425:510,size:q?103:122},
   tagline:{y:q?490:580,size:30},tagline2:{y:q?532:622,size:30},topics:{y:q?572:670,size:18},
   brand:{y:105,size:58},rule1:{y:145},name:{y:190,size:q?46:54},rule2:{y:q?620:755},
   role:{y:q?660:800,size:q?16:20},studio:{y:q?660:800,size:q?14:17},arrow:{y:height-105,size:90},rule3:{y:height-75},dotEnd:{y:height-55,w:32,h:32,x:982}
  });
  for(let i=0;i<3;i++)set('dot'+i,{x:50+i*54,y:q?600:700,w:34,h:34});
 }
 if(template==='P02'){
  Object.assign(p,{
   rail:{h:height-170},product:{x:q?365:330,y:q?100:130,w:q?440:580,h:(q?440:580)*1070/790},
   edition:{y:q?390:445,size:21},club:{y:q?390:445,size:21},rule1:{y:q?465:535},date:{y:q?500:575,size:18},time:{y:q?535:610,size:18},dotMid:{y:q?580:660},
   rule2:{y:q?665:760},motto:{y:q?700:805,size:17},rule3:{y:q?760:870},dotBottom:{y:q?790:905},
   stamp:{x:720,y:65,size:17},stampDot:{y:100},title:{y:q?815:1010,size:q?135:150},title2:{y:q?950:1170,size:q?156:172},
   set:{y:height-80,size:19},venue:{y:height-80,size:19},accent:{y:height-60},accentInner:{y:height-54}
  });
 }
 if(template==='P03'){
  Object.assign(p,{
   diagonal:{x:q?650:550,w:q?430:530,h:q?440:600},header:{y:75,size:20},mark:{y:110},
   title:{y:q?270:370,size:q?82:100},description:{y:q?565:760,size:21},curator:{y:q?660:870,size:20},
   rule:{y:height-70},footer:{y:height-35,size:16},square:{y:height-55,w:24,h:24}
  });
  for(let i=0;i<3;i++)set('mark'+i,{y:q?728:950});
  for(let i=0;i<2;i++)set('separator'+i,{y:q?725:945,h:q?255:310});
  for(const id of ['program','exhibition','venue'])set(id,{y:q?775:1000,size:18});
  for(const id of ['date','works'])set(id,{y:q?860:1100,size:36});
  set('range',{y:q?860:1100,size:30});
  for(const id of ['hours','details','address'])set(id,{y:q?940:1200,size:16});
 }
 if(template==='P04'){
  const k=q?.63:.75,x=q?285:220,y=q?160:220;
  Object.assign(p,{
   frame:{x:x-13*k,y:y-15*k,w:876*k,h:1305*k},photo:{x,y,w:850*k,h:1275*k},
   title:{y:q?170:190,size:q?150:175},title2:{y:q?300:340,size:q?98:120},
   live:{x:430,y:110,size:37},live2:{x:423,y:153,size:25},entry:{y:55,size:24},rule1:{y:72},admission:{y:106,size:24},rule2:{y:125},edition:{y:159,size:23},
   day:{y:q?360:420,size:q?95:112},month:{y:q?725:970,size:80},date:{y:q?890:1140,size:145},doors:{y:height-105,size:28},venue:{y:height-105,size:50},rule3:{y:height-75},footer:{y:height-32,size:24}
  });
 }
 if(template==='P05'){
  Object.assign(p,{
   kicker:{y:45,size:22},edition:{y:45,size:20},
   title:{x:q?50:100,y:q?180:170,size:q?118:125},title2:{x:q?590:100,y:q?180:305,size:q?102:125},
   ruleTop:{y:q?212:340},dates:{y:q?264:390,size:38},days:{y:q?264:390,size:34},ruleDates:{y:q?286:415},
   scene:{x:50,y:q?345:460,w:q?540:980,h:(q?540:980)*654/980},
   tagBg:{x:50,y:q?303:430,w:q?540:680,h:42},tag:{x:65,y:q?333:461,size:24},
   program:{x:q?625:50,y:q?334:930,size:q?28:30},programNote:{x:q?625:470,y:q?366:930,size:q?15:22},
   venueLabel:{y:q?795:1170,size:24},ticketsLabel:{y:q?795:1170,size:24},creditsLabel:{y:q?795:1170,size:24},
   venue:{y:q?840:1210,size:20},tickets:{y:q?840:1210,size:20},credits:{y:q?840:1210,size:20},
   col1:{y:q?775:1150,h:q?160:115},col2:{y:q?775:1150,h:q?160:115},footerRule:{y:height-70},footer:{y:height-30,size:18}
  });
  // Portrait version uses a wide cinematic crop; square places the programme beside the still.
  if(!q)p.scene={x:50,y:460,w:980,h:420};
  for(let i=0;i<4;i++)set('scheduleRule'+i,{x:q?625:50,y:(q?390:950)+i*(q?112:60),w:q?405:980});
  for(let i=0;i<3;i++){
   set('day'+i,{x:q?625:50,y:(q?420:973)+i*(q?112:60),size:18});
   set('hour'+i,{x:q?685:95,y:(q?422:984)+i*(q?112:60),size:q?28:26});
   set('film'+i,{x:q?625:245,y:(q?459:989)+i*(q?112:60),size:q?28:32});
   set('duration'+i,{x:q?625:820,y:(q?484:984)+i*(q?112:60),size:18});
  }
 }
 if(template==='P07'){
  Object.assign(p,{
   circle:{x:q?240:165,y:q?260:315,w:q?580:700,h:q?580:700},
   portrait:{x:q?330:270,y:q?250:305,w:q?400:495,h:q?600:742.5},
   name:{x:50,y:q?155:205,size:q?105:128},surname:{x:50,y:q?272:355,size:q?120:145},
   header:{x:620,y:60,size:19},role:{x:620,y:95,size:16},agenda:{x:805,y:q?345:425,size:19},
   date:{x:50,y:q?730:905,size:32},title:{x:50,y:q?880:1080,size:94},topic:{x:50,y:q?980:1200,size:100},
   footer:{x:50,y:q?1025:1265,size:q?17:20},venue:{x:720,y:height-30,size:18}
  });
 }
 if(template==='P08'){
  Object.assign(p,{
   header:{y:q?38:60,size:22},title:{y:q?205:240,size:q?158:180},title2:{y:q?365:420,size:q?142:160},
   lab:{y:q?565:655,size:q?190:210},experiment:{y:q?670:835,size:q?38:44},date:{y:q?765:970,size:38},
   manifesto:{y:q?805:1025,size:q?17:21},annotation:{x:865,y:q?515:630,size:19},pointer:{y:q?540:655},node:{y:q?536:651},
   wave1:{x:465,y:q?305:375,w:510,h:q?330:435},wave2:{x:470,y:q?510:685,w:535,h:q?280:330},wave3:{x:470,y:q?710:940,w:540,h:q?180:200},
   index:{y:height-190,size:19},rule:{y:height-162},brand:{y:height-78,size:92},unit:{y:height-34,size:40},footerRule:{y:height-22},footer:{y:height-6,size:13},district:{y:height-6,size:13}
  });
  for(let i=0;i<9;i++)set('check'+i,{y:height-(q?200:220)+Math.floor(i/3)*10});
  for(let i=0;i<12;i++)set('tick'+i,{y:150+i*9});
  for(let i=0;i<4;i++)set('cross'+i,{y:i%2?110:50});
 }
 if(template==='P09'){
  Object.assign(p,{
   title:{y:q?100:135,size:q?58:78},kicker:{x:435,y:105,size:17},subtitle:{x:435,y:153,size:28},range:{x:435,y:235,size:23},motto:{x:810,y:100,size:25},
   date:{y:q?290:490,size:44},time:{y:q?340:550,size:32},talk:{y:q?285:485,size:30},description:{y:q?355:575,size:20},admission:{y:q?402:640,size:16},
   venueLabel:{y:q?285:485,size:19},venue:{y:q?330:550,size:20},entrance:{y:q?390:625,size:18},
   photo:{y:q?430:685,w:960,h:q?585:600},footer:{y:height-25,size:14},edition:{y:height-25,size:14},credit:{y:height-25,size:14}
  });
 }
 if(template==='P10'){
  Object.assign(p,{header:{y:50,size:21},serial:{y:50,size:18},edition:{y:85,size:17},topRule:{y:105},title:{y:q?205:230,size:q?85:98},memory:{x:430,y:q?650:640,size:29},circle:{x:810,y:q?720:960,w:190,h:190},seal:{x:843,y:q?800:1040,size:28},accession:{y:height-175,size:25},subtitle:{y:height-120,size:34},dates:{y:height-65,size:21},venue:{y:height-65,size:20},bottomRule:{y:height-45},footer:{y:height-15,size:16}});
  for(let i=0;i<4;i++)set('strip'+i,{y:(q?235:270)+i*(q?151:214),h:q?143:204});
 }
 if(template==='P11'){
  Object.assign(p,{header:{y:55,size:23},topRule:{y:76},issue:{x:780,y:q?200:245,size:q?190:230},date:{x:720,y:q?240:285,size:22},room:{x:720,y:q?275:325,size:25},
   title:{y:q?180:220,size:q?100:116},title2:{y:q?295:355,size:q?104:122},title3:{y:q?410:490,size:q?104:122},
   tagline:{y:q?480:600,size:24},accent1:{y:q?558:685,w:18,h:18},session:{y:q?650:815,size:24},accent2:{y:q?703:875,w:18,h:18},
   model:{x:350,y:q?430:535,w:310,h:q?220:360},plans:{x:680,y:q?350:430,w:340,h:q?470:650},door:{x:185,y:q?665:915,w:475,h:q?155:165},
   infoRule:{y:height-230},speaker:{y:height-175,size:34},role:{y:height-140,size:16},accent3:{y:height-105,w:15,h:15},divider:{y:height-205,h:120},description:{y:height-185,size:18},venue:{y:height-150,size:24},accent4:{y:height-115,w:15,h:15},bottomRule:{y:height-65},footer:{y:height-35,size:15},series:{y:height-10,size:13}
  });
 }
 if(template==='P12'){
  const top=q?480:620;
  Object.assign(p,{header:{y:45,size:20},emblem:{x:820,y:28,w:45,h:45},emblemInner:{x:829,y:37,w:27,h:27},brand:{y:45,size:18},portrait:{x:565,y:110,w:515,h:top-110},guest:{y:q?180:230,size:26},name:{y:q?235:295,size:39},role:{y:q?275:335,size:17},quote:{y:q?325:410,size:q?21:25},
   yellow:{y:top,h:height-top-60},green:{y:top,h:height-top-60},forum:{y:top+45,size:21},title:{y:top+140,size:60},keynoteLabel:{y:top+235,size:19},keynotes:{y:top+265,size:17},speakersLabel:{y:top+330,size:19},speakers:{y:top+360,size:17},moderatorLabel:{y:top+(q?445:535),size:19},moderator:{y:top+(q?480:570),size:17},
   presentedLabel:{y:top+80,size:22},presented:{y:top+118,size:19},producedLabel:{y:top+220,size:22},produced:{y:top+260,size:19},dateLabel:{y:top+340,size:22},date:{y:top+380,size:19},venueLabel:{y:top+(q?445:545),size:22},venue:{y:top+(q?480:585),size:19},bottom:{y:height-60,h:60},footerDate:{y:height-22,size:21},footerTime:{y:height-22,size:21},footerVenue:{y:height-22,size:19}
  });
 }
 if(template==='P13'){
  Object.assign(p,{header:{y:45,size:17},intro:{y:45,size:17},count:{y:45,size:17},title:{y:q?175:255,size:q?120:175},title2:{y:q?315:460,size:q?140:190},cats:{y:q?330:510,h:q?530:600},base:{y:q?850:1110,h:q?230:240},arc1:{x:100,y:q?300:460,w:180,h:25},arc2:{x:440,y:q?300:465,w:130,h:25},arc3:{x:760,y:q?300:465,w:160,h:25},dot1:{y:height-195,w:9,h:9},dot2:{y:height-195,w:9,h:9},note:{y:height-180,size:16},together:{y:height-180,size:16},footer:{y:height-100,size:39},ring1:{x:820,y:height-180,w:65,h:65},ring1Inside:{x:828,y:height-172,w:49,h:49},ring2:{x:802,y:height-126,w:65,h:65},ring2Inside:{x:810,y:height-118,w:49,h:49},close:{x:915,y:height-110,size:26},bottomRule:{y:height-30}});
  for(let i=0;i<6;i++){set('motto'+i,{x:820,y:(q?120:155)+i*(q?38:50),size:q?24:29});set('line'+i,{x:820,y:(q?130:166)+i*(q?38:50),w:210});}
 }
 return base.map(l=>({...l,...p[l.id]}));
}
