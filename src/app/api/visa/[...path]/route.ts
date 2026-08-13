const ADMIN_ORIGIN = process.env.TRAVELOS_ADMIN_ORIGIN || "https://admin.navigeto.com";
const ALLOWED = [
  /^catalog$/,
  /^countries$/,
  /^check$/,
  /^intake$/,
  /^intake\/[^/]+\/documents$/,
  /^intake\/[^/]+\/submit$/,
  /^portal\/[^/]+$/,
  /^intake\/[^/]+\/documents\/[^/]+$/,
];

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const joined = path.join("/");
  if (!ALLOWED.some((pattern) => pattern.test(joined))) {
    return Response.json({ ok: false, error: "Unknown Visa service." }, { status: 404 });
  }
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const intakeToken = request.headers.get("x-visa-intake-token");
  if (contentType) headers.set("content-type", contentType);
  if (intakeToken) headers.set("x-visa-intake-token", intakeToken);
  headers.set("accept", "application/json");
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  const response = await fetch(`${ADMIN_ORIGIN}/api/visa/${joined}`, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });
  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") || "application/json", "cache-control": "no-store" },
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
