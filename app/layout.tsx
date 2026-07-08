import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { FloatingAssistant } from "@/components/FloatingAssistant";
import { SiteProvider } from "@/components/SiteProvider";

export const metadata: Metadata = {
  title: { default: "Navigeto Travels | Sri Lanka Hotels, Transfers & Tours", template: "%s | Navigeto Travels" },
  description: "Book Sri Lanka hotels, private airport transfers and tailor-made tours with Navigeto Travels.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.navigeto.com"),
  openGraph: { title: "Navigeto Travels", description: "Hotels, transfers and tailor-made Sri Lanka tours.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteProvider><Header /><main>{children}</main><Footer /><FloatingAssistant /></SiteProvider></body></html>;
}
