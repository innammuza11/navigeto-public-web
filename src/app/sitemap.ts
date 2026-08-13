import type { MetadataRoute } from "next";
import { liveApi } from "@/lib/live-api";
import { SITE_URL, STATIC_SEO } from "@/lib/seo";

type Entry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, Entry>();
  for (const path of Object.keys(STATIC_SEO)) {
    const url = `${SITE_URL}${path === "/" ? "/" : path}`;
    entries.set(url, { url, changeFrequency: path === "/" ? "daily" : "weekly", priority: path === "/" ? 1 : ["/hotels", "/tours"].includes(path) ? 0.9 : 0.7, images: path === "/" ? [`${SITE_URL}/media/ella-hero-cinematic-v2.webp`] : undefined });
  }
  const [tourResult, hotelResult] = await Promise.allSettled([liveApi.tours(), liveApi.hotelSitemap()]);
  if (tourResult.status === "fulfilled") for (const tour of tourResult.value.results) { const url = `${SITE_URL}/tours/package/${tour.slug}`; entries.set(url, { url, changeFrequency: "weekly", priority: 0.8, images: tour.hero_image_url ? [tour.hero_image_url] : undefined }); }
  if (hotelResult.status === "fulfilled") for (const hotel of hotelResult.value.results) { const url = `${SITE_URL}/hotels/${hotel.public_slug}`; entries.set(url, { url, lastModified: hotel.updated_at || undefined, changeFrequency: "weekly", priority: 0.8 }); }
  return [...entries.values()];
}
