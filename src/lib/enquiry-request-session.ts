type Storage = Pick<globalThis.Storage, 'getItem'|'setItem'|'removeItem'>;
export type EnquiryReceipt = {enquiry:{public_ref:string;status:string}};
type Pending = {id:string;fingerprint:string;receipt?:EnquiryReceipt;conversionAttempted?:boolean};
export const ENQUIRY_REQUEST_STORAGE='navigeto:enquiry-request:v1';
const fields=['enquiry_type','customer_name','whatsapp','customer_whatsapp','email','nationality','subject','travel_start_date','travel_end_date','pax','notes','details','consent_contact'];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function receipt(value:unknown):EnquiryReceipt {
 const e=(value as EnquiryReceipt)?.enquiry;
 if(!e || typeof e.public_ref!=='string' || !e.public_ref || typeof e.status!=='string' || !e.status)throw new Error('We could not confirm the response. Retry with the same details.');
 return {enquiry:{public_ref:e.public_ref,status:e.status}};
}
function stable(value:unknown):unknown {
 if(Array.isArray(value))return value.map(stable);
 if(value && typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable((value as Record<string,unknown>)[k])]));
 return value;
}
/** One enquiry intent per tab. Persist identifiers/digests/receipt, never contacts or form data. */
export class EnquiryRequestSession {
 private busy=false;
 private storage:()=>Storage;
 constructor(storage:()=>Storage){this.storage=storage;}
 private read():Pending|null {
  try {
   const raw=this.storage().getItem(ENQUIRY_REQUEST_STORAGE);if(raw===null)return null;
   const value=JSON.parse(raw) as Pending;
   if(!value || typeof value.id!=='string' || !uuid.test(value.id) || typeof value.fingerprint!=='string' || !/^[a-f0-9]{64}$/.test(value.fingerprint))throw new Error();
   if(value.receipt)value.receipt=receipt(value.receipt);
   return value;
  }catch{throw new Error('Enquiry recovery storage is unavailable or invalid. Enable browser storage, or contact Navigeto before starting a separate request.');}
 }
 private write(pending:Pending){const text=JSON.stringify(pending);this.storage().setItem(ENQUIRY_REQUEST_STORAGE,text);if(this.storage().getItem(ENQUIRY_REQUEST_STORAGE)!==text)throw new Error('Storage write failed');}
 startSeparateRequest(){
  if(this.busy)throw new Error('Please wait for the current request to finish.');
  this.storage().removeItem(ENQUIRY_REQUEST_STORAGE);
  if(this.storage().getItem(ENQUIRY_REQUEST_STORAGE)!==null)throw new Error('Could not reset enquiry recovery storage.');
 }
 async submit(payload:Record<string,unknown>,send:(payload:Record<string,unknown>)=>Promise<EnquiryReceipt>,validateNew:()=>void=()=>{},onReceipt:(value:EnquiryReceipt)=>void=()=>{}) {
  if(this.busy)throw new Error('Your enquiry is already being sent.');
  this.busy=true;
  try {
   // Snapshot before awaiting: later UI edits cannot alter this send.
   const text=JSON.stringify(Object.fromEntries(fields.map(k=>[k,payload[k]??null])));
   if(text.length>60000)throw new Error('Please shorten your enquiry details.');
   const snapshot=JSON.parse(text) as Record<string,unknown>;
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(snapshot))));
   const fingerprint=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
   let pending=this.read();
   if(pending && pending.fingerprint!==fingerprint)throw new Error('An earlier enquiry has different details. Restore those details to retry, or explicitly start a separate enquiry. The earlier request may already have been received.');
   if(pending?.receipt)return pending.receipt;
   if(!pending){validateNew();pending={id:crypto.randomUUID(),fingerprint};try{this.write(pending);}catch{throw new Error('Enable browser storage before submitting so this enquiry can be retried safely.');}}
   const result=receipt(await send({...snapshot,request_id:pending.id}));
   const alreadyTracked=pending.conversionAttempted===true;let marked=false;
   // Mark before optional analytics. A failed marker skips tracking, while the
   // previously persisted key still permits safe recovery from the server.
   try{this.write({...pending,receipt:result,conversionAttempted:true});marked=true;}catch{/* Preserve original pending identity. */}
   if(marked && !alreadyTracked){try{onReceipt(result);}catch{/* Optional analytics must not fail the enquiry. */}}
   return result;
  }finally{this.busy=false;}
 }
}
