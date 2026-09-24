import {expect,it} from 'vitest';
import {sizeForDimensions} from './renderSize';
it('preserves widescreen, square and portrait formats',()=>{
 expect(sizeForDimensions(1920,1080)).toBe('1536x864');
 expect(sizeForDimensions(1000,1000)).toBe('1024x1024');
 expect(sizeForDimensions(1080,1920)).toBe('864x1536');
 expect(sizeForDimensions(1536,1024)).toBe('1536x1024');
});
it('keeps unusual formats within validated provider dimensions and pixel budget',()=>{
 for(let width=100;width<=4000;width+=13){
  const [w,h]=sizeForDimensions(width,1080).split('x').map(Number);
  expect(w%16).toBe(0);expect(h%16).toBe(0);
  expect(w*h).toBeLessThanOrEqual(1572864);
  expect(Math.min(w,h)).toBeGreaterThanOrEqual(512);
 }
});
