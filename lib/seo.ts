import type { Metadata } from "next";

export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://navigeto.com").replace(/\/$/, "");

type SeoDefinition = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
};

export function createSeoMetadata(definition: SeoDefinition): Metadata {
  const canonical = `${PUBLIC_SITE_URL}${definition.path === "/" ? "" : definition.path}`;
  const image = definition.image || "/logo.webp";
  return {
    title: { absolute: definition.title },
    description: definition.description,
    alternates: { canonical },
    robots: definition.noIndex ? { index: false, follow: false } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: definition.title,
      description: definition.description,
      type: "website",
      url: canonical,
      siteName: "Navigeto Travels",
      images: [{ url: image, alt: definition.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: definition.title,
      description: definition.description,
      images: [image],
    },
  };
}

export const STATIC_SEO = {
  hotels: {
    title: "Sri Lanka Hotels & Resorts | Live Rates | Navigeto Travels",
    description: "Search approved Sri Lanka hotels and request customer-ready room rates, availability and local booking support from Navigeto Travels.",
    path: "/hotels",
  },
  tours: {
    title: "Private Sri Lanka Tours & Holiday Packages | Navigeto Travels",
    description: "Explore private Sri Lanka tours and customise the route, hotels, pace and experiences with local destination specialists.",
    path: "/tours",
  },
  transfers: {
    title: "Sri Lanka Private Transfers | Navigeto Travels",
    description: "Request airport transfers and private chauffeur transport across Sri Lanka with approved vehicles, clear pricing and local support.",
    path: "/transfers",
  },
  flights: {
    title: "Flight Reservations & Travel Support | Navigeto Travels",
    description: "Request regional and international flight options with route, baggage and connection support from an experienced travel consultant.",
    path: "/flights",
  },
  holidays: {
    title: "International Holiday Packages | Navigeto Travels",
    description: "Plan Maldives, Dubai, Thailand and other international holidays with flights, hotels, transfers and tours coordinated together.",
    path: "/holidays",
  },
  visas: {
    title: "Visa Assistance & Document Guidance | Navigeto Travels",
    description: "Get visa eligibility, document checklist and processing guidance reviewed by a Navigeto travel consultant before you apply.",
    path: "/visas",
  },
  corporate: {
    title: "Corporate & Group Travel Management | Navigeto Travels",
    description: "Coordinate business travel, incentive groups and MICE programs with one Sri Lanka-based account and operations team.",
    path: "/corporate",
  },
  customTrip: {
    title: "Plan a Tailor-made Sri Lanka Trip | Navigeto Travels",
    description: "Send your dates, interests and travel style to build a private Sri Lanka itinerary with live rates and local operational support.",
    path: "/custom-trip",
  },
  tripAssistant: {
    title: "Sri Lanka Trip Planning Assistant | Navigeto Travels",
    description: "Plan a Sri Lanka route around your dates, travellers, hotel style and interests, then send it to the Navigeto travel team.",
    path: "/trip-assistant",
  },
  contact: {
    title: "Contact Navigeto Travels | Sri Lanka Travel Team",
    description: "Contact Navigeto Travels in Sri Lanka for hotels, private tours, transfers, flights, visas and tailor-made travel planning.",
    path: "/contact",
  },
  about: {
    title: "About Navigeto Travels | Sri Lanka Travel Agency & DMC",
    description: "Meet the Sri Lanka travel specialists behind Navigeto Travels, planning private tours, hotels, transfers, flights and tailor-made holidays.",
    path: "/about",
  },
} satisfies Record<string, SeoDefinition>;

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
