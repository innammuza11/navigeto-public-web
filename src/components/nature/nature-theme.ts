export const natureThemes = ["sky", "universe", "beach", "hills", "wildlife"] as const;
export type NatureTheme = (typeof natureThemes)[number];
export type NatureSurface = "public" | "admin";

/** Presentation only: never use query strings, customer data, or API results. */
export function themeForPath(pathname: string, surface: NatureSurface): NatureTheme {
  const parts = pathname.toLowerCase().split("/").filter(Boolean);
  const first = parts[0] ?? "";
  if (parts.some((part) => /(^|-)(safari|safaris|wildlife|wild|yala|wilpattu)(-|$)/.test(part))) return "wildlife";
  if (parts.some((part) => /(^|-)(beach|beaches|coast|coastal|maldives)(-|$)/.test(part))) return "beach";
  if (surface === "public") {
    if (["trip-assistant", "holidays"].includes(first)) return "universe";
    if (["hotels", "transfers"].includes(first)) return "beach";
    if (["tours", "custom-trip"].includes(first)) return "hills";
    if (first === "about") return "wildlife";
    return "sky";
  }
  if (["project-hub", "finance", "reports", "analytics", "ai-learning-queue"].includes(first)) return "universe";
  if (["hotel-master", "hotels", "transfer-master", "transfers", "transport", "tariff-import"].includes(first)) return "beach";
  if (["operations", "reservations", "quotations", "tours", "tour-os", "itineraries", "quick-cost", "costing"].includes(first)) return "hills";
  if (["sightseeing-master", "activities", "experiences"].includes(first)) return "wildlife";
  return "sky";
}
