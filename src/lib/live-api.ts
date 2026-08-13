const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://drtunalervcihvyxtxbi.supabase.co";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_uuG7Eh-Kyijjd5cYsm_jIA_2QdwCo7u";

const functionUrl = (name: string, action?: string) =>
  `${SUPABASE_URL}/functions/v1/${name}${action ? `?action=${action}` : ""}`;

async function invoke<T>(name: string, payload: unknown, action?: string): Promise<T> {
  const response = await fetch(functionUrl(name, action), {
    method: "POST",
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.error) {
    throw new Error(result?.error || "The TravelOS service is temporarily unavailable.");
  }
  return result as T;
}

export type FlightOffer = {
  id: string;
  airline: string | null;
  airline_code: string | null;
  airline_logo: string | null;
  total_amount: number;
  currency: string;
  cabin_class: string | null;
  slices: Array<{
    origin: string;
    destination: string;
    departing_at: string;
    arriving_at: string;
    duration: string;
    stops: number;
    segments: Array<{
      carrier: string | null;
      carrier_code: string | null;
      flight_number: string | null;
    }>;
  }>;
};

export type HotelRate = {
  rate_id: string;
  hotel_name: string;
  destination: string;
  market?: string;
  hotel_category?: string;
  room_type?: string;
  meal_plan?: string;
  currency: string;
  selling_rate_per_night: number;
  total_amount: number;
  nights: number;
  rooms: number;
  cancellation_policy?: string | null;
  child_policy?: string | null;
  public_slug?: string | null;
  cover_image_url?: string | null;
};

export type HotelStartingRate = {
  hotel_id: string;
  hotel_name: string;
  destination: string;
  star_category?: string | null;
  public_slug: string;
  cover_image_url?: string | null;
  rate_id: string;
  currency: string;
  starting_rate_per_night: number;
  room_type?: string | null;
  meal_plan?: string | null;
};

export type PublicMedia = {
  url: string;
  alt_text?: string | null;
  caption?: string | null;
  is_cover?: boolean;
};

export type PublicHotelRoom = {
  id: string;
  room_name: string;
  room_code?: string | null;
  description?: string | null;
  max_occupancy?: number | null;
  adult_capacity?: number | null;
  child_capacity?: number | null;
  bed_configuration?: string | null;
  room_size_sqm?: number | null;
  view_type?: string | null;
  amenities: string[];
  smoking_policy?: string | null;
  accessibility_info?: string | null;
  cover_image_url?: string | null;
  gallery: PublicMedia[];
};

export type PublicHotel = {
  id: string;
  slug: string;
  hotel_name: string;
  destination: string;
  email?: string | null;
  front_desk_phone?: string | null;
  reservations_phone?: string | null;
  whatsapp_number?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  star_category?: string | null;
  facilities: string[];
  nearby_attractions: string[];
  check_in_time?: string | null;
  check_out_time?: string | null;
  child_policy?: string | null;
  cancellation_policy?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  cover_image_url?: string | null;
  gallery: PublicMedia[];
  rooms: PublicHotelRoom[];
};

export type PublicTour = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  package_type?: string;
  duration_days?: number;
  duration_nights?: number;
  destinations: string[];
  highlights: string[];
  itinerary: Array<Record<string, unknown>>;
  inclusions: string[];
  exclusions: string[];
  tags: string[];
  hero_image_url?: string | null;
  price_from?: number | null;
  currency: string;
  featured?: boolean;
  country?: string | null;
};

export type VisaProduct = {
  iso2: string;
  destination: string;
  region?: string | null;
  result_label?: string | null;
  entry_type?: string | null;
  processing_time?: string | null;
  from_price?: number | null;
  from_currency?: string | null;
  max_stay_days?: number | null;
};

export const visaDestinations: VisaProduct[] = [
  { iso2: "GB", destination: "United Kingdom" },
  { iso2: "AE", destination: "United Arab Emirates" },
  { iso2: "AU", destination: "Australia" },
  { iso2: "CA", destination: "Canada" },
  { iso2: "JP", destination: "Japan" },
  { iso2: "SG", destination: "Singapore" },
  { iso2: "TH", destination: "Thailand" },
  { iso2: "MY", destination: "Malaysia" },
  { iso2: "NZ", destination: "New Zealand" },
  { iso2: "US", destination: "United States" },
];

