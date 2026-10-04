import test from "node:test";
import assert from "node:assert/strict";
import { flightSearchDates, transferSearchDate, journeySearchHref } from "./journey-search-dates.ts";
const today = "2026-10-04";
test("flight defaults and partial search follow the departure date", () => {
  assert.deepEqual(flightSearchDates(new URLSearchParams(), today), { depart_date: "2026-11-03", return_date: "2026-11-10", error: "" });
  assert.equal(flightSearchDates(new URLSearchParams("depart_date=2026-12-30"), today).return_date, "2027-01-06");
});
test("one-way searches omit return dates and same-day return is supported", () => {
  assert.deepEqual(flightSearchDates(new URLSearchParams("trip_type=one_way&depart_date=2026-11-01&return_date=invalid"), today), { depart_date: "2026-11-01", return_date: "", error: "" });
  assert.equal(flightSearchDates(new URLSearchParams("depart_date=2026-11-01&return_date=2026-11-01"), today).error, "");
});
test("invalid flight dates cannot trigger fare searches", () => {
  for (const query of ["depart_date=", "depart_date=2026-02-30", "depart_date=2026-08-15", "return_date=", "depart_date=2026-11-10&return_date=2026-11-03"]) assert.ok(flightSearchDates(new URLSearchParams(query), today).error, query);
});
test("transfer defaults and explicit dates are preserved without accepting expired dates", () => {
  assert.deepEqual(transferSearchDate(new URLSearchParams(), today), { travel_date: "2026-11-03", error: "" });
  assert.deepEqual(transferSearchDate(new URLSearchParams("travel_date=2026-10-04"), today), { travel_date: today, error: "" });
  for (const query of ["travel_date=", "travel_date=2026-02-30", "travel_date=2026-08-15"]) assert.ok(transferSearchDate(new URLSearchParams(query), today).error);
});
test("checkout return links preserve travel filters without unrelated fields", () => {
  assert.equal(journeySearchHref("flight", "depart_date=2026-11-01&return_date=2026-11-08&trip_type=return&email=private&token=secret"), "/flights/search?trip_type=return&depart_date=2026-11-01&return_date=2026-11-08");
  const transfer = new URL(journeySearchHref("transfer", "origin=Airport&destination=Galle&travel_date=2026-11-03&pickup_time=09%3A30&passengers=3&luggage=2&trip_type=return&vehicle_type=van&email=private"), "https://navigeto.com");
  assert.equal(transfer.searchParams.get("travel_date"), "2026-11-03");
  assert.equal(transfer.searchParams.get("pickup_time"), "09:30");
  assert.equal(transfer.searchParams.get("trip_type"), "return");
  assert.equal(transfer.searchParams.has("email"), false);
  assert.equal(journeySearchHref("transfer"), "/transfers/search");
});
