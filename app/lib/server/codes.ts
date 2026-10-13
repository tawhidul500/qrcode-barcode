import {neon} from '@neondatabase/serverless';
import {createClient} from '@supabase/supabase-js';
import {gunzipSync,gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import type {SavedCode} from '../saved-codes';

export class CodeError extends Error {constructor(public status:number,message:string){super(message);}}
export async function authenticate(request:Request):Promise<string>{
 const token=request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
 if(!token)throw new CodeError(401,'Please sign in to manage your codes.');
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new CodeError(503,'Account access is not configured.');
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.auth.getUser(token);
 if(error||!data.user)throw new CodeError(401,'Your session has expired. Please sign in again.');
 if(data.user.factors?.some(f=>f.status==='verified')){
  const claims=await client.auth.getClaims(token);
  if(claims.error||claims.data?.claims.aal!=='aal2')throw new CodeError(403,'Complete two-step verification to access your account.');
 }
 return data.user.id;
}
export function database(){
 if(!process.env.DATABASE_URL)throw new CodeError(503,'Cloud storage is not configured.');
 return neon(process.env.DATABASE_URL);
}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function codeId(value:unknown):string{
 if(typeof value!=='string'||!uuid.test(value))throw new CodeError(400,'Invalid code identifier.');return value;
}
export function validateCode(value:unknown):Omit<SavedCode,'createdAt'> & {createdAt:string}{
 if(!value||typeof value!=='object')throw new CodeError(400,'Invalid saved code.');
 const v={...value} as Record<string,unknown>;
 if(v.imageGzip!==undefined){
  if(v.image!==undefined||typeof v.imageGzip!=='string'||v.imageGzip.length>3700000||! /^[A-Za-z0-9+/]+={0,2}$/.test(v.imageGzip))throw new CodeError(400,'Invalid compressed image.');
  try{v.image=gunzipSync(Buffer.from(v.imageGzip,'base64'),{maxOutputLength:32000000}).toString('utf8');}catch{throw new CodeError(413,'Invalid or oversized compressed image.');}
 }
 if(typeof v.name!=='string'||!v.name.trim()||v.name.length>80||typeof v.type!=='string'||!v.type.trim()||v.type.length>80||!['qr','barcode'].includes(String(v.kind)))throw new CodeError(400,'Invalid code name or type.');
 if(typeof v.image!=='string'||!/^data:image\/(?:svg\+xml;charset=utf-8,|png;base64,)/.test(v.image)||Buffer.byteLength(v.image)>32000000)throw new CodeError(413,'Use a valid code image smaller than 32 MB.');
 let createdAt=new Date().toISOString();
 if(v.createdAt!==undefined){if(typeof v.createdAt!=='string'||!Number.isFinite(Date.parse(v.createdAt)))throw new CodeError(400,'Invalid creation date.');createdAt=new Date(v.createdAt).toISOString();}
 if(v.archived!==undefined&&typeof v.archived!=='boolean')throw new CodeError(400,'Invalid archive status.');
 return {id:v.id===undefined?crypto.randomUUID():codeId(v.id),name:v.name.trim(),type:v.type.trim(),kind:v.kind as 'qr'|'barcode',image:v.image,archived:v.archived===true,createdAt};
}
export function imageHash(image:string){return createHash('sha256').update(image).digest('hex');}
export function serialize(row:Record<string,unknown>):SavedCode{
 return {id:String(row.id),name:String(row.name),kind:row.kind as 'qr'|'barcode',type:String(row.type),image:String(row.image),archived:Boolean(row.archived),createdAt:new Date(String(row.created_at)).toISOString()};
}
export async function jsonBody(request:Request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new CodeError(415,'Expected JSON.');
 const reader=request.body?.getReader();if(!reader)throw new CodeError(400,'Missing request body.');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4000000){await reader.cancel();throw new CodeError(413,'Request is too large.');}chunks.push(value);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new CodeError(400,'Invalid JSON.');}
}
export function responseError(error:unknown){
 if(error instanceof CodeError)return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store'}});
 const message=error instanceof Error?error.message:'';
 if(message.includes('code_capacity'))return Response.json({error:'Cloud storage is full (50 codes or 256 MB). Delete some archived codes.'},{status:409});
 return Response.json({error:'Cloud storage is unavailable. Please try again later.'},{status:503});
}

export function transportCode(row:Record<string,unknown>){
 const code=serialize(row);
 if(Buffer.byteLength(code.image)<=250000)return code;
 const {image,...metadata}=code;
 return {...metadata,imageGzip:gzipSync(Buffer.from(image)).toString('base64')};
}
