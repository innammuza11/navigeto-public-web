import { createHmac, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const COOKIE = "navigeto_demo_pass";
const upstream = "https://admin.navigeto.com/api/travelos-demo-pass";
const json = (value: unknown, status = 200) => NextResponse.json(value, {status, headers: {"Cache-Control":"private, no-store", "Referrer-Policy":"no-referrer"}});
async function call(method: string, body?: unknown) {
  const key = process.env.TRAVELOS_DEMO_PASS_API_KEY;
  if (!key || key.length < 32) throw new Error("The paid demo is being prepared. You can explore the free preview meanwhile.");
  const result = await fetch(upstream, {method, headers: {Authorization: `Bearer ${key}`, "Content-Type":"application/json"}, body: body ? JSON.stringify(body) : undefined, cache:"no-store", signal:AbortSignal.timeout(30000)});
  const data = await result.json(); return {data, status: result.status};
}
export async function GET() {
  try {const result=await call("GET");return json(result.data,result.status);} catch {return json({enabled:false, cardEnabled:false, amount:10,currency:"USD",hours:48});}
}
export async function POST(request: NextRequest) {
  const origin=request.headers.get("origin");
  // Canonical domains and deploy previews must match the actual host. Never accept a third-party origin.
  const host=request.headers.get("host");
  if (!origin || new URL(origin).host !== host) return json({error:"Invalid request origin."},403);
  if (Number(request.headers.get("content-length")||0)>12000) return json({error:"Request too large."},413);
  try {
    const raw=await request.text();if(raw.length>12000)return json({error:"Request too large."},413);
    const input=JSON.parse(raw);const action=input.action;
    if(!["create","status","card","open","receipt-notice"].includes(action))return json({error:"Unsupported request."},400);
    const saved=request.cookies.get(COOKIE)?.value;const valid=saved && /^[A-Za-z0-9_-]{43}$/.test(saved);
    if(action!=="create"&&!valid)return json({error:"No demo request found in this browser. Contact us with your reference if you need help."},404);
    const token=valid?saved:randomBytes(32).toString("base64url");
    const key=process.env.TRAVELOS_DEMO_PASS_API_KEY||"";
    const ip=request.headers.get("x-nf-client-connection-ip")||"unavailable";
    const body=action==="create"?{action,request:{customerName:input.customerName,agencyName:input.agencyName,email:input.email,phone:input.phone,paymentMethod:input.paymentMethod,termsAccepted:input.termsAccepted,termsVersion:input.termsVersion,token,ipHash:createHmac("sha256",key).update(ip).digest("hex")}}:{action,token};
    const result=await call("POST",body);const response=json(result.data,result.status);
    // Set even on a retryable creation error, so retries remain idempotent.
    if(action==="create")response.cookies.set(COOKIE,token!,{httpOnly:true,secure:request.nextUrl.protocol==="https:",sameSite:"lax",path:"/api/travelos-demo-pass",maxAge:60*60*24*30});
    return response;
  }catch{return json({error:"The request could not be completed. Please retry or contact Navigeto."},503);}
}
