/** Hotel dates are calendar dates in Navigeto's Sri Lanka operating timezone. */
export function hotelToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addHotelDays(value: string, days: number): string {
  if (!validDate(value)) return "";
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function hotelSearchDates(params: URLSearchParams, today = hotelToday()) {
  const checkin = params.has("checkin") ? params.get("checkin") || "" : addHotelDays(today, 30);
  const checkout = params.has("checkout") ? params.get("checkout") || "" : addHotelDays(checkin, 4);
  const error = !validDate(checkin) || !validDate(checkout)
    ? "Choose valid check-in and check-out dates to search available rooms."
    : checkin < today
      ? "These check-in dates have passed. Choose today or a future date to search available rooms."
      : checkout <= checkin
        ? "Check-out must be after check-in. Update your dates to search available rooms."
        : "";
  return { checkin, checkout, error };
}
