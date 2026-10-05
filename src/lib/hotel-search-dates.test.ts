import test from "node:test";
import assert from "node:assert/strict";
import { hotelToday, hotelSearchDates, addHotelDays } from "./hotel-search-dates.ts";

test("hotel day changes at Sri Lanka midnight", () => {
  assert.equal(hotelToday(new Date("2026-10-03T18:29:59Z")), "2026-10-03");
  assert.equal(hotelToday(new Date("2026-10-03T18:30:00Z")), "2026-10-04");
});
test("missing dates share a future four-night stay", () => {
  assert.deepEqual(hotelSearchDates(new URLSearchParams(), "2026-10-04"), { checkin: "2026-11-03", checkout: "2026-11-07", error: "" });
});
test("explicit dates survive and missing checkout follows selected check-in", () => {
  assert.deepEqual(hotelSearchDates(new URLSearchParams("checkin=2026-12-30"), "2026-10-04"), { checkin: "2026-12-30", checkout: "2027-01-03", error: "" });
  assert.deepEqual(hotelSearchDates(new URLSearchParams("checkin=2026-11-01&checkout=2026-11-02"), "2026-10-04"), { checkin: "2026-11-01", checkout: "2026-11-02", error: "" });
});
test("invalid, expired, blank and non-positive stays cannot produce rates", () => {
  for (const query of ["checkin=&checkout=2026-11-07", "checkin=2026-02-30&checkout=2026-11-07", "checkin=2026-08-15&checkout=2026-08-19", "checkin=2026-11-03&checkout=2026-11-03", "checkin=2026-11-07&checkout=2026-11-03", "checkout="]) {
    assert.ok(hotelSearchDates(new URLSearchParams(query), "2026-10-04").error, query);
  }
});
test("calendar arithmetic handles leap days and blank inputs", () => {
  assert.equal(addHotelDays("2028-02-28", 1), "2028-02-29");
  assert.equal(addHotelDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addHotelDays("", 1), "");
});
