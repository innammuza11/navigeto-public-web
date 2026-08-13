export type PublicMedia = {
  url: string;
  alt_text?: string | null;
  caption?: string | null;
  is_cover?: boolean;
};

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
  google_tag_id?: string | null;
  google_ads_conversion_id?: string | null;
  google_ads_conversion_label?: string | null;
  meta_pixel_id?: string | null;
  marketing_consent_required?: boolean;
  google_site_verification?: string | null;
  bing_site_verification?: string | null;
  default_og_image_url?: string | null;
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
  public_slug?: string | null;
  cover_image_url?: string | null;
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
    images?: PublicMedia[];
  }>;
  inclusions: string[];
  exclusions: string[];
  tags: string[];
  hero_image_url?: string;
  gallery?: PublicMedia[];
  price_from?: number | null;
  currency?: string;
  min_pax?: number | null;
  max_pax?: number | null;
  featured?: boolean;
  country?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  focus_keyword?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
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
