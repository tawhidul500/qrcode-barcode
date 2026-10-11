import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildPayload,emptyContact} from '../app/lib/qr-content.ts';
import {renderQR,renderQRWithTemplate,defaultDesign,templateFiles} from '../app/lib/qr-design.ts';
const wifi={ssid:'',password:'',security:'WPA'};
test('blank content cannot generate sample codes',()=>{
 for(const type of ['Website','Text','Phone','Email','Wi-Fi','Contacts'])assert.throws(()=>buildPayload(type,'',wifi,emptyContact));
});
test('invalid destinations, email and phone numbers are rejected',()=>{
 for(const [type,value] of [['Website','javascript:alert(1)'],['Instagram','profile-name'],['Email','bad@'],['Phone','abc'],['WhatsApp','123']])assert.throws(()=>buildPayload(type,value,wifi,emptyContact));
});
test('phone and Wi-Fi payloads use normalized and escaped values',()=>{
 assert.equal(buildPayload('Phone','+880 1700-000000',wifi,emptyContact),'tel:+8801700000000');
 assert.equal(buildPayload('Wi-Fi','',{ssid:'Office;WiFi',password:'ignored',security:'nopass'},emptyContact),'WIFI:T:nopass;S:Office\\;WiFi;P:;;');
});
test('structured vCards escape content and validate optional fields',()=>{
 const card=buildPayload('Contacts','',wifi,{...emptyContact,name:'Alice; Smith',phone:'+8801700000000'});
 assert.ok(card.includes('FN:Alice\\; Smith\r\nTEL:+8801700000000'));
 assert.throws(()=>buildPayload('Vcard','',wifi,{...emptyContact,name:'Alice',email:'bad'}));
});
test('captions escape SVG markup and custom logos remain in templates',async()=>{
 const design={...defaultDesign,caption:'<script>&',foreground:'#123456',logo:'data:image/png;base64,AA=='};
 const svg=renderQR('https://example.com',design);
 assert.ok(svg.includes('&lt;script&gt;&amp;'));assert.ok(!svg.includes('<script>'));
 const artwork=await readFile(new URL('../public/assets/svg/'+templateFiles[1],import.meta.url),'utf8');
 const templated=renderQR('https://example.com',{...design,templateIndex:1},1000,artwork);
 assert.ok(templated.includes('#123456'));assert.ok(templated.includes(design.logo));assert.ok(templated.includes('&lt;script&gt;'));
});
test('template loading is cached and retries failed requests',async()=>{
 let calls=0;
 globalThis.fetch=async()=>{calls++;return {ok:calls>1,text:async()=>'<svg width="88" height="88" viewBox="0 0 88 88"></svg>'};};
 const design={...defaultDesign,templateIndex:2};
 await assert.rejects(renderQRWithTemplate('hello',design));
 await renderQRWithTemplate('hello',design);await renderQRWithTemplate('world',design);
 assert.equal(calls,2);
});
