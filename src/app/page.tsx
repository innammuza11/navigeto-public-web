import type { Metadata } from "next";
import { HomeSections } from "@/components/page-sections";
import { SiteShell } from "@/components/site-shell";
import { seoMetadata } from "@/lib/seo";
export const metadata: Metadata = seoMetadata("/");
export default function Home(){return <SiteShell><HomeSections/></SiteShell>}
