import test from "node:test";
import assert from "node:assert/strict";
import { DESTINATION_GUIDES } from "./destination-guides.ts";
import { ITINERARY_GUIDES, itineraryBySlug, itineraryJsonLd, toursForItinerary } from "./itinerary-guides.ts";

test("every itinerary is complete, unique, links only to real guides and states no prices", () => {
  const guides = new Set(DESTINATION_GUIDES.map(guide => guide.slug));
  assert.equal(new Set(ITINERARY_GUIDES.map(guide => guide.slug)).size, ITINERARY_GUIDES.length);
  for (const guide of ITINERARY_GUIDES) {
    assert.ok(guide.metaTitle.length <= 60, `${guide.slug} title`);
    assert.ok(guide.metaDescription.length <= 160, `${guide.slug} description`);
    assert.ok(guide.days.length >= 5 && guide.faqs.length >= 3 && guide.tips.length >= 1);
    for (const day of guide.days) if (day.stop) assert.ok(guides.has(day.stop), `${guide.slug} → ${day.stop}`);
    assert.ok(!/\b(USD|LKR|Rs\.?|\$)\s?\d/.test(JSON.stringify(guide)), `${guide.slug} must not state prices`);
  }
});

test("tours match the itinerary length, Sri Lanka only, closest first", () => {
  const week = itineraryBySlug("sri-lanka-7-days")!;
  const tours = [
    { slug: "eight", duration_days: 8, country: "Sri Lanka" },
    { slug: "seven", duration_days: 7, country: "Sri Lanka" },
    { slug: "thai", duration_days: 7, country: "Thailand" },
    { slug: "four", duration_days: 4, country: "Sri Lanka" },
    { slug: "nocountry", duration_days: 6, country: null },
  ];
  assert.deepEqual(toursForItinerary(tours, week).map(tour => tour.slug), ["seven", "eight", "nocountry"]);
});

test("itinerary schema has trip, FAQ and breadcrumbs", () => {
  const graph = itineraryJsonLd("https://navigeto.com", itineraryBySlug("sri-lanka-10-days")!)["@graph"] as Array<Record<string, unknown>>;
  assert.deepEqual(graph.map(node => node["@type"]), ["TouristTrip", "FAQPage", "BreadcrumbList"]);
});
