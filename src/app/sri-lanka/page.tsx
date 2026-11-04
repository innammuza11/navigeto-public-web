/* eslint-disable @next/next/no-img-element -- static watercolour artwork, same as the rest of the editorial pages */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { seoMetadata } from "@/lib/seo";

export const metadata: Metadata = seoMetadata("/sri-lanka", {
  title: { absolute: "Sri Lanka Destinations & Travel Guides | Navigeto Travels" },
  description: "Plan your Sri Lanka route with Navigeto's destination guides: Kandy, Sigiriya, Nuwara Eliya, Ella, Yala, Galle, Mirissa and Bentota.",
});

export default function SriLankaDestinationsPage() {
  return <SiteShell>
    <section className="inner-hero"><div className="shell inner-grid">
      <div><p className="eyebrow">Sri Lanka destinations</p><h1>Where to go in Sri Lanka.</h1><p className="lede">Ancient cities, tea country, wildlife and beaches. Read about each place, then let our Sri Lanka team build a private route around your dates.</p><div className="hero-actions"><Link className="button button-gold" href="/custom-trip?from=%2Fsri-lanka">Plan my Sri Lanka trip</Link><Link className="button button-soft" href="/itineraries">See suggested itineraries</Link></div></div>
      <div className="editorial-intro-art"><img src="/art/watercolour/sri-lanka.webp" width={600} height={400} alt="" loading="eager" decoding="async"/></div>
    </div></section>
    <section className="section shell"><div className="card-grid destination-hub">{DESTINATION_GUIDES.map(guide => <Link className="rich-card" key={guide.slug} href={`/sri-lanka/${guide.slug}`}><img src={`/art/watercolour/${guide.art}.webp`} width={600} height={400} alt="" loading="lazy" decoding="async"/><span>{guide.region}</span><h2>{guide.name}</h2><p>{guide.intro.split(". ")[0]}.</p><b className="text-link">Read the {guide.name} guide →</b></Link>)}</div></section>
  </SiteShell>;
}
