import type { Metadata } from "next";
import { TourResults } from "@/components/commerce-ui";
import { SiteShell } from "@/components/site-shell";
import { seoMetadata } from "@/lib/seo";
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const {category}=await params;const label=category.replace(/-/g," ");return seoMetadata(`/tours/${category}`,{title:{absolute:`${label.replace(/\b\w/g,c=>c.toUpperCase())} Tours | Navigeto Travels`},description:`Explore Navigeto's published ${label} tour ideas and personalise the route, pace, hotels and experiences.`});}
export default function TourCategory(){return <SiteShell><TourResults/></SiteShell>}
