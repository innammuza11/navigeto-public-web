const ADMIN_ORIGIN = process.env.TRAVELOS_ADMIN_ORIGIN || "https://admin.navigeto.com";

const ALLOWED = [
  /^catalog$/,
  /^countries$/,
  /^check$/,
  /^intake$/,
  /^intake\/[^/]+\/documents$/,
  /^intake\/[^/]+\/passport\/confirm$/,
  /^intake\/[^/]+\/submit$/,
  /^portal\/[^/]+$/,
  /^intake\/[^/]+\/documents\/[^/]+$/,
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
