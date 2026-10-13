import {regionCurrencies} from './pricing-currency';
export type VisitorRegion={country_code:string;currency:string;languages:string};
const timezoneCountries:Record<string,string>={
 'Asia/Dhaka':'BD','Asia/Dacca':'BD','Asia/Karachi':'PK','Asia/Kolkata':'IN','Asia/Calcutta':'IN','Asia/Dubai':'AE',
 'Asia/Riyadh':'SA','Asia/Qatar':'QA','Asia/Kuwait':'KW','Asia/Bahrain':'BH','Asia/Muscat':'OM',
 'Asia/Kathmandu':'NP','Asia/Katmandu':'NP','Asia/Colombo':'LK','Asia/Singapore':'SG','Asia/Kuala_Lumpur':'MY',
 'Asia/Jakarta':'ID','Asia/Makassar':'ID','Asia/Jayapura':'ID','Asia/Bangkok':'TH','Asia/Manila':'PH',
 'Asia/Ho_Chi_Minh':'VN','Asia/Saigon':'VN','Asia/Tokyo':'JP','Asia/Seoul':'KR','Asia/Shanghai':'CN','Asia/Hong_Kong':'HK',
 'Europe/London':'GB','Europe/Paris':'FR','Europe/Berlin':'DE','Europe/Madrid':'ES','Europe/Rome':'IT',
 'Europe/Amsterdam':'NL','Europe/Brussels':'BE','Europe/Lisbon':'PT','Europe/Dublin':'IE','Europe/Vienna':'AT',
 'Europe/Helsinki':'FI','Europe/Athens':'GR','Europe/Stockholm':'SE','Europe/Oslo':'NO','Europe/Copenhagen':'DK',
 'Europe/Warsaw':'PL','Europe/Prague':'CZ','Europe/Budapest':'HU','Europe/Bucharest':'RO','Europe/Zurich':'CH',
 'Europe/Istanbul':'TR','Europe/Moscow':'RU','Africa/Cairo':'EG','Africa/Johannesburg':'ZA','Africa/Lagos':'NG','Africa/Nairobi':'KE',
 'America/New_York':'US','America/Chicago':'US','America/Denver':'US','America/Los_Angeles':'US','America/Phoenix':'US',
 'America/Anchorage':'US','Pacific/Honolulu':'US','America/Toronto':'CA','America/Vancouver':'CA','America/Winnipeg':'CA',
 'America/Mexico_City':'MX','America/Cancun':'MX','America/Sao_Paulo':'BR','America/Manaus':'BR',
 'Australia/Sydney':'AU','Australia/Melbourne':'AU','Australia/Brisbane':'AU','Australia/Perth':'AU','Australia/Adelaide':'AU',
 'Pacific/Auckland':'NZ'
};
export function browserRegion(languages:readonly string[],timezone:string):VisitorRegion{
 let country=timezoneCountries[timezone]||'';
 if(!country)for(const value of languages){try{const region=new Intl.Locale(value).region;if(region&&regionCurrencies[region]){country=region;break;}}catch{}}
 return {country_code:country,currency:regionCurrencies[country]||'',languages:languages.join(',')};
}
let request:Promise<VisitorRegion>|null=null;
async function lookup(url:string,alternate=false):Promise<VisitorRegion>{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),2500);
 try{
  const response=await fetch(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw new Error('Location unavailable');
  const data=await response.json();const country=data.country_code;
  if(data.error||data.success===false||typeof country!=='string'||!/^[A-Z]{2}$/.test(country))throw new Error('Invalid country');
  const currency=alternate?data.currency?.code:data.currency;
  return {country_code:country,currency:typeof currency==='string'&&/^[A-Z]{3}$/.test(currency)?currency:regionCurrencies[country]||'',languages:typeof data.languages==='string'?data.languages:''};
 }finally{clearTimeout(timer);}
}
// Shared lookup, bounded wait, independent provider and offline timezone fallback.
export function visitorRegion():Promise<VisitorRegion>{
 if(request)return request;
 const languages=typeof navigator==='undefined'?[]:navigator.languages?.length?navigator.languages:[navigator.language];
 let timezone='';try{timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch{}
 const fallback=browserRegion(languages,timezone);
 request=Promise.any([lookup('https://ipapi.co/json/'),lookup('https://ipwho.is/',true)]).catch(()=>fallback);
 return request;
}
