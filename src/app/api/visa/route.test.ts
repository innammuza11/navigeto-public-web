import assert from "node:assert/strict";
import test from "node:test";

import { buildAdminVisaUrl, isAllowedVisaPath } from "./route-helpers.ts";
import { buildVisaProxyIdentity } from "./proxy-identity.ts";
import { isTrustedVisaRuntime } from "./runtime-identity.ts";
import { verifyVisitorIdentity, visitorHash } from "./visitor-identity-protocol.ts";
import { POST as forwardVisa } from "./[...path]/route.ts";

test("runtime identity requires the exact public site and name, not a build flag", () => {
  const valid = { SITE_ID: "db6d1981-151c-421e-8692-7412da9f85e3", SITE_NAME: "navigeto-b2c" };
  assert.equal(isTrustedVisaRuntime("public", valid), true);
  for (const env of [{}, { SITE_ID: valid.SITE_ID }, { ...valid, SITE_NAME: "other" }, { ...valid, SITE_ID: "66f75c9a-c466-43fc-94c7-740db6eaab6e" }]) {
    assert.equal(isTrustedVisaRuntime("public", env), false);
  }
});

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

test("proxy derives identity from platform IP and ignores caller identity headers", () => {
  const key = "1".repeat(64);
  const upstream = new URL("https://admin.navigeto.com/api/visa/check?country=LK");
  const request = new Request("https://navigeto.com/api/visa/check", { method: "POST", headers: {
    "x-nf-client-connection-ip": "192.0.2.1", "x-forwarded-for": "192.0.2.99", "x-navigeto-visa-identity": "forged",
  } });
  const signed = buildVisaProxyIdentity(request, upstream, key, true);
  assert.equal(verifyVisitorIdentity(signed, "POST", upstream.href, key), visitorHash(request.headers, key, true));
  assert.equal(verifyVisitorIdentity(signed, "GET", upstream.href, key), null);
  assert.equal(verifyVisitorIdentity(signed, "POST", upstream.href + "&extra=1", key), null);
});

test("proxy refuses absent ingress identity or key and an unapproved upstream", () => {
  const key = "1".repeat(64), req = new Request("https://navigeto.com/api/visa/check");
  const target = new URL("https://admin.navigeto.com/api/visa/check");
  assert.throws(() => buildVisaProxyIdentity(req, target, key, true));
  assert.throws(() => buildVisaProxyIdentity(req, target, "bad", true));
  assert.throws(() => buildVisaProxyIdentity(req, new URL("https://evil.example/api/visa/check"), key, true));
});

test("proxy handler signs fresh identity, disables redirects and preserves Retry-After", async () => {
  const oldFetch = globalThis.fetch;
  const oldKey = process.env.VISA_PROXY_IDENTITY_SECRET, oldNetlify = process.env.NETLIFY;
  const oldSite = process.env.SITE_ID, oldName = process.env.SITE_NAME;
  const key = "1".repeat(64);
  process.env.VISA_PROXY_IDENTITY_SECRET = key; delete process.env.NETLIFY;
  process.env.SITE_ID = "db6d1981-151c-421e-8692-7412da9f85e3"; process.env.SITE_NAME = "navigeto-b2c";
  let called = 0;
  globalThis.fetch = async (url, init) => {
    called++;
    assert.equal(init?.redirect, "error");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("x-forwarded-for"), null);
    assert.equal(headers.get("x-nf-client-connection-ip"), null);
    assert.notEqual(headers.get("x-navigeto-visa-identity"), "forged");
    assert.ok(verifyVisitorIdentity(headers.get("x-navigeto-visa-identity")!, "POST", String(url), key));
    return Response.json({ ok: false }, { status: 429, headers: { "retry-after": "60" } });
  };
  try {
    const response = await forwardVisa(new Request("https://navigeto.com/api/visa/check?q=LK", {
      method: "POST", body: "{}", headers: { "x-nf-client-connection-ip": "192.0.2.1", "x-navigeto-visa-identity": "forged" },
    }), { params: Promise.resolve({ path: ["check"] }) });
    assert.equal(called, 1); assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "60");
    assert.equal(response.headers.get("cache-control"), "no-store");
    called = 0;
    const blocked = await forwardVisa(new Request("https://navigeto.com/api/visa/check", { method: "POST" }), { params: Promise.resolve({ path: ["check"] }) });
    assert.equal(blocked.status, 503); assert.equal(called, 0);
    process.env.SITE_ID = "66f75c9a-c466-43fc-94c7-740db6eaab6e";
    process.env.NETLIFY = "true";
    const wrongSite = await forwardVisa(new Request("https://navigeto.com/api/visa/check", { method: "POST", headers: { "x-nf-client-connection-ip": "192.0.2.1" } }), { params: Promise.resolve({ path: ["check"] }) });
    assert.equal(wrongSite.status, 503); assert.equal(called, 0);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.VISA_PROXY_IDENTITY_SECRET; else process.env.VISA_PROXY_IDENTITY_SECRET = oldKey;
    if (oldNetlify === undefined) delete process.env.NETLIFY; else process.env.NETLIFY = oldNetlify;
    if (oldSite === undefined) delete process.env.SITE_ID; else process.env.SITE_ID = oldSite;
    if (oldName === undefined) delete process.env.SITE_NAME; else process.env.SITE_NAME = oldName;
  }
});
