import {render} from '@testing-library/react';
import {it,expect,vi} from 'vitest';
import {MontagePreview} from './MontagePreview';
it('keeps both decoders mounted at the overlap and holds the last frame until ready',()=>{
 vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
 const ready=vi.fn(),draw=vi.fn();
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({fillRect:vi.fn(),drawImage:draw} as any);
 const clips=[{id:'a',mediaId:'a',start:0,end:5,speed:1,transition:1},{id:'b',mediaId:'b',start:0,end:5,speed:1}];
 const props={clips,cursor:3.9,playing:false,source:(id:string)=>id+'.mp4',onReady:ready,onError:vi.fn(),width:1280,height:720};
 const {container,rerender}=render(<MontagePreview {...props}/>);
 const before=Array.from(container.querySelectorAll('video'));
 rerender(<MontagePreview {...props} cursor={4.5}/>);
 expect(Array.from(container.querySelectorAll('video'))).toEqual(before);
 expect(ready).toHaveBeenLastCalledWith(false);expect(draw).not.toHaveBeenCalled();
 vi.restoreAllMocks();
});
