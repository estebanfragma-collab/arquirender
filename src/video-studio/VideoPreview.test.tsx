import {afterEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react';
import VideoPreview from './VideoPreview';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it('defers loading offscreen takes, then seeks a real opening frame without autoplay',()=>{
 let intersect:IntersectionObserverCallback;
 const disconnect=vi.fn();
 vi.stubGlobal('IntersectionObserver',class {constructor(cb:IntersectionObserverCallback){intersect=cb;}observe(){}disconnect=disconnect;});
 const {container}=render(<VideoPreview src="https://example.test/private.mp4" name="Mi toma"/>);
 const video=container.querySelector('video')!;
 expect(video.getAttribute('src')).toBeNull();
 act(()=>intersect([{isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));
 expect(video.getAttribute('src')).toBe('https://example.test/private.mp4');
 expect(disconnect).toHaveBeenCalled();
 expect(video.autoplay).toBe(false);
 Object.defineProperty(video,'duration',{value:5});
 fireEvent.loadedMetadata(video);
 expect(video.currentTime).toBe(0.1);
 fireEvent.seeked(video);
 expect(screen.queryByText('Cargando vista previa…')).toBeNull();
});
it('explains preview failure while retaining native playback controls',()=>{
 vi.stubGlobal('IntersectionObserver',undefined);
 const {container}=render(<VideoPreview src="broken.mp4" name="Toma"/>);
 fireEvent.error(container.querySelector('video')!);
 expect(screen.getByText(/No se pudo cargar/).textContent).toContain('No se pudo cargar');
 expect(container.querySelector('video')!.controls).toBe(true);
});
