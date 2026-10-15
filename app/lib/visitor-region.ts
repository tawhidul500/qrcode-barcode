export type VisitorRegion={country_code:string;currency:string;languages:string};
let request:Promise<VisitorRegion>|null=null;
// Share one country lookup between language selection and pricing on each page load.
export function visitorRegion():Promise<VisitorRegion>{
 if(request)return request;
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
 request=fetch('https://ipapi.co/json/',{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'})
  .then(async response=>{if(!response.ok)throw new Error('Location unavailable');const data=await response.json();if(data.error||typeof data.country_code!=='string'||!/^[A-Z]{2}$/.test(data.country_code))throw new Error('Invalid country');return {country_code:data.country_code,currency:typeof data.currency==='string'?data.currency:'',languages:typeof data.languages==='string'?data.languages:''};})
  .finally(()=>clearTimeout(timer));
 return request;
}
