export const locales = [
 {code:'en',name:'English (US)',short:'EN',flag:'us',dir:'ltr'},
 {code:'ar',name:'العربية',short:'AR',flag:'sa',dir:'rtl'},
 {code:'es',name:'Español',short:'ES',flag:'es',dir:'ltr'},
 {code:'es-MX',name:'Español (México)',short:'MX',flag:'mx',dir:'ltr'},
 {code:'fr',name:'Français',short:'FR',flag:'fr',dir:'ltr'},
 {code:'id',name:'Bahasa Indonesia',short:'ID',flag:'id',dir:'ltr'},
 {code:'pt-BR',name:'Português (Brasil)',short:'PT',flag:'br',dir:'ltr'},
 {code:'tr',name:'Türkçe',short:'TR',flag:'tr',dir:'ltr'},
 {code:'bn',name:'বাংলা',short:'BN',flag:'bd',dir:'ltr'},
 {code:'ru',name:'Русский',short:'RU',flag:'ru',dir:'ltr'}
] as const;
export type Locale = typeof locales[number]['code'];
export const languageStorageKey = 'qr-barcode-language';
export function validLocale(value:unknown):value is Locale{return locales.some(locale=>locale.code===value);}
export function readLocale(storage:Pick<Storage,'getItem'>):Locale{try{const value=storage.getItem(languageStorageKey);return validLocale(value)?value:'en';}catch{return 'en';}}
export function saveLocale(storage:Pick<Storage,'setItem'>,locale:Locale){try{storage.setItem(languageStorageKey,locale);}catch{/* Language switching still works when storage is disabled. */}}
