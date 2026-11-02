// Structured data and organic-lead helpers shared by server pages and the
// mobile enquiry bar. Pure functions only, so node:test covers them directly.

type TourLike = {
  slug: string;
  title?: string;
  summary?: string;
  hero_image_url?: string | null;
  tags?: string[];
  destinations?: string[];
  itinerary?: Array<Record<string, unknown>>;
  price_from?: number | null;
  currency?: string;
  duration_days?: number;
  country?: string | null;
};

type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(siteUrl: string, crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path === "/" ? "" : crumb.path}`,
    })),
  };
}

function dayName(day: Record<string, unknown>, index: number) {
  for (const key of ["title", "heading", "name", "route"]) {
    const value = day[key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 160);
  }
  return `Day ${index + 1}`;
}

/** TouristTrip + BreadcrumbList. Only the published customer selling price is exposed as an Offer. */
export function tourJsonLd(siteUrl: string, tour: TourLike, fallbackName?: string) {
  const url = `${siteUrl}/tours/package/${tour.slug}`;
  const name = tour.title || fallbackName || "Private journey";
  const itinerary = (tour.itinerary || []).slice(0, 30);
  const price = typeof tour.price_from === "number" && tour.price_from > 0 ? tour.price_from : null;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": `${url}#trip`,
        name,
        url,
        description: tour.summary || `A private ${tour.country || "Sri Lanka"} journey designed by Navigeto Travels.`,
        image: tour.hero_image_url || `${siteUrl}/og.png`,
        touristType: tour.tags?.length ? tour.tags : undefined,
        provider: { "@id": `${siteUrl}/#organization` },
        itinerary: itinerary.length
          ? { "@type": "ItemList", numberOfItems: itinerary.length, itemListElement: itinerary.map((day, index) => ({ "@type": "ListItem", position: index + 1, name: dayName(day, index) })) }
          : tour.destinations?.length ? { "@type": "ItemList", itemListElement: tour.destinations.map((place, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "Place", name: place } })) } : undefined,
        offers: price ? {
          "@type": "Offer",
          price,
          priceCurrency: tour.currency || "USD",
          url,
          availability: "https://schema.org/InStock",
          description: "Starting price per person",
          seller: { "@id": `${siteUrl}/#organization` },
        } : undefined,
      },
      breadcrumbJsonLd(siteUrl, [{ name: "Home", path: "/" }, { name: "Tours", path: "/tours" }, { name, path: `/tours/package/${tour.slug}` }]),
    ],
  };
}

/** Merges catalogue pages (the public list API returns at most 100 per call) into one slug list. */
export function uniqueTourSlugs(pages: Array<Array<{ slug?: string | null }>>) {
  const slugs = new Set<string>();
  for (const page of pages) for (const tour of page) if (tour.slug) slugs.add(tour.slug);
  return [...slugs];
}

const NO_ENQUIRY_BAR = [/^\/[a-z-]+\/booking(\/|$)/, /^\/visas\/(apply|application)(\/|$)/, /^\/pay(\/|$)/, /^\/one(\/|$)/, /^\/partners(\/|$)/, /^\/custom-trip(\/|$)/, /^\/trip-assistant(\/|$)/, /^\/contact(\/|$)/];

/** Checkout, payment, partner/B2B and pages that already are the enquiry form keep their own focus. */
export function showsEnquiryBar(pathname: string) {
  return !NO_ENQUIRY_BAR.some(pattern => pattern.test(pathname));
}

/** Prefilled WhatsApp text, so the travel team sees which page the visitor came from. */
export function whatsappLeadMessage(pathname: string, pageTitle?: string) {
  const title = String(pageTitle || "").split("|")[0].trim();
  const page = title && !/^navigeto travels$/i.test(title) ? title : "your website";
  return `Hi Navigeto, I'm interested in ${page} (navigeto.com${pathname === "/" ? "" : pathname}). Could you help me plan my trip?`;
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** The on-site page an enquiry-bar visitor came from; anything else is ignored. */
export function enquirySourcePage(search: string) {
  const from = new URLSearchParams(search).get("from") || "";
  return /^\/[a-z0-9\-/]{0,160}$/i.test(from) && !from.startsWith("//") ? from : undefined;
}
