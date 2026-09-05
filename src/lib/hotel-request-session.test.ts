import assert from "node:assert/strict";
import test from "node:test";
import { HotelRequestSession, HOTEL_REQUEST_STORAGE } from "./hotel-request-session.ts";
const payload={rate_id:"fixture",checkin:"2028-01-01",checkout:"2028-01-02",customer_name:"Private Name",customer_whatsapp:"Private Phone",rooms:1,adults:2,children:0,occupancy:"double"};
const result={booking:{public_ref:"TEST-1",total_amount:120,currency:"USD"}};
function storage(){const data=new Map<string,string>();return {getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};}
test("lost response and refresh reuse the same key without storing contacts",async()=>{
 const store=storage();const sent:unknown[]=[];
 await assert.rejects(new HotelRequestSession(()=>store).submit(payload,()=>{},async p=>{sent.push(p.request_id);throw new Error("Network lost");}));
 const raw=store.getItem(HOTEL_REQUEST_STORAGE)!;assert.ok(!raw.includes("Private"));assert.ok(!raw.includes("2028"));
 const recovered=await new HotelRequestSession(()=>store).submit(payload,()=>{throw new Error("Freshness check must not block retry");},async p=>{sent.push(p.request_id);return result;});
 assert.deepEqual(recovered,result);assert.equal(sent[0],sent[1]);
});
test("completed refresh recovers receipt without network or a new intent",async()=>{
 const store=storage();await new HotelRequestSession(()=>store).submit(payload,()=>{},async()=>result);
 assert.deepEqual(await new HotelRequestSession(()=>store).submit(payload,()=>{throw Error();},async()=>{throw Error();}),result);
});
test("editing uncertain details is blocked until explicit separate request",async()=>{
 const store=storage();const session=new HotelRequestSession(()=>store);let id:unknown;
 await assert.rejects(session.submit(payload,()=>{},async p=>{id=p.request_id;throw Error();}));
 await assert.rejects(session.submit({...payload,adults:1},()=>{},async()=>{throw Error("must not send");}),/different details/);
 session.startSeparateRequest();await session.submit({...payload,adults:1},()=>{},async p=>{assert.notEqual(p.request_id,id);return result;});
});
test("unavailable, corrupt or unwritable storage prevents a first submission",async()=>{
 for(const store of [()=>{throw Error();},()=>({getItem:()=>"broken",setItem:()=>{},removeItem:()=>{}}),()=>({getItem:()=>null,setItem:()=>{throw Error();},removeItem:()=>{}})]){
  let sends=0;await assert.rejects(new HotelRequestSession(store).submit(payload,()=>{},async()=>{sends++;return result;}));assert.equal(sends,0);
 }
});
test("synchronous lock blocks concurrent calls and reset during submission",async()=>{
 const store=storage();const session=new HotelRequestSession(()=>store);let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 const first=session.submit(payload,()=>{},async()=>{await gate;return result;});
 await assert.rejects(session.submit(payload,()=>{},async()=>result),/already being sent/);assert.throws(()=>session.startSeparateRequest(),/wait/);release();await first;
});
test("invalid new selection stops before storing a key or sending",async()=>{
 const store=storage();await assert.rejects(new HotelRequestSession(()=>store).submit(payload,()=>{throw Error("Invalid dates");},async()=>result),/Invalid dates/);assert.equal(store.getItem(HOTEL_REQUEST_STORAGE),null);
});
test("failed success cache still leaves a retryable persisted identity",async()=>{
 const store=storage();let writes=0;const guarded={...store,setItem:(key:string,value:string)=>{if(++writes===2)throw Error();store.setItem(key,value);}};
 const session=new HotelRequestSession(()=>guarded);let original:unknown;
 await session.submit(payload,()=>{},async p=>{original=p.request_id;return result;});
 await new HotelRequestSession(()=>store).submit(payload,()=>{},async p=>{assert.equal(p.request_id,original);return result;});
});
