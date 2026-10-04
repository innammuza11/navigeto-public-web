import test from "node:test";
import assert from "node:assert/strict";
import { trackTravelosConversion } from "./marketing.ts";

test("saved leads route to GA and Ads separately, and respect declined consent", () => {
  const calls: unknown[][] = [];
  let consent = "granted";
  const browser = {
    localStorage: { getItem: (key: string) => key.includes("consent") ? consent : null, setItem: () => {} },
    location: { search: "", origin: "https://example.test", pathname: "/tours", href: "https://example.test/tours" },
    __navigetoMarketingConfig: { googleTagId: "G-TEST", googleAdsConversionId: "AW-TEST", googleAdsConversionLabel: "label", consentRequired: true },
    gtag: (...args: unknown[]) => calls.push(args),
  };
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  Object.defineProperty(globalThis, "document", { configurable: true, value: { referrer: "" } });
  try {
    trackTravelosConversion({ sourceRef: "TEST-SAVED-ENQUIRY" });
    assert.equal(calls.length, 2);
    assert.equal(calls[0][1], "generate_lead");
    assert.equal((calls[0][2] as {send_to: string}).send_to, "G-TEST");
    assert.equal(calls[1][1], "conversion");
    assert.equal((calls[1][2] as {send_to: string}).send_to, "AW-TEST/label");
    consent = "denied";
    trackTravelosConversion({ sourceRef: "DECLINED" });
    assert.equal(calls.length, 2);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else Reflect.deleteProperty(globalThis, "window");
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument); else Reflect.deleteProperty(globalThis, "document");
  }
});
