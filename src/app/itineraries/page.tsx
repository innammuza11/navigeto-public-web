import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { ITINERARY_GUIDES } from "@/lib/itinerary-guides";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata("/itineraries", {
  title: { absolute: "Sri Lanka Itineraries: 7, 10 & 14 Days | Navigeto Travels" },
  description: "Day-by-day Sri Lanka itineraries for one week, ten days and two weeks, plus honeymoon and family routes. Tailor any of them with Navigeto.",
});

export default function ItinerariesPage() {
  return <SiteShell>
    <section className="inner-hero"><div className="shell">
      <p className="eyebrow">Sri Lanka itineraries</p><h1>How long do you have?</h1>
      <p className="lede">Start from a proven route, then let our Sri Lanka team adjust the nights, hotels and pace to suit you.</p>
      <div className="hero-actions"><Link className="button button-gold" href="/custom-trip?from=%2Fitineraries">Plan my own route</Link><Link className="button button-soft" href="/sri-lanka">Read the destination guides</Link></div>
    </div></section>
    <section className="section shell"><div className="card-grid">{ITINERARY_GUIDES.map(guide => <Link className="rich-card itinerary-card" key={guide.slug} href={`/itineraries/${guide.slug}`}><span>Suggested route</span><h2>{guide.name}</h2><p>{guide.intro.split(". ")[0]}.</p><b className="text-link">See the route →</b></Link>)}</div></section>
  </SiteShell>;
}
