import {getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

export async function pdfImages(file:File, progress:(message:string)=>void) {
  const task=getDocument({data:await file.arrayBuffer()});
  try {
    const pdf=await task.promise;
    if(pdf.numPages>20)throw new Error('El PDF tiene más de 20 páginas. Divídelo en archivos más pequeños.');
    const images:{id:string;name:string;src:string}[]=[];
    for(let number=1;number<=pdf.numPages;number++) {
      progress(`Importando ${file.name} · página ${number} de ${pdf.numPages}…`);
      const page=await pdf.getPage(number);
      const original=page.getViewport({scale:1});
      const viewport=page.getViewport({scale:Math.min(2400/Math.max(original.width,original.height),Math.sqrt(4000000/(original.width*original.height)))});
      const canvas=document.createElement('canvas');
      canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
      try {
        await page.render({canvas,viewport,background:'#ffffff'}).promise;
        images.push({id:crypto.randomUUID(),name:`${file.name} · página ${number}`,src:canvas.toDataURL('image/png')});
      } finally {canvas.width=0;canvas.height=0;page.cleanup();}
    }
    return images;
  } catch(error) {
    if(error instanceof Error && error.name==='PasswordException')throw new Error('El PDF tiene contraseña. Importa una copia desbloqueada.');
    throw error;
  } finally {await task.destroy();}
}
