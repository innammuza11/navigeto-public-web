import test from "node:test";
import assert from "node:assert/strict";
import { DESTINATION_GUIDES, guideBySlug, guideJsonLd, toursForGuide } from "./destination-guides.ts";

test("every guide is complete, unique and links only to other guides", () => {
  const slugs = new Set(DESTINATION_GUIDES.map(guide => guide.slug));
  assert.equal(slugs.size, DESTINATION_GUIDES.length);
  for (const guide of DESTINATION_GUIDES) {
    assert.match(guide.slug, /^[a-z-]+$/);
    assert.ok(guide.metaTitle.length <= 60, `${guide.slug} title too long`);
    assert.ok(guide.metaDescription.length <= 160, `${guide.slug} description too long`);
    assert.ok(guide.highlights.length >= 3 && guide.faqs.length >= 3 && guide.aliases.length >= 1);
    for (const other of guide.pairWith) assert.ok(slugs.has(other) && other !== guide.slug, `${guide.slug} → ${other}`);
    assert.ok(!/\b(USD|LKR|Rs\.?|\$)\s?\d/.test(JSON.stringify(guide)), `${guide.slug} must not state prices`);
  }
});

test("tours match on destinations or itinerary places, case-insensitively", () => {
  const ella = guideBySlug("ella")!;
  const tours = [
    { slug: "a", destinations: ["Kandy", "ella"] },
    { slug: "b", destinations: ["Colombo"], itinerary: [{ title: "Nuwara Eliya to Ella" }] },
    { slug: "c", destinations: ["Galle"], itinerary: [{ title: "Beach day" }] },
  ];
  assert.deepEqual(toursForGuide(tours, ella).map(tour => tour.slug), ["a", "b"]);
  assert.equal(guideBySlug("nowhere"), null);
});

test("guide schema has destination, FAQ and breadcrumbs", () => {
  const graph = guideJsonLd("https://navigeto.com", guideBySlug("kandy")!)["@graph"] as Array<Record<string, unknown>>;
  assert.deepEqual(graph.map(node => node["@type"]), ["TouristDestination", "FAQPage", "BreadcrumbList"]);
  assert.equal((graph[1].mainEntity as unknown[]).length, 3);
});

test("Galle Face in Colombo is not a Galle visit", () => {
  const galle = guideBySlug("galle")!;
  const tours = [{ slug: "colombo", destinations: ["Colombo"], itinerary: [{ title: "Galle Face Green sunset" }] }, { slug: "fort", destinations: ["Galle"] }];
  assert.deepEqual(toursForGuide(tours, galle).map(tour => tour.slug), ["fort"]);
});
