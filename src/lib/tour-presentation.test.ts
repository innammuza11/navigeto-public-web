import assert from "node:assert/strict";
import test from "node:test";
import { tourDisplayName, tourDurationLabel } from "./tour-presentation.ts";

test("separates supplier codes and route suffixes from public names", () => {
  assert.equal(tourDisplayName({title:"Tea Trails & Southern Shores — Bentota, Ella to Colombo | 05 NIGHTS 06 DAYS | 01 BEN"}), "Tea Trails & Southern Shores");
  assert.equal(tourDisplayName({title:"Romantic Highlands & Coast | 08 NIGHTS 09 DAYS | 02 NEG"}), "Romantic Highlands & Coast");
});
test("keeps long thematic names concise without modifying source identity", () => {
  const tour = {title:"Kandyan Heritage, Tea Country, Wildlife Safari & Southern Shores — 8-Day Kandy Leisure | 07 NIGHTS 08 DAYS"};
  const original = tour.title;
  assert.equal(tourDisplayName(tour), "Kandyan Heritage & Tea Country & Wildlife Safari");
  assert.equal(tour.title, original);
});
test("preserves short names, hyphenated names and non-English text", () => {
  for (const title of ["Explore Sri Lanka", "Self-guided Sri Lanka", "日本の旅"]) assert.equal(tourDisplayName({title}), title);
  assert.equal(tourDisplayName({title:"   Tea   Country  "}), "Tea Country");
  assert.equal(tourDisplayName({title:""}), "Private journey");
});
test("bounds names without phrase delimiters and without breaking surrogate pairs", () => {
  for (const title of ["An exceptionally long private journey through the many beautiful places of Sri Lanka", "🌴".repeat(100)]) {
    const result = tourDisplayName({title});
    assert.ok(Array.from(result).length <= 56);
    assert.ok(result.endsWith("…"));
  }
});
test("formats valid durations without inventing nights", () => {
  assert.equal(tourDurationLabel(8,7), "8 days · 7 nights");
  assert.equal(tourDurationLabel(1,0), "1 day · 0 nights");
  assert.equal(tourDurationLabel(6), "6 days");
  assert.equal(tourDurationLabel(undefined), "Flexible duration");
  assert.equal(tourDurationLabel(-1,NaN), "Flexible duration");
});
