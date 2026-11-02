import Link from "next/link";
import { groupToursForIndex, type TourIndexScope } from "@/lib/seo-schema";
import { allPublishedTours } from "@/lib/tour-catalogue";
import { tourDisplayName, tourDurationLabel } from "@/lib/tour-presentation";

/** Server-rendered list of every published journey, so each package is one link away from the collection. */
export async function TourIndex({ scope = "all" }: { scope?: TourIndexScope }) {
  const tours = await allPublishedTours().catch(() => []);
  const groups = groupToursForIndex(tours, scope);
  if (!groups.length) return null;
  return <section className="shell tour-index" aria-labelledby="tour-index-title">
    <p className="eyebrow">Every published journey</p>
    <h2 id="tour-index-title">Browse all {groups.reduce((total, [, items]) => total + items.length, 0)} journeys by destination</h2>
    {groups.map(([country, items], index) => <details key={country} open={index === 0 && groups.length === 1}>
      <summary>{country} <span>{items.length} journey{items.length === 1 ? "" : "s"}</span></summary>
      <ul>{items.map(tour => <li key={tour.slug}><Link prefetch={false} href={`/tours/package/${tour.slug}`}>{tourDisplayName(tour)}</Link><small>{tourDurationLabel(tour.duration_days, tour.duration_nights)}</small></li>)}</ul>
    </details>)}
  </section>;
}
