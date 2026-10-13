import {createCloudCode} from './cloud-codes';
import type {SavedCode} from './saved-codes';
export async function saveGeneratedCode(code:Omit<SavedCode,'id'|'createdAt'|'archived'> & {id?:string}){
 await createCloudCode(code);
 return 'Code saved to your account. It is available on your other devices.';
}
