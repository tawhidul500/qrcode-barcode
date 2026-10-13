import {trackingTarget} from './statistics';
export type ImportRow={line:number;name:string;url:string;error:string};
export const csvExample='\uFEFFname,url\r\nMy website,https://example.com\r\nContact page,https://example.com/contact\r\n';
export function parseImportCSV(text:string):ImportRow[]{
 if(text.length>10*1024*1024)throw new Error('Choose a CSV file up to 10 MB.');
 const records:{line:number;fields:string[]}[]=[];let fields:string[]=[],field='',quoted=false,closed=false,line=1,start=1;
 text=text.replace(/^\uFEFF/,'');
 const endField=()=>{fields.push(field);field='';closed=false;};
 const endRow=()=>{endField();if(fields.some(f=>f.trim()))records.push({line:start,fields});fields=[];start=line+1;if(records.length>51)throw new Error('Import up to 50 QR codes at a time.');};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else{field+=c;if(c==='\n')line++;}continue;}
  if(c===','){endField();continue;}
  if(c==='\n'||c==='\r'){endRow();if(c==='\r'&&text[i+1]==='\n')i++;line++;continue;}
  if(closed){if(!/\s/.test(c))throw new Error(`Unexpected character after a quoted field at line ${line}.`);continue;}
  if(c==='"'){if(field)throw new Error(`Unexpected quote at line ${line}.`);quoted=true;}else field+=c;
 }
 if(quoted)throw new Error('A quoted field is not closed.');
 if(field||fields.length||closed)endRow();
 if(records.length<2)throw new Error('Add a header and at least one link to your CSV.');
 const header=records.shift()!.fields.map(f=>f.trim().toLowerCase());
 if(new Set(header).size!==header.length)throw new Error('CSV headers must be unique.');
 const urlIndex=header.findIndex(f=>f==='url'||f==='link'),nameIndex=header.findIndex(f=>f==='name'||f==='title');
 if(urlIndex<0)throw new Error('Your CSV needs a url or link column. Download the example.');
 return records.map((record,i)=>{
  const name=(nameIndex<0?'QR Code '+(i+1):record.fields[nameIndex]?.trim())||'QR Code '+(i+1);let url=record.fields[urlIndex]?.trim()||'',error='';
  try{if(record.fields.length!==header.length)throw new Error('Column count does not match the header.');if(name.length>80)throw new Error('Name must be 80 characters or fewer.');url=trackingTarget(url);}catch(e){error=e instanceof Error?e.message:'Invalid link.';}
  return {line:record.line,name,url,error};
 });
}
