'use client';
import {useEffect,useState} from 'react';
import {authConfigured,getAuthClient} from '../lib/auth/client';
import {Localized} from './i18n/LanguageProvider';
export default function AccountControls(){
 const [signedIn,setSignedIn]=useState(false);
 useEffect(()=>{
  if(!authConfigured())return;
  const client=getAuthClient();
  const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>setSignedIn(Boolean(session)));
  return ()=>subscription.unsubscribe();
 },[]);
 return <Localized><div className="home-account">{signedIn?<a className="home-sign-in" href="/account">My Account</a>:<><a className="home-sign-in" href="/login">Sign In</a><a className="home-sign-up" href="/signup">Sign Up</a></>}</div></Localized>;
}
