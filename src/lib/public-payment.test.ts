import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedProductionMarxUrl } from "./public-payment.ts";

test("accepts only HTTPS checkout URLs owned by the Marx production domain", () => {
  assert.equal(isTrustedProductionMarxUrl("https://payment.marx.lk/order/123"), true);
  assert.equal(isTrustedProductionMarxUrl("https://secure.payment.marx.lk/?tr=123"), true);
  assert.equal(isTrustedProductionMarxUrl("https://ipg.dev.marxpos.com/?tr=123"), false);
  assert.equal(isTrustedProductionMarxUrl("http://payment.marx.lk/order/123"), false);
  assert.equal(isTrustedProductionMarxUrl("https://marx.lk.evil.example/order/123"), false);
  assert.equal(isTrustedProductionMarxUrl("not-a-url"), false);
});
