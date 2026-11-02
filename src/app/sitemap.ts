import type { MetadataRoute } from "next";
import { liveApi, type PublicTour } from "@/lib/live-api";
import { SITE_URL, STATIC_SEO } from "@/lib/seo";
import { uniqueTourSlugs } from "@/lib/seo-schema";

type Entry = MetadataRoute.Sitemap[number];

// tour-list returns at most 100 rows per call and the live catalogue is larger,
// so add one call per country to reach every published package.
async function allPublishedTours(): Promise<PublicTour[]> {
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, Entry>();
  for (const path of Object.keys(STATIC_SEO)) {
    const url = `${SITE_URL}${path === "/" ? "/" : path}`;
    entries.set(url, { url, changeFrequency: path === "/" ? "daily" : "weekly", priority: path === "/" ? 1 : ["/hotels", "/tours"].includes(path) ? 0.9 : 0.7, images: path === "/" ? [`${SITE_URL}/media/ella-hero-cinematic-v2.webp`] : undefined });
  }
  entries.set(`${SITE_URL}/group-tours`, { url: `${SITE_URL}/group-tours`, changeFrequency: "daily", priority: 0.8 });
  for (const path of ["/tours/sri-lanka", "/tours/international"]) entries.set(`${SITE_URL}${path}`, { url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority: 0.8 });
  entries.set(`${SITE_URL}/partners`, { url: `${SITE_URL}/partners`, changeFrequency: "monthly", priority: 0.4 });
  const [tourResult, hotelResult] = await Promise.allSettled([allPublishedTours(), liveApi.hotelSitemap()]);
  if (tourResult.status === "fulfilled") for (const tour of tourResult.value) { const url = `${SITE_URL}/tours/package/${tour.slug}`; entries.set(url, { url, changeFrequency: "weekly", priority: 0.8, images: tour.hero_image_url ? [tour.hero_image_url] : undefined }); }
  if (hotelResult.status === "fulfilled") for (const hotel of hotelResult.value.results) { const url = `${SITE_URL}/hotels/${hotel.public_slug}`; entries.set(url, { url, lastModified: hotel.updated_at || undefined, changeFrequency: "weekly", priority: 0.8 }); }
  return [...entries.values()];
}
