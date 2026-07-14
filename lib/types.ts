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
  cancellation_policy?: string | null;
  child_policy?: string | null;
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
  itinerary: Array<{
    day: number;
    date?: string;
    title: string;
    route?: string;
    description: string;
    overnight?: string;
    hotel_name?: string;
    meals?: string;
    service_type?: string;
    activities?: Array<{ icon?: string; title: string; description?: string }>;
    optional_activities?: string[];
    notes?: string;
  }>;
  inclusions: string[];
  exclusions: string[];
  tags: string[];
  hero_image_url?: string;
  price_from?: number | null;
  currency?: string;
  min_pax?: number | null;
  max_pax?: number | null;
  featured?: boolean;
  country?: string | null;
};

export type TransferQuote = {
  quote_available: boolean;
  origin?: string;
  destination?: string;
  route_name?: string;
  vehicle_type?: string;
  vehicle_name?: string | null;
  capacity?: number | null;
  standard_km?: number;
  total_amount?: number;
  currency?: string;
  included?: string[];
  excluded?: string[];
  message?: string;
};

export type CatalogVehicle = {
  vehicle_name: string;
  capacity: number | null;
  minimum_days: number | null;
  minimum_km_per_day: number | null;
  inclusions: string[];
  exclusions: string[];
};

export type EnquiryResult = {
  public_ref: string;
  status: string;
};

export type CustomerProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  nationality: string | null;
  marketing_opt_in: boolean;
};

export type SavedTraveller = {
  id: string;
  customer_id: string;
  full_name: string;
  date_of_birth: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  notes: string | null;
};

export type CustomerEnquiry = {
  id: string;
  public_ref: string;
  enquiry_type: string;
  status: string;
  subject: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  created_at: string;
};
