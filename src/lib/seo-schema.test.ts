import test from "node:test";
import assert from "node:assert/strict";
import { breadcrumbJsonLd, enquirySourcePage, showsEnquiryBar, tourJsonLd, uniqueTourSlugs, whatsappLeadMessage, whatsappLink } from "./seo-schema.ts";

const site = "https://navigeto.com";
type Trip = { "@type": string; url: string; offers?: { price: number; priceCurrency: string }; itinerary: { itemListElement: Array<{ name?: string; item?: { name: string } }> } };
type Crumbs = { "@type": string; itemListElement: Array<{ item: string }> };
const parts = (schema: unknown) => (schema as { "@graph": unknown[] })["@graph"] as [Trip, Crumbs];
const tour = { slug: "hill-country", title: "Hill Country Escape", summary: "Tea and waterfalls.", tags: ["Nature"], destinations: ["Kandy", "Ella"], itinerary: [{ title: "Arrive in Kandy" }, { route: "Kandy – Ella" }, {}], price_from: 640, currency: "USD", country: "Sri Lanka" };

test("tour schema carries trip, itinerary, published selling price and breadcrumbs", () => {
  const [trip, crumbs] = parts(tourJsonLd(site, tour));
  assert.equal(trip["@type"], "TouristTrip");
  assert.equal(trip.url, `${site}/tours/package/hill-country`);
  assert.deepEqual(trip.itinerary.itemListElement.map(item => item.name), ["Arrive in Kandy", "Kandy – Ella", "Day 3"]);
  assert.equal(trip.offers?.price, 640);
  assert.equal(trip.offers?.priceCurrency, "USD");
  assert.equal(crumbs["@type"], "BreadcrumbList");
  assert.equal(crumbs.itemListElement[2].item, `${site}/tours/package/hill-country`);
});

test("no published price means no Offer, and nothing internal leaks", () => {
  const withInternals = { ...tour, price_from: null, internal_cost: 300, markup: 0.3 };
  const schema = tourJsonLd(site, withInternals);
  const text = JSON.stringify(schema);
  assert.equal(parts(schema)[0].offers, undefined);
  assert.ok(!/internal_cost|markup/.test(text));
});

test("fallback uses destinations when no itinerary is published", () => {
  const [trip] = parts(tourJsonLd(site, { ...tour, itinerary: [] }));
  assert.equal(trip.itinerary.itemListElement[1].item?.name, "Ella");
});

test("breadcrumb home points at the site root", () => {
  assert.equal(breadcrumbJsonLd(site, [{ name: "Home", path: "/" }]).itemListElement[0].item, site);
});

test("catalogue pages merge without duplicates", () => {
  assert.deepEqual(uniqueTourSlugs([[{ slug: "a" }, { slug: "b" }], [{ slug: "b" }, { slug: null }, { slug: "c" }]]), ["a", "b", "c"]);
});

test("enquiry bar stays off checkout, payment, partner and form pages", () => {
  for (const path of ["/", "/tours", "/tours/package/x", "/hotels/abc", "/visas", "/holidays"]) assert.equal(showsEnquiryBar(path), true, path);
  for (const path of ["/tours/booking", "/hotels/booking", "/visas/apply", "/visas/application/tok", "/pay", "/one", "/one/offers", "/partners", "/custom-trip", "/trip-assistant", "/contact"]) assert.equal(showsEnquiryBar(path), false, path);
});

test("WhatsApp message names the page the visitor was reading", () => {
  assert.equal(whatsappLeadMessage("/tours/package/x", "Hill Country Escape | Navigeto Travels"), "Hi Navigeto, I'm interested in Hill Country Escape (navigeto.com/tours/package/x). Could you help me plan my trip?");
  assert.match(whatsappLeadMessage("/", "Navigeto Travels | Sri Lanka & Worldwide Journeys"), /interested in your website \(navigeto\.com\)/);
  assert.equal(whatsappLink("+94 75 331 0101", "a b&c"), "https://wa.me/94753310101?text=a%20b%26c");
});

test("source page accepts on-site paths only", () => {
  assert.equal(enquirySourcePage("?from=%2Ftours%2Fpackage%2Fhill-country"), "/tours/package/hill-country");
  assert.equal(enquirySourcePage("?from=https%3A%2F%2Fevil.example"), undefined);
  assert.equal(enquirySourcePage("?from=%2F%2Fevil.example"), undefined);
  assert.equal(enquirySourcePage(""), undefined);
});
