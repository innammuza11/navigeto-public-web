// Public visa data client — talks to the public-travel-api Edge Function
// (visa-list / visa-check). Portable: only needs the public Supabase URL +
// anon key, which every public-web build already exposes.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const api = `${supabaseUrl}/functions/v1/public-travel-api`;

export type VisaListItem = {
  destination_iso2: string;
  destination_name: string;
  flag: string | null;
  visa_result: string | null;
  result_label: string | null;
  result_badge: string | null;
  processing_time_text: string | null;
  fee_amount: number | null;
  fee_currency: string | null;
  total_fee_amount: number | null;
  total_fee_currency: string | null;
  max_stay_days: number | null;
  entry_type: string | null;
};

export type VisaCheckResult = {
  found: boolean;
  message?: string;
  origin?: string;
  destination?: { iso2: string; name: string; flag: string | null };
  purpose?: string;
  visa_result?: string | null;
  result_label?: string | null;
  result_badge?: string | null;
  processing_time_text?: string | null;
  fee_amount?: number | null;
  fee_currency?: string | null;
  service_fee_amount?: number | null;
  service_fee_currency?: string | null;
  total_fee_amount?: number | null;
  total_fee_currency?: string | null;
  max_stay_days?: number | null;
  entry_type?: string | null;
  passport_validity_months?: number | null;
  official_application_url?: string | null;
  requirements?: {
    appointment: boolean; biometrics: boolean; interview: boolean; insurance: boolean;
    return_ticket: boolean; proof_of_funds: boolean; hotel_booking: boolean;
  };
  documents_required?: unknown[];
  conditions?: unknown[];
  warnings?: unknown[];
  health_requirements?: unknown[];
  customer_summary?: string | null;
};

async function post<T>(action: string, body: unknown): Promise<T> {
  if (!supabaseUrl || !anonKey) throw new Error("The live TravelOS connection is not configured yet.");
  let res: Response;
  try {
    res = await fetch(`${api}?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anonKey },
      body: JSON.stringify(body ?? {}),
      cache: "no-store",
    });
  } catch {
    throw new Error("The visa service is temporarily unavailable. Please try again shortly.");
  }
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload?.error) throw new Error(payload?.error || "The visa service request failed. Please try again shortly.");
  return payload as T;
}

export function listVisaDestinations(): Promise<VisaListItem[]> {
  return post<{ results: VisaListItem[] }>("visa-list", {}).then((d) => d.results || []);
}

export function checkVisa(destination: string, purpose = "tourism", entryType?: string): Promise<VisaCheckResult> {
  return post<VisaCheckResult>("visa-check", { destination, purpose, entry_type: entryType });
}
