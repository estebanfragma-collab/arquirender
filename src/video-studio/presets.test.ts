import {describe,it,expect} from 'vitest';
import {newScene,basis,validScenes} from './model';
import {applyPreset,videoPresets} from './presets';
describe('presets and existing projects',()=>{
 it('preserves legacy scenes and marks changed references for review',()=>{
  const original=newScene();expect(validScenes([original])).toBe(true);
  const scene=applyPreset({...original,startId:'first',endId:'last'},'day-night');
  expect(scene.mode).toBe('transition');expect(scene.endId).toBe('last');
  expect(scene.promptBasis).toBe(basis(scene));expect(basis({...scene,startId:'other'})).not.toBe(scene.promptBasis);
 });
 it('every preset can be saved and respects supported model lengths',()=>{
  for(const p of videoPresets){const scene=applyPreset(newScene(),p.id);expect(validScenes([scene])).toBe(true);expect(scene.prompt.length).toBeLessThanOrEqual(2200);if(scene.mode==='transition')expect(scene.duration).toBe(5);}
 });
 it('long approach selects ten seconds and single image presets clear final reference',()=>{
  const scene=applyPreset({...newScene(),endId:'old'},'approach');expect(scene.duration).toBe(10);expect(scene.mode).toBe('animate');expect(scene.endId).toBe('');
 });
});
