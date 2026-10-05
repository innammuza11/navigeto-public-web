/** Selling price is the supplier ticket total plus Navigeto's five percent markup. */
export function flightSellingTotal(ticketTotal: number, currency: string): number {
  if (!Number.isFinite(ticketTotal) || ticketTotal <= 0) throw new Error("Invalid airline ticket total.");
  const digits = new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const scale = 10 ** digits;
  return Math.round((ticketTotal * 1.05 + Number.EPSILON) * scale) / scale;
}

export function flightDuration(value?: string | null): string {
  const match = value?.match(/^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:\d+(?:\.\d+)?S)?$/);
  if (!match) return value || "Duration to be confirmed";
  const hours = Number(match[1] || 0) * 24 + Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  return [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""].filter(Boolean).join(" ") || "Duration to be confirmed";
}

/** Preserve airline-supplied local calendar/time components across browser timezones. */
export function flightDateTime(value?: string | null) {
  const match = value?.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) return { date: "Date to be confirmed", time: "—" };
  const date = new Date(`${match[1]}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return { date: "Date to be confirmed", time: "—" };
  return { date: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }), time: match[2] };
}

export function flightLayover(previous: { destination?: string; arriving_at?: string }, next: { origin?: string; departing_at?: string }) {
  if (!previous.destination || previous.destination !== next.origin || !previous.arriving_at || !next.departing_at) return null;
  const timestamp = (value: string) => Date.parse(/[Zz]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`);
  const minutes = (timestamp(next.departing_at) - timestamp(previous.arriving_at)) / 60000;
  if (!Number.isFinite(minutes) || minutes < 0) return null;
  return { airport: next.origin, duration: `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m` };
}
