import type { MetadataRoute } from "next";
import { listTours } from "@/lib/travelos";
import { SITE_URL } from "@/lib/seo";

// Apex domain: www.navigeto.com 301-redirects here, so emitting www URLs would
// point every sitemap entry at a redirect.
const siteUrl = SITE_URL;

// The tour detail route differs by design generation ("/tours/[slug]" vs the
// cinematic "/tours/package/[slug]"). Set NEXT_PUBLIC_TOUR_PATH_PREFIX to match
// whichever is deployed, so the sitemap never advertises 404s.
const tourPathPrefix = process.env.NEXT_PUBLIC_TOUR_PATH_PREFIX || "/tours";

const staticRoutes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/hotels", priority: 0.9, changeFrequency: "daily" },
  { path: "/tours", priority: 0.9, changeFrequency: "daily" },
  { path: "/transfers", priority: 0.8, changeFrequency: "weekly" },
  { path: "/flights", priority: 0.8, changeFrequency: "weekly" },
  { path: "/holidays", priority: 0.8, changeFrequency: "weekly" },
  { path: "/visas", priority: 0.7, changeFrequency: "weekly" },
  { path: "/corporate", priority: 0.6, changeFrequency: "monthly" },
  { path: "/custom-trip", priority: 0.7, changeFrequency: "weekly" },
  { path: "/trip-assistant", priority: 0.5, changeFrequency: "monthly" },
  { path: "/about", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const tours = await listTours();
    for (const tour of tours) {
      entries.push({ url: `${siteUrl}${tourPathPrefix}/${tour.slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
    }
  } catch {
    // Tour catalogue temporarily unreachable — ship the static routes rather than fail the whole sitemap.
  }

  return entries;
}
