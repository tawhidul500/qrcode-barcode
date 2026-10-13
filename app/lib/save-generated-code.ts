import {getAuthClient} from './auth/client';
import {addCode,type SavedCode} from './saved-codes';
export async function saveGeneratedCode(code:Omit<SavedCode,'id'|'createdAt'|'archived'>){
 const {data,error}=await getAuthClient().auth.getUser();
 if(error||!data.user)throw new Error('Please sign in to save your code.');
 addCode(window.localStorage,data.user.id,code);
 return 'Code saved. Open My Account to manage your codes.';
}
