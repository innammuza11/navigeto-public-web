import test from "node:test";
import assert from "node:assert/strict";
import { createGoogleTagQueue, isWhatsAppLink } from "./google-tag-queue.ts";

test("queues native Arguments commands recognised by the Google bootstrap", () => {
  const layer: unknown[] = [];
  const tag = createGoogleTagQueue(layer);
  tag("config", "G-TEST", { send_page_view: false });
  const entry = layer[0] as IArguments;
  assert.equal(Object.prototype.toString.call(entry), "[object Arguments]");
  assert.equal(Array.isArray(entry), false);
  assert.deepEqual(Array.from(entry), ["config", "G-TEST", { send_page_view: false }]);
});

test("only actual HTTPS WhatsApp hosts qualify", () => {
  assert.equal(isWhatsAppLink("https://wa.me/123?text=private"), true);
  assert.equal(isWhatsAppLink("https://api.whatsapp.com/send?phone=123"), true);
  for (const bad of ["https://wa.me.evil.test/", "https://evil.test/wa.me", "javascript:wa.me", "/contact", "http://wa.me/123"]) assert.equal(isWhatsAppLink(bad), false);
});
