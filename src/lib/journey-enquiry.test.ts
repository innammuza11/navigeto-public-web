import test from "node:test";
import assert from "node:assert/strict";
import { journeyEnquiryDetails } from "./journey-enquiry.ts";
import { EnquiryRequestSession } from "./enquiry-request-session.ts";
const flight = { id:"offer-1",airline:"Example Air",total_amount:105,currency:"USD",
  search_query:"origin=CMB&destination=KUL&depart_date=2026-11-03&return_date=2026-11-10&adults=3&children=2&infants=1",
  slices:[{origin:"CMB",destination:"KUL",departing_at:"2026-11-03T09:00:00",arriving_at:"2026-11-03T15:00:00"},
    {origin:"KUL",destination:"CMB",departing_at:"2026-11-10T09:00:00",arriving_at:"2026-11-10T12:00:00"}] };
test("flight enquiry preserves party, return departure and unchanged selling total",()=>{
  const request=journeyEnquiryDetails("flight",flight,"2026-10-04");
  assert.equal(request.pax,6);assert.equal(request.travel_start_date,"2026-11-03");assert.ok("travel_end_date" in request);assert.equal(request.travel_end_date,"2026-11-10");
  assert.equal(request.details.adults,3);assert.equal(request.details.children,2);assert.equal(request.details.infants,1);
  assert.equal(request.details.selection.total_amount,105);
});
test("one-way enquiry never invents a return date",()=>{
  const request=journeyEnquiryDetails("flight",{...flight,search_query:flight.search_query.replace("return_date=2026-11-10","trip_type=one_way"),slices:flight.slices.slice(0,1)},"2026-10-04");
  assert.equal("travel_end_date" in request,false);
});
test("missing, mismatched, expired or stale flight selections cannot start requests",()=>{
  assert.throws(()=>journeyEnquiryDetails("flight",null));
  for(const selection of [{...flight,id:""},{...flight,total_amount:0},{...flight,search_query:flight.search_query.replace("adults=3","adults=-1")},
    {...flight,search_query:flight.search_query.replace("origin=CMB","origin=SIN")}, {...flight,search_query:flight.search_query.replace("2026-11-03","2026-11-04")},
    {...flight,expires_at:"2026-10-03T10:00:00Z"}]) assert.throws(()=>journeyEnquiryDetails("flight",selection,"2026-10-04",new Date("2026-10-04T10:00:00Z")));
  assert.throws(()=>journeyEnquiryDetails("flight",flight,"2026-11-04"));
});
test("transfer requires selected route, party, vehicle and upcoming date",()=>{
  const selection={origin:"Airport",destination:"Galle",date:"2026-11-03",passengers:4,luggage:3,vehicle:{vehicle_name:"Van"}};
  const request=journeyEnquiryDetails("transfer",selection,"2026-10-04");
  assert.equal(request.pax,4);assert.equal(request.travel_start_date,selection.date);assert.equal(request.details.luggage,3);
  for(const invalid of [{...selection,date:"2026-09-01"},{...selection,passengers:0},{...selection,vehicle:undefined},{...selection,date:"2026-02-30"}]) assert.throws(()=>journeyEnquiryDetails("transfer",invalid,"2026-10-04"));
});
test("lost acknowledgement retries recover the same request even after its departure date passes",async()=>{
  const data=new Map<string,string>();const storage={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);},removeItem:(key:string)=>{data.delete(key);}};
  const session=new EnquiryRequestSession(()=>storage);const payload={enquiry_type:"flight",...journeyEnquiryDetails("flight",flight)};
  const ids:unknown[]=[];
  await assert.rejects(session.submit(payload,async p=>{ids.push(p.request_id);throw Error("lost acknowledgement");},()=>{journeyEnquiryDetails("flight",flight,"2026-10-04");}));
  const result=await session.submit(payload,async p=>{ids.push(p.request_id);return {enquiry:{public_ref:"TEST-REF",status:"received"}};},()=>{journeyEnquiryDetails("flight",flight,"2026-11-04");});
  assert.equal(ids[0],ids[1]);assert.equal(result.enquiry.public_ref,"TEST-REF");
});