export type Vehicle = {
  vehicle_name: string;
  capacity?: number | null;
  minimum_days?: number | null;
  minimum_km_per_day?: number | null;
  inclusions: string[];
  exclusions: string[];
};

export type NaviSource = {
  type: string;
  reference: string;
  label: string;
  url: string;
  checked_at?: string;
  approved?: boolean;
};

export type NaviResponse = {
  reply: string;
  options?: string[];
  sources?: NaviSource[];
  checked_at?: string;
  provider?: "rules" | "ai_grounded";
};

export type PublicSiteConfig = {
  brand_name?: string;
  tagline?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string | null;
  announcement_text?: string;
  whatsapp_number?: string;
  phone?: string;
  email?: string;
  office_address?: string;
  hotel_enabled?: boolean;
  transfer_enabled?: boolean;
  tour_enabled?: boolean;
  assistant_enabled?: boolean;
};

export type TransferItinerarySection = {
  title: string;
  rows: string[];
};

export type TransferQuote = {
  quote_available: boolean;
  message?: string;
  origin?: string;
  destination?: string;
  route_name?: string;
  vehicle_name?: string;
  vehicle_type?: string;
  capacity?: number;
  total_amount?: number;
  currency?: string;
  net_amount?: number;
  markup_amount?: number;
  trip_type?: "one_way" | "return";
  travel_date?: string | null;
  pickup_time?: string | null;
  passengers?: number;
  luggage?: number;
  included?: string[];
  excluded?: string[];
  itinerary_sections?: TransferItinerarySection[];
  itinerary?: { sections?: TransferItinerarySection[] };
};

export const liveApi = {
  siteConfig: () => invoke<PublicSiteConfig>("public-travel-api", {}, "site-config"),
  flights: (payload: Record<string, unknown>) =>
    invoke<{ provider_connected: boolean; mode?: "test" | "live"; offers: FlightOffer[]; message?: string }>(
      "flight-search",
      payload,
    ),
  hotels: (payload: Record<string, unknown>) =>
    invoke<{ results: HotelRate[]; meta: Record<string, unknown> }>("customer-hotels", payload, "search"),
  hotelStartingRates: (payload: Record<string, unknown> = {}) =>
    invoke<{ results: HotelStartingRate[]; meta: Record<string, unknown> }>(
      "customer-hotels",
      payload,
      "starting-rates",
    ),
  hotel: (slug: string) =>
    invoke<{ result: PublicHotel | null }>("customer-hotels", { slug }, "detail"),
  hotelBooking: (payload: Record<string, unknown>) =>
    invoke<{ booking: { public_ref: string; total_amount: number; currency: string } }>(
      "customer-hotels",
      payload,
      "booking",
    ),
  tours: (payload: Record<string, unknown> = {}) =>
    invoke<{ results: PublicTour[] }>("public-travel-api", payload, "tour-list"),
  tour: (slug: string) =>
    invoke<{ result: PublicTour | null }>("public-travel-api", { slug }, "tour-detail"),
  vehicles: () => invoke<{ results: Vehicle[] }>("public-travel-api", {}, "vehicle-list"),
  transferQuote: (payload: Record<string, unknown>) =>
    invoke<TransferQuote>("public-travel-api", payload, "transfer-quote"),
  enquiry: (payload: Record<string, unknown>) =>
    invoke<{ enquiry: { public_ref: string; status: string } }>("public-travel-api", payload, "enquiry"),
  assistant: (payload: {
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  }) => invoke<NaviResponse>("public-travel-api", payload, "assistant"),
};

export function saveSelection(type: string, value: unknown) {
  sessionStorage.setItem(`navigeto:${type}`, JSON.stringify(value));
}

export function loadSelection<T>(type: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(`navigeto:${type}`) || "null") as T | null;
  } catch {
    return null;
  }
}
