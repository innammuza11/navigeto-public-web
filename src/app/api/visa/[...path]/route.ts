import { buildAdminVisaUrl, isAllowedVisaPath } from "../route-helpers.ts";
import { buildVisaProxyIdentity } from "../proxy-identity.ts";
import { VISA_IDENTITY_HEADER } from "../visitor-identity-protocol.ts";

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const joined = path.join("/");
  if (!isAllowedVisaPath(joined)) {
    return Response.json({ ok: false, error: "Unknown Visa service." }, { status: 404 });
  }
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const intakeToken = request.headers.get("x-visa-intake-token");
  if (contentType) headers.set("content-type", contentType);
  if (intakeToken) headers.set("x-visa-intake-token", intakeToken);
  headers.set("accept", "application/json");
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  const upstream = buildAdminVisaUrl(request.url, joined);
  try {
    headers.set(VISA_IDENTITY_HEADER, buildVisaProxyIdentity(request, upstream));
  } catch {
    return Response.json({ ok: false, error: "The Visa service is temporarily unavailable. Please try again shortly." }, {
      status: 503, headers: { "cache-control": "no-store", "retry-after": "60" },
    });
  }
  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    redirect: "error",
  });
  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") || "application/json", "cache-control": "no-store",
      ...(response.headers.has("retry-after") ? { "retry-after": response.headers.get("retry-after")! } : {}),
    },
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
