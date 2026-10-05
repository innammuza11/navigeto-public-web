import test from "node:test";
import assert from "node:assert/strict";
import { tourEnquiryDetails } from "./tour-enquiry.ts";
const tour = { id: "package-1", slug: "island-journey", title: "Island Journey" };
const choices = { adults: "3", children: "2", departure: "2026-11-02", hotelStyle: "Luxury" };
test("selected package, actual party and departure reach the lead fields", () => {
  const result = tourEnquiryDetails(tour, choices, "2026-10-03");
  assert.equal(result.subject, "tour request: Island Journey");
  assert.equal(result.pax, 5);
  assert.equal(result.travel_start_date, "2026-11-02");
  assert.equal(result.details.selection.id, tour.id);
  assert.equal(result.details.selection.slug, tour.slug);
  assert.equal(result.details.selection.hotel_style, "Luxury");
  assert.equal(result.details.adults, 3);
  assert.equal(result.details.children, 2);
});
test("flexible dates do not manufacture a travel date", () => {
  const result = tourEnquiryDetails(tour, { ...choices, departure: "" }, "2026-10-03");
  assert.equal(result.details.dates_flexible, true);
  assert.equal("travel_start_date" in result, false);
});
test("large catalogue matrices stay out of the customer enquiry", () => {
  const catalogue = { ...tour, rate_cards: [{ values: "x".repeat(100000) }], itinerary: [{ text: "x".repeat(100000) }] };
  const result = tourEnquiryDetails(catalogue, choices, "2026-10-03");
  assert.ok(JSON.stringify(result).length < 1000);
  assert.equal("rate_cards" in result.details.selection, false);
  assert.equal("itinerary" in result.details.selection, false);
});
test("rejects missing selection, fractional or missing party, invalid/past dates", () => {
  assert.throws(() => tourEnquiryDetails(null, choices, "2026-10-03"), /choose your tour/);
  for (const adults of ["", "0", "-1", "1.5", "NaN", "101"]) assert.throws(() => tourEnquiryDetails(tour, { ...choices, adults }, "2026-10-03"), /traveller|groups/);
  for (const departure of ["2026-02-30", "2026-10-02", "tomorrow"]) assert.throws(() => tourEnquiryDetails(tour, { ...choices, departure }, "2026-10-03"), /departure/);
  assert.throws(() => tourEnquiryDetails(tour, { ...choices, hotelStyle: "invalid" }, "2026-10-03"), /hotel style/);
});
