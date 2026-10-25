export type GroupDeparture = {
  id: string; package_id: string; label: string; departure_date: string; return_date: string; booking_deadline: string;
  departure_airport: string; places_available: number; minimum_group: number;
  price_per_person: number; single_supplement: number; deposit_per_person: number; currency: string;
  room_basis: string; flight_terms: string; visa_terms: string; booking_terms: string;
  status: "open" | "on_request" | "sold_out"; updated_at: string;
  package_slug: string; package_title: string; country: string; destinations: string[];
};
export function sriLankaDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone:"Asia/Colombo",year:"numeric",month:"2-digit",day:"2-digit" }).formatToParts(now);
  return ["year","month","day"].map(key=>parts.find(part=>part.type===key)!.value).join("-");
}
export function canRequestGroup(row: GroupDeparture, pax = 1, today = sriLankaDay()) {
  return ["open","on_request"].includes(row.status) && Number.isInteger(pax) && pax > 0 && pax <= 20 && pax <= row.places_available && row.booking_deadline >= today && row.departure_date >= today;
}
export function groupRequest(row: GroupDeparture, pax: number) {
  if (!canRequestGroup(row,pax)) throw new Error("Please refresh this departure and choose an available group size.");
  return { enquiry_type:"holiday", subject:`${row.package_title} · ${row.label}`, pax,
    travel_start_date:row.departure_date, travel_end_date:row.return_date,
    details:{kind:"international_group",departure_id:row.id,travellers:pax,offer_version:row.updated_at},
  };
}
