import {getAuthClient} from './auth/client';
import type {SavedCode} from './saved-codes';
async function request(method:string,body?:unknown){
 const {data,error}=await getAuthClient().auth.getSession();
 if(error||!data.session)throw new Error('Please sign in to manage your codes.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{
 const response=await fetch('/api/codes',{method,cache:'no-store',credentials:'omit',headers:{Authorization:'Bearer '+data.session.access_token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to access cloud storage.');return result;
 }catch(e){if(e instanceof Error&&e.name==='AbortError')throw new Error('Cloud storage timed out. Please retry.');throw e;}finally{clearTimeout(timer);}
}
export async function listCloudCodes():Promise<SavedCode[]>{return (await request('GET')).codes;}
export async function createCloudCode(code:Omit<SavedCode,'id'|'createdAt'|'archived'>|SavedCode):Promise<SavedCode>{return (await request('POST',code)).code;}
export async function updateCloudCodes(ids:string[],change:{name:string}|{archived:boolean}){await request('PATCH',{ids,...change});}
export async function deleteCloudCode(id:string){await request('DELETE',{id});}
