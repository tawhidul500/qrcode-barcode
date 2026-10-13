import {validLocale,type Locale} from './locales';
const countryLanguages:Record<string,Locale>={BD:'bn',MX:'es-MX',ES:'es',FR:'fr',ID:'id',BR:'pt-BR',TR:'tr',RU:'ru',SA:'ar',AE:'ar',QA:'ar',KW:'ar',BH:'ar',OM:'ar',EG:'ar',JO:'ar',LB:'ar',IQ:'ar',DZ:'ar',MA:'ar',TN:'ar',LY:'ar',YE:'ar',AR:'es',CL:'es',CO:'es',PE:'es',EC:'es',VE:'es',UY:'es',PY:'es',BO:'es',CR:'es',PA:'es',GT:'es',HN:'es',SV:'es',NI:'es',DO:'es',CU:'es',US:'en',GB:'en',AU:'en',NZ:'en',IE:'en'};
export function matchLanguage(value:string):Locale|null{
 try{const locale=new Intl.Locale(value.trim());if(locale.language==='es'&&locale.region==='MX')return 'es-MX';if(locale.language==='pt'&&locale.region==='BR')return 'pt-BR';if(validLocale(locale.language))return locale.language;}catch{}
 return null;
}
export function suggestLanguage(country:string|undefined,regionalLanguages:string, browserLanguages:readonly string[]):Locale{
 if(country&&countryLanguages[country])return countryLanguages[country];
 for(const language of regionalLanguages.split(',')){const locale=matchLanguage(language);if(locale)return locale;}
 for(const language of browserLanguages){const locale=matchLanguage(language);if(locale)return locale;}
 return 'en';
}
