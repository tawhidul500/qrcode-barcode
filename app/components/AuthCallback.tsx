'use client';
import {useEffect,useState} from 'react';
import {getAuthClient} from '../lib/auth/client';
import {exchangeCallback,safeNext} from '../lib/auth/flows';
export default function AuthCallback(){
 const [error,setError]=useState('');
 useEffect(()=>{
  let mounted=true;
  async function finish(){
   try{
    const url=new URL(window.location.href);
    const code=url.searchParams.get('code');
    if(url.searchParams.has('error') || !code) throw new Error('invalid callback');
    const {data,error}=await exchangeCallback(getAuthClient(),code);
    if(error || !data.session) throw error || new Error('missing session');
    if(!mounted)return;
    const recovery=url.searchParams.get('next')==='/reset-password';
    window.history.replaceState(null,'','/auth/callback');
    window.location.replace(recovery?'/reset-password':safeNext(url.searchParams.get('next')));
   }catch{if(mounted){window.history.replaceState(null,'','/auth/callback');setError('This link is invalid or has expired. Open the latest email link in the same browser where you started, or request a new link.');}}
  }
  void finish();return ()=>{mounted=false;};
 },[]);
 return <main className="auth-utility"><section><h1>{error?'Unable to sign in':'Completing sign in…'}</h1><p role={error?'alert':'status'}>{error||'Please wait while we verify your account.'}</p>{error&&<><a href="/login">Return to sign in</a><br/><a href="/forgot-password">Request a new password reset link</a></>}</section></main>;
}
