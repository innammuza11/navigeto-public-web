import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.navigeto.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/account", "/login", "/signup"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
