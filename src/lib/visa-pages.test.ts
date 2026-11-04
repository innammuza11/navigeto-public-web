import test from "node:test";
import assert from "node:assert/strict";
import { visaDestinations, visaDestinationSlug, visaJsonLd, visaPageFaqs } from "./visa-pages.ts";

const product = (over: Record<string, unknown>) => ({ id: "1", destinationCode: "MY", destination: "Malaysia", packageName: "Malaysia eVisa", documentStatus: "officially_verified", requiredDocuments: ["Passport", "Photo"], resultLabel: "Visa required before travel", visaType: "tourist", lastVerifiedAt: "2026-10-08T00:00:00Z", ...over });

test("slugs are clean and readable", () => {
  assert.equal(visaDestinationSlug("United Arab Emirates"), "united-arab-emirates");
  assert.equal(visaDestinationSlug("Côte d'Ivoire"), "cote-divoire");
});

test("destinations group by country; indexable only when every service is officially verified", () => {
  const list = visaDestinations([
    product({ id: "a" }),
    product({ id: "b", destinationCode: "AE", destination: "United Arab Emirates", documentStatus: "officially_verified" }),
    product({ id: "c", destinationCode: "AE", destination: "United Arab Emirates", documentStatus: "review_due", lastVerifiedAt: "2026-09-04T00:00:00Z" }),
  ]);
  assert.deepEqual(list.map(item => [item.slug, item.products.length, item.verified]), [["malaysia", 1, true], ["united-arab-emirates", 2, false]]);
  assert.equal(list[1].lastVerifiedAt, "2026-09-04T00:00:00Z");
});

test("FAQ answers come from the verified catalogue fields", () => {
  const [malaysia] = visaDestinations([product({})]);
  const faqs = visaPageFaqs(malaysia);
  assert.match(faqs[0].a, /Visa required before travel/);
  assert.match(faqs[1].a, /Passport; Photo/);
  assert.equal((visaJsonLd("https://navigeto.com", malaysia)["@graph"][1] as { itemListElement: Array<{ item: string }> }).itemListElement[2].item, "https://navigeto.com/visas/malaysia");
});
