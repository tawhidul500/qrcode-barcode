import {getAuthClient} from './auth/client';import type {Statistics,StatisticsFilter,TrackedCode} from './statistics';
async function request(path:string,method='GET',body?:unknown){const {data,error}=await getAuthClient().auth.getSession();if(error||!data.session)throw new Error('Please sign in to view statistics.');const response=await fetch(path,{method,cache:'no-store',headers:{Authorization:'Bearer '+data.session.access_token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw new Error(result.error||'Statistics are unavailable.');return result;}
export async function loadStatistics(filter:StatisticsFilter):Promise<Statistics>{return request('/api/statistics?'+new URLSearchParams(filter));}
export async function createTracking(title:string,target:string):Promise<TrackedCode>{return (await request('/api/tracking','POST',{title,target})).code;}
export async function setTracking(id:string,active:boolean){await request('/api/tracking','PATCH',{id,active});}

export async function changeTrackedLink(id:string,change:{target:string}|{slug:string}){await request('/api/tracking','PATCH',{id,...change});}
