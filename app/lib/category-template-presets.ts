// Artwork lives in public/assets/qr-templates, outside the JavaScript bundle.
export type CategoryTemplatePreset = {
 art:string; bounds:number[]; eyes:string[]; glyph:string;
 glyphBox:number[]; fill:string; sampleSize:number;backgroundArt?:string;logoBounds?:number[]|null;
};
const templateFiles:Record<number,string> = {
 "21": "21.d2a9ce30d68c.json",
 "22": "22.b89c64cc02da.json",
 "23": "23.29a1db63aa35.json",
 "24": "24.daff21941b90.json",
 "25": "25.7ca204add6af.json",
 "26": "26.00abc0aec132.json",
 "27": "27.8ba689aee330.json",
 "28": "28.dd94d7ca8bb9.json",
 "29": "29.c3c2df5662ad.json",
 "30": "30.cd6a62eab608.json",
 "31": "31.461577112a9b.json",
 "32": "32.0ab0e26ef386.json",
 "33": "33.520054e61c53.json",
 "34": "34.c2f089e3d565.json",
 "35": "35.88c1695d9fb0.json",
 "36": "36.41bafe84b8c8.json",
 "37": "37.5db483a7ca98.json",
 "38": "38.ed7f5da16e49.json",
 "39": "39.2c616fd9c481.json",
 "40": "40.951ab2a12df6.json",
 "41": "41.24f5ee308a9a.json",
 "42": "42.3238e563fb95.json",
 "43": "43.5f9ec2b29551.json",
 "44": "44.90f3a4cb2385.json",
 "45": "45.6eb3f9950795.json",
 "46": "46.8c4c01d5867c.json",
 "47": "47.96802efd36d0.json",
 "48": "48.9debaedfd81c.json",
 "49": "49.dac87b0c7859.json",
 "50": "50.0d9381a40b2b.json",
 "51": "51.0eb712e523c7.json",
 "52": "52.4cfd0be12c4b.json",
 "53": "53.e708ee83c9fd.json",
 "54": "54.45ec4a810f52.json",
 "55": "55.29f3a42165cd.json",
 "56": "56.2d14e94cc17f.json",
 "57": "57.d36c6ab50d5b.json",
 "58": "58.dd5f293fd2f1.json",
 "59": "59.bd2936d5b871.json",
 "60": "60.1eecaa93f283.json",
 "61": "61.45601d476b81.json",
 "62": "62.bcad0b7be7aa.json",
 "63": "63.93bd2028a329.json",
 "64": "64.53c1efb3cb56.json",
 "65": "65.911bf6fcd61e.json",
 "66": "66.13f57be49a70.json",
 "67": "67.53da09315586.json",
 "68": "68.17f29a845080.json",
 "69": "69.051b215d1ede.json",
 "70": "70.6426ba12b485.json",
 "71": "71.5e3dd98d0f40.json",
 "72": "72.87cb75677f9e.json",
 "73": "73.ab25b03f312d.json",
 "74": "74.f34132cbd414.json",
 "75": "75.ef9f3a985fff.json",
 "76": "76.59118cd76df1.json",
 "77": "77.2b39e980e64b.json",
 "78": "78.e8ec4461c2ee.json",
 "79": "79.98aa42689bc8.json",
 "80": "80.0c4ee7c21f05.json",
 "81": "81.f57cceaf92a0.json",
 "82": "82.266beaf7abea.json",
 "83": "83.806828a54bf0.json",
 "84": "84.7e6d74ab343c.json",
 "85": "85.8d2b2a62c33e.json",
 "86": "86.149d3174b379.json",
 "87": "87.845ca20b0294.json",
 "88": "88.3a7af939ba0d.json",
 "89": "89.3ed7ab50cbb4.json",
 "90": "90.b323f41b226c.json",
 "91": "91.5994ed203d9a.json",
 "92": "92.729ba2e86328.json",
 "93": "93.a4fa9ffca644.json",
 "94": "94.b5207fdb85c8.json",
 "95": "95.3a104128cf23.json",
 "96": "96.37bb4ef65c5f.json",
 "97": "97.d726bff41b6e.json",
 "98": "98.709aebcb3e3f.json",
 "99": "99.4b205dd2c228.json",
 "100": "100.56aed303bc87.json",
 "101": "101.67a1bd111b4e.json",
 "102": "102.de85eff7234b.json",
 "103": "103.1b63d8618f88.json",
 "104": "104.ed56bee21be8.json",
 "105": "105.889804303a79.json",
 "106": "106.d3049f10f52d.json",
 "107": "107.629138730fa0.json",
 "108": "108.f58a19c45936.json",
 "109": "109.e4a9400bad0b.json",
 "110": "110.69a21349c6de.json",
 "111": "111.b6c72246aab5.json",
 "112": "112.adc007940bbf.json",
 "113": "113.dec98bedd0e4.json",
 "114": "114.c53ceaee6a10.json",
 "115": "115.484cd4b83044.json",
 "116": "116.22320d703235.json",
 "117": "117.a2185e7626a1.json",
 "118": "118.9e25bb5769fe.json",
 "119": "119.552b51ae1a93.json",
 "120": "120.c0d17370c6dc.json"
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
