'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {authConfigured,getAuthClient} from '../lib/auth/client';
import {authError,passwordError,requestReset} from '../lib/auth/flows';
import {Localized} from './i18n/LanguageProvider';
export default function PasswordPage({reset=false}:{reset?:boolean}){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState('');
 const [ready,setReady]=useState(!reset),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[done,setDone]=useState(false);
 const running=useRef(false);
 useEffect(()=>{
  if(!reset || !authConfigured())return;
  let live=true;
  void getAuthClient().auth.getUser().then(({data,error})=>{if(live){setReady(Boolean(data.user)&&!error);if(error||!data.user)setError('Please request a new password reset link to continue.');}}).catch(()=>{if(live)setError('Unable to verify your session. Please request a new reset link.');});
  return ()=>{live=false;};
 },[reset]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(running.current)return;
  setError('');setNotice('');
  if(reset){const issue=passwordError(password,confirmation);if(issue){setError(issue);return;}}
  running.current=true;setBusy(true);
  try{
   const client=getAuthClient();
   if(reset){
    const {error}=await client.auth.updateUser({password});if(error)throw error;
    setPassword('');setConfirmation('');setDone(true);
    const {error:logoutError}=await client.auth.signOut({scope:'global'});
    setNotice(logoutError?'Your password has been updated. Sign out from your account before leaving this device.':'Your password has been updated. Sign in with your new password.');
   }else{
    const {error}=await requestReset(client,email,window.location.origin);if(error)throw error;
    setNotice('If an account exists for this email address, a password reset link will be sent. Open it in this browser.');
   }
  }catch(error){setError(authError(error));}finally{running.current=false;setBusy(false);}
 }
 return <Localized><main className="auth-utility"><section><a href="/">QR &amp; barcode</a><h1>{reset?'Set a new password':'Forgot your password?'}</h1><p>{reset?'Choose a strong password for your account.':'Enter your account email to receive a reset link.'}</p>
 {!authConfigured()&&<p role="status">Account access is temporarily unavailable. Please try again later.</p>}
 {!done&&<form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy||!ready||!authConfigured()}>
 {reset?<><label htmlFor="new-password">New password</label><input id="new-password" autoComplete="new-password" type="password" required minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" autoComplete="new-password" type="password" required minLength={12} maxLength={128} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></>:<><label htmlFor="reset-email">Email address</label><input id="reset-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></>}
 <button className="submit" type="submit">{busy?'Please wait…':reset?'Update password':'Send reset link'}</button></fieldset></form>}
 {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <a href="/login">Return to sign in</a>{reset&&<p><a href="/forgot-password">Request a new reset link</a></p>}
 </section></main></Localized>;
}
