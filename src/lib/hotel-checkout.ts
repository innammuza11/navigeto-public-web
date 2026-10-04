import { hotelToday } from "./hotel-search-dates.ts";
export type HotelStaySelection = {
  search_query?: string;
  rate_id?: string;
  checkin?: string;
  checkout?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  occupancy?: string;
  meal_plan?: string;
  market?: string;
};

/** Capture the same party parameters used to request the selling rate. */
export function hotelParty(params: URLSearchParams) {
  return {
    rooms: Number(params.get("rooms") || 1),
    adults: Number(params.get("adults") || 2),
    children: Number(params.get("children") || 0),
    occupancy: params.get("occupancy") || "double",
  };
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Fail closed on stale session selections; never invent booking dates or a party. */
export function hotelBookingDetails(selection: HotelStaySelection | null, today = hotelToday()) {
  if (!selection || typeof selection.rate_id !== "string" || !selection.rate_id.trim()) {
    throw new Error("Please return to hotel search and select a live room before submitting.");
  }
  const { rate_id, checkin, checkout, rooms, adults, children, occupancy } = selection;
  if (!validDate(checkin) || !validDate(checkout) || checkin < today || checkout <= checkin) {
    throw new Error("Please return to hotel search and choose valid upcoming stay dates.");
  }
  if (!Number.isSafeInteger(rooms) || rooms! < 1 || !Number.isSafeInteger(adults) || adults! < 1 ||
      !Number.isSafeInteger(children) || children! < 0 || !["single", "double", "triple", "quadruple"].includes(occupancy || "")) {
    throw new Error("Please return to hotel search and confirm your rooms and guest details.");
  }
  return { rate_id, checkin, checkout, rooms: rooms!, adults: adults!, children: children!, occupancy: occupancy!, guests: adults! + children! };
}

/** Return to the same search filters, without carrying checkout data in the URL. */
export function hotelSearchHref(selection: (HotelStaySelection & { hotel_name?: string }) | null) {
  if (!selection) return "/hotels/search";
  const original = new URLSearchParams(selection.search_query || "");
  const params = new URLSearchParams();
  const fallback = { q: selection.hotel_name, checkin: selection.checkin, checkout: selection.checkout,
    rooms: selection.rooms, adults: selection.adults, children: selection.children,
    occupancy: selection.occupancy, meal_plan: selection.meal_plan, market: selection.market };
  for (const [key, value] of Object.entries(fallback)) {
    const filter = original.has(key) ? original.get(key) : value;
    if (filter !== undefined && filter !== null) params.set(key, String(filter));
  }
  return `/hotels/search${params.size ? `?${params}` : ""}`;
}
