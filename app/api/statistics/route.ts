import {authenticate,database,codeId,CodeError,responseError} from '../../lib/server/codes';import {parseStatisticsFilter} from '../../lib/statistics';import {siteURL} from '../../lib/site-url';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){try{
 const user=await authenticate(request);let filter;try{filter=parseStatisticsFilter(new URL(request.url).searchParams);if(filter.code)codeId(filter.code);}catch(e){throw new CodeError(400,(e as Error).message);}
 const sql=database();const codes=await sql`SELECT id,title,target,active,slug FROM tracked_codes WHERE user_id=${user} ORDER BY created_at DESC`;
 const rows=await sql`WITH filtered AS (
 SELECT v.* FROM code_visits v JOIN tracked_codes c ON c.id=v.code_id
 WHERE c.user_id=${user} AND v.visited_at>=(${filter.from}::date::timestamp AT TIME ZONE 'UTC') AND v.visited_at<((${filter.to}::date+1)::timestamp AT TIME ZONE 'UTC')
 AND v.visited_at>=now()-interval '90 days' AND (${filter.code}='' OR c.id::text=${filter.code}) AND (${filter.country}='' OR v.country=${filter.country}) AND (${filter.device}='' OR v.device=${filter.device})
 ) SELECT 'total' AS category,'All' AS label,count(*)::int AS visits,count(DISTINCT device_hash)::int AS unique_devices FROM filtered
 UNION ALL SELECT 'daily',to_char(visited_at AT TIME ZONE 'UTC','YYYY-MM-DD'),count(*)::int,count(DISTINCT device_hash)::int FROM filtered GROUP BY 2
 UNION ALL SELECT 'country',country,count(*)::int,count(DISTINCT device_hash)::int FROM filtered GROUP BY country
 UNION ALL SELECT 'device',device,count(*)::int,count(DISTINCT device_hash)::int FROM filtered GROUP BY device`;
 const group=(category:string)=>rows.filter(r=>r.category===category).map(r=>({label:String(r.label),visits:Number(r.visits),uniqueDevices:Number(r.unique_devices)}));const total=rows.find(r=>r.category==='total');
 return Response.json({total:Number(total?.visits||0),uniqueDevices:Number(total?.unique_devices||0),daily:group('daily').sort((a,b)=>a.label.localeCompare(b.label)),countries:group('country').sort((a,b)=>b.visits-a.visits),devices:group('device').sort((a,b)=>b.visits-a.visits),codes:codes.map(c=>({...c,url:siteURL()+'/r/'+(c.slug||c.id)})),filter},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return responseError(e);}}
