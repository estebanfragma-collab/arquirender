import {describe,it,expect} from 'vitest';
import {duration,locate,moveClip,splitClip,validate,initialEdit} from './model';
const c={id:'a',mediaId:'m',start:2,end:8,speed:2};
describe('video timeline',()=>{
 it('splits at the source position accounting for speed without losing duration',()=>{const parts=splitClip(c,1);expect(parts[0].end).toBe(4);expect(parts[1].start).toBe(4);expect(parts.reduce((n,c)=>n+duration(c),0)).toBe(duration(c));expect(()=>splitClip(c,0)).toThrow();});
 it('seeks across cuts and reorders without modifying source trims',()=>{const b={...c,id:'b',speed:1};expect(locate([c,b],3)).toMatchObject({index:1,local:0});expect(moveClip([c,b],'b','a')).toEqual([b,c]);});
 it('rejects invalid cuts and overlong exports',()=>{const media=[{id:'m',name:'test',file:new Blob(),duration:9}];expect(()=>validate({...initialEdit,clips:[c]},media)).not.toThrow();expect(()=>validate({...initialEdit,clips:[{...c,end:12}]},media)).toThrow();expect(()=>validate({...initialEdit,clips:Array.from({length:30},()=>({...c,speed:.25}))},media)).toThrow();});
});
