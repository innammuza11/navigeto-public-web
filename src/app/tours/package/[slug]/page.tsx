import { TourDetail } from "@/components/commerce-ui";
import { SiteShell } from "@/components/site-shell";
import { tours } from "@/lib/commerce-data";
export function generateStaticParams(){return tours.map(t=>({slug:t.slug}))}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <SiteShell><TourDetail slug={slug}/></SiteShell>}
