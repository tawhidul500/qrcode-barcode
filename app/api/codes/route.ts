import {authenticate,database,validateCode,imageHash,serialize,jsonBody,codeId,CodeError,responseError} from '../../lib/server/codes';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(request:Request){
 try{const userId=await authenticate(request),sql=database();const rows=await sql`SELECT * FROM saved_codes WHERE user_id=${userId} ORDER BY created_at DESC`;return Response.json({codes:rows.map(serialize)},{headers});}catch(e){return responseError(e);}
}
export async function POST(request:Request){
 try{const userId=await authenticate(request),value=validateCode(await jsonBody(request)),sql=database();
 const rows=await sql`SELECT * FROM save_account_code(${userId}::uuid,${value.id}::uuid,${value.name},${value.kind},${value.type},${value.image},${imageHash(value.image)},${value.createdAt}::timestamptz,${value.archived})`;
 return Response.json({code:serialize(rows[0])},{headers});}catch(e){return responseError(e);}
}
export async function PATCH(request:Request){
 try{const userId=await authenticate(request),body=await jsonBody(request);
 if(!body||!Array.isArray(body.ids)||!body.ids.length||body.ids.length>50)throw new CodeError(400,'Choose up to 50 codes.');
 const ids=body.ids.map(codeId);const sql=database();
 if(body.name!==undefined){if(ids.length!==1||typeof body.name!=='string'||!body.name.trim()||body.name.length>80)throw new CodeError(400,'Use a name of up to 80 characters.');await sql`UPDATE saved_codes SET name=${body.name.trim()} WHERE user_id=${userId} AND id=ANY(${ids}::uuid[])`;}
 else if(typeof body.archived==='boolean')await sql`UPDATE saved_codes SET archived=${body.archived} WHERE user_id=${userId} AND id=ANY(${ids}::uuid[])`;
 else throw new CodeError(400,'Choose rename or archive.');
 return Response.json({ok:true},{headers});}catch(e){return responseError(e);}
}
export async function DELETE(request:Request){
 try{const userId=await authenticate(request),body=await jsonBody(request),id=codeId(body?.id),sql=database();await sql`DELETE FROM saved_codes WHERE user_id=${userId} AND id=${id}`;return Response.json({ok:true},{headers});}catch(e){return responseError(e);}
}
