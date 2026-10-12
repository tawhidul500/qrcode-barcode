'use client';
import {useEffect,useRef,useState,type MouseEvent} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {Localized} from './i18n/LanguageProvider';
import {articlesForPage,blogPageCount,blogPageHref,resolveBlogPage} from '../lib/blog';

export default function BlogIndex({initialPage=1}:{initialPage?:number}){
 const [page,setPage]=useState(()=>resolveBlogPage(String(initialPage)));
 const articleList=useRef<HTMLElement>(null);
 useEffect(()=>{
  const syncPage=()=>setPage(resolveBlogPage(new URLSearchParams(window.location.search).get('page')));
  syncPage();
  window.addEventListener('popstate',syncPage);
  return()=>window.removeEventListener('popstate',syncPage);
 },[]);
 const navigate=(event:MouseEvent<HTMLAnchorElement>,nextPage:number)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  if(nextPage===page)return;
  window.history.pushState(null,'',blogPageHref(nextPage));
  setPage(nextPage);
  // Keep keyboard and screen-reader users at the start of the newly loaded content.
  articleList.current?.focus({preventScroll:true});
  articleList.current?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 return <Localized><main>
  <section className="blog-page-hero" aria-labelledby="blog-page-title">
   <div className="blog-heading"><h1 id="blog-page-title">QR code articles</h1><p>Latest Articles, Guides, And Insights About QR Codes</p></div>
  </section>
  <div className="blog-page-content">
   <section ref={articleList} id="blog-articles" className="blog-grid blog-page-grid" aria-label="Blog articles" tabIndex={-1}>
    {articlesForPage(page).map((post,index)=><article key={post.id} className="blog-card" aria-labelledby={'article-'+post.id}>
     <div className="blog-photo"><img src={'/assets/blog-page/'+post.image+'.webp'} alt="" width={708} height={464} loading={index<3?'eager':'lazy'} decoding="async"/></div>
     <h2 id={'article-'+post.id}>{post.title}</h2><p>{post.description}</p>
    </article>)}
   </section>
   <p className="footer-sr-only" role="status" aria-live="polite" aria-atomic="true">{`Article page ${page}`}</p>
   <nav className="blog-pagination" aria-label="Blog pagination">
    {page>1&&<a href={blogPageHref(page-1)} aria-label="Previous article page" rel="prev" onClick={event=>navigate(event,page-1)}><ArrowLeft size={26} strokeWidth={1.6} aria-hidden="true"/></a>}
    {Array.from({length:blogPageCount},(_,index)=>index+1).map(number=><a key={number} href={blogPageHref(number)} aria-label={`Article page ${number}`} aria-current={number===page?'page':undefined} onClick={event=>navigate(event,number)}>{number}</a>)}
    {page<blogPageCount&&<a href={blogPageHref(page+1)} aria-label="Next article page" rel="next" onClick={event=>navigate(event,page+1)}><ArrowRight size={26} strokeWidth={1.6} aria-hidden="true"/></a>}
   </nav>
  </div>
 </main></Localized>;
}
