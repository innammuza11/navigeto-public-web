import test from "node:test";
import assert from "node:assert/strict";
import { HUB_FAQS, INDEXNOW_KEY, buildLlmsTxt, faqJsonLd, reviewedLabel, reviewedPageNode } from "./answer-engine.ts";
import { readFileSync } from "node:fs";

test("hub answers are short, unique and never quote prices or internal costs", () => {
  for (const { faqs } of Object.values(HUB_FAQS)) {
    assert.equal(new Set(faqs.map(faq => faq.q)).size, faqs.length);
    for (const faq of faqs) {
      assert.ok(faq.q.endsWith("?"));
      assert.ok(faq.a.length > 60 && faq.a.length < 420, faq.q);
      assert.doesNotMatch(faq.a, /\b(USD|LKR|Rs\.?|\$)\s?\d|markup|supplier cost|net rate/i);
    }
  }
});

test("FAQ schema mirrors the visible questions", () => {
  const schema = faqJsonLd(HUB_FAQS["/"].faqs);
  assert.equal(schema["@type"], "FAQPage");
  assert.equal(schema.mainEntity.length, HUB_FAQS["/"].faqs.length);
  assert.equal(schema.mainEntity[0].acceptedAnswer.text, HUB_FAQS["/"].faqs[0].a);
});

test("llms.txt follows the llmstxt.org shape and lists only the links given", () => {
  const text = buildLlmsTxt("https://navigeto.com", {
    guides: [{ title: "Ella travel guide", path: "/sri-lanka/ella", note: "Tea country" }],
    itineraries: [{ title: "7 days in Sri Lanka", path: "/itineraries/7-days" }],
    visas: [],
    tours: [{ title: "Island [Journey]", path: "/tours/package/island", note: "8 days, Sri Lanka" }],
  });
  assert.match(text, /^# Navigeto Travels\n\n> /);
  assert.match(text, /- \[Ella travel guide\]\(https:\/\/navigeto\.com\/sri-lanka\/ella\): Tea country/);
  assert.match(text, /- \[Island Journey\]\(https:\/\/navigeto\.com\/tours\/package\/island\)/);
  assert.doesNotMatch(text, /## Visa guides/);
  assert.doesNotMatch(text, /markup|supplier|net rate/i);
});

test("reviewed pages credit Navigeto and show a readable date", () => {
  const node = reviewedPageNode("https://navigeto.com", "/sri-lanka/ella", "Ella", "2026-11-03");
  assert.equal(node.dateModified, "2026-11-03");
  assert.equal(node.publisher["@id"], "https://navigeto.com/#organization");
  assert.equal(reviewedLabel("2026-11-03"), "November 2026");
});

test("the IndexNow key file is published at the site root", () => {
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/);
  assert.equal(readFileSync(new URL(`../../public/${INDEXNOW_KEY}.txt`, import.meta.url), "utf8"), INDEXNOW_KEY);
});
