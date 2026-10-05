import test from "node:test";
import assert from "node:assert/strict";
import { flightSellingTotal, flightDateTime, flightDuration } from "./flight-selling.ts";
import { searchSellingFlights } from "./flight-search-service.ts";
test("five percent selling uplift uses currency minor units", () => {
  assert.equal(flightSellingTotal(100, "USD"), 105);
  assert.equal(flightSellingTotal(123.45, "USD"), 129.62);
  assert.equal(flightSellingTotal(100.5, "JPY"), 106);
  assert.equal(flightSellingTotal(10.123, "BHD"), 10.629);
  for (const amount of [0, -1, NaN, Infinity]) assert.throws(()=>flightSellingTotal(amount,"USD"));
});
test("airline dates keep their supplied local time and durations are readable", () => {
  assert.deepEqual(flightDateTime("2026-11-03T23:15:00+05:30"), { date: "3 Nov 2026", time: "23:15" });
  assert.equal(flightDuration("PT3H45M"), "3h 45m");
  assert.equal(flightDuration("P1DT2H"), "26h");
  assert.equal(flightDateTime(null).time, "—");
});
test("server exposes only selling totals and forwards no client price overrides", async () => {
  let payload: Record<string, unknown> = {};
  const request = new Request("https://navigeto.com/api/flights", { method: "POST", body: JSON.stringify({ origin:"CMB",destination:"KUL",depart_date:"2099-11-03",return_date:"2099-11-10", total_amount:1,markup:0 }) });
  const response = await searchSellingFlights(request,"https://supplier.example/search","public-key",async(_url, options)=>{
    payload=JSON.parse(String(options?.body));
    return Response.json({provider_connected:true,mode:"live",offers:[{id:"offer",total_amount:100,currency:"USD",slices:[],supplier_cost:100,base_amount:80,markup:0}]});
  });
  const data=await response.json();
  assert.equal(data.offers[0].total_amount,105);
  assert.equal(data.offers[0].supplier_cost,undefined);
  assert.equal(data.offers[0].base_amount,undefined);
  assert.equal(data.offers[0].markup,undefined);
  assert.equal(payload.total_amount,undefined);
  assert.equal(response.headers.get("cache-control"),"no-store");
});
test("invalid dates never reach supplier and supplier errors expose no fare",async()=>{
  let calls=0;
  const response=await searchSellingFlights(new Request("https://navigeto.com/api/flights",{method:"POST",body:JSON.stringify({depart_date:"2000-01-01"})}),"https://supplier.example/search","public-key",async()=>{calls++;return Response.json({offers:[]});});
  assert.equal(response.status,400);assert.equal(calls,0);
  const failed=await searchSellingFlights(new Request("https://navigeto.com/api/flights",{method:"POST",body:JSON.stringify({depart_date:"2099-11-03",trip_type:"one_way"})}),"https://supplier.example/search","public-key",async()=>Response.json({error:"No fares"},{status:503}));
  assert.equal(failed.status,503);assert.equal((await failed.json()).offers,undefined);
});

test("layovers require supplied matching connection airports and usable times", async () => {
  const { flightLayover } = await import("./flight-selling.ts");
  assert.deepEqual(flightLayover({ destination:"SIN",arriving_at:"2026-11-03T23:15:00" }, { origin:"SIN",departing_at:"2026-11-04T01:00:00" }), { airport:"SIN",duration:"1h 45m" });
  assert.equal(flightLayover({ destination:"SIN",arriving_at:"2026-11-03T23:15:00" }, { origin:"KUL",departing_at:"2026-11-04T01:00:00" }), null);
  assert.equal(flightLayover({ destination:"SIN" }, { origin:"SIN" }), null);
});

test("one-way searches never acquire a return date at the server boundary",async()=>{
  let payload: Record<string,unknown>={};
  const response=await searchSellingFlights(new Request("https://navigeto.com/api/flights",{method:"POST",body:JSON.stringify({depart_date:"2099-11-03",trip_type:"one_way"})}),"https://supplier.example/search","public-key",async(_url,options)=>{payload=JSON.parse(String(options?.body));return Response.json({provider_connected:true,mode:"live",offers:[]});});
  assert.equal(response.status,200);assert.equal(payload.return_date,undefined);assert.equal(payload.trip_type,"one_way");
});
