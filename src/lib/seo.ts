import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://navigeto.com").replace(/\/$/, "");

export const STATIC_SEO: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Navigeto Travels | Sri Lanka & Worldwide Journeys",
    description: "Bespoke Sri Lanka holidays, international flights, hotels, private tours, transfers and visa support—beautifully connected by Navigeto Travels.",
  },
  "/about": { title: "About Navigeto Travels | Sri Lanka Travel Experts", description: "Meet the Colombo-based team combining local travel expertise with connected operations for Sri Lanka and worldwide journeys." },
  "/contact": { title: "Contact Navigeto Travels | Plan Your Journey", description: "Contact Navigeto Travels for Sri Lanka hotels, private tours, transfers, flights, visas and tailor-made holiday planning." },
  "/corporate": { title: "Corporate & Group Travel | Navigeto Travels", description: "Coordinate corporate travel, MICE, incentive groups, flights, hotels and ground operations with one accountable Sri Lanka team." },
  "/custom-trip": { title: "Plan a Tailor-made Sri Lanka Trip | Navigeto", description: "Share your dates, pace and interests and let Navigeto design a private Sri Lanka journey around you." },
  "/flights": { title: "Flight Reservations & Fare Support | Navigeto", description: "Request regional and international flight options with route, baggage and fare-condition support from a travel consultant." },
  "/holidays": { title: "International Holiday Packages | Navigeto Travels", description: "Plan Maldives, Dubai, Thailand and worldwide holidays with flights, hotels, transfers and experiences connected in one itinerary." },
  "/hotels": { title: "Sri Lanka Hotels & Live Rates | Navigeto Travels", description: "Explore approved Sri Lanka hotels, published property profiles and live customer-ready rates with local support." },
  "/privacy": { title: "Privacy Policy | Navigeto Travels", description: "Learn how Navigeto Travels handles website enquiries, customer contact details, consent and travel-service information." },
  "/terms": { title: "Booking Terms | Navigeto Travels", description: "Read the important terms for Navigeto hotel, transfer, tour, flight, visa and travel-service requests." },
  "/tours": { title: "Sri Lanka Tours & Tailor-made Holidays | Navigeto", description: "Explore cinematic private Sri Lanka tours and personalise the route, hotels, pace and experiences with local specialists." },
  "/transfers": { title: "Sri Lanka Private Transfers | Navigeto Travels", description: "Request airport transfers and private chauffeur transport across Sri Lanka with approved vehicles and local support." },
  "/trip-assistant": { title: "Sri Lanka Trip Planning Assistant | Navigeto", description: "Plan a Sri Lanka journey around your dates, travellers, hotel style and interests with Navigeto's trip assistant." },
  "/visas": { title: "Visa Assistance & Document Guidance | Navigeto", description: "Get destination-specific visa eligibility, document and processing guidance reviewed by a Navigeto consultant." },
};

export function seoMetadata(path: string, overrides: Partial<Metadata> = {}): Metadata {
  const value = STATIC_SEO[path] || STATIC_SEO["/"];
  return {
    title: { absolute: value.title },
    description: value.description,
    alternates: { canonical: path },
    openGraph: { title: value.title, description: value.description, url: path, type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Navigeto Travels — travel, beautifully connected" }] },
    twitter: { card: "summary_large_image", title: value.title, description: value.description, images: ["/og.png"] },
    ...overrides,
  };
}
