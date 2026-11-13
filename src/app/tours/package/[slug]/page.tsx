import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourDetail } from "@/components/commerce-ui";
import { SiteShell } from "@/components/site-shell";
import { tours } from "@/lib/commerce-data";
import { liveApi } from "@/lib/live-api";
import { seoMetadata, SITE_URL } from "@/lib/seo";
import { tourJsonLd } from "@/lib/seo-schema";
// Rebuild from the live tour catalogue at most every 10 minutes, so publishing,
// unpublishing or renaming a package reaches the site without a new deploy.
export const revalidate = 600;
export function generateStaticParams(){return tours.map(t=>({slug:t.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const tour=await liveApi.tour(slug).then(r=>r.result).catch(()=>null);const fallback=tours.find(item=>item.slug===slug);if(!tour&&!fallback)return seoMetadata(`/tours/package/${slug}`,{title:{absolute:"Tour not found | Navigeto Travels"},robots:{index:false,follow:false}});const title=tour?.title||fallback?.name||"Private Sri Lanka tour";const description=tour?.summary||`Explore the ${title} private journey and personalise its hotels, pace and experiences with Navigeto.`;return seoMetadata(`/tours/package/${slug}`,{title:{absolute:`${title} | Navigeto Travels`},description,openGraph:{title,description,url:`/tours/package/${slug}`,type:"website",images:tour?.hero_image_url?[{url:tour.hero_image_url,alt:title}]:[{url:"/og.png",alt:"Navigeto Travels"}]}});}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const lookup=await liveApi.tour(slug).then(r=>({answered:true,tour:r.result})).catch(()=>({answered:false,tour:null}));const tour=lookup.tour;const fallback=tours.find(item=>item.slug===slug);
// A package the catalogue confirms is gone (unpublished or never existed) is a real 404.
// If the catalogue could not be reached, keep rendering so a brief outage never removes pages.
if(lookup.answered&&!tour&&!fallback)notFound();
const schema=tour?tourJsonLd(SITE_URL,tour):fallback?tourJsonLd(SITE_URL,{slug,title:fallback.name,tags:[fallback.tag].filter(Boolean)}):null;return <SiteShell>{schema?<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>:null}<TourDetail slug={slug} initialTour={tour}/></SiteShell>}
