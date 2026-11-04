import test from "node:test";
import assert from "node:assert/strict";
import { itineraryDownloadEnquiry, printableItinerary } from "./itinerary-print.ts";

test("printable itinerary normalises published day records", () => {
  const sheet = printableItinerary({ slug: "x", title: "Hill Escape", duration_days: 3, duration_nights: 2, destinations: ["Kandy", "Ella"], itinerary: [{ day: "1", title: "Arrive", description: "Meet your driver.", overnight: "Kandy" }, { route: "Kandy – Ella", meals: "Breakfast" }], inclusions: ["Private car"] });
  assert.equal(sheet.route, "Kandy → Ella");
  assert.equal(sheet.length, "3 days · 2 nights");
  assert.deepEqual(sheet.days.map(day => [day.label, day.title, day.overnight, day.meals]), [["Day 1", "Arrive", "Kandy", ""], ["Day 2", "Kandy – Ella", "", "Breakfast"]]);
  assert.ok(!("rate_cards" in sheet) && !("price_from" in sheet));
});

test("download enquiry carries the tour, contact and channel; email optional", () => {
  const request = itineraryDownloadEnquiry({ id: "1", slug: "hill", title: "Hill Escape" }, { name: " Ama ", whatsapp: "+94 77 123 4567", email: "" });
  assert.equal(request.subject, "itinerary download: Hill Escape");
  assert.equal(request.customer_name, "Ama");
  assert.equal("email" in request, false);
  assert.equal(request.details.request_channel, "itinerary_download");
  assert.equal(request.details.source_page, "/tours/package/hill");
});

test("download enquiry validates name, WhatsApp and email", () => {
  const tour = { slug: "hill", title: "Hill Escape" };
  assert.throws(() => itineraryDownloadEnquiry(tour, { name: "", whatsapp: "+94771234567", email: "" }), /name/);
  assert.throws(() => itineraryDownloadEnquiry(tour, { name: "Ama", whatsapp: "12", email: "" }), /WhatsApp/);
  assert.throws(() => itineraryDownloadEnquiry(tour, { name: "Ama", whatsapp: "+94771234567", email: "not-an-email" }), /email/);
});

test("internal or B2B summary text never reaches the customer sheet", () => {
  assert.equal(printableItinerary({ slug: "x", title: "T", summary: "Per adult. B2B agents: request a private agent quotation." }).summary, "");
  assert.equal(printableItinerary({ slug: "x", title: "T", summary: "A gentle loop through the hills." }).summary, "A gentle loop through the hills.");
});
