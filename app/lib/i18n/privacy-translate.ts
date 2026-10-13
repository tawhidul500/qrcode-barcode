import messages from './privacy-messages.json';
import type {Locale} from './locales';

// Scoped to the privacy page: policy wording cannot override other UI messages.
const dictionaries:Record<Exclude<Locale,'en'>,Record<string,string>>=messages;
export function translatePrivacy(text:string,locale:Locale):string{
 if(locale==='en'||!text.trim())return text;
 const translated=dictionaries[locale][text.trim()];
 if(!translated)return text;
 return (text.match(/^\s*/)?.[0]||'')+translated+(text.match(/\s*$/)?.[0]||'');
}
