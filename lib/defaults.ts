import type { SiteConfig } from "./types";

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brand_name: "Navigeto Travels",
  tagline: "Your Sri Lanka journey, professionally handled.",
  hero_title: "Discover Sri Lanka with a travel team that knows every detail.",
  hero_subtitle: "Live hotel selling rates, private transfers and tailor-made tours connected directly to Navigeto TravelOS.",
  announcement_text: "Plan hotels, transfers and tours in one place.",
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94770000000",
  phone: "+94 77 000 0000",
  email: "info@navigeto.com",
  office_address: "Colombo, Sri Lanka",
  default_currency: "USD",
  hotel_enabled: true,
  transfer_enabled: true,
  tour_enabled: true,
  assistant_enabled: true,
  booking_mode: "request",
  featured_destinations: [
    { name: "Sigiriya", description: "Ancient kingdoms, wildlife and unforgettable landscapes.", emoji: "🏯" },
    { name: "Kandy", description: "Hill-country heritage, gardens and cultural experiences.", emoji: "🌿" },
    { name: "Ella", description: "Tea country, waterfalls and scenic mountain journeys.", emoji: "🚂" },
    { name: "South Coast", description: "Golden beaches, Galle Fort and relaxed coastal stays.", emoji: "🌊" },
  ],
  social_links: {},
};
