import { searchSellingFlights } from "@/lib/flight-search-service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://drtunalervcihvyxtxbi.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_uuG7Eh-Kyijjd5cYsm_jIA_2QdwCo7u";
  return searchSellingFlights(request, `${url}/functions/v1/flight-search`, key);
}
