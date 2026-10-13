export const regionCurrencies:Record<string,string>={BD:'BDT',US:'USD',GB:'GBP',PK:'PKR',IN:'INR',AE:'AED',SA:'SAR',CA:'CAD',AU:'AUD',NZ:'NZD',JP:'JPY',CN:'CNY',HK:'HKD',SG:'SGD',MY:'MYR',ID:'IDR',TH:'THB',PH:'PHP',VN:'VND',KR:'KRW',BR:'BRL',MX:'MXN',TR:'TRY',RU:'RUB',CH:'CHF',SE:'SEK',NO:'NOK',DK:'DKK',PL:'PLN',CZ:'CZK',HU:'HUF',RO:'RON',ZA:'ZAR',NG:'NGN',EG:'EGP',KE:'KES',QA:'QAR',KW:'KWD',BH:'BHD',OM:'OMR',NP:'NPR',LK:'LKR',DE:'EUR',FR:'EUR',ES:'EUR',IT:'EUR',PT:'EUR',NL:'EUR',BE:'EUR',AT:'EUR',IE:'EUR',FI:'EUR',GR:'EUR',CY:'EUR',MT:'EUR',LU:'EUR',EE:'EUR',LV:'EUR',LT:'EUR',SK:'EUR',SI:'EUR',HR:'EUR'};
export const currencies=[...new Set(Object.values(regionCurrencies))].sort();
export function detectCurrency(languages:readonly string[]):string{
 // Prefer an explicit regional setting over an inferred language region.
 for(const infer of [false,true])for(const language of languages){try{const locale=new Intl.Locale(language);const region=infer?locale.maximize().region:locale.region;if(region&&regionCurrencies[region])return regionCurrencies[region];}catch{/* Ignore invalid browser locales. */}}
 return 'BDT';
}
export type RateTable={rates:Record<string,number>;fetchedAt:number};
export function validRates(value:unknown):value is RateTable{
 if(!value||typeof value!=='object')return false;
 const data=value as RateTable;
 return Number.isFinite(data.fetchedAt)&&data.fetchedAt<=Date.now()&&Date.now()-data.fetchedAt<86400000&&!!data.rates&&typeof data.rates==='object'&&Number.isFinite(data.rates.BDT)&&data.rates.BDT>0&&Object.values(data.rates).every(rate=>typeof rate==='number'&&Number.isFinite(rate)&&rate>0);
}
export function convertBDT(amount:number,currency:string,rates:Record<string,number>):number{
 if(currency==='BDT')return amount;
 if(!Number.isFinite(rates.BDT)||rates.BDT<=0||!Number.isFinite(rates[currency])||rates[currency]<=0)throw new Error('Currency rate unavailable');
 return amount*rates[currency]/rates.BDT;
}
export function formatPrice(amount:number,currency:string,locale:string):string{
 return new Intl.NumberFormat(locale,{style:'currency',currency,currencyDisplay:'narrowSymbol'}).format(amount);
}
