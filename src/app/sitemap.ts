import type { MetadataRoute } from "next";
import { liveApi } from "@/lib/live-api";
import { SITE_URL, STATIC_SEO } from "@/lib/seo";
import { DESTINATION_GUIDES } from "@/lib/destination-guides";
import { ITINERARY_GUIDES } from "@/lib/itinerary-guides";
import { allPublishedTours } from "@/lib/tour-catalogue";

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, Entry>();
  for (const path of Object.keys(STATIC_SEO)) {
    const url = `${SITE_URL}${path === "/" ? "/" : path}`;
    entries.set(url, { url, changeFrequency: path === "/" ? "daily" : "weekly", priority: path === "/" ? 1 : ["/hotels", "/tours"].includes(path) ? 0.9 : 0.7, images: path === "/" ? [`${SITE_URL}/media/ella-hero-cinematic-v2.webp`] : undefined });
  }
  entries.set(`${SITE_URL}/group-tours`, { url: `${SITE_URL}/group-tours`, changeFrequency: "daily", priority: 0.8 });
  for (const path of ["/tours/sri-lanka", "/tours/international"]) entries.set(`${SITE_URL}${path}`, { url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority: 0.8 });
  for (const path of ["/sri-lanka", ...DESTINATION_GUIDES.map(guide => `/sri-lanka/${guide.slug}`)]) entries.set(`${SITE_URL}${path}`, { url: `${SITE_URL}${path}`, changeFrequency: "monthly", priority: 0.8, images: [`${SITE_URL}/art/watercolour/${DESTINATION_GUIDES.find(guide => path.endsWith(`/${guide.slug}`))?.art || "sri-lanka"}.webp`] });
  for (const path of ["/itineraries", ...ITINERARY_GUIDES.map(guide => `/itineraries/${guide.slug}`)]) entries.set(`${SITE_URL}${path}`, { url: `${SITE_URL}${path}`, changeFrequency: "monthly", priority: 0.8 });
  entries.set(`${SITE_URL}/partners`, { url: `${SITE_URL}/partners`, changeFrequency: "monthly", priority: 0.4 });
  const [tourResult, hotelResult] = await Promise.allSettled([allPublishedTours(), liveApi.hotelSitemap()]);
  if (tourResult.status === "fulfilled") for (const tour of tourResult.value) { const url = `${SITE_URL}/tours/package/${tour.slug}`; entries.set(url, { url, changeFrequency: "weekly", priority: 0.8, images: tour.hero_image_url ? [tour.hero_image_url] : undefined }); }
  if (hotelResult.status === "fulfilled") for (const hotel of hotelResult.value.results) { const url = `${SITE_URL}/hotels/${hotel.public_slug}`; entries.set(url, { url, lastModified: hotel.updated_at || undefined, changeFrequency: "weekly", priority: 0.8 }); }
  return [...entries.values()];
}
