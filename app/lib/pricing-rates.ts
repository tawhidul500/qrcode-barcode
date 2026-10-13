import backup from './pricing-rates-backup.json';
import {validRates,type RateTable} from './pricing-currency';
export const backupRates:RateTable={rates:backup.rates,fetchedAt:backup.fetchedAt};
export const rateStorageKey='qr-pricing-rates';
export function usableRates(value:unknown):value is RateTable{
 if(!value||typeof value!=='object')return false;
 const data=value as RateTable;
 return Number.isFinite(data.fetchedAt)&&data.fetchedAt>0&&data.fetchedAt<=Date.now()&&!!data.rates&&Number.isFinite(data.rates.BDT)&&data.rates.BDT>0&&Object.values(data.rates).every(rate=>typeof rate==='number'&&Number.isFinite(rate)&&rate>0);
}
export function readRates(storage:Pick<Storage,'getItem'>):RateTable{
 try{const cached:unknown=JSON.parse(storage.getItem(rateStorageKey)||'null');if(usableRates(cached)&&cached.fetchedAt>backupRates.fetchedAt)return cached;}catch{}
 return backupRates;
}
export async function refreshRates(storage:Pick<Storage,'getItem'|'setItem'>,signal:AbortSignal):Promise<RateTable>{
 const existing=readRates(storage);if(validRates(existing))return existing;
 const providers=[
  {url:'https://open.er-api.com/v6/latest/USD',parse:(data:any)=>{if(data.result!=='success'||data.base_code!=='USD')throw new Error('Invalid rates');return {rates:data.rates,fetchedAt:Number(data.time_last_update_unix)*1000};}},
  {url:'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',parse:(data:any)=>({rates:Object.fromEntries(Object.entries(data.usd||{}).map(([key,value])=>[key.toUpperCase(),value])),fetchedAt:Date.parse(data.date+'T00:00:00Z')})}
 ];
 const table=await Promise.any(providers.map(async provider=>{
  const response=await fetch(provider.url,{signal,credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw new Error('Rates unavailable');
  const value=provider.parse(await response.json());if(!usableRates(value))throw new Error('Invalid rates');return value;
 }));
 try{storage.setItem(rateStorageKey,JSON.stringify(table));}catch{}
 return table;
}
