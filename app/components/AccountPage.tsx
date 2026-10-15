'use client';
import {useEffect,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {getAuthClient} from '../lib/auth/client';
import {authError} from '../lib/auth/flows';
export default function AccountPage(){
 const [user,setUser]=useState<User|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{
  let live=true;
  try{
   const client=getAuthClient();
   void client.auth.getUser().then(({data,error})=>{if(!live)return;if(error||!data.user)window.location.replace('/login');else setUser(data.user);}).catch(()=>{if(live)setError('Unable to verify your account. Please try signing in again.');});
   const {data:{subscription}}=client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT')window.location.replace('/login');});
   return ()=>{live=false;subscription.unsubscribe();};
  }catch{setError('Account access is temporarily unavailable. Please try again later.');}
  return ()=>{live=false;};
 },[]);
 async function logout(){setBusy(true);setError('');try{const {error}=await getAuthClient().auth.signOut();if(error)throw error;window.location.replace('/login');}catch(e){setError(authError(e));setBusy(false);}}
 return <main className="auth-utility"><section><a href="/">QR &amp; barcode</a><h1>My Account</h1>{user?<><p>Signed in as <strong translate="no">{user.email}</strong></p><p><a href="/qr-code-generator">Create a QR code</a></p><p><a href="/barcode-generator">Create a barcode</a></p><p><a href="/forgot-password">Reset your password</a></p><button className="submit" disabled={busy} onClick={logout}>{busy?'Signing out…':'Sign out'}</button></>:!error&&<p role="status">Verifying your account…</p>}{error&&<p role="alert">{error}</p>}<p><a href="/login">Go to sign in</a></p></section></main>;
}
