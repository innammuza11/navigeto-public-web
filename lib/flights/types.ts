export type CabinClass = "economy" | "premium_economy" | "business" | "first";
export type TripType = "one_way" | "round_trip" | "multi_city";

export type FlightSegment = { origin: string; destination: string; depart_date: string };

export type FlightSearchParams = {
  trip_type: TripType;
  segments: FlightSegment[];
  return_date?: string;
  adults: number;
  children: number;
  infants: number;
  cabin_class: CabinClass;
  preferred_airline?: string;
  direct_only: boolean;
  flexible_dates: boolean;
};

export type FlightOffer = {
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  depart_at: string;
  arrive_at: string;
  duration_minutes: number;
  stops: number;
  cabin_class: CabinClass;
  baggage: string;
  refundable: boolean;
  fare_family: string;
  total_amount: number;
  currency: string;
};

/**
 * A real GDS integration must run server-side only, behind a secured Edge
 * Function holding vaulted credentials — this browser client must never call
 * Amadeus/Sabre/Travelport directly. Implementations of this interface are
 * the swap-in point for that future work; none are wired yet.
 */
export interface FlightProvider {
  id: "amadeus" | "sabre" | "travelport";
  search(params: FlightSearchParams): Promise<FlightOffer[]>;
}
