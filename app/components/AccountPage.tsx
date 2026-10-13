'use client';
import {useEffect,useMemo,useRef,useState,type FormEvent} from 'react';
import type {User} from '@supabase/supabase-js';
import {ArrowLeft,Archive,Barcode,Check,ChevronRight,Download,Home,LogOut,Plus,QrCode,RotateCcw,Search,ShieldCheck,UserRound,Pencil,X} from 'lucide-react';
import {getAuthClient} from '../lib/auth/client';
import {authError} from '../lib/auth/flows';
import {readCodes,writeCodes,type SavedCode} from '../lib/saved-codes';
import {Localized} from './i18n/LanguageProvider';
import LanguageSelector from './i18n/LanguageSelector';
import './account-dashboard.css';
type View='qr'|'barcode'|'archive'|'profile';
export default function AccountPage(){
 const [user,setUser]=useState<User|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [codes,setCodes]=useState<SavedCode[]>([]),[view,setView]=useState<View>('qr'),[query,setQuery]=useState(''),[sort,setSort]=useState('newest');
 const [selected,setSelected]=useState<string[]>([]),[editing,setEditing]=useState<SavedCode|null>(null),[name,setName]=useState(''),[status,setStatus]=useState('');
 useEffect(()=>{
  let live=true;
  try{
   const client=getAuthClient();
   void client.auth.getUser().then(({data,error})=>{if(!live)return;if(error||!data.user)window.location.replace('/login');else{setUser(data.user);try{setCodes(readCodes(window.localStorage,data.user.id));}catch{setError('Browser storage is unavailable. You can still create and download codes.');}}}).catch(()=>{if(live)setError('Unable to verify your account. Please try signing in again.');});
   const {data:{subscription}}=client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){setUser(null);setCodes([]);window.location.replace('/login');}});
   return ()=>{live=false;subscription.unsubscribe();};
  }catch{setError('Account access is temporarily unavailable. Please try again later.');}
  return ()=>{live=false;};
 },[]);
 const filtered=useMemo(()=>codes.filter(code=>(view==='archive'?code.archived:!code.archived&&code.kind===view)&&(code.name+' '+code.type).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='oldest'?Date.parse(a.createdAt)-Date.parse(b.createdAt):Date.parse(b.createdAt)-Date.parse(a.createdAt)),[codes,view,query,sort]);
 function navigate(next:View){setView(next);setSelected([]);setQuery('');setStatus('');}
 function persist(next:SavedCode[]){if(!user)return false;try{writeCodes(window.localStorage,user.id,next);setCodes(next);setError('');return true;}catch(e){setError(e instanceof Error?e.message:'Unable to save changes.');return false;}}
 function archive(ids:string[],archived:boolean){if(persist(codes.map(code=>ids.includes(code.id)?{...code,archived}:code))){setSelected([]);setStatus(archived?'Codes archived.':'Codes restored.');}}
 function remove(code:SavedCode){if(window.confirm('Delete this saved code from this browser? This cannot be undone.')){if(persist(codes.filter(item=>item.id!==code.id)))setStatus('Code deleted.');}}
 function rename(event:FormEvent){event.preventDefault();if(editing&&name.trim()&&persist(codes.map(code=>code.id===editing.id?{...code,name:name.trim().slice(0,80)}:code))){setEditing(null);setStatus('Code renamed.');}}
 async function logout(){setBusy(true);setError('');try{const {error}=await getAuthClient().auth.signOut();if(error)throw error;window.location.replace('/login');}catch(e){setError(authError(e));setBusy(false);}}
 const displayName=String(user?.user_metadata?.full_name||user?.email?.split('@')[0]||'');
 const heading=view==='qr'?'My QR Codes':view==='barcode'?'My Barcodes':view==='archive'?'Archived Codes':'My Profile';
 if(!user)return <Localized><main className="auth-utility"><section><a href="/">Back to Home</a><h1>My Account</h1>{error?<p role="alert">{error}</p>:<p role="status">Verifying your account…</p>}<a href="/login">Go to sign in</a></section></main></Localized>;
 return <Localized><div className="account-dashboard">
  <aside className="account-sidebar"><a className="account-brand" href="/"><img src="/assets/svg/Group 42404.svg" alt=""/><span>QR &amp; barcode</span></a>
   <a className="account-create" href="/qr-code-generator"><Plus size={19}/>Create New QR Code</a>
   <nav aria-label="Account navigation">{([{id:'qr',label:'My QR Codes',Icon:QrCode},{id:'barcode',label:'My Barcodes',Icon:Barcode},{id:'archive',label:'Archived Codes',Icon:Archive},{id:'profile',label:'My Profile',Icon:UserRound}] as const).map(({id,label,Icon})=><button key={id} className={view===id?'is-active':''} aria-current={view===id?'page':undefined} onClick={()=>navigate(id)}><Icon size={19}/>{label}<ChevronRight size={15}/></button>)}<a href="/scanner"><ShieldCheck size={19}/>Scanner</a><a href="/"><Home size={19}/>Back to Home</a></nav>
   <div className="account-sidebar-bottom"><div className="account-member"><span className="account-avatar" translate="no">{displayName.slice(0,1).toUpperCase()}</span><div><strong translate="no">{displayName}</strong><span translate="no">{user.email}</span></div></div><LanguageSelector/><button className="account-logout" disabled={busy} onClick={logout}><LogOut size={18}/>{busy?'Signing out…':'Sign out'}</button></div>
  </aside>
  <main className="account-main"><div className="account-topbar"><a href="/"><ArrowLeft size={15}/>Back to Home</a><span><ShieldCheck size={15}/>Your workspace</span></div>
   <header className="account-heading"><div><p className="account-eyebrow">YOUR DASHBOARD</p><h1>{heading}{view!=='profile'&&<span translate="no">{filtered.length}</span>}</h1><p>Welcome back, <bdi translate="no">{displayName}</bdi>. Create and manage your codes in one place.</p></div><div className="account-heading-actions"><a className="account-button secondary" href="/pricing">View plans</a><a className="account-button" href={view==='barcode'?'/barcode-generator':'/qr-code-generator'}><Plus size={18}/>{view==='barcode'?'Create New Barcode':'Create New QR Code'}</a></div></header>
   <div className="account-stats">{[{label:'QR codes',value:codes.filter(c=>c.kind==='qr'&&!c.archived).length,Icon:QrCode},{label:'Barcodes',value:codes.filter(c=>c.kind==='barcode'&&!c.archived).length,Icon:Barcode},{label:'Archived Codes',value:codes.filter(c=>c.archived).length,Icon:Archive}].map(({label,value,Icon})=><div key={label}><span className="account-stat-icon"><Icon size={23}/></span><p>{label}<strong translate="no">{value}</strong></p></div>)}</div>
   {error&&<p className="account-message error" role="alert">{error}</p>}{status&&<p className="account-message" role="status">{status}</p>}
   {view==='profile'?<section className="account-panel account-profile"><h2>Account details</h2><dl><dt>Full Name</dt><dd translate="no">{displayName}</dd><dt>Email</dt><dd translate="no">{user.email}</dd><dt>Member since</dt><dd translate="no">{new Date(user.created_at).toLocaleDateString()}</dd></dl><a className="account-button secondary" href="/forgot-password">Reset your password</a></section>:<section className="account-panel" aria-label={heading}>
    <div className="account-toolbar"><label className="account-search"><Search size={18}/><input value={query} onChange={e=>{setQuery(e.target.value);setSelected([]);}} placeholder="Search your codes" aria-label="Search your codes"/></label><label className="account-sort">Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div>
    <div className="account-selection"><label><input type="checkbox" checked={filtered.length>0&&filtered.every(c=>selected.includes(c.id))} disabled={!filtered.length} onChange={e=>setSelected(e.target.checked?filtered.map(c=>c.id):[])}/>Select All</label><span translate="no">{selected.length}</span><button disabled={!selected.length} onClick={()=>archive(selected,view!=='archive')}>{view==='archive'?<RotateCcw size={16}/>:<Archive size={16}/>} {view==='archive'?'Restore selected':'Archive selected'}</button></div>
    {filtered.length?<div className="account-code-list">{filtered.map(code=><article className="account-code-card" key={code.id}><label className="account-code-select"><input type="checkbox" aria-label={'Select '+code.name} checked={selected.includes(code.id)} onChange={e=>setSelected(e.target.checked?[...selected,code.id]:selected.filter(id=>id!==code.id))}/></label><div className="account-code-image"><img src={code.image} alt={code.kind==='qr'?'Saved QR code':'Saved barcode'}/></div><div className="account-code-info"><span className="account-code-kind">{code.kind==='qr'?'QR Code':'Barcode'}</span><h2><bdi translate="no">{code.name}</bdi><button aria-label="Rename code" onClick={()=>{setEditing(code);setName(code.name);}}><Pencil size={15}/></button></h2><p>Type: <bdi translate="no">{code.type}</bdi></p><p>Created: <bdi translate="no">{new Date(code.createdAt).toLocaleDateString()}</bdi></p></div><div className="account-code-actions"><a className="account-button" href={code.image} download={code.name.replace(/[^a-zA-Z0-9_-]/g,'_')+(code.image.startsWith('data:image/png')?'.png':'.svg')}><Download size={17}/>Download</a><button className="account-button secondary" onClick={()=>archive([code.id],!code.archived)}>{code.archived?<RotateCcw size={16}/>:<Archive size={16}/>} {code.archived?'Restore':'Archive'}</button>{code.archived&&<button className="account-delete" onClick={()=>remove(code)}>Delete</button>}</div></article>)}</div>:<div className="account-empty"><span>{view==='barcode'?<Barcode size={44}/>:view==='archive'?<Archive size={44}/>:<QrCode size={44}/>}</span><h2>{query?'No matching codes':view==='archive'?'No archived codes yet':'Your next code starts here'}</h2><p>{query?'Try another search.':view==='archive'?'Archived codes will appear here. You can restore them anytime.':'Create a code and choose Save to My Codes in the generator to add it to your dashboard.'}</p>{!query&&view!=='archive'&&<a className="account-button" href={view==='barcode'?'/barcode-generator':'/qr-code-generator'}><Plus size={18}/>{view==='barcode'?'Create New Barcode':'Create New QR Code'}</a>}</div>}
    <p className="account-storage-note"><Check size={15}/>Codes are saved in this browser for your account. They do not sync across devices.</p>
   </section>}
   <footer className="account-footer"><span>QR &amp; barcode</span><a href="/contact">Contact Us</a><a href="/privacy-policy">Privacy Policy</a></footer>
  </main>
  {editing&&<RenameDialog name={name} setName={setName} close={()=>setEditing(null)} submit={rename}/>}

 </div></Localized>;
}

function RenameDialog({name,setName,close,submit}:{name:string;setName:(name:string)=>void;close:()=>void;submit:(event:FormEvent)=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const element=ref.current;if(!element)return;const previous=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';element.showModal();return()=>{element.close();document.body.style.overflow=overflow;previous?.focus();};},[]);
 return <Localized><dialog ref={ref} className="account-rename" aria-labelledby="rename-heading" onCancel={close}><button className="account-modal-close" aria-label="Close" onClick={close}><X size={20}/></button><h2 id="rename-heading">Rename code</h2><form onSubmit={submit}><label htmlFor="saved-code-name">Code name</label><input id="saved-code-name" autoFocus maxLength={80} value={name} onChange={e=>setName(e.target.value)} required/><div><button className="account-button secondary" type="button" onClick={close}>Cancel</button><button className="account-button" type="submit" disabled={!name.trim()}>Save changes</button></div></form></dialog></Localized>;
}
