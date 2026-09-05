import test from 'node:test';
import assert from 'node:assert/strict';
import {EnquiryRequestSession,ENQUIRY_REQUEST_STORAGE} from './enquiry-request-session.ts';
const payload={enquiry_type:'general',customer_name:'Fixture only',whatsapp:'fixture',details:{b:2,a:[1,2]}};
const response={enquiry:{public_ref:'FIXTURE-1',status:'new'}};
function setup(){const data=new Map<string,string>();const storage={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};return {data,storage,session:new EnquiryRequestSession(()=>storage)};}
test('lost response and refresh reuse exact ID; never persist contacts',async()=>{
 const {session,storage,data}=setup();let id:unknown;
 await assert.rejects(session.submit(payload,async p=>{id=p.request_id;throw Error('lost response');}));
 assert.ok(!data.get(ENQUIRY_REQUEST_STORAGE)?.includes('Fixture only'));
 assert.ok(!data.get(ENQUIRY_REQUEST_STORAGE)?.includes('customer_name'));
 const refreshed=new EnquiryRequestSession(()=>storage);
 assert.deepEqual(await refreshed.submit(payload,async p=>{assert.equal(p.request_id,id);return response;},()=>{throw Error('must not revalidate pending');}),response);
});
test('synchronous duplicate call and reset blocked during send',async()=>{
 const {session}=setup();let release:()=>void=()=>{};const gate=new Promise<void>(r=>{release=r;});
 const first=session.submit(payload,async()=>{await gate;return response;});
 await assert.rejects(session.submit(payload,async()=>response),/already being sent/);
 assert.throws(()=>session.startSeparateRequest(),/wait/);release();await first;
});
test('edited details blocked until explicit new intent',async()=>{
 const {session}=setup();let id:unknown;
 await assert.rejects(session.submit(payload,async p=>{id=p.request_id;throw Error('lost');}));
 await assert.rejects(session.submit({...payload,details:{a:[2,1],b:2}},async()=>response),/different details/);
 session.startSeparateRequest();await session.submit(payload,async p=>{assert.notEqual(p.request_id,id);return response;});
});
test('nested key order does not rotate intent; array order does',async()=>{
 const {session}=setup();let id:unknown;
 await assert.rejects(session.submit(payload,async p=>{id=p.request_id;throw Error('lost');}));
 await session.submit({...payload,details:{a:[1,2],b:2}},async p=>{assert.equal(p.request_id,id);return response;});
});
test('successful receipt is cached and conversion attempted only once across refresh',async()=>{
 const {session,storage}=setup();let sends=0,conversions=0;
 await session.submit(payload,async()=>{sends++;return {...response,private_field:'stripped'};},()=>{},()=>{conversions++;throw Error('optional tracker');});
 assert.deepEqual(await new EnquiryRequestSession(()=>storage).submit(payload,async()=>{sends++;return response;},()=>{},()=>{conversions++;}),response);
 assert.equal(sends,1);assert.equal(conversions,1);
});
test('storage read/write/corruption fail before network',async()=>{
 for(const mode of ['read','write','corrupt']){
  const {storage}=setup();if(mode==='read')storage.getItem=()=>{throw Error();};if(mode==='write')storage.setItem=()=>{throw Error();};if(mode==='corrupt')storage.setItem(ENQUIRY_REQUEST_STORAGE,'{bad');
  let sent=false;await assert.rejects(new EnquiryRequestSession(()=>storage).submit(payload,async()=>{sent=true;return response;}),/storage/i);assert.equal(sent,false);
 }
});
test('failed success-cache write keeps original key and skips analytics',async()=>{
 const {session,storage}=setup();const original=storage.setItem;let id:unknown,tracking=0;
 await session.submit(payload,async p=>{id=p.request_id;storage.setItem=()=>{throw Error('quota');};return response;},()=>{},()=>{tracking++;});
 assert.equal(tracking,0);storage.setItem=original;
 await new EnquiryRequestSession(()=>storage).submit(payload,async p=>{assert.equal(p.request_id,id);return response;});
});
test('malformed response does not discard identity',async()=>{
 const {session}=setup();let id:unknown;
 await assert.rejects(session.submit(payload,async p=>{id=p.request_id;return {} as typeof response;}),/confirm/);
 await session.submit(payload,async p=>{assert.equal(p.request_id,id);return response;});
});
test('payload is snapshotted before hashing; consent changes are distinct',async()=>{
 const {session}=setup();const input={...payload,customer_name:'Original',details:{a:1},consent_contact:false};
 const first=session.submit(input,async p=>{assert.equal(p.customer_name,'Original');assert.deepEqual(p.details,{a:1});return response;});
 input.customer_name='Edited';input.details.a=2;await first;
 await assert.rejects(session.submit({...payload,customer_name:'Original',details:{a:1},consent_contact:true},async()=>response),/different details/);
});
test('new validation failure sends nothing and leaves no key',async()=>{
 const {session,data}=setup();await assert.rejects(session.submit(payload,async()=>response,()=>{throw Error('invalid date');}),/invalid date/);assert.equal(data.size,0);
});
