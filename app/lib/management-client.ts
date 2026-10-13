import {getAuthClient} from './auth/client';
export type CodeFolder={id:string;name:string};
export type CodeDetails={id:string;trackingId:string|null;trackingUrl:string|null;target:string|null;slug:string|null;scans:number;bytes:number;editable:boolean};
export type ManagementData={folders:CodeFolder[];details:CodeDetails[]};
export async function managementRequest(method='GET',body?:unknown){const {data,error}=await getAuthClient().auth.getSession();if(error||!data.session)throw new Error('Please sign in again.');const response=await fetch('/api/management',{method,cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to update your codes.');return result;}
