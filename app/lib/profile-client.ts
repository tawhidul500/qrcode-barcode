import {getAuthClient} from './auth/client';import type {AccountProfile} from './profile';
export async function profileRequest(method='GET',profile?:AccountProfile){
 const {data,error}=await getAuthClient().auth.getSession();if(error||!data.session)throw new Error('Please sign in again.');
 const response=await fetch('/api/profile',{method,cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token,...(profile?{'Content-Type':'application/json'}:{})},body:profile?JSON.stringify(profile):undefined,signal:AbortSignal.timeout(20000)});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to load your profile.');return result;
}
