import { createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

// Server-side only. Shared protocol copied identically into both repositories.
export const VISA_IDENTITY_HEADER = "x-navigeto-visa-identity";
export function validIdentityKey(key: string | undefined): key is string {
  return typeof key === "string" && /^[a-f0-9]{64}$/.test(key);
}
export function visitorHash(headers: Headers, key: string, netlify: boolean): string | null {
  if (!netlify || !validIdentityKey(key)) return null;
  const ip = headers.get("x-nf-client-connection-ip");
  if (!ip || ip !== ip.trim() || ip.includes("%") || !isIP(ip)) return null;
  const normalized = isIP(ip) === 6 ? new URL("http://[" + ip + "]").hostname : ip;
  return createHmac("sha256", key).update("visa-visitor-v1:" + normalized).digest("hex");
}
function requestTarget(url: string) {
  const parsed = new URL(url);
  return parsed.pathname + parsed.search;
}
export function signVisitorIdentity(hash: string, method: string, url: string, key: string, now = Date.now()) {
  if (!validIdentityKey(key) || !/^[a-f0-9]{64}$/.test(hash)) throw new Error("Visa identity unavailable");
  const payload = Buffer.from(JSON.stringify([1, Math.floor(now / 1000), method.toUpperCase(), requestTarget(url), hash])).toString("base64url");
  if (payload.length > 2048) throw new Error("Visa identity target too long");
  return payload + "." + createHmac("sha256", key).update("visa-proxy-v1:" + payload).digest("hex");
}
export function verifyVisitorIdentity(header: string, method: string, url: string, key: string, now = Date.now()): string | null {
  if (!validIdentityKey(key) || header.length > 2113) return null;
  const parts = header.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1])) return null;
  const expected = createHmac("sha256", key).update("visa-proxy-v1:" + parts[0]).digest();
  if (!timingSafeEqual(expected, Buffer.from(parts[1], "hex"))) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (!Array.isArray(payload) || payload.length !== 5 || payload[0] !== 1 ||
        !Number.isSafeInteger(payload[1]) || payload[1] > Math.floor(now / 1000) + 5 ||
        payload[1] < Math.floor(now / 1000) - 60 || payload[2] !== method.toUpperCase() ||
        payload[3] !== requestTarget(url) || typeof payload[4] !== "string" ||
        !/^[a-f0-9]{64}$/.test(payload[4])) return null;
    return payload[4];
  } catch { return null; }
}
