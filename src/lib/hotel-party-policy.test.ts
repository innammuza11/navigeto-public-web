import assert from "node:assert/strict";
import test from "node:test";
import { hotelPartyStatus } from "./hotel-party-policy.ts";
const base = { rooms: 1, adults: 2, children: 0, occupancy: "double" };
test("child-inclusive parties require unpriced manual quotes", () => {
  assert.equal(hotelPartyStatus({ ...base, children: 1 }).kind, "manual");
});
test("adults must fit the selected basis across the requested rooms", () => {
  for (const [occupancy, basis] of [["single",1],["double",2],["triple",3]] as const) {
    assert.equal(hotelPartyStatus({ ...base, occupancy, rooms: 2, adults: basis*2 }).kind,"automatic");
    assert.equal(hotelPartyStatus({ ...base, occupancy, rooms: 2, adults: basis*2+1 }).kind,"manual");
  }
  assert.equal(hotelPartyStatus({ ...base, adults: 20 }).kind,"manual");
});
test("quadruple is manual, never double-priced", () => {
  assert.equal(hotelPartyStatus({...base, occupancy:"quadruple"}).kind,"manual");
});
test("malformed party values cannot bypass the rules", () => {
  for(const patch of [{children:-1},{children:"0"},{adults:NaN},{rooms:0},{rooms:1.5},{adults:Infinity},{occupancy:"unknown"},{adults:Number.MAX_SAFE_INTEGER,children:1}]) {
    assert.equal(hotelPartyStatus({...base,...patch}).kind,"invalid");
  }
});
test("booking requires explicit counts, search retains documented defaults", () => {
  assert.equal(hotelPartyStatus({}).kind,"automatic");
  assert.equal(hotelPartyStatus({},true).kind,"invalid");
  assert.equal(hotelPartyStatus({...base,children:undefined},true).kind,"invalid");
});
