import { TOUR_NAMES } from "./tour-names.ts";

type TourName = { id?: string; title: string; destinations?: string[] };

/** Display-only: never change the source title, slug, booking payload or SEO identity. */
export function tourDisplayName(tour: TourName): string {
  if (tour.id && Object.hasOwn(TOUR_NAMES, tour.id)) return TOUR_NAMES[tour.id];
  const primary = tour.title.split("|")[0].split(/\s+[—–]\s+/)[0].replace(/\s+/g, " ").trim();
  const name = primary || "Private journey";
  if (name.length <= 56) return name;
  // Keep complete thematic phrases, rather than slicing in the middle of a word.
  const phrases = name.split(/,\s*|\s+&\s+/).filter(Boolean);
  if (phrases.length > 1) {
    let compact = phrases[0];
    for (const phrase of phrases.slice(1)) {
      if (`${compact} & ${phrase}`.length > 56) break;
      compact += ` & ${phrase}`;
    }
    if (compact.length <= 56) return compact;
  }
  const prefix = Array.from(name).slice(0, 53).join("");
  const boundary = prefix.lastIndexOf(" ");
  return `${boundary > 24 ? prefix.slice(0, boundary) : prefix}…`;
}

export function tourDurationLabel(days?: number, nights?: number): string {
  const parts: string[] = [];
  if (Number.isInteger(days) && days! > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (Number.isInteger(nights) && nights! >= 0) parts.push(`${nights} ${nights === 1 ? "night" : "nights"}`);
  return parts.join(" · ") || "Flexible duration";
}
