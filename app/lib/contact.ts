export type ContactValues={name:string;email:string;message:string};
export type ContactErrors=Partial<Record<keyof ContactValues,string>>;
export const contactLimits={name:120,email:254,message:5000} as const;

export function validateContact(values:ContactValues):ContactErrors{
 const errors:ContactErrors={};
 if(!values.name.trim())errors.name='Please enter your name.';
 else if(values.name.trim().length>contactLimits.name)errors.name='Name must be 120 characters or fewer.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())||values.email.trim().length>contactLimits.email)errors.email='Please enter a valid email address.';
 if(!values.message.trim())errors.message='Please enter your message.';
 else if(values.message.trim().length>contactLimits.message)errors.message='Message must be 5000 characters or fewer.';
 return errors;
}

/** Phase-two adapter: no request is made until an endpoint is explicitly configured.
 * The endpoint must return a successful HTTP status and JSON {accepted:true}.
 * A static-host fallback returning 200 HTML must never look like a delivered message. */
export async function deliverContact(values:ContactValues,endpoint:string|undefined,signal?:AbortSignal):Promise<'unavailable'|'accepted'|'unconfirmed'>{
 if(!endpoint?.trim())return 'unavailable';
 if(Object.keys(validateContact(values)).length)return 'unconfirmed';
 try{
  const response=await fetch(endpoint.trim(),{
   method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
   credentials:'omit',signal,
   body:JSON.stringify({name:values.name.trim(),email:values.email.trim(),message:values.message.trim()})
  });
  if(!response.ok)return 'unconfirmed';
  const result:unknown=await response.json();
  return result!==null&&typeof result==='object'&&'accepted' in result&&result.accepted===true?'accepted':'unconfirmed';
 }catch{return 'unconfirmed';}
}
