const ADMIN_ORIGIN = process.env.TRAVELOS_ADMIN_ORIGIN || "https://admin.navigeto.com";

// One path segment: an id or signed token (base64url, may contain "."), never
// "." / ".." and never "\\" or "%" — new URL() treats "\\" as "/" and resolves
// "..", which let "portal/..\\admin\\overview" escape the allowlist.
const SEG = String.raw`(?!\.{1,2}(?:/|$))[A-Za-z0-9_.-]{1,512}`;
const exact = (pattern: string) => new RegExp(`^${pattern.replaceAll("SEG", SEG)}$`);

const ALLOWED = [
  exact("catalog"),
  exact("countries"),
  exact("check"),
  exact("intake"),
  exact("intake/SEG/documents"),
  exact("intake/SEG/passport/confirm"),
  exact("intake/SEG/submit"),
  exact("portal/SEG"),
  exact("intake/SEG/documents/SEG"),
];

export function isAllowedVisaPath(path: string) {
  return ALLOWED.some((pattern) => pattern.test(path));
}

export function buildAdminVisaUrl(requestUrl: string, path: string) {
  const incoming = new URL(requestUrl);
  const upstream = new URL(`/api/visa/${path}`, ADMIN_ORIGIN);
  upstream.search = incoming.search;
  return upstream;
}
