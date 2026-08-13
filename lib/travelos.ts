import type { CatalogVehicle, EnquiryResult, HotelResult, PublicHotel, PublicPackage, SiteConfig, TransferQuote } from "./types";
import { currentMarketingAttribution, trackTravelosConversion } from "./marketing";

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

export async function getHotel(slug: string): Promise<PublicHotel | null> {
  const data = await post<{ result: PublicHotel | null }>(`${hotelApi}?action=detail`, { slug });
  return data.result || null;
}

export async function listHotelPages(): Promise<Array<{ slug: string; updated_at?: string | null }>> {
  const data = await post<{ results: Array<{ public_slug: string; updated_at?: string | null }> }>(`${hotelApi}?action=sitemap`, {});
  return (data.results || []).filter((row) => row.public_slug).map((row) => ({ slug: row.public_slug, updated_at: row.updated_at }));
}

export async function requestHotelBooking(payload: Record<string, unknown>): Promise<{ booking: EnquiryResult & { total_amount?: number; currency?: string } }> {
  const marketing = currentMarketingAttribution();
  const result = await post<{ booking: EnquiryResult & { total_amount?: number; currency?: string } }>(`${hotelApi}?action=booking`, { ...payload, marketing });
  trackTravelosConversion({ sourceRef: result.booking.public_ref, eventName: "Lead", value: result.booking.total_amount, currency: result.booking.currency });
  return result;
}

export async function quoteTransfer(payload: Record<string, unknown>): Promise<TransferQuote> {
  return post<TransferQuote>(`${publicApi}?action=transfer-quote`, payload);
}

export async function listVehicles(): Promise<CatalogVehicle[]> {
  const data = await post<{ results: CatalogVehicle[] }>(`${publicApi}?action=vehicle-list`, {});
  return data.results || [];
}

export async function submitEnquiry(payload: Record<string, unknown>): Promise<EnquiryResult> {
  const marketing = currentMarketingAttribution();
  const details = payload.details && typeof payload.details === "object" ? payload.details as Record<string, unknown> : {};
  const data = await post<{ enquiry: EnquiryResult }>(`${publicApi}?action=enquiry`, { ...payload, details: { ...details, marketing } });
  trackTravelosConversion({ sourceRef: data.enquiry.public_ref, eventName: "Lead" });
  return data.enquiry;
}

export async function assistantReply(payload: Record<string, unknown>): Promise<{ reply: string; options?: string[]; enquiry_ref?: string }> {
  return post(`${publicApi}?action=assistant`, payload);
}
