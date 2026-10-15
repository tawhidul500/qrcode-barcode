'use client';
import {useEffect,useRef,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {ArrowLeft,Archive,Barcode,ChevronRight,Home,LogOut,Plus,QrCode,ShieldCheck,BarChart3,UserRound,FileUp} from 'lucide-react';
import {getAuthClient} from '../lib/auth/client';
import {authError} from '../lib/auth/flows';
import {readCodes,type SavedCode} from '../lib/saved-codes';
import {Localized} from './i18n/LanguageProvider';
import {listCloudCodes,createCloudCode} from '../lib/cloud-codes';
import {profileRequest} from '../lib/profile-client';
import {useLanguage} from './i18n/LanguageProvider';
import ContentManager from './ContentManager';
import CSVImport from './CSVImport';
import CodeManager,{TransferNotice} from './CodeManager';
import StatisticsPage from './StatisticsPage';
import ProfileSettings from './ProfileSettings';
import LanguageSelector from './i18n/LanguageSelector';
import './account-dashboard.css';
type View='qr'|'barcode'|'archive'|'profile'|'statistics'|'import'|'content';
export default function AccountPage(){
 const {locale,setLocale}=useLanguage();
 const [statisticsCode,setStatisticsCode]=useState('');
 const [timezone,setTimezone]=useState<string|undefined>(undefined);
 const [user,setUser]=useState<User|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [codes,setCodes]=useState<SavedCode[]>([]),[view,setView]=useState<View>('qr');
 const [syncing,setSyncing]=useState(false),[legacy,setLegacy]=useState<SavedCode[]>([]);
 const operation=useRef(false),revision=useRef(0);
 const [status,setStatus]=useState('');
 useEffect(()=>{const requested=new URLSearchParams(window.location.search).get('view');if(requested&&['qr','barcode','archive','profile','statistics','import','content'].includes(requested))setView(requested as View);},[]);
 useEffect(()=>{
  let live=true;
  try{
   const client=getAuthClient();
   void client.auth.getUser().then(({data,error})=>{if(!live)return;if(error||!data.user)window.location.replace('/login');else{setUser(data.user);try{setLegacy(readCodes(window.localStorage,data.user.id));}catch{setError('Browser storage is unavailable. You can still create and download codes.');}}}).catch(()=>{if(live)setError('Unable to verify your account. Please try signing in again.');});
   const {data:{subscription}}=client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){setUser(null);setCodes([]);window.location.replace('/login');}});
   return ()=>{live=false;subscription.unsubscribe();};
  }catch{setError('Account access is temporarily unavailable. Please try again later.');}
  return ()=>{live=false;};
 },[]);
 useEffect(()=>{if(!user)return;let live=true;profileRequest().then(result=>{if(live&&result.profile){setTimezone(result.profile.timezone);setLocale(result.profile.language);}}).catch(()=>{});return()=>{live=false;};},[user?.id,setLocale]);
 const count=codes.filter(code=>view==='archive'?code.archived:!code.archived&&code.kind===view).length;
 function navigate(next:View){setView(next);setStatus('');}
 async function reload(){setCodes(await listCloudCodes());}
 async function mutate(action:()=>Promise<void>,message:string){
  if(operation.current)return;operation.current=true;revision.current++;setBusy(true);setError('');
  try{await action();await reload();setStatus(message);}catch(e){setError(e instanceof Error?e.message:'Unable to save changes.');try{await reload();}catch{}}finally{operation.current=false;setBusy(false);}
 }
 async function importLegacy(){await mutate(async()=>{for(const code of legacy)await createCloudCode(code);setLegacy([]);},'Browser codes imported. They are now available on your other devices.');}
 useEffect(()=>{
  if(!user)return;let live=true,inFlight=false;
  async function refresh(){if(inFlight||operation.current)return;inFlight=true;const started=revision.current;setSyncing(true);try{const next=await listCloudCodes();if(live&&started===revision.current){setCodes(next);setError('');}}catch(e){if(live&&started===revision.current)setError(e instanceof Error?e.message:'Unable to load your codes.');}finally{inFlight=false;if(live)setSyncing(false);}}
  function visible(){if(document.visibilityState==='visible')void refresh();}
  void refresh();window.addEventListener('focus',visible);document.addEventListener('visibilitychange',visible);
  const timer=setInterval(visible,60000);
  return()=>{live=false;clearInterval(timer);window.removeEventListener('focus',visible);document.removeEventListener('visibilitychange',visible);};
 },[user]);
 async function logout(){setBusy(true);setError('');try{const {error}=await getAuthClient().auth.signOut();if(error)throw error;window.location.replace('/login');}catch(e){setError(authError(e));setBusy(false);}}
 const displayName=String(user?.user_metadata?.full_name||user?.email?.split('@')[0]||'');
 const heading=view==='qr'?'My QR Codes':view==='barcode'?'My Barcodes':view==='archive'?'Archived Codes':view==='statistics'?'Statistics':view==='import'?'Import From CSV':view==='content'?'Hosted Content':'My Profile';
 if(!user)return <Localized><div className="account-dashboard account-loading" aria-busy="true"><aside className="account-sidebar"><a className="account-brand" href="/"><img src="/assets/svg/Group 42404.svg" alt=""/><span>QR &amp; barcode</span></a><div className="account-loading-bar"/><div className="account-loading-bar"/><div className="account-loading-bar"/></aside><main className="account-main"><div className="account-topbar"><a href="/"><ArrowLeft size={15}/>Back to Home</a></div>{error?<div className="account-message error" role="alert">{error} <a href="/login">Go to sign in</a></div>:<><p className="account-loading-status" role="status">Loading your workspace…</p><div className="account-loading-heading"/><div className="account-loading-panel"/></>}</main></div></Localized>;
 return <Localized><div className="account-dashboard" aria-busy={busy||syncing}>
  <aside className="account-sidebar"><a className="account-brand" href="/"><img src="/assets/svg/Group 42404.svg" alt=""/><span>QR &amp; barcode</span></a>
   <a className="account-create" href="/qr-code-generator"><Plus size={19}/>Create New QR Code</a>
   <nav aria-label="Account navigation">{([{id:'qr',label:'My QR Codes',Icon:QrCode},{id:'barcode',label:'My Barcodes',Icon:Barcode},{id:'archive',label:'Archived Codes',Icon:Archive},{id:'profile',label:'My Profile',Icon:UserRound},{id:'statistics',label:'Statistics',Icon:BarChart3},{id:'import',label:'Import From CSV',Icon:FileUp},{id:'content',label:'Hosted Content',Icon:Home}] as const).map(({id,label,Icon})=><button key={id} className={view===id?'is-active':''} aria-current={view===id?'page':undefined} onClick={()=>navigate(id)}><Icon size={19}/>{label}<ChevronRight size={15}/></button>)}<a href="/scanner"><ShieldCheck size={19}/>Scanner</a><a href="/"><Home size={19}/>Back to Home</a></nav>
   <div className="account-sidebar-bottom"><div className="account-member"><span className="account-avatar" translate="no">{displayName.slice(0,1).toUpperCase()}</span><div><strong translate="no">{displayName}</strong><span translate="no">{user.email}</span></div></div><LanguageSelector/><button className="account-logout" disabled={busy} onClick={logout}><LogOut size={18}/>{busy?'Signing out…':'Sign out'}</button></div>
  </aside>
  <main className="account-main"><TransferNotice onAccepted={reload}/><div className="account-topbar"><a href="/"><ArrowLeft size={15}/>Back to Home</a><span><ShieldCheck size={15}/>Your workspace</span></div>
   <header className="account-heading"><div><p className="account-eyebrow">YOUR DASHBOARD</p><h1>{heading}{!['profile','statistics','import','content'].includes(view)&&<span translate="no">{count}</span>}</h1><p>Welcome back, <bdi translate="no">{displayName}</bdi>. Create and manage your codes in one place.</p></div><div className="account-heading-actions"><a className="account-button secondary" href="/pricing">View plans</a><a className="account-button" href={view==='barcode'?'/barcode-generator':'/qr-code-generator'}><Plus size={18}/>{view==='barcode'?'Create New Barcode':'Create New QR Code'}</a></div></header>
   <div className="account-stats">{[{label:'QR codes',value:codes.filter(c=>c.kind==='qr'&&!c.archived).length,Icon:QrCode},{label:'Barcodes',value:codes.filter(c=>c.kind==='barcode'&&!c.archived).length,Icon:Barcode},{label:'Archived Codes',value:codes.filter(c=>c.archived).length,Icon:Archive}].map(({label,value,Icon})=><div key={label}><span className="account-stat-icon"><Icon size={23}/></span><p>{label}<strong translate="no">{value}</strong></p></div>)}</div>
   {error&&<p className="account-message error" role="alert">{error} {error.includes('two-step')&&<a href="/verify">Verify your account</a>}</p>}{syncing&&<p role="status">Syncing your codes…</p>}{legacy.length>0&&<p className="account-message">{legacy.length} browser-saved codes found. <button disabled={busy||syncing} onClick={importLegacy}>Import to my account</button></p>}{status&&<p className="account-message" role="status">{status}</p>}
   {view==='content'?<ContentManager/>:view==='import'?<CSVImport codes={codes} onReload={reload}/>:view==='statistics'?<StatisticsPage initialCode={statisticsCode}/>:view==='profile'?<ProfileSettings user={user} onUser={setUser} onTimezone={setTimezone}/>:<CodeManager codes={codes} mode={view} timezone={timezone} locale={locale} onReload={reload} onStatistics={id=>{setStatisticsCode(id);navigate('statistics');}}/>}
   <footer className="account-footer"><span>QR &amp; barcode</span><a href="/contact">Contact Us</a><a href="/privacy-policy">Privacy Policy</a></footer>
  </main>

 </div></Localized>;
}
