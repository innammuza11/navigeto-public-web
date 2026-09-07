import { signVisitorIdentity, validIdentityKey, visitorHash } from "./visitor-identity-protocol.ts";

export function buildVisaProxyIdentity(request: Request, upstream: URL, key = process.env.VISA_PROXY_IDENTITY_SECRET, netlify = process.env.NETLIFY === "true") {
  if (upstream.protocol !== "https:" || upstream.username || upstream.password ||
      !(upstream.hostname === "admin.navigeto.com" || /^[a-f0-9]{24}--navigeto-next\.netlify\.app$/.test(upstream.hostname)) ||
      !upstream.pathname.startsWith("/api/visa/")) throw new Error("Unapproved Visa upstream");
  if (!validIdentityKey(key)) throw new Error("Visa identity unavailable");
  // Never use caller-supplied forwarding or signed-identity headers.
  const hash = visitorHash(request.headers, key, netlify);
  if (!hash) throw new Error("Visa visitor unavailable");
  return signVisitorIdentity(hash, request.method, upstream.href, key);
}
