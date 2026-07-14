import { env, supabase } from "./supabase";

export type PublicTour = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  summary: string;
  duration_days: number;
  duration_nights: number;
  destinations: string[];
  highlights: string[];
  hero_image_url?: string | null;
  price_from?: number | null;
  currency: string;
  featured: boolean;
  country?: string | null;
};

export type CustomerEnquiry = {
  id: string;
  public_ref: string;
  enquiry_type: string;
  status: string;
  priority?: string;
  subject?: string | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  pax?: number | null;
  created_at: string;
  updated_at?: string;
};

type ApiError = { error?: string };

async function request<T>(url: string, payload: unknown, authenticated = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: env.VITE_SUPABASE_ANON_KEY
  };

  if (authenticated) {
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error("Please sign in to continue.");
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload ?? {}),
      cache: "no-store"
    });
  } catch {
    throw new Error("Navigeto is temporarily unreachable. Check your internet connection and try again.");
  }

  const body = await response.json().catch(() => ({})) as T & ApiError;
  if (!response.ok || body.error) {
    throw new Error(body.error || "The TravelOS request could not be completed.");
  }
  return body;
}

export async function listFeaturedTours(): Promise<PublicTour[]> {
  const result = await request<{ results: PublicTour[] }>(
    `${env.VITE_PUBLIC_API_URL}?action=tour-list`,
    { featured: true },
  );
  return result.results || [];
}

export async function listTours(search = ""): Promise<PublicTour[]> {
  const result = await request<{ results: PublicTour[] }>(
    `${env.VITE_PUBLIC_API_URL}?action=tour-list`,
    search ? { search } : {},
  );
  return result.results || [];
}

export async function createCustomerEnquiry(payload: Record<string, unknown>): Promise<CustomerEnquiry> {
  const result = await request<{ enquiry: CustomerEnquiry }>(
    `${env.VITE_MOBILE_CUSTOMER_API_URL}?action=create-enquiry`,
    payload,
    true,
  );
  return result.enquiry;
}

export async function listMyEnquiries(): Promise<CustomerEnquiry[]> {
  const result = await request<{ enquiries: CustomerEnquiry[] }>(
    `${env.VITE_MOBILE_CUSTOMER_API_URL}?action=my-enquiries`,
    {},
    true,
  );
  return result.enquiries || [];
}

export async function listMyNotifications(): Promise<Array<{
  id: string;
  kind: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}>> {
  const result = await request<{ notifications: Array<{
    id: string;
    kind: string;
    title: string;
    body: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
  }> }>(
    `${env.VITE_MOBILE_CUSTOMER_API_URL}?action=my-notifications`,
    {},
    true,
  );
  return result.notifications || [];
}
