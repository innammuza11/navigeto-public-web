import { liveApi, type PublicTour } from "@/lib/live-api";
import { uniqueTourSlugs } from "@/lib/seo-schema";

// tour-list returns at most 100 rows per call and the live catalogue is larger,
// so add one call per country to reach every published package.
export async function allPublishedTours(): Promise<PublicTour[]> {
  const first = await liveApi.tours();
  const countries = new Set(first.results.map(tour => tour.country?.trim()).filter((country): country is string => Boolean(country)));
  countries.add("Sri Lanka");
  const pages = await Promise.allSettled([
    liveApi.tours({ exclude_country: "Sri Lanka" }),
    ...[...countries].map(country => liveApi.tours({ country })),
  ]);
  const lists = [first.results, ...pages.flatMap(page => page.status === "fulfilled" ? [page.value.results] : [])];
  const bySlug = new Map(lists.flat().map(tour => [tour.slug, tour]));
  return uniqueTourSlugs(lists).map(slug => bySlug.get(slug)!);
}
