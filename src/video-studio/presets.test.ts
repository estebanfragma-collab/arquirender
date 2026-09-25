import {describe,it,expect} from 'vitest';
import {newScene,basis,validScenes} from './model';
import {applyPreset,videoPresets,changeSceneMode,presetsForMode} from './presets';
describe('presets and existing projects',()=>{
 it('preserves legacy scenes and marks changed references for review',()=>{
  const original=newScene();expect(validScenes([original])).toBe(true);
  const scene=applyPreset({...original,mode:'transition',startId:'first',endId:'last'},'day-night');
  expect(scene.mode).toBe('transition');expect(scene.endId).toBe('last');
  expect(scene.promptBasis).toBe(basis(scene));expect(basis({...scene,startId:'other'})).not.toBe(scene.promptBasis);
 });
 it('every preset can be saved and respects supported model lengths',()=>{
  for(const p of videoPresets){const scene=applyPreset({...newScene(),mode:p.mode},p.id);expect(validScenes([scene])).toBe(true);expect(scene.prompt.length).toBeLessThanOrEqual(2200);if(scene.mode==='transition')expect(scene.duration).toBe(5);}
 });
 it('long approach selects ten seconds and single image presets clear final reference',()=>{
  const scene=applyPreset({...newScene(),endId:'old'},'approach');expect(scene.duration).toBe(10);expect(scene.mode).toBe('animate');expect(scene.endId).toBe('');
 });
});

it('never switches image mode through an incompatible preset',()=>{
 const scene={...newScene(),prompt:'My custom direction',startId:'start'};
 expect(applyPreset(scene,'day-night')).toBe(scene);
 for(const mode of ['animate','transition'] as const){
  for(const preset of presetsForMode(mode))expect(applyPreset({...newScene(),mode},preset.id).mode).toBe(mode);
 }
});
it('changing mode removes incompatible directions but preserves images and user intent',()=>{
 const scene=applyPreset({...newScene(),startId:'start',brief:'Warm light'},'approach');
 const next=changeSceneMode({...scene,endId:'end',brief:'Warm light'},'transition');
 expect(next).toMatchObject({mode:'transition',startId:'start',endId:'end',brief:'Warm light',presetId:undefined,prompt:'',promptBasis:'',duration:5});
 expect(changeSceneMode(next,'transition')).toBe(next);
});
