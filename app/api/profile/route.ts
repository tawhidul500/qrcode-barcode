import {authenticate,database,jsonBody,CodeError,responseError} from '../../lib/server/codes';
import {validateProfile} from '../../lib/profile';
export const runtime='nodejs';export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(request:Request){
 try{const id=await authenticate(request),sql=database();
 const rows=await sql`SELECT profile FROM account_profiles WHERE user_id=${id}`;
 const usage=await sql`SELECT count(*)::int AS count,coalesce(sum(octet_length(image)),0)::bigint AS bytes FROM saved_codes WHERE user_id=${id}`;
 return Response.json({profile:rows[0]?.profile||null,storage:{count:Number(usage[0].count),bytes:Number(usage[0].bytes),maxCount:50,maxBytes:256000000}},{headers});
 }catch(e){return responseError(e);}
}
export async function PUT(request:Request){
 try{const id=await authenticate(request);let profile;
 const input=await jsonBody(request);if(Buffer.byteLength(JSON.stringify(input))>15000)throw new CodeError(413,'Profile is too large.');
 try{profile=validateProfile(input);}catch(e){throw new CodeError(400,e instanceof Error?e.message:'Invalid profile.');}
 const sql=database();await sql`INSERT INTO account_profiles(user_id,profile) VALUES(${id},${JSON.stringify(profile)}::jsonb) ON CONFLICT(user_id) DO UPDATE SET profile=EXCLUDED.profile,updated_at=now()`;
 return Response.json({profile},{headers});}catch(e){return responseError(e);}
}
