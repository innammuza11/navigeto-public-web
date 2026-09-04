import assert from "node:assert/strict";
import test from "node:test";
import { hotelBookingDetails, hotelParty } from "./hotel-checkout.ts";

const stay = { rate_id: "fixture-rate", checkin: "2026-10-10", checkout: "2026-10-12", rooms: 2, adults: 3, children: 1, occupancy: "triple" };
const today = "2026-09-04";

test("preserves the selected party from search through booking payload", () => {
  const party = hotelParty(new URLSearchParams("rooms=2&adults=3&children=1&occupancy=triple"));
  assert.deepEqual(hotelBookingDetails({ ...stay, ...party }, today), { ...stay, guests: 4 });
});

test("uses search defaults only when constructing a new selection", () => {
  assert.deepEqual(hotelParty(new URLSearchParams()), { rooms: 1, adults: 2, children: 0, occupancy: "double" });
  assert.throws(() => hotelBookingDetails({ ...stay, adults: undefined }, today), /guest details/);
});

test("preserves all supported room bases instead of resetting to double", () => {
  for (const occupancy of ["single", "double", "triple", "quadruple"]) {
    assert.equal(hotelBookingDetails({ ...stay, occupancy }, today).occupancy, occupancy);
  }
});

test("rejects missing room selection rather than creating a generic enquiry", () => {
  for (const selection of [null, {}, { ...stay, rate_id: " " }]) {
    assert.throws(() => hotelBookingDetails(selection, today), /select a live room/);
  }
});

test("rejects missing, expired, reversed and impossible dates", () => {
  for (const dates of [
    { checkin: undefined }, { checkout: undefined }, { checkin: "2026-08-15" },
    { checkout: stay.checkin }, { checkout: "2026-10-09" },
    { checkin: "2026-02-30" }, { checkout: "invalid" },
  ]) assert.throws(() => hotelBookingDetails({ ...stay, ...dates }, today), /stay dates/);
  assert.equal(hotelBookingDetails({ ...stay, checkin: today }, today).checkin, today);
});

test("rejects malformed or incomplete party counts", () => {
  for (const invalid of [
    { rooms: 0 }, { rooms: 1.5 }, { adults: 0 }, { adults: NaN },
    { children: -1 }, { children: Infinity }, { children: undefined },
    { occupancy: undefined }, { occupancy: "unknown" },
  ]) assert.throws(() => hotelBookingDetails({ ...stay, ...invalid }, today), /guest details/);
});
