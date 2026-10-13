// Artwork lives in public/assets/qr-templates, outside the JavaScript bundle.
export type CategoryTemplatePreset = {
 art:string; bounds:number[]; eyes:string[]; glyph:string;
 glyphBox:number[]; fill:string; sampleSize:number;
};
const templateFiles:Record<number,string> = {
 "21": "21.7b3c6c7c9b78.json",
 "22": "22.88c977970b8b.json",
 "23": "23.8ceb04751195.json",
 "24": "24.cb75b8ab3401.json",
 "25": "25.535a9475b1d9.json",
 "26": "26.d6ef71d0c3d2.json",
 "27": "27.9a4e03ef1eaf.json",
 "28": "28.aa5f486e89c2.json",
 "29": "29.e7a1c14db780.json",
 "30": "30.76f17df2909d.json",
 "31": "31.ddccb2317da7.json",
 "32": "32.ed858536a313.json",
 "33": "33.b9644a1f12da.json",
 "34": "34.175150e27b80.json",
 "35": "35.594161581166.json",
 "36": "36.22a8f149d17f.json",
 "37": "37.7f83ad10bc44.json",
 "38": "38.96c7017153d4.json",
 "39": "39.24188b290e42.json",
 "40": "40.acc8753caf3d.json",
 "41": "41.996b26d511ba.json",
 "42": "42.2948e092d158.json",
 "43": "43.096b62dc5a37.json",
 "44": "44.1084f72dc9f6.json",
 "45": "45.20882225dfad.json",
 "46": "46.ca6c4a1dd790.json",
 "47": "47.2371a471c066.json",
 "48": "48.8ccb9df234e9.json",
 "49": "49.1c8de75ef24f.json",
 "50": "50.60c878a292e4.json",
 "51": "51.e23b6d7b0e8e.json",
 "52": "52.69e715252204.json",
 "53": "53.af832636eb2a.json",
 "54": "54.3129a4adb54b.json",
 "55": "55.fc06cf23458a.json",
 "56": "56.7be290543b25.json",
 "57": "57.8a71931a5693.json",
 "58": "58.db6966c0e9dc.json",
 "59": "59.63ba85ca9108.json",
 "60": "60.c8434942727a.json",
 "61": "61.5c942d7a932f.json",
 "62": "62.fdba3868dfaa.json",
 "63": "63.f5f7adf7f1d9.json",
 "64": "64.e7c224356110.json",
 "65": "65.c959e6d0a712.json",
 "66": "66.14192df84a5c.json",
 "67": "67.1c71e619fb29.json",
 "68": "68.3ecb30f2cf62.json",
 "69": "69.82920139fa02.json",
 "70": "70.ea0304e72afb.json",
 "71": "71.2f964c2cf1ce.json",
 "72": "72.5ffc1d48bfee.json",
 "73": "73.b864f88e14cb.json",
 "74": "74.f5de9464f1c5.json",
 "75": "75.c94751427f9d.json",
 "76": "76.6bd6d95720eb.json",
 "77": "77.64727b2cf172.json",
 "78": "78.1f456e569030.json",
 "79": "79.4c35a5f22e6e.json",
 "80": "80.955af89e95f5.json",
 "81": "81.05912d8b0fa4.json",
 "82": "82.63d7bfe9d311.json",
 "83": "83.717de5a84fdd.json",
 "84": "84.9329429e93ae.json",
 "85": "85.f8db6287dda5.json",
 "86": "86.3d514a5d4b45.json",
 "87": "87.1cf0c234e5b8.json",
 "88": "88.c10e0fcc4481.json",
 "89": "89.3f7046915a39.json",
 "90": "90.42f33d3e99e5.json",
 "91": "91.1ef4546a356f.json",
 "92": "92.52158f5f1558.json",
 "93": "93.05c005889f29.json",
 "94": "94.26cd27513c7f.json",
 "95": "95.9c316cd21490.json",
 "96": "96.347c09ca4bd4.json",
 "97": "97.a7ed95a39763.json",
 "98": "98.1aad4982a876.json",
 "99": "99.ec20a21463d6.json",
 "100": "100.0cae2380a26e.json",
 "101": "101.5997898574ca.json",
 "102": "102.7323331a8f24.json",
 "103": "103.96be5800a4c4.json",
 "104": "104.067f6e38ca12.json",
 "105": "105.6be4870eef27.json",
 "106": "106.b67a07971e35.json",
 "107": "107.cdcf57a851b4.json",
 "108": "108.9544774b3fc6.json",
 "109": "109.28947b649a18.json",
 "110": "110.b3e616c83a83.json",
 "111": "111.81a210237cfe.json",
 "112": "112.f3ba37d663b8.json",
 "113": "113.77e4cb695e33.json",
 "114": "114.7f6190ebd78d.json",
 "115": "115.aa5a2cbb6ab6.json",
 "116": "116.92cdd5e6d748.json",
 "117": "117.baec84d0a9bf.json",
 "118": "118.972cdf15f97d.json",
 "119": "119.9d059b781351.json",
 "120": "120.7db9342f0842.json"
};
// Retain only templates selected during this session; concurrent requests share a promise.
export const categoryTemplatePresets:Record<number,CategoryTemplatePreset> = {};
const pending = new Map<number,Promise<void>>();
export class TemplateLoadError extends Error {
 constructor(){super('Unable to load this template. Check your connection and retry.');this.name='TemplateLoadError';}
}
export function hasCategoryTemplate(index:number):boolean {
 return Object.prototype.hasOwnProperty.call(templateFiles,index);
}
export function loadCategoryTemplate(index=0):Promise<void> {
 if(!hasCategoryTemplate(index)||categoryTemplatePresets[index])return Promise.resolve();
 const existing=pending.get(index);
 if(existing)return existing;
 const request=(async()=>{
  try {
   const response=await fetch('/assets/qr-templates/'+templateFiles[index]);
   if(!response.ok)throw new TemplateLoadError();
   const preset=await response.json() as CategoryTemplatePreset;
   if(!preset||typeof preset.art!=='string'||!preset.art.includes('__DYNAMIC_QR__')||
      !Array.isArray(preset.bounds)||preset.bounds.length!==3||
      !Array.isArray(preset.eyes)||!Array.isArray(preset.glyphBox)||
      typeof preset.glyph!=='string'||typeof preset.fill!=='string')throw new TemplateLoadError();
   categoryTemplatePresets[index]=preset;
  }catch{throw new TemplateLoadError();}
 })();
 pending.set(index,request);
 void request.then(()=>pending.delete(index),()=>pending.delete(index));
 return request;
}
