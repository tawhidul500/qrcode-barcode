'use client';
import {Localized} from './i18n/LanguageProvider';
import {backgroundImages} from '../lib/background-images';
import {qrTypes} from '../lib/qr-types';
import {templateDesign,type QRDesign} from '../lib/qr-design';

const colors=['#ef4444','#f97316','#facc15','#4ade80','#3b82f6','#ef3998','#f43f5e','#84cc16','#d97706','#a600dc','#073477','#000000','#cf0069'];
const gradients=[['#ff0000','#ffb13b'],['#ef008b','#3366ff'],['#b765ff','#17082c'],['#ed7512','#ffee42'],['#4caf50','#c7ff49'],['#ff1ede','#590042'],['#001aff','#05efcf'],['#8e69ff','#05de51'],['#cd66ff','#7300b8'],['#ff0000','#290000'],['#544600','#ffe659'],['#0056ff','#170019'],['#f40083','#240000']];
const sections=[['foreground','Foreground'],['eyeColor','Eye color'],['background','Background']] as const;

export default function ColorControls({design,onChange}:{design:QRDesign;onChange:(d:QRDesign)=>void}){
 const update=(key:'foreground'|'background'|'eyeColor',value:string,gradient='')=>{
  if(key==='eyeColor'){
   onChange({...design,eyeColor:value,eyeColorEdited:true});
   return;
  }
  onChange({...design,[key]:value,[key+'Gradient']:gradient,[key+'Edited']:true,...(key==='foreground'&&!design.eyeColorEdited?{eyeColor:value}:{})});
 };
 const resetEyeColor=()=>onChange({...design,eyeColorEdited:false,eyeColor:design.foregroundEdited?design.foreground:templateDesign(design.templateIndex||0).eyeColor});

 return <Localized><div className="qr-palette">{sections.map(([key,title])=>{
  const eyeSection=key==='eyeColor';
  const label=eyeSection?'eye':key;
  const gradientKey=key==='background'?'backgroundGradient':'foregroundGradient';
  const selected=(color:string)=>design[key]===color&&(eyeSection?design.eyeColorEdited:!design[gradientKey]);
  return <section key={key}>
   <h3>{title}</h3>
   {eyeSection&&<p>Change the color of all three corner eyes.</p>}
   <p>Color</p>
   <div className="qr-palette-row">
    <button className="qr-none" aria-label={eyeSection?'Reset eye color':'Reset '+key} onClick={()=>eyeSection?resetEyeColor():update(key,key==='foreground'?'#000000':'#ffffff')}>⊘</button>
    <label className="qr-rainbow"><input aria-label={'Custom '+label+' color'} type="color" value={design[key]} onChange={event=>update(key,event.target.value)}/></label>
    {colors.map(color=><button key={color} style={{background:color}} className={selected(color)?'active':''} aria-label={label+' color '+color} aria-pressed={selected(color)} onClick={()=>update(key,color)}/>)}
   </div>
   {!eyeSection&&<>
    <p>Gradient</p>
    <div className="qr-palette-row">
     <button className="qr-none" aria-label={'Remove '+key+' gradient'} onClick={()=>update(key,design[key])}>⊘</button>
     {gradients.map(([a,b])=><button key={a+b} style={{background:`linear-gradient(${a},${b})`}} className={design[gradientKey]===b&&design[key]===a?'active':''} aria-label={key+' gradient '+a+' to '+b} onClick={()=>update(key,a,b)}/>)}
    </div>
   </>}
   {key==='background'&&<>
    <p>Image</p>
    <div className="qr-palette-row">
     <button className="qr-none" aria-label="Remove background image" onClick={()=>onChange({...design,backgroundImage:''})}>⊘</button>
     {qrTypes.filter(([,file])=>Boolean(backgroundImages[file])).map(([name,file])=><button key={name} aria-label={name+' background image'} className={design.backgroundImage===file?'active':''} onClick={()=>onChange({...design,backgroundImage:file})}><img src={'/assets/svg/'+file} alt=""/></button>)}
    </div>
   </>}
  </section>;
 })}</div></Localized>;
}
