import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Apex domain — www 301-redirects here (see lib/seo.ts).
const siteUrl = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/account", "/login", "/signup"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
