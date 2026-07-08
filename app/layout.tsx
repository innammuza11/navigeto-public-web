import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { FloatingAssistant } from "@/components/FloatingAssistant";
import { SiteProvider } from "@/components/SiteProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.navigeto.com";

export const metadata: Metadata = {
  title: { default: "Navigeto Travels | Sri Lanka Hotels, Tours, Transfers & Flights", template: "%s | Navigeto Travels" },
  description: "Book Sri Lanka hotels, tours, private transfers and flights, plus international holidays and visa assistance — planned by Navigeto Travels.",
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  openGraph: { title: "Navigeto Travels", description: "Hotels, tours, transfers, flights, international holidays and visa assistance.", type: "website", url: siteUrl, siteName: "Navigeto Travels" },
  twitter: { card: "summary_large_image", title: "Navigeto Travels", description: "Hotels, tours, transfers, flights, international holidays and visa assistance." },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Navigeto Travels",
  url: siteUrl,
  description: "Sri Lanka inbound DMC offering hotels, tours, transfers, flight reservations, international holidays and visa assistance.",
  address: { "@type": "PostalAddress", addressLocality: "Colombo", addressCountry: "LK" },
  sameAs: [] as string[],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    <AuthProvider><SiteProvider><Header /><main>{children}</main><Footer /><FloatingAssistant /></SiteProvider></AuthProvider>
  </body></html>;
}
