import type { Metadata } from "next";

/**
 * Per-page SEO metadata.
 *
 * Fixes the "every page has the same <title>" problem: each route exports
 *   export const metadata = pageMeta("tours");
 * and inherits the layout's `%s | Navigeto Travels` title template, a unique
 * description, and a self-referencing canonical URL.
 */

// Canonical host is the apex domain — www.navigeto.com 301-redirects here, so
// emitting www URLs in canonicals/sitemaps would point search engines at redirects.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://navigeto.com";

type PageKey =
  | "home" | "tours" | "sriLankaTours" | "internationalTours" | "hotels" | "flights"
  | "visas" | "visaApply" | "holidays" | "transfers" | "customTrip" | "corporate"
  | "about" | "contact" | "tripAssistant" | "privacy" | "terms";

const PAGES: Record<PageKey, { path: string; title: string; description: string }> = {
  home: {
    path: "/",
    title: "Sri Lanka Tours, Hotels, Flights & Visa Assistance",
    description: "Bespoke Sri Lanka holidays, private tours, hotels, airport transfers, international flights and visa support — planned by Navigeto Travels, a licensed Sri Lankan DMC.",
  },
  tours: {
    path: "/tours",
    title: "Sri Lanka & Worldwide Tour Packages",
    description: "Browse published Navigeto tour packages — cultural triangle, hill country, wildlife safaris and beach routes. Every itinerary is private and fully customisable.",
  },
  sriLankaTours: {
    path: "/tours/sri-lanka",
    title: "Sri Lanka Tour Packages",
    description: "Cultural triangle heritage, hill-country tea estates, wildlife safaris and south-coast beaches — proven Sri Lanka routes you can personalise with Navigeto Travels.",
  },
  internationalTours: {
    path: "/tours/international",
    title: "International Holiday Packages from Sri Lanka",
    description: "Worldwide holiday packages arranged from Colombo — flights, hotels, transfers and visa assistance handled end to end by Navigeto Travels.",
  },
  hotels: {
    path: "/hotels",
    title: "Sri Lanka Hotels & Resorts — Live Rates",
    description: "Search live, contracted Sri Lanka hotel rates across Colombo, Kandy, Ella, Sigiriya, Galle and the south coast, with room types and meal plans.",
  },
  flights: {
    path: "/flights",
    title: "Flight Reservations from Colombo",
    description: "Search live international fares from Colombo and let Navigeto's team ticket, reissue and support your booking.",
  },
  visas: {
    path: "/visas",
    title: "Visa Requirements & Assistance for Sri Lankan Passports",
    description: "Check visa requirements, government fees and processing times for Sri Lankan passport holders, then let Navigeto's visa desk handle the application.",
  },
  visaApply: {
    path: "/visas/apply",
    title: "Apply for Visa Assistance",
    description: "Start a visa application with Navigeto Travels — document checklist, human review and status updates through to passport collection.",
  },
  holidays: {
    path: "/holidays",
    title: "Holiday Packages & Getaways",
    description: "Curated holiday packages — honeymoons, family getaways, wellness retreats and short breaks, tailored around your dates and budget.",
  },
  transfers: {
    path: "/transfers",
    title: "Private Airport Transfers & Chauffeur Hire in Sri Lanka",
    description: "Book private airport transfers and chauffeur-driven vehicles across Sri Lanka — sedans, KDH vans, mini coaches and coaches with professional drivers.",
  },
  customTrip: {
    path: "/custom-trip",
    title: "Design a Custom Sri Lanka Trip",
    description: "Tell us your dates, travellers and interests, and a Navigeto consultant will build a private itinerary with a clear, all-in price.",
  },
  corporate: {
    path: "/corporate",
    title: "Corporate Travel & MICE",
    description: "Corporate travel, incentives, conferences and events managed by Navigeto Travels, with consolidated billing and dedicated account support.",
  },
  about: {
    path: "/about",
    title: "About Navigeto Travels",
    description: "Navigeto Travels is a licensed Sri Lankan destination management company arranging tours, hotels, transfers, flights and visas with on-the-ground support.",
  },
  contact: {
    path: "/contact",
    title: "Contact Navigeto Travels",
    description: "Talk to a Navigeto travel specialist about tours, hotels, transfers, flights or visa assistance in Sri Lanka.",
  },
  tripAssistant: {
    path: "/trip-assistant",
    title: "Trip Assistant",
    description: "Plan your Sri Lanka trip with Navigeto's travel assistant, then hand over to a human consultant for a live quotation.",
  },
  privacy: { path: "/privacy", title: "Privacy Policy", description: "How Navigeto Travels collects, uses and protects your personal information." },
  terms: { path: "/terms", title: "Terms & Conditions", description: "The terms governing bookings and services provided by Navigeto Travels." },
};

/** Metadata for a fixed page. Usage: `export const metadata = pageMeta("tours");` */
export function pageMeta(key: PageKey): Metadata {
  const page = PAGES[key];
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: `${page.title} | Navigeto Travels`,
      description: page.description,
      url: `${SITE_URL}${page.path}`,
      type: "website",
      siteName: "Navigeto Travels",
    },
    twitter: { card: "summary_large_image", title: `${page.title} | Navigeto Travels`, description: page.description },
  };
}

/** Metadata for a dynamic tour/journey page (generateMetadata). */
export function tourMeta(input: {
  title: string; summary?: string | null; slug: string;
  durationNights?: number | null; durationDays?: number | null;
  destinations?: string[]; heroImageUrl?: string | null; pathPrefix?: string;
}): Metadata {
  const prefix = input.pathPrefix || "/tours";
  const path = `${prefix}/${input.slug}`;
  const nights = input.durationNights ? `${input.durationNights} nights` : "";
  const days = input.durationDays ? `${input.durationDays} days` : "";
  const duration = [nights, days].filter(Boolean).join(" / ");
  const places = (input.destinations || []).slice(0, 4).join(", ");
  const description = (input.summary || "").trim()
    || `${duration ? `${duration} private tour` : "Private tour"}${places ? ` visiting ${places}` : ""} with Navigeto Travels — customisable hotels, pace and activities.`;
  return {
    title: duration ? `${input.title} — ${duration}` : input.title,
    description: description.slice(0, 300),
    alternates: { canonical: path },
    openGraph: {
      title: `${input.title} | Navigeto Travels`,
      description: description.slice(0, 300),
      url: `${SITE_URL}${path}`,
      type: "article",
      siteName: "Navigeto Travels",
      ...(input.heroImageUrl ? { images: [{ url: input.heroImageUrl }] } : {}),
    },
  };
}
