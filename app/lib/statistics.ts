export type TrackedCode={id:string;title:string;target:string;url:string;active:boolean};
export type StatisticsFilter={code:string;from:string;to:string;country:string;device:string};
export type StatisticGroup={label:string;visits:number;uniqueDevices:number};
export type Statistics={total:number;uniqueDevices:number;daily:StatisticGroup[];countries:StatisticGroup[];devices:StatisticGroup[];codes:TrackedCode[];filter:StatisticsFilter};
export function trackingTarget(value:unknown){
 if(typeof value!=='string'||value.length>2048)throw new Error('Use a destination URL of up to 2048 characters.');
 try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error();if(/^\/r\/[a-z0-9-]+$/i.test(url.pathname))throw Error();return url.href;}catch{throw new Error('Enter an HTTP(S) destination link, not another tracking link.');}
}
export function defaultStatisticsFilter():StatisticsFilter{const today=new Date();return {code:'',from:new Date(today.getTime()-6*86400000).toISOString().slice(0,10),to:today.toISOString().slice(0,10),country:'',device:''};}
export function parseStatisticsFilter(params:URLSearchParams):StatisticsFilter{
 const defaults=defaultStatisticsFilter(),filter={code:params.get('code')||'',from:params.get('from')||defaults.from,to:params.get('to')||defaults.to,country:params.get('country')||'',device:params.get('device')||''};
 for(const date of [filter.from,filter.to]){const parsed=new Date(date+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date)throw new Error('Choose valid dates.');}
 const days=(Date.parse(filter.to)-Date.parse(filter.from))/86400000;if(days<0||days>89)throw new Error('Choose a date range of up to 90 days.');
 if(filter.country&&!/^[A-Z]{2}$/.test(filter.country))throw new Error('Choose a valid country.');
 if(filter.device&&!['Mobile','Tablet','Desktop','Unknown'].includes(filter.device))throw new Error('Choose a valid device.');return filter;
}
export function detectDevice(agent:string){if(/ipad|tablet|android(?!.*mobile)/i.test(agent))return 'Tablet';if(/mobile|iphone|ipod/i.test(agent))return 'Mobile';if(/windows|macintosh|linux|x11/i.test(agent))return 'Desktop';return 'Unknown';}
export function isAutomatedVisit(agent:string,headers:Headers){return /bot|crawler|spider|preview|facebookexternalhit|whatsapp|telegrambot|slackbot|headless/i.test(agent)||Boolean(headers.get('next-router-prefetch'))||/prefetch/i.test(headers.get('purpose')||headers.get('sec-purpose')||'');}
export function statisticsCSV(data:Statistics){const rows=[['Group','Label','Visits','Estimated unique devices'],['Total','All',String(data.total),String(data.uniqueDevices)]];for(const [group,items] of [['Date',data.daily],['Country',data.countries],['Device',data.devices]] as const)for(const item of items)rows.push([group,item.label,String(item.visits),String(item.uniqueDevices)]);return '\uFEFF'+rows.map(row=>row.map(value=>'"'+(/^[=+@-]/.test(value)?"'":'')+value.replace(/"/g,'""')+'"').join(',')).join('\r\n');}
