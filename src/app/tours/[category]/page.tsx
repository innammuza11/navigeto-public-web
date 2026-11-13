import { SriLankaJourneyMap } from "@/components/journey-map/SriLankaJourneyMap";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { TourResults } from "@/components/commerce-ui";
import { TourIndex } from "@/components/tour-index";
import { SiteShell } from "@/components/site-shell";
import { seoMetadata } from "@/lib/seo";
// Rebuild from the live tour catalogue at most every 10 minutes, so publishing,
// unpublishing or renaming a package reaches the site without a new deploy.
export const revalidate = 600;
// Only these collections exist; any other slug rendered the full catalogue as an indexable duplicate of /tours.
const COLLECTIONS = { "sri-lanka": "Sri Lanka", international: "International" } as const;
type Collection = keyof typeof COLLECTIONS;
const isCollection = (value: string): value is Collection => Object.hasOwn(COLLECTIONS, value);
export function generateStaticParams(){return Object.keys(COLLECTIONS).map(category=>({category}))}
export async function generateMetadata({params}:{params:Promise<{category:string}>}):Promise<Metadata>{const {category}=await params;if(!isCollection(category))return seoMetadata("/tours");const label=COLLECTIONS[category];return seoMetadata(`/tours/${category}`,{title:{absolute:`${label} Tours | Navigeto Travels`},description:`Explore Navigeto's published ${label.toLowerCase()} tour ideas and personalise the route, pace, hotels and experiences.`});}
export default async function TourCategory({params}:{params:Promise<{category:string}>}){const {category}=await params;if(!isCollection(category))permanentRedirect("/tours");return <SiteShell><TourResults exploration={category === "sri-lanka" ? <div className="shell" style={{paddingTop:40,paddingBottom:40}}><SriLankaJourneyMap/></div> : undefined}/><TourIndex scope={category}/></SiteShell>}
