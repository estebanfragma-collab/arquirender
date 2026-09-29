import {describe,it,expect} from 'vitest';
import {createPoster,resolvePoster,posterSvg,posterRatio} from './poster';
const fresh=import.meta.env.VITE_SUPABASE_URL+'/storage/v1/object/sign/presentation-images/test.webp?token=fresh';
describe('posters in presentation documents',()=>{
 it('keeps asset references and resolves refreshed cloud URLs after reopening',()=>{
  const poster=createPoster('P31',[{id:'render',src:'https://old.invalid/signed',name:'Mi render'}]);
  const reopened=JSON.parse(JSON.stringify(poster));
  expect(reopened.layers.some(l=>l.src==='asset://render')).toBe(true);
  expect(JSON.stringify(reopened)).not.toContain('old.invalid');
  const resolved=resolvePoster(reopened,[{id:'render',src:fresh,name:'Mi render'}]);
  expect(resolved.some(l=>l.src===fresh)).toBe(true);
  expect(posterSvg(reopened,[{id:'render',src:fresh,name:'Mi render'}],'page')).toContain(fresh);
 });
 it('retains edited layers and social format through document serialization',()=>{
  const poster=createPoster('P03',[]);poster.format='4:5';poster.layers.find(l=>l.id==='title')!.text='MI PROYECTO';
  const restored=JSON.parse(JSON.stringify({pages:[{id:'p',images:[],poster}]})).pages[0].poster;
  expect(posterSvg(restored,[],'p')).toContain('MI PROYECTO');
  expect(posterRatio(restored)).toBe(.8);
 });
});
