export type PartyInput = { rooms?: unknown; adults?: unknown; children?: unknown; occupancy?: unknown };
export function hotelPartyStatus(input: PartyInput, requireExplicit = false) {
  const rooms = input.rooms ?? (requireExplicit ? undefined : 1);
  const adults = input.adults ?? (requireExplicit ? undefined : 2);
  const children = input.children ?? (requireExplicit ? undefined : 0);
  const occupancy = input.occupancy ?? (requireExplicit ? undefined : "double");
  if (typeof rooms !== "number" || !Number.isSafeInteger(rooms) || rooms < 1 ||
      typeof adults !== "number" || !Number.isSafeInteger(adults) || adults < 1 ||
      typeof children !== "number" || !Number.isSafeInteger(children) || children < 0 ||
      !Number.isSafeInteger(adults + children) ||
      typeof occupancy !== "string" || !["single", "double", "triple", "quadruple"].includes(occupancy)) {
    return { kind: "invalid" as const, reason: "Please confirm valid rooms, adults, children and room basis." };
  }
  if (children > 0) return { kind: "manual" as const, reason: "Child pricing and bed arrangements require a specialist quote." };
  if (occupancy === "quadruple") return { kind: "manual" as const, reason: "Family-room pricing requires a specialist quote." };
  const basis = occupancy === "single" ? 1 : occupancy === "triple" ? 3 : 2;
  if (adults / rooms > basis) return { kind: "manual" as const, reason: "Your party exceeds the selected room basis and requires a specialist quote." };
  return { kind: "automatic" as const, reason: "" };
}
