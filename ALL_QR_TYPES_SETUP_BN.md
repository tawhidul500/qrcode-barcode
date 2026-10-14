# সব QR type চালু করার নির্দেশিকা

আগের নীল ডিজাইন রাখা হয়েছে। ৭৮টি type এখন উপযুক্ত structured input, hosted page অথবা public link ব্যবহার করে। আপনার বর্তমান Neon + Supabase + Vercel সংযোগ রেখেই এই setup করুন।

## ১. Neon database আপডেট

1. Neon dashboard → আপনার project → SQL Editor খুলুন।
2. এই ZIP-এর `database/upgrade-hosted-content.sql` খুলে সম্পূর্ণ SQL copy করুন।
3. সঠিক database/branch নির্বাচন করে paste → Run করুন।
4. আগের saved-code, statistics ও management setup আগে সম্পন্ন থাকতে হবে। একেবারে নতুন database হলে শুধু `database/schema.sql` সম্পূর্ণ চালান; এতে নতুন migration-ও আছে।

## ২. Supabase private file storage

1. যে Supabase project দিয়ে আপনার website-এ login হয়, সেটি খুলুন।
2. SQL Editor → New query।
3. `database/supabase-content-storage.sql` সম্পূর্ণ paste → Run করুন। **এই SQL Neon-এ চালাবেন না।**
4. Storage-এ `qr-content` bucket দেখবেন। এটি Private থাকবে। Public করবেন না। প্রতি file সর্বোচ্চ 10 MB; account প্রতি 50টি upload। MFA চালু থাকলে upload/read/delete করতে MFA verification লাগবে।

## ৩. Vercel environment variable

1. Supabase Project Settings → API Keys থেকে server-side legacy `service_role` key copy করুন। Publishable/anon key এই নতুন variable-এ ব্যবহার করবেন না।
2. Vercel → আপনার project → Settings → Environment Variables খুলুন।
3. Name: `SUPABASE_SERVICE_ROLE_KEY`; Value: copy করা key। এটি server-only। নামের আগে `NEXT_PUBLIC_` যোগ করবেন না; GitHub বা chat-এ key দেবেন না।
4. Environment-এ **Production** নির্বাচন করুন। এর অর্থ আপনার আসল live website। **Preview** অর্থ GitHub branch/PR-এর temporary test website; সেখানেও feature পরীক্ষা করতে চাইলে Preview-ও নির্বাচন করুন। Save করুন।
5. আগের `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` রাখুন। Supabase URL ও service role key একই project-এর হতে হবে।
6. `SITE_URL` রাখুন `https://qrcode-barcode-peach.vercel.app`। নিজের domain ব্যবহার করলে সেই origin দিন, শেষে page path নয়।
7. ঐচ্ছিক `CONTENT_COOKIE_SECRET`: একটি দীর্ঘ random secret দিন, যেমন `openssl rand -hex 32` দিয়ে তৈরি value। খালি রাখলে server `DATABASE_URL` ব্যবহার করে। Secret বদলালে আগের password-unlock cookie বাতিল হবে।

## ৪. Code upload এবং redeploy

1. ZIP extract করে আপনার GitHub repository-তে updated source files দিন। পুরোনো source-এর জায়গায় নতুন source দিন; শুধু একটি component দিলে হবে না।
2. `node_modules`, `.next` এবং নিজের secret-সহ `.env` upload করবেন না। `.env.example` শুধু example।
3. GitHub commit করুন → Vercel deployment শেষ হতে দিন। Environment variable পরে যোগ করলে Deployments → latest deployment → Redeploy করুন।

## ৫. ব্যবহার

- Email/SMS/WhatsApp: recipient ও message লিখুন; Email-এ subject-ও আছে। Direct action বা Hosted message page বেছে নিতে পারবেন।
- Text: short plain text অথবা বড় formatted hosted page।
- Contacts/Vcard: নাম, company, job title, phone, email, website ও address। Wi-Fi-তে hidden network আছে।
- Location: address অথবা latitude/longitude। Calendar/Event: title, date/time, location, description।
- UPI: VPA, payee, amount, note। Crypto: Bitcoin/Ethereum address অথবা checkout link। Product: product URL অথবা validated GTIN। GA/UTM: campaign parameters।
- PDF/Image/Audio/Video/Word/PPTX/Excel/Any File: public file URL অথবা signed-in private upload। Upload-এর পরে title/description, চাইলে password/expiry দিন → **Publish page & generate QR** → Download।
- Link List, Mini Website, Menu, Invoice, Business Page, Coupon, Playlist, All-in-one Payment: নির্দিষ্ট fields পূরণ → Publish → Download। Menu/Invoice/link lists-এ form-এর দেখানো `|` format অনুসরণ করুন।
- Smart App, Geo/Time Targeting, Traffic Split এবং Custom URL: destination/fallback ও rules দিন → Publish। Hosted time rules-এর সময় UTC; native calendar browser-এর local time নেয়। Country routing hosting header ব্যবহার করে।
- Social/app-store/review/payment/Forms/Booking type-এ আপনার ওই service-এর public URL দিন। Forms বা Booking এখানে নতুন survey/scheduling service তৈরি করে না। Logo/Shaped type-এর destination দিন, তারপর আগের design controls দিয়ে logo/template/shape নির্বাচন করুন।
- Login অবস্থায় Download করলে QR আগের মতো automatically My Codes-এ save হবে। Hosted page তৈরি করা এবং QR image download/save দুটি আলাদা ধাপ।
- Profile → **Hosted Content** থেকে edit, unpublish, delete এবং unused uploads manage করুন। Edit-এর পর Publish করলে একই QR link নতুন content দেখাবে। নতুন image দরকার হলে আবার Download করুন।

## সীমা ও গুরুত্বপূর্ণ আচরণ

- Plain Text: 1000 UTF-8 bytes। Hosted formatted text editor: 100,000 UTF-8 bytes। Hosted action message: 5000 characters। Direct QR-এ capacity ছাড়ালে ছোট করুন অথবা Hosted mode নিন।
- Account প্রতি 50 hosted pages, 50 uploaded files এবং আগের 50 saved codes পৃথক সীমা। Supabase/Neon free-plan project quota-ও প্রযোজ্য।
- Private bucket মানে file-এর সরাসরি স্থায়ী public URL নেই। Published page URL যার কাছে আছে সে খুলতে পারে, যদি password/expiry না থাকে। Password 8–128 characters; server-এ hash হিসেবে রাখা হয়।
- Unlock cookie এক ঘণ্টা। Inline media signed URL সর্বোচ্চ এক ঘণ্টা কাজ করতে পারে। Unpublish/delete/expiry আগে download করা file ফিরিয়ে নিতে পারে না।
- Saved QR copy করলে একই published page share হয়। আলাদা content চাইলে **Create separate page** ব্যবহার করে Publish করুন। Private-upload page account transfer বন্ধ রাখা হয়েছে; non-file hosted page transfer ownership বদলায়।
- Conditional visit limit page opens গণনা করে; প্রতিটি open যে physical QR scan, তা ধরে না। QR scanner প্রথমে আপনার hosted website domain দেখাতে পারে; page খোলার পরে redirect/app action কাজ করে।
- পুরোনো public URL-এর saved QR ও আগের template/export design রাখা হয়েছে।

পরীক্ষা: 44 automated regression checks, TypeScript এবং production build। বাস্তব provider-এ চালু হওয়ার জন্য উপরোক্ত SQL ও environment setup আপনার project-এ করতে হবে।
