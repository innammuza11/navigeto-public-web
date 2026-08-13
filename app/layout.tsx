import type { Metadata } from "next";
import "./globals.css";
import "./media-pages.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { FloatingAssistant } from "@/components/FloatingAssistant";
import { SiteProvider } from "@/components/SiteProvider";
import { MarketingTracker } from "@/components/MarketingTracker";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { DEFAULT_SITE_CONFIG } from "@/lib/defaults";
import { loadSiteConfig } from "@/lib/travelos";
import type { SiteConfig } from "@/lib/types";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://navigeto.com").replace(/\/$/, "");

async function publicConfig(): Promise<SiteConfig> {
  try {
    return { ...DEFAULT_SITE_CONFIG, ...(await loadSiteConfig()) };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await publicConfig();
  const image = config.default_og_image_url || "/logo.webp";
  return {
    title: { default: "Navigeto Travels | Sri Lanka Hotels, Tours, Transfers & Flights", template: "%s | Navigeto Travels" },
    description: "Book Sri Lanka hotels, tours, private transfers and flights, plus international holidays and visa assistance — planned by Navigeto Travels.",
    metadataBase: new URL(siteUrl),
    applicationName: "Navigeto Travels",
    creator: "Navigeto Travels",
    publisher: "Navigeto Travels",
    category: "travel",
    referrer: "origin-when-cross-origin",
    manifest: "/manifest.webmanifest",
    alternates: { canonical: "/" },
    icons: { icon: "/icon.png", apple: "/apple-icon.png" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    openGraph: { title: "Navigeto Travels", description: "Hotels, tours, transfers, flights, international holidays and visa assistance.", type: "website", url: siteUrl, siteName: "Navigeto Travels", locale: "en_LK", images: [{ url: image, alt: "Navigeto Travels" }] },
    twitter: { card: "summary_large_image", title: "Navigeto Travels", description: "Hotels, tours, transfers, flights, international holidays and visa assistance.", images: [{ url: image, alt: "Navigeto Travels" }] },
    verification: {
      google: config.google_site_verification || undefined,
      other: config.bing_site_verification ? { "msvalidate.01": config.bing_site_verification } : undefined,
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = await publicConfig();
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "TravelAgency"],
        "@id": organizationId,
        name: config.brand_name || "Navigeto Travels",
        url: siteUrl,
        logo: { "@type": "ImageObject", url: `${siteUrl}/logo.webp` },
        description: "Sri Lanka travel agency and destination management company offering hotels, private tours, transfers, flight reservations, international holidays and visa assistance.",
        address: { "@type": "PostalAddress", streetAddress: config.office_address || undefined, addressLocality: "Colombo", addressCountry: "LK" },
        areaServed: [{ "@type": "Country", name: "Sri Lanka" }],
        email: config.email || undefined,
        telephone: config.phone || undefined,
        sameAs: Object.values(config.social_links || {}).filter((value) => /^https:\/\//.test(value)),
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: config.brand_name || "Navigeto Travels",
        description: "Sri Lanka hotels, private tours, transfers, flights and tailor-made holidays.",
        publisher: { "@id": organizationId },
        inLanguage: "en",
      },
    ],
  };
  return <html lang="en"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g,"\\u003c") }} />
    <AuthProvider><SiteProvider initialConfig={config}><MarketingTracker /><Header /><main>{children}</main><Footer /><FloatingAssistant /></SiteProvider></AuthProvider>
  </body></html>;
}
