import {readExcel} from './readExcel';
self.onmessage=async(event:MessageEvent<ArrayBuffer>)=>{try{self.postMessage({sheets:await readExcel(event.data)});}catch(error){self.postMessage({error:error instanceof Error?error.message:'No se pudo leer el Excel.'});}};
