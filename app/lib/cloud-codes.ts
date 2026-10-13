import {encodeCodeUpload,decodeCodeDownload} from './code-upload';
import {getAuthClient} from './auth/client';
import type {SavedCode} from './saved-codes';
async function request(method:string,body?:unknown,query=''){
 const {data,error}=await getAuthClient().auth.getSession();
 if(error||!data.session)throw new Error('Please sign in to manage your codes.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{
 const response=await fetch('/api/codes'+query,{method,cache:'no-store',credentials:'omit',headers:{Authorization:'Bearer '+data.session.access_token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to access cloud storage.');return result;
 }catch(e){if(e instanceof Error&&e.name==='AbortError')throw new Error('Cloud storage timed out. Please retry.');throw e;}finally{clearTimeout(timer);}
}
export async function listCloudCodes():Promise<SavedCode[]>{
 const records=(await request('GET')).codes as Array<SavedCode & {imageGzip?:string}>;
 const result:SavedCode[]=new Array(records.length);let cursor=0;
 async function worker(){while(cursor<records.length){const index=cursor++,record=records[index];
  if(record.image||record.imageGzip)result[index]=await decodeCodeDownload(record);
  else result[index]=await decodeCodeDownload((await request('GET',undefined,'?id='+encodeURIComponent(record.id))).code);
 }}
 await Promise.all(Array.from({length:Math.min(4,records.length)},worker));return result;
}
export async function createCloudCode(code:(Omit<SavedCode,'id'|'createdAt'|'archived'> & {id?:string})|SavedCode):Promise<SavedCode>{return decodeCodeDownload((await request('POST',await encodeCodeUpload(code))).code);}
export async function updateCloudCodes(ids:string[],change:{name:string}|{archived:boolean}){await request('PATCH',{ids,...change});}
export async function deleteCloudCode(id:string){await request('DELETE',{id});}

export async function getCloudCode(id:string):Promise<SavedCode>{return decodeCodeDownload((await request('GET',undefined,'?id='+encodeURIComponent(id))).code);}
