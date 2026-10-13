export type CodeEditor=Record<string,unknown> & {kind:'qr'|'barcode'};
export type SavedCode={id:string;name:string;kind:'qr'|'barcode';type:string;image:string;createdAt:string;archived:boolean;folderId?:string|null;trackingId?:string|null;editor?:CodeEditor|null};
const key=(userId:string)=>'qr-barcode-codes-v1:'+userId;
export function readCodes(storage:Pick<Storage,'getItem'>,userId:string):SavedCode[]{
 try{const value:unknown=JSON.parse(storage.getItem(key(userId))||'[]');if(!Array.isArray(value))return [];return value.filter((item):item is SavedCode=>Boolean(item&&typeof item.id==='string'&&typeof item.name==='string'&&['qr','barcode'].includes(item.kind)&&typeof item.type==='string'&&typeof item.image==='string'&&/^data:image\/(?:svg\+xml;charset=utf-8,|png;base64,)/.test(item.image)&&typeof item.createdAt==='string'&&Number.isFinite(Date.parse(item.createdAt))&&typeof item.archived==='boolean')).slice(0,50);}catch{return [];}
}
export function writeCodes(storage:Pick<Storage,'setItem'>,userId:string,codes:SavedCode[]){
 const data=JSON.stringify(codes);if(data.length>4000000)throw new Error('Your saved-code storage is full. Delete archived codes from your dashboard before saving more.');
 try{storage.setItem(key(userId),data);}catch{throw new Error('Unable to save changes. Please allow browser storage or free up space.');}
}
export function addCode(storage:Pick<Storage,'getItem'|'setItem'>,userId:string,code:Omit<SavedCode,'id'|'createdAt'|'archived'>):SavedCode{
 const codes=readCodes(storage,userId);const existing=codes.find(item=>!item.archived&&item.kind===code.kind&&item.image===code.image);if(existing)return existing;if(codes.length>=50)throw new Error('You can save up to 50 codes in this browser.');
 const saved:SavedCode={...code,id:crypto.randomUUID(),createdAt:new Date().toISOString(),archived:false};writeCodes(storage,userId,[saved,...codes]);return saved;
}
