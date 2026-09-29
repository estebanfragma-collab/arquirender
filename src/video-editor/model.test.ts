import {describe,it,expect} from 'vitest';
import {duration,locate,moveClip,splitClip,validate,initialEdit} from './model';
const c={id:'a',mediaId:'m',start:2,end:8,speed:2};
describe('video timeline',()=>{
 it('splits at the source position accounting for speed without losing duration',()=>{const parts=splitClip(c,1);expect(parts[0].end).toBe(4);expect(parts[1].start).toBe(4);expect(parts.reduce((n,c)=>n+duration(c),0)).toBe(duration(c));expect(()=>splitClip(c,0)).toThrow();});
 it('seeks across cuts and reorders without modifying source trims',()=>{const b={...c,id:'b',speed:1};expect(locate([c,b],3)).toMatchObject({index:1,local:0});expect(moveClip([c,b],'b','a')).toEqual([b,c]);});
 it('rejects invalid cuts and overlong exports',()=>{const media=[{id:'m',name:'test',file:new Blob(),duration:9}];expect(()=>validate({...initialEdit,clips:[c]},media)).not.toThrow();expect(()=>validate({...initialEdit,clips:[{...c,end:12}]},media)).toThrow();expect(()=>validate({...initialEdit,clips:Array.from({length:30},()=>({...c,speed:.25}))},media)).toThrow();});
});

import {timeline,totalDuration,overlap} from './model';
it('accounts for crossfade overlaps in seeking and final duration',()=>{
 const clips=[{...c,start:0,end:5,speed:1,transition:1},{...c,id:'b',start:0,end:5,speed:1}];
 expect(totalDuration(clips)).toBe(9);
 expect(timeline(clips)[1].start).toBe(4);
 expect(locate(clips,4.5)).toMatchObject({index:1,offset:4,local:.5});
});
it('clamps fades after speeding up and keeps the outgoing fade only on the second split',()=>{
 const clip={...c,start:0,end:2,speed:4,transition:2};
 expect(overlap([clip,{...clip,id:'b'}],0)).toBe(.25);
 const parts=splitClip({...c,transition:1},1);
 expect(parts[0].transition).toBe(0);expect(parts[1].transition).toBe(1);
 expect(totalDuration(parts)).toBe(duration(c));
});

import {blendProgress} from './model';
it('mixes both clips equally at the center with continuous endpoints',()=>{
 for(const kind of ['linear','smooth'] as const){expect(blendProgress(0,kind)).toBe(0);expect(blendProgress(.5,kind)).toBe(.5);expect(blendProgress(1,kind)).toBe(1);}
 expect(blendProgress(.1,'smooth')).toBeLessThan(blendProgress(.1,'linear'));
});
