import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConnectedEnquiryForm } from "@/components/page-sections";
import { SiteShell } from "@/components/site-shell";
import { publicVisaCatalog } from "@/lib/visa-catalog-server";
import { visaDestinations, visaJsonLd, visaPageFaqs } from "@/lib/visa-pages";
import { seoMetadata, SITE_URL } from "@/lib/seo";

export const revalidate = 21600;

async function destinationFor(slug: string) {
  const products = await publicVisaCatalog().catch(() => null);
  if (!products) return { unavailable: true as const };
  return { unavailable: false as const, destination: visaDestinations(products).find(item => item.slug === slug) || null };
}

export async function generateStaticParams() {
  const products = await publicVisaCatalog().catch(() => []);
  return visaDestinations(products).map(item => ({ destination: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ destination: string }> }): Promise<Metadata> {
  const { destination: slug } = await params;
  const result = await destinationFor(slug);
  if (result.unavailable || !result.destination) return seoMetadata(`/visas/${slug}`, { title: { absolute: "Visa assistance | Navigeto Travels" }, robots: { index: false, follow: true } });
  const destination = result.destination;
  const title = `${destination.name} Visa for Sri Lankans | Navigeto Travels`;
  const description = `${destination.name} visa for Sri Lankan passport holders: visa type, required documents and processing guidance, checked by Navigeto's visa desk. Apply online.`;
  return seoMetadata(`/visas/${destination.slug}`, {
    title: { absolute: title },
    description,
    // Only destinations whose requirements are officially verified are indexed.
    robots: destination.verified ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: `/visas/${destination.slug}`, type: "article", images: [{ url: "/og.png", width: 1200, height: 630, alt: `${destination.name} visa` }] },
  });
}

const money = (value: number, currency: string) => `${currency} ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(value)}`;
const date = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Colombo" }).format(new Date(value));

export default async function VisaDestinationPage({ params }: { params: Promise<{ destination: string }> }) {
  const { destination: slug } = await params;
  const result = await destinationFor(slug);
  if (result.unavailable) return <SiteShell><section className="shell section"><div className="notice">Visa details are temporarily unavailable. Please try again shortly or <Link className="text-link" href="/visas">see all visa services</Link>.</div></section></SiteShell>;
  const destination = result.destination;
  if (!destination) notFound();
  const main = destination.products[0];
  const sources = [...new Set(destination.products.flatMap(product => product.documentSourceUrls || []))].filter(url => /^https:\/\//.test(url));
  const faqs = visaPageFaqs(destination);
  const path = `/visas/${destination.slug}`;
  return <SiteShell>
    {destination.verified ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(visaJsonLd(SITE_URL, destination)).replace(/</g, "\\u003c") }}/> : null}
    <section className="inner-hero"><div className="shell">
      <p className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/visas">Visas</Link> / {destination.name}</p>
      <p className="eyebrow">{destination.flag} Visa for Sri Lankan passport holders</p>
      <h1>{destination.name} visa for Sri Lankans.</h1>
      <p className="lede">{main.resultLabel || "A visa is required before travel"}. Navigeto&apos;s visa desk checks the current requirements for your purpose and dates, prepares your checklist and handles the application with you.</p>
      <p className={destination.verified ? "visa-verified" : "visa-review"}>{destination.verified && destination.lastVerifiedAt ? `Requirements checked against official sources on ${date(destination.lastVerifiedAt)}.` : "Requirements are being re-checked. A consultant confirms the current checklist before you apply."}</p>
      <div className="hero-actions"><Link className="button button-gold" href={`/visas?country=${destination.code}#visa-catalogue`}>Start my application</Link><a className="button button-soft" href="#enquire">Ask a visa consultant</a></div>
    </div></section>

    <section className="section shell"><div className="section-title"><p className="eyebrow">Services</p><h2>{destination.products.length === 1 ? "The visa service." : "Choose your visa service."}</h2></div>
      <div className="card-grid">{destination.products.map(product => <article className="rich-card visa-service" key={product.id}>
        <h3>{product.packageName}</h3>
        <ul>
          {product.visaType ? <li>Purpose: {product.visaType}</li> : null}
          {product.entryType ? <li>Entry: {product.entryType}</li> : null}
          {product.maxStayDays ? <li>Stay: up to {product.maxStayDays} days</li> : null}
          {product.processingTime ? <li>Processing: {product.processingTime}</li> : null}
        </ul>
        {product.totalEstimate ? <p><b>From {money(product.totalEstimate, product.currency || "LKR")}</b><br/><small>{product.governmentFeeIncluded ? "Includes the government fee." : "Government fee payable separately where stated."}</small></p> : null}
      </article>)}</div>
    </section>

    {main.requiredDocuments?.length ? <section className="section pale"><div className="shell visa-documents">
      <div><p className="eyebrow">Checklist</p><h2>Documents you will usually need.</h2><ul>{main.requiredDocuments.map(item => <li key={item}>{item}</li>)}</ul></div>
      {main.conditionalDocuments?.length ? <div><p className="eyebrow">Depending on your situation</p><h3>You may also need</h3><ul>{main.conditionalDocuments.map(item => <li key={item.name}><b>{item.name}</b><br/><small>{item.when}</small></li>)}</ul></div> : null}
    </div>{main.financialEvidenceGuidance ? <p className="shell visa-funds">{main.financialEvidenceGuidance}</p> : null}</section> : null}

    <section className="section shell destination-faq"><div className="section-title"><p className="eyebrow">Questions</p><h2>{destination.name} visa: answers.</h2></div>
      {faqs.map(faq => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
      {sources.length ? <p className="visa-sources">Official sources: {sources.map((url, index) => <span key={url}>{index ? ", " : ""}<a href={url} target="_blank" rel="noopener nofollow">{new URL(url).hostname}</a></span>)}</p> : null}
      <p className="visa-sources">Final approval is always decided by the issuing authority, not Navigeto.</p>
    </section>

    <section className="section shell" id="enquire"><div className="enquiry-card"><div><p className="eyebrow">Visa desk</p><h2>Ask about a {destination.name} visa.</h2><p>Tell us your travel dates and purpose. A consultant will confirm the checklist and next steps on WhatsApp.</p></div><ConnectedEnquiryForm kind="visas" subject={`visa enquiry: ${destination.name}`} sourcePage={path}/></div></section>
  </SiteShell>;
}
