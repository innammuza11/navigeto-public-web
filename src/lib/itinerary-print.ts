// Printable tour itinerary (the "download this itinerary" lead magnet) and the
// enquiry sent when a visitor asks for it. Customer selling details only.

import { customerTourSummary } from "./tour-presentation.ts";

type TourForPrint = {
  slug: string;
  title: string;
  summary?: string;
  country?: string | null;
  duration_days?: number;
  duration_nights?: number;
  destinations?: string[];
  itinerary?: Array<Record<string, unknown>>;
  inclusions?: string[];
  exclusions?: string[];
};

const text = (item: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

export function printableItinerary(tour: TourForPrint) {
  const days = (tour.itinerary || []).map((item, index) => {
    const raw = text(item, ["day", "day_label", "day_number"]);
    return {
      label: /^day\s+/i.test(raw) ? raw : `Day ${Number(raw) || index + 1}`,
      title: text(item, ["title", "heading", "name", "route"]) || `Day ${index + 1}`,
      description: text(item, ["description", "copy", "summary", "details"]),
      overnight: text(item, ["overnight", "overnight_location", "overnightLocation"]),
      meals: text(item, ["meals", "meal_plan", "mealPlan"]),
    };
  });
  return {
    title: tour.title,
    summary: customerTourSummary(tour.summary),
    route: (tour.destinations || []).filter(Boolean).join(" → "),
    length: [tour.duration_days ? `${tour.duration_days} days` : "", tour.duration_nights ? `${tour.duration_nights} nights` : ""].filter(Boolean).join(" · "),
    days,
    inclusions: tour.inclusions || [],
    exclusions: tour.exclusions || [],
  };
}

/** Enquiry for the itinerary download: name + WhatsApp (email optional), tagged so staff can follow up. */
export function itineraryDownloadEnquiry(tour: { id?: string; slug: string; title: string }, input: { name: string; whatsapp: string; email: string }) {
  const name = input.name.trim();
  const whatsapp = input.whatsapp.trim();
  const email = input.email.trim();
  if (!name) throw new Error("Please enter your name.");
  if (whatsapp.replace(/\D/g, "").length < 7) throw new Error("Please enter your WhatsApp number with the country code.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please check your email address, or leave it blank.");
  return {
    enquiry_type: "tour",
    customer_name: name,
    whatsapp,
    ...(email ? { email } : {}),
    consent_contact: true,
    subject: `itinerary download: ${tour.title}`,
    details: { selection: { id: tour.id, slug: tour.slug, title: tour.title }, source_page: `/tours/package/${tour.slug}`, request_channel: "itinerary_download" },
  };
}
