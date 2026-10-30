import { publicBuilderResponse } from '@/lib/tour-builder-response';
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
export const runtime='nodejs';
const COOKIE='navigeto-tour-draft-session';
async function forward(request:Request) {
  if(process.env.PUBLIC_TOUR_BUILDER_ENABLED!=='true' || !process.env.PUBLIC_TOUR_BUILDER_PROXY_KEY) return Response.json({error:'The package builder is awaiting release approval.'},{status:503});
  if(request.method==='POST' && request.headers.get('origin') !== new URL(request.url).origin) return Response.json({error:'Please submit from the Navigeto package builder.'},{status:403});
  const store=await cookies();const existing=store.get(COOKIE)?.value;
  const session=existing && /^[0-9a-f-]{36}$/.test(existing)?existing:randomUUID();
  const upstream=new URL('/api/public-tour-builder',process.env.TRAVELOS_ADMIN_ORIGIN || 'https://admin.navigeto.com');
  const draft=new URL(request.url).searchParams.get('draft');if(draft) upstream.searchParams.set('draft',draft);
  try {
    const body=request.method==='POST'?await request.text():undefined;
    if(body && body.length>65536) return Response.json({error:'The request is too large.'},{status:413});
    const response=await fetch(upstream,{method:request.method,headers:{'Content-Type':'application/json','x-tour-builder-key':process.env.PUBLIC_TOUR_BUILDER_PROXY_KEY,'x-tour-builder-session':session},body,cache:'no-store',signal:AbortSignal.timeout(30000)});
    const result=await response.json();
    // The server returns an explicit public DTO. Errors from infrastructure are not forwarded.
    const output=Response.json(response.ok?publicBuilderResponse(result):{error:[422,429].includes(response.status) && typeof result.error==='string'?result.error:'The package service is temporarily unavailable.'},{status:response.ok?200:[422,429].includes(response.status)?response.status:503,headers:{'Cache-Control':'private, no-store'}});
    if(!existing) store.set(COOKIE,session,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30});
    return output;
  } catch {return Response.json({error:'The package service is temporarily unavailable. Your saved draft can be reopened when it returns.'},{status:503,headers:{'Cache-Control':'private, no-store'}});}
}
export const GET=forward;
export const POST=forward;
