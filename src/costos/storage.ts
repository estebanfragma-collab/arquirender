import { useEffect, useState } from 'react';
let connection:Promise<IDBDatabase>|undefined;
function database(){return connection??=new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('arquirender-costos',1);request.onupgradeneeded=()=>request.result.createObjectStore('documents');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
export async function readDocument(key:string):Promise<unknown>{
 if(typeof indexedDB==='undefined')return JSON.parse(localStorage.getItem(key)||'null');
 const db=await database();return new Promise((resolve,reject)=>{const request=db.transaction('documents').objectStore('documents').get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
}
export async function writeDocument(key:string,value:unknown){
 if(typeof indexedDB==='undefined'){localStorage.setItem(key,JSON.stringify(value));return;}
 const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction('documents','readwrite');tx.objectStore('documents').put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
}
export function useDocument<T>(key:string,initial:()=>T,validate:(v:unknown)=>v is T){
 const [value,setValue]=useState<T>(initial);const [ready,setReady]=useState(typeof indexedDB==='undefined');const [saved,setSaved]=useState(false);
 useEffect(()=>{let active=true;if(typeof indexedDB==='undefined')return;void readDocument(key).then(v=>{if(active&&validate(v))setValue(v);}).catch(()=>{/* Existing local draft remains available. */}).finally(()=>{if(active)setReady(true);});return()=>{active=false;};},[key,validate]);
 useEffect(()=>{if(!ready)return;if(typeof indexedDB==='undefined'){try{localStorage.setItem(key,JSON.stringify(value));setSaved(true);}catch{setSaved(false);}return;}let active=true;setSaved(false);void writeDocument(key,value).then(()=>{if(active)setSaved(true);}).catch(()=>{if(active)setSaved(false);});return()=>{active=false;};},[key,value,ready]);
 return [value,setValue,saved,ready] as const;
}
