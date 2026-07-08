export type SiteConfig = {
  brand_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  announcement_text: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  office_address: string;
  default_currency: string;
  hotel_enabled: boolean;
  transfer_enabled: boolean;
  tour_enabled: boolean;
  assistant_enabled: boolean;
  booking_mode: "request" | "instant_request";
  featured_destinations: Array<{ name: string; description: string; emoji?: string }>;
  social_links: Record<string, string>;
};

export type HotelResult = {
  rate_id: string;
  hotel_name: string;
  destination?: string;
  market?: string;
  hotel_category?: string;
  room_type?: string;
  meal_plan?: string;
  currency: string;
  selling_rate_per_night: number;
  total_amount: number;
  nights: number;
  rooms: number;
};

export type PublicPackage = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  package_type?: string;
  duration_days: number;
  duration_nights: number;
  destinations: string[];
  highlights: string[];
  itinerary: Array<{ day: number; title: string; description: string; overnight?: string }>;
  inclusions: string[];
  exclusions: string[];
  tags: string[];
  hero_image_url?: string;
  price_from?: number | null;
  currency?: string;
  min_pax?: number | null;
  max_pax?: number | null;
  featured?: boolean;
};

export type TransferQuote = {
  quote_available: boolean;
  origin?: string;
  destination?: string;
  route_name?: string;
  vehicle_type?: string;
  standard_km?: number;
  total_amount?: number;
  currency?: string;
  included?: string[];
  message?: string;
};

export type EnquiryResult = {
  public_ref: string;
  status: string;
};
