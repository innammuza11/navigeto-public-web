import { SITE_URL } from "@/lib/seo";

/**
 * JSON-LD structured data. Server components — drop into any page:
 *
 *   <TravelAgencySchema />                      // once, in the root layout
 *   <BreadcrumbSchema items={[...]} />          // any inner page
 *   <TourSchema tour={pkg} pathPrefix="/tours/package" />   // tour/journey page
 *   <FaqSchema items={[{question, answer}]} />  // pages with Q&A copy
 *
 * Rich results give travel sites destination/price/duration in the SERP.
 * Only publicly published information is emitted — never internal cost or markup.
 */

function Ld({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function TravelAgencySchema({
  phone, email, streetAddress, sameAs = [],
}: { phone?: string; email?: string; streetAddress?: string; sameAs?: string[] } = {}) {
  return (
    <Ld data={{
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "@id": `${SITE_URL}/#organization`,
      name: "Navigeto Travels",
      url: SITE_URL,
      logo: `${SITE_URL}/media/navigeto-logo.webp`,
      image: `${SITE_URL}/og.png`,
      description: "Licensed Sri Lankan destination management company arranging private tours, hotels, airport transfers, international flights and visa assistance.",
      address: {
        "@type": "PostalAddress",
        ...(streetAddress ? { streetAddress } : {}),
        addressLocality: "Colombo",
        addressCountry: "LK",
      },
      ...(phone ? { telephone: phone } : {}),
      ...(email ? { email } : {}),
      areaServed: [{ "@type": "Country", name: "Sri Lanka" }],
      ...(sameAs.length ? { sameAs } : {}),
    }} />
  );
}

export function WebSiteSchema() {
  return (
    <Ld data={{
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Navigeto Travels",
      publisher: { "@id": `${SITE_URL}/#organization` },
    }} />
  );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; path: string }> }) {
  if (!items.length) return null;
  return (
    <Ld data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem", position: i + 1, name: item.name, item: `${SITE_URL}${item.path}`,
      })),
    }} />
  );
}

type TourInput = {
  title: string; slug: string; summary?: string | null;
  duration_days?: number | null; duration_nights?: number | null;
  destinations?: string[]; hero_image_url?: string | null;
  price_from?: number | null; currency?: string | null;
  itinerary?: Array<{ day: number; title?: string; description?: string; overnight?: string | null }>;
};

/** TouristTrip schema for a tour/journey page — surfaces price, duration and stops. */
export function TourSchema({ tour, pathPrefix = "/tours" }: { tour: TourInput; pathPrefix?: string }) {
  const url = `${SITE_URL}${pathPrefix}/${tour.slug}`;
  const days = tour.duration_days || null;
  const stops = [...new Set((tour.destinations || []).filter(Boolean))];
  return (
    <Ld data={{
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: tour.title,
      url,
      ...(tour.summary ? { description: tour.summary } : {}),
      ...(tour.hero_image_url ? { image: tour.hero_image_url } : {}),
      ...(days ? { itinerary: {
        "@type": "ItemList",
        numberOfItems: stops.length || days,
        itemListElement: stops.map((place, i) => ({
          "@type": "ListItem", position: i + 1,
          item: { "@type": "TouristDestination", name: place, address: { "@type": "PostalAddress", addressCountry: "LK" } },
        })),
      } } : {}),
      ...(days ? { duration: `P${days}D` } : {}),
      provider: { "@id": `${SITE_URL}/#organization` },
      // Public selling price only — internal cost/markup is never exposed (rule 11).
      ...(tour.price_from != null ? {
        offers: {
          "@type": "Offer",
          price: tour.price_from,
          priceCurrency: tour.currency || "USD",
          availability: "https://schema.org/InStock",
          url,
        },
      } : {}),
    }} />
  );
}

export function FaqSchema({ items }: { items: Array<{ question: string; answer: string }> }) {
  if (!items.length) return null;
  return (
    <Ld data={{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question", name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }} />
  );
}
