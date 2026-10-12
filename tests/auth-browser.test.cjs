/* Start dev server with test-only values (never deploy them):
NEXT_PUBLIC_SUPABASE_URL=https://auth.example.test NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=public-test-key NEXT_PUBLIC_AUTH_GOOGLE=true NEXT_PUBLIC_AUTH_FACEBOOK=true NEXT_PUBLIC_AUTH_APPLE=true npm run dev
Then: npm run test:auth-browser
Requires: npx playwright install chromium
*/
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const origin=process.env.AUTH_TEST_ORIGIN||'http://localhost:3000';
const user={id:'00000000-0000-0000-0000-000000000001',aud:'authenticated',role:'authenticated',email:'reader@example.com',app_metadata:{provider:'email'},user_metadata:{full_name:'Reader'},created_at:new Date().toISOString()};
const session={access_token:'test-access-token',refresh_token:'test-refresh-token',expires_in:3600,token_type:'bearer',user};
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext();const page=await context.newPage();const errors=[];const requests=[];let rejectLogin=false;
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://auth.example.test/**',async route=>{
   const request=route.request(),url=new URL(request.url());const body=request.postDataJSON();requests.push({url,body});
   if(url.pathname.endsWith('/authorize'))return route.fulfill({status:200,contentType:'text/html',body:'<h1>Mock identity provider</h1>'});
   let data={};
   if(url.pathname.endsWith('/signup'))data={user,session:null};
   if(url.pathname.endsWith('/token')){if(rejectLogin)return route.fulfill({status:400,json:{code:'invalid_credentials',msg:'Invalid login credentials'}});data=session;}
   if(url.pathname.endsWith('/user'))data=user;
   if(url.pathname.endsWith('/logout'))return route.fulfill({status:204});
   return route.fulfill({status:200,json:data});
  });
  await page.goto(origin+'/signup');
  await page.locator('#full-name').fill('Reader');await page.locator('#email').fill(user.email);await page.locator('#password').fill('long enough password');await page.locator('#confirm-password').fill('different password');
  await page.locator('button[type=submit]').click();await page.getByRole('alert').filter({hasText:'do not match'}).waitFor();assert(!requests.some(r=>r.url.pathname.endsWith('/signup')));
  await page.locator('#confirm-password').fill('long enough password');await page.locator('button[type=submit]').click();await page.getByRole('status').filter({hasText:'Check your inbox'}).waitFor();assert(requests.some(r=>r.url.pathname.endsWith('/signup')));
  await page.goto(origin+'/login');rejectLogin=true;await page.locator('#email').fill(user.email);await page.locator('#password').fill('incorrect password');await page.locator('button[type=submit]').click();await page.getByRole('alert').filter({hasText:'incorrect'}).waitFor();
  rejectLogin=false;await page.locator('#password').fill('long enough password');await page.locator('button[type=submit]').click();await page.waitForURL('**/account');await page.getByText(user.email,{exact:true}).waitFor();
  await page.reload();await page.getByText(user.email,{exact:true}).waitFor();await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForURL('**/login');
  await page.goto(origin+'/forgot-password');await page.locator('#reset-email').fill(user.email);await page.getByRole('button',{name:'Send reset link'}).click();await page.getByRole('status').filter({hasText:'If an account exists'}).waitFor();
  await page.goto(origin+'/auth/callback?code=browser-reset-code&next=/reset-password');await page.waitForURL('**/reset-password');await page.locator('#new-password').fill('replacement password');await page.locator('#confirm-password').fill('replacement password');await page.getByRole('button',{name:'Update password'}).click();await page.getByRole('status').filter({hasText:'password has been updated'}).waitFor();
  await page.goto(origin+'/auth/callback?error=access_denied');await page.getByRole('alert').waitFor();assert.equal(new URL(page.url()).search,'');
  for(const provider of ['Google','Facebook','Apple']){
   await page.goto(origin+'/login');await page.getByRole('button',{name:'Sign in with '+provider,exact:true}).click();await page.waitForURL('https://auth.example.test/**');const url=new URL(page.url());assert.equal(url.searchParams.get('provider'),provider.toLowerCase());assert(url.searchParams.get('code_challenge'));
  }
  for(const width of [375,768,1440]){await page.setViewportSize({width,height:900});await page.goto(origin+'/signup');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'horizontal overflow at '+width);}
  assert.deepEqual(errors,[]);
  console.log('PASS: browser signup validation/confirmation, rejected and successful login, persistent session, logout, recovery callback/password update, rejected callback, three OAuth redirects, and responsive widths. Mock backend only.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
