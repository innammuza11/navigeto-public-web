import { ReviewShowcase } from "@/components/review-showcase";
import { SiteShell } from "@/components/site-shell";
import { seoMetadata } from "@/lib/seo";

export const metadata = seoMetadata("/reviews");

export default function ReviewsPage() {
  return <SiteShell>
    <section className="commerce-hero"><div className="shell"><p className="eyebrow">Navigeto Travels</p><h1>Journeys remembered.<br />Experiences shared.</h1><p>Independent customer reviews, all in one place.</p></div></section>
    <ReviewShowcase/>
  </SiteShell>;
}
