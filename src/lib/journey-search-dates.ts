import { addHotelDays as addDays, hotelToday as todayDate } from "./hotel-search-dates.ts";

const dateValue = (params: URLSearchParams, key: string, fallback: string) => params.has(key) ? params.get(key) || "" : fallback;
const validDate = (value: string) => !!value && addDays(value, 0) === value;

export function flightSearchDates(params: URLSearchParams, today = todayDate()) {
  const depart_date = dateValue(params, "depart_date", addDays(today, 30));
  const return_date = params.get("trip_type") === "one_way" ? "" : dateValue(params, "return_date", addDays(depart_date, 7));
  const error = !validDate(depart_date) || (params.get("trip_type") !== "one_way" && !validDate(return_date))
    ? "Choose valid flight dates to search fares."
    : depart_date < today
      ? "This departure date has passed. Choose today or a future date to search fares."
      : return_date && return_date < depart_date
        ? "Return must be on or after departure. Update your flight dates."
        : "";
  return { depart_date, return_date, error };
}

export function transferSearchDate(params: URLSearchParams, today = todayDate()) {
  const travel_date = dateValue(params, "travel_date", addDays(today, 30));
  const error = !validDate(travel_date)
    ? "Choose a valid travel date to search transfers."
    : travel_date < today
      ? "This travel date has passed. Choose today or a future date to search transfers."
      : "";
  return { travel_date, error };
}

const searchKeys = {
  flight: ["trip_type", "origin", "destination", "depart_date", "return_date", "adults", "children", "infants", "cabin_class", "direct_only"],
  transfer: ["origin", "destination", "travel_date", "pickup_time", "passengers", "luggage", "trip_type", "vehicle_type"],
};
export function journeySearchHref(type: "flight" | "transfer", search?: string) {
  const saved = new URLSearchParams(search);
  const params = new URLSearchParams();
  for (const key of searchKeys[type]) if (saved.has(key)) params.set(key, saved.get(key)!);
  return `/${type === "flight" ? "flights" : "transfers"}/search${params.size ? `?${params}` : ""}`;
}
