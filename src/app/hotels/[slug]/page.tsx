import { HotelDetail } from "@/components/hotel-detail";
import { SiteShell } from "@/components/site-shell";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <SiteShell><HotelDetail key={slug} slug={slug}/></SiteShell>}
