import assert from "node:assert/strict";
import test from "node:test";
import { hotelProfileHref } from "./hotel-navigation.ts";

test("only supplied published slugs produce hotel profile links", () => {
  for (const slug of [undefined, null, "", " ", "../private", "hotel?preview=1", "https://example.com", "hotel/name"]) {
    assert.equal(hotelProfileHref(slug), null);
  }
  assert.equal(hotelProfileHref("published-hotel"), "/hotels/published-hotel");
});

test("published profile navigation preserves encoded stay filters", () => {
  const params = new URLSearchParams({ q: "A & B Hotel", checkin: "2026-11-03", checkout: "2026-11-07", children: "0" });
  const href = hotelProfileHref("published-hotel", params)!;
  const url = new URL(href, "https://navigeto.com");
  assert.equal(url.pathname, "/hotels/published-hotel");
  assert.deepEqual([...url.searchParams], [...params]);
});
