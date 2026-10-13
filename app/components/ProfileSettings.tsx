'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {User} from '@supabase/supabase-js';
import {UserRound,Building2,Globe,ShieldCheck,HardDrive,Plus,Save,LockKeyhole,Bell} from 'lucide-react';
import {getAuthClient} from '../lib/auth/client';
import {authError,passwordError,callbackURL} from '../lib/auth/flows';
import {emptyProfile,validateProfile,type AccountProfile} from '../lib/profile';
import {profileRequest} from '../lib/profile-client';
import {locales} from '../lib/i18n/locales';
import {useLanguage,Localized} from './i18n/LanguageProvider';
import './profile-settings.css';
type Tab='general'|'password'|'notifications';
type StorageUsage={bytes:number;count:number;maxBytes:number;maxCount:number};
export default function ProfileSettings({user,onUser,onTimezone}:{user:User;onUser:(user:User)=>void;onTimezone?:(zone:string)=>void}){
 const {locale,setLocale}=useLanguage();const [tab,setTab]=useState<Tab>('general');
 const [profile,setProfile]=useState<AccountProfile>({...emptyProfile,language:locale}),[email,setEmail]=useState(user.email||'');
 const [storage,setStorage]=useState<StorageUsage|null>(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [currentPassword,setCurrentPassword]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState('');
 const [factor,setFactor]=useState(''),[enrollment,setEnrollment]=useState<{id:string;qr:string;secret:string}|null>(null),[otp,setOtp]=useState('');
 const running=useRef(false);
 const [timezones]=useState(()=>{try{return Array.from(new Set(['Asia/Dhaka','UTC',...Intl.supportedValuesOf('timeZone')]));}catch{return ['Asia/Dhaka','UTC','Asia/Kolkata','Asia/Dubai','Europe/London','America/New_York'];}});
 useEffect(()=>{let live=true;
  async function load(){try{const result=await profileRequest();if(!live)return;
   if(result.profile){const next=validateProfile({...emptyProfile,...result.profile});setProfile(next);setLocale(next.language);onTimezone?.(next.timezone);}
   else{const parts=String(user.user_metadata?.full_name||'').split(' ');setProfile({...emptyProfile,firstName:parts.shift()||'',lastName:parts.join(' '),language:locale,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Dhaka'});}
   setStorage(result.storage);
  }catch(e){if(live)setError(e instanceof Error?e.message:'Unable to load your profile.');}finally{if(live)setLoading(false);}}
  void load();void getAuthClient().auth.mfa.listFactors().then(({data,error})=>{if(live&&!error)setFactor(data.totp.find(f=>f.status==='verified')?.id||'');}).catch(()=>{});
  return()=>{live=false;};
 // Load one account snapshot; editing language must not reload unsaved fields.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[user.id]);
 async function action(work:()=>Promise<void>){if(running.current)return;running.current=true;setBusy(true);setError('');setNotice('');try{await work();}catch(e){setError(e instanceof Error?e.message:'Unable to complete your request.');}finally{running.current=false;setBusy(false);}}
 function change<K extends keyof AccountProfile>(key:K,value:AccountProfile[K]){setProfile(p=>({...p,[key]:value}));}
 async function save(e:FormEvent){e.preventDefault();await action(async()=>{
  const valid=validateProfile(profile);await profileRequest('PUT',valid);setProfile(valid);setLocale(valid.language);onTimezone?.(valid.timezone);
  if(tab==='general'){
   const emailChanged=email.trim()!==user.email;
   const {data,error}=await getAuthClient().auth.updateUser({data:{full_name:[valid.firstName,valid.lastName].filter(Boolean).join(' ')},...(emailChanged?{email:email.trim()}:{})},{emailRedirectTo:callbackURL(window.location.origin)});
   if(error){setNotice('Profile details saved.');throw new Error('Profile saved, but account name/email update failed. '+authError(error));}
   if(data.user)onUser(data.user);
   setNotice(emailChanged?'Profile saved. Check your email inboxes to confirm the email address change.':'Your profile has been saved.');
  }else setNotice('Notification preferences saved.');
 });}
 async function changePassword(e:FormEvent){e.preventDefault();await action(async()=>{
  const issue=passwordError(password,confirmation);if(issue)throw new Error(issue);
  const client=getAuthClient();const result=await client.auth.signInWithPassword({email:user.email||'',password:currentPassword});if(result.error)throw new Error('The current password is incorrect, or this account uses social sign-in. Use the password reset link if needed.');
  const assurance=await client.auth.mfa.getAuthenticatorAssuranceLevel();if(assurance.error)throw assurance.error;
  if(assurance.data.nextLevel==='aal2'&&assurance.data.currentLevel!=='aal2'){const factors=await client.auth.mfa.listFactors();const id=factors.data?.totp.find(f=>f.status==='verified')?.id;if(!id||!/^\d{6}$/.test(otp))throw new Error('Enter your current authenticator code.');const result=await client.auth.mfa.challengeAndVerify({factorId:id,code:otp});if(result.error)throw new Error('The authenticator code is incorrect.');}
  const {error}=await client.auth.updateUser({password});if(error)throw new Error(authError(error));
  setCurrentPassword('');setPassword('');setConfirmation('');setOtp('');setNotice('Password changed successfully.');
 });}
 async function enroll(){await action(async()=>{
  const client=getAuthClient();const factors=await client.auth.mfa.listFactors();if(factors.error)throw new Error('Unable to load authenticator settings.');
  for(const pending of factors.data.all.filter(f=>f.factor_type==='totp'&&f.status==='unverified')){const result=await client.auth.mfa.unenroll({factorId:pending.id});if(result.error)throw new Error('Unable to reset an unfinished setup.');}
  const {data,error}=await client.auth.mfa.enroll({factorType:'totp',friendlyName:'QR & Barcode authenticator'});if(error)throw new Error('Authenticator setup is unavailable. Check that TOTP enrollment is enabled in Supabase.');
  setEnrollment({id:data.id,qr:data.totp.qr_code,secret:data.totp.secret});setOtp('');
 });}
 async function verifyEnrollment(){await action(async()=>{
  if(!enrollment)return;const {error}=await getAuthClient().auth.mfa.challengeAndVerify({factorId:enrollment.id,code:otp});if(error)throw new Error('Invalid authenticator code. Try the current six-digit code.');setFactor(enrollment.id);setEnrollment(null);setOtp('');setNotice('Two-step verification is enabled.');
 });}
 async function cancelEnrollment(){await action(async()=>{if(!enrollment)return;const {error}=await getAuthClient().auth.mfa.unenroll({factorId:enrollment.id});if(error)throw new Error('Unable to cancel setup.');setEnrollment(null);setOtp('');});}
 async function disableMfa(){await action(async()=>{
  if(!/^\d{6}$/.test(otp))throw new Error('Enter your current authenticator code.');
  const client=getAuthClient();const verification=await client.auth.mfa.challengeAndVerify({factorId:factor,code:otp});if(verification.error)throw new Error('Invalid authenticator code.');
  const {error}=await client.auth.mfa.unenroll({factorId:factor});if(error)throw new Error('Unable to disable two-step verification.');setFactor('');setOtp('');setNotice('Two-step verification disabled.');
 });}
 const usage=storage?Math.min(100,storage.bytes/storage.maxBytes*100):0;
 function field(label:string,key:'firstName'|'lastName'|'dateOfBirth'|'companyName'|'companyEmail'|'address'|'website'|'taxId',type='text',maxLength=160){return <label className="profile-field">{label}<input type={type} value={profile[key]} maxLength={maxLength} onChange={e=>change(key,e.target.value)} {...(key==='dateOfBirth'?{max:new Date().toISOString().slice(0,10)}:{})}/></label>;}
 return <Localized><section className="account-panel profile-settings" aria-busy={busy||loading}>
  <div className="profile-tabs" role="tablist" aria-label="Profile settings">{([{id:'general',label:'General Information',Icon:UserRound},{id:'password',label:'Change password',Icon:LockKeyhole},{id:'notifications',label:'Notifications',Icon:Bell}] as const).map(({id,label,Icon})=><button key={id} role="tab" id={'profile-tab-'+id} aria-controls={'profile-panel-'+id} aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>{setTab(id);setError('');setNotice('');}}><Icon size={17}/>{label}</button>)}</div>
  {loading&&<p role="status">Loading profile settings…</p>}{error&&<p className="account-message error" role="alert">{error}</p>}{notice&&<p className="account-message" role="status">{notice}</p>}
  <div role="tabpanel" id={'profile-panel-'+tab} aria-labelledby={'profile-tab-'+tab}>
  {tab==='general'&&<>
   <section className="profile-section"><h2><HardDrive size={21}/>Storage Information</h2>{storage?<><div className="profile-storage-label"><span>{(storage.bytes/1000000).toFixed(2)} MB / {storage.maxBytes/1000000} MB</span><span>{storage.count} / {storage.maxCount} codes</span></div><progress value={usage} max={100} aria-label="Account storage usage"/><p>Storage includes active and archived QR codes and barcodes.</p></>:<p>Storage usage is unavailable until your cloud database is configured.</p>}<a className="account-button secondary" href="/contact">Contact about more storage</a></section>
   <form onSubmit={save}><fieldset disabled={busy||loading}>
    <section className="profile-section"><h2><UserRound size={21}/>Personal Information</h2><div className="profile-grid">{field('First Name','firstName','text',80)}{field('Last Name','lastName','text',80)}<label className="profile-field">Email<input type="email" required autoComplete="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/><small>Email changes require confirmation.</small></label>{field('Date of Birth','dateOfBirth','date',10)}<div className="profile-phone-list">{profile.phones.map((phone,index)=><label className="profile-field" key={index}>Phone Number {index+1}<div><input type="tel" autoComplete="tel" maxLength={40} value={phone} onChange={e=>change('phones',profile.phones.map((p,i)=>i===index?e.target.value:p))}/>{profile.phones.length>1&&<button type="button" className="profile-link" aria-label={'Remove phone '+(index+1)} onClick={()=>change('phones',profile.phones.filter((_,i)=>i!==index))}>Remove</button>}</div></label>)}<button type="button" className="profile-link" disabled={profile.phones.length>=5} onClick={()=>change('phones',[...profile.phones,''])}><Plus size={15}/>Add phone number</button><small>Contact numbers only; these do not change your login method.</small></div></div></section>
    <section className="profile-section"><h2><Building2 size={21}/>Corporate Information</h2><div className="profile-grid">{field('Company Name','companyName')}<label className="profile-field">Company category<select value={profile.companyCategory} onChange={e=>change('companyCategory',e.target.value)}><option value="">Select company category</option>{['Technology','Retail & Ecommerce','Education','Healthcare','Food & Hospitality','Professional Services','Manufacturing','Nonprofit','Other'].map(v=><option key={v}>{v}</option>)}</select></label>{field('Company Email','companyEmail','email',254)}{field('Website','website','url',2048)}<div className="profile-wide">{field('Street, City, Region, ZIP, Country','address','text',500)}</div>{field('Tax / VAT ID','taxId','text',100)}</div></section>
    <section className="profile-section"><h2><Globe size={21}/>Language & Time Zone</h2><div className="profile-grid"><label className="profile-field">Language<select value={profile.language} onChange={e=>change('language',e.target.value as AccountProfile['language'])}>{locales.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}</select></label><label className="profile-field">Time Zone<select value={profile.timezone} onChange={e=>change('timezone',e.target.value)}>{Array.from(new Set([profile.timezone,...timezones])).map(zone=><option key={zone}>{zone}</option>)}</select><small>Used for code dates in your dashboard.</small></label></div></section>
    <div className="profile-actions"><a className="profile-danger" href={'/contact?subject='+encodeURIComponent('Account deletion request')}>Request account deletion</a><button className="account-button" type="submit"><Save size={17}/>{busy?'Saving…':'Save Changes'}</button></div>
   </fieldset></form>
   <section className="profile-section profile-security"><h2><ShieldCheck size={21}/>Google Authenticator</h2><p>Use Google Authenticator or another TOTP app for two-step verification.</p><p className="profile-security-state">{factor?'Activated':'Deactivated'}</p>
    {!factor&&!enrollment&&<button className="account-button secondary" disabled={busy} onClick={enroll}>Set up authenticator</button>}
    {enrollment&&<div className="profile-enrollment"><img src={enrollment.qr.startsWith('data:')?enrollment.qr:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(enrollment.qr)} alt="Scan this setup QR code in your authenticator app"/><p>Scan the setup QR with your authenticator app. Keep the setup key private.</p><details><summary>Enter a setup key manually</summary><code translate="no">{enrollment.secret}</code></details><label className="profile-field">Six-digit code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/></label><div className="profile-actions"><button className="account-button secondary" disabled={busy} onClick={cancelEnrollment}>Cancel setup</button><button className="account-button" disabled={busy||otp.length!==6} onClick={verifyEnrollment}>Verify and enable</button></div></div>}
    {factor&&<><label className="profile-field">Current authenticator code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/></label><button className="account-button secondary" disabled={busy||otp.length!==6} onClick={disableMfa}>Disable two-step verification</button></>}
   </section>
  </>}
  {tab==='password'&&<form onSubmit={changePassword}><fieldset disabled={busy}><section className="profile-section"><h2><LockKeyhole size={21}/>Change password</h2><p>Use at least 12 characters. If you sign in with Google or forgot your current password, use password recovery.</p><div className="profile-grid"><label className="profile-field">Current password<input type="password" autoComplete="current-password" required value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/></label><label className="profile-field">New password<input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label className="profile-field">Confirm new password<input type="password" autoComplete="new-password" required value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label>{factor&&<label className="profile-field">Authenticator code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/></label>}</div><div className="profile-actions"><a href="/forgot-password">Forgot your password?</a><button className="account-button" type="submit">{busy?'Updating…':'Update password'}</button></div></section></fieldset></form>}
  {tab==='notifications'&&<form onSubmit={save}><fieldset disabled={busy||loading}><section className="profile-section"><h2><Bell size={21}/>Notification preferences</h2><p>Choose which optional emails you would like to receive. Preferences are saved across devices; email delivery is not yet connected.</p>{([{key:'productUpdates',label:'Product updates and announcements'},{key:'tips',label:'QR code tips and tutorials'}] as const).map(({key,label})=><label className="profile-notification" key={key}><span>{label}</span><input type="checkbox" checked={profile.notifications[key]} onChange={e=>change('notifications',{...profile.notifications,[key]:e.target.checked})}/></label>)}<p>Account confirmation and password recovery emails are managed separately by Supabase.</p><div className="profile-actions"><button className="account-button" type="submit">Save preferences</button></div></section></fieldset></form>}
  </div>
 </section></Localized>;
}
