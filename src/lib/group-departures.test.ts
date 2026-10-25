import { test } from "node:test";
import assert from "node:assert/strict";
import { canRequestGroup, groupRequest, sriLankaDay, type GroupDeparture } from "./group-departures.ts";
const row={id:"departure",package_title:"Japan",label:"Spring",departure_date:"2099-03-10",return_date:"2099-03-17",booking_deadline:"2099-02-20",places_available:4,status:"open",updated_at:"2026-10-25T00:00:00Z"} as GroupDeparture;
test("blocks expired, full, sold-out and invalid party requests",()=>{
 assert.equal(canRequestGroup(row,4,"2026-10-25"),true);
 for(const pax of [0,5,21,1.5,NaN])assert.equal(canRequestGroup(row,pax,"2026-10-25"),false);
 assert.equal(canRequestGroup({...row,status:"sold_out"},1,"2026-10-25"),false);
 assert.equal(canRequestGroup(row,1,"2099-02-21"),false);
});
test("requests carry the selected departure/version without client billing math",()=>{
 const payload=groupRequest(row,2);assert.equal(payload.details.departure_id,"departure");assert.equal(payload.details.offer_version,row.updated_at);assert.equal(payload.pax,2);assert.equal("total_amount" in payload,false);
});
test("Sri Lanka booking-day boundaries work on a UTC host",()=>assert.equal(sriLankaDay(new Date("2026-10-24T19:00:00Z")),"2026-10-25"));
