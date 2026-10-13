import {createHmac,randomUUID} from 'node:crypto';import {database,codeId} from '../../lib/server/codes';import {detectDevice,isAutomatedVisit,trackingTarget} from '../../lib/statistics';
export const runtime='nodejs';export const dynamic='force-dynamic';
async function redirect(request:Request,params:Promise<{id:string}>,record:boolean){
 const headers=new Headers({'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'});
 try{const key=(await params).id;if(!/^(?:[0-9a-f-]{36}|[a-z][a-z0-9-]{2,63})$/.test(key))return new Response('This QR link is unavailable.',{status:404,headers});const sql=database();const rows=await sql`SELECT id,target,active FROM tracked_codes WHERE id::text=${key} OR slug=${key}`;if(!rows.length)return new Response('This QR link is unavailable.',{status:404,headers});const id=String(rows[0].id),target=trackingTarget(rows[0].target);headers.set('Location',target);
 const agent=request.headers.get('user-agent')||'';
 if(record&&rows[0].active&&!isAutomatedVisit(agent,request.headers)){
  const existing=request.headers.get('cookie')?.match(/(?:^|;\s*)qrb_visit=([a-f0-9-]{36})(?:;|$)/i)?.[1];const visitor=existing||randomUUID();
  if(!existing)headers.set('Set-Cookie',`qrb_visit=${visitor}; Path=/r; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(request.url).protocol==='https:'?'; Secure':''}`);
  const secret=process.env.ANALYTICS_HASH_SECRET||process.env.DATABASE_URL!;const hash=createHmac('sha256',secret).update(visitor).digest('hex');
  const country=process.env.VERCEL==='1'?(request.headers.get('x-vercel-ip-country')||'ZZ'):'ZZ';const safeCountry=/^[A-Z]{2}$/.test(country)?country:'ZZ';
  try{await sql`SELECT record_code_visit(${id}::uuid,${hash},${safeCountry},${detectDevice(agent)})`;}catch{/* An analytics write failure must not stop a working destination redirect. */}
 }
 return new Response(null,{status:302,headers});
 }catch{return new Response('This QR link is temporarily unavailable.',{status:503,headers});}
}
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){return redirect(request,params,true);}
export async function HEAD(request:Request,{params}:{params:Promise<{id:string}>}){return redirect(request,params,false);}
