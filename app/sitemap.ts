import type { MetadataRoute } from "next";
import { getCachedHotelPages, getCachedTours } from "@/lib/server-public-data";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://navigeto.com").replace(/\/$/, "");

type SitemapEntry = MetadataRoute.Sitemap[number];
type StaticRoute = {
  path: string;
  priority: number;
  changeFrequency: SitemapEntry["changeFrequency"];
  images?: string[];
};

const staticRoutes: StaticRoute[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/hotels", priority: 0.9, changeFrequency: "daily", images: [`${siteUrl}/headers/hotels.webp`] },
  { path: "/tours", priority: 0.9, changeFrequency: "daily", images: [`${siteUrl}/headers/tours.webp`] },
  { path: "/tours/sri-lanka", priority: 0.9, changeFrequency: "daily", images: [`${siteUrl}/headers/tours.webp`] },
  { path: "/tours/international", priority: 0.8, changeFrequency: "daily", images: [`${siteUrl}/headers/tours.webp`] },
  { path: "/transfers", priority: 0.8, changeFrequency: "weekly", images: [`${siteUrl}/headers/transfers.webp`] },
  { path: "/flights", priority: 0.8, changeFrequency: "weekly", images: [`${siteUrl}/headers/flights.webp`] },
  { path: "/holidays", priority: 0.8, changeFrequency: "weekly", images: [`${siteUrl}/headers/holidays.webp`] },
  { path: "/visas", priority: 0.7, changeFrequency: "weekly" },
  { path: "/corporate", priority: 0.6, changeFrequency: "monthly", images: [`${siteUrl}/headers/corporate.webp`] },
  { path: "/custom-trip", priority: 0.7, changeFrequency: "weekly" },
  { path: "/trip-assistant", priority: 0.5, changeFrequency: "monthly" },
  { path: "/about", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

function updatedAt(value?: string | null): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, SitemapEntry>();
  for (const route of staticRoutes) {
    const url = `${siteUrl}${route.path}`;
    entries.set(url, { url, changeFrequency: route.changeFrequency, priority: route.priority, images: route.images });
  }

  const [tourResult, hotelResult] = await Promise.allSettled([getCachedTours(), getCachedHotelPages()]);
  if (tourResult.status === "fulfilled") {
    const countries = new Set<string>();
    for (const tour of tourResult.value) {
      const url = `${siteUrl}/tours/${tour.slug}`;
      entries.set(url, {
        url,
        lastModified: updatedAt(tour.updated_at || tour.published_at),
        changeFrequency: "weekly",
        priority: 0.7,
        images: tour.hero_image_url ? [tour.hero_image_url] : undefined,
      });
      if (tour.country && tour.country.toLowerCase() !== "sri lanka") countries.add(tour.country);
    }
    for (const country of countries) {
      const slug = encodeURIComponent(country.toLowerCase().replace(/\s+/g, "-"));
      const url = `${siteUrl}/tours/country/${slug}`;
      entries.set(url, { url, changeFrequency: "weekly", priority: 0.7, images: [`${siteUrl}/headers/tours.webp`] });
    }
  }

  if (hotelResult.status === "fulfilled") {
    for (const hotel of hotelResult.value) {
      const url = `${siteUrl}/hotels/${hotel.slug}`;
      entries.set(url, { url, lastModified: updatedAt(hotel.updated_at), changeFrequency: "weekly", priority: 0.7 });
    }
  }

  return [...entries.values()];
}
