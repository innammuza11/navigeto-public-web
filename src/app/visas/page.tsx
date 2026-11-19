import { SiteShell } from "@/components/site-shell";
import { VisaStorefront } from "@/components/visa-storefront";
import { VisaDestinationIndex } from "@/components/visa-destination-index";
import { seoMetadata } from "@/lib/seo";
import { AnswerFaq } from "@/components/answer-faq";
import { HUB_FAQS } from "@/lib/answer-engine";

export const metadata = seoMetadata("/visas");

export const revalidate = 21600;

export default function Page() {
  return <SiteShell><VisaStorefront /><VisaDestinationIndex /><AnswerFaq {...HUB_FAQS["/visas"]}/></SiteShell>;
}
