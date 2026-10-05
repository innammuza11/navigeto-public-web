import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("collapsed filters remain mounted so form submission preserves their values", () => {
  const source = readFileSync(new URL("../components/module-search.tsx", import.meta.url), "utf8");
  assert.match(source, /\[advanced, setAdvanced\] = useState\(false\)/);
  assert.match(source, /hidden=\{!advanced\}/);
  assert.doesNotMatch(source, /advanced && <div/);
  for (const value of ["All Markets", "Local", "Asia Middle East"]) assert.ok(source.includes(`value="${value}"`));
});
