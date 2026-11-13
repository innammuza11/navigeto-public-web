/* eslint-disable @next/next/no-img-element -- static watercolour artwork, same as the rest of the editorial pages */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConnectedEnquiryForm } from "@/components/page-sections";
import { SiteShell } from "@/components/site-shell";
import { DESTINATION_GUIDES, guideBySlug, guideJsonLd, toursForGuide } from "@/lib/destination-guides";
import { seoMetadata, SITE_URL } from "@/lib/seo";
import { allPublishedTours } from "@/lib/tour-catalogue";
import { tourDisplayName, tourDurationLabel } from "@/lib/tour-presentation";
// Rebuild from the live tour catalogue at most every 10 minutes, so publishing,
// unpublishing or renaming a package reaches the site without a new deploy.
export const revalidate = 600;

export const dynamicParams = false;
export function generateStaticParams() { return DESTINATION_GUIDES.map(guide => ({ place: guide.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ place: string }> }): Promise<Metadata> {
  const guide = guideBySlug((await params).place);
  if (!guide) return {};
  const path = `/sri-lanka/${guide.slug}`;
  const image = `/art/watercolour/${guide.art}.webp`;
  return seoMetadata(path, {
    title: { absolute: guide.metaTitle },
    description: guide.metaDescription,
    openGraph: { title: guide.metaTitle, description: guide.metaDescription, url: path, type: "article", images: [{ url: image, alt: guide.name }] },
    twitter: { card: "summary_large_image", title: guide.metaTitle, description: guide.metaDescription, images: [image] },
  });
}

export default async function DestinationGuidePage({ params }: { params: Promise<{ place: string }> }) {
  const guide = guideBySlug((await params).place);
  if (!guide) notFound();
  const tours = toursForGuide(await allPublishedTours().catch(() => []), guide);
  const pairs = guide.pairWith.map(slug => guideBySlug(slug)!).filter(Boolean);
  const path = `/sri-lanka/${guide.slug}`;
  return <SiteShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd(SITE_URL, guide)).replace(/</g, "\\u003c") }}/>
    <section className="inner-hero destination-guide-hero"><div className="shell inner-grid">
      <div>
        <p className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/sri-lanka">Sri Lanka destinations</Link> / {guide.name}</p>
        <p className="eyebrow">{guide.region} · Sri Lanka</p>
        <h1>{guide.headline}</h1>
        <p className="lede">{guide.intro}</p>
        <div className="hero-actions"><a href="#enquire" className="button button-gold">Plan a trip with {guide.name.split(" ")[0]}</a>{tours.length ? <a href="#tours" className="button button-soft">See {tours.length} published tour{tours.length === 1 ? "" : "s"}</a> : null}</div>
      </div>
      <div className="editorial-intro-art"><img src={`/art/watercolour/${guide.art}.webp`} width={600} height={400} alt="" loading="eager" decoding="async"/></div>
    </div></section>

    <section className="section shell"><div className="section-title"><p className="eyebrow">What to see</p><h2>The highlights of {guide.name}.</h2></div>
      <div className="card-grid destination-highlights">{guide.highlights.map((item, index) => <article className="rich-card" key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
    </section>

    <section className="section pale"><div className="shell destination-facts">
      <div><p className="eyebrow">When to go</p><h3>Best time to visit</h3><p>{guide.bestTime}</p></div>
      <div><p className="eyebrow">How long</p><h3>How many nights</h3><p>{guide.stay}</p></div>
      <div><p className="eyebrow">Getting there</p><h3>Travel by private car</h3><p>{guide.gettingThere}</p></div>
    </div></section>

    {tours.length ? <section className="section shell" id="tours"><div className="section-title"><p className="eyebrow">Published Navigeto journeys</p><h2>Private tours that include {guide.name}.</h2><p>Every route can be changed: the number of nights, hotels, pace and stops.</p></div>
      <ul className="destination-tours">{tours.slice(0, 12).map(tour => <li key={tour.slug}><Link prefetch={false} href={`/tours/package/${tour.slug}`}>{tourDisplayName(tour)}</Link><small>{tourDurationLabel(tour.duration_days, tour.duration_nights)}</small></li>)}</ul>
      {tours.length > 12 ? <p><Link className="text-link" href="/tours/sri-lanka">See all Sri Lanka journeys →</Link></p> : null}
    </section> : null}

    <section className="section shell destination-faq"><div className="section-title"><p className="eyebrow">Good to know</p><h2>{guide.name} questions, answered.</h2></div>
      {guide.faqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
    </section>

    <section className="section shell" id="enquire"><div className="enquiry-card"><div><p className="eyebrow">Start planning</p><h2>Add {guide.name} to your Sri Lanka trip.</h2><p>Tell us your dates and who is travelling. A Sri Lanka specialist will suggest a route, hotels and a private car, with a clear quotation.</p></div><ConnectedEnquiryForm kind="custom-trip" subject={`destination guide enquiry: ${guide.name}`} sourcePage={path}/></div></section>

    <section className="section shell"><div className="section-title"><p className="eyebrow">Pairs well with</p><h2>Continue your route.</h2></div>
      <div className="destination-pairs">{pairs.map(pair => <Link key={pair.slug} href={`/sri-lanka/${pair.slug}`}><span>{pair.region}</span><b>{pair.name}</b></Link>)}<Link href="/sri-lanka"><span>All guides</span><b>Sri Lanka destinations</b></Link></div>
    </section>
  </SiteShell>;
}
