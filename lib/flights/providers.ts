import type { FlightProvider } from "./types";

/**
 * No GDS provider is connected yet. Each key is a placeholder that makes the
 * future swap-in point explicit once Amadeus/Sabre/Travelport credentials
 * exist behind a new secured Edge Function. Until then this always returns
 * null and the Flights page runs a request-only flow — never a fabricated
 * "live" fare.
 */
const KNOWN_PROVIDERS: Record<FlightProvider["id"], FlightProvider | null> = {
  amadeus: null,
  sabre: null,
  travelport: null,
};

export function getActiveFlightProvider(): FlightProvider | null {
  return Object.values(KNOWN_PROVIDERS).find(Boolean) || null;
}

export function listKnownProviderIds(): Array<FlightProvider["id"]> {
  return Object.keys(KNOWN_PROVIDERS) as Array<FlightProvider["id"]>;
}
