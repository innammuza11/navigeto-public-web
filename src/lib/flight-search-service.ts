import { flightSellingTotal } from "./flight-selling.ts";
import { flightSearchDates } from "./journey-search-dates.ts";

const keys = ["origin", "destination", "depart_date", "return_date", "trip_type", "adults", "children", "infants", "cabin_class"];
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function searchSellingFlights(request: Request, upstream: string, key: string, fetcher: typeof fetch = fetch) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Invalid flight search." }, 400);
    const payload: Record<string, unknown> = {};
    for (const field of keys) if (body[field] !== undefined) payload[field] = body[field];
    const params = new URLSearchParams();
    for (const field of ["depart_date", "return_date", "trip_type"]) if (payload[field] !== undefined) params.set(field, String(payload[field]));
    const dates = flightSearchDates(params);
    if (dates.error) return json({ error: dates.error }, 400);
    payload.depart_date = dates.depart_date;
    if (dates.return_date) payload.return_date = dates.return_date; else delete payload.return_date;
    const response = await fetcher(upstream, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store", signal: AbortSignal.timeout(45000), redirect: "error" });
    const data = await response.json();
    if (!response.ok || data.error) return json({ error: data.error || "Airline fares are temporarily unavailable." }, response.ok ? 502 : response.status);
    const offers = Array.isArray(data.offers) ? data.offers.map((offer: Record<string, unknown>) => {
      // Only customer-facing fields leave this boundary; supplier totals and pricing metadata do not.
      const total = flightSellingTotal(Number(offer.total_amount), String(offer.currency));
      const { id, airline, airline_code, airline_logo, currency, cabin_class, slices, baggage, conditions, expires_at } = offer;
      return { id, airline, airline_code, airline_logo, currency, cabin_class, slices, baggage, conditions, expires_at, total_amount: total };
    }) : [];
    return json({ offers, provider_connected: data.provider_connected, mode: data.mode, message: data.message });
  } catch {
    return json({ error: "Flight fares could not be loaded. Please try again." }, 502);
  }
}
