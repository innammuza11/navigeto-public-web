import type { Metadata } from "next";
import { TourDetail } from "@/components/commerce-ui";
import { SiteShell } from "@/components/site-shell";
import { tours } from "@/lib/commerce-data";
import { liveApi } from "@/lib/live-api";
import { seoMetadata, SITE_URL } from "@/lib/seo";
import { tourJsonLd } from "@/lib/seo-schema";
export function generateStaticParams(){return tours.map(t=>({slug:t.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const tour=await liveApi.tour(slug).then(r=>r.result).catch(()=>null);const fallback=tours.find(item=>item.slug===slug);if(!tour&&!fallback)return seoMetadata(`/tours/package/${slug}`,{title:{absolute:"Tour not found | Navigeto Travels"},robots:{index:false,follow:false}});const title=tour?.title||fallback?.name||"Private Sri Lanka tour";const description=tour?.summary||`Explore the ${title} private journey and personalise its hotels, pace and experiences with Navigeto.`;return seoMetadata(`/tours/package/${slug}`,{title:{absolute:`${title} | Navigeto Travels`},description,openGraph:{title,description,url:`/tours/package/${slug}`,type:"website",images:tour?.hero_image_url?[{url:tour.hero_image_url,alt:title}]:[{url:"/og.png",alt:"Navigeto Travels"}]}});}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const tour=await liveApi.tour(slug).then(r=>r.result).catch(()=>null);const fallback=tours.find(item=>item.slug===slug);const schema=tour?tourJsonLd(SITE_URL,tour):fallback?tourJsonLd(SITE_URL,{slug,title:fallback.name,tags:[fallback.tag].filter(Boolean)}):null;return <SiteShell>{schema?<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>:null}<TourDetail slug={slug} initialTour={tour}/></SiteShell>}
