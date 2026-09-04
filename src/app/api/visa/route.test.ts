import assert from "node:assert/strict";
import test from "node:test";

import { buildAdminVisaUrl, isAllowedVisaPath } from "./route-helpers.ts";

test("allows every Visa path used by the storefront", () => {
  for (const path of ["catalog", "countries", "check", "intake", "intake/a/documents", "intake/a/documents/b", "intake/a/passport/confirm", "intake/a/submit", "portal/token"]) {
    assert.equal(isAllowedVisaPath(path), true, path);
  }
});

test("rejects admin and path-confusion variants", () => {
  for (const path of ["admin/overview", "intake//submit", "../catalog", "intake/a/passport/confirm/extra"]) {
    assert.equal(isAllowedVisaPath(path), false, path);
  }
});

test("preserves query parameters upstream", () => {
  const url = buildAdminVisaUrl("https://navigeto.com/api/visa/catalog?market=LK&page=2", "catalog");
  assert.equal(url.toString(), "https://admin.navigeto.com/api/visa/catalog?market=LK&page=2");
});
