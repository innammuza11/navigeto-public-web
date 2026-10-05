import test from "node:test";
import assert from "node:assert/strict";
import { catalogueSection } from "./catalogue-section.ts";

test("a ready section does not wait for a stalled sibling", async () => {
  const slow = catalogueSection(new Promise<string[]>(() => {}), [], 30);
  assert.deepEqual(await catalogueSection(Promise.resolve(["hotel"]), []), ["hotel"]);
  assert.deepEqual(await slow, []);
});
test("rejected catalogues have a bounded fallback", async () => {
  assert.deepEqual(await catalogueSection(Promise.reject(new Error("unavailable")), []), []);
});
test("late results cannot replace the timeout result", async () => {
  let finish!: (value: string[]) => void;
  const pending = new Promise<string[]>(resolve => { finish = resolve; });
  const result = catalogueSection(pending, [], 5);
  assert.deepEqual(await result, []);
  finish(["late"]);
  assert.deepEqual(await result, []);
});
