import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConnectedEnquiryForm } from "@/components/page-sections";
import { SiteShell } from "@/components/site-shell";
import { guideBySlug } from "@/lib/destination-guides";
import { ITINERARY_GUIDES, itineraryBySlug, itineraryJsonLd, toursForItinerary } from "@/lib/itinerary-guides";
import { seoMetadata, SITE_URL } from "@/lib/seo";
import { allPublishedTours } from "@/lib/tour-catalogue";
import { tourDisplayName, tourDurationLabel } from "@/lib/tour-presentation";

export const dynamicParams = false;
export function generateStaticParams() { return ITINERARY_GUIDES.map(guide => ({ slug: guide.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = itineraryBySlug((await params).slug);
  if (!guide) return {};
  const path = `/itineraries/${guide.slug}`;
  return seoMetadata(path, {
    title: { absolute: guide.metaTitle },
    description: guide.metaDescription,
    openGraph: { title: guide.metaTitle, description: guide.metaDescription, url: path, type: "article", images: [{ url: "/og.png", width: 1200, height: 630, alt: guide.name }] },
    twitter: { card: "summary_large_image", title: guide.metaTitle, description: guide.metaDescription, images: ["/og.png"] },
  });
}

export default async function ItineraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = itineraryBySlug((await params).slug);
  if (!guide) notFound();
  const tours = toursForItinerary(await allPublishedTours().catch(() => []), guide);
  const others = ITINERARY_GUIDES.filter(other => other.slug !== guide.slug);
  const path = `/itineraries/${guide.slug}`;
  return <SiteShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itineraryJsonLd(SITE_URL, guide)).replace(/</g, "\\u003c") }}/>
    <section className="inner-hero"><div className="shell">
      <p className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/itineraries">Sri Lanka itineraries</Link> / {guide.name}</p>
      <p className="eyebrow">Suggested route · private car and chauffeur</p>
      <h1>{guide.headline}</h1>
      <p className="lede">{guide.intro}</p>
      <div className="hero-actions"><a href="#enquire" className="button button-gold">Get a quote for this route</a>{tours.length ? <a href="#tours" className="button button-soft">See {tours.length} ready-made tour{tours.length === 1 ? "" : "s"}</a> : null}</div>
      <ul className="itinerary-suits">{guide.suits.map(item => <li key={item}>{item}</li>)}</ul>
    </div></section>

    <section className="section shell"><div className="section-title"><p className="eyebrow">Day by day</p><h2>The route.</h2></div>
      <ol className="itinerary-days">{guide.days.map(day => {
        const stop = day.stop ? guideBySlug(day.stop) : null;
        return <li key={day.day}><span>{day.day}</span><div><h3>{day.title}</h3><p>{day.copy}</p>{stop ? <Link className="text-link" href={`/sri-lanka/${stop.slug}`}>{stop.name} guide →</Link> : null}</div></li>;
      })}</ol>
    </section>

    <section className="section pale"><div className="shell"><div className="section-title"><p className="eyebrow">Good to know</p><h2>Tips for this route.</h2></div><ul className="itinerary-tips">{guide.tips.map(tip => <li key={tip}>{tip}</li>)}</ul></div></section>

    {tours.length ? <section className="section shell" id="tours"><div className="section-title"><p className="eyebrow">Ready-made versions</p><h2>Published tours of a similar length.</h2><p>Each one can be adjusted: nights, hotels, pace and stops.</p></div>
      <ul className="destination-tours">{tours.slice(0, 12).map(tour => <li key={tour.slug}><Link prefetch={false} href={`/tours/package/${tour.slug}`}>{tourDisplayName(tour)}</Link><small>{tourDurationLabel(tour.duration_days, tour.duration_nights)}</small></li>)}</ul>
    </section> : null}

    <section className="section shell destination-faq"><div className="section-title"><p className="eyebrow">Questions</p><h2>{guide.name}: answers.</h2></div>
      {guide.faqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
    </section>

    <section className="section shell" id="enquire"><div className="enquiry-card"><div><p className="eyebrow">Make it yours</p><h2>Get a quote for this route.</h2><p>Tell us your dates and who is travelling. A Sri Lanka specialist will tailor the route, suggest hotels and send a clear quotation.</p></div><ConnectedEnquiryForm kind="custom-trip" subject={`itinerary enquiry: ${guide.name}`} sourcePage={path}/></div></section>

    <section className="section shell"><div className="section-title"><p className="eyebrow">Other ideas</p><h2>More Sri Lanka itineraries.</h2></div>
      <div className="destination-pairs">{others.map(other => <Link key={other.slug} href={`/itineraries/${other.slug}`}><span>Itinerary</span><b>{other.name}</b></Link>)}</div>
    </section>
  </SiteShell>;
}
