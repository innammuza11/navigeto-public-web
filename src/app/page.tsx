import type { Metadata } from "next";
import { HomeSections } from "@/components/page-sections";
import { SiteShell } from "@/components/site-shell";
import { seoMetadata } from "@/lib/seo";
import { AnswerFaq } from "@/components/answer-faq";
import { HUB_FAQS } from "@/lib/answer-engine";
export const metadata: Metadata = seoMetadata("/");
export default function Home(){return <SiteShell><HomeSections/><AnswerFaq {...HUB_FAQS["/"]}/></SiteShell>}
