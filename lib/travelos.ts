import type { CatalogVehicle, EnquiryResult, HotelResult, PublicPackage, SiteConfig, TransferQuote } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const publicApi = `${supabaseUrl}/functions/v1/public-travel-api`;
const hotelApi = `${supabaseUrl}/functions/v1/customer-hotels`;

function assertConfigured() {
  if (!supabaseUrl || !anonKey) throw new Error("The live TravelOS connection is not configured yet.");
}

async function post<T>(url: string, body: unknown): Promise<T> {
  assertConfigured();
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anonKey },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
  } catch {
    // Network/DNS/CORS-level failures never reach the customer as raw text.
    throw new Error("Navigeto TravelOS is temporarily unavailable. Please try again shortly or contact us directly.");
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.error) throw new Error(payload?.error || "TravelOS request failed. Please try again shortly.");
  return payload as T;
}

export async function loadSiteConfig(): Promise<SiteConfig> {
  return post<SiteConfig>(`${publicApi}?action=site-config`, {});
}

export async function listTours(filters: Record<string, unknown> = {}): Promise<PublicPackage[]> {
  const data = await post<{ results: PublicPackage[] }>(`${publicApi}?action=tour-list`, filters);
  return data.results || [];
}

export async function getTour(slug: string): Promise<PublicPackage | null> {
  const data = await post<{ result: PublicPackage | null }>(`${publicApi}?action=tour-detail`, { slug });
  return data.result || null;
}

export async function getHotelSuggestions(): Promise<Record<string, string[]>> {
  return post<Record<string, string[]>>(`${hotelApi}?action=suggestions`, {});
}

export async function searchHotels(payload: Record<string, unknown>): Promise<HotelResult[]> {
  const data = await post<{ results: HotelResult[] }>(`${hotelApi}?action=search`, payload);
  return data.results || [];
}

export async function requestHotelBooking(payload: Record<string, unknown>): Promise<{ booking: EnquiryResult & { total_amount?: number; currency?: string } }> {
  return post(`${hotelApi}?action=booking`, payload);
}

export async function quoteTransfer(payload: Record<string, unknown>): Promise<TransferQuote> {
  return post<TransferQuote>(`${publicApi}?action=transfer-quote`, payload);
}

export async function listVehicles(): Promise<CatalogVehicle[]> {
  const data = await post<{ results: CatalogVehicle[] }>(`${publicApi}?action=vehicle-list`, {});
  return data.results || [];
}

export async function submitEnquiry(payload: Record<string, unknown>): Promise<EnquiryResult> {
  const data = await post<{ enquiry: EnquiryResult }>(`${publicApi}?action=enquiry`, payload);
  return data.enquiry;
}

export async function assistantReply(payload: Record<string, unknown>): Promise<{ reply: string; options?: string[]; enquiry_ref?: string }> {
  return post(`${publicApi}?action=assistant`, payload);
}
