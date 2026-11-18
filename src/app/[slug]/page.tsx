import { LegalPage, ProductPage } from "@/components/page-sections";
import { SiteShell } from "@/components/site-shell";
import { pages, type PageKey } from "@/lib/site-data";
import { notFound } from "next/navigation";
import { TourResults } from "@/components/commerce-ui";
import { TourIndex } from "@/components/tour-index";
import { NaviAssistantPage } from "@/components/navi-chat";
import { seoMetadata, STATIC_SEO } from "@/lib/seo";
// Rebuild from the live tour catalogue at most every 10 minutes, so publishing,
// unpublishing or renaming a package reaches the site without a new deploy.
export const revalidate = 600;

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params; const path=`/${slug}`;
 return STATIC_SEO[path] ? seoMetadata(path) : {title:{absolute:"Page not found | Navigeto Travels"},robots:{index:false,follow:false}};
}

export function generateStaticParams(){return [...Object.keys(pages), "privacy", "terms", "trip-assistant"].map(slug=>({slug}))}
export default async function DynamicPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(slug==="privacy"||slug==="terms") return <SiteShell><LegalPage kind={slug}/></SiteShell>;
 if(slug==="trip-assistant") return <SiteShell hideNavi><NaviAssistantPage/></SiteShell>;
 if(slug==="tours") return <SiteShell><TourResults/><TourIndex/></SiteShell>;
 if(!(slug in pages))notFound();
 return <SiteShell><ProductPage kind={slug} data={pages[slug as PageKey]}/></SiteShell>;
}
import type { Metadata } from "next";
