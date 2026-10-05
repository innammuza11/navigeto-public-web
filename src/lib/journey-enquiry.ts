import { addHotelDays } from "./hotel-search-dates.ts";

type Slice = { origin: string; destination: string; departing_at: string; arriving_at: string };
export type JourneySelection = {
  id?: string; airline?: string | null; search_query?: string; slices?: Slice[];
  total_amount?: number; currency?: string; expires_at?: string | null;
  origin?: string; destination?: string; date?: string; pickup_time?: string;
  passengers?: number; luggage?: number; vehicle?: { vehicle_name?: string };
};
const date = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && addHotelDays(value, 0) === value;
const count = (value: unknown, minimum: number) => {
  const number = Number(value);
  if (value === "" || value == null || !Number.isSafeInteger(number) || number < minimum || number > 100) throw new Error("Please return to search and confirm your traveller counts.");
  return number;
};

/** Only search-selected facts become enquiry fields; totals remain subject to verification. */
export function journeyEnquiryDetails(type: "flight" | "transfer", selection: JourneySelection | null, today?: string, now = new Date()) {
  if (!selection) throw new Error(`Please return to ${type} search and choose an option first.`);
  if (type === "transfer") {
    const passengers = count(selection.passengers, 1);
    const luggage = count(selection.luggage, 0);
    if (!selection.origin?.trim() || !selection.destination?.trim() || !selection.vehicle?.vehicle_name?.trim()) throw new Error("Please choose your route and vehicle before sending a transfer request.");
    if (!selection.date || !date(selection.date) || (today && selection.date < today)) throw new Error("Please return to transfer search and choose an upcoming travel date.");
    return { subject: `transfer request: ${selection.vehicle.vehicle_name} · ${selection.origin} → ${selection.destination}`, pax: passengers,
      travel_start_date: selection.date,
      details: { selection, quotation_type: "transfer-quote", passengers, luggage } };
  }
  const params = new URLSearchParams(selection.search_query);
  const adults = count(params.get("adults") ?? "1", 1);
  const children = count(params.get("children") ?? "0", 0);
  const infants = count(params.get("infants") ?? "0", 0);
  if (adults + children + infants > 100 || infants > adults) throw new Error("Please return to flight search and confirm your traveller counts.");
  const slices = selection.slices;
  if (!selection.id || !slices?.length || slices.length > 2 || !Number.isFinite(selection.total_amount) || selection.total_amount! <= 0 || !selection.currency) throw new Error("Please return to flight search and choose a live fare.");
  const departure = slices[0].departing_at?.slice(0, 10);
  const returning = slices.length === 2 ? slices[1].departing_at?.slice(0, 10) : undefined;
  if (!date(departure) || (returning !== undefined && (!date(returning) || returning < departure)) || (today && departure < today)) throw new Error("Please return to flight search and choose upcoming travel dates.");
  if (params.get("depart_date") !== departure || (params.get("trip_type") === "one_way" ? slices.length !== 1 : slices.length !== 2 || params.get("return_date") !== returning)) throw new Error("The selected flight does not match your search dates. Please search again.");
  if (slices.some(slice => !slice.origin || !slice.destination) || slices[0].origin !== params.get("origin") || slices[0].destination !== params.get("destination") || (slices.length === 2 && (slices[1].origin !== slices[0].destination || slices[1].destination !== slices[0].origin))) throw new Error("The selected flight does not match your route. Please search again.");
  if (today && selection.expires_at && (!Number.isFinite(Date.parse(selection.expires_at)) || Date.parse(selection.expires_at) <= now.getTime())) throw new Error("This flight fare has expired. Please search again for a current fare.");
  return { subject: `flight request: ${selection.airline || "Airline"} · ${slices[0].origin} → ${slices[0].destination}`, pax: adults + children + infants,
    travel_start_date: departure, ...(returning ? { travel_end_date: returning } : {}),
    details: { selection, quotation_type: "standard", adults, children, infants, pricing_status: "requires_confirmation" } };
}
